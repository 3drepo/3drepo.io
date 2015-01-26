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
var config = require('app-config').config;

app.set('views', './views');
app.set('view_engine', 'jade');
app.locals.pretty = true;

app.use('/public', express.static(__dirname + '/public'));

app.get('*', function(req, res) {
	var params = {};

	Object.keys(config.external).forEach(function(key) {
		params[key] = config.external[key];
	});

	res.render('frontend.jade', params);
});

exports.app = app
