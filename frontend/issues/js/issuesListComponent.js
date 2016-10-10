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
					onSelectIssue: "&",
					nonListSelect: "<",
					keysDown: "<",
					contentHeight: "&",
					menuOption: "<",
					importBcf: "&",
					selectedIssue: "<"
				}
			}
		);

	IssuesListCtrl.$inject = ["$filter", "$window", "UtilsService", "IssuesService", "EventService", "serverConfig"];

	function IssuesListCtrl ($filter, $window, UtilsService, IssuesService, EventService, serverConfig) {
		var self = this,
			selectedIssue = null,
			selectedIssueIndex = null,
			issuesListItemHeight = 150,
			infoHeight = 81,
			issuesToShowWithPinsIDs,
			sortOldestFirst = true,
			showClosed = false,
			focusedIssueIndex = null,
			rightArrowDown = false;

		// Init
		this.UtilsService = UtilsService;
		this.IssuesService = IssuesService;

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var i, length,
				upArrow = 38,
				downArrow = 40,
				rightArrow = 39,
				keysDown,
				event = {type: "click"},
				updatedIssue = IssuesService.updatedIssue;

			// All issues
			if (changes.hasOwnProperty("allIssues") && this.allIssues) {
				if (this.allIssues.length > 0) {
					self.toShow = "list";
					setupIssuesToShow();
					// Process issues
					for (i = 0, length = this.issuesToShow.length; i < length; i += 1) {
						// Check for updated issue
						if ((updatedIssue !== null) && (updatedIssue._id === this.issuesToShow[i]._id)) {
							this.issuesToShow[i] = updatedIssue;
						}
						/*
						// Get a possible selected issue
						if (this.issuesToShow[i].selected) {
							selectedIssue = this.issuesToShow[i];
							focusedIssueIndex = i;
							setSelectedIssueIndex(selectedIssue);
						}
						*/
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

			// Keys down - check for down followed by up
			if (changes.hasOwnProperty("keysDown")) {
				// Up/Down arrow
				if ((changes.keysDown.currentValue.indexOf(downArrow) !== -1) || (changes.keysDown.currentValue.indexOf(upArrow) !== -1)) {
					// Handle focused issue
					if (focusedIssueIndex !== null) {
						if ((changes.keysDown.currentValue.indexOf(downArrow) !== -1) && (focusedIssueIndex !== (this.issuesToShow.length - 1))) {
							if (selectedIssue !== null) {
								selectedIssue.selected = false;
								selectedIssue.focus = false;
							}
							this.issuesToShow[focusedIssueIndex].focus = false;
							focusedIssueIndex += 1;
							selectedIssueIndex = focusedIssueIndex;
						}
						else if ((changes.keysDown.currentValue.indexOf(upArrow) !== -1) && (focusedIssueIndex !== 0)) {
							if (selectedIssue !== null) {
								selectedIssue.selected = false;
								selectedIssue.focus = false;
							}
							this.issuesToShow[focusedIssueIndex].focus = false;
							focusedIssueIndex -= 1;
							selectedIssueIndex = focusedIssueIndex;
						}
						this.select(event, this.issuesToShow[selectedIssueIndex]);
					}

					// Handle selected issue
					else if (selectedIssueIndex !== null) {
						if ((changes.keysDown.currentValue.indexOf(downArrow) !== -1) && (selectedIssueIndex !== (this.issuesToShow.length - 1))) {
							selectedIssue.selected = false;
							selectedIssueIndex += 1;
						}
						else if ((changes.keysDown.currentValue.indexOf(upArrow) !== -1) && (selectedIssueIndex !== 0)) {
							selectedIssue.selected = false;
							selectedIssueIndex -= 1;
						}
						deselectPin(selectedIssue);
						this.select(event, this.issuesToShow[selectedIssueIndex]);
					}
				}
				// Right arrow - do action on key up
				else if (changes.keysDown.currentValue.indexOf(rightArrow) !== -1) {
					rightArrowDown = true;
				}
				else if (rightArrowDown && (changes.keysDown.currentValue.indexOf(rightArrow) === -1)) {
					rightArrowDown = false;
					self.editIssue(selectedIssue);
				}
			}

			// Menu option
			if (changes.hasOwnProperty("menuOption") && this.menuOption) {
				if (this.menuOption.value === "sortByDate") {
					sortOldestFirst = !sortOldestFirst;
				}
				else if (this.menuOption.value === "showClosed") {
					showClosed = !showClosed;
				}
				else if (this.menuOption.value === "print") {
					$window.open(serverConfig.apiUrl(serverConfig.GET_API, this.account + "/" + this.project + "/issues.html"), "_blank");
				}
				else if (this.menuOption.value === "exportBCF") {
					$window.open(serverConfig.apiUrl(serverConfig.GET_API, this.account + "/" + this.project + "/issues.bcfzip"), "_blank");
				}
				else if (this.menuOption.value === "importBCF") {

					var file = document.createElement('input');
					file.setAttribute('type', 'file');
					file.setAttribute('accept', '.zip,.bcfzip');
					file.click();

					file.addEventListener("change", function () {
						self.importBcf({file: file.files[0]});
					});
				}
				setupIssuesToShow();
				self.contentHeight({height: self.issuesToShow.length * issuesListItemHeight});
				showPins();
			}

			// Updated issue
			if (changes.hasOwnProperty("updatedIssue") && this.updatedIssue) {
				for (i = 0, length = this.allIssues.length; i < length; i += 1) {
					if (this.updatedIssue._id === this.allIssues[i]._id) {
						this.allIssues[i] = this.updatedIssue;
						break;
					}
				}
			}

			// Selected issue
			if (changes.hasOwnProperty("selectedIssue") && this.selectedIssue) {
				for (i = 0, length = this.issuesToShow.length; i < length; i += 1) {
					// To clear any previously selected issue
					this.issuesToShow[i].selected = false;
					this.issuesToShow[i].focus = false;

					// Set up the current selected iss
					if (this.issuesToShow[i]._id === this.selectedIssue._id) {
						selectedIssue = this.issuesToShow[i];
						selectedIssue.selected = true;
						selectedIssue.focus = true;
						focusedIssueIndex = i;
						selectedIssueIndex = i;
					}
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
				if ((selectedIssue === null) || (selectedIssue._id === issue._id)) {
					selectedIssue = issue;
					selectedIssue.selected = true;
					selectedIssue.focus = true;
					showIssue(selectedIssue);
					setSelectedIssueIndex(selectedIssue);
				}
				else {
					selectedIssue.selected = false;
					selectedIssue.focus = false;
					deselectPin(selectedIssue);
					selectedIssue = issue;
					selectedIssue.selected = true;
					selectedIssue.focus = true;
					showIssue(selectedIssue);
					setSelectedIssueIndex(selectedIssue);
				}
				this.onSelectIssue({issue: selectedIssue});
			}
		};

		/**
		 * Set focus on issue
		 * @param event
		 * @param issue
		 * @param index
		 */
		this.setFocus = function (event, issue, index) {
			if (selectedIssue !== null) {
				selectedIssue.focus = false;
			}
			focusedIssueIndex = index;
			issue.focus = true;
		};

		/**
		 * Remove focus from issue
		 * @param event
		 * @param issue
		 */
		this.removeFocus = function (event, issue) {
			focusedIssueIndex = null;
			issue.focus = false;
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
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0,
				sortedIssuesLength;

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
				}

				// Closed
				for (i = (self.issuesToShow.length - 1); i >= 0; i -= 1) {
					if (!showClosed && (self.issuesToShow[i].status === "closed")) {
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
			var i, length,
				pin,
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
						IssuesService.addPin(pinData, [[0.5, 0, 0]], self.allIssues[i].viewpoint);
					}
				}
			}
		}
	}
}());