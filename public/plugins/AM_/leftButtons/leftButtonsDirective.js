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
        .directive("leftButtons", leftButtons);

    function leftButtons() {
        return {
            restrict: 'E',
            templateUrl: 'leftButtons.html',
            scope: {},
            controller: LeftButtonsCtrl,
            controllerAs: 'lb',
            bindToController: true
        };
    }

    LeftButtonsCtrl.$inject = ["EventService"];

    function LeftButtonsCtrl(EventService) {
        var lb = this;

        lb.buttons = [
            {label: "1", content: ["tree", "viewpoints"]},
            {label: "2", content: ["meta", "pdf"]}
        ];

        lb.click = function (index) {
            EventService.send(EventService.EVENT.LEFT_BUTTON_CLICK, lb.buttons[index].content);
        }
    }
}());
