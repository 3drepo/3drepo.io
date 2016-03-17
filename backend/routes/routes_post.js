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

/***************************************************************************
*  @file Contains the POST routes
****************************************************************************/
(function() {
	"use strict";

	var schemaValidator = require("../db/db_schema.js")();
	var systemLogger    = require("../logger.js").systemLogger;
	var config = require("../config.js");
	var queue = require("../services/queue.js");
	var multer = require("multer");

	var dbInterface     = require("../db/db_interface.js");
	var responseCodes   = require("../response_codes.js");
	var C               = require("../constants");

	// function createSession(place, req, res, next, user)
	// {
	// 	req.session.regenerate(function(err) {
	// 		if(err) {
	// 			responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {account: user.username});
	// 		} else {
	// 			systemLogger.logDebug("Authenticated user and signed token.", req);

	// 			req.session[C.REPO_SESSION_USER] = user;

	// 			if (config.cookie.maxAge)
	// 			{
	// 				req.session.cookie.maxAge = config.cookie.maxAge;
	// 			}

	// 			responseCodes.respond(place, req, res, next, responseCodes.OK, {account: user.username, roles: user.roles});
	// 		}
	// 	});
	// }

	// function expireSession(req, res, next, callback) {
	// 	req.session.cookie.expires = new Date(0);
	// 	req.session.cookie.maxAge = 0;

	// 	return callback(req, res, next);
	// }

	// function destroySession(req, res, next, callback) {
	// 	req.session.destroy(function() {
	// 		req[C.REQ_REPO].logger.logDebug("User has logged out.", req);
	// 		res.clearCookie("connect.sid", { path: "/" + config.api_server.host_dir });

	// 		return callback(req, res, next);
	// 	});
	// }

	var repoPostHandler = function(router, checkAccess){
		var self = this instanceof repoPostHandler ? this : Object.create(repoPostHandler.prototype);
		self.postMap = [];

		self.post = function(regex, shouldCheckAccess, callback) {
			self.postMap.push({regex: regex, shouldCheckAccess: shouldCheckAccess, callback: callback});
		};

		// Log the user into the API
		// self.post("/login", false, function(req, res, next) {
		// 	var responsePlace = "Login POST";

		// 	dbInterface(req[C.REQ_REPO].logger).authenticate(req.body.username, req.body.password, function(err, user)
		// 	{
		// 		req[C.REQ_REPO].logger.logDebug("User is logging in", req);

		// 		expireSession(req, res, next, function(req, res, next) {
		// 			if(err.value) {
		// 				if (err.dbErr.code === C.MONGO_AUTH_FAILED)
		// 				{
		// 					responseCodes.respond(responsePlace, req, res, next, responseCodes.NOT_AUTHORIZED, {account: req.body.username});
		// 				} else {
		// 					responseCodes.respond(responsePlace, req, res, next, err, {account: req.body.username});
		// 				}
		// 			} else {
		// 				if(user)
		// 				{
		// 					createSession(responsePlace, req, res, next, user);
		// 				} else {
		// 					responseCodes.respond(responsePlace, req, res, next, responseCodes.USER_NOT_FOUND, {account: req.body.username});
		// 				}
		// 			}
		// 		});
		// 	});
		// });

		// Log the user out of the API
		// self.post("/logout", false, function(req, res, next) {
		// 	if(!req.session.user)
		// 	{
		// 		return responseCodes.respond("Logout POST", req, res, next, responseCodes.NOT_LOGGED_IN, {});
		// 	}

		// 	var username = req.session.user.username;

		// 	destroySession(req, res, next, function(req, res, next) {
		// 		responseCodes.respond("Logout POST", req, res, next, responseCodes.OK, {account: username});
		// 	});
		// });

		// Update or create a user's account
		// self.post("/:account", false, function(req, res, next) {
		// 	var responsePlace = "Account POST";

		// 	req[C.REQ_REPO].logger.logDebug("Updating user", req);

		// 	dbInterface(req[C.REQ_REPO].logger).getUserInfo( req.params[C.REPO_REST_API_ACCOUNT], function (err, user)
		// 	{
		// 		if (!user)
		// 		{
		// 			// Trying to sign-up
		// 			req[C.REQ_REPO].logger.logDebug("Attempting to add user: " + req.params[C.REPO_REST_API_ACCOUNT], req);
		// 			dbInterface(req[C.REQ_REPO].logger).createUser(req.params[C.REPO_REST_API_ACCOUNT], req.body.password, req.body.email, function() {
		// 				createSession(responsePlace, req, res, next, req.params[C.REPO_REST_API_ACCOUNT]);
		// 			});
		// 		} else {
		// 			if(!req.session.user)
		// 			{
		// 				return responseCodes.respond(responsePlace, responseCodes.NOT_LOGGED_IN, res, {});
		// 			}

		// 			if (req.session.user.username !== req.params[C.REPO_REST_API_ACCOUNT])
		// 			{
		// 				responseCodes.respond(responsePlace, req, res, next, err, responseCodes.NOT_AUTHORIZED, {account: req.params[C.REPO_REST_API_ACCOUNT]});
		// 			} else {
		// 				// Modify account here
		// 				req[C.REQ_REPO].logger.logDebug("Updating account", req);

		// 				if (req.body.oldPassword)
		// 				{
		// 					dbInterface(req[C.REQ_REPO].logger).updatePassword(req.params[C.REPO_REST_API_ACCOUNT], req.body, function(err) {
		// 						responseCodes.onError(responsePlace, req, res, next, err, {account: req.params[C.REPO_REST_API_ACCOUNT]});
		// 					});
		// 				} else {
		// 					dbInterface(req[C.REQ_REPO].logger).updateUser(req.params[C.REPO_REST_API_ACCOUNT], req.body, function(err) {
		// 						responseCodes.onError(responsePlace, req, res, next, err, {account: req.params[C.REPO_REST_API_ACCOUNT]});
		// 					});
		// 				}
		// 			}
		// 		}
		// 	});
		// });

		//upload and import file into repo world
		self.post("/:account/:project/upload", true, function (req, res) {
			var responsePlace = "Uploading a new model";
			if (config.cn_queue) {
				var upload = multer({ dest: config.cn_queue.upload_dir });
				upload.single("file")(req, res, function (err) {
					if (err) {
						return responseCodes.response(responsePlace, responseCodes.FILE_IMPORT_PROCESS_ERR, res, {});
					}
					else {
						queue.importFile(req.file.path, req.file.originalname, req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], req.session.user, function (err) {
							responseCodes.onError(responsePlace, req, res, err, { "user": req.session.user.username, "database" : req.params[C.REPO_REST_API_ACCOUNT], "project": req.params[C.REPO_REST_API_PROJECT] });
						});
					}
				});
			}
			else {
				responseCodes.onError(responsePlace, responseCodes.QUEUE_NO_CONFIG, res, { "user": req.session.user.username, "database" : req.params[C.REPO_REST_API_ACCOUNT], "project": req.params[C.REPO_REST_API_PROJECT] });
			}
		});

		// Update or create a user"s account
		//this.post("/:account/:project", false, function(req, res) {
		//});

		self.post("/:account/:project/wayfinder/record", false, function(req, res, next) {
			var responsePlace = "Wayfinder record POST";

			req[C.REQ_REPO].logger.logDebug("Posting wayfinder record information", req);

			if (!("user" in req.session)) {
				responseCodes.respond(responsePlace, responseCodes.NOT_LOGGED_IN, res, {});
			} else {
				var data = JSON.parse(req.body.data);
				var timestamp = JSON.parse(req.body.timestamp);

				self.dbInterface.storeWayfinderInfo(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], req.session.user.username, req.sessionID, data, timestamp, function(err) {
					responseCodes.onError(responsePlace, req, res, next, err, {});
				});
			}

		});

		self.post("/:account/:project/walkthrough", false, function(req, res) {
			if (!("user" in req.session)) {
				responseCodes.respond("Walkthrough record POST", responseCodes.NOT_LOGGED_IN, res, {});
			}
			else {
				self.dbInterface.storeWalkthroughInfo(req.params.account, req.params.project, req.body, function(err) {
					responseCodes.onError("Walkthrough record POST", err, res, {});
				});
			}

		});

		// Ability to add a named viewpoint
		self.post("/:account/:project/:branch/viewpoint", true, function(req, res, next) {
			var responsePlace = "Adding a viewpoint";

			req[C.REQ_REPO].logger.logDebug("Adding a new viewpoint to " + req.params[C.REPO_REST_API_ACCOUNT] + req.params[C.REPO_REST_API_PROJECT], req);

			var data = JSON.parse(req.body.data);

			dbInterface(req[C.REQ_REPO].logger).getRootNode(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], req.params[C.REPO_REST_API_BRANCH], null, function(err, root) {
				if (err.value) {
					return responseCodes.onError(responsePlace, req, res, next, err, {});
				}

				self.dbInterface.storeViewpoint(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], req.params[C.REPO_REST_API_BRANCH], req.session.user, self.dbInterface.uuidToString(root[C.REPO_NODE_LABEL_SHARED_ID]), data, function(err) {
					responseCodes.onError(responsePlace, req, res, next, err, {});
				});
			});
		});

		// self.post("/:account/:project/issues/:id", true, function(req, res, next) {
		// 	var responsePlace = "Adding or updating an issue";
		// 	var data = JSON.parse(req.body.data);

		// 	req[C.REQ_REPO].logger.logDebug("Upserting an issues for object " + req.params[C.REPO_REST_API_SID] + " in " + req.params[C.REPO_REST_API_ACCOUNT] + "/" + req.params[C.REPO_REST_API_PROJECT], req);

		// 	dbInterface(req[C.REQ_REPO].logger).storeIssue(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], req.params[C.REPO_REST_API_ID], req.session.user.username, data, function(err, result) {
		// 		responseCodes.onError(responsePlace, req, res, next, err, result);
		// 	});
		// });

		var checkProcessed = function (callback) {
			return function(req, res, next) {
				// Have we already processed this request
				if (req[C.REQ_REPO].processed) {
					return next();
				} else {
					req[C.REQ_REPO].processed = true;
				}

				callback(req, res, next);
			};
		};

		// Register handlers with Express Router
		for(var idx in self.postMap)
		{
			if (self.postMap.hasOwnProperty(idx))
			{
				var item = self.postMap[idx];

				var resFunction = schemaValidator.validate(item.regex);

				systemLogger.logInfo("Adding POST regex " + item.regex);

				if (item.shouldCheckAccess) {
					router.post(item.regex.toString(), resFunction, checkAccess, checkProcessed(item.callback));
				} else {
					router.post(item.regex, resFunction, checkProcessed(item.callback));
				}
			}
		}

		return self;
	};

	module.exports = repoPostHandler;
}());

