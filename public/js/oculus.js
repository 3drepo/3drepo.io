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

var Oculus = function() {
	var self = this;

	this.rtLeft		= null;
	this.rtRight	= null;

	this.lastW		= null;
	this.lastH		= null;

	this.vrHMD		= null;
	this.vrSensor	= null;

	this.IPD		= 0.0064;

	this.enabled	= false;

	this.oculus		= null;

	this.switchVR = function(viewer)
	{
		var scene = viewer.scene;

		if (!this.enabled)
		{
			// Add oculus eyes
			var eyeGroup = document.createElement('group');
			eyeGroup.setAttribute('def', 'oculus');
			eyeGroup.setAttribute('render', 'true');
			this.oculus = eyeGroup;

			var leftEye = document.createElement('group');
			leftEye.setAttribute('def', 'left');
			eyeGroup.appendChild(leftEye);

			var leftShape = document.createElement('shape');
			leftShape.setAttribute('isPickable', 'false');
			leftEye.appendChild(leftShape);

			var leftApp = document.createElement('appearance');
			leftShape.appendChild(leftApp);

			var leftTex = document.createElement('renderedtexture');
			leftTex.setAttribute('id', 'rtLeft');
			leftTex.setAttribute('stereoMode', 'LEFT_EYE');
			leftTex.setAttribute('update', 'ALWAYS');
			leftTex.setAttribute('oculusRiftVersion', '2');
			leftTex.setAttribute('dimensions', '980 1080 3');
			leftTex.setAttribute('repeatS', 'false');
			leftTex.setAttribute('repeatT', 'false');
			leftTex.setAttribute('interpupillaryDistance', this.IPD);
			leftApp.appendChild(leftTex);

			var leftVP = document.createElement('viewpoint');
			leftVP.setAttribute('use', 'viewer_current');
			leftVP.setAttribute('containerfield', 'viewpoint');
			leftVP.textContent = ' ';
			leftTex.appendChild(leftVP);

			var leftBground = document.createElement('background');
			leftBground.setAttribute('use', 'viewer_bground');
			leftBground.setAttribute('containerfield', 'background');
			leftBground.textContent = ' ';
			leftTex.appendChild(leftBground);

			var leftScene = document.createElement('group');
			leftScene.setAttribute('use', 'model__root');
			leftScene.setAttribute('containerfield', 'scene');
			leftTex.appendChild(leftScene);

			var leftShader = document.createElement('composedshader');
			leftApp.appendChild(leftShader);

			var leftTexField = document.createElement('field');
			leftTexField.setAttribute('name', 'tex');
			leftTexField.setAttribute('id', 'leftTex');
			leftTexField.setAttribute('type', 'SFInt32');
			leftTexField.setAttribute('value', '0');
			leftShader.appendChild(leftTexField);

			var leftVertexShader = document.createElement('shaderpart');
			leftVertexShader.setAttribute('type', 'VERTEX');
			leftVertexShader.setAttribute('url', '/public/shader/oculus_left.vert');
			leftShader.appendChild(leftVertexShader);

			var leftFragShader = document.createElement('shaderpart');
			leftFragShader.setAttribute('def', 'frag');
			leftFragShader.setAttribute('type', 'FRAGMENT');
			leftFragShader.setAttribute('url', '/public/shader/oculus.frag');
			leftShader.appendChild(leftFragShader);

			var leftPlane = document.createElement('plane');
			leftPlane.setAttribute('solid', 'false');
			//leftPlane.setAttribute('invisible', 'true');
			leftShape.appendChild(leftPlane);

			// Right eye
			var rightEye = document.createElement('group');
			rightEye.setAttribute('def', 'right');
			eyeGroup.appendChild(rightEye);

			var rightShape = document.createElement('shape');
			rightShape.setAttribute('isPickable', 'false');
			rightEye.appendChild(rightShape);

			var rightApp = document.createElement('appearance');
			rightShape.appendChild(rightApp);

			var rightTex = document.createElement('renderedtexture');
			rightTex.setAttribute('id', 'rtRight');
			rightTex.setAttribute('stereoMode', 'RIGHT_EYE');
			rightTex.setAttribute('update', 'ALWAYS');
			rightTex.setAttribute('oculusRiftVersion', '2');
			rightTex.setAttribute('dimensions', '980 1080 3');
			rightTex.setAttribute('repeatS', 'false');
			rightTex.setAttribute('repeatT', 'false');
			rightTex.setAttribute('interpupillaryDistance', this.IPD);
			rightApp.appendChild(rightTex);

			var rightPlane = document.createElement('plane');
			rightPlane.setAttribute('solid', 'false');
			//rightPlane.setAttribute('invisible', 'true');
			rightShape.appendChild(rightPlane);


			var rightVP = document.createElement('viewpoint');
			rightVP.setAttribute('use', 'viewer_current');
			rightVP.setAttribute('containerfield', 'viewpoint');
			rightVP.textContent = ' ';
			rightTex.appendChild(rightVP);

			var rightBground = document.createElement('background');
			rightBground.setAttribute('use', 'viewer_bground');
			rightBground.setAttribute('containerfield', 'background');
			rightBground.textContent = ' ';
			rightTex.appendChild(rightBground);

			var rightScene = document.createElement('group');
			rightScene.setAttribute('use', 'model__root');
			rightScene.setAttribute('containerfield', 'scene');
			rightScene.textContent = ' ';
			rightTex.appendChild(rightScene);

			var rightShader = document.createElement('composedshader');
			rightApp.appendChild(rightShader);

			var rightTexField = document.createElement('field');
			rightTexField.setAttribute('id', 'rightTex');
			rightTexField.setAttribute('name', 'tex');
			rightTexField.setAttribute('type', 'SFInt32');
			rightTexField.setAttribute('value', '0');
			rightShader.appendChild(rightTexField);

			var rightVertexShader = document.createElement('shaderpart');
			rightVertexShader.setAttribute('type', 'VERTEX');
			rightVertexShader.setAttribute('url', '/public/shader/oculus_right.vert');
			rightShader.appendChild(rightVertexShader);

			var rightFragShader = document.createElement('shaderpart');
			rightFragShader.setAttribute('type', 'FRAGMENT');
			rightFragShader.setAttribute('use', 'frag');
			rightShader.appendChild(rightFragShader);

			scene.appendChild(eyeGroup);

			// Should this be in a setTimeout
			leftShape._x3domNode._graph.needCulling = false;
			rightShape._x3domNode._graph.needCulling = false;
			eyeGroup._x3domNode._graph.needCulling = false;
			//leftPlane._x3domNode._graph.needCulling = false;
			//rightPlane._x3domNode._graph.needCulling = false;

			this.startVR();

			viewer.switchFullScreen();

			this.enabled = true;
		} else {
			this.oculus.parentNode.removeChild(this.oculus);

			this.rtLeft		= null;
			this.rtRight	= null;

			this.lastW		= null;
			this.lastH		= null;

			//this.vrHMD		= null;
			//this.vrSensor	= null;

			this.IPD		= 0.0064;

			this.enabled	= false;

			this.oculus		= null;

			this.enabled = false;

			viewer.runtime.enterFrame = function () {};
			viewer.runtime.exitFrame = function () {};

			viewer.switchFullScreen();
		}
	}

	this.startVR = function () {
		self.rtLeft		= $("#rtLeft")[0];
		self.rtRight	= $("#rtRight")[0];

		self.lastW		= viewer.runtime.getWidth();
		self.lastH		= viewer.runtime.getHeight();

		self.viewpoint	= viewer.viewpoint;

		viewer.runtime.enterFrame = function () {
			if (!self.vrSensor)
				return;

			var state	= self.vrSensor.getState();
			var h		= state.orientation;
			var q		= new x3dom.fields.Quaternion(h.x, h.y, h.z, h.w);

			var flyMat	= viewer.viewPoint._x3domNode._viewMatrix.inverse();
			flyMat.setRotate(q);
			viewer.viewPoint._x3domNode.setView(flyMat.inverse());
		};

		viewer.runtime.exitFrame = function ()
		{
			var w = viewer.runtime.getWidth() * 2;
			var h = viewer.runtime.getHeight() * 2;

			if (w != self.lastW || h != self.lastH)
			{
				var half = Math.round(w / 2);
				self.rtLeft.setAttribute('dimensions',  half + ' ' + h + ' 4');
				self.rtRight.setAttribute('dimensions', half + ' ' + h + ' 4');

				self.lastW = w;
				self.lastH = h;
			}

			viewer.runtime.triggerRedraw();
		};
	}

	this.changeIPD = function(newIPD) {
		self.rtLeft.setAttribute("interpupillaryDistance", newIPD);
		self.rtRight.setAttribute("interpupillaryDistance", newIPD);
	}

	this.peturbIPD = function(perturbation) {
		var oldDistance = parseFloat(self.rtLeft.getAttribute("interpupillaryDistance"));
		this.changeIPD(oldDistance + peturbation);
	}

	this.init = function(vrdevs) {
		var i;

		// First, find a HMD -- just use the first one we find
		for (i = 0; i < vrdevs.length; ++i) {
			if (vrdevs[i] instanceof HMDVRDevice) {
				self.vrHMD = vrdevs[i];
				break;
			}
		}

		if (!self.vrHMD)
			return;

		// Then, find that HMD's position sensor
		for (i = 0; i < vrdevs.length; ++i) {
			if (vrdevs[i] instanceof PositionSensorVRDevice &&
				vrdevs[i].hardwareUnitId == self.vrHMD.hardwareUnitId) {
				self.vrSensor = vrdevs[i];
				break;
			}
		}

		if (!self.vrHMD || !self.vrSensor) {
			alert("Didn't find a HMD and sensor!");
			return;
		}
	}

	if (navigator.getVRDevices)
		navigator.getVRDevices().then(this.init);

	//http://blog.tojicode.com/2014/07/bringing-vr-to-chrome.html
	//http://blog.bitops.com/blog/2014/08/20/updated-firefox-vr-builds/
};
