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
				bindings: {
					account: "<",
					project: "<",
					keysDown: "<",
					sendEvent: "&",
					event: "<",
					setSelectedObjects: "&",
					initialSelectedObjects: "<"
				}
			}
		);

	MultiSelectCtrl.$inject = ["EventService"];

	function MultiSelectCtrl (EventService) {
		var self = this,
			objectIndex,
			selectedObjects = [],
			deselectedObjects = [],
			cmdKey = 91,
			ctrlKey = 17,
			isMac = (navigator.platform.indexOf("Mac") !== -1),
			multiMode = false;

		// Init
		this.setSelectedObjects({selectedObjects: null});

		/**
		 * Handle component input changes
		 */
		this.$onChanges = function (changes) {
			// Keys down
			if (changes.hasOwnProperty("keysDown")) {
				if ((isMac && changes.keysDown.currentValue.indexOf(cmdKey) !== -1) || (!isMac && changes.keysDown.currentValue.indexOf(ctrlKey) !== -1)) {
					multiMode = true;
					this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: multiMode});
					this.displaySelectedObjects(selectedObjects, deselectedObjects);
				}
				else if (multiMode &&
						 ((isMac && changes.keysDown.currentValue.indexOf(cmdKey) === -1) || (!isMac && changes.keysDown.currentValue.indexOf(ctrlKey) === -1))) {
					multiMode = false;
					this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: multiMode});
				}
			}

			// Events
			if (changes.hasOwnProperty("event") && changes.event.currentValue) {
				if (multiMode && (changes.event.currentValue.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
					deselectedObjects = [];
					objectIndex = selectedObjects.indexOf(changes.event.currentValue.value.id);
					if (objectIndex === -1) {
						selectedObjects.push(changes.event.currentValue.value.id);
					}
					else {
						deselectedObjects.push(selectedObjects.splice(objectIndex, 1));
					}
					this.displaySelectedObjects(selectedObjects, deselectedObjects);

					if (selectedObjects.length > 0) {
						self.setSelectedObjects({selectedObjects: selectedObjects});
					}
					else {
						self.setSelectedObjects({selectedObjects: null});
					}
				}
				else if (changes.event.currentValue.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					if (selectedObjects.length > 0) {
						this.displaySelectedObjects([], selectedObjects);
						selectedObjects = [];
						self.setSelectedObjects({selectedObjects: null});
					}
				}
			}

			// Initialise selected objects
			if (changes.hasOwnProperty("initialSelectedObjects") && this.initialSelectedObjects) {
				selectedObjects = this.initialSelectedObjects;
				this.displaySelectedObjects(selectedObjects, deselectedObjects);
			}
		};

		/**
		 * Handle remove
		 */
		this.$onDestroy = function () {
			this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: false});
		};

		/**
		 * Highlight and unhighlight objects
		 * @param selectedObjects
		 * @param deselectedObjects
		 */
		this.displaySelectedObjects = function (selectedObjects, deselectedObjects) {
			var data = {
				source: "tree",
				account: this.account,
				project: this.project,
				highlight_ids: selectedObjects,
				unhighlight_ids: deselectedObjects
			};
			this.sendEvent({type: EventService.EVENT.VIEWER.HIGHLIGHT_AND_UNHIGHLIGHT_OBJECTS, value: data});
		};
	}
}());