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

var responseCodes = require('./js/core/response_codes.js');
var _ = require('underscore');

/***************************************************************************
*  @file Contains the GET routes
****************************************************************************/

module.exports = function(router, dbInterface, checkAccess){
	// Checks whether or not the user is logged in.
	router.get('/login', checkAccess, function(req, res, next) {
		responseCodes.respond("/login GET", req, res, next, responseCodes.OK, {username: req.session.user.username});
	});

	this.get = function(regex, queryDefaults) {
		if (queryDefaults === undefined)
		{
			queryDefaults = {};
		}

		router.get(regex, checkAccess,
			function(req, res, next) {
				var current_user = ("user" in req.session) ? req.session.user.username : "";
				var format = req.params["format"];

				var params = _.clone(req.params);
				params.user  = current_user;

				if (req.query) {
					params.query = _.clone(req.query);
				} else {
					params.query = {};
				}

				for(var defValue in queryDefaults)
				{
					if(queryDefaults.hasOwnProperty(defValue))
					{
						if (!params.query.hasOwnProperty(defValue))
						{
							params.query[defValue] = queryDefaults[defValue];
						}
					}
				}

				regex = regex.replace(".:format?", "");
				regex = regex.replace(".:subformat?", "");

				this.transRouter(format, regex, res, req, next, params);
			}
		);
	};

	router.get('/:account/:project/wayfinder.:format?', function(req, res, next) {
		var resCode = responseCodes.OK;
		var responsePlace = "/:account/:project/wayfinder GET";
		var reqid = req.

		if (!("user" in req.session)) {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.USERNAME_NOT_SPECIFIED, {});
		} else {
			this.dbInterface.getWayfinderInfo(req.params["account"], req.params["project"], null, function(err, docs) {
				responseCodes.onError(responsePlace, req, res, next, err, docs);
			});
		}
	});

	router.get('/:account/:project/wayfinder/record.:format?', function(req, res, next) {
		var resCode = responseCodes.OK;
		var responsePlace = "/:account/:project/wayfinder/record GET";

		if (!("user" in req.session)) {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.USERNAME_NOT_SPECIFIED, {});
		} else {
			var uids = JSON.parse(req.query.uid);

			this.dbInterface.getWayfinderInfo(req.params["account"], req.params["project"], uids, function(err, docs) {
				responseCodes.onError(responsePlace, req, res, next, err, docs);
			});
		}
	});

	// Account information
	this.get('/search.:format?');
	this.get('/:account.:format?.:subformat?');

	// Project information
	this.get('/:account/:project.:format?.:subformat?');

	// Project revision list
	this.get('/:account/:project/revisions.:format?.:subformat?',
		{
			"start"  : 1,
			"number" : 5,
			"full"   : null
		});

	// Revision list for a particular branch
	this.get('/:account/:project/revisions/:branch.:format?.:subformat?',
		{
			"start"  : 1,
			"number" : 5,
			"full"   : null
		});

	// Get README for branch's head revision
	this.get('/:account/:project/revision/:branch/head/readme.:format?.:subformat?');

	// Get README for specific project revision
	this.get('/:account/:project/revision/:rid/readme.:format?.:subformat?');

	// Revision rid for master branch
	this.get('/:account/:project/revision/:rid.:format?.:subformat?');

	// Get the head of a specific branch
	this.get('/:account/:project/revision/:branch/head.:format?.:subformat?');

	// Map from SIDs to UIDs
	this.get('/:account/:project/revision/:rid/map.:format?');
	this.get('/:account/:project/revision/:branch/head/map.:format?');

	// Get specific object via shared_id sid
	this.get('/:account/:project/revision/:rid/:sid.:format?.:subformat?');

	// Get specific object via shared_id sid for particular branch
	this.get('/:account/:project/revision/:branch/head/:sid.:format?.:subformat?');

	// Get list of revision in a branch
	this.get('/:account/:project/revision/:branch.:format?.:subformat?');

	// List branches for project
	this.get('/:account/:project/branches.:format?.:subformat?');

	// Get audit log for project
	this.get('/:account/:project/log.:format?.:subformat?');

	// Get list of users for project
	this.get('/:account/:project/users.:format?.:subformat?');

	// Get object with specific uid in a specific format
	this.get('/:account/:project/meta/:uid.:format?.:subformat?');
	this.get('/:account/:project/issue/:uid.:format?');
	this.get('/:account/:project/issues.:format?');
	this.get('/:account/:project/issues/:sid.:format?');

	// Get subtree for head revision for a branch, with (optional) depth query string paramter
	this.get('/:account/:project/revision/:branch/head/tree/:sid.:format?.:subformat?');

	// Get subtree for sid in revision rid, with (optional) depth query string paramter
	this.get('/:account/:project/revision/:rid/tree/:sid.:format?.:subformat?');

	// Get map from object id to path in tree for multipart
	this.get('/:account/:project/revision/:branch/head/tree/multimap.:format?.:subformat?');

	// Get map from object id to path in tree for multipart
	this.get('/:account/:project/revision/:rid/tree/multimap.:format?.:subformat?');
	this.get('/:account/:project/revision/:rid/diff/:otherrid.:format?.:subformat?');
	this.get('/:account/:project/revision/:rid/meta/:sid.:format?');
	this.get('/:account/:project/revision/:branch/head/meta/:sid.:format?');

	// Get audit log for account
	this.get('/:account/log');

	// Get object with specific uid in a specific format
	this.get('/:account/:project/:uid.:format?.:subformat?');

	// Get list of objects that match a specific type
	this.get('/:account/:project/:rid/:type.:format?.:subformat?');

	// Everything else
	router.get('*', function(req, res) {
		logger.log('debug', 'Unsupported request ' + req.url);
		res.sendStatus(501);
	});

	this.getMap = {}

	this.transRouter = function(format, regex, res, req, next, params)
	{
		var account = ("account" in params) ? params["account"] : null;
		var project = ("project" in params) ? params["project"] : null;

		if (!format)
			format = this.default_format;

		var responsePlace = regex + "." + format;

		if(imgEncoder.isImage(format))
		{
				// If there is no error then we have access
				if (!(format in this.getMap)) {
					responseCodes.respond(responsePlace, req, res, next, responseCodes.FORMAT_NOT_SUPPORTED, {params: params});
				} else if (!(regex in this.getMap[format])) {
					responseCodes.respond(responsePlace, req, res, next, responseCodes.FUNCTION_NOT_SUPPORTED, {params: params});
				} else {
					this.getMap[format][regex](res, params, function(err, data) {
						responseCodes.onError(responsePlace, req, res, next, err, data, {params: params});
					});
				}
		} else {
			if (account && project) {
				dbInterface.hasReadAccessToProject(params.user, account, project, function(err)
				{
					if(err.value)
						responseCodes.respond(responsePlace, err, res, {params: params});
					else {
						// If there is no error then we have access
						if (!(format in this.getMap)) {
							responseCodes.respond(responsePlace, req, res, next, responseCodes.FORMAT_NOT_SUPPORTED, {params: params});
						} else if (!(regex in this.getMap[format])) {
							responseCodes.respond(responsePlace, req, res, next, responseCodes.FUNCTION_NOT_SUPPORTED, {params: params});
						} else {
							this.getMap[format][regex](res, params, function(err, data) {
								responseCodes.onError(responsePlace, req, res, next, err, data, {params: params});
							});
						}
					}
				});
			} else {
				// If there is no error then we have access
				if (!(format in this.getMap)) {
					responseCodes.respond(responsePlace, req, res, next, responseCodes.FORMAT_NOT_SUPPORTED, {params: params});
				} else if (!(regex in this.getMap[format])) {
					responseCodes.respond(responsePlace, req, res, next, responseCodes.FUNCTION_NOT_SUPPORTED, {params: params});
				} else {
					this.getMap[format][regex](res, params, function(err, data) {
						responseCodes.onError(responsePlace, req, res, next, err, data, {params: params});
					});
				}
			}
		}
	}

	this.default_format = config.default_format ? config.default_format : "html";

	this.get = function (format, regex, callback)
	{
		if (!(format in this.getMap))
		{
			this.getMap[format] = {};
		}

		logger.logDebug('Adding GET ' + regex + ' [' + format + ']');
		this.getMap[format][regex] = callback;
	}

	return this;
};


