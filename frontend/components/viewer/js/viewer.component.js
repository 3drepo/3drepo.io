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
					scope.vm.viewer.reset(); // Remove events watch
				});
			},
			controller: ViewerCtrl,
			controllerAs: "vm"
		});

	ViewerCtrl.$inject = [
		"$scope", "$q", "$element", "$timeout", 
		"ClientConfigService", "EventService", "ViewerService"
	];

	function ViewerCtrl (
		$scope, $q, $element, $timeout, 
		ClientConfigService, EventService, ViewerService
	) {

		var vm = this;

		vm.$onInit = function() {

			vm.branch   = vm.branch ? vm.branch : "master";
			vm.revision = vm.revision ? vm.revision : "head";

			vm.pointerEvents = "auto";
			vm.measureMode = false;
			
			vm.viewer = ViewerService.getViewer(
				vm.name,
				$element[0], 
				EventService.send, 
				ViewerService.handleError
			);
	
			vm.viewer.prepareViewer();
			
		};

		$scope.$watch(function(){
			return ViewerService.pin;
		}, function(){

			vm.viewer.setPinDropMode(ViewerService.pin.pinDropMode);
			
		}, true);


		$scope.$watch(EventService.currentEvent, function(event) {

			var validEvent = angular.isDefined(event) && angular.isDefined(event.type);
			
			if (validEvent && ViewerService.initialised) {
				ViewerService.handleEvent(event, vm.account, vm.model);
			}

		});

	}
}());
