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
            url = "";

        var getIssues = function () {
            deferred = $q.defer();
            url = state.account + '/' + state.project + '/issues.json';

            $http.get(serverConfig.apiUrl(url))
                .then(function(data) {
                    deferred.resolve(data.data);
                });

            return deferred.promise;
        };

        var saveComment = function (issue, text) {
            deferred = $q.defer();
            url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);

            var issueObject = {
                _id: issue._id,
                comment: text
            };

            $.ajax({
                type:	"POST",
                url:	url,
                data: {"data" : JSON.stringify(issueObject)},
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    deferred.resolve(data);
                }
            });

            return deferred.promise;
        };

        return {
            getIssues: getIssues,
            saveComment: saveComment
        };
    }
}());
