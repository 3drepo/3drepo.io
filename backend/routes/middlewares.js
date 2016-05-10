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

var dbInterface = require("../db/db_interface.js");
var _ = require('lodash');
var responseCodes = require('../response_codes');
var C               = require("../constants");
var Bid = require('../models/bid');

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

function _hasWriteAccessToProject(req, account, project, callback)
{
	"use strict";

	var username = null;

	if (req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
		username = req.session[C.REPO_SESSION_USER].username;
	}

	dbInterface(req[C.REQ_REPO].logger).hasWriteAccessToProject(username, account, project, callback);
}

function _hasReadAccessToProject(req, account, project, callback)
{
	"use strict";

	var username = null;

	if (req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
		username = req.session[C.REPO_SESSION_USER].username;
	}
	
	dbInterface(req[C.REQ_REPO].logger).hasReadAccessToProject(username, account, project, callback);
}

function checkAccess(req, res, next, accessFunc) {
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
}

function canCreateProject(req, res, next){
	"use strict";
	
	if (req.params.account === req.session[C.REPO_SESSION_USER].username){
		next();
	} else {
		responseCodes.respond("Check account access", req, res, responseCodes.NOT_AUTHORIZED, null, req.params);
	}
}
	

var middlewares = {

	canCreateProject: canCreateProject,

	hasReadAccessToProject: function(req, res, next){
		checkAccess(req, res, next, _hasReadAccessToProject);
	},

	hasWriteAccessToProject: function(req, res, next){
		checkAccess(req, res, next, _hasWriteAccessToProject);
	},

    loggedIn: function(req, res, next){
        'use strict';

        if (!(req.session.hasOwnProperty(C.REPO_SESSION_USER))) {
            responseCodes.respond("Check logged in middleware", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
        } else {
            next();
        }
    },

	isMainContractor: function(req, res, next){
		middlewares.checkRole([C.REPO_ROLE_MAINCONTRACTOR], req).then(() => {
			next();
		}).catch(resCode => {
			responseCodes.respond("Middleware: check is main contractor", req, res, next, resCode, null, req.params);
		});
	},


	isSubContractorInvitedHelper: function(req){
		'use strict';

		let filter = {
			user: req.session[C.REPO_SESSION_USER].username
		};

		if (req.params.packageName){
			filter.packageName = req.params.packageName;
		}
		return Bid.count(getDbColOptions(req), filter).then(count => {
			if (count > 0) {
				return Promise.resolve();
			} else {
				return Promise.reject(responseCodes.AUTH_ERROR);
			}
		});
	},

	isSubContractorInvited: function(req, res, next){
		middlewares.isSubContractorInvitedHelper(req).then(()=>{
			next();
		}).catch(resCode => {
			responseCodes.respond("Middleware: check is sub contractor invited", req, res, next, resCode, null, req.params);
		});
	},

	checkRole: function(acceptedRoles, req){
		'use strict';
		var dbCol = getDbColOptions(req);
		return new Promise((resolve, reject) => {
			dbInterface(req[C.REQ_REPO].logger).getUserRoles(req.session[C.REPO_SESSION_USER].username, dbCol.account, function(err, roles){
				roles = _.filter(roles, item => {
					return acceptedRoles.indexOf(item.role) !== -1;
				});

				if(roles.length > 0){
					resolve(_.map(roles, 'role'));
				} else {
					reject(responseCodes.AUTH_ERROR);
				}

			});
		});

	},
};

module.exports = middlewares;
