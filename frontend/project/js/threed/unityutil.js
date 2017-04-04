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
	var awaitingResolve;
	var UNITY_GAME_OBJECT = "WebGLInterface";

	/*
	 * =============== FROM UNITY ====================
	 */
	UnityUtil.prototype.Ready = function()
	{
		awaitingResolve();
	};

	/*
	 * =============== TO UNITY ====================
	 */
	UnityUtil.prototype.loadProject  = function(account, project, branch, revision)
	{
		var params = {};
		params.database = account;
		params.project = project;
		if(revision != "head")
			params.revision = revision;	
			UnityUtil.onReady().then(function()
			{
				SendMessage(UNITY_GAME_OBJECT, "LoadProject", JSON.stringify(params))
			}
		);
	}

	UnityUtil.prototype.onReady = function()	
	{
		if(!readyPromise)
		{
		   readyPromise	= new Promise(function(resolve, reject)
			{
				awaitingResolve = resolve;
			}	
			);
		}
		return readyPromise;
		
	}

	UnityUtil = new UnityUtil();
}());

