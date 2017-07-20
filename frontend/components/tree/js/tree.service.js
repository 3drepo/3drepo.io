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

	angular.module("3drepo")
		.factory("TreeService", TreeService);

	TreeService.$inject = ["$http", "$q", "EventService", "serverConfig"];

	function TreeService($http, $q, EventService, serverConfig) {
		var ts = this;
		var cachedTreeDefer = $q.defer();
		var cachedTree = cachedTreeDefer.promise;

		var genIdToObjRef = function(tree, map){
			
			if(!map){
				map = {};
			}

			map[tree._id] = tree;
			
			tree.children && tree.children.forEach(function(child){
				genIdToObjRef(child, map);
			});

			return map;
		};

		var init = function(account, model, branch, revision, setting) {

			ts.account  = account;
			ts.model  = model;
			ts.branch   = branch ? branch : "master";
			//ts.revision = revision ? revision : "head";

			if (!revision) {
				ts.baseURL = "/" + account + "/" + model + "/revision/master/head/";
			} else {
				ts.baseURL = "/" + account + "/" + model + "/revision/" + revision + "/";
			}

			var deferred = $q.defer(),
				url = ts.baseURL + "fulltree.json";

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, url))
				.then(function(json) {
					//var mainTree = JSON.parse(json.data.mainTree);
					var mainTree = json.data.mainTree;
					
					//replace model id with model name in the tree if it is a federate model
					if(setting.federate){
						mainTree.nodes.children.forEach(function(child){
							var name = child.name.split(":");
							
							var subModel = setting.subModels.find(function(m){
								return m.model === name[1];
							});

							if(subModel){
								name[1] = subModel.name;
								child.name = name.join(":");
							}

							if(subModel && child.children && child.children[0]){
								child.children[0].name = subModel.name;
							}

						});
					}

					var subTrees = json.data.subTrees;
					var subTreesById = {};
					var getSubTrees = [];
					if(subTrees){

						// idToObjRef only needed if model is a fed model. i.e. subTrees.length > 0
						var idToObjRef = genIdToObjRef(mainTree.nodes);
						mainTree.subProjIdToPath = {};

						subTrees.forEach(function(tree){
							//attach the sub tree back on main tree
							if(idToObjRef[tree._id]){

								if(tree.url){
									//var obj = JSON.parse(tree.buf);
									var getSubTree = $http.get(serverConfig.apiUrl(serverConfig.GET_API, tree.url)).then(function(res){

										if(res.status === 401){
											tree.status = "NO_ACCESS";
										}

										if(res.status === 404){
											tree.status = "NOT_FOUND";
										}

										if(tree.status){
											idToObjRef[tree._id].status = tree.status;
										}

										tree.buf = res.data.mainTree;
										var obj = tree.buf;

										var subTree = obj.nodes;
										subTree.parent = idToObjRef[tree._id];
										
										angular.extend(mainTree.subProjIdToPath, obj.idToPath);

										idToObjRef[tree._id].children = [subTree];
										idToObjRef[tree._id].hasSubProjTree = true;
										subTreesById[subTree._id] = subTree;

									});

									getSubTrees.push(getSubTree);
								}

							}
						});

						mainTree.subTreesById = subTreesById;
					}

					Promise.all(getSubTrees).then(function(){
						deferred.resolve(mainTree);
					});
				
				})
				.catch(function(error){
					
					console.error(error);
					
				});

			cachedTreeDefer.resolve(deferred.promise);
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
			var oIdToMetaId = {};

			function genMap(treeItem){
				if(treeItem){
					
					if(treeItem.children){
						treeItem.children.forEach(genMap);
					}

					uidToSharedId[treeItem._id] = treeItem.shared_id;
					sharedIdToUid[treeItem.shared_id] = treeItem._id;

					if(treeItem.meta){
						oIdToMetaId[treeItem._id] = treeItem.meta;
					}

				}
			}

			genMap(treeItem);

			return {
				uidToSharedId: uidToSharedId,
				sharedIdToUid: sharedIdToUid,
				oIdToMetaId: oIdToMetaId
			};
		};


		return {
			init: init,
			search: search,
			getMap: getMap,
			cachedTree: cachedTree
		};
	}
}());
