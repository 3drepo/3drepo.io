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
				project: "=",
				branch:  "=",
				revision: "=",
				filterText: "=",
				show: "=",
				showAdd: "=",
				selectedMenuOption: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "=",
				keysDown: "=",
				selectedObjects: "=",
				setInitialSelectedObjects: "&"
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$timeout", "IssuesService", "EventService", "Auth", "UtilsService"];

	function IssuesCtrl($scope, $timeout, IssuesService, EventService, Auth, UtilsService) {
		var vm = this,
			promise,
			rolesPromise,
			projectUserRolesPromise,
			issue,
			selectedObjectId = null,
			pickedPos = null,
			pickedNorm = null,
			pinHighlightColour = [1.0000, 0.7, 0.0],
			selectedIssue = null;

		/*
		 * Init
		 */
		vm.saveIssueDisabled = true;
		vm.issues = [];
		vm.issuesToShow = [];
		vm.showProgress = true;
		vm.progressInfo = "Loading issues";
		vm.availableRoles = null;
		vm.projectUserRoles = [];
		vm.selectedIssue = null;
		vm.autoSaveComment = false;
		vm.onContentHeightRequest({height: 70}); // To show the loading progress
		vm.savingIssue = false;
		vm.toShow = "showIssues";

		/*
		 * Get all the Issues
		 */
		promise = IssuesService.getIssues(vm.account, vm.project, vm.revision);
		promise.then(function (data) {
			vm.showProgress = false;
			vm.issues = (data === "") ? [] : data;
		});

		/*
		 * Get all the available roles for the project
		 */
		rolesPromise = IssuesService.getRoles(vm.account, vm.project);
		rolesPromise.then(function (data) {
			vm.availableRoles = data;
			setAllIssuesAssignedRolesColors();
		});

		/**
		 * Define the assigned role colors for each issue
		 */
		function setAllIssuesAssignedRolesColors () {
			var i, length;
			if (vm.availableRoles !== null) {
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
				roleColour = IssuesService.getRoleColor(issue.assigned_roles[i]);
				issue.assignedRolesColors.push(roleColour);
				pinColours.push(IssuesService.hexToRgb(roleColour));
			}
		}

		/*
		 * Get the user roles for the project
		 */
		projectUserRolesPromise = IssuesService.getUserRolesForProject(vm.account, vm.project, Auth.username);
		projectUserRolesPromise.then(function (data) {
			vm.projectUserRoles = data;
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
			vm.event = event;
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
					roleColour = IssuesService.getRoleColor(issue.assigned_roles[i]);
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
			if (angular.isDefined(newValue) && newValue) {
				vm.toShow = "showIssues";
				vm.setContentHeight();
			}
		});

		/*
		 * Show the add button if displaying info or list
		 */
		$scope.$watch("vm.toShow", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showAddButton = ((newValue.toString() === "showIssues") || (newValue.toString() === "showInfo"));
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

			IssuesService.importBcf(vm.account, vm.project, vm.revision, file).then(function(){

				return IssuesService.getIssues(vm.account, vm.project, vm.revision);

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
			vm.issueToEdit = issue;
			vm.event = null; // To clear any events so they aren't registered
			vm.toShow = "showIssue";
			vm.setContentHeight();
			vm.onShowItem();
			if (angular.isUndefined(issue) && (selectedIssue !== null)) {
				deselectPin(selectedIssue._id);
			}
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
		};

		/**
		 * Remove the temporary pin used for adding an issue
		 */
		function removeAddPin () {
			IssuesService.removePin(IssuesService.newPinId);
			selectedObjectId = null;
			EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, []);
			pickedPos = null;
			pickedNorm = null;
		}

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
				up: issue.viewpoint.up
			});

			EventService.send(EventService.EVENT.VIEWER.SET_CLIPPING_PLANES, {
				clippingPlanes: issue.viewpoint.clippingPlanes
			});

			// Remove highlight from any multi objects
			EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, []);

			// Show multi objects
			if (issue.hasOwnProperty("group_id")) {
				UtilsService.doGet(vm.account + "/" + vm.project + "/groups/" + issue.group_id).then(function (response) {
					data = {
						source: "tree",
						account: vm.account,
						project: vm.project,
						ids: response.data.parents,
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