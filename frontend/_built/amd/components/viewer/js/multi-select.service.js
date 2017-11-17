/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the multiSelect of the GNU Affero General Public License as
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
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var MultiSelectService = /** @class */ (function () {
        function MultiSelectService(ViewerService) {
            this.ViewerService = ViewerService;
            this.keys = {
                cmdKey: 91,
                ctrlKey: 17,
                escKey: 27
            };
            this.isMac = (navigator.platform.indexOf("Mac") !== -1);
            this.multiMode = false;
        }
        MultiSelectService.prototype.handleKeysDown = function (keysDown) {
            if (this.ViewerService.pin.pinDropMode) {
                return;
            }
            if (this.isMultiSelectDown(keysDown)) {
                this.multiSelectEnabled();
            }
            else if (this.multiMode === true && this.isOtherKey(keysDown)) {
                this.multiSelectDisabled();
            }
            else if (this.isEscapeKey(keysDown)) {
                this.unhighlightAll();
            }
        };
        MultiSelectService.prototype.isMultiMode = function () {
            return this.multiMode;
        };
        MultiSelectService.prototype.multiSelectEnabled = function () {
            this.multiMode = true;
            this.ViewerService.setMultiSelectMode(true);
        };
        MultiSelectService.prototype.multiSelectDisabled = function () {
            this.multiMode = false;
            this.ViewerService.setMultiSelectMode(false);
        };
        MultiSelectService.prototype.unhighlightAll = function () {
            this.ViewerService.highlightObjects([]);
        };
        MultiSelectService.prototype.disableMultiSelect = function () {
            this.ViewerService.setMultiSelectMode(false);
        };
        MultiSelectService.prototype.isCmd = function (keysDown) {
            return this.isMac && keysDown.indexOf(this.keys.cmdKey) !== -1;
        };
        MultiSelectService.prototype.isCtrlKey = function (keysDown) {
            return !this.isMac && keysDown.indexOf(this.keys.ctrlKey) !== -1;
        };
        MultiSelectService.prototype.isMultiSelectDown = function (keysDown) {
            return this.isCmd(keysDown) || this.isCtrlKey(keysDown);
        };
        MultiSelectService.prototype.isOtherKey = function (keysDown) {
            var macOtherKey = this.isMac && keysDown.indexOf(this.keys.cmdKey) === -1;
            var otherKey = !this.isMac && keysDown.indexOf(this.keys.ctrlKey) === -1;
            return macOtherKey || otherKey;
        };
        MultiSelectService.prototype.isEscapeKey = function (keysDown) {
            keysDown.indexOf(this.keys.escKey) !== -1;
        };
        MultiSelectService.$inject = [
            "ViewerService"
        ];
        return MultiSelectService;
    }());
    exports.MultiSelectService = MultiSelectService;
    exports.MultiSelectServiceModule = angular
        .module("3drepo")
        .service("MultiSelectService", MultiSelectService);
});
