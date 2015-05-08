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
var config = require('./js/core/config.js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compress = require('compression');
var fs = require('fs');
var jade = require('jade');

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

	app.set('views', './views');
	app.set('view_engine', 'jade');
	app.locals.pretty = true;

	app.get('/public/js/config.js', function(req, res) {
		var params = {};

		params['config_js'] = 'var server_config = {}; server_config.apiUrl = function(path) { return "' + config.apiServer.url + '/" + path; };';

		if("wayfinder" in config)
		{
			// TODO: Make a public section in config for vars to be revealed
			params['config_js'] += '\nserver_config.democompany = "' + config.wayfinder.democompany + '";';
			params['config_js'] += '\nserver_config.demoproject = "' + config.wayfinder.demoproject + '";';
		}

		params['config_js'] += '\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\n if(async) this.withCredentials = true;\nrealOpen.apply(this, arguments);\n};';

		res.header('Content-Type', 'text/javascript');
		res.render('config.jade', params);
	});

	app.use('/public', express.static(__dirname + '/public'));

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
												"plugin": "revisionView",
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
							{"plugin": "project"}
						]
					}
				]
			}
		]
	};

	function buildParams(currentLevel, levelNum, parentState, pluginJade, pluginJS, pluginAngular, parentStateJSON, pluginLevelsJSON, uiJSON)
	{
		var plugin = currentLevel["plugin"];

		pluginAngular[plugin]				= {};
		pluginAngular[plugin]["plugin"]		= plugin;
		parentStateJSON[plugin]				= parentState;
		pluginLevelsJSON[plugin]				= levelNum;
		pluginAngular[plugin]["files"]		= [];

		// TODO: Check whether or not it doesn't exist
		var pluginConfig = JSON.parse(fs.readFileSync("./config/plugins/" + plugin + ".json", "utf8"));

		// Loop through the files to be loaded
		if ("files" in pluginConfig)
		{
			if("jade" in pluginConfig["files"])
			{
				var nJadeFiles = pluginConfig["files"]["jade"].length;

				for(var fileidx = 0; fileidx < nJadeFiles; fileidx++)
				{
					var jadeFile = pluginConfig["files"]["jade"][fileidx];
					pluginJade.push(jadeFile);
				}
			}

			if ("js" in pluginConfig["files"])
			{
				var nJSFiles = pluginConfig["files"]["js"].length;

				for(var fileidx = 0; fileidx < nJSFiles; fileidx++)
				{
					var jsFile = '/public/js/' + pluginConfig["files"]["js"][fileidx];
					pluginJS.push(jsFile);
				}
			}

			if ("angular" in pluginConfig["files"])
			{
				var nAngularFiles = pluginConfig["files"]["angular"].length;

				for(var fileidx = 0; fileidx < nAngularFiles; fileidx++)
				{
					var angularFile = '/public/js/angularjs/' + pluginConfig["files"]["angular"][fileidx];
					pluginAngular[plugin]["files"].push(angularFile);
				}
			}

			if ("ui" in pluginConfig["files"])
			{
				var nUIComponents = pluginConfig["files"]["ui"].length;

				for(var uiidx = 0; uiidx < nUIComponents; uiidx++)
				{
					var uicomp = pluginConfig["files"]["ui"][uiidx];

					if (!(uicomp["position"] in uiJSON))
						uiJSON[uicomp["position"]] = [];

					uiJSON[uicomp["position"]].push(uicomp["template"]);
				}
			}

			if (parentState)
				parentState += ".";

			parentState += plugin;

			if ("children" in currentLevel)
				for(var i = 0; i < currentLevel["children"].length; i++)
					buildParams(currentLevel["children"][i], levelNum + 1, parentState, pluginJade, pluginJS, pluginAngular, parentStateJSON, pluginLevelsJSON, uiJSON);
		}
	}

	app.get('*', function(req, res) {
		var params = {};

		params["jsfiles"] = "";
		params["cssfiles"] = "";

		params["jsfiles"] = config.external.js;
		params["cssfiles"] = config.external.css;

		// Generate the list of files to load for the plugins
		var hasChildren = true;
		var levelStructure = pluginStructure;

		params["pluginJade"]		= [];
		params["pluginJS"]			= [];
		params["pluginAngular"]		= {};
		params["parentStateJSON"]		= {};
		params["pluginLevelsJSON"]		= {};
		params["ui"]					= {
			"header" : [],
			"right" : [],
			"left" : [],
			"viewport" : [],
			"tools" : []
		};
		var parentState = "";
		buildParams(pluginStructure, 0, parentState, params["pluginJade"], params["pluginJS"], params["pluginAngular"], params["parentStateJSON"], params["pluginLevelsJSON"], params["ui"]);

		params["parentStateJSON"] = JSON.stringify(params["parentStateJSON"]);
		params["pluginLevelsJSON"] = JSON.stringify(params["pluginLevelsJSON"]);

		params["renderMe"] = jade.renderFile;

		res.render(template, params);
	});

	return app;
};
