/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.component("viewer", {
			restrict: "E",
			bindings: {
				account: "<",
				model: "<",
				branch: "<",
				revision: "<"
			},
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on("$destroy", function(){
					scope.vm.viewer.destroy(); // Remove events watch
				});
			},
			controller: ViewerCtrl,
			controllerAs: "vm"
		});

	ViewerCtrl.$inject = ["$scope", "$q", "$http", "$element", "ClientConfigService", "EventService", "$location", "$mdDialog"];

	function ViewerCtrl ($scope, $q, $http, $element, ClientConfigService, EventService, $location, $mdDialog) {
		var vm = this;

		vm.$onInit = function() {

			vm.branch   = vm.branch ? vm.branch : "master";
			vm.revision = vm.revision ? vm.revision : "head";
			vm.pointerEvents = "auto";
			vm.initialisedViewer = false;
			vm.currentModel = null;
			vm.currentModelPromise = null;
			vm.initialisedPromise = $q.defer();

			vm.viewer = new Viewer(
				vm.name, 
				$element[0],
				eventCallback, 
				errCallback
			);
			
			vm.viewer.preInit();

		};

		function errCallback(errorType, errorValue) {
			EventService.sendError(errorType, errorValue);
		}

		function eventCallback(type, value) {
			EventService.send(type, value);
		}

		// vm.reload = function() {
		// 	vm.viewer.loadModel(vm.account, vm.model, vm.branch, vm.revision);
		// };

		vm.initViewer = function() {

			var showAll = true;
			vm.viewer.init({
				showAll : showAll,
				getAPI: ClientConfigService.apiUrl(ClientConfigService.GET_API, "")
			})
				.then(function(){
		
				})
				.catch(function(error){
					console.error("Error creating Viewer Directive: ", error);
				});
		
		};

		function fetchModelProperties(account, model, branch, revision) {

			if (account && model) {

				if(!branch) {
					branch = (!revision) ? "master" : "";
				}
						
				if(!revision) {
					revision = "head";
				}

				var url = account + "/" + model + "/revision/" + branch + "/" + revision + "/modelProperties.json";
				$http.get(ClientConfigService.apiUrl(ClientConfigService.GET_API, url))
					.then(function(response) {
						if (response.data && response.data.properties) {
							vm.viewer.applyModelProperties(account, model, response.data.properties);
						} else {
							var message = "No data properties returned. This was the response:";
							console.error(message, response);
						}
					})
					.catch(function(error){
						console.error("Model properties failed to fetch", error);
					});

			} else {
				console.warn("Account and model were not set correctly " +
				"for model property fetching: ", account, model);
			}
			

		}

		$scope.$watch(EventService.currentEvent, function(event) {

			var validEvent = angular.isDefined(event) && angular.isDefined(event.type);
			
			if (validEvent) {

				if (event.type === EventService.EVENT.ISSUES_READY) {
					
					// If no model is loaded it is the first time 
					// the viewer has loaded
					if (!vm.currentModel) {
						vm.initViewer();
					} else {
						// Load the model
						vm.loadViewerModel();	
					}
					
				}

				if (event.type === EventService.EVENT.VIEWER.UNITY_READY) {
					// When the viewer and unity are ready send a load model event 
					// to load the model
					if (!vm.currentModel) {
						vm.loadViewerModel();	
					}

				}

				if (event.type === EventService.EVENT.VIEWER.UNITY_ERROR) {
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(true)
							.title("Unity Error")
							.htmlContent(event.value.message)
							.ariaLabel("Unity Error")
							.ok("OK")
					).then(function() {
						if (event.value.reload) {
							location.reload();
						}
					}, function() {
						console.warn("Unity errorered and user cancelled reload");
					});
				}

				if (event.type === EventService.EVENT.VIEWER.START_LOADING) {

					vm.initialisedPromise.resolve();
					fetchModelProperties(vm.account, vm.model, vm.branch, vm.revision);	

				} else if (vm.initialisedPromise)  {

					vm.initialisedPromise.promise.then(function() {

						if (event.type === EventService.EVENT.VIEWER.GO_HOME) {
							vm.viewer.showAll();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_FULLSCREEN) {
							vm.viewer.switchFullScreen(null);
						} else if (event.type === EventService.EVENT.VIEWER.ENTER_VR) {
							vm.oculus.switchVR();
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK) {
							vm.viewer.onViewpointChanged(event.value.callback);
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK) {
							vm.viewer.onMouseMove(event.value.callback);
						} else if (event.type === EventService.EVENT.MODEL_SETTINGS_READY) {
							if (event.value.account === vm.account && event.value.model === vm.model) {
								vm.viewer.updateSettings(event.value.settings);
								//vm.mapTile && vm.mapTile.updateSettings(event.value.settings);
							}
						} else if (event.type === EventService.EVENT.VIEWER.ADD_PIN) {
							vm.viewer.addPin(
								event.value.account,
								event.value.model,
								event.value.id,
								event.value.pickedPos,
								event.value.pickedNorm,
								event.value.colours,
								event.value.viewpoint
							);
						} else if (event.type === EventService.EVENT.VIEWER.REMOVE_PIN) {
							vm.viewer.removePin(
								event.value.id
							);
						} else if (event.type === EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR) {
							vm.viewer.changePinColours(
								event.value.id,
								event.value.colours
							);
						} else if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
							vm.viewer.clickPin(event.value.id);
						} else if (event.type === EventService.EVENT.VIEWER.SET_PIN_VISIBILITY) {
							vm.viewer.setPinVisibility(event.value.id, event.value.visibility);
						} else if (event.type === EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES) {
							vm.viewer.clearClippingPlanes();

						} else if (event.type === EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES) {
							vm.viewer.updateClippingPlanes(
								event.value.clippingPlanes, event.value.fromClipPanel,
								event.value.account, event.value.model);							
						} else if ((event.type === EventService.EVENT.VIEWER.GET_CURRENT_OBJECT_STATUS)) {
							vm.viewer.getObjectsStatus(
								event.value.account,
								event.value.model,
								event.value.promise
							);
						/*} else if ((event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
							if(!event.value.noHighlight)
							{

								vm.viewer.highlightObjects(
									event.value.account,
									event.value.model,
									event.value.id ? [event.value.id] : event.value.ids,
									event.value.zoom,
									event.value.colour
								);
							}*/
						} else if (event.type === EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS) {
							vm.viewer.highlightObjects(
								event.value.account,
								event.value.model,
								event.value.id ? [event.value.id] : event.value.ids,
								event.value.zoom,
								event.value.colour,
								event.value.multi
							);
						} else if (event.type === EventService.EVENT.VIEWER.HIGHLIGHT_AND_UNHIGHLIGHT_OBJECTS) {
							vm.viewer.highlightAndUnhighlightObjects(
								event.value.account,
								event.value.model,
								event.value.highlight_ids,
								event.value.unhighlight_ids,
								event.value.zoom,
								event.value.colour
							);
						} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
							vm.viewer.highlightObjects();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY) {
							vm.viewer.switchObjectVisibility(
								event.value.account,
								event.value.model,
								event.value.ids,
								event.value.visible
							);
						} else if (event.type === EventService.EVENT.VIEWER.SET_CAMERA) {
	
							vm.currentModelPromise.then(function(){
								vm.viewer.setCamera(
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
								console.error("Setting the camera errored because model failed to load: ", error);
							});
							
						} else if (event.type === EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT) {
							if (angular.isDefined(event.value.promise)) {
								vm.viewer.getCurrentViewpointInfo(event.value.account, event.value.model, event.value.promise);
							}
						} else if (event.type === EventService.EVENT.VIEWER.GET_SCREENSHOT) {
							if (angular.isDefined(event.value.promise)) {
								vm.viewer.getScreenshot(event.value.promise);
							}
						} else if (event.type === EventService.EVENT.VIEWER.SET_NAV_MODE) {
							vm.viewer.setNavMode(event.value.mode);
						} else if (event.type === EventService.EVENT.MEASURE_MODE) {
							vm.measure.measureMode(event.value);
						} else if (event.type === EventService.EVENT.VIEWER.UPDATE_URL){
					
							$location.path("/" + vm.account + "/" + vm.model).search({
								at: event.value.at,
								view: event.value.view,
								up: event.value.up
							});
						} else if (event.type === EventService.EVENT.MULTI_SELECT_MODE) {
							vm.viewer.setMultiSelectMode(event.value);
						} else if (event.type === EventService.EVENT.PIN_DROP_MODE) {
							vm.viewer.setPinDropMode(event.value);
						} 

					});

				}
					

			}
		});

		vm.loadViewerModel = function() {

			vm.currentModelPromise = vm.viewer.loadModel(vm.account, vm.model, vm.branch, vm.revision);

			// Set the current model in the viewer
			vm.currentModel = vm.model;

		};

	}
}());
