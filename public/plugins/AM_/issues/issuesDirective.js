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
        .directive("issues", issues);

    function issues() {
        return {
            restrict: 'EA',
            templateUrl: 'issues.html',
            scope: {
                filterText: "=",
                height: "="
            },
            controller: IssuesCtrl,
            controllerAs: 'iss',
            bindToController: true
        };
    }

    IssuesCtrl.$inject = ["$scope", "$timeout", "EventService", "NewIssuesService", "ViewerService"];

    function IssuesCtrl($scope, $timeout, EventService, NewIssuesService, ViewerService) {
        var iss = this,
            promise = null,
            i = 0,
            length = 0;
        iss.showAdd = false;
        iss.issueAddNormalClass = "issueAddUnselectedClass";
        iss.issueAddPinClass = "issueAddUnselectedClass";
        iss.pickedPos = null;
        iss.pickedNorm = null;

        promise = NewIssuesService.getIssues();
        promise.then(function (data) {
            console.log(data);
            iss.issues = data;
        });

        iss.commentsToggled = function (issueId) {
            iss.commentsToggledIssueId = issueId;
        };

        iss.saveComment = function (issue, comment) {
            iss.commentSaved = false;
            promise = NewIssuesService.saveComment(issue, comment);
            promise.then(function (data) {
                iss.commentSaved = true;
                for (i = 0, length = iss.issues.length; i < length; i += 1) {
                    if (issue._id === iss.issues[i]._id) {
                        if (!iss.issues[i].hasOwnProperty("comments")) {
                            iss.issues[i].comments = [];
                        }
                        iss.issues[i].comments.push({
                            owner: data.owner,
                            comment: comment,
                            timeStamp: NewIssuesService.prettyTime(data.created)
                        });
                        break;
                    }
                }
            });
        };

        iss.saveIssue = function (name) {
            iss.clearInput = false;
            promise = NewIssuesService.saveIssue(name, iss.selectedObjectId, iss.pickedPos, iss.pickedNorm);
            promise.then(function (data) {
                console.log(data);
                iss.issues.push(data);
                iss.clearInput = true;
            });
        };

        iss.setupAddNormal = function () {
            iss.issueAddPinClass = "issueAddUnselectedClass";
            iss.issueAddNormalClass = (iss.issueAddNormalClass === "issueAddUnselectedClass") ? "md-accent" : "issueAddUnselectedClass";
            iss.showAdd = (iss.issueAddNormalClass === "md-accent");
            if (iss.showAdd) {
                iss.pickedPos = null;
                iss.pickedNorm = null;
            }
        };

        iss.setupAddPin = function () {
            iss.issueAddNormalClass = "issueAddUnselectedClass";
            iss.issueAddPinClass = (iss.issueAddPinClass === "issueAddUnselectedClass") ? "md-accent" : "issueAddUnselectedClass";
            if (iss.issueAddPinClass === "issueAddUnselectedClass") {
                iss.showAdd = false;
                iss.globalClickWatch();
            }
            else {
                iss.globalClickWatch = $scope.$watch(EventService.currentEvent, function (event) {
                    if (event.type === EventService.EVENT.GLOBAL_CLICK) {
                        if (event.value.target.className === "x3dom-canvas") {
                            iss.showAdd = true;

                            var dragEndX = event.value.clientX - screen.availLeft;
                            var dragEndY = event.value.clientY;

                            var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);

                            if (!pickObj.partID) {
                                iss.selectedObjectId = pickObj.pickObj._xmlNode.getAttribute("DEF");
                                console.log(iss.selectedObjectId);
                            }
                            else {
                                //iss.selectedID = scope.IssuesService.IDMap[pickObj.partID];
                            }

                            iss.pickedPos = pickObj.pickPos;
                            iss.pickedNorm = pickObj.pickNorm;
                        }
                    }
                });
            }
        };

        $(document).on("objectSelected", function(event, object, zoom) {
            iss.selectedObjectId = object.getAttribute("DEF");
        });

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                iss.selectedObjectId = $scope.IssuesService.IDMap[part.partID];
            });
        });
    }
}());
