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

var Viewer = function(id) {
	var self = this;

	if(!id)
		id = 'viewer';

	// Create the viewer here
	var x3ddiv = $('#x3d')[0];

	this.viewer = document.createElement('x3d');
	this.viewer.setAttribute('id', id);
	this.viewer.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');
	this.viewer.setAttribute('keysEnabled', false);
	this.viewer.className = 'viewer';

	x3ddiv.appendChild(this.viewer);

	this.scene = document.createElement('scene');
	this.scene.setAttribute('onbackgroundclicked', 'bgroundClick(event);');
	this.viewer.appendChild(this.scene);

	this.viewPoint = document.createElement('viewpoint');
	this.viewPoint.setAttribute('id', id + '_current');
	this.viewPoint.setAttribute('def', id + '_current');
	this.scene.appendChild(this.viewPoint);

	this.bground = document.createElement('background');
	this.bground.setAttribute('DEF', id + '_bground');
	this.bground.setAttribute('skyangle', '0.9 1.5 1.57');
	this.bground.setAttribute('skycolor', '0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1');
	this.bground.setAttribute('groundangle', '0.9 1.5 1.57');
	this.bground.setAttribute('groundcolor', '0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91');
	this.bground.textContent = ' ';
	this.scene.appendChild(this.bground);

	this.environ = document.createElement('environment');
	this.environ.setAttribute('frustumCulling', 'true');
	this.environ.setAttribute('smallFeatureCulling', 'true');
	this.environ.setAttribute('smallFeatureThreshold', 5);
	this.environ.setAttribute('occlusionCulling', 'true');
	this.scene.appendChild(this.environ);

	this.light = document.createElement('directionallight');
	//this.light.setAttribute('intensity', '0.5');
	this.light.setAttribute('color', '0.714, 0.910, 0.953');
	this.light.setAttribute('direction', '0, -0.9323, -0.362');
	this.light.setAttribute('global', 'true');
	this.light.setAttribute('ambientIntensity', '0.8');
	this.light.setAttribute('shadowIntensity', 0.0);
	this.scene.appendChild(this.light);

	this.nav = document.createElement('navigationInfo');
	this.nav.setAttribute('headlight', 'false');
	this.nav.setAttribute('type', 'TURNTABLE');
	this.viewPoint.appendChild(this.nav);

	this.inline = null;
	this.runtime = null;

	this.fullscreen = false;

	this.clickingEnabled = false;

	this.avatarRadius = 0.5;

	this.switchDebug = function () {
		this.getViewArea()._visDbgBuf = !this.getViewArea()._visDbgBuf;
	}

	this.initRuntime = function () {
		self.runtime = this;

		self.showAll = function() {
			self.runtime.fitAll();
		}

		$(document).on("onLoaded", function(event, objEvent) {
			self.runtime.fitAll();

			var targetParent = $(objEvent.target)[0]._x3domNode._nameSpace.doc._x3dElem;

			if(targetParent == self.viewer)
			{
				self.setDiffColors(null);
			}

			self.setNavMode("EXAMINE");
		});
	};

	this.getViewArea = function() {
		return viewer.scene._x3domNode._nameSpace.doc._viewarea;
	}

	this.getViewMatrix = function() {
		return this.getViewArea().getViewMatrix();
	}

	this.getProjectionMatrix = function()
	{
		return this.getViewArea().getProjectionMatrix();
	}

	if(window.oculus)
	{
		this.viewer.addEventListener("keypress", function(e) {
			if (e.charCode == 'o'.charCodeAt(0))
			{
				self.switchVR();
			}
		});
	}

	this.viewer.addEventListener("keypress", function(e) {
		if (e.charCode == 'r'.charCodeAt(0))
		{
			self.reset();
			self.setApp(null);
			self.setNavMode("WALK");
			self.disableClicking();
		} else if (e.charCode == 'a'.charCodeAt(0)) {
			self.showAll();
			self.setNavMode("EXAMINE");
			self.enableClicking();
		} else if (e.charCode == 'n'.charCodeAt(0)) {
			self.setNavMode("TURNTABLE");
			self.enableClicking();
		} else if (e.charCode == 'w'.charCodeAt(0)) {
			self.setNavMode("WALK");
		} else if (e.charCode == 'e'.charCodeAt(0)) {
			self.setNavMode("EXAMINE");
			self.enableClicking();
		}
	});

	if(0)
	{
		this.viewer.addEventListener("keypress", function(e) {
			var mapPos = $("#model__mapPosition")[0];
			var oldTrans = mapPos.getAttribute("translation").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'q'.charCodeAt(0))
			{
				oldTrans[0] = oldTrans[0] + 0.1;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'w'.charCodeAt(0))
			{
				oldTrans[0] = oldTrans[0] - 0.1;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'e'.charCodeAt(0))
			{
				oldTrans[2] = oldTrans[2] + 0.1;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'f'.charCodeAt(0))
			{
				oldTrans[2] = oldTrans[2] - 0.1;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			var mapRotation = $("#model__mapRotation")[0];
			var oldRotation = mapRotation.getAttribute("rotation").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'g'.charCodeAt(0))
			{
				oldRotation[3] = oldRotation[3] + 0.01;
				mapRotation.setAttribute("rotation", oldRotation.join(","));
			}

			if(e.charCode == 'h'.charCodeAt(0))
			{
				oldRotation[3] = oldRotation[3] - 0.01;
				mapRotation.setAttribute("rotation", oldRotation.join(","));
			}

			var oldScale = mapPos.getAttribute("scale").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'j'.charCodeAt(0))
			{
				oldScale[0] = oldScale[0] + 0.01;
				oldScale[2] = oldScale[2] + 0.01;

				mapPos.setAttribute("scale", oldScale.join(","));
			}

			if(e.charCode == 'k'.charCodeAt(0))
			{
				oldScale[0] = oldScale[0] - 0.01;
				oldScale[2] = oldScale[2] - 0.01;

				mapPos.setAttribute("scale", oldScale.join(","));
			}
		});
	}

	x3dom.runtime.ready = this.initRuntime;

	this.updateSettings = function(settings)
	{
		if (settings)
		{
			// TODO: Can this function be merged with the init ?
			if ('zNear' in settings)
				this.viewPoint.setAttribute('zNear', settings['zNear']);

			if ('zFar' in settings)
				this.viewPoint.setAttribute('zFar', settings['zFar']);

			if ('viewpoints' in settings)
			{
				if(settings['viewpoints'].length > 0)
				{
					var currentViewpoint = settings["viewpoints"][0];

					if("position" in currentViewpoint)
					{
						self.setStartingPoint(
							currentViewpoint["position"][0],
							currentViewpoint["position"][1],
							currentViewpoint["position"][2]
						);
					}
					if("direction" in currentViewpoint)
					{
						self.setStartingOrientation(
							currentViewpoint["direction"][0],
							currentViewpoint["direction"][1],
							currentViewpoint["direction"][2]
						);
					}
				}
			}
		}
	}

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

	this.defaultOrientation = [0.0, 0.0, 1.0];
	this.setStartingOrientation = function(x,y,z)
	{
		this.defaultOrientation[0] = x;
		this.defaultOrientation[1] = y;
		this.defaultOrientation[2] = z;
	}


	this.currentCameraPosition = this.defaultOrientation;
	this.currentCameraOrientation = [0.0, 0.0, 0.0];

	this.setCameraPosition = function(x,y,z)
	{
		this.currentCameraPosition = [x,y,z];
		this.updateCamera();
	}

	this.moveCamera = function(dX, dY, dZ)
	{
		this.currentCameraPosition[0] += dX;
		this.currentCameraPosition[1] += dY;
		this.currentCameraPosition[2] += dZ;
		this.updateCamera();
	}

	this.setCameraViewDir = function(u,v,w)
	{
		this.currentCameraOrientation = [u,v,w];
		this.updateCamera();
	}

	this.updateCamera = function()
	{
		var quat = this.rotToRotation(this.defaultOrientation, this.currentCameraOrientation);

		var nextPoint = document.createElement('viewpoint');
		this.scene.appendChild(nextPoint);
		nextPoint.setAttribute('id', 'next');
		nextPoint.setAttribute("position", this.currentCameraPosition.join(" "));
		nextPoint.setAttribute("orientation", quat);

		oldViewPoint = this.viewPoint;
		this.viewPoint = nextPoint;
		this.viewPoint.appendChild(this.nav);
		this.viewPoint.setAttribute('set_bind', 'true');

		this.viewPoint.addEventListener('viewpointChanged', onViewpointChange, false);

		setTimeout(function(oldViewPoint){
			oldViewPoint.parentNode.removeChild(oldViewPoint);
		}, 0, oldViewPoint); // Remove old viewpoint, once everything is done.
	}

	this.setCamera = function(x,y,z,u,v,w)
	{
		this.currentCameraPosition = [x,y,z];
		this.currentCameraOrientation = [u,v,w];
		this.updateCamera();
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
		this.scene.appendChild(this.inline);
		this.inline.setAttribute('namespacename', 'model');
		this.inline.setAttribute('onload', 'onLoaded(event);');
		this.inline.setAttribute('url', url);
		this.reload();

		this.url = url;
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

	this.bgroundClick = function(event) {
		self.setApp(null);
	}

	this.clickObject = function(event, objEvent) {
		self.setApp(objEvent.target);
	}

	this.disableClicking = function() {
		if(self.clickingEnabled)
		{
			$(document).off("bgroundClicked", self.bgroundClick);
			$(document).off("clickObject", self.clickObject);
			self.viewer.setAttribute("disableDoubleClick", true);
			self.clickingEnabled = false;
		}
	}

	this.enableClicking = function() {
		if(!self.clickingEnabled)
		{
			// When the user clicks on the background the select nothing.
			$(document).on("bgroundClicked", self.bgroundClick);
			$(document).on("clickObject", self.clickObject);
			self.viewer.setAttribute("disableDoubleClick", false);
			self.clickingEnabled = true;
		}
	}

	this.switchFullScreen = function() {
		var vrHMD = null;

		if (window.oculus)
			vrHMD = window.oculus.vrHMD;

		if (!self.fullscreen)
		{
			if (this.viewer.mozRequestFullScreen) {
				this.viewer.mozRequestFullScreen({
					vrDisplay: vrHMD
				});
			} else if (this.viewer.webkitRequestFullscreen) {
				this.viewer.webkitRequestFullscreen({
					vrDisplay: vrHMD,
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

	this.switchVR = function() {
		if (window.oculus)
			window.oculus.switchVR(this);
	};

	this.linkViewpoints = function(otherView) {

		this.viewPoint.addEventListener('viewpointChanged', function (event) {
			var newPos = event.position.x + "," + event.position.y + "," + event.position.z;
			var newOrient = event.orientation[0].x + "," + event.orientation[0].y + "," + event.orientation[0].z
				+ "," + event.orientation[1];

			// TODO: Consider using DEF/USE instead (although across namespaces)
			otherView.viewPoint.setAttribute("position", newPos);
			otherView.viewPoint.setAttribute("orientation", newOrient);

			//otherView.setNavMode("NONE");
		});
	};

	this.diffView = function() {
		this.viewer.style.width = "50%";
		window.otherView = new Viewer('diffView');
		otherView.viewer.style.left = "50%";
		otherView.viewer.style.width = "50%";
		otherView.loadURL(this.url);

		this.linkViewpoints(otherView);
		this.setNavMode("TURNTABLE");
		otherView.setNavMode("NONE");
		//otherView.linkViewpoints(this);
	};

	this.setDiffColors = function(diffColors) {
		if(diffColors)
			this.diffColors = diffColors;

		if (this.inline.childNodes.length)
		{
			var defMapSearch = this.inline.childNodes[0]._x3domNode._nameSpace.defMap;

			if(this.diffColors["added"])
			{
				for(var i = 0; i < this.diffColors["added"].length; i++)
				{
					// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
					var obj = defMapSearch[this.diffColors["added"][i]];
					if(obj)
					{
						var mat = $(obj._xmlNode).find("TwoSidedMaterial");
						this.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
					}
				}
			}

			if(this.diffColors["deleted"])
			{
				for(var i = 0; i < this.diffColors["deleted"].length; i++)
				{
					// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
					var obj = defMapSearch[this.diffColors["deleted"][i]];
					if(obj)
					{
						var mat = $(obj._xmlNode).find("TwoSidedMaterial");
						this.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
					}
				}
			}
		}
	};

	// TODO(mg): find a better place to put this
	this.initUi = function() {
		$(".panel-collapse-btn").click(function() {
			var parent = $(this).parent();
			if (parent.hasClass("collapsed")) {
				parent.switchClass("collapsed", 100);
			} else {
				parent.switchClass([], "collapsed", 100);
			}
		});
	};

	this.initUi();
};


