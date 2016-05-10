/**
 *  Copyright (C) 2016 3D Repo Ltd
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
        .factory("RegisterVerifyService", RegisterVerifyService);

    RegisterVerifyService.$inject = ["$http", "$q", "serverConfig"];

    function RegisterVerifyService($http, $q, serverConfig) {
        var obj = {};

        /**
         * Handle POST requests
         * @param data
         * @param urlEnd
         * @returns {*}
         */
        function doPost(data, urlEnd) {
            var deferred = $q.defer(),
                url = serverConfig.apiUrl(urlEnd),
                config = {withCredentials: true};

            $http.post(url, data, config)
                .then(function (response) {
                    deferred.resolve(response);
                });
            return deferred.promise;
        }

        obj.verify = function (username, data) {
            return doPost(data, username + "/verify");
        };

        return obj;
    }
}());