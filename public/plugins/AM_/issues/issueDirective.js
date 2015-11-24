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
                commentSaved: "="
            },
            controller: IssueCtrl,
            controllerAs: "is",
            bindToController: true
        };
    }

    IssueCtrl.$inject = ["$scope", "ViewerService"];

    function IssueCtrl($scope, ViewerService) {
        var is = this;
        is.showComments = false;
        is.toggleCommentsState = false;
        is.numNewComments = 0;
        is.titleBackground = "issueTitleUnselected";

        $scope.$watch("is.commentsToggledIssueId", function (newValue) {
            if (angular.isDefined(newValue) && (newValue !== is.data._id)) {
                is.toggleCommentsState = false;
                is.showComments = false;
                is.titleBackground = "issueTitleUnselected";
            }
        });

        $scope.$watch("is.commentSaved", function (newValue) {
            if (angular.isDefined(newValue) && newValue) {
                is.clearInput = true;
            }
        });

        is.toggleComments = function () {
            if (!is.showComments) {
                is.showComments = true;
            }
            is.toggleCommentsState = !is.toggleCommentsState;
            if (is.toggleCommentsState) {
                // Set the camera position
                ViewerService.defaultViewer.setCamera(
                    is.data.viewpoint.position,
                    is.data.viewpoint.view_dir,
                    is.data.viewpoint.up
                );
            }
            is.titleBackground = is.toggleCommentsState ? "issueTitleSelected" :  "issueTitleUnselected";
            is.onCommentsToggled({issueId: is.data._id});
        };

        is.saveComment = function(text) {
            is.clearInput = false;
            is.onSaveComment({issue: is.data, text: text});
            is.numNewComments += 1; // This is used to increase the height of the comments list
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
