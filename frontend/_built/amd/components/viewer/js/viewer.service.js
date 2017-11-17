define(["require", "exports"], function (require, exports) {
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
});
