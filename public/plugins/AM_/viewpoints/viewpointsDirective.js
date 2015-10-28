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
            scope: {},
            controller: viewpointsCtrl,
            controllerAs: 'vp',
            bindToController: true
        };
    }

    viewpointsCtrl.$inject = ["$scope", "EventService"];

    function viewpointsCtrl($scope, EventService) {
        var vp = this;

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.FILTER) {
                vp.filterText = event.value;
            }
        });
    }
}());
