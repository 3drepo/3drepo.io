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
				controllerAs: "vm",
           		bindToController: true,
				templateUrl: "issueComp.html",
				bindings: {
					account: "<",
					model: "<",
					revision: "<",
					data: "<",
					keysDown: "<",
					exit: "&",
					sendEvent: "&",
					event: "<",
					issueCreated: "&",
					contentHeight: "&",
					selectedObjects: "<",
					modelSettings: '<',
					setInitialSelectedObjects: "&",
					userJob: "<",
					availableJobs: "<"
				}
			}
		);

	IssueCompCtrl.$inject = ["$q", "$mdDialog", "$element", "EventService", "IssuesService", "UtilsService", "NotificationService", "AuthService", "$timeout", "$scope", "serverConfig", "AnalyticService", "$state"];

	function IssueCompCtrl ($q, $mdDialog, $element, EventService, IssuesService, UtilsService, NotificationService, AuthService, $timeout, $scope, serverConfig, AnalyticService, $state) {
		var vm = this,
			savedScreenShot = null,
			highlightBackground = "#FF9800",
			currentAction = null,
			editingCommentIndex = null,
			commentViewpoint,
			aboutToBeDestroyed = false,
			textInputHasFocus = false,
			savedDescription,
			savedComment,
			issueRoleIndicator = angular.element($element[0].querySelector('#issueRoleIndicator')),
			disableStatus;

		/*
		 * Init
		 */
		vm.$onInit = function() { 

			vm.UtilsService = UtilsService;
			vm.hideDescription = false;
			vm.submitDisabled = true;
			vm.pinData = null;
			vm.showAdditional = true;
			vm.editingDescription = false;
			vm.clearPin = false;

			vm.priorities = [
				{value: "none", label: "None"},
				{value: "low", label: "Low"},
				{value: "medium", label: "Medium"},
				{value: "high", label: "High"}
			];
			vm.statuses = [
				{value: "open", label: "Open"},
				{value: "in progress", label: "In progress"},
				{value: "for approval", label: "For approval"},
				{value: "closed", label: "Closed"}
			];

			vm.actions = {
				screen_shot: {icon: "camera_alt", label: "Screen shot", hidden: vm.data, selected: false},
				pin: {icon: "place", label: "Pin", hidden: vm.data, selected: false}
			};

			vm.notificationStarted = false;

			console.log("userJob", vm.userJob)

		}

	
		vm.convertCommentTopicType = function() {
			vm.issueData && vm.issueData.comments.forEach(function(comment){
				if(comment.action && comment.action.property === 'topic_type'){
					IssuesService.convertActionCommentToText(comment, vm.topic_types);
				}
			});
		}

		vm.setCanUpdateStatus = function(issueData) {

			if(!AuthService.hasPermission(serverConfig.permissions.PERM_CREATE_ISSUE, vm.modelSettings.permissions)){
				console.log('no create issue permissions')
				return vm.canUpdateStatus = false;
			}

			vm.canUpdateStatus = (AuthService.getUsername() === issueData.owner) ||
								 issueData.assigned_roles.indexOf(vm.userJob._id) !== -1

		}

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var i, length,
				leftArrow = 37;

			if(changes.hasOwnProperty('modelSettings')){
				vm.topic_types = vm.modelSettings.properties && vm.modelSettings.properties.topicTypes || [];
				vm.canComment = AuthService.hasPermission(serverConfig.permissions.PERM_COMMENT_ISSUE, vm.modelSettings.permissions);
				//convert comment topic_types
				vm.convertCommentTopicType();
			}

			// Data

			if (changes.hasOwnProperty("data")) {
				if (vm.data) {

					startNotification();
					var disableStatus;

					// Set up statuses
					disableStatus = !userHasCreatorRole() && !userHasAdminRole() && !(AuthService.getUsername() === vm.data.owner);
					vm.statuses[0].disabled = disableStatus;
					vm.statuses[3].disabled = disableStatus;

					vm.issueData = angular.copy(vm.data);
					vm.issueData.comments = vm.issueData.comments || [];
					vm.issueData.name = IssuesService.generateTitle(vm.issueData); // Change name to title for display purposes
					vm.issueData.thumbnailPath = UtilsService.getServerUrl(vm.issueData.thumbnail);
					vm.issueData.comments.forEach(function(comment){
						if(comment.owner !== AuthService.getUsername()){
							comment.sealed = true;
						}
					});

					vm.hideDescription = !vm.issueData.hasOwnProperty("desc");
					if (vm.issueData.viewpoint.hasOwnProperty("screenshotSmall")) {
						vm.descriptionThumbnail = UtilsService.getServerUrl(vm.issueData.viewpoint.screenshotSmall);
					}
					// Issue owner or user with same role as issue creator role can update issue
					vm.canUpdate = (AuthService.getUsername() === vm.issueData.owner);
					if (!vm.canUpdate) {
						vm.canUpdate = vm.userJob._id && vm.issueData.creator_role && (vm.userJob._id === vm.issueData.creator_role);
					}

					if(!AuthService.hasPermission(serverConfig.permissions.PERM_CREATE_ISSUE, vm.modelSettings.permissions)){
						vm.canUpdate = false;
					}

					vm.setCanUpdateStatus(vm.issueData);

					// Can edit description if no comments
					vm.canEditDescription = (vm.issueData.comments.length === 0);

					// Role colour
					if (vm.issueData.assigned_roles.length > 0) {
						setRoleIndicatorColour(vm.issueData.assigned_roles[0]);
					}
					else {
						setRoleIndicatorColour(vm.issueData.creator_role);
					}

					// Old issues
					vm.issueData.priority = (!vm.issueData.priority) ? "none" : vm.issueData.priority;
					vm.issueData.status = (!vm.issueData.status) ? "open" : vm.issueData.status;
					vm.issueData.topic_type = (!vm.issueData.topic_type) ? "for_information" : vm.issueData.topic_type;
					vm.issueData.assigned_roles = (!vm.issueData.assigned_roles) ? [] : vm.issueData.assigned_roles;

					if(vm.issueData.status === 'closed'){
						vm.canUpdate = false;
						vm.canComment = false;
					}
				
					vm.convertCommentTopicType();
				}
				else {
					vm.issueData = {
						priority: "none",
						status: "open",
						assigned_roles: [],
						topic_type: "for_information",
						viewpoint: {}
					};
					vm.canUpdate = true;
					vm.canUpdateStatus = true;
				}
				vm.statusIcon = IssuesService.getStatusIcon(vm.issueData);
				setContentHeight();
			}

			// Role
			if (changes.hasOwnProperty("availableJobs") && vm.availableJobs) {
				//console.log(vm.availableJobs);
				vm.modelJobs = vm.availableJobs.map(function (availableJob) {
					/*
					// Get the actual role and return the last part of it
					return availableRole.role.substring(availableRole.role.lastIndexOf(".") + 1);
					*/
					return availableJob._id;
				});
				//console.log(vm.modelJobs);
			}
		};

		/**
		 * Save a comment if one was being typed before close
		 * Cancel editing comment
		 */
		vm.$onDestroy = function () {
			aboutToBeDestroyed = true;
			if (vm.comment) {
				IssuesService.updatedIssue = vm.issueData; // So that issues list is notified
				saveComment();
			}
			if (editingCommentIndex !== null) {
				vm.issueData.comments[editingCommentIndex].editing = false;
			}
			// Get out of pin drop mode
			//if ((currentAction !== null) && (currentAction === "pin")) {
				vm.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
				vm.clearPin = true;
			//}

			//unsubscribe on destroy
			if(vm.data){
				NotificationService.unsubscribe.newComment(vm.data.account, vm.data.model, vm.data._id);
				NotificationService.unsubscribe.commentChanged(vm.data.account, vm.data.model, vm.data._id);
				NotificationService.unsubscribe.commentDeleted(vm.data.account, vm.data.model, vm.data._id);
				NotificationService.unsubscribe.issueChanged(vm.data.account, vm.data.model, vm.data._id);
			}
			
		};

		/**
		 * Disable the save button for a new issue if there is no name
		 */
		vm.nameChange = function () {
			vm.submitDisabled = !vm.issueData.name;
		};

		/**
		 * Disable the save button when commenting on an issue if there is no comment
		 */
		vm.commentChange = function () {
			vm.submitDisabled = (vm.data && !vm.comment);
		};

		/**
		 * Handle status change
		 */
		vm.statusChange = function () {
			var data,
				comment;

			vm.statusIcon = IssuesService.getStatusIcon(vm.issueData);
			setRoleIndicatorColour(vm.issueData.assigned_roles[0]);

			if (vm.data) {
				data = {
					priority: vm.issueData.priority,
					status: vm.issueData.status,
					topic_type: vm.issueData.topic_type,
					assigned_roles: vm.issueData.assigned_roles
				};

				IssuesService.updateIssue(vm.issueData, data)
					.then(function (response) {
						//console.log(response);

						// Add info for new comment
						comment = response.data.issue.comments[response.data.issue.comments.length - 1];
						IssuesService.convertActionCommentToText(comment, vm.topic_types);
						comment.timeStamp = IssuesService.getPrettyTime(comment.created);
						vm.issueData.comments.push(comment);

						// Update last but one comment in case it was "sealed"
						if (vm.issueData.comments.length > 1) {
							// comment = response.data.issue.comments[response.data.issue.comments.length - 2];
							// comment.timeStamp = IssuesService.getPrettyTime(comment.created);
							// if (comment.action) {
							// 	IssuesService.convertActionCommentToText(comment, vm.topic_types);
							// }
							//vm.issueData.comments[vm.issueData.comments.length - 2] = comment;
							vm.issueData.comments[vm.issueData.comments.length - 2].sealed = true;
						}

						// The status could have changed due to assigning role
						vm.issueData.status = response.data.issue.status;
						vm.issueData.assigned_roles = response.data.issue.assigned_roles;
						IssuesService.updatedIssue = vm.issueData;
						vm.setCanUpdateStatus(vm.issueData);

						commentAreaScrollToBottom();
					});


				if(vm.issueData.status === 'closed'){
					vm.canUpdate = false;
					vm.canComment = false;
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
		vm.submit = function () {
			
			vm.saving = true;

			if (vm.data) {
				saveComment();
			}
			else {
				vm.saveIssue();
			}
		};

		/**
		 * Show viewpoint
		 * @param event
		 * @param viewpoint Can be undefined for action comments
		 */
		vm.showViewpoint = function (event, viewpoint) {

			//README: vm should also highlight selected objects within vm issue, but 
			//will require a lot of rewriting for vm to work at present!
			if (viewpoint && (event.type === "click")) {
				var data = {
					position : viewpoint.position,
					view_dir : viewpoint.view_dir,
					up: viewpoint.up,
					account: vm.issueData.account,
					model: vm.issueData.model
				};
				vm.sendEvent({type: EventService.EVENT.VIEWER.SET_CAMERA, value: data});

				data = {
					clippingPlanes: viewpoint.clippingPlanes,
					fromClipPanel: false,
					account: vm.issueData.account,
					model: vm.issueData.model
				};
				vm.sendEvent({type: EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES, value: data});
			}
		};

		/**
		 * Show screen shot
		 * @param event
		 * @param viewpoint
		 */
		vm.showScreenShot = function (event, viewpoint) {
			vm.screenShot = UtilsService.getServerUrl(viewpoint.screenshot);
			$mdDialog.show({
				controller: function () {
					vm.dialogCaller = vm;
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
		vm.doAction = function (event, action) {
			// Handle previous action
			vm.actions[action].selected = !vm.actions[action].selected;
			var selected = vm.actions[action].selected;

			switch(action){
				case "pin":

					if(selected){
						vm.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: true});
					} else {
						vm.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});
					}
					break;

				case "screen_shot":

					// There is no concept of selected in screenshot as there will be a popup once you click the button
					vm.actions[action].selected = false;

					delete vm.screenShot; // Remove any clicked on screen shot
					$mdDialog.show({
						controller: ScreenShotDialogController,
						controllerAs: "vm",
						templateUrl: "issueScreenShotDialog.html",
						targetEvent: event
					});
					break;

			}

		};

		/**
		 * Set the current add pin data
		 * @param pinData
		 */
		vm.setPin = function (pinData) {
			vm.pinData = pinData.data;
		};

		/**
		 * Toggle showing of extra inputs
		 */
		vm.toggleShowAdditional = function () {
			if(!textInputHasFocus)
			{
				//don't toggle if the user is trying to type
				vm.showAdditional = !vm.showAdditional;
				setContentHeight();
			}
		};

		/**
		 * Edit or save description
		 * @param event
		 */
		vm.toggleEditDescription = function (event) {
			event.stopPropagation();
			if (vm.editingDescription) {
				vm.editingDescription = false;

				if (vm.issueData.desc !== savedDescription) {
					var data = {
						desc: vm.issueData.desc
					};
					IssuesService.updateIssue(vm.issueData, data)
						.then(function (data) {
							IssuesService.updatedIssue = vm.issueData;
							savedDescription = vm.issueData.desc;

							// Add info for new comment
							var comment = data.data.issue.comments[data.data.issue.comments.length - 1];
							IssuesService.convertActionCommentToText(comment, vm.topic_types);
							comment.timeStamp = IssuesService.getPrettyTime(comment.created);
							vm.issueData.comments.push(comment);
						});
				}

			}
			else {
				vm.editingDescription = true;
				savedDescription = vm.issueData.desc;
			}
		};

		/**
		 * Register if text input has focus or not
		 * @param focus
		 */
		vm.textInputHasFocus = function (focus) {
			textInputHasFocus = focus;
		};

		/**
		 * This prevents show/hide of additional info when clicking in the input
		 * @param event
		 */
		vm.titleInputClick = function (event) {
			event.stopPropagation();
		};

		/**
		 * Save issue
		 */
		vm.saveIssue = function() {
			var viewpointPromise = $q.defer(),
				screenShotPromise = $q.defer(),
				objectsPromise = $q.defer(),
				data;

			if(commentViewpoint)
			{
				viewpointPromise.resolve(commentViewpoint);
			}
			else
			{
				// Get the viewpoint
				vm.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: vm.account, model: vm.model}});
			}

			//Get selected objects
			vm.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_OBJECT_STATUS, value: {promise: objectsPromise, account: vm.account, model: vm.model}});

			viewpointPromise.promise.then(function (viewpoint) {
				objectsPromise.promise.then(function (objectInfo)
					{
						if (savedScreenShot !== null) {
							if (objectInfo.highlightedNodes.length > 0) {
									// Create a group of selected objects
								data = {name: vm.issueData.name, color: [255, 0, 0], objects: objectInfo.highlightedNodes};
								UtilsService.doPost(data, vm.account + "/" + vm.model + "/groups")
								.then(function (response) {
									console.log("RESPONSE", response)
									vm.doSaveIssue(viewpoint, savedScreenShot, response.data._id);
								})
								.catch(function(error) {
									console.error("Error saving issue: ", error);
								});
							}
							else {
								vm.doSaveIssue(viewpoint, savedScreenShot);
							}
						}
						else {
							// Get a screen shot if not already created
							vm.sendEvent({type: EventService.EVENT.VIEWER.GET_SCREENSHOT, value: {promise: screenShotPromise}});
							screenShotPromise.promise.then(function (screenShot) {
								if (objectInfo.highlightedNodes.length > 0) {
									// Create a group of selected objects
									data = {name: vm.issueData.name, color: [255, 0, 0], objects: objectInfo.highlightedNodes};
									UtilsService.doPost(data, vm.account + "/" + vm.model + "/groups").then(function (response) {
										vm.doSaveIssue(viewpoint, screenShot, response.data._id);
									});
								}
								else {
									vm.doSaveIssue(viewpoint, screenShot);
								}
							});
						}
					}
			);

			});
		}

		/**
		 * Send new issue data to server
		 * @param viewpoint
		 * @param screenShot
		 * @param groupId
		 */
		vm.doSaveIssue = function(viewpoint, screenShot, groupId) {
			var	issue;

			console.log("vm.doSaveIssue", vm.userData)

			// Remove base64 header text from screenShot and add to viewpoint
			screenShot = screenShot.substring(screenShot.indexOf(",") + 1);
			viewpoint.screenshot = screenShot;

			// Save issue
			issue = {
				account: vm.account,
				model: vm.model,
				objectId: null,
				name: vm.issueData.name,
				viewpoint: viewpoint,
				creator_role: vm.userJob._id,
				pickedPos: null,
				pickedNorm: null,
				scale: 1.0,
				assigned_roles: vm.issueData.assigned_roles,
				priority: vm.issueData.priority,
				status: vm.issueData.status,
				topic_type: vm.issueData.topic_type,
				desc: vm.issueData.desc,
				rev_id: vm.revision
			};
			// Pin data
			if (vm.pinData !== null) {
				issue.pickedPos = vm.pinData.pickedPos;
				issue.pickedNorm = vm.pinData.pickedNorm;
			}
			// Group data
			if (angular.isDefined(groupId)) {
				issue.group_id = groupId;
			}
			IssuesService.saveIssue(issue)
				.then(function (response) {
					vm.data = response.data; // So that new changes are registered as updates
					vm.issueData = response.data;
					vm.issueData.title = IssuesService.generateTitle(vm.issueData);
					vm.issueData.thumbnailPath = UtilsService.getServerUrl(vm.issueData.thumbnail);
					vm.descriptionThumbnail = UtilsService.getServerUrl(vm.issueData.viewpoint.screenshotSmall);
					vm.issueData.timeStamp = IssuesService.getPrettyTime(vm.issueData.created);

					// Hide the description input if no description
					vm.hideDescription = !vm.issueData.hasOwnProperty("desc");

					// Notify parent of new issue
					vm.issueCreated({issue: vm.issueData});

					// Hide some actions
					vm.actions.pin.hidden = true;
					vm.sendEvent({type: EventService.EVENT.PIN_DROP_MODE, value: false});

					vm.submitDisabled = true;
					setContentHeight();

					startNotification();
					vm.saving = false;

					$state.go('home.account.model.issue', 
						{
							account: vm.account, 
							model: vm.model, 
							revision: vm.revision,
							issue: vm.data._id,
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

			if (angular.isDefined(vm.commentThumbnail)) {
				IssuesService.saveComment(vm.issueData, vm.comment, commentViewpoint)
					.then(function (response) {
						vm.saving = false;
						afterNewComment(response.data.issue);
					});
			}
			else {
				vm.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: vm.issueData.account, model: vm.issueData.model}});
				viewpointPromise.promise.then(function (viewpoint) {
					IssuesService.saveComment(vm.issueData, vm.comment, viewpoint)
						.then(function (response) {
							vm.saving = false;
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
			vm.issueData.comments.forEach(function(comment){
				comment.sealed = true;
			});

			if(comment.owner !== AuthService.getUsername()){
				comment.sealed = true;
			}

			if(comment.viewpoint && comment.viewpoint.screenshot){
				comment.viewpoint.screenshotPath = UtilsService.getServerUrl(comment.viewpoint.screenshot);
			}


			// Add new comment to issue
			if (!vm.issueData.comments) {
				vm.issueData.comments = [];
			}
			vm.issueData.comments.push({
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
			// if (vm.issueData.comments.length > 1) {
			// 	IssuesService.sealComment(vm.issueData, (vm.issueData.comments.length - 2))
			// 		.then(function(response) {
			// 			console.log(response);
			// 			vm.issueData.comments[vm.issueData.comments.length - 2].sealed = true;
			// 		});
			// }

			if(!noDeleteInput){
				delete vm.comment;
				delete vm.commentThumbnail;
				IssuesService.updatedIssue = vm.issueData;
				vm.submitDisabled = true;
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
		vm.deleteComment = function(event, index) {
			event.stopPropagation();
			IssuesService.deleteComment(vm.issueData, index)
				.then(function(response) {
					vm.issueData.comments.splice(index, 1);
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
		vm.toggleEditComment = function(event, index) {
			event.stopPropagation();
			if (vm.issueData.comments[index].editing) {
				editingCommentIndex = null;
				vm.issueData.comments[index].editing = false;
				if (vm.issueData.comments[index].comment !== savedComment) {
					IssuesService.editComment(vm.issueData, vm.issueData.comments[index].comment, index)
						.then(function(response) {
							vm.issueData.comments[index].timeStamp = IssuesService.getPrettyTime(response.data.created);
							IssuesService.updatedIssue = vm.issueData;
							savedComment = vm.issueData.comments[index].comment;
						});
					AnalyticService.sendEvent({
						eventCategory: 'Issue',
						eventAction: 'editComment'
					});
				}
			}
			else {
				editingCommentIndex = index;
				vm.issueData.comments[index].editing = true;
				savedComment = vm.issueData.comments[index].comment;
			}
		};

		/**
		 * A screen shot has been saved
		 * @param data
		 */
		vm.screenShotSave = function (data) {
			var viewpointPromise = $q.defer();

			savedScreenShot = data.screenShot;
			if (typeof vm.data === "object") {
				// Comment
				vm.commentThumbnail = data.screenShot;

				// Get the viewpoint and add the screen shot to it
				// Remove base64 header text from screen shot
				vm.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: vm.issueData.account, model: vm.issueData.model}});

			}
			else {
				// Description
				vm.descriptionThumbnail = data.screenShot;
				
				vm.sendEvent({type: EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, value: {promise: viewpointPromise, account: vm.account, model: vm.model}});
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
			vm.dialogCaller = vm;

			/**
			 * Deselect the screen shot action button after close the screen shot dialog
			 */
			vm.closeScreenShot = function () {
				// vm.actions[currentAction].color = "";
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
			if(vm.userJob._id && vm.data.creator_role){
				return vm.userJob._id === vm.data.creator_role;
			}
		}

		/**
		 * Check if user has admin role
		 * @returns {boolean}
		 */
		function userHasAdminRole () {
			var i, iLength, j, jLength,
				hasAdminRole = false;

			// for (i = 0, iLength = vm.userRoles.length; (i < iLength) && !hasAdminRole; i += 1) {
			// 	for (j = 0, jLength = vm.availableRoles.length; (j < jLength) && !hasAdminRole; j += 1) {
			// 		hasAdminRole = (vm.userRoles[i] === vm.availableRoles[j].role) && (AuthService.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, vm.availableRoles[j].permissions));
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

			if (vm.data) {
				// Additional info
				if (vm.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description text
				if (vm.canEditDescription || vm.issueData.hasOwnProperty("desc")) {
					height += descriptionTextHeight;
				}
				// Description thumbnail
				height += thumbnailHeight;
				// New comment thumbnail
				if (vm.commentThumbnail) {
					height += thumbnailHeight;
				}
				// Comments
				if (vm.issueData.comments) {
					for (i = 0, length = vm.issueData.comments.length; i < length; i += 1) {
						height += commentTextHeight;
						if (vm.issueData.comments[i].viewpoint && vm.issueData.comments[i].viewpoint.hasOwnProperty("screenshot")) {
							height += commentImageHeight;
						}
					}
				}
			}
			else {
				height = newIssueHeight;
				if (vm.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description thumbnail
				if (vm.descriptionThumbnail) {
					height += thumbnailHeight;
				}
			}

			vm.contentHeight({height: height});
		}

		function commentAreaScrollToBottom(){

			$timeout(function(){
				var commentArea = document.getElementById('descriptionAndComments');
				commentArea.scrollTop = commentArea.scrollHeight;
			});
		}


		function startNotification(){
			if(vm.data && !vm.notificationStarted){

				vm.notificationStarted = true;

				/*
				* Watch for new comments
				*/
				NotificationService.subscribe.newComment(vm.data.account, vm.data.model, vm.data._id, function(comment){

					if(comment.action){
						IssuesService.convertActionCommentToText(comment, vm.topic_types);
					}

					afterNewComment(comment, true);

					//necessary to apply scope.apply and reapply scroll down again here because vm function is not triggered from UI
					$scope.$apply();
					commentAreaScrollToBottom();
				});

				/*
				* Watch for comment changed
				*/
				NotificationService.subscribe.commentChanged(vm.data.account, vm.data.model, vm.data._id, function(newComment){

					var comment = vm.issueData.comments.find(function(comment){
						return comment.guid === newComment.guid;
					});

					comment.comment = newComment.comment;

					$scope.$apply();
					commentAreaScrollToBottom();
				});

				/*
				* Watch for comment deleted
				*/
				NotificationService.subscribe.commentDeleted(vm.data.account, vm.data.model, vm.data._id, function(newComment){

					var deleteIndex;
					vm.issueData.comments.forEach(function(comment, i){
						if (comment.guid === newComment.guid){
							deleteIndex = i;
						}
					});

					vm.issueData.comments[deleteIndex].comment = 'This comment has been deleted.'


					$scope.$apply();
					commentAreaScrollToBottom();

					$timeout(function(){
						vm.issueData.comments.splice(deleteIndex, 1);
					}, 4000);
				});

				/*
				* Watch for issue change
				*/
				NotificationService.subscribe.issueChanged(vm.data.account, vm.data.model, vm.data._id, function(issue){

					vm.issueData.topic_type = issue.topic_type;
					vm.issueData.desc = issue.desc;
					vm.issueData.priority = issue.priority;
					vm.issueData.status = issue.status;
					vm.issueData.assigned_roles = issue.assigned_roles;

					vm.statusIcon = IssuesService.getStatusIcon(vm.issueData);
					setRoleIndicatorColour(vm.issueData.assigned_roles[0]);
					vm.setCanUpdateStatus(vm.issueData);

					$scope.$apply();

				});
			}
		}

	}
}());
