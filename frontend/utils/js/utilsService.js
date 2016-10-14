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

    UtilsService.$inject = ["$http", "$q", "$mdDialog", "serverConfig"];

    function UtilsService($http, $q, $mdDialog, serverConfig) {
        var obj = {};

		/**
		 * Convert blah_test to blahTest
         *
         * @param name
         * @param separator
         * @returns {*|void|string|{REPLACE, REPLACE_NEGATIVE}|XML}
         */
        obj.snake_case = function snake_case(name, separator) {
            var SNAKE_CASE_REGEXP = /[A-Z]/g;
            separator = separator || '_';
            return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        };

		/**
         * Capitalise the first letter of a string
         * Inspired by Steve Harrison's answer - http://stackoverflow.com/a/1026087/782358
         *
         * @param string
         * @returns {string}
         */
        obj.capitalizeFirstLetter = function (string) {
            return (string.toString()).charAt(0).toUpperCase() + string.slice(1);
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
         * @param headers
         * @returns {*}
         */
        obj.doPost = function (data, url, headers) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.POST_API, url),
                config = {withCredentials: true};

            if (angular.isDefined(headers)) {
                config.headers = headers;
            }

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
         * @param data
         * @param url
         * @returns {*}
         */
        obj.doDelete = function (data, url) {
            var deferred = $q.defer(),
                config = {
                    method: "DELETE",
                    url: serverConfig.apiUrl(serverConfig.POST_API, url),
                    data: data,
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                };

            $http(config)
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
         * Show a dialog
         *
         * @param {String} dialogTemplate - required
         * @param {Object} scope - required
         * @param {Object} event
         * @param {Boolean} clickOutsideToClose
         * @param {Object} parent
         * @param {Boolean} fullscreen
         * @param {String} closeTo
         */
        obj.showDialog = function (dialogTemplate, scope, event, clickOutsideToClose, parent, fullscreen, closeTo) {
            // Allow the dialog to have cancel ability
            scope.utilsRemoveDialog = scope.utilsRemoveDialog || function () {$mdDialog.cancel();};

            // Set up and show dialog
            var data = {
                controller: function () {},
                templateUrl: dialogTemplate,
                onRemoving: function () {$mdDialog.cancel();}
            };
            data.parent = angular.element(angular.isDefined(parent) ? parent : document.body);
            data.scope = (angular.isDefined(scope)) ? scope : null;
            data.preserveScope = (data.scope !== null);
            data.targetEvent = (angular.isDefined(event)) ? event : null;
            data.clickOutsideToClose = (angular.isDefined(clickOutsideToClose)) ? clickOutsideToClose : true;
            data.fullscreen = (angular.isDefined(fullscreen)) ? fullscreen : false;
            data.closeTo = (angular.isDefined(closeTo)) ? closeTo : false;
            $mdDialog.show(data);
        };

        /**
         * close a dialog
         */
        obj.closeDialog = function () {
            $mdDialog.cancel();
        };

        obj.getServerUrl = function (url) {
            return serverConfig.apiUrl(serverConfig.GET_API, url);
        };

        return obj;
    }
}());
