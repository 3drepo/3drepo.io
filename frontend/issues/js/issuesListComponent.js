/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesList of the GNU Affero General Public License as
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
			"issuesList",
			{
				controller: IssuesListCtrl,
				templateUrl: "issuesList.html",
				bindings: {
					account: "<",
					project: "<",
					issuesToShow: "<",
					sendEvent: "&",
					event: "<",
					onEditIssue: "&",
					nonListSelect: "<",
					keysDown: "<"
				}
			}
		);

	IssuesListCtrl.$inject = ["UtilsService", "IssuesService", "EventService"];

	function IssuesListCtrl (UtilsService, IssuesService, EventService) {
		var self = this,
			i, length,
			selectedIssue = null,
			selectedIssueIndex = null;

		// Init
		this.UtilsService = UtilsService;
		this.IssuesService = IssuesService;
		// Get a possible selected issue
		for (i = 0, length = this.issuesToShow.length; i < length; i += 1) {
			if (this.issuesToShow[i].selected) {
				selectedIssue = this.issuesToShow[i];
				setSelectedIssueIndex(selectedIssue);
				break;
			}
		}

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var upArrow = 38,
				downArrow = 40,
				rightArrow = 39,
				keysDown,
				event = {type: "click"};

			if (changes.hasOwnProperty("keysDown") && (this.keysDown.length > 0) && (selectedIssueIndex !== null)) {
				if ((self.keysDown[0] === downArrow) || (self.keysDown[0] === upArrow)) {
					if ((self.keysDown[0] === downArrow) && (selectedIssueIndex !== (this.issuesToShow.length - 1))) {
						selectedIssue.selected = false;
						selectedIssueIndex += 1;
					}
					else if ((self.keysDown[0] === upArrow) && (selectedIssueIndex !== 0)) {
						selectedIssue.selected = false;
						selectedIssueIndex -= 1;
					}
					deselectPin(selectedIssue);
					selectedIssue = this.issuesToShow[selectedIssueIndex];
					selectedIssue.selected = true;
					setSelectedIssueIndex(selectedIssue);
					showIssue(selectedIssue);
				}
				else if (self.keysDown[0] === rightArrow) {
					self.editIssue(selectedIssue);
				}
			}

			if (changes.hasOwnProperty("nonListSelect") && this.nonListSelect) {
				this.select(event, this.nonListSelect);
			}

			if (changes.hasOwnProperty("event") && this.event) {
				if (this.event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
					pinClicked(this.event.value.id);
				}
			}
		};

		/**
		 * Select issue
		 * @param event
		 * @param issue
		 */
		this.select = function (event, issue) {
			if (event.type === "click") {
				if (selectedIssue === null) {
					selectedIssue = issue;
					selectedIssue.selected = true;
					showIssue(selectedIssue);
					setSelectedIssueIndex(selectedIssue);
				}
				else if (selectedIssue._id === issue._id) {
					selectedIssue.selected = false;
					deselectPin(selectedIssue);
					selectedIssue = null;
					setSelectedIssueIndex(selectedIssue);
				}
				else {
					selectedIssue.selected = false;
					deselectPin(selectedIssue);
					selectedIssue = issue;
					selectedIssue.selected = true;
					showIssue(selectedIssue);
					setSelectedIssueIndex(selectedIssue);
				}
			}
		};

		/**
		 * Set up editing of issue
		 */
		this.editIssue = function (issue) {
			this.onEditIssue({issue: issue});
		};

		/**
		 * Set the selected issue index
		 * @param selectedIssue
		 */
		function setSelectedIssueIndex (selectedIssue) {
			var i, length;

			if (selectedIssue !== null) {
				for (i = 0, length = self.issuesToShow.length; i < length; i += 1) {
					if (self.issuesToShow[i]._id === selectedIssue._id) {
						selectedIssueIndex = i;
					}
				}
			}
			else {
				selectedIssueIndex = null;
			}
		}

		/**
		 * Show issue details
		 * @param issue
		 */
		function showIssue (issue) {
			var data,
				pinHighlightColour = [1.0000, 0.7, 0.0];

			// Highlight pin, move camera and setup clipping plane
			data = {
				id: issue._id,
				colours: pinHighlightColour
			};
			self.sendEvent({type: EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, value: data});

			data = {
				position : issue.viewpoint.position,
				view_dir : issue.viewpoint.view_dir,
				up: issue.viewpoint.up
			};
			self.sendEvent({type: EventService.EVENT.VIEWER.SET_CAMERA, value: data});

			data = {
				clippingPlanes: issue.viewpoint.clippingPlanes
			};
			self.sendEvent({type: EventService.EVENT.VIEWER.SET_CLIPPING_PLANES, value: data});

			// Remove highlight from any multi objects
			self.sendEvent({type: EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, value: []});

			// Show multi objects
			if (issue.hasOwnProperty("group_id")) {
				UtilsService.doGet(self.account + "/" + self.project + "/groups/" + issue.group_id).then(function (response) {
					data = {
						source: "tree",
						account: self.account,
						project: self.project,
						ids: response.data.parents,
						colour: response.data.colour
					};
					EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, data);
				});
			}
		}

		/**
		 * Set the issue pin to look deselected
		 * @param issue
		 */
		function deselectPin (issue) {
			var data;
			// Issue with position means pin
			if (issue.position.length > 0) {
				data = {
					id: issue._id,
					colours: [[0.5, 0, 0]]
				};
				self.sendEvent({type: EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, value: data});
			}
		}

		/**
		 * Pin clicked in viewer
		 * @param issueId
		 */
		function pinClicked (issueId) {
			var i, length;

			for (i = 0, length = self.issuesToShow.length; i < length; i += 1) {
				if (self.issuesToShow[i]._id === issueId) {
					selectedIssue = self.issuesToShow[i];
					setSelectedIssueIndex(selectedIssue);
					self.onEditIssue({issue: selectedIssue});
					break;
				}
			}
		}
	}
}());