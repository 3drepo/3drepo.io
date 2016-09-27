/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesMulti of the GNU Affero General Public License as
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
			"issuesMulti",
			{
				controller: IssuesMultiCtrl,
				bindings: {
					account: "<",
					project: "<",
					selectedObject: "<",
					keysDown: "<",
					clear: "<",
					sendEvent: "&",
					event: "<",
					setMulti: "&"
				}
			}
		);

	IssuesMultiCtrl.$inject = ["EventService"];

	function IssuesMultiCtrl (EventService) {
		var self = this,
			objectIndex,
			selectedObjectIDs = [],
			cmdKey = 91,
			ctrlKey = 17,
			isMac = (navigator.platform.indexOf("Mac") !== -1),
			multiMode = false;

		// Init
		this.setMulti({data: null});

		/**
		 * Handle component input changes
		 */
		this.$onChanges = function (changes) {
			if (changes.hasOwnProperty("keysDown") && angular.isDefined(this.keysDown)) {
				multiMode = ((isMac && this.keysDown.indexOf(cmdKey) !== -1) || (!isMac && this.keysDown.indexOf(ctrlKey) !== -1));
				this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: multiMode});
				if (multiMode) {
					this.displaySelectedObjects(selectedObjectIDs);
				}
				/*
				else {
					this.displaySelectedObjects([]);
				}
				*/
			}
			else if (changes.hasOwnProperty("clear") && this.clear) {
				this.displaySelectedObjects([]);
			}

			if (changes.hasOwnProperty("event")) {
				if (multiMode && (changes.event.currentValue.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
					objectIndex = selectedObjectIDs.indexOf(changes.event.currentValue.value.id);
					if (objectIndex === -1) {
						selectedObjectIDs.push(changes.event.currentValue.value.id);
					}
					else {
						selectedObjectIDs.splice(objectIndex, 1);
					}
					this.displaySelectedObjects(selectedObjectIDs);

					if (selectedObjectIDs.length > 0) {
						self.setMulti({data: selectedObjectIDs});
					}
					else {
						self.setMulti({data: null});
					}
				}
				else if (changes.event.currentValue.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					//removePin();
				}
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