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

	worker: any;

	stats: {
		readtimes: number[],
		writetimes: number[],
		copytimes: number[],
		starttimes: {}
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
			copytimes: [],
			starttimes: {}
		};
	}

	createIndexedDbCache() {
		this.worker = new Worker(new URL("https://3drepo.local/dist/unityworker.js"));
		this.worker.onmessage = (ev) =>{

			if(ev.data.type == "OnIndexedDbUpdated"){
				this.sendIndexedDbUpdated(ev.data.parms);
			}

			if(ev.data.type == "OnCommitted"){
				delete this.memoryCache[ev.data.key];
				this.stats.writetimes.push(performance.now() - this.stats.starttimes[ev.data.key]);
			}

			if(ev.data.type == "OnGetTransactionComplete"){
				const id = ev.data.parms.id;
				const size = ev.data.parms.size;

				if(ev.data.parms.size >= 0){
					this.transactions[id] = ev.data.parms.result;
				}

				this.stats.readtimes.push(performance.now() - this.stats.starttimes[id]);

				this.sendGetTransactionComplete({
					id,
					size
				});
			}
		}
		this.worker.postMessage({message:"createIndexedDb"});
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

		this.stats.starttimes[key] = performance.now();

		this.worker.postMessage({
			message: "Set",
			key: key,
			record: record // This will perform a deep copy
		});

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
			this.stats.starttimes[id] = performance.now();

			this.worker.postMessage({message: "Get", id: id, key: key});
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
