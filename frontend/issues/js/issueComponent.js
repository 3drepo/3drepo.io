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
					revision: "<",
					data: "<",
					keysDown: "<",
					exit: "&",
					sendEvent: "&",
					event: "<",
					issueCreated: "&",
					contentHeight: "&",
					selectedObjects: "<",
					projectSettings: '<',
					setInitialSelectedObjects: "&",
					userJob: "<",
					availableJobs: "<"
				}
			}
		);

	IssueCompCtrl.$inject = ["$q", "$mdDialog", "$element", "EventService", "IssuesService", "UtilsService", "NotificationService", "Auth", "$timeout", "$scope", "serverConfig", "AnalyticService", "$state"];

	function IssueCompCtrl ($q, $mdDialog, $element, EventService, IssuesService, UtilsService, NotificationService, Auth, $timeout, $scope, serverConfig, AnalyticService, $state) {
		var self = this,
			savedScreenShot = null,
			highlightBackground = "#FF9800",
			currentAction = null,
			editingCommentIndex = null,
			commentViewpoint,
			aboutToBeDestroyed = false,
			textInputHasFocus = false,
			savedDescription,
			savedComment,
			issueRoleIndicator = angular.element($element[0].querySelector('#issueRoleIndicator'));

		/*
		 * Init
		 */
		this.UtilsService = UtilsService;
		this.hideDescription = false;
		this.submitDisabled = true;
		this.pinData = null;
		this.showAdditional = true;
		this.editingDescription = false;
		this.clearPin = false;

		this.priorities = [
			{value: "none", label: "None"},
			{value: "low", label: "Low"},
			{value: "medium", label: "Medium"},
			{value: "high", label: "High"}
		];
		this.statuses = [
			{value: "open", label: "Open"},
			{value: "in progress", label: "In progress"},
			{value: "for approval", label: "For approval"},
			{value: "closed", label: "Closed"}
		];

		this.actions = {
			screen_shot: {icon: "camera_alt", label: "Screen shot", hidden: false, selected: false},
			pin: {icon: "place", label: "Pin", hidden: this.data, selected: false},
			multi: {icon: "view_comfy", label: "Save the selected objects with the issue", hidden: this.data, selected: false}
		};


		this.notificationStarted = false;

		//console.log('issue::selectedObjects', this.selectedObjects);

		function convertCommentTopicType(){
			self.issueData && self.issueData.comments.forEach(function(comment){
				if(comment.action && comment.action.property === 'topic_type'){
					IssuesService.convertActionCommentToText(comment, self.topic_types);
				}
			});
		}

		function setCanUpdateStatus(issueData){
			if(!Auth.hasPermission(serverConfig.permissions.PERM_CREATE_ISSUE, self.projectSettings.permissions)){
				return self.canUpdateStatus = false;
			}

			self.canUpdateStatus = (Auth.getUsername() === issueData.owner) ||
				issueData.assigned_roles.indexOf(self.userJob._id) !== -1
		}
		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var i, length,
				leftArrow = 37;
			//console.log('issueComp on changes', changes);

			if(changes.hasOwnProperty('projectSettings')){
				this.topic_types = this.projectSettings.properties.topicTypes;
				this.canComment = Auth.hasPermission(serverConfig.permissions.PERM_COMMENT_ISSUE, this.projectSettings.permissions);
				//convert comment topic_types
				convertCommentTopicType();
			}

			// Data

			if (changes.hasOwnProperty("data")) {
				if (this.data) {
					this.issueData = angular.copy(this.data);
					this.issueData.comments = this.issueData.comments || [];
					this.issueData.name = IssuesService.generateTitle(this.issueData); // Change name to title for display purposes
					this.issueData.thumbnailPath = UtilsService.getServerUrl(this.issueData.thumbnail);
					this.issueData.comments.forEach(function(comment){
						if(comment.owner !== Auth.getUsername()){
							comment.sealed = true;
						}
					});

					this.hideDescription = !this.issueData.hasOwnProperty("desc");
					if (this.issueData.viewpoint.hasOwnProperty("screenshotSmall")) {
						this.descriptionThumbnail = UtilsService.getServerUrl(this.issueData.viewpoint.screenshotSmall);
					}
					// Issue owner or user with same role as issue creator role can update issue
					this.canUpdate = (Auth.getUsername() === this.issueData.owner);
					if (!this.canUpdate) {
						this.canUpdate = this.userJob._id && this.issueData.creator_role && (this.userJob._id === this.issueData.creator_role);
					}

					if(!Auth.hasPermission(serverConfig.permissions.PERM_CREATE_ISSUE, this.projectSettings.permissions)){
						this.canUpdate = false;
					}

					setCanUpdateStatus(this.issueData);

					// Can edit description if no comments
					this.canEditDescription = (this.issueData.comments.length === 0);

					// Role colour
					if (this.issueData.assigned_roles.length > 0) {
						setRoleIndicatorColour(this.issueData.assigned_roles[0]);
					}
					else {
						setRoleIndicatorColour(this.issueData.creator_role);
					}

					// Old issues
					this.issueData.priority = (!this.issueData.priority) ? "none" : this.issueData.priority;
					this.issueData.status = (!this.issueData.status) ? "open" : this.issueData.status;
					this.issueData.topic_type = (!this.issueData.topic_type) ? "for_information" : this.issueData.topic_type;
					this.issueData.assigned_roles = (!this.issueData.assigned_roles) ? [] : this.issueData.assigned_roles;

					if(this.issueData.status === 'closed'){
						this.canUpdate = false;
						this.canComment = false;
					}
				
					convertCommentTopicType();
				}
				else {
					this.issueData = {
						priority: "none",
						status: "open",
						assigned_roles: [],
						topic_type: "for_information",
						viewpoint: {}
					};
					this.canUpdate = true;
					this.canUpdateStatus = true;
				}
				this.statusIcon = IssuesService.getStatusIcon(this.issueData);
				setContentHeight();
			}

			// Selected objects
			// if (changes.hasOwnProperty("selectedObjects") && this.selectedObjects &&
			// 	(currentAction !== null) && (currentAction === "multi")) {
			// 	issueSelectedObjects = this.selectedObjects;
			// }

			// Event
			if ((changes.hasOwnProperty("event") && this.event) && (currentAction !== null)) {
				/*
				if ((this.actions[currentAction].action === "pin") &&
					((this.event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) ||
					(this.event.type === EventService.EVENT.VIEWER.ADD_PIN)) &&
					(issueSelectedObjects !== null)) {
					this.setInitialSelectedObjects({selectedObjects: issueSelectedObjects});
				}
				else if ((this.actions[currentAction].action === "multi") &&
						 (this.event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED)) {
					issueSelectedObjects = null;
				}
				*/
				// if ((currentAction === "multi") &&
				// 	(this.event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED)) {
				// 	issueSelectedObjects = null;
				// }
			}

			// Keys down
/*			if (changes.hasOwnProperty("keysDown")) {
				if (!textInputHasFocus && (changes.keysDown.currentValue.indexOf(leftArrow) !== -1)) {
					this.exit();
				}
			}*/

			// Role
			if (changes.hasOwnProperty("availableJobs") && this.availableJobs) {
				console.log(this.availableJobs);
				this.projectJobs = this.availableJobs.map(function (availableJob) {
					/*
					// Get the actual role and return the last part of it
					return availableRole.role.substring(availableRole.role.lastIndexOf(".") + 1);
					*/
					return availableJob._id;
				});
				console.log(this.projectJobs);
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
			// Get out of pin drop mode
			//if ((currentAction !== null) && (currentAction === "pin")) {
				this.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
				this.clearPin = true;
			//}

			//unsubscribe on destroy
			if(self.data){
				NotificationService.unsubscribe.newComment(self.data.account, self.data.project, self.data._id);
				NotificationService.unsubscribe.commentChanged(self.data.account, self.data.project, self.data._id);
				NotificationService.unsubscribe.commentDeleted(self.data.account, self.data.project, self.data._id);
				NotificationService.unsubscribe.issueChanged(self.data.account, self.data.project, self.data._id);
			}
			
		};

		/**
		 * Init stuff
		 */
		this.$onInit = function () {
			var disableStatus;

			// If there are selected objects register them and set the current action to multi
			if (!this.data && this.selectedObjects) {
				//issueSelectedObjects = this.selectedObjects;
				//currentAction = "multi";
				this.actions.multi.selected = true;
			}

			// Set up statuses
			disableStatus = this.data ? (!userHasCreatorRole() && !userHasAdminRole()) : false;
			this.statuses = [
				{value: "open", label: "Open", disabled: disableStatus},
				{value: "in progress", label: "In progress", disabled: false},
				{value: "for approval", label: "For approval", disabled: false},
				{value: "closed", label: "Closed", disabled: disableStatus}
			];
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
			var data,
				comment;

			this.statusIcon = IssuesService.getStatusIcon(this.issueData);
			setRoleIndicatorColour(self.issueData.assigned_roles[0]);

			if (this.data) {
				data = {
					priority: self.issueData.priority,
					status: self.issueData.status,
					topic_type: self.issueData.topic_type,
					assigned_roles: self.issueData.assigned_roles
				};

				IssuesService.updateIssue(self.issueData, data)
					.then(function (response) {
						console.log(response);

						// Add info for new comment
						comment = response.data.issue.comments[response.data.issue.comments.length - 1];
						IssuesService.convertActionCommentToText(comment, self.topic_types);
						comment.timeStamp = IssuesService.getPrettyTime(comment.created);
						self.issueData.comments.push(comment);

						// Update last but one comment in case it was "sealed"
						if (self.issueData.comments.length > 1) {
							// comment = response.data.issue.comments[response.data.issue.comments.length - 2];
							// comment.timeStamp = IssuesService.getPrettyTime(comment.created);
							// if (comment.action) {
							// 	IssuesService.convertActionCommentToText(comment, self.topic_types);
							// }
							//self.issueData.comments[self.issueData.comments.length - 2] = comment;
							self.issueData.comments[self.issueData.comments.length - 2].sealed = true;
						}

						// The status could have changed due to assigning role
						self.issueData.status = response.data.issue.status;
						self.issueData.assigned_roles = response.data.issue.assigned_roles;
						IssuesService.updatedIssue = self.issueData;
						setCanUpdateStatus(self.issueData);

						commentAreaScrollToBottom();
					});


				if(self.issueData.status === 'closed'){
					this.canUpdate = false;
					this.canComment = false;
				} else {
					this.canUpdate = true;
					this.canComment = true;
				}

				AnalyticService.sendEvent({
					eventCategory: 'Issue',
					eventAction: 'edit'
				});
			}
		};

		/**
		 * Submit - new issue or comment or update issue
		 */
		this.submit = function () {
			
			this.saving = true;

			if (self.data) {
				saveComment();
			}
			else {
				saveIssue();
			}
		};

		/**
		 * Show viewpoint
		 * @param event
		 * @param viewpoint Can be undefined for action comments
		 */
		this.showViewpoint = function (event, viewpoint) {
			if (viewpoint && (event.type === "click")) {
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
		 * @param event
		 * @param viewpoint
		 */
		this.showScreenShot = function (event, viewpoint) {
			self.screenShot = UtilsService.getServerUrl(viewpoint.screenshot);
			$mdDialog.show({
				controller: function () {
					this.dialogCaller = self;
				},
				controllerAs: "vm",
				templateUrl: "issueScreenShotDialog.html",
				targetEvent: event
			});
		};

		/**
		 * Do an action
		 * @param event
		 * @param action
		 */
		this.doAction = function (event, action) {
			// Handle previous action
			this.actions[action].selected = !this.actions[action].selected;
			var selected = this.actions[action].selected;

			switch(action){
				case "pin":

					if(selected){
						self.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: true});
					} else {
						self.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
					}
					break;

				case "screen_shot":

					// There is no concept of selected in screenshot as there will be a popup once you click the button
					this.actions[action].selected = false;

					delete this.screenShot; // Remove any clicked on screen shot
					$mdDialog.show({
						controller: ScreenShotDialogController,
						controllerAs: "vm",
						templateUrl: "issueScreenShotDialog.html",
						targetEvent: event
					});
					break;


				case "multi":

					//clear selection if not selected to avoid confusion
					if(!selected){
						// Remove highlight from any multi objects
						EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, []);
						// clear selection
						EventService.send(EventService.EVENT.RESET_SELECTED_OBJS, []);
					}


			}

			// if (currentAction === null) {
			// 	currentAction = action;
			// }
			// else if (currentAction === action) {
			// 	switch (action) {
			// 		case "multi":
			// 			issueSelectedObjects = this.selectedObjects;
			// 			break;
			// 		case "pin":
			// 			self.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
			// 			break;
			// 	}
			// 	this.actions[currentAction].color = "";
			// 	currentAction = null;
			// }
			// else {
			// 	switch (action) {
			// 		case "multi":
			// 			issueSelectedObjects = this.selectedObjects;
			// 			break;
			// 		case "pin":
			// 			self.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
			// 			break;
			// 	}
			// 	this.actions[currentAction].color = "";
			// 	currentAction = action;
			// }

			// // New action
			// if (currentAction !== null) {
			// 	this.actions[currentAction].color = highlightBackground;

			// 	switch (currentAction) {
			// 		case "screen_shot":
			// 			delete this.screenShot; // Remove any clicked on screen shot
			// 			$mdDialog.show({
			// 				controller: ScreenShotDialogController,
			// 				controllerAs: "vm",
			// 				templateUrl: "issueScreenShotDialog.html",
			// 				targetEvent: event
			// 			});
			// 			break;
			// 		case "multi":
			// 			if (issueSelectedObjects !== null) {
			// 				this.setInitialSelectedObjects({selectedObjects: issueSelectedObjects});
			// 			}
			// 			else {
			// 				issueSelectedObjects = this.selectedObjects;
			// 			}
			// 			break;
			// 		case "pin":
			// 			self.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: true});
			// 			break;
			// 	}
			// }
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
			if(!textInputHasFocus)
			{
				//don't toggle if the user is trying to type
				this.showAdditional = !this.showAdditional;
				setContentHeight();
			}
		};

		/**
		 * Edit or save description
		 * @param event
		 */
		this.toggleEditDescription = function (event) {
			event.stopPropagation();
			if (this.editingDescription) {
				this.editingDescription = false;

				if (self.issueData.desc !== savedDescription) {
					var data = {
						desc: self.issueData.desc
					};
					IssuesService.updateIssue(self.issueData, data)
						.then(function (data) {
							IssuesService.updatedIssue = self.issueData;
							savedDescription = self.issueData.desc;

							// Add info for new comment
							var comment = data.data.issue.comments[data.data.issue.comments.length - 1];
							IssuesService.convertActionCommentToText(comment, self.topic_types);
							comment.timeStamp = IssuesService.getPrettyTime(comment.created);
							self.issueData.comments.push(comment);
						});
				}

			}
			else {
				this.editingDescription = true;
				savedDescription = self.issueData.desc;
			}
		};

		/**
		 * Register if text input has focus or not
		 * @param focus
		 */
		this.textInputHasFocus = function (focus) {
			textInputHasFocus = focus;
		};

		/**
		 * This prevents show/hide of additional info when clicking in the input
		 * @param event
		 */
		this.titleInputClick = function (event) {
			event.stopPropagation();
		};

		/**
		 * Save issue
		 */
		function saveIssue () {
			var viewpointPromise = $q.defer(),
				screenShotPromise = $q.defer(),
				data;

			if(commentViewpoint)
			{
				console.log("has commentViewpoint");
				console.log(commentViewpoint);
				viewpointPromise.resolve(commentViewpoint);
			}
			else
			{
				// Get the viewpoint
				self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: self.account, project: self.project}});
			}
			viewpointPromise.promise.then(function (viewpoint) {
				if (savedScreenShot !== null) {
					if (self.actions.multi.selected && self.selectedObjects) {
						// Create a group of selected objects
						data = {name: self.issueData.name, color: [255, 0, 0], objects: self.selectedObjects};
						UtilsService.doPost(data, self.account + "/" + self.project + "/groups").then(function (response) {
							console.log("saving issue with viewpoint: " );
							console.log(viewpoint);
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
						if (self.actions.multi.selected && self.selectedObjects) {
							// Create a group of selected objects
							data = {name: self.issueData.name, color: [255, 0, 0], objects: self.selectedObjects};
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
				creator_role: self.userJob._id,
				pickedPos: null,
				pickedNorm: null,
				scale: 1.0,
				assigned_roles: self.issueData.assigned_roles,
				priority: self.issueData.priority,
				status: self.issueData.status,
				topic_type: self.issueData.topic_type,
				desc: self.issueData.desc,
				rev_id: self.revision
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
					self.issueData.thumbnailPath = UtilsService.getServerUrl(self.issueData.thumbnail);
					self.descriptionThumbnail = UtilsService.getServerUrl(self.issueData.viewpoint.screenshotSmall);
					self.issueData.timeStamp = IssuesService.getPrettyTime(self.issueData.created);

					// Hide the description input if no description
					self.hideDescription = !self.issueData.hasOwnProperty("desc");

					// Notify parent of new issue
					self.issueCreated({issue: self.issueData});

					// Hide some actions
					self.actions.pin.hidden = true;
					self.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
					self.actions.multi.hidden = true;

					self.submitDisabled = true;
					setContentHeight();

					startNotification();
					self.saving = false;

					$state.go('home.account.project.issue', 
						{
							account: self.account, 
							project: self.project, 
							revision: self.revision,
							issue: self.data._id,
							noSet: true
						}, 
						{notify: false}
					);
			});

			AnalyticService.sendEvent({
				eventCategory: 'Issue',
				eventAction: 'create'
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
						self.saving = false;
						afterNewComment(response.data.issue);
					});
			}
			else {
				self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: self.issueData.account, project: self.issueData.project}});
				viewpointPromise.promise.then(function (viewpoint) {
					IssuesService.saveComment(self.issueData, self.comment, viewpoint)
						.then(function (response) {
							self.saving = false;
							afterNewComment(response.data.issue);
						});
				});
			}

			AnalyticService.sendEvent({
				eventCategory: 'Issue',
				eventAction: 'comment'
			});
		}

		/**
		 * Process after new comment saved
		 * @param comment
		 */
		function afterNewComment(comment, noDeleteInput) {
			// mark all other comments sealed
			self.issueData.comments.forEach(function(comment){
				comment.sealed = true;
			});

			if(comment.owner !== Auth.getUsername()){
				comment.sealed = true;
			}

			if(comment.viewpoint && comment.viewpoint.screenshot){
				comment.viewpoint.screenshotPath = UtilsService.getServerUrl(comment.viewpoint.screenshot);
			}


			// Add new comment to issue
			if (!self.issueData.comments) {
				self.issueData.comments = [];
			}
			self.issueData.comments.push({
				sealed: comment.sealed,
				guid: comment.guid,
				comment: comment.comment,
				owner: comment.owner,
				timeStamp: IssuesService.getPrettyTime(comment.created),
				viewpoint: comment.viewpoint,
				action: comment.action
			});

			// Mark any previous comment as 'sealed' - no longer deletable or editable
			// This logic now moved to backend
			// if (self.issueData.comments.length > 1) {
			// 	IssuesService.sealComment(self.issueData, (self.issueData.comments.length - 2))
			// 		.then(function(response) {
			// 			console.log(response);
			// 			self.issueData.comments[self.issueData.comments.length - 2].sealed = true;
			// 		});
			// }

			if(!noDeleteInput){
				delete self.comment;
				delete self.commentThumbnail;
				IssuesService.updatedIssue = self.issueData;
				self.submitDisabled = true;
			}


			commentAreaScrollToBottom();
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
			AnalyticService.sendEvent({
				eventCategory: 'Issue',
				eventAction: 'deleteComment'
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
				if (this.issueData.comments[index].comment !== savedComment) {
					IssuesService.editComment(self.issueData, this.issueData.comments[index].comment, index)
						.then(function(response) {
							self.issueData.comments[index].timeStamp = IssuesService.getPrettyTime(response.data.created);
							IssuesService.updatedIssue = self.issueData;
							savedComment = self.issueData.comments[index].comment;
						});
					AnalyticService.sendEvent({
						eventCategory: 'Issue',
						eventAction: 'editComment'
					});
				}
			}
			else {
				editingCommentIndex = index;
				this.issueData.comments[index].editing = true;
				savedComment = this.issueData.comments[index].comment;
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

			}
			else {
				// Description
				self.descriptionThumbnail = data.screenShot;
				
				self.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: self.account, project: self.project}});
			}

			viewpointPromise.promise.then(function (viewpoint) {
				commentViewpoint = viewpoint;
				commentViewpoint.screenshot = data.screenShot.substring(data.screenShot.indexOf(",") + 1);
			});

			setContentHeight();
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
				// self.actions[currentAction].color = "";
				// currentAction = null;
			};
		}

		/**
		 * Set the role indicator colour
		 * @param {String} role
		 */
		function setRoleIndicatorColour (role) {
			var roleColor = IssuesService.getJobColor(role);
			if (roleColor !== null) {
				issueRoleIndicator.css("background", IssuesService.getJobColor(role));
				issueRoleIndicator.css("border", "none");
			}
			else {
				issueRoleIndicator.css("background", "none");
				issueRoleIndicator.css("border", "1px solid #DDDDDD");
			}
		}

		/**
		 * Check if user has a role same as the creator role
		 * @returns {boolean}
		 */
		function userHasCreatorRole () {
			if(self.userJob._id && self.data.creator_role){
				return self.userJob._id === self.data.creator_role;
			}
		}

		/**
		 * Check if user has admin role
		 * @returns {boolean}
		 */
		function userHasAdminRole () {
			var i, iLength, j, jLength,
				hasAdminRole = false;

			// for (i = 0, iLength = self.userRoles.length; (i < iLength) && !hasAdminRole; i += 1) {
			// 	for (j = 0, jLength = self.availableRoles.length; (j < jLength) && !hasAdminRole; j += 1) {
			// 		hasAdminRole = (self.userRoles[i] === self.availableRoles[j].role) && (Auth.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, self.availableRoles[j].permissions));
			// 	}
			// }

			return hasAdminRole;
		}

		/**
		 * Set the content height
		 */
		function setContentHeight() {
			var i, length,
				newIssueHeight = 285,
				descriptionTextHeight = 80,
				commentTextHeight = 80,
				commentImageHeight = 170,
				additionalInfoHeight = 140,
				thumbnailHeight = 180,
				issueMinHeight = 370,
				height = issueMinHeight;

			if (self.data) {
				// Additional info
				if (self.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description text
				if (self.canEditDescription || self.issueData.hasOwnProperty("desc")) {
					height += descriptionTextHeight;
				}
				// Description thumbnail
				height += thumbnailHeight;
				// New comment thumbnail
				if (self.commentThumbnail) {
					height += thumbnailHeight;
				}
				// Comments
				if (self.issueData.comments) {
					for (i = 0, length = self.issueData.comments.length; i < length; i += 1) {
						height += commentTextHeight;
						if (self.issueData.comments[i].viewpoint && self.issueData.comments[i].viewpoint.hasOwnProperty("screenshot")) {
							height += commentImageHeight;
						}
					}
				}
			}
			else {
				height = newIssueHeight;
				if (self.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description thumbnail
				if (self.descriptionThumbnail) {
					height += thumbnailHeight;
				}
			}

			self.contentHeight({height: height});
		}

		function commentAreaScrollToBottom(){

			$timeout(function(){
				var commentArea = document.getElementById('descriptionAndComments');
				commentArea.scrollTop = commentArea.scrollHeight;
			});
		}


		function startNotification(){
			if(self.data && !self.notificationStarted){

				self.notificationStarted = true;

				/*
				* Watch for new comments
				*/
				NotificationService.subscribe.newComment(self.data.account, self.data.project, self.data._id, function(comment){

					if(comment.action){
						IssuesService.convertActionCommentToText(comment, self.topic_types);
					}

					afterNewComment(comment, true);

					//necessary to apply scope.apply and reapply scroll down again here because this function is not triggered from UI
					$scope.$apply();
					commentAreaScrollToBottom();
				});

				/*
				* Watch for comment changed
				*/
				NotificationService.subscribe.commentChanged(self.data.account, self.data.project, self.data._id, function(newComment){

					var comment = self.issueData.comments.find(function(comment){
						return comment.guid === newComment.guid;
					});

					comment.comment = newComment.comment;

					$scope.$apply();
					commentAreaScrollToBottom();
				});

				/*
				* Watch for comment deleted
				*/
				NotificationService.subscribe.commentDeleted(self.data.account, self.data.project, self.data._id, function(newComment){

					var deleteIndex;
					self.issueData.comments.forEach(function(comment, i){
						if (comment.guid === newComment.guid){
							deleteIndex = i;
						}
					});

					self.issueData.comments[deleteIndex].comment = 'This comment has been deleted.'


					$scope.$apply();
					commentAreaScrollToBottom();

					$timeout(function(){
						self.issueData.comments.splice(deleteIndex, 1);
					}, 4000);
				});

				/*
				* Watch for issue change
				*/
				NotificationService.subscribe.issueChanged(self.data.account, self.data.project, self.data._id, function(issue){

					self.issueData.topic_type = issue.topic_type;
					self.issueData.desc = issue.desc;
					self.issueData.priority = issue.priority;
					self.issueData.status = issue.status;
					self.issueData.assigned_roles = issue.assigned_roles;

					self.statusIcon = IssuesService.getStatusIcon(self.issueData);
					setRoleIndicatorColour(self.issueData.assigned_roles[0]);
					setCanUpdateStatus(self.issueData);

					$scope.$apply();

				});
			}
		}

		startNotification();


	}
}());
