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
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.	If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const middlewares = require("../middlewares/middlewares");
const config = require("../config");
// var systemLogger		= require("../logger.js").systemLogger;
const utils = require("../utils");
const User = require("../models/user");
const addressMeta = require("../models/addressMeta");
const Mailer = require("../mailer/mailer");
const httpsPost = require("../libs/httpsReq").post;

const multer = require("multer");

/**
 * @api {post} /login Create a Login session
 * @apiName login
 * @apiGroup Authorisation
 *
 * @apiParam {String} username Account username
 * @apiParam {String} password User account password
 *
 * @apiDescription Login into a verified and registered 3D Repo account.
 *
 * @apiSuccess (200) {Object} User account information.
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * 	{
 *   "username": "username1",
 *   "roles": [
 *       {
 *           "role": "team_member",
 *           "db": "database_name"
 *       },
 *       {
 *           "role": "team_member",
 *           "db": "database_name1"
 *       },
 *       {
 *           "role": "team_member",
 *           "db": "database_name2"
 *       }
 *   ],
 *   "flags": {
 *       "termsPrompt": false
 *   }
 *	}
 *
 * @apiError NotAuthorized User was not authorised.
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 401 Unauth­orized
 *   {
 *     "message": "Not Authorized",
 *     "status": 401,
 *     "code": "NOT_AUTHORIZED",
 *     "value": 9,
 *     "place": "GET /login"
 *   }
 */
router.post("/login", login);

/**
 * @api {get} /logout/ Create a logout request
 * @apiName logout
 * @apiGroup Authorisation
 *
 * @apiDescription Logout current user
 *
 * @apiParam {String} username Account username
 *
 * @apiSuccess (200) {String} username Registered Account Username
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *  "username": "username1"
 * }
 *
 */
router.post("/logout", logout);

/**
 * @api {get} /login/ Check user is logged in
 * @apiName checkLogin
 * @apiGroup Authorisation
 *
 * @apiDescription Check user is still logged into current session.
 *
 * @apiParam {String} username Registered Account Username.
 * @apiParam {String} password Registered User Account Password
 *
 * @apiSuccess (200) {Object} User profile.
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * 	{
 *   "username": "username1",
 *   "roles": [
 *       {
 *           "role": "team_member",
 *           "db": "database_name"
 *       },
 *       {
 *           "role": "team_member",
 *           "db": "database_name1"
 *       },
 *       {
 *           "role": "team_member",
 *           "db": "database_name2"
 *       }
 *   ],
 *   "flags": {
 *       "termsPrompt": false
 *   }
 *	}
 */
router.get("/login", checkLogin);

/**
 * @api {get} /forgot-password/ User Forgot Password request
 * @apiName forgotPassword
 * @apiGroup Authorisation
 *
 * @apiDescription Reset a registered user password.
 *
 * @apiParam {String} username Username to use for password reset
 * @apiParam {String} email Email to use for password reset
 *
 * @apiSuccess (200) {Object} Empty Object
 *
 * @apiError SIGN_UP_PASSWORD_MISSING Password is missing
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Password is missing",
 *   "status": 400,
 *   "code": "SIGN_UP_PASSWORD_MISSING",
 *   "value": 57,
 *   "place": "POST /forgotPassword"
 * }
 */
router.post("/forgot-password", forgotPassword);

/**
 * @api {get} /version/ Print application version
 * @apiName printVersion
 * @apiGroup Authorisation
 *
 * @apiDescription Print current application version.
 *
 * @apiSuccess (200) {Object} Current Application Version number.
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "VERSION": "2.20.1",
 *   "unity": {
 *       "current": "2.20.0",
 *       "supported": []
 *    },
 *   "navis": {
 *       "current": "2.16.0",
 *       "supported": [
 *           "2.8.0"
 *       ]
 *   },
 *   "unitydll": {
 *       "current": "2.8.0",
 *       "supported": []
 *   }
 *  }
 */
router.get("/version", printVersion);

