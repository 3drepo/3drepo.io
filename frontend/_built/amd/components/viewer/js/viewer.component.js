define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /**
     *	Copyright (C) 2014 3D Repo Ltd
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
    var ViewerController = /** @class */ (function () {
        function ViewerController($scope, $q, $element, $timeout, ClientConfigService, EventService, ViewerService) {
            var _this = this;
            this.$scope = $scope;
            this.$q = $q;
            this.$element = $element;
            this.$timeout = $timeout;
            this.ClientConfigService = ClientConfigService;
            this.EventService = EventService;
            this.ViewerService = ViewerService;
            var vm = this;
            $scope.$watch(function () {
                return ViewerService.pin;
            }, function () {
                _this.viewer.setPinDropMode(ViewerService.pin.pinDropMode);
            }, true);
            $scope.$watch(EventService.currentEvent, function (event) {
                var validEvent = event !== undefined && event.type !== undefined;
                if (validEvent && ViewerService.initialised) {
                    ViewerService.handleEvent(event, _this.account, _this.model);
                }
            });
        }
        ViewerController.prototype.$onInit = function () {
            this.branch = this.branch ? this.branch : "master";
            this.revision = this.revision ? this.revision : "head";
            this.pointerEvents = "auto";
            this.measureMode = false;
            this.viewer = this.ViewerService.getViewer();
            this.viewer.prepareViewer();
        };
        ViewerController.prototype.$onDestroy = function () {
            var _this = this;
            this.$element.on("$destroy", function () {
                _this.viewer.reset(); // Remove events watch
            });
        };
        ViewerController.$inject = [
            "$scope",
            "$q",
            "$element",
            "$timeout",
            "ClientConfigService",
            "EventService",
            "ViewerService"
        ];
        return ViewerController;
    }());
    exports.ViewerComponent = {
        bindings: {
            account: "<",
            model: "<",
            branch: "<",
            revision: "<"
        },
        controllerAs: "vm",
        controller: ViewerController
    };
    exports.ViewerComponentModule = angular
        .module('3drepo')
        .component('viewer', exports.ViewerComponent);
});
