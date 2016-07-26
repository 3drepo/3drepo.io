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
        .directive("projectSetting", projectSetting);

    function projectSetting() {
        return {
            restrict: "E",
            scope: {
                account: "=",
                project: "=",
                lat: "=",
                lon: "=",
                y: "=",
                seaLevel: "=",
                unit: "="
            },
            templateUrl: "projectSetting.html",
            controller: ProjectSettingCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    ProjectSettingCtrl.$inject = ["$scope", "$window", "UtilsService", "EventService"];

    function ProjectSettingCtrl ($scope, $window, UtilsService, EventService) {

        var vm = this;
        
        /*
         * Init
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if (event.type === EventService.EVENT.PROJECT_SETTINGS_READY) {
                if (event.value.account === vm.account && event.value.project === vm.project) {
                    v.viewer.updateSettings(event.value.settings);
                    v.mapTile.updateSettings(event.value.settings);
                }
            }
        })


    }
    
}());
