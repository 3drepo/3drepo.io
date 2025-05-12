/**
 *  Copyright (C) 2017 3D Repo Ltd
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

/* eslint-disable no-underscore-dangle */
/* eslint-enable no-var */

import { IndexedDbCache } from './unity-indexedbcache';
import { ExternalWebRequestHandler } from './unity-externalwebrequesthandler';
import { ThreeJsViewer } from './threejs-viewer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare let SendMessage;
declare let createUnityInstance;

type DrawingImageSource = ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;

export class UnityUtil {
	/** @hidden */
	private static errorCallback: any;

	/** @hidden */
	private static progressCallback: any;

	/** @hidden */
	private static modelLoaderProgressCallback: any;

	/**
	 * viewer can be assigned, containing any callback function the user wishes to hook onto.
	 * The following functions are supported:
	 *
	 * **viewer.clipBroadcast(**_object_**)**: Called when a clipping plane broadcast occurs with
	 * the new clipping plane information
	 *
	 * **viewer.numClipPlanesUpdated(**_int_**)**: Called when the number of clipping planes changed,
	 * with the latest number of clipping planes in place
	 *
	 * **viewer.objectSelected(**_object_**)**: Notify the user which object/pin is clicked after a mouse event
	 *
	 * **viewer.objectsSelected(**_object_**)**: Notify the user which objects is selected after
	 * a rectangular select event
	 *
	 * **viewer.pickPointEvent(**_object_**)**: Notify the user what position within the 3D world was
	 * clicked after a mouse event.
	 *
	 * @example UnityUtil.viewer = {
	 *  numClipPlanesUpdated = (nPlanes) => console.log(\`Current no. planes: ${nPlanes}\`}
	 */
	public static viewer: any;

	/** @hidden */
	public static LoadingState = {
		VIEWER_READY: 1, // Viewer has been loaded
		MODEL_LOADING: 2, // model information has been fetched, world offset determined, model starts loading
		MODEL_LOADED: 3, // Models
	};

	/** @hidden */
	public static instance;

	/** @hidden */
	public static externalWebRequestHandler;

	/** A URL pointing to the domain hosting a Unity distribution. E.g. www.3drepo.io/.
	 * This is where the Unity Build folder and the IndexedDb worker can be found. */
	/** @hidden */
	public static unityDomain: URL;

	/** A URL containing the subfolder under unityUrl where the Unity build and
	 * its associated dependencies can be found.
	 * This should usually be set to "/unity/Build" */
	public static unityBuildSubdirectory : any;

	/** @hidden */
	public static readyPromise: Promise<void>;

	/** @hidden */
	public static readyResolve;

	/** @hidden */
	public static loadedPromise;

	/** @hidden */
	public static loadedResolve;

	/** @hidden */
	public static loadingPromise;

	/** @hidden */
	public static loadingResolve;

	// Diff promises
	/** @hidden */
	public static loadComparatorResolve;

	/** @hidden */
	public static loadComparatorPromise;

	/** @hidden */
	public static unityHasErrored = false;

	/** @hidden */
	public static screenshotPromises = [];

	/** @hidden */
	public static viewpointsPromises = [];

	/** @hidden */
	public static objectStatusPromises = [];

	/** @hidden */
	public static loadedFlag = false;

	/** @hidden */
	public static UNITY_GAME_OBJECT = 'WebGLInterface';

	/** @hidden */
	public static defaultHighlightColor = [1, 1, 0];

	public static verbose = false;

	/** @hidden */
	/** Start by assuming IndexedDB is available. If there are any access
	 * failures during the preamble, then this will be set to false.
	 */
	private static indexedDBAvailable = true;

	/**
	 * Temporarily holds references to DOM objects that can be bound to a WebGL texture by id (a number).
	 * Use the corresponding counter to ensure numbers are unique. References will be removed automatically
	 * by bindWebGLTexture. DrawingImageSource is a subset of types defined for TexImageSource, but not
	 * including video types.
	 */
	/** @hidden */
	private static domTextureReferences: { [id: number] : DrawingImageSource } = {};

	/**
	 * Convenience member to provide ids for domTextureReferences.
	 */
	/** @hidden */
	private static domTextureReferenceCounter = 0;

	/**
	 * Contains a list of calls to make during the Unity Update method. One
	 * call is made per Unity frame.
	 */
	public static unityOnUpdateActions = [];

	/**
	* Initialise Unity.
	* @category Configurations
	* @param errorCallback - function to call when an error occurs.
	* This function should take a string(message), boolean(requires reload), boolean(came from unity).
	* @param progressCallback
	* @param modelLoaderProgressCallback
	*/
	public static init(errorCallback: any, progressCallback: any, modelLoaderProgressCallback: any) {
		UnityUtil.errorCallback = errorCallback;
		UnityUtil.progressCallback = progressCallback;
		UnityUtil.modelLoaderProgressCallback = modelLoaderProgressCallback;
		UnityUtil.unityBuildSubdirectory = '/unity/Build'; // These directories are determined by webpack.common.config.js
		UnityUtil.setUnityMemory(0); // This forces the browser to update the viewer with the autodetected memory. If the user has set it explicitly in viewer settings, it will be overridden later when they are processed.
	}

	/** @hidden */
	public static onProgress(progress: number) {
		requestAnimationFrame(() => {
			if (UnityUtil.progressCallback) {
				UnityUtil.progressCallback(progress);
			}
		});
	}

	/**
	 * Checks if access to IndexedDb is available, and updates the
	 * indexedDBAvailable flag accordingly.
	 */
	private static checkIdb(): Promise<void> {
		return new Promise((resolve) => {
			// If something outside has signalled IndexedDb is unavailable, don't
			// do anything further.
			if (!this.indexedDBAvailable) {
				resolve();
			}

			// Check if IndexedDB is available by accessing the databases list.
			// This should catch both API availability and permissions issues.
			try {
				indexedDB.databases().then(() => {
					resolve();
				}).catch(() => {
					console.warn('IndexedDB is unavailable.');
					this.indexedDBAvailable = false;
					resolve();
				});
			} catch {
				console.warn('IndexedDB is unavailable.');
				this.indexedDBAvailable = false;
				resolve();
			}
		});
	}

	/**
	 * Removes the IndexedDb database /idbfs, which emulates a synchronous
	 * filesystem.
	 * The viewer should not store anything use the File API between runs.
	 */
	private static clearIdbfs(): Promise<void> {
		// The following snippet makes sure only one tab ever attempts to clear
		// the cache. This is because the cache only needs to be cleared once,
		// and simultaneous attempts can cause stalls.

		// This function uses the shared localstorage to store whether the cache
		// has been cleared.
		// localstorage does not have a CAS operation, but reads and writes are
		// atomic.
		// Below, each tab that encounters an uncleared cache will first write
		// a unique id, and then attempt to read it back. Only the tab whose id
		// matches will embark on the clear operation.

		try {
			const clearedFlagKey = 'repoV1CacheCleared';
			if (this.indexedDBAvailable && !window.localStorage.getItem(clearedFlagKey)) {
				const id = (Math.floor(Math.random() * 100000)).toString();
				window.localStorage.setItem(clearedFlagKey, id);
				if (window.localStorage.getItem(clearedFlagKey) === id) {
					const deleteRequest = indexedDB.deleteDatabase('/idbfs');
					return new Promise((resolve) => {
						deleteRequest.onsuccess = () => {
							resolve();
						};
						deleteRequest.onerror = () => {
							console.error('Failed to delete /idbfs. Consider clearing the cache or deleting this database manually.');
							resolve();
						};
						deleteRequest.onblocked = () => { // If the request was blocked its most likely because another tab has idbfs open, so leave it alone
							resolve();
						};
						deleteRequest.onupgradeneeded = () => {
							resolve();
						};
					});
				}
			}
		} catch (error) {
			console.error('Unable to clear IndexDbFs.', error);
		}
		return Promise.resolve();
	}

	/**
	 * Returns the relative path of the Unity Loader to the current domain
	 */
	public static unityLoaderPath(): string {
		return `${this.unityBuildSubdirectory}/unity.loader.js`;
	}

	/**
	 * Launch the Unity Game.
 	 * @category Configurations
	 * @param container - the html dom of the unity canvas
	 * @param host - host server URL (e.g. https://www.3drepo.io)
	 * @return returns a promise which resolves when the game is loaded.
	 *
	 */
	public static loadUnity(container: any, host): Promise<void> {
		let canvasDom = container;
		let domainURL = host;
		if (Object.prototype.toString.call(container) === '[object String]') {
			// The user is calling it like Unity 2019. Convert it to a dom an create a canvas
			console.warn('[DEPRECATED WARNING] loadUnity() no longer takes in a string and a URL to the unity config. Please check the API documentation and update your function.');
			const divDom = document.getElementById(container);
			canvasDom = document.createElement('canvas');
			canvasDom.id = 'unity';
			divDom.appendChild(canvasDom);

			if (host) {
				// Old schema asks for a json file location, we now take the domain url
				// and generate the object at run time.
				// eslint-disable-next-line no-useless-escape
				domainURL = host.match('^https?:\/\/[^\/]+');
			}
		}

		return this.checkIdb().then(() => UnityUtil.clearIdbfs()).then(() => UnityUtil._loadUnity(canvasDom, domainURL));
	}

	/** @hidden */
	public static _loadUnity(container: any, domainURL): Promise<void> {
		if (!window.Module) {
			// Add withCredentials to XMLHttpRequest prototype to allow unity game to
			// do CORS request. We used to do this with a .jspre on the unity side but it's no longer supported
			// as of Unity 2019.1
			(XMLHttpRequest.prototype as any).originalOpen = XMLHttpRequest.prototype.open;
			// eslint-disable-next-line func-names
			const newOpen = function () {
				// eslint-disable-next-line
				const original = this.originalOpen.apply(this, arguments);
				this.withCredentials = true;
				return original;
			};
			XMLHttpRequest.prototype.open = newOpen;
		}

		UnityUtil.unityDomain = new URL(domainURL || window.location.origin);
		if (this.indexedDBAvailable) { // Currently, the only reason to use ExternalWebRequestHandler is to use IndexedDb, so don't create the handler if it's not supported
			this.externalWebRequestHandler = new ExternalWebRequestHandler(new IndexedDbCache(this.unityDomain)); // IndexedDbCache expects to find the worker at in [unityDomain]/unity/indexeddbworker.js
		}

		UnityUtil.onReady();
		UnityUtil.onLoaded();

		UnityUtil.instance = new ThreeJsViewer(container);

		UnityUtil.ready();

		return UnityUtil.onReady();
	}

