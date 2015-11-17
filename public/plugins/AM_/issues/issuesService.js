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

    angular.module('3drepo')
        .factory('NewIssuesService', NewIssuesService);

    NewIssuesService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

    function NewIssuesService($http, $q, StateManager, serverConfig) {
        var state = StateManager.state,
            deferred = null,
            url = "",
            data = {},
            config = {},
            i, j = 0,
            numIssues = 0, numComments = 0,
            date = null;

        var prettyTime = function(time) {
            var date = new Date(time);
            return (
                date.getFullYear() + "-" +
                (date.getMonth() + 1) + "-" +
                date.getDate() + " " +
                date.getHours() + ":" +
                date.getMinutes()
            );
        };

        var getIssues = function () {
            deferred = $q.defer();
            url = serverConfig.apiUrl(state.account + '/' + state.project + '/issues.json');

            $http.get(url)
                .then(function(data) {
                    deferred.resolve(data.data);
                    // Convert created field to displayable time stamp
                    // Issue
                    for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
                        data.data[i].timeStamp = prettyTime(data.data[i].created);
                        // Comments
                        if (data.data[i].hasOwnProperty("comments")) {
                            for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
                                if (data.data[i].comments[j].hasOwnProperty("created")) {
                                    data.data[i].comments[j].timeStamp = prettyTime(data.data[i].comments[j].created);
                                }
                            }
                        }
                    }
                });

            return deferred.promise;
        };

        var saveComment = function (issue, comment) {
            deferred = $q.defer();
            url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);
            data = {
                data: JSON.stringify({
                    _id: issue._id,
                    comment: comment,
                    number: issue.number
                })
            };
            config = {
                withCredentials: true
            };

            $http.post(url, data, config)
                .then(function successCallback(response) {
                    deferred.resolve(response.data);
                });

            return deferred.promise;
        };

        return {
            prettyTime: prettyTime,
            getIssues: getIssues,
            saveComment: saveComment
        };
    }
}());