/**
 * @api {get} /:account.json/ List account information
 * @apiName listInfo
 * @apiGroup Authorisation
 * @apiParam {String} account.json The Account to list information for.
 *
 * @apiDescription List account information for provided account.json file.
 *
 * @apiSuccess (200) {Object[]} User account
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
    "accounts": [
        {
            "account": "username1",
            "projects": [
                {
                    "_id": "model_ID",
                    "name": "Sample_Project",
                    "__v": 37,
                    "permissions": [
                        "create_model",
                        "create_federation",
                        "admin_project",
                        "edit_project",
                        "delete_project",
                        "upload_files_all_models",
                        "edit_federation_all_models",
                        "create_issue_all_models",
                        "comment_issue_all_models",
                        "view_issue_all_models",
                        "view_model_all_models",
                        "download_model_all_models",
                        "change_model_settings_all_models"
                    ],
                    "models": [
                        {
                            "permissions": [
                                "change_model_settings",
                                "upload_files",
                                "create_issue",
                                "comment_issue",
                                "view_issue",
                                "view_model",
                                "download_model",
                                "edit_federation",
                                "delete_federation",
                                "delete_model",
                                "manage_model_permission"
                            ],
                            "model": "model_ID_1",
                            "name": "Model_Name_1",
                            "status": "ok",
                            "timestamp": "2018-11-27T09:59:56.470Z"
                        },
                        {
                            "permissions": [
                                "change_model_settings",
                                "upload_files",
                                "create_issue",
                                "comment_issue",
                                "view_issue",
                                "view_model",
                                "download_model",
                                "edit_federation",
                                "delete_federation",
                                "delete_model",
                                "manage_model_permission"
                            ],
                            "model": "model_ID_2",
                            "name": "Model_Name_2",
                            "status": "ok",
                            "timestamp": "2018-11-27T09:57:19.345Z"
                        },
                        {
                            "permissions": [
                                "change_model_settings",
                                "upload_files",
                                "create_issue",
                                "comment_issue",
                                "view_issue",
                                "view_model",
                                "download_model",
                                "edit_federation",
                                "delete_federation",
                                "delete_model",
                                "manage_model_permission"
                            ],
                            "model": "model_ID_3",
                            "name": "Model_Name_3",
                            "status": "ok",
                            "timestamp": "2018-11-26T17:19:26.175Z"
                        },
                        {
                            "permissions": [
                                "change_model_settings",
                                "upload_files",
                                "create_issue",
                                "comment_issue",
                                "view_issue",
                                "view_model",
                                "download_model",
                                "edit_federation",
                                "delete_federation",
                                "delete_model",
                                "manage_model_permission"
                            ],
                            "model": "mode_ID_4",
                            "name": "Model_Name_4",
                            "status": "queued",
                            "timestamp": null
                        }
                    ]
                },
                {
                    "_id": "model_ID_3",
                    "name": "Model_Name_4",
                    "__v": 2,
                    "permissions": [
                        "create_model",
                        "create_federation",
                        "admin_project",
                        "edit_project",
                        "delete_project",
                        "upload_files_all_models",
                        "edit_federation_all_models",
                        "create_issue_all_models",
                        "comment_issue_all_models",
                        "view_issue_all_models",
                        "view_model_all_models",
                        "download_model_all_models",
                        "change_model_settings_all_models"
                    ],
                    "models": [
                        {
                            "permissions": [
                                "change_model_settings",
                                "upload_files",
                                "create_issue",
                                "comment_issue",
                                "view_issue",
                                "view_model",
                                "download_model",
                                "edit_federation",
                                "delete_federation",
                                "delete_model",
                                "manage_model_permission"
                            ],
                            "model": "model_ID_5",
                            "name": "model",
                            "status": "queued",
                            "timestamp": "2018-11-22T15:47:57.000Z"
                        }
                    ]
                }
            ],
            "models": [],
            "fedModels": [],
            "isAdmin": true,
            "permissions": [
                "assign_licence",
                "revoke_licence",
                "teamspace_admin",
                "create_project",
                "create_job",
                "delete_job",
                "assign_job",
                "view_projects"
            ]
        }
 */
router.get("/:account.json", middlewares.loggedIn, listInfo);
// TODO: divide into different endpoints that makes sense.

