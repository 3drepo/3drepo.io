import { prefix } from "@fortawesome/free-solid-svg-icons/faArrowsAltH";
import { MediaBluetoothOff } from "@mui/icons-material";
import { request } from "http";

/**
 * IndexedDbCache is a utility class that acts as the counterpart of an
 * IndexedDbCache Component in Unity. When the Component is started in Unity,
 * an instance of this class is created by UnityUtil and attached to the
 * unityInstance. This reference is used by functions in the indexedDb.jslib
 * plug-in in Unity to make calls directly to this instance from the viewer.
 * This class receives requests to create transactions against IndexedDb from
 * the plugin, and returns their results through SendMessage.
 */
export class IndexedDbCache {
	constructor(unityInstance: any, gameObjectName: string) {
		this.unityInstance = unityInstance;
		this.gameObjectName = gameObjectName;
		this.objectStoreName = '3DRepoCache';
		this.transactions = {};
		this.memoryCache = {};
		this.clearStats();
		this.createIndexedDbCache();
		setInterval(()=>{
			this.printStats();
			this.clearStats();	
		},1000);

		// Check at low frequency if there is anything going on, and if not try
		// to commit the memory cache.
		// This is because writes are typically started after all reads are done
		// but if no reads happen for a while then no writes will be dispatched!
		setInterval(()=>{
			if(this.readTransaction === undefined){ 
				this.commitMemoryCache();
			}
		},
		2000);
	}

	/** The unityInstance used for SendMessage */
	unityInstance: any;

	/** Reference to the open database. */
	db: any;

	/** Name of the object store for the cache. This is set once when the db is created. */
	objectStoreName: string;

	/** The gameObject which should be passed to SendMessage when making the callbacks to the viewer */
	gameObjectName: string;

	/** Resources for in-progress get requests */
	transactions: any;

	/** A dicationary of records that are waiting to be committed. */
	memoryCache: any;

	/** The running read transaction all get requests should be added to. */
	readTransaction: any;

	/** The object store for readTransaction. */
	objectStore: any;

	/** Is there a running readwrite transaction? If so don't start another one or we may commit records multiple times. */
	committing: boolean;

	/** The local index is used to keep track of which keys are in the object store(s).
	 * This is initialised when the database is opened and updated when set requests are made. 
	 * It is used to perform early rejects on get requests we know will fail (because there is no key in the store),
	 * avoiding expensive database transactions. */
	index: any;

	stats: {
		readtimes: number[],
		writetimes: number[],
		copytimes: number[]
	};

	printStats() {
		let meanReadTime = 0;
		this.stats.readtimes.forEach((x) => { meanReadTime += x; });
		meanReadTime /= this.stats.readtimes.length;

		let meanCopyTime = 0;
		this.stats.copytimes.forEach((x) => { meanCopyTime += x; });
		meanCopyTime /= this.stats.copytimes.length;

		let meanWriteTime = 0;
		this.stats.writetimes.forEach((x) => { meanWriteTime += x; });
		meanWriteTime /= this.stats.writetimes.length;

		console.log(`g54234, ${meanReadTime}, ${this.stats.readtimes.length}, ${meanCopyTime}, ${this.stats.copytimes.length}, ${meanWriteTime}, ${this.stats.writetimes.length}`);
	}

	clearStats(){
		this.stats = {
			readtimes: [],
			writetimes: [],
			copytimes: []
		};
	}

	createIndexedDbCache() {
		const request = indexedDB.open('3DRepoCacheDb', 1);

		request.onerror = () => {
			console.error('Unable to open IndexedDb - Model Caching will be Disabled.');
			this.sendIndexedDbUpdated({
				state: 'Disabled',
			});
		};

		// When onupgradeneeded completes successfully, onsuccess will be called
		request.onupgradeneeded = (event: any) => {
			const db = event.target.result;
			db.createObjectStore(this.objectStoreName, {}); // The database uses a simple key-pair assocation, where the key is passed explicitly
		};

		request.onsuccess = (event: any) => {
			this.db = event.target.result;

			// Populate our index
			const transaction = this.db.transaction(this.objectStoreName, 'readonly')
			const objectStore = transaction.objectStore(this.objectStoreName);
			const request = objectStore.getAllKeys();
			request.onsuccess = () =>{
				this.index = {};
				request.result.forEach(x => this.index[x] = 1) // Give any value here - we will only check the existence of the key (property)
				this.sendIndexedDbUpdated({
					state: 'Open',
				});
			};

			this.db.onerror = (error: any) => {
				console.error(`IndexedDbCache error has bubbled to db. This should not happen as all errors should be handled within request error handlers: ${error}`);
			};
			this.db.onversionchange = () => {
				this.db.close();
			};
		};
	}

