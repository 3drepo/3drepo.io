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
        .directive("panelContentAdd", panelContentAdd);

    function panelContentAdd() {
        return {
            restrict: 'E',
            templateUrl: 'panelContentAdd.html',
            scope: {
                placeholder: "@",
                onSave: "&"
            },
            controller: PanelContentAddCtrl,
            controllerAs: 'pca',
            bindToController: true
        };
    }

    PanelContentAddCtrl.$inject = ["$scope"];

    function PanelContentAddCtrl($scope) {
        var pca = this;
        pca.showInput = false;

        pca.toggleInput = function () {
            pca.showInput = !pca.showInput;
        };

        pca.save = function () {
            if (angular.isDefined(pca.text) && (pca.text !== "")) {
                pca.onSave({text: pca.text});
            }
        };
    }
}());
