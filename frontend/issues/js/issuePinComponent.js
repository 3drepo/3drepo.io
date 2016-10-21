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
		.component(
			"issuesPin",
			{
				controller: IssuesPinCtrl,
				bindings: {
					account: "<",
					project: "<",
					sendEvent: "&",
					event: "<",
					setPin: "&",
					clearPin: "<"
				}
			}
		);

	IssuesPinCtrl.$inject = ["EventService"];

	function IssuesPinCtrl (EventService) {
		var self = this,
			newPinId = "newPinId",
			pinDropMode = false;

		// Init
		this.setPin({data: null});

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var data,
				position = [],
				normal = [],
				pickedPos = null,
				pickedNorm = null;

			if (changes.hasOwnProperty("event") && (changes.event.currentValue !== null)) {
				if ((changes.event.currentValue.type === EventService.EVENT.VIEWER.PICK_POINT) &&
					(changes.event.currentValue.value.hasOwnProperty("id")) &&
					pinDropMode) {
					removePin();


					var trans = changes.event.currentValue.value.trans;
					position = changes.event.currentValue.value.position;
					normal = changes.event.currentValue.value.normal;

					if(trans)
					{
						position = trans.inverse().multMatrixPnt(position);
					}


					data = {
						id: newPinId,
						account: self.account,
						project: self.project,
						position: position.toGL(),
						norm: normal.toGL(),
						selectedObjectId: changes.event.currentValue.value.id,
						pickedPos: pickedPos,
						pickedNorm: pickedNorm,
						colours: [[0.5, 0, 0]]
					};
					self.sendEvent({type: EventService.EVENT.VIEWER.ADD_PIN, value: data});
					this.setPin({data: data});
				}
				else if (changes.event.currentValue.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					removePin();
				}
				else if (changes.event.currentValue.type === EventService.EVENT.PIN_DROP_MODE) {
					pinDropMode = changes.event.currentValue.value;
				}
			}

			if (changes.hasOwnProperty("clearPin") && changes.clearPin.currentValue) {
				removePin();
			}
		};

		/**
		 * Remove pin when component is destroyed
		 */
		this.$onDestroy = function () {
			removePin();
		};

		function removePin () {
			self.sendEvent({type: EventService.EVENT.VIEWER.REMOVE_PIN, value: {id: newPinId}});
			self.sendEvent({type: EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, value: []});
			self.setPin({data: null});
		}
	}
}());
