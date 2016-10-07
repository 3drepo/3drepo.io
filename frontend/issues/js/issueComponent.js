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
					contentHeight: "&",
					selectedObjects: "<",
					setInitialSelectedObjects: "&",
					userRoles: "<"
				}
			}
		);

	IssueCompCtrl.$inject = ["$q", "$mdDialog", "EventService", "IssuesService", "UtilsService"];

	function IssueCompCtrl ($q, $mdDialog, EventService, IssuesService, UtilsService) {
		var self = this,
			savedScreenShot = null,
			highlightBackground = "#FF9800",
			currentActionIndex = null,
			editingCommentIndex = null,
			commentViewpoint,
			issueSelectedObjects = null,
			aboutToBeDestroyed = false;

		/*
		 * Init
		 */
		this.UtilsService = UtilsService;
		this.hideDescription = false;
		this.submitDisabled = true;
		this.pinData = null;
		this.showAdditional = true;
		this.editingDescription = false;
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
			{icon: "place", action: "pin", label: "Pin", color: "", hidden: this.data},
			{icon: "view_comfy", action: "multi", label: "Multi", color: "", hidden: this.data}
		];

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var i, length;
			// Data
			if (changes.hasOwnProperty("data")) {
				if (this.data) {
					this.issueData = angular.copy(this.data);
					this.issueData.name = IssuesService.generateTitle(this.issueData); // Change name to title for display purposes
					this.hideDescription = !this.issueData.hasOwnProperty("desc");
					if (this.issueData.viewpoint.hasOwnProperty("screenshotSmall")) {
						this.descriptionThumbnail = UtilsService.getServerUrl(this.issueData.viewpoint.screenshotSmall);
					}
					// Issue owner or user with same role as issue creator role can update issue
					this.canUpdate = (this.account === this.issueData.owner);
					if (!this.canUpdate) {
						for (i = 0, length = this.userRoles.length; i < length; i += 1) {
							if (this.userRoles[i] === this.issueData.creator_role) {
								this.canUpdate = true;
								break;
							}
						}
					}

					// Can edit description if no comments
					this.canEditDescription = (this.issueData.comments.length === 0);
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
				setContentHeight();
			}

			// Selected objects
			if ((changes.hasOwnProperty("selectedObjects") && this.selectedObjects)) {
				issueSelectedObjects = this.selectedObjects;
			}

			// Event
			if ((changes.hasOwnProperty("event") && this.event)) {
				// After a pin has been placed highlight any saved selected objects
				if (((this.event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) ||
					 (this.event.type === EventService.EVENT.VIEWER.ADD_PIN)) &&
					(this.actions[currentActionIndex].action === "pin") &&
					(issueSelectedObjects !== null)) {
					this.setInitialSelectedObjects({selectedObjects: issueSelectedObjects});
				}
			}
		};

		/**
		 * Save a comment if one was being typed before close
		 * Cancel editing comment
		 */
		this.$onDestroy = function () {
			aboutToBeDestroyed = true;
			if (this.comment) {
				IssuesService.updatedIssue = self.issueData; // So that issues list is notified
				saveComment();
			}
			if (editingCommentIndex !== null) {
				this.issueData.comments[editingCommentIndex].editing = false;
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
		 * Show viewpoint
		 * @param event
		 * @param viewpoint
		 */
		this.showViewpoint = function (event, viewpoint) {
			if (event.type === "click") {
				var data = {
					position : viewpoint.position,
					view_dir : viewpoint.view_dir,
					up: viewpoint.up,
					account: self.issueData.account,
					project: self.issueData.project
				};
				self.sendEvent({type: EventService.EVENT.VIEWER.SET_CAMERA, value: data});

				data = {
					clippingPlanes: viewpoint.clippingPlanes,
					account: self.issueData.account,
					project: self.issueData.project,
				};
				self.sendEvent({type: EventService.EVENT.VIEWER.SET_CLIPPING_PLANES, value: data});
			}
		};

		/**
		 * Show screen shot
		 * @param viewpoint
		 */
		this.showScreenShot = function (viewpoint) {
			self.screenShot = UtilsService.getServerUrl(viewpoint.screenshot);
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

			if (currentActionIndex === null) {
				self.action = null;
				issueSelectedObjects = null;
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

					case "multi":
						if (issueSelectedObjects !== null) {
							this.setInitialSelectedObjects({selectedObjects: issueSelectedObjects});
						}
						else {
							issueSelectedObjects = this.selectedObjects;
						}
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
		 * Toggle showing of extra inputs
		 */
		this.toggleShowAdditional = function () {
			this.showAdditional = !this.showAdditional;
			setContentHeight();
		};

		/**
		 * Edit or save description
		 * @param event
		 */
		this.toggleEditDescription = function (event) {
			event.stopPropagation();
			if (this.editingDescription) {
				this.editingDescription = false;
				var data = {
					desc: self.issueData.desc
				};
				IssuesService.updateIssue(self.issueData, data)
					.then(function (data) {
					});
			}
			else {
				this.editingDescription = true;
			}
		};

		/**
		 * Save issue
		 */
		function saveIssue () {
			var viewpointPromise = $q.defer(),
				screenShotPromise = $q.defer(),
				data;

			// Get the viewpoint
			self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: self.account, project: self.project}});
			viewpointPromise.promise.then(function (viewpoint) {
				if (savedScreenShot !== null) {
					if (issueSelectedObjects !== null) {
						// Create a group of selected objects
						data = {name: self.issueData.name, color: [255, 0, 0], parents: issueSelectedObjects};
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
						if (issueSelectedObjects !== null) {
							// Create a group of selected objects
							data = {name: self.issueData.name, color: [255, 0, 0], parents: issueSelectedObjects};
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
				creator_role: self.userRoles[0],
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
					self.data = response.data; // So that new changes are registered as updates
					self.issueData = response.data;
					self.issueData.title = IssuesService.generateTitle(self.issueData);
					self.descriptionThumbnail = UtilsService.getServerUrl(self.issueData.viewpoint.screenshotSmall);
					self.issueData.timeStamp = IssuesService.getPrettyTime(self.issueData.created);

					// Hide the description input if no description
					self.hideDescription = !self.issueData.hasOwnProperty("desc");

					// Notify parent of new issue
					self.issueCreated({issue: self.issueData});

					self.submitDisabled = true;
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
					IssuesService.updatedIssue = self.issueData;
				});
		}

		/**
		 * Add comment to issue
		 * Save screen shot viewpoint or current viewpoint
		 */
		function saveComment () {
			var	viewpointPromise = $q.defer();

			if (angular.isDefined(self.commentThumbnail)) {
				IssuesService.saveComment(self.issueData, self.comment, commentViewpoint)
					.then(function (response) {
						afterNewComment(response.data.issue);
					});
			}
			else {
				self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: self.issueData.account, project: self.issueData.project}});
				viewpointPromise.promise.then(function (viewpoint) {
					IssuesService.saveComment(self.issueData, self.comment, viewpoint)
						.then(function (response) {
							afterNewComment(response.data.issue);
						});
				});
			}
		}

		/**
		 * Process after new comment saved
		 * @param comment
		 */
		function afterNewComment (comment) {
			// Add new comment to issue
			self.issueData.comments.push({
				comment: comment.comment,
				owner: comment.owner,
				timeStamp: IssuesService.getPrettyTime(comment.created),
				viewpoint: comment.viewpoint
			});

			// Mark any previous comment as 'sealed' - no longer deletable or editable
			if (self.issueData.comments.length > 1) {
				IssuesService.sealComment(self.issueData, (self.issueData.comments.length - 2))
					.then(function(response) {
						self.issueData.comments[self.issueData.comments.length - 2].sealed = true;
					});
			}

			delete self.comment;
			delete self.commentThumbnail;
			IssuesService.updatedIssue = self.issueData;
			self.submitDisabled = true;
			// Don't set height of content if about to be destroyed as it overrides the height set by the issues list
			if (!aboutToBeDestroyed) {
				setContentHeight();
			}
		}

		/**
		 * Delete a comment
		 * @param event
		 * @param index
		 */
		this.deleteComment = function(event, index) {
			event.stopPropagation();
			IssuesService.deleteComment(self.issueData, index)
				.then(function(response) {
					self.issueData.comments.splice(index, 1);
				});
			setContentHeight();
		};

		/**
		 * Toggle the editing of a comment
		 * @param event
		 * @param index
		 */
		this.toggleEditComment = function(event, index) {
			event.stopPropagation();
			if (this.issueData.comments[index].editing) {
				editingCommentIndex = null;
				this.issueData.comments[index].editing = false;
				IssuesService.editComment(self.issueData, this.issueData.comments[index].comment, index)
					.then(function(response) {
						self.issueData.comments[index].timeStamp = IssuesService.getPrettyTime(response.data.created);
					});
			}
			else {
				editingCommentIndex = index;
				this.issueData.comments[index].editing = true;
			}
		};

		/**
		 * A screen shot has been saved
		 * @param data
		 */
		this.screenShotSave = function (data) {
			var viewpointPromise = $q.defer();

			savedScreenShot = data.screenShot;
			if (typeof self.data === "object") {
				// Comment
				self.commentThumbnail = data.screenShot;

				// Get the viewpoint and add the screen shot to it
				// Remove base64 header text from screen shot
				self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: self.issueData.account, project: self.issueData.project}});
				viewpointPromise.promise.then(function (viewpoint) {
					commentViewpoint = viewpoint;
					commentViewpoint.screenshot = data.screenShot.substring(data.screenShot.indexOf(",") + 1);
				});

				setContentHeight();
			}
			else {
				// Description
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
				newIssueHeight = 375,
				issueMinHeight = 672,
				descriptionTextHeight = 80,
				commentTextHeight = 80,
				commentImageHeight = 170,
				additionalInfoHeight = 70,
				thumbnailHeight = 170,
				height = issueMinHeight;

			if (self.data) {
				// Additional info
				if (self.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description text
				if (self.issueData.hasOwnProperty("desc")) {
					height += descriptionTextHeight;
				}
				// New comment thumbnail
				if (self.commentThumbnail) {
					height += thumbnailHeight;
				}
				// Comments
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