	recreateIndexedDb() {
		// This method is called when a transaction has raised a state exception.

		// We can try and reconnect. In the meantime signal the viewer to hold
		// all additional transactions.
		this.sendIndexedDbUpdated({
			state: 'Pending',
		});

		this.db = undefined;
		this.createIndexedDbCache();
	}

	// When a byte[] array (or other managed object) is passed to an imported
	// function, it arrives as an offset into the managed Heap. We can use this
	// to access the contents of the array directly in the Module's heap
	// ArrayBuffer, to get or set the contents.

	/**
	 * Starts a put transaction into the open database.
	 */
	createSetTransaction(id: number, key: string, offset: number, size: number) {
		// This snippet extracts the contents of the managed array. Slice is
		// used to copy a subsection of the managed heap, pointed to by offset.
		// This is then wrapped in a TypedArray before being stored. This is
		// because we need the TypedArray's set method to copy the data back,
		// so we may as well create it here. Writing the TypedArray to the
		// database will store the underlying ArrayBuffer along with it.

		const start = performance.now();

		const record = {
			data: new Uint8Array(this.unityInstance.Module.HEAP8.slice(offset, offset + size)),
			size,
		};

		this.stats.copytimes.push(performance.now() - start);

		// Store in local memory until we have time to write to indexeddb

		this.memoryCache[key] = record;

		// Get requests will return from memory first, so its safe to mark
		// this request as completed.

		this.sendSetTransactionComplete({
			id,
		});
	}

	createGetTransaction(id: number, key: string) {
		if (this.transactions[id] !== undefined) {
			console.error('Found duplicate transaction Id');
		}

		// Before anything else, check if the key is in our local memory cache

		const record = this.memoryCache[key];
		if (record !== undefined) {
			this.transactions[id] = record;
			this.sendGetTransactionComplete({
				id,
				size: record.size,
			});
		} else {
			// The key is not local, see if its in the index
			if (!this.index.hasOwnProperty(key)){
				// We know the database doesnt have the key, so return immediately
				this.sendGetTransactionComplete({
					id,
					size: -1,
				});
			}else{ // We believe the key is in the database, so go ahead and request it
				// The key is not local, so request it from indexeddb
				try {
					// It is more efficient to have one transaction of multiple
					// requests, than many transactions of one request, so append
					// requests to the existing transaction so long as it is
					// alive.

					if (this.readTransaction === undefined) {
						this.readTransaction = this.db.transaction(this.objectStoreName, 'readonly');
						this.objectStore = this.readTransaction.objectStore(this.objectStoreName);
					}

					const start = performance.now();

					const request = this.objectStore.get(key);

					// When the transaction is complete, we keep the result around so
					// the viewer can request the contents asynchronously.

					request.onsuccess = () => {
						this.stats.readtimes.push(performance.now() - start);
						if (request.result === undefined) {
							this.sendGetTransactionComplete({ // Where a key is not found, we want to handle this outside the error chain
								id,
								size: -1, // -1 indicates that no key was found or the transaction was aborted
							});
						} else {
							this.transactions[id] = request.result;
							this.sendGetTransactionComplete({
								id,
								size: request.result.size,
							});
						}
					};

					// Make sure we clean up the transaction reference no matter how
					// it completes.
					// If we end up with multiple parallel read transactions for a
					// while because we've cleared this reference, that is no problem.

					this.readTransaction.oncomplete = () => {
						this.readTransaction = undefined;
						this.commitMemoryCache();
					};

					this.readTransaction.onerror = () => {
						this.readTransaction = undefined;
					};

					this.readTransaction.onabort = () => {
						this.readTransaction = undefined;
					};

					// The request can fail in two ways: an exception is thrown when
					// creating the request (handled below) or during processing of the
					// request (handled here).
					// In both cases the transaction needs to be marked as complete on
					// the viewer to prevent stalling.

					request.onerror = (ev) => {
						console.error(`IndexedDb Cache Error: ${ev.currentTarget.error}`);
						this.sendGetTransactionComplete({
							id,
							size: -1,
						});
						ev.stopPropagation(); // don't bubble error up
					};
				} catch (e) {
					if (e.name === 'InvalidStateError' && this.db !== undefined) {
						this.recreateIndexedDb();
					}

					this.sendGetTransactionComplete({ // Where a key is not found, we want to handle this outside the error chain
						id,
						size: -1, // -1 indicates that no key was found or the transaction was aborted
					});

					this.readTransaction = undefined;
				}
			}
		}
	}

