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
/* eslint-disable no-restricted-globals */
/* eslint-disable class-methods-use-this */

/**
 * This entire script/file is run inside a WebWorker to service requests from
 * an instance of IndexedDbCache. IndexedDbCache posts messages to this worker
 * which are received through the locally scoped onmessage function. Messages
 * are sent back with self.postMessage, where self is the WorkerGlobalScope
 * the worker runs in. IndexedDbCacheWorker is a convenience class that
 * encompasses the actual IndexedDb API usage. An instance is created for use
 * by this worker.
 */

declare global {
	interface Window {
		repoCache: any;
	}
}

export class IndexedDbCacheWorker {
	constructor() {
		this.objectStoreName = '3DRepoCache';
		this.memoryCache = {};
		this.numReadTransactions = 0;
		this.createIndexedDbCache();

		// Check at low frequency if there is anything going on, and if not try
		// to commit the memory cache.
		// This is because writes are typically started after all reads are done
		// but if no reads happen for a while then no writes will be dispatched!
		setInterval(() => {
			this.commitMemoryCache();
		},
		2000);
	}

	/** Reference to the open database. */
	db: any;

	/** Name of the object store for the cache. This is set once when the db is
	 * created. */
	objectStoreName: string;

	/** A dictionary of records that are waiting to be committed. */
	memoryCache: any;

	/** How many read transactions are currently created. We always want read
	 * transactions to take priority over writes, so when this is non-zero
	 * the write chain is interrupted. */
	numReadTransactions: number;

	/** Is there a running readwrite transaction? If so don't start another one
	 * or we may commit records multiple times (wasting time). */
	committing: boolean;

	/** The local index is used to keep track of which keys are in the object
	 * store(s). This is initialised when the database is opened and updated
	 * when set requests are made. It is used to perform early rejects on get
	 * requests we know will fail (because there is no key in the store),
	 * avoiding expensive database transactions. */
	index: any;

	/** A promise holding the state of the database. If a method requires the
	 * database to be open before proceeding, it can await this promise. */
	open: Promise<void>;

