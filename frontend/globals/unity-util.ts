/*
* Copyright (C) 2017 3D Repo Ltd
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
declare var SendMessage;
declare var createUnityInstance;

import { IS_FIREFOX } from '../helpers/browser';

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
	 * 		numClipPlanesUpdated = (nPlanes) => console.log(\`Current no. planes: ${nPlanes}\`}
	 */
	public static viewer: any;

	/** @hidden */
	public static LoadingState = {
		VIEWER_READY : 1, // Viewer has been loaded
		MODEL_LOADING : 2, // model information has been fetched, world offset determined, model starts loading
		MODEL_LOADED : 3 // Models
	};

	/** @hidden */
	public static unityInstance;

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
	public static initialLoad = true;

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

	/**
	* Initialise Unity.
	* @category Configurations
	* @param errorCallback - function to call when an error occurs.
	* 						 This function should take a string(message), boolean(requires reload), boolean(came from unity).
	* @param progressCallback
	* @param modelLoaderProgressCallback
	*/
	public static init(errorCallback: any, progressCallback: any, modelLoaderProgressCallback: any) {
		UnityUtil.errorCallback = errorCallback;
		UnityUtil.progressCallback = progressCallback;
		UnityUtil.modelLoaderProgressCallback = modelLoaderProgressCallback;
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
	 * Launch the Unity Game.
 	 * @category Configurations
	 * @param canvas - the html dom of the unity canvas
	 * @param host - host server URL (e.g. https://www.3drepo.io)
	 * @return returns a promise which resolves when the game is loaded.
	 *
	 */
	public static loadUnity(canvas: any, host): Promise<void> {
		let canvasDom = canvas;
		let domainURL = host;
		if (Object.prototype.toString.call(canvas) === '[object String]') {
			// The user is calling it like Unity 2019. Convert it to a dom an create a canvas
			// tslint:disable-next-line
			console.warn('[DEPRECATED WARNING] loadUnity() no longer takes in a string and a URL to the unity config. Please check the API documentation and update your function.');
			const divDom = document.getElementById(canvas);
			canvasDom = document.createElement('canvas');
			canvasDom.id = 'unity';
			divDom.appendChild(canvasDom);

			if (host) {
				// Old schema asks for a json file location, we now take the domain url
				// and generate the object at run time.
				domainURL = host.match('^https?:\/\/[^\/]+');
			}
		}

		return UnityUtil._loadUnity(canvasDom, domainURL);

	}

	/** @hidden */
	public static _loadUnity(canvas: any, unityURL): Promise<void> {

		if (!window.Module) {
			// Add withCredentials to XMLHttpRequest prototype to allow unity game to
			// do CORS request. We used to do this with a .jspre on the unity side but it's no longer supported
			// as of Unity 2019.1
			(XMLHttpRequest.prototype as any).originalOpen = XMLHttpRequest.prototype.open;
			const newOpen = function(_, url) {
				const original = this.originalOpen.apply(this, arguments);
				this.withCredentials = true;
				return original;
			};
			XMLHttpRequest.prototype.open = newOpen;
		}

		const buildUrl = `${unityURL ? unityURL + '/' : ''}unity/Build`;

		const config = {
			dataUrl: buildUrl + '/unity.data.unityweb',
			frameworkUrl: buildUrl + '/unity.framework.js.unityweb',
			codeUrl: buildUrl + '/unity.wasm.unityweb',
			streamingAssetsUrl: 'StreamingAssets',
			companyName: '3D Repo Ltd',
			productName: '3D Repo Unity',
			productVersion: '1.0',
			errorHandler: (e, t, n) => {
				// This member is not part of the documented API, but the current version of loader.js checks for it
				UnityUtil.onUnityError(e);
				return true; // Returning true suppresses loader.js' alert call
			}
		};

		createUnityInstance(canvas, config, (progress) => {
			this.onProgress(progress);
		}).then((unityInstance) => {
			UnityUtil.unityInstance = unityInstance;
		}).catch(UnityUtil.onUnityError);

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
		UnityUtil.unityInstance.Quit();
	}

	/**
	 * @hidden
	 * @category To Unity
	 * Cancels any model that is currently loading. This will reject any model promises with "cancel" as the message
	 */
	public static cancelLoadModel() {
		if (UnityUtil.initialLoad) {
			return;
		}

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
			'Unity', 'unity', 'emscripten', 'blob:http'
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
					If you are unable to resolve this problem, please contact support@3drepo.org referencing the above error.
					<br><md-container>`;
		} else {
			conf = `Something went wrong :( <br><br> <code>${message}</code><br><br>
				If you are unable to resolve this problem, please contact support@3drepo.org referencing the above error
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
				UnityUtil.loadedResolve = {resolve, reject};
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
				UnityUtil.loadingResolve = {resolve, reject};
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
			UnityUtil.readyPromise	= new Promise((resolve, reject) => {
				UnityUtil.readyResolve = {resolve, reject};
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

	/** @hidden*/
	public static toUnity(methodName, requireStatus?, params?) {
		if (requireStatus === UnityUtil.LoadingState.MODEL_LOADED) {
			// Requires model to be loaded
			UnityUtil.onLoaded().then(() => {
				if (UnityUtil.unityInstance) {
					UnityUtil.unityInstance.SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
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
				if (UnityUtil.unityInstance) {
					UnityUtil.unityInstance.SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
				}
			}).catch((error) => {
				if (error !== 'cancel') {
					UnityUtil.userAlert(error, true, true);
					console.error('UnityUtil.onLoading() failed: ', error);
				}
			});
		} else {
			UnityUtil.onReady().then(() => {
				if (UnityUtil.unityInstance) {
					UnityUtil.unityInstance.SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
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
		if (UnityUtil.viewer && UnityUtil.viewer.clipBroadcast) {
			UnityUtil.viewer.clipBroadcast(JSON.parse(clipInfo));
		}
	}

	/** @hidden */
	public static clipUpdated(nPlanes) {
		if (UnityUtil.viewer && UnityUtil.viewer.numClipPlanesUpdated) {
			UnityUtil.viewer.numClipPlanesUpdated(nPlanes);
		}
	}

	/** @hidden */
	public static currentPointInfo(pointInfo) {
		const point = JSON.parse(pointInfo);
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
		// tslint:disable-next-line
		console.log(`[${new Date()}]Loading model done. `);
		const res = {
			bbox: JSON.parse(bboxStr)
		};
		UnityUtil.loadedResolve.resolve(res);
		UnityUtil.loadedFlag = true;
		UnityUtil.initialLoad = false;
	}

	/** @hidden */
	public static loading(bboxStr) {
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
		if (UnityUtil.viewer && UnityUtil.viewer.navMethodChanged) {
			UnityUtil.viewer.navMethodChanged(newNavMode);
		}
	}

	/** @hidden */
	public static objectsSelectedAlert(nodeInfo) {
		UnityUtil.viewer.objectsSelected(JSON.parse(nodeInfo).nodes);
	}

	/** @hidden */
	public static objectStatusBroadcast(nodeInfo) {
		try {
			UnityUtil.objectStatusPromises.forEach((promise) => {
				promise.resolve(JSON.parse(nodeInfo));
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
		if (UnityUtil.viewer && UnityUtil.viewer.pickPointEvent) {
			UnityUtil.viewer.pickPointEvent(point);
		}
	}

	/** @hidden */
	public static screenshotReady(screenshot) {
		try {
			const ssJSON = JSON.parse(screenshot);

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
			if (UnityUtil.viewer && UnityUtil.viewer.measurementAlertEvent) {
				UnityUtil.viewer.measurementAlertEvent(measurement);
			}
		} catch (error) {
			console.error('Failed to parse measurement alert', strMeasurement);
		}
	}

	/** @hidden */
	public static measurementRemoved(measurmentId) {
		if (UnityUtil.viewer && UnityUtil.viewer.measurementRemoved) {
			UnityUtil.viewer.measurementRemoved(measurmentId);
		}
	}

	/** @hidden */
	public static measurementsCleared() {
		if (UnityUtil.viewer && UnityUtil.viewer.measurementsCleared) {
			UnityUtil.viewer.measurementsCleared();
		}
	}

	/*
	 * =============== TO UNITY ====================
	 */

	/**
	 * Move the pivot point to eh centre of the objects provided
	 * @category Navigations
	 * @param meshIDs - array of json objects each recording { model: <account.modelID>, meshID: [array of mesh IDs] }
	 */
	public static centreToPoint(meshIDs: [object]) {
		const params = {
			groups: meshIDs
		};
		UnityUtil.toUnity('CentreToObject', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	/**
	 * Change the colour of an existing pin
	 * @category Pins
	 * @param id - ID of the pin
	 * @param colour - colour RGB value of the colour to change to. e.g. [1, 0, 0]
	 */
	public static changePinColour(id: string, colour: number[]) {
		const params = {
			color : colour,
			pinName : id
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
			database : account,
			model
		};

		if (revision !== 'head') {
			params.revID = revision;
		}
		UnityUtil.toUnity('DiffToolLoadComparator', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));

		if (!UnityUtil.loadComparatorPromise) {
			UnityUtil.loadComparatorPromise = new Promise((resolve, reject) => {
				UnityUtil.loadComparatorResolve = {resolve, reject};
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
			database : account,
			model
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
	 * "SurfaceArea" or "PolygonArea".
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
	 * Clear all measurements
	 * @category Measuring tool
	 */
	public static clearAllMeasurements() {
		UnityUtil.toUnity('ClearMeasureToolMeasurements', undefined, undefined);
	}

	/**
	 * Remove a particular measurement.
	 * @param uuid - The measurement id of the measurement to be removed
	 */
	public static clearMeasureToolMeasurement(uuid) {
		UnityUtil.toUnity('ClearMeasureToolMeasurement', undefined, uuid);
	}

	/**
	 * Set color of a particular measurement.
	 * @param uuid - The measurement id of the measurement that will change color
	 */
	public static setMeasureToolMeasurementColor(uuid, color) {
		UnityUtil.toUnity('SetMeasureToolMeasurementColor', undefined, JSON.stringify({uuid, color}));
	}

	/**
	 * Set color of a particular measurement.
	 * @param uuid - The measurement id of the measurement that will change name
	 */
	public static setMeasureToolMeasurementName(uuid, name) {
		UnityUtil.toUnity('SetMeasureToolMeasurementName', undefined, JSON.stringify({uuid, name}));
	}

	/**
	 * Enable measure display mode to xyz.
	 * @category Measuring tool
	 */
	public static enableMeasureToolXYZDisplay() {
		UnityUtil.toUnity('EnableMeasureToolXYZDisplay');
	}

	/**
	 * Disnable measure display mode to xyz.
	 * @category Measuring tool
	 */
	public static disableMeasureToolXYZDisplay() {
		UnityUtil.toUnity('DisableMeasureToolXYZDisplay');
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
			color : colour
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
			color : colour
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
			color : colour
		};
		UnityUtil.toUnity('DropBookmarkPin', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	public static selectPin(id: string) {
		UnityUtil.toUnity('SelectPin', UnityUtil.LoadingState.MODEL_LOADING, id);
	}

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
	public static enableCaching() {
		UnityUtil.toUnity('EnableCaching', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Disable model caching
 	 * @category Configurations
	 */
	public static disableCaching() {
		UnityUtil.toUnity('DisableCaching', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Set the number of simultaneously threads for cache access
 	 * @category Configurations
	 */
	public static setNumCacheThreads(thread) {
		UnityUtil.toUnity('SetSimultaneousCacheAccess', UnityUtil.LoadingState.VIEWER_READY, thread);
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
	 * 				Also any objects that are already highlighted will be unhighlighted
	 * @param forceReHighlight - If set to true, existing highlighted objects will be forced
	 * 					to re-highlight itself. This is typically used for re-colouring a highlight ]
	 * 					or when you want a specific set of objects to stay highlighted when toggle mode is on
	 */
	public static highlightObjects(
		account: string,
		model: string,
		idArr: [string],
		color: [number],
		toggleMode: boolean,
		forceReHighlight: boolean
	) {
		UnityUtil.multipleCallInChunks(idArr.length, (start, end) => {
			const arr = idArr.slice(start, end);
			const params: any = {
				database : account,
				model,
				ids : arr,
				toggle : toggleMode,
				forceReHighlight,
				color: color ? color : UnityUtil.defaultHighlightColor
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
	 */
	public static unhighlightObjects(account: string, model: string, idArr: [string]) {
		UnityUtil.multipleCallInChunks(idArr.length, (start, end) => {
			const arr = idArr.slice(start, end);
			const params: any = {
				database : account,
				model,
				ids : idArr
			};

			UnityUtil.toUnity('UnhighlightObjects', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
		});
	}

	public static pauseRendering() {
		UnityUtil.toUnity('PauseRendering', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

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
	public static loadModel(
		account: string,
		model: string,
		branch = '',
		revision = 'head',
		initView = null,
		clearCanvas = true
	): Promise<void> {
		if (clearCanvas) {
			UnityUtil.reset(!initView);
		}
		const params: any = {
			database : account,
			model
		};

		if (revision !== 'head') {
			params.revID = revision;
		}

		if (initView) {
			params.initView = initView;
		}
		UnityUtil.onLoaded();
		// tslint:disable-next-line
		console.log(`[${new Date()}]Loading model: `, params);
		UnityUtil.toUnity('LoadModel', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));

		return UnityUtil.onLoading();
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
	 */
	public static overrideMeshColor(account: string, model: string, meshIDs: [string], color: [number]) {
		UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = account + '.' + model;
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
	 */
	public static resetMeshColor(account: string, model: string, meshIDs: [string]) {
		UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = account + '.' + model;
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
	 */
	public static overrideMeshOpacity(account: string, model: string, meshIDs: [string], opacity: number) {
		UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = account + '.' + model;
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
	 */
	public static resetMeshOpacity(account: string, model: string, meshIDs: [string]) {
		UnityUtil.multipleCallInChunks(meshIDs.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = account + '.' + model;
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
		UnityUtil.initialLoad = true;

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
		UnityUtil.toUnity('ResetCamera', UnityUtil.LoadingState.VIEWER_READY, undefined);
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
			this.screenshotPromises.push({ resolve, reject});
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
	public static requestViewpoint(account: string, model: string): Promise<object> {
		const newViewpointPromise = new Promise((resolve, reject) => {
			this.viewpointsPromises.push({ resolve, reject });
		});

		const param: any = {};
		if (account && model) {
			param.namespace = account + '.' + model;
		}

		UnityUtil.toUnity('RequestViewpoint', UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));

		return newViewpointPromise as Promise<object>;
	}

	/**
	 * Set API host urls. This is needs to be called before loading model.
	 * @category Configurations
	 * @param hostname - list of API names to use. (e.g ["https://api1.www.3drepo.io/api/"])
	 */
	public static setAPIHost(hostname: [string]) {
		UnityUtil.toUnity('SetAPIHost', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(hostname));
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
	 */
	public static useOrthographicProjection() {
		UnityUtil.toUnity('UseOrthographicProjection', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	/**
	 * Use perspective view
	 */
	public static usePerspectiveProjection() {
		UnityUtil.toUnity('UsePerspectiveProjection', UnityUtil.LoadingState.MODEL_LOADING, undefined);
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
	 */
	public static setViewpoint(
		pos: [number],
		up: [number],
		forward: [number],
		lookAt: [number],
		projectionType?: boolean,
		orthographicSize?: number,
		account?: string,
		model?: string
	) {
		const param: any = {};
		if (account && model) {
			param.nameSpace = account + '.' + model;
		}

		if (projectionType) {
			param.type = projectionType;
		}

		if (orthographicSize) {
			param.orthographicSize = orthographicSize;
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
	 */
	public static showProgressBar() {
		UnityUtil.toUnity('ShowProgressBar', UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	/**
	 * Hide progress bar while model is loading
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
	 */
	public static multipleCallInChunks(arrLength: number, func: (start: number, end: number) => any, chunkSize = 20000) {
		let index = 0;
		while (index < arrLength) {
			const end = index + chunkSize >= arrLength ? undefined : index + chunkSize;
			func(index, end);
			index += chunkSize;
		}
	}

	/**
	 * Toggle visibility of the given list of objects
	 * @category Model Interactions
	 * @param account - name of teamspace
	 * @param model - name of model
	 * @param ids - list of unique ids to toggle visibility
	 * @param visibility - true = visible, false = invisible
	 */
	public static toggleVisibility(account: string, model: string, ids: [string], visibility: boolean) {
		UnityUtil.multipleCallInChunks(ids.length, (start, end) => {
			const param: any = {};
			if (account && model) {
				param.nameSpace = account + '.' + model;
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
	public static updateClippingPlanes(clipPlane: object, requireBroadcast: boolean, account?: string, model?: string) {
		const param: any = {};
		param.clip = clipPlane;
		if (account && model) {
			param.nameSpace = account + '.' + model;
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
	}

	/**
	 * Zoom to highlighted meshes
	 * @category Model Interactions
	 */
	public static zoomToHighlightedMeshes() {
		UnityUtil.toUnity('ZoomToHighlightedMeshes', UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	public static zoomToObjects(meshEntries: object[]) {
		UnityUtil.toUnity('ZoomToObjects', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(meshEntries));
	}

	/**
	 * Change the background colour of the viewer
	 * note: alpha defaults to 1 if an array of 3 numbers is sent
	 * @param color - rgba colour value to set to e.g.[1,0,0,1] for solid red.
	 * @category Configurations
	 */
	public static setBackgroundColor(color: number[]) {
		UnityUtil.toUnity('SetBackgroundColor', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({color}));
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
		UnityUtil.toUnity('SetPlaneBorderColor', UnityUtil.LoadingState.VIEWER_READY, JSON.stringify({color}));
	}

	/**
	 * Change the width of the clipping planes border
	 * @category  Model Interactions
	 * @param width - the width of the clipping plane border
	 */
	public static setPlaneBorderWidth(width: number) {
		// There is an scale factor so the value that the user enters is not small
		UnityUtil.toUnity('SetPlaneBorderWidth', UnityUtil.LoadingState.VIEWER_READY, width *	0.01);
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

	/**
	 * Move mesh/meshes by a given transformation matrix.
	 * NOTE: this currently only works as desired in Synchro Scenarios
	 * @category Model Interactions
	 * @param teamspace teamspace of the model
	 * @param modelId modelID the meshes belongs in
	 * @param meshes array of mesh unique IDs
	 * @param matrix array of 16 numbers, representing the transformation on the meshes (row major)
	 */
	public static moveMeshes(teamspace: string, modelId: string, meshes: string[], matrix: number[]) {
		UnityUtil.multipleCallInChunks(meshes.length, (start, end) => {
			const param: any = {
				nameSpace : teamspace + '.' + modelId,
				meshes: meshes.slice(start, end),
				matrix
			};
			UnityUtil.toUnity('MoveMeshes', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

	/**
	 * Move mesh/meshes by a given transformation matrix.
	 * NOTE: this currently only works as desired in Synchro Scenarios
	 * @category Model Interactions
	 * @param teamspace teamspace of the model
	 * @param modelId modelID the meshes belongs in
	 * @param meshes array of mesh unique IDs
	 */
	public static resetMovedMeshes(teamspace: string, modelId: string, meshes: string[]) {
		UnityUtil.multipleCallInChunks(meshes.length, (start, end) => {
			const param: any = {
				nameSpace : teamspace + '.' + modelId,
				meshes: meshes.slice(start, end),
			};
			UnityUtil.toUnity('ResetMovedMeshes', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
		});
	}

}
