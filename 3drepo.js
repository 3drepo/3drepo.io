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

var express = require('express'),
	app = express(),
	vhost = require('vhost'),
	path = require('path'),
	cors = require('cors'),
	fs = require('fs'),
	constants = require('constants');

var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
onError = log_iface.onError;

var config = require('./js/core/config.js');

var apiApp = require('./api.js').app;
var https = require("https");
var http = require('http');

if ('ssl' in config) {
	var ssl_options = {
		key: fs.readFileSync(config.ssl.key, 'utf8'),
		cert: fs.readFileSync(config.ssl.cert, 'utf8'),
		ca: fs.readFileSync(config.ssl.ca, 'utf8'),
		ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256|ECDHE-ECDSA-AES256-SHA:!RC4:!aNULL',
		//ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PS:!SSLv3',
		honorCipherOrder: true,
		ecdhCurve: 'secp384r1',
		secureOptions: constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION|constants.SSL_OP_NO_SSLv2|constants.SSL_OP_NO_SSLv3
	};

	var http_app = express();

	http_app.get('*', function(req, res) {
		res.redirect('https://' + req.headers.host + req.url);
	});

	http.createServer(http_app).listen(config.servers[0].http_port, config.servers[0].hostname, function() {
		logger.log('info', 'Starting routing HTTP for ' + config.servers[0].hostname + ' service on port ' + config.servers[0].http_port);
	});
}

if (!config.vhost)
{
	if (!config.apiServer.external)
	{
		if ('ssl' in config)
			var apiServer = https.createServer(ssl_options, apiApp);
		else
			var apiServer = http.createServer(apiApp);
	}

	for(i in config.servers)
	{
		var frontApp = require('./frontend.js').createApp(config.servers[i].template);

		if ('ssl' in config)
			var frontServer = https.createServer(ssl_options, frontApp);
		else
			var frontServer = http.createServer(frontApp);

		var serverPort = config.servers[i].port;
		var serverHost = config.servers[i].hostname;

		console.log(serverPort);

		frontServer.listen(serverPort, serverHost, function() {
			logger.log('info', 'Starting web service on ' + serverHost + ' port ' + serverPort);
		});
	}

	if (!config.apiServer.external)
	{
		apiServer.listen(config.apiServer.port, config.apiServer.hostname, function() {
			logger.log('info', 'Starting API service on ' + config.apiServer.hostname + ' port ' + config.apiServer.port);
		});
	}

} else if (!config.crossOrigin) {
	var app = express();
	app.use("/" + config.apiServer.host_dir, apiApp);

	for(i in config.servers)
	{
		var frontApp = require('./frontend.js').createApp(config.servers[i].template);
		app.use("/", frontApp);
	}

	if ('ssl' in config)
		var server = https.createServer(ssl_options, app);
	else
		var server = http.createServer(app);

	server.listen(config.apiServer.port, config.apiServer.hostname, function() {
		logger.log('info', 'Starting API service on ' + config.apiServer.hostname + ' port ' + config.apiServer.port);
	});

} else {
	var vhostApp = express();

	if (!config.apiServer.external)
	{
		logger.log('info', 'Starting VHOST for ' + config.apiServer.hostname);
		vhostApp.use(vhost(config.apiServer.hostname, apiApp));
	}

	for(i in config.servers)
	{
		var frontApp = require('./frontend.js').createApp(config.servers[i].template);
		logger.log('info', 'Starting VHOST for ' + config.servers[i].hostname);
		vhostApp.use(vhost(config.servers[i].hostname, frontApp));

		if('ssl' in config)
			config.servers[i].port = config.servers[i].https_port;
		else
			config.servers[i].port = config.servers[i].http_port;
	}

	if ('ssl' in config)
	{
		var server = https.createServer(ssl_options, vhostApp);
	} else {
		var server = http.createServer(vhostApp);
	}

	server.listen(config.servers[0].port, function() {
		logger.log('info', 'Started VHOST server on ' + config.servers[0].port);
	});
}

