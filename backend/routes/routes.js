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

var log_iface  = require("../logger.js");
var express = require("express");
var responseCodes = require("../response_codes.js");
var dbInterface = require("../db/db_interface.js");


var C = require("../constants");


function hasReadAccessToProject(req, account, project, callback)
{
	"use strict";

	var username = null;

	if (req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
		username = req.session[C.REPO_SESSION_USER].username;
	}

	dbInterface(req[C.REQ_REPO].logger).hasReadAccessToProject(username, account, project, callback);
}

var repoRouter = function() {
	"use strict";

	var self = this instanceof repoRouter ? this : Object.create(repoRouter.prototype);
	self.router = express.Router();

	self.router.use(express.static("./public"));

	// Check the user has access
	// 1. First check whether or not this is a specific project.
	//	  Does the user have access to it ?
	// 2. If not, is the user logged in ?
	// 3. Otherwise, unauthorized
	self.checkAccess = function(accessFunc) {
		return function(req, res, next) {
			if (req[C.REQ_REPO].processed)
			{
				return next();
			}

			// Account and project they are trying to access
			var account = req.params[C.REPO_REST_API_ACCOUNT];
			var project = req.params[C.REPO_REST_API_PROJECT];

			var format  = null;  // In what format ?

			if (req.params[C.REPO_REST_API_FORMAT]) {
				format = req.params[C.REPO_REST_API_FORMAT].toLowerCase();
			}

			req.accessError = responseCodes.OK;

			if (account && project)
			{
				accessFunc(req, account, project, function(err) {
					if(err.value)
					{
						req[C.REQ_REPO].logger.logDebug(account + "/" + project + " is not public project and no user information.", req);
						req[C.REQ_REPO].processed = true;

						responseCodes.onError("Check project/account access", req, res, next, err, null, req.params);
					} else {
						next();
					}
				});
			} else {
				// No account and project specified, check user is logged in.
				if (!(req.session.hasOwnProperty(C.REPO_SESSION_USER))) {
					req[C.REQ_REPO].logger.logDebug("No account and project specified.");
					req[C.REQ_REPO].processed = true;

					responseCodes.onError("Check other access", req, res, next, responseCodes.NOT_AUTHORIZED, null, req.params);
				} else {
					if (!account || (account && req.session[C.REPO_SESSION_USER].username === account))
					{
						next();
					} else{
						req[C.REQ_REPO].processed = true;
						responseCodes.onError("Check account access", req, res, next, responseCodes.NOT_AUTHORIZED, null, req.params);
					}
			}
		}
		};
	};

	//self.router.use(log_iface.startRequest); // moved to api.js
	self.getHandler  = require("./routes_get")(self.router, self.checkAccess(hasReadAccessToProject));

	self.get  = function(format, regex, callback) {
		self.getHandler.get(format, regex, callback);
	};

	return self;
};

module.exports = repoRouter;
