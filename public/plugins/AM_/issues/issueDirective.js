/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
                onSaveComment : "&",
                commentSaved: "=",
                onDeleteComment : "&",
                commentDeleted: "=",
                onCloseIssue : "&",
                issueClosed: "="
            },
            controller: IssueCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    IssueCtrl.$inject = ["$scope", "ViewerService"];

    function IssueCtrl($scope, ViewerService) {
        var vm = this,
            i = 0,
            length = 0,
            currentTime = 0,
            thirtyMinutes = 3600000;
        vm.showComments = false;
        vm.toggleCommentsState = false;
        vm.numNewComments = 0;
        vm.saveCommentDisabled = true;
        vm.backgroundClass = "issueClosedBackground";

        $scope.$watch("vm.commentsToggledIssueId", function (newValue) {
            if (angular.isDefined(newValue) && (newValue !== vm.data._id)) {
                vm.toggleCommentsState = false;
                vm.showComments = false;
            }
        });

        $scope.$watch("vm.commentSaved", function (newValue) {
            if (angular.isDefined(newValue) && newValue) {
                vm.comment = "";
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
                    currentTime = new Date();
                    for (i = 0, length = newValue.comments.length; i < length; i += 1) {
                        newValue.comments[i].canDelete =
                            (i === (newValue.comments.length - 1) &&
                            (currentTime.getTime() - newValue.comments[i].created) < thirtyMinutes);
                    }
                }
            }
        }, true);

        vm.toggleComments = function () {
            if (!vm.showComments) {
                vm.showComments = true;
            }
            vm.toggleCommentsState = !vm.toggleCommentsState;
            if (vm.toggleCommentsState) {
                // Set the camera position
                ViewerService.defaultViewer.setCamera(
                    vm.data.viewpoint.position,
                    vm.data.viewpoint.view_dir,
                    vm.data.viewpoint.up
                );
            }
            vm.onCommentsToggled({issueId: vm.data._id});
        };

        vm.saveComment = function () {
            if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
                vm.onSaveComment({issue: vm.data, text: vm.comment});
                vm.numNewComments += 1; // This is used to increase the height of the comments list
            }
        };

        vm.deleteComment = function (index) {
            vm.onDeleteComment({issue: vm.data, commentIndex: index});
            vm.numNewComments -= 1; // This is used to decrease the height of the comments list
        };

        vm.closeIssue = function () {
            vm.onCloseIssue({issue: vm.data});
        };
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
            var commentHeight = 75;
            scope.$watch("numNewComments", function (newValue) {
                if (angular.isDefined(newValue) && (newValue !== 0)) {
                    element.css("height", (element[0].offsetHeight + commentHeight).toString() + "px");
                }
            });
        }
    }
}());