	sendSetTransactionComplete(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnSetTransactionComplete', JSON.stringify(parms));
	}

	sendGetTransactionComplete(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnGetTransactionComplete', JSON.stringify(parms));
	}

	sendIndexedDbUpdated(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnIndexedDbUpdated', JSON.stringify(parms));
	}

	getTransactionData(id: number, offset: number) {
		this.unityInstance.Module.HEAP8.set( // Set copies the contents of the TypedArray into the destination ArrayBuffer
			this.transactions[id].data,
			offset,
		);
	}

	commitMemoryCache() {
		try {
			// This function commits records in memory to indexeddb. Only when
			// records have been successfully written are they removed from
			// the memory cache.
			// If something goes wrong (e.g. the browser tab is closed), the
			// memory cache is lost, which is not ideal, but also not a problem
			// for our use case.

			// If we already have a readwrite transaction running, then don't
			// do anything. readwrite transactions cannot overlap, and this
			// function will chain them when there is nothing else to do
			// automatically.

			if (this.committing) {
				return;
			}
			const keys = Object.keys(this.memoryCache);
			if (keys.length <= 0) {
				return;
			}

			this.committing = true;

			const transaction = this.db.transaction(this.objectStoreName, 'readwrite');
			const objectStore = transaction.objectStore(this.objectStoreName);

			let numRequests = 0;

			// eslint-disable-next-line guard-for-in
			for (const key of keys) {
				const record = this.memoryCache[key];

				const start  = performance.now()
				const request = objectStore.put(record, key);
				request.onsuccess = () => {
					this.stats.writetimes.push(performance.now() - start);
					delete this.memoryCache[key]; // Delete the local copy
					this.index[key] = 1; // Update the index as we go
				};
				if (numRequests++ > 5) { // Don't try and commit too much in one transaction otherwise we may block users' get requests
					break;
				}
			}

			transaction.oncomplete = () => {
				this.committing = false;
				if (this.readTransaction === undefined) {
					this.commitMemoryCache(); // If there are pending get requests, they take priority, otherwise, chain additional commits
				}
			};

			transaction.onerror = () => {
				this.committing = false;
			};

			transaction.onabort = () => {
				this.committing = false;
			};

			// The request can fail in two ways: an exception is thrown when
			// creating the request (handled below) or during processing of the
			// request (handled here).

			objectStore.onerror = (ev) => {
				console.error(`IndexedDb Cache Error: ${ev.currentTarget.error}`);
				ev.stopPropagation(); // don't bubble error up
			};
		} catch (e) {
			if (e.name === 'InvalidStateError' && this.db !== undefined) {
				// The database has closed. This may be because the user cleared
				// the site data, for example.
				this.recreateIndexedDb();
			}
			this.committing = false;
		}
	}

	/**
	 * Releases any resources associated with an existing transaction or Db
	 * operation.
	 * Not all oprations will have resources. If an invalid id is passed in,
	 * this method does nothing.
	 * @param id The transaction id whose resources to dispose of
	 */
	releaseTransaction(id: number) {
		delete this.transactions[id];
	}

	benchmarkIndexeddb(){

		const transaction = this.db.transaction(this.objectStoreName,"readonly");
		const objectStore = transaction.objectStore(this.objectStoreName);

		for(var i = 0 ; i < 100; i++){
			var key = Math.floor(Object.keys(this.index).length * Math.random());
			
			const start = performance.now();
			const request = objectStore.get(key);

			request.onsuccess = (ev) =>{
				console.log(`Time ${performance.now() - start}`);
			};
		}
	}
}
