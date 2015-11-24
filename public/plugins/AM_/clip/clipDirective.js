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
        .directive("clip", clip);

    function clip() {
        return {
            restrict: 'EA',
            templateUrl: 'clip.html',
            scope: {
                height: "=",
                show: "="
            },
            controller: ClipCtrl,
            controllerAs: 'cl',
            bindToController: true
        };
    }

    ClipCtrl.$inject = ["$scope", "$timeout", "ViewerService"];

    function ClipCtrl($scope, $timeout, ViewerService) {
        var cl = this,
            clipPlane = null;
        cl.sliderMin = 0;
        cl.sliderMax = 100;
        cl.sliderStep = 0.1;
        cl.sliderPosition = cl.sliderMin;
        cl.clipPlane = null;
        cl.axes = ["X", "Y", "Z"];
        cl.selectedAxis = cl.axes[0];

        function initClippingPlane () {
            $timeout(function () {
                cl.clipPlaneID = ViewerService.defaultViewer.addClippingPlane(cl.selectedAxis);
                clipPlane = ViewerService.defaultViewer.getClippingPlane(cl.clipPlaneID);
                moveClippingPlane(cl.sliderPosition);
            });
        }

        function moveClippingPlane(sliderPosition) {
            clipPlane.movePlane((cl.sliderMax - sliderPosition) / cl.sliderMax);
        }

        $scope.$watch("cl.show", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue) {
                    initClippingPlane();
                }
                else {
                    cl.clipPlane = null;
                    ViewerService.defaultViewer.clearClippingPlanes();
                }
            }
        });

        $scope.$watch("cl.selectedAxis", function (newValue) {
            if ((angular.isDefined(newValue) && clipPlane)) {
                clipPlane.changeAxis(newValue);
                cl.sliderPosition = cl.sliderMin;
            }
        });

        $scope.$watch("cl.sliderPosition", function (newValue) {
            if (clipPlane) {
                moveClippingPlane(newValue);
            }
        });
    }
}());
