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
            length = 0,
            normalIssueInfo = "Select an object before creating an issue",
            pinIssueInfo = "Click on an object at the required position of the pin before creating an issue";
        iss.showInput = false;
        iss.showInfo = false;
        iss.issueAddNormalClass = "issueAddUnselectedClass";
        iss.issueAddPinClass = "issueAddUnselectedClass";
        iss.pickedPos = null;
        iss.pickedNorm = null;
        iss.selectedObjectId = null;
        iss.globalClickWatch = null;

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

            if (iss.issueAddNormalClass === "md-accent") {
                iss.pickedPos = null;
                iss.pickedNorm = null;
                if (iss.selectedObjectId === null) {
                    iss.showInfo = true;
                    iss.info = normalIssueInfo;
                }
                else {
                    iss.showInput = true;
                }
            }
            else {
                iss.showInfo = false;
                iss.showInput = false;
            }
        };

        iss.setupAddPin = function (event) {
            event.stopPropagation();
            iss.issueAddNormalClass = "issueAddUnselectedClass";
            iss.issueAddPinClass = (iss.issueAddPinClass === "issueAddUnselectedClass") ? "md-accent" : "issueAddUnselectedClass";

            if (iss.issueAddPinClass === "md-accent") {
                iss.showInfo = true;
                iss.info = pinIssueInfo;
                setupGlobalClickWatch();
            }
            else {
                iss.showInfo = false;
                iss.showInput = false;
                cancelGlobalClickWatch();
                NewIssuesService.removePin();
            }
        };

        function setupGlobalClickWatch () {
            if (iss.globalClickWatch === null) {
                iss.globalClickWatch = $scope.$watch(EventService.currentEvent, function (event, oldEvent) {
                    if ((event.clientX !== oldEvent.clientX) && (event.clientY !== oldEvent.clientY)) {
                        if (event.type === EventService.EVENT.GLOBAL_CLICK) {
                            console.log(event);
                            if (event.value.target.className === "x3dom-canvas") {
                                var dragEndX = event.value.clientX - screen.availLeft;
                                var dragEndY = event.value.clientY;
                                var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);
                                console.log(pickObj);

                                if (pickObj.pickObj !== null) {
                                    iss.showInput = true;

                                    iss.selectedObjectId = pickObj.pickObj._xmlNode.getAttribute("DEF");
                                    console.log(iss.selectedObjectId);

                                    iss.pickedPos = pickObj.pickPos;
                                    iss.pickedNorm = pickObj.pickNorm;

                                    NewIssuesService.addPin({
                                        id: undefined,
                                        position: pickObj.pickPos.toGL(),
                                        norm: pickObj.pickNorm.toGL(),
                                        scale: 10.0
                                    });
                                }
                                else {
                                    NewIssuesService.removePin();
                                }
                            }
                        }
                    }
                });
            }
        }

        function cancelGlobalClickWatch () {
            if (typeof iss.globalClickWatch === "function") {
                iss.globalClickWatch();
                iss.globalClickWatch = null;
            }
        }

        $(document).on("objectSelected", function(event, object, zoom) {
            if (angular.isUndefined(object)) {
                iss.selectedObjectId = null;
                iss.showInput = false;
                if (iss.issueAddNormalClass === "md-accent") {
                    iss.showInfo = true;
                    iss.info = normalIssueInfo;
                }
                else if (iss.issueAddPinClass === "md-accent") {
                    iss.showInfo = true;
                    iss.info = pinIssueInfo;
                }
            }
            else {
                iss.selectedObjectId = object.getAttribute("DEF");
                if (iss.issueAddNormalClass === "md-accent") {
                    iss.showInfo = false;
                    iss.showInput = true;
                }
                else if (iss.issueAddPinClass === "md-accent") {
                    iss.showInfo = false;
                    iss.showInput = true;
                }
            }
            $scope.$apply();
        });

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                iss.selectedObjectId = $scope.IssuesService.IDMap[part.partID];
            });
        });
    }
}());
