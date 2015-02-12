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
var app = express();
var routes = require('./routes.js')();
var config = require('./js/core/config.js');
var hostname = config.apiServer.hostname;

// Attach the encoders to the router
var x3dom_encoder = require('./js/core/encoders/x3dom_encoder.js').route(routes);
var json_encoder = require('./js/core/encoders/json_encoder.js').route(routes);
var html_encoder = require('./js/core/encoders/html_encoder.js').route(routes);
var src_encoder = require('./js/core/encoders/src_encoder.js').route(routes);
var img_encoder = require('./js/core/encoders/img_encoder.js').route(routes);
var bin_encoder = require('./js/core/encoders/bin_encoder.js').route(routes);

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	res.header('Access-Control-Allow-Credentials', true);
	//res.header('Cache-Control', 'public, max-age=3600');

	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.sendStatus(200);
	} else {
		next();
	}
}

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(compress());

app.use(allowCrossDomain);
app.use(cookieParser('Yet another secret'));
app.use(expressSession({
	secret: 'Very very secret, yes ?',
	resave: false,
	saveUninitialized: true,
	cookie: {
		domain: hostname,
		path: "/",
		httpOnly: false
	}
}));

app.use('/', routes.router);

exports.app = app
