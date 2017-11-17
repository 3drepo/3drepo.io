/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software= you can redistribute it and/or modify
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
 **  along with this program.  If not, see <http=//www.gnu.org/licenses/>.
 **/

import { UnityUtil } from "./unity-util";
import { Pin } from "./pin"

declare const ClientConfig;
declare const Module;

export class Viewer {
	
	public name: string;
	public element: HTMLElement;
	public callback: any;
	public errCallback: any;

	public static NAV_MODES = {
		HELICOPTER: "HELICOPTER",
		WALK: "WALK",
		TURNTABLE: "TURNTABLE",
		WAYFINDER: "WAYFINDER",
		FLY: "FLY"
	};

	public static EVENT = {
		// States of the viewer
		INITIALISE: "VIEWER_EVENT_INITIALISE",
		UNITY_READY: "VIEWER_EVENT_UNITY_READY",
		UNITY_ERROR: "VIEWER_EVENT_UNITY_ERROR",
		START_LOADING: "VIEWING_START_LOADING",
		LOAD_MODEL: "VIEWER_LOAD_MODEL",
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

	constructor(
		name: string, 
		element: HTMLElement, 
		callback: any, 
		errCallback: any,
		str: string
	) {
		
		// If not given the tag by the manager create here
		this.element = element;

		if (!name) {
			this.name = "viewer";
		} else {
			this.name = name;
		}

		this.callback = callback;
		this.errCallback = errCallback;
		console.log(this.callback, this.errCallback)

		UnityUtil.init(errCallback);

	}

	pickObject = {};
	oneGrpNodes = [];
	twoGrpNodes = [];

	
	// Properties
	unityLoaderScript: any;
	inline = null;
	runtime = null;
	fullscreen = false;
	multiSelectMode = false;
	pinDropMode = false;
	measureMode = false;
	clickingEnabled = false;

	avatarRadius = 0.5;

	pinSizeFromSettings = false;
	pinSize = 1.0; // Initial size

	defaultShowAll = true;

	zNear = -1;
	zFar = -1;

	initialized = false;

	downloadsLeft = 1;

	defaultNavMode = Viewer.NAV_MODES.TURNTABLE;

	selectionDisabled = false;

	account = null;
	model = null;
	branch = null;
	revision = null;
	modelString = null;

	rootName = "model";
	inlineRoots = {};
	groupNodes = null;
	multipartNodes = [];
	multipartNodesByModel = {};

	units = "m";
	convertToM = 1.0;
	logos = [];

	unityLoaderPath = "unity/Release/UnityLoader.js";
	unityScriptInserted = false;
	viewer: HTMLElement;

	handle;
	unityLoaderReady: boolean;
	loadingDiv: HTMLElement;
	loadingDivText: HTMLElement;

	options;
	Module;
	scene;
	bground;
	currentNavMode;
	environ;
	light;
	plugins;
	broadcastClippingPlane;
	settings;
	nav;

	setSpeed;
	currentViewpoint;
	changeAvatarHeight;

	setUnits(units) {
		this.units = units;

		if (units === "mm") {
			this.convertToM = 0.001;
		} else if (units === "ft") {
			this.convertToM = 0.0032;
		}

		// Set the units in unity for the measure tool
		if (this.units) {
			UnityUtil.setUnits(this.units);
		}
		
	};

	setHandle(handle) {
		this.handle = handle;
	};

	prepareViewer() {
		
		this.unityLoaderReady = false;

		this.viewer = document.createElement("div");
		this.viewer.className = "viewer";

		this.loadingDiv = document.createElement("div");
		this.loadingDivText = document.createElement("p");
		
		this.loadingDivText.innerHTML = "";

		this.loadingDiv.className += "loadingViewer";
		this.loadingDivText.className += "loadingViewerText";

		this.loadingDiv.appendChild(this.loadingDivText);

		var canvas = document.createElement("canvas");
		canvas.className = "emscripten";
		canvas.setAttribute("id", "canvas");
		canvas.setAttribute("tabindex", "1"); // You need this for canvas to register keyboard events
		canvas.setAttribute("oncontextmenu", "event.preventDefault()");

		canvas.onmousedown = () =>{
			return false;
		};
	
		canvas.style["pointer-events"] = "all";
		
		this.element.appendChild(this.viewer);
		this.viewer.appendChild(canvas);
		this.viewer.appendChild(this.loadingDiv);

		this.unityLoaderScript = document.createElement("script");
		
	};

	insertUnityLoader() {
		return new Promise((resolve, reject) => {
			this.unityLoaderScript.async = true;
			this.unityLoaderScript.addEventListener ("load", () => {
				console.debug("Loaded UnityLoader.js succesfully");
				resolve();
			}, false);
			this.unityLoaderScript.addEventListener ("error", (error) => {
				console.error("Error loading UnityLoader.js", error);
				reject("Error loading UnityLoader.js");
			}, false);

			// Event handlers MUST come first before setting src
			this.unityLoaderScript.src = this.unityLoaderPath;

			// This kicks off the actual loading of Unity
			this.viewer.appendChild(this.unityLoaderScript);
			this.unityScriptInserted = true;
		});
	};

	init(options) {

		return new Promise((resolve, reject) => {

			if (this.initialized) {
				resolve();
			}

			// Set option param from viewerDirective
			this.options = options;

			this.loadingDivText.style.display = "inherit";
			this.loadingDivText.innerHTML = "Loading Viewer...";
			document.body.style.cursor = "wait";

			//Shouldn't need this, but for something it is not being recognised from unitySettings!
			Module.errorhandler = UnityUtil.onError;

			this.scene = document.createElement("Scene");
			this.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
			this.viewer.appendChild(this.scene);

	
			this.bground = null;
			this.currentNavMode = null;

			this.createBackground({});

			this.environ = document.createElement("environment");
			this.environ.setAttribute("frustumCulling", "true");
			this.environ.setAttribute("smallFeatureCulling", "true");
			this.environ.setAttribute("smallFeatureThreshold", 5);
			this.environ.setAttribute("occlusionCulling", "true");
			this.environ.setAttribute("sorttrans", "true");
			this.environ.setAttribute("gammaCorrectionDefault", "linear");
			this.scene.appendChild(this.environ);

			this.setAmbientLight({});

			if (this.options && this.options.plugins) {
				this.plugins = this.options.plugins;
				Object.keys(this.plugins).forEach((key) => {
					this.plugins[key].initCallback && this.plugins[key].initCallback(this);
				});
			}

			

			UnityUtil.setAPIHost(options.getAPI); 
			this.setNavMode(this.defaultNavMode, false);

			UnityUtil.onReady().then(() => {
				this.initialized = true;
				this.loadingDivText.style.display = "none";
				this.callback(Viewer.EVENT.UNITY_READY, {
					name: this.name,
					model: this.modelString
				});
				resolve();
			}).catch((error) => {
				this.loadingDivText.innerHTML = "Loading Viewer Failed!";
				this.loadingDivText.style.display = "inherit";
				console.error("UnityUtil.onReady failed= ", error);
				reject(error);
			});
			
		});
		
	};

	handleError(message) {
		this.errCallback(message);
	};

	destroy() {
		UnityUtil.reset();
	};

	showAll() {
		UnityUtil.resetCamera();
	};

	setAmbientLight(lightDescription: Object) {
		if (this.light) {
			var i = 0;
			var attributeNames = [];

			for(i = 0; i < this.light.attributes.length; i++) {
				attributeNames.push(this.light.attributes[i].name);
			}

			for(i = 0; i < attributeNames.length; i++) {
				this.light.removeAttribute(attributeNames[i]);
			}
		} else {
			this.light = document.createElement("directionallight");
			this.scene.appendChild(this.light);
		}

		if (Object.keys(lightDescription).length === 0) {
			//this.light.setAttribute("intensity", "0.5");
			this.light.setAttribute("color", "0.714, 0.910, 0.953");
			this.light.setAttribute("direction", "0, -0.9323, -0.362");
			this.light.setAttribute("global", "true");
			this.light.setAttribute("ambientIntensity", "0.8");
			this.light.setAttribute("shadowIntensity", 0.0);
		} else {
			for (var attr in lightDescription) {
				if (lightDescription.hasOwnProperty(attr)) {
					this.light.setAttribute(attr, lightDescription[attr]);
				}
			}
		}

	};

	createBackground(colourDescription: Object) {
		if (this.bground) {
			var i = 0;
			var attributeNames = [];

			for(i = 0; i < this.bground.attributes.length; i++) {
				attributeNames.push(this.bground.attributes[i].name);
			}

			for(i = 0; i < attributeNames.length; i++) {
				this.bground.removeAttribute(attributeNames[i]);
			}
		} else {
			this.bground = document.createElement("background");
			this.scene.appendChild(this.bground);
		}

		if (Object.keys(colourDescription).length === 0) {
			
			this.bground.setAttribute("DEF", this.name + "_bground");
			this.bground.setAttribute("skyangle", "0.9 1.5 1.57");
			this.bground.setAttribute("skycolor", "0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1");
			this.bground.setAttribute("groundangle", "0.9 1.5 1.57");
			this.bground.setAttribute("groundcolor", "0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91");
			this.bground.textContent = " ";

		} else {
			this.bground.setAttribute("DEF", this.name + "_bground");

			for (var attr in colourDescription) {
				if (colourDescription.hasOwnProperty(attr)) {
					this.bground.setAttribute(attr, colourDescription[attr]);
				}
			}
		}

	};

	setUnity() {
		UnityUtil.viewer = this;
	}

	// switchDebug() {
	// 	this.getViewArea()._visDbgBuf = !this.getViewArea()._visDbgBuf;
	// };

	// showStats() {
	// 	this.runtime.canvas.stateViewer.display();
	// };

	// getViewArea() {
	// 	return this.runtime.canvas.doc._viewarea;
	// };

	// getViewMatrix() {
	// 	return this.getViewArea().getViewMatrix();
	// };


	// getProjectionMatrix() {
	// 	return this.getViewArea().getProjectionMatrix();
	// };

	getScreenshot(promise) {
		UnityUtil.requestScreenShot(promise);
	};

	pickPoint(x, y, fireEvent) {
		fireEvent = (typeof fireEvent === undefined) ? false : fireEvent;

		//this.getViewArea()._doc.ctx.pickValue(this.getViewArea(), x,y);

		if (fireEvent) {
			// Simulate a mouse down pick point
			this.mouseDownPickPoint();
		}
	};

	mouseDownPickPoint() {
		UnityUtil.getPointInfo();
	};

	pickPointEvent(pointInfo) {

		//User clicked a mesh
		console.log(this.callback);

		this.callback(Viewer.EVENT.PICK_POINT, {
			id : pointInfo.id,
			position: pointInfo.position,
			normal: pointInfo.normal,
			screenPos: pointInfo.mousePos
		});

	};

	objectSelected(pointInfo) {

		if(!this.selectionDisabled && !this.pinDropMode && !this.measureMode) {
			if(pointInfo.id) {
				if(pointInfo.pin) {
					//User clicked a pin
					console.log(Viewer.EVENT.CLICK_PIN, this.callback)
					this.callback(Viewer.EVENT.CLICK_PIN, {
						id: pointInfo.id
					});

				} else {
					console.log(Viewer.EVENT.OBJECT_SELECTED, this.callback)
					this.callback(Viewer.EVENT.OBJECT_SELECTED, {
						account:pointInfo.database,
						model: pointInfo.model,
						id: pointInfo.id,
						source: "viewer"						
					});
				}
			} else {
				this.callback(Viewer.EVENT.BACKGROUND_SELECTED);
			}
		} else {
			if (!pointInfo.id) {
				this.callback(Viewer.EVENT.BACKGROUND_SELECTED_PIN_MODE);
			}
		} 
		
	};

	lastMultipart = null;

	clearHighlights() {
		UnityUtil.clearHighlights();
	};

	highlightObjects(account, model, idsIn, zoom, colour, multiOverride) {
	
		var canHighlight = !this.pinDropMode && !this.measureMode;

		if (canHighlight) {
			

			idsIn = idsIn || [];
			var uniqueIds = idsIn.filter((value, index) => {
				return idsIn.indexOf(value) === index;
			});
			
			if(uniqueIds.length) {
				var multi = multiOverride || this.multiSelectMode;
				UnityUtil.highlightObjects(account, model, uniqueIds, colour, multi);
			} else {
				UnityUtil.clearHighlights();
			}

		}

	};

	switchObjectVisibility(account, model, ids, visibility) {
		UnityUtil.toggleVisibility(account, model, ids, visibility);
	};


	getObjectsStatus(account, model, promise) {
		UnityUtil.getObjectsStatus(account, model, promise);
	};

	updateSettings(settings) {
		if (settings) {
			this.settings = settings;
			this.applySettings();
		}
	};

	applySettings() {
		if (this.settings) {
			if (this.settings.hasOwnProperty("start_all")) {
				this.defaultShowAll = this.settings.start_all;
			}

			if (this.settings.hasOwnProperty("speed")) {
				this.setSpeed(this.settings.speed);
			}

			if (this.settings.hasOwnProperty("unit")) {
				this.setUnits(this.settings.unit);
			}

			if (this.settings.hasOwnProperty("avatarHeight")) {
				this.changeAvatarHeight(this.settings.avatarHeight);
			}

			if (this.settings.hasOwnProperty("defaultNavMode")) {
				this.defaultNavMode = this.settings.defaultNavMode;
			}

			if (this.settings.hasOwnProperty("pinSize")) {
				this.pinSize = this.settings.pinSize;
				this.pinSizeFromSettings = true; // Stop the auto-calculation
			}

			if (this.settings.hasOwnProperty("visibilityLimit")) {
				this.nav.setAttribute("visibilityLimit", this.settings.visibilityLimit);
			}

			if (this.settings.hasOwnProperty("zFar")) {
				this.currentViewpoint._xmlNode.setAttribute("zFar", this.settings.zFar);
			}

			if (this.settings.hasOwnProperty("zNear")) {
				this.currentViewpoint._xmlNode.setAttribute("zNear", this.settings.zNear);
			}

			if (this.settings.hasOwnProperty("background")) {
				this.createBackground(this.settings.background);
			}

			if (this.settings.hasOwnProperty("ambientLight")) {
				this.setAmbientLight(this.settings.ambientLight);
			}
		}
	};

	applyModelProperties(account, model, properties) {

		if (properties) {
			if (properties.hiddenNodes && properties.hiddenNodes.length > 0) {
				this.switchObjectVisibility(
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



	setNavMode(mode, force) {
		if (this.currentNavMode !== mode || force) {
			// If the navigation mode has changed

			this.currentNavMode = mode;
			UnityUtil.setNavigation(mode);

		}
	};

	setCamera(pos, viewDir, upDir, lookAt, animate, rollerCoasterMode, account, model) {
		this.updateCamera(pos, upDir, viewDir, lookAt, animate, rollerCoasterMode, account, model);
	};


	updateCamera(pos, up, viewDir, lookAt, animate, rollerCoasterMode, account, model) {
		UnityUtil.setViewpoint(pos, up, viewDir, lookAt, account, model);
	};

	reset() {
		this.setMultiSelectMode(false);
		this.setMeasureMode(false);
		this.setPinDropMode(false);
		this.loadingDivText.style.display = "none";
		UnityUtil.reset();	
	};

	cancelLoadModel() {
		document.body.style.cursor = "initial";
		UnityUtil.cancelLoadModel();
	};

	loadModel(account, model, branch, revision) {

		this.account = account;
		this.model = model;
		this.branch = branch;
		this.revision = revision;
		this.loadingDivText.style.display = "none";
		document.body.style.cursor = "wait";

		this.callback(Viewer.EVENT.START_LOADING);

		return UnityUtil.loadModel(this.account, this.model,this.branch, this.revision)
			.then((bbox) => {
				document.body.style.cursor = "initial";
				this.callback(Viewer.EVENT.MODEL_LOADED);
				this.callback(Viewer.EVENT.BBOX_READY, bbox);
			}).catch((error) => {
				document.body.style.cursor = "initial";
				if (error !== "cancel") {
					console.error("Unity error loading model= ", error);						
				}
			});
	};

	getScene() {
		return this.scene;
	};

	// getCurrentViewpoint() {
	// 	return this.getViewArea()._scene.getViewpoint()._xmlNode;
	// };

	getCurrentViewpointInfo(account, model, promise) {
		UnityUtil.requestViewpoint(account, model, promise);
	};

	switchFullScreen(vrDisplay) {
		vrDisplay = vrDisplay || {};

		if (!this.fullscreen) {
			if (this.viewer.hasOwnProperty("mozRequestFullScreen")) {
				this.viewer["mozRequestFullScreen"]({
					vrDisplay: vrDisplay
				});
			} else if (this.viewer.webkitRequestFullscreen) {
				this.viewer.webkitRequestFullscreen();
			}

			this.fullscreen = true;
		} else {
			// if (document.mozCancelFullScreen) {
			// 	document.mozCancelFullScreen();
			// } else 
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}

			this.fullscreen = false;
		}
	};

	setMultiSelectMode(on: boolean) {
		
		this.multiSelectMode = on;
		//element.style.cursor =  on ? "copy" = "-webkit-grab";
	};

	setPinDropMode(on: boolean) {
		this.pinDropMode = on;
	};

	setMeasureMode(on: boolean) {
		this.measureMode = on;
		if (on === true) {
			UnityUtil.enableMeasuringTool()
		} else {
			UnityUtil.disableMeasuringTool()
		}
	};

	/****************************************************************************
	 * Clipping planes
	 ****************************************************************************/

	/*
		* NOTE= Clipping planes are now all managed by unity use broadcast events to retrieve its info
	*/

	tbroadcastClippingPlane(clip) {
		this.callback(Viewer.EVENT.CLIPPING_PLANE_BROADCAST, clip);
	};

	updateClippingPlanes(clipPlanes: any, fromPanel: boolean, account, model) {
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

	clearClippingPlanes() {
		UnityUtil.disableClippingPlanes();
	};

	/****************************************************************************
	 * Pins
	 ****************************************************************************/
	pins = {};

	addPin(account, model, id, position, norm, colours, viewpoint) {
		
		// TODO= Commented this out because it was causing error with reloading models
		// is it needed for anything?
		// if (this.pins.hasOwnProperty(id)) {
		// 	errCallback(this.ERROR.PIN_ID_TAKEN);
		// } else {
		this.pins[id] = new Pin(id, position, norm, colours, viewpoint, account, model);
		//}
	};

	clickPin(id) {

		if (this.pins.hasOwnProperty(id)) {
			var pin = this.pins[id];

			//this.highlightPin(id); This was preventing changing the colour of the pin
			// Replace with
			this.callback(Viewer.EVENT.CHANGE_PIN_COLOUR, {
				id: id,
				colours: Pin.pinColours.yellow
			});

			this.callback(Viewer.EVENT.SET_CAMERA, {
				position : pin.viewpoint.position,
				view_dir : pin.viewpoint.view_dir,
				up: pin.viewpoint.up,
				account: pin.account,
				model: pin.model
			});

			this.callback(Viewer.EVENT.UPDATE_CLIPPING_PLANES, {
				clippingPlanes:pin.viewpoint.clippingPlanes,
				account: pin.account,
				model: pin.model,
				fromClipPanel: false
			});
		}

	};

	setPinVisibility(id, visibility) {
		if (this.pins.hasOwnProperty(id)) {
			var pin = this.pins[id];

			pin.setAttribute("render", visibility.toString());
		}
	};

	removePin(id) {
		if (this.pins.hasOwnProperty(id)) {
			this.pins[id].remove(id);
			delete this.pins[id];
		}
	};

	previousHighLightedPin = null;
	highlightPin(id) {

		// If a pin was previously highlighted
		// switch it off
		if (this.previousHighLightedPin) {
			this.previousHighLightedPin.highlight();
			this.previousHighLightedPin = null;
		}

		// If the pin exists switch it on
		if (id && this.pins.hasOwnProperty(id)) {
			this.pins[id].highlight();
			this.previousHighLightedPin = this.pins[id];
		}

	};

	changePinColours(id, colours) {
		if (this.pins.hasOwnProperty(id)) {
			this.pins[id].changeColour(colours);
		}
	};

	ERROR = {
		PIN_ID_TAKEN : "VIEWER_PIN_ID_TAKEN"
	};

}