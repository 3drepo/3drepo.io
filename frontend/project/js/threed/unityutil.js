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

    angular.module("3drepo")
        .factory("UnityUtil", UnityUtil);

	
	UnityUtil = function() {};

	var LoadingState = { 
		VIEWER_READY : 1,  //Viewer has been loaded
		MODEL_LOADING : 2, //project information has been fetched, world offset determined, model starts loading
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
	UnityUtil.prototype._SendMessage = function(gameObject, func, param)
	{
    	if (param === undefined) {
	      if (!SendMessage_vss)
    	    SendMessage_vss = Module.cwrap('SendMessage', 'void', ['string', 'string']);
	      SendMessage_vss(gameObject, func);
    	} else if (typeof param === "string") {
	      if (!SendMessage_vsss)
    	    SendMessage_vsss = Module.cwrap('SendMessageString', 'void', ['string', 'string', 'string']);
	      SendMessage_vsss(gameObject, func, param);
	    } else if (typeof param === "number") {
    	  if (!SendMessage_vssn)
	        SendMessage_vssn = Module.cwrap('SendMessageFloat', 'void', ['string', 'string', 'number']);
    	 SendMessage_vssn(gameObject, func, param);
	    } else
    	    throw "" + param + " is does not have a type which is supported by SendMessage.";
	}

	UnityUtil.prototype.onLoaded = function()	
	{
		if(!loadedPromise)
		{
		   loadedPromise	= new Promise(function(resolve, reject)
			{
				loadedResolve = {resolve: resolve, reject: reject};
			}	
			);
		}
		return loadedPromise;
		
	}

	UnityUtil.prototype.onLoading = function()	
	{
		if(!loadingPromise)
		{
		   loadingPromise	= new Promise(function(resolve, reject)
			{
				loadingResolve = {resolve: resolve, reject: reject};
			}	
			);
		}
		return loadingPromise;
		
	}


	UnityUtil.prototype.onReady = function()	
	{
		if(!readyPromise)
		{
		   readyPromise	= new Promise(function(resolve, reject)
			{
				readyResolve = {resolve: resolve, reject: reject};
			}	
			);
		}
		return readyPromise;
		
	}


	function toUnity(methodName, requireStatus, params)
	{
		if(requireStatus == LoadingState.MODEL_LOADED)
		{
			//Requires model to be loaded
			UnityUtil.onLoaded().then(function()
			{
				SendMessage(UNITY_GAME_OBJECT, methodName, params);
			
			});
		}
		else if(requireStatus == LoadingState.MODEL_LOADING)
		{
			//Requires model to be loaded
			UnityUtil.onLoading().then(function()
			{
				SendMessage(UNITY_GAME_OBJECT, methodName, params);
			
			});
		}
		else
		{
			UnityUtil.onReady().then(function()
			{
				SendMessage(UNITY_GAME_OBJECT, methodName, params);
			
			});
		}

	}


	/*
	 * =============== FROM UNITY ====================
	 */

	UnityUtil.prototype.clipBroadcast = function(clipInfo)
	{
		if(UnityUtil.clipBroadcastCallback)
		{
			UnityUtil.clipBroadcastCallback(JSON.parse(clipInfo));
		}
	}

	UnityUtil.prototype.currentPointInfo = function(pointInfo)
	{
		var point = JSON.parse(pointInfo);
		if(UnityUtil.objectSelectedCallback)
			UnityUtil.objectSelectedCallback(point);
	}

	UnityUtil.prototype.doubleClicked = function(pointInfo)
	{
		var point = JSON.parse(pointInfo);
		if(point.position)
		{
			UnityUtil.centreToPoint(point.position);	
		}
	}

	UnityUtil.prototype.loaded = function(bboxStr)
	{
		var res = {};
		res.bbox = JSON.parse(bboxStr);
		loadedResolve.resolve(res);
		loaded = true;
	}

	UnityUtil.prototype.loading = function(bboxStr)
	{

		loadingResolve.resolve();
	}

	UnityUtil.prototype.objectStatusBroadcast = function(nodeInfo)
	{
		objectStatusPromise.resolve(JSON.parse(nodeInfo));
		objectStatusPromise = null;
		
	}


	UnityUtil.prototype.pickPointAlert = function(pointInfo)
	{
		var point = JSON.parse(pointInfo);
		if(UnityUtil.pickPointCallback)
			UnityUtil.pickPointCallback(point);
	}

	UnityUtil.prototype.ready = function()
	{
		//Overwrite the Send Message function to make it run quicker 
		//This shouldn't need to be done in the future when the
		//optimisation in added into unity.
		SendMessage = UnityUtil._SendMessage;
		readyResolve.resolve();
	}
	
	UnityUtil.prototype.screenshotReady = function(screenshot)
	{
		var ssJSON = JSON.parse(screenshot);

		screenshotPromises.forEach(function(promise)
				{
					promise.resolve(ssJSON.ssBytes);
				}
		);
		screenshotPromises = [];
	}

	UnityUtil.prototype.viewpointReturned = function(vpInfo)	
	{
		if(vpPromise != null)
		{
			var viewpoint = JSON.parse(vpInfo);
			vpPromise.resolve(viewpoint);
			vpPromise = null;
		}

	}



	/*
	 * =============== TO UNITY ====================
	 */


	UnityUtil.prototype.centreToPoint = function(position)
	{
		var params = {};
		params.position = position;
		toUnity("CentreToPoint", LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	UnityUtil.prototype.changePinColour = function(id, colour)
	{
		var params =  {};	
		params.color = colour;
		params.pinName = id;
		toUnity("ChangePinColor", LoadingState.MODEL_LOADING, JSON.stringify(params));
	}

	UnityUtil.prototype.clearHighlights = function()
	{
		toUnity("ClearHighlighting", LoadingState.MODEL_LOADED);
	}
	
	UnityUtil.prototype.disableClippingPlanes = function()
	{
		toUnity("DisableClip");
	}

	UnityUtil.prototype.dropPin = function(id, position, normal, colour)
	{
		var params = {};
		params.id = id;
		params.position = position;
		params.normal = normal;
		params.color = colour;
		toUnity("DropPin", LoadingState.MODEL_LOADING, JSON.stringify(params));

	}

	UnityUtil.prototype.getObjectsStatus = function(account, project, promise)
	{
		var nameSpace = "";
		if(account && project)
		{
			nameSpace = account + "."  + project;
		}
		if(objectStatusPromise)
		{
			objectStatusPromise.then(function(blah){
					_getObjectsStatus(nameSpace, promise);
				}					
			);
		}
		else
			_getObjectsStatus(nameSpace, promise)

	}

	function _getObjectsStatus(nameSpace, promise)
	{
		objectStatusPromise = promise;
		toUnity("GetObjectsStatus", LoadingState.MODEL_LOADED, nameSpace);
	}

	UnityUtil.prototype.getPointInfo = function()
	{
		toUnity("GetPointInfo", false, 0);
	}

	UnityUtil.prototype.highlightObjects = function(account, project, idArr, color, toggleMode)
	{
		var params = {};
		params.database = account;
		params.project = project;
		params.ids = idArr;
		params.toggle = toggleMode;
		if(color)
			params.color = color;

		toUnity("HighlightObjects", LoadingState.MODEL_LOADED, JSON.stringify(params));
	}

	UnityUtil.prototype.loadProject  = function(account, project, branch, revision)
	{

		UnityUtil.reset();	
		var params = {};
		params.database = account;
		params.project = project;
		if(revision != "head")
			params.revID = revision;	
		
		UnityUtil.onLoading(); //Initialise the promise
		toUnity("LoadProject", LoadingState.VIEWER_READY, JSON.stringify(params));
			
		return UnityUtil.onLoaded();
	}

	UnityUtil.prototype.removePin = function(id)
	{
		toUnity("RemovePin", LoadingState.MODEL_LOADING, id);
	}
	
	UnityUtil.prototype.reset = function()
	{
		if(!loaded && loadedResolve)
		{
			//If the previous project is being loaded but hasn't finished yet
			loadedResolve.reject();
			loadingResolve.reject();
		}
		
		loadedPromise = null;
		loadedResolve = null;
		loadingPromise = null;
		loadingResolve = null;
		loaded  = false;
		toUnity("ClearCanvas", LoadingState.VIEWER_READY);
	}

	UnityUtil.prototype.resetCamera = function()
	{
		toUnity("ResetCamera", LoadingState.VIEWER_READY);
	}

	UnityUtil.prototype.requestScreenShot = function(promise)
	{
		screenshotPromises.push(promise);
		toUnity("RequestScreenShot", LoadingState.VIEWER_READY);
	}

	UnityUtil.prototype.requestViewpoint = function(account, project, promise)
	{
		if(vpPromise != null)
		{
			vpPromise.then(_requestViewpoint(account, project, promise));
		}
		else
		{
			_requestViewpoint(account, project, promise);
		}

	}

	function _requestViewpoint(account, project, promise)
	{
		var param = {};
		if(account && project)
		{
			param.namespace = account + "."  + project;
		}
		vpPromise = promise;
		toUnity("RequestViewpoint", LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

	UnityUtil.prototype.setNavigation = function(navMode)
	{
		toUnity("SetNavMode",LoadingState.VIEWER_READY, navMode);
	}

	UnityUtil.prototype.setViewpoint = function(pos, up, forward, account, project)
	{
		var param = {};
		if(account && project)
		{
			param.nameSpace = account + "." + project;
		}

		param.position = pos;
		param.up = up;
		param.forward = forward;
		toUnity("SetViewpoint", LoadingState.MODEL_LOADING, JSON.stringify(param));


	}
	
	UnityUtil.prototype.toggleStats = function()
	{
		toUnity("ShowStats", LoadingState.VIEWER_READY);
	}


	UnityUtil.prototype.toggleVisibility = function(account, project, ids, visibility)
	{
		var param = {};
		if(account && project)
		{
			param.nameSpace = account + "." + project;
		}

		param.ids = ids;
		param.visible = visibility;
		toUnity("ToggleVisibility",LoadingState.MODEL_LOADED, JSON.stringify(param));

	}

	UnityUtil.prototype.updateClippingPlanes = function (clipPlane, requireBroadcast, account, project)
	{
		var param = {}
		param.clip = clipPlane;
		if(account && project)
		{
			param.nameSpace = account + "." + project;
		}
		param.requiresBroadcast = requireBroadcast;
		toUnity("UpdateClip", LoadingState.MODEL_LOADING, JSON.stringify(param));
	}

	UnityUtil = new UnityUtil();
}());

