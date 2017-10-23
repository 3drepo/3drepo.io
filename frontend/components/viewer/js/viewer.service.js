/**
 *  Copyright (C) 2017 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.service("ViewerService", ViewerService);

	ViewerService.$inject = ["ClientConfigService", "$q", "APIService"];

	function ViewerService(ClientConfigService, $q, APIService) {

		var viewer;
		var currentModel = {
			model : null,
			promise : null
		};

		var initialised = $q.defer();
			
		var service = {
			pin : {
				pinDropMode : false
			},
			initViewer : initViewer,
			getViewer : getViewer,
			loadViewerModel : loadViewerModel,
			currentModel : currentModel,
			initialised : initialised,
			reset : reset,
			fetchModelProperties : fetchModelProperties,
			activateMeasure: activateMeasure,
			disableMeasure: disableMeasure
		};
	
		return service;
	
		///////////////

		function reset() {
			if (viewer) {
				disableMeasure();
				viewer.reset();
			}
		}
		
		function getViewer(name, element, eventCallback, errCallback) {
			if (!viewer) {
				viewer = new Viewer(
					name, 
					element,
					eventCallback, 
					errCallback
				);
			} 

			return viewer;
		}

		function unityInserted() {
			if (!viewer) {
				return false;
			} else {
				return viewer.unityScriptInserted;
			}
			
		}

		function initViewer() {

			if (unityInserted()) {
				callInit();
			} else {
				viewer.insertUnityLoader()
					.then(callInit);
			}

		}

		function activateMeasure() {
			viewer.setMeasureMode(true);
		}

		function disableMeasure() {
			viewer.setMeasureMode(false);
		}

		function callInit() {
	
			var showAll = true;
			viewer
				.init({
					showAll : showAll,
					getAPI: ClientConfigService.apiUrl(ClientConfigService.GET_API, "")
				})
				.catch(function(error){
					console.error("Error creating Viewer Directive: ", error);
				});
			
		}

		function loadViewerModel(account, model, branch, revision) {
			
			if (!account || !model) {
				console.error("Account, model, branch or revision was not defined!", account, model, branch, revision);
			} else {
				currentModel.promise = viewer.loadModel(
					account, 
					model, 
					branch, 
					revision
				)
					.then(function(){
						// Set the current model in the viewer
						currentModel.model = model;
						initialised.resolve();
						fetchModelProperties(account, model, branch, revision);	
					})
					.catch(function(error){
						console.error("Error loading model: ", error);
					});
			}

			

		}

		function fetchModelProperties(account, model, branch, revision) {
			
			if (account && model) {
				console.log("branch, revision", branch, revision)
				if(!branch) {
					branch = !revision ? "master" : "";
				}
					
				if(!revision || branch === "master") {
					//revision is master/head 
					revision = branch + "/head";
				}
					
				var url = account + "/" + model + "/revision/" + revision + "/modelProperties.json";

				APIService.get(url)
					.then(function(response) {
						if (response.data && response.data.status) {
							if (response.data.status === "NOT_FOUND") {
								console.error("Model properties was not found from API");
							}
						}

						if (response.data && response.data.properties) {
							viewer.applyModelProperties(account, model, response.data.properties);
						} else {
							var message = "No data properties returned. This was the response:";
							console.error(message, response);
						}
					})
					.catch(function(error){
						console.error("Model properties failed to fetch", error);
					});

			} else {
				console.error("Account and model were not set correctly " +
				"for model property fetching: ", account, model);
			}
			
		}
		
	}
}());
