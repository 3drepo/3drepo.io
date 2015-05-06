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

var Spheres = function(viewer) {
	this.spheres = [];

	this.viewer = viewer;

	var self = this;

	this.addViewDir = function(position, dir, radius, rgb, trans)
	{
		//position[1] += 0.5 * radius;

		position[0] += dir[0] * radius;
		position[1] += dir[1] * radius;
		position[2] += dir[2] * radius;

		var posStr = position.join(" ");
		var rgbStr = rgb.join(" ");

		//var rotQt = rotQuat([0, 1, 0], dir);
		//var rotStr = rotQt.x + " " + rotQt.y + " " + rotQt.z + " " + rotQt.w;

		var rotStr = self.viewer.rotToRotation([0,1,0], dir);

		var transform = document.createElement('transform');
		transform.setAttribute('translation', posStr);
		transform.setAttribute('center', posStr);
		self.viewer.scene.appendChild(transform);

		var rotation = document.createElement('transform');
		rotation.setAttribute('rotation', rotStr);
		transform.appendChild(rotation);

		var shape = document.createElement('shape');
		shape.setAttribute('isPickable', false);
		rotation.appendChild(shape);

		var appearance = document.createElement('appearance');
		shape.appendChild(appearance);

		var material = document.createElement('material');
		material.setAttribute('diffuseColor', rgbStr);
		material.setAttribute('transparency', trans);
		appearance.appendChild(material);

		var cone = document.createElement('cone');
		cone.setAttribute('bottomRadius', radius * 0.8);
		cone.setAttribute('height', radius * 5.0);

		shape.appendChild(cone);

		this.spheres.push(transform);

		return transform;
	}

	this.addSphere = function(position, radius, scaleY, rgb, trans)
	{
		//position[1] += -0.5 * radius * scaleY;

		var posStr = position.join(" ");
		var rgbStr = rgb.join(" ");
		var scaleStr = "1 " + scaleY + " 1";

		var transform = document.createElement('transform');
		transform.setAttribute('scale', scaleStr);
		transform.setAttribute('translation', posStr);
		self.viewer.scene.appendChild(transform);

		var shape = document.createElement('shape');
		shape.setAttribute('isPickable', false);
		transform.appendChild(shape);

		var appearance = document.createElement('appearance');
		shape.appendChild(appearance);

		var material = document.createElement('material');
		material.setAttribute('diffuseColor', rgbStr);
		material.setAttribute('transparency', trans);
		appearance.appendChild(material);

		var sphere = document.createElement('sphere');
		sphere.setAttribute('radius', radius);
		sphere.setAttribute('solid', false);
		shape.appendChild(sphere);

		this.spheres.push(transform);

		console.log("Adding sphere @ " + posStr);

		return transform;
	}

	var rgbColors = [
	[1,0,0],
	[0,1,0],
	[0,0,1],
	[1,0,1],
	[1,1,0],
	[0,1,1],
	[1,1,1]
	];

	this.threshold = 0.5;

	this.getSpeedRGB = function(origRGB, val)
	{
		var mapFunc = Math.exp(-1 * (val / 10));

		return [origRGB[0] * mapFunc, origRGB[1] * mapFunc, origRGB[2] * mapFunc];
	}

	this.clearSpheres = function()
	{
		for(var i = 0; i < this.spheres.length; i++)
		{
			if (this.spheres[i])
				this.spheres[i].parentNode.removeChild(this.spheres[i]);
		}

		this.spheres = [];
	}

	this.plotSpheres = function(dataJson)
	{
		var numRoutes = dataJson.length;
		var oldPos = self.viewer.startingPoint.slice(0);
		var numWait = 0;

		for(var routeIdx = 0; routeIdx < numRoutes; routeIdx++)
		{
			var numberOfPoints = Object.keys(dataJson[routeIdx]).length - 4;
			var baseRGB = rgbColors[routeIdx % (rgbColors.length)];

			for(var i = 0; i < numberOfPoints; i++)
			{
				var newPos = dataJson[routeIdx][i].pos;
				var newDir = dataJson[routeIdx][i].dir;
				var lastDist = self.viewer.dist(newPos, oldPos);

				if (lastDist < this.threshold)
				{
					numWait += 1;
				} else {
					var newRGB = this.getSpeedRGB(baseRGB, numWait);
					numWait = 0;
					//this.addSphere(newPos, 0.2, 1.0, newRGB, 0.3);
					this.addViewDir(newPos, newDir, 1.0, newRGB, 0.3);
				}

				oldPos = newPos.slice(0);
			}
		}
	}
};

