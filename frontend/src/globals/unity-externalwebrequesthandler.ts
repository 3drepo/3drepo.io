/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { IndexedDbCache } from './unity-indexedbcache';

/**
 * WebRequestHandler acts as the counterpart of a WebRequestHandler2 Component
 * in Unity. When the Component is started, an instance of this class is created
 * by UnityUtil and attached to the unityInstance. This reference is used by
 * functions in the WebRequestHandler2.jslib plug-in in Unity to make calls
 * directly from the viewer.
 */

export class ExternalWebRequestHandler {
	constructor(cache: IndexedDbCache) {
		this.requests = {};
		this.cache = cache;
	}

	/** The Unity Instance created by the loader; this is used for SendMessage */
	unityInstance: any;

	/** The gameObject which should be passed to SendMessage when making the
	 * callbacks to the viewer */
	gameObjectName: string;

	/** Resources for in-progress get requests */
	requests: any;

	/** An object providing an API to a cache */
	cache: IndexedDbCache;

	apiHost: string;

	/** Initialises this handler for an instance of Unity. Should be called by
	 * the viewer once it is fully initialised. */
	setUnityInstance(unityInstance: any, gameObjectName: string) : boolean {
		this.unityInstance = unityInstance;
		this.gameObjectName = gameObjectName;
		return true;
	}

	setAPIHost(hostNames: [string]) { // An array for backwards compatability reasons
		[this.apiHost] = hostNames;
	}

	/** Should direct to the cache object's read function. If the cache is
	 * disabled, returning an empty fulfilled promise will cause the request
	 * to be passed onto the web. The caller can skip the cache regardless of
	 * its state by passing false for the cache parameter. */
	// class-methods-use-this
	readCache(url, cache): Promise<ArrayBuffer | undefined> {
		return cache ? this.cache.read(url) : Promise.resolve(undefined);
	}

	// class-methods-use-this
	writeCache(url, data) {
		return this.cache.write(url, data);
	}

	/**
	 * Queue a request with the specified id. The id must be registered immediately,
	 * in case the viewer then calls abortRequest. The actual response is retrieved
	 * asynchronously over some time.
	 */
	createGetRequest(id: number, url: string, cache: Boolean) {
		if (this.requests[id] !== undefined) {
			console.error('Found duplicate transaction Id. This should not happen.');
		}

		this.requests[id] = {};

		// The lambda that handles the response to this request, this will either
		// be called in response to a cache hit, or a successful fetch request.
		const resolve = (data) => {
			if (this.requests[id].abort) {
				throw new Error('Aborted'); // To be picked up by catch below
			}
			this.requests[id].data = data;
			this.sendOnWebResponse({
				id,
				size: data.byteLength,
			});
		};

		// Attempt to get the key from the cache. If this is successful it can be
		// given directly to the viewer, otherwise retrieve it.
		this.readCache(url, cache).then(async (result) => {
			if (result !== undefined) {
				resolve(result);
				return Promise.resolve();
			}

			const cookies = document?.cookie;
			const headers = {};
			if (cookies) {
				const tokenMatch = cookies.match(/(^| )csrf_token=([^;]+)/);
				if (tokenMatch) {
					headers['X-CSRF-TOKEN'] = tokenMatch[2];
				}
			}

			const response = await fetch(this.getUrl(url), { headers });

			// Where the request gets a response outside the OK range, fetch will
			// not raise an error, but will print to the console. In this case we
			// terminate the task gracefully and don't need to print the error
			// again.
			if (!response.ok) {
				throw new Error('Aborted');
			}

			const data = await response.arrayBuffer();
			this.writeCache(url, data);
			resolve(data);

		}).catch((err) => {
			if (err.message !== 'Aborted') { // This we don't need to print because in this case the control flow is expected
				console.error(err);
			}
			this.sendOnWebResponse({
				id,
				size: -1, // This signals that the request ended early. The reason should be printed in the Js log so there is no need to send it to Unity.
			});
		});
	}

	/** Given a local URI that can also act as a cache key, return a fully
	 * qualified URI that will return the resource from .io */
	// eslint-disable-next-line class-methods-use-this
	getUrl(url) {
		// In the frontend, we rely on the XHR system to already be set up
		return `${this.apiHost}/${url}`;
	}

	/**
	 * Aborts the request. This will only take effect if sendOnWebResponse has
	 * not already been called.
	 */
	abortRequest(id: number) {
		this.requests[id].abort = true;
	}

	// When a byte[] array (or other managed object) is passed to an imported
	// function, it arrives as an offset into the WASM Heap. We can use this
	// to access the contents of the array directly in the Module's ArrayBuffer,
	// to get or set the contents.

	/**
	 * Copies the data returned from a get request into the heap at offset.
	 * Once this is done the local resources should be released by calling
	 * releaseTransaction.
	 */
	getResponseBytes(id: number, offset: number) {
		try {
			this.unityInstance.Module.HEAP8.set( // set copies the contents of the TypedArray into the destination ArrayBuffer
				new Int8Array(this.requests[id].data), // Specify the Type to interpet the ArrayBuffer as when copying

				// This 'shift' converts offset from a signed to unsigned
				// integer, which is necessary to support the WASM 4GB address
				// space https://v8.dev/blog/4gb-wasm-memory
				// eslint-disable-next-line no-bitwise
				offset >>> 0,
			);
		} catch (error) {
			console.error(error);
		}
	}

	/** Converts the data returned from a get request into a string and returns
	 * it. The plugin will allocate an unmanaged buffer for the string and copy
	 * it into it.
	 */
	getResponseString(id: number): string {
		return new TextDecoder().decode(this.requests[id].data);
	}

	/**
	 * Releases any resources associated with an existing request.
	 * Not all oprations will have resources. If an invalid id is passed in,
	 * this method does nothing.
	 * @param id The transaction id whose resources to dispose of
	 */
	releaseRequest(id: number) {
		delete this.requests[id];
	}

	// These calls update the Unity viewer

	/**
	 * Notify the handler that the response is available for reading.
	 */
	sendOnWebResponse(parms: any) {
		this.unityInstance.SendMessage(this.gameObjectName, 'OnWebResponse', JSON.stringify(parms));
	}
}
