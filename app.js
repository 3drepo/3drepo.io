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

var express = require('express'),
	app = express(),
	vhost = require('vhost'),
	path = require('path');

var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
onError = log_iface.onError;

var hostname = process.env.HOSTNAME;
var config = require('app-config').config;

app.use(vhost('api.' + hostname, require('./api.js').app));
app.use(vhost(hostname, require('./frontend.js').app));

var https = require("https");
var http = require('http');

if ('ssl' in config) {
    var ssl_options = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert)
    };

    var http_app = express();

    http_app.get('*', function(req, res) {
        res.redirect('https://' + req.headers.host + req.url);
    });

    http.createServer(http_app).listen(config.server.http_port, function() {
        logger.log('info', 'Starting HTTP service on port ' + config.server.http_port);
    });

    https.createServer(ssl_options, app).listen(config.server.https_port, function() {
        logger.log('info', 'Starting HTTPS service on port ' + config.server.https_port);
    });
} else {
    http.createServer(app).listen(config.server.http_port, function() {
        logger.log('info', 'Starting HTTP service on port ' + config.server.http_port);
    });
}


