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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("issue", issue);

	function issue() {
		return {
			restrict: "EA",
			templateUrl: "issue.html",
			scope: {
				data: "=",
				autoSaveComment: "=",
				onCommentAutoSaved: "&",
				onToggleCloseIssue: "&",
				availableRoles: "=",
				projectUserRoles: "=",
				onIssueAssignChange: "&"
			},
			controller: IssueCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	IssueCtrl.$inject = ["$scope", "$timeout", "IssuesService", "EventService"];

	function IssueCtrl($scope, $timeout, IssuesService, EventService) {
		var vm = this,
			promise = null,
			originatorEv = null,
			initWatch;

		/*
		 * Initialise view vars
		 */
		vm.showComments = true;
		vm.numNewComments = 0;
		vm.saveCommentDisabled = true;
		vm.backgroundColor = "#FFFFFF";
		vm.autoSaveComment = false;
		vm.showInfo = false;
		vm.editingComment = false;
		vm.assignedRolesColors = [];

		/*
		 * Handle the list of available roles
		 */
		$scope.$watch("vm.availableRoles", function(newValue) {
			var i = 0,
				length = 0;

			if (angular.isDefined(newValue)) {
				// Create a local copy of the available roles
				vm.roles = [];
				for (i = 0, length = newValue.length; i < length; i += 1) {
					vm.roles.push({
						role: newValue[i].role,
						color: newValue[i].color
					});
				}
				setupRolesWatch();
				initAssignedRolesDisplay();
				setupCanModifyIssue();
			}
		});

		/*
		 * Handle a request to do a comment auto save from the issue list
		 */
		$scope.$watch("vm.autoSaveComment", function(newValue) {
			if (angular.isDefined(newValue) && newValue && !vm.editingComment) {
				if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
					vm.autoSaveComment = true;
					vm.saveComment();
				}
			}
		});

		/*
		 * Handle change to comment input
		 */
		$scope.$watch("vm.comment", function(newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveCommentDisabled = (newValue === "");
			}
		});

		/*
		 * Do some initialisation
		 */
		initWatch = $scope.$watch("vm.data", function(newValue) {
			var i = 0,
				length = 0;

			if (angular.isDefined(newValue)) {
				vm.backgroundColor = "#FFFFFF";
				vm.issueIsOpen = true;
				if (newValue.hasOwnProperty("closed")) {
					vm.backgroundColor = newValue.closed ? "#E0E0E0" : "#FFFFFF";
					vm.issueIsOpen = !newValue.closed;
				}

				if (vm.issueIsOpen && newValue.hasOwnProperty("comments")) {
					for (i = 0, length = newValue.comments.length; i < length; i += 1) {
						newValue.comments[i].canDelete =
							(i === (newValue.comments.length - 1)) && (!newValue.comments[i].set);
					}
				}
				initAssignedRolesDisplay();
			}
			initWatch(); // Cancel the watch
		}, true);

		/**
		 * Handle changes to the assigned roles for the issue
		 */
		function setupRolesWatch() {
			$scope.$watch("vm.roles", function(newValue, oldValue) {
				var i = 0,
					length = 0;

				// Ignore initial setup of roles
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.data.assigned_roles = [];
					for (i = 0, length = vm.roles.length; i < length; i += 1) {
						if (vm.roles[i].assigned) {
							vm.data.assigned_roles.push(vm.roles[i].role);
						}
					}

					promise = IssuesService.assignIssue(vm.data);
					promise.then(function () {
						setAssignedRolesColors();
						vm.onIssueAssignChange();
					});
				}
			}, true);
		}

		/**
		 * Get the initial assigned roles for the issue
		 */
		function initAssignedRolesDisplay() {
			var i = 0,
				length = 0;

			if (angular.isDefined(vm.roles) && angular.isDefined(vm.data) && vm.data.hasOwnProperty("assigned_roles")) {
				for (i = 0, length = vm.roles.length; i < length; i += 1) {
					vm.roles[i].assigned = (vm.data.assigned_roles.indexOf(vm.roles[i].role) !== -1);
				}
				setAssignedRolesColors();
			}
		}

		/**
		 * Set up the assigned role colors for the issue
		 */
		function setAssignedRolesColors () {
			var i, length;

			var pinColours = [];

			vm.assignedRolesColors = [];
			for (i = 0, length = vm.roles.length; i < length; i += 1) {
				if (vm.data.assigned_roles.indexOf(vm.roles[i].role) !== -1) {
					var roleColour = IssuesService.getRoleColor(vm.roles[i].role);
					vm.assignedRolesColors.push(roleColour);
					pinColours.push(IssuesService.hexToRgb(roleColour));
				}
			}
		}

		/**
		 * A user with the same role as the issue creator_role or
		 * a role that is one of the roles that the issues has been assigned to can modify the issue
		 */
		function setupCanModifyIssue() {
			var i = 0,
				length = 0;

			vm.canModifyIssue = false;
			if (angular.isDefined(vm.projectUserRoles) && angular.isDefined(vm.data) && vm.data.hasOwnProperty("assigned_roles")) {
				vm.canModifyIssue = (vm.projectUserRoles.indexOf(vm.data.creator_role) !== -1);
				if (!vm.canModifyIssue) {
					for (i = 0, length = vm.projectUserRoles.length; i < length; i += 1) {
						if (vm.data.assigned_roles.indexOf(vm.projectUserRoles[i]) !== -1) {
							vm.canModifyIssue = true;
							break;
						}
					}
				}
			}
		}

		/**
		 * Save a comment
		 */
		vm.saveComment = function() {
			if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
				if (vm.editingComment) {
					promise = IssuesService.editComment(vm.data, vm.comment, vm.editingCommentIndex);
					promise.then(function(data) {
						vm.data.comments[vm.editingCommentIndex].comment = vm.comment;
						vm.data.comments[vm.editingCommentIndex].timeStamp = IssuesService.getPrettyTime(data.created);
						vm.comment = "";
					});
				} else {
					promise = IssuesService.saveComment(vm.data, vm.comment);
					promise.then(function(data) {
						if (!vm.data.hasOwnProperty("comments")) {
							vm.data.comments = [];
						}
						vm.data.comments.push({
							owner: data.owner,
							comment: vm.comment,
							created: data.created,
							timeStamp: IssuesService.getPrettyTime(data.created)
						});
						vm.comment = "";
						vm.numNewComments += 1; // This is used to increase the height of the comments list

						if (vm.autoSaveComment) {
							vm.onCommentAutoSaved(); // Tell the issue list a comment auto save has been done
							vm.autoSaveComment = false;
						}

						// Mark previous comment as 'set' - no longer deletable or editable
						if (vm.data.comments.length > 1) {
							promise = IssuesService.setComment(vm.data, (vm.data.comments.length - 2));
							promise.then(function(data) {
								vm.data.comments[vm.data.comments.length - 2].set = true;
							});
						}
					});
				}
			}
		};

		/**
		 * Delete a comment
		 *
		 * @param index
		 */
		vm.deleteComment = function(index) {
			promise = IssuesService.deleteComment(vm.data, index);
			promise.then(function(data) {
				vm.data.comments.splice(index, 1);
				vm.numNewComments -= 1; // This is used to reduce the height of the comments list
				vm.comment = "";
				vm.editingComment = false;
			});
		};

		/**
		 * Toggle the editing of a comment
		 *
		 * @param index
		 */
		vm.toggleEditComment = function(index) {
			vm.editingComment = !vm.editingComment;
			vm.editingCommentIndex = index;
			if (vm.editingComment) {
				vm.comment = vm.data.comments[vm.data.comments.length - 1].comment;
			} else {
				vm.comment = "";
			}
		};

		/**
		 * Toggle the closed status of an issue
		 */
		vm.toggleCloseIssue = function() {
			vm.onToggleCloseIssue({
				issue: vm.data
			});
		};

		/**
		 * Open the menu to assign roles
		 *
		 * @param $mdOpenMenu
		 * @param event
		 */
		vm.openAssignedRolesMenu = function($mdOpenMenu, event) {
			originatorEv = event;
			$mdOpenMenu(event);
		};
	}

	/*
	 * Below is for setting up the animation to show and hide comments
	 */

	angular.module("3drepo")
		.animation(".issueComments", issueComments);

	function issueComments() {
		var height;
		return {
			addClass: function(element, className, done) {
				if (className === "issueComments") {
					jQuery(element)
						.css({
							height: 0,
							opacity: 0
						})
						.animate({
							height: height,
							opacity: 1
						}, 500, done);
				} else {
					done();
				}
			},
			removeClass: function(element, className, done) {
				height = element[0].children[0].offsetHeight;
				if (className === "issueComments") {
					jQuery(element)
						.css({
							height: height,
							opacity: 1
						})
						.animate({
							height: 0,
							opacity: 0
						}, 500, done);
				} else {
					done();
				}
			}
		};
	}

	angular.module("3drepo")
		.directive("commentsHeight", commentsHeight);

	function commentsHeight() {
		return {
			restrict: "A",
			scope: {
				numNewComments: "="
			},
			link: link
		};

		function link(scope, element, attrs) {
			var commentHeight = 75,
				height = "0";
			scope.$watch("numNewComments", function(newValue, oldValue) {
				if (angular.isDefined(newValue)) {
					if (newValue > oldValue) {
						height = (element[0].offsetHeight + commentHeight).toString();
					} else if (newValue < oldValue) {
						height = (element[0].offsetHeight - commentHeight).toString();
					}
					element.css("height", height + "px");
				}
			});
		}
	}
}());