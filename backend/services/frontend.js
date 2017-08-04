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

(() => {
	"use strict";

	/**
	 * Creates frontend API Express app 
	 * 
	 * @param {Object} serverConfig - Config for server instance
	 * @returns
	 */
	module.exports.createApp = function (serverConfig) {

		const express = require("express");
		const config = require("../config.js");
		//const sharedSession = serverConfig.session;
		const bodyParser = require("body-parser");
		const compress = require("compression");
		const fs = require("fs");
		const pug = require("pug");
		const addressMeta = require("../models/addressMeta");
		const units = require("../models/unit");
		const favicon = require("serve-favicon");
		const History = require("../models/history");
		const ModelHelper = require("../models/helper/model");
		const User = require("../models/user");
		const systemLogger = require("../logger.js").systemLogger;
		const responseCodes = require("../response_codes.js");
		const _ = require('lodash');
		const C = require('../constants');
		const path = require('path');

		let app = express();

		//app.use(sharedSession);
		app.use(compress({ level: 9 }));

		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());

		app.set("views", "./pug");
		app.set("view_engine", "pug");
		app.locals.pretty = true;

		app.use(favicon("./public/images/favicon.ico"));

		let objectToString = function(obj) {
			let objString = "{";

			for(let prop in obj)
			{
				// to avoid jshint to complain
				if(obj.hasOwnProperty(prop)){
					let aProperty       = obj[prop];
					
					objString += "\"" + prop + "\":"; 
					if (typeof aProperty === "object")
					{
						objString += objectToString(aProperty);
					} else {
						objString += "" + aProperty; 
					} 

					objString += ",";
				}
			}

			objString += "}";

			return objString;
		};

		app.get("/public/plugins/base/config.js", function (req, res) {
			let params = {};

			params.config_js = "var server_config = {};\n";

			params.config_js += "server_config.api_algorithm = (function () {'use strict'; var self = " + objectToString(config.apiAlgorithm) + "; return self; })();";

			params.config_js += "server_config.apiUrls = server_config.api_algorithm.apiUrls;\n";
			params.config_js += "server_config.apiUrl = server_config.api_algorithm.apiUrl.bind(server_config.api_algorithm);\n";

			params.config_js += "server_config.GET_API =  \"" + C.GET_API + "\";\n";
			params.config_js += "server_config.POST_API = (\"" + C.POST_API + "\" in server_config.apiUrls) ? \"" + C.POST_API + "\" : server_config.GET_API;\n";
			params.config_js += "server_config.MAP_API = (\"" + C.MAP_API + "\" in server_config.apiUrls) ? \"" + C.MAP_API + "\" : server_config.GET_API;\n";

			if ("wayfinder" in config) {
				// TODO: Make a public section in config for vars to be revealed
				params.config_js += "\nserver_config.democompany = '" + config.wayfinder.democompany + "';";
				params.config_js += "\nserver_config.demoproject = '" + config.wayfinder.demoproject + "';";
			}

			if (config.chat_server) {
				params.config_js += "\nserver_config.chatHost	= '" + config.chat_server.chat_host + "';";
				params.config_js += "\nserver_config.chatPath	= '" + '/' + config.chat_server.subdirectory + "';";
			}

			params.config_js += "\nserver_config.chatReconnectionAttempts = " + config.chat_reconnection_attempts + ";";

			params.config_js += "\nserver_config.apiVersion = '" + config.version + "';";

			if (serverConfig.backgroundImage) {
				params.config_js += "\nserver_config.backgroundImage = '" + serverConfig.backgroundImage + "'";
			}

			params.config_js += "\nwindow.hostAlias = {};\n";
			params.config_js += "\nwindow.hostAlias[\"3drepo_api\"] = function(path) { return server_config.apiUrl(server_config.GET_API, path); }\n";

			params.config_js += "\nserver_config.return_path = '/';";
			params.config_js += "\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\n if(async) this.withCredentials = true;\nrealOpen.apply(this, arguments);\n};";
			params.config_js += "\n\nserver_config.auth = " + JSON.stringify(config.auth) + ";";
			params.config_js += "\n\nserver_config.captcha_client_key = '" + config.captcha.clientKey + "';";
			params.config_js += "\n\nserver_config.uploadSizeLimit = " + config.uploadSizeLimit + ";";
			params.config_js += "\n\nserver_config.countries = " + JSON.stringify(addressMeta.countries) + ";";
			params.config_js += "\n\nserver_config.euCountriesCode = " + JSON.stringify(addressMeta.euCountriesCode) + ";";
			params.config_js += "\n\nserver_config.usStates = " + JSON.stringify(addressMeta.usStates) + ";";
			params.config_js += "\n\nserver_config.units = " + JSON.stringify(units) + ";";
			params.config_js += "\n\nserver_config.legal = " + JSON.stringify(config.legal) + ";";
			params.config_js += "\n\nserver_config.tagRegExp = " + History.tagRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.modelNameRegExp = " + ModelHelper.modelNameRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.fileNameRegExp = " + ModelHelper.fileNameRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.usernameRegExp = " + User.usernameRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.acceptedFormat = " + JSON.stringify(ModelHelper.acceptedFormat) + ";";
			params.config_js += "\n\nserver_config.login_check_interval = " + config.login_check_interval + ";";

			params.config_js += '\n\nserver_config.responseCodes = ' +  JSON.stringify(_.each(responseCodes.codesMap)) + ";";
			params.config_js += '\n\nserver_config.permissions = ' +  JSON.stringify({
				'PERM_DELETE_MODEL': C.PERM_DELETE_MODEL,
				'PERM_CHANGE_MODEL_SETTINGS': C.PERM_CHANGE_MODEL_SETTINGS,
				'PERM_ASSIGN_LICENCE': C.PERM_ASSIGN_LICENCE,
				'PERM_UPLOAD_FILES': C.PERM_UPLOAD_FILES,
				'PERM_CREATE_ISSUE': C.PERM_CREATE_ISSUE,
				'PERM_COMMENT_ISSUE': C.PERM_COMMENT_ISSUE,
				'PERM_VIEW_ISSUE': C.PERM_VIEW_ISSUE,
				'PERM_DOWNLOAD_MODEL': C.PERM_DOWNLOAD_MODEL,
				'PERM_VIEW_MODEL': C.PERM_VIEW_MODEL,
				'PERM_CREATE_MODEL': C.PERM_CREATE_MODEL,
				'PERM_EDIT_FEDERATION': C.PERM_EDIT_FEDERATION
			}) + ";";

			params.config_js += '\n\nserver_config.impliedPermission = ' + JSON.stringify(C.IMPLIED_PERM) + ';';

			res.header("Content-Type", "text/javascript");
			res.render("config.pug", params);
		});

		const publicDir = __dirname + "/../../public";
		app.use("/public", express.static(publicDir));
		app.get("/public/*", function (req, res) {
			res.status(404).send('File not found');
		});
		
		// TODO: This is a horrible hack, we should move to a static file server :/
		app.get("/manifest.json", function (req, res) {
			res.sendFile(path.resolve(publicDir + "/manifest.json"));
		});

		app.get("/precache.json", function (req, res) {
			res.sendFile(path.resolve(publicDir + "/service-workers/precache.js"));
		});

		let DEFAULT_PLUGIN_STRUCTURE = {
			"plugin": "home",
			"friends": [
				"login"
			],
			"functions": [
				"register-request",
				"register-verify",
				"password-forgot",
				"password-change",
				"pricing",
				"sign-up",
				"contact",
				"payment",
				"billing"
			],
			"children": [{
				"plugin": "account",
				"url": ":account",
				"children": [{
					"plugin": "model",
					"url": "/:model/:revision",
					"params": {
						"revision": {
							value: null,
							squash: true
						},
						"noSet":{
							value: false
						}
					},
					"children":[{
						"plugin": "issue",
						"url": "/issues/:issue"
					}],
					"friends": [
						"panel",
						"filter",
						"tree",
						"viewpoints",
						"issues",
						"clip",
						"bottom-buttons",
						"docs",
						"utils",
						"groups",
						"measure",
						"right-panel",
						"building",
						"revisions"
					]
				}]
			}]
		};

		// Set up the legal plugins
		if (config.hasOwnProperty("legal")) {
			for (let i = 0; i < config.legal.length; i += 1) {
				DEFAULT_PLUGIN_STRUCTURE.functions.push(config.legal[i].page);
			}
		}

		// TODO: Replace with user based plugin selection
		let pluginStructure = {};

		if (serverConfig.pluginStructure) {
			pluginStructure = require("../../" + serverConfig.pluginStructure);
		} else {
			pluginStructure = DEFAULT_PLUGIN_STRUCTURE;
		}

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
				// Pug files don't exist
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
					for (i = 0, length = required.friends.length; i < length; i += 1) {
						if (statesAndPlugins.indexOf(required.friends[i]) !== -1) {
							getPugFiles(required.friends[i], pathToStatesAndPlugins, params);
						}
					}
				}

				// Functions
				if (required.hasOwnProperty("functions")) {
					for (i = 0, length = required.functions.length; i < length; i += 1) {
						if (statesAndPlugins.indexOf(required.functions[i]) !== -1) {
							getPugFiles(required.functions[i], pathToStatesAndPlugins, params);
						}
					}
				}

				// Recurse for children
				if (required.hasOwnProperty("children")) {
					for (i = 0, length = required.children.length; i < length; i += 1) {
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
		function setupPug(params) {
			let pathToStatesAndPlugins = "./frontend/components",
				statesAndPlugins;

			// Get all available states and plugins in the file system
			statesAndPlugins = fs.readdirSync(pathToStatesAndPlugins);
			setupRequiredPug(statesAndPlugins, pluginStructure, pathToStatesAndPlugins, params);
		}

		app.get("*", function (req, res) {
			// Generate the list of files to load for the plugins
			
			let params = {
				"pluginLoaded": [],
				"pluginPug": [],
				"pluginJS": [],
				"pluginAngular": {},
				"parentStateJSON": {},
				"ui": {},
				"uistate": {},
				"pluginCSS": [],
				"renderMe": pug.renderFile,
				"structure": JSON.stringify(pluginStructure),
				"frontendPug": [],
				"gaTrackId": config.gaTrackId,
				"development" : config.development,
				"googleConversionId": config.googleConversionId,
				"userId": _.get(req, 'session.user.username')
			};

			params.parentStateJSON = JSON.stringify(params.parentStateJSON);
			params.uistate = JSON.stringify(params.uistate);

			// Set up the legal plugins
			params.legalTemplates = [];
			if (config.hasOwnProperty("legal")) {
				params.legalTemplates = config.legal;
			}

			setupPug(params);
			res.render(serverConfig.template, params);
		});

		return app;
	};
})();