/**
 * @api {get} /:account.json/ Get User Avatar
 * @apiName getAvatar
 * @apiGroup Authorisation
 * @apiParam {String} account The avatar image for requested account.
 *
 * @apiSuccess (200) {Object} avatar User Avatar Image
 *
 * @apiError (404) USER_DOES_NOT_HAVE_AVATAR User does not have an avatar
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "User does not have an avatar",
 *   "status": 404,
 *   "code": "SIGN_UP_PASSWORD_MISSING",
 *   "place": "POST /:account/avatar"
 * }
 */
router.get("/:account/avatar", middlewares.isAccountAdmin, getAvatar);

/**
 * @api {post} /:account/avatar Get User Avatar
 * @apiName uploadAvatar
 * @apiGroup Authorisation
 * @apiParam {String} account The account to upload avatar to.
 * @apiParam {Object} image The avatar to upload.
 *
 * @apiDescription Upload a new user Avatar.
 *
 * @apiSuccess (200) {Object} status Status of Avatar upload.
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *  "status":"success"
 * }
 */
router.post("/:account/avatar", middlewares.isAccountAdmin, uploadAvatar);

/**
 * @api {post} /:account Sign up form
 * @apiName signUp
 * @apiGroup Authorisation]
 *
 * @apiParam {String} account New Account username to register.
 *
 * @apiDescription Sign up a new user account.
 *
 * @apiSuccess (200) account New Account username
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *  "account":"newAccountUsername"
 * }
 *
 * @apiError SIGN_UP_PASSWORD_MISSING Sign Up Password is missing.
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Password is missing",
 *   "status": 400,
 *   "code": "SIGN_UP_PASSWORD_MISSING",
 *   "value": 57,
 *   "place": "POST /nabile"
 * }
 */
router.post("/:account", signUp);

/**
 * @api {post} /:account/verify Verify the user
 * @apiName verify
 * @apiGroup Authorisation
 *
 * @apiParam {String} account New account username.
 *
 * @apiSuccess (200) Account Verified
 *
 * @apiError ALREADY_VERIFIED User Already verified
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Already verified",
 *   "status": 400,
 *   "code": "ALREADY_VERIFIED",
 *   "value": 60,
 *   "place": "POST /niblux/verify"
 * }
 */
router.post("/:account/verify", verify);

/**
 * @api {put} /:account Update User password
 * @apiName updateUser
 * @apiGroup Authorisation
 *
 * @apiParam {String} account Registered Account Username
 *
 * @apiSuccess (200) User Updated
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *  "account":"newAccountUsername"
 * }
 */
router.put("/:account", middlewares.isAccountAdmin, updateUser);

/**
 * @api {put} /:account/password Reset User Password
 * @apiName resetPassword
 * @apiGroup Authorisation
 *
 * @apiParam {String} account Account to reset password for.
 * @apiParam {String} password New password to reset to.
 *
 * @apiDescription Reset existing user account password
 *
 * @apiSuccess (200) account Account username
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 * 	"account":"username1"
 *  }
 *
 * @apiError TOKEN_INVALID Token is invalid or expired.
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 400 Bad Request
 * {
 * 	"message":"Token is invalid or expired",
 * 	"status":400,"code":"TOKEN_INVALID",
 * 	"value":59,
 * 	"place": "PUT /username1/password"
 * 	}
 */
router.put("/:account/password", resetPassword);

function createSession(place, req, res, next, user) {

	req.session.regenerate(function(err) {
		req[C.REQ_REPO].logger.logInfo("Creating session for " + " " + user.username);
		if(err) {
			responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {username: user.username});
		} else {
			req[C.REQ_REPO].logger.logDebug("Authenticated user and signed token.");

			req.session[C.REPO_SESSION_USER] = user;
			req.session.cookie.domain				 = config.cookie_domain;

			if (config.cookie.maxAge) {
				req.session.cookie.maxAge = config.cookie.maxAge;
			}

			responseCodes.respond(place, req, res, next, responseCodes.OK, {username: user.username, roles: user.roles, flags: user.flags});
		}
	});
}

