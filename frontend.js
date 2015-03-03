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

		params['config_js'] = 'var server_config = {}; server_config.apiUrl = function(path) { return "//' +
			config.apiServer.url + '/" + path; };';

		// TODO: Make a public section in config for vars to be revealed
		params['config_js'] += '\nserver_config.democompany = "' + config.wayfinder.democompany + '";';
		params['config_js'] += '\nserver_config.demoproject = "' + config.wayfinder.demoproject + '";';

		params['config_js'] += '\n\nvar realOpen = XMLHttpRequest.prototype.open;\n\nXMLHttpRequest.prototype.open = function(method, url, async, unk1, unk2) {\nthis.withCredentials = true;\nrealOpen.apply(this, arguments);\n};';

		res.header('Content-Type', 'text/javascript');
		res.render('config.jade', params);
	});

	app.use('/public', express.static(__dirname + '/public'));

	app.get('*', function(req, res) {
		var params = {};

		Object.keys(config.external).forEach(function(key) {
			params[key] = config.external[key];
		});

		res.render(template, params);
	});

	return app;
};
