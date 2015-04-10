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

var Collision = function() {
	var self = this;

	this._deltaT = 0.1;

	this.deltaX = 0.0;
	this.deltaZ = 0.0;

	this.ticking = false;

	this.prevMove = 0.0;

	this.stopped = true;

	this.updateDirections = function(event, gamepad)
	{
		var speed = viewer.nav._x3domNode._vf.speed;
		var userX = self._deltaT * speed * gamepad.xaxis;
		var userY = self._deltaT * speed * gamepad.yaxis;

		if ((userX == 0) && (userY == 0))
			self.stopped = true;
		else
			self.stopped = false;

		if(!self.stopped)
		{
			var currViewMat = viewer.getViewMatrix();
			var xRotRad = 0;
			var yRotRad = Math.asin(currViewMat._02);
			//var C = Math.cos(yRotRad);

			/*
			if (Math.abs(C) > 0.0001) {
				yRotRad = Math.atan2(-currViewMat._12 / C, currViewMat._22 / C);
			}
			*/

			self.deltaX = (userX * Math.cos(yRotRad) - userY * Math.sin(yRotRad));
			self.deltaZ = (userX * Math.sin(yRotRad) + userY * Math.cos(yRotRad));

			console.log(self.deltaX + " - " + self.deltaZ);

			if(!self.ticking)
				self.tick();
		}
	}

	this.tick = function()
	{
		self.ticking = true;

		var viewArea = viewer.getViewArea();
		var straightDown = new x3dom.fields.SFVec3f(0, -1, 0);
		var straightUp = new x3dom.fields.SFVec3f(0, 1, 0);
		var straightAhead = new x3dom.fields.SFVec3f(0, 0, -1);

		var currProjMat = viewer.getProjectionMatrix();
		var currViewMat = viewer.getViewMatrix();
		var flyMat = currViewMat.inverse();
		var from = flyMat.e3();

		var tmpFlatAt = flyMat.e3();

		tmpFlatAt.x += self.deltaX;
		tmpFlatAt.z += self.deltaZ;

		var tmpTmpMat = x3dom.fields.SFMatrix4f.lookAt(from, tmpFlatAt, straightUp);
		tmpTmpMat = tmpTmpMat.inverse();

		viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width/2, viewArea._height/2,
					this._lastButton, tmpTmpMat, currProjMat.mult(tmpTmpMat));

		var dist = viewArea._pickingInfo.pickPos.subtract(from).length();

		if (!self.stopped && dist > viewer.avatarRadius)
		{
			from.x += self.deltaX;
			from.z += self.deltaZ;

			// Attach to ground
			var tmpAt = from.addScaled(straightDown, 1.0);
			var tmpUp = straightAhead.cross(straightDown);
			var tmpDownMat = x3dom.fields.SFMatrix4f.lookAt(from, tmpAt, tmpUp);
			tmpDownMat = tmpDownMat.inverse();

			viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width/2, viewArea._height/2,
						this._lastButton, tmpDownMat, currProjMat.mult(tmpDownMat));

			var dist = viewArea._pickingInfo.pickPos.subtract(from).length();
			//var dist = from.z - viewArea._pickingInfo.pickPos.z;

			var movement = 0.5 * ((viewer.avatarHeight - dist) + self.prevMove);
			from.y += movement;
			self.prevMove = movement;

			var at	 = from.subtract(flyMat.e2());
			var up	 = flyMat.e1();

			var tmpMat = x3dom.fields.SFMatrix4f.lookAt(from, at, up);

			viewArea._scene.getViewpoint().setView(tmpMat.inverse());

			viewer.runtime.triggerRedraw();
		}

		self.nextTick();
	}

	this.nextTick = function() {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(this.tick);
		} else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(this.tick);
		} else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(this.tick);
		}
	};

	$(document).on("gamepadMove", this.updateDirections);
};
