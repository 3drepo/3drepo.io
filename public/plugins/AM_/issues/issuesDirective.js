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

    IssuesCtrl.$inject = ["$scope", "ViewerService", "StateManager", "serverConfig", "NewIssuesService"];

    function IssuesCtrl($scope, ViewerService, StateManager, serverConfig, NewIssuesService) {
        var iss = this,
            promise = null,
            i = 0,
            length = 0;
        iss.showAdd = false;

        promise = NewIssuesService.getIssues();
        promise.then(function (data) {
            console.log(data);
            iss.issues = data;
            iss.showAdd = true;
        });

        iss.commentsToggled = function (issueId) {
            iss.commentsToggledIssueId = issueId;
        };

        iss.saveComment = function (issue, comment) {
            console.log(issue, comment);
            promise = NewIssuesService.saveComment(issue, comment);
            promise.then(function (data) {
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
    }
}());
