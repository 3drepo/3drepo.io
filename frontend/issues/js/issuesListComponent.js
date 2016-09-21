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
					allIssues: "<",
					filterText: "<",
					sendEvent: "&",
					event: "<",
					onEditIssue: "&",
					nonListSelect: "<",
					keysDown: "<",
					contentHeight: "&"
				}
			}
		);

	IssuesListCtrl.$inject = ["$filter", "UtilsService", "IssuesService", "EventService"];

	function IssuesListCtrl ($filter, UtilsService, IssuesService, EventService) {
		var self = this,
			i, length,
			selectedIssue = null,
			selectedIssueIndex = null,
			issuesListItemHeight = 150,
			infoHeight = 81,
			issuesToShowWithPinsIDs;

		// Init
		this.UtilsService = UtilsService;
		this.IssuesService = IssuesService;

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

			// All issues
			if (changes.hasOwnProperty("allIssues") && this.allIssues) {
				if (this.allIssues.length > 0) {
					self.toShow = "list";
					setupIssuesToShow();
					// Get a possible selected issue
					for (i = 0, length = this.issuesToShow.length; i < length; i += 1) {
						if (this.issuesToShow[i].selected) {
							selectedIssue = this.issuesToShow[i];
							setSelectedIssueIndex(selectedIssue);
							break;
						}
					}
					self.contentHeight({height: self.issuesToShow.length * issuesListItemHeight});
					showPins();
				}
				else {
					self.toShow = "info";
					self.info = "There are currently no open issues";
					self.contentHeight({height: infoHeight});
				}
			}

			// Filter text
			if (changes.hasOwnProperty("filterText") && (typeof this.filterText !== "undefined")) {
				setupIssuesToShow();
				showPins();
			}

			// Keys down
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

			// Non list select
			if (changes.hasOwnProperty("nonListSelect") && this.nonListSelect) {
				this.select(event, this.nonListSelect);
			}

			// Event
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

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0,
				roleAssigned,
				sortedIssuesLength,
				sortOldestFirst	 = true,
				showClosed = true;

			self.issuesToShow = [];
			issuesToShowWithPinsIDs = {};

			if (self.allIssues.length > 0) {
				// Sort
				self.issuesToShow = [self.allIssues[0]];
				for (i = 1, length = self.allIssues.length; i < length; i += 1) {
					for (j = 0, sortedIssuesLength = self.issuesToShow.length; j < sortedIssuesLength; j += 1) {
						if (((self.allIssues[i].created > self.issuesToShow[j].created) && (sortOldestFirst)) ||
							((self.allIssues[i].created < self.issuesToShow[j].created) && (!sortOldestFirst))) {
							self.issuesToShow.splice(j, 0, self.allIssues[i]);
							break;
						}
						else if (j === (self.issuesToShow.length - 1)) {
							self.issuesToShow.push(self.allIssues[i]);
						}
					}
				}

				// Filter text
				if (angular.isDefined(self.filterText) && self.filterText !== "") {

					// Helper function for searching strings
					var stringSearch = function(superString, subString)
					{
						return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
					};

					self.issuesToShow = ($filter('filter')(self.issuesToShow, function(issue) {
						// Required custom filter due to the fact that Angular
						// does not allow compound OR filters
						var i;

						// Search the title
						var show = stringSearch(issue.title, self.filterText);
						show = show || stringSearch(issue.timeStamp, self.filterText);
						show = show || stringSearch(issue.owner, self.filterText);

						// Search the list of assigned issues
						if (!show && issue.hasOwnProperty("assigned_roles"))
						{
							i = 0;
							while(!show && (i < issue.assigned_roles.length))
							{
								show = show || stringSearch(issue.assigned_roles[i], self.filterText);
								i += 1;
							}
						}

						// Search the comments
						if (!show && issue.hasOwnProperty("comments"))
						{
							i = 0;

							while(!show && (i < issue.comments.length))
							{
								show = show || stringSearch(issue.comments[i].comment, self.filterText);
								show = show || stringSearch(issue.comments[i].owner, self.filterText);
								i += 1;
							}
						}

						return show;
					}));

					//{title : self.filterText} || {comments: { comment : self.filterText }} ));
				}

				// Don't show issues assigned to certain roles
				/*
				if (rolesToFilter.length > 0) {
					i = 0;
					while(i < self.issuesToShow.length) {
						roleAssigned = false;

						if (self.issuesToShow[i].hasOwnProperty("assigned_roles")) {
							for (j = 0, length = self.issuesToShow[i].assigned_roles.length; j < length; j += 1) {
								if (rolesToFilter.indexOf(self.issuesToShow[i].assigned_roles[j]) !== -1) {
									roleAssigned = true;
								}
							}
						}

						if (roleAssigned) {
							self.issuesToShow.splice(i, 1);
						} else {
							i += 1;
						}
					}
				}
				*/

				// Closed
				for (i = (self.issuesToShow.length - 1); i >= 0; i -= 1) {
					if (!showClosed && self.issuesToShow[i].hasOwnProperty("closed") && self.issuesToShow[i].closed) {
						self.issuesToShow.splice(i, 1);
					}
				}
			}

			// Create list of issues to show with pins
			for (i = 0, length = self.issuesToShow.length; i < length; i += 1) {
				if (self.issuesToShow[i].position.length > 0) {
					issuesToShowWithPinsIDs[self.issuesToShow[i]._id] = true;
				}
			}

			// Setup what to show
			if (self.issuesToShow.length > 0) {
				self.toShow = "list";
				self.contentHeight({height: self.issuesToShow.length * issuesListItemHeight});
			}
			else {
				self.toShow = "info";
				self.info = "No issues to show";
				self.contentHeight({height: infoHeight});
			}
		}

		/**
		 * Add issue pins to the viewer
		 */
		function showPins () {
			var pin,
				pinData;

			// Go through all issues with pins
			for (i = 0, length = self.allIssues.length; i < length; i += 1) {
				if (self.allIssues[i].position.length > 0) {
					pin = angular.element(document.getElementById(self.allIssues[i]._id));
					if (pin.length > 0) {
						// Existing pin
						if (issuesToShowWithPinsIDs[self.allIssues[i]._id]) {
							pin[0].setAttribute("render", "true");
						}
						else {
							pin[0].setAttribute("render", "false");
						}
					}
					else {
						// Create new pin
						pinData = {
							id: self.allIssues[i]._id,
							position: self.allIssues[i].position,
							norm: self.allIssues[i].norm,
							account: self.account,
							project: self.project
						};
						IssuesService.addPin(pinData, [[0.78, 0, 0]], self.allIssues[i].viewpoint);
					}
				}
			}
		}
	}
}());