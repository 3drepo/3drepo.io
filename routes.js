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
var bCrypt = require('bcrypt-nodejs');
var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
var login = require('connect-ensure-login');
var db_interface = require('./js/core/db_interface.js');
var router = express.Router();
var x3dom_encoder = require('./js/core/x3dom_encoder.js');
var json_encoder = require('./js/core/json_encoder.js');
var interface = require('./js/core/interface.js');
var config = require('app-config').config;
var package_json = require('./package.json');

var isAuth = function(req, res, next) {
	logger.log('debug', 'Authenticated: ' + req.isAuthenticated());

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

module.exports = function(passport)
{
	router.use(express.static('./submodules'));
	router.use(express.static('./public'));

	// Login routes
	router.get('/', function(req, res) {
		
		var paramJson = {
			message: req.flash('message')
		};

		Object.keys(config.external).forEach(function(key) {
			paramJson[key] = config.external[key];
		});
		
		res.render('login', paramJson);
	});

	router.post('/login', passport.authenticate('login', {
		successReturnToOrRedirect: '/home',
		failureRedirect: '/',
		failureFlash: true
	}));

	router.get('/home', login.ensureLoggedIn('/login'), function(req, res, next) {
		interface.dblist(db_interface, res, function(err)
				{
					onError(err);
				});
		}
	);

	router.get('/demo', login.ensureLoggedIn('/login'), function(req, res, next) {
		res.redirect('/bid4free/Duplex_A_20110907');
	});

	/*
	   TODO: Fix change password
	router.get('/password', function(req, res) {
		res.render('password', {message: req.flash('message')});
	});

	router.post('/password', passport.authenticate('password', {
		successRedirect: '/3drepoio/sphere',
		failureRedirect: '/login',
		failureFlash: true
	}));
	*/

	router.get('/data/:db_name.:subformat.:format.:options?/:revision?', login.ensureLoggedIn('/login'), function(req, res, next) {
		logger.log('debug', 'Opening scene ' + req.param('db_name'));

		if (req.param('format') == 'x3d')
		{
			x3dom_encoder.render(db_interface, req.param('db_name'), req.param('format'), req.param('subformat'), null, req.param('revision'), null, null, res, function(err) {
				onError(err);
			});
		} else if (req.param('format') == 'json') {
			var uuid = null;

			if ("parent" in req.query)
				uuid = req.query["parent"];

			json_encoder.render(db_interface, req.param('db_name'), req.param('format'), req.param('subformat'), req.param('revision'), uuid, req.query["selected"], req.query["namespace"], res, function(err) {
				onError(err);
			});
		} else {
			res.json({message: 'Not implemented'});
		}
	});

	router.get('/data/src_bin/:db_name/:uuid/level:lvl.pbf', login.ensureLoggedIn('/login'), function(req, res, next) {
		x3dom_encoder.render(db_interface, req.param('db_name'), 'pbf', null, req.param('lvl'), null, req.param('uuid'), null, res, function(err) {
			onError(err);
		});
	});

	router.get('/data/:db_name/textures/:uuid.:format', login.ensureLoggedIn('/login'), function(req, res, next) {
		x3dom_encoder.get_texture(db_interface, req.param('db_name'), req.param('uuid'), res, function(err) {
			onError(err);
		});
	});

	router.get('/data/:db_name/:type/:uuid.bin', login.ensureLoggedIn('/login'), function(req, res, next) {
		x3dom_encoder.get_mesh_bin(db_interface, req.param('db_name'), req.param('uuid'), req.param('type'), res, function(err) {
			onError(err);
		});
	});

	router.get('/data/src_bin/:db_name/:uuid.:format/:texture?', login.ensureLoggedIn('/login'), function(req, res, next) {
		logger.log('debug', 'Requesting mesh ' + req.param('uuid') + ' ' + req.param('texture'));
		x3dom_encoder.render(db_interface, req.param('db_name'), req.param('format'), null, null, null, req.param('uuid'), req.param('texture'), res, function(err) {
			onError(err);
		});
	});

	router.get('/dblist', login.ensureLoggedIn('/login'), function(req, res, next) {
		db_interface.get_db_list(null, function(err, db_list) {
	        if (err) err_callback(err);
			
			db_list.sort(function(a,b) { return a['name'].localeCompare(b['name']); });

	        res.json(db_list);
    	});
	});

	router.get('/3drepoio/:db_name/:revision?', login.ensureLoggedIn('/login'), function(req, res, next) {
		logger.log('debug', 'Opening scene ' + req.param('db_name'));
		interface.index('index', req.param('db_name'), 'src', req.param('revision'), res, function(err)
		{
			onError(err);
		});
	});

	router.get('/bid4free/:db_name', login.ensureLoggedIn('/login'), function(req, res, next) {
		logger.log('debug', 'Opening scene ' + req.param('db_name'));

		interface.index('bid4free', req.param('db_name'), 'src', req.param('revision'), res, function(err)
		{
			onError(err);
		});
	});

	router.get('/prototype', login.ensureLoggedIn('/login'), function(req, res) {
		interface.proto(req, res, function(err)
		{
			onError(err);
		});
	});

	router.get('*', function(req, res) {
		logger.log('debug', 'Un-routed URL : ' + req.url);
		res.redirect('/');
	});

	return router;
}
