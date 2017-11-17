/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


// TYPESCRIPT BUILT
__webpack_require__(1);
__webpack_require__(2);
__webpack_require__(3);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the multiSelect of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var MultiSelectService = /** @class */ (function () {
        function MultiSelectService(ViewerService) {
            this.ViewerService = ViewerService;
            this.keys = {
                cmdKey: 91,
                ctrlKey: 17,
                escKey: 27
            };
            this.isMac = (navigator.platform.indexOf("Mac") !== -1);
            this.multiMode = false;
        }
        MultiSelectService.prototype.handleKeysDown = function (keysDown) {
            if (this.ViewerService.pin.pinDropMode) {
                return;
            }
            if (this.isMultiSelectDown(keysDown)) {
                this.multiSelectEnabled();
            }
            else if (this.multiMode === true && this.isOtherKey(keysDown)) {
                this.multiSelectDisabled();
            }
            else if (this.isEscapeKey(keysDown)) {
                this.unhighlightAll();
            }
        };
        MultiSelectService.prototype.isMultiMode = function () {
            return this.multiMode;
        };
        MultiSelectService.prototype.multiSelectEnabled = function () {
            this.multiMode = true;
            this.ViewerService.setMultiSelectMode(true);
        };
        MultiSelectService.prototype.multiSelectDisabled = function () {
            this.multiMode = false;
            this.ViewerService.setMultiSelectMode(false);
        };
        MultiSelectService.prototype.unhighlightAll = function () {
            this.ViewerService.highlightObjects([]);
        };
        MultiSelectService.prototype.disableMultiSelect = function () {
            this.ViewerService.setMultiSelectMode(false);
        };
        MultiSelectService.prototype.isCmd = function (keysDown) {
            return this.isMac && keysDown.indexOf(this.keys.cmdKey) !== -1;
        };
        MultiSelectService.prototype.isCtrlKey = function (keysDown) {
            return !this.isMac && keysDown.indexOf(this.keys.ctrlKey) !== -1;
        };
        MultiSelectService.prototype.isMultiSelectDown = function (keysDown) {
            return this.isCmd(keysDown) || this.isCtrlKey(keysDown);
        };
        MultiSelectService.prototype.isOtherKey = function (keysDown) {
            var macOtherKey = this.isMac && keysDown.indexOf(this.keys.cmdKey) === -1;
            var otherKey = !this.isMac && keysDown.indexOf(this.keys.ctrlKey) === -1;
            return macOtherKey || otherKey;
        };
        MultiSelectService.prototype.isEscapeKey = function (keysDown) {
            keysDown.indexOf(this.keys.escKey) !== -1;
        };
        MultiSelectService.$inject = [
            "ViewerService"
        ];
        return MultiSelectService;
    }());
    exports.MultiSelectService = MultiSelectService;
    exports.MultiSelectServiceModule = angular
        .module("3drepo")
        .service("MultiSelectService", MultiSelectService);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /**
     *	Copyright (C) 2014 3D Repo Ltd
     *
     *	This program is free software: you can redistribute it and/or modify
     *	it under the terms of the GNU Affero General Public License as
     *	published by the Free Software Foundation, either version 3 of the
     *	License, or (at your option) any later version.
     *
     *	This program is distributed in the hope that it will be useful,
     *	but WITHOUT ANY WARRANTY; without even the implied warranty of
     *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *	GNU Affero General Public License for more details.
     *
     *	You should have received a copy of the GNU Affero General Public License
     *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */
    var ViewerController = /** @class */ (function () {
        function ViewerController($scope, $q, $element, $timeout, ClientConfigService, EventService, ViewerService) {
            var _this = this;
            this.$scope = $scope;
            this.$q = $q;
            this.$element = $element;
            this.$timeout = $timeout;
            this.ClientConfigService = ClientConfigService;
            this.EventService = EventService;
            this.ViewerService = ViewerService;
            var vm = this;
            $scope.$watch(function () {
                return ViewerService.pin;
            }, function () {
                _this.viewer.setPinDropMode(ViewerService.pin.pinDropMode);
            }, true);
            $scope.$watch(EventService.currentEvent, function (event) {
                var validEvent = event !== undefined && event.type !== undefined;
                if (validEvent && ViewerService.initialised) {
                    ViewerService.handleEvent(event, _this.account, _this.model);
                }
            });
        }
        ViewerController.prototype.$onInit = function () {
            this.branch = this.branch ? this.branch : "master";
            this.revision = this.revision ? this.revision : "head";
            this.pointerEvents = "auto";
            this.measureMode = false;
            this.viewer = this.ViewerService.getViewer();
            this.viewer.prepareViewer();
        };
        ViewerController.prototype.$onDestroy = function () {
            var _this = this;
            this.$element.on("$destroy", function () {
                _this.viewer.reset(); // Remove events watch
            });
        };
        ViewerController.$inject = [
            "$scope",
            "$q",
            "$element",
            "$timeout",
            "ClientConfigService",
            "EventService",
            "ViewerService"
        ];
        return ViewerController;
    }());
    exports.ViewerComponent = {
        bindings: {
            account: "<",
            model: "<",
            branch: "<",
            revision: "<"
        },
        controllerAs: "vm",
        controller: ViewerController
    };
    exports.ViewerComponentModule = angular
        .module('3drepo')
        .component('viewer', exports.ViewerComponent);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var ViewerService = /** @class */ (function () {
        function ViewerService($q, ClientConfigService, APIService, DialogService, EventService, DocsService) {
            this.$q = $q;
            this.ClientConfigService = ClientConfigService;
            this.APIService = APIService;
            this.DialogService = DialogService;
            this.EventService = EventService;
            this.DocsService = DocsService;
            this.newPinId = "newPinId";
            this.pinData = null;
            this.viewer = undefined;
            this.currentModel = {
                model: null,
                promise: null
            };
            this.pin = {
                pinDropMode: false
            };
            this.initialised = $q.defer();
        }
        ViewerService.prototype.getPinData = function () {
            return this.pinData;
        };
        ViewerService.prototype.setPin = function (newPinData) {
            this.pinData = newPinData.data;
        };
        // TODO: More EventService to be removed, but these functions broadcast 
        // across multiple watchers
        ViewerService.prototype.handleEvent = function (event, account, model) {
            var _this = this;
            this.initialised.promise.then(function () {
                switch (event.type) {
                    case _this.EventService.EVENT.MODEL_SETTINGS_READY:
                        if (event.value.account === account && event.value.model === model) {
                            _this.viewer.updateSettings(event.value.settings);
                            //mapTile && mapTile.updateSettings(event.value.settings);
                        }
                        break;
                    case _this.EventService.EVENT.VIEWER.CLICK_PIN:
                        _this.viewer.clickPin(event.value.id);
                        break;
                    case _this.EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR:
                        _this.viewer.changePinColours(event.value.id, event.value.colours);
                        break;
                    case _this.EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES:
                        _this.viewer.updateClippingPlanes(event.value.clippingPlanes, event.value.fromClipPanel, event.value.account, event.value.model);
                        break;
                    case _this.EventService.EVENT.VIEWER.BACKGROUND_SELECTED:
                        _this.DocsService.state.show = false;
                        _this.viewer.clearHighlights();
                        break;
                    case _this.EventService.EVENT.VIEWER.OBJECT_SELECTED:
                        var valid = _this.DocsService.state.active && !_this.pin.pinDropMode;
                        if (valid) {
                            _this.DocsService.handleObjectSelected(event);
                        }
                        break;
                    case _this.EventService.EVENT.VIEWER.SET_CAMERA:
                        _this.currentModel.promise.then(function () {
                            _this.viewer.setCamera(event.value.position, event.value.view_dir, event.value.up, event.value.look_at, event.value.animate !== undefined ? event.value.animate : true, event.value.rollerCoasterMode, event.value.account, event.value.model);
                        })["catch"](function (error) {
                            _this.handleUnityError("Setting the camera errored because model failed to load: " + error);
                        });
                        break;
                }
            });
        };
        ViewerService.prototype.changePinColours = function (params) {
            this.viewer.changePinColours(params.id, params.colours);
        };
        ViewerService.prototype.clearHighlights = function () {
            this.viewer.clearHighlights();
        };
        ViewerService.prototype.getCurrentViewpoint = function (params) {
            // Note the Info suffix
            this.viewer.getCurrentViewpointInfo(params.account, params.model, params.promise);
        };
        ViewerService.prototype.addPin = function (params) {
            var _this = this;
            this.initialised.promise.then(function () {
                _this.viewer.addPin(params.account, params.model, params.id, params.pickedPos, params.pickedNorm, params.colours, params.viewpoint);
            });
        };
        ViewerService.prototype.removePin = function (params) {
            var _this = this;
            this.initialised.promise.then(function () {
                _this.viewer.removePin(params.id);
            });
        };
        ViewerService.prototype.clearClippingPlanes = function () {
            this.viewer.clearClippingPlanes();
        };
        ViewerService.prototype.getObjectsStatus = function (params) {
            this.viewer.getObjectsStatus(params.account, params.model, params.promise);
        };
        ViewerService.prototype.highlightObjects = function (params) {
            this.viewer.highlightObjects(params.account, params.model, params.id ? [params.id] : params.ids, params.zoom, params.colour, params.multi);
        };
        ViewerService.prototype.setMultiSelectMode = function (value) {
            this.viewer.setMultiSelectMode(value);
        };
        ViewerService.prototype.switchObjectVisibility = function (account, model, ids, visibility) {
            this.viewer.switchObjectVisibility(account, model, ids, visibility);
        };
        ViewerService.prototype.handleUnityError = function (message) {
            this.DialogService.html("Unity Error", message, true)
                .then(function () {
                location.reload();
            }, function () {
                console.error("Unity errorered and user canceled reload", message);
            });
        };
        ViewerService.prototype.getModelInfo = function (account, model) {
            var url = account + "/" + model + ".json";
            return this.APIService.get(url);
        };
        ViewerService.prototype.reset = function () {
            if (this.viewer) {
                this.disableMeasure();
                this.viewer.reset();
            }
        };
        ViewerService.prototype.getScreenshot = function (promise) {
            if (promise) {
                this.viewer.getScreenshot(promise);
            }
        };
        ViewerService.prototype.goToExtent = function () {
            this.viewer.showAll();
        };
        ViewerService.prototype.setNavMode = function (mode) {
            this.viewer.setNavMode(mode);
        };
        ViewerService.prototype.unityInserted = function () {
            if (this.viewer === undefined) {
                return false;
            }
            else {
                return this.viewer.unityScriptInserted;
            }
        };
        ViewerService.prototype.getViewer = function () {
            console.log(this.EventService);
            if (this.viewer === undefined) {
                this.viewer = new Viewer("viewer", document.getElementById("viewer"), this.EventService.send, function () { }, "hello");
                this.viewer.setUnity();
            }
            return this.viewer;
        };
        ViewerService.prototype.initViewer = function () {
            var _this = this;
            if (this.unityInserted() === true) {
                return this.callInit();
            }
            else {
                return this.viewer.insertUnityLoader()
                    .then(function () { _this.callInit(); })["catch"](function (error) {
                    console.error("Error inserting Unity script: ", error);
                });
            }
        };
        ViewerService.prototype.activateMeasure = function () {
            this.viewer.setMeasureMode(true);
        };
        ViewerService.prototype.disableMeasure = function () {
            this.viewer.setMeasureMode(false);
        };
        ViewerService.prototype.callInit = function () {
            return this.getViewer()
                .init({
                showAll: true,
                getAPI: {
                    hostNames: this.ClientConfigService.apiUrls["all"]
                }
            })["catch"](function (error) {
                console.error("Error creating Viewer Directive: ", error);
            });
        };
        ViewerService.prototype.loadViewerModel = function (account, model, branch, revision) {
            var _this = this;
            if (!account || !model) {
                console.error("Account, model, branch or revision was not defined!", account, model, branch, revision);
            }
            else {
                this.currentModel.promise = this.viewer.loadModel(account, model, branch, revision)
                    .then(function () {
                    // Set the current model in the viewer
                    _this.currentModel.model = model;
                    _this.initialised.resolve();
                    _this.fetchModelProperties(account, model, branch, revision);
                })["catch"](function (error) {
                    console.error("Error loading model: ", error);
                });
            }
        };
        ViewerService.prototype.fetchModelProperties = function (account, model, branch, revision) {
            var _this = this;
            if (account && model) {
                if (!branch) {
                    branch = !revision ? "master" : "";
                }
                if (!revision || branch === "master") {
                    //revision is master/head 
                    revision = branch + "/head";
                }
                var url = account + "/" + model + "/revision/" + revision + "/modelProperties.json";
                this.APIService.get(url)
                    .then(function (response) {
                    if (response.data && response.data.status) {
                        if (response.data.status === "NOT_FOUND") {
                            console.error("Model properties was not found from API");
                        }
                    }
                    if (response.data && response.data.properties) {
                        _this.viewer.applyModelProperties(account, model, response.data.properties);
                    }
                    else {
                        var message = "No data properties returned. This was the response:";
                        console.error(message, response);
                    }
                })["catch"](function (error) {
                    console.error("Model properties failed to fetch", error);
                });
            }
            else {
                console.error("Account and model were not set correctly " +
                    "for model property fetching: ", account, model);
            }
        };
        ViewerService.$inject = [
            "$q",
            "ClientConfigService",
            "APIService",
            "DialogService",
            "EventService",
            "DocsService"
        ];
        return ViewerService;
    }());
    exports.ViewerService = ViewerService;
    exports.ViewerServiceModule = angular
        .module('3drepo')
        .service('ViewerService', ViewerService);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ })
/******/ ]);