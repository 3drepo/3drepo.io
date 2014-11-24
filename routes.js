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
var config = require('app-config').config;
var package_json = require('./package.json');

module.exports = function(passport){
	this.router = express.Router();
	this.getMap = {}

	this.get = function (format, regex, callback)
	{
		if (!(format in this.getMap))
		{
			this.getMap[format] = {};
		}

		this.getMap[format][regex] = callback;
	}

	this.defaultFormat = ("format" in config.server) ? config.server.format : "html";

	this.db_interface = require('./js/core/db_interface.js');

    this.transRouter = function(format, regex, res, params)
	{
		var account = params["account"];
		var project = params["project"];

		if (!format)
			format = this.defaultFormat;

		db_interface.hasAccessToDB(null, account, project, function(err)
		{
			if(err) throw onError(err);

			if (account != params.user)
			{
				res.status(403);
				res.redirect('/');
			} else if (!(format in this.getMap)) {
				res.status(416);
				res.redirect('/');
			} else if (!(regex in this.getMap[format])) {
				res.status(416);
				res.redirect('/');
			} else {
				this.getMap[format][regex](res, params);
			}
		});
	}

	this.router.use(express.static('./submodules'));
	this.router.use(express.static('./public'));

    this.router.use(function(req, res, next)
    {
		logger.log('debug', req.originalUrl)
		next();
    });

	// Login pages
	this.router.get('/login', function(req, res) {
		var paramJson = {
			message: req.flash('message')
		};

		Object.keys(config.external).forEach(function(key) {
			paramJson[key] = config.external[key];
		});

		res.render('login', paramJson);
	});

	this.router.post('/login', passport.authenticate('login', {
		successReturnToOrRedirect: '/home',
		failureRedirect: '/',
		failureFlash: true
	}));

    // Home simply points to the user's home page.
	this.router.get('/home', login.ensureLoggedIn('/login'), function(req, res, next) {
		var username = req.user.username;
		res.redirect('/' + username);
	});

	// Login routes
	this.router.get('/', function(req, res) {
		res.redirect('/login');
	});

	// Account information
	this.router.get('/:account.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			subformat: req.param("subformat"),
			account: req.param("account"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account', res, params);
	});

	// Project information
	this.router.get('/:account/:project.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
				account:    req.param("account"),
				project:    req.param("project"),
				subformat:  req.param("subformat"),
				user: req.user.username,
				query: req.query
		};

		this.transRouter(format, '/:account/:project', res, params);
	});

	// Project revision list
	this.router.get('/:account/:project/revisions.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:    req.param("account"),
			project:    req.param("project"),
			subformat:  req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revisions', res, params);
	});

	// Revision rid for master branch
	this.router.get('/:account/:project/revision/:rid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:    req.param("account"),
			project:    req.param("project"),
			rid:        req.param("rid"),
			subformat:  req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revision/:rid', res, params);
	});

	// Get the head of a specific branch
	this.router.get('/:account/:project/revision/:branch/head.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:   req.param("account"),
			project:   req.param("project"),
			branch:    req.param("branch"),
			subformat: req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch/head', res, params);
	});

	// Get specific object via shared_id sid
	this.router.get('/:account/:project/revision/:rid/:sid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:    req.param("account"),
			project:    req.param("project"),
			branch:     req.param("branch"),
			subformat:  req.param("subformat"),
			user:       req.user.username,
			query:      req.query
		}

		this.transRouter(format, '/:account/:project/revision/:rid/:sid', res, params);
	});

	// Get specific object via shared_id sid for particular branch
	this.router.get('/:account/:project/revision/:branch/head/:sid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:    req.param("account"),
			project:    req.param("project"),
			branch:     req.param("branch"),
			subformat:  req.param("subformat"),
			user:       req.user.username,
			query:      req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch/head/:sid', res, params);
	});

	// Get list of revision in a branch
	this.router.get('/:account/:project/revision/:branch.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:   req.param("account"),
			project:   req.param("project"),
			subformat: req.param("subformat"),
			user:      req.user.username,
			query:     req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch', res, params);
	});

	// List branches for project
	this.router.get('/:account/:project/branches.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:   req.param("account"),
			project:   req.param("project"),
			subformat: req.param("subformat"),
			user:      req.user.username,
			query:     req.query
		};

		this.transRouter(format, '/:account/:project/branches', res, params);
	});

	// Get object with specific uid in a specific format
	this.router.get('/:account/:project/:uid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:   req.param("account"),
			project:   req.param("project"),
			subformat: req.param("subformat"),
			uid:       req.param("uid"),
			user:      req.user.username,
			query:     req.query
		};

		logger.log('debug', 'Retrieving object ' + params.uid);

		this.transRouter(format, '/:account/:project/:uid', res, params);
	});

	// Get list of objects that match a specific type
	this.router.get('/:account/:project/:rid/:type.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:   req.param("account"),
			project:   req.param("project"),
			rid:       req.param("rid"),
			type:      req.param("type"),
			subformat: req.param("subformat"),
			user:      req.user.username,
			query:     req.query

		};

		this.transRouter(format, '/:account/:project/:rid/:type', res, params);
	});

	// Get subtree for sid in revision rid, with (optional) depth query string paramter
	this.router.get('/:account/:project/revision/:rid/tree/:sid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:    req.param("account"),
			project:    req.param("project"),
			rid:	    req.param("rid"),
			subformat:  req.param("subformat"),
			sid:        req.param("sid"),
			user:       req.user.username,
			query:      req.query
		};

		if ("depth" in req.query)
			params.depth = req.query.depth;

		this.transRouter(format, '/:account/:project/revision/:rid/tree/:sid', res, params);
	});

	// Get audit log for account
	this.router.get('/:account/log', login.ensureLoggedIn(), function(req, res, next) {
		var params = {
			account: req.param("account"),
			user:    req.user.username,
			query:   req.query
		};

		this.transRouter(format, '/:account/log', res, params);
	});

	// Get audit log for project
	this.router.get('/:account/:project/log', login.ensureLoggedIn(), function(req, res, next) {
		var params = {
			account: req.params("account"),
			project: req.params("project"),
			user:    req.user.username,
			query:   req.query
		};

		this.transRouter(format, '/:account/:project/log', res, params);
	});

	// Everything else
	this.router.get('*', function(req, res) {
		logger.log('debug', 'Un-routed URL : ' + req.url);
		res.redirect('/home');
	});

    return this;
}
