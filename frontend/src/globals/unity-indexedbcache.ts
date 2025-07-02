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
 * IndexedDbCache implements a cache of keyed ArrayBuffers based on IDB. The
 * caching is performed in a WebWorker for performance reasons. This class creates
 * that worker and provides interop via message passing, presenting a Promise-
 * based API to any consumers.
 */

export class IndexedDbCache {
	constructor(host: URL) {
		this.host = host;
		this.transactions = {};
		this.counter = 0;
		this.createWorker();
	}

	/** Resources for in-progress get requests */
	transactions: any;

	/** The WebWorker that handles the IndexedDb requests. Each instance of this
	 * class gets its own worker. */
	worker: any;

	/** The host on which to find the WebWorker script. */
	host: URL;

	/** A simple counter is used to assign cross-context Ids for transactions */
	counter: number;

	/** The current state of the database behind the cache. Requests will be
	 * held so long as it is not Open. If the database is Closed, then all
	 * requests, new and old, are fulfilled empty. */
	state: string;

	// IndexedDb actions are offloaded to a WebWorker. This is for performance
	// reasons. WebWorkers run individual scripts in their own thread, and
	// interact with the main thread (of their creator) by posting messages.
	// The worker uses the transferable objects overload to pass ArrayBuffers
	// into this context. Other directions and other objects perform deep copies.

	async createWorker() {
		// This preamble fetches the Worker source and stores it as a blob,
		// creating the Worker from the blob, rather than the remote URL itself.
		// This allows the Worker to be created from arbitrary origins, as may
		// be done for example, when the viewer is embedded.

		const result = await fetch(new URL('unity/indexeddbworker.js', this.host).toString());
		const source = await result.text();
		const blob = new Blob([source], { type: 'application/javascript' });
		this.worker = new Worker(URL.createObjectURL(blob));
		// this.worker = new Worker(new URL('unity/indexeddbworker.js', this.host).toString()); // This when debugging...
		this.worker.onmessage = (ev) => {
			// The state of the IndexedDb has changed, so we may need to pause
			// requests.
			if (ev.data.type === 'OnIndexedDbUpdated') {
				this.state = ev.data.parms;
			}

			// Data has been retrieved from the worker. The result will have
			// been copied into this thread, so we don't need to do anything
			// on the worker side, but will need to store it until Unity
			// has allocated the memory in which to recieve it.
			if (ev.data.type === 'OnGetTransactionComplete') {
				const { id } = ev.data.parms;
				this.transactions[id].resolve(ev.data.parms.data);
				delete this.transactions[id];
			}

			if (ev.data.type === 'OnDeleteTransactionComplete') {
				const { id } = ev.data.parms;
				this.transactions[id].resolve();
				delete this.transactions[id];
			}
		};
		this.worker.postMessage({ message: 'createIndexedDb' });
	}

	getId() {
		return this.counter++;
	}

	read(url: string): Promise<ArrayBuffer | undefined> {
		const id = this.getId();
		return new Promise<ArrayBuffer>((resolve) => {
			this.transactions[id] = { resolve };
			this.worker.postMessage({
				message: 'Get',
				id,
				key: url,
			});
		});
	}

	/** Writes the ArrayBuffer into the Cache at Key. The write may take some
	 * time to complete. It is also not guaranteed. However, it is OK to issue
	 * multiple writes to the same key at the same time. */
	write(url: string, data: ArrayBuffer): void {
		const record = {
			data,
		};

		this.worker.postMessage({
			message: 'Set',
			key: url,
			record,
		});
	}

	delete(url: string): Promise<void> {
		const id = this.getId();
		return new Promise<void>((resolve) => {
			this.transactions[id] = { resolve };
			this.worker.postMessage({
				message: 'Delete',
				id,
				key: url,
			});
		});
	}
}
