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
				showEdit: "=",
				canAdd: "=",
				selectedMenuOption: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "=",
				keysDown: "="
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$timeout", "$filter", "$window", "$q", "$element", "IssuesService", "EventService", "Auth", "serverConfig", "UtilsService"];

	function IssuesCtrl($scope, $timeout, $filter, $window, $q, $element, IssuesService, EventService, Auth, serverConfig, UtilsService) {
		var vm = this,
			promise,
			rolesPromise,
			projectUserRolesPromise,
			sortedIssuesLength,
			sortOldestFirst	 = true,
			showClosed = false,
			issue,
			rolesToFilter = [],
			issuesHeight,
			selectedObjectId = null,
			pickedPos = null,
			pickedNorm = null,
			pinHighlightColour = [1.0000, 0.7, 0.0],
			selectedIssue = null,
			selectedIssueIndex = null,
			infoHeight = 81;

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
		vm.canAdd = true;
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
			var i, length,
				position = [], normal = [];
			vm.event = event;

			if ((event.type === EventService.EVENT.VIEWER.PICK_POINT) && (vm.toShow === "showAdd"))
			{
				/*
				if (event.value.hasOwnProperty("id"))
				{
					if (vm.type === "pin") {
						// Remove pin from last position if it exists
						removeAddPin();

						selectedObjectId = event.value.id;

						// Convert data to arrays
						angular.forEach(event.value.position, function(value) {
							pickedPos = event.value.position;
							position.push(value);
						});
						angular.forEach(event.value.normal, function(value) {
							pickedNorm = event.value.normal;
							normal.push(value);
						});


						// Add pin
						IssuesService.addPin(
							{
								id: IssuesService.newPinId,
								position: position,
								norm: normal,
								account: vm.account,
								project: vm.project
							},
							IssuesService.hexToRgb(IssuesService.getRoleColor(vm.projectUserRoles[0]))
						);
					}
					else if (vm.type === "multi") {

					}
				} else {
					removeAddPin();
				}
				*/
			} else if ((event.type === EventService.EVENT.VIEWER.CLICK_PIN) && vm.show) {
				//pinClicked(event.value.id);
			} else if (event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) {
				if (event.value.on) {
					vm.show = true;
					//setupAdd();
					// This is done to override the default mode ("scribble") set in the vm.showAdd watch above ToDo improve!
					$timeout(function () {
						EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, event.value.type);
					}, 200);
				}
				else {
					//vm.hideItem = true;
				}
			} else if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
				//vm.selectedObject = event.value;
			}
			else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
				//backgroundSelected();
			}

		});

		/**
		 * The roles assigned to the issue have been changed
		 */
		vm.issueAssignChange = function () {
			setIssueAssignedRolesColors(vm.selectedIssue);
			vm.showPins();
		};

		/*
		 * Selecting a menu option
		 */
		$scope.$watch("vm.selectedMenuOption", function (newValue) {
			var role, roleIndex;
			if (angular.isDefined(newValue)) {
				if (newValue.value === "sortByDate") {
					sortOldestFirst = !sortOldestFirst;
				}
				else if (newValue.value === "showClosed") {
					showClosed = !showClosed;
				}
				else if (newValue.value.indexOf("filterRole") !== -1) {
					role = newValue.value.split("_")[1];
					roleIndex = rolesToFilter.indexOf(role);
					if (roleIndex !== -1) {
						rolesToFilter.splice(roleIndex, 1);
					}
					else {
						rolesToFilter.push(role);
					}
				}
				else if (newValue.value === "print") {
					$window.open(serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.project + "/issues.html"), "_blank");
				}
				//setupIssuesToShow();
				vm.setContentHeight();
				vm.showPins();
			}
		});

		/**
		 * Toggle the closed status of an issue
		 *
		 * @param {Object} issue
		 */
		vm.toggleCloseIssue = function (issue) {
			var i = 0,
				length = 0;

			promise = IssuesService.toggleCloseIssue(issue);
			promise.then(function (data) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					if (issue._id === vm.issues[i]._id) {
						vm.issues[i].closed = data.issue.closed;
						//vm.issues[i].closed_time = data.created; // TODO: Shouldn't really use the created value
						break;
					}
				}

				// Remain in issue unless closing when showing closed issues is off
				if (data.issue.closed) {
					if (showClosed) {
						vm.setContentHeight();
					}
					else {
						vm.toShow = "showIssues";
						setupIssuesToShow();
						vm.showPins();
						vm.setContentHeight();
						vm.canAdd = true;
						EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
					}
				}
				else {
					vm.setContentHeight();
				}
			});
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
		/*
		function setContentHeight () {
			var i,
				length,
				height = 0,
				issueMinHeight = 56,
				maxStringLength = 32,
				lineHeight = 18,
				footerHeight,
				addHeight = 510,
				commentHeight = 80,
				headerHeight = 53,
				openIssueFooterHeight = 180,
				closedIssueFooterHeight = 60,
				infoHeight = 81,
				issuesMinHeight = 435,
				issueListItemHeight = 150,
				addButtonHeight = 75;

			switch (vm.toShow) {
				case "showIssues":
					issuesHeight = 0;
					for (i = 0, length = vm.issuesToShow.length; (i < length); i += 1) {
						issuesHeight += issueMinHeight;
						if (vm.issuesToShow[i].title.length > maxStringLength) {
							issuesHeight += lineHeight * Math.floor((vm.issuesToShow[i].title.length - maxStringLength) / maxStringLength);
						}
					}
					height = issuesHeight;
					height = (height < issuesMinHeight) ? issuesMinHeight : issuesHeight;
					height = (vm.issuesToShow.length * issueListItemHeight);
					break;

				case "showIssue":
					if (vm.selectedIssue.closed) {
						footerHeight = closedIssueFooterHeight;
					}
					else {
						footerHeight = openIssueFooterHeight;
					}

					var numberComments = vm.selectedIssue.hasOwnProperty("comments") ? vm.selectedIssue.comments.length : 0;
					height = headerHeight + (numberComments * commentHeight) + footerHeight;
					height = issuesMinHeight;
					break;

				case "showAdd":
					height = addHeight;
					break;

				case "showInfo":
					height = infoHeight;
					break;
			}

			vm.onContentHeightRequest({height: height});
		}
		*/

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
			console.log(newValue);
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
		 * Set up editing issue
		 * @param issue
		 */
		vm.editIssue = function (issue) {
			vm.issueToEdit = issue;
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