	/**
	 * @category Configurations
	 * Quits unity instance & reset all custom callback and promises
	 */
	public static quitUnity() {
		this.reset();
		UnityUtil.errorCallback = null;
		UnityUtil.progressCallback = null;
		UnityUtil.modelLoaderProgressCallback = null;
		UnityUtil.readyPromise = null;
		UnityUtil.instance.Quit();
	}

	/**
	 * Called from within the viewer on each Unity frame.
	 */
	public static onUpdate() {
		if (this.unityOnUpdateActions.length > 0) {
			const action = this.unityOnUpdateActions.shift();
			action();
		}
	}

	/**
	 * @hidden
	 * Called by the viewer to retrieve cookies in the application
	 */
	public static getCookies() {
		return document?.cookie;
	}

	/**
	 * @hidden
	 * @category To Unity
	 * Cancels any model that is currently loading. This will reject any model promises with "cancel" as the message
	 */
	public static cancelLoadModel() {
		if (!UnityUtil.loadedFlag && UnityUtil.loadedResolve) {
			// If the previous model is being loaded but hasn't finished yet
			UnityUtil.loadedResolve.reject('cancel');
		}

		if (UnityUtil.loadingResolve) {
			UnityUtil.loadingResolve.reject('cancel');
		}
	}

	/**
	 * @hidden
	 * Check if an error is Unity related
	 */
	public static isUnityError(err) {
		const checks = [
			'Array buffer allocation failed', 'Invalid typed array length',
			'Unity', 'unity', 'emscripten', 'blob:http',
		];
		const hasUnityError = !checks.every((check) => err.indexOf(check) === -1);
		return hasUnityError;
	}

	/**
	 * @hidden
	 * Handle a error from Unity
	 */
	public static onUnityError(message) {
		let reload = false;
		let conf;

		if (UnityUtil.isUnityError(message)) {
			reload = true;
			conf = `Your browser has failed to load 3D Repo's model viewer. The following occured:
					<br><br> <code>${message}</code>
					<br><br> This may due to insufficient memory. Please ensure you are using a modern 64bit web browser
					(such as Chrome or Firefox), reduce your memory usage and try again.
					If you are unable to resolve this problem, please contact support@3drepo.com referencing the above error.
					<br><md-container>`;
		} else {
			conf = `Something went wrong :( <br><br> <code>${message}</code><br><br>
				If you are unable to resolve this problem, please contact support@3drepo.com referencing the above error
				<br><br> Click OK to refresh this page<md-container>`;
		}

		const isUnityError = reload;

		UnityUtil.userAlert(conf, reload, isUnityError);

		return true;
	}

	/**
	 * Returns a promise that lets you know when the model has finished loading.
	 * @Category State Queries
	 * @return returns a Promise that resolves when the model has finished loading.
	 *         The Promise returns the bounding box of the model.
	 */
	public static onLoaded(): Promise<object> {
		if (!UnityUtil.loadedPromise) {
			UnityUtil.loadedPromise = new Promise((resolve, reject) => {
				UnityUtil.loadedResolve = { resolve, reject };
			});
		}
		return UnityUtil.loadedPromise;
	}

	/**
	 * Returns a promise that lets you know when the model has started to load
	 * @Category State Queries
	 * @return returns a Promise that resolves when the model has started to load
	 */
	public static onLoading(): Promise<void> {
		if (!UnityUtil.loadingPromise) {
			UnityUtil.loadingPromise = new Promise((resolve, reject) => {
				UnityUtil.loadingResolve = { resolve, reject };
			});
		}
		return UnityUtil.loadingPromise;
	}

	/**
	 * Returns a promise that lets you know when the game is loaded.
	 * @Category State Queries
	 * @return returns a Promise that resolves when the game is loaded.
	 */
	public static onReady(): Promise<void> {
		if (!UnityUtil.readyPromise) {
			UnityUtil.readyPromise = new Promise((resolve, reject) => {
				UnityUtil.readyResolve = { resolve, reject };
			});
		}

		return UnityUtil.readyPromise;
	}

	/** @hidden */
	public static userAlert(message, reload, isUnity) {
		if (!UnityUtil.unityHasErrored) {
			// Unity can error multiple times, we don't want
			// to keep annoying the user
			UnityUtil.unityHasErrored = true;
			if (UnityUtil.errorCallback) {
				UnityUtil.errorCallback(message, reload, isUnity);
			}
		}
	}

	/** @hidden */
	public static toUnity(methodName, requireStatus?, params?) {
		if (UnityUtil.verbose) {
			console.debug('[TO UNITY]', methodName, requireStatus, params);
		}
		if (requireStatus === UnityUtil.LoadingState.MODEL_LOADED) {
			// Requires model to be loaded
			UnityUtil.onLoaded().then(() => {
				if (UnityUtil.instance) {
					UnityUtil.instance.SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
				}
			}).catch((error) => {
				if (error !== 'cancel') {
					console.error('UnityUtil.onLoaded() failed: ', error);
					UnityUtil.userAlert(error, true, true);
				}
			});
		} else if (requireStatus === UnityUtil.LoadingState.MODEL_LOADING) {
			// Requires model to be loading
			UnityUtil.onLoading().then(() => {
				if (UnityUtil.instance) {
					UnityUtil.instance.SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
				}
			}).catch((error) => {
				if (error !== 'cancel') {
					UnityUtil.userAlert(error, true, true);
					console.error('UnityUtil.onLoading() failed: ', error);
				}
			});
		} else {
			UnityUtil.onReady().then(() => {
				if (UnityUtil.instance) {
					UnityUtil.instance.SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
				}
			}).catch((error) => {
				if (error !== 'cancel') {
					UnityUtil.userAlert(error, true, true);
					console.error('UnityUtil.onReady() failed: ', error);
				}
			});
		}
	}

	/*
	 * =============== FROM UNITY ====================
	 */

