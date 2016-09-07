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

var ViewerUtil;
var ViewerUtilListeners = {};
var ViewerUtilMyListeners = {};

(function() {
	"use strict";

	ViewerUtil = function() {};

	var eventElement = document;

	ViewerUtil.prototype.cloneObject = function(obj)
	{
    	if (!obj || typeof obj !== 'object') {
        	return obj;
    	}

		var retObject = new obj.constructor();

		for (var key in obj) {
			if (obj.hasOwnProperty(key))
			{
				retObject[key] = this.cloneObject(obj[key]);
			}
		}

    	return retObject;
	};

	// Definition of global functions
	ViewerUtil.prototype.triggerEvent = function(name, event)
	{
		var e = new CustomEvent(name, { detail: event });
        //console.log("TRIG: " + name);
		eventElement.dispatchEvent(e);
	};


	ViewerUtil.prototype.onEvent = function(name, callback)
	{
		if (!ViewerUtilListeners.hasOwnProperty(name))
		{
			ViewerUtilListeners[name] = [];
			ViewerUtilMyListeners[name] = [];
		}

		ViewerUtilListeners[name].push(callback);

		var myListener= function(event) {
			callback(event.detail);
		};

		ViewerUtilMyListeners[name].push(myListener);

		eventElement.addEventListener(name, myListener);
	};

	ViewerUtil.prototype.offEvent = function(name, callback)
	{
		var index = ViewerUtilListeners[name].indexOf(callback);
		if (index === -1){
			return;
		}

		eventElement.removeEventListener(name, ViewerUtilMyListeners[name][index]);

		ViewerUtilListeners[name].splice(index, 1);
		ViewerUtilMyListeners[name].splice(index, 1);

	};

	ViewerUtil.prototype.offEventAll = function()
	{
		for(var eventType in ViewerUtilMyListeners)
		{
			for(var i = 0; i < ViewerUtilMyListeners[eventType].length; i++)
			{
				eventElement.removeEventListener(eventType, ViewerUtilMyListeners[eventType][i]);
			}
		}

		ViewerUtilListeners   = {};
		ViewerUtilMyListeners = {};
	};

	ViewerUtil.prototype.eventFactory = function(name)
	{
		var self = this;
		return function(event) { self.triggerEvent(name, event); };
	};

	ViewerUtil.prototype.getAxisAngle = function(from, at, up) {
		var x3dfrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var x3dat = new x3dom.fields.SFVec3f(at[0], at[1], at[2]);
		var x3dup = new x3dom.fields.SFVec3f(up[0], up[1], up[2]);

		var viewMat = x3dom.fields.SFMatrix4f.lookAt(x3dfrom, x3dat, x3dup).inverse();

		var q = new x3dom.fields.Quaternion(0.0, 0.0, 0.0, 1.0);
		q.setValue(viewMat);

		q = q.toAxisAngle();

		return Array.prototype.concat(q[0].toGL(), q[1]);
	};

	ViewerUtil.prototype.quatLookAt = function (up, forward)
	{
		forward.normalize();
		up.normalize();

		var right = forward.cross(up);
		up = right.cross(forward);

		var w = Math.sqrt(1 + right.x + up.y + forward.z) * 0.5;
		var recip = 1 / (4 * w);
		var x = (forward.y - up.z) * recip;
		var y = (right.z - forward.y) * recip;
		var z = (up.x - right.y) * recip;

		return new x3dom.fields.Quarternion(x,y,z,w);
	};

	ViewerUtil.prototype.rotationBetween = function(prevUp, prevView, currUp, currView)
	{
		/*
		prevView = this.normalize(prevView);
		currView = this.normalize(currView);

		var prevRight = this.normalize(this.crossProduct(prevUp, prevView));
		var currRight = this.normalize(this.crossProduct(currUp, currView));

		prevUp = this.normalize(this.crossProduct(prevRight, prevView));
		currUp = this.crossProduct(currRight, currView);

		var prevMat = new x3dom.fields.SFMatrix4f();
		*/

		var x3domPrevView = new x3dom.fields.SFVec3f(prevView[0], prevView[1], prevView[2]);
		var x3domPrevUp   = new x3dom.fields.SFVec3f(prevUp[0], prevUp[1], prevUp[2]);
		var x3domPrevFrom = new x3dom.fields.SFVec3f(0, 0, 0);
		var x3domPrevAt   = x3domPrevFrom.add(x3domPrevView);

		var prevMat    = x3dom.fields.SFMatrix4f.lookAt(x3domPrevFrom, x3domPrevAt, x3domPrevUp);
		/*
		prevMat.setFromArray([
				prevRight[0], prevUp[0], prevView[0], 0,
				prevRight[1], prevUp[1], prevView[1], 0,
				prevRight[2], prevUp[2], prevView[2], 0,
				0, 0, 0, 1]);


		var currMat = new x3dom.fields.SFMatrix4f();

		currMat.setFromArray([
				currRight[0], currUp[0], currView[0], 0,
				currRight[1], currUp[1], currView[1], 0,
				currRight[2], currUp[2], currView[2], 0,
				0, 0, 0, 1]);
		*/

		var x3domCurrView = new x3dom.fields.SFVec3f(currView[0], currView[1], currView[2]);
		var x3domCurrUp   = new x3dom.fields.SFVec3f(currUp[0], currUp[1], currUp[2]);
		var x3domCurrFrom = new x3dom.fields.SFVec3f(0, 0, 0);
		var x3domCurrAt   = x3domCurrFrom.add(x3domCurrView);

		var currMat    = x3dom.fields.SFMatrix4f.lookAt(x3domCurrFrom, x3domCurrAt, x3domCurrUp);

		return currMat.mult(prevMat.inverse());
	};

	// TODO: Should move this to somewhere more general (utils ? )
	ViewerUtil.prototype.axisAngleToMatrix = function(axis, angle) {
		var mat = new x3dom.fields.SFMatrix4f();

		var cosAngle = Math.cos(angle);
		var sinAngle = Math.sin(angle);
		var t = 1 - cosAngle;

		var v = axis.normalize();

		// As always, should be right hand coordinate system
		/*
		mat.setFromArray( [
			t * v.x * v.x + cosAngle, t * v.x * v.y - v.z * sinAngle, t * v.x * v.z + v.y * sinAngle, 0,
			t * v.x * v.y + v.z * sinAngle, t * v.y * v.y + cosAngle, t * v.y * v.z - v.x * sinAngle, 0,
			t * v.x * v.z - v.y * sinAngle, t * v.y * v.z + v.x * sinAngle, t * v.z * v.z + cosAngle, 0,
			0, 0, 0, 1]);
		*/

		mat.setFromArray([t * v.x * v.x + cosAngle, t * v.x * v.y + v.z * sinAngle, t * v.x * v.z - v.y * sinAngle, 0,
			t * v.x * v.y - v.z * sinAngle, t * v.y * v.y + cosAngle, t * v.y * v.z + v.x * sinAngle, 0,
			t * v.x * v.z + v.y * sinAngle, t * v.y * v.z - v.x * sinAngle, t * v.z * v.z + cosAngle, 0,
			0, 0, 0, 1
		]);

		return mat;
	};

	ViewerUtil.prototype.evDist = function(evt, posA) {
		return Math.sqrt(Math.pow(posA[0] - evt.position.x, 2) +
			Math.pow(posA[1] - evt.position.y, 2) +
			Math.pow(posA[2] - evt.position.z, 2));
	};

	ViewerUtil.prototype.dist = function(posA, posB) {
		return Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
			Math.pow(posA[1] - posB[1], 2) +
			Math.pow(posA[2] - posB[2], 2));
	};

	ViewerUtil.prototype.rotToRotation = function(from, to) {
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);

		return crossVec.x + " " + crossVec.y + " " + crossVec.z + " " + Math.acos(dot);
	};

	ViewerUtil.prototype.rotAxisAngle = function(from, to) {
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);
		var qt = new x3dom.fields.Quaternion(crossVec.x, crossVec.y, crossVec.z, 1);

		qt.w = vecFrom.length() * vecTo.length() + dot;

		return qt.normalize(qt).toAxisAngle();
	};

	// TODO: Shift these to some sort of Matrix/Vec library
	ViewerUtil.prototype.scale = function(v, s) {
		return [v[0] * s, v[1] * s, v[2] * s];
	};

	ViewerUtil.prototype.normalize = function(v) {
		var sz = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		return this.scale(v, 1 / sz);
	};

	ViewerUtil.prototype.dotProduct = function(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	ViewerUtil.prototype.crossProduct = function(a, b) {
		var x = a[1] * b[2] - a[2] * b[1];
		var y = a[2] * b[0] - a[0] * b[2];
		var z = a[0] * b[1] - a[1] * b[0];

		return [x, y, z];
	};

	ViewerUtil.prototype.vecAdd = function(a, b) {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	};

	ViewerUtil.prototype.vecSub = function(a, b) {
		return this.vecAdd(a, this.scale(b, -1));
	};

	/**
	 * Escape CSS characters in string
	 *
		* @param string
		* @returns {*}
		*/
	ViewerUtil.prototype.escapeCSSCharacters = function(string)
	{
		// Taken from http://stackoverflow.com/questions/2786538/need-to-escape-a-special-character-in-a-jquery-selector-string
		return string.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
	};

	ViewerUtil = new ViewerUtil();
}());

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

var ClipPlane = {};

(function() {
    "use strict";
    
	/*
	 * Clipping plane constructor and manipulator
	 *
	 * Inspired by the work of Timo on 16.06.2014.
	 *
	 * @constructor
	 * @this {ClipPlane}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {Viewer} parentViewer - Parent viewer
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 */
	ClipPlane = function(id, viewer, axis, colour, distance, percentage, clipDirection) {
		var self = this;

		// Public properties

		/**
		 * Axis on which the clipping plane is based
		 * @type {string}
		 */
		this.axis = "X";

		/**
		 * Value representing the direction of clipping
		 * @type {number}
		 */
		this.clipDirection = (clipDirection === undefined) ? -1 : clipDirection;

		/**
		 * Value representing the percentage distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.percentage = (percentage === undefined) ? 1.0 : percentage;

		/**
		 * Value representing the distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.distance = distance;

		/**
		 * Volume containing the clipping plane
		 * @type {BoxVolume}
		 */
		var volume = null;

		/**
		 * DOM Element representing the clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var clipPlaneElem = document.createElement("ClipPlane");

		/**
		 * Normal vector to the clipping plane
		 * @private
		 * @type {SFVec3f}
		 */
		var normal = new x3dom.fields.SFVec3f(0, 0, 0);

		/**
		 * Coordinate frame for clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var coordinateFrame = document.createElement("Transform");

		/**
		 * Outline shape
		 * @private
		 * @type {HTMLElement}
		 */
		var outline = document.createElement("Shape");

		/**
		 * Outline appearance
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineApp = document.createElement("Appearance");

		/**
		 * Outline material
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineMat = document.createElement("Material");

		/**
		 * Outline line set
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineLines = document.createElement("LineSet");

		/**
		 * Outline coordinates
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineCoords = document.createElement("Coordinate");

		/**
		 * Bounding box scale avoids flickering at edges
		 * @private
		 * @type {number}
		 */
		var BBOX_SCALE = 1.0001;

		/**
		 * Get my unique ID
		 */
		this.getID = function() {
			return id;
		};

		/**
		 * Set the coordinates of the clipping plane outline
		 */
		var setOutlineCoordinates = function() {
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();

			var axisIDX = "XYZ".indexOf(self.axis);
			var outline = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];

			var minor = (axisIDX + 1) % 3;
			var major = (axisIDX + 2) % 3;

			outline[0][minor] = min[minor];
			outline[0][major] = max[major];

			outline[1][minor] = min[minor];
			outline[1][major] = min[major];

			outline[2][minor] = max[minor];
			outline[2][major] = min[major];

			outline[3][minor] = max[minor];
			outline[3][major] = max[major];

			outline[4][minor] = min[minor];
			outline[4][major] = max[major];

			outlineCoords.setAttribute("point",
				outline.map(function(item) {
					return item.join(" ");
				}).join(",")
			);
		};

		/**
		 * Move the clipping plane
		 * @param {number} percentage - Percentage of entire clip volume to move across
		 */
		this.movePlane = function(percentage) {
			// Update the transform containing the clipping plane
			var axisIDX = "XYZ".indexOf(this.axis);
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();

			self.percentage = percentage;
			var distance = 0.0;

			if (self.distance) {
				distance = self.distance;
			} else {
				distance = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];
			}

			// Update the clipping element plane equation
			clipPlaneElem.setAttribute("plane", normal.toGL().join(" ") + " " + distance);

			var translation = [0, 0, 0];
			translation[axisIDX] = -distance * this.clipDirection;
			coordinateFrame.setAttribute("translation", translation.join(","));
		};

		/**
		 * Change the clipping axis
		 * @param {string} axis - Axis on which the clipping plane acts
		 */
		this.changeAxis = function(axis) {
			this.axis = axis.toUpperCase();

			// When the axis is change the normal to the plane is changed
			normal.x = (axis === "X") ? this.clipDirection : 0;
			normal.y = (axis === "Y") ? this.clipDirection : 0;
			normal.z = (axis === "Z") ? this.clipDirection : 0;

			// Reset plane to the start
			this.movePlane(1.0);

			setOutlineCoordinates();
		};

		/**
		 * Destroy me and everything connected with me
		 */
		this.destroy = function() {
			if (clipPlaneElem && clipPlaneElem.parentNode) {
				clipPlaneElem.parentNode.removeChild(clipPlaneElem);
			}

			if (coordinateFrame && coordinateFrame.parentNode) {
				coordinateFrame.parentNode.removeChild(coordinateFrame);
			}
		};

		// Construct and connect everything together
		outlineMat.setAttribute("emissiveColor", colour.join(" "));
		outlineLines.setAttribute("vertexCount", 5);
		outlineLines.appendChild(outlineCoords);

		outlineApp.appendChild(outlineMat);
		outline.appendChild(outlineApp);
		outline.appendChild(outlineLines);

		coordinateFrame.appendChild(outline);

		// Attach to the root node of the viewer
		viewer.getScene().appendChild(coordinateFrame);
		volume = viewer.runtime.getBBox(viewer.getScene());

		// Move the plane to finish construction
		this.changeAxis(axis);
		viewer.getScene().appendChild(clipPlaneElem);
		this.movePlane(percentage);

	};


}());
/* global x3dom */
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

var Collision = {};

(function() {
	"use strict";

	Collision = function(viewer) {
		var self = this;

		this._deltaT = 0.1;

		this.deltaX = 0.0;
		this.deltaY = 0.0;

		this.ticking = false;

		this.prevMove = 0.0;

		this.stopped = true;

		this.viewer = viewer;

		this.updateDirections = function(event, gamepad) {
			var speed = self.viewer.nav._x3domNode._vf.speed;
			var userX = self._deltaT * speed * (gamepad.xaxis + gamepad.xoffset);
			var userY = self._deltaT * speed * (gamepad.yaxis + gamepad.yoffset);

			if ((userX === 0) && (userY === 0)) {
				self.stopped = true;
			} else {
				self.stopped = false;
			}

			if (!self.stopped) {
				self.userX = -userX;
				self.userY = -userY;

				if (!self.ticking) {
					self.tick();
				}
			} else {
				self.userX = 0;
				self.userY = 0;
			}
		};

		this.tick = function() {
			self.ticking = true;

			var viewArea = self.viewer.getViewArea();
			var straightDown = new x3dom.fields.SFVec3f(0, -1, 0);
			var straightUp = new x3dom.fields.SFVec3f(0, 1, 0);
			
			var right = new x3dom.fields.SFVec3f(-1, 0, 0);

			var currProjMat = self.viewer.getProjectionMatrix();
			var currViewMat = self.viewer.getViewMatrix();
			var flyMat = currViewMat.inverse();
			var from = flyMat.e3();

			var tmpFlatAt = flyMat.e3();

			var viewDir = currViewMat.inverse().e2().multiply(-1);

			var viewX = viewDir.x;
			var viewZ = viewDir.z;

			self.deltaX = self.userX * viewZ + self.userY * viewX;
			self.deltaZ = -self.userX * viewX + self.userY * viewZ;

			tmpFlatAt.x += self.deltaX;
			tmpFlatAt.z += self.deltaZ;

			var tmpTmpMat = x3dom.fields.SFMatrix4f.lookAt(from, tmpFlatAt, straightUp);
			tmpTmpMat = tmpTmpMat.inverse();

			viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width / 2, viewArea._height / 2,
				this._lastButton, tmpTmpMat, currProjMat.mult(tmpTmpMat));

			var dist = self.viewer.avatarRadius + 1.0;

			if (viewArea._pickingInfo.pickObj) {
				dist = viewArea._pickingInfo.pickPos.subtract(from).length();
			}

			if (!self.stopped && (dist > self.viewer.avatarRadius)) {

				// Attach to ground
				// ----------------
				// Camera matrix is to look at the ground:
				// FWD is DOWN
				// UP is AHEAD
				// RIGHT is RIGHT

				var tmpUp = tmpFlatAt.subtract(from).normalize();
				right = straightDown.cross(tmpUp);
				tmpUp = right.cross(straightDown);

				//var right = tmpFlatAt
				//var tmpUp = straightAhead.cross(straightRight);

				from.x += self.deltaX;
				from.z += self.deltaZ;

				var tmpDownMat = x3dom.fields.SFMatrix4f.identity();
				tmpDownMat.setValue(right, tmpUp, straightDown.multiply(-1), from);
				tmpDownMat = tmpDownMat.inverse();

				viewArea._pickingInfo.pickObj = null;
				viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width / 2, viewArea._height / 2,
					this._lastButton, tmpDownMat, currProjMat.mult(tmpDownMat));

				if (viewArea._pickingInfo.pickObj) {
					dist = viewArea._pickingInfo.pickPos.subtract(from).length();
					var movement = 0.5 * ((self.viewer.avatarHeight - dist) + self.prevMove);
					from.y += movement;
					self.prevMove = movement;
				}

				var up = flyMat.e1();
				var tmpMat = x3dom.fields.SFMatrix4f.identity();

				right = up.cross(flyMat.e2());
				tmpMat.setValue(right, up, flyMat.e2(), from);

				viewArea._scene.getViewpoint().setView(tmpMat.inverse());
				//viewArea._scene.getViewpoint().setView(tmpDownMat);
				self.viewer.runtime.triggerRedraw();
			}

			self.nextTick();
		};

		this.nextTick = function() {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(this.tick);
			} else if (window.mozRequestAnimationFrame) {
				window.mozRequestAnimationFrame(this.tick);
			} else if (window.webkitRequestAnimationFrame) {
				window.webkitRequestAnimationFrame(this.tick);
			}
		};

		ViewerUtil.onEvent("gamepadMove", this.updateDirections);
	};
}());
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

var Gamepad = function(viewer) {

	var self = this;

	this.enabled = false;
	this.gamepad = null;
	this.timestamp = null;

	this.browser = null;
	this.platform = null;

	this.viewer = viewer;

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;
	};

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;

		var button_idx = 0;

		/* Chrome Linux */
		if ((self.platform === 'Linux') && (self.browser === 'Chrome'))
		{
			ViewerUtil.eventTrigger("gamepadMove",
				{
					xaxis: self.gamepad.axes[0],
					yaxis: self.gamepad.axes[1],
                    xoffset: 0.0,
                    yoffset: 0.0,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		/* Chrome Canary Windows */
		else if ((self.platform === 'Win32') && (self.browser === 'Chrome'))
		{
			button_idx = 3;
			ViewerUtil.eventTrigger("gamepadMove",
				{
					xaxis: self.gamepad.buttons[15].value - self.gamepad.buttons[14].value,
					yaxis: self.gamepad.buttons[13].value - self.gamepad.buttons[12].value,
                    xoffset: 0.0,
                    yoffset: 0.0,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		/* Firefox Windows */
		else if ((self.platform === 'Win32') && (self.browser === 'Firefox'))
		{
			ViewerUtil.eventTrigger("gamepadMove",
				{
					xaxis: self.gamepad.axes[0],
					yaxis: self.gamepad.axes[1],
                    xoffset: 0.0,
                    yoffset: 0.15,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		if (self.gamepad.buttons[button_idx].pressed)
			if (!self.oldButton) {
				viewer.reset();
				viewer.setNavMode('NONE');
				viewer.setApp(null);
				viewer.disableClicking();
			}

		self.oldButton = self.gamepad.buttons[button_idx].pressed;
	};

	this.tick = function() {
		if(navigator.getGamepads()[0])
			self.gamepad = navigator.getGamepads()[0];

		if(self.gamepad)
			self.checkStatus();

		self.nextTick();
	};

	this.nextTick = function() {
		// Only schedule the next frame if we haven’t decided to stop via
		// stopPolling() before.
		if (this.enabled) {
		  if (window.requestAnimationFrame) {
			window.requestAnimationFrame(self.tick);
		  } else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(self.tick);
		  } else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(self.tick);
		  }
		  // Note lack of setTimeout since all the browsers that support
		  // Gamepad API are already supporting requestAnimationFrame().
		}
	};

	this.stopPolling = function() {
		self.enabled = false;
	};

	this.init = function() {
		var gamepadSupportAvailable = navigator.getGamepads ||
			!!navigator.webkitGetGamepads ||
			!!navigator.webkitGamepads;

		if (gamepadSupportAvailable) {
			if (window.navigator.platform.indexOf('Linux') != -1)
				self.platform = 'Linux';
			else if (window.navigator.platform.indexOf('Win32') != -1 || window.navigator.platform.indexOf('Win64') != -1 )
				self.platform = 'Win32';
			else
				console.error('Platform ' + window.navigator.platform + ' is not supported.');

			if (window.navigator.appVersion.indexOf('Chrome') != -1)
				self.browser = 'Chrome';
			else if (window.navigator.appVersion.indexOf('Firefox') != -1)
				self.browser = 'Firefox';
			else if (window.navigator.userAgent.indexOf('Firefox') != -1)
				self.browser = 'Firefox';
			else
				console.error('Browser version ' + window.navigator.appVersion + ' is not supported.');

			if (self.browser && self.platform)
			{
				if ('ongamepadconnected' in window) {
					window.addEventListener('gamepadconnected', self.connected, false);
					window.addEventListener('gamepaddisconnected', self.disconnected, false);
				} else {
					self.startPolling();
				}
			}
		}
	};
};

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

var logo_string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAB0CAMAAACcw5TeAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAA/SAAAP0gH7iTvJAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////vy5IYQAAAP90Uk5TAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+6wjZNQAAJfNJREFUeNrdnQd8FMX7//eSkBAIkIRA6L0JIkWQIiBfQQEBQREFld6b0kQsKE2kdxQUNAgifCkiSKRLF5ASSkILgUgSAmkkIf3u9j/PM7N3e3ezc7uX/+/1+5l5vcgdye7O7r535/nMzPM8I0mslOi1eu/Fm6Jy/cimSXUkpzLhpt5y4/yvS7v4SrrLPt1Hjjr+y/SGUtEqod/myLrKxW6OO86SDZWMr8roPaUbxo58/Y2ixGPsU/1Xfji0EEBkOeXN/xkgsnyiUlHB4bMWrsdyeuGU0aIyftaWFNjwQVMXILtH6yjTVlyBba0zDQCxbljuvqzcctYMG8c3KyJANsDVbKihY0u/qWlk09TazkDye+irqfFm2HqmgTfkL31NXOD4BLJxWp0iweMjuPC4UH0br4ONI0upgRQYINIpDx77vgaarPNB+o48Eza+WboI8KhTgBcepYvIcnqX5quBnFmgm0gnKh1SA/UBWRZDNr5UVs+RP6EntqAIANlKruO+TiKMh5xbVQ1E0kukkyLlFusDMrHyHbLxlXLuN1a0Rc6/37BXtMry1uBLuogstymamQ5AdBKx8ZCf+ukDIlW8CS1kBXfbLrCd2Ox/PZAx5CqekZBI2n1xiYPWhgrkC45A8I4UuNn9fj7Z6B96317TCUQqf51s/cTNgR9A7WbaT/rXA9kjyxHkA4m4L9Y27ZGINcgRiOoZFZa9xffj53K9QKSQCH1HHvw2ErGW/bcDiZTl1fAZnKTrug+WoESaOQGRfta1e34P/6PwuUc3ECn4ka4jHy3RG95AucW/HUiGLH+OX27B5ZhXL0wnH5kLV8LzFjl/L/zy+PwT9gs/FtD+KTE7vZyBULN6bv5F+Ng+/y50Nb9ZDgru8fzv1ERKniQfl/UDYfp3/UJ4EDIXrYATuzd/D/bN5x9XE3ktl5zYm/92IORSPrADkc+UaQl9v01efcmFW0d5Qacxq0PxA/YLP126PelMDOIDyX+99CnykVC/EhzubJnX4aldJI1VEylFmMUYBhIR/GIm+djs1QeITDHBiWV39PtDTaQzObHBRQkI9Nr+DmqWYiMiTzCtB1HUfhUMDMrKFrH261YDgR0KepX8k3wkNqwQCS9MmR5AZD72B1OJXEYiCzwBIl8MbJuJJ4ZEPjDRRwWEH1RhRSL3ihiQ6WDZL4c8l2QnMtUE7Q18e9KO/PgEtoggfx/CAfJwAhDp7X+QfCQ1LncV+tmB3fPY/msWynI46uNzhoFsAa11rnQbeCZ+okTGIBH4lteL/JgbD0QSihiQcUFgAa6FNky0E/nMtI4OnLfyh9ugqLGhHCCPpSlA5A2/fTCq26wsbPp34Gt5uMMaEGKHFDVmEMiKUOiPnA5oDUTCkIh1OBIhPLr6kZ9D6sQztVWUgCQ9G3SB/P9GpfoJdiKzvaDNeNpWAiCJDRiRYTwbslKaDkTe9P0VejUtgv6GHkvQLMoDWFhHMyIGgSQ3rhQNRrxkK5AcPyIRyyDT38hDAiCRoXUTih4QQiQQLvJpIrTWcnIiCkkwKdkdJAQiJz5DiYzgGvXF0hfQjiSihM5NBHkgpxdQHojCOoYSMWpDkhtXIfZBvn0sFg38MajAcobyQCDyzYr1EooeECByniPyc16WGBD5ESUykq+yvpbm8DoJa+x9x3H4adioJzeu/g/nwMCDApHvVKn3sOgBIUTKcDpiH0k2IPKjhsFEL43iA5Fn4WClU7mgHnAaL23zRGUlN66V4Xrk6ZINiBxTvX5mEQOSikTIl79mqoryPvhT6So/bkTajdEcILlgvj8n9z1TvTsxx0cVIMmgTicYl73pSIQ0WmdVB4Z3cbQC5DH5F1urqMneCdD/TSI2Y6lqA5MayITfYQtyf8bwZC92Ou6TfqG6gt9UQMKHA5Fow0BWgvZOfuI4BuanBjISTj0utYgBmea7h779mkCm+O6jW4zlAEn1602HXDWBnJZGWD1RWT+afpRdBiUdgEz03VsEZW9ed0ZEE0j2y37hzBJwbEi4HwplbSBEGI+0egDEOtxrsxhITiff34ug7M3vRYloAiEXToePJnCNerhff4sQiPytabTVA5VlGei9TQhEzumM/dGiprIK+iARbSBw4ftt+7iorHC/gRYhEHm91xirByrL0s9npxCInPsKvrxFTfaa+/nGCYHIOa8UJ92yDzVkb7jfWjEQeaPX957IXvObxRKFQOTcV/0eqYD0OOtROaPsv1v3Lqd3rRimPf1dpv+S/54S7n/4xy/beXGBnINHccAtAZBzeOGxyr1yBPIEmIavEAC5mUy22LLEMBBwwijocU8AJApOrIta9g6VPSoWZf9/DO1mPfEy9ypa7CvQtX/y14HOQIgYHTkRzihHAGTkJLjwbFmezJO9lWPoCL227H0OiGQZBrL8AzhwlgDIkPlsi/8lIKT84eqLEbDZqnv31KEOQDqfJV/2FfvQjexdK02iW0zhAMmux4Y3NIFEByERw0B2SxPcyN5ZypiNE5CombrLeh6Qb3Ts+MWycPSniXN2Za2OvrP5R1Z+Kdx/zobbWNcKbxuQF/+kV7O72AQxEHk+IzKVZ0Pia9WOF8vei8GUiFEbslwaJwZiHS3N4AGx9WDdlop3eECuh+jaueSMLJiiaOTwy1DwhkmepsebstUZdOdlQL7bZ3tvdhcbLwYiL6BEPuIa9dhq9RLFsvcSJWLYqC+XxlrFKmsCjv27ALEO18cj9Aa/yYoI1rf/Stj4vhpfcWh0bKOwbkqtdOUxt7FY1eAGEhknBiIvRCLT+CrrbuWGSWKVdbksEDGuspZLIJdFKmuyNNkZyFQrzJvouSEhMOMcfdcRyEZoci7o8XuVZtNz+EH1q0+ZOtSze02Kv6C2CshfpStEIZFbYiDyYimWDbNyZO/tCgvcyN6Isp7NqS+X7omByB9LziqrFDxdlnfdVxaM3l/txzoCWVIOHQNK6+YhW+yNVtkMOiiqh0hNRUFsVQEhREKh/t0xAiC/gYhbQoB8wgGSAg1h1A8CIBdAGF/ZYBjIcRh5Xy4Csh3GNWe4AJFQN7r1tg9E5yU5drETEKnCLZw61stDltfZfvcx+d/Ls3URsfGQrZVVQOSoOQNi3aiskb2YrP6UJ3tLn5PFKiu84i2P5tSXt33qRmUN7glELC5ApGlwSyLcFJAiT1xtyBJJwqnjB252BxcMczbuHm87vTPo1zpbT/Up9upHSFX7rbpkdtbEmkC2ezMin3GA5L/InjRNIIl1GBGDQC6X7pAtBrLDG4m4ApE+09cNuBK0hwdEqnpP3/4D/kNdyZU2K8hCbfRsfbtfZdVvp/2Xzl8ezNQFRP6ZEfmcZ0Oetgu+Ipa9CQ0oEaM25HTAyzniwcVfGBEXINIqXXek4HUco3MBItXI1BfhGNAF3WsUl87nyfcX4MtqXbub+2D1VrtLp3fTcVti3QORt1AiX3CN+tP25a6LZe+jRkjEsFE/XuLVPLHs3UqJuAKh+vdOGPa1joVBGyT/FgZTjFlhW0FLPwyDuZT8buh27AKE6d/tYWDHMsN2oLEJO4SOs2FR9lt6MqBHgdU+L9Gb/Kqqunr0ej2pVA/aP+enrfaOvLkvVp/ieBOqvLPyotmN7P3FuxfZ5Eu+ysrqAB5UIpWV9FzF256orCP+3QvEKmubT88CbSDmPl7gD/6gNoacXAx6Fm7JamkY3JIPpfk4XFzylDaQEwGtgMgKCUZxLENM30K7/0LwZTuRU6X6kGZqhqr60urqvX9GhwQUTheDGkP1P3kPUxF526F61fgLab9maQGx4qMYa4/YUQOBP2a9JJK9ADuluWey94CfO9n7X5972kDII+i93U7kUnDTNDuRSdJSeGI7jtUAYsE34IV024SOZajpG3hh2sOAjTmfXtnpUkmOQGzVk/3Nb3lvxuex3BWs/lnwZPpv9UQ6tge7m98ZywXiXByAzAGv9m3xMHbEUVlzYU7xhADIfpiJfXLQMJAdMKzxe5wAyGLwldn+QAvIR/gIFvvNTuRycMsMO5HJ0hq4Mz9rAFlzDt8AJLLeaxi5v9ZhaBxyUdaS5m8avEdn0jWADDVD9V6b7B6dl4MbQaMJhvE4EYKRqMYOGQcyqspdx9AxNZBEaaEb2fuH14+eyd5Kd9zJ3gYPZb7Kwi/FYODF/I5vuIpI2TZP7USmmL7nyl76ZV6Zs/gGtHyCEzowCWcdwdQC6WaQW/u20pfgAvF9D4i847URPDpbBp3H6htSf6vjJcmLEaWoMaNAoqswInN4NuQzaZkYiPktRsQgkNgalW6LgZwuXTdOAGQ6eleY+xU/ZCcSURa1NCMy1esnbSCpTUv/BW9A6RZpqGv6g3PxSOk06/YRIDcqMCJcIOtN7wKRfl5h4MrZugwcLCLkFcoDgzU+ZESMApHvMiJfcY36R1TkaRt1c19KxKgNia1B5bK2DTkbWCtWGwhRhYPJY23ZgWo/YesxHObZehPjSraiD+re7QWaQIAIDEPEReBTHR0BUtgaqXTDofG5yYhwgRAi/cAdOeIqKp8IfN8fplAeNHpmIiViGIh8tyoS4QORJ2L0gkBlkZb0R09kb2yNCjfFsvdCcPUYgeydI71nMTpBpVJZqU1LneZ1H3BYBIDItyoiET4QQuQdM2d/4MHCmSYhET6Q0fvVxUn2xlSrYtaYDwHXXdNesewlLenvnqgsQoQ0F/dV53XASWVFhFR5IlBZC6TRhQACRG67bk0HvREIEMnRBEKIjHLd/THwUOLLpkjfagFZ4bzjAgUITMPca05+9OcNnaCtE8neTHSjMC57odrYF9Ndr2ixAgSOfL28puwFY7G0Lcz9rHVTvuEByUIiRB1eUm0Jb/oABQjUf7uSluyF6te/6FT9NdLcSAxINry9U8fqBoLzbui5eIpdfGue7B1kpS2r9uAiZMAwXzEMZNVmrQd6HAMyAeJSbyRpAekEggo2KabbHUcNZCH0z1Pv2FtqHLJXAxkByulOpgYQrP6sU/UrVUAiBwCRi2Igf7Km4bCVzrsBkPEBp6gLvBcHSJLXcKtYZR1VcpIYBLKWOS5GObSleGIjmTEJOCGSvaXaseFiz4As9dlOd9cEMrDMeYHs5VavBhJtGmARqCwK5IA/++8YOu+G3u/NKZHVEs+GbPIaIwYif8qIGARi7tsARrKOlHDcZBQQGYJA0pozInwgh/1fzCwEkPzePtvEQJKbMCJcIEdLcqpXA5HXMiLCJst2/ThY8C4a9bQWlcitMTfhAiFEPhADkWdSIkaNujkJ76rzNuAobHkfjbpCRMOoH/bHGF4PgZAOlM9WIRDyqFIifKN+opRr9Q5A5A1eSEQTSDyIzOMB6gsfhJSenMIhNj4QQmSqGIg8D4l4MJYlH/J33QjaSPNAWUVES2Ud9scYXg+ByOb+3r8IgchPXkAiGirrTGmX6h2ByD95AxFNIFHYmT2tTCdjP9dmSe+V0gJCiGx0M6e+SNroEZCD/rythtlPjBBJEsjew/5vFgIIuHtfFgKRM9qUydSWvecD3xQDkX/xmS0CImHX+Fyg6lFUyoMaEhdIBsbuLhY5yuHc+EJPgBwozt9sKDWGD5CIpuyFYZXDnTwGch1aiGEHBUAu4WyQluyFDvrFngIgj2ASefuHQiCUSLQiaVJUIYP+fCAP6ydSUawtezHQPMUTIMf2axTqCjkMZFgaMW+vc4HUiWFp2jwD8tVQkA9pAiBvw/uflasBpMIlFs2sKXvrxtMtREAkxSPBpWziA8ms1DBJrLIi/VtneKKy3JcFTBjLDblAKle5UxjZu1MaYhGrrC+UFpkL5Lmgi2LZ+zikbrxY9gIQn92uFx73NlxZF74NuVXhuRSxyjpSghL5/w5EnkSJWItzgdwIrXijEECIzB9sEQKxpUTgAnncCDMyCGzIVUZEBMTnv8ps8e5s+4VPrEnapJgSfKMeWa5ZmlhlHaVEDANJ330YR0h3oxPstd33VUH0u3+32IhclfhG/UZo6PVCACFEYBJEYNSVlAh8o/64EWZkEBj1a+WQiAAIxpDdx5H7su1UIeKTx6gSOTirrCtlW6aLVdafJYGI8TfkU+lLON/3MMNJ6vMVVO4Fm32xQZnU1sGV1knm3AjF3HTPNtAsxYQqa7UEqnStavtWTiqLpkTQUFmEyHmxyrpWHohoA/HGjtA76Pt2OXiKeoTzLnlptGTvpaBFbmTvsZKLPGqyPlMTSe98keZlugCTGCfKIhEi8pL9tYAQIh3FjV5dIRBC5DjHG0sFRB4vJWvL3seN2rmRvdfLjxcAubUFN0p/PhAavygYuIBZ/QNmqiGtVThAUuERPC8KabsGb+XxNYaBnM1BVzAVESjfh5PuVEewWnfqMqM7Q+IDOQJELnsM5BRcP28+5EIQA4I+XRO0ZC9U/3ikAMgDaE8jZ7kZOoG7kPKs4umyFF1J+7JeWGee7A25Rh1TtGUvJlEyG59TfyUPZ/0ciFwuTjo0t4vXhjcopf0XGMTkrQGkVLh7WSAA8lWXXI2dkAgB0hfjVywaQEoDrwKR7MXsq2YxkLia6ElUPySK+s4BkE2mXvma+bJym5W/IZa9sRVZWiuDQP7yfw2q/VIhAmOv6bWlAcDArwzMVOXD03O1lKQB5FW/gyg6OnfklNfi3AH507czPIj5Qx32ezWaESFAvmURRXwg3ZRUhFpA0hsgETGQ7HXr4bmMX5tKXef8aVTza7myludiarOKt8Wy93ZlSsSoDdnv9zo8YDvXQnNtCYNj9JakpvhW+HkzZ9Hz1SQtIDlD4zGpFq+iEkfd25A9iyCEsbvTnji8RIjASS1hRLhA8nqwfAuaNuRRI0pE7wTVUtsU7k/enbM159RTm2Hcp8Co362GRAwb9b3F+jjOSS+CmSkzjcSWxpAv2ZO9JU0gWCLL8+rxP6LPqMt5rtmf8SZeCEKjzojwjXp+b5rWQNuoJzfBg+kEskE1p77V5yXy4szlq6zUZtVixSrrfk0gYlxl7fRx8BKI9rH/aZ+fFAa9aUkM5Do3h7w/9G8u/+AeSF43zt7o9HaBzi1TIhoqy9wXU38IVFZqcyDCBzJoq7o4R1Dt8o3V8MtCIu4iqB7U8cyVdKv3PSL+8IwgGyH+iXVdf/edTkSUGyDXuDzQUUv+oJZbILlduGcZpMr3tkRK0pa95v5t3cjeJy944Eq6DPySfn+o4bkITlmpfwiAHAY384RfDQMJB7fEn2IVNyCIJcTwyhmynAEjqXv7ERHjKwQSVaU4p5Q+SE3pbLdApjXllw40ZGAujHEueQpxdZzqIZrK8q0AyA1Y5Chjk3EgI595pGSO48he03fuIqiUJEpGs5LWf6h2Je1Cvr0EX8Dnvy4QAZ+1xm6aLK0Sq9OGCEtfFoAvv8/1ZJ0oi1VWpGmtZ66kV8sxIjN5TdY4dF4VAMntwogYBJLUkGa4ZEAqK/HndaBHFHKVXks/z4A8DhpnLTyQC0pKhA686pdIH4qBWAYzIoY9F68xItz4EOsInOcU2JC8rpSIURuSWI8OhjLPxSfMzcIrG9KaMyJzPHxDVrBJrkIBUYjkB3CrX4JhJQIbYhlKiRh3Jb1WHonwI6gsA312iGVvXjckYtiox9dCucyAnFaOeR4lPCWySwhkX0f0rpjXEbI8FYz8Dwy+JnTvC6Oma0zgPC0GkjOgJ1x2TJf+4DR3rCNezMqO8PxZP+p8C4m0hol/jeqXSOPFstc6DIlwgAT3+PrEV9pA5Ovln3lqFxNOKsvSr9hRscrKe833T49cSavXzrAB+Q7SaEPZQIOykMgt8RsyHRMe5L6KebfiawddtmdmXmd6z+0bcrcyPojhfu2zMMMIDXj2hiG/9JY4lXcBAhqGaFW/BOOkBSrLOtz0swuQOoO+i7SKQtoKsL8byw/6tGDolkj2Qs8/v7tx2QsPcExlewQVvP+4cgtNvJLSHIiY/bSBYBp7DJFmRB7ULHsViWAQzoY6YiBw2XcqqonM5RCBAUxvzeqXiGQvricwwkH2+raesuux26DPz2H4MCqZHxb9EOKUCs6LAnaWe5aM/3sIH7idZAPSSbGenZmEb1mf/GyiDaRvAXr8f24nElu9fBQSwSCcw2Igy4/ifKiayEweEcurguqPiFQWKHmrLcYQWqlcXWHRY8pd004c8Jil99AGckhZV8yoby/zYFWAVFAc30PZslYZL5Jm9F1tIP64kMl4vImMyL2qFW4jkRZP3MrehSWO4NCLmshnDkR6/mrL68ypvsTr+WKVdRv7VmhD6g7+PsqqO3HAo0aMCC+1BtltphiIdRwjYhBI9kulzjpEUJF3dBV+IW/NXLCsT1Md51ed7sg2H8wpPDYQJnVyu4fAAPHdOo1AJ5wI7ZTlDkh2JxxhuVatDcxQh4f0hLZ3euAKDHgpu8eWv0er+j1+LK2Bpg1ZwIhYVKk1UvZ83D/OXZx6chNK5GOuUV8uzXPjSjqREjFq1J++WOZvNZDjpAXAL6Qt+c2bjaDsFhj1bT7d8z2fD5Fzu/ofchv7P067+j+K0+q1jfpSSkQBkvzDsAYmCWOjcsRx6qnPIxGN9EwrpEVuXEmnIRHDKiuzFcoiBcg3EGLKxkGtQ7EJImZXpLK2+bCFTDybws3r4X9QvPueRqLqD/lj9QKVtco0WQXEsrG6RHlEVnkkThyQ3rpcmlYCMyLNTTvcDC5+Ju3wRPamtwhJtQOBcVXMLDYcw/iLYQtuKS6Svdt8BhZmTr2gd/FI7Zfj2lfN3Yxt/llyoJvBxXWmpeomK29Jk7s02aooX9Z9jJaP5Ye0ZYF1XL1QAOQBPCWzjMteOHBaU1XigJcguxV8aYUkBhfDdryZ5h0BB75tHcDDcbBmKa0N5B4OoJNXJKw1pzSv6MVxcVVXD7ftZBcBkBSwTT+MZ0C+2ammnZspADIKepNZWfwkmA9bMkdR7cHFbnnUO8To4OJqp2T8ITJbMSPASkcIMCf9+5p3pHEC87D10JUUsgeaHzvrBlFxqL7WXXrZ2rL3+TS6hYUmwXyeTfn+tdqNUf9SGZXkpYlND2zzVKyyLvl0y/NEZe1QUvrYonAfQR55KDG0yR3gFwfLyWjdkeA6DwrjSroRu9myx0BqVokWy96EkkjEBkSS2qHT0QdMlWoCsbzHiEzi2ZDzpVGhC2zIdkbEqA2ZQ5NM2oGQfsFh5fBQp+X9vU7rhzrckXOBNWML40o6A3v5HgO5V63yHbHsPRFAiVjsiZTvYGNMiWgbdcv7lMhErlE/E4BpvARGfQclYtioz6Antlx1NQ/xy1zShcb5H2Jyo7Wt6sXgajGFcSWdIU0tBBBChKai0DbqJykRi1Pud0ZEoLIsA5CIRu73EyVfyRWrrJ3FgIhxlTUd03bYgEDQNzqp4Vwha1AsJbRlTkQIPqQeB+zMwDUBPQWiEBGorFOlgIgzECASI5a9loGmBM3VEeSj/svcyN5dxZZ5NKc+WXqgAgJB3+3gSyPs5jIizQW6MxJdST0GQogcKwQQQqSjG9l7utREZyCYjH+wu2T8lkGx/PVD0qFROOg2Gf+vxoFcw2Vg1fmyApWz8sG1XRmRAVp3BAZebvbxGMgFqH/GQY+BQPX3+ouMOty6M9OdgdBk/LnukvFb8vkr7DysHks9oN0k488x7kraz0yPbM91Eq+Enl6R7UTma6qskyzhgYeyFz1oszwGgtVniWRv1Rh6YxyBrJPcJeNfrSTjH8cBkl27VpxY9t4u41ky/iM+LK7eDuSgMjtHF3KnRPZq3ZFWSl4Bz4Ds82Zueh4C4VavBpJcpWqMLLsa9aWSu2T88xgR3qJgclxtuv6ptg35O8izZPy/eA+1OgJZqlQzXWZEVjge1uGOpLcsebwwsnerz5sFhQDCrd7BhsRUo0Scjfo3JnfJ+JdQIqO5Rj2udoNHbpLxl/UsGf9PXqMck/EPU2RWd5YKcn4P8llSy6qSW3KsMLJ3R7E3CgqhsnjVOxr12JpIxEVlbfCCcbsD6jEeJ5W1yjRJ1lzpM652oyRZfqLe/ZKjyrpWzrNk/BvwUbEDAY+CF+FLNUg4CL0fcLFsoSlzyC2BPLHtWrsprTRU1m++vQsKobJY9eqhtEOOKutBHSDiAkTe7PfAdTRzvAqI/J0pVnMtXEJkjevup9SyN7KCZ66ka00OWUlL2QLrMmR5TCcWBTlIW3emt+xUmHxZ8j6/g4WRvekte7hW9o9a9ibUH+ti1NPYjKhzSWnMgOAWYXH81aIfwyB4Ii9x2jQG5DjOTW82nowfhntXOaaJtTmWniZqPKBjFltLg39HIB1pepzHQDDF9IGTHgOBJenTkzm1rWZAMGDt0RoX2ds8TeM0kxoy2atsMZwnexVHUT4RkL1KLIZR2dsizSUraTjp8+AXGDg4FdABxzX3aU1q79S7FBQXyFc17hdqcNF3nVZ1q5ns9d4ic1TW2dIt4Pl+3MTBITkA/OgT6yOQkwGMCG+Be0sfP5z5nuzo0IxJP6chkPQXGBGjWUmrNU91BrJIWYoAwzJOBWACpPsad+QtH5hFl38NKK5d3jJrAomuXP1+YYBMNO3Cs3essHseJQJuQD0YEScb8tcPGC/qdGxME59Qx59m3KZEeCFtcv6sPNXsrq1gQOY0tCEKEaM2JKZy0xQnIJCcKFCZrAIikG7HGqDhl/VJGo7aCOqjufQ1bMidytXuFQKIdR5Uv8Z5m665SARsiELE1ajLjxq6HJxmu20oq4gM0TDqdhc6VcEsCNPQqDMiho367YpNkh2BtCD/bYtOTEw5BHRQFiTgWlUY1xRUR1df0DTqhEhMYQYXUQy5PgRIBF9xRsQVyKNnOEfHxP3xyroMzXPsSXdcgMzind0gC5vHRCJnPFFZN8o3dlzHsIRVsWQJSjL8DJUrp+sd2eEjqA0ncrbt1lZZdypXTSgUkB9NnK1ezbXdGEJkFwdIYgPu4UuwoHkrEom160tnIF/zT4+NfJiRiHHZC9VeD3FKxn9XlpfhF9KinoSLOnWVpSnl3pHtIh6tMd/b21rJ+K1IpFCyd7MXd7NXcmw3Jr8HVp+neJDQxYlHd+SXHjRiZh5c+AkiQt/mAzmusXtHmll9P3ykn6C5bQwACQOnLMgqrQayhyhR/LJYlq8yoyv/oXVHojp31C59aJSgOVwDyFoIJbwTYQTIu2SPcvbqIztpVD2X/hnC7POJ8MiBFVcxK69fgh5ROEq58LbOQL7Rs/sfuOyGrAhWXUBMpO1eSVdRcwTyNemGKuY9vwY7sVhXIGP06d07GjakBLFd84IvGpW97ZXlj6bpqTxKSdd6CyanIXFJsd91nXU0UxtyZScgY/Ut7NOfzY1/rxuICSR8RquQ6y5AIISgDHwBb8nE5oxIKWcgTVN1ndpFn2VcIMUPo3cgS6+kHwiM6ICzcbd8XdVPpVPE5EmdQdqp8pKP3o5TdGUcA7PNXjMgY/V2u4ZKS2Rnhx0REK8faD7DVqE3nYFA2oA25HMEbvG0CyXSygnIs8k6T+1DemZOQOjCVPKTVpSIfiAw8bpHkjrl6qz+Czr18bkEYnah1y82ixtwEmMhcEme3cW65qHLB0YR9MToqOjKL6jTklIgwMNqwcN+grOOGGz4sD6uSBUVionm1pvet6C79TXyCATpBOK9iQWlZLTCBezUQIqbUWb1tLAFaoYgkaGOQJ55zK4s/JkRcIJzGkCMT8GAhjDU97BDezCNFxq/kYOONItdgODYA+ye0RYTXhkAAmv2tGufzfbfRWd0ZmCAQP5rJbD6ergsypWQTjk4Dw2NVFNcby8X/P5SmmyhRGAu5WYoI4JK+Qs8ukKEWD7r8w5A8P0YC4uWKEQGYjaxh/WQSGT5xik2IjIcY5ukDwgmy01uvA2JVEt3BCLdhnmCNuRi8l/ClWS+qP5IMcQKkHpww/c0jMeZBaiexfKlt8RbElWxXjxeJt6SydJ6JyA+MDqXi/FrTzsERhsC0oRIs6hMW/XbKZHPkEheF6w+oW6VGDuRXeTvEcz6oA7u6c2IHEeRyYigUp6OrzMjAvNFkhrIWJbh4V0VkQGYbyuhLnpmXy+PieYYEXKg2vqATMPqzO/hsTJaOcleicj2Aw0AdUFP6QM48vek4d2vBtIU+05XaPq8b+krOtq0yk7kTpXa/9iJTHWSvSvQrd46CgcZsl82JHslaRO7saz6XzAvr/wpEsntzIjgrDcjAklyYMeNzkRwLiUimBFBpTwFX2eFSFp1NRCW1lze7dtPReR9TJceX4cSKdciXUXkS0kfEGXxzeEY3JuR4QRkjiw/jmWdKuktaFzJw/NADeSRwy1ZR6v/AN93RuRe9Rr37EQuOgJhY/qMSE6cMSBVUxyJbKa5q6cjkZz/YPXxdXDWWyGygw5VnXYhAtteDGREOsO2E3B9qfxp4HZi7iSpgaBqghuz3/8dFZH30CWdEblWDrteG5eA5thp0gkETnw+PNUTvH92lb3gkoUBydgqSx0YvjIqIHCNl+235DtK5CNcJY8R+ad21Wg7EZfluzMXWm1EjNkQSXqpwJFIGCXyMRLJ6oDVx9WuC63qlY/hgb3CRuJCzilERnUHLZPe/01IwHuu60fQQ/2t6yKMYetq46YOHaNA0rqPhjv9Z9f1mLK1KwytWj7sCUY2rtcAQHG121xFT+wvIekHsq8rLNskz+5+wxXIs3Repyf4WecN7zqFXn8bByAFfd/FS+02Af76Y1dcaGpe12P2y4x/Yyi8CbvpZToD2dkVmkvr9K6njAOR3lEiUlj1YbT6OXh/nr6P1cf1mqis/BNZ1TZUhfkVC2SrHn2W1E5yAWKkrPKWDABxKg5AfAvYYI5DGe74hhgtzgvcOxZjQKT2yTLvFDV6zep4iO7Xde6Xu8BRsRoFcrqd3otxD0SK4m2y7P8QECl4kd5+yJ2+jg25d8dlt932KZP2DHfOAWYESO61r1vrvxYdQLbzNjn0fwmIJIWO2Jvk7lHPj179qjI18P8ABDmNAb865E4AAAAASUVORK5CYII=";

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

var MapTile = {};
// Global functions to be passed to X3DOM elements
var os_clickBuildingObject  = ViewerUtil.eventFactory("os_clickBuildingObject");

(function() {
	"use strict";

	MapTile = function(viewer, eventCallback, options){
		this.viewer = viewer;
		this.options = options;
		this.eventCallback = eventCallback;

		// add new event name to viewer
		this.viewer.EVENT.OS_BUILDING_CLICK = 'VIEWER_OS_BUILDING_CLICK';
		this.viewer.EVENT.UPDATE_URL = 'VIEWER_UPDATE_URL';

		ViewerUtil.onEvent("os_clickBuildingObject", this.os_clickBuildingObject.bind(this));
	}

	MapTile.prototype.initCallback = function(viewer){
		var self = this;
		viewer.onMouseUp(function(){
			self.appendMapTileByViewPoint();
		});
	};

	MapTile.prototype.updateSettings = function(settings){

		var self = this;

		if(settings && settings.hasOwnProperty("mapTile")){
			// set origin BNG
			this.settings = settings;
			this.originBNG = OsGridRef.latLonToOsGrid(new LatLon(this.settings.mapTile.lat, this.settings.mapTile.lon));
			this.meterPerPixel = 1;
			this.mapSizes = [];
		}

		var options = this.options;

		if(options && options.lat && options.lon && options.y){
			setTimeout(function(){
				self.translateTo(options);
			}, 3000);
		}

	}

	MapTile.prototype.translateTo = function(options){

		if(!this.originBNG){
			return console.log('Translation aborted due to no origin lat,lon defined');
		}

		var lat = options.lat;
		var lon = options.lon;
		var height = options.y;
		var view = options.view || [0.00028736474304142756,-0.9987502603949663,-0.0499783431347178];
		var up = options.up || [0.005742504650018704,0.04997916927067853,-0.9987337514469797];

		if (!height || height < 0){
			height = 500;
		}


		this.viewer.setCamera([0, height, 0], view, up);
		// lat,lon to mapImage XY system
		var mapImagePosInfo = this._getMapImagePosInfo();


		//get the xy number of the map tile image contains the target
		var mapXY = this._getSlippyTileLayerPoints(lat, lon, mapImagePosInfo.zoomLevel);


		var nx = mapXY.x - mapImagePosInfo.slippyPoints.x
		var ny = mapXY.y - mapImagePosInfo.slippyPoints.y

		//cal offset of the target point to the nearest map tile image
		var osTargetPoint = OsGridRef.latLonToOsGrid(new LatLon(lat, lon));
		var mapImageCentreLatLon = new LatLon(this._tile2lat(mapXY.y, mapImagePosInfo.zoomLevel) , this._tile2long(mapXY.x, mapImagePosInfo.zoomLevel) );
		var osImagePoint =  OsGridRef.latLonToOsGrid(mapImageCentreLatLon);

		var mapSize = this.getMapSize(ny);

		var dx = osTargetPoint.easting * this.meterPerPixel - (osImagePoint.easting  * this.meterPerPixel + mapSize / 2);
		var dy = (osImagePoint.northing * this.meterPerPixel - mapSize / 2) - osTargetPoint.northing * this.meterPerPixel;

		var camX = this.getSumSizeForXRow(nx, ny) + mapImagePosInfo.offsetX + dx;
		var camY = this.getSumSize(ny) + mapImagePosInfo.offsetY + dy;

		this.viewer.setCamera(
			[ camX, height, camY ],
			view,
			up,
			[ camX, 0, camY ]
		);

		this.appendMapTileByViewPoint();

	};


	MapTile.prototype.getMapSizeByYCoor = function(yCoor){
		return this.getMapSize(this.findMapTileNoByPos(yCoor));
	}

	MapTile.prototype.getMapSize = function(n){
		var nextN = n < 0 ? n - 1 : n + 1;
		return Math.abs(this.getSumSize(nextN) - this.getSumSize(n));
	}

	var scaleMapImages = false;

	if(scaleMapImages){

		MapTile.prototype.getSumSizeForXRow = function(n, y){
			var mapImagePosInfo = this._getMapImagePosInfo();
			var mapPerPxZoomLevel = mapImagePosInfo.mPerPxTable[mapImagePosInfo.zoomLevel];
			var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y + y, mapImagePosInfo.zoomLevel);
			return mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256 * n * this.meterPerPixel;
		}

		MapTile.prototype.getSumSize = function(n){

			var mapImagePosInfo = this._getMapImagePosInfo();
		 	var mapPerPxZoomLevel = mapImagePosInfo.mPerPxTable[mapImagePosInfo.zoomLevel];
			if(n === 0){

				return 0;

			} else if (n === 1 || n === -1) {

				var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y, mapImagePosInfo.zoomLevel);
				this.mapSizes[0] = this.mapSizes[0] || mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256 * this.meterPerPixel;
				return this.mapSizes[0] * n;

			} else {

				var nextN;
				n >= 0 ? nextN = n - 1 : nextN = n + 1;

				if(!this.mapSizes[nextN]){

					var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y + nextN, mapImagePosInfo.zoomLevel);
					this.mapSizes[nextN] = mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256  * this.meterPerPixel;
				}

				return (n >= 0 ? 1 : -1) * this.mapSizes[nextN] + this.getSumSize(nextN);

			}

		}

		MapTile.prototype.findMapTileNoByPos = function(pos){

			var n;

			var mapSize_0 = this.getSumSize(1) - this.getSumSize(0);
			var mapSize_1 = this.getSumSize(2) - this.getSumSize(1);

			if(mapSize_1 > mapSize_0 && pos > 0){
				//+ve direction
				var n = 0;
				while(true){
					if(this.getSumSize(n) <= pos && pos < this.getSumSize(n+1)){
						break;
					}
					n++;
				}
			} else {
				var n = 0;
				while(true){
					if(this.getSumSize(n) <= pos && pos < this.getSumSize(n+1)){
						break;
					}
					n--;
				}
			}

			return n;
		}

	} else {

		MapTile.prototype.getSumSize= function(n){
			var mapImagePosInfo = this._getMapImagePosInfo();
			var mapPerPxZoomLevel = mapImagePosInfo.mPerPxTable[mapImagePosInfo.zoomLevel];
			var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y, mapImagePosInfo.zoomLevel);
			return mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256 * n * this.meterPerPixel;
		}



		MapTile.prototype.findMapTileNoByPos = function(pos){
			return Math.floor(pos / this.getSumSize(1));
		}


		MapTile.prototype.getSumSizeForXRow  = MapTile.prototype.getSumSize;
	}



		MapTile.prototype._clearMapImagePosInfo = function(){
			this.mapPosInfo = null;
		}

		MapTile.prototype._getMapImagePosInfo = function(){

			// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
			// set the size of a 256 map image tile. 1px = 1m

			if (!this.mapPosInfo){

				var height = this.getLenFromCamToCentre(
					this.getViewAreaOnZPlane(),
					this.viewer.getCurrentViewpointInfo().position
				);

				var zoomLevel = this.getZoomLevel(height);

				var mPerPxTable = {
					0:	156543.03,
					1:	78271.52,
					2:	39135.76,
					3:	19567.88,
					4:	9783.94	,
					5:	4891.97	,
					6:	2445.98,
					7:	1222.99	,
					8:	611.50	,
					9:	305.75	,
					10:	152.87,
					11:	76.437,
					12:	38.219,
					13:	19.109,
					14:	9.5546,
					15:	4.7773,
					16:	2.3887,
					17:	1.1943,
					18:	0.5972
				};

				var slippyPoints = this._getSlippyTileLayerPoints(this.settings.mapTile.lat, this.settings.mapTile.lon, zoomLevel);

				var x = slippyPoints.x;
				var y = slippyPoints.y;

				var mapImgsize = mPerPxTable[zoomLevel] * Math.cos(this._degToRad(this._tile2lat(y, zoomLevel))) * 256 * this.meterPerPixel;
				var osGridRef = OsGridRef.latLonToOsGrid(new LatLon(this._tile2lat(y, zoomLevel), this._tile2long(x ,zoomLevel)));

				//console.log('map images osgridref', osGridRef);
				var offsetX = (osGridRef.easting - this.originBNG.easting) * this.meterPerPixel + mapImgsize / 2;
				var offsetY = (this.originBNG.northing - osGridRef.northing) * this.meterPerPixel + mapImgsize / 2;

				this.mapPosInfo = {
					x: x,
					y: y,
					offsetX: offsetX,
					offsetY: offsetY,
					zoomLevel: zoomLevel,
					slippyPoints: slippyPoints,
					mPerPxTable: mPerPxTable
				};
			}


			return this.mapPosInfo;

		}

	//secret little functions to help in-browser alignment

	MapTile.prototype._startMoveImages = function(){

		this._moveStep = 10;
		var self = this;

		this._moveImagesListener = function(e){
			if(e.code === 'ArrowUp'){
				self._moveMapImages(0, -self._moveStep);
			} else if(e.code === 'ArrowLeft'){
				self._moveMapImages(-self._moveStep, 0);
			} else if(e.code === 'ArrowDown'){
				self._moveMapImages(0, self._moveStep);
			} else if(e.code === 'ArrowRight'){
				self._moveMapImages(self._moveStep, 0);
			}
		};

		document.addEventListener('keyup', this._moveImagesListener);
	};

	MapTile.prototype._stopMoveImages = function(){
		document.removeEventListener('keyup', this._moveImagesListener);
	};


	MapTile.prototype._moveMapImages = function(dx, dy){

		this.sumD = this.sumD || [0, 0];
		this.imagesDoms.forEach(function(dom){

			var t = dom.getAttribute('translation').split(' ');

			t.forEach(function(number, i){
				t[i] = parseFloat(number);
			});

			t[0] += dx;
			t[2] += dy;

			dom.setAttribute('translation', t.join(' '));
		});

		this.sumD[0] += dx;
		this.sumD[1] += dy;
	};

	MapTile.prototype._newOrigin = function(){

		var sumD = this.sumD;

		return OsGridRef.osGridToLatLon(
			OsGridRef(
				this.originBNG.easting - sumD[0]
				,this.originBNG.northing + sumD[1]
			)
		);
	};

	MapTile.prototype._setNewOrigin = function(){

		var sumD = this.sumD;
		this.viewer.originBNG = OsGridRef(
			this.originBNG.easting - sumD[0]
			,this.originBNG.northing + sumD[1]
		);
		this.mapPosInfo = null;
		this.sumD = [0,0];
	}

	MapTile.prototype._moveMapImagesY = function (y){

		this.viewer.imagesDoms.forEach(function(dom){

			var t = dom.getAttribute('translation').split(' ');

			t.forEach(function(number, i){
				t[i] = parseFloat(number);
			});

			t[1] = y;

			dom.setAttribute('translation', t.join(' '));
		});
	}

	MapTile.prototype._clearAllPlanes = function(){

		var self = this;
		if(this._planes){
			this._planes.forEach(function(p){
				self.viewer.getScene().removeChild(p);
			});
		}

		this._planes = [];
	}

	MapTile.prototype._appendPlane = function(p){
		this._planes = this.planes || [];
		this._planes.push(p);
		this.viewer.getScene().appendChild(p);
	}

	MapTile.prototype._drawPlaneOnZ = function(coords, color){

		var coordIndex = '';

		var center = [0, 0, 0];
		center[0] = (coords[0][0] + coords[1][0], + coords[2][0] + coords[3][0]) / 4;
		center[2] = (coords[0][2] + coords[1][2], + coords[2][2] + coords[3][2]) / 4;

		function less(a, b){
		    if (a[0] - center[0] >= 0 && b[0] - center[0] < 0)
		        return true;
		    if (a[0] - center[0] < 0 && b[0] - center[0] >= 0)
		        return false;
		    if (a[0] - center[0] == 0 && b[0] - center[0] == 0) {
		        if (a[2] - center[2] >= 0 || b[2] - center[2] >= 0)
		            return a[2] > b[2];
		        return b[2] > a[2];
		    }

		    // compute the cross product of vectors (center -> a) x (center -> b)
		    var det = (a[0] - center[0]) * (b[2] - center[2]) - (b[0] - center[0]) * (a[2] - center[2]);
		    if (det < 0)
		        return true;
		    if (det > 0)
		        return false;

		    // points a and b are on the same line from the center
		    // check which point is closer to the center
		    var d1 = (a[0] - center[0]) * (a[0] - center[0]) + (a[2] - center[2]) * (a[2] - center[2]);
		    var d2 = (b[0] - center[0]) * (b[0] - center[0]) + (b[2] - center[2]) * (b[2] - center[2]);
		    return d1 > d2;
		}

		coords.sort(less);

		for(var i=0; i < coords.length; i++){
			coordIndex += ' ' + i;
		}

		coordIndex += ' -1';

		var coordsFlatten = [];

		coords.forEach(function(coord){
			coordsFlatten = coordsFlatten.concat(coord);
		});

		var containerNode = document.createElement('div');
		containerNode.innerHTML = "" +
		"	<shape>" +
		"		<appearance>" +
		"			<material diffuseColor='" + color.join(' ') + "' transparency='0.7'></material>" +
		"		</appearance>" +
		"		<IndexedFaceSet ccw='true' colorPerVertex='false' solid='false' coordIndex='" + coordIndex + "'>" +
		"			<coordinate point='" +  coordsFlatten.join(' ') + "'></coordinate>" +
		"		</IndexedFaceSet>" +
		"	</shape>";

		return containerNode.children[0];
	};

	MapTile.prototype.appendMapImage = function(ox, oy){

		var posInfo = this._getMapImagePosInfo();

		var x = posInfo.x;
		var y = posInfo.y;
		var offsetX = posInfo.offsetX;
		var offsetY = posInfo.offsetY;

		var mapHeight = this.settings.mapTile.y ? this.settings.mapTile.y : 0;

		var size = this.getMapSize(oy);

		if (!this.addedMapImages) {
			this.addedMapImages = {};
		}

		if(!this.imagesDoms){
			this.imagesDoms = [];
		}

		if(!this.addedMapImages[ox + ',' + oy]){

			// console.log('ox, oy', ox, oy);
			// console.log('size', size);
			// console.log('getSumSizeForXRow', self.getSumSizeForXRow(ox, oy))
			// console.log('size form sum size', self.getSumSizeForXRow(ox, oy) / ox);

			var dom = this.createMapImageTile(size, x + ox, y + oy, [
				offsetX + this.getSumSizeForXRow(ox, oy),
				mapHeight,
				offsetY + this.getSumSize(oy)
			]);

			this.imagesDoms.push(dom);
			this.viewer.getScene().appendChild(dom);
			this.addedMapImages[ox + ',' + oy] = 1;

			return true;
		} else {
			return false;
		}


	};

	MapTile.prototype.removeMapImages = function(){

		var self = this;
		if(this.imagesDoms){
			this.imagesDoms.forEach(function(dom){
				self.viewer.getScene().removeChild(dom);
			});
		}
		this.imagesDoms = [];
		this.addedMapImages = {};
		this.mapSizes = [];
	}


	MapTile.prototype.getLenFromCamToCentre = function(viewAreaCoors, camera){

		var centre = this.centreOfVecs(viewAreaCoors);

		var lenToCentreVec = [
			camera[0] - centre[0],
			camera[1] - centre[1],
			camera[2] - centre[2]
		];

		var len = this._vec3Len(lenToCentreVec);

		return len;
	};

	MapTile.prototype.getZoomLevel = function(height){

		var self = this;

		var yToZoomLevel = [
			{y: 500000, zoomLevel: 7},
			{y: 300000, zoomLevel: 8},
			{y: 109000, zoomLevel: 9},
			{y: 58800, zoomLevel: 10},
			{y: 30709, zoomLevel: 11},
			{y: 16800, zoomLevel: 12},
			{y: 8000, zoomLevel: 13},
			{y: 4500, zoomLevel: 14},
			{y: 2000, zoomLevel: 15},
			{y: 1000, zoomLevel: 16},
			{y: 500, zoomLevel: 17},
			{y: 250, zoomLevel: 18},
			{y: 0, zoomLevel: 18},

		];

		yToZoomLevel.forEach(function(map){
			map.y *= self.meterPerPixel
		});

		var zoomLevel;


		for(var i=0; i < yToZoomLevel.length; i++){

			if(height >= yToZoomLevel[i].y){
				zoomLevel = yToZoomLevel[i].zoomLevel;
				break;
			}
		}

		return zoomLevel;

	};

	MapTile.prototype.getViewAreaOnZPlane = function(){

		var vpInfo = this.viewer.getCurrentViewpointInfo();
		var fov = vpInfo.fov;
		var camera = vpInfo.position;
		var view_dir = vpInfo.view_dir;
		var ratio = vpInfo.aspect_ratio; //(w/h)
		var up = vpInfo.up;
		var right = vpInfo.right;

		var tanHalfFOV = Math.tan(fov / 2);
		var planeOffsetX = [1, -1, 1, -1];
		var planeOffsetY = [1, 1, -1, -1];
		var viewAreaCoors = [];

		for(var i = 0; i < planeOffsetX.length; i++)
		{
			var X = planeOffsetX[i];
			var Y = planeOffsetY[i];

			var rayDirection = [];

			for (var c = 0; c < 3; c++)
			{
				rayDirection[c] = view_dir[c] + X * tanHalfFOV * right[c] + Y * (ratio / tanHalfFOV) * up[c];
			}

			var gamma = camera[1] / -rayDirection[1];

			//console.log("G: ", gamma);

			viewAreaCoors[i] = [];

			for (var c = 0; c < 3; c++)
			{
				viewAreaCoors[i][c] = camera[c] + gamma * rayDirection[c];
			}
		}

		return viewAreaCoors;
	}

	MapTile.prototype.centreOfVecs = function(vectors){

		var centre = [];

		vectors[0].forEach(function(value, i){
			centre[i] = 0;
		});

		vectors.forEach(function(vector){
			vector.forEach(function(value, i){
				centre[i] += value;
			});
		});

		centre.forEach(function(value, i){
			centre[i] = value / vectors.length;
		});

		return centre;
	}

	MapTile.prototype.isLookingToInf = function(viewAreaCoors){

		var farVec = [viewAreaCoors[1][0] - viewAreaCoors[0][0], viewAreaCoors[1][2] - viewAreaCoors[0][2]];
		var nearVec = [viewAreaCoors[3][0] - viewAreaCoors[2][0], viewAreaCoors[3][2] - viewAreaCoors[2][2]];

		return !(this._hasSameSign(farVec[0], nearVec[0]) && this._hasSameSign(farVec[1], nearVec[1]));

	};

	//transform centre of the view area to lat,lon
	MapTile.prototype.getLatLonOfViewArea = function(viewAreaCoors){

		//var centrePoint = this.centreOfVecs(viewAreaCoors);
		// cam pos is ok
		var centrePoint = this.viewer.getCurrentViewpointInfo().position;

		// var p = self._drawPlaneOnZ([

		// 	[centrePoint[0] + 10, 10, centrePoint[2] + 10],
		// 	[centrePoint[0] - 10, 10, centrePoint[2] + 10],
		// 	[centrePoint[0] - 10, 10, centrePoint[2] - 10],
		// 	[centrePoint[0] + 10, 10, centrePoint[2] - 10],

		// ], [1, 0, 0]);

		// self.getScene().appendChild(p);

		var mapImgPosInfo = this._getMapImagePosInfo();

		//convert centre point back to lat, long
		var mapXY = [
			this.findMapTileNoByPos(centrePoint[0]),
			this.findMapTileNoByPos(centrePoint[2])
		];

		var imageSceneCoor = [mapImgPosInfo.offsetX + this.getSumSizeForXRow(mapXY[0], mapXY[1]), 0, mapImgPosInfo.offsetY + this.getSumSize(mapXY[1])];


		var dx = centrePoint[0] - this.getSumSizeForXRow(mapXY[0], mapXY[1]) - mapImgPosInfo.offsetX;
		var dy = centrePoint[2] - this.getSumSize(mapXY[1]) - mapImgPosInfo.offsetY;


		var mapSize = this.getMapSize(mapXY[1]);
		var osImagePoint = OsGridRef.latLonToOsGrid(new LatLon(
			this._tile2lat(mapXY[1] + mapImgPosInfo.slippyPoints.y, this.zoomLevel),
			this._tile2long(mapXY[0] + mapImgPosInfo.slippyPoints.x, this.zoomLevel)
		));

		var k = this.meterPerPixel;
		var latlon = OsGridRef.osGridToLatLon(OsGridRef(
			(dx + osImagePoint.easting * k  + mapSize / 2) / k,
			(osImagePoint.northing * k - mapSize / 2 - dy) / k
		));

		return latlon;
	}


	MapTile.prototype.osCoorToSceneCoor = function(osCoor){
		return [
			osCoor.easting - this.originBNG.easting,
			this.originBNG.northing - osCoor.northing
		];
	}
	// trigger update URL event
	MapTile.prototype.triggerUpdateURLEvent = function(lat, lon, height, view, up){

		this.eventCallback(this.viewer.EVENT.UPDATE_URL ,{
			'at': [lat, lon, height].join(','),
			'view': view,
			'up': up
		});
	};

	MapTile.prototype.rotatePloygon = function(viewAreaCoors, centre, deg){

		//clone
		viewAreaCoors = JSON.parse(JSON.stringify(viewAreaCoors));

		viewAreaCoors.forEach(function(coor){

			// move centre to origin
			coor.forEach(function(value, i){
				coor[i] = coor[i] - centre[i];
			});

			coor[0] = coor[0] * Math.cos(Math.PI) - coor[2] * Math.sin(deg);
			coor[2] = coor[0] * Math.sin(Math.PI) + coor[2] * Math.cos(deg);

			//move back
			coor.forEach(function(value, i){
				coor[i] = coor[i] + centre[i];
			});
		});

		return viewAreaCoors;

	};

	// Append building models and map tile images
	MapTile.prototype.appendMapTileByViewPoint = function(noDraw){

		console.log('appendMapTileByViewPoint', this.originBNG);

		if(!this.originBNG){
			console.log('originBNG not found');
			return;
		}

		var self = this;
		var vpInfo = this.viewer.getCurrentViewpointInfo();
		var camera = vpInfo.position;

		//console.log('camera', camera);

		var mapImgPosInfo = this._getMapImagePosInfo();

		var viewAreaCoors = this.getViewAreaOnZPlane();
		var lookingToInf = this.isLookingToInf(viewAreaCoors);

		var len = this.getLenFromCamToCentre(viewAreaCoors, camera);
		var zoomLevel = this.getZoomLevel(len);

		if(this.zoomLevel !== zoomLevel){
			this.removeMapImages();
			this._clearMapImagePosInfo();
			this.zoomLevel= zoomLevel;
		}

		// update url with current lat,lon at centre of the view area
		var viewAreaLatLon = this.getLatLonOfViewArea(viewAreaCoors);

		var view_dir = this.viewer.getCurrentViewpointInfo().view_dir;
		var up = this.viewer.getCurrentViewpointInfo().up;


		this.triggerUpdateURLEvent(
			viewAreaLatLon.lat,
			viewAreaLatLon.lon,
			camera[1],
			view_dir.join(','),
			up.join(',')
		);

		// variables named according to this polygon and coordinate variables
		// c------d  <-- far
		// \      /
		//  a----b  <-- near

		var a, b, c, d;

		//self._clearAllPlanes();
		a = viewAreaCoors[3];
		b = viewAreaCoors[2];
		c = viewAreaCoors[1];
		d = viewAreaCoors[0];

		if(lookingToInf){
			//rotate 180 deg around top center of the polygon
			var rotatedViewAreaCoors = this.rotatePloygon(
				viewAreaCoors,
				this.centreOfVecs([a,b]),
				Math.PI
			);

			// when looking to inf ray shooting backwards, c,d position is flipped
			a = rotatedViewAreaCoors[3];
			b = rotatedViewAreaCoors[2];
			c = rotatedViewAreaCoors[0];
			d = rotatedViewAreaCoors[1];
		}


		function LenVec2D(vecA, vecB){
			return Math.sqrt(
				Math.pow(vecA[0] - vecB[0], 2) +
				Math.pow(vecA[1] - vecB[1], 2)
			);
		}

		// get coordinate on a->c vector
		function getCoorOnAC(k){
			return [
				a[0] + k * (c[0] - a[0]),
				a[2] + k * (c[2] - a[2])
			];
		}

		// get coordinate on b->d vector
		function getCoorOnBD(k){
			return [
				b[0] + k * (d[0] - b[0]),
				b[2] + k * (d[2] - b[2])
			];
		}

		// get vecrtical coordinate, direction parallels to a->b , if ky = 0, it is euqal to get coordinate on a->b vector
		function getCoorVertical(kx, ky){

			var start, end;
			start = getCoorOnAC(ky);
			end = getCoorOnBD(ky);

			return [
				start[0] + kx *(end[0] - start[0]),
				start[1] + kx *(end[1] - start[1])
			];
		}

		//iterate every point(x,y) in view area
		function viewAreaIterate(options){

			var genStepX = options.genStepX;
			var genStepY = options.genStepY;
			var yCond = options.yCond;
			var xCond = options.xCond;
			var callback = options.callback;

			var horVecLen = LenVec2D([a[0], a[2]], [c[0], c[2]]);
			var stepY = genStepY(a, horVecLen);

			for(var ky = -stepY; ky <= 1 + stepY && yCond(); ky += stepY){

				var startCoor = getCoorVertical(0, ky);
				var endCoor = getCoorVertical(1, ky);
				var vertVecLen = LenVec2D(endCoor, startCoor);

				var stepX = genStepX(startCoor, vertVecLen);

				for(var kx = -stepX; kx <= 1 + stepX && xCond(); kx += stepX){

					var coor = getCoorVertical(kx, ky);
					callback(coor);
					stepX = genStepX(coor, vertVecLen);
				}

				stepY = genStepY(startCoor, horVecLen);
			}
		}

		var mapImagesCount = 0;
		var maxImageCount = 200;


		var getStep = function (coor, vecLen){
			var yCoor = coor[1];
			var imageSize = self.getMapSizeByYCoor(yCoor);
			return imageSize / vecLen / 2;
		};

		var cond = function(){
			return mapImagesCount < maxImageCount;
		};

		// append map images
		viewAreaIterate({
			genStepY: getStep,
			genStepX: getStep,
			yCond: cond,
			xCond: cond,
			callback: function(coor){
				var imageSize = self.getMapSizeByYCoor(coor[1]);

				var mapImgX = Math.floor( coor[0] / imageSize );
				var mapImgZ = Math.floor( coor[1] / imageSize );

				var appended = self.appendMapImage(mapImgX, mapImgZ);

				if(appended){
					mapImagesCount++;
				}
			}

		});

		//console.log(mapImagesCount);



		var tileCount = 0;
		var maxTileCount = 100;

		var genStep = function(coor, vecLen){
			var tileSize = 100 * self.meterPerPixel
			return tileSize / vecLen / 2;
		};

		cond = function(){

			return tileCount < maxTileCount;
		};
		// append 3d models
		if(!noDraw && this.shouldDraw3DBuildings(this.zoomLevel)){

			viewAreaIterate({
				genStepY: genStep,
				genStepX: genStep,
				yCond: cond,
				xCond: cond,
				callback: function(coor){

					var osRef = new OsGridRef(
						self.originBNG.easting + (coor[0] / self.meterPerPixel),
						self.originBNG.northing - (coor[1] / self.meterPerPixel)
					);
					var osrefno = self._OSRefNo(osRef, 3);

					var appended = self.appendMapTile(osrefno);

					if(appended){
						tileCount++;
					}
				}
			});

			//console.log(tileCount);
		}

	};


	MapTile.prototype.shouldDraw3DBuildings = function(zoomLevel){
		return zoomLevel >= 17;
	};

	MapTile.prototype._hasSameSign = function(a, b){
		return a <= 0 && b <= 0 || a >=0 && b >= 0
	};

	MapTile.prototype._roundUpToTen = function(n){
		var roundUpPlace = 10;
		return Math.ceil(n / roundUpPlace) * roundUpPlace;
	}

	// TO-DO: Move helper functions to somewhere else?
	//length 1 = 1m, 2 = 10m, 3 = 100m, 4 = 1km, 5 = 10km
	MapTile.prototype._OSRefNo = function(osRef, length){

		if (length < 1 || length > 5){
			return console.log('length must be in range [1 - 5]');
		}

		var osrefno = osRef.toString().split(' ');
		osrefno[1] = osrefno[1].substring(0, length);
		osrefno[2] = osrefno[2].substring(0, length);
		osrefno = osrefno.join('');

		return osrefno;
	};

	MapTile.prototype._tile2long = function (x, z) {
		return (x/Math.pow(2,z)*360-180);
	}

	MapTile.prototype._tile2lat = function (y, z) {
		var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
		return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	}

	MapTile.prototype._degToRad = function(degrees) {
		return degrees * Math.PI / 180;
	};

	//http://stackoverflow.com/questions/22032270/how-to-retrieve-layerpoint-x-y-from-latitude-and-longitude-coordinates-using
	MapTile.prototype._getSlippyTileLayerPoints = function (lat_deg, lng_deg, zoom) {
		var x = (Math.floor((lng_deg + 180) / 360 * Math.pow(2, zoom)));
		var y = (Math.floor((1 - Math.log(Math.tan(lat_deg * Math.PI / 180) + 1 / Math.cos(lat_deg * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));

		var layerPoint = {
			x: x,
			y: y
		};

		return layerPoint;
	};

	MapTile.prototype.os_clickBuildingObject = function(objEvent){

		if (objEvent.partID) {
			this.eventCallback(this.viewer.EVENT.OS_BUILDING_CLICK,{
				id : objEvent.partID
			});
		}
	}

	MapTile.prototype.appendMapTile = function(osGridRef){

		if(!this.originBNG){
			//return console.log('No origin BNG coors set, no map tiles can be added.');
		}

		this.addedTileRefs =  this.addedTileRefs || [];

		if(this.addedTileRefs.indexOf(osGridRef) !== -1) {
			//console.log(osGridRef + ' has already been added');
			return false;
		}

		this.addedTileRefs.push(osGridRef);

		var gltf = document.createElement('gltf');
		gltf.setAttribute('onclick', 'os_clickBuildingObject(event)');
		gltf.setAttribute('url', server_config.apiUrl(server_config.MAP_API, 'os/buildings.gltf?method=osgrid&osgridref=' + osGridRef + '&draw=1'));

		var translate = [0, 0, 0];
		var osCoor = OsGridRef.parse(osGridRef);

		//translate[0] = osCoor.easting - this.originBNG.easting;
		//translate[2] = this.originBNG.northing - osCoor.northing;

		var mapImagePosInfo = this._getMapImagePosInfo();

		var tileLatLon = OsGridRef.osGridToLatLon(osCoor);
		var correspondingMapTile = this._getSlippyTileLayerPoints(tileLatLon.lat, tileLatLon.lon, mapImagePosInfo.zoomLevel)

		var y = correspondingMapTile.y - mapImagePosInfo.slippyPoints.y;
		// var nextY = correspondingMapTile.y >= 0 ? y + 1 : y - 1;
		// var mapSize = this.getSumSize(nextY) - this.getSumSize(y);

		var mapSize = this.getMapSize(y);

		var corMapTileBNG = OsGridRef.latLonToOsGrid(new LatLon(
			this._tile2lat(correspondingMapTile.y, mapImagePosInfo.zoomLevel),
			this._tile2long(correspondingMapTile.x, mapImagePosInfo.zoomLevel)
		));

		//dx,dy of 3dmap tiles to map image tiles
		var dx = osCoor.easting * this.meterPerPixel - (corMapTileBNG.easting  * this.meterPerPixel + mapSize / 2);
		var dy = (corMapTileBNG.northing * this.meterPerPixel - mapSize / 2) - osCoor.northing * this.meterPerPixel;

		translate[0] = (correspondingMapTile.x - mapImagePosInfo.slippyPoints.x) * mapSize + dx + mapImagePosInfo.offsetX
		translate[2] = (correspondingMapTile.y - mapImagePosInfo.slippyPoints.y) * mapSize + dy + mapImagePosInfo.offsetY


		// this._appendPlane(this._drawPlaneOnZ([

		// 	[translate[0] + 100, 10, translate[2] + 100],
		// 	[translate[0] - 100, 10, translate[2] + 100],
		// 	[translate[0] - 100, 10, translate[2] - 100],
		// 	[translate[0] + 100, 10, translate[2] - 100],

		// ], [1, 0, 0]));

		// if(!this.gltfDoms){
		// 	this.gltfDoms = [];
		// }

		var scale = document.createElement('Transform');
		var mPerPx = this.meterPerPixel;
		scale.setAttribute('scale', [mPerPx, mPerPx, mPerPx].join(','));
		scale.appendChild(gltf);

		var transform = document.createElement('transform');
		transform.setAttribute('translation', translate.join(' '));


		transform.appendChild(scale);
		//this.gltfDoms.push(transform);
		this.viewer.getScene().appendChild(transform);

		return transform;
	};


	MapTile.prototype.createMapImageTile = function(size, x, y, t){

		var shape = document.createElement("Shape");

		var app = document.createElement('Appearance');

		var it = document.createElement('ImageTexture');

		var mapImagePosInfo = this._getMapImagePosInfo();


		var material = document.createElement('material');

		// var color = [51 / 255, 165  / 255, 255  / 255];
		// material.setAttribute('emissiveColor', color.join(' '));
		// material.setAttribute('transparency', 0.7)
		// app.appendChild(material);


		it.setAttribute("url", server_config.apiUrl(server_config.MAP_API, 'os/map-images/Outdoor/' + mapImagePosInfo.zoomLevel + '/' + x + '/' + y + '.png'));
		it.setAttribute("crossOrigin", "use-credentials");

		app.appendChild(it);

		shape.appendChild(app);

		var plane = document.createElement('Plane');
		plane.setAttribute('center', '0, 0');
		plane.setAttribute('size', [size, size].join(','));
		plane.setAttribute('solid', false);
		plane.setAttribute('lit', false);

		shape.appendChild(plane);

		var rotate = document.createElement('Transform');
		// rotate 270Deg around x
		rotate.setAttribute('rotation', '1,0,0,4.7124');
		rotate.appendChild(shape);

		var translate = document.createElement('Transform');
		translate.setAttribute('translation', t.join(' '));
		translate.appendChild(rotate);

		return translate;
	};

	MapTile.prototype._vec3Len = function(vec){
		return Math.sqrt(
			Math.pow(vec[0], 2)
			+ Math.pow(vec[1], 2)
			+ Math.pow(vec[2], 2)
		);
	}


}());

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

var MeasureTool = {};

(function() {
    "use strict";

    MeasureTool = function(viewer){
        var self = this;

        this.viewer = viewer;

        this.lineStarted       = false;
        this.inMeasureMode     = false;
        this.measureCoords     = [null, null];
        this.measureLine       = null;
        this.measureLineCoords = null;

        this.measureMouseMove = function(event)
        {
            var viewArea = self.viewer.getViewArea();
            var pickingInfo = viewArea._pickingInfo;

            self.measureCoords[1] = pickingInfo.pickPos;
            self.updateMeasureLine();
        };

        this.measureMouseDown = function(event)
        {
            var viewArea = self.viewer.getViewArea();
            var pickingInfo = viewArea._pickingInfo;

                if (!self.lineStarted)
                {
                    self.measureCoords[0] = pickingInfo.pickPos;
                    self.lineStarted      = true;

                    self.createMeasureLine();
                    self.viewer.onMouseMove(self.measureMouseMove);
                } else {
                    self.measureCoords[1] = pickingInfo.pickPos;
                    self.lineStarted      = false;

                    self.viewer.offMouseMove(self.measureMouseMove);
                }
        };
    };

    MeasureTool.prototype.measureMode = function (on) {
        var self = this;

        var element = document.getElementById("x3dom-default-canvas");
        if (on) {
            self.inMeasureMode   = true;
            element.style.cursor = "crosshair";
            self.viewer.onMouseDown(self.measureMouseDown);
            self.viewer.onMouseMove(self.measureMouseMove);

            self.viewer.highlightObjects();

            // Switch off the pick point functionality
            self.viewer.disableClicking();
        } else {
            self.inMeasureMode   = false;
            self.deleteMeasureLine();
            element.style.cursor = "-webkit-grab";
            self.viewer.offMouseDown(self.measureMouseDown);
            self.viewer.offMouseMove(self.measureMouseMove);

            // Restore the previous functionality
            self.viewer.enableClicking();
        }
    };

    MeasureTool.prototype.createMeasureLine = function() {
        var self = this;

        if (self.measureLine !== null)
        {
            self.deleteMeasureLine();
        }

        var lineDepth,
            lineApp,
            line,
            colors;

        var line = document.createElement("LineSet");
        line.setAttribute("vertexCount", 8);

        self.measureLineCoords = document.createElement("Coordinate");
        self.measureLineCoords.setAttribute("point", "0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0");
        line.appendChild(self.measureLineCoords);

        var colors = document.createElement("Color");
        colors.setAttribute("color", "0 1 0,0 1 0,1 0 0,1 0 0,0 0 1,0 0 1, 1 1 1, 1 1 1");
        line.appendChild(colors);

        var lineDepth = document.createElement("DepthMode");
        lineDepth.setAttribute("depthFunc", "ALWAYS");

        var lineApp = document.createElement("Appearance");
        lineApp.appendChild(lineDepth);

        var lineProperties = document.createElement("LineProperties");
        lineProperties.setAttribute("linewidthScaleFactor", 3.0);
        lineApp.appendChild(lineProperties);

        self.measureLine = document.createElement("Shape");
        self.measureLine.appendChild(lineApp);
        self.measureLine.appendChild(line);

        self.viewer.scene.appendChild(self.measureLine);
    };

    MeasureTool.prototype.updateMeasureLine = function()
    {
        var self = this;

        if (self.lineStarted)
        {
        var coordString = "";

            if (self.measureCoords[0] !== null && self.measureCoords[1] !== null)
            {
                var startCoordArray = self.measureCoords[0].toGL();
                var endCoordArray   = self.measureCoords[1].toGL();

                coordString += startCoordArray.join(" ") + ",";
                coordString += startCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += startCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += endCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += endCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += endCoordArray.join(" ") + ",";
                coordString += endCoordArray.join(" ") + ",";
                coordString += startCoordArray.join(" ");

                self.measureLineCoords.setAttribute("point", coordString);
            }
        }
    };

    MeasureTool.prototype.deleteMeasureLine = function () {
        var self = this;

        if (self.measureLine !== null) {
            self.measureLine.parentElement.removeChild(self.measureLine);
            self.measureLine = null;
            self.measureLineCoords = null;
        }
    };
})();


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
	var GHOST_OPACITY = 0.1;
	var OPAQUE_OPACITY = 1.0 - GHOST_OPACITY;

	/*
	 * Pin shape constructor and manipulator
	 *
	 * @constructor
	 * @this {Pin}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {Viewer} parentViewer - Parent viewer
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 */
	Pin = function(id, element, trans, position, norm, scale, colours, viewpoint) {
		var self = this;

		self.id = id;

		self.highlighted = false;

		self.element = element;
		self.trans = trans;
		self.scale = scale;
		self.viewpoint = viewpoint;

		self.ghostConeIsHighlighted = null;
		self.coneIsHighlighted = null;

		self.ghostPinHeadNCol = null;
		self.pinHeadNCol = null;

		self.ghostPinHeadColour = null;
		self.pinHeadColour = null;

		self.ghostPinHeadIsHighlighted = null;
		self.pinHeadIsHighlighted = null;

		self.coneDepth = null;
		self.pinHeadDepth = null;

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

		var parent = document.createElement("MatrixTransform");
		parent.setAttribute("id", self.id);
		parent.setAttribute("matrix", trans.toGL().toString());

		// Transform the normal into the coordinate frame of the parent
		self.modelTransform = document.createElement("Transform");

		var axisAngle = ViewerUtil.rotAxisAngle([0, 1, 0], norm);
		self.modelTransform.setAttribute("rotation", axisAngle.toString());
		self.modelTransform.setAttribute("translation", position.join(" "));

		parent.appendChild(self.modelTransform);

		colours = colours.join(" ");
		this.createBasicPinShape(self.modelTransform, "ALWAYS", GHOST_OPACITY, true);
		this.createBasicPinShape(self.modelTransform, "LESS", OPAQUE_OPACITY, false);

		self.element.appendChild(parent);
	};

	Pin.prototype.remove = function(id) {
		var pinPlacement = document.getElementById(id);
		if (pinPlacement !== null) {
			pinPlacement.parentElement.removeChild(pinPlacement);
		}
	};

	Pin.prototype.changeColour = function(colours) {
		var self = this;
		// Find both the material for the ghosted pin and the opaque pin

		if ((typeof colours === "undefined") || (!colours.length)) {
			colours = GREY_PIN;
		}

		if (typeof colours[0] === "number") {
			self.numColours = 1;
		} else {
			self.numColours = colours.length;
		}

		self.colours = colours;

		self.pinHeadNCol.setAttribute("value", self.numColours);
		self.pinHeadColour.setAttribute("value", self.colours.join(" "));

		self.ghostPinHeadNCol.setAttribute("value", self.numColours);
		self.ghostPinHeadColour.setAttribute("value", self.colours.join(" "));
	};

	Pin.prototype.highlight = function()
	{
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

	Pin.prototype.createBasicPinShape = function(parent, depthMode, opacity, ghostPin) {
		var self = this;

		var ORANGE_HIGHLIGHT = "1.0000 0.7 0.0";

		var coneHeight = PIN_HEIGHT - 2 * PIN_RADIUS;
		var pinshape = document.createElement("Group");
		pinshape.setAttribute("onclick", "clickPin(event)");

		var pinshapeapp = document.createElement("Appearance");
		//pinshape.appendChild(pinshapeapp);

		var pinshapescale = document.createElement("Transform");
		pinshapescale.setAttribute("scale", self.scale + " " + self.scale + " " + self.scale);
		pinshape.appendChild(pinshapescale);

		var pinshapeconetrans = document.createElement("Transform");
		pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeconetrans);

		var pinshapeconerot = document.createElement("Transform");

		pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
		pinshapeconetrans.appendChild(pinshapeconerot);

		var pinshapeconeshape = document.createElement("Shape");
		pinshapeconerot.appendChild(pinshapeconeshape);

		var pinshapecone = document.createElement("Cone");
		pinshapecone.setAttribute("bottomRadius", (PIN_RADIUS * 0.5).toString());
		pinshapecone.setAttribute("height", coneHeight.toString());

		var coneApp = pinshapeapp.cloneNode(true);

		var coneshader = document.createElement("ComposedShader");
		coneApp.appendChild(coneshader);

		var coneMat = document.createElement("Material");
		coneMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
		coneMat.setAttribute("transparency", opacity);
		coneApp.appendChild(coneMat);

		var conehighlight = document.createElement("field");
		conehighlight.setAttribute("type", "SFVec3f");
		conehighlight.setAttribute("name", "highlightColor");
		conehighlight.setAttribute("value", ORANGE_HIGHLIGHT);
		coneshader.appendChild(conehighlight);

		var coneishighlighted = document.createElement("field");
		//coneishighlighted.setAttribute("id", self.id + "_cone" + (ghostPin ? "_ghost" : "") + "_ishighlighted");
		coneishighlighted.setAttribute("type", "SFBool");
		coneishighlighted.setAttribute("name", "highlightPin");
		coneishighlighted.setAttribute("value", "false");
		coneshader.appendChild(coneishighlighted);

		if (ghostPin)
		{
			self.ghostConeIsHighlighted = coneishighlighted;
		} else {
			self.coneIsHighlighted = coneishighlighted;
		}

		var coneuseclipplane = document.createElement("field");
		coneuseclipplane.setAttribute("type", "SFBool");
		coneuseclipplane.setAttribute("name", "useClipPlane");
		coneuseclipplane.setAttribute("value", ghostPin);
		coneshader.appendChild(coneuseclipplane);

		var conevert = document.createElement("ShaderPart");
		conevert.setAttribute("type", "VERTEX");
		conevert.setAttribute("USE", "noShadeVert");
		coneshader.appendChild(conevert);

		var conefrag = document.createElement("ShaderPart");
		conefrag.setAttribute("type", "FRAGMENT");
		conefrag.setAttribute("USE", "noShadeFrag");
		coneshader.appendChild(conefrag);

		var conedepth = document.createElement("DepthMode");

		if (!ghostPin) {
			self.coneDepth = conedepth;
		}

		conedepth.setAttribute("depthFunc", depthMode);
		conedepth.setAttribute("enableDepthTest", (!ghostPin).toString());
		coneApp.appendChild(conedepth);

		pinshapeconeshape.appendChild(coneApp);
		pinshapeconeshape.appendChild(pinshapecone);

		var pinshapeballtrans = document.createElement("Transform");
		pinshapeballtrans.setAttribute("translation", "0.0 " + (1.4 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeballtrans);

		var pinshapeballshape = document.createElement("Shape");
		pinshapeballtrans.appendChild(pinshapeballshape);

		var pinshapeball = document.createElement("Sphere");
		pinshapeball.setAttribute("radius", PIN_RADIUS.toString());

		var ballApp = pinshapeapp.cloneNode(true);

		pinshapeballshape.appendChild(pinshapeball);
		pinshapeballshape.appendChild(ballApp);

		var pinheadMat = document.createElement("Material");
		pinheadMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
		pinheadMat.setAttribute("transparency", opacity);
		ballApp.appendChild(pinheadMat);

		var pinshader = document.createElement("ComposedShader");
		ballApp.appendChild(pinshader);

		var pinheadradius = document.createElement("field");
		pinheadradius.setAttribute("type", "SFFloat");
		pinheadradius.setAttribute("name", "radius");
		pinheadradius.setAttribute("value", PIN_RADIUS.toString());
		pinshader.appendChild(pinheadradius);

		var pinheadncol = document.createElement("field");
		//self.pinheadncol.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_ncol");
		pinheadncol.setAttribute("type", "SFFloat");
		pinheadncol.setAttribute("name", "numColours");
		pinheadncol.setAttribute("value", self.numColours);
		pinshader.appendChild(pinheadncol);

		if (ghostPin)
		{
			self.ghostPinHeadNCol = pinheadncol;
		} else {
			self.pinHeadNCol = pinheadncol;
		}

		var pinheadcolor = document.createElement("field");
		//self.pinheadcolor.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_col");
		pinheadcolor.setAttribute("type", "MFFloat");
		pinheadcolor.setAttribute("name", "multicolours");
		pinheadcolor.setAttribute("value", self.colours);
		pinshader.appendChild(pinheadcolor);

		if (ghostPin)
		{
			self.ghostPinHeadColour = pinheadcolor;
		} else {
			self.pinHeadColour = pinheadcolor;
		}

		var pinheadhighlight = document.createElement("field");
		pinheadhighlight.setAttribute("type", "SFVec3f");
		pinheadhighlight.setAttribute("name", "highlightColor");
		pinheadhighlight.setAttribute("value", ORANGE_HIGHLIGHT);
		pinshader.appendChild(pinheadhighlight);

		var pinheadishighlighted = document.createElement("field");
		//self.pinheadishighlighted.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_ishighlighted");
		pinheadishighlighted.setAttribute("type", "SFBool");
		pinheadishighlighted.setAttribute("name", "highlightPin");
		pinheadishighlighted.setAttribute("value", "false");
		pinshader.appendChild(pinheadishighlighted);

		if (ghostPin)
		{
			self.ghostPinHeadIsHighlighted = pinheadishighlighted;
		} else {
			self.pinHeadIsHighlighted = pinheadishighlighted;
		}

		var pinuseclipplane = document.createElement("field");
		pinuseclipplane.setAttribute("type", "SFBool");
		pinuseclipplane.setAttribute("name", "useClipPlane");
		pinuseclipplane.setAttribute("value", (!ghostPin).toString());
		pinshader.appendChild(pinuseclipplane);

		var pinvert = document.createElement("ShaderPart");
		pinvert.setAttribute("type", "VERTEX");
		pinvert.setAttribute("USE", "multiVert");
		pinshader.appendChild(pinvert);

		var pinfrag = document.createElement("ShaderPart");
		pinfrag.setAttribute("type", "FRAGMENT");
		pinfrag.setAttribute("USE", "multiFrag");
		pinshader.appendChild(pinfrag);

		var pinheaddepth = document.createElement("DepthMode");

		if (!ghostPin) {
			self.pinHeadDepth = pinheaddepth;
			//.setAttribute("id", self.id + "_depth");
		}

		pinheaddepth.setAttribute("depthFunc", depthMode);
		pinheaddepth.setAttribute("enableDepthTest", (!ghostPin).toString());
		ballApp.appendChild(pinheaddepth);

		parent.appendChild(pinshape);
	};

}());

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

var PinShader = null;

(function() {
	"use strict";
	
	PinShader = function(element) {
		var pinheadshader = document.createElement("ComposedShader");
		pinheadshader.setAttribute("ID", "pinHeadShader");

		var pinvert = document.createElement("ShaderPart");
		pinvert.setAttribute("type", "VERTEX");
		pinvert.setAttribute("DEF", "multiVert");
		pinvert.textContent = "attribute vec3 position;" +
			"\nattribute vec3 normal;" +
			"\n" +
			"\nuniform mat4 modelViewMatrix;" +
			"\nuniform mat4 modelViewMatrixInverse;" +
			"\nuniform mat4 modelViewProjectionMatrix;" +
			"\nuniform float radius;" +
			"\n" +
			"\nvarying float fragColourSelect;" +
			"\nvarying vec3 fragNormal;" +
			"\nvarying vec3 fragEyeVector;" +
			"\nvarying vec4 fragPosition;" +
			"\nvarying vec3 pinPosition;" +
			"\nvoid main()" +
			"\n{" +
			"\n\tfragEyeVector = vec3(0.2, 0.2, 0.2);" +
			"\n\tfragNormal = normal;" +
			"\n\tfragColourSelect = 1.0 - ((position.y / radius) + 1.0) / 2.0;" +
			"\n\t" +
			"\n\tpinPosition = position;" +
			"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
			"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
			"\n}";
		pinheadshader.appendChild(pinvert);

		var pinfrag = document.createElement("ShaderPart");
		pinfrag.setAttribute("type", "FRAGMENT");
		pinfrag.setAttribute("DEF", "multiFrag");
		var fragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
			"\n\tprecision highp float;" +
			"\n#else" +
			"\n\tprecision mediump float;" +
			"\n#endif" +
			"\n";

		fragSource += "\nuniform float numColours;" +
			"\nuniform float ambientIntensity;" +
			"\nuniform float transparency;" +
			"\nvarying float fragColourSelect;" +
			"\nvarying vec3 fragNormal;" +
			"\nvarying vec3 fragEyeVector;" +
			"\nvarying vec4 fragPosition;" +
			"\nvarying vec3 pinPosition;" +
			"\nuniform vec3 multicolours[20];" +
			"\nuniform mat4 viewMatrixInverse;" +
			"\nuniform bool highlightPin;" +
			"\nuniform vec3 highlightColor;" +
			"\nuniform bool useClipPlane;" +
			"\n";

		fragSource += x3dom.shader.light(1);
		fragSource += x3dom.shader.clipPlanes(1);

		fragSource += "\nvoid main()" +
			"\n{" +
			"\n\tint colourSelected = int(floor(fragColourSelect * numColours));" +
			"\n\tvec3 eye = -pinPosition.xyz;" +
			"\n\tvec3 normal = normalize(fragNormal);" +
			"\n\tvec3 ads = lighting(light0_Type, light0_Location, light0_Direction, light0_Color, light0_Attenuation, light0_Radius, light0_Intensity, light0_AmbientIntensity, light0_BeamWidth, light0_CutOffAngle, normalize(fragNormal), eye, 0.0, ambientIntensity);" +
			"\n\tvec3 ambient = light0_Color * ads.r;" +
			"\n\tvec3 diffuse = light0_Color * ads.g;" +
			"\n\tambient = max(ambient, 0.0);" +
			"\n\tdiffuse = max(diffuse, 0.0);" +
			"\n\tvec3 pinColor = vec3(0.0,0.0,0.0);" +
			"\n\tif(useClipPlane) {" +
			"\n\t\tcalculateClipPlanes();" +
			"\n\t}" +
			"\n\tfor(int colidx = 0; colidx < 20; colidx++) {" +
			"\n\t\tif(colidx == colourSelected) {" +
			"\n\t\t\tpinColor = multicolours[colidx];" + // * max(ambient + diffuse, 0.0);" +
			"\n\t\t\tpinColor = clamp(pinColor, 0.0, 1.0);" +
			"\n\t\t\tif (highlightPin) {" +
			"\n\t\t\t\tpinColor = highlightColor;" +
			"\n\t\t\t}" +
			//"\n\t\t\tpinColor = gammaEncode(pinColor);" +
			"\n\t\t\tgl_FragColor = vec4(pinColor, transparency);" +
			"\n\t\t}" +
			"\n\t}" +
			"\n}\n\n";

		//fragSource += x3dom.shader.gammaCorrectionDecl({});

		pinfrag.textContent = fragSource;
		pinheadshader.appendChild(pinfrag);

		var coneshader = document.createElement("ComposedShader");
		coneshader.setAttribute("id", "coneShader");

		var conevert = document.createElement("ShaderPart");
		conevert.setAttribute("type", "VERTEX");
		conevert.setAttribute("DEF", "noShadeVert");

		var conevertSource = "attribute vec3 position;" +
			"\nattribute vec3 normal;" +
			"\n" +
			"\nuniform mat4 modelViewMatrixInverse;" +
			"\nuniform mat4 modelViewProjectionMatrix;" +
			"\nuniform mat4 modelViewMatrix;" +
			"\n" +
			"\nvarying vec4 fragPosition;" +
			"\nvoid main()" +
			"\n{" +
			"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
			"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
			"\n}";

		conevert.textContent = conevertSource;
		coneshader.appendChild(conevert);

		var conefrag = document.createElement("ShaderPart");
		conefrag.setAttribute("type", "FRAGMENT");
		conefrag.setAttribute("DEF", "noShadeFrag");

		var coneFragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
			"\n\tprecision highp float;" +
			"\n#else" +
			"\n\tprecision mediump float;" +
			"\n#endif" +
			"\n" +
			"\nuniform vec3 diffuseColor;" +
			"\nuniform float transparency;" +
			"\nuniform bool highlightPin;" +
			"\nuniform vec3 highlightColor;" +
			"\nuniform mat4 viewMatrixInverse;" +
			"\nuniform bool useClipPlane;" +
			"\nvarying vec4 fragPosition;" +
			"\n";

		coneFragSource += x3dom.shader.clipPlanes(1);

		coneFragSource += "\nvoid main()" +
			"\n{" +
			"\n\tvec3 diffuseColor = clamp(diffuseColor, 0.0, 1.0);" +
			"\n\tif(useClipPlane) {" +
			"\n\t\tcalculateClipPlanes();" +
			"\n\t}" +
			"\n\tif (highlightPin) {" +
			"\n\t\tdiffuseColor = highlightColor;" +
			"\n\t}" +
			"\n\tgl_FragColor = vec4(diffuseColor, transparency);" +
			"\n}";

		conefrag.textContent = coneFragSource;

		coneshader.appendChild(conefrag);

		element.appendChild(pinheadshader);
		element.appendChild(coneshader);
	};
}());
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

// --------------------- Control Interface ---------------------

// Global functions to be passed to X3DOM elements
var bgroundClick, clickObject, clickPin, onMouseOver,
	onMouseDown, onMouseUp, onMouseMove, onViewpointChange,
	onLoaded, runtimeReady;

x3dom.runtime.ready = runtimeReady;

// ----------------------------------------------------------
var Viewer = {};
var GOLDEN_RATIO = (1.0 + Math.sqrt(5)) / 2.0;

(function() {
	"use strict";

	bgroundClick      = ViewerUtil.eventFactory("bgroundClicked");
	clickObject       = ViewerUtil.eventFactory("clickObject");
	clickPin          = ViewerUtil.eventFactory("pinClick");
	onMouseOver       = ViewerUtil.eventFactory("onMouseOver");
	onMouseDown       = ViewerUtil.eventFactory("onMouseDown");
	onMouseUp         = ViewerUtil.eventFactory("onMouseUp");
	onMouseMove       = ViewerUtil.eventFactory("onMouseMove");
	onViewpointChange = ViewerUtil.eventFactory("onViewpointChange");
	onLoaded          = ViewerUtil.eventFactory("onLoaded");
	runtimeReady      = ViewerUtil.eventFactory("runtimeReady");

	Viewer = function(name, element, manager, callback, errCallback) {
		// Properties
		var self = this;

		if (!name) {
			this.name = "viewer";
		} else {
			this.name = name;
		}

		callback = !callback ? function() {
			// TODO: Move event handling here
			//console.log(type + ": " + value);
		} : callback;

		errCallback = !errCallback ? function() {
			//console.error(type + ": " + value);
		} : errCallback;

		// If not given the tag by the manager create here
		this.element = element;

		this.inline = null;
		this.runtime = null;
		this.fullscreen = false;

		this.clickingEnabled = false;

		this.avatarRadius = 0.5;

		this.pinSizeFromSettings = false;
		this.pinSize = 1.0; // Initial size

		this.defaultShowAll = true;

		this.zNear = -1;
		this.zFar = -1;

		this.manager = manager;

		this.initialized = false;

		this.downloadsLeft = 1;

		this.defaultNavMode = this.NAV_MODES.TURNTABLE;

		this.selectionDisabled = false;

		this.account = null;
		this.project = null;
		this.branch = null;
		this.revision = null;
		this.modelString = null;

		this.rootName = "model";
		this.inlineRoots = {};
		this.multipartNodes = [];
		this.multipartNodesByProject = {};

		this.setHandle = function(handle) {
			this.handle = handle;
		};

		this.logos    = [];

		this.logoClick = function() {
			//callback(self.EVENT.LOGO_CLICK);
		};

		this.addLogo = function() {
			if (!self.logoGroup)
			{
				self.logoGroup = document.createElement("div");
				self.logoGroup.style.width = "100%";
				self.element.appendChild(self.logoGroup);
			}

			var numLogos = this.logos.length + 1;
			var perLogo  = Math.floor(100 / numLogos);
			var widthPercentage = perLogo + "%";

			var logo = document.createElement("div");
			logo.style.position       = "absolute";
			logo.style["z-index"]     = 2;
			logo.style["text-align"]  = "center";
			logo.style.width          = "250px";
			logo.style["top"]  		  = "10px";
			logo.style.left 		  = 0;
			logo.style.right 		  = 0;
			logo.style.margin 		  = "auto";

			logo.addEventListener("click", self.logoClick);

			var logoImage = document.createElement("img");
			logoImage.setAttribute("src", logo_string);
			logoImage.setAttribute("style", "width: 100%;");
			logoImage.textContent = " ";
			logo.appendChild(logoImage);

			self.updateLogoWidth(widthPercentage);

			self.logoGroup.appendChild(logo);
			self.logos.push(logo);
		};

		this.removeLogo = function () {
			if (self.logos.length)
			{
				var numLogos = this.logos.length - 1;
				var widthPercentage = Math.floor(100 / numLogos) + "%";

				self.logos[numLogos].parentNode.removeChild(self.logos[numLogos]);

				self.logos.splice(numLogos,1);

				self.updateLogoWidth(widthPercentage);
			}
		};

		this.updateLogoWidth = function(widthPercentage) {
			for(var i = 0; i < self.logos.length; i++)
			{

				self.logos[i].style.width = widthPercentage;
			}
		};

		this.handleKeyPresses = function(e) {
			if (e.charCode === "r".charCodeAt(0)) {
				self.reset();
				self.setApp(null);
				self.setNavMode(self.NAV_MODES.WALK);
				self.disableClicking();
			} else if (e.charCode === "a".charCodeAt(0)) {
				self.showAll();
				self.enableClicking();
			} else if (e.charCode === "u".charCodeAt(0)) {
				self.revealAll();
			}
		};

		this.init = function(options) {
			if (!self.initialized) {

				// Set option param from viewerDirective
				self.options = options;

				// If we have a viewer manager then it
				// will take care of initializing the runtime
				// else we'll do it ourselves
				x3dom.runtime.ready = self.initRuntime;

				self.addLogo();

				// Set up the DOM elements
				self.viewer = document.createElement("x3d");
				self.viewer.setAttribute("id", self.name);
				self.viewer.setAttribute("xmlns", "http://www.web3d.org/specification/x3d-namespace");
				self.viewer.setAttribute("keysEnabled", "true");
				self.viewer.setAttribute("disableTouch", "true");
				self.viewer.addEventListener("mousedown", onMouseDown);
				self.viewer.addEventListener("mouseup",  onMouseUp);
				self.viewer.addEventListener("mousemove",  onMouseMove);
				self.viewer.style["pointer-events"] = "all";
				self.viewer.className = "viewer";

				self.element.appendChild(self.viewer);

				self.scene = document.createElement("Scene");
				self.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
				//self.scene.setAttribute("dopickpass", false);
				self.viewer.appendChild(self.scene);

				self.pinShader = new PinShader(self.scene);

				self.bground = null;
				self.currentNavMode = null;

				self.createBackground();

				self.environ = document.createElement("environment");
				self.environ.setAttribute("frustumCulling", "true");
				self.environ.setAttribute("smallFeatureCulling", "true");
				self.environ.setAttribute("smallFeatureThreshold", 5);
				self.environ.setAttribute("occlusionCulling", "true");
				self.environ.setAttribute("sorttrans", "true");
				self.environ.setAttribute("gammaCorrectionDefault", "linear");
				self.scene.appendChild(self.environ);

				self.setAmbientLight();

				self.createViewpoint(self.name + "_default");

				self.nav = document.createElement("navigationInfo");
				self.nav.setAttribute("headlight", "false");
				self.setNavMode(self.defaultNavMode);
				self.scene.appendChild(self.nav);

				self.loadViewpoint = self.name + "_default"; // Must be called after creating nav

				self.viewer.addEventListener("keypress", self.handleKeyPresses);

				self.initialized = true;

				if (manager) {
					manager.registerMe(self);
				}

				self.enableClicking();


				self.plugins = self.options.plugins;
				Object.keys(self.plugins).forEach(function(key){
					self.plugins[key].initCallback && self.plugins[key].initCallback(self);
				});

				callback(self.EVENT.READY, {
					name: self.name,
					model: self.modelString
				});
			}
		};

		this.destroy = function() {
			if (self.currentViewpoint) {
				self.currentViewpoint._xmlNode.removeEventListener("viewpointChanged", self.viewPointChanged);
			}
			self.viewer.removeEventListener("mousedown", self.managerSwitchMaster);

			self.removeLogo();

			//self.viewer.removeEventListener("mousedown", onMouseDown);
			//self.viewer.removeEventListener("mouseup", onMouseUp);
			self.viewer.removeEventListener("keypress", self.handleKeyPresses);

			self.viewer.parentNode.removeChild(self.viewer);

			ViewerUtil.offEventAll();

			self.viewer = undefined;
		};

		// This is called when the X3DOM runtime is initialized
		// member of x3dom.runtime instance
		this.initRuntime = function() {

			if (this.doc.id === self.name) {
				self.runtime = this;

				callback(self.EVENT.RUNTIME_READY, {
					name: self.name
				});
			}

			self.runtime.enterFrame = function () {
					if (self.gyroOrientation)
					{
							self.gyroscope(
									self.gyroOrientation.alpha,
									self.gyroOrientation.beta,
									self.gyroOrientation.gamma
							);
					}
			};

			self.showAll = function() {
				self.runtime.fitAll();

				// TODO: This is a hack to get around a bug in X3DOM
				self.getViewArea()._flyMat = null;
			};

			ViewerUtil.onEvent("onLoaded", function(objEvent) {
				if (self.loadViewpoint) {
					self.setCurrentViewpoint(self.loadViewpoint);
				}

				var targetParent = objEvent.target._x3domNode._nameSpace.doc._x3dElem;

				self.loadViewpoints();

				if (targetParent === self.viewer) {
					self.setDiffColors(null);
				}

				if (objEvent.target.tagName.toUpperCase() === "INLINE") {
					self.inlineRoots[objEvent.target.nameSpaceName] = objEvent.target;
				} else if (objEvent.target.tagName.toUpperCase() === "MULTIPART") {
					if (self.multipartNodes.indexOf(objEvent.target) === -1)
					{
						var nameSpaceName = objEvent.target._x3domNode._nameSpace.name;
						if (!self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
							self.multipartNodesByProject[nameSpaceName] = {};
						}

						var multipartName = objEvent.target.getAttribute("id");
						var multipartNameParts = multipartName.split("__");
						var multipartID = multipartNameParts[multipartNameParts.length - 1];

						self.multipartNodesByProject[nameSpaceName][multipartID] = objEvent.target;

						self.multipartNodes.push(objEvent.target);
					}
				}

				self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);

				if (!self.pinSizeFromSettings) {
					var sceneBBox = self.getScene()._x3domNode.getVolume();
					var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
					self.pinSize = sceneSize / 20;
				}

				//console.log('my op', options);

				var options = self.options;
				// don't show all if lat,lon,height is set in URL
				if(options.showAll){
					self.showAll();
				}

				if (!self.downloadsLeft) {
					callback(self.EVENT.LOADED);
				}

			});
		};

		this.setAmbientLight = function(lightDescription) {
			if (self.light) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.light.attributes.length; i++)
				{
					attributeNames.push(self.light.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++)
				{
					self.light.removeAttribute(attributeNames[i]);
				}
			} else {
				self.light = document.createElement("directionallight");
				self.scene.appendChild(self.light);
			}

			if (!lightDescription)
			{
				//self.light.setAttribute("intensity", "0.5");
				self.light.setAttribute("color", "0.714, 0.910, 0.953");
				self.light.setAttribute("direction", "0, -0.9323, -0.362");
				self.light.setAttribute("global", "true");
				self.light.setAttribute("ambientIntensity", "0.8");
				self.light.setAttribute("shadowIntensity", 0.0);
			} else {
				for (var attr in lightDescription)
				{
					if (lightDescription.hasOwnProperty(attr))
					{
						self.light.setAttribute(attr, lightDescription[attr]);
					}
				}
			}

		};

		this.createBackground = function(colourDescription) {
			if (self.bground) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.bground.attributes.length; i++)
				{
					attributeNames.push(self.bground.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++)
				{
					self.bground.removeAttribute(attributeNames[i]);
				}
			} else {
				self.bground = document.createElement("background");
				self.scene.appendChild(self.bground);
			}

			if (!colourDescription)
			{
				self.bground.setAttribute("DEF", self.name + "_bground");
				self.bground.setAttribute("skyangle", "0.9 1.5 1.57");
				self.bground.setAttribute("skycolor", "0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1");
				self.bground.setAttribute("groundangle", "0.9 1.5 1.57");
				self.bground.setAttribute("groundcolor", "0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91");
				self.bground.textContent = " ";

			} else {
				self.bground.setAttribute("DEF", self.name + "_bground");

				for (var attr in colourDescription)
				{
					if (colourDescription.hasOwnProperty(attr))
					{
						self.bground.setAttribute(attr, colourDescription[attr]);
					}
				}
			}

		};

		this.gyroscope = function (alpha, beta, gamma) {
			var degToRad = Math.PI / 180.0;

			var b = (alpha ? alpha : 0);
			var a = (beta  ? beta : 0);
			var g = -(gamma ? gamma : 0);

			a *= degToRad; b *= degToRad; g *= degToRad;

			var cA = Math.cos(a / 2.0);
			var cB = Math.cos(b / 2.0);
			var cG = Math.cos(g / 2.0);
			var sA = Math.sin(a / 2.0);
			var sB = Math.sin(b / 2.0);
			var sG = Math.sin(g / 2.0);

			/*
			var w = cB * cG * cA - sB * sG * sA;
			var x = sB * cG * cA - cB * sG * sA;
			var y = cB * sG * cA  sB * cG * sA;
			var z = cB * cG * sA  sB * sG * cA;
			*/

			var x = sA * cB * cG + cA * sB * sG;
			var y = cA * sB * cG - sA * cB * sG;
			var z = cA * cB * sG - sA * sB * cG;
			var w = cA * cB * cG + sA * sB * sG;

			var q           = new x3dom.fields.Quaternion(x,y,z,w);
			var screenAngle = (window.orientation ? window.orientation : 0) * degToRad * -1;
			var screenQuat  = x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(0,0,1),screenAngle);
			var viewQuat    = new x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(1,0,0), -Math.PI * 0.5);

			//q = self.gyroStart.multiply(q);
			q = q.multiply(viewQuat);
			q = q.multiply(screenQuat);

			var flyMat = null;
			var vp     = self.getCurrentViewpoint()._x3domNode;

			if (self.rollerCoasterMatrix)
			{
				var qMat = q.toMatrix();
				flyMat = qMat.transpose().mult(self.rollerCoasterMatrix.inverse());
			} else {

				flyMat = vp.getViewMatrix().inverse();
				flyMat.setRotate(q);
				flyMat = flyMat.inverse();
			}

			vp._viewMatrix.setValues(flyMat);
		};

		this.switchDebug = function() {
			self.getViewArea()._visDbgBuf = !self.getViewArea()._visDbgBuf;
		};

		this.showStats = function() {
			self.runtime.canvas.stateViewer.display();
		};

		this.getViewArea = function() {
			return self.runtime.canvas.doc._viewarea;
		};

		this.getViewMatrix = function() {
			return self.getViewArea().getViewMatrix();
		};

		this.getProjectionMatrix = function() {
			return self.getViewArea().getProjectionMatrix();
		};

		this.onMouseUp = function(functionToBind) {
			ViewerUtil.onEvent("onMouseUp", functionToBind);
		};

		this.offMouseUp = function(functionToBind) {
			ViewerUtil.offEvent("onMouseUp", functionToBind);
		};

		this.onMouseDown = function(functionToBind) {
			ViewerUtil.onEvent("onMouseDown", functionToBind);
		};

		this.offMouseDown = function(functionToBind) {
			ViewerUtil.offEvent("onMouseDown", functionToBind);
		};

		this.onMouseMove = function(functionToBind) {
			ViewerUtil.onEvent("onMouseMove", functionToBind);
		};

		this.offMouseMove = function(functionToBind) {
			ViewerUtil.offEvent("onMouseMove", functionToBind);
		};

		this.pickPoint = function(x, y, fireEvent)
		{
			fireEvent = (typeof fireEvent === undefined) ? false : fireEvent;

			self.getViewArea()._doc.ctx.pickValue(self.getViewArea(), x,y);

			if (fireEvent)
			{
				// Simulate a mouse down pick point
				self.mouseDownPickPoint({layerX: x, layerY: y});
			}
		};

		this.mouseDownPickPoint = function(event)
		{
			var viewArea = self.getViewArea();
			var pickingInfo = viewArea._pickingInfo;

			if (pickingInfo.pickObj)
			{
				var account, project;
				var projectParts = null;

				if (pickingInfo.pickObj._xmlNode)
				{
					if (pickingInfo.pickObj._xmlNode.hasAttribute("id"))
					{
						projectParts = pickingInfo.pickObj._xmlNode.getAttribute("id").split("__");
					}
				} else {
					projectParts = pickingInfo.pickObj.pickObj._xmlNode.getAttribute("id").split("__");
				}

				if (projectParts)
				{
					var objectID = pickingInfo.pickObj.partID ?
						pickingInfo.pickObj.partID :
						projectParts[2];

					account = projectParts[0];
					project = projectParts[1];

					var inlineTransName = ViewerUtil.escapeCSSCharacters(account + "__" + project);
					var projectInline = self.inlineRoots[inlineTransName];
					var trans = projectInline._x3domNode.getCurrentTransform();

                    console.trace(event);

					callback(self.EVENT.PICK_POINT, {
						id: objectID,
						position: pickingInfo.pickPos,
						normal: pickingInfo.pickNorm,
						trans: trans,
						screenPos: [event.layerX, event.layerY]
					});
				} else {
					callback(self.EVENT.PICK_POINT, {
						position: pickingInfo.pickPos,
						normal: pickingInfo.pickNorm
					});
				}
			}
		};

		this.onMouseDown(this.mouseDownPickPoint);

		/*
		this.mouseMovePoint = function (event) {
			if (event.hasOwnProperty("target")) {
				console.log(event.hitPnt);
			}
			else {
				console.log(event.clientX, event.clientY);
				var viewArea = self.getViewArea();
				viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, event.clientX, event.clientY, 1);
			}
		};

		this.onMouseMove(this.mouseMovePoint);
		*/

		this.onViewpointChanged = function(functionToBind) {
			ViewerUtil.onEvent("myViewpointHasChanged", functionToBind);
		};

		this.offViewpointChanged = function(functionToBind) {
			ViewerUtil.offEvent("myViewpointHasChanged", functionToBind);
		};

		this.viewPointChanged = function(event) {
			//console.log('vp changed');
			var vpInfo = self.getCurrentViewpointInfo();
			var eye = vpInfo.position;
			var viewDir = vpInfo.view_dir;


			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
				self.nav._x3domNode._vf.typeParams[1] = eye[1];
			}

			ViewerUtil.triggerEvent("myViewpointHasChanged", event);
		};

		this.onBackgroundClicked = function(functionToBind) {
			ViewerUtil.onEvent("bgroundClicked", functionToBind);
		};

		this.offBackgroundClicked = function(functionToBind) {
			ViewerUtil.offEvent("bgroundClicked", functionToBind);
		};

		this.selectParts = function(part, zoom, colour) {
			var i;

			colour = colour ? colour : self.SELECT_COLOUR.EMISSIVE;

			if (!Array.isArray(part)) {
				part = [part];
			}

			if (zoom) {
				for (i = 0; i < part.length; i++) {
					part[i].fit();
				}
			}

			if (self.oldPart) {
				for (i = 0; i < self.oldPart.length; i++) {
					self.oldPart[i].resetColor();
				}
			}

			self.oldPart = part;

			for (i = 0; i < part.length; i++) {
				part[i].setEmissiveColor(colour, "both");
			}
		};

		this.clickObject = function(objEvent) {
			var account = null;
			var project = null;
			var id = null;

			if ((objEvent.button === 1) && !self.selectionDisabled) {
				if (objEvent.partID) {
					id = objEvent.partID;

					account = objEvent.part.multiPart._nameSpace.name.split("__")[0];
					project = objEvent.part.multiPart._nameSpace.name.split("__")[1];

				}
			}

			callback(self.EVENT.OBJECT_SELECTED, {
				account: account,
				project: project,
				id: id,
				source: "viewer"
			});
		};

		this.highlightObjects = function(account, project, ids, zoom, colour) {
			var nameSpaceName = null;

			/*
			if (account && project) {
				nameSpaceName = account + "__" + project;
			}
			*/

			if (!ids) {
				ids = [];
			}

			// If we pass in a single id, then we might be selecting
			// an old-style Group in X3DOM rather than multipart.
			ids = Array.isArray(ids) ? ids: [ids];

			// Is this a multipart project
			if (!nameSpaceName || self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
				var fullPartsList = [];
				var nsMultipartNodes;

				// If account and project have been specified
				// this helps narrow the search
				if (nameSpaceName) {
					nsMultipartNodes = self.multipartNodesByProject[nameSpaceName];
				} else {
					// Otherwise iterate over everything
					nsMultipartNodes = self.multipartNodes;
				}

				for (var multipartNodeName in nsMultipartNodes) {
					if (nsMultipartNodes.hasOwnProperty(multipartNodeName)) {
						var parts = nsMultipartNodes[multipartNodeName].getParts(ids);

						if (parts && parts.ids.length > 0) {
							fullPartsList.push(parts);
						}
					}
				}

				self.selectParts(fullPartsList, zoom, colour);
			}

			for(var i = 0; i < ids.length; i++)
			{
				var id = ids[i];
				var object = document.querySelectorAll("[id$='" + id + "']");

				if (object[0]) {
					self.setApp(object[0], colour);
				}
			}

			if (ids.length === 0)
			{
				self.setApp(null);
			}
		};

		//this.switchedOldParts = [];
		//this.switchedObjects = [];

		this.__processSwitchVisibility = function(nameSpaceName, ids, state)
		{
			if (ids && ids.length) {
				// Is this a multipart project
				if (!nameSpaceName || self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
					var nsMultipartNodes;

					// If account and project have been specified
					// this helps narrow the search
					if (nameSpaceName) {
						nsMultipartNodes = self.multipartNodesByProject[nameSpaceName];
					} else {
						// Otherwise iterate over everything
						nsMultipartNodes = self.multipartNodes;
					}

					for (var multipartNodeName in nsMultipartNodes) {
						if (nsMultipartNodes.hasOwnProperty(multipartNodeName)) {
							var parts = nsMultipartNodes[multipartNodeName].getParts(ids);

							if (parts && parts.ids.length > 0) {
								parts.setVisibility(state);
							}
						}
					}
				}

				for(var i = 0; i < ids.length; i++)
				{
					var id = ids[i];
					var object = document.querySelectorAll("[id$='" + id + "']");

					if (object[0]) {
						object[0].setAttribute("render", state.toString());
					}
				}
			}
		};

		this.switchObjectVisibility = function(account, project, visible_ids, invisible_ids) {
			var nameSpaceName = null;

			if (account && project) {
				nameSpaceName = account + "__" + project;
			}

			if (visible_ids)
			{
				self.__processSwitchVisibility(nameSpaceName, visible_ids, true);
			}

			if (invisible_ids)
			{
				 self.__processSwitchVisibility(nameSpaceName, invisible_ids, false);
			}
		};

		ViewerUtil.onEvent("pinClick", function(clickInfo) {
			var pinID = clickInfo.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
			callback(self.EVENT.CLICK_PIN,
			{
				id : pinID
			});
		});

		ViewerUtil.onEvent("onMouseDown", function() {
			document.body.style["pointer-events"] = "none";
		});

		ViewerUtil.onEvent("onMouseUp", function() {
			document.body.style["pointer-events"] = "all";
		});

		this.onClickObject = function(functionToBind) {
			ViewerUtil.onEvent("clickObject", functionToBind);
		};

		this.offClickObject = function(functionToBind) {
			ViewerUtil.offEvent("clickObject", functionToBind);
		};

		this.viewpoints = {};
		this.viewpointsNames = {};

		this.selectedViewpointIdx = 0;
		this.selectedViewpoint = null;

		this.isFlyingThrough = false;
		this.flyThroughTime = 1000;

		this.flyThrough = function() {
			if (!self.isFlyingThrough) {
				self.isFlyingThrough = true;
				setTimeout(self.flyThroughTick, self.flyThroughTime);
			} else {
				self.isFlyingThrough = false;
			}
		};

		this.flyThroughTick = function() {
			var newViewpoint = self.selectedViewpointIdx + 1;

			if (newViewpoint === self.viewpoints.length) {
				newViewpoint = 0;
			}

			self.setCurrentViewpoint(self.viewpoints[newViewpoint]);

			if (self.isFlyingThrough) {
				setTimeout(self.flyThroughTick, self.flyThroughTime);
			}
		};

		this.getViewpointGroupAndName = function(id) {
			var splitID = id.trim().split("__");
			var name, group;

			if (splitID.length > 1) {
				group = splitID[0].trim();
				name = splitID[1].trim();
			} else {
				name = splitID[0].trim();
				group = "uncategorized";
			}

			return {
				group: group,
				name: name
			};
		};

		this.loadViewpoints = function() {
			var viewpointList = document.getElementsByTagName("Viewpoint");

			for (var v = 0; v < viewpointList.length; v++) {
				if (viewpointList[v].hasAttribute("id")) {
					var id = viewpointList[v].id.trim();
					viewpointList[v].DEF = id;

					var groupName = self.getViewpointGroupAndName(id);

					if (!self.viewpoints[groupName.group]) {
						self.viewpoints[groupName.group] = {};
					}

					self.viewpoints[groupName.group][groupName.name] = id;
					self.viewpointsNames[id] = viewpointList[v];
				}
			}
		};

		this.loadViewpoint = null;

		this.createViewpoint = function(name, from, at, up) {
			var groupName = self.getViewpointGroupAndName(name);

			if (!(self.viewpoints[groupName.group] && self.viewpoints[groupName.group][groupName.name])) {
				var newViewPoint = document.createElement("viewpoint");
				newViewPoint.setAttribute("id", name);
				newViewPoint.setAttribute("def", name);
				self.scene.appendChild(newViewPoint);

				if (from && at && up) {
					var q = self.getAxisAngle(from, at, up);
					newViewPoint.setAttribute("orientation", q.join(","));
				}

				if (!self.viewpoints[groupName.group]) {
					self.viewpoints[groupName.group] = {};
				}

				self.viewpoints[groupName.group][groupName.name] = name;
				self.viewpointsNames[name] = newViewPoint;

			} else {
				console.error("Tried to create viewpoint with duplicate name: " + name);
			}
		};

		this.setCurrentViewpointIdx = function(idx) {
			var viewpointNames = Object.keys(self.viewpointsNames);
			self.setCurrentViewpoint(viewpointNames[idx]);
		};

		this.setCurrentViewpoint = function(id) {
			if (Object.keys(self.viewpointsNames).indexOf(id) !== -1) {
				var viewpoint = self.viewpointsNames[id];

				// Remove event listener from viewpoint
				if (self.currentViewpoint) {
					self.currentViewpoint._xmlNode.removeEventListener("viewpointChanged", self.viewPointChanged);
				}

				self.currentViewpoint = viewpoint._x3domNode;

				viewpoint.setAttribute("bind", true);
				self.getViewArea().resetView();

				// TODO: This is a hack to get around a bug in X3DOM
				self.getViewArea()._flyMat = null;

				viewpoint.addEventListener("viewpointChanged", self.viewPointChanged);
				self.loadViewpoint = null;
				viewpoint.appendChild(self.nav);

				self.runtime.resetExamin();

				self.applySettings();

				if (id === (self.name + "_default")) {
					if (self.defaultShowAll) {
						self.runtime.fitAll();
					} else {
						self.reset();
					}
				}

				return;
			}

			self.loadViewpoint = id;
		};

		this.updateSettings = function(settings) {
			if (settings) {
				self.settings = settings;
				self.applySettings();
			}
		};

		this.applySettings = function() {
			if (self.settings) {
				if (self.settings.hasOwnProperty("start_all")) {
					self.defaultShowAll = self.settings.start_all;
				}

				if (self.settings.hasOwnProperty("speed")) {
					self.setSpeed(self.settings.speed);
				}

				if (self.settings.hasOwnProperty("avatarHeight")) {
					self.changeAvatarHeight(self.settings.avatarHeight);
				}

				if (self.settings.hasOwnProperty("defaultNavMode")) {
					self.defaultNavMode = self.settings.defaultNavMode;
				}

				if (self.settings.hasOwnProperty("pinSize")) {
					self.pinSize = self.settings.pinSize;
					self.pinSizeFromSettings = true; // Stop the auto-calculation
				}

				if (self.settings.hasOwnProperty("visibilityLimit")) {
					self.nav.setAttribute("visibilityLimit", self.settings.visibilityLimit);
				}

				if (self.settings.hasOwnProperty("zFar")) {
					self.currentViewpoint._xmlNode.setAttribute("zFar", self.settings.zFar);
				}

				if (self.settings.hasOwnProperty("zNear")) {
					self.currentViewpoint._xmlNode.setAttribute("zNear", self.settings.zNear);
				}

				if (self.settings.hasOwnProperty("background")) {
					self.createBackground(self.settings.background);
				}

				if (self.settings.hasOwnProperty("ambientLight")) {
					self.setAmbientLight(self.settings.ambientLight);
				}
			}
		};

		this.lookAtObject = function(obj) {
			self.runtime.fitObject(obj, true);
		};

		this.applyApp = function(nodes, factor, emiss, otherSide) {
			var m_idx, origDiff, origAmb;

			if (!otherSide) {
				for (m_idx = 0; m_idx < nodes.length; m_idx++) {
					if (nodes[m_idx]._x3domNode) {
						origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
						nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

						origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
						nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

						nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);
					}
				}
			} else {
				for (m_idx = 0; m_idx < nodes.length; m_idx++) {
					if (nodes[m_idx]._x3domNode) {
						origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
						nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

						origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
						nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

						nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);
					}
				}
			}
		};

		this.pickObject = {};

		this.pickPoint = function(x,y) {
			var viewArea = self.getViewArea();
			var scene = viewArea._scene;

			if ((typeof x !== "undefined") && (typeof y !== "undefined"))
			{
				var viewMatrix = self.getViewArea().getViewMatrix();
				var projMatrix = self.getViewArea().getProjectionMatrix();

				viewArea._doc.ctx.pickValue(viewArea, x, y, 0, viewMatrix, projMatrix.mult(viewMatrix));
			}

			var oldPickMode = scene._vf.pickMode.toLowerCase();
			scene._vf.pickMode = "idbuf";
			scene._vf.pickMode = oldPickMode;

			self.pickObject = viewArea._pickingInfo;
			self.pickObject.part = null;
			self.pickObject.partID = null;

			var objId = self.pickObject.shadowObjectId;

			if (scene._multiPartMap) {
				for (var mpi = 0; mpi < scene._multiPartMap.multiParts.length; mpi++) {
					var mp = scene._multiPartMap.multiParts[mpi];

					if (objId > mp._minId && objId <= mp._maxId) {
						var colorMap = mp._inlineNamespace.defMap.MultiMaterial_ColorMap;
						var emissiveMap = mp._inlineNamespace.defMap.MultiMaterial_EmissiveMap;
						var specularMap = mp._inlineNamespace.defMap.MultiMaterial_SpecularMap;
						var visibilityMap = mp._inlineNamespace.defMap.MultiMaterial_VisibilityMap;

						self.pickObject.part = new x3dom.Parts(mp, [objId - mp._minId], colorMap, emissiveMap, specularMap, visibilityMap);
						self.pickObject.partID = mp._idMap.mapping[objId - mp._minId].name;
						self.pickObject.pickObj = self.pickObject.part.multiPart;
					}
				}
			}
		};

		this.oneGrpNodes = [];
		this.twoGrpNodes = [];

		this.setApp = function(group, app) {
			if (!group || !group.multipart) {
				if (app === undefined) {
					app = self.SELECT_COLOUR.EMISSIVE;
				}

				self.applyApp(self.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
				self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
				self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

				// TODO: Make this more efficient
				self.applyApp(self.diffColorAdded, 0.5, "0.0 1.0 0.0");
				self.applyApp(self.diffColorDeleted, 0.5, "1.0 0.0 0.0");

				if (group) {
					self.twoGrpNodes = group.getElementsByTagName("TwoSidedMaterial");
					self.oneGrpNodes = group.getElementsByTagName("Material");
				} else {
					self.oneGrpNodes = [];
					self.twoGrpNodes = [];
				}

				self.applyApp(self.oneGrpNodes, 0.5, app, false);
				self.applyApp(self.twoGrpNodes, 0.5, app, false);
				self.applyApp(self.twoGrpNodes, 0.5, app, true);

				self.viewer.render();
			}
		};

		this.setNavMode = function(mode, force) {
			if (self.currentNavMode !== mode || force) {
				// If the navigation mode has changed

				if (mode === self.NAV_MODES.WAYFINDER) { // If we are entering wayfinder navigation
					waypoint.init();
				}

				if (self.currentNavMode === self.NAV_MODES.WAYFINDER) { // Exiting the wayfinding mode
					waypoint.close();
				}

				if (mode === self.NAV_MODES.HELICOPTER) {
					var vpInfo = self.getCurrentViewpointInfo();
					var eye = vpInfo.position;
					var viewDir = vpInfo.view_dir;

					self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
					self.nav._x3domNode._vf.typeParams[1] = eye[1];

					var bboxMax = self.getScene()._x3domNode.getVolume().max;
					var bboxMin = self.getScene()._x3domNode.getVolume().min;
					var bboxSize = bboxMax.subtract(bboxMin);
					var calculatedSpeed = Math.sqrt(Math.max.apply(Math, bboxSize.toGL())) * 0.03;

					self.nav.setAttribute("speed", calculatedSpeed);
				}

				self.currentNavMode = mode;
				self.nav.setAttribute("type", mode);

				if (mode === self.NAV_MODES.WALK) {
					self.disableClicking();
					self.setApp(null);
				}
				/*else if (mode == "HELICOPTER") {
					self.disableSelecting();
				} */
				else {
					self.enableClicking();
				}

				if ((mode === self.NAV_MODES.WAYFINDER) && waypoint) {
					waypoint.resetViewer();
				}

				if (mode === self.NAV_MODES.TURNTABLE) {
					self.nav.setAttribute("typeParams", "-0.4 60.0 0 3.14 0.00001");
				}
			}
		};

		this.reload = function() {
			x3dom.reload();
		};

		this.startingPoint = [0.0, 0.0, 0.0];
		this.setStartingPoint = function(x, y, z) {
			self.startingPoint[0] = x;
			self.startingPoint[1] = y;
			self.startingPoint[2] = z;
		};

		this.defaultOrientation = [0.0, 0.0, 1.0];
		this.setStartingOrientation = function(x, y, z) {
			self.defaultOrientation[0] = x;
			self.defaultOrientation[1] = y;
			self.defaultOrientation[2] = z;
		};

		this.setCameraPosition = function(pos) {
			var vpInfo = self.getCurrentViewpointInfo();

			var viewDir = vpInfo.view_dir;
			var up = vpInfo.up;

			self.updateCamera(pos, up, viewDir);
		};

		this.moveCamera = function(dV) {
			var currentPos = self.getCurrentViewpointInfo().position;
			currentPos[0] += dV[0];
			currentPos[1] += dV[1];
			currentPos[2] += dV[2];

			self.setCameraPosition(currentPos);
		};

		this.setCameraViewDir = function(viewDir, upDir, centerOfRotation) {
			var currentPos = self.getCurrentViewpointInfo().position;
			self.updateCamera(currentPos, upDir, viewDir, centerOfRotation);
		};

		this.setCamera = function(pos, viewDir, upDir, centerOfRotation, animate, rollerCoasterMode) {
			self.updateCamera(pos, upDir, viewDir, centerOfRotation, animate, rollerCoasterMode);
		};

		this.updateCamera = function(pos, up, viewDir, centerOfRotation, animate, rollerCoasterMode) {
			if (!viewDir)
			{
				viewDir = self.getCurrentViewpointInfo().view_dir;
			}

			if (!up)
			{
				up = self.getCurrentViewpointInfo().up;
			}
			up = ViewerUtil.normalize(up);

			var x3domView = new x3dom.fields.SFVec3f(viewDir[0], viewDir[1], viewDir[2]);
			var x3domUp   = new x3dom.fields.SFVec3f(up[0], up[1], up[2]);
			var x3domFrom = new x3dom.fields.SFVec3f(pos[0], pos[1], pos[2]);
			var x3domAt   = x3domFrom.add(x3domView.normalize());

			var viewMatrix = x3dom.fields.SFMatrix4f.lookAt(x3domFrom, x3domAt, x3domUp);

			var currViewpointNode = self.getCurrentViewpoint();
			var currViewpoint = currViewpointNode._x3domNode;

			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(x3domView.y);
				self.nav._x3domNode._vf.typeParams[1] = x3domFrom.y;
			}

			var oldViewMatrixCopy = currViewpoint._viewMatrix.toGL();

			if (!animate && rollerCoasterMode)
			{
				self.rollerCoasterMatrix = viewMatrix;
			} else {
				currViewpoint._viewMatrix.setValues(viewMatrix.inverse());
			}

			var x3domCenter = null;

			if (!centerOfRotation)
			{
				var canvasWidth  = self.getViewArea()._doc.canvas.width;
				var canvasHeight = self.getViewArea()._doc.canvas.height;

				self.pickPoint(canvasWidth / 2, canvasHeight / 2);

				if (self.pickObject.pickPos)
				{
					x3domCenter = self.pickObject.pickPos;

				} else {
					var ry = new x3dom.fields.Ray(x3domFrom, x3domView);
					var bbox = self.getScene()._x3domNode.getVolume();

					if(ry.intersect(bbox.min, bbox.max))
					{
						x3domCenter = x3domAt.add(x3domView.multiply(((1.0 / (GOLDEN_RATIO + 1.0)) * ry.exit)));
					} else {
						x3domCenter = x3domAt;
					}
				}
			} else {
				x3domCenter = new x3dom.fields.SFVec3f(centerOfRotation[0], centerOfRotation[1], centerOfRotation[2]);
			}

			if (animate) {
				currViewpoint._viewMatrix.setFromArray(oldViewMatrixCopy);
				self.getViewArea().animateTo(viewMatrix.inverse(), currViewpoint);
			}

			currViewpointNode.setAttribute("centerofrotation", x3domCenter.toGL().join(","));

			self.setNavMode(self.currentNavMode);
			self.getViewArea()._doc.needRender = true;

			if (self.linked) {
				self.manager.switchMaster(self.handle);
			}
		};

		this.linked = false;

		this.managerSwitchMaster = function() {
			self.manager.switchMaster(self.handle);
		};

		this.linkMe = function() {
			// Need to be attached to the viewer master
			if (!self.manager) {
				return;
			}

			self.manager.linkMe(self.handle);
			self.onViewpointChanged(self.manager.viewpointLinkFunction);

			self.viewer.addEventListener("mousedown", self.managerSwitchMaster);

			self.linked = true;
		};


		this.collDistance = 0.1;
		this.changeCollisionDistance = function(collDistance) {
			self.collDistance = collDistance;
			self.nav._x3domNode._vf.avatarSize[0] = collDistance;
		};

		this.avatarHeight = 1.83;
		this.changeAvatarHeight = function(height) {
			self.avatarHeight = height;
			self.nav._x3domNode._vf.avatarSize[1] = height;
		};

		this.stepHeight = 0.4;
		this.changeStepHeight = function(stepHeight) {
			self.stepHeight = stepHeight;
			self.nav._x3domNode._vf.avatarSize[2] = stepHeight;
		};

		this.reset = function() {
			self.setCurrentViewpoint("model__start");

			self.changeCollisionDistance(self.collDistance);
			self.changeAvatarHeight(self.avatarHeight);
			self.changeStepHeight(self.stepHeight);
		};

		this.loadModel = function(account, project, branch, revision) {
			var url = "";

			if (revision === "head") {
				url = server_config.apiUrl(server_config.GET_API, account + "/" + project + "/revision/" + branch + "/head.x3d.mp");
			} else {
				url = server_config.apiUrl(server_config.GET_API, account + "/" + project + "/revision/" + revision + ".x3d.mp");
			}

			self.account = account;
			self.project = project;
			self.branch = branch;
			self.revision = revision;

			self.modelString = account + "_" + project + "_" + branch + "_" + revision;

			self.loadURL(url);
		};

		this.loadURL = function(url) {
			if (self.inline) {
				self.inline.parentNode.removeChild(self.inline);
				self.inline = null; // Garbage collect
			}

			self.inline = document.createElement("inline");
			self.scene.appendChild(self.inline);

			if (self.account && self.project) {
				self.rootName = self.account + "__" + self.project;
			} else {
				self.rootName = "model";
			}

			self.inline.setAttribute("namespacename", self.rootName);
			self.inline.setAttribute("onload", "onLoaded(event);");
			self.inline.setAttribute("url", url);
			self.reload();

			self.url = url;

			callback(self.EVENT.START_LOADING, {
				name: self.name
			});
		};

		this.getRoot = function() {
			return self.inline;
		};

		this.getScene = function() {
			return self.scene;
		};

		this.getCurrentViewpoint = function() {
			return self.getViewArea()._scene.getViewpoint()._xmlNode;
		};

		this.getCurrentViewpointInfo = function() {
			var viewPoint = {};

			var origViewTrans = self.getViewArea()._scene.getViewpoint().getCurrentTransform();
			var viewMat = self.getViewMatrix().inverse();

			var viewRight = viewMat.e0();
			var viewUp = viewMat.e1();
			var viewDir = viewMat.e2().multiply(-1); // Because OpenGL points out of screen
			var viewPos = viewMat.e3();

			var center = self.getViewArea()._scene.getViewpoint().getCenterOfRotation();

			var lookAt = null;

			if (center) {
				lookAt = center.subtract(viewPos);
			} else {
				lookAt = viewPos.add(viewDir);
			}

			var projMat = self.getProjectionMatrix();

			// More viewing direction than lookAt to sync with Assimp
			viewPoint.up = [viewUp.x, viewUp.y, viewUp.z];
			viewPoint.position = [viewPos.x, viewPos.y, viewPos.z];
			viewPoint.look_at = [lookAt.x, lookAt.y, lookAt.z];
			viewPoint.view_dir = [viewDir.x, viewDir.y, viewDir.z];
			viewPoint.right = [viewRight.x, viewRight.y, viewRight.z];
			viewPoint.unityHeight = 2.0 / projMat._00;
			viewPoint.fov = Math.atan((1 / projMat._00)) * 2.0;
			viewPoint.aspect_ratio = viewPoint.fov / projMat._11;

			var f = projMat._23 / (projMat._22 + 1);
			var n = (f * projMat._23) / (projMat._23 - 2 * f);

			viewPoint.far = f;
			viewPoint.near = n;

			viewPoint.clippingPlanes = self.clippingPlanes;

			return viewPoint;
		};

		this.speed = 2.0;
		this.setSpeed = function(speed) {
			self.speed = speed;
			self.nav.speed = speed;
		};

		this.bgroundClick = function(event) {
			callback(self.EVENT.BACKGROUND_SELECTED);
		};

		this.hiddenParts = [];

		this.addHiddenPart = function(part) {
			this.hiddenParts.push(part);
		};

		this.revealAll = function(event, objEvent) {
			for (var part in self.hiddenParts) {
				if (self.hiddenParts.hasOwnProperty(part)) {
					self.hiddenParts[part].setVisibility(true);
				}
			}

			self.hiddenParts = [];
		};

		this.disableClicking = function() {
			if (self.clickingEnabled) {
				self.offBackgroundClicked(self.bgroundClick);
				self.offClickObject(self.clickObject);
				self.viewer.setAttribute("disableDoubleClick", true);
				self.clickingEnabled = false;
			}
		};

		this.disableSelecting = function() {
			self.selectionDisabled = true;
		};

		this.enableClicking = function() {
			if (!self.clickingEnabled) {
				// When the user clicks on the background the select nothing.
				self.onBackgroundClicked(self.bgroundClick);
				self.onClickObject(self.clickObject);
				self.viewer.setAttribute("disableDoubleClick", false);
				self.clickingEnabled = true;
			}
		};

		this.switchFullScreen = function(vrDisplay) {
			vrDisplay = vrDisplay || {};

			if (!self.fullscreen) {
				if (self.viewer.mozRequestFullScreen) {
					self.viewer.mozRequestFullScreen({
						vrDisplay: vrDisplay
					});
				} else if (self.viewer.webkitRequestFullscreen) {
					self.viewer.webkitRequestFullscreen({
						vrDisplay: vrDisplay,
					});
				}

				self.fullscreen = true;
			} else {
				if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}

				self.fullscreen = false;
			}
		};

		this.diffColorDeleted = [];
		this.diffColorAdded = [];

		this.setDiffColors = function(diffColors) {
			if (diffColors) {
				self.diffColors = diffColors;
			}

			var i, mat, obj;

			self.applyApp(self.diffColorAdded, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.diffColorDeleted, 2.0, "0.0 0.0 0.0", false);

			self.diffColorAdded = [];
			self.diffColorDeleted = [];

			if (self.diffColors) {
				if (self.inline.childNodes.length) {
					var defMapSearch = self.inline.childNodes[0]._x3domNode._nameSpace.defMap;

					if (self.diffColors.added) {
						for (i = 0; i < self.diffColors.added.length; i++) {
							// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
							obj = defMapSearch[self.diffColors.added[i]];
							if (obj) {
								mat = obj._xmlNode.getElementsByTagName("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
									self.diffColorAdded.push(mat[0]);
								} else {
									mat = obj._xmlNode.getElementsByTagName("TwoSidedMaterial");
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);

									self.diffColorAdded.push(mat[0]);
								}

							}
						}
					}

					if (self.diffColors.deleted) {
						for (i = 0; i < self.diffColors.deleted.length; i++) {
							// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
							obj = defMapSearch[self.diffColors.deleted[i]];
							if (obj) {
								mat = obj._xmlNode.getElementsByTagName("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
									self.diffColorDeleted.push(mat[0]);
								} else {
									mat = obj._xmlNode.getElementsByTagName("TwoSidedMaterial");
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);

									self.diffColorDeleted.push(mat[0]);
								}
							}
						}
					}
				}
			}
		};

		this.transformEvent = function(event, viewpoint, inverse) {
			var transformation;

			if (inverse) {
				transformation = viewpoint._x3domNode.getTransformation().inverse();
			} else {
				transformation = viewpoint._x3domNode.getTransformation();
			}

			var newPos = transformation.multMatrixVec(event.position);
			var newOrientMat = ViewerUtil.axisAngleToMatrix(event.orientation[0], event.orientation[1]);
			newOrientMat = transformation.mult(newOrientMat);

			var newOrient = new x3dom.fields.Quaternion();
			newOrient.setValue(newOrientMat);
			newOrient = newOrient.toAxisAngle();

			event.position = newPos;
			event.orientation = newOrient;
		};

		/****************************************************************************
		 * Clipping planes
		 ****************************************************************************/

		var clippingPlaneID = -1;
		this.clippingPlanes = [];

		this.setClippingPlanes = function(clippingPlanes) {
			self.clearClippingPlanes();

			for (var clipidx = 0; clipidx < clippingPlanes.length; clipidx++) {
				var clipPlaneIDX = self.addClippingPlane(
					clippingPlanes[clipidx].axis,
					clippingPlanes[clipidx].distance,
					clippingPlanes[clipidx].percentage,
					clippingPlanes[clipidx].clipDirection
				);
			}
		};

		/**
		 * Adds a clipping plane to the viewer
		 * @param {string} axis - Axis through which the plane clips
		 * @param {number} distance - Distance along the bounding box to clip
		 * @param {number} percentage - Percentage along the bounding box to clip (overrides distance)
		 * @param {number} clipDirection - Direction of clipping (-1 or 1)
		 */
		this.addClippingPlane = function(axis, distance, percentage, clipDirection) {
			clippingPlaneID += 1;

			var newClipPlane = new ClipPlane(clippingPlaneID, self, axis, [1, 1, 1], distance, percentage, clipDirection);
			self.clippingPlanes.push(newClipPlane);

			return clippingPlaneID;
		};

		this.moveClippingPlane = function(percentage) {
			// Only supports a single clipping plane at the moment.
			self.clippingPlanes[0].movePlane(percentage);
		};

		/**
		 * Clear out all clipping planes
		 */
		this.clearClippingPlanes = function() {
			self.clippingPlanes.forEach(function(clipPlane) {
				clipPlane.destroy();

			});

			self.clippingPlanes = [];
		};

		/**
		 * Clear out all clipping planes
		 * @param {number} id - Get the clipping plane with matching unique ID
		 */
		this.getClippingPlane = function(id) {
			// If the clipping plane no longer exists this
			// will return undefined
			return self.clippingPlanes.filter(function(clipPlane) {
				return (clipPlane.getID() === id);
			})[0];
		};

		/****************************************************************************
		 * Pins
		 ****************************************************************************/
		self.pins = {};

		this.addPin = function(account, project, id, position, norm, colours, viewpoint) {
			if (self.pins.hasOwnProperty(id)) {
				errCallback(self.ERROR.PIN_ID_TAKEN);
			} else {

				var trans = null;
				var projectNameSpace = account + "__" + project;

				if (self.inlineRoots.hasOwnProperty(projectNameSpace))
				{
					var projectInline = self.inlineRoots[account + "__" + project];
					trans = projectInline._x3domNode.getCurrentTransform();
				}

				self.pins[id] = new Pin(id, self.getScene(), trans, position, norm, self.pinSize, colours, viewpoint);
			}
		};

		this.clickPin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				//self.highlightPin(id); This was preventing changing the colour of the pin
				// Replace with
				callback(self.EVENT.CHANGE_PIN_COLOUR, {
					id: id,
					colours: [[1.0, 0.7, 0.0]]
				});

				callback(self.EVENT.SET_CAMERA, {
					position : pin.viewpoint.position,
					view_dir : pin.viewpoint.view_dir,
					up: pin.viewpoint.up
				});

				callback(self.EVENT.SET_CLIPPING_PLANES, {
					clippingPlanes: pin.viewpoint.clippingPlanes
				});
			}
		};

		this.setPinVisibility = function(id, visibility)
		{
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				pin.setAttribute("render", visibility.toString());
			}
		};

		this.removePin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				self.pins[id].remove(id);
				delete self.pins[id];
			}
		};

		this.previousHighLightedPin = null;
		this.highlightPin = function(id) {
			// If a pin was previously highlighted
			// switch it off
			if (self.previousHighLightedPin) {
				self.previousHighLightedPin.highlight();
				self.previousHighLightedPin = null;
			}

			// If the pin exists switch it on
			if (id && self.pins.hasOwnProperty(id)) {
				self.pins[id].highlight();
				self.previousHighLightedPin = self.pins[id];
			}
		};

		this.changePinColours = function(id, colours) {
			if (self.pins.hasOwnProperty(id)) {
				self.pins[id].changeColour(colours);
			}
		};
	};

	Viewer.prototype.SELECT_COLOUR = {
		EMISSIVE: "1.0 0.5 0.0"
	};

	Viewer.prototype.ERROR = {
		PIN_ID_TAKEN: "VIEWER_PIN_ID_TAKEN"
	};
}());

// Constants and enums
var VIEWER_NAV_MODES = Viewer.prototype.NAV_MODES = {
	HELICOPTER: "HELICOPTER",
	WALK: "WALK",
	TURNTABLE: "TURNTABLE",
	WAYFINDER: "WAYFINDER",
	FLY: "FLY"
};

var VIEWER_EVENTS = Viewer.prototype.EVENT = {
	// States of the viewer
	READY: "VIEWER_EVENT_READY",
	START_LOADING: "VIEWING_START_LOADING",
	LOADED: "VIEWER_EVENT_LOADED",
	RUNTIME_READY: "VIEWING_RUNTIME_READY",

	ENTER_VR: "VIEWER_EVENT_ENTER_VR",
	VR_READY: "VIEWER_EVENT_VR_READY",
	SET_NAV_MODE: "VIEWER_SET_NAV_MODE",
	GO_HOME: "VIEWER_GO_HOME",
	SWITCH_FULLSCREEN: "VIEWER_SWITCH_FULLSCREEN",
	REGISTER_VIEWPOINT_CALLBACK: "VIEWER_REGISTER_VIEWPOINT_CALLBACK",
	REGISTER_MOUSE_MOVE_CALLBACK: "VIEWER_REGISTER_MOUSE_MOVE_CALLBACK",
	OBJECT_SELECTED: "VIEWER_OBJECT_SELECTED",
	BACKGROUND_SELECTED: "VIEWER_BACKGROUND_SELECTED",
	HIGHLIGHT_OBJECTS: "VIEWER_HIGHLIGHT_OBJECTS",
	SWITCH_OBJECT_VISIBILITY: "VIEWER_SWITCH_OBJECT_VISIBILITY",
	SET_PIN_VISIBILITY: "VIEWER_SET_PIN_VISIBILITY",

	GET_CURRENT_VIEWPOINT: "VIEWER_GET_CURRENT_VIEWPOINT",

	MEASURE_MODE_CLICK_POINT: "VIEWER_MEASURE_MODE_CLICK_POINT",

	PICK_POINT: "VIEWER_PICK_POINT",
	MOVE_POINT: "VIEWER_MOVE_POINT",
	SET_CAMERA: "VIEWER_SET_CAMERA",

	LOGO_CLICK: "VIEWER_LOGO_CLICK",

	// Clipping plane events
	CLEAR_CLIPPING_PLANES: "VIEWER_CLEAR_CLIPPING_PLANES",
	ADD_CLIPPING_PLANE: "VIEWER_ADD_CLIPPING_PLANE",
	MOVE_CLIPPING_PLANE: "VIEWER_MOVE_CLIPPING_PLANE",
	CLIPPING_PLANE_READY: "VIEWER_CLIPPING_PLANE_READY",
	SET_CLIPPING_PLANES: "VIEWER_SET_CLIPPING_PLANES",

	// Pin events
	CLICK_PIN: "VIEWER_CLICK_PIN",
	CHANGE_PIN_COLOUR: "VIEWER_CHANGE_PIN_COLOUR",
	REMOVE_PIN: "VIEWER_REMOVE_PIN",
	ADD_PIN: "VIEWER_ADD_PIN",
	MOVE_PIN: "VIEWER_MOVE_PIN",

};

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

var ViewerManager = {};

(function() {
	"use strict";

	ViewerManager = function() {
		this.currentViewerName = "";
		this.currentViewer = null;
		this.linkedViewers = [];
		this.linkedFunctions = [];
		
		this.viewers = {};
		
		this.selectDefaultCurrentViewer = function()
		{
			var viewerNames = Object.keys(this.viewers);
			
			if (viewerNames.length)
			{
				this.currentViewer = this.viewers[viewerNames[0]];
			} else {
				this.currentViewer = null;
			}
		};
		
		x3dom.runtime.ready = this.initRuntime;
	};
	
	ViewerManager.prototype.isValidViewerName = function(name) {
		return this.viewers.hasOwnProperty(name);
	};

	ViewerManager.prototype.reshape = function() {
		// TODO: Only splits horizontally at the moment
		var viewerSize = (100 / Object.keys(this.viewers).length);
		var i = 0;

		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				this.viewers[name].viewer.style.width = viewerSize + "%";
				this.viewers[name].viewer.style.left = (i * viewerSize) + "%";

				i++;
			}
		}
	};

	ViewerManager.prototype.removeViewer = function(name) {
		if (this.isValidHandle(name)) {
			// Can't be left with nothing
			if (Object.keys(this.viewers).length === 1) {
				return;
			}

			if (this.viewers[name] === this.currentViewer) {
				this.selectDefaultCurrentViewer();
			}

			this.linkedViewers = this.linkedViewers.filter(function(linkedName) {
				return (linkedName !== name);
			});

			this.viewers[name].close();
			delete this.viewers[name];

			if (this.currentViewerName === name) {
				this.defaultViewerHandle = Object.keys(this.viewers)[0];
			}

			this.reshape();
		}
	};

	ViewerManager.prototype.close = function() {
		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				this.removeViewer(name);
			}
		}
	};

	ViewerManager.prototype.registerMe = function(viewer) {
		this.viewers[viewer.name] = viewer;
		
		if (Object.keys(this.viewers).length === 1)
		{
			this.selectDefaultCurrentViewer();
		}
		
		this.reshape();
	};

	ViewerManager.prototype.linkMe = function(handle) {
		this.addMe(this.linkedViewers, handle);
	};

	ViewerManager.prototype.switchCurrent = function(name) {
		if (this.isValidHandle(name)) {
			this.viewMaster = this.viewers[name];
		}
	};

	ViewerManager.prototype.getCurrentViewer = function() {
		if (this.currentViewer) {
			return this.currentViewer;
		}
	};

	ViewerManager.prototype.linkFunction = function(callback) {
		this.linkedFunctions.push(callback);
	};

	ViewerManager.prototype.viewpointLinkFunction = function(newEvent, event) {
		if (!this.linkedViewers.length || !this.currentViewer) {
			return;
		}

		// Only updates to the master should do anything
		if (event.target !== this.currentViewer.getCurrentViewpoint()) {
			return;
		}

		event.orientation[1] = event.orientation[1] * -1;
		this.currentViewer.transformEvent(event, event.target, false);

		var i;

		for (i = 0; i < this.linkedViewers.length; i++) {
			var name = this.linkedViewers[i];

			if (this.currentViewer.handle === name) { // Don't need to update the master
				continue;
			}

			if (this.isValidName(name)) {
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), false);
				this.viewers[name].getCurrentViewpoint().setAttribute("position", event.position.toString());
				this.viewers[name].getCurrentViewpoint().setAttribute("orientation", event.orientation.toString());
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), true);
			}
		}

		for (i = 0; i < this.linkedFunctions.length; i++) {
			this.linkedFunctions[i](event);
		}
	};

	ViewerManager.prototype.initRuntime = function() {
		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				if (!this.viewers[name].runtime) {
					this.viewers[name].initRuntime();
				}
			}
		}
	};

	/*
	this.diffHandle = null;
	this.diffView = function(enable) {
		if (enable) {
			if (!self.isValidHandle(self.diffHandle)) {
				self.diffHandle = self.addViewer("diffView");

				self.getDiffViewer().linkMe();
				self.getDefaultViewer().linkMe();
			}
		} else {
			if (self.isValidHandle(self.diffHandle)) {
				self.removeViewer(self.diffHandle);
			}
		}
	};

	this.setDiffColors = function(diffColors) {
		self.getDefaultViewer().setDiffColors(diffColors);
		self.getDiffViewer().setDiffColors(diffColors);
	};
	*/
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountBilling", accountBilling);

	function accountBilling() {
		return {
			restrict: 'EA',
			templateUrl: 'accountBilling.html',
			scope: {
				account: "=",
				billingAddress: "=",
				quota: "=",
				billings: "=",
				subscriptions: "=",
				plans: "="
			},
			controller: AccountBillingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountBillingCtrl.$inject = ["$scope", "$window", "$timeout", "UtilsService", "serverConfig"];

	function AccountBillingCtrl($scope, $window, $timeout, UtilsService, serverConfig) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.showInfo = true;
		vm.saveDisabled = true;
		vm.countries = serverConfig.countries;
		vm.usStates = serverConfig.usStates;
		vm.showStates = false;
		vm.newBillingAddress = {};

		/*
		 * Watch for change in licenses
		 */
		$scope.$watch("vm.numNewLicenses", function () {
			if (angular.isDefined(vm.numNewLicenses)) {
				console.log(vm.numLicenses, vm.numNewLicenses);
				if ((vm.numLicenses === 0) && (vm.numNewLicenses === 0)) {
					vm.saveDisabled = true;
				}
				else if (vm.numLicenses === vm.numNewLicenses) {
					vm.saveDisabled = angular.equals(vm.newBillingAddress, vm.billingAddress) || aRequiredAddressFieldIsEmpty();
				}
				else {
					vm.saveDisabled = aRequiredAddressFieldIsEmpty();
				}
				vm.priceLicenses = vm.numNewLicenses * vm.pricePerLicense;
			}
			else {
				vm.saveDisabled = true;
			}
		});

		/*
		 * Watch passed billing address
		 */
		$scope.$watch("vm.billingAddress", function () {
			if (angular.isDefined(vm.billingAddress)) {
				vm.newBillingAddress = angular.copy(vm.billingAddress);
				// Cannot change country
				vm.countrySelectDisabled = angular.isDefined(vm.billingAddress.countryCode);
			}
		}, true);

		/*
		 * Watch for change in billing info
		 */
		$scope.$watch("vm.newBillingAddress", function () {
			if (angular.isDefined(vm.newBillingAddress)) {
				if (vm.numNewLicenses !== 0) {
					vm.saveDisabled = angular.equals(vm.newBillingAddress, vm.billingAddress) || aRequiredAddressFieldIsEmpty();
					// Company name required if VAT number exists
					vm.companyNameRequired = (angular.isDefined(vm.newBillingAddress.vat) && (vm.newBillingAddress.vat !== ""));
				}
				vm.showStates = (vm.newBillingAddress.countryCode === "US")
			}
		}, true);

		/*
		 * Watch for subscriptions
		 */
		$scope.$watch("vm.subscriptions", function () {
			if (angular.isDefined(vm.subscriptions) && angular.isDefined(vm.plans)) {
				setupLicensesInfo();
			}
		}, true);

		/*
		 * Watch for plans
		 */
		$scope.$watch("vm.plans", function () {
			if (angular.isDefined(vm.subscriptions) && angular.isDefined(vm.plans)) {
				setupLicensesInfo();
			}
		}, true);

		/*
		 * Watch for billings
		 */
		$scope.$watch("vm.billings", function () {
			var i, length;

			if (angular.isDefined(vm.billings)) {
				for (i = 0, length = vm.billings.length; i < length; i += 1) {
					vm.billings[i].status = vm.billings[i].pending ? "Pending" : "Payed";
				}
			}
		});

		/**
		 * Show the billing page with the item
		 *
		 * @param index
		 */
		vm.downloadBilling = function (index) {
			//$window.open("/billing?user=" + vm.account + "&item=" + index);
			$window.open(serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/billings/" + vm.billings[index].invoiceNo + ".pdf"), "_blank");
		};

		vm.changeSubscription = function () {
			var data = {
				plans: [{
					plan: "THE-100-QUID-PLAN",
					quantity: vm.numNewLicenses
				}],
				billingAddress: vm.newBillingAddress
			};

			if (vm.numLicenses === vm.numNewLicenses) {
				vm.payPalInfo = "Updating billing information. Please do not refresh the page or close the tab.";
			}
			else {
				vm.payPalInfo = "Redirecting to PayPal. Please do not refresh the page or close the tab.";
			}
			UtilsService.showDialog("paypalDialog.html", $scope, null, true);
			promise = UtilsService.doPost(data, vm.account + "/subscriptions");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					if (vm.numLicenses === vm.numNewLicenses) {
						vm.payPalInfo = "Billing information updated.";
						$timeout(function () {
							UtilsService.closeDialog();
						}, 2000);
					}
					else {
						location.href = response.data.url;
					}
				}
				else {
					vm.closeDialogEnabled = true;
					vm.changeHelpToShow = response.data.value;
					vm.payPalInfo = response.data.message;
				}
			});
		};

		vm.closeDialog = function () {
			UtilsService.closeDialog();
		};

		/**
		 * Set up num licenses and price
		 */
		function setupLicensesInfo () {
			vm.numLicenses = vm.subscriptions.filter(function (sub) {return sub.inCurrentAgreement;}).length;
			vm.numNewLicenses = vm.numLicenses;
			vm.pricePerLicense = vm.plans[0].amount;
		}

		/**
		 * Check if any required input fields is empty
		 *
		 * @returns {boolean}
		 */
		function aRequiredAddressFieldIsEmpty () {
			return (
				angular.isUndefined(vm.newBillingAddress.firstName) ||
				angular.isUndefined(vm.newBillingAddress.lastName) ||
				angular.isUndefined(vm.newBillingAddress.line1) ||
				angular.isUndefined(vm.newBillingAddress.postalCode) ||
				angular.isUndefined(vm.newBillingAddress.city) ||
				angular.isUndefined(vm.newBillingAddress.countryCode) ||
				(angular.isDefined(vm.newBillingAddress.vat) && (vm.newBillingAddress.vat !== "") && angular.isUndefined(vm.newBillingAddress.company)) ||
				((vm.newBillingAddress.countryCode === "US") && angular.isUndefined(vm.newBillingAddress.state))
			);
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountDir", accountDir);

	function accountDir() {
		return {
			restrict: "EA",
			templateUrl: "account.html",
			scope: {
				state: "=",
				query: "=",
				account: "="
			},
			controller: AccountCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["$scope", "$injector", "$location", "$timeout", "AccountService", "Auth", "UtilsService"];

	function AccountCtrl($scope, $injector, $location, $timeout, AccountService, Auth, UtilsService) {
		var vm = this;

		/*
		 * Get the account data
		 */
		$scope.$watchGroup(["vm.account", "vm.query.page"], function()
		{
			var promise;

			if (vm.account || vm.query.page) {
				// Go to the correct "page"
				if (vm.query.hasOwnProperty("page")) {
					// Check that there is a directive for that "page"
					if ($injector.has("account" + UtilsService.capitalizeFirstLetter(vm.query.page) + "Directive")) {
						vm.itemToShow = vm.query.page;
					}
					else {
						vm.itemToShow = "repos";
					}

					// Handle Billing Page
					if (vm.itemToShow === "billing") {
						// Handle return back from PayPal
						if ($location.search().hasOwnProperty("cancel")) {
							// Cancelled

							// Clear token URL parameters
							$location.search("token", null);
							$location.search("cancel", null);

							init();
						}
						else if ($location.search().hasOwnProperty("token")) {
							// Get initial user info, which may change if returning from PayPal
							getUserInfo();

							// Made a payment
							vm.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
							vm.closeDialogEnabled = false;
							UtilsService.showDialog("paypalDialog.html", $scope);
							promise = UtilsService.doPost({token: ($location.search()).token}, "payment/paypal/execute");
							promise.then(function (response) {
								console.log("payment/paypal/execute ", response);
								if (response.status === 200) {
								}
								vm.payPalInfo = "PayPal has finished processing. Thank you.";

								// Clear token URL parameter
								$location.search("token", null);

								$timeout(function () {
									UtilsService.closeDialog();
									init();
								}, 2000);
							});
						}
						else {
							init();
						}
					}
					else {
						init();
					}
				}
				else {
					vm.itemToShow = "repos";
					init();
				}

			} else {
				vm.username        = null;
				vm.firstName       = null;
				vm.lastName        = null;
				vm.email           = null;
				vm.projectsGrouped = null;
			}
		});

		vm.showItem = function (item) {
			vm.itemToShow = item;
		};

		/**
		 * For pages to show other pages
		 *
		 * @param page
		 * @param callingPage
		 */
		vm.showPage = function (page, callingPage) {
			console.log(page, callingPage);
			vm.itemToShow = page;
			$location.search("page", page);
			vm.callingPage = callingPage;
		};

		/**
		 * Event listener for change in local storage login status
		 *
		 * @param event
		 */
		function loginStatusListener (event) {
			if ((event.key === "tdrLoggedIn") && (event.newValue === "false")) {
				Auth.logout();
			}
		}
		window.addEventListener("storage", loginStatusListener, false);
		// Set the logged in status to the account name just once
		if ((localStorage.getItem("tdrLoggedIn") === "false") && (vm.account !== null)) {
			localStorage.setItem("tdrLoggedIn", vm.account);
		}

		function init () {
			var billingsPromise,
				subscriptionsPromise,
				plansPromise;

			getUserInfo();

			billingsPromise = UtilsService.doGet(vm.account + "/billings");
			billingsPromise.then(function (response) {
				console.log("**billings** ", response);
				vm.billings = response.data;
			});

			subscriptionsPromise = UtilsService.doGet(vm.account + "/subscriptions");
			subscriptionsPromise.then(function (response) {
				console.log("**subscriptions** ", response);
				vm.subscriptions = response.data;
			});

			plansPromise = UtilsService.doGet("plans");
			plansPromise.then(function (response) {
				console.log("**plans** ", response);
				if (response.status === 200) {
					vm.plans = response.data;
				}
			});
		}

		function getUserInfo () {
			var userInfoPromise;

			userInfoPromise = AccountService.getUserInfo(vm.account);
			userInfoPromise.then(function (response) {
				var i, length;
				console.log("**userInfo** ", response);
				vm.accounts = response.data.accounts;
				vm.username = vm.account;
				vm.firstName = response.data.firstName;
				vm.lastName = response.data.lastName;
				vm.email = response.data.email;

				// Pre-populate billing name if it doesn't exist with profile name
				vm.billingAddress = {};
				if (response.data.hasOwnProperty("billingInfo")) {
					vm.billingAddress = response.data.billingInfo;
					if (!vm.billingAddress.hasOwnProperty("firstName")) {
						vm.billingAddress.firstName = vm.firstName;
						vm.billingAddress.lastName = vm.lastName;
					}
				}

				// Get quota
				if (angular.isDefined(vm.accounts)) {
					for (i = 0, length = vm.accounts.length; i < length; i += 1) {
						if (vm.accounts[i].account === vm.account) {
							vm.quota = vm.accounts[i].quota;
							break;
						}
					}
				}
			});
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountFederations", accountFederations);

	function accountFederations() {
		return {
			restrict: 'EA',
			templateUrl: 'accountFederations.html',
			scope: {
				account: "=",
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountFederationsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountFederationsCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService"];

	function AccountFederationsCtrl ($scope, $location, $timeout, UtilsService) {
		var vm = this,
			federationToDeleteIndex,
			accountsToUse;

		// Init
		vm.federationOptions = {
			edit: {label: "Edit", icon: "edit"},
			team: {label: "Team", icon: "group"},
			delete: {label: "Delete", icon: "delete"}
		};

		/*
		 * Watch accounts input
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;

			if (angular.isDefined(vm.accounts)) {
				vm.showInfo = true;
				if (vm.accounts.length > 0) {
					accountsToUse = [];
					for (i = 0, length = vm.accounts.length; i < length; i += 1) {
						if (vm.accounts[i].fedProjects.length > 0) {
							accountsToUse.push(vm.accounts[i]);
							vm.showInfo = false;
						}
					}

					vm.accountsToUse = angular.copy(accountsToUse);
					console.log(vm.accountsToUse);
				}
			}
		});

		/*
		 * Watch for change in edited federation
		 */
		$scope.$watch("vm.newFederationData", function () {
			if (vm.federationOriginalData === null) {
				vm.newFederationButtonDisabled = (angular.isUndefined(vm.newFederationData.project)) || (vm.newFederationData.project === "");
			}
			else {
				vm.newFederationButtonDisabled = angular.equals(vm.newFederationData, vm.federationOriginalData);
			}
		}, true);

		/**
		 * Open the federation dialog
		 *
		 * @param event
		 */
		vm.setupNewFederation = function (event) {
			vm.accountsToUse = angular.copy(accountsToUse);
			vm.federationOriginalData = null;
			vm.newFederationData = {
				desc: "",
				type: "",
				subProjects: []
			};
			UtilsService.showDialog("federationDialog.html", $scope, event);
		};

		/**
		 * Close the federation dialog
		 *
		 */
		vm.closeDialog = function () {
			UtilsService.closeDialog();
		};

		/**
		 * Toggle showing of projects in an account
		 *
		 * @param index
		 */
		vm.toggleShowProjects = function (index) {
			vm.accountsToUse[index].showProjects = !vm.accountsToUse[index].showProjects;
			vm.accountsToUse[index].showProjectsIcon = vm.accountsToUse[index].showProjects ? "folder_open" : "folder";
		};

		/**
		 * Add a project to a federation
		 *
		 * @param accountIndex
		 * @param projectIndex
		 */
		vm.addToFederation = function (accountIndex, projectIndex) {
			vm.showRemoveWarning = false;

			vm.newFederationData.subProjects.push({
				accountIndex: accountIndex,
				database: vm.accountsToUse[accountIndex].account,
				projectIndex: projectIndex,
				project: vm.accountsToUse[accountIndex].projects[projectIndex].project
			});

			vm.accountsToUse[accountIndex].projects[projectIndex].federated = true;
		};

		/**
		 * Remove a project from a federation
		 *
		 * @param index
		 */
		vm.removeFromFederation = function (index) {
			var i, j, iLength, jLength,
				exit = false,
				item;

			// Cannot have existing federation with no sub projects
			if (vm.newFederationData.hasOwnProperty("timestamp") && vm.newFederationData.subProjects.length === 1) {
				vm.showRemoveWarning = true;
			}
			else {
				item = vm.newFederationData.subProjects.splice(index, 1);
				for (i = 0, iLength = vm.accountsToUse.length; (i < iLength) && !exit; i += 1) {
					if (vm.accountsToUse[i].account === item[0].database) {
						for (j = 0, jLength = vm.accountsToUse[i].projects.length; (j < jLength) && !exit; j += 1) {
							if (vm.accountsToUse[i].projects[j].project === item[0].project) {
								vm.accountsToUse[i].projects[j].federated = false;
								exit = true;
							}
						}
					}
				}
			}
		};

		/**
		 * Save a federation
		 */
		vm.saveFederation = function () {
			var promise;

			if (vm.federationOriginalData === null) {
				promise = UtilsService.doPost(vm.newFederationData, vm.account + "/" + vm.newFederationData.project);
				promise.then(function (response) {
					console.log(response);
					vm.accountsToUse[0].fedProjects.push(vm.newFederationData);
					vm.closeDialog();
				});
			}
			else {
				promise = UtilsService.doPut(vm.newFederationData, vm.account + "/" + vm.newFederationData.project);
				promise.then(function (response) {
					console.log(response);
					vm.closeDialog();
				});
			}

			$timeout(function () {
				$scope.$apply();
			});
		};

		/**
		 * Open the federation in the viewer
		 */
		vm.viewFederation = function (account, index) {
			$location.path("/" + account + "/" + vm.accountsToUse[0].fedProjects[index].project, "_self").search({});
		};

		/**
		 * Handle federation option selection
		 *
		 * @param event
		 * @param option
		 * @param index
		 */
		vm.doFederationOption = function (event, option, index) {
			switch (option) {
				case "edit":
					setupEditFederation(event, index);
					break;

				case "team":
					setupEditTeam(event, index);
					break;

				case "delete":
					setupDelete(event, index);
					break;
			}
		};

		/**
		 * Delete federation
		 */
		vm.delete = function () {
			var promise = UtilsService.doDelete({}, vm.account + "/" + vm.accountsToUse[0].fedProjects[federationToDeleteIndex].project);
			promise.then(function (response) {
				if (response.status === 200) {
					vm.accountsToUse[0].fedProjects.splice(federationToDeleteIndex, 1);
					vm.closeDialog();
				}
				else {
					vm.deleteError = "Error deleting federation";
				}
			});
		};

		/**
		 * Edit a federation
		 *
		 * @param event
		 * @param index
		 */
		function setupEditFederation (event, index) {
			var i, j, k, iLength, jLength, kLength;

			vm.showRemoveWarning = false;

			vm.accountsToUse = angular.copy(accountsToUse);
			vm.federationOriginalData = vm.accountsToUse[0].fedProjects[index];
			vm.newFederationData = angular.copy(vm.federationOriginalData);

			// Disable projects in the projects list that are federated
			for (i = 0, iLength = vm.accountsToUse.length; i < iLength; i += 1) {
				for (j = 0, jLength = vm.accountsToUse[i].projects.length; j < jLength; j += 1) {
					vm.accountsToUse[i].projects[j].federated = false;
					for (k = 0, kLength = vm.federationOriginalData.subProjects.length; k < kLength; k += 1) {
						if (vm.federationOriginalData.subProjects[k].project === vm.accountsToUse[i].projects[j].project) {
							vm.accountsToUse[i].projects[j].federated = true;
						}
					}
				}
			}

			UtilsService.showDialog("federationDialog.html", $scope, event);
		}

		/**
		 * Set up deleting of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		 function setupDelete (event, index) {
			federationToDeleteIndex = index ;
			vm.deleteError = null;
			vm.deleteTitle = "Delete Federation";
			vm.deleteWarning = "This federation will be lost permanently and will not be recoverable";
			vm.deleteName = vm.accountsToUse[0].fedProjects[federationToDeleteIndex].project;
			UtilsService.showDialog("deleteDialog.html", $scope, event, true);
		}

		/**
		 * Set up team of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		function setupEditTeam (event, index) {
			vm.item = vm.accountsToUse[0].fedProjects[index];
			UtilsService.showDialog("teamDialog.html", $scope, event);
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountInfo", accountInfo);

	function accountInfo() {
		return {
			restrict: 'E',
			templateUrl: 'accountInfo.html',
			scope: {
				username: "=",
				firstName: "=",
				lastName: "=",
				email: "=",
				itemToShow: "="
			},
			controller: AccountInfoCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountInfoCtrl.$inject = ["$location"];

	function AccountInfoCtrl ($location) {
		var vm = this;
		
		/*
		 * Init
		 */
		vm.accountOptions = {
			repos: {label: "Repos"},
			profile: {label: "Profile"},
			billing: {label: "Billing"},
			licenses: {label: "Licenses"}
		};

		/**
		 * Show account "page"
		 *
		 * @param item
		 */
		vm.showItem = function (item) {
			vm.itemToShow = item;
			$location.search({}).search("page", item);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountLicenses", accountLicenses);

	function accountLicenses() {
		return {
			restrict: 'EA',
			templateUrl: 'accountLicenses.html',
			scope: {
				account: "=",
				showPage: "&",
				subscriptions: "="
			},
			controller: AccountLicensesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountLicensesCtrl.$inject = ["$scope", "UtilsService", "StateManager"];

	function AccountLicensesCtrl($scope, UtilsService, StateManager) {
		var vm = this,
			i,
			promise;

		/*
		 * Watch subscriptions
		 */
		$scope.$watch("vm.subscriptions", function () {
			vm.unassigned = [];
			vm.licenses = [];
			vm.allLicensesAssigned = false;
			vm.numLicenses = vm.subscriptions.length;
			vm.toShow = (vm.numLicenses > 0) ? "0+": "0";

			for (i = 0; i < vm.numLicenses; i += 1) {
				if (vm.subscriptions[i].hasOwnProperty("assignedUser")) {
					vm.licenses.push({
						user: vm.subscriptions[i].assignedUser,
						id: vm.subscriptions[i]._id,
						showRemove: (vm.subscriptions[i].assignedUser !== vm.account)
					});
				}
				else {
					vm.unassigned.push(vm.subscriptions[i]._id);
				}
			}
			vm.allLicensesAssigned = (vm.unassigned.length === 0);
		});

		/*
		 * Watch changes to the new license assignee name
		 */
		$scope.$watch("vm.newLicenseAssignee", function (newValue) {
			vm.addMessage = "";
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue.toString() !== ""));
		});

		/**
		 * Assign a license to the selected user
		 */
		vm.assignLicense = function (event) {
			var doSave = false,
				enterKey = 13;

			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doSave = true;
				}
			}
			else {
				doSave = true;
			}

			if (doSave) {
				promise = UtilsService.doPost(
					{user: vm.newLicenseAssignee},
					vm.account + "/subscriptions/" + vm.unassigned[0] + "/assign"
				);
				promise.then(function (response) {
					console.log(response);
					if (response.status === 200) {
						vm.addMessage = "User " + vm.newLicenseAssignee + " assigned a license";
						vm.licenses.push({user: response.data.assignedUser, id: response.data._id, showRemove: true});
						vm.unassigned.splice(0, 1);
						vm.allLicensesAssigned = (vm.unassigned.length === 0);
						vm.addDisabled = vm.allLicensesAssigned;
						vm.newLicenseAssignee = "";
					}
					else if (response.status === 400) {
						vm.addMessage = "This user has already been assigned a license";
					}
					else if (response.status === 404) {
						vm.addMessage = "User not found";
					}
				});
			}
		};

		/**
		 * Remove a license
		 *
		 * @param index
		 */
		vm.removeLicense = function (index) {
			promise = UtilsService.doDelete({}, vm.account + "/subscriptions/" + vm.licenses[index].id + "/assign");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.unassigned.push(vm.licenses[index].id);
					vm.licenses.splice(index, 1);
					vm.addDisabled = false;
					vm.allLicensesAssigned = false;
				}
				else if (response.data.status === 400) {
					if (response.data.value === 94) {
						vm.licenseAssigneeIndex = index;
						vm.userProjects = response.data.projects;
						UtilsService.showDialog("removeLicenseDialog.html", $scope);
					}
				}
			});
		};

		/**
		 * Remove license from user who is a team member of a project
		 */
		vm.removeLicenseConfirmed = function () {
			promise = UtilsService.doDelete({}, vm.account + "/subscriptions/" + vm.licenses[vm.licenseAssigneeIndex].id + "/assign?cascadeRemove=true");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.unassigned.push(vm.licenses[vm.licenseAssigneeIndex].id);
					vm.licenses.splice(vm.licenseAssigneeIndex, 1);
					vm.addDisabled = false;
					UtilsService.closeDialog();
				}
			});
		};

		vm.goToBillingPage = function () {
			//StateManager.clearQuery("page");
			StateManager.setQuery({page: "billing"});
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountMenu", accountMenu);

	function accountMenu() {
		return {
			restrict: "EA",
			templateUrl: "accountMenu.html",
			scope: {
				account: "="
			},
			controller: AccountMenuCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	AccountMenuCtrl.$inject = ["Auth", "EventService"];

	function AccountMenuCtrl (Auth, EventService) {
		var vm = this,
			promise;

		/**
		 * Open menu
		 *
		 * @param $mdOpenMenu
		 * @param ev
		 */
		vm.openMenu = function ($mdOpenMenu, ev) {
			$mdOpenMenu(ev);
		};

		/**
		 * Show user projects
		 */
		vm.showProjects = function () {
			EventService.send(EventService.EVENT.SHOW_PROJECTS);
		};

		/**
		 * Logout
		 */
		vm.logout = function () {
			Auth.logout();
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountProfile", accountProfile);

	function accountProfile() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProfile.html',
			scope: {
				username: "=",
				firstName: "=",
				lastName: "=",
				email: "="
			},
			controller: AccountProfileCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProfileCtrl.$inject = ["AccountService"];

	function AccountProfileCtrl(AccountService) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.showInfo = true;
		vm.showChangePassword = false;
		vm.firstNameNew = vm.firstName;
		vm.lastNameNew = vm.lastName;
		vm.emailNew = vm.email;

		/**
		 * Update the user info
		 */
		vm.updateInfo = function () {
			promise = AccountService.updateInfo(vm.username, {
				email: vm.emailNew,
				firstName: vm.firstNameNew,
				lastName: vm.lastNameNew
			});
			promise.then(function (response) {
				console.log(response);
				if (response.statusText === "OK") {
					vm.infoSaveInfo = "Saved";
					vm.firstName = vm.firstNameNew;
					vm.lastName = vm.lastNameNew;
					vm.email = vm.emailNew;

				} else {
					vm.infoSaveInfo = "Error saving info";
				}
			});
		};

		/**
		 * Update the user password
		 */
		vm.updatePassword = function () {
			promise = AccountService.updatePassword(vm.username, {
				oldPassword: vm.oldPassword,
				newPassword: vm.newPassword
			});
			promise.then(function (response) {
				console.log(response);
				if (response.statusText === "OK") {
					vm.passwordSaveInfo = "Saved";
				} else {
					vm.passwordSaveInfo = "Error saving password";
				}
			});
		};

		/**
		 * Toggle showing of user info
		 */
		vm.toggleInfo = function () {
			vm.showInfo = !vm.showInfo;
		};

		/**
		 * Toggle showing of password change
		 */
		vm.toggleChangePassword = function () {
			vm.showChangePassword = !vm.showChangePassword;
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountProject", accountProject);

	function accountProject () {
		return {
			restrict: 'E',
			templateUrl: 'accountProject.html',
			scope: {
				account: "=",
				project: "=",
				onUploadFile: "&",
				uploadedFile: "=",
				onShowPage: "&",
				onSetupDeleteProject: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountProjectCtrl,
			controllerAs: 'vm',
			bindToController: true,
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on('$destroy', function(){
					scope.vm.uploadedFileWatch(); // Disable events watch
				});
			}
		};
	}

	AccountProjectCtrl.$inject = ["$scope", "$location", "$timeout", "$interval", "$filter", "UtilsService", "serverConfig"];

	function AccountProjectCtrl ($scope, $location, $timeout, $interval, $filter, UtilsService, serverConfig) {
		var vm = this,
			infoTimeout = 4000;

		// Init
		vm.project.name = vm.project.project;
		if (vm.project.timestamp !== null) {
			vm.project.timestampPretty = $filter("prettyDate")(vm.project.timestamp, {showSeconds: true});
		}
		vm.project.canUpload = true;
		vm.projectOptions = {
			upload: {label: "Upload file", icon: "cloud_upload"},
			team: {label: "Team", icon: "group"},
			delete: {label: "Delete", icon: "delete"}
		};
		checkFileUploading();

		/*
		 * Watch changes in upload file
		 */
		vm.uploadedFileWatch = $scope.$watch("vm.uploadedFile", function () {
			if (angular.isDefined(vm.uploadedFile) && (vm.uploadedFile !== null) && (vm.uploadedFile.project.name === vm.project.name)) {
				console.log("Uploaded file", vm.uploadedFile);
				uploadFileToProject(vm.uploadedFile.file);
			}
		});

		/**
		 * Go to the project viewer
		 */
		vm.goToProject = function () {
			if (!vm.project.uploading) {
				if (vm.project.timestamp === null) {
					// No timestamp indicates no model previously uploaded
					vm.uploadFile();
				}
				else {
					$location.path("/" + vm.account + "/" + vm.project.name, "_self").search("page", null);
				}
			}
		};

		/**
		 * Call parent upload function
		 */
		vm.uploadFile = function () {
			vm.onUploadFile({project: vm.project});
		};

		/**
		 * Handle project option selection
		 *
		 * @param event
		 * @param option
		 */
		vm.doProjectOption = function (event, option) {
			switch (option) {
				case "upload":
					vm.uploadFile();
					break;

				case "team":
					setupEditTeam(event);
					break;

				case "delete":
					vm.onSetupDeleteProject({event: event, project: vm.project});
					break;
			}
		};

		/**
		 * Go to the billing page to add more licenses
		 */
		vm.setupAddLicenses = function () {
			vm.onShowPage({page: "billing", callingPage: "repos"});
			UtilsService.closeDialog();
		};

		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

		/**
		 * Upload file/model to project
		 *
		 * @param file
		 */
		function uploadFileToProject (file) {
			var promise,
				formData;

			// Check the quota
			promise = UtilsService.doGet(vm.account + ".json");
			promise.then(function (response) {
				console.log(response);
				if (file.size > response.data.accounts[0].quota.spaceLimit) {
					// Show the over quota dialog
					UtilsService.showDialog("overQuotaDialog.html", $scope, null, true);
				}
				else {
					vm.project.uploading = true;
					vm.showUploading = true;
					vm.showFileUploadInfo = false;

					// Check for file size limit
					if (file.size > serverConfig.uploadSizeLimit) {
						$timeout(function () {
							vm.showUploading = false;
							vm.showFileUploadInfo = true;
							vm.fileUploadInfo = "File exceeds size limit";
							$timeout(function () {
								vm.project.uploading = false;
							}, infoTimeout);
						});
					}
					else {
						formData = new FormData();
						formData.append("file", file);
						promise = UtilsService.doPost(formData, vm.account + "/" + vm.project.name + "/upload", {'Content-Type': undefined});
						promise.then(function (response) {
							console.log("uploadModel", response);
							if ((response.data.status === 400) || (response.data.status === 404)) {
								// Upload error
								if (response.data.value === 68) {
									vm.fileUploadInfo = "Unsupported file format";
								}
								else if (response.data.value === 66) {
									vm.fileUploadInfo = "Insufficient quota for model";
								}
								vm.showUploading = false;
								vm.showFileUploadInfo = true;
								$timeout(function () {
									vm.project.uploading = false;
								}, infoTimeout);
							}
							else {
								console.log("Polling upload!");
								pollUpload();
							}
						});
					}
				}
			});
		}

		/**
		 * Display file uploading and info
		 */
		function checkFileUploading () {
			var promise = UtilsService.doGet(vm.account + "/" + vm.project.name + ".json");
			promise.then(function (response) {
				if (response.data.status === "processing") {
					vm.project.uploading = true;
					vm.showUploading = true;
					vm.showFileUploadInfo = false;
					pollUpload();
				}
			});
		}

		/**
		 * Poll uploading of file
		 */
		function pollUpload () {
			var interval,
				promise;

			interval = $interval(function () {
				promise = UtilsService.doGet(vm.account + "/" + vm.project.name + ".json");
				promise.then(function (response) {
					console.log("uploadStatus", response);
					if ((response.data.status === "ok") || (response.data.status === "failed")) {
						if (response.data.status === "ok") {
							vm.project.timestamp = new Date();
							vm.project.timestampPretty = $filter("prettyDate")(vm.project.timestamp, {showSeconds: true});
							vm.fileUploadInfo = "Uploaded";
						}
						else {
							if (response.data.hasOwnProperty("errorReason")) {
								vm.fileUploadInfo = response.data.errorReason.message;
							}
							else {
								vm.fileUploadInfo = "Failed to upload file";
							}
						}
						vm.showUploading = false;
						$interval.cancel(interval);
						vm.showFileUploadInfo = true;
						$timeout(function () {
							vm.project.uploading = false;
						}, infoTimeout);
					}
				});
			}, 1000);
		}

		/**
		 * Set up team of project
		 *
		 * @param {Object} event
		 */
		function setupEditTeam (event) {
			vm.item = vm.project;
			UtilsService.showDialog("teamDialog.html", $scope, event);
		}

	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountProjects", accountProjects);

	function accountProjects() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProjects.html',
			scope: {
				account: "=",
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location", "$element", "$timeout", "AccountService", "UtilsService"];

	function AccountProjectsCtrl($scope, $location, $element, $timeout, AccountService, UtilsService) {
		var vm = this,
			existingProjectToUpload,
			existingProjectFileUploader,
			newProjectFileUploader;

		/*
		 * Init
		 */
		vm.info = "Retrieving projects...";
		vm.showProgress = true;
		vm.projectTypes = ["Architectural", "Structural", "Mechanical", "GIS", "Other"];

		// Setup file uploaders
		existingProjectFileUploader = $element[0].querySelector("#existingProjectFileUploader");
		existingProjectFileUploader.addEventListener(
			"change",
			function () {
				vm.uploadedFile = {project: existingProjectToUpload, file: this.files[0]};
				$scope.$apply();
			},
			false
		);
		newProjectFileUploader = $element[0].querySelector("#newProjectFileUploader");
		newProjectFileUploader.addEventListener(
			"change",
			function () {
				vm.newProjectFileToUpload = this.files[0];
				vm.newProjectFileSelected = true;
				$scope.$apply();
			},
			false
		);

		/*
		 * Added data to accounts and projects for UI
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;
			
			if (angular.isDefined(vm.accounts)) {
				console.log(vm.accounts);
				vm.showProgress = false;
				vm.projectsExist = (vm.accounts.length > 0);
				vm.info = vm.projectsExist ? "" : "There are currently no projects";
				// Accounts
				for (i = 0, length = vm.accounts.length; i < length; i+= 1) {
					vm.accounts[i].name = vm.accounts[i].account;
					vm.accounts[i].showProjects = true;
					vm.accounts[i].showProjectsIcon = "folder_open";
				}
			}
		});

		/*
		 * Watch the new project type
		 */
		$scope.$watch("vm.newProjectData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showProjectTypeOtherInput = (newValue.toString() === "Other");
			}
		});

		/*
		 * Watch new project data
		 */
		$scope.$watch("vm.newProjectData", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.newProjectButtonDisabled =
					(angular.isUndefined(newValue.name) || (angular.isDefined(newValue.name) && (newValue.name === "")));
				
				if (!vm.newProjectButtonDisabled && (newValue.type === "Other")) {
					vm.newProjectButtonDisabled =
						(angular.isUndefined(newValue.otherType) || (angular.isDefined(newValue.otherType) && (newValue.otherType === "")));
				}
			}
		}, true);

		/*
		 * Watch new database name
		 */
		$scope.$watch("vm.newDatabaseName", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.newDatabaseButtonDisabled =
					(angular.isUndefined(newValue) || (angular.isDefined(newValue) && (newValue.toString() === "")));
			}
		}, true);

		/**
		 * Toggle display of projects for an account
		 *
		 * @param {Number} index
		 */
		vm.toggleProjectsList = function (index) {
			vm.accounts[index].showProjects = !vm.accounts[index].showProjects;
			vm.accounts[index].showProjectsIcon = vm.accounts[index].showProjects ? "folder_open" : "folder";
		};

		/**
		 * Bring up dialog to add a new project
		 */
		vm.newProject = function (event) {
			vm.showNewProjectErrorMessage = false;
			vm.newProjectFileSelected = false;
			vm.newProjectData = {
				account: vm.account,
				type: vm.projectTypes[0]
			};
			vm.newProjectFileToUpload = null;
			UtilsService.showDialog("projectDialog.html", $scope, event, true);
		};
		
		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

		/**
		 * Save a new project
		 */
		vm.saveNewProject = function (event) {
			var project,
				promise,
				enterKey = 13,
				doSave = false;

			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doSave = true;
				}
			}
			else {
				doSave = true;
			}

			if (doSave) {
				promise = AccountService.newProject(vm.newProjectData);
				promise.then(function (response) {
					console.log(response);
					if (response.data.status === 400) {
						vm.showNewProjectErrorMessage = true;
						vm.newProjectErrorMessage = response.data.message;
					}
					else {
						vm.projectsExist = true;
						// Add project to list
						project = {
							project: response.data.project,
							canUpload: true,
							timestamp: null
						};
						updateAccountProjects (response.data.account, project);
						vm.closeDialog();
					}
				});
			}
		};

		/**
		 * Upload a file
		 *
		 * @param {Object} project
		 */
		vm.uploadFile = function (project) {
			console.log(project);
			existingProjectFileUploader.value = "";
			existingProjectToUpload = project;
			existingProjectFileUploader.click();
		};

		/**
		 * Upload a file
		 */
		vm.uploadFileForNewProject = function () {
			newProjectFileUploader.value = "";
			newProjectFileUploader.click();
		};

		/**
		 * Create a new database
		 */
		vm.newDatabase = function (event) {
			vm.newDatabaseName = "";
			vm.showPaymentWait = false;
			vm.newDatabaseToken = false;
			UtilsService.showDialog("databaseDialog.html", $scope, event, true);
		};

		/**
		 * Save a new database
		 */
		vm.saveNewDatabase = function () {
			var promise = AccountService.newDatabase(vm.account, vm.newDatabaseName);
			promise.then(function (response) {
				console.log(response);
				vm.newDatabaseToken = response.data.token;
				vm.paypalReturnUrl = $location.protocol() + "://" + $location.host() + "/" + vm.account;
			});
		};

		/**
		 * Show waiting before going to payment page
		 * $timeout required otherwise Submit does not work
		 */
		vm.setupPayment = function () {
			$timeout(function () {
				vm.showPaymentWait = true;
			});
		};

		/**
		 * Set up deleting of project
		 *
		 * @param {Object} event
		 * @param {Object} project
		 */
		vm.setupDeleteProject = function (event, project) {
			vm.projectToDelete = project;
			vm.deleteError = null;
			vm.deleteTitle = "Delete Project";
			vm.deleteWarning = "Your data will be lost permanently and will not be recoverable";
			vm.deleteName = vm.projectToDelete.name;
			UtilsService.showDialog("deleteDialog.html", $scope, event, true);
		};

		/**
		 * Delete project
		 */
		vm.delete = function () {
			var i, iLength, j, jLength,
				promise;
			promise = UtilsService.doDelete({}, vm.account + "/" + vm.projectToDelete.name);
			promise.then(function (response) {
				if (response.status === 200) {
					// Remove project from list
					for (i = 0, iLength = vm.accounts.length; i < iLength; i += 1) {
						if (vm.accounts[i].name === response.data.account) {
							for (j = 0, jLength = vm.accounts[i].projects.length; j < jLength; j += 1) {
								if (vm.accounts[i].projects[j].name === response.data.project) {
									vm.accounts[i].projects.splice(j, 1);
									break;
								}
							}
						}
					}
					vm.closeDialog();
				}
				else {
					vm.deleteError = "Error deleting project";
				}
			});
		};

		/**
		 * Remove a collaborator
		 *
		 * @param collaborator
		 */
		vm.removeCollaborator = function (collaborator) {
			delete vm.collaborators[collaborator];
		};

		vm.showPage = function (page, callingPage) {
			vm.onShowPage({page: page, callingPage: callingPage});
		};

		/**
		 * Add a project to an existing or create newly created account
		 *
		 * @param account
		 * @param project
		 */
		function updateAccountProjects (account, project) {
			var i, length,
				accountToUpdate;

			for (i = 0, length = vm.accounts.length; i < length; i += 1) {
				if (vm.accounts[i].name === account) {
					accountToUpdate = vm.accounts[i];
					accountToUpdate.projects.push(project);
					break;
				}
			}
			if (angular.isUndefined(accountToUpdate)) {
				accountToUpdate = {
					name: account,
					projects: [project],
					showProjects: true,
					showProjectsIcon: "folder_open"
				};
				accountToUpdate.canUpload = (account === vm.account);
				vm.accounts.push(accountToUpdate);
			}

			// Save model to project
			if (vm.newProjectFileToUpload !== null) {
				$timeout(function () {
					vm.uploadedFile = {project: project, file: vm.newProjectFileToUpload};
				});
			}
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountRepos", accountRepos);

	function accountRepos() {
		return {
			restrict: 'EA',
			templateUrl: 'accountRepos.html',
			scope: {
				account: "=",
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountReposCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountReposCtrl.$inject = [];

	function AccountReposCtrl() {
		var vm = this;

		vm.showPage = function (page, callingPage) {
			vm.onShowPage({page: page, callingPage: callingPage});
		};

	}
}());

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
		.factory("AccountService", AccountService);

	AccountService.$inject = ["$http", "$q", "serverConfig", "UtilsService"];

	function AccountService($http, $q, serverConfig, UtilsService) {
		var obj = {},
			deferred,
			bid4free;

		/**
		 * Do POST
		 *
		 * @param data
		 * @param urlEnd
		 * @param headers
		 * @returns {*|promise}
		 */
		function doPost(data, urlEnd, headers) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, urlEnd),
				config = {withCredentials: true};

			if (angular.isDefined(headers)) {
				config.headers = headers;
			}

			$http.post(url, data, config)
				.then(
					function (response) {
						deferred.resolve(response);
					},
					function (error) {
						deferred.resolve(error);
					}
				);
			return deferred.promise;
		}

		/**
		 * Handle PUT requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPut(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, urlEnd),
				config = {withCredentials: true};

			$http.put(url, data, config)
				.then(
					function (response) {
						deferred.resolve(response);
					},
					function (error) {
						deferred.resolve(error);
					}
				);
			return deferred.promise;
		}

		/**
		 * Update the user info
		 *
		 * @param {String} username
		 * @param {Object} info
		 * @returns {*}
		 */
		obj.updateInfo = function (username, info) {
			return doPut(info, username);
		};

		/**
		 * Update the user password
		 *
		 * @param {String} username
		 * @param {Object} passwords
		 * @returns {*}
		 */
		obj.updatePassword = function (username, passwords) {
			return doPut(passwords, username);
		};

		obj.getProjectsBid4FreeStatus = function (username) {
			bid4free = $q.defer();
			$http.get(serverConfig.apiUrl(serverConfig.GET_API, username + ".json"), {params: {bids: true}})
				.then(function (response) {
					bid4free.resolve(response);
				});
			return bid4free.promise;
		};

		/**
		 * Create a new project
		 *
		 * @param projectData
		 * @returns {*|promise}
		 */
		obj.newProject = function (projectData) {
			var data = {
				desc: "",
				type: (projectData.type === "Other") ? projectData.otherType : projectData.type
			};
			return doPost(data, projectData.account + "/" + projectData.name);
		};

		/**
		 * Upload file/model to database
		 *
		 * @param projectData
		 * @returns {*|promise}
		 */
		obj.uploadModel = function (projectData) {
			var data = new FormData();
			data.append("file", projectData.uploadFile);
			return doPost(data, projectData.account + "/" + projectData.project + "/upload", {'Content-Type': undefined});
		};

		/**
		 * Get upload status
		 *
		 * @param projectData
		 * @returns {*|promise}
		 */
		obj.uploadStatus = function (projectData) {
			return UtilsService.doGet(projectData.account + "/" + projectData.project + ".json");
		};

		/**
		 * Create a new database
		 *
		 * @param account
		 * @param databaseName
		 * @returns {*|promise}
		 */
		obj.newDatabase = function (account, databaseName) {
			var data = {
				database: databaseName,
				plan: "THE-100-QUID-PLAN"
			};
			return doPost(data, account + "/database");
		};

		/**
		 * Create a new subscription
		 *
		 * @param account
		 * @param data
		 * @returns {*|promise}
		 */
		obj.newSubscription = function (account, data) {
			return doPost(data, account + "/subscriptions");
		};

		/**
		 * Get user info
		 *
		 * @param username
		 * @returns {*|promise}
		 */
		obj.getUserInfo = function (username) {
			return UtilsService.doGet(username + ".json");
		};

		return obj;
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountTeam", accountTeam);

	function accountTeam() {
		return {
			restrict: 'EA',
			templateUrl: 'accountTeam.html',
			scope: {
				account: "=",
				item: "=",
				showPage: "&",
				subscriptions: "="
			},
			controller: AccountTeamCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountTeamCtrl.$inject = ["$scope", "$location", "UtilsService", "StateManager"];

	function AccountTeamCtrl($scope, $location, UtilsService, StateManager) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.memberRole = "collaborator";
		vm.collaborators = [];
		vm.members = [];
		vm.addDisabled = false;
		vm.numSubscriptions = vm.subscriptions.length;
		vm.toShow = (vm.numSubscriptions > 1) ? "1+" : vm.numSubscriptions.toString();

		console.log(vm.item);
		promise = UtilsService.doGet(vm.account + "/" + vm.item.project + "/collaborators");
		promise.then(function (response) {
			console.log(response);
			if (response.status === 200) {
				vm.members = response.data;
				if (angular.isDefined("vm.subscriptions")) {
					setupTeam();
				}
			}
		});

		/*
		 * Watch changes to the new member name
		 */
		$scope.$watch("vm.selectedUser", function (newValue) {
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue !== null));
		});

		/**
		 * Go back to the repos page
		 */
		vm.goBack = function () {
			$location.search("project", null);
			vm.showPage({page: "repos"});
		};

		/**
		 * Add the selected member to the team
		 */
		vm.addMember = function () {
			var i, length,
				data = {
					role: vm.memberRole,
					user: vm.selectedUser.user
				};

			promise = UtilsService.doPost(data, vm.account + "/" + vm.item.project + "/collaborators");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.members.push(data);
					for (i = 0, length = vm.collaborators.length; i < length; i += 1) {
						if (vm.collaborators[i].user === vm.selectedUser.user) {
							vm.collaborators.splice(i, 1);
							break;
						}
					}
					vm.searchText = null;
					vm.addDisabled = (vm.collaborators.length === 0);
					vm.allLicenseAssigneesMembers = (vm.collaborators.length === 0);
				}
			});
		};

		/**
		 * Remove member from team
		 *
		 * @param index
		 */
		vm.removeMember = function (index) {
			promise = UtilsService.doDelete(vm.members[index], vm.account + "/" + vm.item.project + "/collaborators");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					var member = vm.members.splice(index, 1);
					vm.collaborators.push(member[0]);
					vm.addDisabled = false;
					vm.allLicenseAssigneesMembers = false;
				}
			});
		};

		vm.querySearch = function (query) {
			return query ? vm.collaborators.filter(createFilterFor(query)) : vm.collaborators;
		};

		function createFilterFor (query) {
			var lowercaseQuery = angular.lowercase(query);
			return function filterFn(user) {
				return (user.user.indexOf(lowercaseQuery) === 0);
			};
		}

		vm.goToPage = function (page) {
			StateManager.setQuery({page: page});
		};

		vm.closeDialog = function () {
			UtilsService.closeDialog();
		};

		/**
		 * Set up the team page
		 */
		function setupTeam () {
			var i, iLength, j, jLength,
				isMember;

			for (i = 0, iLength = vm.numSubscriptions; i < iLength; i += 1) {
				if (vm.subscriptions[i].hasOwnProperty("assignedUser") && (vm.subscriptions[i].assignedUser !== vm.account)) {
					isMember = false;
					for (j = 0, jLength = vm.members.length; j < jLength; j += 1) {
						if (vm.members[j].user === vm.subscriptions[i].assignedUser) {
							isMember = true;
							break;
						}
					}
					if (!isMember) {
						vm.collaborators.push({user: vm.subscriptions[i].assignedUser});
					}
				}
			}

			vm.numSubscriptions = vm.subscriptions.filter(function (sub) {return sub.inCurrentAgreement;}).length;
			vm.noLicensesAssigned =
				(vm.numSubscriptions > 1) &&
				((vm.collaborators.length + vm.members.length) === 0);

			vm.notAllLicensesAssigned =
				!vm.noLicensesAssigned &&
				(vm.numSubscriptions > 1) &&
				((vm.numSubscriptions - 1) !== (vm.collaborators.length + vm.members.length));

			vm.allLicenseAssigneesMembers = (vm.collaborators.length === 0);
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bid4free", bid4free);

	function bid4free() {
		return {
			restrict: 'E',
			templateUrl: 'bid4free.html',
			scope: {
				account:  "=",
				project:  "=",
				branch:   "=",
				revision: "=",
				state:    "="
			},
			controller: Bid4FreeCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	Bid4FreeCtrl.$inject = ["$scope", "$element", "$timeout", "BidService", "ProjectService"];

	function Bid4FreeCtrl($scope, $element, $timeout, BidService, ProjectService) {
		var vm = this,
			promise, projectUserRolesPromise, projectSummaryPromise,
			currentSelectedPackageIndex;

		// Init view/model vars
		vm.invitedSubContractors = [];
		vm.addSubContractorDisabled = true;
		vm.responded = false;
		vm.packageSelected = false;
		vm.statusInfo = "No package currently selected";
		vm.saveProjectSummaryDisabled = true;
		vm.savePackageDisabled = true;
		vm.showProjectSummaryInput = true;

		BidService.setAccountAndProject(vm.account, vm.project);

		// Setup sub contractors
		vm.subContractors = [
			{user: "Pinakin"},
			{user: "Carmen"},
			{user: "Henry"},
			{user: "B4F_su8C0n_01"},
			{user: "B4F_su8C0n_02"},
			{user: "B4F_su8C0n_03"},
			{user: "B4F_su8C0n_04"},
			{user: "B4F_su8C0n_05"},
			{user: "B4F_su8C0n_06"},
			{user: "B4F_su8C0n_07"},
			{user: "B4F_su8C0n_08"},
			{user: "B4F_su8C0n_09"},
			{user: "B4F_su8C0n_10"},
			{user: "B4F_su8C0n_11"},
			{user: "B4F_su8C0n_12"},
			{user: "B4F_su8C0n_13"},
			{user: "B4F_su8C0n_14"},
			{user: "B4F_su8C0n_15"}
		];
		vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));

		// Setup the project summary defaults
		vm.projectSummary = {
			site: {label: "Site", type: "input", inputType: "text", value: undefined},
			code: {label: "Code", type: "input", inputType: "text", value: undefined},
			client: {label: "Client", type: "input", inputType: "text", value: undefined},
			budget: {label: "Budget", type: "input", inputType: "number", value: undefined},
			contact: {label: "Contact", type: "input", inputType: "text", value: undefined},
			completedBy: {label: "Completed by", type: "date", value: undefined}
		};

		// Setup the package summary defaults
		vm.packageSummary = {
			name: {label: "Name", type: "input", inputType: "text", value: undefined},
			site: {label: "Site", type: "input", inputType: "text", value: undefined},
			code: {label: "Code", type: "input", inputType: "text", value: undefined},
			budget: {label: "Budget", type: "input", inputType: "number", value: undefined},
			area: {label: "Area", type: "input", inputType: "text", value: undefined},
			contact: {label: "Contact", type: "input", inputType: "text", value: undefined},
			completedBy: {label: "Completed by", type: "date", value: undefined}
		};

		// Get the project summary
		projectSummaryPromise = ProjectService.getProjectSummary();
		projectSummaryPromise.then(function (response) {
			console.log(response);
			if ((response.hasOwnProperty("data")) && !((response.data === null) || (response.data === ""))) {
				vm.showProjectSummaryInput = false;
				vm.projectSummary.name = {value: response.data.name};
				vm.projectSummary.site.value = response.data.site;
				vm.projectSummary.code.value = response.data.code;
				vm.projectSummary.client.value = response.data.client;
				vm.projectSummary.budget.value = response.data.budget;
				vm.projectSummary.completedByPretty = prettyDate(new Date(response.data.completedBy));
			}
		});

		// Get type of role
		projectUserRolesPromise = ProjectService.getUserRolesForProject();
		projectUserRolesPromise.then(function (data) {
			var i, length;
			vm.userIsASubContractor = false;
			for (i = 0, length = data.length; i < length; i += 1) {
				if (data[i] === "SubContractor") {
					vm.userIsASubContractor = true;
					break;
				}
			}
			vm.userIsAMainContractor = !vm.userIsASubContractor;
			if (vm.userIsAMainContractor) {
				vm.listTitle = "Packages";
				// Get all packages for project
				promise = BidService.getPackage();
				promise.then(function (response) {
					console.log(response);
					var i, length;
					vm.packages = response.data;
					if (vm.packages.length === 0) {
						vm.summaryInfo = "There are no packages for this project";
						vm.statusInfo = "There are no packages for this project";
					}
					else {
						vm.summaryInfo = "No packages currently selected";
						vm.statusInfo = "No packages currently selected";
						for (i = 0, length = vm.packages.length; i < length; i += 1) {
							vm.packages[i].completedByPretty = prettyDate(new Date(vm.packages[i].completedBy));
							vm.packages[i].selected = false;
						}

						vm.fileUploadAction = "/api/" + vm.account + "/" + vm.project + "/packages/" +  vm.packages[0].name + "/attachments";
					}
				});
			}
		});

		$scope.$watch("vm.subContractorUser", function (newValue) {
			vm.addSubContractorDisabled = !angular.isDefined(newValue);
		});

		$scope.$watch("vm.projectSummary", function (newValue, oldValue) {
			var input;
			if (angular.isDefined(newValue)) {
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.saveProjectSummaryDisabled = false;
					for (input in vm.projectSummary) {
						if (vm.projectSummary.hasOwnProperty(input) && (angular.isUndefined(vm.projectSummary[input].value))) {
							vm.saveProjectSummaryDisabled = true;
							break;
						}
					}
				}
			}
		}, true);

		$scope.$watch("vm.packageSummary", function (newValue, oldValue) {
			var input;
			if (angular.isDefined(newValue)) {
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.savePackageDisabled = false;
					for (input in vm.packageSummary) {
						if (vm.packageSummary.hasOwnProperty(input) && (angular.isUndefined(vm.packageSummary[input].value))) {
							vm.savePackageDisabled = true;
							break;
						}
					}
					vm.showInfo = false;
				}
			}
		}, true);

		/**
		 * Save the project summary
		 */
		vm.saveProjectSummary = function () {
			var data = {}, input;
			for (input in vm.projectSummary) {
				if (vm.projectSummary.hasOwnProperty(input)) {
					data[input] = vm.projectSummary[input].value;
				}
			}
			vm.saveProjectSummaryDisabled = true;
			vm.showProjectSummaryInput = false;
			promise = ProjectService.createProjectSummary(data);
			promise.then(function (response) {
				console.log(response);
				vm.projectSummary.name = {value: response.data.name};
				vm.projectSummary.completedByPretty = prettyDate(new Date(response.data.completedBy));
			});
		};

		/**
		 * Save a package
		 */
		vm.savePackage = function () {
			var data = {}, input;
			// Setup data to be saved
			for (input in vm.packageSummary) {
				if (vm.packageSummary.hasOwnProperty(input)) {
					data[input] = vm.packageSummary[input].value;
				}
			}
			// Save data
			promise = BidService.addPackage(data);
			promise.then(function (response) {
				vm.showInfo = true;
				vm.savePackageDisabled = (response.statusText === "OK");
				if (vm.savePackageDisabled) {
					data.completedByPretty = prettyDate(new Date(data.completedBy));
					vm.packages.push(data);
					vm.info = "Package " + vm.packageSummary.name.value + " saved";
				}
				else {
					vm.info = "Error saving package " + vm.name;
				}
			});
		};

		/**
		 * Invite a sub contractor to bid for a package
		 */
		vm.inviteSubContractor = function () {
			var i, length, index;
			for (i = 0, length = vm.notInvitedSubContractors.length; i < length; i += 1) {
				if (vm.subContractorUser === vm.notInvitedSubContractors[i].user) {
					index = i;
					break;
				}
			}
			var data = {
				user: vm.notInvitedSubContractors[index].user
			};
			promise = BidService.inviteSubContractor(vm.selectedPackage.name, data);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.subContractorsInvited = true;
					//vm.notInvitedSubContractors[index].accepted = null;
					vm.invitedSubContractors.push(vm.notInvitedSubContractors[index]);
					vm.invitedSubContractors[vm.invitedSubContractors.length - 1].invitedIcon = "fa fa-circle-thin";
					vm.notInvitedSubContractors.splice(index, 1);
					vm.subContractor = undefined;
				}
			});
		};

		/**
		 * Award a package to a sub contractor
		 * @param index
		 */
		vm.awardToSubContractor = function (index) {
			var i, length;
			promise = BidService.awardBid(vm.selectedPackage.name, vm.invitedSubContractors[index]._id);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.awarded = true;
					vm.inviteTitle = "Status";
					vm.invitedSubContractors[index].accepted = true;
					for (i = 0, length = vm.invitedSubContractors.length; i < length; i += 1) {
						if (vm.invitedSubContractors[i].accepted) {
							vm.invitedSubContractors[i].invitedIcon = (i === index) ? getStatusIcon("won") : getStatusIcon("lost");
							//vm.invitedSubContractors[i].accepted = false;
						}
					}
				}
			});
		};

		/**
		 * Show package summary and status
		 * @param index
		 */
		vm.showPackage = function (index) {
			var i, j, lengthI, lengthJ;
			vm.showInput = false;
			vm.showSummary = true;
			vm.showFileUploadedInfo = false;
			vm.packageNotAwarded = true;
			vm.subContractorUser = undefined;
			vm.showInfo = false;
			vm.selectedPackage = vm.packages[index];
			console.log(vm.selectedPackage);
			$timeout(function () {
				setupFileUploader(); // timeout needed for uploader button to be available in in DOM
			}, 500);
			promise = BidService.getBids(vm.selectedPackage.name);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.packageSelected = true;

					if (angular.isDefined(currentSelectedPackageIndex)) {
						vm.packages[currentSelectedPackageIndex].selected = false;
					}
					vm.packages[index].selected = true;
					currentSelectedPackageIndex = index;

					vm.awarded = false;
					vm.inviteTitle = "Invite";
					vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));
					vm.invitedSubContractors = response.data;
					console.log(vm.invitedSubContractors);
					vm.subContractorsInvited = (vm.invitedSubContractors.length > 0);
					for (i = 0, lengthI = vm.invitedSubContractors.length; i < lengthI; i += 1) {

						// Show the correct status for an invited sub contractor
						if (vm.invitedSubContractors[i].accepted === null) {
							vm.invitedSubContractors[i].invitedIcon = getStatusIcon("invited");
						}
						else {
							if (vm.invitedSubContractors[i].awarded === null) {
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("accepted");
							}
							else if (vm.invitedSubContractors[i].awarded) {
								vm.awarded = true;
								vm.inviteTitle = "Status";
								vm.packageNotAwarded = false;
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("won");
							}
							else {
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("lost");
							}
						}

						// Set up the not invited sub contractors list
						for (j = 0, lengthJ = vm.notInvitedSubContractors.length; j < lengthJ; j += 1) {
							if (vm.notInvitedSubContractors[j].user === vm.invitedSubContractors[i].user) {
								vm.notInvitedSubContractors.splice(j, 1);
								break;
							}
						}
					}
				}
			});
		};

		/**
		 * Show inputs to add a package
		 */
		vm.setupAddPackage = function () {
			vm.packageSelected = true; // Cheat :-)
			vm.showInput = true;
			vm.showSummary = false;
		};

		/**
		 * Select a package
		 * @param packageName
		 */
		vm.selectPackage = function (packageName) {
			vm.selectedPackageName = packageName;
		};

		/**
		 * Package invite has been accepted by a sub contractor
		 */
		vm.inviteAccepted = function () {
			vm.packageInviteAccepted = true;
		};

		/**
		 * Convert a date to a readable version
		 * @param date
		 * @returns {string}
		 */
		function prettyDate (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		}

		function getStatusIcon (status) {
			var icon = "";
			if (status === "won") {
				icon = "fa fa-check md-accent";
			}
			else if (status === "lost") {
				icon = "fa fa-remove md-warn";
			}
			else if (status === "accepted") {
				icon = "fa fa-check";
			}
			else if (status === "declined") {
				icon = "fa fa-remove";
			}
			else if (status === "invited") {
				icon = "fa fa-circle-thin";
			}
			return icon;
		}

		function setupFileUploader () {
			var fileUploader = $element[0].querySelector("#fileUploader");
			if (fileUploader !== null) {
				fileUploader.addEventListener(
					"change",
					function () {
						var files = this.files;
						promise = BidService.saveFiles(vm.packages[0].name, files);
						promise.then(function (response) {
							console.log(response);
							vm.showFileUploadedInfo = true;
							vm.uploadedFilename = response.data[0].filename;
						});
					},
					false);
			}
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidDocs", bidDocs);

	function bidDocs () {
		return {
			restrict: 'E',
			templateUrl: 'bidDocs.html',
			scope: {
				packageName: "=",
				inviteAccepted: "="
			},
			controller: BidDocsCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidDocsCtrl.$inject = ["$scope", "$mdDialog", "$sce", "BidService"];

	function BidDocsCtrl ($scope, $mdDialog, $sce, BidService) {
		var vm = this,
			promise;

		vm.predefinedDocs = [
			{title: "Bill of Quantities", id: ""},
			{title: "Scope of Works", id: ""}
		];

		vm.boq = [
			{type: "Single-Flush: 800 x 2100", code: 3, quantity: 7},
			{type: "Pocket_Slider_Door_5851: 2.027 x 0.945", code: 51, quantity: 3},
			{type: "Entrance door: Entrance door", code: 60, quantity: 2},
			{type: "M_Double-Flush: 1730 x 2134mm", code: 65, quantity: 1},
			{type: "Curtain Wall Dbl Glass: Curtain Wall Dbl Glass", code: 68, quantity: 3}
		];

		$scope.$watch("vm.packageName", function (newValue) {
			if (angular.isDefined(newValue)) {
				promise = BidService.getUserBid(newValue);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.bidInviteAccepted = response.data.accepted;
					}
					if (vm.bidInviteAccepted) {
						showDocs();
					}
				});
			}
		});

		$scope.$watch("vm.inviteAccepted", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.bidInviteAccepted = true;
				showDocs();
			}
		});

		function showDocs () {
			var i, j, length, jLength, exists;
			vm.docs = [];
			if (BidService.currentPackage.hasOwnProperty("attachments")) {
				for (i = 0, length = BidService.currentPackage.attachments.length; i < length; i += 1) {
					// Ignore duplicates
					exists = false;
					for (j = 0, jLength = vm.docs.length; j < jLength; j += 1) {
						if (vm.docs[j].id === BidService.currentPackage.attachments[i]) {
							exists = true;
							break;
						}
					}
					if (!exists) {
						vm.docs.push({
							title: "Drawing " + BidService.currentPackage.attachments[i],
							id: BidService.currentPackage.attachments[i]
						});
					}
				}
			}
		}

		vm.sow =
			"<p><span class='bidDocsUnderline'>Scope of the Sub‐Contract Works</span></p>" +
			"<p>The following defines the ‘Fixed Price Lump Sum’ Scope of the Sub‐Contract Works for the completion of the Partitions,  Ceilings  and  Passive  Fire  Protection  Works  and  is  further  defined  in  the  Documents,  Drawings, Specifications, Protocols and Policies incorporated or referred to within this Tender Enquiry.</p>" +
			"<p>The Health and Safety of all Visitors, Staff, Site Personnel and the General Public is paramount at all times and compliance  with  the  Balfour  Beatty  Construction  Health,  Safety,  Quality  and  Environmental  Conditions  is mandatory. A copy of this document is contained in Numbered Document 7.</p>" +
			"<p>The Sub‐Contractor <span class='bidDocsBold'>shall not</span> sub‐let any part of the sub‐contract works without the prior knowledge and writtenacceptance of BB.</p>" +
			"<p>The Sub‐Contractor shall manufacture, supply, deliver, install, execute, test and commission and complete the Partitions, Ceilings and Passive Fire Protection Works including all necessary labour, plant,  tools, equipment, materials, supervision, off‐loading, distribution around site, removal of waste and protection of the works at the project  known  as  the  Baltic Triangle,  Liverpool,  all    as  described  herein  within  this  Scope  of Works  and  the Documents,  Drawings,  Specifications,  Protocols  and  Polices  incorporated  or  referred  to  within  this  Tender Enquiry.</p>" +
			"<p>The tender Sum is to be fixed until October 2016.</p>" +
			"<p>The Sub‐Contractor has made allowances for all works necessary to carry out and complete the Sub‐Contract Works all as denoted on the Drawings, Specifications and Documents incorporated within this Tender Enquiry. All items which are normally deemed extra over in accordance with the SMM7 or/and NRM2 measurement rules shall also be deemed included within the Sub‐Contract Sum.</p>" +
			"<p>The Sub‐Contractor is deemed to have acquainted themselves with the constraints of the Site and acknowledges and accepts that it is required to co‐ordinate and integrate the Works with the designs, works and programmes of the following associated works: ‐ Precast Concrete Works, Car Park Works, Roofing, Structural Steel, incoming services, M&E installations, Kitchen and Wardrobes installation, and Finishes Generally.</p>" +
			"<p>Notwithstanding  the  need  for  the  Sub‐Contract Works  to  be  properly  co‐ordinated  and  integrated  with  the design, works and programmes of others, the Sub‐Contractor acknowledges and accepts that it will not have exclusive access to and / or possession of the site or any part or parts thereof and that it will be required to work alongside  the  Employer,  Contractor,  the  Competent  Authority  and  other  trades,  Sub‐Contractors  and  /  or suppliers.</p>";

		vm.sowProcessed = vm.sow.split("</p>");

		vm.showPredefinedDocDialog = function (index) {
			vm.docIndex = index;
			vm.showPredefinedDoc = true;
			vm.showDoc = false;
			showDialog();
		};

		vm.showDocDialog = function (index) {
			vm.docIndex = index;
			vm.showPredefinedDoc = false;
			vm.showDoc = true;
			promise = BidService.getFile(BidService.currentPackage.name, vm.docs[index].id);
			promise.then(function (response) {
				var blob = new Blob([response.data], { type: 'application/pdf' });
				vm.pdfUrl = URL.createObjectURL(blob);
				showDialog();
			});
		};

		function showDialog (event) {
			$mdDialog.show({
				controller: bidDocsDialogController,
				templateUrl: 'bidDocsDialog.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		}

		vm.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};

		vm.closeDialog = function () {
			$mdDialog.cancel();

			// Free the resources associated with the created url
			if (vm.showDoc) {
				var worker = new Worker(vm.pdfUrl);
				URL.revokeObjectURL(vm.pdfUrl);
			}
		};

		function removeDialog () {
			vm.closeDialog();
		}

		function bidDocsDialogController ($scope) {
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidImage", bidImage);

	function bidImage() {
		return {
			restrict: 'E',
			templateUrl: 'bidImage.html',
			scope: {
				account: "=",
				project: "="
			},
			controller: BidImageCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidImageCtrl.$inject = ["$window"];

	function BidImageCtrl($window) {
		var vm = this;

		vm.thumbnailPath = "/public/images/bid4free_bid_thumbnail.png";

		vm.showViewer = function () {
			$window.open(vm.account + "/" + vm.project, '_blank');
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidList", bidList);

	function bidList() {
		return {
			restrict: 'E',
			templateUrl: 'bidList.html',
			scope: {},
			controller: BidListCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidListCtrl.$inject = [];

	function BidListCtrl() {
		var vm = this;
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidProjectSummary", bidProjectSummary);

	function bidProjectSummary() {
		return {
			restrict: 'E',
			templateUrl: 'bidProjectSummary.html',
			scope: {},
			controller: BidProjectSummaryCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidProjectSummaryCtrl.$inject = ["$location", "Auth", "ProjectService", "BidService"];

	function BidProjectSummaryCtrl($location, Auth, ProjectService, BidService) {
		var vm = this,
			promise;

		vm.Auth = Auth;

		// Get the project summary
		promise = ProjectService.getProjectSummary();
		promise.then(function (data) {
			vm.projectSummary = data.data;
			vm.projectSummary.completedByPretty = BidService.prettyDate(new Date(vm.projectSummary.completedBy));
		});

		vm.home = function () {
			$location.path("/" + Auth.username, "_self").search({});
		};
	}
}());

/**
 *  Copyright (C) 2015 3D Repo Ltd
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
		.factory("BidService", BidService);

	BidService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

	function BidService($http, $q, StateManager, serverConfig) {
		var obj = {},
			state = StateManager.state,
			currentPackage,
			boq, boqTotal,
			self = this;

		/**
		 * Handle POST requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPost(data, urlEnd, headers) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd),
				config = {withCredentials: true};

			if (angular.isDefined(headers)) {
				config.headers = headers;
			}

			$http.post(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle GET requests
		 * @param urlEnd
		 * @returns {*}
		 */
		function doGet(urlEnd, param) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, self.account + "/" + self.project + "/" + urlEnd);

			var params = {};
			if (angular.isDefined(param)) {
				params.responseType = "arraybuffer";
			}
			$http.get(url, params).then(
				function (response) {
					deferred.resolve(response);
				},
				function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle PUT requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPut(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd),
				config = {
					withCredentials: true
				};
			$http.put(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		obj.setAccountAndProject = function (account, project) {
			self.account = account;
			self.project = project;
		};

		obj.addPackage = function (data) {
			return doPost(data, "packages.json");
		};

		obj.inviteSubContractor = function (packageName, data) {
			return doPost(data, "packages/" + packageName + "/bids.json");
		};

		/**
		 * Accept or decline a package bid invitation
		 * @param packageName
		 * @returns {*}
		 */
		obj.acceptInvite = function (packageName, accept) {
			return doPost({accept: accept}, "packages/" + packageName + "/bids/mine/invitation");
		};

		obj.awardBid = function (packageName, bidId) {
			return doPost({}, "packages/" + packageName + "/bids/" + bidId + "/award");
		};

		/**
		 * Get all or named package(s)
		 * @param name
		 * @returns {*}
		 */
		obj.getPackage = function (name) {
			var part = angular.isDefined(name) ? ("/" + name) : "";
			return doGet("packages" + part + ".json");
		};

		/**
		 * Get all or named package(s)
		 * @param account
		 * @param project
		 * @param name
		 * @returns {*}
		 */
		obj.getProjectPackage = function (account, project, name) {
			state.account = account;
			state.project = project;
			var part = angular.isDefined(name) ? ("/" + name) : "";
			return doGet("packages" + part + ".json");
		};

		/**
		 * Get all bids for a package
		 * @param packageName
		 * @returns {*}
		 */
		obj.getBids = function (packageName) {
			return doGet("packages/" + packageName + "/bids.json");
		};

		/**
		 * Get user bids for a package
		 * @param packageName
		 * @returns {*}
		 */
		obj.getUserBid = function (packageName) {
			return doGet("packages/" + packageName + "/bids/mine.json");
		};

		/**
		 * Get user bids for a package
		 * @param account
		 * @param project
		 * @param packageName
		 * @returns {*}
		 */
		obj.getProjectUserBids = function (account, project, packageName) {
			state.account = account;
			state.project = project;
			return doGet("packages/" + packageName + "/bids/mine.json");
		};

		/**
		 * Get terms and conditions
		 * @param packageName
		 */
		obj.getTermsAndConditions = function (packageName) {
			return doGet("packages/" + packageName + "/bids/mine/termsAndConds.json");
		};

		/**
		 * Update terms and conditions
		 * @param packageName
		 * @param data
		 * @returns {*}
		 */
		obj.updateTermsAndConditions = function (packageName, data) {
			return doPut(data, "packages/" + packageName + "/bids/mine/termsAndConds.json");
		};

		/**
		 * Save files to DB
		 * @param packageName
		 * @param files
		 * @returns {*}
		 */
		obj.saveFiles = function (packageName, files) {
			var i, length, data = new FormData();
			for (i = 0, length = files.length; i < length; i += 1) {
				data.append("attachment", files[i]);
			}
			return doPost(data, "/packages/" + packageName + "/attachments", {'Content-Type': undefined});
		};

		obj.getFile = function (packageName, fileId) {
			return doGet("/packages/" + packageName + "/attachments/" + fileId, {});
		};

		/**
		 * Convert a date to a readable version
		 * @param date
		 * @returns {string}
		 */
		obj.prettyDate = function (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		};

		Object.defineProperty(
			obj,
			"currentPackage",
			{
				get: function () {return currentPackage;},
				set: function (aPackage) {currentPackage = aPackage;}
			}
		);

		Object.defineProperty(
			obj,
			"boq",
			{
				get: function () {return boq;},
				set: function (data) {boq = data;}
			}
		);

		Object.defineProperty(
			obj,
			"boqTotal",
			{
				get: function () {return boqTotal;},
				set: function (total) {boqTotal = total;}
			}
		);

		return obj;
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidStatus", bidStatus);

	function bidStatus() {
		return {
			restrict: 'E',
			templateUrl: 'bidStatus.html',
			scope: {
				packageName: "=",
				onInviteAccepted: "&"
			},
			controller: BidStatusCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidStatusCtrl.$inject = ["$scope", "$timeout", "BidService"];

	function BidStatusCtrl($scope, $timeout, BidService) {
		var vm = this,
			promise;

		$scope.$watch("vm.packageName", function (newValue) {
			if (angular.isDefined(newValue)) {
				promise = BidService.getUserBid(newValue);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						if (response.data.accepted === null) {
							vm.invited = true;
						}
						else if (response.data.accepted) {
							vm.accepted = true;
							if (angular.isDefined(BidService.boqTotal)) {
								vm.boqTotal = BidService.boqTotal;
							}
						}
						else {
							vm.declined = true;
						}
					}
				});
			}
		});

		vm.accept = function (accept) {
			promise = BidService.acceptInvite(vm.packageName, accept);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.invited = false;
					if (accept) {
						vm.onInviteAccepted();
						vm.accepted = true;
					}
					else {
						vm.declined = true;
					}
				}
			});
		};

		vm.submit = function () {
			$timeout(function () {
				vm.showSubmitResult = true;
			}, 1000);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidSummary", bidSummary);

	function bidSummary() {
		return {
			restrict: 'E',
			templateUrl: 'bidSummary.html',
			scope: {
				onSelectPackage: "&"
			},
			controller: BidSummaryCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidSummaryCtrl.$inject = ["$scope", "BidService"];

	function BidSummaryCtrl($scope, BidService) {
		var vm = this,
			promise;

		vm.showSelectedPackage = false;

		// Get all the packages
		promise = BidService.getPackage();
		promise.then(function (response) {
			var i, length;
			vm.packages = [];
			if ((response.statusText === "OK") && (response.data.length > 0)) {
				vm.packages = response.data;
				vm.packages[0].completedByPretty = prettyDate(new Date(vm.packages[0].completedBy));

				// Select the current package
				if (angular.isDefined(BidService.currentPackage)) {
					for (i = 0, length = vm.packages.length; i < length; i += 1) {
						if (vm.packages[i].name === BidService.currentPackage.name) {
							vm.selectedPackageIndex = i;
							break;
						}
					}
				}
			}
		});

		$scope.$watch("vm.selectedPackageIndex", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showSelectedPackage = true;
				BidService.currentPackage = vm.packages[newValue];
				vm.packageSorted = [
					{label: "Name", value: vm.packages[newValue].name},
					{label: "Site", value: vm.packages[newValue].site},
					{label: "Budget", value: vm.packages[newValue].budget},
					{label: "Code", value: vm.packages[newValue].code},
					{label: "Area", value: vm.packages[newValue].area},
					{label: "Contact", value: vm.packages[newValue].contact},
					{label: "Completed by", value: BidService.prettyDate(new Date(vm.packages[newValue].completedBy))}
				];
				vm.onSelectPackage({packageName: vm.packages[newValue].name});
			}
		});

		function prettyDate (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidWorkspace", bidWorkspace);

	function bidWorkspace() {
		return {
			restrict: 'E',
			templateUrl: 'bidWorkspace.html',
			scope: {
				packageName: "=",
				inviteAccepted: "=",
				account: "=",
				project: "="
			},
			controller: BidWorkspaceCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidWorkspaceCtrl.$inject = ["$scope", "$location", "BidService"];

	function BidWorkspaceCtrl($scope, $location, BidService) {
		var vm = this,
			promise;

		vm.items = [
			"Terms and Conditions",
			"Bill of Quantities",
			"Scope of Works",
			"Other"
		];

		$scope.$watch("vm.inviteAccepted", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showItems = true;
			}
		});

		$scope.$watch("vm.packageName", function (newValue) {
			if (angular.isDefined(newValue)) {
				promise = BidService.getUserBid(newValue);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.showItems = response.data.accepted;
					}
				});
			}
		});

		vm.showInput = function (index) {
			$location
				.path(vm.account + "/" + vm.project + "/bid4free/bid4freeWorkspace", "_self")
				.search({
					package: BidService.currentPackage.name,
					tab: index
				});
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bid4freeWorkspace", bid4freeWorkspace);

	function bid4freeWorkspace() {
		return {
			restrict: 'E',
			templateUrl: 'bid4freeWorkspace.html',
			scope: {
				packageName: "=",
				account: "=",
				project: "=",
				branch: "=",
				revision: "="
			},
			controller: Bid4freeWorkspaceCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	Bid4freeWorkspaceCtrl.$inject = ["$scope", "$location", "BidService", "EventService"];

	function Bid4freeWorkspaceCtrl($scope, $location, BidService, EventService) {
		var vm = this,
			promise, tcPromise,
			locationSearch = $location.search();

		vm.sections = [];
		vm.sectionType = "keyvalue";
		vm.showSaveConfirmation = false;
		if (angular.isDefined(BidService.boq)) {
			vm.boq = BidService.boq;
			setBoqTotal();
		}
		else {
			vm.boq = [
				{type: "Single-Flush: 800 x 2100", code: 3, quantity: 7},
				{type: "Pocket_Slider_Door_5851: 2.027 x 0.945", code: 51, quantity: 3},
				{type: "Entrance door: Entrance door", code: 60, quantity: 2},
				{type: "M_Double-Flush: 1730 x 2134mm", code: 65, quantity: 1},
				{type: "Curtain Wall Dbl Glass: Curtain Wall Dbl Glass", code: 68, quantity: 3}
			];
			BidService.boq = vm.boq;
		}

		// Create a default viewer
		EventService.send(EventService.EVENT.CREATE_VIEWER, {
			name: "default",
			account:  vm.account,
			project:  vm.project,
			branch:   vm.branch,
			revision: vm.revision
		});

		// Get the user's bid information for the package
		promise = BidService.getUserBid(vm.packageName);
		promise.then(function (response) {
			vm.title = vm.project + " / " + response.data.packageName;
		});

		// Get Terms and Conditions
		tcPromise = BidService.getTermsAndConditions(vm.packageName);
		tcPromise.then(function (response) {
			var i, length;
			vm.sections = response.data;
			for (i = 0, length = vm.sections.length; i < length; i += 1) {
				vm.sections[i].showInput = false;
				if (vm.sections[i].items.length > 0) {
					vm.sections[i].type = vm.sections[i].items[0].type;
				}
				else {
					vm.sections[i].type = "keyvalue";
				}
			}
		});

		// Select the correct tab
		vm.selectedTab = $location.search().tab;

		// Todo - find a way to change the URL without loading the page
		$scope.$watch("vm.selectedTab", function (newValue) {
			// Need to find
			/*
			locationSearch.tab = newValue;
			$location.search(locationSearch);
			*/
		});

		$scope.$watch("vm.sectionType", function (newValue) {
			vm.showTableTitlesInput = (newValue.toString() === "table");
		});

		/**
		 * Add a section
		 */
		vm.addSection = function () {
			var section = {
				block: vm.sectionTitle,
				items: [],
				type: vm.sectionType
			};

			// Set the table titles
			if (vm.sectionType === "table") {
				section.items = [
					{
						type: "table",
						keys: [
							{name: vm.tableColumn1Title, datatype: "string", control: "text"},
							{name: vm.tableColumn2Title, datatype: "string", control: "text"},
							{name: vm.tableColumn3Title, datatype: "string", control: "text"}
						],
						values: []
					}
				];
			}

			vm.sections.push(section);
			vm.showSaveConfirmation = false;

			// Init section inputs
			vm.sectionTitle = undefined;
			vm.tableColumn1Title = undefined;
			vm.tableColumn2Title = undefined;
			vm.tableColumn3Title = undefined;
		};

		/**
		 * Toggle new item input (clear the fields if toggled off)
		 * @param index
		 */
		vm.toggleItemInput = function (index) {
			vm.sections[index].showInput = !vm.sections[index].showInput;
			if (!vm.sections[index].showInput) {
				vm.sections[index].newItemName = undefined;
				vm.sections[index].newItemDescription = undefined;
			}
			vm.showSaveConfirmation = false;
		};

		/**
		 * Add an item to a section
		 * @param sectionIndex
		 */
		vm.addItem = function (sectionIndex) {
			if (vm.sections[sectionIndex].type === "keyvalue") {
				if (angular.isDefined(vm.sections[sectionIndex].newItemName)) {
					vm.sections[sectionIndex].items.push(
						{
							type: "keyvalue",
							keys: [
								{
									name: vm.sections[sectionIndex].newItemName,
									datatype: "string",
									control: "text"
								}
							],
							values: []
						}
					);

					// Init inputs
					vm.sections[sectionIndex].newItemName = undefined;
					//vm.sections[sectionIndex].newItemDescription = undefined;
				}
			}
			else {
				if (angular.isDefined(vm.sections[sectionIndex].column1) &&
					angular.isDefined(vm.sections[sectionIndex].column2) &&
					angular.isDefined(vm.sections[sectionIndex].column3)) {
					vm.sections[sectionIndex].items[0].values.push([
						vm.sections[sectionIndex].column1,
						vm.sections[sectionIndex].column2,
						vm.sections[sectionIndex].column3
					]);

					// Init inputs
					vm.sections[sectionIndex].column1 = undefined;
					vm.sections[sectionIndex].column2 = undefined;
					vm.sections[sectionIndex].column3 = undefined;
				}
			}
			console.log(vm.sections);
			vm.sections[sectionIndex].showInput = false;
		};

		/**
		 * Save to database
		 */
		vm.save = function () {
			promise = BidService.updateTermsAndConditions(vm.packageName, vm.sections);
			promise.then(function (response) {
				console.log(response);
				vm.showSaveConfirmation = true;
			});
		};

		/**
		 * Handle rate change of BoQ item
		 * @param index
		 */
		vm.boqRateChange = function (index) {
			vm.boq[index].price = parseFloat(parseFloat(vm.boq[index].quantity) * parseFloat(vm.boq[index].rate)).toFixed(2);
			setBoqTotal();
		};

		function setBoqTotal () {
			var i, length, total = 0;
			for (i = 0, length = vm.boq.length; i < length; i += 1) {
				if (angular.isDefined(vm.boq[i].price)) {
					total += parseFloat(vm.boq[i].price);
				}
			}
			vm.boqTotal = total.toFixed(2);
			BidService.boqTotal = vm.boqTotal;
		}

		/**
		 * Go to the main Bid4Free page
		 */
		vm.goToMainPage = function () {
			$location
				.path(vm.account + "/" + vm.project + "/bid4free", "_self")
				.search({package: vm.packageName});
		};

		vm.init = function () {
			vm.data = [
				{
					block: "Instruction to SC",
					items: [
						{
							type: "keyvalue",
							keys: [
								{
									name: "Test",
									datatype: "string",
									control: "text"
								}
							],
							values: [
								"Test description"
							]
						}
					]
				}
			];
			promise = BidService.updateTermsAndConditions(vm.packageName, vm.data);
			promise.then(function (response) {
				console.log(response);
			});
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("billing", billing);

	function billing() {
		return {
			restrict: "E",
			scope: {
				query: "="
			},
			templateUrl: "billing.html",
			controller: BillingCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BillingCtrl.$inject = ["EventService", "UtilsService", "serverConfig"];

	function BillingCtrl (EventService, UtilsService, serverConfig) {
		var vm = this,
			billingsPromise,
			i, length,
			euCountryCodes = [
				"BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT", "CY", "LV", "LT",
				"LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI", "SK", "FI", "SE"
			];

		/*
		 * Init
		 */
		vm.showBilling = false;
		vm.B2B_EU = false;

		if (vm.query.hasOwnProperty("user") && vm.query.hasOwnProperty("item")) {
			billingsPromise = UtilsService.doGet(vm.query.user + "/billings");
			billingsPromise.then(function (response) {
				console.log("**billings**", response);
				if ((response.data.length > 0) &&
					(parseInt(vm.query.item) >= 0) &&
					(parseInt(vm.query.item) < response.data.length)) {
					vm.showBilling = true;
					vm.billing = response.data[parseInt(vm.query.item)];
					vm.billing.netAmount = parseFloat(vm.billing.amount - vm.billing.taxAmount).toFixed(2);
					vm.billing.taxPercentage = Math.round(vm.billing.taxAmount / vm.billing.netAmount * 100);

					// Check if B2B EU
					vm.B2B_EU = (euCountryCodes.indexOf(vm.billing.info.countryCode) !== -1) && (vm.billing.info.hasOwnProperty("vat"));

					// Type
					vm.type = vm.billing.pending ? "Order confirmation" : "Invoice";

					// Get country from country code
					if (serverConfig.hasOwnProperty("countries")) {
						for (i = 0, length = serverConfig.countries.length; i < length; i += 1) {
							if (serverConfig.countries[i].code === vm.billing.info.countryCode) {
								vm.billing.info.country = serverConfig.countries[i].name;
								break;
							}
						}
					}
				}
			});
		}

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};

		vm.print = function () {
			window.print();
		};
	}
}());

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
			controllerAs: 'vm',
			bindToController: true
		};
	}

	BottomButtonsCtrl.$inject = ["EventService"];

	function BottomButtonsCtrl (EventService) {
		var vm = this,
			measureMode = false;


		vm.showButtons = true;
		vm.fullScreen = false;
		vm.showViewingOptionButtons = false;

		vm.toggleElements = function () {
			EventService.send(EventService.EVENT.TOGGLE_ELEMENTS);
			vm.showButtons = !vm.showButtons;
		};

		var setViewingOption = function (index) {
			if (angular.isDefined(index)) {
				// Set the viewing mode

				EventService.send(EventService.EVENT.VIEWER.SET_NAV_MODE,
					{mode: vm.viewingOptions[index].mode});

				// Set up the new current selected option button
				vm.selectedViewingOptionIndex = index;
				vm.rightButtons[0] = vm.viewingOptions[index];

				vm.showViewingOptionButtons = false;
			}
			else {
				vm.showViewingOptionButtons = !vm.showViewingOptionButtons;
			}
		};

		var home = function () {
			EventService.send(EventService.EVENT.VIEWER.GO_HOME);
		};

		var toggleHelp = function () {
			EventService.send(EventService.EVENT.TOGGLE_HELP);
		};

		var enterFullScreen = function () {
			EventService.send(EventService.VIEWER.SWITCH_FULLSCREEN);
			vm.fullScreen = true;
		};

		var exitFullScreen = function() {
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && vm.fullScreen) {
				vm.fullScreen = false;
			}
		};
		document.addEventListener('webkitfullscreenchange', exitFullScreen, false);
		document.addEventListener('mozfullscreenchange', exitFullScreen, false);
		document.addEventListener('fullscreenchange', exitFullScreen, false);
		document.addEventListener('MSFullscreenChange', exitFullScreen, false);

		var enterOculusDisplay = function () {
			EventService.send(EventService.EVENT.VIEWER.ENTER_VR);
		};

		/**
		 * Enter pinakin mode
		 */
		var setMeasureMode = function () {
			measureMode = !measureMode;
			EventService.send(EventService.EVENT.MEASURE_MODE, measureMode);
		};

		vm.viewingOptions = [
			{
				mode: VIEWER_NAV_MODES.WALK,
				label: "Walk",
				icon: "fa fa-child",
				click: setViewingOption,
				iconClass: "bottomButtonIconWalk"
			},
			{
				mode: VIEWER_NAV_MODES.HELICOPTER,
				label: "Helicopter",
				icon: "icon icon_helicopter",
				click: setViewingOption,
				iconClass: "bottomButtonIconHelicopter"
			},
			{
				mode: VIEWER_NAV_MODES.TURNTABLE,
				label: "Turntable",
				icon: "icon icon_turntable",
				click: setViewingOption
			}
		];
		vm.selectedViewingOptionIndex = 2;

		vm.leftButtons = [];
		vm.leftButtons.push({
			label: "Home",
			icon: "fa fa-home",
			click: home
		});

		vm.rightButtons = [];
		vm.rightButtons.push(vm.viewingOptions[vm.selectedViewingOptionIndex]);
		/*
		vm.rightButtons.push({
			label: "Help",
			icon: "fa fa-question",
			click: toggleHelp
		});
		vm.rightButtons.push({
			label: "VR",
			icon: "icon icon_cardboard",
			click: enterOculusDisplay,
			iconClass: "bottomButtonIconCardboard"
		});
		 */
	}
}());

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

	function compassLoaded(event)
	{
		// Zoom in on compass
		document.getElementById("Axes").runtime.showAll();
	}

	function compassMove(event)
	{
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = -event.orientation[1];

		// Fix transformation from viewpoint basis
		viewer.transformEvent(event, event.target, false);

		// Set rotation of the overlying group
		document.getElementById("AxesTrans").setAttribute("rotation", event.orientation.toString());
	}

	angular.module("3drepo")
		.directive("compass", compass);

	function compass () {
		return {
			restrict: "E",
			templateUrl: "compass.html",
			scope: {},
			controller: CompassCtrl,
			controllerAs: "cc",
			bindToController: true,
		};
	}

	CompassCtrl.$inject = ["EventService"];

	function CompassCtrl (EventService)
	{
		EventService.send(EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK, { callback: compassMove });
	}
}());


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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("building", building);

	function building() {
		return {
			restrict: "EA",
			templateUrl: "building.html",
			scope: {
				show: "=",
				visible: "=",
				onContentHeightRequest: "&"
			},
			controller: BuildingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	BuildingCtrl.$inject = ["$scope", "$timeout", "EventService", "$http"];

	function BuildingCtrl($scope, $timeout, EventService, $http) {
		var vm = this;
		vm.meta = {};
		/*
		 * Init
		 */

		/*
		 * Watch for show/hide of card
		 */
		$scope.$watch("vm.show", function (newValue) {

		});

		/*
		 * Toggle the clipping plane
		 */
		$scope.$watch("vm.visible", function (newValue) {

		});




		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.OS_BUILDING_CLICK) {

				vm.testdata = event.value.id;
				var url = '/api/os/building-meta/' + event.value.id;
				$http.get(url)
					.then(
						function(data) {
							vm.meta = data.data;
						},
						function (err) {
							console.trace(err);
						}
					);
				}
		});
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("clip", clip);

	function clip() {
		return {
			restrict: "EA",
			templateUrl: "clip.html",
			scope: {
				show: "=",
				visible: "=",
				onContentHeightRequest: "&"
			},
			controller: ClipCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	ClipCtrl.$inject = ["$scope", "$timeout", "EventService"];

	function ClipCtrl($scope, $timeout, EventService) {
		var vm = this;

		/*
		 * Init
		 */
		vm.sliderMin = 0;
		vm.sliderMax = 100;
		vm.sliderStep = 0.1;
		vm.sliderPosition = vm.sliderMin;
		vm.axes = ["X", "Y", "Z"];
		vm.selectedAxis = vm.axes[0];
		vm.visible = false;
		vm.onContentHeightRequest({height: 130});

		function initClippingPlane () {
			$timeout(function () {
				var initPosition = (vm.sliderMax - vm.sliderPosition) / vm.sliderMax;
				
				EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				EventService.send(EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE, 
				{
					axis: translateAxis(vm.selectedAxis),
					percentage: initPosition
				});
			});
		}

		function moveClippingPlane(sliderPosition) {
			EventService.send(EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE,
			{
				percentage: (vm.sliderMax - sliderPosition) / vm.sliderMax
			});
		}

		/*
		 * Watch for show/hide of card
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.visible = newValue;
			}
		});

		/**
		 * Swap Y and Z axes
		 *
		 * @param {String} axis
		 * @returns {String}
		 */
		function translateAxis(axis)
		{
			if (axis === "Y")
			{
				return "Z";
			} else if (axis === "Z") {
				return "Y";
			} else {
				return "X";
			}
		}

		/*
		 * Toggle the clipping plane
		 */
		$scope.$watch("vm.visible", function (newValue) {
			if (angular.isDefined(newValue))
			{
				vm.visible = newValue;

				if (newValue)
				{
					initClippingPlane();
				} else {
					EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				}
			}
		});

		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.selectedAxis", function (newValue) {
			if (angular.isDefined(newValue) && vm.show) {
				initClippingPlane();
				vm.sliderPosition = vm.sliderMin;
			}
		});

		/*
		 * Watch the slider position
		 */
		$scope.$watch("vm.sliderPosition", function (newValue) {
			if (angular.isDefined(newValue) && vm.show) {
				moveClippingPlane(newValue);
			}
		});

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.SET_CLIPPING_PLANES) {
				if (event.value.hasOwnProperty("clippingPlanes") && event.value.clippingPlanes.length) {
					vm.selectedAxis   = translateAxis(event.value.clippingPlanes[0].axis);
					vm.sliderPosition = (1.0 - event.value.clippingPlanes[0].percentage) * 100.0;
					initClippingPlane();
					vm.visible = true;
				} else {
					vm.visible = false;
					vm.sliderPosition = 0.0;
				}
			}
		});
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("contact", contact);

	function contact() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "contact.html",
			controller: ContactCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	ContactCtrl.$inject = ["$scope", "UtilsService"];

	function ContactCtrl ($scope, UtilsService) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.contact = {information: "", name: "", email: ""};
		vm.sent = false;
		vm.sending = false;

		/*
		 * Watch to enable send button
		 */
		$scope.$watch("vm.contact", function () {
			vm.sendButtonDisabled = (
				(vm.contact.information === "") ||
				(vm.contact.name === "") ||
				(vm.contact.email === "") ||
				(angular.isUndefined(vm.contact.email))
			);
		}, true);

		vm.send = function () {
			vm.sending = true;
			promise = UtilsService.doPost(vm.contact, "contact");
			promise.then(function (response) {
				console.log(response);
				vm.sending = false;
				if (response.status === 200) {
					vm.sent = true;
				}
			});
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("cookies", cookies);

	function cookies() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "cookies.html",
			controller: CookiesCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	CookiesCtrl.$inject = ["EventService"];

	function CookiesCtrl (EventService) {
		var vm = this;

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("cookiesText", cookiesText);

	function cookiesText() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "cookiesText.html",
			controller: CookiesTextCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	CookiesTextCtrl.$inject = [];

	function CookiesTextCtrl () {
		var vm = this;
	}
}());

/**
 *	Copyright (C) 2015 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("docs", docs);

	function docs() {
		return {
			restrict: 'EA',
			templateUrl: 'docs.html',
			scope: {
				show: "=",
				onContentHeightRequest: "&"
			},
			controller: DocsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	DocsCtrl.$inject = ["$scope", "$mdDialog", "$timeout", "$filter", "EventService", "DocsService", "UtilsService"];

	function DocsCtrl($scope, $mdDialog, $timeout, $filter, EventService, DocsService, UtilsService) {
		var vm = this,
			promise,
			docTypeHeight = 50,
			allDocTypesHeight,
			currentOpenDocTypes = [];

		/*
		 * Init
		 */
		vm.showDocsGetProgress = false;
		vm.onContentHeightRequest({height: 80});

		/*
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function (event) {
			var item, i, length;
			if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
				// Get any documents associated with an object
				var object = event.value;
				promise = DocsService.getDocs(object.account, object.project, object.id);
				promise.then(function (data) {
					if (Object.keys(data).length > 0) {
						vm.show = true;
						$timeout(function () {
							vm.docs = data;
							allDocTypesHeight = 0;
							// Open all doc types initially
							for (var docType in vm.docs) {
								if (vm.docs.hasOwnProperty(docType)) {
									vm.docs[docType].show = true;
									allDocTypesHeight += docTypeHeight;

									// Pretty format Meta Data dates, e.g. 1900-12-31T23:59:59
									if (docType === "Meta Data") {
										for (i = 0, length = vm.docs["Meta Data"].data.length; i < length; i += 1) {
											for (item in vm.docs["Meta Data"].data[i].metadata) {
												if (vm.docs["Meta Data"].data[i].metadata.hasOwnProperty(item)) {
													if (Date.parse(vm.docs["Meta Data"].data[i].metadata[item]) &&
														(typeof vm.docs["Meta Data"].data[i].metadata[item] === "string") &&
														(vm.docs["Meta Data"].data[i].metadata[item].indexOf("T") !== -1)) {
														vm.docs["Meta Data"].data[i].metadata[item] =
															$filter("prettyDate")(new Date(vm.docs["Meta Data"].data[i].metadata[item]), {showSeconds: true});
													}
												}
											}
										}
									}
								}
							}
							setContentHeight();
						});
					}
					else {
						vm.show = false;
					}
				});
			}
			else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
				vm.show = false;
			}
		});

		/**
		 * Show a document in a dialog
		 *
		 * @param {Object} doc
		 */
		vm.showDoc = function (doc) {
			$scope.pdfUrl = doc.url;
			vm.progressInfo = "Loading document " + doc.name;
			vm.showDocLoadProgress = true;
			$mdDialog.show({
				controller: docsDialogController,
				templateUrl: "docsDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}

		function docsDialogController() {
		}

		/**
		 * Open and close doc types
		 *
		 * @param docType
		 */
		vm.toggleItem = function (docType) {
			vm.docs[docType].show = !vm.docs[docType].show;
			setContentHeight();
		};

		/**
		 * Set the height of the content
		 */
		function setContentHeight () {
			var contentHeight = 0,
				itemsHeight,
				metaDataItemHeight = 50; // It could be higher for items with long text but ignore that

			angular.forEach(vm.docs, function(value, key) {
				contentHeight += docTypeHeight;
				if (value.show) {
					if (key === "Meta Data") {
						itemsHeight = Object.keys(value.data[0].metadata).length * metaDataItemHeight;
					}
					contentHeight += itemsHeight;
				}
			});

			vm.onContentHeightRequest({height: contentHeight});
		}
	}
}());

/**
 *  Copyright (C) 2015 3D Repo Ltd
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
		.factory("DocsService", DocsService);

	DocsService.$inject = ["$http", "$q", "serverConfig"];

	function DocsService($http, $q, serverConfig) {
		var getDocs = function (account, project, objectId) {
			var i,
				length,
				data = {},
				deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/meta/" + objectId + ".json");

			$http.get(url)
				.then(
					function(json) {
						var dataType;
						// Set up the url for each PDF doc
						for (i = 0, length = json.data.meta.length; i < length; i += 1) {
							// Get data type
							dataType = json.data.meta[i].hasOwnProperty("mime") ? json.data.meta[i].mime : "Meta Data";
							if (dataType === "application/pdf") {
								dataType = "PDF";
							}

							// Add data to type group
							if (!data.hasOwnProperty(dataType)) {
								data[dataType] = {data: []};
							}
							data[dataType].data.push(json.data.meta[i]);

							// Setup PDF url
							json.data.meta[i].url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + '/' + json.data.meta[i]._id + ".pdf");
						}
						deferred.resolve(data);
					},
					function () {
						deferred.resolve(data);
					}
				);

			return deferred.promise;
		};

		return {
			getDocs: getDocs
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("groups", groups);

	function groups() {
		return {
			restrict: 'EA',
			templateUrl: 'groups.html',
			scope: {
				account: "=",
				project: "=",
				show: "=",
				showAdd: "=",
				showEdit: "=",
				canAdd: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "=",
				selectedMenuOption: "="

			},
			controller: GroupsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	GroupsCtrl.$inject = ["$scope", "$timeout", "EventService", "GroupsService"];

	function GroupsCtrl ($scope, $timeout, EventService, GroupsService) {
		var vm = this,
			eventWatch,
			promise,
			colourChangeTimeout = null,
			hideAll = false;
		
		/*
		 * Init
		 */
		vm.saveDisabled = true;
		vm.canAdd = true;
		vm.selectedGroup = null;
		vm.editingGroup = false;
		vm.editingText = "Start";
		vm.colourPickerColour = [255, 255, 255];
		vm.toShow = "showLoading";
		vm.loadingInfo = "Loading groups";
		setContentHeight();
		GroupsService.init(vm.account, vm.project);

		promise = GroupsService.getGroups();
		promise.then(function (data) {
			vm.groups = data.data;
			if (vm.groups.length > 0) {
				vm.toShow = "showGroups";
			}
			else {
				vm.toShow = "showInfo";
			}
			setContentHeight();
		});

		/*
		 * Handle showing of adding a new issue
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.toShow = "showAdd";
				vm.onShowItem();
				vm.canAdd = false;
				vm.selectedGroup = null;
				vm.name = "";
				setContentHeight();
			}
		});

		/*
		 * Handle parent notice to hide a selected group or add group
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				if (vm.groups.length > 0) {
					vm.toShow = "showGroups";
				}
				else {
					vm.toShow = "showInfo";
				}
				vm.showAdd = false; // So that showing add works
				vm.canAdd = true;
				vm.showEdit = false; // So that closing edit works
				setContentHeight();
				setSelectedGroupHighlightStatus(false);
				vm.selectedGroup = null;
				doHideAll(hideAll);
			}
		});

		/*
		 * Save button disabled when no name is input
		 */
		$scope.$watch("vm.name", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveDisabled = (angular.isUndefined(newValue) || (newValue.toString() === ""));
			}
		});

		/*
		 * Toggle editing of group
		 */
		$scope.$watch("vm.editingGroup", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.editingText = newValue ? "Stop" : "Start";
				if (newValue) {
					setupEventWatch();
				} else if (angular.isDefined(eventWatch)) {
					eventWatch(); // Cancel event watching
				}
			}
		});

		/*
		 * Only watch for events when shown
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (!newValue) {
					vm.editingGroup = false; // To stop any event watching
					hideAll = false;
					vm.toShow ="showGroups";
					doHideAll(hideAll);
				}
			}
		});

		/*
		 * Watch showing of selected group's objects
		 */
		$scope.$watch("vm.showObjects", function (newValue) {
			if (angular.isDefined(newValue) && (vm.selectedGroup !== null)) {
				setGroupsVisibleStatus([vm.selectedGroup], newValue);
			}
		});

		/*
		 * Selecting a menu option
		 */
		$scope.$watch("vm.selectedMenuOption", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue.value === "hideAll") {
					hideAll = !hideAll;
					doHideAll(hideAll);
				}
			}
		});

		/**
		 * Show the group details and highlight the group objects
		 *
		 * @param index
		 */
		vm.showGroup = function (index) {
			vm.selectedGroup = vm.groups[index];
			vm.toShow = "showGroup";
			vm.onShowItem();
			vm.canAdd = false;
			vm.editingGroup = false;
			vm.showObjects = true;
			vm.showEdit = true;
			setContentHeight();
			doHideAll(hideAll);
			setSelectedGroupHighlightStatus(true);
		};

		/**
		 * Callback to get the colour picker colour
		 *
		 * @param colour
		 */
		vm.colourPickerChange = function (colour) {
			vm.colourPickerColour = colour;
			if (vm.selectedGroup !== null) {
				if (colourChangeTimeout !== null) {
					$timeout.cancel(colourChangeTimeout);
				}
				colourChangeTimeout = $timeout(function() {
					vm.selectedGroup.color = colour;
					promise = GroupsService.updateGroup(vm.selectedGroup);
					promise.then(function (data) {
						console.log(data);
						setSelectedGroupHighlightStatus(true);
					});
				}, 500);
			}
		};

		/**
		 * Convert colour array to rgb string
		 *
		 * @param {Array} colour
		 * @returns {string}
		 */
		vm.colourToString = function (colour) {
			return "rgb(" + colour.join(",") + ")";
		};

		/**
		 * Delete the selected group
		 */
		vm.deleteGroup = function () {
			var i, length;

			for (i = 0, length = vm.groups.length; i < length; i += 1) {
				if (vm.groups[i].name === vm.selectedGroup.name) {
					promise = GroupsService.deleteGroup(vm.selectedGroup._id);
					promise.then(function (data) {
						if (data.statusText === "OK") {
							vm.groups.splice(i, 1);
							vm.selectedGroup = null;
							if (vm.groups.length > 0) {
								vm.toShow = "showGroups";
							} else {
								vm.toShow = "showInfo";
							}
							vm.canAdd = true;
							setContentHeight();
						}
					});
					break;
				}
			}
		};

		/**
		 * Save a group
		 */
		vm.saveGroup = function () {
			var i, length, nameExists = false;

			// Cannot have groups with duplicate names
			for (i = 0, length = vm.groups.length; i < length; i += 1) {
				if (vm.groups[i].name === vm.name) {
					nameExists = true;
					break;
				}
			}

			if (!nameExists) {
				promise = GroupsService.createGroup(vm.name, vm.colourPickerColour);
				promise.then(function (data) {
					if (data.statusText === "OK") {
						vm.groups.push(data.data);
						vm.selectedGroup = null;
						vm.toShow = "showGroups";
						vm.canAdd = true;
						vm.showAdd = false;
						setContentHeight();
					}
				});
			}
		};

		/**
		 * Set the height of the content
		 */
		function setContentHeight () {
			var contentHeight = 0,
				groupHeaderHeight = 56, // It could be higher for items with long text but ignore that
				baseGroupHeight = 210,
				addHeight = 250,
				infoHeight = 80,
				loadingHeight = 80;

			switch (vm.toShow) {
				case "showGroups":
					angular.forEach(vm.groups, function() {
						contentHeight += groupHeaderHeight;
					});
					break;

				case "showGroup":
					contentHeight = baseGroupHeight;
					break;

				case "showAdd":
					contentHeight = addHeight;
					break;

				case "showInfo":
					contentHeight = infoHeight;
					break;

				case "showLoading":
					contentHeight = loadingHeight;
					break;
			}

			vm.onContentHeightRequest({height: contentHeight});
		}

		/**
		 * Set up event watching
		 */
		function setupEventWatch () {
			var index;

			eventWatch = $scope.$watch(EventService.currentEvent, function (event) {
				if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
					index = vm.selectedGroup.parents.indexOf(event.value.id);
					if (index !== -1) {
						vm.selectedGroup.parents.splice(index, 1);
					} else {
						vm.selectedGroup.parents.push(event.value.id);
					}

					promise = GroupsService.updateGroup(vm.selectedGroup);
					promise.then(function (data) {
						setSelectedGroupHighlightStatus(true);
					});
				}
			});
		}

		/**
		 * Set the highlight status of the selected group in its colour
		 *
		 * @param {Boolean} highlight
		 */
		function setSelectedGroupHighlightStatus (highlight) {
			var data;
			if ((vm.selectedGroup !== null) && (vm.selectedGroup.parents.length > 0)) {
				data = {
					source: "tree",
					account: vm.account,
					project: vm.project
				};
				if (highlight) {
					data.ids = vm.selectedGroup.parents;
					data.colour = vm.selectedGroup.color.map(function(item) {return (item / 255.0);}).join(" ");
				}
				else {
					data.ids = [];
				}
				EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, data);
			}
		}

		/**
		 * Set the visible status of the selected group in its colour
		 *
		 * @param {Array} groups
		 * @param {Boolean} visible
		 */
		function setGroupsVisibleStatus (groups, visible) {
			var i, length,
				data,
				ids = [];

			// Get all the object IDs
			for (i = 0, length = groups.length; i < length; i += 1) {
				if (groups[i].parents.length > 0) {
					ids = ids.concat(groups[i].parents);
				}
			}

			if (ids.length > 0) {
				data = {
					source: "tree",
					account: vm.account,
					project: vm.project
				};
				if (visible) {
					data.visible_ids = ids;
				} else {
					data.invisible_ids = ids;
				}
				EventService.send(EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY, data);
			}
		}

		/**
		 * "Hide All" when showing groups should hide all the groups
		 * "Hide All" when showing a group should hide all groups except the selected group
		 *
		 * @param {Boolean} hideAllStatus
		 */
		function doHideAll (hideAllStatus) {
			var i, length, groups = [];
			if (vm.toShow === "showGroups") {
				setGroupsVisibleStatus(vm.groups, !hideAllStatus);
			}
			else if (vm.toShow === "showGroup") {
				for (i = 0, length = vm.groups.length; i < length; i += 1) {
					if (vm.groups[i]._id !== vm.selectedGroup._id) {
						groups.push(vm.groups[i]);
						setGroupsVisibleStatus(groups, !hideAll);
					}
					setGroupsVisibleStatus([vm.selectedGroup], true);
				}
			}
		}
	}
}());

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
		.factory("GroupsService", GroupsService);

	GroupsService.$inject = ["$http", "$q", "serverConfig"];

	function GroupsService($http, $q, serverConfig) {
		var self = this,
			obj = {};

		/**
		 * Handle POST requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPost(data, urlEnd, headers) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd),
				config = {withCredentials: true};

			if (angular.isDefined(headers)) {
				config.headers = headers;
			}

			$http.post(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle GET requests
		 * @param urlEnd
		 * @returns {*}
		 */
		function doGet(urlEnd, param) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, self.account + "/" + self.project + "/" + urlEnd);

			var params = {};
			if (angular.isDefined(param)) {
				params.responseType = "arraybuffer";
			}
			$http.get(url, params).then(
				function (response) {
					deferred.resolve(response);
				},
				function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle PUT requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPut(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd),
				config = {
					withCredentials: true
				};
			$http.put(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle DELETE requests
		 *
		 * @param urlEnd
		 * @returns {Object}
		 */
		function doDelete(urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd);
			$http.delete(url)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Setup the account and project info
		 *
		 * @param {String} account
		 * @param {String} project
		 */
		obj.init = function (account, project) {
			self.account = account;
			self.project = project;
		};

		/**
		 * Get all the groups
		 *
		 * @return {Object}
		 */
		obj.getGroups = function () {
			return doGet("groups");
		};

		/**
		 * Create a group
		 *
		 * @param name
		 * @param color
		 * @returns {Object}
		 */
		obj.createGroup = function (name, color) {
			return doPost({name: name, color: color, parents: []}, "groups");
		};

		/**
		 * Delete a group
		 *
		 * @param {String} groupId
		 * @returns {Object}
		 */
		obj.deleteGroup = function (groupId) {
			return doDelete("groups/" + groupId);
		};

		/**
		 * Update the group
		 *
		 * @param {Object} group
		 * @returns {Object}
		 */
		obj.updateGroup = function (group) {
			return doPut(group, "groups/" + group._id);
		};

		return obj;
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
	.service("Auth", ["$injector", "$q", "$http", "serverConfig", "EventService", function($injector, $q, $http, serverConfig, EventService) {

		var self = this;

		self.authPromise = $q.defer();
		self.loggedIn = null;
		self.username = null;

		this.loginSuccess = function(data)
		{
			self.loggedIn = true;
			self.username = data.username;
			self.userRoles = data.roles;

			EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: data.username, initialiser: data.initialiser });

			self.authPromise.resolve(self.loggedIn);
		};

		this.loginFailure = function(reason)
		{
			self.loggedIn = false;
			self.username = null;
			self.userRoles = null;

			var initialiser = reason.initialiser;
			reason.initialiser = undefined;

			EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: null, initialiser: initialiser, error: reason });

			self.authPromise.resolve(self.loggedIn);
		};

		this.logoutSuccess = function()
		{
			self.loggedIn  = false;
			self.username  = null;
			self.userRoles = null;

			EventService.send(EventService.EVENT.USER_LOGGED_OUT);

			self.authPromise.resolve(self.loggedIn);
		};

		this.logoutFailure = function(reason)
		{
			self.loggedIn  = false;
			self.username  = null;
			self.userRoles = null;
			localStorage.setItem("tdrLoggedIn", "false");

			EventService.send(EventService.EVENT.USER_LOGGED_OUT, { error: reason });

			self.authPromise.resolve(self.loggedIn);
		};

		this.init = function() {
			var initPromise = $q.defer();

			// If we are not logged in, check
			// with the API server whether we
			// are or not
			if(self.loggedIn === null)
			{
				// Initialize
				$http.get(serverConfig.apiUrl(serverConfig.GET_API, "login")).success(function _initSuccess(data)
					{
						data.initialiser = true;
						self.loginSuccess(data);
					}).error(function _initFailure(reason)
					{
						reason.initialiser = true;
						self.loginFailure(reason);
					});

				self.authPromise.promise.then(function() {
					initPromise.resolve(self.loggedIn);
				});
			} else {
				if (self.loggedIn)
				{
					EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: self.username });
				} else {
					EventService.send(EventService.EVENT.USER_LOGGED_OUT);
				}

				initPromise.resolve(self.loggedIn);
			}

			return initPromise.promise;
		};

		this.loadProjectRoles = function(account, project)
		{
			var rolesPromise = $q.defer();

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/roles.json"))
			.success(function(data) {
				self.projectRoles = data;
				rolesPromise.resolve();
			}).error(function() {
				self.projectRoles = null;
				rolesPromise.resolve();
			});

			return rolesPromise.promise;
		};

		this.getUsername = function() { return this.username; };

		this.login = function(username, password) {
			self.authPromise = $q.defer();

			var postData = {username: username, password: password};

			$http.post(serverConfig.apiUrl(serverConfig.POST_API, "login"), postData).success(self.loginSuccess).error(self.loginFailure);

			return self.authPromise.promise;
		};

		this.logout = function() {
			self.authPromise = $q.defer();

			$http.post(serverConfig.apiUrl(serverConfig.POST_API, "logout")).success(self.logoutSuccess).error(self.logoutFailure);

			return self.authPromise.promise;
		};
	}]);
})();

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

(function() {
	"use strict";

	angular.module("3drepo")
	.config([
	"$stateProvider", "$urlRouterProvider", "$locationProvider", "structure",
	function($stateProvider, $urlRouterProvider, $locationProvider, structure) {

		$locationProvider.html5Mode(true);

		$stateProvider.state("home", {
			name: "home",
			url: "/",
			resolve: {
				init: function(Auth, StateManager, $q)
				{
					StateManager.state.authInitialized = false;

					var finishedAuth = $q.defer();

					StateManager.state.changing = true;

					Auth.init().then(function (loggedIn) {
						StateManager.state.authInitialized = true;
						StateManager.state.loggedIn = loggedIn;

						finishedAuth.resolve();
					});

					return finishedAuth.promise;
				}
			}
		});

		var stateStack       = [structure];
		var stateNameStack   = ["home"];

		//console.log("stateStack", stateStack);
		while (stateStack.length > 0)
		{
			var stackLength      = stateStack.length;
			var parentState      = stateStack[0];
			var parentStateName  = stateNameStack[0];

			// First loop through the list of functions as these are
			// more specific than the
			if (parentState.functions)
			{
				for (var i = 0; i < parentState.functions.length; i++)
				{
					var childFunction	  = parentState.functions[i];
					var childFunctionName = parentStateName + "." + childFunction;

					(function(childFunction) {
						$stateProvider.state(childFunctionName, {
							name: childFunction,
							url: childFunction,
							resolve: {
								init: function (StateManager, $location, $stateParams) {
									$stateParams[childFunction] = true;

									StateManager.setState($stateParams);
								}
							}
						});
					})(childFunction);
				}
			}

			if (parentState.children)
			{
				for (var i = 0; i < parentState.children.length; i++)
				{
					var childState     = parentState.children[i];
					var childStateName = parentStateName + "." + childState.plugin;

					stateNameStack.push(childStateName);
					stateStack.push(parentState.children[i]);

					(function(childState){
						$stateProvider.state(childStateName, {
							name: parentState.children[i].plugin,
							url: childState.url || (parentStateName !== "home" ? "/" : "") + ":" + childState.plugin,
							reloadOnSearch : false,
							resolve: {
								init: function(StateManager, $location, $stateParams)
								{
									StateManager.setState($stateParams);
								}
							}
						});
					})(childState);
				}
			}

			stateStack.splice(0,1);
			stateNameStack.splice(0,1);
		}

		$urlRouterProvider.otherwise("");
	}])
	.run(["$location", "$rootScope", "$state", "uiState", "StateManager", "Auth", "$timeout", function($location, $rootScope, $state, uiState, StateManager, Auth, $timeout) {
		$rootScope.$on("$stateChangeStart",function(event, toState, toParams, fromState, fromParams){
			console.log("stateChangeStart: " + JSON.stringify(fromState) + " --> " + JSON.stringify(toState));

			StateManager.state.changing = true;

			for(var i = 0; i < StateManager.functions.length; i++)
			{
				StateManager.setStateVar(StateManager.functions[i], false);
			}

			StateManager.clearQuery();

			var stateChangeObject = {
				toState    : toState,
				toParams   : toParams,
				fromState  : fromState,
				fromParams : fromParams
			};

			StateManager.startStateChange(stateChangeObject);
		});

		$rootScope.$on("$stateChangeSuccess",function(event, toState, toParams, fromState, fromParams){
			console.log("stateChangeSuccess: " + JSON.stringify(fromState) + " --> " + JSON.stringify(toState));

			var stateChangeObject = {
				toState    : toState,
				toParams   : toParams,
				fromState  : fromState,
				fromParams : fromParams
			};

			if(typeof ga !== "undefined" && ga !== null){
				ga("send", "pageview", $location.path());
			}

			StateManager.handleStateChange(stateChangeObject);
		});

		$rootScope.$on('$locationChangeStart', function(event, next, current) {
			console.log("locationChange");
		});

		$rootScope.$on('$locationChangeSuccess', function() {
			console.log("locationChangeSucc");

			var queryParams = $location.search();

			if (Object.keys(queryParams).length === 0)
			{
				StateManager.clearQuery();
			} else {
				StateManager.setQuery(queryParams);
			}
		});
	}])
	.service("StateManager", ["$q", "$state", "$rootScope", "$timeout", "structure", "EventService", "$window", "Auth", function($q, $state, $rootScope, $timeout, structure, EventService, $window, Auth) {
		var self = this;

		$window.StateManager = this;

		// Stores the state, required as ui-router does not allow inherited
		// stateParams, and we need to dynamically generate state diagram.
		// One day this might change.
		// https://github.com/angular-ui/ui-router/wiki/URL-Routing
		this.state = {
			changing: true
		};

		this.changedState = {};

		this.structure  = structure;

		this.destroy = function()  {
			delete this.state;
			this.state = {};

			delete this.ui;
			this.ui = {};

			delete this.Data;
			this.Data = {};
		};

		// Has a state variable changed. Is this necessary ?
		this.changed     = {};

		this.state       = { loggedIn : false };
		this.query       = {};
		this.functions   = [];

		var stateStack       = [structure];

		// Populate list of functions
		while (stateStack.length > 0)
		{
			var stackLength      = stateStack.length;
			var parentState      = stateStack[stackLength - 1];

			var i = 0;
			var functionName;

			if (parentState.functions)
			{
				for(i=0; i<parentState.functions.length; i++)
				{
					functionName = parentState.functions[i];

					if (this.functions.indexOf(functionName) > -1) {
						console.error("Duplicate function name when loading in StateManager : " + functionName);
					} else {
						this.functions.push(functionName);
					}
				}
			}

			if (parentState.children)
			{
				for (var i = 0; i < parentState.children.length; i++)
				{
					stateStack.push(parentState.children[i]);
				}
			}

			stateStack.splice(0,1);
		}

		this.clearChanged = function()
		{
			for(var i in self.changed) {
				if (self.changed.hasOwnProperty(i)) {
					self.changed[i] = false;
				}
			}
		};

		self.clearChanged();

		this.stateChangeQueue = [];

		var compareStateChangeObjects = function(stateChangeA, stateChangeB)
		{
			return	(stateChangeA.toState	 === stateChangeB.toState) &&
					(stateChangeA.toParams	 === stateChangeB.toParams) &&
					(stateChangeA.fromState  === stateChangeB.fromState) &&
					(stateChangeA.fromParams === stateChangeB.fromParams);
		};

		this.startStateChange = function(stateChangeObject) {
			self.stateChangeQueue.push(stateChangeObject);
		};

		this.handleStateChange = function(stateChangeObject) {
			var param;
			var fromParams = stateChangeObject.fromParams;
			var toParams   = stateChangeObject.toParams;

			// Switch off all parameters that we came from
			// but are not the same as where we are going to
			for (param in fromParams)
			{
				if (fromParams.hasOwnProperty(param))
				{
					if (!toParams.hasOwnProperty(param))
					{
						self.setStateVar(param, null);
					}
				}
			}

			for (param in toParams)
			{
				if (toParams.hasOwnProperty(param))
				{
					if (fromParams.hasOwnProperty(param))
					{
						if (fromParams[param] !== toParams[param])
						{
							self.setStateVar(param, toParams[param]);
						}
					} else {
						self.setStateVar(param, toParams[param]);
					}
				}
			}

			// Loop through structure. If a parent is null, then we must clear
			// it's children
			var stateStack       = [structure];
			var stateNameStack   = ["home"];
			var clearBelow       = false;

			while (stateStack.length > 0)
			{
				var stackLength      = stateStack.length;
				var parentState      = stateStack[stackLength - 1];
				var parentStateName  = stateNameStack[stackLength - 1];

				if (parentStateName !== "home" && !self.state[parentStateName])
				{
					clearBelow = true;
				}

				if (parentState.children)
				{
					for (var i = 0; i < parentState.children.length; i++)
					{
						var childStateName = parentState.children[i].plugin;

						stateNameStack.push(childStateName);
						stateStack.push(parentState.children[i]);

						if (clearBelow)
						{
							self.setStateVar(childStateName, null);
						}
					}
				}

				stateStack.splice(0,1);
				stateNameStack.splice(0,1);
			}

			if (compareStateChangeObjects(stateChangeObject, self.stateChangeQueue[0]))
			{
				self.stateChangeQueue.pop();

				var functionList = self.functionsUsed();

				// If we are not trying to access a function
				// and yet there is no account set. Then
				// we need to go back to the account page if possible.
				if ((functionList.length === 0) && self.state.loggedIn && !self.state.account)
				{
					self.setStateVar("account", Auth.username);
					self.updateState();
				} else {
					self.updateState(true);
				}
			} else {
				self.stateChangeQueue.pop();
				self.handleStateChange(self.stateChangeQueue[self.stateChangeQueue.length - 1]);
			}
		};

		this.stateVars   = {};

		this.clearState = function(state) {
			for (var state in self.state)
			{
				if ((["changing", "authInitialized", "loggedIn"].indexOf(state) === -1) && self.state.hasOwnProperty(state))
				{
					self.setStateVar(state, null);
				}
			}
		};

		this.clearQuery = function(state) {
			for(var param in self.query)
			{
				delete self.query[param];
			}
		};

		this.functionsUsed = function ()
		{
			var functionList = [];

			// First loop through the list of functions
			// belonging to parent structure.
			// Only deals with functions on home directory
			if (self.structure.functions)
			{
				for(i = 0; i < self.structure.functions.length; i++)
				{
					functionName = self.structure.functions[i];

					if (self.state[functionName])
					{
						functionList.push(functionName);
						break;
					}
				}
			}

			return functionList;
		}

		this.genStateName = function ()
		{
			var currentChildren = self.structure.children;
			var childidx        = 0;
			var stateName       = "home."; // Assume that the base state is there.
			var i               = 0;
			var functionList    = self.functionsUsed();
			var usesFunction    = (functionList.length > 0);

			if (usesFunction)
			{
				stateName += functionList.join(".") + ".";
			} else
			{
				while(childidx < currentChildren.length)
				{
					var child  = currentChildren[childidx];
					var plugin = child.plugin;

					if (self.state.hasOwnProperty(plugin) && self.state[plugin])
					{
						stateName += plugin + ".";

						if (child.children) {
							currentChildren = child.children;
						} else {
							currentChildren = [];
						}

						childidx = -1;
					}

					childidx += 1;
				}
			}

			return stateName.substring(0, stateName.length - 1);
		};

		this.setStateVar = function(varName, value)
		{
			if (value === null)
			{
				delete self.state[varName];
			} else {
				if (self.state[varName] !== value) {
					self.state.changing = true;
					self.changedState[varName] = value;
				}
			}

			self.state[varName] = value;
		};

		this.setState = function(stateParams) {
			// Copy all state parameters and extra parameters
			// to the state
			for (var state in stateParams) {
				if (stateParams.hasOwnProperty(state)) {
					self.setStateVar(state, stateParams[state]);
				}
			}
		};

		this.setQuery = function(queryParams)
		{
			for(var param in queryParams)
			{
				if (queryParams.hasOwnProperty(param))
				{
					self.query[param] = queryParams[param];
				}
			}
		};

		this.updateState = function(dontUpdateLocation)
		{
			var newStateName = self.genStateName();

			if (Object.keys(self.changedState).length)
			{
				EventService.send(EventService.EVENT.STATE_CHANGED, self.changedState);
				self.changedState = {};
			}

			var updateLocation = !dontUpdateLocation ? true: false; // In case of null
			$state.transitionTo(newStateName, self.state, { location: updateLocation });

			$timeout(function () {
				self.state.changing = false;
			});
		};

		$rootScope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.SET_STATE) {
					for (var key in event.value)
					{
						if (key !== "updateLocation" && event.value.hasOwnProperty(key))
						{
							self.setStateVar(key, event.value[key]);
						}
					}

					self.updateState();
				} else if (event.type === EventService.EVENT.CLEAR_STATE) {
					self.clearState();
				}
			}
		});
	}]);

})();

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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("autoLogin", autoLogin);

	function autoLogin() {
		return {
			restrict: "E",
			scope: { 
				account: "@",
				password: "@"
			},
			controller: AutoLoginCtrl,
			controllerAs: "al",
			bindToController: true			
		};	
	}
	
	AutoLoginCtrl.$inject = ["Auth"];
	
	function AutoLoginCtrl(Auth) {
		var al = this;
		
		al.getTemplateUrl = function() {
			return al.templateUrl;
		};
		
		Auth.login(al.account, al.password);
	}

}());

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

// Exposed methods through the X3DOM nodes.



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
        .directive("home", home)
        .config(function($injector)
		{
			if ($injector.has("$mdThemingProvider"))
			{
				var mdThemingProvider = $injector.get("$mdThemingProvider");

				mdThemingProvider.definePalette('three_d_repo_primary', {
					'50': '004594',
					'100': '004594',
					'200': '004594',
					'300': '004594',
					'400': '004594',
					'500': '004594',
					'600': '004594',
					'700': '004594',
					'800': '004594',
					'900': '004594',
					'A100': '004594',
					'A200': '004594',
					'A400': '004594',
					'A700': '004594',
					'contrastDefaultColor': 'light',
					'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
					'contrastLightColors': undefined
				});

				mdThemingProvider.theme("default")
                .primaryPalette("three_d_repo_primary", {
					"default": "500",
					"hue-1": "400",
					"hue-2": "200",
					"hue-3": "50"
				})
                .accentPalette("green", {
                    "default": "600"
                })
                .warnPalette("red");
			}
        });

    function home() {
        return {
            restrict: "E",
            templateUrl: "home.html",
			scope: {
				account: "@",
				password: "@",
				loggedInUrl: "@",
				loggedOutUrl: "@"
			},
            controller: HomeCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    HomeCtrl.$inject = ["$scope", "$element", "$timeout", "$compile", "$mdDialog", "$window", "Auth", "StateManager", "EventService", "UtilsService"];

    function HomeCtrl($scope, $element, $timeout, $compile, $mdDialog, $window, Auth, StateManager, EventService, UtilsService) {
        var vm = this,
			homeLoggedOut,
			notLoggedInElement,
			element,
			state, func, i;

		/*
		 * Init
		 */
		vm.state = StateManager.state;
		vm.query = StateManager.query;
		vm.functions = StateManager.functions;
		vm.pointerEvents = "auto";

		vm.goToUserPage = false;

		vm.legalDisplays = [
			{title: "Terms & Conditions", value: "terms"},
			{title: "Privacy", value: "privacy"},
			{title: "Cookies", value: "cookies"},
			{title: "Pricing", value: "pricing"},
			{title: "Contact", value: "contact"}
		];
		vm.goToAccount = false;

		$timeout(function () {
			homeLoggedOut = angular.element($element[0].querySelector('#homeLoggedOut'));

			/*
			 * Watch the state to handle moving to and from the login page
			 */
			$scope.$watch("vm.state", function (newState, oldState) {
				if (newState !== oldState && !vm.state.changing && vm.state.authInitialized) {
					homeLoggedOut.empty();

					vm.goToUserPage = false;
					for (i = 0; i < vm.functions.length; i++) {
						func = vm.functions[i];

						if (vm.state[func]) {
							vm.goToUserPage = true;
							// Create element
							element = "<" + UtilsService.snake_case(func, "-") +
								" username='vm.query.username'" +
								" token='vm.query.token'" +
								" query='vm.query'>" +
								"</" + UtilsService.snake_case(func, "-") + ">";

							notLoggedInElement = angular.element(element);
							homeLoggedOut.append(notLoggedInElement);
							$compile(notLoggedInElement)($scope);
							break;
						}
					}

					if (!vm.state.loggedIn && !vm.goToUserPage) {
						// Create login element
						notLoggedInElement = angular.element("<login></login>");
						homeLoggedOut.append(notLoggedInElement);
						$compile(notLoggedInElement)($scope);
					}
				}
			}, true);
		});

		if (angular.isDefined(vm.account) && angular.isDefined(vm.password))
		{
			Auth.login(vm.account, vm.password);
		}

        vm.logout = function () {
            Auth.logout();
        };

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};

		/**
		 * Display legal text
		 *
		 * @param event
		 * @param display
		 */
		vm.legalDisplay = function (event, display) {
			$window.open("/" + display.value);
		};

		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.USER_LOGGED_IN)
				{
					if (!event.value.error)
					{
						if(!event.value.initialiser) {
							StateManager.setStateVar("loggedIn", true);
							EventService.send(EventService.EVENT.GO_HOME);
						}
					}
				} else if (event.type === EventService.EVENT.USER_LOGGED_OUT) {
					EventService.send(EventService.EVENT.CLEAR_STATE);
					EventService.send(EventService.EVENT.SET_STATE, { loggedIn: false, account: null });
				} else if (event.type === EventService.EVENT.SHOW_PROJECTS) {
					EventService.send(EventService.EVENT.CLEAR_STATE);
					Auth.init();
				} else if (event.type === EventService.EVENT.GO_HOME) {
					EventService.send(EventService.EVENT.CLEAR_STATE);

					if (StateManager.state.loggedIn) {
						EventService.send(EventService.EVENT.SET_STATE, { account: Auth.username });
					} else {
						EventService.send(EventService.EVENT.SET_STATE, {});
					}
				}
				else if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
					vm.pointerEvents = event.value.on ? "none" : "auto";
				}
			}
		});

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}
    }
}());


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

(function() {
	"use strict";

	angular.module("3drepo")
	.factory("authInterceptor", ["EventService", "$q", function(EventService, $q) {
		return {
			responseError: function(res)
			{
				if (res.status === 401) {
					EventService.send(EventService.EVENT.USER_NOT_AUTHORIZED);
				}

				return $q.reject(res);
			}
		};
	}])
	.config(function ($httpProvider) {
		var checkAuthorization = ["$q", "$location", function($q, $location) {
			var onSuccess = function (res) { return res;};
			var onError = function(res) {
				if (res.status === 401 || res.status === 400) {
					return $q.reject(res);
				} else {
					return $q.reject(res);
				}
			};

			return function (promise) {
				return promise.then(onSuccess, onError);
			};
		}];

		$httpProvider.interceptors.push(checkAuthorization);
		$httpProvider.defaults.withCredentials = true;
		$httpProvider.interceptors.push("authInterceptor");
	});
})();

/**
 *  Copyright (C) 2015 3D Repo Ltd
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
		.factory("HttpService", HttpService);

	HttpService.$inject = ["$http", "$q", "EventService", "serverConfig"];

	function HttpService($http, $q, EventService, serverConfig) {
		var handlerFactory = function(httpReq)
		{
			return function (type, url, success, failure)
			{
				var deferred = $q.defer();

				// Determine full url
				var getURI = serverConfig.apiUrl(type, url);

				// If not success function is specified then
				// provide a default one
				var successFunc = success || function (response) { deferred.resolve(response.data); };

				// If no failure function is specified then provide a default one
				var failureFunc = failure || function (response) {
					if (response.status === 404 || response.status === 401)
					{
						// If there is a not found error or an unauthorized error
						// then panic and clear the state. Don't worry everything will
						// recover. :)
						EventService.send(EventService.EVENT.GO_HOME);
					}

					deferred.resolve([]);
				};

				httpReq(getURI).then(successFunc, failureFunc);

				return deferred.promise;
			};
		};

		var get  = handlerFactory($http.get);
		var post = handlerFactory($http.post);

		return {
			get:  get,
			post: post
		};
	}
}());


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

angular.module('3drepo')
.service('serverConfig', function() {
	"use strict";

	for (var k in server_config)
	{
		this[k] = server_config[k];
	}
});



/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function() {
    "use strict";

    angular.module("3drepo")
        .directive("issueArea", issueArea);

    function issueArea() {
        return {
            restrict: "EA",
            templateUrl: "issueArea.html",
            scope: {
                data: "=",
                type: "="
            },
            link: function (scope, element) {
                // Cleanup when destroyed
                element.on('$destroy', function(){
                    scope.vm.eventsWatch(); // Disable events watch
                });
            },
            controller: IssueAreaCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    IssueAreaCtrl.$inject = ["$scope", "$element", "$window", "$timeout", "EventService"];

    function IssueAreaCtrl($scope, $element, $window, $timeout, EventService) {
        var vm = this,
            canvas,
            canvasColour = "rgba(0 ,0 ,0, 0)",
            myCanvas,
            penIndicator,
            mouse_drag_x = 0, mouse_drag_y = 0,
            last_mouse_drag_x = -1, last_mouse_drag_y = -1,
            mouse_button = 0,
            mouse_dragging = false,
            pen_col = "#FF0000",
            initialPenIndicatorSize = 10,
            penIndicatorSize = initialPenIndicatorSize,
            penToIndicatorRatio = 0.8,
            pen_size = penIndicatorSize * penToIndicatorRatio,
            mouseWheelDirectionUp = null,
            hasDrawnOnCanvas = false;

        /*
         * Init
         */
        $timeout(function () {
            if (angular.isDefined(vm.data)) {
                if (vm.data.hasOwnProperty("scribble")) {
                    vm.scribble = 'data:image/png;base64,' + vm.data.scribble;
                }
            }
            else {
                canvas = angular.element($element[0].querySelector('#issueAreaCanvas'));
                myCanvas = document.getElementById("issueAreaCanvas");
                penIndicator = angular.element($element[0].querySelector("#issueAreaPenIndicator"));
                penIndicator.css("font-size", penIndicatorSize + "px");
                vm.pointerEvents = "auto";
                vm.showPenIndicator = false;
                resizeCanvas();
                initCanvas(myCanvas);
                if (angular.isDefined(vm.type)) {
                    vm.canvasPointerEvents = (vm.type === "pin") ? "none" : "auto";
                }
            }
        });

        /*
         * Setup event watch
         */
        vm.eventsWatch = $scope.$watch(EventService.currentEvent, function(event) {
            if (event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) {
                if (event.value === "scribble") {
                    setupScribble();
                }
                else if (event.value === "erase") {
                    setupErase();
                }
                else if (event.value === "pin") {
                    setupPin();
                }
            }
            else if (event.type === EventService.EVENT.GET_ISSUE_AREA_PNG) {
                var png = null;
                if (hasDrawnOnCanvas) {
                    png = myCanvas.toDataURL('image/png');
                    // Remove base64 header text
                    png = png.substring(png.indexOf(",") + 1);
                }
                event.value.promise.resolve(png);
            }
        });

        /**
         * Make the canvas the same size as the area
         */
        function resizeCanvas () {
            canvas.attr("width", $element[0].offsetWidth);
            canvas.attr("height", $element[0].offsetHeight);
        }

        /**
         * Setup canvas and event listeners
         *
         * @param canvas
         */
        function initCanvas(canvas)
        {
            clearCanvas();

            canvas.addEventListener('mousedown', function (evt) {
                mouse_drag_x = evt.layerX;
                mouse_drag_y = evt.layerY;
                mouse_dragging = true;

                updateImage(canvas);

                window.status='DOWN: '+evt.layerX+", "+evt.layerY;
                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;

                EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: true});
                vm.pointerEvents = "none";
            }, false);

            canvas.addEventListener('mouseup', function (evt) {
                mouse_button = 0;
                mouse_dragging = false;
                last_mouse_drag_x = -1;
                last_mouse_drag_y = -1;

                updateImage(canvas);

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;

                EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: false});
                vm.pointerEvents = "auto";
            }, false);

            canvas.addEventListener('mouseout', function (evt) {
                mouse_button = 0;
                mouse_dragging = false;
                last_mouse_drag_x = -1;
                last_mouse_drag_y = -1;

                updateImage(canvas);

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;

                EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: false});
                vm.pointerEvents = "auto";
            }, false);

            canvas.addEventListener('mousemove', function (evt) {
                window.status='MOVE: ' + evt.layerX + ", " + evt.layerY;
                mouse_drag_x = evt.layerX;
                mouse_drag_y = evt.layerY;

                if (!mouse_dragging && !vm.showPenIndicator) {
                    $timeout(function () {
                        vm.showPenIndicator = true;
                    });
                }
                else {
                    if ((last_mouse_drag_x !== -1) && (!hasDrawnOnCanvas)) {
                        hasDrawnOnCanvas = true;
                    }
                    updateImage(canvas);
                }

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
                setPenIndicatorPosition(evt.layerX, evt.layerY);
            }, false);

            // Disable changing on pen size with mouse wheel
            /*
            canvas.addEventListener('wheel', function (evt) {
                var penToIndicatorRation = 0.8;

                if (evt.deltaY === 0) {
                    mouseWheelDirectionUp = null;
                    initialPenIndicatorSize = penIndicatorSize;
                }
                else if ((evt.deltaY === 1) && (mouseWheelDirectionUp === null)) {
                    mouseWheelDirectionUp = false;
                    penIndicatorSize = initialPenIndicatorSize;
                }
                else if ((evt.deltaY === -1) && (mouseWheelDirectionUp === null)) {
                    mouseWheelDirectionUp = true;
                    penIndicatorSize = initialPenIndicatorSize;
                }
                else {
                    penIndicatorSize += mouseWheelDirectionUp ? 1 : -1;
                    penIndicatorSize = (penIndicatorSize < 0) ? 0 : penIndicatorSize;
                    penIndicator.css("font-size", penIndicatorSize + "px");
                    setPenIndicatorPosition(evt.layerX, evt.layerY);

                    pen_size += mouseWheelDirectionUp ? penToIndicatorRation : -penToIndicatorRation;
                    pen_size = (pen_size < 0) ? 0 : pen_size;
                }
            }, false);
            */
        }

        /**
         * Update the canvas
         *
         * @param canvas
         */
        function updateImage(canvas)
        {
            var context = canvas.getContext("2d");

            if (!mouse_dragging) {
                return;
            }

            if (last_mouse_drag_x < 0 || last_mouse_drag_y < 0)
            {
                last_mouse_drag_x = mouse_drag_x;
                last_mouse_drag_y = mouse_drag_y;
                return;
            }

            // redraw the canvas...
            context.lineWidth = pen_size;

            // Draw line
            context.beginPath();
            context.strokeStyle = pen_col;
            context.moveTo(last_mouse_drag_x, last_mouse_drag_y);
            context.lineTo(mouse_drag_x, mouse_drag_y);
            context.stroke();

            last_mouse_drag_x = mouse_drag_x;
            last_mouse_drag_y = mouse_drag_y;
        }

        /**
         * Clear the canvas
         */
        function clearCanvas () {
            var context = myCanvas.getContext("2d");
            context.clearRect(0, 0, myCanvas.width, myCanvas.height);
            context.fillStyle = canvasColour;
            context.fillRect(0, 0, myCanvas.width, myCanvas.height);
            context.lineCap = "round";
        }

        /**
         * Set up placing of the pin
         */
        function setupPin () {
            vm.canvasPointerEvents = "none";
        }

        /**
         * Erase the canvas
         */
        function setupErase () {
            var context = myCanvas.getContext("2d");
            context.globalCompositeOperation = "destination-out";
            pen_col = "rgba(0, 0, 0, 1)";
            vm.canvasPointerEvents = "auto";
        }

        /**
         * Set up drawing
         */
        function setupScribble () {
            var context = myCanvas.getContext("2d");
            context.globalCompositeOperation = "source-over";
            pen_col = "#FF0000";
            pen_size = penIndicatorSize;
            vm.canvasPointerEvents = "auto";
        }

        /*
         * Watch for screen resize
         */
        angular.element($window).bind("resize", function() {
            //resizeCanvas();
        });

        /**
         * Move the pen indicator
         * @param x
         * @param y
         */
        function setPenIndicatorPosition (x, y) {
            var positionFactor = 2.2;
            penIndicator.css("left", (x - (penIndicatorSize / positionFactor)) + "px");
            penIndicator.css("top", (y - (penIndicatorSize / positionFactor)) + "px");
        }
    }
}());
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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("issue", issue);

	function issue() {
		return {
			restrict: "EA",
			templateUrl: "issue.html",
			scope: {
				index: "=",
				data: "=",
				autoSaveComment: "=",
				onCommentSaved: "&",
				onCommentAutoSaved: "&",
				onToggleCloseIssue: "&",
				availableRoles: "=",
				projectUserRoles: "=",
				onIssueAssignChange: "&"
			},
			controller: IssueCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	IssueCtrl.$inject = ["$scope", "IssuesService"];

	function IssueCtrl($scope, IssuesService) {
		var vm = this,
			promise = null,
			originatorEv = null,
			initWatch;

		/*
		 * Initialise view vars
		 */
		vm.showComments = true;
		vm.numNewComments = 0;
		vm.saveCommentDisabled = true;
		vm.autoSaveComment = false;
		vm.showInfo = false;
		vm.editingComment = false;
		vm.assignedRolesColors = [];
		vm.savingComment = false;
		vm.togglingIssueState = true;

		/*
		 * Handle the list of available roles
		 */
		$scope.$watch("vm.availableRoles", function(newValue) {
			var i = 0,
				length = 0;

			if (angular.isDefined(newValue)) {
				// Create a local copy of the available roles
				vm.roles = [];
				for (i = 0, length = newValue.length; i < length; i += 1) {
					vm.roles.push({
						role: newValue[i].role,
						color: newValue[i].color
					});
				}
				setupRolesWatch();
				initAssignedRolesDisplay();
				setupCanModifyIssue();
			}
		});

		/*
		 * Handle a request to do a comment auto save from the issue list
		 */
		$scope.$watch("vm.autoSaveComment", function(newValue) {
			if (angular.isDefined(newValue) && newValue && !vm.editingComment) {
				if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
					vm.autoSaveComment = true;
					vm.saveComment();
				}
			}
		});

		/*
		 * Handle change to comment input
		 */
		$scope.$watch("vm.comment", function(newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveCommentDisabled = (newValue === "");
			}
		});

		/*
		 * Do some initialisation
		 */
		initWatch = $scope.$watch("vm.data", function(newValue) {
			var i = 0,
				length = 0;

			if (angular.isDefined(newValue)) {
				vm.issueIsOpen = true;
				if (newValue.hasOwnProperty("closed")) {
					vm.issueIsOpen = !newValue.closed;
				}

				if (vm.issueIsOpen && newValue.hasOwnProperty("comments")) {
					for (i = 0, length = newValue.comments.length; i < length; i += 1) {
						newValue.comments[i].canDelete =
							(i === (newValue.comments.length - 1)) && (!newValue.comments[i].sealed);
					}
				}
				initAssignedRolesDisplay();
			}
			initWatch(); // Cancel the watch
		}, true);

		/**
		 * Handle changes to the assigned roles for the issue
		 */
		function setupRolesWatch() {
			$scope.$watch("vm.roles", function(newValue, oldValue) {
				var i = 0,
					length = 0;

				// Ignore initial setup of roles
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.data.assigned_roles = [];
					for (i = 0, length = vm.roles.length; i < length; i += 1) {
						if (vm.roles[i].assigned) {
							vm.data.assigned_roles.push(vm.roles[i].role);
						}
					}

					promise = IssuesService.assignIssue(vm.data);
					promise.then(function () {
						setAssignedRolesColors();
						vm.onIssueAssignChange();
					});
				}
			}, true);
		}

		/**
		 * Get the initial assigned roles for the issue
		 */
		function initAssignedRolesDisplay() {
			var i = 0,
				length = 0;

			if (angular.isDefined(vm.roles) && angular.isDefined(vm.data) && vm.data.hasOwnProperty("assigned_roles")) {
				for (i = 0, length = vm.roles.length; i < length; i += 1) {
					vm.roles[i].assigned = (vm.data.assigned_roles.indexOf(vm.roles[i].role) !== -1);
				}
				setAssignedRolesColors();
			}
		}

		/**
		 * Set up the assigned role colors for the issue
		 */
		function setAssignedRolesColors () {
			var i, length;

			var pinColours = [];

			vm.assignedRolesColors = [];
			for (i = 0, length = vm.roles.length; i < length; i += 1) {
				if (vm.data.assigned_roles.indexOf(vm.roles[i].role) !== -1) {
					var roleColour = IssuesService.getRoleColor(vm.roles[i].role);
					vm.assignedRolesColors.push(roleColour);
					pinColours.push(IssuesService.hexToRgb(roleColour));
				}
			}
		}

		/**
		 * A user with the same role as the issue creator_role or
		 * a role that is one of the roles that the issues has been assigned to can modify the issue
		 */
		function setupCanModifyIssue() {
			var i = 0,
				length = 0;

			vm.canModifyIssue = false;
			if (angular.isDefined(vm.projectUserRoles) && angular.isDefined(vm.data) && vm.data.hasOwnProperty("assigned_roles")) {
				vm.canModifyIssue = (vm.projectUserRoles.indexOf(vm.data.creator_role) !== -1);
				if (!vm.canModifyIssue) {
					for (i = 0, length = vm.projectUserRoles.length; i < length; i += 1) {
						if (vm.data.assigned_roles.indexOf(vm.projectUserRoles[i]) !== -1) {
							vm.canModifyIssue = true;
							break;
						}
					}
				}
			}
		}

		/**
		 * Save a comment
		 */
		vm.saveComment = function() {
			if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
				vm.savingComment = true;
				if (vm.editingComment) {
					promise = IssuesService.editComment(vm.data, vm.comment, vm.editingCommentIndex);
					promise.then(function(data) {
						vm.data.comments[vm.editingCommentIndex].comment = vm.comment;
						vm.data.comments[vm.editingCommentIndex].timeStamp = IssuesService.getPrettyTime(data.created);
						vm.comment = "";
						vm.savingComment = false;
					});
				} else {
					promise = IssuesService.saveComment(vm.data, vm.comment);
					promise.then(function(data) {
						console.log(data);
						if (!vm.data.hasOwnProperty("comments")) {
							vm.data.comments = [];
						}
						vm.data.comments.push({
							owner: data.owner,
							comment: vm.comment,
							created: data.created,
							timeStamp: IssuesService.getPrettyTime(data.created)
						});
						vm.comment = "";
						vm.numNewComments += 1; // This is used to increase the height of the comments list

						if (vm.autoSaveComment) {
							vm.onCommentAutoSaved({index: vm.index}); // Tell the issue list a comment auto save has been done
							vm.autoSaveComment = false;
						}
						else {
							vm.onCommentSaved();
						}

						// Mark previous comment as 'set' - no longer deletable or editable
						if (vm.data.comments.length > 1) {
							promise = IssuesService.setComment(vm.data, (vm.data.comments.length - 2));
							promise.then(function(data) {
								vm.data.comments[vm.data.comments.length - 2].set = true;
							});
						}

						vm.savingComment = false;
					});
				}
			}
		};

		/**
		 * Delete a comment
		 *
		 * @param index
		 */
		vm.deleteComment = function(index) {
			promise = IssuesService.deleteComment(vm.data, index);
			promise.then(function(data) {
				vm.data.comments.splice(index, 1);
				vm.numNewComments -= 1; // This is used to reduce the height of the comments list
				vm.comment = "";
				vm.editingComment = false;
			});
		};

		/**
		 * Toggle the editing of a comment
		 *
		 * @param index
		 */
		vm.toggleEditComment = function(index) {
			vm.editingComment = !vm.editingComment;
			vm.editingCommentIndex = index;
			if (vm.editingComment) {
				vm.comment = vm.data.comments[vm.data.comments.length - 1].comment;
			} else {
				vm.comment = "";
			}
		};

		/**
		 * Toggle the closed status of an issue
		 */
		vm.toggleCloseIssue = function() {
			vm.issueIsOpen = !vm.issueIsOpen;
			vm.onToggleCloseIssue({
				issue: vm.data
			});
		};

		/**
		 * Open the menu to assign roles
		 *
		 * @param $mdOpenMenu
		 * @param event
		 */
		vm.openAssignedRolesMenu = function($mdOpenMenu, event) {
			originatorEv = event;
			$mdOpenMenu(event);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("issueHeader", issueHeader);

	function issueHeader() {
		return {
			restrict: "EA",
			templateUrl: "issueHeader.html",
			scope: {
				index: "=",
				issueData: "=",
				onClick: "&",
				showInfo: "=",
				infoText: "=",
				onHideInfo: "&"
			},
			controller: IssueHeaderCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssueHeaderCtrl.$inject = [];

	function IssueHeaderCtrl() {
		var vm = this;

		vm.click = function () {
			if (angular.isDefined(vm.onClick)) {
				vm.onClick({index: vm.index, pinSelect: false});
			}
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("issues", issues);

	function issues() {
		return {
			restrict: "EA",
			templateUrl: "issues.html",
			scope: {
				account: "=",
				project: "=",
				branch:  "=",
				revision: "=",
				filterText: "=",
				show: "=",
				showAdd: "=",
				showEdit: "=",
				canAdd: "=",
				selectedMenuOption: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "="
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$timeout", "$filter", "$window", "$q", "$element", "IssuesService", "EventService", "Auth", "serverConfig"];

	function IssuesCtrl($scope, $timeout, $filter, $window, $q, $element, IssuesService, EventService, Auth, serverConfig) {
		var vm = this,
			promise,
			rolesPromise,
			projectUserRolesPromise,
			sortedIssuesLength,
			sortOldestFirst = true,
			showClosed = false,
			issue,
			rolesToFilter = [],
			issuesHeight,
			selectedObjectId = null,
			pickedPos = null,
			pickedNorm = null,
			pinHighlightColour = [1.0000, 0.7, 0.0];

		/*
		 * Init
		 */
		vm.saveIssueDisabled = true;
		vm.issues = [];
		vm.issuesToShow = [];
		vm.showProgress = true;
		vm.progressInfo = "Loading issues";
		vm.availableRoles = null;
		vm.projectUserRoles = [];
		vm.selectedIssue = null;
		vm.autoSaveComment = false;
		vm.canAdd = true;
		vm.onContentHeightRequest({height: 70}); // To show the loading progress
		vm.savingIssue = false;

		/*
		 * Get all the Issues
		 */
		promise = IssuesService.getIssues(vm.account, vm.project);
		promise.then(function (data) {
			var i, length;
			vm.showProgress = false;
			vm.issues = (data === "") ? [] : data;
			if (vm.issues.length > 0) {
				vm.toShow = "showIssues";
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					vm.issues[i].showInfo = false;
					vm.issues[i].selected = false;
				}
				setAllIssuesAssignedRolesColors();
				setupIssuesToShow();
				vm.showPins();
			}
			else {
				vm.toShow = "showInfo";
				vm.issuesInfo = "There are currently no open issues";
			}
			setContentHeight();
		});

		/*
		 * Get all the available roles for the project
		 */
		rolesPromise = IssuesService.getRoles(vm.account, vm.project);
		rolesPromise.then(function (data) {
			vm.availableRoles = data;
			setAllIssuesAssignedRolesColors();
		});

		/**
		 * Define the assigned role colors for each issue
		 */
		function setAllIssuesAssignedRolesColors () {
			var i, length;
			if (vm.availableRoles !== null) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					setIssueAssignedRolesColors(vm.issues[i]);
				}
			}
		}

		/**
		 * Define the assigned role colors for an issue
		 * Also set the pin colors
		 *
		 * @param issue
		 */
		function setIssueAssignedRolesColors (issue) {
			var i, length, roleColour, pinColours = [];

			issue.assignedRolesColors = [];
			for (i = 0, length = issue.assigned_roles.length; i < length; i += 1) {
				roleColour = IssuesService.getRoleColor(issue.assigned_roles[i]);
				issue.assignedRolesColors.push(roleColour);
				pinColours.push(IssuesService.hexToRgb(roleColour));
			}
		}

		/*
		 * Get the user roles for the project
		 */
		projectUserRolesPromise = IssuesService.getUserRolesForProject(vm.account, vm.project, Auth.username);
		projectUserRolesPromise.then(function (data) {
			vm.projectUserRoles = data;
		});

		/*
		 * Handle showing of adding a new issue
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				setupAdd();
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: true, type: "scribble"});
			}
		});

		/*
		 * Handle input to the title field of a new issue
		 */
		$scope.$watch("vm.title", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveIssueDisabled = (newValue.toString() === "");
			}
		});

		/**
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			var i, length,
				position = [], normal = [];

			if ((event.type === EventService.EVENT.VIEWER.PICK_POINT) && (vm.toShow === "showAdd"))
			{
				if (event.value.hasOwnProperty("id"))
				{
					// Remove pin from last position if it exists
					removeAddPin();

					selectedObjectId = event.value.id;

					// Convert data to arrays
					angular.forEach(event.value.position, function(value) {
						pickedPos = event.value.position;
						position.push(value);
					});
					angular.forEach(event.value.normal, function(value) {
						pickedNorm = event.value.normal;
						normal.push(value);
					});


					// Add pin
					IssuesService.addPin(
						{
							id: IssuesService.newPinId,
							position: position,
							norm: normal,
							account: vm.account,
							project: vm.project
						},
						IssuesService.hexToRgb(IssuesService.getRoleColor(vm.projectUserRoles[0]))
					);
				} else {
					removeAddPin();
				}
			} else if ((event.type === EventService.EVENT.VIEWER.CLICK_PIN) && vm.show) {
				if (vm.toShow === "showAdd") {
					removeAddPin();
				}

				// Show or hide the selected issue
				for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
					if (event.value.id === vm.issuesToShow[i]._id) {
						if (vm.selectedIssue === null) {
							vm.showSelectedIssue(i, true);
						}
						else {
							if (vm.selectedIssue._id === vm.issuesToShow[i]._id) {
								vm.hideItem = true;
							}
							else {
								vm.showSelectedIssue(i, true);
							}
						}
						break;
					}
				}
			} else if (event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) {
				if (event.value.on) {
					vm.show = true;
					setupAdd();
					// This is done to override the default mode ("scribble") set in the vm.showAdd watch above ToDo improve!
					$timeout(function () {
						EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, event.value.type);
					}, 200);
				}
				else {
					vm.hideItem = true;
				}
			}
		});

		/**
		 * Remove the temporary pin used for adding an issue
		 */
		function removeAddPin () {
			IssuesService.removePin(IssuesService.newPinId);
			selectedObjectId = null;
			pickedPos = null;
			pickedNorm = null;
		}

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0, roleAssigned;

			vm.issuesToShow = [];

			if (angular.isDefined(vm.issues)) {
				if (vm.issues.length > 0) {
					// Sort
					vm.issuesToShow = [vm.issues[0]];
					for (i = 1, length = vm.issues.length; i < length; i += 1) {
						for (j = 0, sortedIssuesLength = vm.issuesToShow.length; j < sortedIssuesLength; j += 1) {
							if (((vm.issues[i].created > vm.issuesToShow[j].created) && (sortOldestFirst)) ||
								((vm.issues[i].created < vm.issuesToShow[j].created) && (!sortOldestFirst))) {
								vm.issuesToShow.splice(j, 0, vm.issues[i]);
								break;
							}
							else if (j === (vm.issuesToShow.length - 1)) {
								vm.issuesToShow.push(vm.issues[i]);
							}
						}
					}

					// Filter text
					if (angular.isDefined(vm.filterText) && vm.filterText !== "") {

						// Helper function for searching strings
						var stringSearch = function(superString, subString)
						{
							return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
						};

						vm.issuesToShow = ($filter('filter')(vm.issuesToShow, function(issue) {
							// Required custom filter due to the fact that Angular
							// does not allow compound OR filters
							var i;

							// Search the title
							var show = stringSearch(issue.title, vm.filterText);
							show = show || stringSearch(issue.timeStamp, vm.filterText);
							show = show || stringSearch(issue.owner, vm.filterText);

							// Search the list of assigned issues
							if (!show && issue.hasOwnProperty("assigned_roles"))
							{
								i = 0;
								while(!show && (i < issue.assigned_roles.length))
								{
									show = show || stringSearch(issue.assigned_roles[i], vm.filterText);
									i += 1;
								}
							}

							// Search the comments
							if (!show && issue.hasOwnProperty("comments"))
							{
								i = 0;

								while(!show && (i < issue.comments.length))
								{
									show = show || stringSearch(issue.comments[i].comment, vm.filterText);
									show = show || stringSearch(issue.comments[i].owner, vm.filterText);
									i += 1;
								}
							}

							return show;
						}));

						//{title : vm.filterText} || {comments: { comment : vm.filterText }} ));
					}

					// Don't show issues assigned to certain roles
					if (rolesToFilter.length > 0) {
						i = 0;
						while(i < vm.issuesToShow.length) {
							roleAssigned = false;

							if (vm.issuesToShow[i].hasOwnProperty("assigned_roles")) {
								for (j = 0, length = vm.issuesToShow[i].assigned_roles.length; j < length; j += 1) {
									if (rolesToFilter.indexOf(vm.issuesToShow[i].assigned_roles[j]) !== -1) {
										roleAssigned = true;
									}
								}
							}

							if (roleAssigned) {
								vm.issuesToShow.splice(i, 1);
							} else {
								i += 1;
							}
						}
					}

					// Closed
					for (i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
						if (!showClosed && vm.issuesToShow[i].hasOwnProperty("closed") && vm.issuesToShow[i].closed) {
							vm.issuesToShow.splice(i, 1);
						}
					}
				}
			}

			// Setup what to show
			if (vm.issuesToShow.length > 0) {
				vm.toShow = "showIssues";
				// Hide any scribble if showing the issues list
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
			}
			else {
				vm.toShow = "showInfo";
				vm.issuesInfo = "There are currently no open issues";
			}
		}

		/**
		 * The roles assigned to the issue have been changed
		 */
		vm.issueAssignChange = function () {
			setIssueAssignedRolesColors(vm.selectedIssue);
			vm.showPins();
		};

		/**
		 * Add issue pins to the viewer
		 */
		vm.showPins = function () {
			var i, j, length, assignedRolesLength,
				pin, pinData,
				roleAssigned;

			for (i = 0, length = vm.issues.length; i < length; i += 1) {
				if (vm.issues[i].object_id !== null) {
					pin = angular.element(document.getElementById(vm.issues[i]._id));
					if (pin.length > 0) {
						// Existing pin
						pin[0].setAttribute("render", "true");

						// Closed
						if (!showClosed && vm.issues[i].hasOwnProperty("closed") && vm.issues[i].closed) {
							pin[0].setAttribute("render", "false");
						}

						// Role filter
						if (rolesToFilter.length > 0) {
							roleAssigned = false;

							if (vm.issues[i].hasOwnProperty("assigned_roles")) {
								for (j = 0, assignedRolesLength = vm.issues[i].assigned_roles.length; j < assignedRolesLength; j += 1) {
									if (rolesToFilter.indexOf(vm.issues[i].assigned_roles[j]) !== -1) {
										roleAssigned = true;
									}
								}
							}

							if (roleAssigned) {
								pin[0].setAttribute("render", "false");
							}
						}
					}
					else {
						// New pin
						if (!vm.issues[i].hasOwnProperty("closed") ||
							(vm.issues[i].hasOwnProperty("closed") && !vm.issues[i].closed) ||
							(showClosed && vm.issues[i].hasOwnProperty("closed") && vm.issues[i].closed)) {
							pinData =
							{
								id: vm.issues[i]._id,
								position: vm.issues[i].position,
								norm: vm.issues[i].norm,
								account: vm.account,
								project: vm.project
							};

							IssuesService.addPin(pinData, [[1.0, 1.0, 1.0]], vm.issues[i].viewpoint);
							setPinToAssignedRoleColours(vm.issues[i]);
						}
					}
				}
			}
		};

		/*
		 * Selecting a menu option
		 */
		$scope.$watch("vm.selectedMenuOption", function (newValue) {
			var role, roleIndex;
			if (angular.isDefined(newValue)) {
				if (newValue.value === "sortByDate") {
					sortOldestFirst = !sortOldestFirst;
				}
				else if (newValue.value === "showClosed") {
					showClosed = !showClosed;
				}
				else if (newValue.value.indexOf("filterRole") !== -1) {
					role = newValue.value.split("_")[1];
					roleIndex = rolesToFilter.indexOf(role);
					if (roleIndex !== -1) {
						rolesToFilter.splice(roleIndex, 1);
					}
					else {
						rolesToFilter.push(role);
					}
				}
				else if (newValue.value === "print") {
					$window.open(serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.project + "/issues.html"), "_blank");
				}
				setupIssuesToShow();
				setContentHeight();
				vm.showPins();
			}
		});

		/*
		 * Handle changes to the filter input
		 */
		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				setupIssuesToShow();

				// Set the height of the content
				if (vm.issuesToShow.length === 0) {
					vm.toShow = "showInfo";
					vm.issuesInfo = "There are no issues that contain the filter text";
				}
				else {
					vm.toShow = "showIssues";
				}
				setContentHeight();
			}
		});

		/*
		 * Handle parent notice to hide a selected issue or add issue
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.autoSaveComment = true; // Auto save a comment if needed

				$timeout(function () {
					if (vm.toShow === "showAdd") {
						removeAddPin();
						EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
					}
					vm.showAdd = false; // So that showing add works
					vm.canAdd = true;
					vm.showEdit = false; // So that closing edit works

					// Set the content height
					setupIssuesToShow();
					setContentHeight();

					// Deselect any selected pin
					setPinToAssignedRoleColours(vm.selectedIssue);

					// No selected issue
					vm.selectedIssue = null;

					// Hide issue area
					EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
				});
			}
		});

		/**
		 * Make the selected issue fill the content and notify the parent
		 *
		 * @param {Number} index
		 * @param {Boolean} pinSelect - whether called by a pin selection or not
		 */
		vm.showSelectedIssue = function (index, pinSelect) {
			// Hide and show layers
			if (vm.toShow === "showAdd") {
				removeAddPin();
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
			}
			vm.toShow = "showIssue";
			vm.showAdd = false; // So that showing add works
			vm.canAdd = false;
			vm.showEdit = true;

			// Selected issue
			if (vm.selectedIssue !== null) {
				vm.selectedIssue.selected = false;
			}
			vm.selectedIssue = vm.issuesToShow[index];
			vm.selectedIndex = index;
			vm.selectedIssue.selected = true;
			vm.selectedIssue.showInfo = false;

			vm.autoSaveComment = false; // So that the request to auto save a comment will fire

			// Show the issue
			vm.onShowItem();

			// Set the content height
			setContentHeight();

			// Highlight pin, move camera and setup clipping plane
			if (!pinSelect) {
				EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
					id: vm.selectedIssue._id,
					colours: pinHighlightColour
				});

				EventService.send(EventService.EVENT.VIEWER.SET_CAMERA, {
					position : vm.selectedIssue.viewpoint.position,
					view_dir : vm.selectedIssue.viewpoint.view_dir,
					//look_at: vm.selectedIssue.viewpoint.look_at,
					up: vm.selectedIssue.viewpoint.up
				});

				EventService.send(EventService.EVENT.VIEWER.SET_CLIPPING_PLANES, {
					clippingPlanes: vm.selectedIssue.viewpoint.clippingPlanes
				});
			}

			// Wait for camera to stop before showing a scribble
			$timeout(function () {
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: true, issue: vm.selectedIssue});
			}, 1100);
		};

		/**
		 * Save an issue
		 */
		vm.saveIssue = function () {
			if (vm.projectUserRoles.length === 0) {
				vm.showAlert("You do not have permission to save an issue");
			}
			else {
				if (angular.isDefined(vm.title) && (vm.title !== "")) {
					vm.savingIssue = true;
					var issueAreaPngPromise = $q.defer();
					EventService.send(EventService.EVENT.GET_ISSUE_AREA_PNG, {promise: issueAreaPngPromise});
					issueAreaPngPromise.promise.then(function (png) {
						issue = {
							name: vm.title,
							objectId: null,
							pickedPos: null,
							pickedNorm: null,
							creator_role: vm.projectUserRoles[0],
							account: vm.account,
							project: vm.project,
							scribble: png
						};
						if (selectedObjectId !== null) {
							issue.objectId = selectedObjectId;
							issue.pickedPos = pickedPos;
							issue.pickedNorm = pickedNorm;
						}
						promise = IssuesService.saveIssue(issue);
						promise.then(function (data) {
							// Set the role colour
							data.assignedRolesColors = [];
							data.assignedRolesColors.push(IssuesService.getRoleColor(vm.projectUserRoles[0]));
							vm.issues.push(data);

							// Init
							vm.title = "";
							selectedObjectId = null;
							pickedPos = null;
							pickedNorm = null;

							// Save issue with a comment
							if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
								saveCommentWithIssue(data, vm.comment);
								vm.comment = "";
							}

							// Get out of add mode and show issues
							vm.hideItem = true;

							vm.savingIssue = false;
							setupIssuesToShow();
							setContentHeight();
							vm.showPins();
						});
					});
				}
			}
		};

		/**
		 * Cancel adding an issue
		 */
		vm.cancelAddIssue = function () {
			vm.hideItem = true;
		};

		/**
		 * Toggle the closed status of an issue
		 *
		 * @param {Object} issue
		 */
		vm.toggleCloseIssue = function (issue) {
			var i = 0,
				length = 0;

			promise = IssuesService.toggleCloseIssue(issue);
			promise.then(function (data) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					if (issue._id === vm.issues[i]._id) {
						vm.issues[i].closed = data.issue.closed;
						//vm.issues[i].closed_time = data.created; // TODO: Shouldn't really use the created value
						break;
					}
				}

				// Remain in issue unless closing when showing closed issues is off
				if (data.issue.closed) {
					if (showClosed) {
						setContentHeight();
					}
					else {
						vm.toShow = "showIssues";
						setupIssuesToShow();
						vm.showPins();
						setContentHeight();
						vm.canAdd = true;
						EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
					}
				}
				else {
					setContentHeight();
				}
			});
		};

		/**
		 * Save a comment at the same time as creating a new issue
		 *
		 * @param {Object} issue
		 * @param {String} comment
		 */
		function saveCommentWithIssue (issue, comment) {
			promise = IssuesService.saveComment(issue, comment);
			promise.then(function (data) {
				vm.issues[vm.issues.length - 1].comments = [
					{
						owner: data.owner,
						comment: comment,
						timeStamp: IssuesService.getPrettyTime(data.created)
					}
				];
			});
		}

		/**
		 * Show an issue alert
		 *
		 * @param {String} title
		 */
		vm.showAlert = function(title) {
			vm.showAddAlert = true;
			vm.addAlertText = title;
		};

		/**
		 * Close the add alert
		 */
		vm.closeAddAlert = function () {
			vm.showAddAlert = false;
			vm.addAlertText = "";
		};

		/**
		 * A comment has been saved
		 */
		vm.commentSaved = function () {
			setContentHeight();
		};

		/**
		 * A comment has been auto saved
		 */
		vm.commentAutoSaved = function (index) {
			vm.selectedIndex = index;
			vm.infoText = "Comment on issue #" + vm.issuesToShow[vm.selectedIndex].title + " auto-saved";
			vm.issuesToShow[vm.selectedIndex].showInfo = true;
			vm.infoTimeout = $timeout(function() {
				vm.issuesToShow[vm.selectedIndex].showInfo = false;
			}, 4000);
		};

		/**
		 * Hide issue info
		 */
		vm.hideInfo = function() {
			vm.issuesToShow[vm.selectedIndex].showInfo = false;
			$timeout.cancel(vm.infoTimeout);
		};

		/**
		 * Set the content height
		 */
		function setContentHeight () {
			var i,
				length,
				height = 0,
				issueMinHeight = 56,
				maxStringLength = 32,
				lineHeight = 18,
				footerHeight,
				addHeight = 260,
				commentHeight = 80,
				headerHeight = 53,
				openIssueFooterHeight = 180,
				closedIssueFooterHeight = 60,
				infoHeight = 80,
				issuesMinHeight = 260;

			switch (vm.toShow) {
				case "showIssues":
					issuesHeight = 0;
					for (i = 0, length = vm.issuesToShow.length; (i < length); i += 1) {
						issuesHeight += issueMinHeight;
						if (vm.issuesToShow[i].title.length > maxStringLength) {
							issuesHeight += lineHeight * Math.floor((vm.issuesToShow[i].title.length - maxStringLength) / maxStringLength);
						}
					}
					height = issuesHeight;
					height = (height < issuesMinHeight) ? issuesMinHeight : issuesHeight;
					break;

				case "showIssue":
					if (vm.selectedIssue.closed) {
						footerHeight = closedIssueFooterHeight;
					}
					else {
						footerHeight = openIssueFooterHeight;
					}

					var numberComments = vm.selectedIssue.hasOwnProperty("comments") ? vm.selectedIssue.comments.length : 0;
					height = headerHeight + (numberComments * commentHeight) + footerHeight;
					break;

				case "showAdd":
					height = addHeight;
					break;

				case "showInfo":
					height = infoHeight;
					break;
			}

			vm.onContentHeightRequest({height: height});
		}

		function setPinToAssignedRoleColours (issue) {
			var i, length, pinColours = [], roleColour;

			if (issue !== null) {
				for (i = 0, length = issue.assigned_roles.length; i < length; i += 1) {
					roleColour = IssuesService.getRoleColor(issue.assigned_roles[i]);
					pinColours.push(IssuesService.hexToRgb(roleColour));
				}

				EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
					id: issue._id,
					colours: pinColours
				});
			}
		}

		/**
		 * Set up adding an issue
		 */
		function setupAdd () {
			if (vm.toShow === "showIssue") {
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA, {on: false});
			}
			vm.toShow = "showAdd";
			vm.onShowItem();
			vm.showAdd = true;
			vm.canAdd = false;
			setContentHeight();
			setPinToAssignedRoleColours(vm.selectedIssue);

			// Set default issue title and select it
			vm.title = "Issue " + (vm.issues.length + 1);
			$timeout(function () {
				($element[0].querySelector("#issueAddTitle")).select();
			});
		}
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
		.factory("IssuesService", IssuesService);

	IssuesService.$inject = ["$http", "$q", "serverConfig", "EventService"];

	function IssuesService($http, $q,  serverConfig, EventService) {
		var url = "",
			data = {},
			config = {},
			i, j = 0,
			numIssues = 0,
			numComments = 0,
			availableRoles = [],
			userRoles = [],
			obj = {},
			newPinId = "newPinId";

		// TODO: Internationalise and make globally accessible
		obj.getPrettyTime = function(time) {
			var date = new Date(time),
				currentDate = new Date(),
				prettyTime,
				postFix,
				hours,
				monthToText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

			if ((date.getFullYear() === currentDate.getFullYear()) &&
				(date.getMonth() === currentDate.getMonth()) &&
				(date.getDate() === currentDate.getDate())) {
				hours = date.getHours();
				if (hours > 11) {
					postFix = " PM";
					if (hours > 12) {
						hours -= 12;
					}
				} else {
					postFix = " AM";
					if (hours === 0) {
						hours = 12;
					}
				}

				prettyTime = hours + ":" + ("0" + date.getMinutes()).slice(-2) + postFix;
			} else if (date.getFullYear() === currentDate.getFullYear()) {
				prettyTime = date.getDate() + " " + monthToText[date.getMonth()];
			} else {
				prettyTime = monthToText[date.getMonth()] + " '" + (date.getFullYear()).toString().slice(-2);
			}

			return prettyTime;
		};

		var generateTitle = function(issue) {
			if (issue.typePrefix) {
				return issue.typePrefix + "." + issue.number + " " + issue.name;
			} else {
				return issue.number + " " + issue.name;
			}
		};

		obj.getIssues = function(account, project) {
			var self = this,
				deferred = $q.defer();
			url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/issues.json");

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
						for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
							data.data[i].timeStamp = self.getPrettyTime(data.data[i].created);

							if (data.data[i].hasOwnProperty("comments")) {
								for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
									if (data.data[i].comments[j].hasOwnProperty("created")) {
										data.data[i].comments[j].timeStamp = self.getPrettyTime(data.data[i].comments[j].created);
									}
								}
							}

							data.data[i].title = generateTitle(data.data[i]);
						}
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.saveIssue = function (issue) {
			var self = this,
				dataToSend,
				deferred = $q.defer(),
				viewpointPromise = $q.defer();

			url = serverConfig.apiUrl(serverConfig.POST_API, issue.account + "/" + issue.project + "/issues.json");

			EventService.send(EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, {promise: viewpointPromise});

			viewpointPromise.promise.then(function (viewpoint) {
				data = {
					object_id: issue.objectId,
					name: issue.name,
					viewpoint: viewpoint,
					scale: 1.0,
					creator_role: issue.creator_role,
					assigned_roles: userRoles,
					scribble: issue.scribble
				};
				config = {withCredentials: true};

				if (issue.pickedPos !== null) {
					data.position = issue.pickedPos.toGL();
					data.norm = issue.pickedNorm.toGL();
				}

				dataToSend = {data: JSON.stringify(data)};

				$http.post(url, dataToSend, config)
					.then(function successCallback(response) {
						console.log(response);
						response.data.issue._id = response.data.issue_id;
						response.data.issue.account = issue.account;
						response.data.issue.project = issue.project;
						response.data.issue.timeStamp = self.getPrettyTime(response.data.issue.created);
						response.data.issue.creator_role = issue.creator_role;
						response.data.issue.scribble = issue.scribble;

						response.data.issue.title = generateTitle(response.data.issue);
						self.removePin();
						deferred.resolve(response.data.issue);
					});
			});

			return deferred.promise;
		};

		/**
		 * Handle PUT requests
		 * @param issue
		 * @param data
		 * @returns {*}
		 */
		function doPut(issue, data) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, issue.account + "/" + issue.project + "/issues/" + issue._id + ".json"),
				config = {
					withCredentials: true
				};
			$http.put(url, {data: JSON.stringify(data)}, config)
				.then(function (response) {
					deferred.resolve(response.data);
				});
			return deferred.promise;
		}

		obj.toggleCloseIssue = function(issue) {
			var closed = true;
			if (issue.hasOwnProperty("closed")) {
				closed = !issue.closed;
			}
			return doPut(issue, {
				closed: closed,
				number: issue.number
			});
		};

		obj.assignIssue = function(issue) {
			return doPut(
				issue,
				{
					assigned_roles: issue.assigned_roles,
					number: issue.number
				}
			);
		};

		obj.saveComment = function(issue, comment) {
			return doPut(issue, {
				comment: comment,
				number: issue.number
			});
		};

		obj.editComment = function(issue, comment, commentIndex) {
			return doPut(issue, {
				comment: comment,
				number: issue.number,
				edit: true,
				commentIndex: commentIndex
			});
		};

		obj.deleteComment = function(issue, index) {
			return doPut(issue, {
				comment: "",
				number: issue.number,
				delete: true,
				commentIndex: index
				// commentCreated: issue.comments[index].created
			});
		};

		obj.setComment = function(issue, commentIndex) {
			return doPut(issue, {
				comment: "",
				number: issue.number,
				sealed: true,
				commentIndex: commentIndex
			});
		};

		obj.addPin = function (pin, colours, viewpoint) {
			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: pin.id,
				account: pin.account,
				project: pin.project,
				position: pin.position,
				norm: pin.norm,
				colours: colours,
				viewpoint: viewpoint
			});
		};

		obj.removePin = function (id) {
			EventService.send(EventService.EVENT.VIEWER.REMOVE_PIN, {
				id: id
			});
		};

		obj.fixPin = function (pin, colours) {
			var self = this;
			self.removePin();

			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: newPinId,
				position: pin.position,
				norm: pin.norm,
				colours: colours
			});
		};

		obj.getRoles = function(account, project) {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(serverConfig.GET_API, account + '/' + project + '/roles.json');

			$http.get(url)
				.then(
					function(data) {
						availableRoles = data.data;
						deferred.resolve(availableRoles);
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.getUserRolesForProject = function(account, project, username) {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" +project + "/" + username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(data) {
						userRoles = data.data;
						deferred.resolve(userRoles);
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.hexToRgb = function(hex) {
			// If nothing comes end, then send nothing out.
			if (typeof hex === "undefined") {
				return undefined;
			}

			var hexColours = [];

			if (hex.charAt(0) === "#") {
				hex = hex.substr(1);
			}

			if (hex.length === 6) {
				hexColours.push(hex.substr(0, 2));
				hexColours.push(hex.substr(2, 2));
				hexColours.push(hex.substr(4, 2));
			} else if (hex.length === 3) {
				hexColours.push(hex.substr(0, 1) + hex.substr(0, 1));
				hexColours.push(hex.substr(1, 1) + hex.substr(1, 1));
				hexColours.push(hex.substr(2, 1) + hex.substr(2, 1));
			} else {
				hexColours = ["00", "00", "00"];
			}

			return [(parseInt(hexColours[0], 16) / 255.0), (parseInt(hexColours[1], 16) / 255.0), (parseInt(hexColours[2], 16) / 255.0)];
		};

		obj.getRoleColor = function(role) {
			var i = 0,
				length = 0,
				roleColor;

			if (availableRoles.length > 0) {
				for (i = 0, length = availableRoles.length; i < length; i += 1) {
					if (availableRoles[i].role === role) {
						roleColor = availableRoles[i].color;
						break;
					}
				}
			}
			return roleColor;
		};

		Object.defineProperty(
			obj,
			"newPinId",
			{
				get: function () {return newPinId;}
			}
		);

		return obj;
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("login", login);

	function login() {
		return {
			restrict: "EA",
			templateUrl: "login.html",
			scope: {},
			controller: LoginCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	LoginCtrl.$inject = ["$scope", "Auth", "EventService", "serverConfig"];

	function LoginCtrl($scope, Auth, EventService, serverConfig) {
		var vm = this,
			enterKey = 13;

		/*
		 * Init
		 */
		vm.version = serverConfig.apiVersion;

		/**
		 * Attempt to login
		 *
		 * @param {Object} event
		 */
		vm.login = function(event) {
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					Auth.login(vm.user.username, vm.user.password);
				}
			}
			else {
				Auth.login(vm.user.username, vm.user.password);
			}
		};

		/*
		 * Event watch
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.USER_LOGGED_IN) {
				// Show an error message for incorrect login
				if (event.value.hasOwnProperty("error") && (event.value.error.place.indexOf("POST") !== -1)) {
					vm.errorMessage = event.value.error.message;
				}
			}
		});
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("tdrMeasure", measure);

	function measure() {
		return {
			restrict: "EA",
			templateUrl: "measure.html",
			scope: {},
			controller: MeasureCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	MeasureCtrl.$inject = ["$scope", "$element", "EventService"];

	function MeasureCtrl ($scope, $element, EventService) {
		var vm = this,
			coords = [null, null],
			screenPos,
			currentPickPoint;

		vm.axisDistance = [0.0, 0.0, 0.0];
		vm.totalDistance = 0.0;

		vm.show = false;
		vm.distance = false;
		vm.allowMove = false;

		var coordVector = null, vectorLength = 0.0;
		vm.screenPos = [0.0, 0.0];

		EventService.send(EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK, {
			callback: function(event) {
				var point = event.hitPnt;
				vm.screenPos = [event.layerX, event.layerY];

				if (vm.allowMove) {
					if (point)
					{
						coords[1] = new x3dom.fields.SFVec3f(point[0], point[1], point[2]);
						coordVector = coords[0].subtract(coords[1]);
						vm.axisDistance[0] = Math.abs(coordVector.x).toFixed(3);
						vm.axisDistance[1] = Math.abs(coordVector.y).toFixed(3);
						vm.axisDistance[2] = Math.abs(coordVector.z).toFixed(3);

						vm.totalDistance = coordVector.length().toFixed(3);

						angular.element($element[0]).css("left", (vm.screenPos[0] + 5).toString() + "px");
						angular.element($element[0]).css("top", (vm.screenPos[1] + 5).toString() + "px");

						$scope.$apply();
                        vm.show = true;
					} else {
						vm.show = false;
					}
				}
			}
		});

		$scope.$watch(EventService.currentEvent, function (event) {
		if (event.type === EventService.EVENT.VIEWER.PICK_POINT) {
				if (event.value.hasOwnProperty("position")) {
					// First click, if a point has not been clicked before
					currentPickPoint = event.value.position;
					if (coords[1] === null || coords[0] === null) {
						vm.show = true;
						vm.allowMove = true;
						coords[0] = currentPickPoint;
					}
					else if (vm.allowMove) {
                        vm.show = true;
						vm.allowMove = false;
					} else {
						coords[0] = currentPickPoint;
						coords[1] = null;
						vm.allowMove = true;
					}
				}
			}
		});
	}
}());

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

var Oculus = {};

(function() {
	"use strict";

	Oculus = function(viewer) {
		var self = this;

		this.leftTex	= null;
		this.rightTex	= null;

		this.lastW		= null;
		this.lastH		= null;

		this.vrHMD		= null;
		this.vrSensor	= null;

		this.IPD		= 0.01;

		this.enabled	= false;

		this.oculus		= null;

		this.viewer		= viewer;
		
		this.addInstructions = function() {
			
			var instruction = document.createElement("div");
			instruction.setAttribute("id", "instructionCircle");
			self.viewer.element.appendChild(instruction);
	
			instruction.addEventListener("click", function() {
				self.viewer.switchFullScreen(self.vrHMD);
				instruction.style.display = "none";
			});
			
			var instructionImage = document.createElement("img");
			instructionImage.setAttribute("id", "instructionImage");
			instructionImage.setAttribute("src", "public/plugins/walkthroughVr/instruction_trans.gif");
			instruction.appendChild(instructionImage);
			
			var instructionOK = document.createElement("div");
			instructionOK.setAttribute("id", "instructionOK");
			instructionOK.textContent = "OK";		
			instruction.appendChild(instructionOK);
		};

		this.switchVR = function()
		{
			var scene = self.viewer.scene;

			if (!this.enabled)
			{
				self.addInstructions();
				
				// Add oculus eyes
				var eyeGroup = document.createElement("group");
				eyeGroup.setAttribute("def", "oculus");
				eyeGroup.setAttribute("render", "false");
				this.oculus = eyeGroup;

				var leftEye = document.createElement("group");
				leftEye.setAttribute("def", "left");
				//leftEye.setAttribute("render", "false");
				eyeGroup.appendChild(leftEye);

				var leftShape = document.createElement("shape");
				leftShape.setAttribute("isPickable", "false");
				leftEye.appendChild(leftShape);

				var leftApp = document.createElement("appearance");
				leftShape.appendChild(leftApp);

				self.leftTex = document.createElement("renderedtexture");
				self.leftTex.setAttribute("id", "rtLeft");
				self.leftTex.setAttribute("stereoMode", "LEFT_EYE");
				self.leftTex.setAttribute("update", "ALWAYS");
				self.leftTex.setAttribute("oculusRiftVersion", "2");
				//leftTex.setAttribute("dimensions", "980 1080 3");
				self.leftTex.setAttribute("repeatS", "false");
				self.leftTex.setAttribute("repeatT", "false");
				self.leftTex.setAttribute("interpupillaryDistance", this.IPD);
				leftApp.appendChild(self.leftTex);

				var leftVP = document.createElement("viewpoint");
				if (self.viewer.getCurrentViewpoint() !== null) {
					leftVP.setAttribute("use", self.viewer.getCurrentViewpoint().getAttribute("id"));
				}
				leftVP.setAttribute("containerfield", "viewpoint");
				leftVP.textContent = " ";
				self.leftTex.appendChild(leftVP);

				var leftBground = document.createElement("background");
				leftBground.setAttribute("use", "viewer_bground");
				leftBground.setAttribute("containerfield", "background");
				leftBground.textContent = " ";
				self.leftTex.appendChild(leftBground);

				var leftScene = document.createElement("group");
				leftScene.setAttribute("USE", "root");
				leftScene.setAttribute("containerfield", "scene");
				self.leftTex.appendChild(leftScene);

				var leftPlane = document.createElement("plane");
				leftPlane.setAttribute("solid", "false");
				leftShape.appendChild(leftPlane);

				// Right eye
				var rightEye = document.createElement("group");
				rightEye.setAttribute("def", "right");
				//rightEye.setAttribute("render", "false");
				eyeGroup.appendChild(rightEye);

				var rightShape = document.createElement("shape");
				rightShape.setAttribute("isPickable", "false");
				rightEye.appendChild(rightShape);

				var rightApp = document.createElement("appearance");
				rightShape.appendChild(rightApp);

				self.rightTex = document.createElement("renderedtexture");
				self.rightTex.setAttribute("id", "rtRight");
				self.rightTex.setAttribute("stereoMode", "RIGHT_EYE");
				self.rightTex.setAttribute("update", "ALWAYS");
				self.rightTex.setAttribute("oculusRiftVersion", "2");
				//rightTex.setAttribute("dimensions", "980 1080 3");
				self.rightTex.setAttribute("repeatS", "false");
				self.rightTex.setAttribute("repeatT", "false");
				self.rightTex.setAttribute("interpupillaryDistance", this.IPD);
				rightApp.appendChild(self.rightTex);

				var rightPlane = document.createElement("plane");
				rightPlane.setAttribute("solid", "false");
				rightShape.appendChild(rightPlane);

				var rightVP = document.createElement("viewpoint");
				if (self.viewer.getCurrentViewpoint() !== null) {
					rightVP.setAttribute("use", self.viewer.getCurrentViewpoint().getAttribute("id"));
				}
				rightVP.setAttribute("containerfield", "viewpoint");
				rightVP.textContent = " ";
				self.rightTex.appendChild(rightVP);

				var rightBground = document.createElement("background");
				rightBground.setAttribute("use", "viewer_bground");
				rightBground.setAttribute("containerfield", "background");
				rightBground.textContent = " ";
				self.rightTex.appendChild(rightBground);

				var rightScene = document.createElement("group");
				rightScene.setAttribute("use", "root");
				rightScene.setAttribute("containerfield", "scene");
				rightScene.textContent = " ";
				self.rightTex.appendChild(rightScene);

				scene.appendChild(eyeGroup);

				// Should this be in a setTimeout
				leftShape._x3domNode._graph.needCulling = false;
				rightShape._x3domNode._graph.needCulling = false;
				eyeGroup._x3domNode._graph.needCulling = false;
				//leftPlane._x3domNode._graph.needCulling = false;
				//rightPlane._x3domNode._graph.needCulling = false;

				//self.viewer.setGyroscopeStart();
				self.startVR();

				// Enable EXAMINE mode for compatibility with gyro
				self.oldNavMode = self.viewer.nav.getAttribute("type");
				self.viewer.nav.setAttribute("type", "EXAMINE");
				
				self.viewer.getScene()._x3domNode._nameSpace.doc.canvas.isMulti = true;

				this.oldNavMode = self.viewer.currentNavMode;
				self.viewer.setNavMode(self.viewer.NAV_MODES.FLY);
				
				this.enabled = true;
				
				self.viewer.removeLogo();
			} else {
				this.oculus.parentNode.removeChild(this.oculus);

				this.leftTex	= null;
				this.rightTex	= null;

				this.lastW		= null;
				this.lastH		= null;

				//this.vrHMD		= null;
				//this.vrSensor	= null;

				this.IPD		= 0.0064;

				this.enabled	= false;

				this.oculus		= null;

				this.enabled = false;

				self.viewer.runtime.enterFrame = function () {};
				self.viewer.runtime.exitFrame = function () {};

				self.viewer.getViewArea().skipSceneRender = null;

				self.viewer.nav.setAttribute("type", self.oldNavMode);
				self.oldNavMode = null;
				
				self.viewer.getScene()._x3domNode._nameSpace.doc.canvas.isMulti = false;
				self.viewer.createBackground();
				self.viewer.setNavMode(this.oldNavMode);
				
				self.viewer.addLogo();
			}
		};

		this.startVR = function () {
			self.lastW		= self.viewer.runtime.getWidth();
			self.lastH		= self.viewer.runtime.getHeight();

			self.viewpoint	= self.viewer.viewpoint;

			self.viewer.getViewArea().skipSceneRender = true;

			self.gyroOrientation = null;

			// This code handles gyroscopic sensors on a phone
			if(window.DeviceOrientationEvent){
				window.addEventListener("deviceorientation", function (event) {
					self.gyroOrientation = event;
				}, false);
			}

			self.viewer.runtime.enterFrame = function () {
				if (self.gyroOrientation)
				{
					self.viewer.gyroscope(
						self.gyroOrientation.alpha,
						self.gyroOrientation.beta,
						self.gyroOrientation.gamma
					);

					self.gyroOrientation = null;
				} else if (self.vrSensor) {
					var state = self.vrSensor.getState();
					var h     = state.orientation;

					if (h)
					{
						var vp     = self.viewer.getCurrentViewpoint()._x3domNode;
						var flyMat = vp.getViewMatrix().inverse();
						var q      = new x3dom.fields.Quaternion(h.x, h.y, h.z, h.w);

						flyMat.setRotate(q);
						vp.setView(flyMat.inverse());
					}
				}
			};

			self.viewer.runtime.exitFrame = function ()
			{

				var w = self.viewer.runtime.getWidth() * (window.devicePixelRatio ? window.devicePixelRatio : 1);
				var h = self.viewer.runtime.getHeight() * (window.devicePixelRatio ? window.devicePixelRatio : 1);

				
				// The image should be split across the longest dimension of the screen
				var rotate = (h > w);

				if (rotate)
				{
					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,h / 2.0,w,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.leftTex._x3domNode._webgl.fbo.tex);

					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w,h / 2.0);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rightTex._x3domNode._webgl.fbo.tex);
				} else {
					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w / 2.0,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.leftTex._x3domNode._webgl.fbo.tex);

					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(w / 2,0,w / 2,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rightTex._x3domNode._webgl.fbo.tex);
				}
				
				if (w !== self.lastW || h !== self.lastH)
				{
					var half = 0;

					half = Math.round(w / 2);

					self.leftTex.setAttribute("dimensions", half + " " + h + " 4");
					self.rightTex.setAttribute("dimensions", half + " " + h + " 4");

					self.lastW = w;
					self.lastH = h;
				}


				self.viewer.runtime.triggerRedraw();

			};
		};

		this.changeIPD = function(newIPD) {
			self.leftTex.setAttribute("interpupillaryDistance", newIPD);
			self.rightTex.setAttribute("interpupillaryDistance", newIPD);
		};

		this.peturbIPD = function(peturbation) {
			var oldDistance = parseFloat(self.leftTex.getAttribute("interpupillaryDistance"));
			this.changeIPD(oldDistance + peturbation);
		};

		this.exitFullscreen = function() {
			//self.instruction.style.display = "none";			
			/*
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && self.enabled) {
				self.switchVR();
			}
			*/
		};

		this.createFullscreenExit = function () {
			document.addEventListener("webkitfullscreenchange", self.exitFullscreen, false);
			document.addEventListener("mozfullscreenchange", self.exitFullscreen, false);
			document.addEventListener("fullscreenchange", self.exitFullscreen, false);
			document.addEventListener("MSFullscreenChange", self.exitFullscreen, false);
		};

		this.init = function(vrdevs) {
			var i;

			// First, find a HMD -- just use the first one we find
			for (i = 0; i < vrdevs.length; ++i) {
				if (vrdevs[i] instanceof HMDVRDevice) {
					self.vrHMD = vrdevs[i];
					break;
				}
			}

			if (!self.vrHMD) {
				return;
			}

			// Then, find that HMD"s position sensor
			for (i = 0; i < vrdevs.length; ++i) {
				if (vrdevs[i] instanceof PositionSensorVRDevice && vrdevs[i].hardwareUnitId === self.vrHMD.hardwareUnitId) {
					self.vrSensor = vrdevs[i];
					break;
				}
			}

			if (!self.vrHMD || !self.vrSensor) {
				console.error("No HMD found");
				return;
			}
		};

		if (navigator.getVRDevices) {
			navigator.getVRDevices().then(this.init);
		}

		this.createFullscreenExit();
		//http://blog.tojicode.com/2014/07/bringing-vr-to-chrome.html
		//http://blog.bitops.com/blog/2014/08/20/updated-firefox-vr-builds/
	};
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardAdd", panelCardAdd);

	function panelCardAdd() {
		return {
			restrict: 'EA',
			templateUrl: 'panelCardAdd.html',
			scope: {
				showAdd: "="
			},
			controller: PanelCardAddCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardAddCtrl.$inject = [];

	function PanelCardAddCtrl() {
		var vm = this;

		vm.add = function () {
			vm.showAdd = true;
		};
	}
}());

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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panelCard", panelCard);

    function panelCard() {
        return {
            restrict: "E",
            templateUrl: "panelCard.html",
            scope: {
				account: "=",
				project: "=",
				branch: "=",
				revision: "=",
                position: "=",
                contentData: "=",
				onHeightRequest: "&",
				onShowFilter: "&"
            },
            controller: PanelCardCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PanelCardCtrl.$inject = ["$scope", "$element", "$compile", "EventService"];

    function PanelCardCtrl($scope, $element, $compile, EventService) {
        var vm = this,
            filter = null,
			contentHeight,
			options = angular.element($element[0].querySelector('#options')),
			currentHighlightedOptionIndex = -1;

		/*
		 * Init
		 */
        vm.showHelp = false;
		vm.showFilter = false;
		vm.visibleStatus = false;
		vm.showClearFilterButton = false;
		vm.showAdd = false;

		/*
		 * Watch type on contentData to create content and tool bar options
		 */
		$scope.$watch("vm.contentData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				createCardContent();
				createToolbarOptions();
				createFilter();
				createAdd();
				vm.statusIcon = vm.contentData.icon;
			}
		});

		/*
		 * Watch show on contentData to toggle elements off
		 */
		$scope.$watch("vm.contentData.show", function (newValue) {
			if ((angular.isDefined(newValue) && !newValue)) {
				vm.hideItem();
			}
		});

		/*
		 * Change toolbar options when toggling add functionality
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue)) {
				toggleAdd(newValue);
			}
		});

		/*
		 * Watch for card in edit mode
		 */
		$scope.$watch("vm.showEdit", function (newValue) {
			if (angular.isDefined(newValue)) {
				EventService.send(EventService.EVENT.PANEL_CARD_EDIT_MODE, {on: newValue, type: vm.contentData.type});
			}
		});

		/*
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			if ((event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) && (vm.contentData.type === "issues")) {
				toggleAdd(event.value.on);
				// Reset option highlight if the issue add is cancelled
				if (!event.value.on) {
					vm.contentData.options[currentHighlightedOptionIndex].color = "";
					currentHighlightedOptionIndex = -1;
				}
			}
			else if ((event.type === EventService.EVENT.PANEL_CARD_ADD_MODE) ||
					 (event.type === EventService.EVENT.PANEL_CARD_EDIT_MODE)) {
				// Only one card can be in modify mode at a time
				if (event.value.on && (event.value.type !== vm.contentData.type)) {
					vm.hideItem();
				}
			}
			else if ((event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) && (vm.contentData.type === "issues")) {
				highlightOption(event.value);
			}
		});

		/*
		 * Watch for content item to hide itself
		 */
		$scope.$watch("vm.hideSelectedItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.statusIcon = vm.contentData.icon;
			}
		});

		/**
		 * A content item is requesting a height change
		 * @param height
		 */
		vm.onContentHeightRequest = function (height) {
			contentHeight = height;
			vm.onHeightRequest({contentItem: vm.contentData, height: contentHeight});
		};

		/**
		 * Content wants to show an individual item
		 */
		vm.showItem = function () {
			vm.statusIcon = "arrow_back";
			vm.hideSelectedItem = false; // So that a change to this value is propagated
		};

		/**
		 * Content wants to show it's main content
		 */
		vm.hideItem = function () {
			vm.statusIcon = vm.contentData.icon;
			vm.hideSelectedItem = true;
		};

		/**
		 * Create the card content
		 */
		function createCardContent () {
			var i, length,
				content = angular.element($element[0].querySelector('#content')),
				contentItem,
				element;

			element =
				"<" + vm.contentData.type + " " +
				"show='vm.contentData.show' " +
				"on-content-height-request='vm.onContentHeightRequest(height)' " +
				"on-show-item='vm.showItem()' " +
				"hide-item='vm.hideSelectedItem' " +
				"show-edit='vm.showEdit' " +
				"account='vm.account' " +
				"project='vm.project' " +
				"branch='vm.branch' " +
				"revision='vm.revision' ";

			// Only add attributes when needed
			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					switch (vm.contentData.options[i].type) {
						case "filter":
							element += "filter-text='vm.filterText' ";
							break;
						case "visible":
							element += "visible='vm.visible' ";
							break;
						case "menu":
							element += "selected-menu-option='vm.selectedMenuOption' ";
							break;
					}
				}
			}
			if (vm.contentData.hasOwnProperty("add") && vm.contentData.add) {
				element += "show-add='vm.showAdd' can-add='vm.canAdd'";
			}

			element += "></" + vm.contentData.type + ">";

			contentItem = angular.element(element);
			content.append(contentItem);
			$compile(contentItem)($scope);
		}

		/**
		 * Create the tool bar options
		 */
		function createToolbarOptions () {
			var i, length,
				option, optionElement;

			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					option = null;
					optionElement = "<panel-card-option-" + vm.contentData.options[i].type;
					optionElement += " id='panal_card_option_" + vm.contentData.options[i].type + "'";
					optionElement += " ng-if='vm.contentData.options[" + i + "].visible'";
					vm.contentData.options[i].color = "";
					optionElement += " style='color:{{vm.contentData.options[" + i + "].color}}'";

					switch (vm.contentData.options[i].type) {
						case "filter":
							optionElement += " show-filter='vm.showFilter'";
							break;

						case "visible":
							optionElement += " visible='vm.visible'";
							break;

						case "menu":
							optionElement += "menu='vm.contentData.menu' selected-menu-option='vm.selectedMenuOption'";
							break;

						case "close":
							optionElement += "show='vm.contentData.show'";
							break;
					}

					optionElement += "><panel-card-option-" + vm.contentData.options[i].type + ">";
					option = angular.element(optionElement);

					// Create the element
					if (option !== null) {
						options.prepend(option);
						$compile(option)($scope);
					}
				}
			}
		}

		/**
		 * Add tool bar options
		 */
		function showToolbarOptions (addOptions, show) {
			var i, length;
			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				if (addOptions.indexOf(vm.contentData.options[i].type) !== -1) {
					vm.contentData.options[i].visible = show;
				}
			}
		}

		/**
		 * Create the filter element
		 */
		function createFilter () {
			var i, length,
				filterContainer = angular.element($element[0].querySelector('#filterContainer')),
				filter;
			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					if (vm.contentData.options[i].type === "filter") {
						filter = angular.element(
							"<panel-card-filter show-filter='vm.showFilter' filter-text='vm.filterText'></panel-card-filter>"
						);
						filterContainer.append(filter);
						$compile(filter)($scope);
						break;
					}
				}
			}
		}

		/**
		 * Create the add button
		 */
		function createAdd () {
			var panelCardContainer = angular.element($element[0].querySelector('#panelCardContainer')),
				add;
			if (vm.contentData.hasOwnProperty("add") && vm.contentData.add) {
				add = angular.element(
					"<panel-card-add show-add='vm.showAdd' ng-if='vm.canAdd'></panel-card-add>"
				);
				panelCardContainer.append(add);
				$compile(add)($scope);
			}
		}

		/**
		 * Handle adding content
		 * 
		 * @param {Boolean} on
         */
		function toggleAdd (on) {
			if (on) {
				if (vm.contentData.type === "issues") {
					showToolbarOptions(["filter", "menu"], false);
					showToolbarOptions(["pin", "scribble", "erase"], true);
				}
				EventService.send(EventService.EVENT.PANEL_CARD_ADD_MODE, {on: true, type: vm.contentData.type});
			}
			else {
				if (vm.contentData.type === "issues") {
					showToolbarOptions(["pin", "scribble", "erase"], false);
					showToolbarOptions(["filter", "menu"], true);
				}
				EventService.send(EventService.EVENT.PANEL_CARD_ADD_MODE, {on: false});
			}
		}

		/**
		 * Highlight a toolbar option
		 * @param option
		 */
		function highlightOption (option) {
			var i, length;

			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					if (vm.contentData.options[i].type === option) {
						if ((currentHighlightedOptionIndex !== -1) && (currentHighlightedOptionIndex !== i)) {
							vm.contentData.options[currentHighlightedOptionIndex].color = "";
							currentHighlightedOptionIndex = i;
							vm.contentData.options[i].color = "#FF9800";
						}
						else {
							currentHighlightedOptionIndex = i;
							vm.contentData.options[i].color = "#FF9800";
						}
						break;
					}
				}
			}
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardFilter", panelCardFilter);

	function panelCardFilter() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardFilter.html',
			scope: {
				showFilter: "=",
				filterText: "="
			},
			controller: PanelCardFilterCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardFilterCtrl.$inject = ["$scope", "$timeout", "$element"];

	function PanelCardFilterCtrl ($scope, $timeout, $element) {
		var vm = this,
			filterTimeout = null,
			filterInput;

		/**
		 * Reset the filter text
		 */
		vm.clearFilter = function () {
			vm.filterInputText = "";
			filterInput.focus();
		};

		/*
		 * Watch the filter input text
		 */
		$scope.$watch("vm.filterInputText", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (filterTimeout !== null) {
					$timeout.cancel(filterTimeout);
				}
				filterTimeout = $timeout(function() {
					vm.filterText = vm.filterInputText;
					vm.showClearFilterButton = (vm.filterInputText !== "");
				}, 500);
			}
		});

		/*
		 * Watch the showing of the filter and set the focus to it
		 */
		$scope.$watch("vm.showFilter", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				$timeout(function () {
					filterInput = angular.element($element[0].querySelector("#panelCardFilterInput"));
					filterInput.focus();
				});
			}
		});
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionAdd", panelCardOptionAdd);

	function panelCardOptionAdd() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionAdd.html',
			scope: {
				showAdd: "="
			},
			controller: PanelCardOptionAddCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function PanelCardOptionAddCtrl() {
		var vm = this;

		vm.showAddElement = function (event) {
			event.stopPropagation();
			vm.showAdd = true;
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionClose", panelCardOptionClose);

	function panelCardOptionClose() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionClose.html',
			scope: {
				show: "="
			},
			controller: panelCardOptionCloseCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function panelCardOptionCloseCtrl() {
		var vm = this;

		vm.hide = function () {
			vm.show = false;
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panelCardOptionErase", panelCardOptionErase);

    function panelCardOptionErase() {
        return {
            restrict: 'E',
            templateUrl: 'panelCardOptionErase.html',
            scope: {},
            controller: PanelCardOptionEraseCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCardOptionEraseCtrl.$inject = ["EventService"];

    function PanelCardOptionEraseCtrl (EventService) {
        var vm = this;

        vm.setupEraseMode = function() {
            EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, "erase");
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionFilter", panelCardOptionFilter);

	function panelCardOptionFilter() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionFilter.html',
			scope: {
				showFilter: "="
			},
			controller: PanelCardOptionFilterCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function PanelCardOptionFilterCtrl() {
		var vm = this;

		vm.toggleFilter = function (event) {
			event.stopPropagation();
			vm.showFilter = !vm.showFilter;
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionMenu", panelCardOptionMenu);

	function panelCardOptionMenu() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionMenu.html',
			scope: {
				menu: "=",
				selectedMenuOption: "="
			},
			controller: PanelCardOptionMenuCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardOptionMenuCtrl.$inject = ["$timeout"];

	function PanelCardOptionMenuCtrl ($timeout) {
		var vm = this,
			currentSortIndex;

		/**
		 * Handle a menu selection
		 *
		 * @param {Number} index
		 */
		vm.menuItemSelected = function (index) {
			if (vm.menu[index].hasOwnProperty("toggle")) {
				if (vm.menu[index].toggle) {
					vm.menu[index].selected = !vm.menu[index].selected;
					vm.selectedMenuOption = vm.menu[index];
				}
				else {
					if (index !== currentSortIndex) {
						if (angular.isDefined(currentSortIndex)) {
							vm.menu[currentSortIndex].selected = false;
							vm.menu[currentSortIndex].firstSelected = false;
							vm.menu[currentSortIndex].secondSelected = false;
						}
						currentSortIndex = index;
						vm.menu[currentSortIndex].selected = true;
						vm.menu[currentSortIndex].firstSelected = true;
					}
					else {
						vm.menu[currentSortIndex].firstSelected = !vm.menu[currentSortIndex].firstSelected;
						vm.menu[currentSortIndex].secondSelected = !vm.menu[currentSortIndex].secondSelected;
					}
					vm.selectedMenuOption = vm.menu[currentSortIndex];
				}
			}
			else {
				vm.selectedMenuOption = vm.menu[index];
			}

			// 'Reset' vm.selectedMenuOption so that selecting the same option can be registered down the line
			$timeout(function () {
				vm.selectedMenuOption = undefined;
			});
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panelCardOptionPin", panelCardOptionPin);

    function panelCardOptionPin() {
        return {
            restrict: 'E',
            templateUrl: 'panelCardOptionPin.html',
            scope: {},
            controller: PanelCardOptionPinCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCardOptionPinCtrl.$inject = ["EventService"];

    function PanelCardOptionPinCtrl (EventService) {
        var vm = this;

        vm.setupPinMode = function() {
            EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, "pin");
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionPrint", panelCardOptionPrint);

	function panelCardOptionPrint() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionPrint.html',
			scope: {
				account: "=",
				project: "="
			},
			controller: PanelCardOptionPrintCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardOptionPrintCtrl.$inject = ["$window", "serverConfig"];

	function PanelCardOptionPrintCtrl ($window, serverConfig) {
		var vm = this;

		vm.doPrint = function(event) {
			event.stopPropagation();
			$window.open(serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.project + "/issues.html"), "_blank");
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panelCardOptionScribble", panelCardOptionScribble);

    function panelCardOptionScribble() {
        return {
            restrict: 'E',
            templateUrl: 'panelCardOptionScribble.html',
            scope: {},
            controller: PanelCardOptionScribbleCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCardOptionScribbleCtrl.$inject = ["EventService"];

    function PanelCardOptionScribbleCtrl (EventService) {
        var vm = this;

        vm.setupScribbleMode = function() {
            EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, "scribble");
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionVisible", panelCardOptionVisible);

	function panelCardOptionVisible() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionVisible.html',
			scope: {
				visible: "="
			},
			controller: PanelCardOptionVisibleCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function PanelCardOptionVisibleCtrl() {
		var vm = this;

		vm.icon = "visibility";

		vm.toggleVisible = function (event) {
			event.stopPropagation();
			vm.visible = !vm.visible;
			vm.icon = vm.visible ? "visibility" : "visibility_off";
		};
	}
}());

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
        .directive("panel", panel);

    function panel () {
        return {
            restrict: "E",
            templateUrl: "panel.html",
            scope: {
				account:  "=",
				project:  "=",
				branch:   "=",
				revision: "=",				
                position: "@"
            },
            controller: PanelCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PanelCtrl.$inject = ["$scope", "$window", "$timeout", "EventService"];

    function PanelCtrl ($scope, $window, $timeout, EventService) {
        var vm = this,
			panelTopBottomGap = 55,
			maxHeightAvailable = $window.innerHeight - panelTopBottomGap,
			itemGap = 20,
			panelToolbarHeight = 40,
			contentItemsShown = [];

		/*
		 * Init
		 */
		vm.contentItems = [];
        vm.showPanel = true;
		vm.window = $window;
		vm.activate = true;

		/*
		 * Watch for events
		 */
        $scope.$watch(EventService.currentEvent, function (event) {
			var i;
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
				vm.contentItems = (event.value[vm.position]);
				setupShownCards();
				hideLastItemGap();
				setupContentItemsWatch();
			}
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                vm.showPanel = !vm.showPanel;
            }
        });

		/**
		 * The last card should not have a gap so that scrolling in resized window works correctly
		 */
		function hideLastItemGap () {
			var i, lastFound = false;

			for (i = (vm.contentItems.length - 1); i >= 0; i -= 1) {
				if (vm.contentItems[i].show) {
					if (!lastFound) {
						vm.contentItems[i].showGap = false;
						lastFound = true;
					} else {
						vm.contentItems[i].showGap = true;
					}
				}
			}
		}

		/*
		 * Mouse down
		 */
		angular.element(document).bind('mousedown', function (event) {
			// If we have clicked on a canvas, we are probably moving the model around
			if (event.target.tagName === "CANVAS")
			{
				vm.activate = false;
				$scope.$apply();
			}
		});

		/*
		 * Mouse up
		 */
		angular.element(document).bind('mouseup', function () {
			vm.activate = true;
			$scope.$apply();
		});

		/**
		 * Panel toggle button clicked
		 *
		 * @param contentType
		 */
		vm.buttonClick = function (contentType) {
			var i, j, length, contentItem;

			// Get the content item
            for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
                if (contentType === vm.contentItems[i].type) {
					contentItem = vm.contentItems[i];

					// Toggle panel show and update number of panels showing count
                    vm.contentItems[i].show = !vm.contentItems[i].show;

					// Resize any shown panel contents
					if (vm.contentItems[i].show) {
						contentItemsShown.push(vm.contentItems[i]);
						calculateContentHeights();
					}
					else {
						for (j = (contentItemsShown.length - 1); j >= 0; j -= 1) {
							if (contentItemsShown[j].type === contentType) {
								contentItemsShown.splice(j, 1);
							}
						}
						vm.contentItems[i].showGap = false;
						calculateContentHeights();
					}
					break;
                }
            }

			hideLastItemGap();
        };

		/**
		 * A panel content is requesting a height change - change the heights of any shown panels
		 *
		 * @param {Object} contentItem
		 * @param {Number} height
		 */
		vm.heightRequest = function (contentItem, height) {
			contentItem.requestedHeight = height; // Keep a note of the requested height
			contentItem.height = height; // Initially set the height to the requested height
			calculateContentHeights();
		};

		/**
		 * Start the recursive calculation of the content heghts
		 */
		function calculateContentHeights() {
			var tempContentItemsShown = angular.copy(contentItemsShown);
			assignHeights(maxHeightAvailable, tempContentItemsShown, null);
			$timeout(function () {
				$scope.$apply();
			});
		}

		/**
		 * Recursively calculate the heights for each content item
		 *
		 * @param {Number} heightAvailable
		 * @param {Array} contentItems
		 * @param {Array} previousContentItems
		 */
		function assignHeights(heightAvailable, contentItems, previousContentItems) {
			var i,
				availableHeight = heightAvailable,
				maxContentItemHeight = (availableHeight - (panelToolbarHeight * contentItems.length) - (itemGap * (contentItems.length - 1))) / contentItems.length,
				prev = null,
				contentItem;

			if (Array.isArray(previousContentItems) && (previousContentItems.length === contentItems.length)) {
				// End the recurse by dividing out the remaining space to remaining content
				for (i = (contentItems.length - 1); i >= 0; i-= 1) {
					contentItem = getContentItemShownFromType(contentItems[i].type);
					// Flexible content shouldn't have a size smaller than its minHeight
					// or a requested height that is less than the minHeight
					if (maxContentItemHeight < contentItem.minHeight) {
						if (contentItem.requestedHeight < contentItem.minHeight) {
							contentItem.height = contentItem.requestedHeight;
						}
						else {
							contentItem.height = contentItem.minHeight;
							availableHeight -= contentItem.height + panelToolbarHeight + itemGap;
							contentItems.splice(i, 1);
							assignHeights(availableHeight, contentItems, prev);
						}
					}
					else {
						contentItem.height = maxContentItemHeight;
					}
				}
			}
			else {
				// Let content have requested height if less than max available for each
				prev = angular.copy(contentItems);
				for (i = (contentItems.length - 1); i >= 0; i-= 1) {
					if ((contentItems[i].requestedHeight < maxContentItemHeight) ||
						(contentItems[i].fixedHeight)) {
						contentItem = getContentItemShownFromType(contentItems[i].type);
						contentItem.height = contentItems[i].requestedHeight;
						availableHeight -= contentItem.height + panelToolbarHeight + itemGap;
						contentItems.splice(i, 1);
					}
				}

				if (contentItems.length > 0) {
					assignHeights(availableHeight, contentItems, prev);
				}
			}
		}

		/**
		 * Get the shown content item with the passed type
		 *
		 * @param type
		 * @returns {Object}
		 */
		function getContentItemShownFromType (type) {
			var i, length;
			for (i = 0, length = contentItemsShown.length; i < length; i += 1) {
				if (contentItemsShown[i].type === type) {
					return contentItemsShown[i];
				}
			}
		}

		/**
		 * Setup the cards to show
		 */
		function setupShownCards () {
			var i, length;

			contentItemsShown = [];
			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show) {
					contentItemsShown.push(vm.contentItems[i]);
				}
			}
		}

		/*
		 * Watch vm.contentItems for any cards shown or hidden
		 */
		function setupContentItemsWatch() {
			var i, length;

			$scope.$watch("vm.contentItems", function (newValue, oldValue) {
				for (i = 0, length = newValue.length; i < length; i += 1) {
					if (newValue[i].show !== oldValue[i].show) {
						setupShownCards();
						hideLastItemGap();
						break;
					}
				}
			}, true);
		}

		/*
		 * Watch for screen resize
		 */
		angular.element($window).bind("resize", function() {
			maxHeightAvailable = $window.innerHeight - panelTopBottomGap;
			calculateContentHeights();
		});
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("passwordChange", passwordChange);

    function passwordChange() {
        return {
            restrict: "E",
            scope: {
                username: "=",
                token: "="
            },
            templateUrl: "passwordChange.html",
            controller: PasswordChangeCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PasswordChangeCtrl.$inject = ["$scope", "UtilsService", "EventService"];

    function PasswordChangeCtrl ($scope, UtilsService, EventService) {
        var vm = this,
            enterKey = 13,
            promise,
            messageColour = "rgba(0, 0, 0, 0.7)",
            messageErrorColour = "#F44336";
        
        /*
         * Init
         */
        vm.passwordChanged = false;
        vm.showProgress = false;

        /*
         * Watch inputs to clear any message
         */
        $scope.$watch("vm.newPassword", function () {
            vm.message = "";
        });

        /**
         * Process forgotten password recovery
         */
        vm.passwordChange = function (event) {
            if (angular.isDefined(event)) {
                if (event.which === enterKey) {
                    doPasswordChange();
                }
            }
            else {
                doPasswordChange();
            }
        };

        /**
         * Take the user back to the login page
         */
        vm.goToLoginPage = function () {
            EventService.send(EventService.EVENT.GO_HOME);
        };

        /**
         * Do password change
         */
        function doPasswordChange() {
            if (angular.isDefined(vm.username) && angular.isDefined(vm.token)) {
                if (angular.isDefined(vm.newPassword) && (vm.newPassword !== "")) {
                    vm.messageColor = messageColour;
                    vm.message = "Please wait...";
                    vm.showProgress = true;
                    promise = UtilsService.doPut(
                        {
                            token: vm.token,
                            newPassword: vm.newPassword
                        },
                        vm.username + "/password"
                    );
                    promise.then(function (response) {
                        vm.showProgress = false;
                        if (response.status === 400) {
                            vm.messageColor = messageErrorColour;
                            vm.message = "Error changing password";
                        }
                        else {
                            vm.passwordChanged = true;
                            vm.messageColor = messageColour;
                            vm.message = "Your password has been reset. Please go to the login page.";
                        }
                    });
                }
                else {
                    vm.messageColor = messageErrorColour;
                    vm.message = "A new password must be entered";
                }
            }
        }
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("passwordForgot", passwordForgot);

    function passwordForgot() {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "passwordForgot.html",
            controller: PasswordForgotCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PasswordForgotCtrl.$inject = ["$scope", "UtilsService"];

    function PasswordForgotCtrl ($scope, UtilsService) {
        var vm = this,
            promise,
            messageColour = "rgba(0, 0, 0, 0.7)",
            messageErrorColour = "#F44336";
        
        /*
         * Init
         */
        vm.showProgress = false;

        /*
         * Watch inputs to clear any message
         */
        $scope.$watchGroup(["vm.username", "vm.email"], function () {
            vm.message = "";
        });

        /**
         * Process forgotten password recovery
         */
        vm.requestPasswordChange = function (event) {
            var enterKey = 13,
                requestChange = false;

            if (angular.isDefined(event)) {
                requestChange = (event.which === enterKey);
            }
            else {
                requestChange = true;
            }

            if (requestChange) {
                if (angular.isDefined(vm.username) && angular.isDefined(vm.email)) {
                    vm.messageColor = messageColour;
                    vm.message = "Please wait...";
                    vm.showProgress = true;
                    promise = UtilsService.doPost({email: vm.email}, vm.username + "/forgot-password");
                    promise.then(function (response) {
                        vm.showProgress = false;
                        if (response.status === 200) {
                            vm.verified = true;
                            vm.messageColor = messageColour;
                            vm.message = "Thank you. You will receive an email shortly with a link to change your password";
                        }
                        else {
                            vm.messageColor = messageErrorColour;
                            vm.message = "Error with with one or more fields";
                        }
                    });
                }
                else {
                    vm.messageColor = messageErrorColour;
                    vm.message = "All fields must be filled";
                }
            }
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("payment", payment);

	function payment() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "payment.html",
			controller: paymentCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	paymentCtrl.$inject = ["EventService"];

	function paymentCtrl (EventService) {
		var vm = this;

		vm.goToLoginPage = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("pricing", pricing);

	function pricing() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "pricing.html",
			controller: PricingCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	PricingCtrl.$inject = ["$location"];

	function PricingCtrl ($location) {
		var vm = this;

		/**
		 * Go to a sub page
		 *
		 * @param page
		 */
		vm.showPage = function (page) {
			$location.path("/" + page, "_self");
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("privacy", privacy);

	function privacy() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "privacy.html",
			controller: PrivacyCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	PrivacyCtrl.$inject = ["EventService"];

	function PrivacyCtrl (EventService) {
		var vm = this;

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("privacyText", privacyText);

	function privacyText() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "privacyText.html",
			controller: PrivacyTextCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	PrivacyTextCtrl.$inject = [];

	function PrivacyTextCtrl () {
		var vm = this;
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.factory("EventService", EventService);

	EventService.$inject = ["$timeout"];

	function EventService ($timeout) {
		var EVENT = {
			FILTER: "EVENT_FILTER",
			FULL_SCREEN_ENTER: "EVENT_FULL_SCREEN_ENTER",
			GET_ISSUE_AREA_PNG: "EVENT_GET_ISSUE_AREA_PNG",
			GLOBAL_CLICK: "EVENT_GLOBAL_CLICK",
			MEASURE_MODE: "EVENT_MEASURE_MODE",
			ISSUE_AREA_PNG: "EVENT_ISSUE_AREA_PNG",
			OBJECT_SELECTED: "EVENT_OBJECT_SELECTED",
			PIN_SELECTED: "EVENT_PIN_SELECTED",
			PANEL_CONTENT_CLICK: "EVENT_LEFT_PANEL_CONTENT_CLICK",
			PANEL_CARD_ADD_MODE: "EVENT_PANEL_CARD_ADD_MODE",
			PANEL_CARD_EDIT_MODE: "EVENT_PANEL_CARD_EDIT_MODE",
			PANEL_CONTENT_SETUP: "EVENT_PANEL_CONTENT_SETUP",
			PANEL_CONTENT_TOGGLED: "EVENT_PANEL_CONTENT_TOGGLED",
			SET_ISSUE_AREA_MODE: "EVENT_SET_ISSUE_AREA_MODE",
			SHOW_PROJECTS: "EVENT_SHOW_PROJECTS",
			SHOW_QR_CODE_READER: "EVENT_SHOW_QR_CODE_READER",
			TOGGLE_ELEMENTS: "EVENT_TOGGLE_ELEMENTS",
			TOGGLE_HELP: "EVENT_TOGGLE_HELP",
			TOGGLE_ISSUE_ADD: "EVENT_TOGGLE_ISSUE_ADD",
			TOGGLE_ISSUE_AREA: "EVENT_TOGGLE_ISSUE_AREA",
			TOGGLE_ISSUE_AREA_DRAWING: "EVENT_TOGGLE_ISSUE_AREA_DRAWING",
			WINDOW_HEIGHT_CHANGE: "EVENT_WINDOW_HEIGHT_CHANGE",
			SET_CLIPPING_PLANES: "EVENT_SET_CLIPPING_PLANES",

			// Events to control the viewer manager
			CREATE_VIEWER: "EVENT_CREATE_VIEWER",
			CLOSE_VIEWER: "EVENT_CLOSE_VIEWER",

			// Specific to the javascript viewer
			// populated by the viewer.js script
			VIEWER: VIEWER_EVENTS,

			// Ready signals
			PROJECT_SETTINGS_READY: "EVENT_PROJECT_SETTINGS_READY",

			// User logs in and out
			USER_LOGGED_IN: "EVENT_USER_LOGGED_IN",
			USER_LOGGED_OUT: "EVENT_USER_LOGGED_OUT",

			// Not authorized
			USER_NOT_AUTHORIZED: "EVENT_USER_NOT_AUTHORIZED",

			// State changes
			GO_HOME: "EVENT_GO_HOME",
			CLEAR_STATE: "EVENT_CLEAR_STATE",
			SET_STATE: "EVENT_SET_STATE",
			STATE_CHANGED: "EVENT_STATE_CHANGED"
		};

		var ERROR = {
			DUPLICATE_VIEWER_NAME: "ERROR_DUPLICATE_VIEWER_NAME"
		};

		var currentEvent = {};
		var currentError = {};

		var send = function (type, value) {
			$timeout(function() {
				if (angular.isUndefined(type))
				{
					console.trace("UNDEFINED EVENT TYPE");
				} else {
					console.log("SEND: " + type + " : " + JSON.stringify(value));
					currentEvent = {type: type, value: value};
				}
			});
		};

		var sendError = function(type, value) {
			$timeout(function() {
				if (angular.isUndefined(type))
				{
					console.trace("UNDEFINED ERROR TYPE");
				} else {
					//console.log(type + " : " + JSON.stringify(value));
					currentError = {type: type, value: value};
				}
			});
		};

		return {
			EVENT: EVENT,
			ERROR: ERROR,
			currentEvent: function() {return currentEvent;},
			currentError: function() {return currentError;},
			send: send,
			sendError: sendError
		};
	}
}());

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
        .directive("global", global);

    global.$inject = ["EventService"];

    function global(EventService) {
        return {
            restrict: "A",
            link: link
        };

        function link (scope, element) {
			/*
            element.bind('click', function (event){
                EventService.send(EventService.EVENT.GLOBAL_CLICK, event);
            });
			*/
        }
    }
}());


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

(function () {
	"use strict";

	angular.module("3drepo")
	.directive("project", project);

    function project() {
        return {
            restrict: "E",
            scope: {
				account:  "=",
				project:  "=",
				branch:   "=",
				revision: "=",
				state:    "="
			},
			templateUrl: "project.html",
            controller: ProjectCtrl,
			controllerAs: "vm",
			bindToController: true
        };
    }

	ProjectCtrl.$inject = ["$timeout", "$scope", "$element", "$compile", "EventService", "ProjectService"];

	function ProjectCtrl($timeout, $scope, $element, $compile, EventService, ProjectService) {
		var vm = this, i, length,
			panelCard = {
				left: [],
				right: []
			},
			projectUI,
			issueArea,
			issuesCardIndex = 0;

		vm.pointerEvents = "auto";

		/*
		 * Get the project element
		 */
		$timeout(function () {
			projectUI = angular.element($element[0].querySelector('#projectUI'));
		});

		panelCard.left.push({
			type: "issues",
			title: "Issues",
			show: true,
			help: "List current issues",
			icon: "place",
			menu: [
				{
					value: "print",
					label: "Print",
					selected: false,
					noToggle: true,
					icon: "fa-print",
					divider: true
				},
				{
					value: "sortByDate",
					label: "Sort by Date",
					firstSelectedIcon: "fa-sort-amount-desc",
					secondSelectedIcon: "fa-sort-amount-asc",
					toggle: false,
					selected: true,
					firstSelected: true,
					secondSelected: false
				},
				{
					value: "showClosed",
					label: "Show resolved issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				}
			],
			minHeight: 260,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true},
				{type: "filter", visible: true},
				{type: "pin", visible: false},
				{type: "erase", visible: false},
				{type: "scribble", visible: false}
			],
			add: true
		});

		 panelCard.left.push({
			 type: "tree",
			 title: "Tree",
			 show: true,
			 help: "Model elements shown in a tree structure",
			 icon: "device_hub",
			 minHeight: 80,
			 fixedHeight: false,
			 options: [
			 	{type: "filter", visible: true}
			 ]
		 });

		panelCard.left.push({
			type: "groups",
			title: "Groups",
			show: true,
			help: "groups of objects",
			icon: "view_comfy",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true}
			],
			menu: [
				{
					value: "hideAll",
					label: "Hide Groups",
					selected: false,
					toggle: true
				}
			],
			add: true
		});

		panelCard.left.push({
			type: "clip",
			title: "Clip",
			show: false,
			help: "Clipping plane",
			icon: "crop_original",
			fixedHeight: true,
			options: [
				{type: "visible", visible: true}
			]
		});

		panelCard.right.push({
			type: "docs",
			title: "Data",
			show: false,
			help: "Documents",
			icon: "content_copy",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "close", visible: true}
			]
		});

		panelCard.right.push({
			type: "building",
			title: "Building",
			show: false,
			help: "Building",
			icon: "fa-cubes",
			fixedHeight: true,
			options: [
			]
		});

		$scope.$watchGroup(["vm.account","vm.project"], function()
		{
			if (angular.isDefined(vm.account) && angular.isDefined(vm.project)) {
				// Add filtering options for the Issues card menu
				ProjectService.getRoles(vm.account, vm.project).then(function (data) {
					for (i = 0, length = data.length; i < length; i += 1) {
						panelCard.left[issuesCardIndex].menu.push(
							{
								value: "filterRole_" + data[i].role,
								label: data[i].role,
								toggle: true,
								selected: true,
								firstSelected: false,
								secondSelected: false
							}
						);
					}
				});

				ProjectService.getProjectInfo(vm.account, vm.project).then(function (data) {
					EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, {
						account: data.account,
						project: data.project,
						settings: data.settings
					});
				});
			}
		});

		$timeout(function () {
			EventService.send(EventService.EVENT.CREATE_VIEWER, {
				name: "default",
				account:  vm.account,
				project:  vm.project,
				branch:   vm.branch,
				revision: vm.revision,
				at:       StateManager.query.at,
				up:       StateManager.query.up,
				view:     StateManager.query.view
			});

			EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelCard);
		});

		/*
		 * Watch for events
		 */
		$scope.$watch(EventService.currentEvent, function (event) {
			var parent = angular.element($element[0].querySelector("#project")),
				element;

			if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA) {
				if (event.value.on) {
					issueArea = angular.element("<issue-area></issue-area>");
					if (event.value.hasOwnProperty("issue")) {
						vm.issueAreaIssue = event.value.issue;
						issueArea = angular.element("<issue-area data='vm.issueAreaIssue'></issue-area>");
					}
					else if (event.value.hasOwnProperty("type")) {
						vm.issueAreaType = event.value.type;
						issueArea = angular.element("<issue-area type='vm.issueAreaType'></issue-area>");
					}
					projectUI.prepend(issueArea);
					$compile(issueArea)($scope);
				}
				else {
					if (angular.isDefined(issueArea)) {
						issueArea.remove();
					}
				}
			}
			else if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				vm.pointerEvents = event.value.on ? "none" : "auto";
			} else if (event.type === EventService.EVENT.MEASURE_MODE) {
				if (event.value) {
					// Create measure display
					element = angular.element("<tdr-measure id='tdrMeasure'></tdr-measure>");
					parent.append(element);
					$compile(element)($scope);
				}
				else {
					// Remove measure display
					element = angular.element($element[0].querySelector("#tdrMeasure"));
					element.remove();
				}
			}
		})
	}
}());

/**
 *  Copyright (C) 2015 3D Repo Ltd
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
		.factory("ProjectService", ProjectService);

	ProjectService.$inject = ["$http", "$q", "StateManager", "serverConfig", "HttpService", "Auth"];

	function ProjectService($http, $q, StateManager, serverConfig, HttpService, Auth) {
		var state = StateManager.state;

		var getProjectInfo = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + ".json");

			return HttpService.get(serverConfig.GET_API, account + "/" + project + ".json",
				function(json) {
					deferred.resolve({
						account     : account,
						project		: project,
						name        : name,
						owner		: json.owner,
						description	: json.desc,
						type		: json.type,
						settings 	: json.properties
					});
				});
		};

		var getRoles = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/roles.json");

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRolesForProject = function () {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, state.account + "/" + state.project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(response) {
						deferred.resolve(response.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRoles = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(response) {
						deferred.resolve(response.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		function doPost(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, state.account + "/" + state.project + "/" + urlEnd),
				config = {
					withCredentials: true
				};
			$http.post(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		var createProjectSummary = function (data) {
			data.name = state.project;
			return doPost(data, "info.json");
		};

		function doGet(urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, state.account + "/" + state.project + "/" + urlEnd);
			$http.get(url).then(
				function (response) {
					deferred.resolve(response);
				},
				function () {
					deferred.resolve([]);
				});
			return deferred.promise;
		}

		var getProjectSummary = function () {
			return doGet("info.json");
		};

		return {
			getRoles: getRoles,
			getUserRolesForProject: getUserRolesForProject,
			getUserRoles: getUserRoles,
			createProjectSummary: createProjectSummary,
			getProjectSummary: getProjectSummary,
			getProjectInfo: getProjectInfo
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("viewer", viewer);

	viewer.$inject = ["EventService"];

	function viewer(EventService) {
		return {
			restrict: "E",
			scope: {
				manager: "=",
				account: "@",
				project: "@",
				branch: "@",
				revision: "@",
				name: "@",
				autoInit: "@",
				vrMode: "@",
				at: "@",
				up: "@",
				view: "@",
				eventService: "="
			},
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on('$destroy', function(){
					scope.v.viewer.destroy(); // Remove events watch
				});
			},
			controller: ViewerCtrl,
			controllerAs: "v",
			bindToController: true
		};
	}

	ViewerCtrl.$inject = ["$scope", "$q", "$http", "$element", "serverConfig", "EventService"];

	function ViewerCtrl ($scope, $q, $http, $element, serverConfig, EventService)
	{
		var v = this;

		v.initialised = $q.defer();
		v.loaded      = $q.defer();

		v.branch   = v.branch ? v.branch : "master";
		v.revision = v.revision ? v.revision : "head";

		v.pointerEvents = "auto";

		if (!angular.isDefined(v.eventService))
		{
			v.EventService = EventService;
		}

		function errCallback(errorType, errorValue)
		{
			v.eventService.sendError(errorType, errorValue);
		}

		function eventCallback(type, value)
		{
			v.eventService.send(type, value);
		}

		$scope.reload = function() {
			v.viewer.loadModel(v.account, v.project, v.branch, v.revision);
		};

		$scope.init = function() {

			v.viewer = new Viewer(v.name, $element[0], v.manager, eventCallback, errCallback);

			var options = {};
			var startLatLon = v.at && v.at.split(',');

			var view = v.view && v.view.split(',');

			view && view.forEach(function(val, i){
				view[i] = parseFloat(val);
			});

			options.view = view;

			var up = v.up && v.up.split(',');
			up && up.forEach(function(val, i){
				up[i] = parseFloat(val);
			});

			options.up = up;

			var showAll = true;

			if(startLatLon){
				showAll = false;
				options.lat = parseFloat(startLatLon[0]),
				options.lon = parseFloat(startLatLon[1]),
				options.y = parseFloat(startLatLon[2])
			}


			v.mapTile = new MapTile(v.viewer, eventCallback, options);
			v.viewer.init({
				showAll : showAll,
				plugins: {
					'mapTile': v.mapTile
				}
			});
			// TODO: Move this so that the attachment is contained
			// within the plugins themselves.
			// Comes free with oculus support and gamepad support
			v.oculus     = new Oculus(v.viewer);
			v.gamepad    = new Gamepad(v.viewer);
			v.gamepad.init();

			v.measure    = new MeasureTool(v.viewer);

			v.collision  = new Collision(v.viewer);

			$scope.reload();

			v.loaded.promise.then(function() {
				// TODO: Move this so that the attachment is contained
				// within the plugins themselves.
				// Comes free with oculus support and gamepad support
				v.oculus     = new Oculus(v.viewer);
				v.gamepad    = new Gamepad(v.viewer);

				v.gamepad.init();

				v.collision  = new Collision(v.viewer);

			});

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, v.account + "/" + v.project + ".json")).success(
				function(json, status) {
					EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, {
						account: v.account,
						project: v.project,
						settings: json.properties
				});
			});

		};

		$scope.enterVR = function() {
			v.loaded.promise.then(function() {
				v.oculus.switchVR();
			});
		};

		$scope.$watch(v.eventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.VIEWER.START_LOADING) {
					v.initialised.resolve();
				} else if (event.type === EventService.EVENT.VIEWER.LOADED) {
					v.loaded.resolve();
				} else {
					v.initialised.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.GO_HOME) {
							v.viewer.showAll();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_FULLSCREEN) {
							v.viewer.switchFullScreen(null);
						} else if (event.type === EventService.EVENT.VIEWER.ENTER_VR) {
							v.oculus.switchVR();
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK) {
							v.viewer.onViewpointChanged(event.value.callback);
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK) {
							v.viewer.onMouseMove(event.value.callback);
						} else if (event.type === EventService.EVENT.PROJECT_SETTINGS_READY) {
							if (event.value.account === v.account && event.value.project === v.project)
							{
								v.viewer.updateSettings(event.value.settings);
								v.mapTile.updateSettings(event.value.settings);
							}
						}
					});

					v.loaded.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.ADD_PIN) {
							v.viewer.addPin(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.position,
								event.value.norm,
								event.value.colours,
								event.value.viewpoint);
						} else if (event.type === EventService.EVENT.VIEWER.REMOVE_PIN) {
							v.viewer.removePin(
								event.value.id
							);
						} else if (event.type === EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR) {
							v.viewer.changePinColours(
								event.value.id,
								event.value.colours
							);
						} else if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
							v.viewer.clickPin(event.value.id);
						} else if (event.type === EventService.EVENT.VIEWER.SET_PIN_VISIBILITY) {
							v.viewer.setPinVisibility(event.value.id, event.value.visibility);
						} else if (event.type === EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES) {
							v.viewer.clearClippingPlanes();
						} else if (event.type === EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE) {
							v.viewer.addClippingPlane(
								event.value.axis,
								event.value.distance ? event.value.distance : 0,
								event.value.percentage ? event.value.percentage : 0,
								event.value.clipDirection ? event.value.clipDirection : -1);
						} else if (event.type === EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE) {
							v.viewer.moveClippingPlane(event.value.percentage);
						} else if ((event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
							v.viewer.highlightObjects(
								event.value.account,
								event.value.project,
								event.value.id ? [event.value.id] : event.value.ids,
								event.value.zoom,
								event.value.colour
							);
						} else if (event.type === EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS) {
							v.viewer.highlightObjects(
								event.value.account,
								event.value.project,
								event.value.id ? [event.value.id] : event.value.ids,
								event.value.zoom,
								event.value.colour
							);
						} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
							v.viewer.highlightObjects();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY) {
							v.viewer.switchObjectVisibility(
								event.value.account,
								event.value.project,
								event.value.visible_ids,
								event.value.invisible_ids
							);
						} else if (event.type === EventService.EVENT.VIEWER.SET_CAMERA) {
							v.viewer.setCamera(
								event.value.position,
								event.value.view_dir,
								event.value.up,
								event.value.look_at,
								angular.isDefined(event.value.animate) ? event.value.animate : true,
								event.value.rollerCoasterMode
							);
						} else if (event.type === EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT) {
							if (angular.isDefined(event.value.promise)) {
								event.value.promise.resolve(v.viewer.getCurrentViewpointInfo());
							}
						} else if (event.type === EventService.EVENT.VIEWER.SET_NAV_MODE) {
							v.manager.getCurrentViewer().setNavMode(event.value.mode);
						} else if (event.type === EventService.EVENT.MEASURE_MODE) {
							v.measure.measureMode(event.value);
						} else if (event.type === EventService.EVENT.VIEWER.UPDATE_URL){
							//console.log('update url!!');
							$location.path("/" + v.account + '/' + v.project).search({
								at: event.value.at,
								view: event.value.view,
								up: event.value.up
							});
						}
					});
				}
			}
		});

		$scope.init();

		if (angular.isDefined(v.vrMode))
		{
			$scope.enterVR();
		}
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("viewermanager", viewerManager);

	function viewerManager() {
		return {
			restrict: "E",
			controller: ViewerManagerCtrl,
			scope: true,
			templateUrl: "viewermanager.html",
			controllerAs: "vm",
			bindToController: true
		};
	}

	function ViewerManagerService($timeout, nextEventService) {
		var currentEvent = {};
		var currentError = {};

		var sendInternal = function(type, value) {
			$timeout(function() {
				currentEvent = {type:type, value: value};
			});
		};

		var send = function (type, value) {
			sendInternal(type, value);
			nextEventService.send(type, value);
		};

		var sendErrorInternal = function(type, value) {
			$timeout(function() {
				currentError = {type: type, value: value};
			});
		};

		var sendError = function(type, value) {
			sendErrorInternal(type, value);
			nextEventService.sendError(type, value);
		};

		return {
			currentEvent: function() {return currentEvent;},
			currentError: function() {return currentError;},
			send: send,
			sendInternal: sendInternal,
			sendError: sendError,
			sendErrorInternal: sendErrorInternal
		};
	}

	ViewerManagerCtrl.$inject = ["$scope", "$q", "$element", "$timeout", "EventService"];

	function ViewerManagerCtrl($scope, $q, $element, $timeout, EventService) {
		var vm = this;

		vm.manager = new ViewerManager($element[0]);
		vm.vmservice = ViewerManagerService($timeout, EventService);

		vm.viewers = {};

		$scope.manager = vm.manager;

		vm.viewerInit   = $q.defer();
		vm.viewerLoaded = $q.defer();

		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.CREATE_VIEWER) {
					// If a viewer with the same name exists already then
					// throw an error, otherwise add it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						EventService.sendError(EventService.ERROR.DUPLICATE_VIEWER_NAME, {
							name: event.value.name
						});
					} else {
						vm.viewers[event.value.name] = event.value;
					}
				} else if (event.type === EventService.EVENT.CLOSE_VIEWER) {
					// If the viewer exists in the list then delete it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						delete vm.viewers[event.value.name];
					}
				} else if (event.type === EventService.EVENT.VIEWER.READY) {
					window.viewer = vm.manager.getCurrentViewer();
				} else {
					vm.vmservice.sendInternal(event.type, event.value);
				}
			}
		});
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("registerRequest", registerRequest);

    function registerRequest() {
        return {
            restrict: "E",
            scope: {
                state: "="
            },
            templateUrl: "registerRequest.html",
            controller: RegisterRequestCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    RegisterRequestCtrl.$inject = ["$scope", "$location", "$window"];

    function RegisterRequestCtrl ($scope, $location, $window) {
        var vm = this;

        /*
         * Watch state
         */
        $scope.$watch("vm.state", function (newValue) {
            console.log(newValue);
        });

        vm.goToLoginPage = function () {
            $window.location.href = "/";
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("registerVerify", registerVerify);

    function registerVerify() {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "registerVerify.html",
            controller: RegisterVerifyCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    RegisterVerifyCtrl.$inject = ["EventService", "UtilsService", "StateManager"];

    function RegisterVerifyCtrl (EventService, UtilsService, StateManager) {
        var vm = this,
            promise,
            username = StateManager.query.username,
            token = StateManager.query.token;

        /*
         * Init
         */
        vm.verified = false;
        vm.showPaymentWait = false;
        vm.databaseName = username;

        vm.verifyErrorMessage = "Verifying. Please wait...";
        promise = UtilsService.doPost({token: token}, username + "/verify");
        promise.then(function (response) {
            if (response.status === 200) {
                vm.verified = true;
                vm.verifySuccessMessage = "Congratulations. You have successfully signed up for 3D Repo. You may now login to you account.";
            }
            else if (response.data.value === 60) {
                vm.verified = true;
                vm.verifySuccessMessage = "You have already verified your account successfully. You may now login to your account.";
            }
            else {
                vm.verifyErrorMessage = "Error with verification";
            }
        });

        vm.goToLoginPage = function () {
			EventService.send(EventService.EVENT.GO_HOME);
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("rightPanel", rightPanel);

    function rightPanel() {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "rightPanel.html",
            controller: RightPanelCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    RightPanelCtrl.$inject = ["$scope", "EventService"];

    function RightPanelCtrl ($scope, EventService) {
        var vm = this,
            addIssueMode = null,
            measureMode = false,
            highlightBackground = "#FF9800";

        /*
         * Init
         */
        vm.showPanel = true;
        vm.issueButtons = {
            "scribble": {
                label: "Scribble",
                icon: "border_color",
                background: ""
            },
            "erase": {
                label: "Erase",
                faIcon: "fa fa-eraser",
                background: ""
            },
            "pin": {
                label: "Pin",
                icon: "pin_drop",
                background: ""
            }
        };
        vm.measureBackground = "";

        /*
         * Setup event watch
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if ((event.type === EventService.EVENT.TOGGLE_ISSUE_AREA) && (!event.value.on)) {
                if (addIssueMode !== null) {
                    vm.issueButtons[addIssueMode].background = "";
                    addIssueMode = null;
                }
            }
            else if (event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) {
                if (addIssueMode !== event.value) {
                    vm.issueButtons[addIssueMode].background = "";
                    addIssueMode = event.value;
                    vm.issueButtons[addIssueMode].background = highlightBackground;
                }
            }
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                vm.showPanel = !vm.showPanel;
            }
        });

        /**
         * Set up adding an issue with scribble
         */
        vm.issueButtonClick = function (buttonType) {
            // Turn off measure mode
            if (measureMode) {
                measureMode = false;
                vm.measureBackground = "";
                EventService.send(EventService.EVENT.MEASURE_MODE, measureMode);
            }


            if (addIssueMode === null) {
                addIssueMode = buttonType;
                vm.issueButtons[buttonType].background = highlightBackground;
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: true, type: buttonType});
            }
            else if (addIssueMode === buttonType) {
                addIssueMode = null;
                vm.issueButtons[buttonType].background = "";
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
            }
            else {
                vm.issueButtons[addIssueMode].background = "";
                addIssueMode = buttonType;
                vm.issueButtons[addIssueMode].background = highlightBackground;
                EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, buttonType);
            }
        };

        vm.toggleMeasure = function () {
            // Turn off issue mode
            if (addIssueMode !== null) {
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
            }

            measureMode = !measureMode;
            vm.measureBackground = measureMode ? highlightBackground : "";
            EventService.send(EventService.EVENT.MEASURE_MODE, measureMode);
        };
    }
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("signUp", signUp);

	function signUp() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "signUp.html",
			controller: SignUpCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	SignUpCtrl.$inject = ["$location"];

	function SignUpCtrl ($location) {
		var vm = this;
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("signUpForm", signUpForm);

	function signUpForm() {
		return {
			restrict: "EA",
			templateUrl: "signUpForm.html",
			scope: {
				buttonLabel: "@"
			},
			controller: SignUpFormCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	SignUpFormCtrl.$inject = ["$scope", "$mdDialog", "$location", "serverConfig", "UtilsService"];

	function SignUpFormCtrl($scope, $mdDialog, $location, serverConfig, UtilsService) {
		var vm = this,
			enterKey = 13,
			promise;

		/*
		 * Init
		 */
		vm.newUser = {username: "", email: "", password: "", tcAgreed: false};
		vm.version = serverConfig.apiVersion;
		vm.logo = "/public/images/3drepo-logo-white.png";
		vm.captchaKey = serverConfig.captcha_client_key;
		vm.tcAgreed = false;
		vm.useReCapthca = false;
		vm.useRegister = false;
		vm.registering = false;

		/*
		 * Auth stuff
		 */
		if (serverConfig.hasOwnProperty("auth")) {
			if (serverConfig.auth.hasOwnProperty("register") && (serverConfig.auth.register)) {
				vm.useRegister = true;
				if (serverConfig.auth.hasOwnProperty("captcha") && (serverConfig.auth.captcha)) {
					vm.useReCapthca = true;
				}
			}
		}

		/*
		 * Watch changes to register fields to clear warning message
		 */
		$scope.$watch("vm.newUser", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.registerErrorMessage = "";
			}
		}, true);

		/**
		 * Attempt to register
		 *
		 * @param {Object} event
		 */
		vm.register = function(event) {
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doRegister();
				}
			}
			else {
				doRegister();
			}
		};

		vm.showTC = function () {
			vm.legalTitle = "Terms and Conditions";
			vm.legalText = "termsAndConditions";
			$mdDialog.show({
				templateUrl: "legalDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		vm.showPage = function (page) {
			$location.path("/" + page, "_self");
		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}

		/**
		 * Do the user registration
		 */
		function doRegister() {
			var data,
				allowedFormat = new RegExp("^[a-zA-Z][\\w]*$"); // English letters, numbers, underscore, not starting with number

			if ((angular.isDefined(vm.newUser.username)) &&
				(angular.isDefined(vm.newUser.email)) &&
				(angular.isDefined(vm.newUser.password))) {
				if (allowedFormat.test(vm.newUser.username)) {
					if (vm.newUser.tcAgreed) {
						data = {
							email: vm.newUser.email,
							password: vm.newUser.password
						};
						if (vm.useReCapthca) {
							data.captcha = vm.reCaptchaResponse;
						}
						vm.registering = true;
						promise = UtilsService.doPost(data, vm.newUser.username);
						promise.then(function (response) {
							if (response.status === 200) {
								vm.showPage("registerRequest");
							}
							else if (response.data.value === 62) {
								vm.registerErrorMessage = "Prove you're not a robot";
							}
							else if (response.data.value === 55) {
								vm.registerErrorMessage = "Username already in use";
							}
							else {
								vm.registerErrorMessage = response.data.message;
							}
							vm.registering = false;
							grecaptcha.reset(); // reset reCaptcha
						});
					}
					else {
						vm.registerErrorMessage = "You must agree to the terms and conditions";
					}
				}
				else {
					vm.registerErrorMessage = "Username not allowed";
				}
			}
			else {
				vm.registerErrorMessage = "Please fill all fields";
			}
		}
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("terms", terms);

	function terms() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "terms.html",
			controller: TermsCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TermsCtrl.$inject = ["EventService"];

	function TermsCtrl (EventService) {
		var vm = this;

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("termsText", termsText);

	function termsText() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "termsText.html",
			controller: TermsTextCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TermsTextCtrl.$inject = [];

	function TermsTextCtrl () {
		var vm = this;
	}
}());

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
		.directive("tree", tree);

	function tree() {
		return {
			restrict: "EA",
			templateUrl: "tree.html",
			scope: {
				account:  "=",
				project:  "=",
				branch:   "=",
				revision: "=",
				filterText: "=",
				onContentHeightRequest: "&"
			},
			controller: TreeCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TreeCtrl.$inject = ["$scope", "$timeout", "TreeService", "EventService"];

	/**
	 *
	 * @param $scope
	 * @param $timeout
	 * @param TreeService
	 * @param EventService
	 * @constructor
	 */
	function TreeCtrl($scope, $timeout, TreeService, EventService) {
		var vm = this,
			promise = null,
			i = 0,
			length = 0,
			currentSelectedNode = null,
			currentScrolledToNode = null,
			highlightSelectedViewerObject = true,
			clickedHidden = {}, // Nodes that have actually been clicked to hide
			clickedShown = {}; // Nodes that have actually been clicked to show

		/*
		 * Init
		 */
		vm.nodes = [];
		vm.showNodes = true;
		vm.showTree = true;
		vm.showFilterList = false;
		vm.currentFilterItemSelected = null;
		vm.viewerSelectedObject = null;
		vm.showProgress = true;
		vm.progressInfo = "Loading full tree structure";
		vm.onContentHeightRequest({height: 70}); // To show the loading progress
		vm.visible   = [];
		vm.invisible = [];

		/*
		 * Get all the tree nodes
		 */
		promise = TreeService.init(vm.account, vm.project, vm.branch, vm.revision);
		promise.then(function (data) {
			vm.allNodes = [];
			vm.allNodes.push(data.nodes);
			vm.nodes = vm.allNodes;
			vm.showTree = true;
			vm.showProgress = false;

			vm.idToPath = data.idToPath;
			initNodesToShow();
			setupInfiniteScroll();
			setContentHeight(vm.nodesToShow);
		});

		/**
		 * Set the content height.
		 * The height of a node is dependent on its name length and its level.
		 *
		 * @param {Array} nodesToShow
		 */
		function setContentHeight (nodesToShow) {
			var i, length,
				height = 0,
				nodeMinHeight = 42,
				maxStringLength = 35, maxStringLengthForLevel = 0,
				lineHeight = 18, levelOffset = 2;

			for (i = 0, length = nodesToShow.length; i < length ; i += 1) {
				maxStringLengthForLevel = maxStringLength - (nodesToShow[i].level * levelOffset);
				if (nodesToShow[i].hasOwnProperty("name")) {
					height += nodeMinHeight + (lineHeight * Math.floor(nodesToShow[i].name.length / maxStringLengthForLevel));
				}
				else {
					height += nodeMinHeight + lineHeight;
				}
			}
			vm.onContentHeightRequest({height: height});
		}

		/**
		 * Initialise the tree nodes to show to the first node
		 */
		function initNodesToShow () {
			vm.nodesToShow = [vm.allNodes[0]];
			vm.nodesToShow[0].level = 0;
			vm.nodesToShow[0].expanded = false;
			vm.nodesToShow[0].hasChildren = true;
			vm.nodesToShow[0].selected = false;
			/*
			// Only make the top node visible if it was not previously clicked hidden
			if (!wasClickedHidden(vm.nodesToShow[0])) {
				vm.nodesToShow[0].toggleState = "visible";
			}
			*/
			// Only make the top node visible if it does not have a toggleState
			if (!vm.nodesToShow[0].hasOwnProperty("toggleState")) {
				vm.nodesToShow[0].toggleState = "visible";
			}
			console.log(vm.nodesToShow[0]);
		}

		/**
		 * Set the toggle state of a node
		 * @param {Object} node Node to change the visibility for
		 * @param {String} visibility Visibility to change to
		 */
		vm.setToggleState = function(node, visibility)
		{
			var idx = -1;

			// TODO: This function is probably in-efficient
			if (visibility === "invisible")
			{
				if ((idx = vm.invisible.indexOf(node._id)) !== -1)
				{
					vm.invisible.splice(idx,1);
				} else {
					vm.invisible.push(node._id);
				}

				if ((idx = vm.visible.indexOf(node._id)) !== -1)
				{
					vm.visible.splice(idx, 1);
				}
			} else {
				if ((idx = vm.visible.indexOf(node._id)) !== -1)
				{
					vm.visible.splice(idx,1);
				} else {
					vm.visible.push(node._id);
				}

				if ((idx = vm.invisible.indexOf(node._id)) !== -1)
				{
					vm.invisible.splice(idx, 1);
				}

			}

			node.toggleState = visibility;
		};

		/**
		 * Expand a node to show its children.
		 * @param _id
		 */
		vm.expand = function (_id) {
			var i, length,
				j, jLength,
				numChildren = 0,
				index = -1,
				endOfSplice = false,
				numChildrenToForceRedraw = 3;

			// Find node index
			for (i = 0, length = vm.nodesToShow.length; i < length; i += 1) {
				if (vm.nodesToShow[i]._id === _id) {
					index = i;
					break;
				}
			}

			// Found
			if (index !== -1) {
				if (vm.nodesToShow[index].hasChildren) {
					console.log(vm.nodesToShow[index]);
					if (vm.nodesToShow[index].expanded) {
						// Collapse
						while (!endOfSplice) {
							if (angular.isDefined(vm.nodesToShow[index + 1]) && vm.nodesToShow[index + 1].path.indexOf(_id) !== -1) {
								vm.nodesToShow.splice(index + 1, 1);
							} else {
								endOfSplice = true;
							}
						}
					} else {
						// Expand
						numChildren = vm.nodesToShow[index].children.length;

						// If the node has a large number of children then force a redraw of the tree to get round the display problem
						if (numChildren >= numChildrenToForceRedraw) {
							vm.showNodes = false;
						}

						for (i = 0; i < numChildren; i += 1) {
							// For federation - handle node of project that cannot be viewed or has been deleted
							// That node will be below level 0 only
							if ((vm.nodesToShow[index].level === 0) &&
								vm.nodesToShow[index].children[i].hasOwnProperty("children") &&
								vm.nodesToShow[index].children[i].children[0].hasOwnProperty("status")) {
								vm.nodesToShow[index].children[i].status = vm.nodesToShow[index].children[i].children[0].status;
							}
							else {
								// Normal tree node
								vm.nodesToShow[index].children[i].expanded = false;

								/*
								 // If the child node was not clicked hidden set its toggle state to visible
								 if (!wasClickedHidden(vm.nodesToShow[index].children[i])) {
								 vm.setToggleState(vm.nodesToShow[index].children[i], "visible");
								 }
								 */
								// If the child node does not have a toggleState set it to visible
								if (!vm.nodesToShow[index].children[i].hasOwnProperty("toggleState")) {
									vm.setToggleState(vm.nodesToShow[index].children[i], "visible");
								}
								// A node should relect the state of any path relative
								else if (((vm.nodesToShow[index].children[i].toggleState === "invisible") ||
									(vm.nodesToShow[index].children[i].toggleState === "parentOfInvisible")) &&
									pathRelativeWasClickShown(vm.nodesToShow[index].children[i])) {
									vm.setToggleState(vm.nodesToShow[index].children[i], "visible");
								}
							}

							// A child node only "hasChildren", i.e. expandable, if any of it's children have a name
							vm.nodesToShow[index].children[i].level = vm.nodesToShow[index].level + 1;
							vm.nodesToShow[index].children[i].hasChildren = false;
							if (("children" in vm.nodesToShow[index].children[i]) && (vm.nodesToShow[index].children[i].children.length > 0)) {
								for (j = 0, jLength = vm.nodesToShow[index].children[i].children.length; j < jLength; j++) {
									if (vm.nodesToShow[index].children[i].children[j].hasOwnProperty("name")) {
										vm.nodesToShow[index].children[i].hasChildren = true;
										break;
									}
								}
							}

							vm.nodesToShow.splice(index + i + 1, 0, vm.nodesToShow[index].children[i]);
						}

						// Redraw the tree if needed
						if (!vm.showNodes) {
							$timeout(function () {
								vm.showNodes = true;
							});
						}
					}
					vm.nodesToShow[index].expanded = !vm.nodesToShow[index].expanded;
				}
			}

			setContentHeight(vm.nodesToShow);
		};

		/**
		 * Expand the tree and highlight the node corresponding to the object selected in the viewer.
		 * @param path
		 * @param level
		 */
		function expandToSelection(path, level) {
			var i, j, length, childrenLength, selectedId = path[path.length - 1], selectedIndex = 0, selectionFound = false;

			// Force a redraw of the tree to get round the display problem
			vm.showNodes = false;

			for (i = 0, length = vm.nodesToShow.length; i < length; i += 1) {
				if (vm.nodesToShow[i]._id === path[level]) {
					vm.nodesToShow[i].expanded = true;
					vm.nodesToShow[i].selected = false;
					childrenLength = vm.nodesToShow[i].children.length;

					if (level === (path.length - 2)) {
						selectedIndex = i;
					}

					for (j = 0; j < childrenLength; j += 1) {
						// Set child to not expanded
						vm.nodesToShow[i].children[j].expanded = false;

						if (vm.nodesToShow[i].children[j]._id === selectedId) {
							// If the selected mesh doesn't have a name highlight the parent in the tree
							// highlight the parent in the viewer
							if (vm.nodesToShow[i].children[j].hasOwnProperty("name")) {
								vm.nodesToShow[i].children[j].selected = true;
							}
							else {
								vm.selectNode(vm.nodesToShow[i]);
							}
						}
						else {
							// This will clear any previously selected node
							vm.nodesToShow[i].children[j].selected = false;
						}

						// Only set the toggle state once when the node is listed
						if (!vm.nodesToShow[i].children[j].hasOwnProperty("toggleState")) {
							vm.setToggleState(vm.nodesToShow[i].children[j], "visible");
						}

						// Determine if child node has childern
						if ("children" in vm.nodesToShow[i].children[j]) {
							vm.nodesToShow[i].children[j].hasChildren = vm.nodesToShow[i].children[j].children.length > 0;
						}
						else {
							vm.nodesToShow[i].children[j].hasChildren = false;
						}

						// Set current selected node
						if (vm.nodesToShow[i].children[j].selected) {
							selectionFound = true;
							currentSelectedNode = vm.nodesToShow[i].children[j];
						}

						// Determine if more expansion is required
						if ((level === (path.length - 2)) && !selectionFound) {
							selectedIndex += 1;
						}
						vm.nodesToShow[i].children[j].level = level + 1;
						vm.nodesToShow.splice(i + j + 1, 0, vm.nodesToShow[i].children[j]);
					}
				}
			}
			if (level < (path.length - 2)) {
				expandToSelection(path, (level + 1));
			} else if (level === (path.length - 2)) {
				vm.topIndex = selectedIndex - 2;
				// Redraw the tree
				$timeout(function () {
					vm.showNodes = true;
				});
				setContentHeight(vm.nodesToShow);
			}
		}

		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
				if ((event.value.source !== "tree") && highlightSelectedViewerObject)
				{
					var objectID = event.value.id;

					if (objectID)
					{
						var path = vm.idToPath[objectID].split("__");

						initNodesToShow();
						expandToSelection(path, 0);
					}
				}
			}
			else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
				// Remove highlight from any selected node in the tree
				if (currentSelectedNode !== null) {
					currentSelectedNode.selected = false;
					currentSelectedNode = null;
					if (vm.currentFilterItemSelected !== null) {
						vm.currentFilterItemSelected.class = "";
						vm.currentFilterItemSelected = null;
					}
				}
			}
			else if ((event.type === EventService.EVENT.PANEL_CARD_ADD_MODE) ||
					 (event.type === EventService.EVENT.PANEL_CARD_EDIT_MODE)) {
				// If another card is in modify mode don't show a node if an object is clicked in the viewer
				highlightSelectedViewerObject = !event.value.on;
			}
		});

		vm.toggleTreeNode = function (node) {
			var i, j,
				nodesLength,
				path,
				parent = null,
				nodeToggleState = "visible",
				numInvisible = 0,
				numParentInvisible = 0;

			vm.toggledNode = node;

			path = node.path.split("__");
			path.splice(path.length - 1, 1);

			for (i = 0, nodesLength = vm.nodesToShow.length; i < nodesLength; i += 1) {
				// Set node toggle state
				if (vm.nodesToShow[i]._id === node._id) {
					vm.setToggleState(vm.nodesToShow[i], (vm.nodesToShow[i].toggleState === "visible") ? "invisible" : "visible");
					nodeToggleState = vm.nodesToShow[i].toggleState;
					updateClickedHidden(vm.nodesToShow[i]);
					updateClickedShown(vm.nodesToShow[i]);
				}
				// Set children to node toggle state
				else if (vm.nodesToShow[i].path.indexOf(node._id) !== -1) {
					vm.setToggleState(vm.nodesToShow[i], nodeToggleState);
				}
				// Get node parent
				if (vm.nodesToShow[i]._id === path[path.length - 1]) {
					parent = vm.nodesToShow[i];
				}
			}

			// Set the toggle state of the nodes above
			if (parent !== null) {
				for (i = (path.length - 1); i >= 0; i -= 1) {
					for (j = 0, nodesLength = vm.nodesToShow.length; j < nodesLength; j += 1) {
						if (vm.nodesToShow[j]._id === path[i]) {
							numInvisible = vm.nodesToShow[j].children.reduce(
								function (total, child) {
									return child.toggleState === "invisible" ? total + 1 : total;
								},
								0);
							numParentInvisible = vm.nodesToShow[j].children.reduce(
								function (total, child) {
									return child.toggleState === "parentOfInvisible" ? total + 1 : total;
								},
								0);

							if (numInvisible === vm.nodesToShow[j].children.length) {
								vm.setToggleState(vm.nodesToShow[j], "invisible");
							} else if ((numParentInvisible + numInvisible) > 0) {
								vm.setToggleState(vm.nodesToShow[j], "parentOfInvisible");
							} else {
								vm.setToggleState(vm.nodesToShow[j], "visible");
							}
						}
					}
				}
			}
			toggleNode(node);
		};

		var toggleNode = function (node) {
			var childNodes = [];
			var pathArr = [];
			var idx = 0, i = 0;

			for (var obj in vm.idToPath) {
				if (vm.idToPath.hasOwnProperty(obj) && (vm.idToPath[obj].indexOf(node.path) !== -1)) {
					pathArr = vm.idToPath[obj].split("__");
					childNodes.push(pathArr[pathArr.length - 1]);
				}
			}

			if (node.toggleState === "invisible")
			{
				for(i = 0; i < childNodes.length; i++)
				{
					if (vm.invisible.indexOf(childNodes[i]) === -1)
					{
						vm.invisible.push(childNodes[i]);
					}

					idx = vm.visible.indexOf(childNodes[i]);
					if (idx !== -1)
					{
						vm.visible.splice(idx,1);
					}
				}
			} else {
				for(i = 0; i < childNodes.length; i++)
				{
					if (vm.visible.indexOf(childNodes[i]) === -1)
					{
						vm.visible.push(childNodes[i]);
					}

					idx = vm.invisible.indexOf(childNodes[i]);
					if (idx !== -1)
					{
						vm.invisible.splice(idx,1);
					}
				}
			}

			EventService.send(EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY, {
				source: "tree",
				account: node.account,
				project: node.project,
				name: node.name,
				visible_ids: vm.visible,
				invisible_ids: vm.invisible
			});
		};

		function setupInfiniteScroll() {
			// Infinite items
			vm.infiniteItemsTree = {
				numLoaded_: 0,
				toLoad_: 0,

				getItemAtIndex: function (index) {
					if (index > this.numLoaded_) {
						this.fetchMoreItems_(index);
						return null;
					}

					if (index < vm.nodesToShow.length) {
						return vm.nodesToShow[index];
					} else {
						return null;
					}
				},

				getLength: function () {
					return this.numLoaded_ + 5;
				},

				fetchMoreItems_: function (index) {
					if (this.toLoad_ < index) {
						this.toLoad_ += 500;
						$timeout(angular.noop, 300).then(angular.bind(this, function () {
							this.numLoaded_ = this.toLoad_;
						}));
					}
				}
			};
		}

		$scope.$watch("vm.filterText", function (newValue) {
			var noFilterItemsFoundHeight = 82;

			if (angular.isDefined(newValue)) {
				if (newValue.toString() === "") {
					vm.showTree = true;
					vm.showFilterList = false;
					vm.showProgress = false;
					vm.nodes = vm.nodesToShow;
					setContentHeight(vm.nodes);
				} else {
					vm.showTree = false;
					vm.showFilterList = false;
					vm.showProgress = true;
					vm.progressInfo = "Filtering tree for objects";

					promise = TreeService.search(newValue);
					promise.then(function (json) {
						vm.showFilterList = true;
						vm.showProgress = false;
						vm.nodes = json.data;
						if (vm.nodes.length > 0) {
							vm.filterItemsFound = true;
							for (i = 0, length = vm.nodes.length; i < length; i += 1) {
								vm.nodes[i].index = i;
								vm.nodes[i].toggleState = "visible";
								vm.nodes[i].class = "unselectedFilterItem";
								vm.nodes[i].level = 0;
							}
							setupInfiniteItemsFilter();
							setContentHeight(vm.nodes);
						}
						else {
							vm.filterItemsFound = false;
							vm.onContentHeightRequest({height: noFilterItemsFoundHeight});
						}
					});
				}
			}
		});

		/**
		 * Selected a node in the tree
		 *
		 * @param node
		 */
		vm.selectNode = function (node) {
			// Remove highlight from the current selection and highlight this node if not the same
			console.log(currentSelectedNode);
			if (currentSelectedNode !== null) {
				currentSelectedNode.selected = false;
				if (currentSelectedNode._id === node._id) {
					currentSelectedNode = null;
				}
				else {
					node.selected = true;
					currentSelectedNode = node;
				}
			}
			else {
				node.selected = true;
				currentSelectedNode = node;
			}

			// Remove highlight from the current selection in the viewer and highlight this object if not the same
			if (currentSelectedNode === null) {
				EventService.send(EventService.EVENT.VIEWER.BACKGROUND_SELECTED);
			}
			else {
				var map = [];
				var pathArr = [];
				for (var obj in vm.idToPath) {
					if (vm.idToPath.hasOwnProperty(obj) && (vm.idToPath[obj].indexOf(node._id) !== -1)) {
						pathArr = vm.idToPath[obj].split("__");
						map.push(pathArr[pathArr.length - 1]);
					}
				}

				// Select the parent node in the group for cards and viewer
				EventService.send(EventService.EVENT.VIEWER.OBJECT_SELECTED, {
					source: "tree",
					account: node.account,
					project: node.project,
					id: node._id,
					name: node.name
				});

				// Separately highlight the children
				// but only for multipart meshes
				if (document.getElementsByTagName("multipart").length)
				{
					EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, {
						source: "tree",
						account: node.account,
						project: node.project,
						ids: map
					});
				}
			}
		};

		vm.filterItemSelected = function (item) {
			if (vm.currentFilterItemSelected === null) {
				vm.nodes[item.index].class = "treeNodeSelected";
				vm.currentFilterItemSelected = item;
			} else if (item.index === vm.currentFilterItemSelected.index) {
				vm.nodes[item.index].class = "";
				vm.currentFilterItemSelected = null;
			} else {
				vm.nodes[vm.currentFilterItemSelected.index].class = "";
				vm.nodes[item.index].class = "treeNodeSelected";
				vm.currentFilterItemSelected = item;
			}

			var selectedNode = vm.nodes[item.index];

			vm.selectNode(selectedNode);
		};

		vm.toggleFilterNode = function (item) {
			vm.setToggleState(item, (item.toggleState === "visible") ? "invisible" : "visible");
			item.path = item._id;
			toggleNode(item);
		};

		function setupInfiniteItemsFilter() {
			vm.infiniteItemsFilter = {
				numLoaded_: 0,
				toLoad_: 0,
				getItemAtIndex: function (index) {
					if (index > this.numLoaded_) {
						this.fetchMoreItems_(index);
						return null;
					}

					if (index < vm.nodes.length) {
						return vm.nodes[index];
					} else {
						return null;
					}
				},
				getLength: function () {
					return this.numLoaded_ + 5;
				},
				fetchMoreItems_: function (index) {
					if (this.toLoad_ < index) {
						this.toLoad_ += 20;
						$timeout(angular.noop, 300).then(angular.bind(this, function () {
							this.numLoaded_ = this.toLoad_;
						}));
					}
				}
			};
		}

		/**
		 * If a node was clicked to hide, add it to a list of similar nodes
		 *
		 * @param {Object} node
		 */
		function updateClickedHidden (node) {
			if (node.toggleState === "invisible") {
				clickedHidden[node._id] = node;
			}
			else {
				delete clickedHidden[node._id];
			}
		}

		/**
		 * If a node was clicked to show, add it to a list of similar nodes
		 *
		 * @param {Object} node
		 */
		function updateClickedShown (node) {
			if (node.toggleState === "visible") {
				clickedShown[node._id] = node;
			}
			else {
				delete clickedShown[node._id];
			}
			console.log(clickedShown);
		}

		/**
		 * Check if a relative in the path was clicked to show
		 *
		 * @param {Object} node
		 */
		function pathRelativeWasClickShown (node) {
			var i, length,
				relativeWasClickShown = false,
				path = node.path.split("__");

			path.pop(); // Remove _id of node from path
			for (i = 0, length = path.length; i < length; i += 1) {
				if (clickedShown.hasOwnProperty(path[i])) {
					relativeWasClickShown = true;
					break;
				}
			}

			return relativeWasClickShown;
		}

		/**
		 * Check if a node was clicked to hide
		 *
		 * @param {Object} node
		 */
		function wasClickedHidden (node) {
			return clickedHidden.hasOwnProperty(node._id);
		}
	}
}());

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

(function() {
	"use strict";

	angular.module('3drepo')
		.factory('TreeService', TreeService);

	TreeService.$inject = ["$http", "$q", "EventService", "serverConfig"];

	function TreeService($http, $q, EventService, serverConfig) {
		var ts = this;

		var init = function(account, project, branch, revision) {
			ts.account  = account;
			ts.project  = project;
			ts.branch   = branch ? branch : "master";
			ts.revision = revision ? revision : "head";

			if (ts.branch === "master")
			{
				ts.baseURL = "/" + account + "/" + project + "/revision/master/head/";
			} else {
				ts.baseURL = "/" + account + "/" + project + "/revision/" + revision + "/";
			}

			var deferred = $q.defer(),
				url = ts.baseURL + "fulltree.json";

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, url))
				.then(function(json) {
					deferred.resolve(json.data);
				});

			return deferred.promise;
		};

		var search = function(searchString) {
			var deferred = $q.defer(),
				url = ts.baseURL + "searchtree.json?searchString=" + searchString;

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, url))
				.then(function(json) {
					deferred.resolve(json);
				});

			return deferred.promise;
		};

		return {
			init: init,
			search: search
		};
	}
}());

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("tdrColourPicker", colourPicker);

	function colourPicker() {
		return {
			restrict: 'EA',
			templateUrl: 'colourPicker.html',
			scope: {
				title: "@",
				colour: "=",
				onColourChange: "&",
				offset: "@"
			},
			controller: ColourPickerCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	ColourPickerCtrl.$inject = ["$scope"];

	function ColourPickerCtrl ($scope) {
		var vm = this;

		/*
		 * Init
		 */
		vm.red = 200;
		vm.green = 150;
		vm.blue = 100;

		/*
		 * Watch for slider changes
		 */
		$scope.$watchGroup(["vm.red", "vm.green", "vm.blue"], function (newValues) {
			vm.onColourChange({colour: newValues});
		});

		/*
		 * Watch for parent changing colour
		 */
		$scope.$watch("vm.colour", function (newValue) {
			if (Array.isArray(newValue)) {
				vm.red = newValue[0];
				vm.green = newValue[1];
				vm.blue = newValue[2];
			}
		});

		/**
		 * Open the menu to assign a colour
		 *
		 * @param $mdOpenMenu
		 * @param event
		 */
		vm.open = function($mdOpenMenu, event) {
			$mdOpenMenu(event);
		};
	}
}());

/**
 *  Copyright (C) 2015 3D Repo Ltd
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
		.directive("tdrProgress", tdrProgress);

	function tdrProgress() {
		return {
			restrict: "EA",
			templateUrl: "tdrProgress.html",
			scope: {
				info: "="
			},
			controller: TdrProgressCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TdrProgressCtrl.$inject = ["$scope"];

	function TdrProgressCtrl($scope) {
		var vm = this;
	}

}());
/**
 *  Copyright (C) 2016 3D Repo Ltd
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

		// Inspired by Mark Rajcok'a answer - http://stackoverflow.com/a/14837021/782358
		.directive('tdrFocus', function($timeout) {
			return {
				scope: { trigger: '@tdrFocus' },
				link: function(scope, element) {
					scope.$watch('trigger', function(value) {
						if (value.toString() === "true") {
							$timeout(function() {
								element[0].focus();
							});
						}
					});
				}
			};
		});
}());

/**
 *  Copyright (C) 2016 3D Repo Ltd
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

		.filter("formatBytes", function() {
			return function(input, referenceValue) {
				var bytesInMB = 1048576,
					bytesInGB = 1073741824,
					factor,
					units;

				// referenceValue is used for consistency of units
				if (angular.isDefined(referenceValue)) {
					if (referenceValue > 1073741824) {
						factor = bytesInGB;
						units = " GB";
					}
					else {
						factor = bytesInMB;
						units = " MB";
					}
				}
				else {
					if (input > 1073741824) {
						factor = bytesInGB;
						units = " GB";
					}
					else {
						factor = bytesInMB;
						units = " MB";
					}
				}
				return (Math.round(input / factor * 100) / 100).toString() + units; // (input / bytesInAGb).toFixed(2)
			};
		})

		.filter("invoiceDate", function () {
			return function(input) {
				var date = new Date(input),
					invoiceDate;

				invoiceDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
					((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
					date.getFullYear() + " " +
					(date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
					(date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

				return invoiceDate;
			};
		})

		.filter("prettyDate", function () {
			return function(input, showSeconds) {
				var date = new Date(input),
					projectDate;

				projectDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
					((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
					date.getFullYear();

				if (angular.isDefined(showSeconds) && showSeconds) {
					projectDate += " " + (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
						(date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + "-" +
						(date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
				}

				return projectDate;
			};
		})


		.filter("prettyGMTDate", function () {
			return function(input) {
				var date = new Date(input);
				return date.toISOString().substr(0,10);
			};
		});

}());

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
        .factory("UtilsService", UtilsService);

    UtilsService.$inject = ["$http", "$q", "$mdDialog", "serverConfig"];

    function UtilsService($http, $q, $mdDialog, serverConfig) {
        var obj = {};

		/**
		 * Convert blah_test to blahTest
         *
         * @param name
         * @param separator
         * @returns {*|void|string|{REPLACE, REPLACE_NEGATIVE}|XML}
         */
        obj.snake_case = function snake_case(name, separator) {
            var SNAKE_CASE_REGEXP = /[A-Z]/g;
            separator = separator || '_';
            return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        };

		/**
         * Capitalise the first letter of a string
         * Inspired by Steve Harrison's answer - http://stackoverflow.com/a/1026087/782358
         *
         * @param string
         * @returns {string}
         */
        obj.capitalizeFirstLetter = function (string) {
            return (string.toString()).charAt(0).toUpperCase() + string.slice(1);
        };

        /**
         * Handle GET requests
         * 
         * @param url
         * @returns {*|promise}
         */
        obj.doGet = function (url) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.GET_API, url);

            $http.get(urlUse).then(
                function (response) {
                    deferred.resolve(response);
                },
                function (response) {
                    deferred.resolve(response);
                });
            return deferred.promise;
        };

        /**
         * Handle POST requests
         * @param data
         * @param url
         * @param headers
         * @returns {*}
         */
        obj.doPost = function (data, url, headers) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.POST_API, url),
                config = {withCredentials: true};

            if (angular.isDefined(headers)) {
                config.headers = headers;
            }

            $http.post(urlUse, data, config)
                .then(
                    function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.resolve(error);
                    }
                );
            return deferred.promise;
        };

        /**
         * Handle PUT requests
         * @param data
         * @param url
         * @returns {*}
         */
        obj.doPut = function (data, url) {
            var deferred = $q.defer(),
                urlUse = serverConfig.apiUrl(serverConfig.POST_API, url),
                config = {withCredentials: true};

            $http.put(urlUse, data, config)
                .then(
                    function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.resolve(error);
                    }
                );
            return deferred.promise;
        };

        /**
         * Handle DELETE requests
         * @param data
         * @param url
         * @returns {*}
         */
        obj.doDelete = function (data, url) {
            var deferred = $q.defer(),
                config = {
                    method: "DELETE",
                    url: serverConfig.apiUrl(serverConfig.POST_API, url),
                    data: data,
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                };

            $http(config)
                .then(
                    function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.resolve(error);
                    }
                );
            return deferred.promise;
        };

        /**
         * Show a dialog
         *
         * @param {String} dialogTemplate - required
         * @param {Object} scope - required
         * @param {Object} event
         * @param {Boolean} clickOutsideToClose
         * @param {Object} parent
         * @param {Boolean} fullscreen
         */
        obj.showDialog = function (dialogTemplate, scope, event, clickOutsideToClose, parent, fullscreen) {
            // Allow the dialog to have cancel ability
            scope.utilsRemoveDialog = scope.utilsRemoveDialog || function () {$mdDialog.cancel();};

            // Set up and show dialog
            var data = {
                controller: function () {},
                templateUrl: dialogTemplate,
                onRemoving: function () {$mdDialog.cancel();}
            };
            data.parent = angular.element(angular.isDefined(parent) ? parent : document.body);
            data.scope = (angular.isDefined(scope)) ? scope : null;
            data.preserveScope = (data.scope !== null);
            data.targetEvent = (angular.isDefined(event)) ? event : null;
            data.clickOutsideToClose = (angular.isDefined(clickOutsideToClose)) ? clickOutsideToClose : true;
            data.fullscreen = (angular.isDefined(fullscreen)) ? fullscreen : true;
            $mdDialog.show(data);
        };

        /**
         * close a dialog
         */
        obj.closeDialog = function () {
            $mdDialog.cancel();
        };

        return obj;
    }
}());

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
        .factory("WalkthroughService", WalkthroughService);

    WalkthroughService.$inject = ["$interval", "$timeout", "$q", "$http", "serverConfig"];

    function WalkthroughService($interval, $timeout, $q, $http, serverConfig) {
        var walkthroughs = {},
            //userControlTimeout = null,
			loading = null;

        function getWalkthroughs(account, project, index) {
			var projectKey = account + "__" + project;

			if (angular.isUndefined(index))
			{
				index = "all";
			}

            var url = "/" + account + "/" + project + "/walkthrough/" + index + ".json",
                i = 0,
                length = 0;

			loading = $q.defer();
			var needLoading = false;

			if (!walkthroughs.hasOwnProperty(projectKey))
			{
				walkthroughs[projectKey] = [];
				needLoading = true;
			} else {
				if (!walkthroughs[projectKey].hasOwnProperty(index))
				{
					needLoading = true;
				}
			}

			if (needLoading)
			{
				$http.get(serverConfig.apiUrl(serverConfig.GET_API, url))
					.then(function(data) {
						for (i = 0, length = data.data.length; i < length; i++) {
							walkthroughs[projectKey][data.data[i].index] = data.data[i].cameraData;
						}

						loading.resolve(walkthroughs[projectKey][index]);
					});
			} else {
				loading.resolve(walkthroughs[projectKey][index]);
			}

			return loading.promise;
        }

		var saveRecording = function (account, project, index, recording) {
            var postUrl = "/" + account + "/" + project + "/walkthrough";
			var projectKey = account + "__" + project;

			walkthroughs[projectKey][index] = recording;

            $http.post(serverConfig.apiUrl(serverConfig.POST_API, postUrl), {index: index, cameraData: recording})
                .then(function() {
                    //console.log(json);
                });
        };

        return {
            saveRecording: saveRecording,
            getWalkthroughs: getWalkthroughs
        };
    }
}());

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
		.directive("walkthrough", walkthroughVr);

	function walkthroughVr() {
		return {
			restrict: "EA",
			scope: {
				account: "@",
				project: "@",
				autoPlay: "@",
				animate: "@",
				fps: "@",
				rollerCoaster: "@"
			},
			template: "walkthrough.html",
			controller: WalkthroughCtrl,
			controllerAs: "wt",
			bindToController: true
		};
	}

	var DEFAULT_FRAMES_PER_SECOND = 30;
	var USER_CONTROL_WAIT         = 60000;
	
	WalkthroughCtrl.$inject = ["$scope", "$q", "$interval", "$timeout", "WalkthroughService", "EventService"];
	
	function WalkthroughCtrl($scope, $q, $interval, $timeout, WalkthroughService, EventService) {
		var wt = this;
		
		wt.initialized = false;
		
		// Animation login
		wt.frames = [];
		
		wt.loading       = null;
		wt.frame         = 0;
		wt.autoPlay      = angular.isDefined(wt.autoPlay) ? wt.autoPlay : false;
		
		wt.fps           = angular.isDefined(wt.fps) ? wt.fps : DEFAULT_FRAMES_PER_SECOND;

		wt.rollerCoaster = angular.isDefined(wt.rollerCoaster);
		wt.animate       = angular.isDefined(wt.animate);
		
		wt.currentWalkthrough = wt.autoPlay ? wt.autoPlay : -1;
		
		wt.recording   = [];
		
		wt.isPlaying   = false;
		wt.isRecording = false;
		
		wt.playInterval      = null;
		wt.recordingInterval = null;
		wt.userWatchDog      = null;

        wt.stop = function () {
			if (wt.isPlaying)
			{
				$interval.cancel(wt.playInterval);
				wt.isPlaying = false;
			}
        };
		
		wt.play = function() {
			if (!wt.initialized)
			{
				wt.initialized = true;
				wt.isPlaying = true;
				$timeout.cancel(wt.userWatchDog);
				
				// Loop through the viewer frames
				wt.frame = 0;
				wt.playInterval = $interval(wt.tickFunction, wt.msPerFrame);
				
			}
		};

		wt.startRecording = function () {
            if (wt.currentWalkthrough !== -1) {
                wt.isRecording = true;
                wt.recording = [];
                wt.recordingInterval = $interval(function () {
					var viewpointPromise = $q.defer();
					
					EventService.send(EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT,
					{
						promise: viewpointPromise.promise
					});
					
					viewpointPromise.then(function (viewpoint) {
                    	wt.recording.push({
	                        position: viewpoint.position,
    	                    up: viewpoint.up,
        	                view_dir: viewpoint.view_dir
            	        });
					});
                }, wt.msPerFrame);
            }			
		};
		
		wt.stopRecording = function () {	
            wt.isRecording = false;
            $interval.cancel(wt.recordingInterval);
			
			WalkthroughService.saveRecording(wt.account, wt.project, wt.currentWalkthrough, wt.recording);
        };
			
		wt.tickFunction = function() {
			if (wt.loading) {
				wt.loading.then(function() {
					EventService.send(EventService.EVENT.VIEWER.SET_CAMERA,
					{
						position:          wt.frames[wt.frame].position,
						up:                wt.frames[wt.frame].up,
						view_dir:          wt.frames[wt.frame].view_dir,
						rollerCoasterMode: wt.rollerCoaster,
						animate:           wt.animate
					});

					if (wt.frame === (wt.numFrames - 1)) {
						wt.frame = 0;
					}
					else {
						wt.frame += 1;
					}
				});
			}
		};

		/*
		wt.loadFrames = function () {
			var url = "/public/plugins/walkthroughVr/" + wt.account + "/" + wt.project + "/frames.csv";
			
			wt.loading = $q.defer();
			// Get the exported frames
			$http.get(url)
				.then(function (response) {
					var lines, line,
						i, length;
						
					wt.frames = [];

					// Convert the frames to viewer frames
					lines = response.data.split("\n");
					lines.splice(lines.length - 1);
					for(i = 0, length = lines.length; i < length; i += 1) {
						line = lines[i].split(",");
						wt.frames.push({
							position: [parseFloat(line[0]), parseFloat(line[2]), -1 * parseFloat(line[1])],
							view_dir: [parseFloat(line[3]), parseFloat(line[5]), -1 * parseFloat(line[4])],
							up: [parseFloat(line[6]), parseFloat(line[8]), -1 * parseFloat(line[7])]
						});
					}

					wt.numFrames = wt.frames.length;
					wt.loading.resolve();
			});			
		};*/
		
		// Button control logic
		wt.recordButtonClass = "btn walkthroughButton btn-success";

        wt.record = function () {
            if (wt.currentWalkthrough !== -1) {
                if (wt.isRecording) {
                    wt.stopRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-success";
                }
                else {
                    wt.startRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-danger";
                }
            }
        };

        wt.userInControl = function () {
            wt.stop();
			
			$interval.cancel(wt.userWatchDog);
			wt.userWatchDog = $timeout(function () {
				wt.play();
			}, USER_CONTROL_WAIT);
        };

        wt.setCurrentWalkthrough = function (index) {
            wt.currentWalkthrough = index;
			wt.loading = WalkthroughService.getWalkthroughs(wt.account, wt.project, index);
        };
		
		// If the account changes then re-load the frames
		$scope.$watchGroup(["account", "project"], function() {
			wt.currentWalkthrough = 0;
			wt.loading = WalkthroughService.getWalkthroughs(wt.account, wt.project);
			//wt.play();
		});
		
		$scope.$watch(["fps"], function (newFPS) {
			wt.fps = newFPS;
			wt.msPerFrame = Math.floor(1000.0 / wt.fps);
		});
		
		$scope.$on("$destroy", function handler() {
			wt.stop();
		});
		
		wt.setCurrentWalkthrough(wt.currentWalkthrough);
	}
}());
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

(function() {
	"use strict";
	
	angular.module("3drepo")
	.controller("VRDemoCtrl", ["$scope", function($scope)
	{
		$scope.showMenu = true;
		$scope.demoOne  = false;
		$scope.demoTwo  = false;
		
		$scope.goDemoOne = function($event) {
			$scope.showMenu = false;
			$scope.demoOne = true;
			$scope.demoTwo = false;
			
			$event.preventDefault();
		};
		
		$scope.goDemoTwo = function($event) {
			$scope.showMenu = false;
			$scope.demoOne = false;
			$scope.demoTwo = true;
			
			$event.preventDefault();			
		};
		
		$scope.backToMenu = function() {
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen) {
				$scope.showMenu = true;
				$scope.demoOne = false;
				$scope.demoTwo = false;
			}			
		};
		
		document.addEventListener("webkitfullscreenchange", $scope.backToMenu, false);
		document.addEventListener("mozfullscreenchange", $scope.backToMenu, false);
		document.addEventListener("fullscreenchange", $scope.backToMenu, false);
		document.addEventListener("MSFullscreenChange", $scope.backToMenu, false);
	}]);
}());
//# sourceMappingURL=three_d_repo.js.map