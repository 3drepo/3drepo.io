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
 *	GNU Affero General Public License for more de::tails.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var config       = require("app-config").config;
var log_iface    = require("./js/core/logger.js");
var systemLogger = log_iface.systemLogger;
var imgEncoder   = require("./js/core/encoders/img_encoder.js");

var responseCodes = require("./js/core/response_codes.js");
var _ = require("underscore");
var dbInterface = require("./js/core/db_interface.js");

var C = require("./js/core/constants");

/***************************************************************************
*  @file Contains the GET routes
****************************************************************************/

var repoGetHandler = function(router, checkAccess){
	"use strict";

	var self = this instanceof repoGetHandler ? this : Object.create(repoGetHandler.prototype);

	self.router = router;

	self.checkAccess = checkAccess; // Store access checking function

	// Checks whether or not the user is logged in.
	self.getInternal("/login", {}, function(req, res, next) {
		if (!req.session.user) {
			responseCodes.respond("/login GET", req, res, next, responseCodes.NOT_LOGGED_IN, {});
		} else {
			responseCodes.respond("/login GET", req, res, next, responseCodes.OK, {username: req.session.user.username});
		}
	});

	// TODO: Move these two functions to the JSON encoder
	self.getInternal("/:account/:project/wayfinder.:format", {}, function(req, res, next) {
		// If there has been an error where checking access skip this middleware
		if (req.accessError.value)
		{
			return next();
		}

		var responsePlace = "/:account/:project/wayfinder GET";

		if (!("user" in req.session)) {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.USERNAME_NOT_SPECIFIED, {});
		} else {
			dbInterface(req[C.REQ_REPO].logger).getWayfinderInfo(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], null, function(err, docs) {
				responseCodes.onError(responsePlace, req, res, next, err, docs);
			});
		}
	});

	self.getInternal("/:account/:project/wayfinder/record.:format", {}, function(req, res, next) {
		// If there has been an error where checking access skip this middleware
		if (req.accessError.value)
		{
			return next();
		}

		var responsePlace = "/:account/:project/wayfinder/record GET";

		if (!("user" in req.session)) {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.USERNAME_NOT_SPECIFIED, {});
		} else {
			var uids = JSON.parse(req.query.uid);

			dbInterface(req[C.REQ_REPO].logger).getWayfinderInfo(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], uids, function(err, docs) {
				responseCodes.onError(responsePlace, req, res, next, err, docs);
			});
		}
	});

    self.getInternal("/:account/:project/:index/walkthrough.:format?", {}, function(req, res, next) {
        var responsePlace = "/:account/:project/walkthrough GET";

        if (!("user" in req.session)) {
            responseCodes.respond(responsePlace, req, res, next, responseCodes.USERNAME_NOT_SPECIFIED, {});
        }
        else {
            dbInterface(req[C.REQ_REPO].logger).getWalkthroughInfo(req.params.account, req.params.project, req.params.index, function(err, docs) {
                responseCodes.onError(responsePlace, req, res, next, err, docs);
            });
        }
    });

	// Account information
	self.getInternal("/search.:format");
	self.getInternal("/:account.:format.:subformat?");

	// Project information
	self.getInternal("/:account/:project.:format.:subformat?");

	// Project revision list
	self.getInternal("/:account/:project/revisions.:format.:subformat?",
		{
			"start"  : 1,
			"number" : 5,
			"full"   : null
		});

	self.getInternal("/:account/:project/revisions/:branch.:format.:subformat?",
		{
			"start"  : 1,
			"number" : 5,
			"full"   : null
		});

	// Get map from object id to path in tree for multipart
	self.getInternal("/:account/:project/revision/:branch/head/fulltree.:format");
	self.getInternal("/:account/:project/revision/:rid/fulltree.:format.:subformat?");

	// Get subtree for head revision for a branch, with (optional) depth query string parameter
	self.getInternal("/:account/:project/revision/:branch/head/tree/:sid.:format.:subformat?");

	// Get README for branch"s head revision
	self.getInternal("/:account/:project/revision/:branch/head/readme.:format.:subformat?");

	// Get README for branch"s head revision
	self.getInternal("/:account/:project/revision/:branch/head/readme.:format.:subformat?");

	// Get README for specific project revision
	self.getInternal("/:account/:project/revision/:rid/readme.:format.:subformat?");

	// Revision rid for master branch
	self.getInternal("/:account/:project/revision/:rid.:format.:subformat?");

	// Get the head of a specific branch
	self.getInternal("/:account/:project/revision/:branch/head.:format.:subformat?");

	// Map from SIDs to UIDs
	self.getInternal("/:account/:project/revision/:rid/map.:format");
	self.getInternal("/:account/:project/revision/:branch/head/map.:format");

	// Get specific object via shared_id sid
	self.getInternal("/:account/:project/revision/:rid/:sid.:format.:subformat?");

	// Get specific object via shared_id sid for particular branch
	self.getInternal("/:account/:project/revision/:branch/head/:sid.:format.:subformat?");

	// Get list of revision in a branch
	self.getInternal("/:account/:project/revision/:branch.:format.:subformat?");

	// List branches for project
	self.getInternal("/:account/:project/branches.:format.:subformat?");

	// Get audit log for project
	self.getInternal("/:account/:project/log.:format.:subformat?");

	// Get list of users for project
	self.getInternal("/:account/:project/users.:format.:subformat?");

	// Get object with specific uid in a specific format
	self.getInternal("/:account/:project/meta/:uid.:format.:subformat?");
	self.getInternal("/:account/:project/issue/:uid.:format");
	self.getInternal("/:account/:project/issues/:sid.:format");
	self.getInternal("/:account/:project/issues.:format");

	// Get map from object id to path in tree for multipart
	self.getInternal("/:account/:project/revision/:branch/head/tree/multimap.:format.:subformat?");
	self.getInternal("/:account/:project/revision/:rid/tree/multimap.:format.:subformat?");

	// Get subtree for sid in revision rid, with (optional) depth query string parameter
	self.getInternal("/:account/:project/revision/:rid/tree/:sid.:format.:subformat?");
	self.getInternal("/:account/:project/revision/:rid/diff/:otherrid.:format.:subformat?");
	self.getInternal("/:account/:project/revision/:rid/meta/:sid.:format");
	self.getInternal("/:account/:project/revision/:branch/head/meta/:sid.:format");

	// Get audit log for account
	self.getInternal("/:account/log.:format");

	// Get object with specific uid in a specific format
	self.getInternal("/:account/:project/:uid.:format.:subformat?");

	// Get list of objects that match a specific type
	self.getInternal("/:account/:project/:rid/:type.:format.:subformat?");

	// Everything else
	/*
	self.router.get("*", function(req, res, next) {
		req[C.REQ_REPO].logger.logDebug("Unsupported request " + req.url);
		res.sendStatus(501);
		next();
	});
	*/

	self.getMap = {};

	self.default_format = config.default_format ? config.default_format : "html";

	return self;
};


