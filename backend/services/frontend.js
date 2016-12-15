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
		const bodyParser = require("body-parser");
		const compress = require("compression");
		const fs = require("fs");
		const jade = require("jade");
		const addressMeta = require("../models/addressMeta");
		const units = require("../models/unit");
		const favicon = require("serve-favicon");
		const History = require("../models/history");
		const ProjectHelper = require("../models/helper/project");
		const User = require("../models/user");
		const systemLogger = require("../logger.js").systemLogger;
		const responseCodes = require("../response_codes.js");
		const _ = require('lodash');
		const C = require('../constants');

		let app = express();

		app.use(compress({ level: 9 }));

		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());

		app.set("views", "./jade");
		app.set("view_engine", "jade");
		app.locals.pretty = true;

		app.use(favicon("public/images/favicon.ico"));

		app.get("/public/plugins/base/config.js", function (req, res) {
			let params = {};

			params.config_js = "var server_config = {};\n";

			params.config_js += "server_config.api_algorithm = {\n";

			
			for(let prop in config.apiAlgorithm) { 

				// not working for apiUrls = { all: [func1, ... ], ...} as func1,.. become string in the output
				if(prop === 'apiUrls'){
					continue;
				}

				params.config_js += "\t\"" + prop + "\":" + (typeof config.apiAlgorithm[prop] === 'function' ? config.apiAlgorithm[prop] : JSON.stringify(config.apiAlgorithm[prop])) + ",\n"; 
			}

			// fix for for apiUrls = { all: [func1, ... ], ...} as func1,.. become string in the output
			params.config_js += '\tapiUrls: {';
			for(let prop in config.apiAlgorithm.apiUrls) { 
				params.config_js += '\n\t\t' + prop + ': [' + config.apiAlgorithm.apiUrls[prop].toString() + ']';
			}
			params.config_js += '\n\t}\n';




			params.config_js += "};\n";

			params.config_js += "server_config.apiUrl = server_config.api_algorithm.apiUrl.bind(server_config.api_algorithm)" + ";\n" ;

			params.config_js += "server_config.GET_API =  \"" + C.GET_API + "\"\n";
			params.config_js += "server_config.POST_API = (\"" + C.POST_API + "\" in server_config.api_algorithm.apiUrls) ? \"" + C.POST_API + "\" : server_config.GET_API;\n";
			params.config_js += "server_config.MAP_API = (\"" + C.MAP_API + "\" in server_config.api_algorithm.apiUrls) ? \"" + C.MAP_API + "\" : server_config.GET_API;\n";

			if ("wayfinder" in config) {
				// TODO: Make a public section in config for vars to be revealed
				params.config_js += "\nserver_config.democompany = '" + config.wayfinder.democompany + "';";
				params.config_js += "\nserver_config.demoproject = '" + config.wayfinder.demoproject + "';";
			}

			if (config.chat_server) {
				params.config_js += "\nserver_config.chatHost	= '" + config.chat_server.chat_host + "';";
				params.config_js += "\nserver_config.chatPath	= '" + '/' + config.chat_server.subdirectory + "';";
			}

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
			params.config_js += "\n\nserver_config.usStates = " + JSON.stringify(addressMeta.usStates) + ";";
			params.config_js += "\n\nserver_config.units = " + JSON.stringify(units) + ";";
			params.config_js += "\n\nserver_config.legal = " + JSON.stringify(config.legal) + ";";
			params.config_js += "\n\nserver_config.tagRegExp = " + History.tagRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.projectNameRegExp = " + ProjectHelper.projectNameRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.fileNameRegExp = " + ProjectHelper.fileNameRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.usernameRegExp = " + User.usernameRegExp.toString() + ";";
			params.config_js += "\n\nserver_config.acceptedFormat = " + JSON.stringify(ProjectHelper.acceptedFormat) + ";";

			params.config_js += '\n\nserver_config.responseCodes = ' +  JSON.stringify(_.each(responseCodes.codesMap)) + ";";
			params.config_js += '\n\nserver_config.permissions = ' +  JSON.stringify({
				'PERM_DELETE_PROJECT': C.PERM_DELETE_PROJECT,
				'PERM_CHANGE_PROJECT_SETTINGS': C.PERM_CHANGE_PROJECT_SETTINGS,
				'PERM_ASSIGN_LICENCE': C.PERM_ASSIGN_LICENCE,
				'PERM_UPLOAD_FILES': C.PERM_UPLOAD_FILES,
				'PERM_CREATE_ISSUE': C.PERM_CREATE_ISSUE,
				'PERM_COMMENT_ISSUE': C.PERM_COMMENT_ISSUE,
				'PERM_VIEW_ISSUE': C.PERM_VIEW_ISSUE,
				'PERM_DOWNLOAD_PROJECT': C.PERM_DOWNLOAD_PROJECT,
				'PERM_VIEW_PROJECT': C.PERM_VIEW_PROJECT,
				'PERM_CREATE_PROJECT': C.PERM_CREATE_PROJECT,
				'PERM_EDIT_PROJECT': C.PERM_EDIT_PROJECT
			}) + ";";

			res.header("Content-Type", "text/javascript");
			res.render("config.jade", params);
		});

		app.use("/public", express.static(__dirname + "/../../public"));

		let DEFAULT_PLUGIN_STRUCTURE = {
			"plugin": "home",
			"friends": [
				"login"
			],
			"functions": [
				"registerRequest",
				"registerVerify",
				"passwordForgot",
				"passwordChange",
				"pricing",
				"signUp",
				"contact",
				"payment",
				"billing"
			],
			"children": [{
				"plugin": "account",
				"url": ":account",
				"children": [{
					"plugin": "project",
					"children": [
						{ "plugin": "revision" }
					],
					"friends": [
						"panel",
						"filter",
						"tree",
						"viewpoints",
						"issues",
						"clip",
						"bottomButtons",
						"qrCodeReader",
						"docs",
						"utils",
						"walkthroughVr",
						"oculus",
						"groups",
						"measure",
						"rightPanel",
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
		 * Get the jade files for the required state or plugin
		 *
		 * @param {string} required - Name of required plugin
		 * @param {string} pathToStatesAndPlugins - Root path of plugins 
		 * @param {Object} params - Updates with information from plugin structure 
		 */
		function getJadeFiles(required, pathToStatesAndPlugins, params) {
			let requiredFiles,
				requiredDir,
				fileSplit;

			requiredDir = pathToStatesAndPlugins + "/" + required + "/jade";
			try {
				fs.accessSync(requiredDir, fs.F_OK); // Throw for fail

				requiredFiles = fs.readdirSync(requiredDir);
				requiredFiles.forEach(function (file) {
					fileSplit = file.split(".");
					params.frontendJade.push({
						id: fileSplit[0] + ".html",
						path: requiredDir + "/" + file
					});
				});
			} catch (e) {
				// Jade files don't exist
				systemLogger.logFatal(e.message);
			}
		}

		/**
		 * Setup loading only the required states and plugins jade files
		 *
		 * @private
		 * @param {string[]} statesAndPlugins - List of states and plugins to load 
		 * @param {string} required - Plugin to load
		 * @param {string} pathToStatesAndPlugins - Base directory to load plugins from
		 * @param {Object} params - Updates with information from plugin structure
		 */
		function setupRequiredJade(statesAndPlugins, required, pathToStatesAndPlugins, params) {
			let i, length;

			if (statesAndPlugins.indexOf(required.plugin) !== -1) {
				getJadeFiles(required.plugin, pathToStatesAndPlugins, params);

				// Friends
				if (required.hasOwnProperty("friends")) {
					for (i = 0, length = required.friends.length; i < length; i += 1) {
						if (statesAndPlugins.indexOf(required.friends[i]) !== -1) {
							getJadeFiles(required.friends[i], pathToStatesAndPlugins, params);
						}
					}
				}

				// Functions
				if (required.hasOwnProperty("functions")) {
					for (i = 0, length = required.functions.length; i < length; i += 1) {
						if (statesAndPlugins.indexOf(required.functions[i]) !== -1) {
							getJadeFiles(required.functions[i], pathToStatesAndPlugins, params);
						}
					}
				}

				// Recurse for children
				if (required.hasOwnProperty("children")) {
					for (i = 0, length = required.children.length; i < length; i += 1) {
						setupRequiredJade(statesAndPlugins, required.children[i], pathToStatesAndPlugins, params);
					}
				}
			}
		}

		/**
		 * Get all available states and plugins
		 *
		 * @param {Object} params - updates with information from plugin structure
		 */
		function setupJade(params) {
			let pathToStatesAndPlugins = "./frontend",
				statesAndPlugins;

			// Get all available states and plugins in the file system
			statesAndPlugins = fs.readdirSync(pathToStatesAndPlugins);
			setupRequiredJade(statesAndPlugins, pluginStructure, pathToStatesAndPlugins, params);
		}

		app.get("*", function (req, res) {
			// Generate the list of files to load for the plugins
			let params = {
				"jsfiles": config.external.js,
				"cssfiles": config.external.css,
				"pluginLoaded": [],
				"pluginJade": [],
				"pluginJS": [],
				"pluginAngular": {},
				"parentStateJSON": {},
				"ui": {},
				"uistate": {},
				"pluginCSS": [],
				"renderMe": jade.renderFile,
				"structure": JSON.stringify(pluginStructure),
				"frontendJade": [],
				"gaTrackId": config.gaTrackId
			};

			params.parentStateJSON = JSON.stringify(params.parentStateJSON);
			params.uistate = JSON.stringify(params.uistate);

			// Set up the legal plugins
			params.legalTemplates = [];
			if (config.hasOwnProperty("legal")) {
				params.legalTemplates = config.legal;
			}

			setupJade(params);
			res.render(serverConfig.template, params);
		});

		return app;
	};
})();