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

export class TreeService {
	
	static $inject: string[] = [	
		"$q", 
		"APIService"
	];

	treeReady;
	treeMap = null;
	idToMeshes;
	baseURL;

	constructor(
		private $q, 
		private APIService
	) {}
		
	genIdToObjRef(tree, map){
		
		if(!map){
			map = {};
		}

		map[tree._id] = tree;
		
		tree.children && tree.children.forEach((child) => {
			this.genIdToObjRef(child, map);
		});

		return map;
	}

	init(account, model, branch, revision, setting) {
		var cachedTreeDefer = this.$q.defer();
		this.treeMap = null;
		branch = branch ? branch : "master";

		//revision = revision ? revision : "head";

		if (!revision) {
			this.baseURL = account + "/" + model + "/revision/master/head/";
		} else {
			this.baseURL = account + "/" + model + "/revision/" + revision + "/";
		}

		var	url = this.baseURL + "fulltree.json";
		this.getTrees(url, setting, cachedTreeDefer);
		this.getIdToMeshes();
		this.treeReady = cachedTreeDefer.promise
		
		return this.treeReady;

	}

	getIdToMeshes() {
		var url = this.baseURL + "idToMeshes.json";
		this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json"
			}
		}).then((json) => {
			this.idToMeshes = json.data.idToMeshes;
		}).catch((error) => {
			console.error("Failed to get Id to Meshes:", error);
		});
	}

	getTrees(url, setting, deferred) {

		this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then((json) => {

				var mainTree = json.data.mainTree;

				// TODO: This needs sorting out. 
			
				//replace model id with model name in the tree if it is a federate model
				if(setting.federate){
					mainTree.nodes.name = setting.name;
					mainTree.nodes.children.forEach((child) => {
						var name = child.name.split(":");
						
						var subModel = setting.subModels.find((m) => {
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
				
				this.getIdToPath()
					.then((idToPath) => {
					
						var getSubTrees = [];
						
						if (idToPath && idToPath.treePaths) {
						
							mainTree.idToPath = idToPath.treePaths.idToPath;
							
							if(subTrees){
								
								// idToObjRef only needed if model is a fed model. 
								// i.e. subTrees.length > 0
								
								mainTree.subModelIdToPath = {};
					
								subTrees.forEach((subtree) => {

									var subtreeIdToPath = idToPath.treePaths.subModels.find(function(submodel) {
										return subtree.model === submodel.model;
									});
									
									if (subtreeIdToPath) {
										subtree.idToPath = subtreeIdToPath.idToPath;
									}
									
									this.handleSubTree(
										subtree, 
										mainTree, 
										subTreesById, 
										getSubTrees
									);
								});
							}
							
						}

						mainTree.subTreesById = subTreesById;

						Promise.all(getSubTrees).then(() => {
							deferred.resolve(mainTree);
						});

					});
					
			})
			.catch((error) => {
				
				console.error("Tree Init Error:", error);
				
			});
	}

	getIdToPath() {

		var url = this.baseURL + "tree_path.json";
		return this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json"
			}
		}).
			then((response) => {
				return response.data;
			});

	}

	handleSubTree(subtree, mainTree, subTreesById, getSubTrees) {

		var treeId = subtree._id;
		var idToObjRef = this.genIdToObjRef(mainTree.nodes, undefined);

		//attach the sub tree back on main tree
		if(idToObjRef[treeId] && subtree.url){

			var getSubTree = this.APIService.get(subtree.url)
				.then((res) => {

					this.attachStatus(res, subtree, idToObjRef);
					
					subtree.buf = res.data.mainTree;
	
					var subTree = subtree.buf.nodes;
					var subTreeId = subTree._id;

					subTree.parent = idToObjRef[treeId];
				
					Object.assign(mainTree.subModelIdToPath, subtree.idToPath);

					idToObjRef[treeId].children = [subTree];
					idToObjRef[treeId].hasSubModelTree = true;
					subTreesById[subTreeId] = subTree;

				})
				.catch(function(res){
					this.attachStatus(res, subtree, idToObjRef);	
					console.warn("Subtree issue: ", res);
				});

			getSubTrees.push(getSubTree);

		}
		
	}

	attachStatus(res, tree, idToObjRef) {
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

	search(searchString) {
		var url = this.baseURL + "searchtree.json?searchString=" + searchString;
		return this.APIService.get(url);
	}

	genMap(leaf, items){

		var leafId = leaf._id;
		var sharedId = leaf.shared_id;
		var subTreePromises  = [];
		if(leaf){
			
			if(leaf.children){
				leaf.children.forEach((child) => {
					subTreePromises.push(this.genMap(child, items));
				});
			}
			items.uidToSharedId[leafId] = sharedId;
			items.sharedIdToUid[sharedId] = leafId;
			if(leaf.meta){
				items.oIdToMetaId[leafId] = leaf.meta;
			}
		}

		return Promise.all(subTreePromises).then(() => {
				return items;
			}
		)
	}

	getMap(){
		//only do this once!
		if(this.treeMap) {
			return Promise.resolve(this.treeMap);
		} else {
			this.treeMap = {
				uidToSharedId: {},
				sharedIdToUid: {},
				oIdToMetaId: {},
			};
			return this.treeReady.then((tree) => {
				this.genMap(tree.nodes, this.treeMap);
				this.treeMap.idToMeshes = this.idToMeshes;
			});

		}


	}


}



export const TreeServiceModule = angular
	.module('3drepo')
	.service('TreeService', TreeService);