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
		const DEFAULT_PLUGIN_STRUCTURE = require('../plugin/plugin-structure.js').DEFAULT_PLUGIN_STRUCTURE;
		const serialize = require('serialize-javascript');

		console.log(DEFAULT_PLUGIN_STRUCTURE)

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

		function createClientConfig(req) {

			let clientConfig = {
				"pluginLoaded": [],
				"pluginPug": [],
				"pluginJS": [],
				"pluginAngular": {},
				"parentStateJSON": {},
				"ui": {},
				"uistate": {},
				"pluginCSS": [],
				"renderMe": pug.renderFile,
				"structure": pluginStructure,
				"frontendPug": [],
				"gaTrackId": config.gaTrackId,
				"development" : config.development,
				"googleConversionId": config.googleConversionId
			};

			if (req) {
				clientConfig.userId = _.get(req, 'session.user.username');
			}

			// Set up the legal plugins
			clientConfig.legalTemplates = [];
			if (config.hasOwnProperty("legal")) {
				clientConfig.legalTemplates = config.legal;
			}


			// Set up the legal plugins
			// if (config.hasOwnProperty("legal")) {
			// 	for (let i = 0; i < config.legal.length; i += 1) {
			// 		DEFAULT_PLUGIN_STRUCTURE.functions.push(config.legal[i].page);
			// 	}
			// }


			//clientConfig.api_algorithm = config.apiAlgorithm;
			//clientConfig.apiUrls = clientConfig.api_algorithm.apiUrls;
			//clientConfig.apiUrl = clientConfig.api_algorithm.apiUrl; //.bind(clientConfig.api_algorithm);

			clientConfig.apiUrls = config.apiUrls;

			clientConfig.C = {
				GET_API : C.GET_API,
				POST_API : C.POST_API,
				MAP_API : C.MAP_API
			}

			// clientConfig.GET_API = C.GET_API;
			// clientConfig.POST_API = (C.POST_API in clientConfig.apiUrls) ? C.POST_API : clientConfig.GET_API;
			// clientConfig.MAP_API = (C.MAP_API  in clientConfig.apiUrls) ? C.MAP_API : clientConfig.GET_API;

			if ("wayfinder" in config) {
				// TODO: Make a public section in config for vars to be revealed
				clientConfig.democompany = config.wayfinder.democompany;
				clientConfig.demoproject = config.wayfinder.demoproject;
			}

			if (config.chat_server) {
				clientConfig.chatHost	= config.chat_server.chat_host;
				clientConfig.chatPath	= config.chat_server.subdirectory;
			}

			clientConfig.chatReconnectionAttempts = config.chat_reconnection_attempts;

			clientConfig.apiVersion = config.version;

			if (serverConfig.backgroundImage) {
				clientConfig.backgroundImage = serverConfig.backgroundImage;
			}

			clientConfig.return_path = '/';

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
			clientConfig.tagRegExp = History.tagRegExp.toString();
			clientConfig.modelNameRegExp = ModelHelper.modelNameRegExp.toString();
			clientConfig.fileNameRegExp = ModelHelper.fileNameRegExp.toString();
			clientConfig.usernameRegExp = User.usernameRegExp.toString();
			clientConfig.acceptedFormat = ModelHelper.acceptedFormat;
			clientConfig.login_check_interval = config.login_check_interval;

			clientConfig.responseCodes = _.each(responseCodes.codesMap);

			clientConfig.permissions = {
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
			};

			clientConfig.impliedPermission = C.IMPLIED_PERM;

			setupPug(clientConfig);
			
			return clientConfig
		}


		

		app.get("/config.js", function (req, res) {

			const clientConfig = createClientConfig(req);

			// TODO: This used to be a long string concat, 
			// this is marginally better but still a complete hack. 
			// There is definitely a better way to do this
			const serializedConfig = serialize(clientConfig); 

			res.header("Content-Type", "text/javascript");
			res.render("config.pug", {config: serializedConfig });
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

		app.get("/precache.js", function (req, res) {
			res.sendFile(path.resolve(publicDir + "/service-workers/precache.js"));
		});

		app.get("*", function (req, res) {
			// Generate the list of files to load for the plugins
			const clientConfig = createClientConfig(req);
			res.render(serverConfig.template, clientConfig);
		});

		return app;
	};
})();
