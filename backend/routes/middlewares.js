var dbInterface = require("../db_interface.js");
//var _ = require('lodash');
var responseCodes = require('../response_codes');
var C               = require("../constants");


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

var middlewares = {

	hasReadAccessToProject: function(req, res, next){
		checkAccess(req, res, next, _hasReadAccessToProject);
	},

	hasWriteAccessToProject: function(req, res, next){
		checkAccess(req, res, next, _hasWriteAccessToProject);
	}
};

module.exports = middlewares;
