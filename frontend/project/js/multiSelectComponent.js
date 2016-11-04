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
					treeMap: "<",
					keysDown: "<",
					sendEvent: "&",
					event: "<",
					setSelectedObjects: "&",
					initialSelectedObjects: "<"
				}
			}
		);

	MultiSelectCtrl.$inject = ["EventService", "TreeService"];

	function MultiSelectCtrl (EventService, TreeService) {
		var self = this,
			objectIndex,
			selectedObjects = [],
			deselectedObjects = [],
			cmdKey = 91,
			ctrlKey = 17,
			isMac = (navigator.platform.indexOf("Mac") !== -1),
			multiMode = false,
			pinDropMode = false;

		// Init
		this.setSelectedObjects({selectedObjects: null});

		/**
		 * Handle component input changes
		 */
		this.$onChanges = function (changes) {
			// Keys down
			console.log('tree', self.treeMap);

			if (changes.hasOwnProperty("keysDown")) {
				if ((isMac && changes.keysDown.currentValue.indexOf(cmdKey) !== -1) || (!isMac && changes.keysDown.currentValue.indexOf(ctrlKey) !== -1)) {
					multiMode = true;
					if (selectedObjects.length === 1) {
						self.setSelectedObjects({selectedObjects: selectedObjects});
					}
					this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: true});
					this.displaySelectedObjects(selectedObjects, deselectedObjects);
				}
				else if (((isMac && changes.keysDown.currentValue.indexOf(cmdKey) === -1) || (!isMac && changes.keysDown.currentValue.indexOf(ctrlKey) === -1))) {
					multiMode = false;
					this.sendEvent({type: EventService.EVENT.MULTI_SELECT_MODE, value: false});
				}
			}

			// Events
			if (changes.hasOwnProperty("event") && changes.event.currentValue) {
				if ((changes.event.currentValue.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) && !pinDropMode) {

					var sharedId = TreeService.uIdToSharedId(self.treeMap.nodes, changes.event.currentValue.value.id);

					if (multiMode) {
						// Collect objects in multi mode
						deselectedObjects = [];
						objectIndex = -1;
						selectedObjects.find(function(obj, i){
							if(obj.shared_id === sharedId){
								objectIndex = i;
							}
						});
						if (objectIndex === -1) {

							
							//console.log('sharedId', sharedId);

							selectedObjects.push({
								id: changes.event.currentValue.value.id,
								shared_id: sharedId,
								account: changes.event.currentValue.value.account,
								project: changes.event.currentValue.value.project
							});
						}
						else {
							deselectedObjects.push(selectedObjects[objectIndex]);
							selectedObjects.splice(objectIndex, 1)
						}
						this.displaySelectedObjects(selectedObjects, deselectedObjects);

						if (selectedObjects.length > 0) {
							self.setSelectedObjects({selectedObjects: selectedObjects});
						}
						else {
							self.setSelectedObjects({selectedObjects: null});
						}
					}
					else {
						// Can only select one object at a time when not in multi mode
						selectedObjects = [{
								id: changes.event.currentValue.value.id,
								shared_id: sharedId,
								account: changes.event.currentValue.value.account,
								project: changes.event.currentValue.value.project
						}];
					}
				}
				else if (changes.event.currentValue.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					if (selectedObjects.length > 0) {
						selectedObjects = [];
						self.setSelectedObjects({selectedObjects: null});
					}
				}
				else if (changes.event.currentValue.type === EventService.EVENT.PIN_DROP_MODE) {
					pinDropMode = changes.event.currentValue.type;
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

			var highlightIds = [];
			var unHighlightIds = [];

			selectedObjects.forEach(function(obj){
				highlightIds.push(obj.id);
			});

			deselectedObjects.forEach(function(obj){
				unHighlightIds.push(obj.id);
			});
			
			var data = {
				source: "tree",
				account: this.account,
				project: this.project,
				highlight_ids: highlightIds,
				unhighlight_ids: unHighlightIds
			};
			this.sendEvent({type: EventService.EVENT.VIEWER.HIGHLIGHT_AND_UNHIGHLIGHT_OBJECTS, value: data});
		};
	}
}());