/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/
define(["require", "exports", "./unity-util"], function (require, exports, unity_util_1) {
    "use strict";
    exports.__esModule = true;
    var Pin = /** @class */ (function () {
        function Pin(id, position, norm, colours, viewpoint, account, model) {
            this.id = id;
            this.highlighted = false;
            this.viewpoint = viewpoint;
            this.account = account;
            this.model = model;
            unity_util_1.UnityUtil.dropPin(id, position, norm, colours);
        }
        ;
        Pin.prototype.remove = function (id) {
            unity_util_1.UnityUtil.removePin(id);
        };
        ;
        Pin.prototype.changeColour = function (colours) {
            unity_util_1.UnityUtil.changePinColour(this.id, colours);
        };
        ;
        Pin.prototype.highlight = function () {
            this.highlighted = !this.highlighted;
            var depthMode = this.highlighted ? "ALWAYS" : "LESS";
            var highlighted = this.highlighted.toString();
            this.pinHeadIsHighlighted.setAttribute("value", highlighted);
            this.ghostPinHeadIsHighlighted.setAttribute("value", highlighted);
            this.coneIsHighlighted.setAttribute("value", highlighted);
            this.ghostConeIsHighlighted.setAttribute("value", highlighted);
            this.pinHeadDepth.setAttribute("depthFunc", depthMode);
            this.coneDepth.setAttribute("depthFunc", depthMode);
        };
        ;
        Pin.pinColours = {
            blue: [12 / 255, 47 / 255, 84 / 255],
            yellow: [255 / 255, 255 / 255, 54 / 255]
        };
        return Pin;
    }());
    exports.Pin = Pin;
});
