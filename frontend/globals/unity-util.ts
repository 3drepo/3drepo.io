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

	static errorCallback: any;
	public static viewer: any;

	static init(
		errorCallback: any
	) {
		errorCallback = errorCallback;
	}
	
	static LoadingState = { 
		VIEWER_READY : 1,  //Viewer has been loaded
		MODEL_LOADING : 2, //model information has been fetched, world offset determined, model starts loading
		MODEL_LOADED : 3 //Models
	};

	static readyPromise;
	static readyResolve;
	
	static loadedPromise;
	static loadedResolve;

	static loadingPromise;
	static loadingResolve;

	static unityHasErrored = false;

	static screenshotPromises = [];
	static vpPromise = null;
	static objectStatusPromise = null;
	static loadedFlag = false;
	static UNITY_GAME_OBJECT = "WebGLInterface";

	static SendMessage_vss;
	static SendMessage_vssn;
	static SendMessage_vsss;
	
	static _SendMessage(gameObject, func, param) {

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
			throw "" + param + " is does not have a type which is supported by SendMessage.";
		}
	};

	static onError(err, url, line) {
		var conf = "Your browser has failed to load 3D Repo. This may due to insufficient memory. " + 
					"Please ensure you are using a 64bit web browser (Chrome or FireFox for best results), " + 
					"reduce your memory usage and try again. " + 
					"If you are unable to resolve this problem, please contact support@3drepo.org referencing the following: " + 
					"<br><br> <code>Error " + err + " occured at line " + line + 
					"</code> <br><br> Click ok to refresh this page. <md-container>";

		var reload = false;
		if (err.indexOf("Array buffer allocation failed") !== -1 ||
			err.indexOf("Unity") != -1 || err.indexOf("unity") != -1) {
			reload = true;
		}
		
		UnityUtil.userAlert(conf, reload);

		return true;
	};

	static onLoaded() {
		if(!UnityUtil.loadedPromise) {
			UnityUtil.loadedPromise = new Promise((resolve, reject) => {
				UnityUtil.loadedResolve = {resolve: resolve, reject: reject};
			});
		}
		return UnityUtil.loadedPromise;
		
	};

	static onLoading() {
		if(!UnityUtil.loadingPromise) {
			UnityUtil.loadingPromise = new Promise((resolve, reject) => {
				UnityUtil.loadingResolve = {resolve: resolve, reject: reject};
			});
		}
		return UnityUtil.loadingPromise;
		
	};


	static onReady() {
	
		if(!UnityUtil.readyPromise) {
			UnityUtil.readyPromise	= new Promise((resolve, reject) => {
				UnityUtil.readyResolve = {resolve: resolve, reject: reject};
			});
		}
		
		return UnityUtil.readyPromise;
		
	};


	static userAlert(message, reload) {
		
		var prefix = "" + "Unity Error: ";

		var fullMessage = prefix + message;

		if (!UnityUtil.unityHasErrored) {
			
			// Unity can error multiple times, we don't want 
			// to keep annoying the user
			UnityUtil.unityHasErrored = true;
			UnityUtil.errorCallback({ 
				message : fullMessage, 
				reload : reload 
			});
		}
		
	};

	static toUnity(methodName, requireStatus, params) {

		if(requireStatus == UnityUtil.LoadingState.MODEL_LOADED) {
			//Requires model to be loaded
			UnityUtil.onLoaded().then(() => {
				SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
			
			}).catch((error) => {
				if (error != "cancel") {
					console.error("UnityUtil.onLoaded() failed: ", error);
					UnityUtil.userAlert(error, true);
				}
			});
		} else if(requireStatus == UnityUtil.LoadingState.MODEL_LOADING) {
			//Requires model to be loading
			UnityUtil.onLoading().then(() => {
				SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
			}).catch(function(error){
				if (error !== "cancel") {
					UnityUtil.userAlert(error, true);
					console.error("UnityUtil.onLoading() failed: ", error);
				}
			});
		} else {
			UnityUtil.onReady().then(() => {
				//console.log(UnityUtil.UNITY_GAME_OBJECT, methodName, params)
				SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
			}).catch((error) => {
				if (error != "cancel") {
					UnityUtil.userAlert(error, true);
					console.error("UnityUtil.onReady() failed: ", error);
				}
			});
		}

	}


	/*
	 * =============== FROM UNITY ====================
	 */

	static clipBroadcast(clipInfo) {
		
		if(UnityUtil.viewer.clipBroadcast) {
			UnityUtil.viewer.clipBroadcast(JSON.parse(clipInfo));
		}
	};

	static currentPointInfo(pointInfo) {
		var point = JSON.parse(pointInfo);
		console.log(UnityUtil.viewer);
		if (UnityUtil.viewer.objectSelected) {
			UnityUtil.viewer.objectSelected(point);
		}
	};

	static loaded(bboxStr) {
		var res = {
			bbox: JSON.parse(bboxStr)
		};
		UnityUtil.loadedResolve.resolve(res);
		UnityUtil.loadedFlag = true;
	};

	static loading(bboxStr) {
		UnityUtil.loadingResolve.resolve();
	};

	static objectStatusBroadcast(nodeInfo) {
		UnityUtil.objectStatusPromise.resolve(JSON.parse(nodeInfo));
		UnityUtil.objectStatusPromise = null;
		
	};

	static ready() {
		//Overwrite the Send Message function to make it run quicker 
		//This shouldn't need to be done in the future when the
		//readyoptimisation in added into unity.
		SendMessage = UnityUtil._SendMessage;
		UnityUtil.readyResolve.resolve();
	};

	static pickPointAlert(pointInfo) {
		var point = JSON.parse(pointInfo);
		console.log("pickPointAlert", UnityUtil.viewer.pickPoint)
		if(UnityUtil.viewer.pickPoint) {
			UnityUtil.viewer.pickPoint(point);
		}
	};

	static screenshotReady(screenshot) {
		var ssJSON = JSON.parse(screenshot);

		UnityUtil.screenshotPromises.forEach((promise) => {
			promise.resolve(ssJSON.ssBytes);
		});

		UnityUtil.screenshotPromises = [];
	};

	static viewpointReturned(vpInfo) {
		if(UnityUtil.vpPromise != null) {
			var viewpoint = JSON.parse(vpInfo);
			UnityUtil.vpPromise.resolve(viewpoint);
			UnityUtil.vpPromise = null;
		}

	};



	/*
	 * =============== TO UNITY ====================
	 */


	static centreToPoint(model, id) {
		var params = {
			model: model,
			meshID: id
		};

		UnityUtil.toUnity("CentreToObject", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	};

	static changePinColour(id, colour) {
		var params =  {
			color : colour,
			pinName : id
		}
		UnityUtil.toUnity("ChangePinColor", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
	};

	static clearHighlights() {
		UnityUtil.toUnity("ClearHighlighting", UnityUtil.LoadingState.MODEL_LOADED, undefined);
	};
	
	static disableClippingPlanes() {
		UnityUtil.toUnity("DisableClip", undefined, undefined);
	};
	
	static disableMeasuringTool(){
		UnityUtil.toUnity("StopMeasuringTool", UnityUtil.LoadingState.MODEL_LOADING, undefined);
	};

	static dropPin(id, position, normal, colour) {
		var params = {
			id : id,
			position : position,
			normal : normal,
			color : colour
		};
		UnityUtil.toUnity("DropPin", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));

	};

	static enableMeasuringTool(){
		UnityUtil.toUnity("StartMeasuringTool", UnityUtil.LoadingState.MODEL_LOADING, undefined);
	}


	static getObjectsStatus(account, model, promise) {
		var nameSpace = "";
		if(account && model) {
			nameSpace = account + "."  + model;
		}
		if(UnityUtil.objectStatusPromise) {
			UnityUtil.objectStatusPromise.then(() => {
				UnityUtil._getObjectsStatus(nameSpace, promise);
			});
		} else {
			UnityUtil._getObjectsStatus(nameSpace, promise);
		}

	};

	static _getObjectsStatus(nameSpace, promise) {
		UnityUtil.objectStatusPromise = promise;
		UnityUtil.toUnity("GetObjectsStatus", UnityUtil.LoadingState.MODEL_LOADED, nameSpace);
	}

	static getPointInfo() {
		UnityUtil.toUnity("GetPointInfo", false, 0);
	};

	static highlightObjects(account, model, idArr, color, toggleMode) {
		var params: any = {
			database : account,
			model : model,
			ids : idArr,
			toggle : toggleMode
		};

		if(color) {
			params.color = color;
		} else  {
			params.color = [1,1,0];
		}

		UnityUtil.toUnity("HighlightObjects", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
	};

	static cancelLoadModel() {
		if(!UnityUtil.loadedFlag && UnityUtil.loadedResolve) {
			//If the previous model is being loaded but hasn't finished yet
			UnityUtil.loadedResolve.reject("cancel");
		}
		
		if (UnityUtil.loadingResolve) {
			UnityUtil.loadingResolve.reject("cancel");
		}
	};

	static loadModel (account, model, branch, revision) {
		
		//console.log("pin - loadModel");

		UnityUtil.cancelLoadModel();
		UnityUtil.reset();	
		
		UnityUtil.loadedPromise = null;
		UnityUtil.loadedResolve = null;
		UnityUtil.loadingPromise = null;
		UnityUtil.loadingResolve = null;
		UnityUtil.loadedFlag  = false;

		var params: any = {
			database : account,
			model : model
		};
		
		if(revision != "head") {
			params.revID = revision;
		}

		UnityUtil.onLoading();
		UnityUtil.toUnity("LoadModel", UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));
		
		return UnityUtil.onLoaded();
	
	};

	static removePin(id) {
		UnityUtil.toUnity("RemovePin", UnityUtil.LoadingState.MODEL_LOADING, id);
	};
	
	static reset() {
		UnityUtil.disableMeasuringTool();
		UnityUtil.disableClippingPlanes();
		UnityUtil.toUnity("ClearCanvas", UnityUtil.LoadingState.VIEWER_READY, undefined);
	};

	static resetCamera() {
		UnityUtil.toUnity("ResetCamera", UnityUtil.LoadingState.VIEWER_READY, undefined);
	};

	static requestScreenShot(promise) {
		UnityUtil.screenshotPromises.push(promise);
		UnityUtil.toUnity("RequestScreenShot", UnityUtil.LoadingState.VIEWER_READY, undefined);
	};

	static requestViewpoint(account, model, promise) {
		if(UnityUtil.vpPromise != null) {
			UnityUtil.vpPromise.then(UnityUtil._requestViewpoint(account, model, promise));
		} else {
			UnityUtil._requestViewpoint(account, model, promise);
		}

	};

	static _requestViewpoint(account, model, promise) {
		var param: any = {};
		if(account && model) {
			param.namespace = account + "."  + model;
		}
		UnityUtil.vpPromise = promise;
		UnityUtil.toUnity("RequestViewpoint", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

	static setAPIHost(hostname) {
		UnityUtil.toUnity("SetAPIHost", UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(hostname));
	};

	static setNavigation(navMode) {
		UnityUtil.toUnity("SetNavMode", UnityUtil.LoadingState.VIEWER_READY, navMode);
	};

	static setUnits(units) {
		UnityUtil.toUnity("SetUnits", UnityUtil.LoadingState.MODEL_LOADING, units);
	};

	static setViewpoint(pos, up, forward, lookAt, account, model) {
		var param: any = {};
		if(account && model) {
			param.nameSpace = account + "." + model;
		}

		param.position = pos;
		param.up = up;
		param.forward = forward;
		param.lookAt = lookAt;
		UnityUtil.toUnity("SetViewpoint", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));

	};
	
	static toggleStats() {
		UnityUtil.toUnity("ShowStats", UnityUtil.LoadingState.VIEWER_READY, undefined);
	};

	static toggleVisibility(account, model, ids, visibility) {
		var param: any = {};
		if(account && model) {
			param.nameSpace = account + "." + model;
		}

		param.ids = ids;
		param.visible = visibility;
		UnityUtil.toUnity("ToggleVisibility", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));

	};

	static updateClippingPlanes (clipPlane, requireBroadcast, account, model) {
		var param: any = {};
		param.clip = clipPlane;
		if(account && model) {
			param.nameSpace = account + "." + model;
		}
		param.requiresBroadcast = requireBroadcast;
		UnityUtil.toUnity("UpdateClip", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
	};


}

