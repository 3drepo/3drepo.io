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

		this.rtLeft		= null;
		this.rtRight	= null;

		this.lastW		= null;
		this.lastH		= null;

		this.vrHMD		= null;
		this.vrSensor	= null;

		this.IPD		= 0.0064;

		this.enabled	= false;

		this.oculus		= null;

		this.viewer		= viewer;

		this.switchVR = function()
		{
			var scene = self.viewer.scene;

			if (!this.enabled)
			{
				// Add oculus eyes
				var eyeGroup = document.createElement("group");
				eyeGroup.setAttribute("def", "oculus");
				eyeGroup.setAttribute("render", "true");
				this.oculus = eyeGroup;

				var leftEye = document.createElement("group");
				leftEye.setAttribute("def", "left");
				leftEye.setAttribute("render", "false");
				eyeGroup.appendChild(leftEye);

				var leftShape = document.createElement("shape");
				leftShape.setAttribute("isPickable", "false");
				leftEye.appendChild(leftShape);

				var leftApp = document.createElement("appearance");
				leftShape.appendChild(leftApp);

				var leftTex = document.createElement("renderedtexture");
				leftTex.setAttribute("id", "rtLeft");
				leftTex.setAttribute("stereoMode", "LEFT_EYE");
				leftTex.setAttribute("update", "ALWAYS");
				leftTex.setAttribute("oculusRiftVersion", "2");
				//leftTex.setAttribute("dimensions", "980 1080 3");
				leftTex.setAttribute("repeatS", "false");
				leftTex.setAttribute("repeatT", "false");
				leftTex.setAttribute("interpupillaryDistance", this.IPD);
				leftApp.appendChild(leftTex);

				var leftVP = document.createElement("viewpoint");
				if (self.viewer.getCurrentViewpoint() !== null) {
					leftVP.setAttribute("use", self.viewer.getCurrentViewpoint().getAttribute("id"));
				}
				leftVP.setAttribute("containerfield", "viewpoint");
				leftVP.textContent = " ";
				leftTex.appendChild(leftVP);

				var leftBground = document.createElement("background");
				leftBground.setAttribute("use", "viewer_bground");
				leftBground.setAttribute("containerfield", "background");
				leftBground.textContent = " ";
				leftTex.appendChild(leftBground);

				var leftScene = document.createElement("group");
				leftScene.setAttribute("USE", "test__vrdemo__root");
				leftScene.setAttribute("containerfield", "scene");
				leftTex.appendChild(leftScene);

				var leftShader = document.createElement("ComposedShader");
				var leftTexField = document.createElement("field");
				leftTexField.setAttribute("name", "tex");
				leftTexField.setAttribute("type", "SFInt32");
				leftTexField.setAttribute("value", "0");
				leftShader.appendChild(leftTexField);

				var leftvert = document.createElement("ShaderPart");
				leftvert.setAttribute("type", "VERTEX");
				leftvert.textContent = "attribute vec3 position;" +
				"\nattribute vec2 texcoord;" +
				"\n" +
				"\nuniform mat4 modelViewProjectionMatrix;" +
				"\nvarying vec2 fragTexCoord;" +
				"\n" +
				"\nvoid main()" +
				"\n{" +
				"\n\tvec2 pos = sign(position.xy);" +
				"\n\tfragTexCoord = texcoord;" +
				"\n" +
				"\n\tgl_Position = vec4((pos.x - 1.0) / 2.0, pos.y, 0.0, 1.0);" +
				"\n}";
				leftShader.appendChild(leftvert);

				var leftfrag = document.createElement("ShaderPart");
				leftfrag.setAttribute("DEF", "vrfrag");
				leftfrag.setAttribute("type", "FRAGMENT");
				leftfrag.textContent = "#ifdef GL_ES" +
				"\n\tprecision highp float;" +
				"\n#endif" +
				"\n" +
				"\nuniform sampler2D tex;" +
				"\nuniform float leftEye;" +
				"\nvarying vec2 fragTexCoord;" +
				"\n" +
				"\nvoid main()" +
				"\n{" +
				"\n\tfloat distortionScale = 0.7;" +
				"\n\tvec2 lensCenter = vec2(0.151976495726, 0.0);" +
				"\n\tif (leftEye == 0.0) {" +
				"\n\t\tlensCenter.x *= -1.0;" +
				"\n\t}" +
				"\n\tvec2 theta = (fragTexCoord * 2.0) - 1.0;" +
				"\n\tfloat rSq = theta.x * theta.x + theta.y * theta.y;" +
				"\n\tvec2 rvec = theta * (1.0 + 0.22 * rSq + 0.24 * rSq * rSq);" +
				"\n\tvec2 texCoord = (distortionScale*rvec+(1.0-distortionScale)*lensCenter + 1.0) / 2.0;" +
				"\n\n\tif (any(notEqual(clamp(texCoord, vec2(0.0, 0.0), vec2(1.0, 1.0)) - texCoord,vec2(0.0, 0.0)))) {" +
				"\n\t\tdiscard;" +
				"\n\t} else {" +
				"\n\t\tvec3 col = texture2D(tex, texCoord).rgb;" +
				"\n\t\tgl_FragColor = vec4(col, 1.0);" +
				"\n\t}" +
				"\n}";
				leftShader.appendChild(leftfrag);

				leftApp.appendChild(leftShader);

				var leftPlane = document.createElement("plane");
				leftPlane.setAttribute("solid", "false");
				leftShape.appendChild(leftPlane);

				// Right eye
				var rightEye = document.createElement("group");
				rightEye.setAttribute("def", "right");
				rightEye.setAttribute("render", "false");
				eyeGroup.appendChild(rightEye);

				var rightShape = document.createElement("shape");
				rightShape.setAttribute("isPickable", "false");
				rightEye.appendChild(rightShape);

				var rightApp = document.createElement("appearance");
				rightShape.appendChild(rightApp);

				var rightTex = document.createElement("renderedtexture");
				rightTex.setAttribute("id", "rtRight");
				rightTex.setAttribute("stereoMode", "RIGHT_EYE");
				rightTex.setAttribute("update", "ALWAYS");
				rightTex.setAttribute("oculusRiftVersion", "2");
				//rightTex.setAttribute("dimensions", "980 1080 3");
				rightTex.setAttribute("repeatS", "false");
				rightTex.setAttribute("repeatT", "false");
				rightTex.setAttribute("interpupillaryDistance", this.IPD);
				rightApp.appendChild(rightTex);

				var rightPlane = document.createElement("plane");
				rightPlane.setAttribute("solid", "false");
				rightShape.appendChild(rightPlane);

				var rightVP = document.createElement("viewpoint");
				if (self.viewer.getCurrentViewpoint() !== null) {
					rightVP.setAttribute("use", self.viewer.getCurrentViewpoint().getAttribute("id"));
				}
				rightVP.setAttribute("containerfield", "viewpoint");
				rightVP.textContent = " ";
				rightTex.appendChild(rightVP);

				var rightBground = document.createElement("background");
				rightBground.setAttribute("use", "viewer_bground");
				rightBground.setAttribute("containerfield", "background");
				rightBground.textContent = " ";
				rightTex.appendChild(rightBground);

				var rightScene = document.createElement("group");
				rightScene.setAttribute("use", "model__root");
				rightScene.setAttribute("containerfield", "scene");
				rightScene.textContent = " ";
				rightTex.appendChild(rightScene);

				var rightShader = document.createElement("ComposedShader");
				var rightTexField = document.createElement("field");
				rightTexField.setAttribute("name", "tex");
				rightTexField.setAttribute("type", "SFInt32");
				rightTexField.setAttribute("value", "0");
				rightShader.appendChild(rightTexField);

				var rightvert = document.createElement("shaderPart");
				rightvert.setAttribute("type", "VERTEX");
				rightvert.textContent = "attribute vec3 position;" +
				"\nattribute vec2 texcoord;" +
				"\n" +
				"\nuniform mat4 modelViewProjectionMatrix;" +
				"\nvarying vec2 fragTexCoord;" +
				"\n" +
				"\nvoid main()" +
				"\n{" +
				"\n\tvec2 pos = sign(position.xy);" +
				"\n\tfragTexCoord = texcoord;" +
				"\n" +
				"\n\tgl_Position = vec4((pos.x + 1.0) / 2.0, pos.y, 0.0, 1.0);" +
				"\n}";
				rightShader.appendChild(rightvert);

				var rightfrag = document.createElement("shaderPart");
				rightfrag.setAttribute("USE", "vrfrag");
				rightfrag.setAttribute("type", "FRAGMENT");
				rightShader.appendChild(rightfrag);

				rightApp.appendChild(rightShader);

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

				self.viewer.switchFullScreen(self.vrHMD);

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

				self.viewer.runtime.enterFrame = function () {};
				self.viewer.runtime.exitFrame = function () {};

				self.viewer.getViewArea().skipSceneRender = null;

				self.viewer.switchFullScreen(self.vrHMD);

				self.viewer.nav.setAttribute("type", self.oldNavMode);
				self.oldNavMode = null;

				self.viewer.createBackground();
			}
		};

		this.startVR = function () {
			self.rtLeft		= $("#rtLeft")[0];
			self.rtRight	= $("#rtRight")[0];

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

				/*
				// The image should be split across the longest dimension of the screen
				var rotate = (h > w);

				if (rotate)
				{
					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,h / 2.0,w,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rtLeft._x3domNode._webgl.fbo.tex);

					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w,h / 2.0);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rtRight._x3domNode._webgl.fbo.tex);
				} else {
					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w / 2.0,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rtLeft._x3domNode._webgl.fbo.tex);

					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(w / 2,0,w / 2,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rtRight._x3domNode._webgl.fbo.tex);
				}
				*/

				if (w !== self.lastW || h !== self.lastH)
				{
					var half = 0;

					half = Math.round(w / 2);

					self.rtLeft.setAttribute("dimensions", half + " " + h + " 4");
					self.rtRight.setAttribute("dimensions", half + " " + h + " 4");

					self.lastW = w;
					self.lastH = h;
				}


				self.viewer.runtime.triggerRedraw();

			};
		};

		this.changeIPD = function(newIPD) {
			self.rtLeft.setAttribute("interpupillaryDistance", newIPD);
			self.rtRight.setAttribute("interpupillaryDistance", newIPD);
		};

		this.peturbIPD = function(peturbation) {
			var oldDistance = parseFloat(self.rtLeft.getAttribute("interpupillaryDistance"));
			this.changeIPD(oldDistance + peturbation);
		};

		this.exitFullscreen = function() {
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && self.enabled) {
				self.switchVR();
			}
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
