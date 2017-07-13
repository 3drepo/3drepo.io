/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the multiSelect of the GNU Affero General Public License as
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
		.component(
			"multiSelect",
			{
				controller: MultiSelectCtrl,
				contollerAs: "vm",
				bindToController: true,
				bindings: {
					account: "<",
					model: "<",
					treeMap: "<",
					keysDown: "<",
					event: "<",
					setSelectedObjects: "&",
					initialSelectedObjects: "<"
				}
			}
		);

	MultiSelectCtrl.$inject = ["EventService", "$scope"];

	function MultiSelectCtrl (EventService, $scope) {
		var vm = this,
			objectIndex,
			selectedObjects = [],
			deselectedObjects = [],
			cmdKey = 91,
			ctrlKey = 17,
			escKey = 27,
			isMac = (navigator.platform.indexOf("Mac") !== -1),
			multiMode = false,
			pinDropMode = false;



		/**
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			
			if (event.type === EventService.EVENT.PIN_DROP_MODE) {
				pinDropMode = event.value;
			}

		});

		var isMacKey = function(keysDown) {
			return isMac && keysDown.currentValue.indexOf(cmdKey) !== -1
		}

		var isNotMacKey = function(keysDown) {
			return !isMac && keysDown.currentValue.indexOf(ctrlKey) !== -1
		}

		var isKeyDown = function(keysDown) {
			return isMacKey(keysDown) || isNotMacKey(keysDown);
		}

		var isKeyDownNotCtrl = function(keysDown) {
			return ((isMac && keysDown.currentValue.indexOf(cmdKey) === -1) 
				   || (!isMac && keysDown.currentValue.indexOf(ctrlKey) === -1))
		}

		/**
		 * Handle component input changes
		 */
		vm.$onChanges = function (changes) {
			// Keys down
			if (pinDropMode) {
				return;
			}

			if (changes.hasOwnProperty("keysDown")) {

				if (isKeyDown(changes.keysDown)) {

					multiMode = true;
					EventService.send(EventService.EVENT.MULTI_SELECT_MODE, true);

				}
				else if (multiMode === true && isKeyDownNotCtrl(changes.keysDown)) {
	
					multiMode = false;
					EventService.send(EventService.EVENT.MULTI_SELECT_MODE, false);
				} else if (changes.keysDown.currentValue.indexOf(escKey) !== -1) {
					EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, []);

				}

				
			}

		};

		/**
		 * Handle remove
		 */
		vm.$onDestroy = function () {
			EventService.send(EventService.EVENT.MULTI_SELECT_MODE, false);
		};
	}
}());
