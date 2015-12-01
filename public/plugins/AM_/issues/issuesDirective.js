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
            controllerAs: 'vm',
            bindToController: true
        };
    }

    IssuesCtrl.$inject = ["$scope", "$element", "$mdDialog", "$filter", "EventService", "NewIssuesService", "ViewerService"];

    function IssuesCtrl($scope, $element, $mdDialog, $filter, EventService, NewIssuesService, ViewerService) {
        var vm = this,
            promise = null,
            i = 0,
            j = 0,
            length = 0,
            sortedIssuesLength,
            sortOldestFirst = true,
            sortAFirst = false;
        vm.pickedPos = null;
        vm.pickedNorm = null;
        vm.selectedObjectId = null;
        vm.globalClickWatch = null;
        vm.saveIssueDisabled = true;

        promise = NewIssuesService.getIssues();
        promise.then(function (data) {
            vm.issues = data;
            vm.sortedIssues = vm.issues;
            vm.sortedFilteredIssues = vm.issues;
            sortIssues();
        });

        $scope.$watch("vm.showAdd", function (newValue) {
            if (newValue) {
                setupGlobalClickWatch();
            }
            else {
                cancelGlobalClickWatch();
                NewIssuesService.removePin();
            }
        });

        $scope.$watch("vm.title", function (newValue) {
            if (angular.isDefined(newValue)) {
                vm.saveIssueDisabled = (newValue === "");
            }
        });

        function filterIssues () {
            if (angular.isDefined(vm.filterText)) {
                if (vm.filterText === "") {
                    vm.sortedFilteredIssues = vm.sortedIssues;
                }
                else {
                    vm.sortedFilteredIssues = ($filter('filter')(vm.sortedIssues, {name: vm.filterText}));
                }
            }
        }

        function sortIssues () {
            vm.sortedIssues = [vm.issues[0]];
            for (i = 1, length = vm.issues.length; i < length; i += 1) {
                for (j = 0, sortedIssuesLength = vm.sortedIssues.length; j < sortedIssuesLength; j += 1) {
                    if (((vm.issues[i].created > vm.sortedIssues[j].created) && (sortOldestFirst)) ||
                        ((vm.issues[i].created < vm.sortedIssues[j].created) && (!sortOldestFirst))) {
                        vm.sortedIssues.splice(j, 0, vm.issues[i]);
                        break;
                    }
                    else if (j === (vm.sortedIssues.length - 1)) {
                        vm.sortedIssues.push(vm.issues[i]);
                    }
                }
            }
            filterIssues();
        }

        $scope.$watch("vm.selectedOption", function (newValue) {
            if (angular.isDefined(newValue)) {
                console.log(newValue);
                if (newValue.value === "sortByDate") {
                    sortOldestFirst = !sortOldestFirst;
                    sortIssues();
                }
            }
        });

        $scope.$watch("vm.filterText", function (newValue) {
            filterIssues(newValue);
        });

        vm.commentsToggled = function (issueId) {
            vm.commentsToggledIssueId = issueId;
        };

        vm.saveComment = function (issue, comment) {
            vm.commentSaved = false;
            promise = NewIssuesService.saveComment(issue, comment);
            promise.then(function (data) {
                console.log(data);
                vm.commentSaved = true;
                for (i = 0, length = vm.issues.length; i < length; i += 1) {
                    if (issue._id === vm.issues[i]._id) {
                        if (!vm.issues[i].hasOwnProperty("comments")) {
                            vm.issues[i].comments = [];
                        }
                        vm.issues[i].comments.push({
                            owner: data.owner,
                            comment: comment,
                            timeStamp: NewIssuesService.prettyTime(data.created)
                        });
                        break;
                    }
                }
            });
        };

        vm.saveIssue = function () {
            if (angular.isDefined(vm.title) && (vm.title !== "")) {
                if (vm.pickedPos === null) {
                    vm.showAlert();
                }
                else {
                    promise = NewIssuesService.saveIssue(vm.title, vm.selectedObjectId, vm.pickedPos, vm.pickedNorm);
                    promise.then(function (data) {
                        console.log(data);
                        vm.issues.push(data);
                        vm.title = "";
                        vm.pickedPos = null;
                        vm.pickedNorm = null;
                        if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
                            vm.saveComment(data, vm.comment);
                            vm.comment = "";
                        }
                        sortIssues();
                    });
                }
            }
        };

        function setupGlobalClickWatch () {
            if (vm.globalClickWatch === null) {
                vm.globalClickWatch = $scope.$watch(EventService.currentEvent, function (event, oldEvent) {
                    if ((event.type === EventService.EVENT.GLOBAL_CLICK) &&
                        (event.value.target.className === "x3dom-canvas") &&
                        (!((event.value.clientX === oldEvent.value.clientX) &&
                           (event.value.clientY === oldEvent.value.clientY)))) {

                        var dragEndX = event.value.clientX - screen.availLeft;
                        var dragEndY = event.value.clientY;
                        var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);
                        if (pickObj.pickObj !== null) {
                            vm.showInput = true;
                            vm.selectedObjectId = pickObj.pickObj._xmlNode.getAttribute("DEF");
                            vm.pickedPos = pickObj.pickPos;
                            vm.pickedNorm = pickObj.pickNorm;

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
            if (typeof vm.globalClickWatch === "function") {
                vm.globalClickWatch();
                vm.globalClickWatch = null;
            }
        }

        $(document).on("objectSelected", function(event, object, zoom) {
            if (angular.isUndefined(object)) {
                vm.selectedObjectId = null;
                vm.pickedPos = null;
                vm.pickedNorm = null;
                NewIssuesService.removePin();
            }
            else {
                vm.selectedObjectId = object.getAttribute("DEF");
            }
        });

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                vm.selectedObjectId = $scope.IssuesService.IDMap[part.partID];
            });
        });

        vm.showAlert = function() {
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
