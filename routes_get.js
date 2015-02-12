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

var config = require('app-config').config;
var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
var imgEncoder = require('./js/core/encoders/img_encoder.js');

/***************************************************************************
*  @file Contains the GET routes
****************************************************************************/

module.exports = function(router, dbInterface, checkAccess){
	// Checks whether or not the user is logged in.
	router.get('/login', checkAccess, function(req, res) {
		res.sendStatus(200);
	});

	// Account information
	router.get('/search.:format?', checkAccess, function(req, res, next) {
		var format = req.params["format"];

		var params = {
			query: req.query
		};

		this.transRouter(format, '/search', res, params);
	});

	// Account information
	router.get('/:account.:format?.:subformat?', function(req, res, next) {
		var format = req.params["format"];

		var params = {
			subformat: req.params["subformat"],
			account: req.params["account"],
			query: req.query
		};

		this.transRouter(format, '/:account', res, params);
	});

	// Project information
	router.get('/:account/:project.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revisions.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revisions/:branch.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:branch/head/readme.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:rid/readme.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:rid.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:branch/head.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:rid/:sid.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:branch/head/:sid.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:branch.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/branches.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/log.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/users.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/:uid.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/:rid/:type.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/:project/revision/:rid/tree/:sid.:format?.:subformat?', checkAccess, function(req, res, next) {
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
	router.get('/:account/log', checkAccess, function(req, res, next) {
		var params = {
			account: req.params["account"],
			query:	 req.query
		};

		this.transRouter(format, '/:account/log', res, params);
	});

	// Everything else
	router.get('*', function(req, res) {
		logger.log('debug', 'Unsupported request ' + req.url);
		res.sendStatus(501);
	});

	router.get('/wayfinder.:format?', function(req, res) {
		if (!("user" in req.session)) {
			res.sendStatus(401);
		} else {
			this.dbInterface.getWayfinderInfo(config.wayfinder.democompany, config.wayfinder.demoproject, null, function(err, docs) {
				if (err) throw err;

				res.json(docs);
			});
		}
	});

	router.get('/wayfinder/record.:format?', function(req, res) {
		if (!("user" in req.session)) {
			res.sendStatus(401);
		} else {
			var uids = JSON.parse(req.query.uid);

			this.dbInterface.getWayfinderInfo(config.wayfinder.democompany, config.wayfinder.demoproject, uids, function(err, docs) {
				if (err) throw err;

				res.json(docs);
			});
		}
	});

	this.getMap = {}

	this.transRouter = function(format, regex, res, params)
	{
		var account = ("account" in params) ? params["account"] : null;
		var project = ("project" in params) ? params["project"] : null;

		logger.log('debug',"ACCOUNT: " + account + " PROJECT: " + project + " REGEX: " + regex + " [" + format + "]");

		if (!format)
			format = this.defaultFormat;

		if(imgEncoder.isImage(format))
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

	this.defaultFormat = ("format" in config.server) ? config.server.format : "html";

	this.get = function (format, regex, callback)
	{
		if (!(format in this.getMap))
		{
			this.getMap[format] = {};
		}

		logger.log('debug', 'Adding GET ' + regex + ' [' + format + ']');
		this.getMap[format][regex] = callback;
	}

	return this;
};


