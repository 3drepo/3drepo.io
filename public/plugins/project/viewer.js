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

var Viewer = function(name, handle, x3ddiv, manager) {
	// Properties
	var self = this;

	if(!name)
		this.name = 'viewer';
	else
		this.name = name;

	if(handle)
		this.handle = handle;

	// If not given the tag by the manager
	// create here
	if (!x3ddiv)
		this.x3ddiv = $('#x3d')[0];
	else
		this.x3ddiv = x3ddiv;

	this.inline = null;
	this.runtime = null;
	this.fullscreen = false;

	this.clickingEnabled = false;

	this.avatarRadius = 0.5;

	this.defaultShowAll = true;

	this.zNear = -1;
	this.zFar  = -1;

	this.manager = null;

	this.initialized = false;

	this.init = function() {
		if (!self.initialized)
		{
			// If we have a viewer manager then it
			// will take care of initializing the runtime
			// else we'll do it ourselves
			if(manager) {
				self.manager = manager;
			} else {
				x3dom.runtime.ready = self.initRuntime;
			}

			if (self.manager) {
				self.displayMessage = self.manager.displayMessage;
			} else {
				self.displayMessage = function(text, textColor, timeout)
				{
					//TODO: Should we replicate the displayMessage stuff here ?
				}
			}

			// Set up the DOM elements
			self.viewer = document.createElement('x3d');
			self.viewer.setAttribute('id', self.name);
			self.viewer.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');
			self.viewer.setAttribute('keysEnabled', false);
			self.viewer.className = 'viewer';

			self.x3ddiv.appendChild(self.viewer);

			self.scene = document.createElement('scene');
			self.scene.setAttribute('onbackgroundclicked', 'bgroundClick(event);');
			self.viewer.appendChild(self.scene);

			self.viewPoint = document.createElement('viewpoint');
			self.viewPoint.setAttribute('id', name + '_current');
			self.viewPoint.setAttribute('def', name + '_current');
			self.scene.appendChild(self.viewPoint);

			self.bground = null;
			self.currentNavMode = null;

			self.createBackground();

			self.environ = document.createElement('environment');
			self.environ.setAttribute('frustumCulling', 'true');
			self.environ.setAttribute('smallFeatureCulling', 'true');
			self.environ.setAttribute('smallFeatureThreshold', 5);
			self.environ.setAttribute('occlusionCulling', 'true');
			self.scene.appendChild(self.environ);

			self.light = document.createElement('directionallight');
			//self.light.setAttribute('intensity', '0.5');
			self.light.setAttribute('color', '0.714, 0.910, 0.953');
			self.light.setAttribute('direction', '0, -0.9323, -0.362');
			self.light.setAttribute('global', 'true');
			self.light.setAttribute('ambientIntensity', '0.8');
			self.light.setAttribute('shadowIntensity', 0.0);
			self.scene.appendChild(self.light);

			self.nav = document.createElement('navigationInfo');
			self.nav.setAttribute('headlight', 'false');
			self.nav.setAttribute('type', 'TURNTABLE');
			self.viewPoint.appendChild(self.nav);

			self.viewer.addEventListener("keypress", function(e) {
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

			self.initialized = true;
		}
	}

	this.close = function() {
		self.viewer.parentNode.removeChild(self.viewer);
		self.viewer = null;
	}

	// This is called when the X3DOM runtime is initialized
	this.initRuntime = function (x3domruntime) {
		// If no manager, the calling object is the X3DOM runtime (this)
		// otherwise we reference the one attached to the manager.
		if (!self.manager)
			self.runtime = this;
		else
			self.runtime = self.viewer.runtime;

		self.showAll = function() {
			self.setNavMode("TURNTABLE");
			self.runtime.fitAll();
		}

		self.viewPoint.addEventListener('viewpointChanged', self.viewPointChanged);

		$(document).on("onLoaded", function(event, objEvent) {
			if(self.defaultShowAll)
				self.runtime.fitAll();
			else
				self.reset();

			var targetParent = $(objEvent.target)[0]._x3domNode._nameSpace.doc._x3dElem;

			self.loadViewpoints();

			if(targetParent == self.viewer)
				self.setDiffColors(null);

			// TODO: Clean this up.
			if ($("#model__mapPosition")[0])
				$("#model__mapPosition")[0].parentNode._x3domNode._graph.needCulling = false;
		});
	};

	this.createBackground = function() {
		if (self.bground)
			self.bground.parentNode.removeChild(self.bground);

		self.bground = document.createElement('background');

		self.bground.setAttribute('DEF', name + '_bground');
		self.bground.setAttribute('skyangle', '0.9 1.5 1.57');
		self.bground.setAttribute('skycolor', '0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1');
		self.bground.setAttribute('groundangle', '0.9 1.5 1.57');
		self.bground.setAttribute('groundcolor', '0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91');
		self.bground.textContent = ' ';

		self.scene.appendChild(self.bground);
	};

	/*
	this.displayMessage = function(text, textColor, timeout) {
		self.messageBoxMessage.innerHTML = text;
		self.messageBox.style["display"] = "";

		// Construct RGBA string
		var rgbstr = "RGB(" + textColor[0] + ", " + textColor[1] + ", " + textColor[2] + ")";
		self.messageBoxMessage.style["text-color"] = rgbstr;

		setTimeout( function() {
			self.messageBox.style["display"] = "none";
		}, timeout);
	}
	*/

	this.switchDebug = function () {
		self.getViewArea()._visDbgBuf = !self.getViewArea()._visDbgBuf;
	}

	this.showStats = function () {
		self.runtime.canvas.stateViewer.display()
	}

	this.getViewArea = function() {
		return self.runtime.canvas.doc._viewarea;
	}

	this.getViewMatrix = function() {
		return self.getViewArea().getViewMatrix();
	}

	this.getProjectionMatrix = function()
	{
		return self.getViewArea().getProjectionMatrix();
	}

	this.onViewpointChanged = function(functionToBind)
	{
		$(self.viewer).on("myViewpointHasChanged", functionToBind);
	}

	this.offViewpointChanged = function(functionToBind)
	{
		$(self.viewer).off("myViewpointHasChanged", functionToBind);
	}

	this.viewPointChanged = function(event)
	{
		self.getCurrentViewpoint();
		$(self.viewer).trigger("myViewpointHasChanged", event);
	}

	this.onBackgroundClicked = function(functionToBind)
	{
		$(document).on("bgroundClicked", functionToBind);
	}

	this.offBackgroundClicked = function(functionToBind)
	{
		$(document).off("bgroundClicked", functionToBind);
	}

	this.triggerSelected = function(node)
	{
		$.event.trigger("objectSelected", node);
	}

	$(document).on("objectSelected", function(event, object, zoom) {
		if(zoom)
			self.lookAtObject(group);

		self.setApp(object);
	});

	this.onClickObject = function(functionToBind)
	{
		$(document).on("clickObject", functionToBind);
	}

	this.offClickObject = function(functionToBind)
	{
		$(document).off("clickObject", functionToBind);
	}

	if(0)
	{
		this.moveScale = 1.0;

		self.viewer.addEventListener("keypress", function(e) {
			var mapPos = $("#model__mapPosition")[0];
			var oldTrans = mapPos.getAttribute("translation").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'q'.charCodeAt(0))
			{
				oldTrans[0] = oldTrans[0] + 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'w'.charCodeAt(0))
			{
				oldTrans[0] = oldTrans[0] - 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'e'.charCodeAt(0))
			{
				oldTrans[2] = oldTrans[2] + 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'f'.charCodeAt(0))
			{
				oldTrans[2] = oldTrans[2] - 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			var mapRotation = $("#model__mapRotation")[0];
			var oldRotation = mapRotation.getAttribute("rotation").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'g'.charCodeAt(0))
			{
				oldRotation[3] = oldRotation[3] + 0.01 * self.moveScale;
				mapRotation.setAttribute("rotation", oldRotation.join(","));
			}

			if(e.charCode == 'h'.charCodeAt(0))
			{
				oldRotation[3] = oldRotation[3] - 0.01 * self.moveScale;
				mapRotation.setAttribute("rotation", oldRotation.join(","));
			}

			var oldScale = mapPos.getAttribute("scale").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'j'.charCodeAt(0))
			{
				oldScale[0] = oldScale[0] + 0.01 * self.moveScale;
				oldScale[2] = oldScale[2] + 0.01 * self.moveScale;

				mapPos.setAttribute("scale", oldScale.join(","));
			}

			if(e.charCode == 'k'.charCodeAt(0))
			{
				oldScale[0] = oldScale[0] - 0.01 * self.moveScale;
				oldScale[2] = oldScale[2] - 0.01 * self.moveScale;

				mapPos.setAttribute("scale", oldScale.join(","));
			}
		});
	}

	this.viewpoints = {};
	this.selectedViewpoint = 0;

	this.isFlyingThrough = false;
	this.flyThroughTime = 1000;

	this.flyThrough = function()
	{
		if (!self.isFlyingThrough)
		{
			self.isFlyingThrough = true;
			setTimeout(self.flyThroughTick, self.flyThroughTime);
		} else {
			self.isFlyingThrough = false;
		}
	}

	this.flyThroughTick = function()
	{
		var newViewpoint = self.selectedViewpoint + 1;

		if (newViewpoint == self.viewpoints.length)
			newViewpoint = 0;

		self.setCurrentViewpoint(newViewpoint);

		if (self.isFlyingThrough)
			setTimeout(self.flyThroughTick, self.flyThroughTime);
	}

	this.loadViewpoints = function()
	{
		var viewpointList = $("viewpoint");

		for(var v = 0; v < viewpointList.length; v++)
		{
			if(viewpointList[v]["id"] != "viewer_current")
			{
				var id		= viewpointList[v]["id"].trim();
				var group	= id.split("__")[0].trim();
				var name	= id.split("__")[1].trim();

				if (!self.viewpoints[group])
					self.viewpoints[group] = {};

				self.viewpoints[group][name] = id;
			}
		}
	}

/*
	this.parseViewpoints = function(settings)
	{
		// Always have origin
		var tmpView = {};
		tmpView["idx"] = 0;
		tmpView["name"] = "Origin";
		tmpView["position"] = [0.0, 0.0, 0.0];
		tmpView["direction"] = [0.0, 0.0, -1.0];

		self.viewpoints.push(tmpView);

		for(var i = 0; i < settings['viewpoints'].length; i++)
		{
			var tmpView = {};
			var currentViewpoint = settings['viewpoints'][i];

			tmpView["idx"] = i + 1;
			if ("name" in currentViewpoint)
				tmpView["name"] = currentViewpoint["name"];
			else
				tmpView["name"] = "Viewpoint " + (self.viewpoints.length + 1);

			if ("position" in currentViewpoint)
				tmpView["position"] = currentViewpoint["position"];
			else
				tmpView["position"] = [0.0,0.0,0.0];

			if ("direction" in currentViewpoint)
				tmpView["direction"] = currentViewpoint["direction"];
			else
				tmpView["direction"] = [0.0, 0.0, -1.0];

			self.viewpoints.push(tmpView);
		}
	}
*/

	this.setCurrentViewpoint = function(id)
	{
		self.selectedViewpoint = id;

		var viewpoint  = $("[id='" + id +"']")[0];
		viewpoint.setAttribute("bind", true);
		viewpoint.resetView();
		viewpoint.addEventListener('viewpointChanged', self.viewPointChanged);
	}

	this.updateSettings = function(settings)
	{
		if (settings)
		{
			// TODO: Can this function be merged with the init ?
			if ('zNear' in settings)
				self.zNear = settings['zNear'];

			if ('zFar' in settings)
				self.zFar  = settings['zFar'];

			if ('start_all' in settings)
				self.defaultShowAll = settings['start_all'];

			if ('visibilityLimit' in settings)
				self.nav.setAttribute('visibilityLimit', settings['visibilityLimit']);
		}
	}

	this.lookAtObject = function(obj)
	{
		self.runtime.fitObject(obj, true);
	};

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

	this.pickObject = {};

	this.pickPoint = function(x,y)
	{
		var viewArea = self.getViewArea();
		var scene	 = viewArea._scene;

		var oldPickMode = scene._vf.pickMode.toLowerCase();
		scene._vf.pickMode = "idbuf24";
		var success = scene._nameSpace.doc.ctx.pickValue(viewArea, x, y);

		self.pickObject.pickPos		= viewArea._pickingInfo.pickPos;
		self.pickObject.pickNorm	= viewArea._pickingInfo.pickNorm;
		self.pickObject.pickObj		= viewArea._pickingInfo.pickObj;
	}

	this.oneGrpNodes = [];
	this.twoGrpNodes = [];

	this.setApp = function(group)
	{
		self.applyApp(self.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
		self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
		self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

		if (group)
		{
			self.twoGrpNodes = group.getElementsByTagName("TwoSidedMaterial");
			self.oneGrpNodes = group.getElementsByTagName("Material");
		} else {
			self.oneGrpNodes = [];
			self.twoGrpNodes = [];
		}

		self.applyApp(self.oneGrpNodes, 0.5, "1.0 0.5 0.0", false);
		self.applyApp(self.twoGrpNodes, 0.5, "1.0 0.5 0.0", false);
		self.applyApp(self.twoGrpNodes, 0.5, "1.0 0.5 0.0", true);
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

	this.rotQuat = function(from, to)
	{
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);
		var qt = new x3dom.fields.Quaternion(crossVec.x, crossVec.y, crossVec.z, 1);

		qt.w = vecFrom.length() * vecTo.length() + dot;

		return qt.normalize(qt);
	}

	/*
	this.quatLookAt = function (up, forward)
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
	}
	*/

	function scale(v, s)
	{
		return [v[0] * s, v[1] * s, v[2] * s];
	}

	function normalize(v)
	{
		var sz =  Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		return scale(v, 1 / sz);
	}

	function dotProduct(a,b)
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	function crossProduct(a,b)
	{
		var x = a[1] * b[2] - a[2] * b[1];
		var y = a[2] * b[0] - a[0] * b[2];
		var z = a[0] * b[1] - a[1] * b[0];

		return [x,y,z];
	}

	function vecAdd(a,b)
	{
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	}

	function vecSub(a,b)
	{
		return vecAdd(a, scale(b,-1));
	}

	this.setNavMode = function(mode) {
		if (self.currentNavMode != mode)
		{
			// If the navigation mode has changed

			if (mode == 'WAYFINDER') // If we are entering wayfinder navigation
				waypoint.init();

			if (self.currentNavMode == 'WAYFINDER') // Exiting the wayfinding mode
				waypoint.close();
		}
		if((self.currentNavMode == 'WAYFINDER') && (mode != 'WAYFINDER'))
		{
			waypoint.close();
		}

		self.currentNavMode = mode;
		self.nav.setAttribute('type', mode);

		if (mode == 'WALK')
		{
			self.disableClicking();
			self.setApp(null);
		} else {
			self.enableClicking();
		}

		if ((mode == 'WAYFINDER') && waypoint)
			waypoint.resetViewer();
	}

	this.reload = function() {
		x3dom.reload();
	}

	this.startingPoint = [0.0,0.0,0.0];
	this.setStartingPoint = function(x,y,z)
	{
		self.startingPoint[0] = x;
		self.startingPoint[1] = y;
		self.startingPoint[2] = z;
	}

	this.defaultOrientation = [0.0, 0.0, 1.0];
	this.setStartingOrientation = function(x,y,z)
	{
		self.defaultOrientation[0] = x;
		self.defaultOrientation[1] = y;
		self.defaultOrientation[2] = z;
	}


	this.currentCameraPosition = this.defaultOrientation;
	this.currentCameraOrientation = [0.0, 0.0, 0.0];

	this.setCameraPosition = function(x,y,z)
	{
		self.currentCameraPosition = [x,y,z];
		self.updateCamera();
	}

	this.moveCamera = function(dX, dY, dZ)
	{
		self.currentCameraPosition[0] += dX;
		self.currentCameraPosition[1] += dY;
		self.currentCameraPosition[2] += dZ;
		self.updateCamera();
	}

	this.setCameraViewDir = function(u,v,w)
	{
		self.currentCameraOrientation = [u,v,w];
		self.updateCamera();
	}

	this.updateCamera = function()
	{
		var quat = self.rotToRotation(self.defaultOrientation, self.currentCameraOrientation);

		var nextPoint = document.createElement('viewpoint');
		self.scene.appendChild(nextPoint);
		nextPoint.setAttribute('id', 'next');
		nextPoint.setAttribute("position", self.currentCameraPosition.join(" "));
		nextPoint.setAttribute("orientation", quat);

		oldViewPoint = self.viewPoint;
		self.viewPoint = nextPoint;
		self.viewPoint.appendChild(self.nav);
		self.viewPoint.setAttribute('bind', 'true');
		self.viewPoint.setAttribute('zNear', self.zNear);
		self.viewPoint.setAttribute('zFar', self.zFar);

		self.setCurrentViewpoint('next');

		if(self.linked)
			self.manager.switchMaster(self.handle);

		setTimeout(function(oldViewPoint){
			oldViewPoint.parentNode.removeChild(oldViewPoint);
		}, 0, oldViewPoint); // Remove old viewpoint, once everything is done.
	}

	this.linked = false;
	this.linkMe = function()
	{
		// Need to be attached to the viewer master
		if (!self.manager)
			return;

		self.manager.linkMe(self.handle);
		self.onViewpointChanged(self.manager.viewpointLinkFunction);

		self.viewer.addEventListener('mousedown', function () {
			self.manager.switchMaster(self.handle);
		});

		self.linked = true;
	}

	this.setCamera = function(x,y,z,u,v,w)
	{
		self.currentCameraPosition = [x,y,z];
		self.currentCameraOrientation = [u,v,w];
		self.updateCamera();
	}

	this.collDistance = 0.1;
	this.changeCollisionDistance = function(collDistance)
	{
		self.collDistance = collDistance;
		self.nav._x3domNode._vf.avatarSize[0] = collDistance;
	}

	this.avatarHeight = 1.83;
	this.changeAvatarHeight = function(height)
	{
		self.avatarHeight = height;
		self.nav._x3domNode._vf.avatarSize[1] = height;
	}

	this.stepHeight = 0.4;
	this.changeStepHeight = function(stepHeight)
	{
		self.stepHeight = stepHeight;
		self.nav._x3domNode._vf.avatarSize[2] = stepHeight;
	}

	this.reset = function()
	{
		self.setCamera(self.startingPoint[0], self.startingPoint[1], self.startingPoint[2],
			self.defaultOrientation[0], self.defaultOrientation[1], self.defaultOrientation[2]);

		self.changeCollisionDistance(self.collDistance);
		self.changeAvatarHeight(self.avatarHeight);
		self.changeStepHeight(self.stepHeight);
	}

	this.loadURL = function(url)
	{
		if(self.inline)
		{
			self.inline.parentNode.removeChild(self.inline);
			self.inline = null;		// Garbage collect
		}

		self.inline = document.createElement('inline');
		self.scene.appendChild(self.inline);
		self.inline.setAttribute('namespacename', 'model');
		self.inline.setAttribute('onload', 'onLoaded(event);');
		self.inline.setAttribute('url', url);
		self.reload();

		self.url = url;
	}

	this.getCurrentViewpoint = function()
	{
		var viewPoint = {};

		var viewTrans	= self.getViewArea()._scene.getViewpoint().getCurrentTransform();
		var viewMat		= self.getViewMatrix();

		viewTrans = viewTrans.inverse().mult(viewMat);
		viewTrans = viewTrans.inverse();

		var viewUp  = viewTrans.e1();
		var viewDir = viewTrans.e2();
		var viewPos = viewTrans.e3();


		// More viewing direction than lookAt to sync with Assimp
		viewPoint["up"] = [viewUp.x, viewUp.y, viewUp.z];
		viewPoint["position"] = [viewPos.x, viewPos.y, viewPos.z];
		viewPoint["look_at"] = [viewDir.x, viewDir.y, viewDir.z];

		var projMat = self.getProjectionMatrix();

		viewPoint["fov"]	= Math.atan((1 / projMat._00)) * 2.0;
		viewPoint["aspect_ratio"]	= viewPoint["fov"] / projMat._11;

		var f = projMat._23 / (projMat._22 + 1);
		var n = (f * projMat._23) / (projMat._23 - 2 * f);

		viewPoint["far"]	= f;
		viewPoint["near"]	= n;

		return viewPoint;
	}


	this.speed = 2.0;
	this.setSpeed = function(speed)
	{
		self.speed = speed;
		self.nav.speed = speed;
	}

	this.bgroundClick = function(event) {
		self.triggerSelected(null);
	}

	this.clickObject = function(event, objEvent) {
		self.triggerSelected(objEvent.target);
	}

	this.disableClicking = function() {
		if(self.clickingEnabled)
		{
			self.offBackgroundClicked(self.bgroundClick);
			self.offClickObject(self.clickObject);
			self.viewer.setAttribute("disableDoubleClick", true);
			self.clickingEnabled = false;
		}
	}

	this.enableClicking = function() {
		if(!self.clickingEnabled)
		{
			// When the user clicks on the background the select nothing.
			self.onBackgroundClicked(self.bgroundClick);
			self.onClickObject(self.clickObject);
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
			if (self.viewer.mozRequestFullScreen) {
				self.viewer.mozRequestFullScreen({
					vrDisplay: vrHMD
				});
			} else if (self.viewer.webkitRequestFullscreen) {
				self.viewer.webkitRequestFullscreen({
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

	this.setDiffColors = function(diffColors) {
		if(diffColors)
			self.diffColors = diffColors;

		if (self.diffColors)
		{
			if (self.inline.childNodes.length)
			{
				var defMapSearch = self.inline.childNodes[0]._x3domNode._nameSpace.defMap;

				if(self.diffColors["added"])
				{
					for(var i = 0; i < self.diffColors["added"].length; i++)
					{
						// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
						var obj = defMapSearch[self.diffColors["added"][i]];
						if(obj)
						{
							var mat = $(obj._xmlNode).find("TwoSidedMaterial");
							self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
						}
					}
				}

				if(self.diffColors["deleted"])
				{
					for(var i = 0; i < self.diffColors["deleted"].length; i++)
					{
						// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
						var obj = defMapSearch[self.diffColors["deleted"][i]];
						if(obj)
						{
							var mat = $(obj._xmlNode).find("TwoSidedMaterial");
							self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
						}
					}
				}
			}
		}
	};
};


