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