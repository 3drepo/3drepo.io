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
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ClipCtrl.$inject = ["$scope", "$timeout", "ViewerService"];

    function ClipCtrl($scope, $timeout, ViewerService) {
        var vm = this,
            clipPlane = null;
        vm.sliderMin = 0;
        vm.sliderMax = 100;
        vm.sliderStep = 0.1;
        vm.sliderPosition = vm.sliderMin;
        vm.clipPlane = null;
        vm.axes = ["X", "Y", "Z"];
        vm.selectedAxis = vm.axes[0];

        function initClippingPlane () {
            $timeout(function () {
                vm.clipPlaneID = ViewerService.defaultViewer.addClippingPlane(vm.selectedAxis);
                clipPlane = ViewerService.defaultViewer.getClippingPlane(vm.clipPlaneID);
                moveClippingPlane(vm.sliderPosition);
            });
        }

        function moveClippingPlane(sliderPosition) {
            clipPlane.movePlane((vm.sliderMax - sliderPosition) / vm.sliderMax);
        }

        $scope.$watch("vm.show", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue) {
                    initClippingPlane();
                }
                else {
                    vm.clipPlane = null;
                    ViewerService.defaultViewer.clearClippingPlanes();
                }
            }
        });

        $scope.$watch("vm.selectedAxis", function (newValue) {
            if ((angular.isDefined(newValue) && clipPlane)) {
                // Swap Y and Z axes
                if (newValue === "Y") {
                    clipPlane.changeAxis("Z");
                }
                else if (newValue === "Z") {
                    clipPlane.changeAxis("Y");
                }
                else {
                    clipPlane.changeAxis(newValue);
                }
                vm.sliderPosition = vm.sliderMin;
            }
        });

        $scope.$watch("vm.sliderPosition", function (newValue) {
            if (clipPlane) {
                moveClippingPlane(newValue);
            }
        });
    }
}());
