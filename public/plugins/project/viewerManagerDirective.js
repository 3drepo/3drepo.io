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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("viewermanager", viewerManager);

	function viewerManager() {
		return {
			restrict: "E",
			controller: ViewerManagerCtrl,
			scope: true,
			templateUrl: "viewermanager.html",
			controllerAs: "vm",
			bindToController: true
		};
	}

	function ViewerManagerService(nextEventService) {
		var currentEvent = {};
		var currentError = {};

		var sendInternal = function(type, value) {
			currentEvent = {type:type, value: value};
		};

		var send = function (type, value) {
			sendInternal(type, value);
			nextEventService.send(type, value);
		};

		var sendErrorInternal = function(type, value) {
			currentError = {type: type, value: value};
		};

		var sendError = function(type, value) {
			sendErrorInternal(type, value);
			nextEventService.sendError(type, value);
		};

		return {
			currentEvent: function() {return currentEvent;},
			currentError: function() {return currentError;},
			send: send,
			sendInternal: sendInternal,
			sendError: sendError,
			sendErrorInternal: sendErrorInternal
		};
	}

	ViewerManagerCtrl.$inject = ["$scope", "$q", "$element", "EventService"];

	function ViewerManagerCtrl($scope, $q, $element, EventService) {
		var vm = this;

		vm.manager = new ViewerManager($element[0]);
		vm.vmservice = ViewerManagerService(EventService);

		vm.viewers = {};

		$scope.manager = vm.manager;

		vm.viewerInit   = $q.defer();
		vm.viewerLoaded = $q.defer();

		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.CREATE_VIEWER) {
					// If a viewer with the same name exists already then
					// throw an error, otherwise add it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						EventService.sendError(EventService.ERROR.DUPLICATE_VIEWER_NAME, {
							name: event.value.name
						});
					} else {
						vm.viewers[event.value.name] = event.value;
					}
				} else if (event.type === EventService.EVENT.CLOSE_VIEWER) {
					// If the viewer exists in the list then delete it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						delete vm.viewers[event.value.name];
					}
				} else if (event.type === EventService.EVENT.VIEWER.READY) {
					window.viewer = vm.manager.getCurrentViewer();
				} else {
					vm.vmservice.sendInternal(event.type, event.value);
				}
			}
		});
	}
}());
