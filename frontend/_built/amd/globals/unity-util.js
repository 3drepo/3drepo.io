define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var UnityUtil = /** @class */ (function () {
        function UnityUtil() {
        }
        UnityUtil.init = function (errorCallback) {
            errorCallback = errorCallback;
        };
        UnityUtil._SendMessage = function (gameObject, func, param) {
            if (param === undefined) {
                if (!UnityUtil.SendMessage_vss) {
                    UnityUtil.SendMessage_vss = Module.cwrap("SendMessage", "void", ["string", "string"]);
                }
                UnityUtil.SendMessage_vss(gameObject, func);
            }
            else if (typeof param === "string") {
                if (!UnityUtil.SendMessage_vsss) {
                    UnityUtil.SendMessage_vsss = Module.cwrap("SendMessageString", "void", ["string", "string", "string"]);
                }
                UnityUtil.SendMessage_vsss(gameObject, func, param);
            }
            else if (typeof param === "number") {
                if (!UnityUtil.SendMessage_vssn) {
                    UnityUtil.SendMessage_vssn = Module.cwrap("SendMessageFloat", "void", ["string", "string", "number"]);
                }
                UnityUtil.SendMessage_vssn(gameObject, func, param);
            }
            else {
                throw "" + param + " is does not have a type which is supported by SendMessage.";
            }
        };
        ;
        UnityUtil.onError = function (err, url, line) {
            var conf = "Your browser has failed to load 3D Repo. This may due to insufficient memory. " +
                "Please ensure you are using a 64bit web browser (Chrome or FireFox for best results), " +
                "reduce your memory usage and try again. " +
                "If you are unable to resolve this problem, please contact support@3drepo.org referencing the following: " +
                "<br><br> <code>Error " + err + " occured at line " + line +
                "</code> <br><br> Click ok to refresh this page. <md-container>";
            var reload = false;
            if (err.indexOf("Array buffer allocation failed") !== -1 ||
                err.indexOf("Unity") != -1 || err.indexOf("unity") != -1) {
                reload = true;
            }
            UnityUtil.userAlert(conf, reload);
            return true;
        };
        ;
        UnityUtil.onLoaded = function () {
            if (!UnityUtil.loadedPromise) {
                UnityUtil.loadedPromise = new Promise(function (resolve, reject) {
                    UnityUtil.loadedResolve = { resolve: resolve, reject: reject };
                });
            }
            return UnityUtil.loadedPromise;
        };
        ;
        UnityUtil.onLoading = function () {
            if (!UnityUtil.loadingPromise) {
                UnityUtil.loadingPromise = new Promise(function (resolve, reject) {
                    UnityUtil.loadingResolve = { resolve: resolve, reject: reject };
                });
            }
            return UnityUtil.loadingPromise;
        };
        ;
        UnityUtil.onReady = function () {
            if (!UnityUtil.readyPromise) {
                UnityUtil.readyPromise = new Promise(function (resolve, reject) {
                    UnityUtil.readyResolve = { resolve: resolve, reject: reject };
                });
            }
            return UnityUtil.readyPromise;
        };
        ;
        UnityUtil.userAlert = function (message, reload) {
            var prefix = "" + "Unity Error: ";
            var fullMessage = prefix + message;
            if (!UnityUtil.unityHasErrored) {
                // Unity can error multiple times, we don't want 
                // to keep annoying the user
                UnityUtil.unityHasErrored = true;
                UnityUtil.errorCallback({
                    message: fullMessage,
                    reload: reload
                });
            }
        };
        ;
        UnityUtil.toUnity = function (methodName, requireStatus, params) {
            if (requireStatus == UnityUtil.LoadingState.MODEL_LOADED) {
                //Requires model to be loaded
                UnityUtil.onLoaded().then(function () {
                    SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
                })["catch"](function (error) {
                    if (error != "cancel") {
                        console.error("UnityUtil.onLoaded() failed: ", error);
                        UnityUtil.userAlert(error, true);
                    }
                });
            }
            else if (requireStatus == UnityUtil.LoadingState.MODEL_LOADING) {
                //Requires model to be loading
                UnityUtil.onLoading().then(function () {
                    SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
                })["catch"](function (error) {
                    if (error !== "cancel") {
                        UnityUtil.userAlert(error, true);
                        console.error("UnityUtil.onLoading() failed: ", error);
                    }
                });
            }
            else {
                UnityUtil.onReady().then(function () {
                    //console.log(UnityUtil.UNITY_GAME_OBJECT, methodName, params)
                    SendMessage(UnityUtil.UNITY_GAME_OBJECT, methodName, params);
                })["catch"](function (error) {
                    if (error != "cancel") {
                        UnityUtil.userAlert(error, true);
                        console.error("UnityUtil.onReady() failed: ", error);
                    }
                });
            }
        };
        /*
         * =============== FROM UNITY ====================
         */
        UnityUtil.clipBroadcast = function (clipInfo) {
            if (UnityUtil.viewer.clipBroadcast) {
                UnityUtil.viewer.clipBroadcast(JSON.parse(clipInfo));
            }
        };
        ;
        UnityUtil.currentPointInfo = function (pointInfo) {
            var point = JSON.parse(pointInfo);
            console.log(UnityUtil.viewer);
            if (UnityUtil.viewer.objectSelected) {
                UnityUtil.viewer.objectSelected(point);
            }
        };
        ;
        UnityUtil.loaded = function (bboxStr) {
            var res = {
                bbox: JSON.parse(bboxStr)
            };
            UnityUtil.loadedResolve.resolve(res);
            UnityUtil.loadedFlag = true;
        };
        ;
        UnityUtil.loading = function (bboxStr) {
            UnityUtil.loadingResolve.resolve();
        };
        ;
        UnityUtil.objectStatusBroadcast = function (nodeInfo) {
            UnityUtil.objectStatusPromise.resolve(JSON.parse(nodeInfo));
            UnityUtil.objectStatusPromise = null;
        };
        ;
        UnityUtil.ready = function () {
            //Overwrite the Send Message function to make it run quicker 
            //This shouldn't need to be done in the future when the
            //readyoptimisation in added into unity.
            SendMessage = UnityUtil._SendMessage;
            UnityUtil.readyResolve.resolve();
        };
        ;
        UnityUtil.pickPointAlert = function (pointInfo) {
            var point = JSON.parse(pointInfo);
            console.log("pickPointAlert", UnityUtil.viewer.pickPoint);
            if (UnityUtil.viewer.pickPoint) {
                UnityUtil.viewer.pickPoint(point);
            }
        };
        ;
        UnityUtil.screenshotReady = function (screenshot) {
            var ssJSON = JSON.parse(screenshot);
            UnityUtil.screenshotPromises.forEach(function (promise) {
                promise.resolve(ssJSON.ssBytes);
            });
            UnityUtil.screenshotPromises = [];
        };
        ;
        UnityUtil.viewpointReturned = function (vpInfo) {
            if (UnityUtil.vpPromise != null) {
                var viewpoint = JSON.parse(vpInfo);
                UnityUtil.vpPromise.resolve(viewpoint);
                UnityUtil.vpPromise = null;
            }
        };
        ;
        /*
         * =============== TO UNITY ====================
         */
        UnityUtil.centreToPoint = function (model, id) {
            var params = {
                model: model,
                meshID: id
            };
            UnityUtil.toUnity("CentreToObject", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
        };
        ;
        UnityUtil.changePinColour = function (id, colour) {
            var params = {
                color: colour,
                pinName: id
            };
            UnityUtil.toUnity("ChangePinColor", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
        };
        ;
        UnityUtil.clearHighlights = function () {
            UnityUtil.toUnity("ClearHighlighting", UnityUtil.LoadingState.MODEL_LOADED, undefined);
        };
        ;
        UnityUtil.disableClippingPlanes = function () {
            UnityUtil.toUnity("DisableClip", undefined, undefined);
        };
        ;
        UnityUtil.disableMeasuringTool = function () {
            UnityUtil.toUnity("StopMeasuringTool", UnityUtil.LoadingState.MODEL_LOADING, undefined);
        };
        ;
        UnityUtil.dropPin = function (id, position, normal, colour) {
            var params = {
                id: id,
                position: position,
                normal: normal,
                color: colour
            };
            UnityUtil.toUnity("DropPin", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(params));
        };
        ;
        UnityUtil.enableMeasuringTool = function () {
            UnityUtil.toUnity("StartMeasuringTool", UnityUtil.LoadingState.MODEL_LOADING, undefined);
        };
        UnityUtil.getObjectsStatus = function (account, model, promise) {
            var nameSpace = "";
            if (account && model) {
                nameSpace = account + "." + model;
            }
            if (UnityUtil.objectStatusPromise) {
                UnityUtil.objectStatusPromise.then(function () {
                    UnityUtil._getObjectsStatus(nameSpace, promise);
                });
            }
            else {
                UnityUtil._getObjectsStatus(nameSpace, promise);
            }
        };
        ;
        UnityUtil._getObjectsStatus = function (nameSpace, promise) {
            UnityUtil.objectStatusPromise = promise;
            UnityUtil.toUnity("GetObjectsStatus", UnityUtil.LoadingState.MODEL_LOADED, nameSpace);
        };
        UnityUtil.getPointInfo = function () {
            UnityUtil.toUnity("GetPointInfo", false, 0);
        };
        ;
        UnityUtil.highlightObjects = function (account, model, idArr, color, toggleMode) {
            var params = {
                database: account,
                model: model,
                ids: idArr,
                toggle: toggleMode
            };
            if (color) {
                params.color = color;
            }
            UnityUtil.toUnity("HighlightObjects", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(params));
        };
        ;
        UnityUtil.cancelLoadModel = function () {
            if (!UnityUtil.loadedFlag && UnityUtil.loadedResolve) {
                //If the previous model is being loaded but hasn't finished yet
                UnityUtil.loadedResolve.reject("cancel");
            }
            if (UnityUtil.loadingResolve) {
                UnityUtil.loadingResolve.reject("cancel");
            }
        };
        ;
        UnityUtil.loadModel = function (account, model, branch, revision) {
            //console.log("pin - loadModel");
            UnityUtil.cancelLoadModel();
            UnityUtil.reset();
            UnityUtil.loadedPromise = null;
            UnityUtil.loadedResolve = null;
            UnityUtil.loadingPromise = null;
            UnityUtil.loadingResolve = null;
            UnityUtil.loadedFlag = false;
            var params = {
                database: account,
                model: model
            };
            if (revision != "head") {
                params.revID = revision;
            }
            UnityUtil.onLoading();
            UnityUtil.toUnity("LoadModel", UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(params));
            return UnityUtil.onLoaded();
        };
        ;
        UnityUtil.removePin = function (id) {
            UnityUtil.toUnity("RemovePin", UnityUtil.LoadingState.MODEL_LOADING, id);
        };
        ;
        UnityUtil.reset = function () {
            UnityUtil.disableMeasuringTool();
            UnityUtil.disableClippingPlanes();
            UnityUtil.toUnity("ClearCanvas", UnityUtil.LoadingState.VIEWER_READY, undefined);
        };
        ;
        UnityUtil.resetCamera = function () {
            UnityUtil.toUnity("ResetCamera", UnityUtil.LoadingState.VIEWER_READY, undefined);
        };
        ;
        UnityUtil.requestScreenShot = function (promise) {
            UnityUtil.screenshotPromises.push(promise);
            UnityUtil.toUnity("RequestScreenShot", UnityUtil.LoadingState.VIEWER_READY, undefined);
        };
        ;
        UnityUtil.requestViewpoint = function (account, model, promise) {
            if (UnityUtil.vpPromise != null) {
                UnityUtil.vpPromise.then(UnityUtil._requestViewpoint(account, model, promise));
            }
            else {
                UnityUtil._requestViewpoint(account, model, promise);
            }
        };
        ;
        UnityUtil._requestViewpoint = function (account, model, promise) {
            var param = {};
            if (account && model) {
                param.namespace = account + "." + model;
            }
            UnityUtil.vpPromise = promise;
            UnityUtil.toUnity("RequestViewpoint", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
        };
        UnityUtil.setAPIHost = function (hostname) {
            UnityUtil.toUnity("SetAPIHost", UnityUtil.LoadingState.VIEWER_READY, JSON.stringify(hostname));
        };
        ;
        UnityUtil.setNavigation = function (navMode) {
            UnityUtil.toUnity("SetNavMode", UnityUtil.LoadingState.VIEWER_READY, navMode);
        };
        ;
        UnityUtil.setUnits = function (units) {
            UnityUtil.toUnity("SetUnits", UnityUtil.LoadingState.MODEL_LOADING, units);
        };
        ;
        UnityUtil.setViewpoint = function (pos, up, forward, lookAt, account, model) {
            var param = {};
            if (account && model) {
                param.nameSpace = account + "." + model;
            }
            param.position = pos;
            param.up = up;
            param.forward = forward;
            param.lookAt = lookAt;
            UnityUtil.toUnity("SetViewpoint", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
        };
        ;
        UnityUtil.toggleStats = function () {
            UnityUtil.toUnity("ShowStats", UnityUtil.LoadingState.VIEWER_READY, undefined);
        };
        ;
        UnityUtil.toggleVisibility = function (account, model, ids, visibility) {
            var param = {};
            if (account && model) {
                param.nameSpace = account + "." + model;
            }
            param.ids = ids;
            param.visible = visibility;
            UnityUtil.toUnity("ToggleVisibility", UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(param));
        };
        ;
        UnityUtil.updateClippingPlanes = function (clipPlane, requireBroadcast, account, model) {
            var param = {};
            param.clip = clipPlane;
            if (account && model) {
                param.nameSpace = account + "." + model;
            }
            param.requiresBroadcast = requireBroadcast;
            UnityUtil.toUnity("UpdateClip", UnityUtil.LoadingState.MODEL_LOADING, JSON.stringify(param));
        };
        ;
        UnityUtil.LoadingState = {
            VIEWER_READY: 1,
            MODEL_LOADING: 2,
            MODEL_LOADED: 3 //Models
        };
        UnityUtil.unityHasErrored = false;
        UnityUtil.screenshotPromises = [];
        UnityUtil.vpPromise = null;
        UnityUtil.objectStatusPromise = null;
        UnityUtil.loadedFlag = false;
        UnityUtil.UNITY_GAME_OBJECT = "WebGLInterface";
        return UnityUtil;
    }());
    exports.UnityUtil = UnityUtil;
});
