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
				hideItem: "="
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$timeout", "$filter", "$window", "$q", "$element", "IssuesService", "EventService", "Auth", "serverConfig"];

	function IssuesCtrl($scope, $timeout, $filter, $window, $q, $element, IssuesService, EventService, Auth, serverConfig) {
		var vm = this,
			promise,
			rolesPromise,
			projectUserRolesPromise,
			sortedIssuesLength,
			sortOldestFirst = true,
			showClosed = false,
			issue,
			rolesToFilter = [],
			issuesHeight,
			selectedObjectId = null,
			pickedPos = null,
			pickedNorm = null,
			pinHighlightColour = [1.0000, 0.7, 0.0],
			issueViewerMoveComplete = false;

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
		EventService.send(EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK, {callback: viewerMove});

		/*
		 * Get all the Issues
		 */
		promise = IssuesService.getIssues(vm.account, vm.project, vm.revision);
		promise.then(function (data) {
			var i, length;
			vm.showProgress = false;
			vm.issues = (data === "") ? [] : data;
			if (vm.issues.length > 0) {
				vm.toShow = "showIssues";
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					vm.issues[i].showInfo = false;
					vm.issues[i].selected = false;
				}
				setAllIssuesAssignedRolesColors();
				setupIssuesToShow();
				vm.showPins();
			}
			else {
				vm.toShow = "showInfo";
				vm.issuesInfo = "There are currently no open issues";
			}
			setContentHeight();
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
		 * Handle showing of adding a new issue
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				setupAdd();
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: true, type: "scribble"});
			}
		});

		/*
		 * Handle input to the title field of a new issue
		 */
		$scope.$watch("vm.title", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveIssueDisabled = (newValue.toString() === "");
			}
		});

		/**
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			var i, length,
				position = [], normal = [];

			if ((event.type === EventService.EVENT.VIEWER.PICK_POINT) && (vm.toShow === "showAdd"))
			{
				if (event.value.hasOwnProperty("id"))
				{
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
				} else {
					removeAddPin();
				}
			} else if ((event.type === EventService.EVENT.VIEWER.CLICK_PIN) && vm.show) {
				if (vm.toShow === "showAdd") {
					removeAddPin();
				}

				// Show or hide the selected issue
				for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
					if (event.value.id === vm.issuesToShow[i]._id) {
						if (vm.selectedIssue === null) {
							vm.showSelectedIssue(i, true);
						}
						else {
							if (vm.selectedIssue._id === vm.issuesToShow[i]._id) {
								vm.hideItem = true;
							}
							else {
								vm.showSelectedIssue(i, true);
							}
						}
						break;
					}
				}
			} else if (event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) {
				if (event.value.on) {
					vm.show = true;
					setupAdd();
					// This is done to override the default mode ("scribble") set in the vm.showAdd watch above ToDo improve!
					$timeout(function () {
						EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, event.value.type);
					}, 200);
				}
				else {
					vm.hideItem = true;
				}
			}
		});

		/**
		 * Remove the temporary pin used for adding an issue
		 */
		function removeAddPin () {
			IssuesService.removePin(IssuesService.newPinId);
			selectedObjectId = null;
			pickedPos = null;
			pickedNorm = null;
		}

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0, roleAssigned;

			vm.issuesToShow = [];

			if (angular.isDefined(vm.issues)) {
				if (vm.issues.length > 0) {
					// Sort
					vm.issuesToShow = [vm.issues[0]];
					for (i = 1, length = vm.issues.length; i < length; i += 1) {
						for (j = 0, sortedIssuesLength = vm.issuesToShow.length; j < sortedIssuesLength; j += 1) {
							if (((vm.issues[i].created > vm.issuesToShow[j].created) && (sortOldestFirst)) ||
								((vm.issues[i].created < vm.issuesToShow[j].created) && (!sortOldestFirst))) {
								vm.issuesToShow.splice(j, 0, vm.issues[i]);
								break;
							}
							else if (j === (vm.issuesToShow.length - 1)) {
								vm.issuesToShow.push(vm.issues[i]);
							}
						}
					}

					// Filter text
					if (angular.isDefined(vm.filterText) && vm.filterText !== "") {

						// Helper function for searching strings
						var stringSearch = function(superString, subString)
						{
							return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
						};

						vm.issuesToShow = ($filter('filter')(vm.issuesToShow, function(issue) {
							// Required custom filter due to the fact that Angular
							// does not allow compound OR filters
							var i;

							// Search the title
							var show = stringSearch(issue.title, vm.filterText);
							show = show || stringSearch(issue.timeStamp, vm.filterText);
							show = show || stringSearch(issue.owner, vm.filterText);

							// Search the list of assigned issues
							if (!show && issue.hasOwnProperty("assigned_roles"))
							{
								i = 0;
								while(!show && (i < issue.assigned_roles.length))
								{
									show = show || stringSearch(issue.assigned_roles[i], vm.filterText);
									i += 1;
								}
							}

							// Search the comments
							if (!show && issue.hasOwnProperty("comments"))
							{
								i = 0;

								while(!show && (i < issue.comments.length))
								{
									show = show || stringSearch(issue.comments[i].comment, vm.filterText);
									show = show || stringSearch(issue.comments[i].owner, vm.filterText);
									i += 1;
								}
							}

							return show;
						}));

						//{title : vm.filterText} || {comments: { comment : vm.filterText }} ));
					}

					// Don't show issues assigned to certain roles
					if (rolesToFilter.length > 0) {
						i = 0;
						while(i < vm.issuesToShow.length) {
							roleAssigned = false;

							if (vm.issuesToShow[i].hasOwnProperty("assigned_roles")) {
								for (j = 0, length = vm.issuesToShow[i].assigned_roles.length; j < length; j += 1) {
									if (rolesToFilter.indexOf(vm.issuesToShow[i].assigned_roles[j]) !== -1) {
										roleAssigned = true;
									}
								}
							}

							if (roleAssigned) {
								vm.issuesToShow.splice(i, 1);
							} else {
								i += 1;
							}
						}
					}

					// Closed
					for (i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
						if (!showClosed && vm.issuesToShow[i].hasOwnProperty("closed") && vm.issuesToShow[i].closed) {
							vm.issuesToShow.splice(i, 1);
						}
					}
				}
			}

			// Setup what to show
			if (vm.issuesToShow.length > 0) {
				vm.toShow = "showIssues";
				// Hide any scribble if showing the issues list
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
			}
			else {
				vm.toShow = "showInfo";
				vm.issuesInfo = "There are currently no open issues";
			}
		}

		/**
		 * The roles assigned to the issue have been changed
		 */
		vm.issueAssignChange = function () {
			setIssueAssignedRolesColors(vm.selectedIssue);
			vm.showPins();
		};

		/**
		 * Add issue pins to the viewer
		 */
		vm.showPins = function () {
			var i, j, length, assignedRolesLength,
				pin, pinData,
				roleAssigned;

			for (i = 0, length = vm.issues.length; i < length; i += 1) {
				if (vm.issues[i].object_id !== null) {
					pin = angular.element(document.getElementById(vm.issues[i]._id));
					if (pin.length > 0) {
						// Existing pin
						pin[0].setAttribute("render", "true");

						// Closed
						if (!showClosed && vm.issues[i].hasOwnProperty("closed") && vm.issues[i].closed) {
							pin[0].setAttribute("render", "false");
						}

						// Role filter
						if (rolesToFilter.length > 0) {
							roleAssigned = false;

							if (vm.issues[i].hasOwnProperty("assigned_roles")) {
								for (j = 0, assignedRolesLength = vm.issues[i].assigned_roles.length; j < assignedRolesLength; j += 1) {
									if (rolesToFilter.indexOf(vm.issues[i].assigned_roles[j]) !== -1) {
										roleAssigned = true;
									}
								}
							}

							if (roleAssigned) {
								pin[0].setAttribute("render", "false");
							}
						}
					}
					else {
						// New pin
						if (!vm.issues[i].hasOwnProperty("closed") ||
							(vm.issues[i].hasOwnProperty("closed") && !vm.issues[i].closed) ||
							(showClosed && vm.issues[i].hasOwnProperty("closed") && vm.issues[i].closed)) {
							pinData =
							{
								id: vm.issues[i]._id,
								position: vm.issues[i].position,
								norm: vm.issues[i].norm,
								account: vm.account,
								project: vm.project
							};

							IssuesService.addPin(pinData, [[1.0, 1.0, 1.0]], vm.issues[i].viewpoint);
							setPinToAssignedRoleColours(vm.issues[i]);
						}
					}
				}
			}
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
				setupIssuesToShow();
				setContentHeight();
				vm.showPins();
			}
		});

		/*
		 * Handle changes to the filter input
		 */
		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				setupIssuesToShow();

				// Set the height of the content
				if (vm.issuesToShow.length === 0) {
					vm.toShow = "showInfo";
					vm.issuesInfo = "There are no issues that contain the filter text";
				}
				else {
					vm.toShow = "showIssues";
				}
				setContentHeight();
			}
		});

		/*
		 * Handle parent notice to hide a selected issue or add issue
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.autoSaveComment = true; // Auto save a comment if needed

				$timeout(function () {
					if (vm.toShow === "showAdd") {
						removeAddPin();
						EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
					}
					vm.showAdd = false; // So that showing add works
					vm.canAdd = true;
					vm.showEdit = false; // So that closing edit works

					// Set the content height
					setupIssuesToShow();
					setContentHeight();

					// Deselect any selected pin
					setPinToAssignedRoleColours(vm.selectedIssue);

					// No selected issue
					vm.selectedIssue = null;

					// Hide issue area
					EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
				});
			}
		});

		/**
		 * Make the selected issue fill the content and notify the parent
		 *
		 * @param {Number} index
		 * @param {Boolean} pinSelect - whether called by a pin selection or not
		 */
		vm.showSelectedIssue = function (index, pinSelect) {
			// Hide and show layers
			if (vm.toShow === "showAdd") {
				removeAddPin();
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
			}
			vm.toShow = "showIssue";
			vm.showAdd = false; // So that showing add works
			vm.canAdd = false;
			vm.showEdit = true;

			// Selected issue
			if (vm.selectedIssue !== null) {
				vm.selectedIssue.selected = false;
			}
			vm.selectedIssue = vm.issuesToShow[index];
			vm.selectedIndex = index;
			vm.selectedIssue.rev_id = vm.revision;
			vm.selectedIssue.selected = true;
			vm.selectedIssue.showInfo = false;

			vm.autoSaveComment = false; // So that the request to auto save a comment will fire

			// Show the issue
			vm.onShowItem();

			// Set the content height
			setContentHeight();

			// Highlight pin, move camera and setup clipping plane
			if (!pinSelect) {
				EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
					id: vm.selectedIssue._id,
					colours: pinHighlightColour
				});

				EventService.send(EventService.EVENT.VIEWER.SET_CAMERA, {
					position : vm.selectedIssue.viewpoint.position,
					view_dir : vm.selectedIssue.viewpoint.view_dir,
					//look_at: vm.selectedIssue.viewpoint.look_at,
					up: vm.selectedIssue.viewpoint.up
				});

				EventService.send(EventService.EVENT.VIEWER.SET_CLIPPING_PLANES, {
					clippingPlanes: vm.selectedIssue.viewpoint.clippingPlanes
				});
			}

			// Wait for camera to stop before showing a scribble
			issueViewerMoveComplete = false;
			$timeout(function () {
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: true, issue: vm.selectedIssue});
				issueViewerMoveComplete = true;
			}, 1100);
		};

		/**
		 * Save an issue
		 */
		vm.saveIssue = function () {
			if (vm.projectUserRoles.length === 0) {
				vm.showAlert("You do not have permission to save an issue");
			}
			else {
				if (angular.isDefined(vm.title) && (vm.title !== "")) {
					vm.savingIssue = true;
					var issueAreaPngPromise = $q.defer();
					EventService.send(EventService.EVENT.GET_ISSUE_AREA_PNG, {promise: issueAreaPngPromise});
					issueAreaPngPromise.promise.then(function (png) {
						issue = {
							name: vm.title,
							objectId: null,
							pickedPos: null,
							pickedNorm: null,
							creator_role: vm.projectUserRoles[0],
							account: vm.account,
							project: vm.project,
							scribble: png,
						};

						if(vm.revision){
							issue.rev_id = vm.revision;
						}

						if (selectedObjectId !== null) {
							issue.objectId = selectedObjectId;
							issue.pickedPos = pickedPos;
							issue.pickedNorm = pickedNorm;
						}
						promise = IssuesService.saveIssue(issue);
						promise.then(function (data) {
							// Set the role colour
							data.assignedRolesColors = [];
							data.assignedRolesColors.push(IssuesService.getRoleColor(vm.projectUserRoles[0]));
							vm.issues.push(data);

							// Init
							vm.title = "";
							selectedObjectId = null;
							pickedPos = null;
							pickedNorm = null;

							// Save issue with a comment
							if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
								saveCommentWithIssue(data, vm.comment);
								vm.comment = "";
							}

							// Get out of add mode and show issues
							vm.hideItem = true;

							vm.savingIssue = false;
							setupIssuesToShow();
							setContentHeight();
							vm.showPins();
						});
					});
				}
			}
		};

		/**
		 * Cancel adding an issue
		 */
		vm.cancelAddIssue = function () {
			vm.hideItem = true;
		};

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
						setContentHeight();
					}
					else {
						vm.toShow = "showIssues";
						setupIssuesToShow();
						vm.showPins();
						setContentHeight();
						vm.canAdd = true;
						EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
					}
				}
				else {
					setContentHeight();
				}
			});
		};

		/**
		 * Save a comment at the same time as creating a new issue
		 *
		 * @param {Object} issue
		 * @param {String} comment
		 */
		function saveCommentWithIssue (issue, comment) {
			promise = IssuesService.saveComment(issue, comment);
			promise.then(function (data) {
				vm.issues[vm.issues.length - 1].comments = [
					{
						owner: data.owner,
						comment: comment,
						timeStamp: IssuesService.getPrettyTime(data.created)
					}
				];
			});
		}

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
			setContentHeight();
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
		function setContentHeight () {
			var i,
				length,
				height = 0,
				issueMinHeight = 56,
				maxStringLength = 32,
				lineHeight = 18,
				footerHeight,
				addHeight = 260,
				commentHeight = 80,
				headerHeight = 53,
				openIssueFooterHeight = 180,
				closedIssueFooterHeight = 60,
				infoHeight = 80,
				issuesMinHeight = 260;

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

		/**
		 * Set up adding an issue
		 */
		function setupAdd () {
			if (vm.toShow === "showIssue") {
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
			}
			vm.toShow = "showAdd";
			vm.onShowItem();
			vm.showAdd = true;
			vm.canAdd = false;
			setContentHeight();
			setPinToAssignedRoleColours(vm.selectedIssue);

			// Set default issue title and select it
			vm.title = "Issue " + (vm.issues.length + 1);
			$timeout(function () {
				($element[0].querySelector("#issueAddTitle")).select();
			});
		}

		/**
		 * If the issue has a scribble deselect it if the user moves the camera
		 */
		function viewerMove () {
			if ((vm.selectedIssue !== null) && (vm.selectedIssue.scribble !== null) && issueViewerMoveComplete) {
				vm.hideItem = true;
			}
		}
	}
}());