	createIndexedDbCache() {
		this.open = new Promise((resolve, reject) => {
			const request = indexedDB.open('3DRepoCacheDb', 2);

			request.onerror = () => {
				console.error('Unable to open IndexedDb - Model Caching will be Disabled.');
				this.sendIndexedDbUpdated({
					state: 'Disabled',
				});
			};

			// When onupgradeneeded completes successfully, onsuccess will be called
			request.onupgradeneeded = (event: any) => {
				const db = event.target.result;
				if (event.oldVersion == 1) {
					db.deleteObjectStore(this.objectStoreName); // Existing keys from version 1 are the wrong types (UInt8Array, whereas we now expect them to be ArrayBuffers)
				}
				db.createObjectStore(this.objectStoreName, {}); // The database uses a simple key-pair assocation, where the key is passed explicitly
			};

			request.onsuccess = (event: any) => {
				this.db = event.target.result;

				// Populate our index
				const transaction = this.db.transaction(this.objectStoreName, 'readonly');
				const objectStore = transaction.objectStore(this.objectStoreName);
				const req = objectStore.getAllKeys();
				req.onsuccess = () => {
					this.index = {};
					req.result.forEach((x) => { this.index[x] = 1; }); // Give any value here - we will only check the existence of the key (property)
					this.sendIndexedDbUpdated({
						state: 'Open',
					});
					resolve();
				};

				this.db.onerror = (error: any) => {
					console.error(`IndexedDbCache error has bubbled to db. This should not happen as all errors should be handled within request error handlers: ${error}`);
					reject(error);
				};

				this.db.onversionchange = () => {
					this.db.close();
				};
			};
		});
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

	createGetTransaction(id: number, key: string) {
		// Before anything else, check if the key is in our local memory cache
		const record = this.memoryCache[key];
		if (record !== undefined) {
			this.sendGetTransactionComplete({
				id,
				data: record.data,
			});
		} else if (!(key in this.index)) {
			// We know the database doesnt have the key, so return immediately again
			this.sendGetTransactionComplete({
				id,
				data: undefined,
			});
		} else {
			// We believe the key is in the database, so go ahead and request it
			try {
				const readTransaction = this.db.transaction(this.objectStoreName, 'readonly');
				const objectStore = readTransaction.objectStore(this.objectStoreName);
				const request = objectStore.get(key);

				request.onsuccess = () => {
					if (request.result === undefined) {
						this.sendGetTransactionComplete({ // Where a key is not found, we want to handle this outside the error chain
							id,
							data: undefined, // indicates that no key was found or the transaction was aborted
						});
					} else {
						this.sendGetTransactionCompleteTransfer({
							id,
							data: request.result.data,
						});
					}
					// At the end of this function the transaction will exit the active state, after which no more changes can be made to it
				};

				// The request can fail in two ways: an exception is thrown when
				// creating the request (handled below) or during processing of
				// the request (handled here).
				// In both cases the request needs to be marked as complete on
				// the viewer to prevent the viewer stalling.

				request.onerror = (ev) => {
					console.error(`IndexedDb Cache Error: ${ev.currentTarget.error}`);
					this.sendGetTransactionComplete({
						id,
						data: undefined,
					});
					ev.stopPropagation(); // Don't bubble the error up
				};

				// Make sure we clean up the transaction reference no matter how
				// it completes, otherwise we will keep adding requests to an
				// invalid transaction.
				// If we end up with multiple parallel read transactions for a
				// while because we've cleared this reference, that is no
				// problem.

				readTransaction.oncomplete = () => {
					this.numReadTransactions--;
					this.commitMemoryCache();
				};

				readTransaction.onerror = () => {
					this.numReadTransactions--;
				};

				readTransaction.onabort = readTransaction.onerror;

				this.numReadTransactions++;
			} catch (e) {
				if (e.name === 'InvalidStateError' && this.db !== undefined) {
					this.recreateIndexedDb();
				}

				// Requests aren't queued anywhere, so if one fails it won't
				// automatically try again, so signal the viewer that the request
				// has been handled to prevent stalling.

				this.sendGetTransactionComplete({
					id,
				});

				console.error('Unexpected IndexedDb read exception', e);
			}
		}
	}

	sendSetTransactionComplete(parms: any) {
		self.postMessage({
			type: 'OnSetTransactionComplete',
			parms,
		});
	}

	sendGetTransactionComplete(parms: any) {
		self.postMessage({
			type: 'OnGetTransactionComplete',
			parms,
		});
	}

	sendDeleteTransactionComplete(parms: any) {
		self.postMessage({
			type: 'OnDeleteTransactionComplete',
			parms,
		});
	}

	// A version of sendGetTransactionComplete that uses the transferable objects
	// override to transfer the data ArrayBuffer, rather then perform a deep copy.
	// Only use this when no more references to the ArrayBuffer will exist in the
	// worker scope; for example, when handling indexeddb get callbacks, but not
	// when using the memory cache.
	sendGetTransactionCompleteTransfer(parms: any) {
		self.postMessage({
			type: 'OnGetTransactionComplete',
			parms,
		},
		[parms.data]);
	}

	sendIndexedDbUpdated(parms: any) {
		self.postMessage({
			type: 'OnIndexedDbUpdated',
			parms,
		});
	}

	commitMemoryCache() {
		try {
			// This function commits records in memory to indexeddb. Only when
			// records have been successfully written are they removed from
			// the memory cache.
			// If something goes wrong (e.g. the browser tab is closed), the
			// memory cache is lost, which is not ideal, but also not terrible
			// for our use case.

			// If we already have a readwrite transaction running, then don't
			// do anything. readwrite transactions cannot overlap, and this
			// function will chain them when there is nothing else to do
			// automatically. readwrites will also block reads, which are more
			// important to the user experience, so dont attempt to write if
			// there are any outstanding (when they are complete, they will call
			// back here to try again.)

			if (this.committing) {
				return;
			}
			if (this.numReadTransactions > 0) {
				return;
			}
			const keys = Object.keys(this.memoryCache);
			if (keys.length <= 0) {
				return;
			}

			this.committing = true;

			const transaction = this.db.transaction(this.objectStoreName, 'readwrite');
			const objectStore = transaction.objectStore(this.objectStoreName);

			// eslint-disable-next-line guard-for-in
			for (const key of keys.slice(0, 5)) { // Don't try and commit too much in one transaction otherwise we may block users' get requests
				const record = this.memoryCache[key];
				const request = objectStore.put(record, key);
				request.onsuccess = () => {
					delete this.memoryCache[key]; // Delete the local copy
					this.index[key] = 1; // Update the index as we go
				};
			}

			transaction.oncomplete = () => {
				this.committing = false;
				this.commitMemoryCache(); // Try to chain additional commits. If there a pending reads the chain will be broken at the start of commitMemoryCache().
			};

			transaction.onerror = () => {
				this.committing = false;
			};

			transaction.onabort = transaction.onerror;

			// The request can fail in two ways: an exception is thrown when
			// creating the request (handled below) or during processing of the
			// request (handled here).

			// (We don't set error handlers on the request, so any errors bubble
			// to the object store.)

			// Unless the request succeeds, any record will remain in the local
			// cache where this method will try to commit it again. So in the
			// case of an error, we simply note it and continue.

			objectStore.onerror = (ev) => {
				console.error(`IndexedDb Cache Error: ${ev.currentTarget.error}`);
				ev.stopPropagation(); // Don't bubble up further
			};
		} catch (e) {
			if (e.name === 'InvalidStateError' && this.db !== undefined) {
				// The database has closed. This may be because the user cleared
				// the site data, for example.
				this.recreateIndexedDb();
			}
			this.committing = false;

			console.error('Unexpected IndexedDb write exception', e);
		}
	}

	benchmarkIndexeddb() {
		for (let i = 0; i < 100; i++) {
			const transaction = this.db.transaction(this.objectStoreName, 'readonly');
			const objectStore = transaction.objectStore(this.objectStoreName);

			const key = Math.floor(Object.keys(this.index).length * Math.random());

			const start = performance.now();
			const request = objectStore.get(key);

			request.onsuccess = () => {
				// eslint-disable-next-line no-console
				console.log(`Time ${performance.now() - start}`);
			};
		}
	}

	createDeleteTransaction(id: number, key: string) {
		// This function deletes a key from the cache. The key is effectively
		// deleted immediately as soon as this method returns.

		// Remove from memory cache first, so we don't try to commit it later

		delete this.memoryCache[key];

		if (this.index[key] === undefined) {
			// Key not in index, so nothing to delete
			this.sendDeleteTransactionComplete({
				id,
			});
			return;
		}

		// Delete from our local index first. Indexeddb readwrite transactions
		// complete in the order they are created (see:
		// https://www.w3.org/TR/IndexedDB/#transaction-construct). However, our
		// local index is not part of this and may be read during a transaction.
		//
		// Since all reads are first checked against the index, this effectively
		// deletes the key from the point of view of any external callers.

		delete this.index[key];

		// If a key is being deleted, it is likely because it contains conflicting
		// data, so we don't want any risk of not being fully purged.

		const transaction = this.db.transaction(this.objectStoreName, 'readwrite', {
			durability: 'strict',
		});
		const objectStore = transaction.objectStore(this.objectStoreName);
		const request = objectStore.delete(key);

		transaction.oncomplete = () => {
			this.sendDeleteTransactionComplete({
				id,
			});
		};

		request.onerror = (ev) => {
			console.error(`Failed to delete ${key} from cache: ${ev.currentTarget.error}`);
			ev.stopPropagation(); // Don't bubble up further
		};
	}
}

onmessage = (e) => {
	if (e.data.message === 'createIndexedDb') {
		self.repoCache = new IndexedDbCacheWorker();
	}

	if (e.data.message === 'Set') {
		const { key, record } = e.data;
		self.repoCache.memoryCache[key] = record; // Will be written later by commitMemoryCache
	}

	if (e.data.message === 'Get') {
		self.repoCache.open.then(() => {
			const { key, id } = e.data;
			self.repoCache.createGetTransaction(id, key);
		});
	}

	if (e.data.message === 'Delete') {
		self.repoCache.open.then(() => {
			const { key, id } = e.data;
			self.repoCache.createDeleteTransaction(id, key);
		});
	}
};
