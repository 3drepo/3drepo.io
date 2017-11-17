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
define(["require", "exports", "./unity-util", "./pin"], function (require, exports, unity_util_1, pin_1) {
    "use strict";
    exports.__esModule = true;
    var Viewer = /** @class */ (function () {
        function Viewer(name, element, callback, errCallback, str) {
            this.pickObject = {};
            this.oneGrpNodes = [];
            this.twoGrpNodes = [];
            this.inline = null;
            this.runtime = null;
            this.fullscreen = false;
            this.multiSelectMode = false;
            this.pinDropMode = false;
            this.measureMode = false;
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
            this.logos = [];
            this.unityLoaderPath = "unity/Release/UnityLoader.js";
            this.unityScriptInserted = false;
            this.lastMultipart = null;
            /****************************************************************************
             * Pins
             ****************************************************************************/
            this.pins = {};
            this.previousHighLightedPin = null;
            this.ERROR = {
                PIN_ID_TAKEN: "VIEWER_PIN_ID_TAKEN"
            };
            // If not given the tag by the manager create here
            this.element = element;
            if (!name) {
                this.name = "viewer";
            }
            else {
                this.name = name;
            }
            this.callback = callback;
            this.errCallback = errCallback;
            console.log(this.callback, this.errCallback);
            unity_util_1.UnityUtil.init(errCallback);
        }
        Viewer.prototype.setUnits = function (units) {
            this.units = units;
            if (units === "mm") {
                this.convertToM = 0.001;
            }
            else if (units === "ft") {
                this.convertToM = 0.0032;
            }
            // Set the units in unity for the measure tool
            if (this.units) {
                unity_util_1.UnityUtil.setUnits(this.units);
            }
        };
        ;
        Viewer.prototype.setHandle = function (handle) {
            this.handle = handle;
        };
        ;
        Viewer.prototype.prepareViewer = function () {
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
            canvas.onmousedown = function () {
                return false;
            };
            canvas.style["pointer-events"] = "all";
            this.element.appendChild(this.viewer);
            this.viewer.appendChild(canvas);
            this.viewer.appendChild(this.loadingDiv);
            this.unityLoaderScript = document.createElement("script");
        };
        ;
        Viewer.prototype.insertUnityLoader = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.unityLoaderScript.async = true;
                _this.unityLoaderScript.addEventListener("load", function () {
                    console.debug("Loaded UnityLoader.js succesfully");
                    resolve();
                }, false);
                _this.unityLoaderScript.addEventListener("error", function (error) {
                    console.error("Error loading UnityLoader.js", error);
                    reject("Error loading UnityLoader.js");
                }, false);
                // Event handlers MUST come first before setting src
                _this.unityLoaderScript.src = _this.unityLoaderPath;
                // This kicks off the actual loading of Unity
                _this.viewer.appendChild(_this.unityLoaderScript);
                _this.unityScriptInserted = true;
            });
        };
        ;
        Viewer.prototype.init = function (options) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.initialized) {
                    resolve();
                }
                // Set option param from viewerDirective
                _this.options = options;
                _this.loadingDivText.style.display = "inherit";
                _this.loadingDivText.innerHTML = "Loading Viewer...";
                document.body.style.cursor = "wait";
                //Shouldn't need this, but for something it is not being recognised from unitySettings!
                Module.errorhandler = unity_util_1.UnityUtil.onError;
                _this.scene = document.createElement("Scene");
                _this.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
                _this.viewer.appendChild(_this.scene);
                _this.bground = null;
                _this.currentNavMode = null;
                _this.createBackground({});
                _this.environ = document.createElement("environment");
                _this.environ.setAttribute("frustumCulling", "true");
                _this.environ.setAttribute("smallFeatureCulling", "true");
                _this.environ.setAttribute("smallFeatureThreshold", 5);
                _this.environ.setAttribute("occlusionCulling", "true");
                _this.environ.setAttribute("sorttrans", "true");
                _this.environ.setAttribute("gammaCorrectionDefault", "linear");
                _this.scene.appendChild(_this.environ);
                _this.setAmbientLight({});
                if (_this.options && _this.options.plugins) {
                    _this.plugins = _this.options.plugins;
                    Object.keys(_this.plugins).forEach(function (key) {
                        _this.plugins[key].initCallback && _this.plugins[key].initCallback(_this);
                    });
                }
                unity_util_1.UnityUtil.setAPIHost(options.getAPI);
                _this.setNavMode(_this.defaultNavMode, false);
                unity_util_1.UnityUtil.onReady().then(function () {
                    _this.initialized = true;
                    _this.loadingDivText.style.display = "none";
                    _this.callback(Viewer.EVENT.UNITY_READY, {
                        name: _this.name,
                        model: _this.modelString
                    });
                    resolve();
                })["catch"](function (error) {
                    _this.loadingDivText.innerHTML = "Loading Viewer Failed!";
                    _this.loadingDivText.style.display = "inherit";
                    console.error("UnityUtil.onReady failed= ", error);
                    reject(error);
                });
            });
        };
        ;
        Viewer.prototype.handleError = function (message) {
            this.errCallback(message);
        };
        ;
        Viewer.prototype.destroy = function () {
            unity_util_1.UnityUtil.reset();
        };
        ;
        Viewer.prototype.showAll = function () {
            unity_util_1.UnityUtil.resetCamera();
        };
        ;
        Viewer.prototype.setAmbientLight = function (lightDescription) {
            if (this.light) {
                var i = 0;
                var attributeNames = [];
                for (i = 0; i < this.light.attributes.length; i++) {
                    attributeNames.push(this.light.attributes[i].name);
                }
                for (i = 0; i < attributeNames.length; i++) {
                    this.light.removeAttribute(attributeNames[i]);
                }
            }
            else {
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
            }
            else {
                for (var attr in lightDescription) {
                    if (lightDescription.hasOwnProperty(attr)) {
                        this.light.setAttribute(attr, lightDescription[attr]);
                    }
                }
            }
        };
        ;
        Viewer.prototype.createBackground = function (colourDescription) {
            if (this.bground) {
                var i = 0;
                var attributeNames = [];
                for (i = 0; i < this.bground.attributes.length; i++) {
                    attributeNames.push(this.bground.attributes[i].name);
                }
                for (i = 0; i < attributeNames.length; i++) {
                    this.bground.removeAttribute(attributeNames[i]);
                }
            }
            else {
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
            }
            else {
                this.bground.setAttribute("DEF", this.name + "_bground");
                for (var attr in colourDescription) {
                    if (colourDescription.hasOwnProperty(attr)) {
                        this.bground.setAttribute(attr, colourDescription[attr]);
                    }
                }
            }
        };
        ;
        Viewer.prototype.setUnity = function () {
            unity_util_1.UnityUtil.viewer = this;
        };
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
        Viewer.prototype.getScreenshot = function (promise) {
            unity_util_1.UnityUtil.requestScreenShot(promise);
        };
        ;
        Viewer.prototype.pickPoint = function (x, y, fireEvent) {
            fireEvent = (typeof fireEvent === undefined) ? false : fireEvent;
            //this.getViewArea()._doc.ctx.pickValue(this.getViewArea(), x,y);
            if (fireEvent) {
                // Simulate a mouse down pick point
                this.mouseDownPickPoint();
            }
        };
        ;
        Viewer.prototype.mouseDownPickPoint = function () {
            unity_util_1.UnityUtil.getPointInfo();
        };
        ;
        Viewer.prototype.pickPointEvent = function (pointInfo) {
            //User clicked a mesh
            console.log(this.callback);
            this.callback(Viewer.EVENT.PICK_POINT, {
                id: pointInfo.id,
                position: pointInfo.position,
                normal: pointInfo.normal,
                screenPos: pointInfo.mousePos
            });
        };
        ;
        Viewer.prototype.objectSelected = function (pointInfo) {
            if (!this.selectionDisabled && !this.pinDropMode && !this.measureMode) {
                if (pointInfo.id) {
                    if (pointInfo.pin) {
                        //User clicked a pin
                        console.log(Viewer.EVENT.CLICK_PIN, this.callback);
                        this.callback(Viewer.EVENT.CLICK_PIN, {
                            id: pointInfo.id
                        });
                    }
                    else {
                        console.log(Viewer.EVENT.OBJECT_SELECTED, this.callback);
                        this.callback(Viewer.EVENT.OBJECT_SELECTED, {
                            account: pointInfo.database,
                            model: pointInfo.model,
                            id: pointInfo.id,
                            source: "viewer"
                        });
                    }
                }
                else {
                    this.callback(Viewer.EVENT.BACKGROUND_SELECTED);
                }
            }
            else {
                if (!pointInfo.id) {
                    this.callback(Viewer.EVENT.BACKGROUND_SELECTED_PIN_MODE);
                }
            }
        };
        ;
        Viewer.prototype.clearHighlights = function () {
            unity_util_1.UnityUtil.clearHighlights();
        };
        ;
        Viewer.prototype.highlightObjects = function (account, model, idsIn, zoom, colour, multiOverride) {
            var canHighlight = !this.pinDropMode && !this.measureMode;
            if (canHighlight) {
                idsIn = idsIn || [];
                var uniqueIds = idsIn.filter(function (value, index) {
                    return idsIn.indexOf(value) === index;
                });
                if (uniqueIds.length) {
                    var multi = multiOverride || this.multiSelectMode;
                    unity_util_1.UnityUtil.highlightObjects(account, model, uniqueIds, colour, multi);
                }
                else {
                    unity_util_1.UnityUtil.clearHighlights();
                }
            }
        };
        ;
        Viewer.prototype.switchObjectVisibility = function (account, model, ids, visibility) {
            unity_util_1.UnityUtil.toggleVisibility(account, model, ids, visibility);
        };
        ;
        Viewer.prototype.getObjectsStatus = function (account, model, promise) {
            unity_util_1.UnityUtil.getObjectsStatus(account, model, promise);
        };
        ;
        Viewer.prototype.updateSettings = function (settings) {
            if (settings) {
                this.settings = settings;
                this.applySettings();
            }
        };
        ;
        Viewer.prototype.applySettings = function () {
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
        ;
        Viewer.prototype.applyModelProperties = function (account, model, properties) {
            if (properties) {
                if (properties.hiddenNodes && properties.hiddenNodes.length > 0) {
                    this.switchObjectVisibility(account, model, properties.hiddenNodes, false);
                }
                if (properties.subModels) {
                    for (var i = 0; i < properties.subModels.length; i++) {
                        var entry = properties.subModels[i];
                        this.applyModelProperties(entry.account, entry.model, entry.properties);
                    }
                }
            }
        };
        ;
        Viewer.prototype.setNavMode = function (mode, force) {
            if (this.currentNavMode !== mode || force) {
                // If the navigation mode has changed
                this.currentNavMode = mode;
                unity_util_1.UnityUtil.setNavigation(mode);
            }
        };
        ;
        Viewer.prototype.setCamera = function (pos, viewDir, upDir, lookAt, animate, rollerCoasterMode, account, model) {
            this.updateCamera(pos, upDir, viewDir, lookAt, animate, rollerCoasterMode, account, model);
        };
        ;
        Viewer.prototype.updateCamera = function (pos, up, viewDir, lookAt, animate, rollerCoasterMode, account, model) {
            unity_util_1.UnityUtil.setViewpoint(pos, up, viewDir, lookAt, account, model);
        };
        ;
        Viewer.prototype.reset = function () {
            this.setMultiSelectMode(false);
            this.setMeasureMode(false);
            this.setPinDropMode(false);
            this.loadingDivText.style.display = "none";
            unity_util_1.UnityUtil.reset();
        };
        ;
        Viewer.prototype.cancelLoadModel = function () {
            document.body.style.cursor = "initial";
            unity_util_1.UnityUtil.cancelLoadModel();
        };
        ;
        Viewer.prototype.loadModel = function (account, model, branch, revision) {
            var _this = this;
            this.account = account;
            this.model = model;
            this.branch = branch;
            this.revision = revision;
            this.loadingDivText.style.display = "none";
            document.body.style.cursor = "wait";
            this.callback(Viewer.EVENT.START_LOADING);
            return unity_util_1.UnityUtil.loadModel(this.account, this.model, this.branch, this.revision)
                .then(function (bbox) {
                document.body.style.cursor = "initial";
                _this.callback(Viewer.EVENT.MODEL_LOADED);
                _this.callback(Viewer.EVENT.BBOX_READY, bbox);
            })["catch"](function (error) {
                document.body.style.cursor = "initial";
                if (error !== "cancel") {
                    console.error("Unity error loading model= ", error);
                }
            });
        };
        ;
        Viewer.prototype.getScene = function () {
            return this.scene;
        };
        ;
        // getCurrentViewpoint() {
        // 	return this.getViewArea()._scene.getViewpoint()._xmlNode;
        // };
        Viewer.prototype.getCurrentViewpointInfo = function (account, model, promise) {
            unity_util_1.UnityUtil.requestViewpoint(account, model, promise);
        };
        ;
        Viewer.prototype.switchFullScreen = function (vrDisplay) {
            vrDisplay = vrDisplay || {};
            if (!this.fullscreen) {
                if (this.viewer.hasOwnProperty("mozRequestFullScreen")) {
                    this.viewer["mozRequestFullScreen"]({
                        vrDisplay: vrDisplay
                    });
                }
                else if (this.viewer.webkitRequestFullscreen) {
                    this.viewer.webkitRequestFullscreen();
                }
                this.fullscreen = true;
            }
            else {
                // if (document.mozCancelFullScreen) {
                // 	document.mozCancelFullScreen();
                // } else 
                if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
                this.fullscreen = false;
            }
        };
        ;
        Viewer.prototype.setMultiSelectMode = function (on) {
            this.multiSelectMode = on;
            //element.style.cursor =  on ? "copy" = "-webkit-grab";
        };
        ;
        Viewer.prototype.setPinDropMode = function (on) {
            this.pinDropMode = on;
        };
        ;
        Viewer.prototype.setMeasureMode = function (on) {
            this.measureMode = on;
            if (on === true) {
                unity_util_1.UnityUtil.enableMeasuringTool();
            }
            else {
                unity_util_1.UnityUtil.disableMeasuringTool();
            }
        };
        ;
        /****************************************************************************
         * Clipping planes
         ****************************************************************************/
        /*
            * NOTE= Clipping planes are now all managed by unity use broadcast events to retrieve its info
        */
        Viewer.prototype.tbroadcastClippingPlane = function (clip) {
            this.callback(Viewer.EVENT.CLIPPING_PLANE_BROADCAST, clip);
        };
        ;
        Viewer.prototype.updateClippingPlanes = function (clipPlanes, fromPanel, account, model) {
            if (!clipPlanes || clipPlanes.length === 0) {
                unity_util_1.UnityUtil.disableClippingPlanes();
            }
            if (clipPlanes && clipPlanes.length > 0) {
                unity_util_1.UnityUtil.updateClippingPlanes(clipPlanes[0], !fromPanel, account, model);
            }
            if (clipPlanes && clipPlanes.length > 1) {
                console.error("More than 1 clipping planes requested!");
            }
        };
        ;
        Viewer.prototype.clearClippingPlanes = function () {
            unity_util_1.UnityUtil.disableClippingPlanes();
        };
        ;
        Viewer.prototype.addPin = function (account, model, id, position, norm, colours, viewpoint) {
            // TODO= Commented this out because it was causing error with reloading models
            // is it needed for anything?
            // if (this.pins.hasOwnProperty(id)) {
            // 	errCallback(this.ERROR.PIN_ID_TAKEN);
            // } else {
            this.pins[id] = new pin_1.Pin(id, position, norm, colours, viewpoint, account, model);
            //}
        };
        ;
        Viewer.prototype.clickPin = function (id) {
            if (this.pins.hasOwnProperty(id)) {
                var pin = this.pins[id];
                //this.highlightPin(id); This was preventing changing the colour of the pin
                // Replace with
                this.callback(Viewer.EVENT.CHANGE_PIN_COLOUR, {
                    id: id,
                    colours: pin_1.Pin.pinColours.yellow
                });
                this.callback(Viewer.EVENT.SET_CAMERA, {
                    position: pin.viewpoint.position,
                    view_dir: pin.viewpoint.view_dir,
                    up: pin.viewpoint.up,
                    account: pin.account,
                    model: pin.model
                });
                this.callback(Viewer.EVENT.UPDATE_CLIPPING_PLANES, {
                    clippingPlanes: pin.viewpoint.clippingPlanes,
                    account: pin.account,
                    model: pin.model,
                    fromClipPanel: false
                });
            }
        };
        ;
        Viewer.prototype.setPinVisibility = function (id, visibility) {
            if (this.pins.hasOwnProperty(id)) {
                var pin = this.pins[id];
                pin.setAttribute("render", visibility.toString());
            }
        };
        ;
        Viewer.prototype.removePin = function (id) {
            if (this.pins.hasOwnProperty(id)) {
                this.pins[id].remove(id);
                delete this.pins[id];
            }
        };
        ;
        Viewer.prototype.highlightPin = function (id) {
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
        ;
        Viewer.prototype.changePinColours = function (id, colours) {
            if (this.pins.hasOwnProperty(id)) {
                this.pins[id].changeColour(colours);
            }
        };
        ;
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
        return Viewer;
    }());
    exports.Viewer = Viewer;
});