function login(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	if (Object.prototype.toString.call(req.body.username) === "[object String]"
		&& Object.prototype.toString.call(req.body.password) === "[object String]") {

		req[C.REQ_REPO].logger.logInfo("Authenticating user", { username: req.body.username});

		if(req.session.user) {
			return responseCodes.respond(responsePlace, req, res, next, responseCodes.ALREADY_LOGGED_IN, responseCodes.ALREADY_LOGGED_IN);
		}

		User.authenticate(req[C.REQ_REPO].logger, req.body.username, req.body.password).then(user => {

			const responseData = { username: user.user };

			req[C.REQ_REPO].logger.logInfo("User is logged in", responseData);

			responseData.roles = user.roles;
			responseData.flags = {};

			responseData.flags.termsPrompt = !user.hasReadLatestTerms();

			user.customData.lastLoginAt = new Date();

			user.save().then(() => {
				createSession(responsePlace, req, res, next, responseData);
			});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
		});
	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}

}

function checkLogin(req, res, next) {
	if (!req.session || !req.session.user) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, {});
	} else {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {username: req.session.user.username});
	}
}

function logout(req, res, next) {
	if(!req.session || !req.session.user) {
		return responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, {});
	}

	const username = req.session.user.username;

	req.session.destroy(function() {
		req[C.REQ_REPO].logger.logDebug("User has logged out.");
		res.clearCookie("connect.sid", { domain: config.cookie_domain, path: "/" });
		responseCodes.respond("Logout POST", req, res, next, responseCodes.OK, {username: username});
	});
}

function updateUser(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	if(req.body.oldPassword) {
		if(Object.prototype.toString.call(req.body.oldPassword) === "[object String]" &&
			Object.prototype.toString.call(req.body.newPassword) === "[object String]") {
			// Update password
			User.updatePassword(req[C.REQ_REPO].logger, req.params[C.REPO_REST_API_ACCOUNT], req.body.oldPassword, null, req.body.newPassword).then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
			}).catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
			});
		} else {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}

	} else {
		// Update user info
		User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {
			return user.updateInfo(req.body);
		}).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
		});
	}

}

function signUp(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	if(!config.auth.register) {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.REGISTER_DISABLE, responseCodes.REGISTER_DISABLE);
	}

	if(!req.body.password) {
		const err = responseCodes.SIGN_UP_PASSWORD_MISSING;
		return responseCodes.respond(responsePlace, req, res, next, err, err);
	}

	if (Object.prototype.toString.call(req.body.email) === "[object String]"
		&& Object.prototype.toString.call(req.body.password) === "[object String]"
		&& Object.prototype.toString.call(req.body.firstName) === "[object String]"
		&& Object.prototype.toString.call(req.body.lastName) === "[object String]"
		&& Object.prototype.toString.call(req.body.countryCode) === "[object String]"
		&& (!req.body.company || Object.prototype.toString.call(req.body.company) === "[object String]")
		&& Object.prototype.toString.call(req.body.mailListAgreed) === "[object Boolean]") {

		// check if captcha is enabled
		const checkCaptcha = config.auth.captcha ? httpsPost(config.captcha.validateUrl, {
			secret: config.captcha.secretKey,
			response: req.body.captcha

		}) : Promise.resolve({
			success: true
		});

		checkCaptcha.then(resBody => {

			if(resBody.success) {
				return User.createUser(req[C.REQ_REPO].logger, req.params.account, req.body.password, {

					email: req.body.email,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					countryCode: req.body.countryCode,
					company: req.body.company,
					mailListOptOut: !req.body.mailListAgreed

				}, config.tokenExpiry.emailVerify);
			} else {
				// console.log(resBody);
				return Promise.reject({ resCode: responseCodes.INVALID_CAPTCHA_RES});
			}

		}).then(data => {

			const country = addressMeta.countries.find(_country => _country.code === req.body.countryCode);
			// send to sales
			Mailer.sendNewUser({
				user: req.params.account,
				email: req.body.email,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				country: country && country.name,
				company: req.body.company
			}).catch(err => {
				// catch email error instead of returning to client
				req[C.REQ_REPO].logger.logError(`Email error - ${err.message}`);
				return Promise.resolve(err);
			});

			// send verification email
			return Mailer.sendVerifyUserEmail(req.body.email, {
				token : data.token,
				email: req.body.email,
				username: req.params.account,
				pay: req.body.pay

			}).catch(err => {
				// catch email error instead of returning to client
				req[C.REQ_REPO].logger.logError(`Email error - ${err.message}`);
				return Promise.resolve(err);
			});

		}).then(emailRes => {

			req[C.REQ_REPO].logger.logInfo("Email info - " + JSON.stringify(emailRes));
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
		});

	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}

}

