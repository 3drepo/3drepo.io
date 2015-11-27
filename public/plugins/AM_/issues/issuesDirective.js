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
                height: "=",
                showAdd: "=",
                options: "=",
                selectedOption: "="
            },
            controller: IssuesCtrl,
            controllerAs: 'iss',
            bindToController: true
        };
    }

    IssuesCtrl.$inject = ["$scope", "$element", "$mdDialog", "EventService", "NewIssuesService", "ViewerService"];

    function IssuesCtrl($scope, $element, $mdDialog, EventService, NewIssuesService, ViewerService) {
        var iss = this,
            promise = null,
            i = 0,
            j = 0,
            length = 0,
            sortedIssuesLength;
        iss.pickedPos = null;
        iss.pickedNorm = null;
        iss.selectedObjectId = null;
        iss.globalClickWatch = null;
        iss.saveIssueDisabled = true;

        promise = NewIssuesService.getIssues();
        promise.then(function (data) {
            console.log(data);
            iss.issues = data;
            iss.sortedIssues = iss.issues;
        });

        $scope.$watch("iss.showAdd", function (newValue) {
            if (newValue) {
                setupGlobalClickWatch();
            }
            else {
                cancelGlobalClickWatch();
                NewIssuesService.removePin();
            }
        });

        $scope.$watch("iss.title", function (newValue) {
            if (angular.isDefined(newValue)) {
                iss.saveIssueDisabled = (newValue === "");
            }
        });

        $scope.$watch("iss.selectedOption", function (newValue) {
            if (angular.isDefined(newValue)) {
                console.log(newValue);
                iss.sortedIssues = [iss.issues[0]];
                if (newValue.value === "sortByDate") {
                    for (i = 1, length = iss.issues.length; i < length; i += 1) {
                        for (j = 0, sortedIssuesLength = iss.sortedIssues.length; j < sortedIssuesLength; j += 1) {
                            if (iss.issues[i].created > iss.sortedIssues[j].created) {
                                iss.sortedIssues.splice(j, 0, iss.issues[i]);
                                break;
                            }
                            else if (j === (iss.sortedIssues.length - 1)) {
                                iss.sortedIssues.push(iss.issues[i]);
                            }
                        }
                    }
                }
                //iss.sortedIssues = iss.issues;
            }
        });

        iss.commentsToggled = function (issueId) {
            iss.commentsToggledIssueId = issueId;
        };

        iss.saveComment = function (issue, comment) {
            iss.commentSaved = false;
            promise = NewIssuesService.saveComment(issue, comment);
            promise.then(function (data) {
                console.log(data);
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

        iss.saveIssue = function () {
            if (angular.isDefined(iss.title) && (iss.title !== "")) {
                if (iss.pickedPos === null) {
                    iss.showAlert();
                }
                else {
                    promise = NewIssuesService.saveIssue(iss.title, iss.selectedObjectId, iss.pickedPos, iss.pickedNorm);
                    promise.then(function (data) {
                        console.log(data);
                        iss.issues.push(data);
                        iss.title = "";
                        iss.pickedPos = null;
                        iss.pickedNorm = null;
                        if (angular.isDefined(iss.comment) && (iss.comment !== "")) {
                            iss.saveComment(data, iss.comment);
                            iss.comment = "";
                        }
                    });
                }
            }
        };

        function setupGlobalClickWatch () {
            if (iss.globalClickWatch === null) {
                iss.globalClickWatch = $scope.$watch(EventService.currentEvent, function (event, oldEvent) {
                    if ((event.type === EventService.EVENT.GLOBAL_CLICK) &&
                        (event.value.target.className === "x3dom-canvas") &&
                        (!((event.value.clientX === oldEvent.value.clientX) &&
                           (event.value.clientY === oldEvent.value.clientY)))) {

                        var dragEndX = event.value.clientX - screen.availLeft;
                        var dragEndY = event.value.clientY;
                        var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);
                        if (pickObj.pickObj !== null) {
                            iss.showInput = true;
                            iss.selectedObjectId = pickObj.pickObj._xmlNode.getAttribute("DEF");
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
                iss.pickedPos = null;
                iss.pickedNorm = null;
                NewIssuesService.removePin();
            }
            else {
                iss.selectedObjectId = object.getAttribute("DEF");
            }
        });

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                iss.selectedObjectId = $scope.IssuesService.IDMap[part.partID];
            });
        });

        iss.showAlert = function() {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element($element[0].querySelector("#issuesAddContainer")))
                    .clickOutsideToClose(true)
                    .title("Add a pin before saving")
                    .ariaLabel("Pin alert")
                    .ok("OK")
            );
        };
    }
}());
