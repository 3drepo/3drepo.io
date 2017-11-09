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
		.component("model", {
			restrict: "E",
			bindings: {
				account:  "=",
				model:  "=",
				branch:   "=",
				revision: "=",
				issueId: "=",
				state:    "=",
				keysDown: "<"
			},
			templateUrl: "templates/model.html",
			controller: ModelCtrl,
			controllerAs: "vm"
		});

	ModelCtrl.$inject = [
		"$window", "$timeout", "$scope", "$element", 
		"$location", "$compile", "$mdDialog", "EventService",
		"TreeService", "RevisionsService", 
		"AuthService", "IssuesService", "MultiSelectService", 
		"StateManager", "PanelService", "ViewerService"
	];

	function ModelCtrl(
		$window, $timeout, $scope, $element, 
		$location, $compile, $mdDialog, EventService, 
		TreeService, RevisionsService, 
		AuthService, IssuesService, MultiSelectService, 
		StateManager, PanelService, ViewerService
	) {

		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {

			vm.issuesCardIndex = 0;
			vm.pointerEvents = "inherit";

			history.pushState(null, null, document.URL);
			var popStateHandler = function(event) {
				StateManager.popStateHandler(event, vm.account, vm.model);
			};

			var refreshHandler = function (event) {
				return StateManager.refreshHandler(event); 
			};

			//listen for user clicking the back button
			window.addEventListener("popstate", popStateHandler);
			window.addEventListener("beforeunload", refreshHandler);

			$scope.$on("$destroy", function() {
				window.removeEventListener("beforeunload", refreshHandler);
				window.removeEventListener("popstate", popStateHandler);
			});

			$timeout(function () {
				// Get the model element
				vm.modelUI = angular.element($element[0].querySelector("#modelUI"));
			});
			
		};

		vm.handleModelError = function(){
			var message = "The model was either not found, failed to load correctly "+
			"or you are not authorized to view it. " +
			" You will now be redirected to the teamspace page.";

			$mdDialog.show(
				$mdDialog.alert()
					.clickOutsideToClose(true)
					.title("Model Error")
					.textContent(message)
					.ariaLabel("Model Error")
					.ok("OK")
			);
		
			$location.path(AuthService.getUsername());
		};

		vm.setupModelInfo = function() {

			IssuesService.init();
			RevisionsService.listAll(vm.account, vm.model);

			if (!ViewerService.currentModel.model) {
				console.debug("Initiating Viewer");
				ViewerService.initViewer()
					.then(function(){
						ViewerService.loadViewerModel(
							vm.account, 
							vm.model, 
							vm.branch, 
							vm.revision
						);	
					});
			} else {
				// Load the model
				ViewerService.loadViewerModel(
					vm.account, 
					vm.model, 
					vm.branch, 
					vm.revision
				);
			}

			ViewerService.getModelInfo(vm.account, vm.model)
				.then(function (response) {
					var data = response.data;
					vm.settings = data;

					var isFederation = data.federate;
					if(isFederation){
						PanelService.hideSubModels(vm.issuesCardIndex, false);
					} else {
						PanelService.hideSubModels(vm.issuesCardIndex, true);
					}

					EventService.send(EventService.EVENT.MODEL_SETTINGS_READY, data);

					TreeService.init(vm.account, vm.model, vm.branch, vm.revision, data).then(function(tree){
						EventService.send(EventService.EVENT.TREE_READY, tree);
						vm.treeMap = TreeService.getMap(tree.nodes).then();
					});
				})
				.catch(function(error){
					console.error(error);
					// If we are not logged in the 
					// session expired popup takes prescedence
					if (error.data.message !== "You are not logged in") {
						vm.handleModelError();
					}
				});

		};

		$scope.$watchGroup(["vm.account", "vm.model"], function() {
			if (vm.account && vm.model) {
				angular.element(function(){
					vm.setupModelInfo();
				});
			}
		});

		$scope.$watch("vm.keysDown", function() {
			MultiSelectService.handleKeysDown(vm.keysDown);
		});

		$scope.$watch("vm.issueId", function(){
			if(vm.issueId){
				// timeout to make sure event is sent after issue panel card is setup
				$timeout(function () {
					IssuesService.issueId = vm.issueId;
				});
			}
		});


		/*
		 * Watch for events
		 */
		$scope.$watch(EventService.currentEvent, function (event) {

			vm.event = event;
			
			if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				vm.pointerEvents = event.value.on ? "none" : "inherit";
			} 
			
		});


		/**
		 * Get the current multi selection
		 * @param selectedObjects
		 */
		vm.setSelectedObjects = function (selectedObjects) {
			vm.selectedObjects = selectedObjects;
		};

		/**
		 * Initalise the list of selected objects
		 * @param data
		 */
		vm.setInitialSelectedObjects = function (data) {
			vm.initialSelectedObjects = data.selectedObjects;
			// Set the value to null so that it will be registered again
			$timeout(function () {
				vm.initialSelectedObjects = null;
			});
		};


	}
}());
