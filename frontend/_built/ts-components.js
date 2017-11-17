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

__webpack_require__(4);
__webpack_require__(5);
__webpack_require__(6);

__webpack_require__(7);

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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 *  Copyright (C) 2015 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var TdrProgressController = /** @class */ (function () {
        function TdrProgressController() {
            var vm = this;
        }
        return TdrProgressController;
    }());
    exports.TdrProgress = {
        templateUrl: "templates/tdr-progress.html",
        bindings: {
            info: "="
        },
        controller: TdrProgressController,
        controllerAs: "vm"
    };
    exports.TdrProgressModule = angular
        .module('3drepo')
        .component('tdrProgress', exports.TdrProgress);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 *  Copyright (C) 2016 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    // Inspired by Mark Rajcok'a answer - http://stackoverflow.com/a/14837021/782358
    function tdrFocus($timeout) {
        return {
            scope: { trigger: "@tdrFocus" },
            link: function (scope, element) {
                scope.$watch("trigger", function (value) {
                    if (value.toString() === "true") {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    }
    exports.TdrFocusModule = angular
        .module('3drepo')
        .directive("tdrFocus", ["$timeout", tdrFocus]);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 *  Copyright (C) 2016 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function formatBytes() {
        return function (input, referenceValue) {
            var bytesInMB = 1048576, bytesInGB = 1073741824, factor, units;
            // referenceValue is used for consistency of units
            if (referenceValue !== undefined || referenceValue !== null) {
                if (referenceValue > 1073741824) {
                    factor = bytesInGB;
                    units = " GB";
                }
                else {
                    factor = bytesInMB;
                    units = " MB";
                }
            }
            else {
                if (input > 1073741824) {
                    factor = bytesInGB;
                    units = " GB";
                }
                else {
                    factor = bytesInMB;
                    units = " MB";
                }
            }
            return (Math.round(input / factor * 100) / 100).toString() + units; // (input / bytesInAGb).toFixed(2)
        };
    }
    ;
    function invoiceDate() {
        return function (input) {
            var date = new Date(input), invoiceDate;
            invoiceDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
                ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
                date.getFullYear() + " " +
                (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
                (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
            return invoiceDate;
        };
    }
    ;
    function prettyDate() {
        return function (input, showSeconds) {
            var date = new Date(input), modelDate;
            modelDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
                ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
                date.getFullYear();
            var showSecondsDefined = (showSeconds !== undefined && showSeconds !== undefined);
            if (showSecondsDefined) {
                modelDate += ", " + (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
                    (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
            }
            return modelDate;
        };
    }
    ;
    function prettyGMTDate() {
        return function (input) {
            var date = new Date(input);
            return date.toISOString().substr(0, 10);
        };
    }
    ;
    function revisionDate() {
        return function (input) {
            return new Date(Date.parse(input)).toLocaleString();
        };
    }
    ;
    exports.FormatBytesModule = angular
        .module('3drepo')
        .filter('formatBytes', formatBytes);
    exports.InvoiceDateModule = angular
        .module('3drepo')
        .filter('invoiceDate', invoiceDate);
    exports.PrettyDateModule = angular
        .module('3drepo')
        .filter('prettyDate', prettyDate);
    exports.PrettyGMTDate = angular
        .module('3drepo')
        .filter('prettyGMTDate', prettyGMTDate);
    exports.RevisionDateModule = angular
        .module('3drepo')
        .filter('revisionDate', revisionDate);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var TreeController = /** @class */ (function () {
        function TreeController($scope, $timeout, TreeService, EventService, MultiSelectService, ViewerService) {
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.TreeService = TreeService;
            this.EventService = EventService;
            this.MultiSelectService = MultiSelectService;
            this.ViewerService = ViewerService;
            this.lastParentWithName = null;
            var vm = this;
            this.promise = null,
                this.currentSelectedNodes = [],
                this.highlightSelectedViewerObject = true,
                this.clickedHidden = {}, // Nodes that have actually been clicked to hide
                this.clickedShown = {}; // Nodes that have actually been clicked to show
        }
        /*
        * Init
        */
        TreeController.prototype.$onInit = function () {
            this.nodes = [];
            this.showNodes = true;
            this.showTree = true;
            this.showFilterList = false;
            this.currentFilterItemSelected = null;
            this.viewerSelectedObject = null;
            this.showProgress = true;
            this.progressInfo = "Loading full tree structure";
            this.onContentHeightRequest({ height: 70 }); // To show the loading progress
            this.visible = {};
            this.invisible = {};
            this.currentSelectedNodes = [];
            this.watchers();
        };
        ;
        TreeController.prototype.watchers = function () {
            var _this = this;
            this.$scope.$watch(this.EventService.currentEvent, function (event) {
                if (event.type === _this.EventService.EVENT.VIEWER.OBJECT_SELECTED) {
                    if ((event.value.source !== "tree") && _this.highlightSelectedViewerObject) {
                        var objectID = event.value.id;
                        if (objectID && _this.idToPath) {
                            var path = _this.getPath(objectID);
                            if (!path) {
                                console.error("Couldn't find the object path");
                            }
                            else {
                                _this.initNodesToShow();
                                _this.lastParentWithName = null;
                                _this.expandToSelection(path, 0, undefined);
                                //all these init and expanding unselects the selected, so let's select them again
                                //FIXME: ugly as hell but this is the easiest solution until we refactor this.
                                _this.currentSelectedNodes.forEach(function (selectedNode) {
                                    selectedNode.selected = true;
                                });
                                _this.lastParentWithName && _this.selectNode(_this.lastParentWithName);
                            }
                        }
                    }
                }
                else if (event.type === _this.EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
                    _this.clearCurrentlySelected();
                    if (_this.currentFilterItemSelected !== null) {
                        _this.currentFilterItemSelected["class"] = "";
                        _this.currentFilterItemSelected = null;
                    }
                }
                else if (event.type === _this.EventService.EVENT.PANEL_CARD_ADD_MODE ||
                    event.type === _this.EventService.EVENT.PANEL_CARD_EDIT_MODE) {
                    // If another card is in modify mode don't show a node if an object is clicked in the viewer
                    _this.highlightSelectedViewerObject = !event.value.on;
                }
                else if (event.type === _this.EventService.EVENT.TREE_READY) {
                    /*
                    * Get all the tree nodes
                    */
                    _this.allNodes = [];
                    _this.allNodes.push(event.value.nodes);
                    _this.nodes = _this.allNodes;
                    _this.showTree = true;
                    _this.showProgress = false;
                    _this.subTreesById = event.value.subTreesById;
                    _this.idToPath = event.value.idToPath;
                    _this.subModelIdToPath = event.value.subModelIdToPath;
                    _this.initNodesToShow();
                    _this.expandFirstNode();
                    _this.setupInfiniteScroll();
                    _this.setContentHeight(_this.nodesToShow);
                }
            });
            this.$scope.$watch("vm.filterText", function (newValue) {
                var noFilterItemsFoundHeight = 82;
                if (_this.isDefined(newValue)) {
                    if (newValue.toString() === "") {
                        _this.showTree = true;
                        _this.showFilterList = false;
                        _this.showProgress = false;
                        _this.nodes = _this.nodesToShow;
                        _this.setContentHeight(_this.nodes);
                    }
                    else {
                        _this.showTree = false;
                        _this.showFilterList = false;
                        _this.showProgress = true;
                        _this.progressInfo = "Filtering tree for objects";
                        _this.TreeService.search(newValue)
                            .then(function (json) {
                            _this.showFilterList = true;
                            _this.showProgress = false;
                            _this.nodes = json.data;
                            if (_this.nodes.length > 0) {
                                _this.filterItemsFound = true;
                                for (var i = 0; i < _this.nodes.length; i++) {
                                    _this.nodes[i].index = i;
                                    _this.nodes[i].toggleState = "visible";
                                    _this.nodes[i]["class"] = "unselectedFilterItem";
                                    _this.nodes[i].level = 0;
                                }
                                _this.setupInfiniteItemsFilter();
                                _this.setContentHeight(_this.nodes);
                            }
                            else {
                                _this.filterItemsFound = false;
                                _this.onContentHeightRequest({ height: noFilterItemsFoundHeight });
                            }
                        });
                    }
                }
            });
        };
        /**
         * Set the content height.
         * The height of a node is dependent on its name length and its level.
         *
         * @param {Array} nodesToShow
         */
        TreeController.prototype.setContentHeight = function (nodesToShow) {
            var i, length, height = 0, nodeMinHeight = 42, maxStringLength = 35, maxStringLengthForLevel = 0, lineHeight = 18, levelOffset = 2;
            for (i = 0, length = nodesToShow.length; i < length; i += 1) {
                maxStringLengthForLevel = maxStringLength - (nodesToShow[i].level * levelOffset);
                if (nodesToShow[i].hasOwnProperty("name")) {
                    height += nodeMinHeight + (lineHeight * Math.floor(nodesToShow[i].name.length / maxStringLengthForLevel));
                }
                else {
                    height += nodeMinHeight + lineHeight;
                }
            }
            this.onContentHeightRequest({ height: height });
        };
        /**
         * Initialise the tree nodes to show to the first node
         */
        TreeController.prototype.initNodesToShow = function () {
            this.nodesToShow = [this.allNodes[0]];
            this.nodesToShow[0].level = 0;
            this.nodesToShow[0].expanded = false;
            this.nodesToShow[0].selected = false;
            this.nodesToShow[0].hasChildren = this.nodesToShow[0].children;
            // Only make the top node visible if it does not have a toggleState
            if (!this.nodesToShow[0].hasOwnProperty("toggleState")) {
                this.nodesToShow[0].toggleState = "visible";
            }
        };
        /**
         * Show the first set of children using the expand function but deselect the child used for this
         */
        TreeController.prototype.expandFirstNode = function () {
            this.expandToSelection(this.nodesToShow[0].children[0].path.split("__"), 0, true);
            this.nodesToShow[0].children[0].selected = false;
        };
        /**
         * traverse children of a node recursively
         * @param {Object} node
         * @param {Function} callback
         */
        TreeController.prototype.traverseNode = function (node, callback) {
            var _this = this;
            callback(node);
            node.children && node.children.forEach(function (child) {
                _this.traverseNode(child, callback);
            });
        };
        TreeController.prototype.getAccountModelKey = function (account, model) {
            return account + "@" + model;
        };
        /**
         * Add all child id of a node recursively, the parent node's id will also be added.
         * @param {Object} node
         * @param {Array} nodes Array to push the nodes to
         */
        TreeController.prototype.traverseNodeAndPushId = function (node, nodes) {
            var _this = this;
            this.traverseNode(node, function (node) {
                if (!node.children && ((node.type || "mesh") === "mesh")) {
                    var key = _this.getAccountModelKey(node.account, node.project);
                    if (!nodes[key]) {
                        nodes[key] = [];
                    }
                    nodes[key].push(node._id);
                }
            });
        };
        TreeController.prototype.getVisibleArray = function (account, model) {
            var key = this.getAccountModelKey(account, model);
            if (!this.visible[key]) {
                this.visible[key] = new Set();
            }
            return this.visible[key];
        };
        TreeController.prototype.getInvisibleArray = function (account, model) {
            var key = this.getAccountModelKey(account, model);
            if (!this.invisible[key]) {
                this.invisible[key] = new Set();
            }
            return this.invisible[key];
        };
        /**
         * Set the toggle state of a node
         * @param {Object} node Node to change the visibility for
         * @param {String} visibility Visibility to change to
         */
        TreeController.prototype.setToggleState = function (node, visibility) {
            var visible = this.getVisibleArray(node.account, node.project);
            var invisible = this.getInvisibleArray(node.account, node.project);
            if (!node.children && ((node.type || "mesh") === "mesh")) {
                if (visibility === "invisible") {
                    if (invisible.has(node._id)) {
                        invisible["delete"](node._id);
                    }
                    else {
                        invisible.add(node._id);
                    }
                    visible["delete"](node._id);
                }
                else {
                    if (visible.has(node._id)) {
                        visible["delete"](node._id);
                    }
                    else {
                        visible.add(node._id);
                    }
                    invisible["delete"](node._id);
                }
            }
            node.toggleState = visibility;
        };
        ;
        /*
        * See if id in each ids is a sub string of path
        */
        TreeController.prototype.matchPath = function (ids, path) {
            for (var i = 0; i < ids.length; i++) {
                if (path.indexOf(ids[i]) !== -1) {
                    return true;
                }
            }
            return false;
        };
        TreeController.prototype.isDefined = function (value) {
            return value !== undefined && value !== null;
        };
        /**
         * Expand a node to show its children.
         * @param event
         * @param _id
         */
        TreeController.prototype.expand = function (event, _id) {
            var _this = this;
            var i, length, j, jLength, numChildren = 0, index = -1, endOfSplice = false, numChildrenToForceRedraw = 3;
            event.stopPropagation();
            // Find node index
            for (i = 0, length = this.nodesToShow.length; i < length; i += 1) {
                if (this.nodesToShow[i]._id === _id) {
                    index = i;
                    break;
                }
            }
            var _ids = [_id];
            // Found
            if (index !== -1) {
                if (this.nodesToShow[index].hasChildren) {
                    if (this.nodesToShow[index].expanded) {
                        // Collapse
                        //if the target itself contains subModelTree
                        if (this.nodesToShow[index].hasSubModelTree) {
                            //node containing sub model tree must have only one child
                            var subModelNode = this.subTreesById[this.nodesToShow[index].children[0]._id];
                            _ids.push(subModelNode._id);
                        }
                        while (!endOfSplice) {
                            if (this.isDefined(this.nodesToShow[index + 1]) && this.matchPath(_ids, this.nodesToShow[index + 1].path)) {
                                if (this.nodesToShow[index + 1].hasSubModelTree) {
                                    var subModelNode = this.subTreesById[this.nodesToShow[index + 1].children[0]._id];
                                    _ids.push(subModelNode._id);
                                }
                                this.nodesToShow.splice(index + 1, 1);
                            }
                            else {
                                endOfSplice = true;
                            }
                        }
                    }
                    else {
                        // Expand
                        numChildren = this.nodesToShow[index].children.length;
                        // If the node has a large number of children then force a redraw of the tree to get round the display problem
                        if (numChildren >= numChildrenToForceRedraw) {
                            this.showNodes = false;
                        }
                        for (i = 0; i < numChildren; i += 1) {
                            // For federation - handle node of model that cannot be viewed or has been deleted
                            // That node will be below level 0 only
                            if ((this.nodesToShow[index].level === 0) &&
                                this.nodesToShow[index].children[i].hasOwnProperty("children") &&
                                this.nodesToShow[index].children[i].children[0].hasOwnProperty("status")) {
                                this.nodesToShow[index].children[i].status = this.nodesToShow[index].children[i].children[0].status;
                            }
                            else {
                                // Normal tree node
                                this.nodesToShow[index].children[i].expanded = false;
                                // If the child node does not have a toggleState set it to visible
                                if (!this.nodesToShow[index].children[i].hasOwnProperty("toggleState")) {
                                    this.setToggleState(this.nodesToShow[index].children[i], "visible");
                                }
                            }
                            // A child node only "hasChildren", i.e. expandable, if any of it's children have a name
                            this.nodesToShow[index].children[i].level = this.nodesToShow[index].level + 1;
                            this.nodesToShow[index].children[i].hasChildren = false;
                            if (("children" in this.nodesToShow[index].children[i]) && (this.nodesToShow[index].children[i].children.length > 0)) {
                                for (j = 0, jLength = this.nodesToShow[index].children[i].children.length; j < jLength; j++) {
                                    if (this.nodesToShow[index].children[i].children[j].hasOwnProperty("name")) {
                                        this.nodesToShow[index].children[i].hasChildren = true;
                                        break;
                                    }
                                }
                            }
                            if (this.nodesToShow[index].children[i].hasOwnProperty("name")) {
                                this.nodesToShow.splice(index + i + 1, 0, this.nodesToShow[index].children[i]);
                            }
                        }
                        // Redraw the tree if needed
                        if (!this.showNodes) {
                            this.$timeout(function () {
                                _this.showNodes = true;
                                // Resize virtual repeater
                                // Taken from kseamon's comment - https://github.com/angular/material/issues/4314
                                _this.$scope.$broadcast("$md-resize");
                            });
                        }
                    }
                    this.nodesToShow[index].expanded = !this.nodesToShow[index].expanded;
                }
            }
            this.setContentHeight(this.nodesToShow);
        };
        ;
        /**
         * Expand the tree and highlight the node corresponding to the object selected in the viewer.
         * @param path
         * @param level
         */
        TreeController.prototype.expandToSelection = function (path, level, noHighlight) {
            var _this = this;
            var i, j, length, childrenLength, selectedId = path[path.length - 1], selectedIndex = 0, selectionFound = false;
            // Force a redraw of the tree to get round the display problem
            this.showNodes = false;
            var condLoop = true;
            for (i = 0, length = this.nodesToShow.length; i < length && condLoop; i += 1) {
                if (this.nodesToShow[i]._id === path[level]) {
                    this.lastParentWithName = this.nodesToShow[i];
                    this.nodesToShow[i].expanded = true;
                    this.nodesToShow[i].selected = false;
                    childrenLength = this.nodesToShow[i].children.length;
                    if (level === (path.length - 2)) {
                        selectedIndex = i;
                    }
                    var childWithNameCount = 0;
                    for (j = 0; j < childrenLength; j += 1) {
                        // Set child to not expanded
                        this.nodesToShow[i].children[j].expanded = false;
                        if (this.nodesToShow[i].children[j]._id === selectedId) {
                            if (this.nodesToShow[i].children[j].hasOwnProperty("name")) {
                                this.nodesToShow[i].children[j].selected = true;
                                if (!noHighlight) {
                                    this.selectNode(this.nodesToShow[i].children[j]);
                                }
                                this.lastParentWithName = null;
                                selectedIndex = i + j + 1;
                            }
                            else if (!noHighlight) {
                                // If the selected mesh doesn't have a name highlight the parent in the tree
                                // highlight the parent in the viewer
                                this.selectNode(this.nodesToShow[i]);
                                selectedId = this.nodesToShow[i]._id;
                                selectedIndex = i;
                                this.lastParentWithName = null;
                                selectedId = this.nodesToShow[i]._id;
                            }
                            condLoop = false;
                        }
                        else {
                            // This will clear any previously selected node
                            this.nodesToShow[i].children[j].selected = false;
                        }
                        // Only set the toggle state once when the node is listed
                        if (!this.nodesToShow[i].children[j].hasOwnProperty("toggleState")) {
                            this.setToggleState(this.nodesToShow[i].children[j], "visible");
                        }
                        // Determine if child node has childern
                        this.nodesToShow[i].children[j].hasChildren = false;
                        if (("children" in this.nodesToShow[i].children[j]) && (this.nodesToShow[i].children[j].children.length > 0)) {
                            for (var k = 0, jLength = this.nodesToShow[i].children[j].children.length; k < jLength; k++) {
                                if (this.nodesToShow[i].children[j].children[k].hasOwnProperty("name")) {
                                    this.nodesToShow[i].children[j].hasChildren = true;
                                    break;
                                }
                            }
                        }
                        // Set current selected node
                        if (this.nodesToShow[i].children[j].selected) {
                            selectionFound = true;
                        }
                        this.nodesToShow[i].children[j].level = level + 1;
                        if (this.nodesToShow[i].hasChildren && this.nodesToShow[i].children[j].hasOwnProperty("name")) {
                            this.nodesToShow.splice(i + childWithNameCount + 1, 0, this.nodesToShow[i].children[j]);
                            childWithNameCount++;
                        }
                    }
                }
            }
            if (level < (path.length - 2)) {
                this.expandToSelection(path, (level + 1), undefined);
            }
            else if (level === (path.length - 2)) {
                this.setContentHeight(this.nodesToShow);
                this.showNodes = true;
                this.$timeout(function () {
                    // Redraw the tree
                    // Resize virtual repeater
                    // Taken from kseamon's comment - https://github.com/angular/material/issues/4314
                    _this.$scope.$broadcast("$md-resize");
                    _this.topIndex = selectedIndex;
                });
                this.$timeout(function () {
                    var el = document.getElementById(selectedId);
                    el && el.scrollIntoView();
                });
            }
        };
        TreeController.prototype.getPath = function (objectID) {
            var path;
            if (this.idToPath[objectID]) {
                // If the Object ID is on the main tree then use that path
                path = this.idToPath[objectID].split("__");
            }
            else if (this.subModelIdToPath[objectID]) {
                // Else check the submodel for the id for the path
                path = this.subModelIdToPath[objectID].split("__");
                var parentPath = this.subTreesById[path[0]].parent.path.split("__");
                path = parentPath.concat(path);
            }
            return path;
        };
        ;
        TreeController.prototype.toggleTreeNode = function (node) {
            var nodesLength, path, hasParent, lastParent = node, nodeToggleState = "visible", numInvisible = 0, numParentInvisible = 0;
            this.toggledNode = node;
            //toggle yourself
            this.setToggleState(node, (node.toggleState === "visible") ? "invisible" : "visible");
            nodeToggleState = node.toggleState;
            this.updateClickedHidden(node);
            this.updateClickedShown(node);
            var stack = [node];
            var head = null;
            while (stack.length > 0) {
                head = stack.pop();
                if (node !== head) {
                    this.setToggleState(head, nodeToggleState);
                }
                if (head.children) {
                    for (var i = 0; i < head.children.length; i++) {
                        stack.push(head.children[i]);
                    }
                }
            }
            //a__b .. c__d
            //toggle parent
            path = node.path.split("__");
            path.splice(path.length - 1, 1);
            for (var i_1 = 0, nodesLength_1 = this.nodesToShow.length; i_1 < nodesLength_1; i_1 += 1) {
                // 	// Get node parent
                if (this.nodesToShow[i_1]._id === path[path.length - 1]) {
                    lastParent = this.nodesToShow[i_1];
                    hasParent = true;
                }
                else if (lastParent.parent) {
                    //Get node parent and reconstruct the path in case it is a fed model
                    lastParent = lastParent.parent;
                    path = lastParent.path.split("__").concat(path);
                    hasParent = true;
                }
            }
            // Set the toggle state of the nodes above
            if (hasParent) {
                for (var i_2 = (path.length - 1); i_2 >= 0; i_2 -= 1) {
                    for (var j = 0, nodesLength_2 = this.nodesToShow.length; j < nodesLength_2; j += 1) {
                        if (this.nodesToShow[j]._id === path[i_2]) {
                            numInvisible = this.nodesToShow[j].children.reduce(function (total, child) {
                                return child.toggleState === "invisible" ? total + 1 : total;
                            }, 0);
                            numParentInvisible = this.nodesToShow[j].children.reduce(function (total, child) {
                                return child.toggleState === "parentOfInvisible" ? total + 1 : total;
                            }, 0);
                            if (numInvisible === this.nodesToShow[j].children.length) {
                                this.nodesToShow[j].toggleState = "invisible";
                            }
                            else if ((numParentInvisible + numInvisible) > 0) {
                                this.nodesToShow[j].toggleState = "parentOfInvisible";
                            }
                            else {
                                this.setToggleState(this.nodesToShow[j], "visible");
                            }
                        }
                    }
                }
            }
            this.toggleNode(node);
        };
        ;
        TreeController.prototype.toggleNode = function (node) {
            var childNodes = [];
            this.traverseNodeAndPushId(node, childNodes);
            for (var key in childNodes) {
                var vals = key.split("@");
                var account = vals[0];
                var model = vals[1];
                this.ViewerService.switchObjectVisibility(account, model, childNodes[key], node.toggleState != "invisible");
            }
        };
        ;
        TreeController.prototype.setupInfiniteScroll = function () {
            // Infinite items
            this.infiniteItemsTree = {
                numLoaded_: 0,
                toLoad_: 0,
                getItemAtIndex: function (index) {
                    if (index > this.numLoaded_) {
                        this.fetchMoreItems_(index);
                        return null;
                    }
                    if (index < this.nodesToShow.length) {
                        return this.nodesToShow[index];
                    }
                    else {
                        return null;
                    }
                },
                getLength: function () {
                    return this.numLoaded_ + 5;
                },
                fetchMoreItems_: function (index) {
                    var _this = this;
                    if (this.toLoad_ < index) {
                        this.toLoad_ += 500;
                        this.$timeout(function () { }, 300).then(function () {
                            _this.numLoaded_ = _this.toLoad_;
                        });
                    }
                }
            };
        };
        /**
         * Unselect all selected items and clear the array
         */
        TreeController.prototype.clearCurrentlySelected = function () {
            this.currentSelectedNodes.forEach(function (selectedNode) {
                selectedNode.selected = false;
            });
            this.currentSelectedNodes = [];
        };
        /**
         * Selected a node in the tree
         *
         * @param node
         */
        TreeController.prototype.selectNode = function (node) {
            var sameNodeIndex = this.currentSelectedNodes.findIndex(function (element) {
                return element._id === node._id;
            });
            if (this.MultiSelectService.isMultiMode()) {
                if (sameNodeIndex > -1) {
                    //Multiselect mode and we selected the same node - unselect it
                    this.currentSelectedNodes[sameNodeIndex].selected = false;
                    this.currentSelectedNodes.splice(sameNodeIndex, 1);
                }
                else {
                    node.selected = true;
                    this.currentSelectedNodes.push(node);
                }
            }
            else {
                //If it is not multiselect mode, remove all highlights.
                this.ViewerService.clearHighlights();
                this.clearCurrentlySelected();
                node.selected = true;
                this.currentSelectedNodes.push(node);
            }
            var map = [];
            this.traverseNodeAndPushId(node, map);
            // Select the parent node in the group for cards and viewer
            this.EventService.send(this.EventService.EVENT.VIEWER.OBJECT_SELECTED, {
                source: "tree",
                account: node.account,
                model: node.project,
                id: node._id,
                name: node.name,
                noHighlight: true
            });
            for (var key in map) {
                var vals = key.split("@");
                var account = vals[0];
                var model = vals[1];
                // Separately highlight the children
                // but only for multipart meshes
                this.ViewerService.highlightObjects({
                    source: "tree",
                    account: account,
                    model: model,
                    ids: map[key],
                    multi: true
                });
            }
        };
        ;
        TreeController.prototype.filterItemSelected = function (item) {
            if (this.currentFilterItemSelected === null) {
                this.nodes[item.index]["class"] = "treeNodeSelected";
                this.currentFilterItemSelected = item;
            }
            else if (item.index === this.currentFilterItemSelected.index) {
                this.nodes[item.index]["class"] = "";
                this.currentFilterItemSelected = null;
            }
            else {
                this.nodes[this.currentFilterItemSelected.index]["class"] = "";
                this.nodes[item.index]["class"] = "treeNodeSelected";
                this.currentFilterItemSelected = item;
            }
            var selectedNode = this.nodes[item.index];
            this.selectNode(selectedNode);
        };
        ;
        TreeController.prototype.toggleFilterNode = function (item) {
            this.setToggleState(item, (item.toggleState === "visible") ? "invisible" : "visible");
            item.path = item._id;
            this.toggleNode(item);
        };
        ;
        TreeController.prototype.setupInfiniteItemsFilter = function () {
            this.infiniteItemsFilter = {
                numLoaded_: 0,
                toLoad_: 0,
                getItemAtIndex: function (index) {
                    if (index > this.numLoaded_) {
                        this.fetchMoreItems_(index);
                        return null;
                    }
                    if (index < this.nodes.length) {
                        return this.nodes[index];
                    }
                    else {
                        return null;
                    }
                },
                getLength: function () {
                    return this.numLoaded_ + 5;
                },
                fetchMoreItems_: function (index) {
                    var _this = this;
                    if (this.toLoad_ < index) {
                        this.toLoad_ += 20;
                        this.$timeout(function () { }, 300).then(function () {
                            _this.numLoaded_ = _this.toLoad_;
                        });
                    }
                }
            };
        };
        /**
         * If a node was clicked to hide, add it to a list of similar nodes
         *
         * @param {Object} node
         */
        TreeController.prototype.updateClickedHidden = function (node) {
            if (node.toggleState === "invisible") {
                this.clickedHidden[node._id] = node;
            }
            else {
                delete this.clickedHidden[node._id];
            }
        };
        /**
         * If a node was clicked to show, add it to a list of similar nodes
         *
         * @param {Object} node
         */
        TreeController.prototype.updateClickedShown = function (node) {
            if (node.toggleState === "visible") {
                this.clickedShown[node._id] = node;
            }
            else {
                delete this.clickedShown[node._id];
            }
        };
        TreeController.$inject = [
            "$scope",
            "$timeout",
            "TreeService",
            "EventService",
            "MultiSelectService",
            "ViewerService"
        ];
        return TreeController;
    }());
    exports.TreeComponent = {
        templateUrl: "templates/tree.html",
        bindings: {
            account: "=",
            model: "=",
            branch: "=",
            revision: "=",
            filterText: "=",
            onContentHeightRequest: "&"
        },
        controller: TreeController,
        controllerAs: "vm"
    };
    exports.TreeComponentModule = angular
        .module('3drepo')
        .component('tree', exports.TreeComponent);
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ })
/******/ ]);