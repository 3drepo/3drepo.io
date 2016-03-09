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