repoGetHandler.prototype.getInternal = function(regex, queryDefaults, customCallback) {
	"use strict";

	if (queryDefaults === undefined)
	{
		queryDefaults = {};
	}

	var self = this;

	if (customCallback === undefined)
	{
		self.router.get(regex, this.checkAccess, function(req, res, next) {
			// Have we already processed this request
			if (req[C.REQ_REPO].processed) {
				return next();
			} else {
				req[C.REQ_REPO].processed = true;
			}

			req[C.REQ_REPO].logger.logInfo("Matched REGEX " + regex);

			var current_user = (req.session.hasOwnProperty(C.REPO_SESSION_USER)) ? req.session.user.username : "";
			var format = req.params[C.REPO_REST_API_FORMAT];

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

			regex = regex.replace(".:format", "");
			regex = regex.replace(".:subformat?", "");

			self.transRouter(format, regex, req, res, next, params);
		});
	} else {
		self.router.get(regex, this.checkAccess, function(req, res, next) {
			if (req[C.REQ_REPO].processed) {
				next();
			} else {
				req[C.REQ_REPO].processed = true;
				customCallback(req, res, next);
			}
		});
	}
};

repoGetHandler.prototype.transRouter = function(format, regex, req, res, next, params)
{
	"use strict";

	var account = params.hasOwnProperty(C.REPO_REST_API_ACCOUNT) ? params[C.REPO_REST_API_ACCOUNT] : null;
	var project = params.hasOwnProperty(C.REPO_REST_API_PROJECT) ? params[C.REPO_REST_API_PROJECT] : null;

	if (!format) {
		format = this.default_format;
	}

    format = format.toLowerCase();

	var responsePlace = regex + "." + format;

	var self = this;

	if(imgEncoder.isImage(format))
	{
			// If there is no error then we have access
			if (!(format in self.getMap)) {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.FORMAT_NOT_SUPPORTED, {params: params});
			} else if (!(regex in self.getMap[format])) {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.FUNCTION_NOT_SUPPORTED, {params: params});
			} else {
				self.getMap[format][regex](req, res, params, function(err, data) {
					responseCodes.onError(responsePlace, req, res, next, err, data, {params: params});
				});
			}
	} else {
		if (account && project) {
			// If there is no error then we have access
			if (!(format in self.getMap)) {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.FORMAT_NOT_SUPPORTED, {params: params});
			} else if (!(regex in self.getMap[format])) {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.FUNCTION_NOT_SUPPORTED, {params: params});
			} else {
				self.getMap[format][regex](req, res, params, function(err, data) {
					responseCodes.onError(responsePlace, req, res, next, err, data, {params: params});
				});
			}
		} else {
			// If there is no error then we have access
			if (!(format in self.getMap)) {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.FORMAT_NOT_SUPPORTED, {params: params});
			} else if (!(regex in self.getMap[format])) {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.FUNCTION_NOT_SUPPORTED, {params: params});
			} else {
				self.getMap[format][regex](req, res, params, function(err, data) {
					responseCodes.onError(responsePlace, req, res, next, err, data, {params: params});
				});
			}
		}
	}
};

repoGetHandler.prototype.get = function (format, regex, callback)
{
	"use strict";

	if (!(this.getMap.hasOwnProperty(format)))
	{
		this.getMap[format] = {};
	}

	systemLogger.logDebug("Adding GET " + regex + " [" + format + "]");
	this.getMap[format][regex] = callback;
};

module.exports = repoGetHandler;
