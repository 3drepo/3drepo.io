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

var Pin = {};

(function() {
	"use strict";

	// Constants go here
	var ORANGE_HIGHLIGHT = "1.0 0.7 0.0";
	var GREY_PIN = [0.5, 0.5, 0.5];

	var PIN_RADIUS = 0.25;
	var PIN_HEIGHT = 1.0;
	var GHOST_OPACITY = 0.4;
	var OPAQUE_OPACITY = 1.0 - GHOST_OPACITY;

	/*
	 * Pin shape constructor and manipulator
	 *
	 * @constructor
	 * @this {Pin}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 * @param {string} account - database it came from
	 * @param {string} model - name of the model
	 */
	Pin = function(id, position, norm, colours, viewpoint, account, model) {
		var self = this;

		self.id = id;

		self.highlighted = false;

		self.viewpoint = viewpoint;
		self.account = account;
		self.model = model;

		// Initialize the colours and numColours that
		// are passed in
		self.numColours = 0;

		if (typeof colours === "undefined") {
			self.numColours = 1;
			colours = [1.0, 0.0, 0.0];
		} else if (typeof colours[0] === "number") {
			self.numColours = 1;
		} else {
			self.numColours = colours.length;
		}

		self.colours = colours;

		UnityUtil.dropPin(id, position, norm, colours[0]);
		colours = colours.join(" ");
	};

	Pin.prototype.remove = function(id) {
		UnityUtil.removePin(id);
	};

	Pin.prototype.changeColour = function(colours) {
		var self = this;
		UnityUtil.changePinColour(self.id, colours[0]);
	};

	Pin.prototype.highlight = function() {
		var self = this;

		self.highlighted = !self.highlighted;

		var depthMode = self.highlighted ? "ALWAYS" : "LESS" ;
		var highlighted = self.highlighted.toString();

		self.pinHeadIsHighlighted.setAttribute("value", highlighted);
		self.ghostPinHeadIsHighlighted.setAttribute("value", highlighted);
		self.coneIsHighlighted.setAttribute("value", highlighted);
		self.ghostConeIsHighlighted.setAttribute("value", highlighted);

		self.pinHeadDepth.setAttribute("depthFunc", depthMode);
		self.coneDepth.setAttribute("depthFunc", depthMode);
	};

}());
