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

module.exports.createApp = function(template)
{
	"use strict";

	let express = require("express");
	let config = require("../config.js");
	let bodyParser = require("body-parser");
	let compress = require("compression");
	let fs = require("fs");
	let jade = require("jade");

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

		if (config.api_server.use_location) {
			params.config_js = "var server_config = {}; server_config.apiUrl = " + config.api_server.location_url;
		} else {
			params.config_js = "var server_config = {}; server_config.apiUrl = function(path) { return '" + config.api_server.url + "/" + path + "'; };";
		}

		if("wayfinder" in config)
		{
			// TODO: Make a public section in config for vars to be revealed
			params.config_js += "\nserver_config.democompany = '" + config.wayfinder.democompany + "';";
			params.config_js += "\nserver_config.demoproject = '" + config.wayfinder.demoproject + "';";
		}


		params.config_js += "\nserver_config.backgroundImage = '" + config.backgroundImage + "';";
		params.config_js += "\nserver_config.chatHost	= '" + config.api_server.chat_host + "';";
		params.config_js += "\nserver_config.chatPath	= '" + config.api_server.chat_path + "';";
		params.config_js += "\nserver_config.apiVersion = '" + config.version + "';";

		params.config_js += "\nserver_config.return_path = '/';";

		params.config_js += "\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\n if(async) this.withCredentials = true;\nrealOpen.apply(this, arguments);\n};";

		res.header("Content-Type", "text/javascript");
		res.render("config.jade", params);
	});

	app.use("/public", express.static(__dirname + "/../../public"));

	// TODO: Replace with user based plugin selection
	var pluginStructure = {
		"plugin" : "home",
		"friends" : [
			"login"
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
							"oculus"
						],
						"children" : [
							{
								"plugin": "bid4free",
								children: [
									{
										plugin: "bid4freeWorkspace"
									}
								]
							}
						]
					}
				]
			}
		]
	};

	/**
	 * Get the jade files for the required state or plugin
	 *
	 * @param required
	 * @param pathToStatesAndPlugins
	 * @param params
	 */
	// function getJadeFiles (required, pathToStatesAndPlugins, params) {
	// 	var requiredFiles,
	// 		requiredDir,
	// 		fileSplit;

	// 	requiredDir = pathToStatesAndPlugins + "/" + required + "/jade";
	// 	try {
	// 		fs.accessSync(requiredDir, fs.F_OK); // Throw for fail

	// 		requiredFiles = fs.readdirSync(requiredDir);
	// 		requiredFiles.forEach(function (file) {
	// 			fileSplit = file.split(".");
	// 			params.frontendJade.push({
	// 				id: fileSplit[0] + ".html",
	// 				path: requiredDir + "/" + file
	// 			});
	// 		});
	// 	} catch (e) {
	// 		// Jade files don't exist
	// 	}
	// }

	/**
	 * Setup loading only the required states and plugins jade files
	 *
	 * @param statesAndPlugins
	 * @param required
	 * @param pathToStatesAndPlugins
	 * @param params
	 */
	// function setupRequiredJade (statesAndPlugins, required, pathToStatesAndPlugins, params) {
	// 	var i, length;

	// 	if (statesAndPlugins.indexOf(required.plugin) !== -1) {
	// 		getJadeFiles(required.plugin, pathToStatesAndPlugins, params);

	// 		// Friends
	// 		if (required.hasOwnProperty("friends")) {
	// 			for (i = 0, length = required.friends.length; i < length; i += 1) {
	// 				if (statesAndPlugins.indexOf(required.friends[i]) !== -1) {
	// 					getJadeFiles(required.friends[i], pathToStatesAndPlugins, params);
	// 				}
	// 			}
	// 		}

	// 		// Recurse for children
	// 		if (required.hasOwnProperty("children")) {
	// 			for (i = 0, length = required.children.length; i < length; i += 1) {
	// 				setupRequiredJade(statesAndPlugins, required.children[i], pathToStatesAndPlugins, params);
	// 			}
	// 		}
	// 	}
	// }

	/**
	 * Get all available states and plugins
	 *
	 * @param params
	 */
	// function setupJade (params) {
	// 	var pathToStatesAndPlugins = "./frontend",
	// 		statesAndPlugins;

	// 	// Get all available states and plugins in the file system
	// 	statesAndPlugins = fs.readdirSync(pathToStatesAndPlugins);

	// 	setupRequiredJade(statesAndPlugins, pluginStructure, pathToStatesAndPlugins, params);
	// }

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
			"frontendJade": []
		};

		params.parentStateJSON	= JSON.stringify(params.parentStateJSON);
		params.uistate = JSON.stringify(params.uistate);

		setupJade(params);
		console.log("frontendJade: ", params.frontendJade);

		res.render(template, params);
	});

	return app;
};
