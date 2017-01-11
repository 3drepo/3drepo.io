/**
 *  Copyright (C) 2014 3D Repo Ltd
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

(function() {
	"use strict";

	angular.module('3drepo')
		.factory('TreeService', TreeService);

	TreeService.$inject = ["$http", "$q", "EventService", "serverConfig"];

	function TreeService($http, $q, EventService, serverConfig) {
		var ts = this;

		var init = function(account, project, branch, revision) {
			ts.account  = account;
			ts.project  = project;
			ts.branch   = branch ? branch : "master";
			//ts.revision = revision ? revision : "head";

			if (!revision)
			{
				ts.baseURL = "/" + account + "/" + project + "/revision/master/head/";
			} else {
				ts.baseURL = "/" + account + "/" + project + "/revision/" + revision + "/";
			}

			var deferred = $q.defer(),
				url = ts.baseURL + "fulltree.json";

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, url))
				.then(function(json) {
					deferred.resolve(json.data);
				});

			return deferred.promise;
		};

		var search = function(searchString) {
			var deferred = $q.defer(),
				url = ts.baseURL + "searchtree.json?searchString=" + searchString;

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, url))
				.then(function(json) {
					deferred.resolve(json);
				});

			return deferred.promise;
		};


		var getMap = function(treeItem){

			// tree item format: { _id: string, shared_id: string, children: [treeItem]}

			var uidToSharedId = {};
			var sharedIdToUid = {};

			function genMap(treeItem){
				if(treeItem){
					
					if(treeItem.children){
						treeItem.children.forEach(genMap);
					}

					uidToSharedId[treeItem._id] = treeItem.shared_id;
					sharedIdToUid[treeItem.shared_id] = treeItem._id;
				}
			}

			genMap(treeItem);

			return {
				uidToSharedId: uidToSharedId,
				sharedIdToUid: sharedIdToUid
			};
		}

		return {
			init: init,
			search: search,
			getMap: getMap
		};
	}
}());
