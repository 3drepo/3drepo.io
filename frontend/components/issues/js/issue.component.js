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
		.component("issue", {
			controller: IssueCtrl,
			controllerAs: "vm",
			templateUrl: "templates/issue.html",
			bindings: {
				account: "<",
				model: "<",
				revision: "<",
				data: "=",
				keysDown: "<",
				exit: "&",
				event: "<",
				selectedIssueLoaded: "<",
				contentHeight: "&",
				selectedObjects: "<",
				modelSettings: "<",
				setInitialSelectedObjects: "&",
				userJob: "<",
				availableJobs: "<"
			}
		});

	IssueCtrl.$inject = [
		"$location", "$q", "$mdDialog", "$element",  
		"IssuesService", "APIService", "NotificationService", "AuthService", 
		"$timeout", "$scope", "ClientConfigService", "AnalyticService", 
		"$state", "StateManager", "MeasureService", "ViewerService",
		"DialogService"
	];

	function IssueCtrl (
		$location, $q, $mdDialog, $element, 
		IssuesService, APIService, NotificationService, AuthService, 
		$timeout, $scope, ClientConfigService, AnalyticService, 
		$state, StateManager, MeasureService, ViewerService,
		DialogService
	) {
		
		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() { 
			
			vm.canEditDescription = false;
			vm.issueFailedToLoad = false;

			vm.savedScreenShot = null;
			vm.editingCommentIndex = null;
			vm.commentViewpoint;
			vm.aboutToBeDestroyed = false;
			vm.savedDescription;
			vm.savedComment;

			vm.reasonCommentText = "Comment requires text";
			vm.reasonTitleText = "Issue requires name";
			vm.disabledReason = "";

			vm.issueProgressInfo = "Loading Issue...";
			vm.textInputHasFocusFlag = false;
			vm.submitDisabled = true;
			vm.pinDisabled = true;

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
				screen_shot: {
					id: "screenshot",
					icon: "camera_alt", 
					label: "Screen shot", 
					disabled: function() { 
						if (!vm.data) {
							return vm.submitDisabled;
						} else {
							return !vm.canComment();
						}
					}, 
					visible: function() { 
						return true; 
					},
					selected: false
				},
				pin: {
					id: "pin",
					icon: "place", 
					label: "Pin", 
					disabled: function() { 
						return vm.submitDisabled || vm.pinHidden;
					},
					visible: function() { 
						return !vm.data;
					},
					selected: false
				}
			};

			vm.notificationStarted = false;

			vm.setContentHeight();
			history.pushState(null, null, document.URL);

			var popStateHandler = function(event) {
				StateManager.popStateHandler(event, vm.account, vm.model);
			};

			var refreshHandler = function (event) {
				return StateManager.refreshHandler(event); 
			};

			//listen for user clicking the back button
			window.addEventListener("popstate", popStateHandler);
			window.addEventListener("beforeunload", refreshHandler);
			
			$scope.$on("$destroy", function(){
				window.removeEventListener("beforeunload", refreshHandler);
				window.removeEventListener("popstate", popStateHandler);
				ViewerService.removeUnsavedPin();
			});

		};

		vm.getPlaceholderText = function() {
			if (vm.canComment()) {
				return "Write a new comment";
			} else if (vm.issueData.status === "closed") {
				return "You cannot comment on a closed issue";
			} else {
				return "You do not have permission to leave comments";
			}
		};

	
		vm.convertCommentTopicType = function() {
			if (vm.issueData && vm.issueData.comments) {
				vm.issueData.comments.forEach(function(comment){
					if(comment.action && comment.action.property === "topic_type"){
						IssuesService.convertActionCommentToText(comment, vm.topic_types);
					}
				});
			}
		};

		$scope.$watch("vm.modelSettings", function() {
			if(vm.modelSettings){
				vm.topic_types = vm.modelSettings.properties && vm.modelSettings.properties.topicTypes || [];
				vm.checkCanComment();
				vm.convertCommentTopicType();
			}
		});

		$scope.$watch("vm.availableJobs", function() {
			// Role
			if (vm.availableJobs) {
				vm.modelJobs = vm.availableJobs.map(function (availableJob) {
					/*
					// Get the actual role and return the last part of it
					return availableRole.role.substring(availableRole.role.lastIndexOf(".") + 1);
					*/
					return availableJob._id;
				});

				// Always have an unassign option for users
				vm.modelJobs.push("Unassigned");
			}
		});

		vm.setEditIssueData = function(newIssueData) {

			vm.issueData = newIssueData;

			vm.issueData.comments = vm.issueData.comments || [];

			if (!vm.issueData.name) {
				vm.disabledReason = vm.reasonTitleText;
			}

			vm.issueData.thumbnailPath = APIService.getAPIUrl(vm.issueData.thumbnail);
			vm.issueData.comments.forEach(function(comment){
				if(comment.owner !== AuthService.getUsername()){
					comment.sealed = true;
				}
			});

			// Old issues
			vm.issueData.priority = (!vm.issueData.priority) ? "none" : vm.issueData.priority;
			vm.issueData.status = (!vm.issueData.status) ? "open" : vm.issueData.status;
			vm.issueData.topic_type = (!vm.issueData.topic_type) ? "for_information" : vm.issueData.topic_type;
			vm.issueData.assigned_roles = (!vm.issueData.assigned_roles) ? [] : vm.issueData.assigned_roles;

			vm.checkCanComment();
			vm.convertCommentTopicType();

			// Can edit description if no comments
			vm.canEditDescription = vm.checkCanEditDesc();

			IssuesService.populateIssue(vm.issueData);
			vm.setContentHeight();
		};

		$scope.$watch("vm.data", function() {

			// Data
			if (vm.data && vm.statuses && vm.statuses.length) {
				vm.issueFailedToLoad = false;
				vm.issueData = null;

				IssuesService.getIssue(vm.account, vm.model, vm.data._id)
					.then(function(fetchedIssue){
						vm.setEditIssueData(fetchedIssue);
						vm.startNotification();
						vm.issueFailedToLoad = false;
					})
					.catch(function(error){
						vm.issueFailedToLoad = true;
						console.error(error);
					});
				
				//vm.setEditIssueData(vm.data);
				
				
			} else {
				var creatorRole = vm.userJob._id;
				vm.issueData = IssuesService.createBlankIssue(creatorRole);
				IssuesService.populateIssue(vm.issueData);
				vm.setContentHeight();

			}

		});

		vm.checkCanEditDesc = function() {
			// Comments that aren't notifciations
			var canEditDesc = IssuesService.canChangeStatusToClosed(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);

			if (!canEditDesc) {
				return false;
			}

			if (!vm.issueData || !vm.issueData.comments) {
				return false;
			}

			var comments = vm.issueData.comments.filter(function(comment){ 
				return comment.action === undefined;
			});
			return comments.length === 0;
		};

		/**
		 * Save a comment if one was being typed before closegh
		 * Cancel editing comment
		 */
		vm.$onDestroy = function () {

			vm.aboutToBeDestroyed = true;
			if (vm.comment) {
				IssuesService.updateIssues(vm.issueData); // So that issues list is notified
				vm.saveComment();
			}
			if (vm.editingCommentIndex !== null) {
				vm.issueData.comments[vm.editingCommentIndex].editing = false;
			}
			// Get out of pin drop mode
			
			ViewerService.pin.pinDropMode = false;
			MeasureService.setDisabled(false);
			vm.clearPin = true;
			

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
			if (!vm.submitDisabled) {
				vm.disabledReason = vm.reasonTitleText;
			}
		};

		/**
		 * Disable the save button when commenting on an issue if there is no comment
		 */
		vm.commentChange = function () {
			vm.submitDisabled = (vm.data && !vm.comment);
			if (!vm.submitDisabled) {
				vm.disabledReason = vm.reasonCommentText;
			}
		};

		vm.checkCanComment = function() {
			
			return IssuesService.canComment(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);

		};

		vm.canChangePriority = function() {

			if (!IssuesService.isOpen(vm.issueData)) {
				return false;
			}

			return IssuesService.canChangePriority(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);

		};

		vm.disableStatusOption = function(status) {
			
			if (status.value === "closed" || status.value === "open") {
				return !IssuesService.canChangeStatusToClosed(
					vm.issueData,
					vm.userJob,
					vm.modelSettings.permissions
				);
			} 

			return false;
			
		};

		vm.canChangeStatus = function() {

			// We don't check is open because we need to be
			// able to open the issue!

			return IssuesService.canChangeStatus(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);
			
		};

		vm.canChangeType = function() {
			
			if (!IssuesService.isOpen(vm.issueData)) {
				return false;
			}

			return IssuesService.canChangeType(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);

		};

		vm.canChangeAssigned = function() {

			if (!IssuesService.isOpen(vm.issueData)) {
				return false;
			}
			
			return IssuesService.canChangeAssigned(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);

		};

		vm.canComment = function() {

			if (!IssuesService.isOpen(vm.issueData)) {
				return false;
			}
			
			return IssuesService.canComment(
				vm.issueData,
				vm.userJob,
				vm.modelSettings.permissions
			);

		};

		// This keeps the colours updated etc
		$scope.$watch("vm.issueData", function(){
			// if (vm.issueData) {
			// 	IssuesService.populateIssue(vm.issueData);
			// }
		}, true);

		/**
		 * Handle status change
		 */
		vm.statusChange = function () {
			
			if (vm.data && vm.issueData.account && vm.issueData.model) {
				
				// If it's unassigned we can update so that there are no assigned roles
				if (vm.issueData.assigned_roles.indexOf("Unassigned") !== -1) {
					vm.issueData.assigned_roles = [];
				}

				var statusChangeData = {
					priority: vm.issueData.priority,
					status: vm.issueData.status,
					topic_type: vm.issueData.topic_type,
					assigned_roles: vm.issueData.assigned_roles
				};

				IssuesService.updateIssue(vm.issueData, statusChangeData)
					.then(function (response) {
						if (response) {
							var respData = response.data.issue;
							IssuesService.populateIssue(respData);
							vm.issueData = respData;
						
							// Add info for new comment
							var commentCount = respData.comments.length;
							var comment = respData.comments[commentCount - 1];
							IssuesService.convertActionCommentToText(comment, vm.topic_types);
							comment.timeStamp = IssuesService.getPrettyTime(comment.created);
							// vm.issueData.comments.push(comment);
	
							// Update last but one comment in case it was "sealed"
							if (vm.issueData.comments.length > 1) {
								vm.issueData.comments[vm.issueData.comments.length - 2].sealed = true;
							}
	
							// Update the actual data model
							
							IssuesService.updateIssues(vm.issueData);

							vm.commentAreaScrollToBottom();
						}
						
					})
					.catch(vm.handleUpdateError);



				vm.checkCanComment();

				AnalyticService.sendEvent({
					eventCategory: "Issue",
					eventAction: "edit"
				});
			}
		};

		vm.handleUpdateError = function(error) {
			var content = "We tried to update your issue but it failed. " +
			"If this continues please message support@3drepo.io.";
			var escapable = true;
			console.error(error);
			DialogService.text("Error Updating Issue", content, escapable);
		};

		vm.getCommentPlaceholderText = function() {
			if (vm.canComment()) {
				return "Write your comment here";
			} else {
				return "You are not able to comment";
			}
		};

		/**
		 * Submit - new issue or comment or update issue
		 */
		vm.submit = function () {
			
			vm.saving = true;

			if (vm.data) {
				vm.saveComment();
			} else {
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

				// We clone the issueData so that we don't
				// overwrite the original issue data itself
				var newViewpointData = angular.copy(vm.issueData);
				newViewpointData.viewpoint = viewpoint;
				IssuesService.showIssue(newViewpointData);

			}
		};

		/**
		 * Show screen shot
		 * @param event
		 * @param viewpoint
		 */
		vm.showScreenShot = function (event, viewpoint) {
			vm.screenShot = APIService.getAPIUrl(viewpoint.screenshot);
			vm.showScreenshotDialog(event);
		};

		/**
		 * Show screen shot dialog 
		 * @param event
		 */
		vm.showScreenshotDialog = function(event) {
			$mdDialog.show({
				controller: function () {
					this.issueComponent = vm; 
				},
				controllerAs: "vm",
				templateUrl: "templates/issue-screen-shot-dialog.html",
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
					ViewerService.pin.pinDropMode = true;
					MeasureService.deactivateMeasure();
					MeasureService.setDisabled(true);
				} else {
					ViewerService.pin.pinDropMode = false;
					MeasureService.setDisabled(false);
				}
				break;

			case "screen_shot":

				// There is no concept of selected in screenshot as there will be a popup once you click the button
				vm.actions[action].selected = false;

				delete vm.screenShot; // Remove any clicked on screen shot
				vm.showScreenshotDialog(event);
				break;

			}

		};


		/**
		 * Toggle showing of extra inputs
		 */
		vm.toggleShowAdditional = function () {
	
			if(!vm.textInputHasFocusFlag) {
				//don't toggle if the user is trying to type
				vm.showAdditional = !vm.showAdditional;
				vm.setContentHeight();
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

				if (vm.issueData.desc !== vm.savedDescription) {
					var data = {
						desc: vm.issueData.desc
					};
					IssuesService.updateIssue(vm.issueData, data)
						.then(function (issueData) {
							if (issueData) {

								IssuesService.updateIssues(vm.issueData);
								vm.savedDescription = vm.issueData.desc;

								// Add info for new comment
								// var comment = issueData.data.issue.comments[issueData.data.issue.comments.length - 1];
								// IssuesService.convertActionCommentToText(comment, vm.topic_types);
								// comment.timeStamp = IssuesService.getPrettyTime(comment.created);
								// vm.issueData.comments.push(comment);

							} else {
								vm.handleUpdateError(issueData);
							}
							
						})
						.catch(vm.handleUpdateError);
				}

			} else {
				vm.editingDescription = true;
				vm.savedDescription = vm.issueData.desc;
			}
		};

		/**
		 * Register if text input has focus or not
		 * @param focus
		 */
		vm.textInputHasFocus = function (focus) {
			vm.textInputHasFocusFlag = focus;
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
				objectsPromise = $q.defer();

			if (vm.commentViewpoint) {
				viewpointPromise.resolve(vm.commentViewpoint);
			} else {
				// Get the viewpoint
				ViewerService.getCurrentViewpoint(
					{promise: viewpointPromise, account: vm.account, model: vm.model}
				);
			}

			//Get selected objects
			ViewerService.getObjectsStatus({
				promise: objectsPromise 
			});

			viewpointPromise.promise
				.then(function (viewpoint) {
					objectsPromise.promise
						.then(function(objectInfo) {
							handleObjects(viewpoint, objectInfo, screenShotPromise);
						})
						.catch(function(error){
							console.error(error);
						});
				})
				.catch(function(error){
					console.error(error);
				});

		};

		function handleObjects (viewpoint, objectInfo, screenShotPromise) {

			//TODO - clean up repeated code below
			if (vm.savedScreenShot !== null) {

				if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
					// Create a group of selected objects
					vm.createGroup(viewpoint, vm.savedScreenShot, objectInfo);
				} else {
					vm.doSaveIssue(viewpoint, vm.savedScreenShot);
				}

			} else {
				// Get a screen shot if not already created
				ViewerService.getScreenshot(screenShotPromise);

				screenShotPromise.promise.then(function (screenShot) {
					if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
						vm.createGroup(viewpoint, screenShot, objectInfo);
					} else {
						vm.doSaveIssue(viewpoint, screenShot);
					}
				}).catch(function(error){
					console.error(error);
				});
				
			}
		}

		/**
		 * @returns groupData	Object with list of nodes for group creation.
		 */
		function createGroupData(nodes) {
			var groupData = {
				name: vm.issueData.name, 
				color: [255, 0, 0], 
				objects: nodes
			};
			return groupData;
		}

		vm.createGroup = function(viewpoint, screenShot, objectInfo) {

			// Create a group of selected objects
			var highlightedGroupData = createGroupData(objectInfo.highlightedNodes);
			
			// Create a group of hidden objects
			var hiddenGroupData = createGroupData(objectInfo.hiddenNodes);

			APIService.post(vm.account + "/" + vm.model + "/groups", highlightedGroupData)
				.then(function (highlightedGroupResponse) {
					viewpoint.highlighted_group_id = highlightedGroupResponse.data._id;
					APIService.post(vm.account + "/" + vm.model + "/groups", hiddenGroupData)
						.then(function (hiddenGroupResponse) {
							viewpoint.hidden_group_id = hiddenGroupResponse.data._id;
							vm.doSaveIssue(viewpoint, screenShot);
						}).catch(function(error){
							console.error(error);
						})
				}).catch(function(error){
					console.error(error);
				});
		
		};


		/**
		 * Send new issue data to server
		 * @param viewpoint
		 * @param screenShot
		 */
		vm.doSaveIssue = function(viewpoint, screenShot) {

			// Remove base64 header text from screenShot and add to viewpoint
			screenShot = screenShot.substring(screenShot.indexOf(",") + 1);
			viewpoint.screenshot = screenShot;

			// Save issue
			var issue = {
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
			var pinData = ViewerService.getPinData();
			if (pinData !== null) {
				issue.pickedPos = pinData.pickedPos;
				issue.pickedNorm = pinData.pickedNorm;
			}

			IssuesService.saveIssue(issue)
				.then(function (response) {
					vm.data = response.data; // So that new changes are registered as updates
					var responseIssue = response.data;

					// Hide the description input if no description
					vm.pinHidden = true;

					// Notify parent of new issue
					IssuesService.populateIssue(responseIssue);
					vm.issueData = responseIssue;
					IssuesService.addIssue(vm.issueData);
					IssuesService.setSelectedIssue(vm.issueData, true);

					// Hide some actions
					ViewerService.pin.pinDropMode = false;

					vm.submitDisabled = true;
					vm.setContentHeight();

					vm.startNotification();
					vm.saving = false;

					var issueState = {
						account: vm.account, 
						model: vm.model, 
						revision: vm.revision,
						issue: vm.data._id,
						noSet: true
					};
					
					vm.disabledReason = vm.reasonCommentText;
					
					$state.go(
						"home.account.model.issue",
						issueState , 
						{notify: false}
					);
				})
				.catch(function(error){
					var content = "Something went wrong saving the issue. " +
					"If this continues please message support@3drepo.io.";
					var escapable = true;
					DialogService.text("Error Saving Issue", content, escapable);
					console.error("Something went wrong saving the Issue: ", error);
				});

			AnalyticService.sendEvent({
				eventCategory: "Issue",
				eventAction: "create"
			});
		};

		vm.saveComment = function() {
			var viewpointPromise = $q.defer();
			var objectsPromise = $q.defer();

			//Get selected objects
			ViewerService.getObjectsStatus({
				promise: objectsPromise 
			});

			objectsPromise.promise.then(function(objectInfo) {
				
				// Create a group of selected objects
				var highlightedGroupData = createGroupData(objectInfo.highlightedNodes);
				
				// Create a group of hidden objects
				var hiddenGroupData = createGroupData(objectInfo.hiddenNodes);
				
				APIService.post(vm.account + "/" + vm.model + "/groups", highlightedGroupData).then(function (highlightedGroupResponse) {
					APIService.post(vm.account + "/" + vm.model + "/groups", hiddenGroupData).then(function (hiddenGroupResponse) {
						if (angular.isDefined(vm.commentThumbnail)) {
							vm.commentViewpoint.highlighted_group_id = highlightedGroupResponse.data._id;
							vm.commentViewpoint.hidden_group_id = hiddenGroupResponse.data._id;
							IssuesService.saveComment(vm.issueData, vm.comment, vm.commentViewpoint)
								.then(function (response) {
									vm.saving = false;
									vm.canEditDescription = vm.checkCanEditDesc();
									vm.afterNewComment(response.data.issue);
								})
								.catch(function(error){
									vm.errorSavingComment(error);
								});
				
						} else {

							ViewerService.getCurrentViewpoint(
								{promise: viewpointPromise, account: vm.issueData.account, model: vm.issueData.model}
							);
				
							viewpointPromise.promise.then(function (viewpoint) {
								viewpoint.highlighted_group_id = highlightedGroupResponse.data._id;
								viewpoint.hidden_group_id = hiddenGroupResponse.data._id;
								IssuesService.saveComment(vm.issueData, vm.comment, viewpoint)
									.then(function (response) {
										vm.saving = false;
										vm.afterNewComment(response.data.issue);
									})
									.catch(function(error){
										vm.errorSavingComment(error);
									});
							})
							.catch(function(error) {
								console.error(error);
							});
						}
					})
					.catch(function(error) {
						console(error);
					});
				})
				.catch(function(error) {
					console.error(error);
				});

				AnalyticService.sendEvent({
					eventCategory: "Issue",
					eventAction: "comment"
				});
			});
		};

		vm.errorSavingComment = function(error) {
			var content = "Something went wrong saving the comment. " +
			"If this continues please message support@3drepo.io.";
			var escapable = true;
			DialogService.text("Error Saving Comment", content, escapable);
			console.error("Something went wrong saving the issue comment: ", error);
		};

		vm.errorDeleteComment = function(error) {
			var content = "Something went wrong deleting the comment. " +
			"If this continues please message support@3drepo.io.";
			var escapable = true;
			DialogService.text("Error Deleting Comment", content, escapable);
			console.error("Something went wrong deleting the issue comment: ", error);
		};

		vm.errorSavingScreemshot = function(error) {
			var content = "Something went wrong saving the screenshot. " +
			"If this continues please message support@3drepo.io.";
			var escapable = true;
			DialogService.text("Error Saving Screenshot", content, escapable);
			console.error("Something went wrong saving the screenshot: ", error);
		};


		/**
		 * Process after new comment saved
		 * @param comment
		 */
		vm.afterNewComment = function(comment, noDeleteInput) {

			// mark all other comments sealed
			vm.issueData.comments.forEach(function(otherComment){
				otherComment.sealed = true;
			});

			if(comment.owner !== AuthService.getUsername()){
				comment.sealed = true;
			}

			if(comment.viewpoint && comment.viewpoint.screenshot){
				comment.viewpoint.screenshotPath = APIService.getAPIUrl(comment.viewpoint.screenshot);
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

			if(!noDeleteInput){
				delete vm.comment;
				delete vm.commentThumbnail;
				IssuesService.updateIssues(vm.issueData);
				vm.submitDisabled = true;
			}


			vm.commentAreaScrollToBottom();
			// Don't set height of content if about to be destroyed as it overrides the height set by the issues list
			if (!vm.aboutToBeDestroyed) {
				vm.setContentHeight();
			}
		};

		/**
		 * Delete a comment
		 * @param event
		 * @param index
		 */
		vm.deleteComment = function(event, index) {
			event.stopPropagation();
			IssuesService.deleteComment(vm.issueData, index)
				.then(function() {
					vm.issueData.comments.splice(index, 1);
				})
				.catch(function(error){
					vm.errorDeleteComment(error);
				});
			AnalyticService.sendEvent({
				eventCategory: "Issue",
				eventAction: "deleteComment"
			});
			vm.setContentHeight();
		};

		

		/**
		 * Toggle the editing of a comment
		 * @param event
		 * @param index
		 */
		// vm.toggleEditComment = function(event, index) {
		// 	event.stopPropagation();
		// 	if (vm.issueData.comments[index].editing) {
		// 		vm.editingCommentIndex = null;
		// 		vm.issueData.comments[index].editing = false;
		// 		if (vm.issueData.comments[index].comment !== vm.savedComment) {
		// 			IssuesService.editComment(vm.issueData, vm.issueData.comments[index].comment, index)
		// 				.then(function(response) {
		// 					vm.issueData.comments[index].timeStamp = IssuesService.getPrettyTime(response.data.created);
		// 					IssuesService.updatedIssue = vm.issueData;
		// 					vm.savedComment = vm.issueData.comments[index].comment;
		// 				});
		// 			AnalyticService.sendEvent({
		// 				eventCategory: "Issue",
		// 				eventAction: "editComment"
		// 			});
		// 		}
		// 	} else {
		// 		vm.editingCommentIndex = index;
		// 		vm.issueData.comments[index].editing = true;
		// 		vm.savedComment = vm.issueData.comments[index].comment;
		// 	}
		// };

		/**
		 * A screen shot has been saved
		 * @param data
		 */
		vm.screenShotSave = function (data) {
			var viewpointPromise = $q.defer();

			vm.savedScreenShot = data.screenShot;

			if (typeof vm.data === "object") {

				// Comment
				vm.commentThumbnail = data.screenShot;

				// Get the viewpoint and add the screen shot to it
				// Remove base64 header text from screen shot
				ViewerService.getCurrentViewpoint(
					{promise: viewpointPromise, account: vm.issueData.account, model: vm.issueData.model}
				);

			} else {
				// Description
				vm.issueData.descriptionThumbnail = data.screenShot;
				
				ViewerService.getCurrentViewpoint(
					{promise: viewpointPromise, account: vm.account, model: vm.model}
				);
			}

			viewpointPromise.promise.then(function (viewpoint) {
				vm.commentViewpoint = viewpoint;
				vm.commentViewpoint.screenshot = data.screenShot.substring(data.screenShot.indexOf(",") + 1);
			}).catch(function(error){
				vm.errorSavingScreemshot(error);
			});

			vm.setContentHeight();
		};


		/**
		 * Set the content height
		 */
		vm.setContentHeight = function() {
			var i, length,
				newIssueHeight = 305,
				descriptionTextHeight = 80,
				commentTextHeight = 80,
				commentImageHeight = 170,
				additionalInfoHeight = 160,
				thumbnailHeight = 180,
				issueMinHeight = 370,
				height = issueMinHeight;
			
			if (vm.data) {
				
				// Additional info
				if (vm.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description text
				if (vm.canEditDescription || (vm.issueData && vm.issueData.hasOwnProperty("desc")) ) {
					height += descriptionTextHeight;
				}
				// Description thumbnail
				height += thumbnailHeight;
				// New comment thumbnail
				if (vm.commentThumbnail) {
					height += thumbnailHeight;
				}
				// Comments
				if (vm.issueData && vm.issueData.comments) {
					for (i = 0, length = vm.issueData.comments.length; i < length; i += 1) {
						height += commentTextHeight;
						if (vm.issueData.comments[i].viewpoint && vm.issueData.comments[i].viewpoint.hasOwnProperty("screenshot")) {
							height += commentImageHeight;
						}
					}
				}

				
			} else {
				height = newIssueHeight;
				if (vm.showAdditional) {
					height += additionalInfoHeight;
				}
				// Description thumbnail
				if (vm.issueData && vm.issueData.descriptionThumbnail) {
					height += thumbnailHeight;
				}
			}

			if (height) {
				vm.contentHeight({height: height});
			} else {
				console.error("Height was trying to be set to falsy value");
			}
			

		};

		vm.commentAreaScrollToBottom = function (){

			$timeout(function(){
				var commentArea = document.getElementById("descriptionAndComments");
				if (commentArea) {
					commentArea.scrollTop = commentArea.scrollHeight;
				}
			});
		};

		vm.handleIssueChange = function(issue) {

			IssuesService.populateIssue(issue);
			vm.issueData = issue;
			
			$scope.$apply();

		};

		vm.startNotification = function() {

			if(vm.data && !vm.notificationStarted){

				vm.notificationStarted = true;

				/*
				* Watch for issue change
				*/

				NotificationService.subscribe.issueChanged(
					vm.data.account, 
					vm.data.model, 
					vm.data._id, 
					vm.handleIssueChange
				);

				/*
				* Watch for new comments
				*/
				NotificationService.subscribe.newComment(vm.data.account, vm.data.model, vm.data._id, function(comment){

					if(comment.action){
						IssuesService.convertActionCommentToText(comment, vm.topic_types);
					}

					vm.afterNewComment(comment, true);

					//necessary to apply scope.apply and reapply scroll down again here because vm function is not triggered from UI
					$scope.$apply();
					vm.commentAreaScrollToBottom();
				});

				/*
				* Watch for comment changed
				*/
				NotificationService.subscribe.commentChanged(vm.data.account, vm.data.model, vm.data._id, function(newComment){

					var comment = vm.issueData.comments.find(function(oldComment){
						return oldComment.guid === newComment.guid;
					});

					comment.comment = newComment.comment;

					$scope.$apply();
					vm.commentAreaScrollToBottom();
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

					vm.issueData.comments[deleteIndex].comment = "This comment has been deleted.";


					$scope.$apply();
					vm.commentAreaScrollToBottom();

					$timeout(function(){
						vm.issueData.comments.splice(deleteIndex, 1);
					}, 4000);
				});


			}
		};

	}
}());
