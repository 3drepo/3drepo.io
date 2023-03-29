/**
 *  Copyright (C) 2022 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * An IndexedDbCache instance acts as the counterpart of an IndexedDbCache
 * Component in Unity. When the Component is started in Unity, an instance of
 * this class is created by UnityUtil and attached to the unityInstance.
 * This reference is used by functions in the indexedDb.jslib plug-in in Unity
 * to make calls directly from the viewer. This class receives requests to
 * create transactions against IndexedDb, and returns their results through
 * SendMessage. In practice, IndexedDb operations are offloaded to a WebWorker,
 * so this implementation is primarily used to maintain the worker and translate
 * between it and Unity.
 */
export class IndexedDbCache {
	constructor(unityInstance: any, gameObjectName: string, host: URL) {
		this.unityInstance = unityInstance;
		this.gameObjectName = gameObjectName;
		this.host = host;
		this.transactions = {};
		this.createWorker();
	}

	/** The Unity Instance created by the loader; this is used for SendMessage */
	unityInstance: any;

	/** The gameObject which should be passed to SendMessage when making the
	 * callbacks to the viewer */
	gameObjectName: string;

	/** Resources for in-progress get requests */
	transactions: any;

	/** The WebWorker that handles the IndexedDb requests. Each instance of this
	 * class gets its own worker. */
	worker: any;

	/** The host on which to find the WebWorker script. */
	host: URL;

	// IndexedDb actions are offloaded to a WebWorker. This is for performance
	// reasons. WebWorkers run individual scripts in their own thread, and
	// interact with the main thread (of their creator) by posting messages.
	// When messages are passed, a deep copy is created.

	async createWorker() {
		// This preamble fetches the Worker source and stores it as a blob,
		// creating the Worker from the blob, rather than the remote URL itself.
		// This allows the Worker to be created from arbitrary origins, as may
		// be done for example, when the viewer is embedded.

		const result = await fetch(new URL('unity/indexeddbworker.js', this.host).toString());
		const source = await result.text();
		const blob = new Blob([source], { type: 'application/javascript' });
		this.worker = new Worker(URL.createObjectURL(blob));
		this.worker.onmessage = (ev) => {
			// The state of the IndexedDb has changed, so we may need to pause
			// requests.
			if (ev.data.type === 'OnIndexedDbUpdated') {
				this.sendIndexedDbUpdated(ev.data.parms);
			}

			// Data has been retrieved from the worker. The result will have
			// been copied into this thread, so we don't need to do anything
			// on the worker side, but will need to store it until Unity
			// has allocated the memory in which to recieve it.
			if (ev.data.type === 'OnGetTransactionComplete') {
				const { id } = ev.data.parms;
				const { size } = ev.data.parms;

				if (ev.data.parms.size >= 0) {
					this.transactions[id] = ev.data.parms.result;
				}

				this.sendGetTransactionComplete({
					id,
					size,
				});
			}
		};
		this.worker.postMessage({ message: 'createIndexedDb' });
	}

	// When a byte[] array (or other managed object) is passed to an imported
	// function, it arrives as an offset into the managed Heap. We can use this
	// to access the contents of the array directly in the Module's heap
	// ArrayBuffer, to get or set the contents.

	/**
	 * Requests data be inserted into the database with a put request.
	 */
	createSetTransaction(id: number, key: string, offset: number, size: number) {
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

		this.worker.postMessage({
			message: 'Set',
			key,
			record,
		});

		// Once the message has been posted, the memory is copied so for set
		// requests we can tell Unity we are done right away.

		this.sendSetTransactionComplete({
			id,
		});
	}

	/**
	 * Requests data from the database with the specified key. In practice, the
	 * worker will maintain a local memory cache, but the implementation is
	 * invisible from this side.
	 * The id is used to reference this specific transaction between calls to
	 * createGetTransaction, getTransactionData & releaseTransaction. Multiple
	 * transactions may access the the same key but may not share an id.
	 */
	createGetTransaction(id: number, key: string) {
		if (this.transactions[id] !== undefined) {
			console.error('Found duplicate transaction Id. This should not happen.');
		}

		this.worker.postMessage({
			message: 'Get',
			id,
			key,
		});
	}

	/**
	 * Copies the data returned from a get request into the heap at offset.
	 * Once this is done the local resources should be released by calling
	 * releaseTransaction.
	 */
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

	// These calls update the Unity viewer

	sendSetTransactionComplete(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnSetTransactionComplete', JSON.stringify(parms));
	}

	sendGetTransactionComplete(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnGetTransactionComplete', JSON.stringify(parms));
	}

	sendIndexedDbUpdated(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnIndexedDbUpdated', JSON.stringify(parms));
	}
}
