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

var Viewer = function() {
	var self = this;

	// Create the viewer here
	var x3ddiv = $('#x3d')[0];

	this.viewer = document.createElement('x3d');
	this.viewer.setAttribute('id', 'viewer');
	this.viewer.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');
	x3ddiv.appendChild(this.viewer);

	this.scene = document.createElement('scene');
	this.scene.setAttribute('onbackgroundclicked', 'bgroundClick(event);');
	this.viewer.appendChild(this.scene);

	this.viewPoint = document.createElement('viewpoint');
	this.scene.appendChild(this.viewPoint);

	this.nav = document.createElement('navigationInfo');
	this.viewPoint.appendChild(this.nav);

	this.inline = null;
	this.runtime = null;

	this.initRuntime = function () {
		self.runtime = this;
		self.showAll = this.showAll;
		self.viewPoint.addEventListener('viewpointChanged', onViewpointChange, false);
	};

	x3dom.runtime.ready = this.initRuntime;

	this.lookAtObject = function(obj)
	{
		this.runtime.fitObject(obj, true);
	};

	this.selectGroup = function(group, zoom)
	{
		if(zoom)
			this.lookAtObject(group);

		this.setApp(group);
	}

	this.applyApp = function(nodes, factor, emiss, otherSide)
	{
		if(!otherSide)
		{
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				var origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
				nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

				var origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
				nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

				nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);
			}
		} else {
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				var origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
				nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

				var origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
				nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

				nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);
			}
		}
	}

	this.oneGrpNodes = [];
	this.twoGrpNodes = [];

	this.setApp = function(group)
	{
		this.applyApp(this.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
		this.applyApp(this.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
		this.applyApp(this.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

		if (group)
		{
			this.twoGrpNodes = group.getElementsByTagName("TwoSidedMaterial");
			this.oneGrpNodes = group.getElementsByTagName("Material");
		} else {
			this.oneGrpNodes = [];
			this.twoGrpNodes = [];
		}

		this.applyApp(this.oneGrpNodes, 0.5, "1.0 0.5 0.0", false);
		this.applyApp(this.twoGrpNodes, 0.5, "1.0 0.5 0.0", false);
		this.applyApp(this.twoGrpNodes, 0.5, "1.0 0.5 0.0", true);
	}

	this.evDist = function(evt, posA)
	{
		return Math.sqrt(Math.pow(posA[0] - evt.position.x, 2) +
				Math.pow(posA[1] - evt.position.y, 2) +
				Math.pow(posA[2] - evt.position.z, 2));
	}

	this.dist = function(posA, posB)
	{
		return Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
				Math.pow(posA[1] - posB[1], 2) +
				Math.pow(posA[2] - posB[2], 2));
	}

	this.rotToRotation = function(from, to)
	{
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);

		return crossVec.x + " " + crossVec.y + " " + crossVec.z + " " + Math.acos(dot);
	}

	this.setNavMode = function(mode) {
		this.nav.setAttribute('type', mode);
	}

	this.reload = function() {
		x3dom.reload();
	}

	this.startingPoint = [0.0,0.0,0.0];
	this.setStartingPoint = function(x,y,z)
	{
		this.startingPoint[0] = x;
		this.startingPoint[1] = y;
		this.startingPoint[2] = z;
	}

	this.setCameraPosition = function(x,y,z)
	{
		this.viewPoint.setAttribute("position", x + " " + y + " " + z);
	}

	this.defaultOrientation = [0.0, 0.0, 1.0];
	this.startViewDir		= this.defaultOrientation.slice(0);

	this.setCameraViewDir = function(u,v,w)
	{
		var to = [u,v,w];
		var quat = this.rotToRotation(this.defaultOrientation, to);

		this.viewPoint.setAttribute("orientation", quat);
	}

	this.setCamera = function(x,y,z,u,v,w)
	{
		this.setCameraPosition(x,y,z);
		this.setCameraViewDir(u,v,w);
	}

	this.collDistance = 0.1;
	this.changeCollisionDistance = function(collDistance)
	{
		this.collDistance = collDistance;
		this.nav._x3domNode._vf.avatarSize[0] = collDistance;
	}

	this.avatarHeight = 1.83;
	this.changeAvatarHeight = function(height)
	{
		this.avatarHeight = height;
		this.nav._x3domNode._vf.avatarSize[1] = height;
	}

	this.stepHeight = 0.4;
	this.changeStepHeight = function(stepHeight)
	{
		this.stepHeight = stepHeight;
		this.nav._x3domNode._vf.avatarSize[2] = stepHeight;
	}

	this.reset = function()
	{
		this.setCamera(this.startingPoint[0], this.startingPoint[1], this.startingPoint[2],
			this.defaultOrientation[0], this.defaultOrientation[1], this.defaultOrientation[2]);

		this.changeCollisionDistance(this.collDistance);
		this.changeAvatarHeight(this.avatarHeight);
		this.changeStepHeight(this.stepHeight);
	}

	this.loadURL = function(url)
	{
		if(this.inline)
		{
			this.inline.parentNode.removeChild(this.inline);
			this.inline = null;		// Garbage collect
		}

		this.inline = document.createElement('inline');
		this.inline.setAttribute('namespacename', 'model');
		this.inline.setAttribute('onload', 'onLoaded();');
		this.scene.appendChild(this.inline);
		this.inline.setAttribute('url', url);
		this.reload();
	}

	this.getTransMatrix = function()
	{
		return viewer.viewPoint._x3domNode._viewMatrix.inverse();
		var viewDir = transMatrix.e2();
		var viewPos = transMatrix.e3();
	}

	this.speed = 2.0;
	this.setSpeed = function(speed)
	{
		this.speed = speed;
		this.nav.speed = speed;
	}

	this.enableClicking = function() {
		// When the user clicks on the background the select nothing.
		$(document).on("bgroundClicked", function(event) {
			self.setApp(null);
		});

		$(document).on("clickObject", function(event, objEvent) {
			//viewer.lookAtObject(objEvent.target);
			self.setApp(objEvent.target);
		});
	}
};


