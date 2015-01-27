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

var secret = 'secret';

var isImage = function(format)
{
	var format = format.toLowerCase();

	return (format == "jpg") || (format == "png") || (format == "gif") || (format == "bmp");
}

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

	this.checkAccess = function(req, res, next) {
		var account = req.params["account"];
		var project = req.params["project"];

		var format = req.params["format"].toLowerCase();

		if (account && project)
		{
			this.dbInterface.isPublicProject(account, project, function(err) {
				if(err && !req.session.user && !isImage(format))
				{
					logger.log('debug', 'Not a public project and no user information.');
					return res.sendStatus(401);
				} else {
					next();
				}
			});
		} else {
			logger.log('debug', 'No account and project specified.');
			return res.sendStatus(401);
		}
	};

	this.defaultFormat = ("format" in config.server) ? config.server.format : "html";

	this.dbInterface = require('./js/core/db_interface.js');

	this.transRouter = function(format, regex, res, params)
	{
		var account = ("account" in params) ? params["account"] : null;
		var project = ("project" in params) ? params["project"] : null;

		logger.log('debug',"ACCOUNT: " + account + " PROJECT: " + project + " REGEX: " + regex + " [" + format + "]");

		if (!format)
			format = this.defaultFormat;

		if(isImage(format))
		{
				// If there is no error then we have access
				if (!(format in this.getMap)) {
					res.sendStatus(415);
				} else if (!(regex in this.getMap[format])) {
					res.sendStatus(501);
				} else {
					this.getMap[format][regex](res, params);
				}
		} else {
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
				if(user)
				{
					req.session.regenerate(function(err) {
						if(err) return res.sendStatus(500);

						req.session.user = user;

						logger.log('debug', 'Authenticated ' + user.username + ' and signed token.')
						res.sendStatus(200);
					});
				} else {
					res.status(401).send('Invalid user');
				}
			}
		});
	});

	this.router.post('/logout', function(req, res) {
		req.session.destroy(function() {
			res.sendStatus(200);
		});
	});

	this.router.post('/:account', function(req, res) {
		this.dbInterface.getUserInfo( req.params["account"], function (err, user)
		{
			if (!user) // User currently doesn't exist so continue
			{
				res.sendStatus(501);
			} else {
				this.checkAccess(req, res, function(req, res, err) {
					if(err)
					{
						// Do no have access to the user
						res.sendStatus(403);
					} else {
						// Perform update of user
						res.sendStatus(501);
					}
				});
			}
		});
	});

	// Account information
	this.router.get('/search.:format?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];

		var params = {
			query: req.query
		};

		this.transRouter(format, '/search', res, params);
	});

	// Account information
	this.router.get('/:account.:format?.:subformat?', function(req, res, next) {
		var format = req.params["format"];

		var params = {
			subformat: req.params["subformat"],
			account: req.params["account"],
			query: req.query
		};

		this.transRouter(format, '/:account', res, params);
	});

	// Project information
	this.router.get('/:account/:project.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:	req.params["account"],
			project:	req.params["project"],
			subformat:	req.params["subformat"],
			user:		current_user,
			query:		req.query
		};

		this.transRouter(format, '/:account/:project', res, params);
	});

	// Project revision list
	this.router.get('/:account/:project/revisions.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var start = ("start" in req.query) ? req.query.start : 1;
		var end   = ("end" in req.query) ? req.query.end : (start + 5);
		var full  = ("full" in req.query) ? req.query.full : null;

		var params = {
			account:	req.params["account"],
			project:	req.params["project"],
			subformat:	req.params["subformat"],
			user:		current_user,
			start:		start,
			end:		end,
			full:		full,
			query:		req.query
		};

		this.transRouter(format, '/:account/:project/revisions', res, params);
	});

	// Revision list for a particular branch
	this.router.get('/:account/:project/revisions/:branch.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var start = ("start" in req.query) ? req.query.start : 1;
		var end   = ("end" in req.query) ? req.query.end : (start + 5);
		var full  = ("full" in req.query) ? req.query.full : null;

		var params = {
			account:	req.params["account"],
			project:	req.params["project"],
			branch:		req.params["branch"],
			subformat:	req.params["subformat"],
			user:		current_user,
			start:		start,
			end:		end,
			full:		full,
			query:		req.query
		};

		this.transRouter(format, '/:account/:project/revisions/:branch', res, params);
	});

	// Get README for branch's head revision
	this.router.get('/:account/:project/revision/:branch/head/readme.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account: req.params["account"],
			project: req.params["project"],
			branch:  req.params["branch"],
			user:	 current_user,
			query:	 req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch/head/readme', res, params);
	});

	// Get README for specific project revision
	this.router.get('/:account/:project/revision/:rid/readme.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account: req.params["account"],
			project: req.params["project"],
			rid:	 req.params["rid"],
			user:	 current_user,
			query:	 req.query
		};

		this.transRouter(format, '/:account/:project/revision/:rid/readme', res, params);
	});

	// Revision rid for master branch
	this.router.get('/:account/:project/revision/:rid.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:	req.params["account"],
			project:	req.params["project"],
			rid:		req.params["rid"],
			subformat:	req.params["subformat"],
			user:		current_user,
			query:		req.query
		};

		this.transRouter(format, '/:account/:project/revision/:rid', res, params);
	});

	// Get the head of a specific branch
	this.router.get('/:account/:project/revision/:branch/head.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:   req.params["account"],
			project:   req.params["project"],
			branch:    req.params["branch"],
			subformat: req.params["subformat"],
			user:	   current_user,
			query:	   req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch/head', res, params);
	});

	// Get specific object via shared_id sid
	this.router.get('/:account/:project/revision/:rid/:sid.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:	req.params["account"],
			roject:		req.params["project"],
			branch:		req.params["branch"],
			subformat:	req.params["subformat"],
			user:		current_user,
			query:		req.query
		}

		this.transRouter(format, '/:account/:project/revision/:rid/:sid', res, params);
	});

	// Get specific object via shared_id sid for particular branch
	this.router.get('/:account/:project/revision/:branch/head/:sid.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:	req.params["account"],
			project:	req.params["project"],
			branch:		req.params["branch"],
			subformat:	req.params["subformat"],
			user:		current_user,
			query:		req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch/head/:sid', res, params);
	});

	// Get list of revision in a branch
	this.router.get('/:account/:project/revision/:branch.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:   req.params["account"],
			project:   req.params["project"],
			subformat: req.params["subformat"],
			user:	   current_user,
			query:	   req.query
		};

		this.transRouter(format, '/:account/:project/revision/:branch', res, params);
	});

	// List branches for project
	this.router.get('/:account/:project/branches.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:   req.params["account"],
			project:   req.params["project"],
			subformat: req.params["subformat"],
			user:	   current_user,
			query:	   req.query
		};

		this.transRouter(format, '/:account/:project/branches', res, params);
	});

	// Get audit log for project
	this.router.get('/:account/:project/log.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account: req.params["account"],
			project: req.params["project"],
			user:	 current_user,
			query:	 req.query
		};

		this.transRouter(format, '/:account/:project/log', res, params);
	});

	// Get list of users for project
	this.router.get('/:account/:project/users.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account: req.params["account"],
			project: req.params["project"],
			user:	 current_user,
			query:	 req.query
		};

		this.transRouter(format, '/:account/:project/users', res, params);
	});

	// Get object with specific uid in a specific format
	this.router.get('/:account/:project/:uid.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"].toLowerCase();
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:   req.params["account"],
			project:   req.params["project"],
			subformat: req.params["subformat"],
			uid:	   req.params["uid"],
			user:	   current_user,
			query:	   req.query
		};

		logger.log('debug', 'Retrieving object ' + params.uid);

		this.transRouter(format, '/:account/:project/:uid', res, params);
	});

	// Get list of objects that match a specific type
	this.router.get('/:account/:project/:rid/:type.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:   req.params["account"],
			project:   req.params["project"],
			rid:	   req.params["rid"],
			type:	   req.params["type"],
			subformat: req.params["subformat"],
			user:	   current_user,
			query:	   req.query

		};

		this.transRouter(format, '/:account/:project/:rid/:type', res, params);
	});

	// Get subtree for sid in revision rid, with (optional) depth query string paramter
	this.router.get('/:account/:project/revision/:rid/tree/:sid.:format?.:subformat?', this.checkAccess, function(req, res, next) {
		var format = req.params["format"];
		var current_user = ("user" in req.session) ? req.session.user.username : "";

		var params = {
			account:	req.params["account"],
			project:	req.params["project"],
			rid:		req.params["rid"],
			subformat:	req.params["subformat"],
			sid:		req.params["sid"],
			user:		current_user,
			query:		req.query
		};

		if ("depth" in req.query)
			params.depth = req.query.depth;

		this.transRouter(format, '/:account/:project/revision/:rid/tree/:sid', res, params);
	});

	// Get audit log for account
	this.router.get('/:account/log', this.checkAccess, function(req, res, next) {
		var params = {
			account: req.params["account"],
			query:	 req.query
		};

		this.transRouter(format, '/:account/log', res, params);
	});

	// Everything else
	this.router.get('*', function(req, res) {
		logger.log('debug', 'Unsupported request ' + req.url);
		res.sendStatus(501);
	});

	return this;
}
