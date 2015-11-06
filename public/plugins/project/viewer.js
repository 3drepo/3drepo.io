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

var logo_string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAB0CAMAAACcw5TeAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAA/SAAAP0gH7iTvJAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////vy5IYQAAAP90Uk5TAAECAwQF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";

// --------------------- Control Interface ---------------------

function bgroundClick(event){
	$.event.trigger("bgroundClicked", event);
};

function clickObject(event) {
	$.event.trigger("clickObject", event);
};

function clickPin(event) {
	var pinGroupObject = event.hitObject.parentElement.parentElement.parentElement;
	$.event.trigger("pinClick", {
			fromViewer: true,
			object: pinGroupObject
		});
}

function onMouseOver(event){
	$.event.trigger("onMouseOver", event);
}

function onMouseDown(event){
	$.event.trigger("onMouseDown", event);
}

function onMouseUp(event){
	$.event.trigger("onMouseUp", event);
}

function onMouseMove(event){
	$.event.trigger("onMouseMove", event);
}

function onMouseOver(event){
	$.event.trigger("onMouseOver", event);
}

function onViewpointChange(event){
	$.event.trigger("onViewpointChange", event);
}

function onLoaded(event){
	$.event.trigger("onLoaded", event);
}

function runtimeReady() {
	$.event.trigger("runtimeReady");
}

x3dom.runtime.ready = runtimeReady;

