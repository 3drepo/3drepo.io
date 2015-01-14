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

var express = require('express');
var bCrypt = require('bcrypt-nodejs');
var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
//var login = require('connect-ensure-login');
var config = require('app-config').config;
var package_json = require('./package.json');

var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var login = {};

var secret = 'secret';

login.ensureLoggedIn = function() {
	console.log("Here");
	return expressJwt({secret:secret});
};

module.exports = function(){
	this.router = express.Router();
	this.getMap = {}

	this.get = function (format, regex, callback)
	{
		if (!(format in this.getMap))
		{
			this.getMap[format] = {};
		}

		logger.log('debug', 'Adding route ' + regex + ' [' + format + ']');
		this.getMap[format][regex] = callback;
	}

	this.defaultFormat = ("format" in config.server) ? config.server.format : "html";

	this.dbInterface = require('./js/core/db_interface.js');

	this.transRouter = function(format, regex, res, params)
	{
		var account = ("account" in params) ? params["account"] : null;
		var project = ("project" in params) ? params["project"] : null;

		logger.log('debug',"ACCOUNT: " + account + " PROJECT: " + project + " REGEX: " + regex + " [" + format + "]");

		if (!format)
			format = this.defaultFormat;

		dbInterface.hasAccessToProject(params.user, account, project, function(err)
		{
			if(err) throw onError(err);

			// If there is no error then we have access
			if (!(format in this.getMap)) {
				res.sendStatus(415);
			} else if (!(regex in this.getMap[format])) {
				res.sendStatus(501);
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

	this.router.post('/login', function(req, res) {
		this.dbInterface.authenticate(req.body.username, req.body.password, function(err, user)
		{
			if(err)
			{
				res.status(401).send('Incorrect usename or password');
			} else {
				var token = jwt.sign(user, secret, {expiresInMinutes: 60*5});

				logger.log('debug', 'Authenticated ' + user.username + ' and signed token.')
				res.json({ token: token });
			}
		});
	});

	// Account information
	this.router.get('/search.:format?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/search', res, params);
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
			account:	req.param("account"),
			project:	req.param("project"),
			subformat:	req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project', res, params);
	});

	// Project revision list
	this.router.get('/:account/:project/revisions.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:	req.param("account"),
			project:	req.param("project"),
			subformat:	req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revisions', res, params);
	});

	// Revision list for a particular branch
	this.router.get('/:account/:project/revisions/:branch.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:	req.param("account"),
			project:	req.param("project"),
			branch:		req.param("branch"),
			subformat:	req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revisions/:branch', res, params);
	});



	// Revision rid for master branch
	this.router.get('/:account/:project/revision/:rid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:	req.param("account"),
			project:	req.param("project"),
			rid:		req.param("rid"),
			subformat:	req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revision/:rid', res, params);
	});

	// Get the head of the master branch
	this.router.get('/:account/:project/revision/master/head.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:   req.param("account"),
			project:   req.param("project"),
			subformat: req.param("subformat"),
			user: req.user.username,
			query: req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch/head', res, params);
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
			account:	req.param("account"),
			project:	req.param("project"),
			branch:		req.param("branch"),
			subformat:	req.param("subformat"),
			user:		req.user.username,
			query:		req.query
		}

		this.transRouter(format, '/:account/:project/revision/:rid/:sid', res, params);
	});

	// Get specific object via shared_id sid for particular branch
	this.router.get('/:account/:project/revision/:branch/head/:sid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:	req.param("account"),
			project:	req.param("project"),
			branch:		req.param("branch"),
			subformat:	req.param("subformat"),
			user:		req.user.username,
			query:		req.query
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
			user:	   req.user.username,
			query:	   req.query
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
			user:	   req.user.username,
			query:	   req.query
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
			uid:	   req.param("uid"),
			user:	   req.user.username,
			query:	   req.query
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
			rid:	   req.param("rid"),
			type:	   req.param("type"),
			subformat: req.param("subformat"),
			user:	   req.user.username,
			query:	   req.query

		};

		this.transRouter(format, '/:account/:project/:rid/:type', res, params);
	});

	// Get subtree for sid in revision rid, with (optional) depth query string paramter
	this.router.get('/:account/:project/revision/:rid/tree/:sid.:format?.:subformat?', login.ensureLoggedIn(), function(req, res, next) {
		var format = req.param("format");

		var params = {
			account:	req.param("account"),
			project:	req.param("project"),
			rid:		req.param("rid"),
			subformat:	req.param("subformat"),
			sid:		req.param("sid"),
			user:		req.user.username,
			query:		req.query
		};

		if ("depth" in req.query)
			params.depth = req.query.depth;

		this.transRouter(format, '/:account/:project/revision/:rid/tree/:sid', res, params);
	});

	// Get audit log for account
	this.router.get('/:account/log', login.ensureLoggedIn(), function(req, res, next) {
		var params = {
			account: req.param("account"),
			user:	 req.user.username,
			query:	 req.query
		};

		this.transRouter(format, '/:account/log', res, params);
	});

	// Get audit log for project
	this.router.get('/:account/:project/log', login.ensureLoggedIn(), function(req, res, next) {
		var params = {
			account: req.params("account"),
			project: req.params("project"),
			user:	 req.user.username,
			query:	 req.query
		};

		this.transRouter(format, '/:account/:project/log', res, params);
	});

	// Everything else
	this.router.get('*', function(req, res) {
		logger.log('debug', 'Unsupported request ' + req.url);
		res.sendStatus(501);
	});

	return this;
}
