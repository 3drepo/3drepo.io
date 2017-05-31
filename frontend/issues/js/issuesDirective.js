/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
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
		.directive("issues", issues);

	function issues() {
		return {
			restrict: "EA",
			templateUrl: "issues.html",
			scope: {
				account: "=",
				model: "=",
				branch:  "=",
				revision: "=",
				filterText: "=",
				modelSettings: "=",
				show: "=",
				showAdd: "=",
				selectedMenuOption: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "=",
				keysDown: "=",
				treeMap: "=",
				selectedObjects: "=",
				setInitialSelectedObjects: "&"
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$timeout", "IssuesService", "EventService", "Auth", "UtilsService", "NotificationService", "RevisionsService", "serverConfig", "AnalyticService", "$state", "$q"];

	function IssuesCtrl($scope, $timeout, IssuesService, EventService, Auth, UtilsService, NotificationService, RevisionsService, serverConfig, AnalyticService, $state, $q) {
		var vm = this,
			issue,
			pinHighlightColour = [1.0000, 0.7, 0.0];


		/*
		 * Init
		 */
		vm.saveIssueDisabled = true;
		vm.issues = [];
		vm.issuesToShow = [];
		vm.showProgress = true;
		vm.progressInfo = "Loading issues";
		vm.availableJobs = null;
		vm.modelUserJob;
		vm.selectedIssue = null;
		vm.autoSaveComment = false;
		vm.onContentHeightRequest({height: 70}); // To show the loading progress
		vm.savingIssue = false;
		vm.issueDisplay = {};
		
		/*
		 * Get all the Issues
		 */
		var getIssue = IssuesService.getIssues(vm.account, vm.model, vm.revision)
		.then(function (data) {
			vm.showProgress = false;
			vm.toShow = "showIssues";
			vm.issues = (data === "") ? [] : data;
			vm.showAddButton = true;


			// if issue id is in url then select the issue
			var issue = vm.issues.find(function(issue){
				return issue._id === vm.issueId;
			});

			if(issue){
				vm.displayIssue = issue;
			}
		});

		/*
		 * Get all the available roles for the model
		 */
		var getJob = IssuesService.getJobs(vm.account, vm.model).then(function (data) {

			vm.availableJobs = data;

			var menu = [];
			data.forEach(function(role){
				menu.push({
					value: "filterRole",
					role: role._id,
					label: role._id,
					keepCheckSpace: true,
					toggle: true,
					selected: true,
					firstSelected: false,
					secondSelected: false
				});
			});

			EventService.send(EventService.EVENT.PANEL_CONTENT_ADD_MENU_ITEMS, {
				type: 'issues',
				menu: menu
			});
		});

		$q.all([getIssue, getJob]).then(function(){
			setAllIssuesAssignedRolesColors();
		});

		/**
		 * Define the assigned role colors for each issue
		 */
		function setAllIssuesAssignedRolesColors () {
			var i, length;

			if (vm.availableJobs !== null) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					setIssueAssignedRolesColors(vm.issues[i]);
				}
			}
		}

		/**
		 * Define the assigned role colors for an issue
		 * Also set the pin colors
		 *
		 * @param issue
		 */
		function setIssueAssignedRolesColors (issue) {
			var i, length, roleColour, pinColours = [];

			issue.assignedRolesColors = [];

			for (i = 0, length = issue.assigned_roles.length; i < length; i += 1) {

				roleColour = IssuesService.getJobColor(issue.assigned_roles[i]);
	
				issue.assignedRolesColors.push(roleColour);
				pinColours.push(IssuesService.hexToRgb(roleColour));
			}
		}

		/*
		 * Get the user roles for the model
		 */
		IssuesService.getUserJobFormodel(vm.account, vm.model).then(function (data) {
			vm.modelUserJob = data;
		});

		/*
		 * New issue must have type and non-empty title
		 */
		$scope.$watch("vm.title", function () {
			vm.saveIssueDisabled = (angular.isUndefined(vm.title) || (vm.title.toString() === ""));
		});

		/**
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			var i, length;

			vm.event = event;

			if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					if (vm.issues[i]._id === event.value.id) {
						vm.editIssue(vm.issues[i]);
						break;
					}
				}
			} else if (event.type === EventService.EVENT.REVISIONS_LIST_READY){
				vm.revisions = event.value;
				watchNotification();
			} else if (event.type === EventService.EVENT.MODEL_SETTINGS_READY){

				if(Auth.hasPermission(serverConfig.permissions.PERM_CREATE_ISSUE, event.value.permissions)){
					vm.canAddIssue = true;
				}
				vm.subModels = event.value.subModels || [];
				watchNotification();
			} else if (event.type === EventService.EVENT.SELECT_ISSUE){
				vm.issueId = event.value;
			}
		});


		/**
		 * The roles assigned to the issue have been changed
		 */
		vm.issueAssignChange = function () {
			setIssueAssignedRolesColors(vm.selectedIssue);
			vm.showPins();
		};

		/**
		 * Show an issue alert
		 *
		 * @param {String} title
		 */
		vm.showAlert = function(title) {
			vm.showAddAlert = true;
			vm.addAlertText = title;
		};

		/**
		 * Close the add alert
		 */
		vm.closeAddAlert = function () {
			vm.showAddAlert = false;
			vm.addAlertText = "";
		};

		/**
		 * A comment has been saved
		 */
		vm.commentSaved = function () {
			vm.setContentHeight();
		};

		/**
		 * A comment has been auto saved
		 */
		vm.commentAutoSaved = function (index) {
			vm.selectedIndex = index;
			vm.infoText = "Comment on issue #" + vm.issuesToShow[vm.selectedIndex].title + " auto-saved";
			vm.issuesToShow[vm.selectedIndex].showInfo = true;
			vm.infoTimeout = $timeout(function() {
				vm.issuesToShow[vm.selectedIndex].showInfo = false;
			}, 4000);
		};

		/**
		 * Hide issue info
		 */
		vm.hideInfo = function() {
			vm.issuesToShow[vm.selectedIndex].showInfo = false;
			$timeout.cancel(vm.infoTimeout);
		};
		/**
		 * Set the content height
		 */
		vm.setContentHeight = function (height) {
			vm.onContentHeightRequest({height: height});
		};

		function setPinToAssignedRoleColours (issue) {
			var i, length, pinColours = [], roleColour;

			if (issue !== null) {
				for (i = 0, length = issue.assigned_roles.length; i < length; i += 1) {
					roleColour = IssuesService.getJobColor(issue.assigned_roles[i]);
					pinColours.push(IssuesService.hexToRgb(roleColour));
				}

				EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
					id: issue._id,
					colours: pinColours
				});
			}
		}

		/* New Stuff **************************************************************************************************/

		/*
		 * Go back to issues list
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			console.log('hideItem changed', newValue);
			if (angular.isDefined(newValue) && newValue) {
				vm.toShow = "showIssues";
				vm.showAddButton = true;
				vm.displayIssue = null;
				$state.go('home.account.model', 
					{
						account: vm.account, 
						model: vm.model, 
						revision: vm.revision,
						noSet: true
					}, 
					{notify: false}
				);
			}
		});


		function watchNotification(){


			 if(!vm.revisions || !vm.subModels){
			 	return;
			 }

			function newIssueListener(issues, submodel){

				issues.forEach(function(issue){

					var showIssue;

					if(submodel){
						
						showIssue = true;

					} else {

						var issueRevision = vm.revisions.find(function(rev){
							return rev._id === issue.rev_id;
						});

						var currentRevision;

						if(!vm.revision){
							currentRevision = vm.revisions[0];
						} else {
							currentRevision = vm.revisions.find(function(rev){
								return rev._id === vm.revision || rev.tag === vm.revision;
							});
						}

						showIssue = issueRevision && new Date(issueRevision.timestamp) <= new Date(currentRevision.timestamp);
					}


					if(showIssue){
						
						issue.title = IssuesService.generateTitle(issue);
						issue.timeStamp = IssuesService.getPrettyTime(issue.created);
						issue.thumbnailPath = UtilsService.getServerUrl(issue.thumbnail);

						vm.issues.unshift(issue);
						
					}

				});

				vm.issues = vm.issues.slice(0);
				$scope.$apply();

			}

			function issueChangedListener(issue){


				issue.title = IssuesService.generateTitle(issue);
				issue.timeStamp = IssuesService.getPrettyTime(issue.created);
				issue.thumbnailPath = UtilsService.getServerUrl(issue.thumbnail);

				vm.issues.find(function(oldIssue, i){
					if(oldIssue._id === issue._id){


						if(issue.status === 'closed'){
							
							vm.issues[i].justClosed = true;
							
							$timeout(function(){

								vm.issues[i] = issue;
								vm.issues = vm.issues.slice(0);

							}, 4000);

						} else {
							vm.issues[i] = issue;
						}
					}
				});

				vm.issues = vm.issues.slice(0);
				$scope.$apply();
			}


			/*
			 * Watch for new issues
			 */
			NotificationService.subscribe.newIssues(vm.account, vm.model, newIssueListener);

			/*
			 * Watch for status changes for all issues
			 */
			NotificationService.subscribe.issueChanged(vm.account, vm.model, issueChangedListener);

			//do the same for all subModels
			if(vm.subModels){
				vm.subModels.forEach(function(submodel){
					var submodel = true;
					NotificationService.subscribe.newIssues(subModel.database, subModel.model, function(issues){ newIssueListener(issues, submodel) });
					NotificationService.subscribe.issueChanged(subModel.database, subModel.model, issueChangedListener);
				});
			}
		}


		/*
		* Unsubscribe notifcation on destroy
		*/
		$scope.$on('$destroy', function(){
			NotificationService.unsubscribe.newIssues(vm.account, vm.model);
			NotificationService.unsubscribe.issueChanged(vm.account, vm.model);

			if(vm.subModels){
				vm.subModels.forEach(function(subModel){
					NotificationService.unsubscribe.newIssues(subModel.database, subModel.model);
					NotificationService.unsubscribe.issueChanged(subModel.database, subModel.model);
				});
			}

		});

		/**
		 * Send event
		 * @param type
		 * @param value
		 */
		vm.sendEvent = function (type, value) {
			EventService.send(type, value);
		};

		/**
		* import bcf
		* @param file
		*/
		vm.importBcf = function(file){

			$scope.$apply();

			vm.importingBCF = true;

			IssuesService.importBcf(vm.account, vm.model, vm.revision, file).then(function(){

				return IssuesService.getIssues(vm.account, vm.model, vm.revision);

			}).then(function(data){

				vm.importingBCF = false;
				vm.issues = (data === "") ? [] : data;

			}).catch(function(err){

				vm.importingBCF = false;
				console.log('Error while importing bcf', err);
				
			});


		}

		/**
		 * Set up editing issue
		 * @param issue
		 */
		vm.editIssue = function (issue) {
			
			
			vm.event = null; // To clear any events so they aren't registered
			vm.onShowItem();
			if (vm.selectedIssue && (!issue || (issue && vm.selectedIssue._id != issue._id))) {
				deselectPin(vm.selectedIssue._id);
			}

			if(issue){
				IssuesService.getIssue(issue.account, issue.model, issue._id).then(function(issue){
					vm.selectedIssue = issue;
				});

				$state.go('home.account.model.issue', 
					{
						account: vm.account, 
						model: vm.model, 
						revision: vm.revision,
						issue: issue._id,
						noSet: true
					}, 
					{notify: false}
				);

				AnalyticService.sendEvent({
					eventCategory: 'Issue',
					eventAction: 'view'
				});
			} else {
				vm.selectedIssue = issue;
			}

			vm.toShow = "showIssue";
			vm.showAddButton = false;


		};

		/**
		 * Select issue
		 * @param issue
		 */
		vm.selectIssue = function (issue) {
			if (vm.selectedIssue && (vm.selectedIssue._id !== issue._id)) {
				deselectPin(vm.selectedIssue._id);
			}
			vm.selectedIssue = issue;
		};

		/**
		 * Exit issue editing
		 * @param issue
		 */
		vm.editIssueExit = function (issue) {
			vm.hideItem = true;
		};

		/**
		 * New issue created so inform issues list
		 * @param issue
		 */
		vm.issueCreated = function (issue) {
			vm.issues.unshift(issue);
			vm.selectedIssue = issue;
		};

		/**
		 * Show issue details
		 * @param issue
		 */
		function showIssue (issue) {
			var data;

			// Highlight pin, move camera and setup clipping plane
			EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
				id: issue._id,
				colours: pinHighlightColour
			});

			EventService.send(EventService.EVENT.VIEWER.SET_CAMERA, {
				position : issue.viewpoint.position,
				view_dir : issue.viewpoint.view_dir,
				up: issue.viewpoint.up,
				account: issue.account,
				model: issue.model
			});

			EventService.send(EventService.EVENT.VIEWER.SET_CLIPPING_PLANES, {
				clippingPlanes: issue.viewpoint.clippingPlanes,
				account: issue.account,
				model: issue.model
			});

			// Remove highlight from any multi objects
			EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, []);

			// Show multi objects
			if (issue.hasOwnProperty("group_id")) {
				UtilsService.doGet(issue.account + "/" + issue.model + "/groups/" + issue.group_id).then(function (response) {

					var ids = [];
					response.data.objects.forEach(function(obj){

						ids.push(vm.treeMap.sharedIdToUid[obj.shared_id]);
					});

					data = {
						source: "tree",
						account: vm.account,
						model: vm.model,
						ids: ids,
						colour: response.data.colour
					};
					EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, data);
				});
			}
		}

		/**
		 * Set the pin to look deselected
		 * @param issueId
		 */
		function deselectPin (issueId) {
			EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
				id: issueId,
				colours: [[0.5, 0, 0]]
			});
		}
	}
}());
