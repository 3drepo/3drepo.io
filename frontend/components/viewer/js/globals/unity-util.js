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

var UnityUtil;

(function() {
	"use strict";

	// angular.module("3drepo")
	// 	.service("UnityUtil", UnityUtil);

	
	UnityUtil = function() {};

	var LoadingState = { 
		VIEWER_READY : 1,  //Viewer has been loaded
		MODEL_LOADING : 2, //model information has been fetched, world offset determined, model starts loading
		MODEL_LOADED : 3 //Models
	};

	var readyPromise;
	var readyResolve;
	var loadedPromise;
	var loadedResolve;
	var loadingPromise;
	var loadingResolve;
	var screenshotPromises = [];
	var vpPromise = null;
	var objectStatusPromise = null;
	var loaded = false;
	var UNITY_GAME_OBJECT = "WebGLInterface";

	var SendMessage_vss, SendMessage_vssn, SendMessage_vsss;
	
	UnityUtil.prototype._SendMessage = function(gameObject, func, param) {
		if (param === undefined) {

			if (!SendMessage_vss) {
				SendMessage_vss = Module.cwrap("SendMessage", "void", ["string", "string"]);
			}
			SendMessage_vss(gameObject, func);

		} else if (typeof param === "string") {

			if (!SendMessage_vsss) {
				SendMessage_vsss = Module.cwrap("SendMessageString", "void", ["string", "string", "string"]);
			}
			SendMessage_vsss(gameObject, func, param);

		} else if (typeof param === "number") {

			if (!SendMessage_vssn) {
				SendMessage_vssn = Module.cwrap("SendMessageFloat", "void", ["string", "string", "number"]);
			}
			SendMessage_vssn(gameObject, func, param);

		} else {
			throw "" + param + " is does not have a type which is supported by SendMessage.";
		}
	};

	UnityUtil.prototype.onError = function(err, url, line) {
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

	UnityUtil.prototype.onLoaded = function() {
		if(!loadedPromise) {
			loadedPromise = new Promise(function(resolve, reject) {
				loadedResolve = {resolve: resolve, reject: reject};
			});
		}
		return loadedPromise;
		
	};

	UnityUtil.prototype.onLoading = function() {
		if(!loadingPromise) {
			loadingPromise = new Promise( function(resolve, reject) {
				loadingResolve = {resolve: resolve, reject: reject};
			});
		}
		return loadingPromise;
		
	};


	UnityUtil.prototype.onReady = function() {
	
		if(!readyPromise) {
			readyPromise	= new Promise(function(resolve, reject) {
				readyResolve = {resolve: resolve, reject: reject};
			});
		}
		
		return readyPromise;
		
	};

	var unityHasErrored = false;

	UnityUtil.prototype.userAlert = function(message, reload) {
		
		var prefix = "" +
		"Unity Error: ";

		var fullMessage = prefix + message;

		if (!unityHasErrored) {
			
			// Unity can error multiple times, we don't want 
			// to keep annoying the user
			unityHasErrored = true;
			UnityUtil.errorCallback({ 
				message : fullMessage, 
				reload : reload 
			});
		}
		
	};


	function toUnity(methodName, requireStatus, params) {

		if(requireStatus == LoadingState.MODEL_LOADED) {
			//Requires model to be loaded
			UnityUtil.onLoaded().then(function() {
				SendMessage(UNITY_GAME_OBJECT, methodName, params);
			
			}).catch(function(error){
				if (error != "cancel") {
					console.error("UnityUtil.onLoaded() failed: ", error);
					UnityUtil.userAlert(error, true);
				}
			});
		} else if(requireStatus == LoadingState.MODEL_LOADING) {
			//Requires model to be loading
			UnityUtil.onLoading().then(function() {
				SendMessage(UNITY_GAME_OBJECT, methodName, params);
			}).catch(function(error){
				if (error !== "cancel") {
					UnityUtil.userAlert(error, true);
					console.error("UnityUtil.onLoading() failed: ", error);
				}
			});
		} else {
			UnityUtil.onReady().then(function() {
				SendMessage(UNITY_GAME_OBJECT, methodName, params);
			
			}).catch(function(error){
				if (error != "cancel") {
					UnityUtil.userAlert(error, true);
					console.error("UnityUtil.onReady() failed: ", error);
				}
			});
		}

	}


	/*
	 * ================== FROM UNITY ====================
	 * The following functions are called by the unity viewer.
	 */

	UnityUtil.prototype.clipBroadcast = function(clipInfo) {
		if(UnityUtil.clipBroadcastCallback) {
			UnityUtil.clipBroadcastCallback(JSON.parse(clipInfo));
		}
	};

	UnityUtil.prototype.currentPointInfo = function(pointInfo) {
		var point = JSON.parse(pointInfo);
		if(UnityUtil.objectSelectedCallback) {
			UnityUtil.objectSelectedCallback(point);
		}
	};

	UnityUtil.prototype.loaded = function(bboxStr) {
		var res = {};
		res.bbox = JSON.parse(bboxStr);
		loadedResolve.resolve(res);
		loaded = true;
	};

	UnityUtil.prototype.loading = function(bboxStr) {

		loadingResolve.resolve();
	};

	UnityUtil.prototype.objectStatusBroadcast = function(nodeInfo) {
		objectStatusPromise.resolve(JSON.parse(nodeInfo));
		objectStatusPromise = null;
		
	};


	UnityUtil.prototype.pickPointAlert = function(pointInfo) {
		var point = JSON.parse(pointInfo);
		if(UnityUtil.pickPointCallback) {
			UnityUtil.pickPointCallback(point);
		}
	};

	UnityUtil.prototype.ready = function() {
		//Overwrite the Send Message function to make it run quicker 
		//This shouldn't need to be done in the future when the
		//optimisation in added into unity.
		SendMessage = UnityUtil._SendMessage;
		readyResolve.resolve();
	};
	
	UnityUtil.prototype.screenshotReady = function(screenshot) {
		var ssJSON = JSON.parse(screenshot);

		screenshotPromises.forEach(function(promise) {
			promise.resolve(ssJSON.ssBytes);
		}
		);
		screenshotPromises = [];
	};

	UnityUtil.prototype.viewpointReturned = function(vpInfo) {
		if(vpPromise != null) {
			var viewpoint = JSON.parse(vpInfo);
			vpPromise.resolve(viewpoint);
			vpPromise = null;
		}

	};



	/*
	 * =============== TO UNITY ====================
	 */


	/**
	 * Centres the viewpoint to the object
	 * @param {string} ns - namespace for the object, i.e. teamspace + "." + model
	 * @param {string} id - unique ID of the object to centre on
	 */
	UnityUtil.prototype.centreToPoint = function(ns, id) {
		var params = {};
		params.model = ns;
		params.meshID = id;
		toUnity("CentreToObject", LoadingState.MODEL_LOADING, JSON.stringify(params));
	};

	/**
	 *  Change the colour of an existing pin
	 *  @param {string} id - ID of the pin 
	 *  @param {number[]} colour - colour RGB value of the colour to change to.
	 */
	UnityUtil.prototype.changePinColour = function(id, colour) {
		var params =  {};	
		params.color = colour;
		params.pinName = id;
		toUnity("ChangePinColor", LoadingState.MODEL_LOADING, JSON.stringify(params));
	};

	/**
	 * Clear all highlighting.
	 */
	UnityUtil.prototype.clearHighlights = function() {
		toUnity("ClearHighlighting", LoadingState.MODEL_LOADED);
	};
	
	/**
	 *  Turn off any clipping planes imposed into the viewer
	 */
	UnityUtil.prototype.disableClippingPlanes = function() {
		toUnity("DisableClip");
	};
	
	/**
	 * Disable the Measuring tool.
	 */
	UnityUtil.prototype.disableMeasuringTool = function(){
		toUnity("StopMeasuringTool", LoadingState.MODEL_LOADING);
	};

	/**
	 * Add a pin
	 * @param {string} id - Identifier for the pin
	 * @param {number[]} position - point in space where the pin should generate
	 * @param {number[]} normal - normal vector for the pin (note: this is no longer used)
	 * @param {number[]} colour - RGB value for the colour of the pin
	 */
	UnityUtil.prototype.dropPin = function(id, position, normal, colour) {
		var params = {};
		params.id = id;
		params.position = position;
		params.normal = normal;
		params.color = colour;
		toUnity("DropPin", LoadingState.MODEL_LOADING, JSON.stringify(params));

	};

	/**
	 * Enable measuring tool. This will allow you to start measuring by clicking on the model
	 */
	UnityUtil.prototype.enableMeasuringTool = function(){
		toUnity("StartMeasuringTool", LoadingState.MODEL_LOADING);
	};

	/**
	 * Get Object Status within the viewer. This will return you the list of
	 * objects that are currently set invisible, and a list of object that are
	 * currently highlighted.
	 *
	 * The object status will be returned via the promise provided.
	 * @param {string} account - name of teamspace 
	 * @param {string} model - name of the model
	 * @param {object} promise - promise that the function will resolve with the object status info.
	 */
	UnityUtil.prototype.getObjectsStatus = function(account, model, promise) {
		var nameSpace = "";
		if(account && model) {
			nameSpace = account + "."  + model;
		}
		if(objectStatusPromise) {
			objectStatusPromise.then(function(){
				_getObjectsStatus(nameSpace, promise);
			});
		} else {
			_getObjectsStatus(nameSpace, promise);
		}

	};
	
	function _getObjectsStatus(nameSpace, promise) {
		objectStatusPromise = promise;
		toUnity("GetObjectsStatus", LoadingState.MODEL_LOADED, nameSpace);
	}

	/**
	 *  Highlight objects
	 *  @param {string} account - name of teamspace
	 *  @param {string} model - name of model
	 *  @param {string[]} idArr - array of unique IDs associated with the objects to highlight
	 *  @param {number[]} color - RGB value of the highlighting colour
	 *  @param {bool} toggleMode - If set to true, existing highlighted objects will stay highlighted. 
	 *  				Also any objects that are already highlighted will be unhighlighted
	 */
	UnityUtil.prototype.highlightObjects = function(account, model, idArr, color, toggleMode) {
		var params = {};
		params.database = account;
		params.model = model;
		params.ids = idArr;
		params.toggle = toggleMode;
		if(color) {
			params.color = color;
		} else {
			params.color = [1,1,0];
		}

		toUnity("HighlightObjects", LoadingState.MODEL_LOADED, JSON.stringify(params));
	};

	/**
	 * Cancel the loading of model.
	 */
	UnityUtil.prototype.cancelLoadModel = function() {
		if(!loaded && loadedResolve) {
			//If the previous model is being loaded but hasn't finished yet
			loadedResolve.reject("cancel");
		}
		
		if (loadingResolve) {
			loadingResolve.reject("cancel");
		}
	};

	/**
	 * Loading another model. NOTE: this will also clear the canvas of existing models
	 * Use branch = master and revision = head to get the latest revision.
	 *  @param {string} account - name of teamspace
	 *  @param {string} model - name of model
	 *  @param {string=} branch - ID of the branch (optional)
	 *  @param {string} revision - ID of revision
	 */
	UnityUtil.prototype.loadModel  = function(account, model, branch, revision) {
		
		//console.log("pin - loadModel");

		UnityUtil.cancelLoadModel();
		UnityUtil.reset();	
		
		loadedPromise = null;
		loadedResolve = null;
		loadingPromise = null;
		loadingResolve = null;
		loaded  = false;
		var params = {};
		params.database = account;
		params.model = model;
		if(revision != "head") {
			params.revID = revision;
		}
				
		
		UnityUtil.onLoading();
		toUnity("LoadModel", LoadingState.VIEWER_READY, JSON.stringify(params));
		
		return UnityUtil.onLoaded();
	
	};

	/**
	 * Remove a pin from the viewer
	 * @param {string} id - pin identifier
	 */
	UnityUtil.prototype.removePin = function(id) {
		toUnity("RemovePin", LoadingState.MODEL_LOADING, id);
	};

	/**
	 * Clear the canvas and reset all settings
	 */
	UnityUtil.prototype.reset = function() {
		this.disableMeasuringTool();
		this.disableClippingPlanes();
		toUnity("ClearCanvas", LoadingState.VIEWER_READY);
	};

	/**
	 * Reset the viewpoint to ISO view.
	 */
	UnityUtil.prototype.resetCamera = function() {
		toUnity("ResetCamera", LoadingState.VIEWER_READY);
	};

	/**
	 * Request a screenshot. The screenshot will be returned as a JSON
	 * object with a single field, ssByte, containing the screenshot in
	 * base64.
	 * @param {object} promise - promise that will be resolved, returning with the screenshot
	 */
	UnityUtil.prototype.requestScreenShot = function(promise) {
		screenshotPromises.push(promise);
		toUnity("RequestScreenShot", LoadingState.VIEWER_READY);
	};

	/**
	 * Request the information of the current viewpoint
	 *  @param {string} account - name of teamspace
	 *  @param {string} model - name of model
	 *  @param {Object} promise - promises where the viewpoint will be returned when the promise resolves
	 */
	UnityUtil.prototype.requestViewpoint = function(account, model, promise) {
		if(vpPromise != null) {
			vpPromise.then(_requestViewpoint(account, model, promise));
		} else {
			_requestViewpoint(account, model, promise);
		}

	};

	function _requestViewpoint(account, model, promise) {
		var param = {};
		if(account && model) {
			param.namespace = account + "."  + model;
		}
		vpPromise = promise;
		toUnity("RequestViewpoint", LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

	/**
	 * Set API host urls. This is needs to be called before loading model.
	 * @param {string[]} hostname - list of API names to use. (e.g https://api1.www.3drepo.io/api/) 
	 */
	UnityUtil.prototype.setAPIHost = function(hostname) {
		toUnity("SetAPIHost", LoadingState.VIEWER_READY, JSON.stringify(hostname));
	};

	/**
	 * Set navigation mode.
	 * @param {string} navMode - This can be either "HELICOPTER" or "TURNTABLE"
	 */
	UnityUtil.prototype.setNavigation = function(navMode) {
		toUnity("SetNavMode",LoadingState.VIEWER_READY, navMode);
	};


	/**
	 * Set the units
	 * By default, units are set to mm. 
	 * @param {string} units - i.e. "m", "mm", "ft" etc.
	 */
	UnityUtil.prototype.setUnits = function(units) {
		toUnity("SetUnits",LoadingState.MODEL_LOADING, units);
	};

	/**
	 * Move viewpoint to the specified paramters
	 * teamspace and model is only needed if the viewpoint is relative to a model
	 * @param {number[]} pos - 3D point in space where the camera should be
	 * @param {number[]} up - Up vector
	 * @param {number[]} forward - forward vector
	 * @param {number[]} lookAt - point in space the camera is looking at. (pivot point)
	 * @param {string=} account - name of teamspace
	 * @param {string=} model - name of model
	 */
	UnityUtil.prototype.setViewpoint = function(pos, up, forward, lookAt, account, model) {
		var param = {};
		if(account && model) {
			param.nameSpace = account + "." + model;
		}

		param.position = pos;
		param.up = up;
		param.forward = forward;
		param.lookAt = lookAt;
		toUnity("SetViewpoint", LoadingState.MODEL_LOADING, JSON.stringify(param));

	};

	/**
	 * Toggle on/off rendering statistics.
	 * When it is toggled on, list of stats will be displayed in the top left corner of the viewer.
	 */
	UnityUtil.prototype.toggleStats = function() {
		toUnity("ShowStats", LoadingState.VIEWER_READY);
	};

	/**
	 * Toggle visibility of the given list of objects
	 *  @param {string} account - name of teamspace
	 *  @param {string} model - name of model
	 *  @param {string[]} ids - list of unique ids to toggle visibility
	 *  @param {bool} visibility - true = toggle visible, false = toggle invisible
	 */
	UnityUtil.prototype.toggleVisibility = function(account, model, ids, visibility) {
		var param = {};
		if(account && model) {
			param.nameSpace = account + "." + model;
		}

		param.ids = ids;
		param.visible = visibility;
		toUnity("ToggleVisibility",LoadingState.MODEL_LOADED, JSON.stringify(param));

	};

	/**
	 * Update the clipping plane to the given direction
	 * teamspace and model is only needed if the viewpoint is relative to a model
	 * @example
	 * //Clipping plane is defined by the plane normal, distance from origin and it's direction
	 * //direction = -1 means it will clip anything above the plane, 1 otherwise.
	 * UnityUtil.updateClippingPlanes({normal : [0,-1,0], distance: 10, clipDirection: -1}, false)
	 * @param {Object} clipPlane - object containing the clipping plane
	 * @param {bool} requireBroadcast - if set to true, UnityUtil.clipBroadcast will be called after it is set.
	 * @param {string=} account - name of teamspace
	 * @param {string=} model - name of model
	 */
	UnityUtil.prototype.updateClippingPlanes = function (clipPlane, requireBroadcast, account, model) {
		var param = {};
		param.clip = clipPlane;
		if(account && model) {
			param.nameSpace = account + "." + model;
		}
		param.requiresBroadcast = requireBroadcast;
		toUnity("UpdateClip", LoadingState.MODEL_LOADING, JSON.stringify(param));
	};

	UnityUtil = new UnityUtil();
}());

