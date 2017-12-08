/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/
declare var Module;
declare var SendMessage;

export class UnityUtil {

	public static errorCallback: any;
	public static viewer: any;

	public static LoadingState = {
		VIEWER_READY : 1,  // Viewer has been loaded
		MODEL_LOADING : 2, // model information has been fetched, world offset determined, model starts loading
		MODEL_LOADED : 3, // Models
	};

	public static readyPromise;
	public static readyResolve;

	public static loadedPromise;
	public static loadedResolve;

	public static loadingPromise;
	public static loadingResolve;

	//Diff
	public static loadComparatorResolve;
	public static loadComparatorPromise;

	public static unityHasErrored = false;

	public static screenshotPromises = [];
	public static vpPromise = null;
	public static objectStatusPromise = null;
	public static loadedFlag = false;
	public static UNITY_GAME_OBJECT = "WebGLInterface";

	public static SendMessage_vss;
	public static SendMessage_vssn;
	public static SendMessage_vsss;

	public static init(
		errorCallback: any,
	) {
		errorCallback = errorCallback;
	}

	public static _SendMessage(gameObject, func, param) {

		if (param === undefined) {

			if (!UnityUtil.SendMessage_vss) {
				UnityUtil.SendMessage_vss = Module.cwrap("SendMessage", "void", ["string", "string"]);
			}
			UnityUtil.SendMessage_vss(gameObject, func);

		} else if (typeof param === "string") {

			if (!UnityUtil.SendMessage_vsss) {
				UnityUtil.SendMessage_vsss = Module.cwrap("SendMessageString", "void", ["string", "string", "string"]);
			}
			UnityUtil.SendMessage_vsss(gameObject, func, param);

		} else if (typeof param === "number") {

			if (!UnityUtil.SendMessage_vssn) {
				UnityUtil.SendMessage_vssn = Module.cwrap("SendMessageFloat", "void", ["string", "string", "number"]);
			}
			UnityUtil.SendMessage_vssn(gameObject, func, param);

		} else {
			throw new Error("" + param + " is does not have a type which is supported by SendMessage.");
		}
	}

	public static onUnityError(err, url, line) {
		const conf = `Your browser has failed to load 3D Repo. This may due to insufficient memory.
					Please ensure you are using a 64bit web browser (Chrome or FireFox for best results),
					reduce your memory usage and try again.
					If you are unable to resolve this problem, please contact support@3drepo.org referencing the following:
					<br><br> <code>Error ${err} occured at line ${line}
					</code> <br><br> Click ok to refresh this page. <md-container>`;

		let reload = false;
		if (err.indexOf("Array buffer allocation failed") !== -1 ||
			err.indexOf("Unity") !== -1 || err.indexOf("unity") !== -1) {
			reload = true;
		}

		UnityUtil.userAlert(conf, reload);

		return true;
	}

	public static onLoaded() {
		if (!UnityUtil.loadedPromise) {
			UnityUtil.loadedPromise = new Promise((resolve, reject) => {
				UnityUtil.loadedResolve = {resolve, reject};
			});
		}
		return UnityUtil.loadedPromise;

	}

	public static onLoading() {
		if (!UnityUtil.loadingPromise) {
			UnityUtil.loadingPromise = new Promise((resolve, reject) => {
				UnityUtil.loadingResolve = {resolve, reject};
			});
		}
		return UnityUtil.loadingPromise;

	}

	public static onReady() {

		if (!UnityUtil.readyPromise) {
			UnityUtil.readyPromise	= new Promise((resolve, reject) => {
				UnityUtil.readyResolve = {resolve, reject};
			});
		}

		return UnityUtil.readyPromise;

	}

	public static userAlert(message, reload) {

		const prefix = "" + "Unity Error: ";

		const fullMessage = prefix + message;

		if (!UnityUtil.unityHasErrored) {

			// Unity can error multiple times, we don't want
			// to keep annoying the user
			UnityUtil.unityHasErrored = true;
			UnityUtil.errorCallback({
				message : fullMessage,
				reload,
			});
		}

	}

