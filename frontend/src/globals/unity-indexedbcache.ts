/**
 * IndexedDbCache is a utility class that acts as the counterpart of an
 * IndexedDbCache Component in Unity. When the Component is started in Unity,
 * an instance of this class is created by UnityUtil and attached to the
 * unityInstance.
 * This class receives requests to create transactions against IndexedDb from
 * the IndexedDbPlugins jslib, and returns their results through SendMessage.
 */
export class IndexedDbCache {
	constructor(unityInstance: any, gameObjectName: string) {
		this.unityInstance = unityInstance;
		this.gameObjectName = gameObjectName;
		this.objectStoreName = '3DRepoCache';
		this.transactions = {};
		this.createIndexedDbCache();
	}

	unityInstance: any;

	db: any;

	objectStoreName: string;

	gameObjectName: string;

	transactions: any;

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
			this.sendIndexedDbUpdated({
				state: 'Open',
			});
			this.db.onerror = (error: any) => {
				console.error(`IndexedDbCache error has bubbled to db. This should not happen as all errors should be handled within request error handlers: ${error}`);
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
		try {
			const objectStore = this.db.transaction(this.objectStoreName, 'readwrite').objectStore(this.objectStoreName);

			// This snippet extracts the contents of the managed array. Slice is
			// used to copy a subsection of the managed heap, pointed to by offset.
			// This is then wrapped in a TypedArray before being stored. This is
			// because we need the TypedArray's set method to copy the data back,
			// so we may as well create it here. Writing the TypedArray to the
			// database will store the underlying ArrayBuffer along with it.

			const record = {
				data: new Uint8Array(this.unityInstance.Module.HEAP8.slice(offset, offset + size)),
				size,
			};
			const request = objectStore.put(record, key);

			request.onsuccess = () => {
				this.sendSetTransactionComplete({
					id,
				});
			};

			// The request can fail in two ways: an exception is thrown when
			// creating the request (handled below) and during processing of the
			// request (handled here).
			// In both cases the operation on the viewer side needs to terminate.

			request.onerror = (ev) => {
				console.error(`IndexedDb Cache Error: ${ev.currentTarget.error}`);
				this.sendSetTransactionComplete({
					id, // (The Set operation doesn't have a way to indicate failure)
				});
				ev.stopPropagation(); // don't bubble error up
			};
		} catch (e) {
			if (e.name === 'InvalidStateError' && this.db !== undefined) {
				// The database has closed. This may be because the user cleared
				// the site data, for example.
				this.recreateIndexedDb();
			}

			// Regardless of what happens next, this particular transaction has
			// failed
			this.sendSetTransactionComplete({
				id,
			});
		}
	}

	createGetTransaction(id: number, key: string) {
		try {
			const objectStore = this.db.transaction(this.objectStoreName, 'readwrite').objectStore(this.objectStoreName);
			const request = objectStore.get(key);

			if (this.transactions[id] !== undefined) {
				console.error('Found duplicate transaction Id');
			}

			// When the transaction is complete, we keep the result around so the
			// viewer can request the contents asynchronously.

			request.onsuccess = () => {
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
	 * Releases any resources associated with an existing transaction or Db operation.
	 * Not all oprations will have resources. If an invalid id is passed in, this method does nothing.
	 * @param id The transaction id whose resources to dispose of
	 */
	releaseTransaction(id: number) {
		delete this.transactions[id];
	}
}
