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


// Credit goes to http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
// function escapeHtml(text) {
// 	'use strict';

// 	let map = {
// 		'&': '&amp;',
// 		'<': '&lt;',
// 		'>': '&gt;',
// 		'"': '&quot;',
// 		"'": '&#039;'
// 	};

// 	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
// }

module.exports.createApp = function(template)
{
	'use strict';

	let express = require('express');
	let config = require('../config.js');
	let bodyParser = require('body-parser');
	let compress = require('compression');
	let fs = require('fs');
	let jade = require('jade');

	let systemLogger = require('../logger.js').systemLogger;

	let app = express();
	let _ = require('lodash');

	app.use(compress({level:9}));

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());

	app.set('views', './jade');
	app.set('view_engine', 'jade');
	app.locals.pretty = true;

	app.get('/public/plugins/base/config.js', function(req, res) {
		let params = {};

		if (config.api_server.use_location) {
			params.config_js = 'var server_config = {}; server_config.apiUrl = ' + config.api_server.location_url;
		} else {
			params.config_js = 'var server_config = {}; server_config.apiUrl = function(path) { return "' + config.api_server.url + '/" + path; };';
		}

		if("wayfinder" in config)
		{
			// TODO: Make a public section in config for vars to be revealed
			params.config_js += '\nserver_config.democompany = "' + config.wayfinder.democompany + '";';
			params.config_js += '\nserver_config.demoproject = "' + config.wayfinder.demoproject + '";';
		}


		params.config_js += '\nserver_config.backgroundImage = "' + config.backgroundImage + '";';
		params.config_js += '\nserver_config.chatHost	= "' + config.api_server.chat_host + '";';
		params.config_js += '\nserver_config.chatPath	= "' + config.api_server.chat_path + '";';
		params.config_js += '\nserver_config.apiVersion = "' + config.version + '";';

		params.config_js += '\nserver_config.return_path = "/";';

		params.config_js += '\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\n if(async) this.withCredentials = true;\nrealOpen.apply(this, arguments);\n};';

		res.header('Content-Type', 'text/javascript');
		res.render('config.jade', params);
	});

	app.use('/public', express.static(__dirname + '/../../public'));

	// TODO: Replace with user based plugin selection
	/*
	var pluginStructure = {
		"plugins" : ["base"],
		"child" : {
			"plugins" : ["user"],
			"child" : {
				"plugins" : ["project"],
				"child" : { "plugins" : ["revision"],
							"child" : {
								"plugins": ["diff", "wayfinder"]
							}
						}
			}
		}
	};
	*/

	/*
	var pluginStructure = {
		"plugin" : "base",
		"children" : [
			{
				"plugin": "login",
				"children": [
					{
						"plugin": "account",
						"children" : [
							{
								"plugin": "accountView"
							},
							{
								"plugin": "project",
								"children": [
									{
										"plugin" : "revision",
										"children" : [
											{
												"plugin": "view",
												"friends": ["tree", "meta"],
												"children": [
													{
														"plugin": "diff"
													}
												]
											},
											{
												"plugin": "wayfinder"
											}
										]
									}
								]
							}
						]
					}
				]
		]
	};
	*/


	var pluginStructure = {
		"plugin" : "home",
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
							"oculus",
							"clip",
							"bottomButtons",
							"qrCodeReader",
							"docs",
							"utils",
							"walkthroughVr"
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

	function loadPlugin(plugin, stateName, uistates, params)
	{
		let cssFile = "";

		if (!(plugin in params.parentStateJSON)) {
			params.parentStateJSON[plugin] = [];
		}

		let stateTok = stateName.split(".");
		let parentState = stateTok.slice(0, -1).join('.');

		if (params.parentStateJSON[plugin].indexOf(parentState) === -1) {
			params.parentStateJSON[plugin].push(parentState);
		}

		// TODO: Check whether or not it doesn't exist
		let pluginConfig = {};
		pluginConfig = JSON.parse(fs.readFileSync("./plugins/" + plugin + ".json", "utf8"));

		if (params.pluginLoaded.indexOf(plugin) === -1)
		{
			systemLogger.logInfo('Loading plugin ' + plugin + ' ...');

			params.pluginAngular[plugin]				= {};
			params.pluginAngular[plugin].plugin	= plugin;
			params.pluginAngular[plugin].files	= [];

			// Loop through the files to be loaded

			if(_.get(pluginConfig, 'files.jade'))
			{
				let nJadeFiles = pluginConfig.files.jade.length;

				for(let fileidx = 0; fileidx < nJadeFiles; fileidx++)
				{
					let jadeFile = pluginConfig.files.jade[fileidx];
					params.pluginJade.push(jadeFile);
				}
			}

			if (_.get(pluginConfig, 'files.js'))
			{
				let nJSFiles = pluginConfig.files.js.length;

				for(let fileidx = 0; fileidx < nJSFiles; fileidx++)
				{
					let jsFile = '/public/plugins/' + pluginConfig.files.js[fileidx];
					params.pluginJS.push(jsFile);
				}
			}

			if (_.get(pluginConfig, 'files.angular'))
			{
				let nAngularFiles = pluginConfig.files.angular.length;

				for(let fileidx = 0; fileidx < nAngularFiles; fileidx++)
				{
					let angularFile = '/public/plugins/' + pluginConfig.files.angular[fileidx];
					params.pluginAngular[plugin].files.push(angularFile);
				}
			}

			if (_.get(pluginConfig, 'files.ui'))
			{
				let nUIComponents = pluginConfig.files.ui.length;

				for(let uiidx = 0; uiidx < nUIComponents; uiidx++)
				{
					let uicomp = pluginConfig.files.ui[uiidx];

					if (!(uicomp.position in params.ui)){
						params.ui[uicomp.position] = [];
					}

					params.ui[uicomp.position].push(
						{
							"name" : uicomp.name,
							"template" : './plugins/' + uicomp.template
						}
					);

				}
			}

			if (_.get(pluginConfig, 'files.css'))
			{
				let nCSSFiles = pluginConfig.files.css.length;
				for (let fileidx = 0; fileidx < nCSSFiles; fileidx++)
				{
					cssFile = '/public/plugins/' + pluginConfig.files.css[fileidx];
					params.pluginCSS.push(cssFile);
				}
			}


			params.pluginLoaded.push(plugin);
		}

		if ("ui" in pluginConfig.files)
		{
			let nUIComponents = pluginConfig.files.ui.length;

			for(let uiidx = 0; uiidx < nUIComponents; uiidx++)
			{
				let uicomp = pluginConfig.files.ui[uiidx];
				uistates.push(uicomp.name);
			}

			params.uistate[stateName] = uistates.slice(0);
		}
	}

	function buildParams(currentLevel, levelNum, stateName, uistates, params)
	{
		let plugin = currentLevel.plugin;

		if (stateName){
			stateName += ".";
		}

		let pluginConfig = JSON.parse(fs.readFileSync("./plugins/" + plugin + ".json", "utf8"));

		let states = pluginConfig.states || [plugin];

		for(let stateidx = 0; stateidx < states.length; stateidx++)
		{
			loadPlugin(plugin, stateName + states[stateidx], uistates, params);

			if ("friends" in currentLevel)
			{
				for(let i = 0; i < currentLevel.friends.length; i++)
				{
					plugin = currentLevel.friends[i];
					loadPlugin(plugin, stateName + states[stateidx], uistates, params);
				}
			}

			if ("children" in currentLevel){
				for(let i = 0; i < currentLevel.children.length; i++){
					buildParams(currentLevel.children[i], levelNum + 1, stateName + states[stateidx], uistates.slice(0), params);
				}
			}

		}

		return params;
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

	app.get('*', function(req, res) {

		// let hasChildren = true;
		// let levelStructure = pluginStructure;
		let parentState = "";


		// Generate the list of files to load for the plugins

		let params = buildParams(pluginStructure, 0, parentState, [], {

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
		});

		params.parentStateJSON	= JSON.stringify(params.parentStateJSON);
		//params["pluginLevelsJSON"]	= JSON.stringify(params["pluginLevelsJSON"]);
		params.uistate = JSON.stringify(params.uistate);

		//setupJade(params);
		//console.log("frontendJade: ", params.frontendJade);

		res.render(template, params);
	});

	return app;
};
