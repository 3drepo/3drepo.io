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

	ViewerService.$inject = [
		"ClientConfigService", "$q", "APIService", "DialogService", 
		"EventService"
	];

	function ViewerService(
		ClientConfigService, $q, APIService, DialogService, EventService
	) {

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
			disableMeasure: disableMeasure,
			getScreenshot: getScreenshot,
			getExtent: getExtent,
			setNavMode: setNavMode,
			getModelInfo: getModelInfo,
			setMultiSelectMode: setMultiSelectMode,
			switchObjectVisibility: switchObjectVisibility,
			handleUnityError: handleUnityError,
			handleEvent: handleEvent,
			highlightObjects: highlightObjects,
			getObjectsStatus: getObjectsStatus,
			clearClippingPlanes: clearClippingPlanes, 
			addPin: addPin,
			removePin: removePin,
			getCurrentViewpoint: getCurrentViewpoint,
			clearHighlights: clearHighlights
		};
	
		return service;
	
		///////////////

		// TODO: More EventService to be removed, but these functions broadcast 
		// across multiple watchers

		function handleEvent(event, account, model) {

			initialised.promise.then(function() {

				switch(event.type) {
				
				case EventService.EVENT.MODEL_SETTINGS_READY:
					if (event.value.account === account && event.value.model === model) {
						viewer.updateSettings(event.value.settings);
						//mapTile && mapTile.updateSettings(event.value.settings);
					}
					break;

				case EventService.EVENT.VIEWER.CLICK_PIN:
					viewer.clickPin(event.value.id);
					break;

				case EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR:
					viewer.changePinColours(
						event.value.id,
						event.value.colours
					);
					break;

				case EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES:
					viewer.updateClippingPlanes(
						event.value.clippingPlanes, event.value.fromClipPanel,
						event.value.account, event.value.model
					);
					break;

				case EventService.EVENT.VIEWER.BACKGROUND_SELECTED:
					viewer.clearHighlights();
					break;

				case EventService.EVENT.VIEWER.SET_CAMERA:
					currentModel.promise.then(function(){
						viewer.setCamera(
							event.value.position,
							event.value.view_dir,
							event.value.up,
							event.value.look_at,
							angular.isDefined(event.value.animate) ? event.value.animate : true,
							event.value.rollerCoasterMode,
							event.value.account,
							event.value.model
						);
					}).catch(function(error){
						handleUnityError("Setting the camera errored because model failed to load: " + error);
					});
					break;

				}
				
			});

		}

		function clearHighlights() {
			viewer.clearHighlights();
		}

		function getCurrentViewpoint(params) {
			// Note the Info suffix
			viewer.getCurrentViewpointInfo(
				params.account, 
				params.model, 
				params.promise
			);
		}

		function addPin(params) {
			initialised.promise.then(function(){
				viewer.addPin(
					params.account,
					params.model,
					params.id,
					params.pickedPos,
					params.pickedNorm,
					params.colours,
					params.viewpoint
				);
			});
		}

		function removePin(params) {
			initialised.promise.then(function(){
				viewer.removePin(
					params.id
				);
			});
		}

		function clearClippingPlanes() {
			viewer.clearClippingPlanes();
		}

		function getObjectsStatus(params) {
			viewer.getObjectsStatus(
				params.account,
				params.model,
				params.promise
			);
		}

		function highlightObjects(params) {

			viewer.highlightObjects(
				params.account,
				params.model,
				params.id ? [params.id] : params.ids,
				params.zoom,
				params.colour,
				params.multi
			);
		}

		function setMultiSelectMode(value) {
			viewer.setMultiSelectMode(value);
		}

		function switchObjectVisibility(account, model, ids, visibility){
			viewer.switchObjectVisibility(account, model, ids, visibility);
		}

		function handleUnityError(message) {

			DialogService.html("Unity Error", message, true)
				.then(function() {
					if (event.value.reload) {
						location.reload();
					}
				}, function() {
					console.error("Unity errorered and user canceled reload", message);
				});
		
		}

		function getModelInfo(account, model) {
			
			var url = account + "/" + model + ".json";

			return APIService.get(url);
		}

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

		function getScreenshot(promise) {
			if (promise) {
				viewer.getScreenshot(promise);
			}
		}

		function getExtent() {
			viewer.goToExtent();
		}

		function setNavMode(mode) {
			viewer.setNavMode(mode);
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
				return callInit();
			} else {
				return viewer.insertUnityLoader()
					.then(callInit)
					.catch(function(error){
						console.error("Error inserting Unity script: ", error);
					});
			}

		}

		function activateMeasure() {
			viewer.setMeasureMode(true);
		}

		function disableMeasure() {
			viewer.setMeasureMode(false);
		}

		function callInit() {

			return viewer
				.init({
					showAll : true,
					getAPI: {
						hostNames:  ClientConfigService.apiUrls["all"]
					}
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
