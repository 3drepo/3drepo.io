/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("tdrMeasure", measure);

    function measure() {
        return {
            restrict: "EA",
            templateUrl: "measure.html",
            scope: {},
            controller: MeasureCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    MeasureCtrl.$inject = ["$scope", "$element", "EventService"];

    function MeasureCtrl ($scope, $element, EventService) {
        var vm = this,
            coords = [null, null],
            screenPos,
            currentPickPoint;

        vm.show = false;
        vm.distance = false;

        $scope.$watch(EventService.currentEvent, function (event) {
		if (event.type === EventService.EVENT.VIEWER.PICK_POINT) {
                if (event.value.hasOwnProperty("id")) {
                    // The check against currentPickPoint is due to the PICK_POINT event being called twice
                    if (angular.isUndefined(currentPickPoint) ||
                        (!((currentPickPoint.x === event.value.position.x) &&
                           (currentPickPoint.y === event.value.position.y) &&
                           (currentPickPoint.z === event.value.position.z)))) {
                        currentPickPoint = event.value.position;
                        if (coords[0] === null) {
                            vm.show = true;
                            coords[0] = currentPickPoint;
                            vm.p1 =
                                currentPickPoint.x.toFixed(3) + ", " +
                                currentPickPoint.y.toFixed(3) + ", " +
                                currentPickPoint.z.toFixed(3);
                        }
                        else if (coords[1] === null) {
                            coords[1] = currentPickPoint;
                            vm.p2 =
                                currentPickPoint.x.toFixed(3) + ", " +
                                currentPickPoint.y.toFixed(3) + ", " +
                                currentPickPoint.z.toFixed(3);

                            vm.distance = Math.sqrt(
                                Math.pow(coords[1].x - coords[0].x, 2) +
                                Math.pow(coords[1].y - coords[0].y, 2) +
                                Math.pow(coords[1].z - coords[0].z, 2)
                            ).toFixed(3);
                        }
                        else {
                            coords[0] = currentPickPoint;
                            vm.p1 =
                                currentPickPoint.x.toFixed(3) + ", " +
                                currentPickPoint.y.toFixed(3) + ", " +
                                currentPickPoint.z.toFixed(3);
                            coords[1] = null;
                            vm.p2 = null;
                            vm.distance = false;
                        }
                    }
                    screenPos = event.value.screenPos;
                    angular.element($element[0]).css("left", (screenPos[0] + 5).toString() + "px");
                    angular.element($element[0]).css("top", (screenPos[1] + 5).toString() + "px");
                }
            }
        });
    }
}());
