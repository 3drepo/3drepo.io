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
		.service("TreeService", TreeService);

	TreeService.$inject = ["$q", "APIService"];

	function TreeService($q, APIService) {
		var cachedTreeDefer = $q.defer();
		var cachedTree = cachedTreeDefer.promise;
		var treeMap = null;
		var baseURL;

		var service = {
			init: init,
			search: search,
			getMap: getMap,
			cachedTree: cachedTree
		};


		return service;

		//////

		function genIdToObjRef(tree, map){
			
			if(!map){
				map = {};
			}

			map[tree._id] = tree;
			
			tree.children && tree.children.forEach(function(child){
				genIdToObjRef(child, map);
			});

			return map;
		}

		function init(account, model, branch, revision, setting) {


			branch = branch ? branch : "master";
			//revision = revision ? revision : "head";

			if (!revision) {
				baseURL = account + "/" + model + "/revision/master/head/";
			} else {
				baseURL = account + "/" + model + "/revision/" + revision + "/";
			}

			var	url = baseURL + "fulltree.json";
			getTrees(url, setting, cachedTreeDefer);
			
			return cachedTreeDefer.promise;

		}

		function getTrees(url, setting, deferred) {

			APIService.get(url, {
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then(function(json) {

					var mainTree = json.data.mainTree;

					// TODO: This needs sorting out. 
				
					//replace model id with model name in the tree if it is a federate model
					if(setting.federate){
						mainTree.nodes.name = setting.name;
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
					
					getIdToPath()
						.then(function(idToPath){
						
							var getSubTrees = [];
							
							if (idToPath && idToPath.treePaths) {
							
								mainTree.idToPath = idToPath.treePaths.idToPath;
								
								if(subTrees){
									
									// idToObjRef only needed if model is a fed model. 
									// i.e. subTrees.length > 0
									
									mainTree.subModelIdToPath = {};
						
									subTrees.forEach(function(subtree){

										var subtreeIdToPath = idToPath.treePaths.subModels.find(function(submodel) {
											return subtree.model === submodel.model;
										});
										
										if (subtreeIdToPath) {
											subtree.idToPath = subtreeIdToPath.idToPath;
										}
										
										handleSubTree(
											subtree, 
											mainTree, 
											subTreesById, 
											getSubTrees
										);
									});
								}
								
							}

							mainTree.subTreesById = subTreesById;

							Promise.all(getSubTrees).then(function(){
								deferred.resolve(mainTree);
							});

						});
						
				})
				.catch(function(error){
					
					console.error("Tree Init Error:", error);
					
				});
		}

		function getIdToPath() {

			var url = baseURL + "tree_path.json";
			return APIService.get(url, {
				headers: {
					"Content-Type": "application/json"
				}
			}).
				then(function(response){
					return response.data;
				});

		}

		function handleSubTree(subtree, mainTree, subTreesById, getSubTrees) {

			var treeId = subtree._id;
			var idToObjRef = genIdToObjRef(mainTree.nodes);

			//attach the sub tree back on main tree
			if(idToObjRef[treeId] && subtree.url){

				var getSubTree = APIService.get(subtree.url)
					.then(function(res){

						attachStatus(res, subtree, idToObjRef);
						
						subtree.buf = res.data.mainTree;
		
						var subTree = subtree.buf.nodes;
						var subTreeId = subTree._id;

						subTree.parent = idToObjRef[treeId];
					
						angular.extend(mainTree.subModelIdToPath, subtree.idToPath);

						idToObjRef[treeId].children = [subTree];
						idToObjRef[treeId].hasSubModelTree = true;
						subTreesById[subTreeId] = subTree;

					})
					.catch(function(res){
						attachStatus(res, subtree, idToObjRef);	
						console.warn("Subtree issue: ", res);
					});

				getSubTrees.push(getSubTree);

			}
			
		}

		function attachStatus(res, tree, idToObjRef) {
			if(res.status === 401){
				tree.status = "NO_ACCESS";
			}

			if(res.status === 404){
				tree.status = "NOT_FOUND";
			}

			if(tree.status){
				idToObjRef[tree._id].status = tree.status;
			}
		}

		function search(searchString) {
			var url = baseURL + "searchtree.json?searchString=" + searchString;
			return APIService.get(url);
		}

		function genMap(leaf, items){

			var leafId = leaf._id;
			var sharedId = leaf.shared_id;
			var subTreePromises  = [];
			if(leaf){
				
				if(leaf.children){
					leaf.children.forEach(function(child){
						subTreePromises.push(genMap(child, items));
					});
				}
				items.uidToSharedId[leafId] = sharedId;
				items.sharedIdToUid[sharedId] = leafId;
				if(leaf.meta){
					items.oIdToMetaId[leafId] = leaf.meta;
				}
			}

			return Promise.all(subTreePromises).then(function(){
					return items;
				}
			)
		}

		function getMap(treeItem){
			//only do this once!
			if(treeMap)
			{
				return Promise.resolve(treeMap);
			}
			else
			{
				treeMap = {
					uidToSharedId: {},
					sharedIdToUid: {},
					oIdToMetaId: {}
				};
				return genMap(treeItem, treeMap);

			}


		}


	}
}());