	public static toUnity(methodName, requireStatus, params) {

		console.log(methodName, requireStatus, params);

		if (requireStatus === UnityUtil.LoadingState.MODEL_LOADED) {
			// Requires model to be loaded
			UnityUtil.onLoaded().then(() => {
				SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
			}).catch((error) => {
				if (error !== "cancel") {
					console.error("UnityUtil.onLoaded() failed: ", error);
					UnityUtil.userAlert(error, true);
				}
			});
		} else if (requireStatus === UnityUtil.LoadingState.MODEL_LOADING) {
			// Requires model to be loading
			UnityUtil.onLoading().then(() => {
				SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
			}).catch((error) => {
				if (error !== "cancel") {
					UnityUtil.userAlert(error, true);
					console.error("UnityUtil.onLoading() failed: ", error);
				}
			});
		} else {
			UnityUtil.onReady().then(() => {
				SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
			}).catch((error) => {
				if (error !== "cancel") {
					UnityUtil.userAlert(error, true);
					console.error("UnityUtil.onReady() failed: ", error);
				}
			});
		}

	}

	/*
	 * =============== FROM UNITY ====================
	 */

	public static clipBroadcast(clipInfo) {
		if (UnityUtil.viewer.clipBroadcast) {
			UnityUtil.viewer.clipBroadcast(JSON.parse(clipInfo));
		}
	}

	public static currentPointInfo(pointInfo) {
		const point = JSON.parse(pointInfo);
		if (UnityUtil.viewer.objectSelected) {
			UnityUtil.viewer.objectSelected(point);
		}
	}

	public static comparatorLoaded() {
		console.log("comparatorLoaded - resolve")
		UnityUtil.loadComparatorResolve.resolve();
		UnityUtil.loadComparatorPromise = null;
		UnityUtil.loadComparatorResolve = null;
	}

	public static loaded(bboxStr) {
		const res = {
			bbox: JSON.parse(bboxStr),
		};
		UnityUtil.loadedResolve.resolve(res);
		UnityUtil.loadedFlag = true;
	}

	public static loading(bboxStr) {
		UnityUtil.loadingResolve.resolve();
	}

	public static objectStatusBroadcast(nodeInfo) {
		UnityUtil.objectStatusPromise.resolve(JSON.parse(nodeInfo));
		UnityUtil.objectStatusPromise = null;
	}

	public static ready() {
		// Overwrite the Send Message function to make it run quicker
		// This shouldn't need to be done in the future when the
		// readyoptimisation in added into unity.
		SendMessage = UnityUtil._SendMessage;
		UnityUtil.readyResolve.resolve();
	}

	public static pickPointAlert(pointInfo) {
		const point = JSON.parse(pointInfo);
		if (UnityUtil.viewer.pickPointEvent) {
			UnityUtil.viewer.pickPointEvent(point);
		}
	}

	public static screenshotReady(screenshot) {
		const ssJSON = JSON.parse(screenshot);

		UnityUtil.screenshotPromises.forEach((promise) => {
			promise.resolve(ssJSON.ssBytes);
		});

		UnityUtil.screenshotPromises = [];
	}

	public static viewpointReturned(vpInfo) {
		if (UnityUtil.vpPromise != null) {
			const viewpoint = JSON.parse(vpInfo);
			UnityUtil.vpPromise.resolve(viewpoint);
			UnityUtil.vpPromise = null;
		}
	}

	/*
	 * =============== TO UNITY ====================
	 */