function verify(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	User.verify(req.params[C.REPO_REST_API_ACCOUNT], req.body.token).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err , err.resCode ? err.resCode : err);
	});
}

function forgotPassword(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	if (Object.prototype.toString.call(req.body.userNameOrEmail) === "[object String]") {
		User.getForgotPasswordToken(req.body.userNameOrEmail).then(data => {
			if (data.email && data.token && data.username) {
				// send forgot password email
				return Mailer.sendResetPasswordEmail(data.email, {
					token : data.token,
					email: data.email,
					username: data.username
				}).catch(err => {
					// catch email error instead of returning to client
					req[C.REQ_REPO].logger.logDebug(`Email error - ${err.message}`);
					return Promise.reject(responseCodes.PROCESS_ERROR("Internal Email Error"));
				});
			}
		}).then(emailRes => {
			req[C.REQ_REPO].logger.logInfo("Email info - " + JSON.stringify(emailRes));
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err , err.resCode ? err.resCode : err);
		});
	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function getAvatar(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	// Update user info
	User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {

		if(!user.getAvatar()) {
			return Promise.reject({resCode: responseCodes.USER_DOES_NOT_HAVE_AVATAR });
		}

		return Promise.resolve(user.getAvatar());

	}).then(avatar => {

		res.write(avatar.data.buffer);
		res.end();

	}).catch((err) => {

		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function uploadAvatar(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	// check space and format
	function fileFilter(fileReq, file, cb) {

		const acceptedFormat = ["png", "jpg", "gif"];

		let format = file.originalname.split(".");
		format = format.length <= 1 ? "" : format.splice(-1)[0];

		const size = parseInt(fileReq.headers["content-length"]);

		if(acceptedFormat.indexOf(format.toLowerCase()) === -1) {
			return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if(size > config.avatarSizeLimit) {
			return cb({ resCode: responseCodes.AVATAR_SIZE_LIMIT });
		}

		return cb(null, true);
	}

	const upload = multer({
		storage: multer.memoryStorage(),
		fileFilter: fileFilter
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);
		} else {
			User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {
				user.customData.avatar = { data: req.file.buffer};
				return user.save();
			}).then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: "success" });
			}).catch(error => {
				responseCodes.respond(responsePlace, req, res, next, error.resCode ? error.resCode : error, error.resCode ? error.resCode : error);
			});
		}
	});
}

function resetPassword(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	if (Object.prototype.toString.call(req.body.token) === "[object String]" &&
		Object.prototype.toString.call(req.body.newPassword) === "[object String]") {
		User.updatePassword(req[C.REQ_REPO].logger, req.params[C.REPO_REST_API_ACCOUNT], null, req.body.token, req.body.newPassword).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
		});
	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function listUserInfo(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	let user;

	User.findByUserName(req.params.account).then(_user => {

		if(!_user) {
			return Promise.reject({resCode: responseCodes.USER_NOT_FOUND});
		}

		user = _user;
		return user.listAccounts();

	}).then(databases => {

		const customData = user.customData.toObject();

		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {
			accounts: databases,
			firstName: customData.firstName,
			lastName: customData.lastName,
			email: customData.email,
			billingInfo: customData.billing.billingInfo,
			hasAvatar: customData.avatar ? true : false
		});

	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
	});
}

function listInfo(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	if(req.session.user.username !== req.params.account) {

		let getType;

		if(C.REPO_BLACKLIST_USERNAME.indexOf(req.params.account) !== -1) {
			getType = Promise.resolve("blacklisted");
		} else {
			getType = User.findByUserName(req.params.account).then(_user => {
				if(!_user) {
					return "";
				} else if(!_user.customData.email) {
					return "database";
				} else {
					return "user";
				}
			});
		}

		getType.then(type => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {type});
		});

	} else {
		listUserInfo(req, res, next);
	}
}

function printVersion(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	const versionInfo = require("../VERSION");
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, versionInfo);
}

module.exports = router;
