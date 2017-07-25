/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesPin of the GNU Affero General Public License as
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
		.component("issuesPin", {
			controller: IssuesPinCtrl,
			controllerAs: "vm",
			bindings: {
				account: "<",
				model: "<",
				event: "<",
				setPin: "&",
				clearPin: "<"
			},
			bindToController: true
		});

	IssuesPinCtrl.$inject = ["$scope", "EventService"];

	function IssuesPinCtrl ($scope, EventService) {
		var vm = this;
			

		// Init
		vm.$onInit = function() {
			vm.newPinId = "newPinId";
			vm.pinDropMode = false;
			vm.setPin({data: null});
		};

		$scope.$watch(EventService.currentEvent, function(event) {

			var data,
				position = [],
				normal = [];

			if (event) {

				if (event.type === EventService.EVENT.VIEWER.PICK_POINT &&
					event.value.hasOwnProperty("id") &&
					vm.pinDropMode
				) {

					vm.removePin();

					var trans = event.value.trans;
					position = event.value.position;
					normal = event.value.normal;

					if(trans) {
						position = trans.inverse().multMatrixPnt(position);
					}

					data = {
						id: vm.newPinId,
						account: vm.account,
						model: vm.model,
						selectedObjectId: event.value.id,
						pickedPos: position,
						pickedNorm: normal,
						colours: Pin.pinColours.yellow

					};
					EventService.send(EventService.EVENT.VIEWER.ADD_PIN, data);
					vm.setPin({data: data});

				} else if (
					event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED_PIN_MODE && 
					vm.pinDropMode
				) {

					vm.removePin();

				} else if (event.type === EventService.EVENT.PIN_DROP_MODE) {

					if (event.value === "saveIssue") {
						vm.pinDropMode = false;
					} else {
						vm.pinDropMode = event.value;
						if (!vm.pinDropMode) {
							vm.removePin();
						}
					}
				
				}
			}



		});


		/**
		 * Remove pin when component is destroyed
		 */
		vm.$onDestroy = function () {
			vm.removePin();
		};

		vm.removePin = function() {
			EventService.send(
				EventService.EVENT.VIEWER.REMOVE_PIN, 
				{id: vm.newPinId}
			);
			vm.setPin({data: null});
		};
	}
}());
