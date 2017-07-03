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

// --------------------- Control Interface ---------------------

// Global functions to be passed to X3DOM elements
var bgroundClick, clickObject, clickPin, onMouseOver,
	onMouseDown, onMouseUp, onMouseMove, onViewpointChange,
	onLoaded, onError, runtimeReady;

//x3dom.runtime.ready = runtimeReady;

// ----------------------------------------------------------
var Viewer = {};
var GOLDEN_RATIO = (1.0 + Math.sqrt(5)) / 2.0;

(function() {
	"use strict";

	bgroundClick      = ViewerUtil.eventFactory("bgroundClicked");
	clickObject       = ViewerUtil.eventFactory("clickObject");
	clickPin          = ViewerUtil.eventFactory("pinClick");
	onMouseOver       = ViewerUtil.eventFactory("onMouseOver");
	onMouseDown       = ViewerUtil.eventFactory("onMouseDown");
	onMouseUp         = ViewerUtil.eventFactory("onMouseUp");
	onMouseMove       = ViewerUtil.eventFactory("onMouseMove");
	onViewpointChange = ViewerUtil.eventFactory("onViewpointChange");
	onLoaded          = ViewerUtil.eventFactory("onLoaded");
	onError           = ViewerUtil.eventFactory("onError");
	runtimeReady      = ViewerUtil.eventFactory("runtimeReady");

	Viewer = function(name, element, manager, callback, errCallback) {
		// Properties
		var self = this;

		if (!name) {
			this.name = "viewer";
		} else {
			this.name = name;
		}

		callback = !callback ? function() {
			// TODO: Move event handling here
			//console.log(type + ": " + value);
		} : callback;

		errCallback = !errCallback ? function() {
			//console.error(type + ": " + value);
		} : errCallback;

		// If not given the tag by the manager create here
		this.element = element;

		this.inline = null;
		this.runtime = null;
		this.fullscreen = false;
		this.multiSelectMode = false;
		this.pinDropMode = false;

		this.clickingEnabled = false;

		this.avatarRadius = 0.5;

		this.pinSizeFromSettings = false;
		this.pinSize = 1.0; // Initial size

		this.defaultShowAll = true;

		this.zNear = -1;
		this.zFar = -1;

		this.manager = manager;

		this.initialized = false;

		this.downloadsLeft = 1;

		this.defaultNavMode = this.NAV_MODES.TURNTABLE;

		this.selectionDisabled = false;

		this.account = null;
		this.model = null;
		this.branch = null;
		this.revision = null;
		this.modelString = null;

		this.rootName = "model";
		this.inlineRoots = {};
		this.groupNodes = null;
		this.multipartNodes = [];
		this.multipartNodesByModel = {};

		this.units = "m";
		this.convertToM = 1.0;

		this.setUnits = function(units)
		{
			this.units = units;

			if (units === "mm")
			{
				this.convertToM = 0.001;
			} else if (units === "ft") {
				this.convertToM = 0.0032;
			}

		}

		this.setHandle = function(handle) {
			this.handle = handle;
		};

		this.logos    = [];

		this.logoClick = function() {
			//callback(self.EVENT.LOGO_CLICK);
		};

		this.addLogo = function() {
			if (!self.logoGroup)
			{
				self.logoGroup = document.createElement("div");
				self.logoGroup.style.width = "100%";
				self.element.appendChild(self.logoGroup);
			}

			var numLogos = this.logos.length + 1;
			var perLogo  = Math.floor(100 / numLogos);
			var widthPercentage = perLogo + "%";

			var logo = document.createElement("div");
			logo.style.position       = "absolute";
			logo.style["z-index"]     = 2;
			logo.style["text-align"]  = "center";
			logo.style.width          = "250px";
			logo.style["top"]  		  = "10px";
			logo.style.left 		  = 0;
			logo.style.right 		  = 0;
			logo.style.margin 		  = "auto";

			logo.addEventListener("click", self.logoClick);

			var logoImage = document.createElement("img");
			logoImage.setAttribute("src", logo_string);
			logoImage.setAttribute("style", "width: 100%;");
			logoImage.textContent = " ";
			logo.appendChild(logoImage);

			self.updateLogoWidth(widthPercentage);

			self.logoGroup.appendChild(logo);
			self.logos.push(logo);
		};

		this.removeLogo = function () {
			if (self.logos.length)
			{
				var numLogos = this.logos.length - 1;
				var widthPercentage = Math.floor(100 / numLogos) + "%";

				self.logos[numLogos].parentNode.removeChild(self.logos[numLogos]);

				self.logos.splice(numLogos,1);

				self.updateLogoWidth(widthPercentage);
			}
		};

		this.updateLogoWidth = function(widthPercentage) {
			for(var i = 0; i < self.logos.length; i++)
			{

				self.logos[i].style.width = widthPercentage;
			}
		};

		this.handleKeyPresses = function(e) {
			/*console.log("Handling key presses?")
			if (e.charCode === "r".charCodeAt(0)) {
				self.reset();
				self.setApp(null);
				self.setNavMode(self.NAV_MODES.WALK);
				self.disableClicking();
			} else if (e.charCode === "a".charCodeAt(0)) {
				self.showAll();
				self.enableClicking();
			} else if (e.charCode === "u".charCodeAt(0)) {
				self.revealAll();
			}*/
		};

		this.init = function(options) {
			if (!self.initialized) {

				// Set option param from viewerDirective
				self.options = options;

				self.viewer = document.createElement("div");
				var canvas = document.createElement("canvas");
				canvas.className = "emscripten";
				canvas.setAttribute("id", "canvas");
				canvas.setAttribute("tabindex", "1"); // You need this for canvas to register keyboard events
				canvas.setAttribute("oncontextmenu", "event.preventDefault()");
				canvas.setAttribute("height", "600px");
				canvas.setAttribute("width", "960px");
				canvas.onmousedown = function(){
					return false;
				};
				//canvas.addEventListener("mousedown", onMouseDown);
				canvas.addEventListener("mouseup",  onMouseUp);
				canvas.addEventListener("mousemove",  onMouseMove);

				canvas.style["pointer-events"] = "all";
				
				var canvasScript = document.createElement("script");
				canvasScript.setAttribute("type", "text/javascript");

				var unitySettings = {
				 	TOTAL_MEMORY: 2130706432,
				    errorhandler: UnityUtil.onError,
				    compatibilitycheck: null,
				    backgroundColor: "#222C36",
				    splashStyle: "Light",
				    dataUrl: "public/unity/Release/unity.data",
				    codeUrl: "public/unity/Release/unity.js",
				    asmUrl: "public/unity/Release/unity.asm.js",
				    memUrl: "public/unity/Release/unity.mem"
				};
				var moduleSettings = document.createTextNode("var Module = " + JSON.stringify(unitySettings));
				canvasScript.appendChild(moduleSettings);
				var canvasScript2 = document.createElement("script");
				canvasScript2.setAttribute("src", "public/unity/Release/UnityLoader.js");
								

				self.viewer.appendChild(canvas);
				self.viewer.appendChild(canvasScript);
				self.viewer.appendChild(canvasScript2);
				self.viewer.className = "viewer";

				self.element.appendChild(self.viewer);
				
				//Shouldn't need this, but for something it is not being recognised from unitySettings!
				Module.errorhandler = UnityUtil.onError;

				self.scene = document.createElement("Scene");
				self.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
				//self.scene.setAttribute("pickmode", "idbufid");
				self.viewer.appendChild(self.scene);

				//self.pinShader = new PinShader(self.scene);

				self.bground = null;
				self.currentNavMode = null;

				self.createBackground();

				self.environ = document.createElement("environment");
				self.environ.setAttribute("frustumCulling", "true");
				self.environ.setAttribute("smallFeatureCulling", "true");
				self.environ.setAttribute("smallFeatureThreshold", 5);
				self.environ.setAttribute("occlusionCulling", "true");
				self.environ.setAttribute("sorttrans", "true");
				self.environ.setAttribute("gammaCorrectionDefault", "linear");
				self.scene.appendChild(self.environ);

				self.setAmbientLight();

				self.createViewpoint(self.name + "_default");


				self.loadViewpoint = self.name + "_default"; // Must be called after creating nav

				self.viewer.addEventListener("keypress", self.handleKeyPresses);

				self.initialized = true;

				if (manager) {
					manager.registerMe(self);
				}

				self.enableClicking();


				self.plugins = self.options.plugins;
				Object.keys(self.plugins).forEach(function(key){
					self.plugins[key].initCallback && self.plugins[key].initCallback(self);
				});

				UnityUtil.pickPointCallback = self.pickPointEvent;
				UnityUtil.objectSelectedCallback = self.objectSelected;
				UnityUtil.clipBroadcastCallback = self.broadcastClippingPlane;
				UnityUtil.setAPIHost(server_config.apiUrl(server_config.GET_API, "")); 
				self.setNavMode(self.defaultNavMode);
				UnityUtil.onReady().then(
						function()
						{
							callback(self.EVENT.READY, {
								name: self.name,
								model: self.modelString
							});
													   
						}
					);
			}
		};

		this.destroy = function() {
			UnityUtil.reset();
		};

		ViewerUtil.onEvent("onError", function(objEvent) {
			self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);
		});

		ViewerUtil.onEvent("onLoaded", function(objEvent) {
			if (self.loadViewpoint) {
				self.setCurrentViewpoint(self.loadViewpoint);
			}

			var targetParent = objEvent.target._x3domNode._nameSpace.doc._x3dElem;

			self.loadViewpoints();

			if (targetParent === self.viewer) {
				self.setDiffColors(null);
			}
			if (objEvent.target.tagName.toUpperCase() === "INLINE") {
				var nameSpace = objEvent.target.nameSpaceName;

				self.inlineRoots[objEvent.target.nameSpaceName] = objEvent.target;

				if(nameSpace == self.account + "__"+self.model && self.groupNodes==null)
				{
					self.groupNodes={};
					var modelTrans = {};
					var vol = null;
					//loaded x3dom file for current model, figure out the groups
					var groups = document.getElementsByTagName("Group");
					for(var gIdx = 0; gIdx < groups.length; ++gIdx)
					{
						var fullModelName = groups[gIdx].id;
						self.groupNodes[fullModelName] = groups[gIdx];
						var res = fullModelName.split("__");
						if(res.length == 4)
						{
							//valid name
							var accProj = res[2] + "__" + res[3];
							modelTrans[accProj] = {trans: groups[gIdx]._x3domNode.getCurrentTransform() }

						}

					}

				}
				var accProj = nameSpace.split("__");
				callback(self.EVENT.SET_SUBMODEL_TRANS_INFO,
							{
								modelNameSpace: nameSpace,
								modelTrans: self.getParentTransformation(accProj[0], accProj[1]),
								isMainModel: accProj[0] === self.account && accProj[1] === self.model

							}

						);
			} else if (objEvent.target.tagName.toUpperCase() === "MULTIPART") {
				if (self.multipartNodes.indexOf(objEvent.target) === -1)
				{
					var nameSpaceName = objEvent.target._x3domNode._nameSpace.name;
					if (!self.multipartNodesByModel.hasOwnProperty(nameSpaceName)) {
						self.multipartNodesByModel[nameSpaceName] = {};
					}

					var multipartName = objEvent.target.getAttribute("id");
					var multipartNameParts = multipartName.split("__");
					var multipartID = multipartNameParts[multipartNameParts.length - 1];

					self.multipartNodesByModel[nameSpaceName][multipartID] = objEvent.target;

					self.multipartNodes.push(objEvent.target);
				}
			}

			self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);

			if (!self.pinSizeFromSettings) {
				var sceneBBox = self.getScene()._x3domNode.getVolume();
				var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
				self.pinSize = sceneSize / 20;
			}

			//console.log('my op', options);

			var options = self.options;
			// don't show all if lat,lon,height is set in URL
			if(options.showAll){
				self.showAll();
			}

			if (!self.downloadsLeft) {

			}
		});

		this.showAll = function() {
			UnityUtil.resetCamera();
		};

		this.setAmbientLight = function(lightDescription) {
			if (self.light) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.light.attributes.length; i++)
				{
					attributeNames.push(self.light.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++)
				{
					self.light.removeAttribute(attributeNames[i]);
				}
			} else {
				self.light = document.createElement("directionallight");
				self.scene.appendChild(self.light);
			}

			if (!lightDescription)
			{
				//self.light.setAttribute("intensity", "0.5");
				self.light.setAttribute("color", "0.714, 0.910, 0.953");
				self.light.setAttribute("direction", "0, -0.9323, -0.362");
				self.light.setAttribute("global", "true");
				self.light.setAttribute("ambientIntensity", "0.8");
				self.light.setAttribute("shadowIntensity", 0.0);
			} else {
				for (var attr in lightDescription)
				{
					if (lightDescription.hasOwnProperty(attr))
					{
						self.light.setAttribute(attr, lightDescription[attr]);
					}
				}
			}

		};

		this.createBackground = function(colourDescription) {
			if (self.bground) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.bground.attributes.length; i++)
				{
					attributeNames.push(self.bground.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++)
				{
					self.bground.removeAttribute(attributeNames[i]);
				}
			} else {
				self.bground = document.createElement("background");
				self.scene.appendChild(self.bground);
			}

			if (!colourDescription)
			{
				self.bground.setAttribute("DEF", self.name + "_bground");
				self.bground.setAttribute("skyangle", "0.9 1.5 1.57");
				self.bground.setAttribute("skycolor", "0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1");
				self.bground.setAttribute("groundangle", "0.9 1.5 1.57");
				self.bground.setAttribute("groundcolor", "0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91");
				self.bground.textContent = " ";

			} else {
				self.bground.setAttribute("DEF", self.name + "_bground");

				for (var attr in colourDescription)
				{
					if (colourDescription.hasOwnProperty(attr))
					{
						self.bground.setAttribute(attr, colourDescription[attr]);
					}
				}
			}

		};

		this.gyroscope = function (alpha, beta, gamma) {
			var degToRad = Math.PI / 180.0;

			var b = (alpha ? alpha : 0);
			var a = (beta  ? beta : 0);
			var g = -(gamma ? gamma : 0);

			a *= degToRad; b *= degToRad; g *= degToRad;

			var cA = Math.cos(a / 2.0);
			var cB = Math.cos(b / 2.0);
			var cG = Math.cos(g / 2.0);
			var sA = Math.sin(a / 2.0);
			var sB = Math.sin(b / 2.0);
			var sG = Math.sin(g / 2.0);

			/*
			var w = cB * cG * cA - sB * sG * sA;
			var x = sB * cG * cA - cB * sG * sA;
			var y = cB * sG * cA  sB * cG * sA;
			var z = cB * cG * sA  sB * sG * cA;
			*/

			var x = sA * cB * cG + cA * sB * sG;
			var y = cA * sB * cG - sA * cB * sG;
			var z = cA * cB * sG - sA * sB * cG;
			var w = cA * cB * cG + sA * sB * sG;

			var q           = new x3dom.fields.Quaternion(x,y,z,w);
			var screenAngle = (window.orientation ? window.orientation : 0) * degToRad * -1;
			var screenQuat  = x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(0,0,1),screenAngle);
			var viewQuat    = new x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(1,0,0), -Math.PI * 0.5);

			//q = self.gyroStart.multiply(q);
			q = q.multiply(viewQuat);
			q = q.multiply(screenQuat);

			var flyMat = null;
			var vp     = self.getCurrentViewpoint()._x3domNode;

			if (self.rollerCoasterMatrix)
			{
				var qMat = q.toMatrix();
				flyMat = qMat.transpose().mult(self.rollerCoasterMatrix.inverse());
			} else {

				flyMat = vp.getViewMatrix().inverse();
				flyMat.setRotate(q);
				flyMat = flyMat.inverse();
			}

			vp._viewMatrix.setValues(flyMat);
		};

		this.switchDebug = function() {
			self.getViewArea()._visDbgBuf = !self.getViewArea()._visDbgBuf;
		};

		this.showStats = function() {
			self.runtime.canvas.stateViewer.display();
		};

		this.getViewArea = function() {
			return self.runtime.canvas.doc._viewarea;
		};

		this.getViewMatrix = function() {
			return self.getViewArea().getViewMatrix();
		};

		this.getParentTransformation = function(account, model)
		{
			var trans = null;
			var fullParentGroupName = self.account + "__"+ self.model + "__" + account + "__" + model;
			var parentGroup = self.groupNodes[fullParentGroupName];
			if(parentGroup)
			{
				trans = parentGroup._x3domNode.getCurrentTransform();
			}
			else
			{
				console.error("Cannot find parent group: " + fullParentGroupName);
			}
			return trans;
		}
		this.getProjectionMatrix = function() {
			return self.getViewArea().getProjectionMatrix();
		};

		this.getScreenshot = function(promise)
		{
			UnityUtil.requestScreenShot(promise);

		}

		this.onMouseUp = function(functionToBind) {
			ViewerUtil.onEvent("onMouseUp", functionToBind);
		};

		this.offMouseUp = function(functionToBind) {
			ViewerUtil.offEvent("onMouseUp", functionToBind);
		};

		this.onMouseDown = function(functionToBind) {
			ViewerUtil.onEvent("onMouseDown", functionToBind);
		};

		this.offMouseDown = function(functionToBind) {
			ViewerUtil.offEvent("onMouseDown", functionToBind);
		};

		this.onMouseMove = function(functionToBind) {
			ViewerUtil.onEvent("onMouseMove", functionToBind);
		};

		this.offMouseMove = function(functionToBind) {
			ViewerUtil.offEvent("onMouseMove", functionToBind);
		};

		this.pickPoint = function(x, y, fireEvent)
		{
			fireEvent = (typeof fireEvent === undefined) ? false : fireEvent;

			self.getViewArea()._doc.ctx.pickValue(self.getViewArea(), x,y);

			if (fireEvent)
			{
				// Simulate a mouse down pick point
				self.mouseDownPickPoint({layerX: x, layerY: y});
			}
		};

		this.pickPointEvent = function(pointInfo)
		{


			//User clicked a mesh
			callback(self.EVENT.PICK_POINT, {
				id: pointInfo.id,
				position: pointInfo.position,
				normal: pointInfo.normal,
				screenPos: pointInfo.mousePos
			});
		};

		this.objectSelected = function(pointInfo)
		{
			if(!self.selectionDisabled && !self.pinDropMode)
			{
				if(pointInfo.id)
				{
					if(pointInfo.pin)
					{
						//User clicked a pin
						callback(self.EVENT.CLICK_PIN,
							{id: pointInfo.id});

					}
					else
					{
						callback(self.EVENT.OBJECT_SELECTED, {
							account: pointInfo.database,
							model: pointInfo.model,
							id: pointInfo.id,
							source: "viewer"						
						});
					}
				}				
				else
				{
					//User clicked the background
					callback(self.EVENT.BACKGROUND_SELECTED);
				}
			}
		};

		this.mouseDownPickPoint = function(event)
		{
			UnityUtil.getPointInfo();
		};


		/*
		this.mouseMovePoint = function (event) {
			if (event.hasOwnProperty("target")) {
				console.log(event.hitPnt);
			}
			else {
				console.log(event.clientX, event.clientY);
				var viewArea = self.getViewArea();
				viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, event.clientX, event.clientY, 1);
			}
		};

		this.onMouseMove(this.mouseMovePoint);
		*/

		this.onViewpointChanged = function(functionToBind) {
			ViewerUtil.onEvent("myViewpointHasChanged", functionToBind);
		};

		this.offViewpointChanged = function(functionToBind) {
			ViewerUtil.offEvent("myViewpointHasChanged", functionToBind);
		};

		this.viewPointChanged = function(event) {
			//console.log('vp changed');
			var vpInfo = self.getCurrentViewpointInfo();
			var eye = vpInfo.position;
			var viewDir = vpInfo.view_dir;


			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
				self.nav._x3domNode._vf.typeParams[1] = eye[1];
			}

			ViewerUtil.triggerEvent("myViewpointHasChanged", event);
		};

		this.onBackgroundClicked = function(functionToBind) {
			ViewerUtil.onEvent("bgroundClicked", functionToBind);
		};

		this.offBackgroundClicked = function(functionToBind) {
			ViewerUtil.offEvent("bgroundClicked", functionToBind);
		};

		this.lastMultipart = null;

		this.highlightObjects = function(account, model, ids_in, zoom, colour, multiOverride) {
			if (!this.pinDropMode) {
				var ids = new Set(ids_in);

				if(ids.size)
				{
					UnityUtil.highlightObjects(account, model, Array.from(ids), colour, multiOverride || this.multiSelectMode);
				} else {
					UnityUtil.clearHighlights();
				}
			}
		};

		//this.switchedOldParts = [];
		//this.switchedObjects = [];

		this.switchObjectVisibility = function(account, model, ids, visibility)
		{
			UnityUtil.toggleVisibility(account, model, ids, visibility);
		};

		ViewerUtil.onEvent("pinClick", function(clickInfo) {
			var pinID = clickInfo.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
			callback(self.EVENT.CLICK_PIN,
			{
				id : pinID
			});
		});

		ViewerUtil.onEvent("onMouseDown", function() {
			return false;
			//document.body.style["pointer-events"] = "none";
		});

		ViewerUtil.onEvent("onMouseUp", function() {
			document.body.style["pointer-events"] = "all";
		});

		this.onClickObject = function(functionToBind) {
			ViewerUtil.onEvent("clickObject", functionToBind);
		};

		this.offClickObject = function(functionToBind) {
			ViewerUtil.offEvent("clickObject", functionToBind);
		};

		this.viewpoints = {};
		this.viewpointsNames = {};

		this.selectedViewpointIdx = 0;
		this.selectedViewpoint = null;

		this.isFlyingThrough = false;
		this.flyThroughTime = 1000;

		this.flyThrough = function() {
			if (!self.isFlyingThrough) {
				self.isFlyingThrough = true;
				setTimeout(self.flyThroughTick, self.flyThroughTime);
			} else {
				self.isFlyingThrough = false;
			}
		};

		this.flyThroughTick = function() {
			var newViewpoint = self.selectedViewpointIdx + 1;

			if (newViewpoint === self.viewpoints.length) {
				newViewpoint = 0;
			}

			self.setCurrentViewpoint(self.viewpoints[newViewpoint]);

			if (self.isFlyingThrough) {
				setTimeout(self.flyThroughTick, self.flyThroughTime);
			}
		};

		this.getObjectsStatus = function(account, model, promise){
			UnityUtil.getObjectsStatus(account, model, promise);
		}


		this.getViewpointGroupAndName = function(id) {
			var splitID = id.trim().split("__");
			var name, group;

			if (splitID.length > 1) {
				group = splitID[0].trim();
				name = splitID[1].trim();
			} else {
				name = splitID[0].trim();
				group = "uncategorized";
			}

			return {
				group: group,
				name: name
			};
		};

		this.loadViewpoints = function() {
			var viewpointList = document.getElementsByTagName("Viewpoint");

			for (var v = 0; v < viewpointList.length; v++) {
				if (viewpointList[v].hasAttribute("id")) {
					var id = viewpointList[v].id.trim();
					viewpointList[v].DEF = id;

					var groupName = self.getViewpointGroupAndName(id);

					if (!self.viewpoints[groupName.group]) {
						self.viewpoints[groupName.group] = {};
					}

					self.viewpoints[groupName.group][groupName.name] = id;
					self.viewpointsNames[id] = viewpointList[v];
				}
			}
		};

		this.loadViewpoint = null;

		this.createViewpoint = function(name, from, at, up ) {
			var groupName = self.getViewpointGroupAndName(name);
			if (!(self.viewpoints[groupName.group] && self.viewpoints[groupName.group][groupName.name])) {
				var newViewPoint = document.createElement("viewpoint");
				newViewPoint.setAttribute("id", name);
				newViewPoint.setAttribute("def", name);

				self.scene.appendChild(newViewPoint);

				if (from && at && up) {
					var q = ViewerUtil.getAxisAngle(from, at, up);
					newViewPoint.setAttribute("orientation", q.join(","));
				}

				if(from)
				{
					newViewPoint.setAttribute("position", from.join(","));

				}

				if(from && at)
				{
					var centre = [from[0] + at[0], from[1] + at[1], from[2] + at[2]];
					newViewPoint.setAttribute("centerofrotation", centre.join(","));

				}


				if (!self.viewpoints[groupName.group]) {
					self.viewpoints[groupName.group] = {};
				}

				self.viewpoints[groupName.group][groupName.name] = name;
				self.viewpointsNames[name] = newViewPoint;

			} else
			{

				console.error("Tried to create viewpoint with duplicate name: " + name);
			}

		};

		this.setCurrentViewpointIdx = function(idx) {
			var viewpointNames = Object.keys(self.viewpointsNames);
			self.setCurrentViewpoint(viewpointNames[idx]);
		};

		this.setCurrentViewpoint = function(id) {
			if (Object.keys(self.viewpointsNames).indexOf(id) !== -1) {
				var viewpoint = self.viewpointsNames[id];

				// Remove event listener from viewpoint
				if (self.currentViewpoint) {
					self.currentViewpoint._xmlNode.removeEventListener("viewpointChanged", self.viewPointChanged);
				}

				self.currentViewpoint = viewpoint._x3domNode;

				viewpoint.setAttribute("bind", true);
				self.getViewArea().resetView();

				// TODO: This is a hack to get around a bug in X3DOM
				self.getViewArea()._flyMat = null;

				viewpoint.addEventListener("viewpointChanged", self.viewPointChanged);
				self.loadViewpoint = null;
				viewpoint.appendChild(self.nav);

				self.runtime.resetExamin();

				self.applySettings();

				if (id === (self.name + "_default")) {
					if (self.defaultShowAll) {
						self.runtime.fitAll();
					} else {
						self.reset();
					}
				}

				return;
			}
			else
			{
				console.error("Could not find viewpoint." + id);
			}

			self.loadViewpoint = id;
		};

		this.updateSettings = function(settings) {
			if (settings) {
				self.settings = settings;
				self.applySettings();
			}
		};

		this.applySettings = function() {
			if (self.settings) {
				if (self.settings.hasOwnProperty("start_all")) {
					self.defaultShowAll = self.settings.start_all;
				}

				if (self.settings.hasOwnProperty("speed")) {
					self.setSpeed(self.settings.speed);
				}

				if (self.settings.hasOwnProperty("unit"))
				{
					self.setUnits(self.settings.unit);
				}

				if (self.settings.hasOwnProperty("avatarHeight")) {
					self.changeAvatarHeight(self.settings.avatarHeight);
				}

				if (self.settings.hasOwnProperty("defaultNavMode")) {
					self.defaultNavMode = self.settings.defaultNavMode;
				}

				if (self.settings.hasOwnProperty("pinSize")) {
					self.pinSize = self.settings.pinSize;
					self.pinSizeFromSettings = true; // Stop the auto-calculation
				}

				if (self.settings.hasOwnProperty("visibilityLimit")) {
					self.nav.setAttribute("visibilityLimit", self.settings.visibilityLimit);
				}

				if (self.settings.hasOwnProperty("zFar")) {
					self.currentViewpoint._xmlNode.setAttribute("zFar", self.settings.zFar);
				}

				if (self.settings.hasOwnProperty("zNear")) {
					self.currentViewpoint._xmlNode.setAttribute("zNear", self.settings.zNear);
				}

				if (self.settings.hasOwnProperty("background")) {
					self.createBackground(self.settings.background);
				}

				if (self.settings.hasOwnProperty("ambientLight")) {
					self.setAmbientLight(self.settings.ambientLight);
				}
			}
		};

		this.applyModelProperties = function(account, model, properties)
		{
			if (properties)
			{
				if (properties.hiddenNodes && properties.hiddenNodes.length > 0)
				{
					self.switchObjectVisibility(
						account,
						model,
						properties.hiddenNodes,
						false
					);
				}

				if(properties.subModels)
				{
					for(var i = 0; i < properties.subModels.length; i++)
					{
						var entry = properties.subModels[i];
						this.applyModelProperties(entry.account, entry.model, entry.properties);
					}
				}
			}
		}

		this.lookAtObject = function(obj) {
			self.runtime.fitObject(obj, true);
		};

		this.applyApp = function(nodes, factor, emiss, otherSide) {
			var m_idx, origDiff, origAmb;

			if (!otherSide) {
				for (m_idx = 0; m_idx < nodes.length; m_idx++) {
					if (nodes[m_idx]._x3domNode) {
						origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
						nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

						origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
						nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

						nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);
					}
				}
			} else {
				for (m_idx = 0; m_idx < nodes.length; m_idx++) {
					if (nodes[m_idx]._x3domNode) {
						origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
						nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

						origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
						nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

						nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);
					}
				}
			}
		};

		this.pickObject = {};

		this.pickPoint = function(x,y) {
			var viewArea = self.getViewArea();
			var scene = viewArea._scene;

			if ((typeof x !== "undefined") && (typeof y !== "undefined"))
			{
				var viewMatrix = self.getViewArea().getViewMatrix();
				var projMatrix = self.getViewArea().getProjectionMatrix();

				viewArea._doc.ctx.pickValue(viewArea, x, y, 0, viewMatrix, projMatrix.mult(viewMatrix));
			}

			var oldPickMode = scene._vf.pickMode.toLowerCase();
			scene._vf.pickMode = "idbuf";
			scene._vf.pickMode = oldPickMode;

			self.pickObject = viewArea._pickingInfo;
			self.pickObject.part = null;
			self.pickObject.partID = null;

			var objId = self.pickObject.shadowObjectId;

			if (scene._multiPartMap) {
				for (var mpi = 0; mpi < scene._multiPartMap.multiParts.length; mpi++) {
					var mp = scene._multiPartMap.multiParts[mpi];

					if (objId > mp._minId && objId <= mp._maxId) {
						var colorMap = mp._inlineNamespace.defMap.MultiMaterial_ColorMap;
						var emissiveMap = mp._inlineNamespace.defMap.MultiMaterial_EmissiveMap;
						var specularMap = mp._inlineNamespace.defMap.MultiMaterial_SpecularMap;
						var visibilityMap = mp._inlineNamespace.defMap.MultiMaterial_VisibilityMap;

						self.pickObject.part = new x3dom.Parts(mp, [objId - mp._minId], colorMap, emissiveMap, specularMap, visibilityMap);
						self.pickObject.partID = mp._idMap.mapping[objId - mp._minId].name;
						self.pickObject.pickObj = self.pickObject.part.multiPart;
					}
				}
			}
		};

		this.oneGrpNodes = [];
		this.twoGrpNodes = [];

		this.setNavMode = function(mode, force) {
			if (self.currentNavMode !== mode || force) {
				// If the navigation mode has changed

				self.currentNavMode = mode;
				UnityUtil.setNavigation(mode);

				if (mode === self.NAV_MODES.WALK) {
					self.disableClicking();
				}
				/*else if (mode == "HELICOPTER") {
					self.disableSelecting();
				} */
				else {
					self.enableClicking();
				}

			}
		};

		this.reload = function() {
			//x3dom.reload();
		};

		this.startingPoint = [0.0, 0.0, 0.0];
		this.setStartingPoint = function(x, y, z) {
			self.startingPoint[0] = x;
			self.startingPoint[1] = y;
			self.startingPoint[2] = z;
		};

		this.defaultOrientation = [0.0, 0.0, 1.0];
		this.setStartingOrientation = function(x, y, z) {
			self.defaultOrientation[0] = x;
			self.defaultOrientation[1] = y;
			self.defaultOrientation[2] = z;
		};

		this.setCameraPosition = function(pos) {
			var vpInfo = self.getCurrentViewpointInfo();

			var viewDir = vpInfo.view_dir;
			var up = vpInfo.up;

			self.updateCamera(pos, up, viewDir);
		};

		this.moveCamera = function(dV) {
			var currentPos = self.getCurrentViewpointInfo().position;
			currentPos[0] += dV[0];
			currentPos[1] += dV[1];
			currentPos[2] += dV[2];

			self.setCameraPosition(currentPos);
		};

		this.setCameraViewDir = function(viewDir, upDir, centerOfRotation) {
			var currentPos = self.getCurrentViewpointInfo().position;
			self.updateCamera(currentPos, upDir, viewDir, centerOfRotation);
		};

		this.setCamera = function(pos, viewDir, upDir, centerOfRotation, animate, rollerCoasterMode, account, model) {
			self.updateCamera(pos, upDir, viewDir, centerOfRotation, animate, rollerCoasterMode, account, model);
		};


		this.updateCamera = function(pos, up, viewDir, centerOfRotation, animate, rollerCoasterMode, account, model) {
			UnityUtil.setViewpoint(pos, up, viewDir, account, model);
		};

		this.linked = false;

		this.managerSwitchMaster = function() {
			self.manager.switchMaster(self.handle);
		};

		this.linkMe = function() {
			// Need to be attached to the viewer master
			if (!self.manager) {
				return;
			}

			self.manager.linkMe(self.handle);
			self.onViewpointChanged(self.manager.viewpointLinkFunction);

			self.viewer.addEventListener("mousedown", self.managerSwitchMaster);

			self.linked = true;
		};


		this.collDistance = 0.1;
		this.changeCollisionDistance = function(collDistance) {
			self.collDistance = collDistance;
			self.nav._x3domNode._vf.avatarSize[0] = collDistance;
		};

		this.avatarHeight = 1.83;
		this.changeAvatarHeight = function(height) {
			self.avatarHeight = height;
			self.nav._x3domNode._vf.avatarSize[1] = height;
		};

		this.stepHeight = 0.4;
		this.changeStepHeight = function(stepHeight) {
			self.stepHeight = stepHeight;
			self.nav._x3domNode._vf.avatarSize[2] = stepHeight;
		};

		this.reset = function() {
/*			self.setCurrentViewpoint("model__start");

			self.changeCollisionDistance(self.collDistance);
			self.changeAvatarHeight(self.avatarHeight);
			self.changeStepHeight(self.stepHeight);*/
			UnityUtil.resetCamera();
		};

		this.loadModel = function(account, model, branch, revision) {
			self.account = account;
			self.model = model;
			self.branch = branch;
			self.revision = revision;
			UnityUtil.loadModel(self.account, self.model,
							self.branch, self.revision).then(
				function(bbox)
				{
					callback(self.EVENT.LOADED, bbox);
				}
			);
			callback(self.EVENT.START_LOADING);

		};

		this.getRoot = function() {
			return self.inline;
		};

		this.getScene = function() {
			return self.scene;
		};

		this.getCurrentViewpoint = function() {
			return self.getViewArea()._scene.getViewpoint()._xmlNode;
		};

		this.getCurrentViewpointInfo = function(account, model, promise) {
			UnityUtil.requestViewpoint(account, model, promise);
		};

		this.speed = 2.0;
		this.setSpeed = function(speed) {
			self.speed = speed;
			self.nav.speed = speed;
		};

		this.bgroundClick = function(event) {
			callback(self.EVENT.BACKGROUND_SELECTED);
		};

		this.hiddenParts = [];

		this.addHiddenPart = function(part) {
			this.hiddenParts.push(part);
		};

		this.revealAll = function(event, objEvent) {
			for (var part in self.hiddenParts) {
				if (self.hiddenParts.hasOwnProperty(part)) {
					self.hiddenParts[part].setVisibility(true);
				}
			}

			self.hiddenParts = [];
		};

		this.disableClicking = function() {
			if (self.clickingEnabled) {
				self.offBackgroundClicked(self.bgroundClick);
				self.offClickObject(self.clickObject);
				self.viewer.setAttribute("disableDoubleClick", true);
				self.clickingEnabled = false;
			}
		};

		this.disableSelecting = function() {
			self.selectionDisabled = true;
		};

		this.enableClicking = function() {
			if (!self.clickingEnabled) {
				// When the user clicks on the background the select nothing.
				self.onBackgroundClicked(self.bgroundClick);
				self.onClickObject(self.clickObject);
				self.viewer.setAttribute("disableDoubleClick", false);
				self.clickingEnabled = true;
			}
		};

		this.switchFullScreen = function(vrDisplay) {
			vrDisplay = vrDisplay || {};

			if (!self.fullscreen) {
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
		this.diffColorAdded = [];

		this.setDiffColors = function(diffColors) {
			if (diffColors) {
				self.diffColors = diffColors;
			}

			var i, mat, obj;

			self.applyApp(self.diffColorAdded, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.diffColorDeleted, 2.0, "0.0 0.0 0.0", false);

			self.diffColorAdded = [];
			self.diffColorDeleted = [];

			if (self.diffColors) {
				if (self.inline.childNodes.length) {
					var defMapSearch = self.inline.childNodes[0]._x3domNode._nameSpace.defMap;

					if (self.diffColors.added) {
						for (i = 0; i < self.diffColors.added.length; i++) {
							// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
							obj = defMapSearch[self.diffColors.added[i]];
							if (obj) {
								mat = obj._xmlNode.getElementsByTagName("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
									self.diffColorAdded.push(mat[0]);
								} else {
									mat = obj._xmlNode.getElementsByTagName("TwoSidedMaterial");
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);

									self.diffColorAdded.push(mat[0]);
								}

							}
						}
					}

					if (self.diffColors.deleted) {
						for (i = 0; i < self.diffColors.deleted.length; i++) {
							// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
							obj = defMapSearch[self.diffColors.deleted[i]];
							if (obj) {
								mat = obj._xmlNode.getElementsByTagName("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
									self.diffColorDeleted.push(mat[0]);
								} else {
									mat = obj._xmlNode.getElementsByTagName("TwoSidedMaterial");
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);

									self.diffColorDeleted.push(mat[0]);
								}
							}
						}
					}
				}
			}
		};

		this.transformEvent = function(event, viewpoint, inverse) {
			var transformation;

			if (inverse) {
				transformation = viewpoint._x3domNode.getTransformation().inverse();
			} else {
				transformation = viewpoint._x3domNode.getTransformation();
			}

			var newPos = transformation.multMatrixVec(event.position);
			var newOrientMat = ViewerUtil.axisAngleToMatrix(event.orientation[0], event.orientation[1]);
			newOrientMat = transformation.mult(newOrientMat);

			var newOrient = new x3dom.fields.Quaternion();
			newOrient.setValue(newOrientMat);
			newOrient = newOrient.toAxisAngle();

			event.position = newPos;
			event.orientation = newOrient;
		};

		/**
		 * Multi select mode
		 * @param on
		 */
		this.setMultiSelectMode = function (on) {
			//var element = document.getElementById("x3dom-default-canvas");
			this.multiSelectMode = on;
			//element.style.cursor =  on ? "copy" : "-webkit-grab";
		};

		/**
		 * Pin drop mode
		 * @param on
		 */
		this.setPinDropMode = function (on) {
			//var element = document.getElementById("x3dom-default-canvas");
			this.pinDropMode = on;
			//element.style.cursor = on ? "crosshair" : "-webkit-grab";
		};

		/****************************************************************************
		 * Clipping planes
		 ****************************************************************************/

		/*
		 * NOTE: Clipping planes are now all managed by unity use broadcast events to retrieve its info
		 */

		this.broadcastClippingPlane = function(clip)
		{
			callback(self.EVENT.CLIPPING_PLANE_BROADCAST, clip);
		}

		/**
		 * Update clipping planes on the viewer
		 * @param {array} clipPlanes - array of clipping planes
		 * @param {bool} fromPanel - indicate if the request came from clip panel
		 * @param {account} account - (OPTIONAL) the account the clip plane came from
		 * @param {model} model - (OPTIONAL) the model the clip plane came from
		 */
		this.updateClippingPlanes = function(clipPlanes, fromPanel, account, model)
		{
			if(!clipPlanes || clipPlanes.length === 0)
			{
				UnityUtil.disableClippingPlanes();
			}

			if(clipPlanes && clipPlanes.length > 0 )
			{
				UnityUtil.updateClippingPlanes(clipPlanes[0], !fromPanel, account, model);
			}

			if(clipPlanes && clipPlanes.length > 1)
			{
				console.log("More than 1 clipping planes requested!");
			}

		}

		this.clearClippingPlanes = function()
		{
			UnityUtil.disableClippingPlanes();
		}
		/****************************************************************************
		 * Pins
		 ****************************************************************************/
		self.pins = {};

		this.addPin = function(account, model, id, position, norm, colours, viewpoint) {
			if (self.pins.hasOwnProperty(id)) {
				errCallback(self.ERROR.PIN_ID_TAKEN);
			} else {
				self.pins[id] = new Pin(id, position, norm, colours, viewpoint, account, model);
			}
		};

		this.clickPin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				//self.highlightPin(id); This was preventing changing the colour of the pin
				// Replace with
				callback(self.EVENT.CHANGE_PIN_COLOUR, {
					id: id,
					colours: [[1.0, 0.7, 0.0]]
				});

				callback(self.EVENT.SET_CAMERA, {
					position : pin.viewpoint.position,
					view_dir : pin.viewpoint.view_dir,
					up: pin.viewpoint.up,
					account: pin.account,
					model: pin.model
				});

				callback(self.EVENT.UPDATE_CLIPPING_PLANES, {
					clippingPlanes: pin.viewpoint.clippingPlanes,
					account: pin.account,
					model: pin.model,
					fromClipPanel: false
				});
			}
		};

		this.setPinVisibility = function(id, visibility)
		{
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				pin.setAttribute("render", visibility.toString());
			}
		};

		this.removePin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				self.pins[id].remove(id);
				delete self.pins[id];
			}
		};

		this.previousHighLightedPin = null;
		this.highlightPin = function(id) {
			// If a pin was previously highlighted
			// switch it off
			if (self.previousHighLightedPin) {
				self.previousHighLightedPin.highlight();
				self.previousHighLightedPin = null;
			}

			// If the pin exists switch it on
			if (id && self.pins.hasOwnProperty(id)) {
				self.pins[id].highlight();
				self.previousHighLightedPin = self.pins[id];
			}
		};

		this.changePinColours = function(id, colours) {
			if (self.pins.hasOwnProperty(id)) {
				self.pins[id].changeColour(colours);
			}
		};
	};

	Viewer.prototype.SELECT_COLOUR = {
		EMISSIVE: "1.0 0.5 0.0"
	};

	Viewer.prototype.ERROR = {
		PIN_ID_TAKEN: "VIEWER_PIN_ID_TAKEN"
	};
}());

