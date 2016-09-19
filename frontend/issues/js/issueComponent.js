/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issueComp of the GNU Affero General Public License as
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
			"issueComp",
			{
				controller: IssueCompCtrl,
				templateUrl: "issueComp.html",
				bindings: {
					account: "<",
					project: "<",
					data: "<",
					keysDown: "<",
					exit: "&",
					sendEvent: "&",
					event: "<"
				}
			}
		);

	IssueCompCtrl.$inject = ["$q", "$mdDialog", "EventService", "IssuesService", "UtilsService"];

	function IssueCompCtrl ($q, $mdDialog, EventService, IssuesService, UtilsService) {
		var self = this,
			savedScreenShot = null,
			highlightBackground = "#FF9800",
			currentActionIndex = null;

		/*
		 * Init
		 */
		this.UtilsService = UtilsService;
		this.hideDescription = false;
		this.submitDisabled = true;
		this.pinData = null;
		this.multiData = null;
		this.priorities = [
			{value: "none", label: "None"},
			{value: "low", label: "Low"},
			{value: "medium", label: "Medium"},
			{value: "high", label: "High"}
		];
		this.statuses = [
			{value: "open", label: "Open"},
			{value: "in progress", label: "In progress"},
			{value: "closed", label: "Closed"}
		];
		this.topic_types = [
			{value: "for_information", label: "For information"},
			{value: "for_approval", label: "For approval"},
			{value: "vr", label: "VR"},
		];
		this.actions = [
			{icon: "camera_alt", action: "screen_shot", label: "Screen shot", color: "", disabled: false},
			{icon: "place", action: "pin", label: "Pin", color: "", disabled: this.data},
			{icon: "view_comfy", action: "multi", label: "Multi", color: "", disabled: this.data}
		];

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			/*
			var leftArrow = 37;
			if (changes.hasOwnProperty("keysDown") &&
				angular.isDefined(changes.keysDown.previousValue)) {
				if (changes.keysDown.previousValue[0] === leftArrow) {
					this.exit({issue: this.data});
				}
			}
			*/

			if (changes.hasOwnProperty("data")) {
				if (typeof changes.data.currentValue === "object") {
					this.issueData = angular.copy(this.data);
					this.issueData.name = IssuesService.generateTitle(this.issueData); // Change name to title for display purposes
					this.hideDescription = !this.issueData.hasOwnProperty("desc");
					this.descriptionThumbnail = UtilsService.getServerUrl(this.issueData.viewpoint.screenshot);
				}
				else {
					this.issueData = {
						priority: "none",
						status: "open",
						topic_type: "for_information",
						viewpoint: {}
					};
				}
				this.statusIcon = IssuesService.getStatusIcon(this.issueData);
			}
		};

		/**
		 * Disable the save button for a new issue if there is no name
		 */
		this.nameChange = function () {
			this.submitDisabled = (typeof this.issueData.name === "undefined");
		};

		/**
		 * Disable the save button when commenting on an issue if there is no comment
		 */
		this.commentChange = function () {
			this.submitDisabled = ((typeof this.data === "object") && (typeof this.comment === "undefined"));
		};

		/**
		 * Set the status icon style and colour
		 */
		this.setStatusIcon = function () {
			this.statusIcon = IssuesService.getStatusIcon(this.issueData);
		};

		/**
		 * Submit - new issue or comment
		 */
		this.submit = function () {
			var viewpointPromise = $q.defer(),
				screenShotPromise = $q.defer(),
				groupPromise = $q.defer(),
				data;

			// Viewpoint
			this.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise}});
			viewpointPromise.promise.then(function (viewpoint) {
				if (typeof self.data === "undefined") {
					// Save issue
					if (savedScreenShot !== null) {
						if (self.multiData !== null) {
							data = {
								name: self.issueData.name,
								color: [255, 0, 0],
								parents: self.multiData
							};
							UtilsService.doPost(data, self.account + "/" + self.project + "/groups").then(function (response) {
								console.log(response);
								saveIssue(viewpoint, savedScreenShot, response.data._id);
							});
						}
						else {
							saveIssue(viewpoint, savedScreenShot);
						}
					}
					else {
						// Get a screen shot if not already created
						self.sendEvent({type: EventService.EVENT.VIEWER.GET_SCREENSHOT, value: {promise: screenShotPromise}});
						screenShotPromise.promise.then(function (screenShot) {
							saveIssue(viewpoint, screenShot);
						});
					}
				}
				else {
					// Save comment
					saveComment(viewpoint);
				}
			});
		};

		this.showScreenShot = function (screenShot) {
			self.screenShot = UtilsService.getServerUrl(screenShot);
			$mdDialog.show({
				controller: function () {
					this.dialogCaller = self;
				},
				controllerAs: "vm",
				templateUrl: "issueScreenShotDialog.html"
			});
		};

		/**
		 * Do an action
		 * @param index
		 */
		this.doAction = function (index) {
			if (currentActionIndex === null) {
				currentActionIndex = index;
				this.actions[currentActionIndex].color = highlightBackground;
			}
			else if (currentActionIndex === index) {
				this.actions[currentActionIndex].color = "";
				currentActionIndex = null;
			}
			else {
				this.actions[currentActionIndex].color = "";
				currentActionIndex = index;
				this.actions[currentActionIndex].color = highlightBackground;
			}

			self.action = this.actions[currentActionIndex].action;

			switch (this.actions[currentActionIndex].action) {
				case "screen_shot":
					$mdDialog.show({
						controller: ScreenShotDialogController,
						controllerAs: "vm",
						templateUrl: "issueScreenShotDialog.html"
					});
					break;
			}
		};

		/**
		 * Set the current add pin data
		 * @param pinData
		 */
		this.setPin = function (pinData) {
			self.pinData = pinData.data;
		};

		/**
		 * Set the current add pin data
		 * @param multiData
		 */
		this.setMulti = function (multiData) {
			self.multiData = multiData.data;
		};

		/**
		 * Save new issue
		 * @param viewpoint
		 * @param screenShot
		 * @param groupId
		 */
		function saveIssue (viewpoint, screenShot, groupId) {
			var	savePromise,
				issue;

			// Remove base64 header text from screenShot and add to viewpoint
			screenShot = screenShot.substring(screenShot.indexOf(",") + 1);
			viewpoint.screenshot = screenShot;

			// Save issue
			issue = {
				account: self.account,
				project: self.project,
				objectId: null,
				name: self.issueData.name,
				viewpoint: viewpoint,
				creator_role: "Test",
				pickedPos: null,
				pickedNorm: null,
				scale: 1.0,
				assigned_roles: [],
				priority: self.issueData.priority,
				status: self.issueData.status,
				topic_type: self.issueData.topic_type,
				desc: self.issueData.desc
			};
			// Pin data
			if (self.pinData !== null) {
				issue.pickedPos = self.pinData.pickedPos;
				issue.pickedNorm = self.pinData.pickedNorm;
			}
			// Group data
			if (angular.isDefined(groupId)) {
				issue.group_id = groupId;
			}
			savePromise = IssuesService.saveIssue(issue);
			savePromise.then(function (data) {
				console.log(data);
			});
		}

		/**
		 * Add comment to issue
		 * @param viewpoint
		 */
		function saveComment (viewpoint) {
			var	savePromise,
				screenShot,
				viewpointToUse;

			// If there is a saved screen shot use the current viewpoint, else the issue viewpoint
			// Remove base64 header text from screen shot and add to viewpoint
			if (angular.isDefined(self.commentThumbnail)) {
				viewpointToUse = viewpoint;
				screenShot = savedScreenShot.substring(savedScreenShot.indexOf(",") + 1);
				viewpoint.screenshot = screenShot;
			}
			else {
				viewpointToUse = self.issueData.viewpoint;
				if (viewpointToUse.hasOwnProperty("screenshot")) {
					delete viewpointToUse.screenshot;
				}
			}

			savePromise = IssuesService.saveComment(self.issueData, self.comment, viewpointToUse);
			savePromise.then(function (data) {
				console.log(data);
			});
		}

		/**
		 * A screen shot has been saved
		 * @param data
		 */
		this.screenShotSave = function (data) {
			savedScreenShot = data.screenShot;
			if (typeof self.data === "object") {
				self.commentThumbnail = data.screenShot;
			}
			else {
				self.descriptionThumbnail = data.screenShot;
			}
		};

		/**
		 * Controller for screen shot dialog
		 */
		function ScreenShotDialogController () {
			this.dialogCaller = self;

			/**
			 * Deselect the screen shot action button after close the screen shot dialog
			 */
			this.closeScreenShot = function () {
				self.actions[currentActionIndex].color = "";
				currentActionIndex = null;
			};
		}
	}
}());