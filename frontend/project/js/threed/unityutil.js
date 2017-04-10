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


	var readyPromise;
	var readyResolve;
	var loadedResolve;
	var screenshotPromises = [];
	var vpPromise = null;
	var UNITY_GAME_OBJECT = "WebGLInterface";

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


	function toUnity(methodName, params)
	{
		UnityUtil.onReady().then(function()
		{
			SendMessage(UNITY_GAME_OBJECT, methodName, params);
			
		});

	}


	/*
	 * =============== FROM UNITY ====================
	 */

	UnityUtil.prototype.currentPointInfo = function(pointInfo)
	{
		var point = JSON.parse(pointInfo);
		if(UnityUtil.objectSelectedCallback)
			UnityUtil.objectSelectedCallback(point);
	}

	UnityUtil.prototype.loaded = function(bboxStr)
	{
		var res = {};
		res.bbox = JSON.parse(bboxStr);
		loadedResolve.resolve(res);

	}

	UnityUtil.prototype.pickPointAlert = function(pointInfo)
	{
		var point = JSON.parse(pointInfo);
		if(UnityUtil.pickPointCallback)
			UnityUtil.pickPointCallback(point);
	}


	UnityUtil.prototype.ready = function()
	{
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

	UnityUtil.prototype.changePinColour = function(id, colour)
	{
		var params =  {};	
		params.color = colour;
		params.pinName = id;
		toUnity("ChangePinColor", JSON.stringify(params));
	}

	UnityUtil.prototype.clearHighlights = function()
	{
		toUnity("ClearHighlighting");
	}

	UnityUtil.prototype.dropPin = function(id, position, normal, colour)
	{
		var params = {};
		params.id = id;
		params.position = position;
		params.normal = normal;
		params.color = colour;
		toUnity("DropPin", JSON.stringify(params));
	}

	UnityUtil.prototype.getPointInfo = function()
	{
		toUnity("GetPointInfo", 0);
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

		toUnity("HighlightObjects", JSON.stringify(params));
	}

	UnityUtil.prototype.loadProject  = function(account, project, branch, revision)
	{
		var params = {};
		params.database = account;
		params.project = project;
		if(revision != "head")
			params.revision = revision;	

		toUnity("LoadProject", JSON.stringify(params));
			

		return new Promise(function(resolve, reject)
			{
				loadedResolve = {resolve : resolve, reject : reject};
			}
			);
	}

	UnityUtil.prototype.removePin = function(id)
	{
		toUnity("RemovePin", id);
	}
	
	UnityUtil.prototype.reset = function()
	{
		toUnity("ClearCanvas");
	}

	UnityUtil.prototype.resetCamera = function()
	{
		toUnity("ResetCamera");
	}

	UnityUtil.prototype.requestScreenShot = function(promise)
	{
		screenshotPromises.push(promise);
		toUnity("RequestScreenShot");
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
		toUnity("RequestViewpoint", JSON.stringify(param));
	}

	UnityUtil.prototype.setNavigation = function(navMode)
	{
		toUnity("SetNavMode", navMode);
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
		toUnity("SetViewpoint", JSON.stringify(param));


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
		toUnity("ToggleVisibility", JSON.stringify(param));

	}


	UnityUtil = new UnityUtil();
}());

