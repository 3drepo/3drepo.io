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
		.directive("issue", issue);

	function issue() {
		return {
			restrict: "EA",
			templateUrl: "issue.html",
			scope: {
				data: "=",
				onCommentsToggled: "&",
				commentsToggledIssueId: "=",
				onCloseIssue : "&",
				issueClosed: "="
			},
			controller: IssueCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	IssueCtrl.$inject = ["$scope", "$timeout", "NewIssuesService", "ViewerService"];

	function IssueCtrl($scope, $timeout, NewIssuesService, ViewerService) {
		var vm = this,
			i = 0,
			length = 0,
			promise = null;

		vm.showComments = false;
		vm.numNewComments = 0;
		vm.saveCommentDisabled = true;
		vm.backgroundClass = "issueClosedBackground";
		vm.autoSaveComment = false;
		vm.showInfo		   = false;
		vm.editingComment  = false;

		vm.roles = [
			{name: "PinakinDesai"},
			{name: "Chopin"}
		];
		vm.assignedRoles = [];

		NewIssuesService.fixPin(
			{
				id: vm.data._id,
				account: vm.data.account,
				project: vm.data.project,
				position: vm.data.position,
				norm: vm.data.norm
			},
			hexToRgb(vm.data.roleColour)
		);

		function hexToRgb(hex) {
			var hexColours = [];

			if (hex.charAt(0) === "#") {
				hex = hex.substr(1);
			}

			if (hex.length === 6) {
				hexColours.push(hex.substr(0, 2));
				hexColours.push(hex.substr(2, 2));
				hexColours.push(hex.substr(4, 2));
			}
			else if (hex.length === 3) {
				hexColours.push(hex.substr(0, 1) + hex.substr(0, 1));
				hexColours.push(hex.substr(1, 1) + hex.substr(1, 1));
				hexColours.push(hex.substr(2, 1) + hex.substr(2, 1));
			}
			else {
				hexColours = ["00", "00", "00"];
			}

			return [(parseInt(hexColours[0], 16) / 255.0), (parseInt(hexColours[1], 16) / 255.0), (parseInt(hexColours[2], 16) / 255.0)];
		}

		$scope.$watch("vm.commentsToggledIssueId", function (newValue) {
			// If the comments is toggled on another comment, then close this one.
			if (angular.isDefined(newValue)) {
				if (newValue !== vm.data._id) {
					vm.showComments = false;

					// If we are editing the comment, then clear it.
					if (vm.editingComment) {
						vm.comment = "";
					} else {
						// Auto-save a comment
						if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
							vm.autoSaveComment = true;
							vm.saveComment();
						}
					}
				} else {
					vm.showComments = !vm.showComments;

					if (vm.showComments)
					{
						var pinGroup = $("#" + vm.data._id)[0].getElementsByTagName("group");
						$(document).trigger("pinClick", { fromViewer : false, object: pinGroup[0] } );

						// Set the camera position
						ViewerService.defaultViewer.setCamera(
							vm.data.viewpoint.position,
							vm.data.viewpoint.view_dir,
							vm.data.viewpoint.up
						);

						if (vm.data.viewpoint.clippingPlanes) {
							if (vm.data.viewpoint.clippingPlanes.length) {
								ViewerService.defaultViewer.setClippingPlanes(vm.data.viewpoint.clippingPlanes);
							} else {
								ViewerService.defaultViewer.clearClippingPlanes();
							}
						}
					}
				}
			}
		});

		$scope.$watch("vm.comment", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveCommentDisabled = (newValue === "");
			}
		});

		$scope.$watch("vm.data", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.backgroundClass = newValue.hasOwnProperty("closed") ? "issueClosedBackground" : "issueOpenBackground";
				vm.issueIsOpen = !newValue.hasOwnProperty("closed");
				if (vm.issueIsOpen && newValue.hasOwnProperty("comments")) {
					for (i = 0, length = newValue.comments.length; i < length; i += 1) {
						newValue.comments[i].canDelete =
							(i === (newValue.comments.length - 1)) && (!newValue.comments[i].set);
					}
				}
			}
		}, true);

		vm.toggleComments = function () {
			vm.onCommentsToggled({issueId: vm.data._id});
		};

		vm.saveComment = function () {
			if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
				if (vm.editingComment) {
					promise = NewIssuesService.editComment(vm.data, vm.comment, vm.editingCommentIndex);
					promise.then(function (data) {
						vm.data.comments[vm.editingCommentIndex].comment = vm.comment;
						vm.data.comments[vm.editingCommentIndex].timeStamp = NewIssuesService.getPrettyTime(data.created);
						vm.comment = "";
					});
				}
				else {
					promise = NewIssuesService.saveComment(vm.data, vm.comment);
					promise.then(function (data) {
						if (!vm.data.hasOwnProperty("comments")) {
							vm.data.comments = [];
						}
						vm.data.comments.push({
							owner: data.owner,
							comment: vm.comment,
							created: data.created,
							timeStamp: NewIssuesService.getPrettyTime(data.created)
						});
						vm.comment = "";
						vm.numNewComments += 1; // This is used to increase the height of the comments list

						if (vm.autoSaveComment) {
							vm.autoSaveComment = false;
							vm.showInfo = true;
							vm.infoText = "Comment on issue #" + vm.data.number + " auto-saved";
							vm.infoTimeout = $timeout(function () {
								vm.showInfo = false;
							}, 4000);
						}

						// Mark previous comment as 'set' - no longer deletable or editable
						if (vm.data.comments.length > 1) {
							promise = NewIssuesService.setComment(vm.data, (vm.data.comments.length - 2));
							promise.then(function (data) {
								vm.data.comments[vm.data.comments.length - 2].set = true;
							});
						}
					});
				}
			}
		};

		vm.deleteComment = function (index) {
			promise = NewIssuesService.deleteComment(vm.data, index);
			promise.then(function (data) {
				vm.data.comments.splice(index, 1);
				vm.numNewComments -= 1; // This is used to reduce the height of the comments list
				vm.comment = "";
				vm.editingComment = false;
			});
		};

		vm.toggleEditComment = function (index) {
			vm.editingComment = !vm.editingComment;
			vm.editingCommentIndex = index;
			if (vm.editingComment) {
				vm.comment = vm.data.comments[vm.data.comments.length - 1].comment;
			}
			else {
				vm.comment = "";
			}
		};

		vm.closeIssue = function () {
			vm.onCloseIssue({issue: vm.data});
		};

		vm.hideInfo = function () {
			vm.showInfo = false;
			$timeout.cancel(vm.infoTimeout);
		};

		vm.querySearch = querySearch;

		function querySearch (query) {
			var results = query ? vm.roles.filter(createFilterFor(query)) : [];
			return results;
		}

		/**
		 * Create filter function for a query string
		 */
		function createFilterFor(query) {
			var lowercaseQuery = angular.lowercase(query);

			return function filterFn(role) {
				return (role._lowername.indexOf(lowercaseQuery) !== -1);
			};

		}
	}

	angular.module("3drepo")
		.animation(".issueComments", issueComments);

	function issueComments () {
		var height;
		return {
			addClass: function (element, className, done) {
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
			removeClass: function (element, className, done) {
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

		function link (scope, element, attrs) {
			var commentHeight = 75,
				height = "0";
			scope.$watch("numNewComments", function (newValue, oldValue) {
				if (angular.isDefined(newValue)) {
					if (newValue > oldValue) {
						height = (element[0].offsetHeight + commentHeight).toString();
					}
					else if (newValue < oldValue) {
						height = (element[0].offsetHeight - commentHeight).toString();
					}
					element.css("height", height + "px");
				}
			});
		}
	}
}());
