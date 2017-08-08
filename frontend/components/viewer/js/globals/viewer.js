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

var Viewer = {};
// Constants and enums

(function() {
	"use strict";

	Viewer = function(name, element, callback, errCallback) {
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

		this.initialized = false;

		this.downloadsLeft = 1;

		this.defaultNavMode = Viewer.NAV_MODES.TURNTABLE;

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

		this.setUnits = function(units) {
			this.units = units;

			if (units === "mm") {
				this.convertToM = 0.001;
			} else if (units === "ft") {
				this.convertToM = 0.0032;
			}

		};

		this.setHandle = function(handle) {
			this.handle = handle;
		};

		this.logos    = [];


		this.preInit = function() {

			self.viewer = document.createElement("div");
			self.viewer.className = "viewer";

			self.loadingDiv = document.createElement("div");
			self.loadingDivText = document.createElement("p");
			self.loadingDiv.appendChild(self.loadingDivText);

			self.loadingDivText.innerHTML = "";
			self.loadingDiv.className += "loadingViewer";
			self.loadingDivText.className += "loadingViewerText";

			var canvas = document.createElement("canvas");
			canvas.className = "emscripten";
			canvas.setAttribute("id", "canvas");
			canvas.setAttribute("tabindex", "1"); // You need this for canvas to register keyboard events
			canvas.setAttribute("oncontextmenu", "event.preventDefault()");

			canvas.onmousedown = function(){
				return false;
			};
		
			canvas.style["pointer-events"] = "all";
			
			self.element.appendChild(self.viewer);
			self.viewer.appendChild(canvas);
			self.viewer.appendChild(self.loadingDiv);
			self.unityLoaderScript = document.createElement("script");
			self.unityLoaderScript.setAttribute("src", "public/unity/Release/UnityLoader.js");
		};

		this.init = function(options) {

			

			return new Promise(function(resolve, reject) {

				if (self.initialized) {
					resolve();
				}

				// Set option param from viewerDirective
				self.options = options;

				self.loadingDivText.innerHTML = "Loading Viewer...";
				document.body.style.cursor = "wait";
				// This kicks off the actual loading of Unity
				self.viewer.appendChild(self.unityLoaderScript);

				//Shouldn't need this, but for something it is not being recognised from unitySettings!
				Module.errorhandler = UnityUtil.onError;

				self.scene = document.createElement("Scene");
				self.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
				self.viewer.appendChild(self.scene);

		
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

				if (self.options && self.options.plugins) {
					self.plugins = self.options.plugins;
					Object.keys(self.plugins).forEach(function(key){
						self.plugins[key].initCallback && self.plugins[key].initCallback(self);
					});
				}

				UnityUtil.pickPointCallback = self.pickPointEvent;
				UnityUtil.objectSelectedCallback = self.objectSelected;
				UnityUtil.clipBroadcastCallback = self.broadcastClippingPlane;
				UnityUtil.errorCallback = self.handleError;

				UnityUtil.setAPIHost(options.getAPI); 
				self.setNavMode(self.defaultNavMode);

				UnityUtil.onReady().then(function() {
					self.initialized = true;
					self.loadingDivText.innerHTML = "";
					callback(Viewer.EVENT.UNITY_READY, {
						name: self.name,
						model: self.modelString
					});
					resolve();
				}).catch(function(error){
					self.loadingDivText.innerHTML = "Loading Viewer Failed!";
					console.error("UnityUtil.onReady failed: ", error);
					reject(error);
				});
				
			});
			
		};

		this.handleError = function(message) {
			callback(Viewer.EVENT.UNITY_ERROR, message);
		};

		this.destroy = function() {
			UnityUtil.reset();
		};

		this.showAll = function() {
			UnityUtil.resetCamera();
		};

		this.setAmbientLight = function(lightDescription) {
			if (self.light) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.light.attributes.length; i++) {
					attributeNames.push(self.light.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++) {
					self.light.removeAttribute(attributeNames[i]);
				}
			} else {
				self.light = document.createElement("directionallight");
				self.scene.appendChild(self.light);
			}

			if (!lightDescription) {
				//self.light.setAttribute("intensity", "0.5");
				self.light.setAttribute("color", "0.714, 0.910, 0.953");
				self.light.setAttribute("direction", "0, -0.9323, -0.362");
				self.light.setAttribute("global", "true");
				self.light.setAttribute("ambientIntensity", "0.8");
				self.light.setAttribute("shadowIntensity", 0.0);
			} else {
				for (var attr in lightDescription) {
					if (lightDescription.hasOwnProperty(attr)) {
						self.light.setAttribute(attr, lightDescription[attr]);
					}
				}
			}

		};

		this.createBackground = function(colourDescription) {
			if (self.bground) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.bground.attributes.length; i++) {
					attributeNames.push(self.bground.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++) {
					self.bground.removeAttribute(attributeNames[i]);
				}
			} else {
				self.bground = document.createElement("background");
				self.scene.appendChild(self.bground);
			}

			if (!colourDescription) {
				self.bground.setAttribute("DEF", self.name + "_bground");
				self.bground.setAttribute("skyangle", "0.9 1.5 1.57");
				self.bground.setAttribute("skycolor", "0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1");
				self.bground.setAttribute("groundangle", "0.9 1.5 1.57");
				self.bground.setAttribute("groundcolor", "0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91");
				self.bground.textContent = " ";

			} else {
				self.bground.setAttribute("DEF", self.name + "_bground");

				for (var attr in colourDescription) {
					if (colourDescription.hasOwnProperty(attr)) {
						self.bground.setAttribute(attr, colourDescription[attr]);
					}
				}
			}

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


		this.getProjectionMatrix = function() {
			return self.getViewArea().getProjectionMatrix();
		};

		this.getScreenshot = function(promise) {
			UnityUtil.requestScreenShot(promise);
		};

		this.pickPoint = function(x, y, fireEvent) {
			fireEvent = (typeof fireEvent === undefined) ? false : fireEvent;

			self.getViewArea()._doc.ctx.pickValue(self.getViewArea(), x,y);

			if (fireEvent) {
				// Simulate a mouse down pick point
				self.mouseDownPickPoint({layerX: x, layerY: y});
			}
		};

		this.pickPointEvent = function(pointInfo) {


			//User clicked a mesh
			callback(Viewer.EVENT.PICK_POINT, {
				id: pointInfo.id,
				position: pointInfo.position,
				normal: pointInfo.normal,
				screenPos: pointInfo.mousePos
			});
		};

		this.objectSelected = function(pointInfo) {

			if(!self.selectionDisabled && !self.pinDropMode) {
				if(pointInfo.id) {
					if(pointInfo.pin) {
						//User clicked a pin
						callback(Viewer.EVENT.CLICK_PIN,
							{id: pointInfo.id});

					} else {
						callback(Viewer.EVENT.OBJECT_SELECTED, {
							account: pointInfo.database,
							model: pointInfo.model,
							id: pointInfo.id,
							source: "viewer"						
						});
					}
				} else {
					callback(Viewer.EVENT.BACKGROUND_SELECTED);
				}
			} else {
				if (!pointInfo.id) {
					callback(Viewer.EVENT.BACKGROUND_SELECTED_PIN_MODE);
				}
			} 
			
		};

		this.mouseDownPickPoint = function() {
			UnityUtil.getPointInfo();
		};

		this.lastMultipart = null;

		this.highlightObjects = function(account, model, idsIn, zoom, colour, multiOverride) {
			if (!this.pinDropMode) {
				// TODO: We shouldn't use Set here
				idsIn = idsIn || [];
				var uniqueIds = idsIn.filter(function(value, index, self){
					return self.indexOf(value) === index;
				});

				if(uniqueIds.length) {
					UnityUtil.highlightObjects(account, model, uniqueIds, colour, multiOverride || this.multiSelectMode);
				} else {
					UnityUtil.clearHighlights();
				}
			}
		};

		this.switchObjectVisibility = function(account, model, ids, visibility) {
			UnityUtil.toggleVisibility(account, model, ids, visibility);
		};

		// this.viewpoints = {};
		// this.viewpointsNames = {};

		// this.selectedViewpointIdx = 0;
		// this.selectedViewpoint = null;

		// this.isFlyingThrough = false;
		// this.flyThroughTime = 1000;

		// this.flyThrough = function() {
		// 	if (!self.isFlyingThrough) {
		// 		self.isFlyingThrough = true;
		// 		setTimeout(self.flyThroughTick, self.flyThroughTime);
		// 	} else {
		// 		self.isFlyingThrough = false;
		// 	}
		// };

		// this.flyThroughTick = function() {
		// 	var newViewpoint = self.selectedViewpointIdx + 1;

		// 	if (newViewpoint === self.viewpoints.length) {
		// 		newViewpoint = 0;
		// 	}

		// 	self.setCurrentViewpoint(self.viewpoints[newViewpoint]);

		// 	if (self.isFlyingThrough) {
		// 		setTimeout(self.flyThroughTick, self.flyThroughTime);
		// 	}
		// };

		this.getObjectsStatus = function(account, model, promise) {
			UnityUtil.getObjectsStatus(account, model, promise);
		};


		// this.getViewpointGroupAndName = function(id) {
		// 	var splitID = id.trim().split("__");
		// 	var name, group;

		// 	if (splitID.length > 1) {
		// 		group = splitID[0].trim();
		// 		name = splitID[1].trim();
		// 	} else {
		// 		name = splitID[0].trim();
		// 		group = "uncategorized";
		// 	}

		// 	return {
		// 		group: group,
		// 		name: name
		// 	};
		// };

		// this.loadViewpoints = function() {
		// 	var viewpointList = document.getElementsByTagName("Viewpoint");

		// 	for (var v = 0; v < viewpointList.length; v++) {
		// 		if (viewpointList[v].hasAttribute("id")) {
		// 			var id = viewpointList[v].id.trim();
		// 			viewpointList[v].DEF = id;

		// 			var groupName = self.getViewpointGroupAndName(id);

		// 			if (!self.viewpoints[groupName.group]) {
		// 				self.viewpoints[groupName.group] = {};
		// 			}

		// 			self.viewpoints[groupName.group][groupName.name] = id;
		// 			self.viewpointsNames[id] = viewpointList[v];
		// 		}
		// 	}
		// };

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

				if (self.settings.hasOwnProperty("unit")) {
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

		this.applyModelProperties = function(account, model, properties) {

			if (properties) {
				if (properties.hiddenNodes && properties.hiddenNodes.length > 0) {
					self.switchObjectVisibility(
						account,
						model,
						properties.hiddenNodes,
						false
					);
				}

				if(properties.subModels) {
					for(var i = 0; i < properties.subModels.length; i++) {
						var entry = properties.subModels[i];
						this.applyModelProperties(entry.account, entry.model, entry.properties);
					}
				}
			}
		};

		this.pickObject = {};

		this.oneGrpNodes = [];
		this.twoGrpNodes = [];

		this.setNavMode = function(mode, force) {
			if (self.currentNavMode !== mode || force) {
				// If the navigation mode has changed

				self.currentNavMode = mode;
				UnityUtil.setNavigation(mode);

				// if (mode === Viewer.NAV_MODES.WALK) {
				// 	self.disableClicking();
				// }
				/*else if (mode == "HELICOPTER") {
					self.disableSelecting();
				} */

			}
		};

		this.setCamera = function(pos, viewDir, upDir, centerOfRotation, animate, rollerCoasterMode, account, model) {
			self.updateCamera(pos, upDir, viewDir, centerOfRotation, animate, rollerCoasterMode, account, model);
		};


		this.updateCamera = function(pos, up, viewDir, centerOfRotation, animate, rollerCoasterMode, account, model) {
			UnityUtil.setViewpoint(pos, up, viewDir, account, model);
		};

		this.reset = function() {
			UnityUtil.resetCamera();
		};

		this.cancelLoadModel = function() {
			document.body.style.cursor = "initial";
			UnityUtil.cancelLoadModel();
		};

		this.loadModel = function(account, model, branch, revision) {

			self.account = account;
			self.model = model;
			self.branch = branch;
			self.revision = revision;
			//self.loadingDivText.innerHTML = ""; //This could be set to Loading Model
			document.body.style.cursor = "wait";

			callback(Viewer.EVENT.START_LOADING);
			return UnityUtil.loadModel(self.account, self.model,self.branch, self.revision)
				.then(function(bbox){
					document.body.style.cursor = "initial";
					self.loadingDivText.innerHTML = "";
					callback(Viewer.EVENT.MODEL_LOADED);
					callback(Viewer.EVENT.BBOX_READY, bbox);
				}).catch(function(error){
					document.body.style.cursor = "initial";
					console.error("Unity error loading model: ", error);
				});
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

		this.switchFullScreen = function(vrDisplay) {
			vrDisplay = vrDisplay || {};

			if (!self.fullscreen) {
				if (self.viewer.mozRequestFullScreen) {
					self.viewer.mozRequestFullScreen({
						vrDisplay: vrDisplay
					});
				} else if (self.viewer.webkitRequestFullscreen) {
					self.viewer.webkitRequestFullscreen({
						vrDisplay: vrDisplay
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

		/**
		 * Multi select mode
		 * @param on
		 */
		this.setMultiSelectMode = function (on) {
			
			this.multiSelectMode = on;
			//element.style.cursor =  on ? "copy" : "-webkit-grab";
		};

		/**
		 * Pin drop mode
		 * @param on
		 */
		this.setPinDropMode = function (on) {

			this.pinDropMode = on;
			//element.style.cursor = on ? "crosshair" : "-webkit-grab";
		};

		/****************************************************************************
		 * Clipping planes
		 ****************************************************************************/

		/*
		 * NOTE: Clipping planes are now all managed by unity use broadcast events to retrieve its info
		 */

		this.broadcastClippingPlane = function(clip) {
			callback(Viewer.EVENT.CLIPPING_PLANE_BROADCAST, clip);
		};

		/**
		 * Update clipping planes on the viewer
		 * @param {array} clipPlanes - array of clipping planes
		 * @param {bool} fromPanel - indicate if the request came from clip panel
		 * @param {account} account - (OPTIONAL) the account the clip plane came from
		 * @param {model} model - (OPTIONAL) the model the clip plane came from
		 */
		this.updateClippingPlanes = function(clipPlanes, fromPanel, account, model) {
			if(!clipPlanes || clipPlanes.length === 0) {
				UnityUtil.disableClippingPlanes();
			}

			if(clipPlanes && clipPlanes.length > 0 ) {
				UnityUtil.updateClippingPlanes(clipPlanes[0], !fromPanel, account, model);
			}

			if(clipPlanes && clipPlanes.length > 1) {
				console.error("More than 1 clipping planes requested!");
			}

		};

		this.clearClippingPlanes = function() {
			UnityUtil.disableClippingPlanes();
		};

		/****************************************************************************
		 * Pins
		 ****************************************************************************/
		self.pins = {};

		this.addPin = function(account, model, id, position, norm, colours, viewpoint) {
			
			// TODO: Commented this out because it was causing error with reloading models
			// is it needed for anything?
			// if (self.pins.hasOwnProperty(id)) {
			// 	errCallback(self.ERROR.PIN_ID_TAKEN);
			// } else {
			self.pins[id] = new Pin(id, position, norm, colours, viewpoint, account, model);
			//}
		};

		this.clickPin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				//self.highlightPin(id); This was preventing changing the colour of the pin
				// Replace with
				callback(Viewer.EVENT.CHANGE_PIN_COLOUR, {
					id: id,
					colours: Pin.pinColours.yellow
				});

				callback(Viewer.EVENT.SET_CAMERA, {
					position : pin.viewpoint.position,
					view_dir : pin.viewpoint.view_dir,
					up: pin.viewpoint.up,
					account: pin.account,
					model: pin.model
				});

				callback(Viewer.EVENT.UPDATE_CLIPPING_PLANES, {
					clippingPlanes: pin.viewpoint.clippingPlanes,
					account: pin.account,
					model: pin.model,
					fromClipPanel: false
				});
			}
		};

		this.setPinVisibility = function(id, visibility) {
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

		// Viewer.prototype.SELECT_COLOUR = {
		// 	EMISSIVE: "1.0 0.5 0.0"
		// };

		Viewer.prototype.ERROR = {
			PIN_ID_TAKEN: "VIEWER_PIN_ID_TAKEN"
		};

	};

	Viewer.NAV_MODES = {
		HELICOPTER: "HELICOPTER",
		WALK: "WALK",
		TURNTABLE: "TURNTABLE",
		WAYFINDER: "WAYFINDER",
		FLY: "FLY"
	};

	Viewer.EVENT = {
		// States of the viewer
		INITIALISE: "VIEWER_EVENT_INITIALISE",
		UNITY_READY: "VIEWER_EVENT_UNITY_READY",
		UNITY_ERROR: "VIEWER_EVENT_UNITY_ERROR",
		START_LOADING: "VIEWING_START_LOADING",
		LOAD_MODEL: "VIEWER_LOAD_MODEL",
		CHECK_MODEL_LOADED: "VIEWER_CHECK_MODEL_LOADED",
		BBOX_READY: "BBOX_READY",
		MODEL_LOADED: "VIEWER_MODEL_LOADED",
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
		BACKGROUND_SELECTED_PIN_MODE: "BACKGROUND_SELECTED_PIN_MODE",
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
		MOVE_PIN: "VIEWER_MOVE_PIN"

	};

})();