// ----------------------------------------------------------

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
	this.loadedPromise = $.Deferred();

	this.downloadsLeft = 1;

	this.defaultNavMode = "TURNTABLE";

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

			self.logo = document.createElement('div');
			self.logo.setAttribute('id', 'viewer_logo');
			self.logo.setAttribute('style', 'top: 0px; left: 0px; position: absolute; z-index:2;');

			self.logoImage = document.createElement('img');
			self.logoImage.setAttribute('src', logo_string);
			self.logoImage.setAttribute('style', 'width: 150px;')
			self.logoImage.textContent = ' ';

			self.logoLink = document.createElement('a');
			self.logoLink.setAttribute('href', 'https://3drepo.io');
			self.logoLink.setAttribute('style', 'top: 0px; left: 0px; padding: 10px; position: absolute;')
			self.logoLink.appendChild(self.logoImage);

			self.logo.appendChild(self.logoLink);

			//self.logo.setAttribute('style', 'top: 0px; left: 0px; padding: 10px; position: absolute; z-index:10000;')
			self.x3ddiv.appendChild(self.logo);

			// Set up the DOM elements
			self.viewer = document.createElement('x3d');
			self.viewer.setAttribute('id', self.name);
			self.viewer.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');
			self.viewer.setAttribute('keysEnabled', false);
			self.viewer.setAttribute('mousedown', onMouseDown);
			self.viewer.setAttribute('mouseup', onMouseUp);

			self.viewer.className = 'viewer';

			self.x3ddiv.appendChild(self.viewer);

			self.scene = document.createElement('scene');
			self.scene.setAttribute('onbackgroundclicked', 'bgroundClick(event);');
			self.viewer.appendChild(self.scene);

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

			self.createViewpoint(self.name + "_default");

			self.nav = document.createElement('navigationInfo');
			self.nav.setAttribute('headlight', 'false');
			self.nav.setAttribute('type', self.defaultNavMode);
			self.scene.appendChild(self.nav);

			self.loadViewpoint = self.name + "_default"; // Must be called after creating nav

			self.viewer.addEventListener("keypress", function(e) {
				if (e.charCode == 'r'.charCodeAt(0))
				{
					self.reset();
					self.setApp(null);
					self.setNavMode("WALK");
					self.disableClicking();
				} else if (e.charCode == 'a'.charCodeAt(0)) {
					self.showAll();
					self.enableClicking();
				}
			});

			self.addAxes();
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

		if (!self.manager) {
			if (this.doc.id === "viewer") {
				self.runtime = this;
			}
		} else {
			self.runtime = self.viewer.runtime;
		}

		self.showAll = function() {
			self.runtime.fitAll();

			// TODO: This is a hack to get around a bug in X3DOM
			self.getViewArea()._flyMat = null;

			self.setNavMode(self.defaultNavMode);
		}

		self.getCurrentViewpoint().addEventListener('viewpointChanged', self.viewPointChanged);

		$(document).on("onLoaded", function(event, objEvent) {
			if (self.loadViewpoint)
				self.setCurrentViewpoint(self.loadViewpoint);

			var targetParent = $(objEvent.target)[0]._x3domNode._nameSpace.doc._x3dElem;

			self.loadViewpoints();

			if(targetParent == self.viewer)
				self.setDiffColors(null);

			// TODO: Clean this up.
			if ($("#model__mapPosition")[0])
				$("#model__mapPosition")[0].parentNode._x3domNode._graph.needCulling = false;

			self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);

			self.showAll();

			if (!self.downloadsLeft)
				self.loadedPromise.resolve();
		});
	};

	this.whenLoaded = function( callback ) {
		self.loadedPromise.done(callback);
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

	this.onMouseUp = function(functionToBind)
	{
		$(self.viewer).on("onMouseUp", functionToBind);
	}

	this.onMouseDown = function(functionToBind)
	{
		$(self.viewer).on("onMouseDown", functionToBind);
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
		var vpInfo  = self.getCurrentViewpointInfo();
		var eye     = vpInfo["position"];
		var viewDir = vpInfo["view_dir"];

		if (self.currentNavMode == 'HELICOPTER')
		{
			self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
			self.nav._x3domNode._vf.typeParams[1] = eye[1];
		}

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

	this.triggerPartSelected = function(part)
	{
		$.event.trigger("partSelected", part);
	}

	$(document).on("partSelected", function(event, part, zoom) {
		if(zoom)
			part.fit();

		if (self.oldPart)
			self.oldPart.resetColor();

		self.oldPart = part;
		part.setEmissiveColor("1.0 0.5 0.0", "front");

		var obj          = {};
		obj["multipart"] = true;
		obj["id"]        = part.multiPart._nameSpace.name + "__" + part.partID;

		$(document).trigger("objectSelected", obj);
	});

	$(document).on("objectSelected", function(event, object, zoom) {
		if (object !== undefined)
		{
			if (!object.hasOwnProperty("multipart")) {
				if(zoom)
					if (!(object.getAttribute("render") == "false"))
						self.lookAtObject(object);
			}
		}

		self.setApp(object);
	});

	$(document).on("pinClick", function(event, clickInfo) {
		self.setApp(clickInfo.object, "0.5 0.5 1.0");
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

		self.x3ddiv.addEventListener("keypress", function(e) {
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
	this.viewpointsNames = {};

	this.selectedViewpointIdx = 0;
	this.selectedViewpoint    = null;

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
		var newViewpoint = self.selectedViewpointIdx + 1;

		if (newViewpoint == self.viewpoints.length)
			newViewpoint = 0;

		self.setCurrentViewpoint(self.viewpoints[newViewpoint]);

		if (self.isFlyingThrough)
			setTimeout(self.flyThroughTick, self.flyThroughTime);
	}

	this.getViewpointGroupAndName = function(id)
	{
		var splitID = id.trim().split("__");

		if (splitID.length > 1)
		{
			var group	= splitID[0].trim();
			var name	= splitID[1].trim();
		} else {
			var name	= splitID[0].trim();
			var group	= 'uncategorized';
		}

		return {group: group, name: name};
	}

	this.loadViewpoints = function()
	{
		var viewpointList = $("viewpoint");

		for(var v = 0; v < viewpointList.length; v++)
		{
			if (viewpointList[v].hasAttribute("id")) {
				var id		= viewpointList[v]["id"].trim();
				viewpointList[v]["def"] = id;

				var groupName = self.getViewpointGroupAndName(id);

				if (!self.viewpoints[groupName.group])
					self.viewpoints[groupName.group] = {};

				self.viewpoints[groupName.group][groupName.name] = id;
				self.viewpointsNames[id] = viewpointList[v];
			}
		}
	}

	this.loadViewpoint = null;

	this.getAxisAngle = function(from, at, look)
	{
		var x3dfrom	= new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var x3dat	= new x3dom.fields.SFVec3f(at[0], at[1], at[2]);
		var x3dup	= new x3dom.fields.SFVec3f(up[0], up[1], up[2]);

		var viewMat = new x3dom.fields.SFMatrix4f.lookAt(x3dfrom, x3dat, x3dup).inverse();

		var q = new x3dom.fields.Quaternion(0.0,0.0,0.0,1.0);
		q.setValue(viewMat);

		return (q.toAxisAngle()[0].toGL() + q[1]);
	}

	// TODO: Should move this to somewhere more general (utils ? )
	this.axisAngleToMatrix = function(axis, angle)
	{
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

		mat.setFromArray([ t * v.x * v.x + cosAngle, t * v.x * v.y + v.z * sinAngle, t * v.x * v.z - v.y * sinAngle, 0,
			t * v.x * v.y - v.z * sinAngle, t * v.y * v.y + cosAngle, t * v.y * v.z + v.x * sinAngle, 0,
			t * v.x * v.z + v.y * sinAngle, t * v.y * v.z - v.x * sinAngle, t * v.z * v.z + cosAngle, 0,
			0, 0, 0, 1]);

		return mat;
	}

	this.createViewpoint = function(name, from, at, up)
	{
		var groupName = self.getViewpointGroupAndName(name);

		if (!(self.viewpoints[groupName.group] && self.viewpoints[groupName.group][groupName.name]))
		{
			var newViewPoint = document.createElement('viewpoint');
			newViewPoint.setAttribute('id', name);
			newViewPoint.setAttribute('def', name);
			self.scene.appendChild(newViewPoint);

			if (from && at && up)
			{
				var q = self.getAxisAngle(from, at, up);
				newViewpoint.setAttribute('orientation', q.join(','));
			}

			if (!self.viewpoints[groupName.group])
				self.viewpoints[groupName.group] = {};

			self.viewpoints[groupName.group][groupName.name] = name;
			self.viewpointsNames[name] = newViewPoint;

		} else {
			console.error('Tried to create viewpoint with duplicate name: ' + name);
		}
	}

	this.setCurrentViewpointIdx = function(idx)
	{
		var viewpointNames = Object.keys(self.viewpointsNames);
		self.setCurrentViewpoint(viewpointNames[idx]);
	}

	this.setCurrentViewpoint = function(id)
	{
		if (Object.keys(self.viewpointsNames).indexOf(id) != -1)
		{
			var viewpoint = self.viewpointsNames[id];

			// Remove event listener from viewpoint
			if (self.currentViewpoint)
				self.currentViewpoint._xmlNode.removeEventListener('viewpointChanged', self.viewPointChanged);

			self.currentViewpoint = viewpoint._x3domNode;

			viewpoint.setAttribute("bind", true);
			self.getViewArea().resetView();

			// TODO: This is a hack to get around a bug in X3DOM
			self.getViewArea()._flyMat = null;

			viewpoint.addEventListener('viewpointChanged', self.viewPointChanged);
			self.loadViewpoint = null;
			viewpoint.appendChild(self.nav);

			self.runtime.resetExamin();

			self.applySettings();


			if (id === (self.name + "_default"))
			{
				if(self.defaultShowAll)
					self.runtime.fitAll();
				else
					self.reset();
			}

			return;
		}

		self.loadViewpoint = id;
	}

	this.updateSettings = function(settings)
	{
		if (settings)
			self.settings = settings;
	}

	this.applySettings = function()
	{
		if (self.settings)
		{
			if ('start_all' in self.settings)
				self.defaultShowAll = self.settings['start_all'];

			if ('speed' in self.settings)
				self.setSpeed(self.settings['speed']);

			if ('avatarHeight' in self.settings)
				self.changeAvatarHeight(self.settings['avatarHeight']);

			if ('visibilityLimit' in self.settings)
				self.nav.setAttribute('visibilityLimit', self.settings['visibilityLimit']);

			if ('zFar' in self.settings)
				self.currentViewpoint._xmlNode.setAttribute('zFar', self.settings['zFar']);

			if ('zNear' in self.settings)
				self.currentViewpoint._xmlNode.setAttribute('zNear', self.settings['zNear']);

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
				if (nodes[m_idx]._x3domNode)
				{
					var origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
					nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

					var origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
					nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

					nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);
				}
			}
		} else {
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				if (nodes[m_idx]._x3domNode)
				{
					var origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
					nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

					var origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
					nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

					nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);
				}
			}
		}
	}

	this.pickObject = {};

	this.pickPoint = function(x,y)
	{
		var viewArea = self.getViewArea();
		var scene	 = viewArea._scene;

		var oldPickMode = scene._vf.pickMode.toLowerCase();
		scene._vf.pickMode = "idbuf";
		var success = scene._nameSpace.doc.ctx.pickValue(viewArea, x, y);
		scene._vf.pickMode = oldPickMode;

		self.pickObject.pickPos		= viewArea._pickingInfo.pickPos;
		self.pickObject.pickNorm	= viewArea._pickingInfo.pickNorm;
		self.pickObject.pickObj		= viewArea._pickingInfo.pickObj;
		self.pickObject.part        = null;
		self.pickObject.partID      = null;

		var objId = viewArea._pickingInfo.shadowObjectId;

		if (scene._multiPartMap)
		{
			for(var mpi = 0; mpi < scene._multiPartMap.multiParts.length; mpi++)
			{
				var mp = scene._multiPartMap.multiParts[mpi];

				if (objId > mp._minId && objId <= mp._maxId)
				{
					var colorMap 		= mp._inlineNamespace.defMap["MultiMaterial_ColorMap"];
					var emissiveMap 	= mp._inlineNamespace.defMap["MultiMaterial_EmissiveMap"];
					var specularMap 	= mp._inlineNamespace.defMap["MultiMaterial_SpecularMap"];
					var visibilityMap 	= mp._inlineNamespace.defMap["MultiMaterial_VisibilityMap"];

                    self.pickObject.part = new x3dom.Parts(mp, [objId - mp._minId], colorMap, emissiveMap, specularMap, visibilityMap);
                    self.pickObject.partID = mp._idMap.mapping[objId - mp._minId].name;
				}
			}
		}

	}

	this.oneGrpNodes = [];
	this.twoGrpNodes = [];

	this.setApp = function(group, app)
	{
		if (!group || !group.multipart) {
			if (app === undefined)
				app = "1.0 0.5 0.0";

			self.applyApp(self.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

			// TODO: Make this more efficient
			self.applyApp(self.diffColorAdded, 0.5, "0.0 1.0 0.0");
			self.applyApp(self.diffColorDeleted, 0.5, "1.0 0.0 0.0");

			if (group)
			{
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

	this.rotAxisAngle = function(from, to)
	{
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);
		var qt = new x3dom.fields.Quaternion(crossVec.x, crossVec.y, crossVec.z, 1);

		qt.w = vecFrom.length() * vecTo.length() + dot;

		return qt.normalize(qt).toAxisAngle();
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

			if (mode == 'HELICOPTER')
			{
				var vpInfo  = self.getCurrentViewpointInfo();
				var eye     = vpInfo["position"];
				var viewDir = vpInfo["view_dir"];

				self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
				self.nav._x3domNode._vf.typeParams[1] = eye[1];
			}

			self.currentNavMode = mode;
			self.nav.setAttribute('type', mode);

			if (mode == 'WALK' || mode == 'HELICOPTER')
			{
				self.disableClicking();
				self.setApp(null);
			} else {
				self.enableClicking();
			}

			if ((mode == 'WAYFINDER') && waypoint)
				waypoint.resetViewer();

			if ((mode == 'TURNTABLE'))
				self.nav.setAttribute('typeParams', '-0.4 60.0 0 3.14 0.00001');
		}
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

	this.setCameraPosition = function(pos)
	{
		var vpInfo		= self.getCurrentViewpointInfo();

		var viewDir		= vpInfo["view_dir"];
		var up			= vpInfo["up"];

		self.updateCamera(pos, up, viewDir);
	}

	this.moveCamera = function(dV)
	{
		var currentPos = self.getCurrentViewpointInfo()["position"];
		currentPos[0] += dV[0];
		currentPos[1] += dV[1];
		currentPos[2] += dV[2];

		self.setCameraPosition(currentPos);
	}

	this.setCameraViewDir = function(viewDir, upDir)
	{
		var currentPos = self.getCurrentViewpointInfo()["position"];
		self.updateCamera(currentPos, upDir, viewDir);
	}

	this.setCamera = function(pos, viewDir, upDir)
	{
		self.updateCamera(pos, upDir, viewDir);
	}

	this.updateCamera = function(pos, up, viewDir)
	{
		var x3domView = new x3dom.fields.SFVec3f();
		x3domView.setValueByStr(viewDir.join(","));

		var x3domUp   = new x3dom.fields.SFVec3f();
		x3domUp.setValueByStr(normalize(up).join(","));

		var x3domFrom = new x3dom.fields.SFVec3f();
		x3domFrom.setValueByStr(pos.join(","));

		var x3domAt = x3domFrom.add(x3domView);

		var viewMatrix = x3dom.fields.SFMatrix4f.lookAt(x3domFrom, x3domAt, x3domUp).inverse();
		var currMatrix = self.getCurrentViewpoint()._x3domNode;

		if (self.currentNavMode == 'HELICOPTER')
		{
			self.nav._x3domNode._vf.typeParams[0] = Math.asin(x3domView.y);
			self.nav._x3domNode._vf.typeParams[1] = x3domFrom.y;
		}

		self.getViewArea().animateTo(viewMatrix, currMatrix);

		if(self.linked)
			self.manager.switchMaster(self.handle);
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
		self.setCurrentViewpoint('model__start');

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

	this.getRoot = function() {
		return self.inline;
	}

	this.getScene = function() {
		return self.scene;
	}

	this.getCurrentViewpoint = function()
	{
		return self.getViewArea()._scene.getViewpoint()._xmlNode;
	}

	this.getCurrentViewpointInfo = function()
	{
		var viewPoint = {};

		var origViewTrans = self.getViewArea()._scene.getViewpoint().getCurrentTransform();
		var viewMat	  = self.getViewMatrix().inverse();

		var viewRight	  = viewMat.e0();
		var viewUp	  = viewMat.e1();
		var viewDir	  = viewMat.e2().multiply(-1); // Because OpenGL points out of screen
		var viewPos	  = viewMat.e3();

		var center        = self.getViewArea()._scene.getViewpoint().getCenterOfRotation();

		if (center)	{
			var lookAt = center.subtract(viewPos);
		} else {
			var lookAt  = viewPos.add(viewDir);
		}

		var projMat = self.getProjectionMatrix();

		// More viewing direction than lookAt to sync with Assimp
		viewPoint["up"]           = [viewUp.x, viewUp.y, viewUp.z];
		viewPoint["position"]     = [viewPos.x, viewPos.y, viewPos.z];
		viewPoint["look_at"]      = [lookAt.x, lookAt.y, lookAt.z];
		viewPoint["view_dir"]     = [viewDir.x, viewDir.y, viewDir.z];
		viewPoint["right"]        = [viewRight.x, viewRight.y, viewRight.z];
		viewPoint["unityHeight"]  = 2.0 / projMat._00;
		viewPoint["fov"]	      = Math.atan((1 / projMat._00)) * 2.0;
		viewPoint["aspect_ratio"] = viewPoint["fov"] / projMat._11;

		var f = projMat._23 / (projMat._22 + 1);
		var n = (f * projMat._23) / (projMat._23 - 2 * f);

		viewPoint["far"]	= f;
		viewPoint["near"]	= n;

		viewPoint["clippingPlanes"] = self.clippingPlanes;

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
		if (objEvent.partID)
		{
			objEvent.part.partID = objEvent.partID;
			self.triggerPartSelected(objEvent.part);
		} else {
			self.triggerSelected(objEvent.target);
		}
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

	this.switchFullScreen = function(vrDisplay) {
		vrDisplay = vrDisplay || {};

		if (!self.fullscreen)
		{
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
	this.diffColorAdded   = [];

	this.setDiffColors = function(diffColors) {
		if(diffColors)
			self.diffColors = diffColors;

		self.applyApp(self.diffColorAdded, 2.0, "0.0 0.0 0.0", false);
		self.applyApp(self.diffColorDeleted, 2.0, "0.0 0.0 0.0", false);

		self.diffColorAdded   = [];
		self.diffColorDeleted = [];

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
							var mat = $(obj._xmlNode).find("Material");

							if (mat.length)
							{
								self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
								self.diffColorAdded.push(mat[0]);
							} else {
								var mat = $(obj._xmlNode).find("TwoSidedMaterial");
								self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);

								self.diffColorAdded.push(mat[0]);
							}

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
							var mat = $(obj._xmlNode).find("Material");

							if (mat.length)
							{
								self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
								self.diffColorDeleted.push(mat[0]);
							} else {
								var mat = $(obj._xmlNode).find("TwoSidedMaterial");
								self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);

								self.diffColorDeleted.push(mat[0]);
							}
						}
					}
				}
			}
		}
	};

	this.transformEvent = function(event, viewpoint, inverse)
	{
		if (inverse)
			var transformation = viewpoint._x3domNode.getTransformation().inverse();
		else
			var transformation = viewpoint._x3domNode.getTransformation();

		var newPos       = transformation.multMatrixVec(event.position);
		var newOrientMat = self.axisAngleToMatrix(event.orientation[0], event.orientation[1]);
		newOrientMat     = transformation.mult(newOrientMat);

		var newOrient    = new x3dom.fields.Quaternion();
		newOrient.setValue(newOrientMat);
		newOrient = newOrient.toAxisAngle();

		event.position    = newPos;
		event.orientation = newOrient;
	}

	// TODO: Merge this function with the Viewer Manager
	this.axesMove = function(origEvent, event) {
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = event.orientation[1] * -1;

		// Fix transformation from viewpoint basis
		self.transformEvent(event, event.target, false);

		// Set rotation of the overlying group
		self.axesGroup.setAttribute('rotation', event.orientation.toString());
	}

	this.linkAxes = function()
	{
		self.onViewpointChanged(self.axesMove);
	}

	this.addAxes = function() {
		var axesDiffColor = ['0.1 0.6 0.1', '0.7 0.1 0.1', '0.3 0.3 1.0'];
		var axesEmissiveColor = ['0.05 0.2 0.05', '0.33 0.0 0.0', '0.1 0.1 0.33'];
		var rotation = ['0.0 0.0 1.0 0.0', '0.0 0.0 1.0 -1.57079', '1.0 0.0 0.0 1.57079'];
		var axisName = ['Y', 'X', 'Z'];

		var coord = document.createElement('X3D');
		coord.setAttribute('id', 'Axes');
		coord.setAttribute('showStat', 'false');
		coord.setAttribute('showLog', 'false');

		self.x3ddiv.appendChild(coord);

		var scene = document.createElement('scene');
		coord.appendChild(scene);

		var vp = document.createElement('Viewpoint');
		vp.setAttribute('position', '0.76500 0.765 5.0');
		scene.appendChild(vp);

		self.axesScene = scene;

		self.axesNav = document.createElement('navigationInfo');
		self.axesNav.setAttribute('type', 'NONE');
		scene.appendChild(self.axesNav);

		self.axesGroup = document.createElement('Transform');
		scene.appendChild(self.axesGroup);

		var x3dFile = document.createElement('inline');
		x3dFile.setAttribute('url', 'public/box.x3d');
		self.axesGroup.appendChild(x3dFile);

		self.reload();
		self.linkAxes();
	}

	var clippingPlaneID = -1;
	this.clippingPlanes  = [];

	this.setClippingPlanes = function(clippingPlanes)
	{
		self.clearClippingPlanes();

		for(var clipidx = 0; clipidx < clippingPlanes.length; clipidx++)
		{
			var clipPlaneIDX = self.addClippingPlane(
					clippingPlanes[clipidx]["axis"],
					clippingPlanes[clipidx]["percentage"],
					clippingPlanes[clipidx]["clipDirection"]
				);
		}
	}

	/**
	* Adds a clipping plane to the viewer
	* @param {string} axis - Axis through which the plane clips
	* @param {number} percentage - Percentage along the bounding box to clip
	* @param {number} clipDirection - Direction of clipping (-1 or 1)
	*/
	this.addClippingPlane = function(axis, percentage, clipDirection) {
		clippingPlaneID += 1;

		var newClipPlane = new ClipPlane(clippingPlaneID, self, axis, [1, 1, 1], percentage, clipDirection);
		self.clippingPlanes.push(newClipPlane);

		return clippingPlaneID;
	}

	/**
	* Clear out all clipping planes
	*/
	this.clearClippingPlanes = function() {
		self.clippingPlanes.forEach(function(clipPlane) {
			clipPlane.destroy();
			delete clipPlane;
		});

		self.clippingPlanes = [];
	}

	/**
	* Clear out all clipping planes
	* @param {number} id - Get the clipping plane with matching unique ID
	*/
	this.getClippingPlane = function(id) {
		// If the clipping plane no longer exists this
		// will return undefined
		return self.clippingPlanes.filter(function (clipPlane) {
			return (clipPlane.getID() === id);
		})[0];
	}
};

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
var ClipPlane = function(id, viewer, axis, colour, percentage, clipDirection)
{
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
	* Value representing the distance from the origin of
	* the clip plane
	* @type {number}
	*/
	this.percentage = (percentage === undefined) ? 1.0 : percentage

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
	var outline      = document.createElement("Shape");

	/**
	* Outline appearance
	* @private
	* @type {HTMLElement}
	*/
	var outlineApp   = document.createElement("Appearance");

	/**
	* Outline material
	* @private
	* @type {HTMLElement}
	*/
	var outlineMat   = document.createElement("Material");

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
	* Get my unique ID
	*/
	this.getID = function()
	{
		return id;
	}

	/**
	* Set the coordinates of the clipping plane outline
	*/
	var setOutlineCoordinates = function()
	{
		var min = volume.min.toGL();
		var max = volume.max.toGL();

		var axisIDX = "XYZ".indexOf(self.axis);
		var outline = [[0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0]];

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
	}

	/**
	* Move the clipping plane
	* @param {number} percentage - Percentage of entire clip volume to move across
	*/
	this.movePlane = function(percentage)
	{
		// Update the transform containing the clipping plane
		var axisIDX = "XYZ".indexOf(this.axis);
		var min = volume.min.toGL();
		var max = volume.max.toGL();

		self.percentage = percentage;

		var distance = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];

		// Update the clipping element plane equation
		clipPlaneElem.setAttribute("plane", normal.toGL().join(" ") + " " + distance);

		var translation = [0,0,0];
		translation[axisIDX] = -distance * this.clipDirection;
		coordinateFrame.setAttribute("translation", translation.join(","));
	}

	/**
	* Change the clipping axis
	* @param {string} axis - Axis on which the clipping plane acts
	*/
	this.changeAxis = function(axis)
	{
		this.axis = axis.toUpperCase();

		// When the axis is change the normal to the plane is changed
		normal.x = (axis === "X") ? this.clipDirection : 0;
		normal.y = (axis === "Y") ? this.clipDirection : 0;
		normal.z = (axis === "Z") ? this.clipDirection : 0;

		// Reset plane to the start
		this.movePlane(1.0);

		setOutlineCoordinates();
	}

	/**
	* Destroy me and everything connected with me
	*/
	this.destroy = function()
	{
		if (clipPlaneElem && clipPlaneElem.parentNode) {
			clipPlaneElem.parentNode.removeChild(clipPlaneElem);
		}

		if (coordinateFrame && coordinateFrame.parentNode) {
			coordinateFrame.parentNode.removeChild(coordinateFrame);
		}
	}

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



