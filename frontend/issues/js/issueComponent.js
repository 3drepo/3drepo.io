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
					event: "<",
					issueCreated: "&",
					contentHeight: "&"
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
		this.showAdditional = false;
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
				if (this.data) {
					this.issueData = angular.copy(this.data);
					this.issueData.name = IssuesService.generateTitle(this.issueData); // Change name to title for display purposes
					this.hideDescription = !this.issueData.hasOwnProperty("desc");
					if (this.issueData.viewpoint.hasOwnProperty("screenshotSmall")) {
						this.descriptionThumbnail = UtilsService.getServerUrl(this.issueData.viewpoint.screenshotSmall);
					}
					this.canUpdate = (this.account === this.issueData.owner);
				}
				else {
					this.issueData = {
						priority: "none",
						status: "open",
						topic_type: "for_information",
						viewpoint: {}
					};
					this.canUpdate = true;
				}
				this.statusIcon = IssuesService.getStatusIcon(this.issueData);
			}
			setContentHeight();
		};

		/**
		 * Save a comment if one was being typed before close
		 */
		this.$onDestroy = function () {
			if (this.comment) {
				IssuesService.updatedIssue = self.issueData; // So that issues list is notified
				saveComment();
			}
		};

		/**
		 * Disable the save button for a new issue if there is no name
		 */
		this.nameChange = function () {
			this.submitDisabled = !this.issueData.name;
		};

		/**
		 * Disable the save button when commenting on an issue if there is no comment
		 */
		this.commentChange = function () {
			this.submitDisabled = (this.data && !this.comment);
		};

		/**
		 * Handle status change
		 */
		this.statusChange = function () {
			this.statusIcon = IssuesService.getStatusIcon(this.issueData);
			// Update
			if (this.data) {
				this.submitDisabled = (this.data.priority === this.issueData.priority) && (this.data.status === this.issueData.status);
			}
		};

		/**
		 * Submit - new issue or comment or update issue
		 */
		this.submit = function () {
			if (self.data) {
				if (self.data.owner === self.account) {
					if ((this.data.priority !== this.issueData.priority) ||
						(this.data.status !== this.issueData.status)) {
						updateIssue();
						if (typeof this.comment !== "undefined") {
							saveComment();
						}
					}
					else {
						saveComment();
					}
				}
				else {
					saveComment();
				}
			}
			else {
				saveIssue();
			}
		};

		/**
		 * Show viewpoint and screen shot if there is one
		 * @param viewpoint
		 */
		this.showViewpointAndScreenShot = function (viewpoint) {
			var data;
			if (angular.isDefined(viewpoint.screenshot)) {
				// Viewpoint
				data = {
					position : viewpoint.position,
					view_dir : viewpoint.view_dir,
					up: viewpoint.up
				};
				self.sendEvent({type: EventService.EVENT.VIEWER.SET_CAMERA, value: data});

				// Screen shot
				self.screenShot = UtilsService.getServerUrl(viewpoint.screenshot);
				$mdDialog.show({
					controller: function () {
						this.dialogCaller = self;
					},
					controllerAs: "vm",
					templateUrl: "issueScreenShotDialog.html"
				});
			}
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

			if (currentActionIndex === null) {
				self.action = null;
			}
			else {
				self.action = this.actions[currentActionIndex].action;

				switch (this.actions[currentActionIndex].action) {
					case "screen_shot":
						delete this.screenShot; // Remove any clicked on screen shot
						$mdDialog.show({
							controller: ScreenShotDialogController,
							controllerAs: "vm",
							templateUrl: "issueScreenShotDialog.html"
						});
						break;
				}
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
		 * Toggle showing of extra inputs
		 */
		this.toggleShowAdditional = function () {
			this.showAdditional = !this.showAdditional;
			setContentHeight();
		};

		/**
		 * Save issue
		 */
		function saveIssue () {
			var viewpointPromise = $q.defer(),
				screenShotPromise = $q.defer(),
				data;

			// Get the viewpoint
			self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise}});
			viewpointPromise.promise.then(function (viewpoint) {
				if (savedScreenShot !== null) {
					if (self.multiData !== null) {
						// Create a group of selected objects
						data = {name: self.issueData.name, color: [255, 0, 0], parents: self.multiData};
						UtilsService.doPost(data, self.account + "/" + self.project + "/groups").then(function (response) {
							doSaveIssue(viewpoint, savedScreenShot, response.data._id);
						});
					}
					else {
						doSaveIssue(viewpoint, savedScreenShot);
					}
				}
				else {
					// Get a screen shot if not already created
					self.sendEvent({type: EventService.EVENT.VIEWER.GET_SCREENSHOT, value: {promise: screenShotPromise}});
					screenShotPromise.promise.then(function (screenShot) {
						if (self.multiData !== null) {
							// Create a group of selected objects
							data = {name: self.issueData.name, color: [255, 0, 0], parents: self.multiData};
							UtilsService.doPost(data, self.account + "/" + self.project + "/groups").then(function (response) {
								doSaveIssue(viewpoint, screenShot, response.data._id);
							});
						}
						else {
							doSaveIssue(viewpoint, screenShot);
						}
					});
				}
			});
		}

		/**
		 * Send new issue data to server
		 * @param viewpoint
		 * @param screenShot
		 * @param groupId
		 */
		function doSaveIssue (viewpoint, screenShot, groupId) {
			var	issue;

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
			IssuesService.saveIssue(issue)
				.then(function (response) {
					console.log(response);
					self.data = response.data; // So that new changes are registered as updates
					self.issueData = response.data;
					self.issueData.title = IssuesService.generateTitle(self.issueData);
					self.descriptionThumbnail = UtilsService.getServerUrl(self.issueData.viewpoint.screenshotSmall);
					self.issueData.timeStamp = IssuesService.getPrettyTime(self.issueData.created);

					// Hide the description input if no description
					self.hideDescription = !self.issueData.hasOwnProperty("desc");

					// Notify parent of new issue
					self.issueCreated({issue: self.issueData});

					setContentHeight();
			});
		}

		/**
		 * Update an existing issue and notify parent
		 */
		function updateIssue () {
			var data = {
				priority: self.issueData.priority,
				status: self.issueData.status,
				topic_type: self.issueData.topic_type
			};
			IssuesService.updateIssue(self.issueData, data)
				.then(function (data) {
					console.log(data);
					IssuesService.updatedIssue = self.issueData;
				});
		}

		/**
		 * Add comment to issue
		 */
		function saveComment () {
			var	screenShot,
				issueViewpoint,
				viewpointPromise = $q.defer();

			// If there is a saved screen shot use the current viewpoint, else the issue viewpoint
			// Remove base64 header text from screen shot and add to viewpoint
			if (angular.isDefined(self.commentThumbnail)) {
				// Get the viewpoint
				self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise}});
				viewpointPromise.promise.then(function (viewpoint) {
					screenShot = savedScreenShot.substring(savedScreenShot.indexOf(",") + 1);
					viewpoint.screenshot = screenShot;
					// Save
					IssuesService.saveComment(self.issueData, self.comment, viewpoint)
						.then(function (response) {
							console.log(response);
							addNewCommentToIssue(response.data.issue);
						});
				});
			}
			else {
				// Use issue viewpoint and delete any screen shot
				issueViewpoint = angular.copy(self.issueData.viewpoint);
				if (issueViewpoint.hasOwnProperty("screenshot")) {
					delete issueViewpoint.screenshot;
				}
				// Save
				IssuesService.saveComment(self.issueData, self.comment, issueViewpoint)
					.then(function (response) {
						console.log(response);
						addNewCommentToIssue(response.data.issue);
					});
			}
		}

		/**
		 * Add newly created comment to current issue
		 * @param comment
		 */
		function addNewCommentToIssue (comment) {
			self.issueData.comments.push({
				comment: comment.comment,
				owner: comment.owner,
				timeStamp: IssuesService.getPrettyTime(comment.created),
				viewpoint: comment.viewpoint
			});
			delete self.comment;
			delete self.commentThumbnail;
			IssuesService.updatedIssue = self.issueData;
			setContentHeight();
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

		function setContentHeight() {
			var i, length,
				newIssueHeight = 435,
				issueMinHeight = 672,
				descriptionTextHeight = 80,
				commentTextHeight = 80,
				commentImageHeight = 170,
				additionalInfoHeight = 70,
				height = issueMinHeight;

			if (self.data) {
				if (self.showAdditional) {
					height += additionalInfoHeight;
				}

				if (self.issueData.hasOwnProperty("desc")) {
					height += descriptionTextHeight;
				}

				for (i = 0, length = self.issueData.comments.length; i < length; i += 1) {
					height += commentTextHeight;
					if (self.issueData.comments[i].viewpoint.hasOwnProperty("screenshot")) {
						height += commentImageHeight;
					}
				}
			}
			else {
				height = newIssueHeight;
				if (self.showAdditional) {
					height += additionalInfoHeight;
				}
			}

			self.contentHeight({height: height});
		}
	}
}());