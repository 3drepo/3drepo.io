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
        .factory("UtilsService", UtilsService);

    UtilsService.$inject = ["$http", "$q", "serverConfig"];

    function UtilsService($http, $q, serverConfig) {
        var obj = {};

        obj.formatTimestamp = function (timestamp, showSeconds) {
            var date = new Date(timestamp),
                formatted;

            formatted = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
                        ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
                        date.getFullYear();
            
            if (angular.isDefined(showSeconds) && showSeconds) {
                formatted += " " + (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
                            (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + "-" +
                            (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
            }
            
            return formatted;
        };
        
        obj.snake_case = function snake_case(name, separator) {
            var SNAKE_CASE_REGEXP = /[A-Z]/g;
            separator = separator || '_';
            return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        };

        /**
         * Handle GET requests
         * 
         * @param url
         * @returns {*|promise}
         */
        obj.doGet = function (url) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.GET_API, url);

            $http.get(urlUse).then(
                function (response) {
                    deferred.resolve(response);
                },
                function (response) {
                    deferred.resolve(response);
                });
            return deferred.promise;
        };

        /**
         * Handle POST requests
         * @param data
         * @param url
         * @returns {*}
         */
        obj.doPost = function (data, url) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.POST_API, url),
                config = {withCredentials: true};

            $http.post(urlUse, data, config)
                .then(
                    function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.resolve(error);
                    }
                );
            return deferred.promise;
        };

        /**
         * Handle PUT requests
         * @param data
         * @param url
         * @returns {*}
         */
        obj.doPut = function (data, url) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.POST_API, url),
                config = {withCredentials: true};

            $http.put(urlUse, data, config)
                .then(
                    function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.resolve(error);
                    }
                );
            return deferred.promise;
        };

        /**
         * Handle DELETE requests
         * @param url
         * @returns {*}
         */
        obj.doDelete = function (url) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.POST_API, url),
                config = {withCredentials: true};

            $http.delete(urlUse, config)
                .then(
                    function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.resolve(error);
                    }
                );
            return deferred.promise;
        };

        return obj;
    }
}());