// Constants and enums
var VIEWER_NAV_MODES = Viewer.prototype.NAV_MODES = {
	HELICOPTER: "HELICOPTER",
	WALK: "WALK",
	TURNTABLE: "TURNTABLE",
	WAYFINDER: "WAYFINDER",
	FLY: "FLY"
};

var VIEWER_EVENTS = Viewer.prototype.EVENT = {
	// States of the viewer
	READY: "VIEWER_EVENT_READY",
	START_LOADING: "VIEWING_START_LOADING",
	LOAD_MODEL: "VIEWER_LOAD_MODEL",
	LOADED: "VIEWER_EVENT_LOADED",
	RUNTIME_READY: "VIEWING_RUNTIME_READY",

	ENTER_VR: "VIEWER_EVENT_ENTER_VR",
	VR_READY: "VIEWER_EVENT_VR_READY",
	SET_NAV_MODE: "VIEWER_SET_NAV_MODE",
	GO_HOME: "VIEWER_GO_HOME",
	SWITCH_FULLSCREEN: "VIEWER_SWITCH_FULLSCREEN",
	REGISTER_VIEWPOINT_CALLBACK: "VIEWER_REGISTER_VIEWPOINT_CALLBACK",
	REGISTER_MOUSE_MOVE_CALLBACK: "VIEWER_REGISTER_MOUSE_MOVE_CALLBACK",
	OBJECT_SELECTED: "VIEWER_OBJECT_SELECTED",
	BACKGROUND_SELECTED: "VIEWER_BACKGROUND_SELECTED",
	HIGHLIGHT_OBJECTS: "VIEWER_HIGHLIGHT_OBJECTS",
	SWITCH_OBJECT_VISIBILITY: "VIEWER_SWITCH_OBJECT_VISIBILITY",
	SET_PIN_VISIBILITY: "VIEWER_SET_PIN_VISIBILITY",
	GET_CURRENT_OBJECT_STATUS: "VIEWER_GET_CURRENT_OBJECT_STATUS",

	GET_CURRENT_VIEWPOINT: "VIEWER_GET_CURRENT_VIEWPOINT",

	GET_SCREENSHOT: "VIEWER_GET_SCREENSHOT",

	MEASURE_MODE_CLICK_POINT: "VIEWER_MEASURE_MODE_CLICK_POINT",

	PICK_POINT: "VIEWER_PICK_POINT",
	MOVE_POINT: "VIEWER_MOVE_POINT",
	SET_CAMERA: "VIEWER_SET_CAMERA",

	LOGO_CLICK: "VIEWER_LOGO_CLICK",

	// Clipping plane events
	CLEAR_CLIPPING_PLANES: "VIEWER_CLEAR_CLIPPING_PLANES",
	UPDATE_CLIPPING_PLANES: "VIEWER_UPDATE_CLIPPING_PLANE",
	CLIPPING_PLANE_READY: "VIEWER_CLIPPING_PLANE_READY",
	CLIPPING_PLANE_BROADCAST: "VIEWER_CLIPPING_PLANE_BROADCAST",

	// Pin events
	CLICK_PIN: "VIEWER_CLICK_PIN",
	CHANGE_PIN_COLOUR: "VIEWER_CHANGE_PIN_COLOUR",
	REMOVE_PIN: "VIEWER_REMOVE_PIN",
	ADD_PIN: "VIEWER_ADD_PIN",
	MOVE_PIN: "VIEWER_MOVE_PIN",

};
