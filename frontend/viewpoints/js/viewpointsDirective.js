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
        .directive("viewpoints", viewpoints);

    function viewpoints() {
        return {
            restrict: 'EA',
            templateUrl: 'viewpoints.html',
            scope: {
                filterText: "=",
                height: "="
            },
            controller: ViewpointsCtrl,
            controllerAs: 'vp',
            bindToController: true
        };
    }

    ViewpointsCtrl.$inject = ["$scope"];

    function ViewpointsCtrl($scope) {
        var vp = this,
            defaultViewer = null, //ViewerService.defaultViewer,
            currentViewpointInfo = {};
        vp.viewpoints = [];
        vp.inputState = false;
        vp.clearInput = false;

        $scope.$watch("vp.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                vp.filterText = newValue;
            }
        });

        vp.toggleInputState = function () {
            vp.inputState = !vp.inputState;
        };

        vp.saveViewpoint = function (text) {
            console.log(text);
            vp.clearInput = true;
            /*
            currentViewpointInfo = defaultViewer.getCurrentViewpointInfo();
            console.log(currentViewpointInfo);
            defaultViewer.createViewpoint(
                "test__" + text,
                currentViewpointInfo.position,
                currentViewpointInfo.look_at,
                currentViewpointInfo.up
            );
            console.log(defaultViewer.viewpoints);
            vp.viewpoints.push(text);
            */
        };

        vp.selectViewpoint = function (index) {
            console.log("test__" + vp.viewpoints[index]);
            defaultViewer.setCurrentViewpoint("test__" + vp.viewpoints[index]);
        };
    }
}());
