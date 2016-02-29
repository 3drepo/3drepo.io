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
			restrict: 'EA',
			templateUrl: 'issues.html',
			scope: {
				filterText: "=",
				showAdd: "=",
				options: "=",
				selectedOption: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "="
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$rootScope", "$element", "$timeout", "$mdDialog", "$filter", "EventService", "NewIssuesService", "ViewerService"];

	function IssuesCtrl($scope, $rootScope, $element, $timeout, $mdDialog, $filter, EventService, NewIssuesService, ViewerService) {
		var vm = this,
			promise,
			rolesPromise,
			projectUserRolesPromise,
			sortedIssuesLength,
			sortOldestFirst = true,
			showClosed = false,
			issue,
			rolesToFilter = [],
			issuesHeight;

		vm.pickedAccount = null;
		vm.pickedProject = null;
		vm.pickedPos = null;
		vm.pickedNorm = null;
		vm.pickedTrans = null;
		vm.selectedObjectId = null;
		vm.globalClickWatch = null;
		vm.saveIssueDisabled = true;
		vm.issues = [];
		vm.showProgress = true;
		vm.progressInfo = "Loading issues";
		vm.showIssuesInfo = false;
		vm.showIssueList = false;
		vm.showIssue = false;
		vm.issuesInfo = "There are currently no open issues";
		vm.availableRoles = null;
		vm.projectUserRoles = [];

		/* Get all the Issues */
		promise = NewIssuesService.getIssues();
		promise.then(function (data) {
			vm.showProgress = false;
			vm.issues = data;
			vm.showIssuesInfo = (vm.issues.length === 0);
			vm.showIssueList = (vm.issues.length !== 0);
			setAllIssuesAssignedRolesColors();
			setupIssuesToShow();
			vm.showPins();
		});

		/* Get all the available roles for the project */
		rolesPromise = NewIssuesService.getRoles();
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
				roleColour = NewIssuesService.getRoleColor(issue.assigned_roles[i]);
				issue.assignedRolesColors.push(roleColour);
				pinColours.push(NewIssuesService.hexToRgb(roleColour));
			}

			//NewIssuesService.changePinColour(issue._id, pinColours);
		}

		/* Get the user roles for the project */
		projectUserRolesPromise = NewIssuesService.getUserRolesForProject();
		projectUserRolesPromise.then(function (data) {
			vm.projectUserRoles = data;
		});

		/* Handle toggle of adding a new issue */
		$scope.$watch("vm.showAdd", function (newValue) {
			var addIssueHeight = 225;
			if (newValue) {
				setupGlobalClickWatch();
				vm.onContentHeightRequest({height: issuesHeight + addIssueHeight});
			}
			else {
				cancelGlobalClickWatch();
				NewIssuesService.removePin();
				vm.onContentHeightRequest({height: issuesHeight});
			}
		});

		/* Handle input to the title field of a new issue */
		$scope.$watch("vm.title", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveIssueDisabled = (newValue.toString() === "");
			}
		});

		/**
		 * Escape CSS characters in string
		 *
		 * @param string
		 * @returns {*}
		 */
		function escapeCSSCharacters(string)
		{
			// Taken from http://stackoverflow.com/questions/2786538/need-to-escape-a-special-character-in-a-jquery-selector-string
			return string.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
		}

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0, roleAssigned;

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

					// Un-expand any expanded issue
					vm.commentsToggledIssueId = null;

					// Set the height of the content
					if (vm.issuesToShow.length === 0) {
						vm.showIssuesInfo = true;
						vm.issuesInfo = "There are no issues that contain the filter text";
					}
					else {
						vm.showIssuesInfo = false;
						setContentHeight();
					}
				}
			}
		}

		vm.issueAssignChange = function () {
			setIssueAssignedRolesColors(vm.selectedIssue);
			vm.showPins();
		};

		vm.showPins = function () {
			var i, j, length, assignedRolesLength,
				pin, pinData, pinColor, pinMaterial,
				roleAssigned;

			for (i = 0, length = vm.issues.length; i < length; i += 1) {
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
								account: vm.issues[i].account,
								project: vm.issues[i].project,
								position: vm.issues[i].position,
								norm: vm.issues[i].norm
							};

						if (vm.issues[i].hasOwnProperty("assigned_roles") && vm.issues[i].assigned_roles.length > 0) {
							pinColor = NewIssuesService.hexToRgb(NewIssuesService.getRoleColor(vm.issues[i].assigned_roles[0]));
						}
						else {
							pinColor = [1.0, 1.0, 1.0];
						}
						
						NewIssuesService.addPin(pinData, pinColor, vm.issues[i].viewpoint);
					}
				}
			}
		};

		$scope.$watch("vm.selectedOption", function (newValue) {
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
				setupIssuesToShow();
				vm.showPins();
			}
		});

		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.commentsToggledIssueId = null;
				setupIssuesToShow();
			}
		});

		/*
		 * Handle parent notice to hide the selected issue
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.showIssueList = true;
				vm.showIssue = false;
			}
		});

		vm.commentsToggled = function (issueId) {
			if (issueId === vm.commentsToggledIssueId)
			{
				vm.commentsToggledIssueId = null;
			} else {
				vm.commentsToggledIssueId = issueId;
			}
		};

		/**
		 * Make the selected issue fill the content and notify the parent
		 *
		 * @param index
		 */
		vm.showSelectedIssue = function (index) {
			vm.showIssueList = false;
			vm.showIssue = true;
			vm.selectedIssue = vm.issuesToShow[index];
			vm.onShowItem();

			if (vm.issuesToShow[index]._id === vm.commentsToggledIssueId)
			{
				vm.commentsToggledIssueId = null;
			} else {
				vm.commentsToggledIssueId = vm.issuesToShow[index]._id;
			}
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
					if (vm.pickedPos === null) {
						vm.showAlert("Add a pin before saving");
					}
					else {
						issue = {
							account: vm.pickedAccount,
							project: vm.pickedProject,
							name: vm.title,
							objectId: vm.selectedObjectId,
							pickedPos: vm.pickedPos,
							pickedNorm: vm.pickedNorm,
							creator_role: vm.projectUserRoles[0]
						};
						promise = NewIssuesService.saveIssue(issue);
						promise.then(function (data) {
							vm.issues.push(data);

							vm.title         = "";
							vm.pickedAccount = null;
							vm.pickedProject = null;
							vm.pickedTrans   = null;
							vm.pickedPos     = null;
							vm.pickedNorm    = null;

							if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
								vm.saveCommentWithIssue(data, vm.comment);
								vm.comment = "";
							}

							setupIssuesToShow();
							vm.showPins();

							vm.showAdd = false;
						});
					}
				}
			}
		};

		vm.toggleCloseIssue = function (issue) {
			var i = 0, length = 0;

			promise = NewIssuesService.toggleCloseIssue(issue);
			promise.then(function (data) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					if (issue._id === vm.issues[i]._id) {
						vm.issues[i].closed = data.issue.closed;
						//vm.issues[i].closed_time = data.created; // TODO: Shouldn't really use the created value
						break;
					}
				}
				setupIssuesToShow();
				vm.showPins();
			});
		};

		vm.saveCommentWithIssue = function (issue, comment) {
			promise = NewIssuesService.saveComment(issue, comment);
			promise.then(function (data) {
				vm.issues[vm.issues.length - 1].comments = [
					{
						owner: data.owner,
						comment: comment,
						timeStamp: NewIssuesService.getPrettyTime(data.created)
					}
				];
			});
		};

		
		function setupGlobalClickWatch () {
			/*
			if (vm.globalClickWatch === null) {
				vm.globalClickWatch = $scope.$watch(EventService.currentEvent, function (event, oldEvent) {
					if ((event.type === EventService.EVENT.GLOBAL_CLICK) &&
						(event.value.target.className === "x3dom-canvas") &&
						(!((event.value.clientX === oldEvent.value.clientX) &&
						   (event.value.clientY === oldEvent.value.clientY)))) {

						var dragEndX = event.value.clientX;
						var dragEndY = event.value.clientY;
						var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);

						if (pickObj.pickObj !== null) {
							vm.showInput = true;
							vm.selectedObjectId = pickObj.partID ? pickObj.partID : pickObj.pickObj._xmlNode.getAttribute("DEF");

							var projectParts = pickObj.pickObj._xmlNode.getAttribute("id").split("__");

							if (projectParts[0] === "model")
							{
								vm.pickedAccount = NewIssuesService.state.account;
								vm.pickedProject = NewIssuesService.state.project;
								vm.pickedTrans   = $("#model__root")[0]._x3domNode.getCurrentTransform();
							} else {
								vm.pickedAccount = projectParts[0];
								vm.pickedProject = projectParts[1];

								var rootTransName = escapeCSSCharacters(vm.pickedAccount + "__" + vm.pickedProject + "__root");
								vm.pickedTrans   = $("#" + rootTransName)[0]._x3domNode.getCurrentTransform();
							}

							vm.pickedNorm = vm.pickedTrans.transpose().multMatrixVec(pickObj.pickNorm);
							vm.pickedPos = vm.pickedTrans.inverse().multMatrixVec(pickObj.pickPos);

							NewIssuesService.addPin(
								{
									id: undefined,
									account: vm.pickedAccount,
									project: vm.pickedProject,
									position: vm.pickedPos.toGL(),
									norm: vm.pickedNorm.toGL()
								},
								NewIssuesService.hexToRgb(NewIssuesService.getRoleColor(vm.projectUserRoles[0]))
							);
						}
						else {
							NewIssuesService.removePin();
						}
					}
				});
			}
			*/
		}

		function cancelGlobalClickWatch () {
			if (typeof vm.globalClickWatch === "function") {
				vm.globalClickWatch();
				vm.globalClickWatch = null;
			}
		}

		/*
		 * When a pin is clicked that make sure the issue sidebar
		 * also reflects the updated state
		 * @listens pinClick
		 * @param {event} event - Originating event
		 * @param {object} clickInfo - Contains object and information about the source of the click
		 */
		$(document).on("pinClick", function (event, clickInfo) {
			// If there has been a pin selected then switch
			// that issue
			$timeout(function() {
				var issueId = clickInfo.object ? clickInfo.object.parentElement.parentElement.getAttribute("id") : null;

				if (clickInfo.fromViewer) {
					/*
					vm.commentsToggled(issueId);
					$rootScope.$apply();
					*/
					for (var i = 0; i < vm.issuesToShow.length; i += 1) {
						if (vm.issuesToShow[i]._id === issueId) {
							vm.showSelectedIssue(i);
							break;
						}
					}
				}
			});
		});

		vm.showAlert = function(title) {
			$mdDialog.show(
				$mdDialog.alert()
					.parent(angular.element($element[0].querySelector("#issuesAddContainer")))
					.clickOutsideToClose(true)
					.title(title)
					.ariaLabel("Pin alert")
					.ok("OK")
			);
		};

		/**
		 * Set the content height.
		 */
		function setContentHeight () {
			var i, length, issueMinHeight = 56, maxStringLength = 32, lineHeight = 18;

			issuesHeight = 0;
			for (i = 0, length = vm.issuesToShow.length; (i < length); i += 1) {
				issuesHeight += issueMinHeight;
				if (vm.issuesToShow[i].title.length > maxStringLength) {
					issuesHeight += lineHeight * Math.floor((vm.issuesToShow[i].title.length - maxStringLength) / maxStringLength);
				}
			}
			vm.onContentHeightRequest({height: issuesHeight});
		}
	}
}());
