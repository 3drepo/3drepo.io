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

    function UtilsService() {
        var obj = {};

        obj.formatTimestamp = function (timestamp) {
            var date = new Date(timestamp);

            /*
            return (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
                (date.getMonth() + 1) + "-" +
                date.getFullYear() + " " +
                (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
                date.getMinutes() + "-" +
                (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
            */
            return (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
                ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
                date.getFullYear();
        };
        
        obj.snake_case = function snake_case(name, separator) {
            var SNAKE_CASE_REGEXP = /[A-Z]/g;
            separator = separator || '_';
            return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        };

        return obj;
    }
}());