	public static centreToPoint(model, id) {
		const params = {
			model,
			meshID: id,
		};
		UnityUtil.toUnity("CentreToObject", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	public static changePinColour(id, colour) {
		const params =  {
			color : colour,
			pinName : id,
		};

		UnityUtil.toUnity("ChangePinColor", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	public static clearHighlights() {
		UnityUtil.toUnity("ClearHighlighting", UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	* Visualise the difference view
	* i.e. models will be rendered in greyscale, detailing the difference/clash
	*/
	public static diffToolDiffView() {
		UnityUtil.toUnity("DiffToolShowDiff", undefined, undefined);
	}

	/**
	* Disable diff tool
	* This also unloads the comparator models
	*/
	public static diffToolDisableAndClear() {
		UnityUtil.toUnity("DiffToolDisable", UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	* Enable diff tool
	* This starts the diff tool in diff mode
	*/
	public static diffToolEnableWithDiffMode() {
		UnityUtil.toUnity("DiffToolStartDiffMode", UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	* Enable diff tool
	* This starts the diff tool in clash mode
	*/
	public static diffToolEnableWithClashMode() {
		UnityUtil.toUnity("DiffToolStartClashMode", UnityUtil.LoadingState.MODEL_LOADED, undefined);
	}

	/**
	 * Load comparator model for diff tool
	 * This returns a promise which will be resolved when the comparator model is loaded
	 */
	public static diffToolLoadComparator(account, model, revision) {

		const params: any = {
			database : account,
			model,
		};

		if (revision !== "head") {
			params.revID = revision;
		}
		UnityUtil.toUnity("DiffToolLoadComparator", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));

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
	 */
	public static diffToolSetAsComparator(account, model) {
		const params: any = {
			database : account,
			model,
		};
		UnityUtil.toUnity("DiffToolAssignAsComparator", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));

	}

	/**
	* Only show the comparator model
	* i.e. Only show the model you are trying to compare with, not the base model
	*/
	public static diffToolShowComparatorModel() {
		UnityUtil.toUnity("DiffToolShowComparatorModel", undefined, undefined);
	}

	/**
	* Only show the base model
	* i.e. It will show only the original model, not the comparator nor the diff view
	*/
	public static diffToolShowBaseModel() {
		UnityUtil.toUnity("DiffToolShowBaseModel", undefined, undefined);
	}

	/**
	* Compare transparent objects as if they are opaque objects
	*/
	public static diffToolRenderTransAsOpaque() {
		UnityUtil.toUnity("DiffToolRenderTransAsOpaque", undefined, undefined);
	}

	/**
	* Ignore semi-transparent objects in diff
	*/
	public static diffToolRenderTransAsInvisible() {
		UnityUtil.toUnity("DiffToolRenderTransAsInvisible", undefined, undefined);
	}

	/**
	* Compare transparent objects as of normal
	*/
	public static diffToolRenderTransAsDefault() {
		UnityUtil.toUnity("DiffToolRenderTransAsDefault", undefined, undefined);
	}

	public static disableClippingPlanes() {
		UnityUtil.toUnity("DisableClip", undefined, undefined);
	}

	public static disableMeasuringTool() {
		UnityUtil.toUnity("StopMeasuringTool", UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	public static dropPin(id, position, normal, colour) {
		const params = {
			id,
			position,
			normal,
			color : colour,
		};
		UnityUtil.toUnity("DropPin", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	public static enableMeasuringTool() {
		UnityUtil.toUnity("StartMeasuringTool", UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}

	public static getObjectsStatus(account, model, promise) {
		let nameSpace = "";
		if (account && model) {
			nameSpace = account + "." + model;
		}
		if (UnityUtil.objectStatusPromise) {
			UnityUtil.objectStatusPromise.then(() => {
				UnityUtil._getObjectsStatus(nameSpace, promise);
			});
		} else {
			UnityUtil._getObjectsStatus(nameSpace, promise);
		}
	}

	public static _getObjectsStatus(nameSpace, promise) {
		UnityUtil.objectStatusPromise = promise;
		UnityUtil.toUnity("GetObjectsStatus", UnityUtil.LoadingState.MODEL_LOADED, nameSpace);
	}

	public static getPointInfo() {
		UnityUtil.toUnity("GetPointInfo", false, 0);
	}

	public static highlightObjects(account, model, idArr, color, toggleMode) {
		const params: any = {
			database : account,
			model,
			ids : idArr,
			toggle : toggleMode,
		};

		if (color) {
			params.color = color;
		} else  {
			params.color = [1, 1, 0];
		}

		UnityUtil.toUnity("HighlightObjects", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
	}

	public static cancelLoadModel() {
		if (!UnityUtil.loadedFlag && UnityUtil.loadedResolve) {
			// If the previous model is being loaded but hasn't finished yet
			UnityUtil.loadedResolve.reject("cancel");
		}

		if (UnityUtil.loadingResolve) {
			UnityUtil.loadingResolve.reject("cancel");
		}
	}

	public static loadModel(account, model, branch, revision) {
		UnityUtil.cancelLoadModel();
		UnityUtil.reset();

		UnityUtil.loadedPromise = null;
		UnityUtil.loadedResolve = null;
		UnityUtil.loadingPromise = null;
		UnityUtil.loadingResolve = null;
		UnityUtil.loadedFlag  = false;

		const params: any = {
			database : account,
			model,
		};

		if (revision !== "head") {
			params.revID = revision;
		}

		UnityUtil.onLoaded();
		UnityUtil.toUnity("LoadModel", UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));

		return UnityUtil.onLoading();

	}

	public static removePin(id) {
		UnityUtil.toUnity("RemovePin", UnityUtil.LoadingState.MODEL_LOADING, id);
	}

	public static reset() {
		UnityUtil.disableMeasuringTool();
		UnityUtil.disableClippingPlanes();
		UnityUtil.toUnity("ClearCanvas", UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	public static resetCamera() {
		UnityUtil.toUnity("ResetCamera", UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	public static requestScreenShot(promise) {
		UnityUtil.screenshotPromises.push(promise);
		UnityUtil.toUnity("RequestScreenShot", UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	public static requestViewpoint(account, model, promise) {
		if (UnityUtil.vpPromise != null) {
			UnityUtil.vpPromise.then(UnityUtil._requestViewpoint(account, model, promise));
		} else {
			UnityUtil._requestViewpoint(account, model, promise);
		}

	}

	public static _requestViewpoint(account, model, promise) {
		const param: any = {};
		if (account && model) {
			param.namespace = account + "."  + model;
		}
		UnityUtil.vpPromise = promise;
		UnityUtil.toUnity("RequestViewpoint", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

	public static setAPIHost(hostname) {
		UnityUtil.toUnity("SetAPIHost", UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(hostname));
	}

	public static setNavigation(navMode) {
		UnityUtil.toUnity("SetNavMode", UnityUtil.LoadingState.VIEWER_READY, navMode);
	}

	public static setUnits(units) {
		UnityUtil.toUnity("SetUnits", UnityUtil.LoadingState.MODEL_LOADING, units);
	}

	public static setViewpoint(pos, up, forward, lookAt, account, model) {
		const param: any = {};
		if (account && model) {
			param.nameSpace = account + "." + model;
		}

		param.position = pos;
		param.up = up;
		param.forward = forward;
		param.lookAt = lookAt;
		UnityUtil.toUnity("SetViewpoint", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));

	}

	public static toggleStats() {
		UnityUtil.toUnity("ShowStats", UnityUtil.LoadingState.VIEWER_READY, undefined);
	}

	public static toggleVisibility(account, model, ids, visibility) {
		const param: any = {};
		if (account && model) {
			param.nameSpace = account + "." + model;
		}

		param.ids = ids;
		param.visible = visibility;
		UnityUtil.toUnity("ToggleVisibility", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));

	}

	public static updateClippingPlanes(clipPlane, requireBroadcast, account, model) {
		const param: any = {};
		param.clip = clipPlane;
		if (account && model) {
			param.nameSpace = account + "." + model;
		}
		param.requiresBroadcast = requireBroadcast;
		UnityUtil.toUnity("UpdateClip", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

}
