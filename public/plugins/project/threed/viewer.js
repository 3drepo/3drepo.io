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

function bgroundClick(event) {
	$.event.trigger("bgroundClicked", event);
};

function clickObject(event) {
	$.event.trigger("clickObject", event);
};

function clickPin(event) {
	$.event.trigger("pinClick", event);
}

function onMouseOver(event) {
	$.event.trigger("onMouseOver", event);
}

function onMouseDown(event) {
	$.event.trigger("onMouseDown", event);
}

function onMouseUp(event) {
	$.event.trigger("onMouseUp", event);
}

function onMouseMove(event) {
	$.event.trigger("onMouseMove", event);
}

function onViewpointChange(event) {
	$.event.trigger("onViewpointChange", event);
}

function onLoaded(event) {
	$.event.trigger("onLoaded", event);
}

function runtimeReady() {
	$.event.trigger("runtimeReady");
}

x3dom.runtime.ready = runtimeReady;

// ----------------------------------------------------------
var Viewer = {};

(function() {
	"use strict";

	Viewer = function(name, element, manager, callback, errCallback) {
		// Properties
		var self = this;

		if (!name) {
			this.name = "viewer";
		} else {
			this.name = name;
		}

		callback = !callback ? function(type, value) {
			console.log(type + ": " + value);
		} : callback;

		errCallback = !errCallback ? function(type, value) {
			console.error(type + ": " + value);
		} : errCallback;

		// If not given the tag by the manager create here
		this.element = element;

		this.inline = null;
		this.runtime = null;
		this.fullscreen = false;

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
		this.project = null;
		this.branch = null;
		this.revision = null;
		this.modelString = null;

		this.rootName = "model";
		this.inlineRoots = {};
		this.multipartNodes = [];
		this.multipartNodesByProject = {};

		this.setHandle = function(handle) {
			this.handle = handle;
		};

		this.init = function() {
			if (!self.initialized) {
				// If we have a viewer manager then it
				// will take care of initializing the runtime
				// else we'll do it ourselves
				x3dom.runtime.ready = self.initRuntime;

				self.logo = document.createElement("div");
				self.logo.setAttribute("id", "viewer_logo");
				self.logo.setAttribute("style", "top: 0px; left: 0; right: 0; position: absolute; z-index:2; margin: auto; width: 250px; margin-top: 10px");
				self.logo.setAttribute("onclick", "logoClick()");

				self.logoImage = document.createElement("img");
				self.logoImage.setAttribute("src", logo_string);
				self.logoImage.setAttribute("style", "width: 100%;");
				self.logoImage.textContent = " ";

				self.logoLink = document.createElement("a");

				if (server_config.return_path) {
					self.logoLink.setAttribute("href", server_config.return_path);
				} else {
					self.logoLink.setAttribute("href", "https://www.3drepo.io");
				}

				//self.logoLink.setAttribute("style", "top: 0px; left: 0px; padding: 10px; position: absolute;")
				self.logoLink.appendChild(self.logoImage);

				self.logo.appendChild(self.logoLink);

				//self.logo.setAttribute("style", "top: 0px; left: 0px; padding: 10px; position: absolute; z-index:10000;")
				self.element.appendChild(self.logo);

				// Set up the DOM elements
				self.viewer = document.createElement("x3d");
				self.viewer.setAttribute("id", self.name);
				self.viewer.setAttribute("xmlns", "http://www.web3d.org/specification/x3d-namespace");
				self.viewer.setAttribute("keysEnabled", "true");
				self.viewer.addEventListener("mousedown", self.onMouseDown);
				self.viewer.addEventListener("mouseup",  self.onMouseUp);
				self.viewer.style["pointer-events"] = "all";
				self.viewer.className = "viewer";

				self.element.appendChild(self.viewer);
				
				self.scene = document.createElement("Scene");
				self.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
				self.scene.setAttribute("dopickpass", false);
				self.viewer.appendChild(self.scene);

				self.pinShader = new PinShader(self.scene);
				
				self.bground = null;
				self.currentNavMode = null;

				self.createBackground();

				self.environ = document.createElement("environment");
				self.environ.setAttribute("frustumCulling", "true");
				self.environ.setAttribute("smallFeatureCulling", "true");
				self.environ.setAttribute("smallFeatureThreshold", 5);
				self.environ.setAttribute("occlusionCulling", "true");
				self.environ.setAttribute("sorttrans", "false");
				self.scene.appendChild(self.environ);

				self.light = document.createElement("directionallight");
				//self.light.setAttribute("intensity", "0.5");
				self.light.setAttribute("color", "0.714, 0.910, 0.953");
				self.light.setAttribute("direction", "0, -0.9323, -0.362");
				self.light.setAttribute("global", "true");
				self.light.setAttribute("ambientIntensity", "0.8");
				self.light.setAttribute("shadowIntensity", 0.0);
				self.scene.appendChild(self.light);

				self.createViewpoint(self.name + "_default");

				self.nav = document.createElement("navigationInfo");
				self.nav.setAttribute("headlight", "false");
				self.nav.setAttribute("type", self.defaultNavMode);
				self.scene.appendChild(self.nav);

				self.loadViewpoint = self.name + "_default"; // Must be called after creating nav

				self.viewer.addEventListener("keypress", function(e) {
					if (e.charCode === "r".charCodeAt(0)) {
						self.reset();
						self.setApp(null);
						self.setNavMode("WALK");
						self.disableClicking();
					} else if (e.charCode === "a".charCodeAt(0)) {
						self.showAll();
						self.enableClicking();
					} else if (e.charCode === "u".charCodeAt(0)) {
						self.revealAll();
					}
				});

				self.initialized = true;

				if (manager) {
					manager.registerMe(self);
				}

				self.enableClicking();

				callback(self.EVENT.READY, {
					name: self.name,
					model: self.modelString
				});
			}
		};

		this.close = function() {
			self.viewer.parentNode.removeChild(self.viewer);
			self.viewer = null;
		};

		// This is called when the X3DOM runtime is initialized
		this.initRuntime = function() {
			if (this.doc.id === self.name) {
				self.runtime = this;

				callback(self.EVENT.RUNTIME_READY, {
					name: self.name
				});
			}

			self.showAll = function() {
				self.runtime.fitAll();

				// TODO: This is a hack to get around a bug in X3DOM
				self.getViewArea()._flyMat = null;

				self.setNavMode(self.defaultNavMode);
			};

			self.getCurrentViewpoint().addEventListener("viewpointChanged", self.viewPointChanged);

			$(document).on("onLoaded", function(event, objEvent) {
				if (self.loadViewpoint) {
					self.setCurrentViewpoint(self.loadViewpoint);
				}

				var targetParent = objEvent.target._x3domNode._nameSpace.doc._x3dElem;

				self.loadViewpoints();

				if (targetParent === self.viewer) {
					self.setDiffColors(null);
				}

				if (objEvent.target.tagName.toUpperCase() === "INLINE") {
					self.inlineRoots[objEvent.target.nameSpaceName] = objEvent.target;
				} else if (objEvent.target.tagName.toUpperCase() === "MULTIPART") {
					var nameSpaceName = objEvent.target._x3domNode._nameSpace.name;
					if (!self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
						self.multipartNodesByProject[nameSpaceName] = {};
					}

					var multipartName = objEvent.target.getAttribute("id");
					var multipartNameParts = multipartName.split("__");
					var multipartID = multipartNameParts[multipartNameParts.length - 1];

					self.multipartNodesByProject[nameSpaceName][multipartID] = objEvent.target;

					self.multipartNodes.push(objEvent.target);
				}

				self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);

				if (!self.pinSizeFromSettings) {
					var sceneBBox = self.getScene()._x3domNode.getVolume();
					var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
					self.pinSize = sceneSize / 20;
				}

				self.showAll();

				if (!self.downloadsLeft) {
					callback(self.EVENT.LOADED);
				}
			});
		};

		this.createBackground = function() {
			if (self.bground) {
				self.bground.parentNode.removeChild(self.bground);
			}

			self.bground = document.createElement("background");

			self.bground.setAttribute("DEF", name + "_bground");
			self.bground.setAttribute("skyangle", "0.9 1.5 1.57");
			self.bground.setAttribute("skycolor", "0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1");
			self.bground.setAttribute("groundangle", "0.9 1.5 1.57");
			self.bground.setAttribute("groundcolor", "0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91");
			self.bground.textContent = " ";

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

		this.getProjectionMatrix = function() {
			return self.getViewArea().getProjectionMatrix();
		};

		this.onMouseUp = function(functionToBind) {
			$(self.viewer).on("onMouseUp", functionToBind);
		};

		this.onMouseDown = function(functionToBind) {
			$(self.viewer).on("onMouseDown", functionToBind);
			
			var pickingInfo = self.getViewArea()._pickingInfo;
			
			if (pickingInfo.pickObj)
			{
				var account, project;
				
				var objectID = pickingInfo.pickObj.partID ? 
					pickingInfo.pickObj.partID : 
					pickingInfo.pickObj.pickObj._xmlNode.getAttribute("DEF");

				var projectParts = pickingInfo.pickObj._xmlNode.getAttribute("id").split("__");

				account = projectParts[0];
				project = projectParts[1];
				
				var inlineTransName = ViewerUtil.escapeCSSCharacters(account + "__" + project);
				var projectInline = self.inlineRoots[inlineTransName];
				var trans = projectInline._x3domNode.getCurrentTransform();

				callback(self.EVENT.PICK_POINT, {
					id: objectID, 
					position: pickingInfo.pickPos,
					normal: pickingInfo.pickNorm,
					object: pickingInfo.pickObj,
					trans: trans
				});
			} else {
				callback(self.EVENT.PICK_POINT, 
				{
					position: pickingInfo.pickPos,
					normal: pickingInfo.pickNorm
				})
			}
		};

		this.onViewpointChanged = function(functionToBind) {
			$(self.viewer).on("myViewpointHasChanged", functionToBind);
		};

		this.offViewpointChanged = function(functionToBind) {
			$(self.viewer).off("myViewpointHasChanged", functionToBind);
		};

		this.viewPointChanged = function(event) {
			var vpInfo = self.getCurrentViewpointInfo();
			var eye = vpInfo.position;
			var viewDir = vpInfo.view_dir;

			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
				self.nav._x3domNode._vf.typeParams[1] = eye[1];
			}

			$(self.viewer).trigger("myViewpointHasChanged", event);
		};

		this.onBackgroundClicked = function(functionToBind) {
			$(document).on("bgroundClicked", functionToBind);
		};

		this.offBackgroundClicked = function(functionToBind) {
			$(document).off("bgroundClicked", functionToBind);
		};

		this.selectParts = function(part, zoom) {
			if (!Array.isArray(part)) {
				part = [part];
			}

			if (zoom) {
				for (var i = 0; i < part.length; i++) {
					part[i].fit();
				}
			}

			if (self.oldPart) {
				for (var i = 0; i < self.oldPart.length; i++) {
					self.oldPart[i].resetColor();
				}
			}

			self.oldPart = part;

			for (var i = 0; i < part.length; i++) {
				part[i].setEmissiveColor(self.SELECT_COLOUR.EMISSIVE, "front");
			}
		};

		this.clickObject = function(event, objEvent) {
			var account = null;
			var project = null;
			var id = null;

			if ((objEvent.button === 1) && !self.selectionDisabled) {
				if (objEvent.partID) {
					id = objEvent.partID;

					account = objEvent.part.multiPart._nameSpace.name.split("__")[0];
					project = objEvent.part.multiPart._nameSpace.name.split("__")[1];

				}
			}

			callback(self.EVENT.OBJECT_SELECTED, {
				account: account,
				project: project,
				id: id,
				source: "viewer"
			});
		};

		this.highlightObjects = function(account, project, id, ids, zoom) {
			var nameSpaceName = null;

			/*
			if (account && project) {
				nameSpaceName = account + "__" + project;
			}
			*/

			if (!ids) {
				ids = [];
			}

			// Is this a multipart project
			if (!nameSpaceName || self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
				var fullPartsList = [];
				var nsMultipartNodes;

				// If account and project have been specified
				// this helps narrow the search
				if (nameSpaceName) {
					nsMultipartNodes = self.multipartNodesByProject[nameSpaceName];
				} else {
					// Otherwise iterate over everything
					nsMultipartNodes = self.multipartNodes;
				}

				for (var multipartNodeName in nsMultipartNodes) {
					if (nsMultipartNodes.hasOwnProperty(multipartNodeName)) {
						var parts = nsMultipartNodes[multipartNodeName].getParts(ids);

						if (parts && parts.ids.length > 0) {
							fullPartsList.push(parts);
						}
					}
				}

				self.selectParts(fullPartsList, zoom);
			}

			var object = $("[id$=" + id + "]");

			if (object[0]) {
				self.setApp(object[0]);
			}
		};

		this.switchedOldParts = [];
		this.switchedObjects = [];

		this.switchObjectVisibility = function(account, project, id, ids, state) {
			var nameSpaceName = null;
			var i;

			if (account && project) {
				nameSpaceName = account + "__" + project;
			}

			if (!ids) {
				ids = [];
			}

			// Is this a multipart project
			if (!nameSpaceName || self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
				var fullPartsList = [];
				var nsMultipartNodes;

				// If account and project have been specified
				// this helps narrow the search
				if (nameSpaceName) {
					nsMultipartNodes = self.multipartNodesByProject[nameSpaceName];
				} else {
					// Otherwise iterate over everything
					nsMultipartNodes = self.multipartNodes;
				}

				for (i = 0; i < self.switchedOldParts.length; i++) {
					if (ids.indexOf(self.switchedOldParts[i]) > -1) {
						self.switchedOldParts[i].setVisibility(state);
						delete self.switchOldParts[i];
						i--;
					}
				}

				for (var multipartNodeName in nsMultipartNodes) {
					if (nsMultipartNodes.hasOwnProperty(multipartNodeName)) {
						var parts = nsMultipartNodes[multipartNodeName].getParts(ids);

						if (parts && parts.ids.length > 0) {
							self.switchedOldParts = self.switchedOldParts.concat(parts.ids);
							parts.setVisibility(state);
						}
					}
				}
			}

			for (i = 0; i < self.switchedObjects.length; i++) {
				if (ids.indexOf(self.switchedObjects[i]) > -1) {
					self.switchedObjects[i].setAttribute("render", state.toString());
					delete self.switchOldParts[i];
					i--;
				}
			}

			var object = $("[id$=" + id + "]");

			if (object[0]) {
				object[0].setAttribute("render", state.toString());
				self.switchedObjects.push(id);
			}
		};


		/*
		$(document).on("partSelected", function(event, part, zoom) {
			self.selectParts(part, zoom);

			var obj = {};
			obj.multipart = true;
			obj.id = part.multiPart._nameSpace.name + "__" + part.partID;

			
			callback(self.EVENT.OBJECT_SELECTED, {
				account: ,
				project: 
			})
			

			$(document).trigger("objectSelected", obj);
		});

		$(document).on("objectSelected", function(event, object, zoom) {
			if (object !== undefined) {
				if (!object.hasOwnProperty("multipart")) {
					if (zoom) {
						if (object.getAttribute("render") !== "false") {
							self.lookAtObject(object);
						}
					}
				}
			} else {
				self.selectParts([], false);
			}

			self.setApp(object);
		});
		*/

		$(document).on("pinClick", function(event, clickInfo) {
			var pinID = clickInfo.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
			callback(self.EVENT.CLICK_PIN,
			{
				id : pinID
			});
		});

		$(document).on("onMouseDown", function(event, mouseEvent) {
			$("body")[0].style["pointer-events"] = "none";
		});

		$(document).on("onMouseUp", function(event, mouseEvent) {
			$("body")[0].style["pointer-events"] = "all";
		});

		this.onClickObject = function(functionToBind) {
			$(document).on("clickObject", functionToBind);
		};

		this.offClickObject = function(functionToBind) {
			$(document).off("clickObject", functionToBind);
		};

		if (0) {
			this.moveScale = 1.0;

			self.element.addEventListener("keypress", function(e) {
				var mapPos = $("#model__mapPosition")[0];
				var oldTrans = mapPos.getAttribute("translation").split(",").map(
					function(res) {
						return parseFloat(res);
					});

				if (e.charCode === "q".charCodeAt(0)) {
					oldTrans[0] = oldTrans[0] + 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				if (e.charCode === "w".charCodeAt(0)) {
					oldTrans[0] = oldTrans[0] - 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				if (e.charCode === "e".charCodeAt(0)) {
					oldTrans[2] = oldTrans[2] + 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				if (e.charCode === "f".charCodeAt(0)) {
					oldTrans[2] = oldTrans[2] - 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				var mapRotation = $("#model__mapRotation")[0];
				var oldRotation = mapRotation.getAttribute("rotation").split(",").map(
					function(res) {
						return parseFloat(res);
					});

				if (e.charCode === "g".charCodeAt(0)) {
					oldRotation[3] = oldRotation[3] + 0.01 * self.moveScale;
					mapRotation.setAttribute("rotation", oldRotation.join(","));
				}

				if (e.charCode === "h".charCodeAt(0)) {
					oldRotation[3] = oldRotation[3] - 0.01 * self.moveScale;
					mapRotation.setAttribute("rotation", oldRotation.join(","));
				}

				var oldScale = mapPos.getAttribute("scale").split(",").map(
					function(res) {
						return parseFloat(res);
					});

				if (e.charCode === "j".charCodeAt(0)) {
					oldScale[0] = oldScale[0] + 0.01 * self.moveScale;
					oldScale[2] = oldScale[2] + 0.01 * self.moveScale;

					mapPos.setAttribute("scale", oldScale.join(","));
				}

				if (e.charCode === "k".charCodeAt(0)) {
					oldScale[0] = oldScale[0] - 0.01 * self.moveScale;
					oldScale[2] = oldScale[2] - 0.01 * self.moveScale;

					mapPos.setAttribute("scale", oldScale.join(","));
				}
			});
		}

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
			var viewpointList = $("Viewpoint");

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

		this.createViewpoint = function(name, from, at, up) {
			var groupName = self.getViewpointGroupAndName(name);

			if (!(self.viewpoints[groupName.group] && self.viewpoints[groupName.group][groupName.name])) {
				var newViewPoint = document.createElement("viewpoint");
				newViewPoint.setAttribute("id", name);
				newViewPoint.setAttribute("def", name);
				self.scene.appendChild(newViewPoint);

				if (from && at && up) {
					var q = self.getAxisAngle(from, at, up);
					newViewPoint.setAttribute("orientation", q.join(","));
				}

				if (!self.viewpoints[groupName.group]) {
					self.viewpoints[groupName.group] = {};
				}

				self.viewpoints[groupName.group][groupName.name] = name;
				self.viewpointsNames[name] = newViewPoint;

			} else {
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

			self.loadViewpoint = id;
		};

		this.updateSettings = function(settings) {
			if (settings) {
				self.settings = settings;
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
			}
		};

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

		this.pickPoint = function(x, y) {
			var viewArea = self.getViewArea();
			var scene = viewArea._scene;

			var oldPickMode = scene._vf.pickMode.toLowerCase();
			scene._vf.pickMode = "idbuf";
			scene._vf.pickMode = oldPickMode;

			self.pickObject.pickPos = viewArea._pickingInfo.pickPos;
			self.pickObject.pickNorm = viewArea._pickingInfo.pickNorm;
			self.pickObject.pickObj = viewArea._pickingInfo.pickObj;
			self.pickObject.part = null;
			self.pickObject.partID = null;

			var objId = viewArea._pickingInfo.shadowObjectId;

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

		this.setApp = function(group, app) {
			if (!group || !group.multipart) {
				if (app === undefined) {
					app = self.SELECT_COLOUR.EMISSIVE;
				}

				self.applyApp(self.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
				self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
				self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

				// TODO: Make this more efficient
				self.applyApp(self.diffColorAdded, 0.5, "0.0 1.0 0.0");
				self.applyApp(self.diffColorDeleted, 0.5, "1.0 0.0 0.0");

				if (group) {
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
		};

		this.setNavMode = function(mode) {
			if (self.currentNavMode !== mode) {
				// If the navigation mode has changed

				if (mode === self.NAV_MODES.WAYFINDER) { // If we are entering wayfinder navigation
					waypoint.init();
				}

				if (self.currentNavMode === self.NAV_MODES.WAYFINDER) { // Exiting the wayfinding mode
					waypoint.close();
				}

				if (mode === self.NAV_MODES.HELICOPTER) {
					var vpInfo = self.getCurrentViewpointInfo();
					var eye = vpInfo.position;
					var viewDir = vpInfo.view_dir;

					self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
					self.nav._x3domNode._vf.typeParams[1] = eye[1];
				}

				self.currentNavMode = mode;
				self.nav.setAttribute("type", mode);

				if (mode === self.NAV_MODES.WALK) {
					self.disableClicking();
					self.setApp(null);
				}
				/*else if (mode == "HELICOPTER") {
					self.disableSelecting();
				} */
				else {
					self.enableClicking();
				}

				if ((mode === self.NAV_MODES.WAYFINDER) && waypoint) {
					waypoint.resetViewer();
				}

				if (mode === self.NAV_MODES.TURNTABLE) {
					self.nav.setAttribute("typeParams", "-0.4 60.0 0 3.14 0.00001");
				}
			}
		};

		this.reload = function() {
			x3dom.reload();
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

		this.setCameraViewDir = function(viewDir, upDir) {
			var currentPos = self.getCurrentViewpointInfo().position;
			self.updateCamera(currentPos, upDir, viewDir);
		};

		this.setCamera = function(pos, viewDir, upDir, animate) {
			self.updateCamera(pos, upDir, viewDir, animate);
		};

		this.updateCamera = function(pos, up, viewDir, animate) {
			var x3domView = new x3dom.fields.SFVec3f();
			x3domView.setValueByStr(viewDir.join(","));

			var x3domUp = new x3dom.fields.SFVec3f();
			x3domUp.setValueByStr(ViewerUtil.normalize(up).join(","));

			var x3domFrom = new x3dom.fields.SFVec3f();
			x3domFrom.setValueByStr(pos.join(","));

			var x3domAt = x3domFrom.add(x3domView);

			var viewMatrix = x3dom.fields.SFMatrix4f.lookAt(x3domFrom, x3domAt, x3domUp).inverse();
			var currMatrix = self.getCurrentViewpoint()._x3domNode;

			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(x3domView.y);
				self.nav._x3domNode._vf.typeParams[1] = x3domFrom.y;
			}

			if (animate)
			{
				self.getViewArea().animateTo(viewMatrix, currMatrix);
			} else {
				// TODO: Fill this in here
			}

			if (self.linked) {
				self.manager.switchMaster(self.handle);
			}
		};

		this.linked = false;
		this.linkMe = function() {
			// Need to be attached to the viewer master
			if (!self.manager) {
				return;
			}

			self.manager.linkMe(self.handle);
			self.onViewpointChanged(self.manager.viewpointLinkFunction);

			self.viewer.addEventListener("mousedown", function() {
				self.manager.switchMaster(self.handle);
			});

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
			self.setCurrentViewpoint("model__start");

			self.changeCollisionDistance(self.collDistance);
			self.changeAvatarHeight(self.avatarHeight);
			self.changeStepHeight(self.stepHeight);
		};

		this.loadModel = function(account, project, branch, revision) {
			var url = "";

			if (revision === "head") {
				url = server_config.apiUrl(account + "/" + project + "/revision/" + branch + "/head.x3d.mp");
			} else {
				url = server_config.apiUrl(account + "/" + project + "/revision/" + revision + ".x3d.mp");
			}

			self.account = account;
			self.project = project;
			self.branch = branch;
			self.revision = revision;

			self.modelString = account + "_" + project + "_" + branch + "_" + revision;

			self.loadURL(url);
		};

		this.loadURL = function(url) {
			if (self.inline) {
				self.inline.parentNode.removeChild(self.inline);
				self.inline = null; // Garbage collect
			}

			self.inline = document.createElement("inline");
			self.scene.appendChild(self.inline);

			if (self.account && self.project) {
				self.rootName = self.account + "__" + self.project;
			} else {
				self.rootName = "model";
			}

			self.inline.setAttribute("namespacename", self.rootName);
			self.inline.setAttribute("onload", "onLoaded(event);");
			self.inline.setAttribute("url", url);
			self.reload();

			self.url = url;

			callback(self.EVENT.START_LOADING, {
				name: self.name
			});
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

		this.getCurrentViewpointInfo = function() {
			var viewPoint = {};

			var origViewTrans = self.getViewArea()._scene.getViewpoint().getCurrentTransform();
			var viewMat = self.getViewMatrix().inverse();

			var viewRight = viewMat.e0();
			var viewUp = viewMat.e1();
			var viewDir = viewMat.e2().multiply(-1); // Because OpenGL points out of screen
			var viewPos = viewMat.e3();

			var center = self.getViewArea()._scene.getViewpoint().getCenterOfRotation();

			var lookAt = null;

			if (center) {
				lookAt = center.subtract(viewPos);
			} else {
				lookAt = viewPos.add(viewDir);
			}

			var projMat = self.getProjectionMatrix();

			// More viewing direction than lookAt to sync with Assimp
			viewPoint.up = [viewUp.x, viewUp.y, viewUp.z];
			viewPoint.position = [viewPos.x, viewPos.y, viewPos.z];
			viewPoint.look_at = [lookAt.x, lookAt.y, lookAt.z];
			viewPoint.view_dir = [viewDir.x, viewDir.y, viewDir.z];
			viewPoint.right = [viewRight.x, viewRight.y, viewRight.z];
			viewPoint.unityHeight = 2.0 / projMat._00;
			viewPoint.fov = Math.atan((1 / projMat._00)) * 2.0;
			viewPoint.aspect_ratio = viewPoint.fov / projMat._11;

			var f = projMat._23 / (projMat._22 + 1);
			var n = (f * projMat._23) / (projMat._23 - 2 * f);

			viewPoint.far = f;
			viewPoint.near = n;

			viewPoint.clippingPlanes = self.clippingPlanes;

			return viewPoint;
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
								mat = $(obj._xmlNode).find("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
									self.diffColorAdded.push(mat[0]);
								} else {
									mat = $(obj._xmlNode).find("TwoSidedMaterial");
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
								mat = $(obj._xmlNode).find("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
									self.diffColorDeleted.push(mat[0]);
								} else {
									mat = $(obj._xmlNode).find("TwoSidedMaterial");
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

		/****************************************************************************
		 * Clipping planes
		 ****************************************************************************/

		var clippingPlaneID = -1;
		this.clippingPlanes = [];

		this.setClippingPlanes = function(clippingPlanes) {
			self.clearClippingPlanes();

			for (var clipidx = 0; clipidx < clippingPlanes.length; clipidx++) {
				var clipPlaneIDX = self.addClippingPlane(
					clippingPlanes[clipidx].axis,
					clippingPlanes[clipidx].distance,
					clippingPlanes[clipidx].percentage,
					clippingPlanes[clipidx].clipDirection
				);
			}
		};

		/**
		 * Adds a clipping plane to the viewer
		 * @param {string} axis - Axis through which the plane clips
		 * @param {number} distance - Distance along the bounding box to clip
		 * @param {number} percentage - Percentage along the bounding box to clip (overrides distance)
		 * @param {number} clipDirection - Direction of clipping (-1 or 1)
		 */
		this.addClippingPlane = function(axis, distance, percentage, clipDirection) {
			clippingPlaneID += 1;

			var newClipPlane = new ClipPlane(clippingPlaneID, self, axis, [1, 1, 1], distance, percentage, clipDirection);
			self.clippingPlanes.push(newClipPlane);

			return clippingPlaneID;
		};

		this.moveClippingPlane = function(percentage) {
			// Only supports a single clipping plane at the moment.
			self.clippingPlanes[0].movePlane(percentage);
		};

		/**
		 * Clear out all clipping planes
		 */
		this.clearClippingPlanes = function() {
			self.clippingPlanes.forEach(function(clipPlane) {
				clipPlane.destroy();

			});

			self.clippingPlanes = [];
		};

		/**
		 * Clear out all clipping planes
		 * @param {number} id - Get the clipping plane with matching unique ID
		 */
		this.getClippingPlane = function(id) {
			// If the clipping plane no longer exists this
			// will return undefined
			return self.clippingPlanes.filter(function(clipPlane) {
				return (clipPlane.getID() === id);
			})[0];
		};

		/****************************************************************************
		 * Pins
		 ****************************************************************************/
		self.pins = {};

		this.addPin = function(account, project, id, position, norm, colours, viewpoint) {
			if (self.pins.hasOwnProperty(id)) {
				errCallback(self.ERROR.PIN_ID_TAKEN);
			} else {

				var trans = null;				
				var projectNameSpace = account + "__" + project;

				if (self.inlineRoots.hasOwnProperty(projectNameSpace))
				{				
					var projectInline = self.inlineRoots[account + "__" + project];
					trans = projectInline._x3domNode.getCurrentTransform();
				}

				self.pins[id] = new Pin(id, self.getScene(), trans, position, norm, self.pinSize, colours, viewpoint);
			}
		};
		
		this.clickPin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];
				
				self.highlightPin(id);
				
				callback(self.EVENT.SET_CAMERA, {
					position : pin.viewpoint.position,
					view_dir : pin.viewpoint.view_dir,
					up: pin.viewpoint.up
				}); 
				
				callback(self.EVENT.SET_CLIPPING_PLANES, {
					clippingPlanes: pin.viewpoint.clippingPlanes
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
	WAYFINDER: "WAYFINDER"
};

var VIEWER_EVENTS = Viewer.prototype.EVENT = {
	// States of the viewer
	READY: "VIEWER_EVENT_READY",
	START_LOADING: "VIEWING_START_LOADING",
	LOADED: "VIEWER_EVENT_LOADED",
	RUNTIME_READY: "VIEWING_RUNTIME_READY",

	ENTER_VR: "VIEWER_EVENT_ENTER_VR",
	VR_READY: "VIEWER_EVENT_VR_READY",
	SET_NAV_MODE: "VIEWER_SET_NAV_MODE",
	GO_HOME: "VIEWER_GO_HOME",
	SWITCH_FULLSCREEN: "VIEWER_SWITCH_FULLSCREEN",
	REGISTER_VIEWPOINT_CALLBACK: "VIEWER_REGISTER_VIEWPOINT_CALLBACK",
	OBJECT_SELECTED: "VIEWER_OBJECT_SELECTED",
	BACKGROUND_SELECTED: "VIEWER_BACKGROUND_SELECTED",
	SWITCH_OBJECT_VISIBILITY: "VIEWER_SWITCH_OBJECT_VISIBILITY",

	PICK_POINT: "VIEWER_PICK_POINT",
	SET_CAMERA: "VIEWER_SET_CAMERA",

	// Clipping plane events
	CLEAR_CLIPPING_PLANES: "VIEWER_CLEAR_CLIPPING_PLANES",
	ADD_CLIPPING_PLANE: "VIEWER_ADD_CLIPPING_PLANE",
	MOVE_CLIPPING_PLANE: "VIEWER_MOVE_CLIPPING_PLANE",
	CLIPPING_PLANE_READY: "VIEWER_CLIPPING_PLANE_READY",
	SET_CLIPPING_PLANES: "VIEWER_SET_CLIPPING_PLANES",

	// Pin events
	CLICK_PIN: "VIEWER_CLICK_PIN",
	CHANGE_PIN_COLOUR: "VIEWER_CHANGE_PIN_COLOUR",
	REMOVE_PIN: "VIEWER_REMOVE_PIN",
	ADD_PIN: "VIEWER_ADD_PIN",
	MOVE_PIN: "VIEWER_MOVE_PIN"
};