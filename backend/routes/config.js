"use strict";

    const express = require("express");
    const router = express.Router({mergeParams: true});
    const responseCodes = require("../response_codes.js");
    const C = require("../constants");
    const systemLogger = require("../logger.js").systemLogger;
    const serialize = require("serialize-javascript");
    const _ = require("lodash");
    const fs = require("fs");
    const addressMeta = require("../models/addressMeta");
    const units = require("../models/unit");
    const History = require("../models/history");
    const ModelHelper = require("../models/helper/model");
    const User = require("../models/user");
    const DEFAULT_PLUGIN_STRUCTURE = require("../plugin/plugin-structure.js").DEFAULT_PLUGIN_STRUCTURE;
    const path = require("path");
    
    const config = require("../config");
    
    /**
     * Get the pug files for the required state or plugin
     *
     * @param {string} required - Name of required plugin
     * @param {string} pathToStatesAndPlugins - Root path of plugins 
     * @param {Object} params - Updates with information from plugin structure 
     */
    function getPugFiles(required, pathToStatesAndPlugins, params) {
        let requiredFiles,
            requiredDir,
            fileSplit;
    
        requiredDir = pathToStatesAndPlugins + "/" + required + "/pug";
        try {
            fs.accessSync(requiredDir, fs.F_OK); // Throw for fail
    
            requiredFiles = fs.readdirSync(requiredDir);
            requiredFiles.forEach(function (file) {
                fileSplit = file.split(".");
                params.frontendPug.push({
                    id: fileSplit[0] + ".html",
                    path: requiredDir + "/" + file
                });
            });
        } catch (e) {
            // Pug files don"t exist
            systemLogger.logFatal(e.message);
        }
    }
    
    /**
     * Setup loading only the required states and plugins pug files
     *
     * @private
     * @param {string[]} statesAndPlugins - List of states and plugins to load 
     * @param {string} required - Plugin to load
     * @param {string} pathToStatesAndPlugins - Base directory to load plugins from
     * @param {Object} params - Updates with information from plugin structure
     */
    function setupRequiredPug(statesAndPlugins, required, pathToStatesAndPlugins, params) {
        let i, length;
    
        if (statesAndPlugins.indexOf(required.plugin) !== -1) {
            getPugFiles(required.plugin, pathToStatesAndPlugins, params);
    
            // Friends
            if (required.hasOwnProperty("friends")) {
                for (i = 0, length = required.friends.length; i < length; i++) {
                    if (statesAndPlugins.indexOf(required.friends[i]) !== -1) {
                        getPugFiles(required.friends[i], pathToStatesAndPlugins, params);
                    }
                }
            }
    
            // Functions
            if (required.hasOwnProperty("functions")) {
                for (i = 0, length = required.functions.length; i < length; i++) {
                    if (statesAndPlugins.indexOf(required.functions[i]) !== -1) {
                        getPugFiles(required.functions[i], pathToStatesAndPlugins, params);
                    }
                }
            }
    
            // Recurse for children
            if (required.hasOwnProperty("children")) {
                for (i = 0, length = required.children.length; i < length; i++) {
                    setupRequiredPug(statesAndPlugins, required.children[i], pathToStatesAndPlugins, params);
                }
            }
    
        }
    }
    
    /**
     * Get all available states and plugins
     *
     * @param {Object} params - updates with information from plugin structure
     */
    function setupPug(params, pluginStructure) {
    
        const pathToStatesAndPlugins = path.join(__dirname + "./../../frontend/components");
    
        // Get all available states and plugins in the file system
        const statesAndPlugins = fs.readdirSync(pathToStatesAndPlugins);
        setupRequiredPug(statesAndPlugins, pluginStructure, pathToStatesAndPlugins, params);
        
    }
    
    function createClientConfig(serverConfig, req) {
    
        // TODO: Replace with user based plugin selection
        let pluginStructure = {};
    
        // If the serverConfig has a plugin structure, use that
        // else just use the default
        if (serverConfig.pluginStructure) {
            pluginStructure = require("../../" + serverConfig.pluginStructure);
        } else {
            pluginStructure = DEFAULT_PLUGIN_STRUCTURE;
        }
    
        let clientConfig = {
            "maintenanceMode": config.maintenanceMode,
            "ui": {},
            "uistate": {},
            "structure": pluginStructure,
            "frontendPug": [],
            "gaTrackId": config.gaTrackId,
            "development" : config.development,
            "googleConversionId": config.googleConversionId,
            "userNotice" : config.userNotice,
            "unitySettings" : config.unitySettings,
            "customLogins" : config.customLogins
        };

        if (config.hasOwnProperty("captcha_client_key")) {
            clientConfig.captcha_client_key = config.captcha_client_key;
        }

        // Set up the legal plugins
        if (config.hasOwnProperty("legal")) {
            for (let i = 0; i < config.legal.length; i += 1) {
                pluginStructure.functions.push(config.legal[i].page);
            }
        }
        
        if (config.hasOwnProperty("captcha_client_key")) {
            clientConfig.captcha_client_key = config.captcha_client_key;
        }
    
        if (req) {
            clientConfig.userId = _.get(req, "session.user.username");
        }
    
        // Set up the legal plugins
        clientConfig.legalTemplates = [];
        if (config.hasOwnProperty("legal")) {
            clientConfig.legalTemplates = config.legal;
        }
    
        clientConfig.apiUrls = config.apiUrls;
    
        clientConfig.C = {
            GET_API : C.GET_API,
            POST_API : C.POST_API,
            MAP_API : C.MAP_API
        };
    
        if (config.chat_server) {
            clientConfig.chatHost = config.chat_server.chat_host;
            clientConfig.chatPath = "/" + config.chat_server.subdirectory;
        }
    
        clientConfig.chatReconnectionAttempts = config.chat_reconnection_attempts;
    
        clientConfig.VERSION = config.version;
    
        if (serverConfig.backgroundImage) {
            clientConfig.backgroundImage = serverConfig.backgroundImage;
        }
    
        clientConfig.return_path = "/";
    
        clientConfig.auth =  config.auth;
    
        if(config.captcha && config.captcha.clientKey) {
            clientConfig.captcha_client_key = config.captcha.clientKey;
        }
    
        clientConfig.uploadSizeLimit = config.uploadSizeLimit;
        clientConfig.countries = addressMeta.countries;
        clientConfig.euCountriesCode = addressMeta.euCountriesCode;
        clientConfig.usStates = addressMeta.usStates;
        clientConfig.units = units;
        clientConfig.legal = config.legal;
        clientConfig.tagRegExp = History.tagRegExp;
        clientConfig.modelNameRegExp = ModelHelper.modelNameRegExp;
        clientConfig.fileNameRegExp = ModelHelper.fileNameRegExp;
        clientConfig.usernameRegExp = User.usernameRegExp;
        clientConfig.acceptedFormat = ModelHelper.acceptedFormat;
        clientConfig.login_check_interval = config.login_check_interval;
    
        clientConfig.responseCodes = _.each(responseCodes.codesMap);
    
        clientConfig.permissions = C.MODEL_PERM_OBJ;
    
        clientConfig.impliedPermission = C.IMPLIED_PERM;
    
        setupPug(clientConfig, pluginStructure);
        
        return clientConfig;
    }
    
    const clientConfig = createClientConfig(config);
    
    router.get("/version.json", function (req, res) {
        return res.json({"VERSION": clientConfig.VERSION });
    });
    
    router.get("/config.js", function (req, res) {
    
        // Only need to set the userId the rest is static
        clientConfig.userId = _.get(req, "session.user.username");
    
        // TODO: This used to be a long string concat, 
        // this is marginally better but still a complete hack. 
        // There is definitely a better way to do this
        const serializedConfig = serialize(clientConfig); 
    
        res.header("Content-Type", "text/javascript");
        res.render(path.resolve(__dirname, "./../../pug/config.pug"), {config: serializedConfig});
    });
    
    module.exports = router;