	/**
	 * @hidden
	 * This function is called to notify the viewer what is the state of the current clipping planes.
	 * @param clipInfo an object containing an array of clipping plane information
	 */
	public static clipBroadcast(clipInfo: string) {
		const data = JSON.parse(clipInfo);
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] clipBroadcast', data);
		}
		if (UnityUtil.viewer && UnityUtil.viewer.clipBroadcast) {
			UnityUtil.viewer.clipBroadcast(JSON.parse(data));
		}
	}

	/** @hidden */
	public static clipUpdated() {
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] clipUpdated');
		}
		if (UnityUtil.viewer && UnityUtil.viewer.clipUpdated) {
			UnityUtil.viewer.clipUpdated();
		}
	}

	/** @hidden */
	public static currentPointInfo(pointInfo) {
		const point = JSON.parse(pointInfo);
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] currentPointInfo', point);
		}
		if (UnityUtil.viewer && UnityUtil.viewer.objectSelected) {
			UnityUtil.viewer.objectSelected(point);
		}
	}

	/** @hidden */
	public static comparatorLoaded() {
		UnityUtil.loadComparatorResolve.resolve();
		UnityUtil.loadComparatorPromise = null;
		UnityUtil.loadComparatorResolve = null;
	}

	/** @hidden */
	public static loaded(bboxStr) {
		// eslint-disable-next-line no-console
		console.log(`[${new Date()}]Loading model done. `);
		const res = {
			bbox: JSON.parse(bboxStr),
		};
		UnityUtil.loadedResolve.resolve(res);
		UnityUtil.loadedFlag = true;
	}

	/** @hidden */
	public static loading() {
		UnityUtil.loadingResolve.resolve();
	}

	/** @hidden */
	public static loadingProgress(progress) {
		if (UnityUtil.modelLoaderProgressCallback) {
			UnityUtil.modelLoaderProgressCallback(progress);
		}
	}

	/** @hidden */
	public static navMethodChanged(newNavMode) {
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] navMethodChanged', newNavMode);
		}
		if (UnityUtil.viewer && UnityUtil.viewer.navMethodChanged) {
			UnityUtil.viewer.navMethodChanged(newNavMode);
		}
	}

	/** @hidden */
	public static objectsSelectedAlert(nodeInfo) {
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] objectsSelectedAlert', JSON.parse(nodeInfo));
		}
		UnityUtil.viewer.objectsSelected(JSON.parse(nodeInfo).nodes);
	}

	/** @hidden */
	public static objectStatusBroadcast(nodeInfo) {
		try {
			const data = JSON.parse(nodeInfo);
			if (UnityUtil.verbose) {
				console.debug('[FROM UNITY] objectStatusBroadcast', data);
			}
			UnityUtil.objectStatusPromises.forEach((promise) => {
				promise.resolve(data);
			});
		} catch (error) {
			UnityUtil.objectStatusPromises.forEach((promise) => {
				promise.resolve({});
			});
		}

		UnityUtil.objectStatusPromises = [];
	}

	/** @hidden */
	public static ready() {
		// Overwrite the Send Message function to make it run quicker
		// This shouldn't need to be done in the future when the
		// readyoptimisation in added into unity.
		UnityUtil.readyResolve.resolve();
	}

	/** @hidden */
	public static pickPointAlert(pointInfo) {
		const point = JSON.parse(pointInfo);
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] pickPointAlert', point);
		}
		if (UnityUtil.viewer && UnityUtil.viewer.pickPointEvent) {
			UnityUtil.viewer.pickPointEvent(point);
		}
	}

	/** @hidden */
	public static screenshotReady(screenshot) {
		try {
			const ssJSON = JSON.parse(screenshot);

			if (UnityUtil.verbose) {
				console.debug('[FROM UNITY] screenshotReady', ssJSON);
			}

			UnityUtil.screenshotPromises.forEach((promise) => {
				promise.resolve(ssJSON.ssBytes);
			});
		} catch (error) {
			UnityUtil.screenshotPromises.forEach((promise) => {
				promise.reject(error);
			});
		}

		UnityUtil.screenshotPromises = [];
	}

	/** @hidden */
	public static viewpointReturned(vpInfo) {
		try {
			const viewpoint = JSON.parse(vpInfo);
			if (UnityUtil.verbose) {
				console.debug('[FROM UNITY] viewpointReturned', viewpoint);
			}

			UnityUtil.viewpointsPromises.forEach((promise) => {
				promise.resolve(viewpoint);
			});
		} catch (error) {
			console.error('Failed to parse viewpoint', vpInfo);
			UnityUtil.viewpointsPromises.forEach((promise) => {
				promise.resolve({});
			});
		}

		UnityUtil.viewpointsPromises = [];
	}

	/** @hidden */
	public static measurementAlert(strMeasurement) {
		try {
			const measurement = JSON.parse(strMeasurement);
			if (UnityUtil.verbose) {
				console.debug('[FROM UNITY] measurementAlert', measurement);
			}
			if (UnityUtil.viewer && UnityUtil.viewer.measurementAlertEvent) {
				UnityUtil.viewer.measurementAlertEvent(measurement);
			}
		} catch (error) {
			console.error('Failed to parse measurement alert', strMeasurement);
		}
	}

	/** @hidden */
	public static measurementRemoved(measurementId) {
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] measurementRemoved', measurementId);
		}
		if (UnityUtil.viewer && UnityUtil.viewer.measurementRemoved) {
			UnityUtil.viewer.measurementRemoved(measurementId);
		}
	}

	/** @hidden */
	public static measurementsCleared() {
		if (UnityUtil.verbose) {
			console.debug('[FROM UNITY] measurementCleared');
		}
		if (UnityUtil.viewer && UnityUtil.viewer.measurementsCleared) {
			UnityUtil.viewer.measurementsCleared();
		}
	}

	/**
	 * Called by the Calibration Tool when a user action changes the heights of the vertical planes.
	 * Heights are given in Project coordinates from the origin.
	 */
	/** @hidden */
	public static calibrationPlanesChanged(planesJson) {
		const planes = JSON.parse(planesJson);
		UnityUtil.viewer.calibrationPlanesChanged([planes.lower, planes.upper]);
	}

	/*
	 * =============== TO UNITY ====================
	 */


	/**
	 * Tells the viewer the maximum amount of memory it can expect to be able
	 * to allocate for its heap. 0 means the maximum amount that the browser
	 * can handle, determined by hueristics in this method.
	 * @category Streaming
	 */
	public static setUnityMemory(maxMemoryInMb: number) {
		let memory = Number(maxMemoryInMb);
		if (memory === 0) {
			// If the user has not set the memory explicitly, then attempt to
			// determine it automatically

			// The new viewer can handle 4GB on most browsers.
			memory = 4032;

			// Firefox currently has a bug in its WebGL APIs,
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1838218
			// that causes a crash when the viewer uses more than 2GB. This snippet
			// tells the viewer not to attempt to consume more than 2GB, even though
			// the heap could grow into it. When Mozilla fixes the bug this can be
			// removed, or masked based on the version string.
			const match = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
			if (match) {
				memory = 2032;
			}
		}
		UnityUtil.toUnity('SetUnityMemory', UnityUtil.LoadingState.VIEWER_READY, memory);
	}

	/**
	 * Move the pivot point to the centre of the objects provided
	 * @category Navigations
	 * @param meshIDs - array of json objects each recording { model: <account.modelID>, meshID: [array of mesh IDs] }
	 */
	public static centreToPoint(meshIDs: Array<{ model: string, meshID: string[] }>) {
		meshIDs.forEach((entry) => {
			UnityUtil.multipleCallInChunks(entry.meshID.length, (start, end) => {
				const ids = entry.meshID.slice(start, end);
				const params: any = {
					teamspace: '', // Empty string for compatability with zoomToObjects
					modelId: entry.model,
					meshes: ids,
				};
				UnityUtil.toUnity('ZoomToObjectsAppend', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
			});
		});

		this.unityOnUpdateActions.push(() => {
			UnityUtil.toUnity('ZoomToObjectsEnd', UnityUtil.LoadingState.MODEL_LOADED);

		});
	}

	/**
	 * Change the colour of an existing pin
	 * @category Pins
	 * @param id - ID of the pin
	 * @param colour - colour RGB value of the colour to change to. e.g. [1, 0, 0]
	 */
	public static changePinColour(id: string, colour: number[]) {
		const params = {
			color: colour,
			pinName: id,
		};

		UnityUtil.toUnity('ChangePinColor', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	/**
	 * Clear all highlighting on currently highlighted objects
	 * @category Object Highlighting
	 */
	public static clearHighlights() {
		UnityUtil.toUnity('ClearHighlighting', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	* When Compare tool is enabled, visalise in differencing view
	* Models will be rendered in greyscale, detailing the difference/clash
	* @category Compare Tool
	*/
	public static diffToolDiffView() {
		UnityUtil.toUnity('DiffToolShowDiff', undefined, undefined);
	}

	/**
	* Disable compare tool
	* This also unloads the comparator models
	* @category Compare Tool
	*/
	public static diffToolDisableAndClear() {
		UnityUtil.toUnity('DiffToolDisable', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	* Enable compare tool
	* This starts the compare tool in diff mode
	* @category Compare Tool
	*/
	public static diffToolEnableWithDiffMode() {
		UnityUtil.toUnity('DiffToolStartDiffMode', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	* Enable compare tool
	* This starts the compare tool in clash mode
	* @category Compare Tool
	*/
	public static diffToolEnableWithClashMode() {
		UnityUtil.toUnity('DiffToolStartClashMode', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	 * Load comparator model for compare tool
	 * This returns a promise which will be resolved when the comparator model is loaded
	 * @category Compare Tool
	 * @param account - teamspace
	 * @param model - model ID
	 * @param revision - Specific revision ID/tag to load
	 * @return returns a promise that resolves upon comparator model finished loading.
	 */
	public static diffToolLoadComparator(account: string, model: string, revision = 'head'): Promise<void> {
		const params: any = {
			database: account,
			model,
		};

		if (revision !== 'head') {
			params.revID = revision;
		}
		UnityUtil.toUnity('DiffToolLoadComparator', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));

		if (!UnityUtil.loadComparatorPromise) {
			UnityUtil.loadComparatorPromise = new Promise((resolve, reject) => {
				UnityUtil.loadComparatorResolve = { resolve, reject };
			});
		}
		return UnityUtil.loadComparatorPromise;
	}

	/**
	 * Set an existing submodel/model as a comparator model
	 * This will return as a base model when you have cleared the comparator (i.e. disabled diff)
	 * @category Compare Tool
	 * @param account - name of teamspace
	 * @param model - model ID
	 */
	public static diffToolSetAsComparator(account: string, model: string) {
		const params: any = {
			database: account,
			model,
		};
		UnityUtil.toUnity('DiffToolAssignAsComparator', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
	}

	/**
	 * Set tolerance threshold.
	 * In general you should not need to tweak this, but if the differencing looks off, this is the value to tweak
	 * @category Compare Tool
	 * @param theshold - tolerance level for diffing/clashing
	 */
	public static diffToolSetThreshold(theshold: number) {
		UnityUtil.toUnity('DiffToolSetThreshold', UnityUtil.LoadingState.MODEL_LOADED, theshold);
	}

	/**
	* Only show the comparator model
	* i.e. Only show the model you are trying to compare with, not the base model
	* @category Compare Tool
	*/
	public static diffToolShowComparatorModel() {
		UnityUtil.toUnity('DiffToolShowComparatorModel', undefined, undefined);
	}

	/**
	* Only show the base model
	* i.e. It will show only the original model, not the comparator nor the diff view
	 * @category Compare Tool
	*/
	public static diffToolShowBaseModel() {
		UnityUtil.toUnity('DiffToolShowBaseModel', undefined, undefined);
	}

	/**
	* Compare transparent objects as if they are opaque objects
	* @category Compare Tool
	*/
	public static diffToolRenderTransAsOpaque() {
		UnityUtil.toUnity('DiffToolRenderTransAsOpaque', undefined, undefined);
	}

	/**
	* Ignore semi-transparent objects in diff
	* @category Compare Tool
	*/
	public static diffToolRenderTransAsInvisible() {
		UnityUtil.toUnity('DiffToolRenderTransAsInvisible', undefined, undefined);
	}

	/**
	* Compare transparent objects as of normal
	* @category Compare Tool
	*/
	public static diffToolRenderTransAsDefault() {
		UnityUtil.toUnity('DiffToolRenderTransAsDefault', undefined, undefined);
	}

	// The following methods are concerned with the clip tool. There are three
	// types of method.
	// - The start/stop methods turn the tool on and off and change the mode.
	// - The clipTool.. methods should be hooked up the equivalent buttons on
	// the toolbar.
	// - The set/scale/enable methods adjust the visuals and behaviour for fine
	// tuning; they are not intended to be exposed in the UI, and are not saved.

	// Some of the toolbar buttons will be stateful, such as clipToolRealign.
	// Use the `clipUpdated` callback to detect when the planes have been placed
	// in this mode (do not use clipBroadcast - that is only called after
	// setting the planes from the frontend).

	/**
	* Start clip editing in single plane mode
	* @category Clipping Plane
	*/
	public static startSingleClip() {
		UnityUtil.toUnity('StartSingleClip', undefined, undefined);
	}

	/**
	* Start clip editing in box mode
	* @category Clipping Plane
	*/
	public static startBoxClip() {
		UnityUtil.toUnity('StartBoxClip', undefined, undefined);
	}

	/**
	* Start editing mode with current clip plane state
	* @category Clipping Plane
	*/
	public static startClipEdit() {
		UnityUtil.toUnity('StartClipEdit', undefined, undefined);
	}

	/**
	* Stop editing mode
	* @category Clipping Plane
	*/
	public static stopClipEdit() {
		UnityUtil.toUnity('StopClipEdit', undefined, undefined);
	}

	/**
	* Move the clipping planes to the current selection (highlighted objects).
	* In single plane mode this moves along the normal so that the selected
	* object(s) are fully visible.
	* In six plane mode, the planes move to encompass the selection exactly,
	* retaining their orientation.
	* @category Clipping Plane
	*/
	public static clipToolClipToSelection() {
		UnityUtil.toUnity('ClipToolClipToSelection', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Puts the clip tool in Realign mode. In this mode the plane (or front of
	 * the box in six plane mode) will snap to the position and orientation of
	 * the first surface to be clicked. If the background is clicked, the planes
	 * or plane will reset to the scene bounding box.
	 * @category Clipping Plane
	 */
	public static clipToolRealign() {
		UnityUtil.toUnity('ClipToolRealign', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Flip the clip plane or box
	 * @category Clipping Plane
	 */
	public static clipToolFlip() {
		UnityUtil.toUnity('ClipToolFlip', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Hide all the clip planes, and reset them to the scene bounding box
	 * @category Clipping Plane
	 */
	public static clipToolDelete() {
		UnityUtil.toUnity('ClipToolDelete', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Puts the Clip Planes Gizmo into Translate mode.
	 * @category Clipping Plane
	 */
	public static clipToolTranslate() {
		UnityUtil.toUnity('ClipToolTranslate', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Puts the Clip Planes Gizmo in Rotate mode.
	 * @category Clipping Plane
	 */
	public static clipToolRotate() {
		UnityUtil.toUnity('ClipToolRotate', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Puts the Clip Planes Gizmo in Scale mode.
	 * @category Clipping Plane
	 */
	public static clipToolScale() {
		UnityUtil.toUnity('ClipToolScale', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Enables the inbuilt Clip Tool Toolbar. The toolbar is always disabled by
	 * default. This may need to be called on embedded viewers that don't have
	 * the full frontend UX.
	 * @category Clipping Plane
	 */
	public static enableClipToolbar() {
		UnityUtil.toUnity('EnableClipToolToolbar', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Disables the inbuilt Clip Tool Toolbar, if it was previously enabled via
	 * enableClipToolbar.
	 * @category Clipping Plane
	 */
	public static disableClipToolbar() {
		UnityUtil.toUnity('DisableClipToolToolbar', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Increase or decrease the Gizmo Size on screen by the amount provided (in percent)
	 * @category Clipping Plane
	 */
	public static scaleClipGizmo(percent: number) {
		UnityUtil.toUnity('ScaleClipGizmo', UnityUtil.LoadingState.VIEWER_READY, percent);
	}

	/**
	* Set the coefficient linking the change in Clip Box Size to proportion
	* of the screen covered by the cursor when scaling in all three axes.
	* @category Clipping Plane
	*/
	public static setClipScaleSpeed(speed: number) {
		UnityUtil.toUnity('SetClipScaleSpeed', UnityUtil.LoadingState.VIEWER_READY, speed);
	}

	/**
	 * Sets the coefficient that defines how much the clip box should be
	 * oversized when using the clip to selection function. The box is
	 * oversized to prevent the clip border being immediately visible.
	 * Setting this to 1 sets it to the default. Above 1 makes it larger
	 * and below 1 makes it smaller. 0 disables the feature.
	 * @category Clipping Plane
	 */
	public static setClipSelectionBoxScalar(scalar: number) {
		UnityUtil.toUnity('SetClipSelectionBoxScalar', UnityUtil.LoadingState.VIEWER_READY, scalar);
	}

	/**
	 * Disable the Measuring tool.
	 * @category Measuring tool
	 */
	public static disableMeasuringTool() {
		UnityUtil.toUnity('StopMeasuringTool', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Enable the measure tool toolbar.
	 * @category Measuring tool
	 */
	public static enableMeasureToolToolbar() {
		UnityUtil.toUnity('EnableMeasureToolToolbar', undefined, undefined);
	}

	/**
	 * Enable the measure tool toolbar.
	 * @category Measuring tool
	 */
	public static disableMeasureToolToolbar() {
		UnityUtil.toUnity('DisableMeasureToolToolbar', undefined, undefined);
	}

	/**
	 * Set the measure tool mode.
	 * @category Measuring tool
	 * @param mode - The measuring mode, accepted values are "Point", "Raycast", "MinimumDistance",
	 * "SurfaceArea", "PolygonArea", "PolyLine", "Angle" or "Slope".
	 */
	public static setMeasureToolMode(mode) {
		UnityUtil.toUnity('SetMeasureToolMode', undefined, mode);
	}

	/**
	 * Set the measure tool units.
	 * @category Measuring tool
	 * @param units - The measuring units accepted values are "cm", "mm", "m"
	 */
	public static setMeasureToolUnits(units) {
		UnityUtil.toUnity('SetMeasureToolUnits', undefined, units);
	}

	/**
	 * Set the measure tool units for the slope measurements.
	 * @category Measuring tool
	 * @param units - The measuring units accepted values are "Degrees", "Percentage"
	 */
	public static setMeasureToolSlopeUnits(units) {
		UnityUtil.toUnity('SetMeasureToolSlopeUnits', undefined, units);
	}

	/**
	 * Enable snapping to snap the cursor to the closest edge
	 * @category Configurations
	 */
	public static enableSnapping() {
		UnityUtil.toUnity('EnableSnapping', undefined, undefined);
	}

	/**
	 * Disable Snapping
	 * @category Configurations
	 */
	public static disableSnapping() {
		UnityUtil.toUnity('DisableSnapping', undefined, undefined);
	}

	 /**
	 * Enable Cursor
	 * Note: Changing the snap mode can affect the cursor.
	 * Call this after setting snapping.
	 * @category Configurations
	 */
	public static enableCursor() {
		UnityUtil.toUnity('EnableCursor', undefined, undefined);
	}

	/**
	 * Disable Cursor
	 * Note: Changing the snap mode can affect the cursor.
	 * Call this after setting snapping.
	 * @category Configurations
	 */
	public static disableCursor() {
		UnityUtil.toUnity('DisableCursor', undefined, undefined);
	}

	/**
	 * Clear all measurements
	 * @category Measuring tool
	 */
	public static clearAllMeasurements() {
		UnityUtil.toUnity('ClearMeasureToolMeasurements', undefined, undefined);
	}

	/**
	 * Remove a particular measurement.
	 * @param uuid - The measurement id of the measurement to be removed
	 * @category Measuring tool
	 */
	public static clearMeasureToolMeasurement(uuid) {
		UnityUtil.toUnity('ClearMeasureToolMeasurement', undefined, uuid);
	}

	/**
	 * Set color of a particular measurement.
	 * @param uuid - The measurement id of the measurement that will change color
	 * @category Measuring tool
	 */
	public static setMeasureToolMeasurementColor(uuid, color) {
		UnityUtil.toUnity('SetMeasureToolMeasurementColor', undefined, JSON.stringify({ uuid, color }));
	}

	/**
	 * Set color of a particular measurement.
	 * @param uuid - The measurement id of the measurement that will change name
	 * @category Measuring tool
	 */
	public static setMeasureToolMeasurementName(uuid, name) {
		UnityUtil.toUnity('SetMeasureToolMeasurementName', undefined, JSON.stringify({ uuid, name }));
	}

	/**
	 * Enable measure display mode to xyz.
	 * @category Measuring tool
	 */
	public static enableMeasureToolXYZDisplay() {
		UnityUtil.toUnity('EnableMeasureToolXYZDisplay');
	}

	/**
	 * Disable measure display mode to xyz.
	 * @category Measuring tool
	 */
	public static disableMeasureToolXYZDisplay() {
		UnityUtil.toUnity('DisableMeasureToolXYZDisplay');
	}

	/**
	 * Add a specific measurment to the scene.
	 * @category Measuring tool
	 */
	public static addMeasurement(measurement) {
		UnityUtil.toUnity('AddMeasurement', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(measurement));
	}

	/**
	 * Newly created measurements do not have labels.
	 * @category Measuring tool
	 */
	public static hideNewMeasurementsLabels() {
		UnityUtil.toUnity('HideNewMeasurementsLabels');
	}

	/**
	 * Newly created measurements have labels visible
	 * @category Measuring tool
	 */
	public static showNewMeasurementsLabels() {
		UnityUtil.toUnity('ShowNewMeasurementsLabels');
	}

	/**
	 * Select a measurement
	 * @category Measuring tool
	 */
	public static selectMeasurement(id: string) {
		UnityUtil.toUnity('SelectMeasurement', UnityUtil.LoadingState.MODEL_LOADING, id);
	}

	/**
	 * Deselect a measurement
	 * @category Measuring tool
	 */
	public static deselectMeasurement(id: string) {
		UnityUtil.toUnity('DeselectMeasurement', UnityUtil.LoadingState.MODEL_LOADING, id);
	}

	/**
	 * Sets the priority of a model namespace (making it higher or lower than
	 * the others). This can be used for example to ensure a model always loads
	 * fully, at the expense of others.
	 * @category Streaming
	 */
	public static setStreamingModelPriority(modelNamespace: string, priority: number) {
		UnityUtil.toUnity('SetStreamingModelPriority', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({ modelNamespace, priority }));
	}

	/**
	 * Adjusts the correction factor applied to mesh size estimates to account for Unity overheads.
	 * @category Streaming
	 */
	public static setStreamingMeshFactor(factor: number) {
		UnityUtil.toUnity('SetStreamingMeshFactor', UnityUtil.LoadingState.VIEWER_READY, Number(factor));
	}

	/**
	 * Adjusts how the visibilty of a Supermesh affects its priority when deciding whether or not to load it.
	 * @category Streaming
	 */
	public static setStreamingFovWeight(weight: number) {
		UnityUtil.toUnity('SetStreamingFovWeight', UnityUtil.LoadingState.VIEWER_READY, Number(weight));
	}

	/**
	 * The amount of space the geometry streaming should leave in the
	 * unmanaged heap.
	 * The unmanaged heap is not measured directly, but considered to be
	 * the space between the top of the Unity heap (typically 2Gb) and the
	 * top of the managed heap.
	 * (The available space for geometry will shrink dynamically as the
	 * managed heap grows, always leaving thresholdInMb available to
	 * Unity for other uses).
	 * @category Streaming
	 */
	public static setStreamingMemoryThreshold(thresholdInMb: number) {
		UnityUtil.toUnity('SetStreamingMemoryThreshold', UnityUtil.LoadingState.VIEWER_READY, Number(thresholdInMb));
	}

	/**
	 * Sets the colour of the bounding boxes representing yet-to-be-loaded Supermeshes
	 * @category Streaming
	 * @code UnityUtil.setStreamingBundlesColor([0.2,0.8,0.2]);
	 */
	public static setStreamingBundlesColor(colour: number[]) {
		const params = {
			color: colour,
		};
		UnityUtil.toUnity('SetStreamingBundlesColor', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));
	}

	/**
	 * Sets the colour of the bounding boxes representing yet-to-be-loaded individual model elements
	 * @category Streaming
	 * @code UnityUtil.setStreamingElementsColor([0.2,0.8,0.2]);
	 */
	public static setStreamingElementsColor(colour: number[]) {
		const params = {
			color: colour,
		};
		UnityUtil.toUnity('SetStreamingElementsColor', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));
	}

	/**
	 * Sets the three parameters that control the fade in and out of the Supermesh bounding boxes based on camera distance
	 * @category Streaming
	 * @param distance - how quickly the bounds fade-in with respect to the distance from the camera (to the far plane). (Does not have to be between 0 and 1 - making it larger will make the fade in more gradual.)
	 * @param bias - distance from the far plane that the bounds should start to fade out. When this is zero the bounds will not fade out. Should otherwise be above 1.
	 * @param power - how sharply the fade out occurs
	 * @code UnityUtil.SetStreamingBundlesFade(0.7,1.6,5);
	 */
	public static setStreamingBundlesFade(distance: number, bias: number, power: number) {
		const params = {
			bias,
			distance,
			power,
		};
		UnityUtil.toUnity('SetStreamingBundlesFade', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));
	}

	/**
	 * Sets the transparency of the Supermesh Bounding Boxes faces/sides. Setting both this and the Lines Alpha to zero
	 * will disable the Supermesh Bounds.
	 * @category Streaming
	 */
	public static setStreamingBundlesFacesAlpha(alpha: number) {
		UnityUtil.toUnity('SetStreamingBundlesFacesAlpha', UnityUtil.LoadingState.VIEWER_READY, Number(alpha));
	}

	/**
	 * Sets the transparency of the Supermesh Bounding Boxes edges/outlines. Setting both this and the Faces Alpha to zero
	 * will disable the Supermesh Bounds.
	 * @category Streaming
	 */
	public static setStreamingBundlesLinesAlpha(alpha: number) {
		UnityUtil.toUnity('SetStreamingBundlesLinesAlpha', UnityUtil.LoadingState.VIEWER_READY, Number(alpha));
	}

	/**
	 * Sets the transparency of the Elements Bounding Boxes faces/sides. Setting both this and the Lines Alpha to zero
	 * will disable the Elements Bounds.
	 * @category Streaming
	 */
	public static setStreamingElementsFacesAlpha(alpha: number) {
		UnityUtil.toUnity('SetStreamingElementsFacesAlpha', UnityUtil.LoadingState.VIEWER_READY, Number(alpha));
	}

	/**
	 * Sets the transparency of the Elements Bounding Boxes edges/outlines. Setting both this and the Faces Alpha to zero
	 * will disable the Elements Bounds.
	 * @category Streaming
	 */
	public static setStreamingElementsLinesAlpha(alpha: number) {
		UnityUtil.toUnity('SetStreamingElementsLinesAlpha', UnityUtil.LoadingState.VIEWER_READY, Number(alpha));
	}

	/**
	 * Sets the radius - as fraction of the camera near/far plane - within which the bounding boxes of individual
	 * yet-to-be-loaded elemenets should be drawn.
	 * @category Streaming
	 * @param radius - the distance from the camera towards the far plane, between 0 and 1.
	 */
	public static setStreamingElementsRadius(radius: number) {
		UnityUtil.toUnity('SetStreamingElementRadius', UnityUtil.LoadingState.VIEWER_READY, Number(radius));
	}

	/**
	 * Add a Risk pin
	 * @category Pins
	 * @param id - Identifier for the pin
	 * @param position - point in space where the pin should generate
	 * @param normal - normal vector for the pin (note: this is no longer used)
	 * @param colour - RGB value for the colour of the pin
	 */
	public static dropRiskPin(id: string, position: number[], normal: number[], colour: number[]) {
		const params = {
			id,
			position,
			normal,
			color: colour,
		};
		UnityUtil.toUnity('DropRiskPin', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	/**
	 * Add an issue pin
	 * @category Pins
	 * @param id - Identifier for the pin
	 * @param position - point in space where the pin should generate
	 * @param normal - normal vector for the pin (note: this is no longer used)
	 * @param colour - RGB value for the colour of the pin
	 */
	public static dropIssuePin(id: string, position: number[], normal: number[], colour: number[]) {
		const params = {
			id,
			position,
			normal,
			color: colour,
		};
		UnityUtil.toUnity('DropIssuePin', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	/**
	 * Add a bookmark pin
	 * @category Pins
	 * @param id - Identifier for the pin
	 * @param position - point in space where the pin should generate
	 * @param normal - normal vector for the pin (note: this is no longer used)
	 * @param colour - RGB value for the colour of the pin
	 */
	public static dropBookmarkPin(id: string, position: number[], normal: number[], colour: number[]) {
		const params = {
			id,
			position,
			normal,
			color: colour,
		};
		UnityUtil.toUnity('DropBookmarkPin', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	/**
	 * Add a ticket pin
	 * @category Pins
	 * @param id - Identifier for the pin
	 * @param position - point in space where the pin should generate
	 * @param normal - normal vector for the pin (note: this is no longer used)
	 * @param colour - RGB value for the colour of the pin
	 */
	public static dropTicketPin(id: string, position: number[], normal: number[], colour: number[]) {
		const params = {
			id,
			position,
			normal,
			color: colour,
		};
		UnityUtil.toUnity('DropTicketPin', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	/**
	 * Select a Pin by Id
	 * @category Pins
	 */
	public static selectPin(id: string) {
		UnityUtil.toUnity('SelectPin', UnityUtil.LoadingState.MODEL_LOADING, id);
	}

	/**
	 * Deselect a selected Pin by Id
	 * @category Pins
	 */
	public static deselectPin(id: string) {
		UnityUtil.toUnity('DeselectPin', UnityUtil.LoadingState.MODEL_LOADING, id);
	}

	/**
	 * Show x y z coordinates of current point
	 * @category Configurations
	 */
	public static showCoordView() {
		UnityUtil.toUnity('CoordViewEnable', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Hide x y z coordinates of current point
	 * @category Configurations
	 */
	public static hideCoordView() {
		UnityUtil.toUnity('CoordViewDisable', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Enable measuring tool. This will allow you to start measuring by clicking on the model
	 * @category Measuring tool
	 */
	public static enableMeasuringTool() {
		UnityUtil.toUnity('StartMeasuringTool', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Enable soft shadows - the highest shadow quality
	 * @category Configurations
	 */
	public static enableSoftShadows() {
		UnityUtil.toUnity('EnableSoftShadows', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Enable hard shadows
	 * @category Configurations
	 */
	public static enableHardShadows() {
		UnityUtil.toUnity('EnableHardShadows', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Disable shadows
	 * @category Configurations
	 */
	public static disableShadows() {
		UnityUtil.toUnity('DisableShadows', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Enable model caching
 	 * @category Configurations
	 */
	public static enableExternalWebRequestHandler() {
		UnityUtil.toUnity('EnableExternalWebRequestHandler', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Disable model caching
 	 * @category Configurations
	 */
	public static disableExternalWebRequestHandler() {
		UnityUtil.toUnity('DisableExternalWebRequestHandler', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Get Object Status within the viewer. This will return you the list of
	 * objects that are currently set invisible, and a list of object that are
	 * currently highlighted.
	 *
	 * The object status will be returned via the promise provided.
	 * @category Model Interactions
	 * @param account - name of teamspace
	 * @param model - name of the model
	 */
	public static getObjectsStatus(account: string, model: string): Promise<object> {
		const newObjectStatusPromise = new Promise((resolve, reject) => {
			this.objectStatusPromises.push({ resolve, reject });
		});

		const nameSpace = account && model ? `${account}.${model}` : '';

		UnityUtil.toUnity('GetObjectsStatus', UnityUtil.LoadingState.MODEL_LOADED, nameSpace);

		return newObjectStatusPromise as Promise<object>;
	}

	/**
	 * Decrease the speed of Helicopter navigation (by x0.75)
	 * @category Navigations
	 */
	public static helicopterSpeedDown() {
		UnityUtil.toUnity('HelicopterSpeedDown', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Increase the speed of Helicopter navigation (by x1.25)
	 * @category Navigations
	 */
	public static helicopterSpeedUp() {
		UnityUtil.toUnity('HelicopterSpeedUp', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the speed of Helicopter navigation
	 * @category Navigations
	 */
	public static helicopterSpeedReset() {
		UnityUtil.toUnity('HelicopterSpeedReset', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Hide objects that are hidden by default (e.g. IFCSpaces)
	 * @category Model Interactions
	 */
	public static hideHiddenByDefaultObjects() {
		UnityUtil.toUnity('HideHiddenByDefaultObjects', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	 * Highlight objects
	 * @category Object Highlighting
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param idArr - array of unique IDs associated with the objects to highlight
	 * @param color - RGB value of the highlighting colour
	 * @param toggleMode - If set to true, existing highlighted objects will stay highlighted.
	 * Also any objects that are already highlighted will be unhighlighted
	 * @param forceReHighlight - If set to true, existing highlighted objects will be forced
	 * to re-highlight itself. This is typically used for re-colouring a highlight ]
	 * or when you want a specific set of objects to stay highlighted when toggle mode is on
	 * @return returns a promise which will resolve after Unity has invoked its highlightObjects function
	 */
	public static highlightObjects(
		account: string,
		model: string,
		idArr: string[],
		color: [number],
		toggleMode: boolean,
		forceReHighlight: boolean,
	) {
		return UnityUtil.multipleCallInChunks(idArr.length, (start, end) => {
			const arr = idArr.slice(start, end);
			const params: any = {
				database: account,
				model,
				ids: arr,
				toggle: toggleMode,
				forceReHighlight,
				color: color || UnityUtil.defaultHighlightColor,
			};
			UnityUtil.toUnity('HighlightObjects', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
		});
	}

	/**
	 * Unhighlight objects
	 * @category Object Highlighting
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param idArr - array of unique IDs associated with the objects to highlight
	 * @return returns a promise which will resolve after Unity has invoked its unhighlightObjects function
	 */
	public static unhighlightObjects(account: string, model: string, idArr: string[]) {
		return UnityUtil.multipleCallInChunks(idArr.length, (start, end) => {
			const ids = idArr.slice(start, end);
			const params: any = {
				database: account,
				model,
				ids,
			};

			UnityUtil.toUnity('UnhighlightObjects', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
		});
	}

	/**
	 * Enables the Pause Rendering feature of the viewer - when the camera is not moving, the main scene will not be redrawn.
	 * @category Configurations
	 */
	public static pauseRendering() {
		UnityUtil.toUnity('PauseRendering', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Disables the Pause Rendering feature of the viewer - the entire scene will render every frame regardless of camera behaviour.
	 * @category Configurations
	 */
	public static resumeRendering() {
		UnityUtil.toUnity('ResumeRendering', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Loading another model. NOTE: this will also clear the canvas of existing models
	 * Use branch = master and revision = head to get the latest revision.
	 * If you want to know when the model finishes loading, use [[onLoaded]]
	 * @category Configurations
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param branch - ID of the branch (deprecated value)
	 * @param revision - ID of revision
	 * @param initView? - the view the model should load with
	 * @param clearCanvas? - Reset the state of the viewer prior to loading the model (Default: true)
	 * @return returns a promise that resolves when the model start loading.
	 */
	public static async loadModel(
		account: string,
		model: string,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		branch = '',
		revision = 'head',
		initView = null,
		clearCanvas = true,
	): Promise<void> {
		if (clearCanvas && UnityUtil.loadedFlag) {
			UnityUtil.reset(!initView);
		}

		const params: any = {
			database: account,
			model,
		};

		if (revision !== 'head') {
			params.revID = revision;
		}

		if (initView) {
			params.initView = initView;
		}
		UnityUtil.onLoaded();
		// eslint-disable-next-line no-console
		console.log(`[${new Date()}]Loading model: `, params);

		const bbox = await UnityUtil.instance.loadModel(account, model);

		return Promise.resolve(bbox);
	}

	/**
	 * Offload a model that is currently loaded
	 * @category Configurations
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param revision - ID of revision
	 */
	public static offLoadModel(account: string, model: string, revision = 'head') {
		const ns = `${account}.${model}${revision === 'head' ? '' : `.${revision}`}`;
		UnityUtil.toUnity('UnloadModel', UnityUtil.LoadingState.MODEL_LOADED, ns);
	}

	/**
	 * Reset map sources. This removes all currently displayed maps
	 * @category GIS
	 * @param account - name of teamspace
	 */
	public static resetMapSources() {
		UnityUtil.toUnity('ResetMapSources', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Add map source.
	 * @category GIS
	 * @param mapSource - This can be "OSM", "HERE", "HERE_AERIAL", "HERE_TRAFFIC", "HERE_TRAFFIC_FLOW"
	 */
	public static addMapSource(mapSource: string) {
		UnityUtil.toUnity('AddMapSource', UnityUtil.LoadingState.VIEWER_READY, mapSource);
	}

	/**
	 * Remove map source.
	 * @category GIS
	 * @param mapSource - This can be "OSM", "HERE", "HERE_AERIAL", "HERE_TRAFFIC", "HERE_TRAFFIC_FLOW"
	 */
	public static removeMapSource(mapSource: string) {
		UnityUtil.toUnity('RemoveMapSource', UnityUtil.LoadingState.VIEWER_READY, mapSource);
	}

	/**
	 * Initialise map tiles within unity
	 * @category GIS
	 * @param surveyingInfo - array of survey points and it's respective latitude and longitude value
	 */
	public static mapInitialise(surveyingInfo: [object]) {
		// FIMXE: this should be MODEL_LOADING require #2010 to be fixed
		UnityUtil.toUnity('MapsInitiate', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(surveyingInfo));
	}

	/**
	 * Start map generation
	 * @category GIS
	 */
	public static mapStart() {
		UnityUtil.toUnity('ShowMap', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	 * Stop map generation
	 * @category GIS
	 */
	public static mapStop() {
		UnityUtil.toUnity('HideMap', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	 * Override the colour of given object(s)
	 * @category Object Highlighting
	 * @param account - teamspace the meshes resides in
	 * @param model - model ID the meshes resides in
	 * @param meshIDs - unique IDs of the meshes to operate on
	 * @param color - RGB value of the override color (note: alpha will be ignored)
	 * @return returns a promise which will resolve after Unity has invoked its overrideMeshColor function
	 */
	public static overrideMeshColor(account: string, model: string, meshIDs: [string], color: [number]) {
		return UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = `${account}.${model}`;
			}
			param.ids = meshIDs.slice(start, end);
			param.color = color;
			UnityUtil.toUnity('OverrideMeshColor', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * Restore the meshes to its original color values
	 * @category Object Highlighting
	 * @param account - teamspace the meshes resides in
	 * @param model - model ID the meshes resides in
	 * @param meshIDs - unique IDs of the meshes to operate on
	 * @return returns a promise which will resolve after Unity has invoked its resetMeshColor function
	 */
	public static resetMeshColor(account: string, model: string, meshIDs: [string]) {
		return UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = `${account}.${model}`;
			}
			param.ids = meshIDs.slice(start, end);
			UnityUtil.toUnity('ResetMeshColor', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * Override the alpha value of given object(s)
	 * If you are setting opacity to 0, use toggleVisibility instead.
	 * @category Object Highlighting
	 * @param account - teamspace the meshes resides in
	 * @param model - model ID the meshes resides in
	 * @param meshIDs - unique IDs of the meshes to operate on
	 * @param opacity - opacity (>0 - 1) value to override with
	 * @return returns a promise which will resolve after Unity has invoked its overrideMeshOpacity function
	 */
	public static overrideMeshOpacity(account: string, model: string, meshIDs: [string], opacity: number) {
		return UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = `${account}.${model}`;
			}
			param.ids = meshIDs.slice(start, end);
			param.opacity = opacity;
			UnityUtil.toUnity('OverrideMeshOpacity', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * Reset override alpha value of given object(s)
	 * @category Object Highlighting
	 * @param account - teamspace the meshes resides in
	 * @param model - model ID the meshes resides in
	 * @param meshIDs - unique IDs of the meshes to operate on
	 * @return returns a promise which will resolve after Unity has invoked its resetMeshOpacity function
	 */
	public static resetMeshOpacity(account: string, model: string, meshIDs: [string]) {
		return UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = `${account}.${model}`;
			}
			param.ids = meshIDs.slice(start, end);
			UnityUtil.toUnity('ResetMeshOpacity', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * Remove a pin from the viewer
	 * @category Pins
	 * @param id - pin identifier
	 */
	public static removePin(id: string) {
		UnityUtil.toUnity('RemovePin', UnityUtil.LoadingState.MODEL_LOADING, id);
	}

	/**
	 * Clear the canvas and reset all settings
	 * @category Configurations
	 */
	public static reset(resetProjection = true) {
		UnityUtil.cancelLoadModel();
		UnityUtil.loadedPromise = null;
		UnityUtil.loadedResolve = null;
		UnityUtil.loadingPromise = null;
		UnityUtil.loadingResolve = null;
		UnityUtil.loadedFlag = false;

		UnityUtil.disableMeasuringTool();
		UnityUtil.disableSnapping();
		UnityUtil.clearAllMeasurements();
		UnityUtil.diffToolDisableAndClear();
		if (resetProjection) {
			UnityUtil.usePerspectiveProjection();
		}
		UnityUtil.toUnity('ClearCanvas', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the viewpoint to ISO view.
	 * @category Navigations
	 */
	public static resetCamera() {
		UnityUtil.instance.resetCamera();
	}

	/**
	 * Reset the viewpoint to Top down view.
	 * @category Navigations
	 */
	public static topView() {
		UnityUtil.toUnity('TopView', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the viewpoint to Bottom up view.
	 * @category Navigations
	 */
	public static bottomView() {
		UnityUtil.toUnity('BottomView', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the viewpoint to the left side of the model.
	 * @category Navigations
	 */
	public static leftView() {
		UnityUtil.toUnity('LeftView', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the viewpoint to the right side of the model.
	 * @category Navigations
	 */
	public static rightView() {
		UnityUtil.toUnity('RightView', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the viewpoint to the front of the model.
	 * @category Navigations
	 */
	public static frontView() {
		UnityUtil.toUnity('FrontView', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Reset the viewpoint to the back of the model.
	 * @category Navigations
	 */
	public static backView() {
		UnityUtil.toUnity('BackView', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Request a screenshot. The screenshot will be returned as a JSON
	 * object with a single field, ssByte, containing the screenshot in
	 * base64.
	 * @category Model Interactions
	 * @return returns a promise which will resolve with an object with a screenshot in base64 format
	 */
	public static requestScreenShot(): Promise<object> {
		const newScreenshotPromise = new Promise((resolve, reject) => {
			this.screenshotPromises.push({ resolve, reject });
		});
		UnityUtil.toUnity('RequestScreenShot', UnityUtil.LoadingState.VIEWER_READY, undefined);

		return newScreenshotPromise as Promise<object>;
	}

	/**
	 * Request the information of the current viewpoint
	 * @category Model Interactions
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @return returns a promises which will resolve with the viewpoint information
	 */
	public static requestViewpoint(account: string, model: string): Promise<any> {
		const newViewpointPromise = new Promise((resolve, reject) => {
			this.viewpointsPromises.push({ resolve, reject });
		});

		const param: any = {};
		if (account && model) {
			param.namespace = `${account}.${model}`;
		}

		UnityUtil.toUnity('RequestViewpoint', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));

		return newViewpointPromise as Promise<object>;
	}

	/**
	 * Set API host urls. This is needs to be called before loading model.
	 * @category Configurations
	 * @param hostNames - list of API names to use in an object. (e.g ["https://api1.www.3drepo.io/api/"])
	 */
	public static setAPIHost(hostNames: { hostNames: string[] }) {
		UnityUtil.toUnity('SetAPIHost', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(hostNames));
		if (UnityUtil.externalWebRequestHandler !== undefined) {
			UnityUtil.externalWebRequestHandler.setAPIHost(hostNames.hostNames);
		}
	}

	/**
	 * Set API key to use for authentication. Ensure setAPIHost is called before this.
	 * @category Configurations
	 * @param apiKey
	 */
	public static setAPIKey(apiKey: string) {
		UnityUtil.toUnity('SetAPIKey', UnityUtil.LoadingState.VIEWER_READY, apiKey);
	}

	/**
	 * Set the default near plane value. This can be use to tweak situations where
	 * geometry closest to you are being clipped
	 * @category Configurations
	* @param value - the closest distance (in model units) the camera will render.
	 */
	public static setDefaultNearPlane(value: number) {
		UnityUtil.toUnity('DefaultNearPlaneValue', UnityUtil.LoadingState.VIEWER_READY, value);
	}

	/**
	 * @hidden
	 * Set the number of samples to take when determining far plane
 	 * @param {number} value - the number of samples (per edge) the algorithm should sample
	 */
	public static setFarPlaneSampleSize(value: number) {
		UnityUtil.toUnity('FarPlaneSampleSize', UnityUtil.LoadingState.VIEWER_READY, value);
	}

	public static setMaxFarPlane(value: number) {
		UnityUtil.toUnity('SetMaxFarPlane', UnityUtil.LoadingState.VIEWER_READY, Number(value));
	}

	public static setMaxNearPlane(value: number) {
		UnityUtil.toUnity('SetMaxNearPlane', UnityUtil.LoadingState.VIEWER_READY, Number(value));
	}

	/**
	* Set the maximum rending distance for shadows. Smaller value may increase shadow quality.
	* @category Configurations
	* @param value - The maximum distance (in model units) the renderer will render shadows for
	*/
	public static setMaxShadowDistance(value: number) {
		UnityUtil.toUnity('MaxShadowDistance', UnityUtil.LoadingState.VIEWER_READY, value);
	}

	/**
	 * Set navigation mode.
	 * @category Navigations
	 * @param {string} navMode - This can be either "HELICOPTER" or "TURNTABLE"
	 */
	public static setNavigation(navMode) {
		UnityUtil.toUnity('SetNavMode', UnityUtil.LoadingState.VIEWER_READY, navMode);
	}

	/**
	 * Set the units
	 * By default, units are set to mm. This is used for GIS and measuring tool.
	 * @category Configurations
	 * @param {string} units - i.e. "m", "mm", "ft" etc.
	 */
	public static setUnits(units) {
		UnityUtil.toUnity('SetUnits', UnityUtil.LoadingState.MODEL_LOADING, units);
	}

	/**
	 * Use orthographic view
	 * @category Configurations
	 */
	public static useOrthographicProjection() {
		console.log("Unity Utils use Ortho");
		UnityUtil.instance.switchToOrthographicCamera();		
	}

	/**
	 * Use perspective view
	 * @category Configurations
	 */
	public static usePerspectiveProjection() {
		console.log("Unity Utils use Persp");
		UnityUtil.instance.switchToPerspectiveCamera();		
	}

	/**
	 * Tells the viewer to enable Textures if they have previously been disabled.
	 * Any Geometry already loaded must be reloaded for Textures to show.
	 * @category Configurations
	 */
	public static enableTextures() {
		UnityUtil.toUnity('EnableTextures', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Tells the viewer to disable textures. This means at runtime Textures will
	 * not be loaded with Geometry even where available.
	 * @category Configurations
	 */
	public static disableTextures() {
		UnityUtil.toUnity('DisableTextures', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Change the camera configuration
	 * teamspace and model is only needed if the viewpoint is relative to a model
	 * @category Navigations
	 * @param pos - 3D point in space where the camera should be
	 * @param up - Up vector
	 * @param forward - forward vector
	 * @param lookAt - point in space the camera is looking at. (pivot point)
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param animationTime - how long the camera should spend during the transition from the current viewpoint to this one
	 */
	public static setViewpoint(
		pos: [number],
		up: [number],
		forward: [number],
		lookAt: [number],
		projectionType?: boolean,
		orthographicSize?: number,
		account?: string,
		model?: string,
		animationTime?: number,
	) {
		const param: any = {};
		if (account && model) {
			param.nameSpace = `${account}.${model}`;
		}

		if (projectionType) {
			param.type = projectionType;
		}

		if (orthographicSize) {
			param.orthographicSize = orthographicSize;
		}

		if (typeof animationTime === 'number') { // don't check for a truthy value here because 0 is a valid animationTime
			param.animationTime = animationTime;
		} else {
			param.animationTime = 1;
		}

		param.position = pos;
		param.up = up;
		param.forward = forward;
		param.lookAt = lookAt;
		UnityUtil.toUnity('SetViewpoint', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

	/**
	 * Make all hidden by default objects visible (typically IFC Spaces)
	 * @category Model Interactions
	 */
	public static showHiddenByDefaultObjects() {
		UnityUtil.toUnity('ShowHiddenByDefaultObjects', UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	 * Show progress bar while model is loading
	 * @category Configurations
	 */
	public static showProgressBar() {
		UnityUtil.toUnity('ShowProgressBar', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Hide progress bar while model is loading
	 * @category Configurations
	 */
	public static hideProgressBar() {
		UnityUtil.toUnity('HideProgressBar', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Start rectangular select
	 * @category Object Highlighting
	 */
	public static startAreaSelection() {
		UnityUtil.toUnity('StartRectangularSelect', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Stop rectangular select
	 * @category Object Highlighting
	 */
	public static stopAreaSelection() {
		UnityUtil.toUnity('StopRectangularSelect', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Toggle on/off rendering statistics.
	 * When it is toggled on, list of stats will be displayed in the top left corner of the viewer.
	 * @category Configurations
	 */
	public static toggleStats() {
		UnityUtil.toUnity('ShowStats', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * @hidden
	 * A helper function to split the calls into multiple calls when the array is too large for SendMessage to handle
	 * @return returns a promise which will resolve after the last call chunk is invoked
	 */
	public static multipleCallInChunks(arrLength: number, func:(start: number, end: number) => any, chunkSize = 5000) {
		return new Promise((resolve) => {
			let index = 0;
			while (index < arrLength) {
				const end = index + chunkSize >= arrLength ? undefined : index + chunkSize;
				const i = index; // For the closure
				this.unityOnUpdateActions.push(() => {
					func(i, end);
				});
				index += chunkSize;
			}
			this.unityOnUpdateActions.push(resolve);
		});
	}

	/**
	 * Toggle visibility of the given list of objects
	 * @category Model Interactions
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param ids - list of unique ids to toggle visibility
	 * @param visibility - true = visible, false = invisible
	 * @return returns a promise which will resolve after Unity has invoked its toggleVisibility function
	 */
	public static toggleVisibility(account: string, model: string, ids: [string], visibility: boolean) {
		return UnityUtil.multipleCallInChunks(ids.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = `${account}.${model}`;
			}

			param.ids = ids.slice(start, end);
			param.visible = visibility;
			UnityUtil.toUnity('ToggleVisibility', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * @hidden
	 * Use bounding sphere to determine far plane (instead of bounding box)
	 * Switch this one if you find objects far away from you are being clipped
	 */
	public static useBoundingSphereFarPlaneAlgorithm() {
		UnityUtil.toUnity('UseBoundingSphereFarPlaneAlgorithm', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * @hidden
	 * Use bounding box to determine far plane (instead of bounding sphere)
	 * This is the default algorithm.
	 * You should only need to call this if you have called useBoundingSphereFarPlaneAlgorithm previously.
	 */
	public static useBoundingBoxFarPlaneAlgorithm() {
		UnityUtil.toUnity('UseBoundingBoxFarPlaneAlgorithm', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Update the clipping plane to the given direction
	 * teamspace and model is only needed if the viewpoint is relative to a model
	 * Clipping plane is defined by the plane normal, distance from origin and it's direction
	 * direction = -1 means it will clip anything above the plane, 1 otherwise.
	 * @category Model Interactions
	 * @example UnityUtil.updateClippingPlanes([{normal : [0,-1,0], distance: 10, clipDirection: -1}], false)
	 * @param clipPlane - object containing the clipping plane
	 * @param requireBroadcast - if set to true, A callback to [[viewer]].clipBroadcast will be called after it is set.
	 * @param account - name of teamspace
	 * @param model - name of model
	 */
	public static updateClippingPlanes(clipPlane: any, requireBroadcast: boolean, account?: string, model?: string) {
		const param: any = {};
		param.clip = clipPlane;
		if (account && model) {
			param.nameSpace = `${account}.${model}`;
		}
		if (!clipPlane?.length) {
			UnityUtil.viewer.stopClipEdit();
			UnityUtil.viewer.setClipMode(null);
		}

		param.requiresBroadcast = requireBroadcast;
		UnityUtil.toUnity('UpdateClip', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
	}

	/**
	 * Reset clipping plane
	 * This will also toggle edit mode to false
	 * @category Model Interactions
	 */
	public static disableClippingPlanes() {
		UnityUtil.toUnity('DisableClip', undefined, undefined);
		UnityUtil.viewer.stopClipEdit();
	}

	/**
	 * Zoom to highlighted meshes
	 * @category Model Interactions
	 */
	public static zoomToHighlightedMeshes() {
		UnityUtil.toUnity('ZoomToHighlightedMeshes', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Zoom to a set of objects specified by their Ids
	 * @category Configurations
	 */
	public static zoomToObjects(meshEntries: { entries: Array<{ modelId: string, teamspace: string, meshes: string[] }> }) {
		meshEntries.entries.forEach((entry) => {
			UnityUtil.multipleCallInChunks(entry.meshes.length, (start, end) => {
				const ids = entry.meshes.slice(start, end);
				const params: any = {
					teamspace: entry.teamspace,
					modelId: entry.modelId,
					meshes: ids,
				};
				UnityUtil.toUnity('ZoomToObjectsAppend', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
			});
		});

		this.unityOnUpdateActions.push(() => {
			UnityUtil.toUnity('ZoomToObjectsEnd', UnityUtil.LoadingState.MODEL_LOADED);
		});
	}

	/**
	 * Change the background colour of the viewer
	 * note: alpha defaults to 1 if an array of 3 numbers is sent
	 * @param color - rgba colour value to set to e.g.[1,0,0,1] for solid red.
	 * @category Configurations
	 */
	public static setBackgroundColor(color: number[]) {
		UnityUtil.toUnity('SetBackgroundColor', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({ color }));
	}

	/**
	 * Reset viewer background to default
	 * @category Configurations
	 */
	public static ResetBackground() {
		UnityUtil.toUnity('ResetBackground', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Sets the render quality to default
	 * @category Configurations
	 */
	public static setRenderingQualityDefault() {
		UnityUtil.toUnity('SetRenderingQualityDefault', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Sets the render quality to high
	 * @category Model Interactions
	 */
	public static setRenderingQualityHigh() {
		UnityUtil.toUnity('SetRenderingQualityHigh', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Sets the highlighting to show xray
	 * @category Model Interactions
	 */
	public static setXRayHighlightOn(): any {
		UnityUtil.toUnity('SetXRayHighlightOn', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Sets the highlighting to show xray
	 * @category Model Interactions
	 */
	public static setXRayHighlightOff(): any {
		UnityUtil.toUnity('SetXRayHighlightOff', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Change the colour of the clipping planes border
	 * @category  Model Interactions
	 * @param colour - colour RGB value of the colour to change to. e.g. [1, 0, 0]
	 */
	public static setPlaneBorderColor(color: number[]) {
		UnityUtil.toUnity('SetPlaneBorderColor', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({ color }));
	}

	/**
	 * Change the width of the clipping planes border
	 * @category  Model Interactions
	 * @param width - the width of the clipping plane border
	 */
	public static setPlaneBorderWidth(width: number) {
		// There is an scale factor so the value that the user enters is not small
		UnityUtil.toUnity('SetPlaneBorderWidth', UnityUtil.LoadingState.VIEWER_READY, width * 0.01);
	}

	/**
	 * Sets the navigations interaction on
	 * @category Model Interactions
	 */
	public static setNavigationOn(): any {
		UnityUtil.toUnity('SetNavigationOn', UnityUtil.LoadingState.VIEWER_READY);
	}

	/**
	 * Sets the navigations interaction off
	 * @category Model Interactions
	 */
	public static setNavigationOff(): any {
		UnityUtil.toUnity('SetNavigationOff', UnityUtil.LoadingState.VIEWER_READY);
	}

	/** @hidden */
	public static setResolutionScaling(scale: number) {
		UnityUtil.toUnity('SetResolutionScaling', UnityUtil.LoadingState.VIEWER_READY, scale);
	}

	/** @hidden */
	public static toggleUtilityCamera() {
		UnityUtil.toUnity('ToggleUtilityCamera', UnityUtil.LoadingState.VIEWER_READY);
	}

	/** @hidden */
	public static toggleCameraPause() {
		UnityUtil.toUnity('ToggleCameraPause', UnityUtil.LoadingState.VIEWER_READY);
	}

	/** How many non-trivial jobs the viewer can complete per frame when the
	 * camera isnt moving
	 * @category Configurations
	 * */
	public static setJobsPerFrameStatic(numJobs: number) {
		UnityUtil.toUnity('SetNumStaticJobs', UnityUtil.LoadingState.VIEWER_READY, numJobs);
	}

	/** How many non-trivial jobs the viewer can complete per frame when the
	 * camera is moving
	 * @category Configurations
	 * */
	public static setJobsPerFrameDynamic(numJobs: number) {
		UnityUtil.toUnity('SetNumDynamicJobs', UnityUtil.LoadingState.VIEWER_READY, numJobs);
	}

	/**
	 * Move mesh/meshes by a given transformation matrix.
	 * NOTE: this currently only works as desired in Synchro Scenarios
	 * @category Model Interactions
	 * @param teamspace teamspace of the model
	 * @param modelId modelID the meshes belongs in
	 * @param meshes array of mesh unique IDs
	 * @param matrix array of 16 numbers, representing the transformation on the meshes (row major)
	 * @return returns a promise which will resolve after Unity has invoked its moveMeshes function
	 */
	public static moveMeshes(teamspace: string, modelId: string, meshes: string[], matrix: number[]) {
		UnityUtil.instance.moveMeshes(teamspace, modelId, meshes, matrix);
	}

	/**
	 * Move mesh/meshes by a given transformation matrix.
	 * NOTE: this currently only works as desired in Synchro Scenarios
	 * @category Model Interactions
	 * @param teamspace teamspace of the model
	 * @param modelId modelID the meshes belongs in
	 * @param meshes array of mesh unique IDs
	 * @return returns a promise which will resolve after Unity has invoked its resetMovedMeshes function
	 */
	public static resetMovedMeshes(teamspace: string, modelId: string, meshes: string[]) {
		return UnityUtil.multipleCallInChunks(meshes.length, (start, end) => {
			const param: any = {
				nameSpace: `${teamspace}.${modelId}`,
				meshes: meshes.slice(start, end),
			};
			UnityUtil.toUnity('ResetMovedMeshes', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * Sets and enables the active Calibration Mode. There is no need to explicitly enable or disable the Calibration Tool.
	 * Enabling Vertical Mode will store the current clip planes, and disabling it will restore them - the frontend must
	 * disable the Clip Tool itself however.
	 * @category Calibration
	 * @param mode A string, ["Vector", "Vertical", "None"].
	 */
	public static setCalibrationToolMode(mode: string) {
		UnityUtil.toUnity('SetCalibrationToolMode', UnityUtil.LoadingState.VIEWER_READY, mode);
	}

	/**
	 * Activates the Gizmo for the specified vertical plane, or none, if a valid plane is not given.
	 * @category Calibration
	 */
	public static selectCalibrationToolVerticalPlane(plane: 'upper' | 'lower' | undefined) {
		if (plane) {
			UnityUtil.toUnity('SelectCalibrationToolVerticalPlane', UnityUtil.LoadingState.VIEWER_READY, plane);
		} else {
			UnityUtil.toUnity('SelectCalibrationToolVerticalPlane', UnityUtil.LoadingState.VIEWER_READY, 'none'); // (Don't try to call sendMessage with null)
		}
	}

	/**
	 * Sets the lower and upper range of the vertical planes (the floor) in Project coordinates.
	 * This does not change the default floor height even if the magnitude of the range is different.
	 * @category Calibration
	 */
	public static setCalibrationToolVerticalPlanes(min: number, max: number) {
		var range = {
			min,
			max,
		};
		UnityUtil.toUnity('SetCalibrationToolVerticalPlanes', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(range));
	}

	/**
	 * Aligns the Lower floor plane to the top of the specified mesh, and the Upper floor plane to the default floor height above this.
	 * The interactive state of the planes is unchanged.
	 * @category Calibration
	 */
	public static setCalibrationToolFloorToObject(teamspace: string, modelid: string, meshid: string) {
		var parms = {
			teamspace: teamspace,
			modelId: modelid,
			meshes: [ meshid ],
		};
		UnityUtil.toUnity('SetCalibrationToolFloorToObject', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(parms));
	}

	/**
	 * Sets the default height of the floor used when calling setCalibrationToolFloorToObject, in meters.
	 * @category Calibration
	 */
	public static setCalibrationToolFloorHeight(height: number) {
		UnityUtil.toUnity('SetCalibrationToolFloorHeight', UnityUtil.LoadingState.VIEWER_READY, height);
	}

	/**
	 * Sets or removes the Start and End of the Calibration Vector. If Start or End are set to null, the tool
	 * will immediately allow the user to place them again. Vector Mode must be explicitly enabled - calling
	 * this will not automatically enable the tool.
	 * @category Calibration
	 */
	public static setCalibrationToolVector(start: number[] | null, end: number[] | null) {
		UnityUtil.toUnity('SetCalibrationToolVector', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({ start, end }));
	}

	/**
	 * Sets the colour scheme of the image preview plane, for the specific level. All three colours should be
	 * provided as HTML colour strings (see: https://docs.unity3d.com/ScriptReference/ColorUtility.TryParseHtmlString.html)
	 *  fill is the tint applied to the image, including the background.
	 *  border is the colour of the border around the image.
	 *  drawing is the tint applied to the image, before the background.
	 *
	 * All three arguments support alpha values. For example, setting drawing to #00000000 and fill to #ff000008 would
	 * result in a purely red plane with an alpha value of 0.5 compared to the geometry.
	 *
	 * @category Calibration
	 */
	public static setCalibrationToolVerticalPlaneColours(plane: 'lower' | 'upper', fill: string, border: string, drawing: string) {
		UnityUtil.toUnity('SetCalibrationToolVerticalPlaneColours', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({ plane, fill, border, drawing }));

	}

	/**
	 * Sets the additional transparency that is applied, as a multiplier, to the image tint colour set by
	 * setCalibrationToolSelectedColors or setCalibrationToolUnselectedColors when part of the preview
	 * plane is obscured by model geometry. This should be between 0 and 1.
	 * @category Calibration
	 */
	public static setCalibrationToolOcclusionOpacity(opacity: number) {
		UnityUtil.toUnity('SetCalibrationToolOcclusionOpacity', UnityUtil.LoadingState.VIEWER_READY, opacity);
	}

	/**
	 * Shows the DrawingImageSource for the Lower and Upper vertical planes at the horizontal location specified by rect.
	 * rect should be the size and location of the image, given as the location of three corners (bottomLeft, bottomRight,
	 * topLeft) in Project coordinates. The height will be taken from the current state of the Vertical Planes. If image is
	 * null, the location of the existing image is updated. If no image has ever been loaded, a white rectangle is shown in
	 * its place.
	 * @category Calibration
	 */
	public static setCalibrationToolDrawing(image: DrawingImageSource, rect: number[]) {
		UnityUtil.instance.createTexturedPlane(image);
	}

	/**
	 * Populates the provided WebGLTexture texture with the contents of the DrawingImageSource indexed by id.
	 * (This method could be moved entirely inside Unity if desired in the future.)
	 * @param ctx The rendering context used by Module
	 * @param id The index of the DrawingImageSource in domTextureReferences. This will be removed from domTextureReferences.
	 * @param texture The WebGLTexture created by Unity
	 */
	/** @hidden */
	public static copyToWebGLTexture(ctx: WebGL2RenderingContext, index: number, texture: WebGLTexture) {
		ctx.bindTexture(ctx.TEXTURE_2D, texture);
		const image = this.domTextureReferences[index];
		ctx.texSubImage2D(ctx.TEXTURE_2D, 0, 0, 0, image.width, image.height, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
		delete this.domTextureReferences[index];
	}

	/**
	 * Sets the maximum number of responses WebRequestManager2 should attempt to
	 * handle at any one time. The higher this is the faster models will load but
	 * the more working memory is required. The default value is 5.
	 * @category Configurations
	 */
	public static setMaxConcurrentResponses(max: number) {
		UnityUtil.toUnity('SetMaxNumResponses', UnityUtil.LoadingState.VIEWER_READY, max);
	}

	/**
	 * Creates the WebRequestHandler backend for the WebRequestHandler2 Component in Unity
	 * @hidden
	 */
	public static createWebRequestHandler(gameObjectName: string) {
		return this.externalWebRequestHandler && this.externalWebRequestHandler.setUnityInstance(this.instance, gameObjectName);
	}
}
