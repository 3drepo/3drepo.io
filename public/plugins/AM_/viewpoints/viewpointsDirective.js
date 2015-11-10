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
                filterText: "="
            },
            controller: ViewpointsCtrl,
            controllerAs: 'vp',
            bindToController: true
        };
    }

    ViewpointsCtrl.$inject = ["$scope", "ViewerService", "StateManager", "serverConfig"];

    function ViewpointsCtrl($scope, ViewerService, StateManager, serverConfig) {
        var vp = this;
        vp.viewpoints = [];
        vp.inputState = false;
        console.log(ViewerService.defaultViewer.viewpoints);

        $scope.$watch("vp.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                vp.filterText = newValue;
            }
        });

        vp.toggleInputState = function () {
            vp.inputState = !vp.inputState;
        };

        vp.saveViewpoint = function () {
            var url = "",
                state = StateManager.state,
                viewpoint = ViewerService.defaultViewer.getCurrentViewpointInfo();

            if (angular.isDefined(vp.viewpointName) && (vp.viewpointName !== "")) {
                var rootTrans = $("#model__root")[0]._x3domNode.getCurrentTransform().inverse();
                viewpoint.name = vp.viewpointName;
                url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + state.branch + "/viewpoint");
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {"data" : JSON.stringify(viewpoint)},
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        console.log("Success: " + data);
                        vp.viewpoints.push({name: vp.viewpointName});
                    }
                });
            }
        };
    }
}());
