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

    BottomButtonsCtrl.$inject = ["$scope", "EventService", "ViewerService"];

    function BottomButtonsCtrl ($scope, EventService, ViewerService) {
        var bb = this,
            defaultViewer = ViewerService.defaultViewer;
        bb.showButtons = true;

        var turntable = function () {
            defaultViewer.setNavMode("TURNTABLE");
        };

        var helicopter = function () {
            defaultViewer.setNavMode("HELICOPTER");
        };

        var walk = function () {
            defaultViewer.setNavMode("WALK");
        };

        var home = function () {
            defaultViewer.showAll();
        };

        var toggleHelp = function () {
            EventService.send(EventService.EVENT.TOGGLE_HELP);
        };

        bb.toggleFullScreen = function () {
            EventService.send(EventService.EVENT.TOGGLE_FULL_SCREEN);
            bb.showButtons = !bb.showButtons;
        };

        /*
        bb.leftButtons = [
            {label: "Walk", icon: "fa-repeat", click: blah},
            {label: "Wire frame", icon: "fa-star-half-o", click: blah},
            {label: "Orthographic", icon: "fa-cube", click: blah},
            {label: "Full screen", icon: "fa-arrows-alt", click: toggleFullScreen}
        ];
        */

        bb.leftButtons = [];
        bb.leftButtons.push({label: "Turntable", icon: "fa-mouse-pointer", click: turntable});
        bb.leftButtons.push({label: "Helicopter", icon: "fa-arrows", click: helicopter});
        bb.leftButtons.push({label: "Walk", icon: "fa-child", click: walk});

        /*
        bb.rightButtons = [
            {label: "Help", icon: "fa-question", click: toggleHelp},
            {label: "Play", icon: "fa-play", click: blah},
            {label: "QR Reader", icon: "fa-qrcode", click: blah},
            {label: "Pin", icon: "fa-map-pin", click: blah}
        ];
        */

        bb.rightButtons = [];
        bb.rightButtons.push({label: "Home", icon: "fa-home", click: home});
        bb.rightButtons.push({label: "Help", icon: "fa-question", click: toggleHelp});

        bb.showHideButtons = function () {
            bb.showButtons = !bb.showButtons;
        };
    }
}());
