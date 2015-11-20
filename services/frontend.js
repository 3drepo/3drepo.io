/**
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

var express = require('express');
var config = require('../js/core/config.js');
var bodyParser = require('body-parser');
var compress = require('compression');
var fs = require('fs');
var jade = require('jade');

var systemLogger = require('../js/core/logger.js').systemLogger;

var params = null; // TODO: Shouldn't use a global variable

// Credit goes to http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
function escapeHtml(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

module.exports.createApp = function(template)
{
	var app = express();

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(compress());

	app.set('views', './jade');
	app.set('view_engine', 'jade');
	app.locals.pretty = true;

	app.get('/public/plugins/base/config.js', function(req, res) {
		var params = {};

		if (config.api_server.use_location) {
			params['config_js'] = 'var server_config = {}; server_config.apiUrl = ' + config.api_server.location_url;
		} else {
			params['config_js'] = 'var server_config = {}; server_config.apiUrl = function(path) { return "' + config.api_server.url + '/" + path; };';
		}

		if("wayfinder" in config)
		{
			// TODO: Make a public section in config for vars to be revealed
			params['config_js'] += '\nserver_config.democompany = "' + config.wayfinder.democompany + '";';
			params['config_js'] += '\nserver_config.demoproject = "' + config.wayfinder.demoproject + '";';
		}

		params['config_js'] += '\nserver_config.chatHost    = "' + config.api_server.chat_host + '";';
		params['config_js'] += '\nserver_config.chatPath    = "' + config.api_server.chat_path + '";';

		params['config_js'] += '\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\n if(async) this.withCredentials = true;\nrealOpen.apply(this, arguments);\n};';

		res.header('Content-Type', 'text/javascript');
		res.render('config.jade', params);
	});

	app.use('/public', express.static(__dirname + '/../public'));

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
		"plugin" : "base",
		"children" : [
			{
				"plugin": "login",
				"children": [
					{
						"plugin": "account",
						"children": [
							{
								"plugin": "project",
								"friends": [
									"oculus", "navigation", "viewpoints", "viewing"
								],
								"children": [
									{
										"plugin": "inspect"
									},
									{
										"plugin": "revision",
										"friends" : [
											"panels", "tree", "viewpoints", "meta", "issues", "revisionselector", "clip", "walkthrough"
										],
										"children": [
											{
												"plugin": "sid",
												"children": [
													{
														"plugin": "inspect"
													},
													{
														"plugin": "view"
													}
												]
											},
											{
												"plugin": "view"
											}
										]
									},
									{
										"plugin": "view",
										"friends" : [
											"panels", "tree", "viewpoints", "meta", "issues", "revisionselector", "clip", "walkthrough"
										]
									},
                                    {
                                        plugin: "AM_home",
                                        children: [
                                            {
                                                plugin: "AM_panel"
                                            },
                                            {
                                                plugin: "AM_filter"
                                            },
                                            {
                                                plugin: "AM_tree"
                                            },
                                            {
                                                plugin: "AM_viewpoints"
                                            },
                                            {
                                                plugin: "AM_issues"
                                            },
                                            {
                                                plugin: "AM_clip"
                                            },
                                            {
                                                plugin: "AM_bottomButtons"
                                            }
                                        ]
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
        var cssFile = "";

		if (!(plugin in params["parentStateJSON"]))
			params["parentStateJSON"][plugin] = [];

		var stateTok = stateName.split(".");
		var parentState = stateTok.slice(0, -1).join('.');

		if (params["parentStateJSON"][plugin].indexOf(parentState) == -1)
			params["parentStateJSON"][plugin].push(parentState);

		// TODO: Check whether or not it doesn't exist
		var pluginConfig = {};
        if (plugin.indexOf("AM_") !== -1) {
            pluginConfig = JSON.parse(fs.readFileSync("./plugins/AM_/" + plugin.substring(3) + ".json", "utf8"));
        }
        else {
            pluginConfig = JSON.parse(fs.readFileSync("./plugins/" + plugin + ".json", "utf8"));
        }

		if (params["pluginLoaded"].indexOf(plugin) == -1)
		{
			systemLogger.logInfo('Loading plugin ' + plugin + ' ...');

			params["pluginAngular"][plugin]				= {};
			params["pluginAngular"][plugin]["plugin"]	= plugin;
			params["pluginAngular"][plugin]["files"]	= [];

			// Loop through the files to be loaded
			if ("files" in pluginConfig)
			{
				if("jade" in pluginConfig["files"])
				{
					var nJadeFiles = pluginConfig["files"]["jade"].length;

					for(var fileidx = 0; fileidx < nJadeFiles; fileidx++)
					{
						var jadeFile = pluginConfig["files"]["jade"][fileidx];
						params["pluginJade"].push(jadeFile);
					}
				}

				if ("js" in pluginConfig["files"])
				{
					var nJSFiles = pluginConfig["files"]["js"].length;

					for(var fileidx = 0; fileidx < nJSFiles; fileidx++)
					{
						var jsFile = '/public/plugins/' + pluginConfig["files"]["js"][fileidx];
						params["pluginJS"].push(jsFile);
					}
				}

				if ("angular" in pluginConfig["files"])
				{
					var nAngularFiles = pluginConfig["files"]["angular"].length;

					for(var fileidx = 0; fileidx < nAngularFiles; fileidx++)
					{
						var angularFile = '/public/plugins/' + pluginConfig["files"]["angular"][fileidx];
						params["pluginAngular"][plugin]["files"].push(angularFile);
					}
				}

				if ("ui" in pluginConfig["files"])
				{
					var nUIComponents = pluginConfig["files"]["ui"].length;

					for(var uiidx = 0; uiidx < nUIComponents; uiidx++)
					{
						var uicomp = pluginConfig["files"]["ui"][uiidx];

						if (!(uicomp["position"] in params["ui"]))
							params["ui"][uicomp["position"]] = [];

						params["ui"][uicomp["position"]].push(
							{
								"name" : uicomp["name"],
								"template" : './plugins/' + uicomp["template"]
							}
						);

					}
				}

                if ("css" in pluginConfig["files"])
                {
                    var nCSSFiles = pluginConfig["files"]["css"].length;
                    for (var fileidx = 0; fileidx < nCSSFiles; fileidx++)
                    {
                        cssFile = '/public/plugins/' + pluginConfig["files"]["css"][fileidx];
                        params["pluginCSS"].push(cssFile);
                    }
                }
			}

			params["pluginLoaded"].push(plugin);
		}

		if ("ui" in pluginConfig["files"])
		{
			var nUIComponents = pluginConfig["files"]["ui"].length;

			for(var uiidx = 0; uiidx < nUIComponents; uiidx++)
			{
				var uicomp = pluginConfig["files"]["ui"][uiidx];
				uistates.push(uicomp["name"]);
			}

			params["uistate"][stateName] = uistates.slice(0);
		}
	}

	function buildParams(currentLevel, levelNum, stateName, uistates, params)
	{
		var plugin = currentLevel["plugin"];
            AMPluguin = "";

		if (stateName)
			stateName += ".";

		var states = [];

		var pluginConfig = {};
        if (plugin.indexOf("AM_") !== -1) {
            pluginConfig = JSON.parse(fs.readFileSync("./plugins/AM_/" + plugin.substring(3) + ".json", "utf8"));
        }
        else {
            pluginConfig = JSON.parse(fs.readFileSync("./plugins/" + plugin + ".json", "utf8"));
        }

		if ("states" in pluginConfig)
		{
			states = pluginConfig["states"];
		} else {
			states = [plugin];
		}

		for(var stateidx = 0; stateidx < states.length; stateidx++)
		{
			loadPlugin(plugin, stateName + states[stateidx], uistates, params);

			if ("friends" in currentLevel)
			{
				for(var i = 0; i < currentLevel["friends"].length; i++)
				{
					plugin = currentLevel["friends"][i];
					loadPlugin(plugin, stateName + states[stateidx], uistates, params);
				}
			}

			if ("children" in currentLevel)
				for(var i = 0; i < currentLevel["children"].length; i++)
					buildParams(currentLevel["children"][i], levelNum + 1, stateName + states[stateidx], uistates.slice(0), params);
		}
	}

	app.get('*', function(req, res) {
		if (!params) // FIXME: Relies on global variable
		{
			params = {};

			params["jsfiles"] = "";
			params["cssfiles"] = "";

			params["jsfiles"] = config.external.js;
			params["cssfiles"] = config.external.css;

			// Generate the list of files to load for the plugins
			var hasChildren = true;
			var levelStructure = pluginStructure;

			params["pluginLoaded"]			= [];

			params["pluginJade"]			= [];
			params["pluginJS"]				= [];
			params["pluginAngular"]			= {};
			params["parentStateJSON"]		= {};
			//params["pluginLevelsJSON"]		= {};
			params["ui"]					= {};
			params["uistate"]				= {};
			//params["levelOrder"]			= {};
            params["pluginCSS"]			    = [];

			var parentState = "";
			buildParams(pluginStructure, 0, parentState, [], params);

			params["parentStateJSON"]	= JSON.stringify(params["parentStateJSON"]);
			//params["pluginLevelsJSON"]	= JSON.stringify(params["pluginLevelsJSON"]);
			params["uistate"]			= JSON.stringify(params["uistate"]);

			params["renderMe"] = jade.renderFile;

			params["structure"]			= JSON.stringify(pluginStructure);
		}

		res.render(template, params);
	});

	return app;
};