var Text = function(viewer) {
	this.textElement = null;

	this.viewer = viewer;

	var self = this;

	this.init = function(rgb)
	{
		if(this.textElement)
		{
			this.textElement.parentNode.removeChild(this.textElement);
			this.textElement = null;
		}

		var transMatrix = self.viewer.getTransMatrix();
		var viewDir = transMatrix.e2();
		var viewPos = transMatrix.e3();

		var rgbStr = rgb.join(' ');

		viewPos = viewPos.subtract(viewDir.multiply(5));

		var posStr = viewPos.x + " " + viewPos.y + " " + viewPos.z;

		this.textElement = document.createElement('transform');
		self.viewer.scene.appendChild(this.textElement);

		this.textElement.setAttribute('id', 'textInfo');
		this.textElement.setAttribute('translation', posStr);
		this.textElement.setAttribute('render', 'false');

		var s = document.createElement('Shape');
		this.textElement.appendChild(s);

		s.setAttribute('isPickable', 'false');

		var a = document.createElement('Appearance');
		var m = document.createElement('Material');

		a.appendChild(m);
		s.appendChild(a);

		m.setAttribute('diffuseColor', rgbStr);

		var txt = document.createElement('text');
		s.appendChild(txt);

		txt.setAttribute('solid', 'true');

		var fs = document.createElement('fontstyle');
		this.textElement.appendChild(fs);

		fs.setAttribute('family', 'Times');
		fs.setAttribute('size', '0.8');
	}

	this.updateText = function(str, rgb, aliveFor)
	{
		this.textElement.getElementsByTagName('text')[0].setAttribute('string', str);
		this.textElement.getElementsByTagName('material')[0].setAttribute('diffuseColor', rgb.join(' '));

		var transMatrix = self.viewer.getTransMatrix();
		var viewDir = transMatrix.e2();
		var viewPos = transMatrix.e3();
		var rgbStr = rgb.join(' ');

		viewPos = viewPos.subtract(viewDir.multiply(5));

		var posStr = viewPos.x + " " + viewPos.y + " " + viewPos.z;
		this.textElement.setAttribute('translation', posStr);
		this.textElement.setAttribute('render', 'true');

		var self = this;

		if (aliveFor)
			setTimeout( function () { self.textElement.setAttribute('render', 'false'); } , aliveFor);
	}
};

var Arrow = function(viewer) {
	this.arrowElement	= null;
	this.position		= null;
	this.rgb			= null;
	this.trans			= null;

	var self = this;

	this.viewer = viewer;

	this.addArrow = function(position, rgb, trans)
	{
		self.clearArrow();

		self.arrowElement = document.createElement('inline');
		self.viewer.scene.appendChild(self.arrowElement);

		self.arrowElement.setAttribute('namespacename', 'arrow');
		self.arrowElement.setAttribute('url', '/public/arrow.x3d');
		self.arrowElement.onload = self.startAnimation;
		//self.arrowElement.setAttribute('onload', self.startAnimation());
		self.arrowElement.setAttribute('isPickable', 'false');

		self.position	= position;
		self.rgb		= rgb;
		self.trans		= trans;
	}

	this.clearArrow = function() {
		if(self.arrowElement && self.arrowElement.parentNode)
		{
			self.arrowElement.parentNode.removeChild(self.arrowElement);
			self.arrowElement = null;
		}
	}

	this.startAnimation = function()
	{
			var pos = self.position.slice(0);
			var minBox = $("#arrow__ArrowRot")[0]._x3domNode.getVolume().min;
			pos[1] -= minBox.y;

			var centerBox = $("#arrow__ArrowRot")[0]._x3domNode.getVolume().center;
			pos[0] -= centerBox.x;
			pos[2] -= centerBox.z;

			var peakPos = pos.slice(0);
			peakPos[1] += 3;

			var posStr = pos.join(" ");
			var peakStr = peakPos.join(" ");
			var rgbStr = self.rgb.join(" ");

			var ts = document.createElement('timeSensor');
			ts.setAttribute('DEF', 'ArrowTime');
			ts.setAttribute('cycleInterval', 2);
			ts.setAttribute('loop', 'true');

			var pi = document.createElement('PositionInterpolator');
			pi.setAttribute('DEF', 'ArrowPI');
			pi.setAttribute('key', '0 0.5 1');
			pi.setAttribute('keyValue', posStr + " " + peakStr + " " + posStr);

			var timeRT = document.createElement('Route');
			timeRT.setAttribute('fromNode', 'ArrowTime');
			timeRT.setAttribute('fromField', 'fraction_changed');
			timeRT.setAttribute('toNode', 'ArrowPI');
			timeRT.setAttribute('toField', 'set_fraction');

			var moveRT = document.createElement('Route');
			moveRT.setAttribute('fromNode', 'ArrowPI');
			moveRT.setAttribute('fromField', 'value_changed');
			moveRT.setAttribute('toNode', 'ArrowTrans');
			moveRT.setAttribute('toField', 'translation');

			$('#arrow__ArrowScene')[0].appendChild(ts);
			$('#arrow__ArrowScene')[0].appendChild(pi);
			$('#arrow__ArrowScene')[0].appendChild(timeRT);
			$('#arrow__ArrowScene')[0].appendChild(moveRT);

			var color = document.createElement('appearance');
			var colormat = document.createElement('Material');
			colormat.setAttribute('diffuseColor', rgbStr);
			colormat.setAttribute('transparency', self.trans);

			color.appendChild(colormat);
			$('#arrow__Arrow').append(color);
	};
};

