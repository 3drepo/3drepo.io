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
			if (changes.hasOwnProperty("keysDown") && changes.keysDown.currentValue) {
				multiMode = ((isMac && this.keysDown.indexOf(cmdKey) !== -1) || (!isMac && this.keysDown.indexOf(ctrlKey) !== -1));
				this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: multiMode});
				/*
				if (multiMode) {
					this.displaySelectedObjects(selectedObjects);
				}
				else {
					this.displaySelectedObjects([]);
				}
				*/
			}

			if (changes.hasOwnProperty("event") && changes.event.currentValue) {
				if (multiMode && (changes.event.currentValue.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
					objectIndex = selectedObjects.indexOf(changes.event.currentValue.value.id);
					if (objectIndex === -1) {
						selectedObjects.push(changes.event.currentValue.value.id);
					}
					else {
						selectedObjects.splice(objectIndex, 1);
					}
					this.displaySelectedObjects(selectedObjects);

					if (selectedObjects.length > 0) {
						self.setSelectedObjects({selectedObjects: selectedObjects});
					}
					else {
						self.setSelectedObjects({selectedObjects: null});
					}
				}
				else if (changes.event.currentValue.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					selectedObjects = [];
					self.setSelectedObjects({selectedObjects: null});
				}
			}

			if (changes.hasOwnProperty("initialSelectedObjects") && this.initialSelectedObjects) {
				selectedObjects = this.initialSelectedObjects;
				this.displaySelectedObjects(selectedObjects);
			}
		};

		/**
		 * Handle remove
		 */
		this.$onDestroy = function () {
			this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: false});
		};

		this.displaySelectedObjects = function (selectedObjects) {
			var data = {
				source: "tree",
				account: this.account,
				project: this.project,
				ids: selectedObjects
			};
			this.sendEvent({type: EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, value: data});
		};
	}
}());