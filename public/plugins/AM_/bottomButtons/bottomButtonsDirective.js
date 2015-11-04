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
        .directive("bottomButtons", bottomButtons);

    function bottomButtons () {
        return {
            restrict: 'E',
            templateUrl: 'bottomButtons.html',
            scope: {},
            controller: BottomButtonsCtrl,
            controllerAs: 'bb',
            bindToController: true
        };
    }

    BottomButtonsCtrl.$inject = ["$scope", "EventService"];

    function BottomButtonsCtrl ($scope, EventService) {
        var bb = this;
        bb.showButtons = false;

        function blah () {
            console.log("blah");
        }

        bb.leftButtons = [
            {label: "Walk", icon: "fa-repeat", callback: blah},
            {label: "Wire frame", icon: "fa-star-half-o", callback: blah},
            {label: "Orthographic", icon: "fa-cube", callback: blah},
            {label: "Full screen", icon: "fa-arrows-alt", callback: blah}
        ];
        bb.rightButtons = [
            {label: "Help", icon: "fa-question", callback: "bb.showHelp()"},
            {label: "Play", icon: "fa-play", callback: blah},
            {label: "QR Reader", icon: "fa-qrcode", callback: blah},
            {label: "Pin", icon: "fa-map-pin", callback: blah}
        ];

        bb.showHideButtons = function () {
            bb.showButtons = !bb.showButtons;
        };
    }
}());
