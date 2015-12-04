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
            showClosed = false;
        vm.pickedAccount = null;
        vm.pickedProject = null;
        vm.pickedPos = null;
        vm.pickedNorm = null;
        vm.pickedTrans = null;
        vm.selectedObjectId = null;
        vm.globalClickWatch = null;
        vm.saveIssueDisabled = true;

        promise = NewIssuesService.getIssues();
        promise.then(function (data) {
            vm.issues = data;
            setupIssuesToShow();
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

        function setupIssuesToShow () {
            if (angular.isDefined(vm.issues)) {
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

                // Filter
                if (vm.filterText !== "") {
                    vm.issuesToShow = ($filter('filter')(vm.issuesToShow, {name: vm.filterText}));
                }

                // Closed
                if (!showClosed) {
                    for (i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
                        if (vm.issuesToShow[i].hasOwnProperty("closed")) {
                            vm.issuesToShow.splice(i, 1);
                        }
                    }
                }
            }
        }

        $scope.$watch("vm.selectedOption", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue.value === "sortByDate") {
                    sortOldestFirst = !sortOldestFirst;
                }
                else if (newValue.value === "showClosed") {
                    showClosed = !showClosed;
                }
                setupIssuesToShow();
            }
        });

        $scope.$watch("vm.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                setupIssuesToShow();
            }
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

        vm.deleteComment = function (issue, commentIndex) {
            console.log(issue, commentIndex);
        };

        vm.saveIssue = function () {
            if (angular.isDefined(vm.title) && (vm.title !== "")) {
                if (vm.pickedPos === null) {
                    vm.showAlert();
                }
                else {
                    promise = NewIssuesService.saveIssue(vm.pickedAccount, vm.pickedProject, vm.title, vm.selectedObjectId, vm.pickedPos, vm.pickedNorm);
                    promise.then(function (data) {
                        console.log(data);
                        vm.issues.push(data);
                        vm.title = "";
                        vm.pickedAccount = null;
                        vm.pickedProject = null;
                        vm.pickedTrans   = null;
                        vm.pickedPos = null;
                        vm.pickedNorm = null;
                        if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
                            vm.saveComment(data, vm.comment);
                            vm.comment = "";
                        }
                        setupIssuesToShow();
                    });
                }
            }
        };

        vm.closeIssue = function (issue) {
            vm.commentSaved = false;
            promise = NewIssuesService.closeIssue(issue);
            promise.then(function (data) {
                console.log(data);
                for (i = 0, length = vm.issues.length; i < length; i += 1) {
                    if (issue._id === vm.issues[i]._id) {
                        vm.issues[i].closed = data.closed;
                        vm.issues[i].closed_time = data.created; // TODO: Shouldn't really use the created value
                        break;
                    }
                }
                setupIssuesToShow();
            });
        };

        function setupGlobalClickWatch () {
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
                                vm.pickedTrans   = $("#" + vm.pickedAccount + "__" + vm.pickedProject + "__root")[0]._x3domNode.getCurrentTransform();
                            }

                            vm.pickedNorm = vm.pickedTrans.transpose().multMatrixVec(pickObj.pickNorm);
                            vm.pickedPos = vm.pickedTrans.inverse().multMatrixVec(pickObj.pickPos);

                            NewIssuesService.addPin({
                                id: undefined,
                                account: vm.pickedAccount,
                                project: vm.pickedProject,
                                position: pickObj.pickPos.toGL(),
                                norm: pickObj.pickNorm.toGL()
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

        /*
        $(document).on("objectSelected", function(event, object, zoom) {
            if (angular.isUndefined(object)) {
                vm.selectedObjectId = null;
                vm.pickedPos = null;
                vm.pickedNorm = null;
                NewIssuesService.removePin();
            }
            else {
                if (object["multipart"])
                {
                    var projectParts = object.id.split("__");

                    if (projectParts[0] === "model")
                    {
                        vm.pickedAccount = NewIssuesService.state.account;
                        vm.pickedProject = NewIssuesService.state.project;
                        vm.pickedTrans   = $("#model__root")[0]._x3domNode.getCurrentTransform();
                    } else {
                        vm.pickedAccount = projectParts[0];
                        vm.pickedProject = projectParts[1];
                        vm.pickedTrans   = $("#" + vm.pickedAccount + "__" + vm.pickedProject + "__root")[0]._x3domNode.getCurrentTransform();
                    }

                    vm.selectedObjectId = projectParts[projectParts.length - 1];
                } else {
                    vm.selectedObjectId = object.getAttribute("DEF");
                }
            }
        });
        */

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                var projectParts = part.part.multiPart._xmlNode.id.split("__");

                if (projectParts[0] === "model")
                {
                    vm.pickedAccount = $scope.IssuesService.state.account;
                    vm.pickedProject = $scope.IssuesService.state.project;
                    vm.pickedTrans   = $("#model__root")[0]._x3domNode.getCurrentTransform();
                } else {
                    vm.pickedAccount = projectParts[0];
                    vm.pickedProject = projectParts[1];
                    vm.pickedTrans   = $("#" + scope.pickedAccount + "__" + scope.pickedProject + "__root")[0]._x3domNode.getCurrentTransform();
                }

                vm.selectedObjectId = projectParts[projectParts.length - 1];
            });
        });

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
            var issueId = clickInfo.object ? clickInfo.object["id"] : null;
            
            vm.commentsToggled(issueId);
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
