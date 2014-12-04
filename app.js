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

var https = require("https");
var fs = require('fs');
var express = require('express');

var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
onError = log_iface.onError;

var dbInterface = require('./js/core/db_interface.js');
var config = require('app-config').config;

var log = require('./js/core/login.js');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compress = require('compression');

var app = express();

app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;

var mongoose = require('mongoose');
var connect_url = 'mongodb://' + config.db.username + ":" + config.db.password + '@' + config.db.host + ':' + config.db.port;

mongoose.connect(connect_url);

var passport = require('passport');
var expressSession = require('express-session');

var flash = require('connect-flash');
app.use(flash());

app.use(expressSession({ secret: 'secretKey',
    saveUninitialized: true,
    resave: true,
	cookie: "secure"
}));
app.use(passport.initialize());
app.use(passport.session());
log(passport);

//var favicon = require('serve-favicon');
//app.use(favicon(options.favicon));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(compress({
    threshold: 512
}));
app.use(methodOverride());

var routes = require('./routes.js')(passport);
app.use('/', routes.router);

// Attach the encoders to the router
var x3dom_encoder = require('./js/core/encoders/x3dom_encoder.js').route(routes);
var json_encoder = require('./js/core/encoders/json_encoder.js').route(routes);
var html_encoder = require('./js/core/encoders/html_encoder.js').route(routes);
var src_encoder = require('./js/core/encoders/src_encoder.js').route(routes);
var jpg_encoder = require('./js/core/encoders/jpeg_encoder.js').route(routes);

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

