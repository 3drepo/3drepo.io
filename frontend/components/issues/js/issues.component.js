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
		.component("issues", {
			restrict: "E",
			templateUrl: "templates/issues.html",
			controller: IssuesCtrl,
			controllerAs: "vm",
			bindings: {
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
			}
		});

	IssuesCtrl.$inject = [
		"$scope", "$timeout", "IssuesService", "EventService", "AuthService", 
		"APIService", "NotificationService", "RevisionsService", "ClientConfigService", 
		"AnalyticService", "$state", "$q", "DialogService", "ViewerService"
	];

	function IssuesCtrl(
		$scope, $timeout, IssuesService, EventService, AuthService, 
		APIService, NotificationService, RevisionsService, ClientConfigService, 
		AnalyticService, $state, $q, DialogService, ViewerService
	) {

		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {

			vm.saveIssueDisabled = true;
			vm.allIssues = [];
			vm.issuesToShow = [];
			vm.showProgress = true;
			vm.progressInfo = "Loading issues";
			vm.availableJobs = null;
			vm.modelUserJob;
			vm.selectedIssue = null;
			vm.autoSaveComment = false;
			vm.onContentHeightRequest({height: 70}); // To show the loading progress
			vm.savingIssue = false;
			vm.revisionsStatus = RevisionsService.status;
			

			/*
			* Get the user roles for the model
			*/
			IssuesService.getUserJobForModel(vm.account, vm.model)
				.then(function (data) {
					vm.modelUserJob = data;
				})
				.catch(function(error){
					var content = "We tried to get the user job for this model but it failed. " +
					"If this continues please message support@3drepo.io.";
					var escapable = true;
					DialogService.text("Error Getting User Job", content, escapable);
					console.error(error);
				});

			/*
			* Get all the Issues
			*/

			vm.getIssues = IssuesService.getIssues(vm.account, vm.model, vm.revision)
				.then(function (data) {

					if (data) {

						vm.showProgress = false;
						vm.toShow = "showIssues";
						IssuesService.populateNewIssues(data);
						vm.showAddButton = true;
						
					} else {
						throw "Error";
					}
					

				})
				.catch(function(error){
					var content = "We tried to get the issues for this model but it failed. " +
					"If this continues please message support@3drepo.io.";
					var escapable = true;
					DialogService.text("Error Getting Issues", content, escapable);
					console.error(error);
				});

					
			/*
			* Get all the available roles for the model
			*/
			vm.getJobs = IssuesService.getJobs(vm.account, vm.model)
				.then(function (data) {

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
						type: "issues",
						menu: menu
					});

				})
				.catch(function(error){
					var content = "We tried to get the jobs for this model but it failed. " +
					"If this continues please message support@3drepo.io.";
					var escapable = true;
					DialogService.text("Error Getting Jobs", content, escapable);
					console.error(error);
				});

			vm.issuesReady = $q.all([vm.getIssues, vm.getJobs])
				.catch(function(error){
					var content = "We had an issue getting all the issues and jobs for this model. " +
						"If this continues please message support@3drepo.io.";
					var escapable = true;
					DialogService.text("Error Getting Model Issues and Jobs", content, escapable);
					console.error(error);
				});

		};

		vm.modelLoaded = function() {
			return !!ViewerService.currentModel.model;
		};

		/*
		 * New issue must have type and non-empty title
		 */
		$scope.$watch("vm.title", function () {
			vm.saveIssueDisabled = (angular.isUndefined(vm.title) || (vm.title.toString() === ""));
		});

		$scope.$watch("vm.modelSettings", function() {
			if (vm.modelSettings) {

				vm.issuesReady.then(function(){
					var hasPerm = AuthService.hasPermission(
						ClientConfigService.permissions.PERM_CREATE_ISSUE, 
						vm.modelSettings.permissions
					);
	
					if(hasPerm) {
						vm.canAddIssue = true;
					} 
				});
								
				vm.subModels = vm.modelSettings.subModels || [];
				vm.watchNotification();
				
			}
		});


		$scope.$watch(function() {
			return RevisionsService.status;
		}, function() {
			if (RevisionsService.status.data) {
				vm.revisions = RevisionsService.status.data;
			}
		}, true);

		$scope.$watch(function(){
			return IssuesService.state.allIssues;
		}, function(){
			vm.allIssues = IssuesService.state.allIssues;
		}, true);

		$scope.$watch(function(){
			return IssuesService.state.issuesToShow;
		}, function(){
			vm.issuesToShow = IssuesService.state.issuesToShow;
		}, true);

		$scope.$watch(function(){
			return IssuesService.state.selectedIssue;
		}, function(){
			vm.selectedIssue = IssuesService.state.selectedIssue;
		}, true);


		/**
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			var i, length;

			//vm.event = event;

			if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
				for (i = 0, length = vm.allIssues.length; i < length; i += 1) {
					if (vm.allIssues[i]._id === event.value.id) {
						vm.editIssue(vm.allIssues[i]);
						break;
					}
				}
			} 

		});

		/**
		 * Close the add alert
		 */
		vm.closeAddAlert = function () {
			vm.showAddAlert = false;
			vm.addAlertText = "";
		};

		/**
		 * Set the content height
		 */
		vm.setContentHeight = function (height) {
			vm.onContentHeightRequest({height: height});
		};

		

		/*
		 * Go back to issues list
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.toShow = "showIssues";
				vm.showAddButton = true;
				IssuesService.state.displayIssue = null;
				$state.go("home.account.model", 
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

		vm.watchNotification = function() {

			/*
			 * Watch for new issues
			 */
			NotificationService.subscribe.newIssues(vm.account, vm.model, vm.newIssueListener);

			/*
			 * Watch for status changes for all issues
			 */ 	
			NotificationService.subscribe.issueChanged(vm.account, vm.model, vm.handleIssueChanged);

			// Do the same for all subModels
			if(vm.subModels){
				vm.subModels.forEach(function(subModel){
					var submodel = true;
					NotificationService.subscribe.newIssues(
						subModel.database, 
						subModel.model, 
						function(issues){ 
							vm.newIssueListener(issues, submodel); 
						}
					);
					NotificationService.subscribe.issueChanged(
						subModel.database,
						subModel.model, 
						vm.handleIssueChanged
					);
				});
			}

		};

		vm.newIssueListener = function(issues, submodel) {

			issues.forEach(function(issue) {
				
				var issueShouldShow = false;

				if (vm.revisions && vm.revisions.length) {

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

					var issueInDate = new Date(issueRevision.timestamp) <= new Date(currentRevision.timestamp);
					issueShouldShow = issueRevision && issueInDate;
				} else {
					issueShouldShow = true;
				}

				if(issueShouldShow){
					
					IssuesService.addIssue(issue);
					
				}

			});

		};

		vm.handleIssueChanged = function(issue) {
			IssuesService.updateIssues(issue);
		};

		/*
		* Unsubscribe notifcation on destroy
		*/
		$scope.$on("$destroy", function(){
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
		* import bcf
		* @param file
		*/
		vm.importBcf = function(file){

			$scope.$apply();

			vm.importingBCF = true;

			IssuesService.importBcf(vm.account, vm.model, vm.revision, file)
				.then(function(){
					return IssuesService.getIssues(vm.account, vm.model, vm.revision);
				})
				.then(function(data){

					vm.importingBCF = false;
					vm.allIssues = (data === "") ? [] : data;

				})
				.catch(function(error){

					vm.importingBCF = false;
					var content = "We tried to get import BCF but it failed. " +
						"If this continues please message support@3drepo.io.";
					var escapable = true;
					DialogService.text("Error Getting User Job", content, escapable);
					console.error(error);
				
				});

		};

		/**
		 * Set up editing issue
		 * @param issue
		 */
		vm.editIssue = function (issue) {
			
			

			var notCurrentlySelected = IssuesService.state.selectedIssue && 
										issue && 
										IssuesService.state.selectedIssue._id !== issue._id;

			if (notCurrentlySelected) {
				IssuesService.deselectPin(IssuesService.state.selectedIssue);
				// Remove highlight from any multi objects
				ViewerService.highlightObjects([]);
			}

			if (!issue && IssuesService.state.selectedIssue) {
				IssuesService.deselectPin(IssuesService.state.selectedIssue);
			}

			if (issue) {

				IssuesService.showIssue(issue);
				IssuesService.getIssue(issue.account, issue.model, issue._id)
					.then(function(retrievedIssue){
						IssuesService.setSelectedIssue(retrievedIssue);
					})
					.catch(function(error) {
						var content = "We tried to get the selected issue but it failed. " +
							"If this continues please message support@3drepo.io.";
						var escapable = true;
						DialogService.text("Error Getting Issue", content, escapable);
						console.error(error);
					});

				$state.go("home.account.model.issue", 
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
					eventCategory: "Issue",
					eventAction: "view"
				});

			} else {
				IssuesService.resetSelectedIssue();
			}

			vm.toShow = "showIssue";
			vm.showAddButton = false;
			vm.onShowItem();

		};

		/**
		 * Exit issue editing
		 * @param issue
		 */
		vm.editIssueExit = function () {
			vm.hideItem = true;
		};

		/**
		 * New issue created so inform issues list
		 * @param issue
		 */
		vm.issueCreated = function (issue) {

			IssuesService.addIssue(issue);
			IssuesService.setSelectedIssue(issue);

		};

	}
}());
