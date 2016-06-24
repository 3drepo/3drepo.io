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

module.exports.createApp = function(serverConfig)
{
	"use strict";

	let express = require("express");
	let config = require("../config.js");
	let bodyParser = require("body-parser");
	let compress = require("compression");
	let fs = require("fs");
	let jade = require("jade");

	//let systemLogger = require("../logger.js").systemLogger;


	let app = express();

	app.use(compress({level:9}));

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());

	app.set("views", "./jade");
	app.set("view_engine", "jade");
	app.locals.pretty = true;

	app.get("/public/plugins/base/config.js", function(req, res) {
		let params = {};

		params.config_js = "var server_config = {};";

		params.config_js += "server_config.apiUrls = {";

		for (let k in config.apiUrls)
		{
			if (config.apiUrls.hasOwnProperty(k)) {
				params.config_js += "\"" + k + "\" : [";
				params.config_js += config.apiUrls[k].join(",");
				params.config_js += "],";
			}
		}

		params.config_js += "};\n";

		//var numApiUrlTypes = Object.keys(config.apiUrls).length;

		params.config_js += "server_config.apiUrlCounter = {";

		for (let k in config.apiUrls)
		{
			if (config.apiUrls.hasOwnProperty(k)) {
				params.config_js += "\"" + k + "\" : 0,";
			}
		}

		params.config_js += "};\n";

		params.config_js += `server_config.apiUrl = function(type, path) {
			var typeFunctions = server_config.apiUrls[type];
			var functionIndex = this.apiUrlCounter[type] % typeFunctions.length;

			this.apiUrlCounter[type] += 1;

			return this.apiUrls[type][functionIndex](path);
		};\n`;

		params.config_js += "server_config.GET_API =  \"all\"\n";
		params.config_js += "server_config.POST_API = (\"post\" in server_config.apiUrls) ? \"post\" : server_config.GET_API;\n";
		params.config_js += "server_config.MAP_API = (\"map\" in server_config.apiUrls) ? \"map\" : server_config.GET_API;\n";

		if("wayfinder" in config)
		{
			// TODO: Make a public section in config for vars to be revealed
			params.config_js += "\nserver_config.democompany = '" + config.wayfinder.democompany + "';";
			params.config_js += "\nserver_config.demoproject = '" + config.wayfinder.demoproject + "';";
		}

		params.config_js += "\nserver_config.chatHost	= '" + config.api_server.chat_host + "';";
		params.config_js += "\nserver_config.chatPath	= '" + config.api_server.chat_path + "';";
		params.config_js += "\nserver_config.apiVersion = '" + config.version + "';";

		if (serverConfig.backgroundImage)
		{
			params.config_js += "\nserver_config.backgroundImage = '" + serverConfig.backgroundImage + "'";
		}

		params.config_js += "\nwindow.hostAlias = {};\n";
		params.config_js += "\nwindow.hostAlias[\"3drepo_api\"] = function(path) { return server_config.apiUrl(server_config.GET_API, path); }\n";

		params.config_js += "\nserver_config.return_path = '/';";

		params.config_js += "\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\n if(async) this.withCredentials = true;\nrealOpen.apply(this, arguments);\n};";

		params.config_js += "\n\nserver_config.auth = " + JSON.stringify(config.auth) + ";";

		params.config_js += "\n\nserver_config.uploadSizeLimit = " + config.uploadSizeLimit + ";";

		res.header("Content-Type", "text/javascript");
		res.render("config.jade", params);
	});

	app.use("/public", express.static(__dirname + "/../../public"));

	var DEFAULT_PLUGIN_STRUCTURE = {
		"plugin" : "home",
		"friends" : [
			"login"
		],
		"functions" : [
			"registerRequest",
			"registerVerify",
			"passwordForgot",
			"passwordChange",
			"pricing",
			"signUp",
			"contact",
			"payment",
			"termsAndConditions",
			"privacy",
			"cookies"
		],
		"children" : [
		{
				"plugin": "account",
				"children": [
					{
						"plugin": "project",
						"friends" : [
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
							"building"
						]
					}
				]
			}
		]
	};

	// TODO: Replace with user based plugin selection
	var pluginStructure = {};

	if (serverConfig.pluginStructure)
	{
		pluginStructure = require("../../" + serverConfig.pluginStructure);
	} else {
		pluginStructure = DEFAULT_PLUGIN_STRUCTURE;
	}

	/**
	 * Get the jade files for the required state or plugin
	 *
	 * @param required
	 * @param pathToStatesAndPlugins
	 * @param params
	 */
	function getJadeFiles (required, pathToStatesAndPlugins, params) {
		var requiredFiles,
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
		}
	}

	/**
	 * Setup loading only the required states and plugins jade files
	 *
	 * @param statesAndPlugins
	 * @param required
	 * @param pathToStatesAndPlugins
	 * @param params
	 */
	function setupRequiredJade (statesAndPlugins, required, pathToStatesAndPlugins, params) {
		var i, length;

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
	 * @param params
	 */
	function setupJade (params) {
		var pathToStatesAndPlugins = "./frontend",
			statesAndPlugins;

		// Get all available states and plugins in the file system
		statesAndPlugins = fs.readdirSync(pathToStatesAndPlugins);

		setupRequiredJade(statesAndPlugins, pluginStructure, pathToStatesAndPlugins, params);
	}

	app.get("*", function(req, res) {
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

		params.parentStateJSON	= JSON.stringify(params.parentStateJSON);
		params.uistate = JSON.stringify(params.uistate);

		setupJade(params);
		res.render(serverConfig.template, params);
	});

	return app;
};
