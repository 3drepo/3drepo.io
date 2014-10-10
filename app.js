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

/*global require*/

var http = require("http");
var express = require('express');

var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
onError = log_iface.onError;

var db_interface = require('./js/core/db_interface.js');
var x3dom_encoder = require('./js/core/x3dom_encoder.js');
var auth = require('./js/core/auth.js');
var config = require('app-config').config;

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compress = require('compression');

var app = express();

app.set('view engine', 'jade');
app.set('views', './public');

//var favicon = require('serve-favicon');
//app.use(favicon(options.favicon));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(compress({
	threshold: 512
}));
app.use(methodOverride());

app.use(express.static('./public'));
app.locals.pretty = true;

var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
	var user = basicAuth(req);

	return authArray.some(function(entry) {
		if (!user || !(user.name = entry.user) || !(user.pass == entry.pass)) {
			res.set('WWW-Authenticate', 'Basic realm=Authorization Required.');
			return res.send(401);
		}
	});
};

app.get('/', auth, function(req, res, next) {
    res.end();
});

app.get('/3drepoio/:db_name', function(req, res, next) {
    console.log('Opening scene ' + req.param('db_name'));
    x3dom_encoder.render(db_interface, req.param('db_name'), 'xml', 'pbf', null, null, null, res, function(err) {
        onError(err);
    });
});

app.get('/3drepoio/src_bin/:db_name/:uuid/level:lvl.pbf', function(req, res, next) {
    x3dom_encoder.render(db_interface, req.param('db_name'), 'pbf', null, req.param('lvl'), req.param('uuid'), null, res, function(err) {
        onError(err);
    });
});

app.get('/3drepoio/:db_name/textures/:uuid.:format', function(req, res, next) {
    x3dom_encoder.get_texture(db_interface, req.param('db_name'), req.param('uuid'), res, function(err) {
        onError(err);
    });
});

app.get('/3drepoio/:db_name/:type/:uuid.bin', function(req, res, next) {
    x3dom_encoder.get_mesh_bin(db_interface, req.param('db_name'), req.param('uuid'), req.param('type'), res, function(err) {
        onError(err);
    });
});

app.get('/3drepoio/src_bin/:db_name/:uuid.:format/:texture?', function(req, res, next) {
    logger.log('debug', 'Requesting mesh ' + req.param('uuid') + ' ' + req.param('texture'));
    x3dom_encoder.render(db_interface, req.param('db_name'), req.param('format'), null, null, req.param('uuid'), req.param('texture'), res, function(err) {
        onError(err);
    });
});

http.createServer(app).listen(config.server.http_port, function() {
    logger.log('info', 'Application Started');
});

