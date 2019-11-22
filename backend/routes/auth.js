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
const utils = require("../utils");
const User = require("../models/user");
const addressMeta = require("../models/addressMeta");
const Mailer = require("../mailer/mailer");
const httpsPost = require("../libs/httpsReq").post;

const multer = require("multer");

/**
 * @api {post} /login Login
 * @apiName login
 * @apiGroup Authentication
 * @apiDescription 3D Repo account login.
 * Logging in generates a token that can be used for cookie-based authentication.
 * To authentication subsequent API calls using cookie-based authentication,
 * simply put the following into the HTTP header:
 * `Cookie: connect.sid=:sessionId`
 *
 * NOTE: If you use a modern browser’s XMLHttpRequest object to make API calls,
 * you don’t need to take care of the authentication process after calling /login.
 *
 * @apiParam (Request body) {String} username Account username
 * @apiParam (Request body) {String} password Account password
 * @apiSuccess (200) {String} username Account username
 *
 * @apiExample {post} Example usage:
 * POST /login HTTP/1.1
 * {
 * 	"username": "alice",
 * 	"password": "AW96B6"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * set-cookie:connect.sid=12345678901234567890;
 * {
 * 	"username": "alice"
 * }
 */
router.post("/login", login);

/**
 * @api {post} /logout Logout
 * @apiName logout
 * @apiGroup Authentication
 * @apiDescription Invalidate the authenticated session.
 *
 * @apiSuccess (200) {String} username Account username
 *
 * @apiExample {post} Example usage:
 * POST /logout HTTP/1.1
 * {}
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	"username": "alice"
 * }
 *
 */
router.post("/logout", logout);

/**
 * @api {get} /login Get current username
 * @apiName checkLogin
 * @apiGroup Authentication
 * @apiDescription Get the username of the logged in user.
 *
 * @apiSuccess (200) {String} username Account username
 *
 * @apiExample {get} Example usage:
 * GET /login HTTP/1.1
 * {}
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	"username": "alice"
 * }
 */
router.get("/login", checkLogin);

/**
 * @api {post} /forgot-password Forgot password
 * @apiName forgotPassword
 * @apiGroup Account
 * @apiDescription Send a password reset link to account's e-mail.
 *
 * @apiParam {String} username Account username
 * @apiParam {String} email E-mail address registered with account
 *
 * @apiExample {get} Example usage (with username):
 * POST /forgot-password HTTP/1.1
 * {
 * 	"username: "alice"
 * }
 *
 * @apiExample {get} Example usage (with e-mail):
 * POST /forgot-password HTTP/1.1
 * {
 * 	"email: "alice@acme.co.uk"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {}
 */
router.post("/forgot-password", forgotPassword);

/**
 * @api {get} /version Application version
 * @apiName printVersion
 * @apiGroup 3D Repo
 * @apiDescription Show current application version.
 *
 * @apiSuccess (200) {String} VERSION API service version
 * @apiSuccess (200) {String} unity Unity viewer version
 * @apiSuccess (200) {String} navis Autodesk Navisworks version
 * @apiSuccess (200) {String} unitydll Unity viewer version
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"VERSION": "2.20.1",
 * 	"unity": {
 * 		"current": "2.20.0",
 * 		"supported": []
 * 	},
 * 	"navis": {
 * 		"current": "2.16.0",
 * 		"supported": [
 * 			"2.8.0"
 * 		]
 * 	},
 * 	"unitydll": {
 * 		"current": "2.8.0",
 * 		"supported": []
 * 	}
 * }
 */
router.get("/version", printVersion);

/**
 * @api {get} /:user.json List account information
 * @apiName listInfo
 * @apiGroup Account
 * @apiDescription Account information and list of projects grouped by teamspace
 * that the user has access to.
 *
 * @apiParam {String} user User
 * @apiSuccess (200) {Object[]} accounts User account
 * @apiSuccess (200) {Object} billingInfo Billing information
 * @apiSuccess (200) {String} email User e-mail address
 * @apiSuccess (200) {String} firstName First name
 * @apiSuccess (200) {String} lastName Surname
 * @apiSuccess (200) {Boolean} hasAvatar True if user account has an avatar
 *
 * @apiExample {delete} Example usage:
 * GET /alice.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"accounts": [
 * 		{
 * 			"account": "repoman",
 * 			"models": [
 * 				{
 * 					"permissions": [
 * 						"change_model_settings",
 * 						"upload_files",
 * 						"create_issue",
 * 						"comment_issue",
 * 						"view_issue",
 * 						"view_model",
 * 						"download_model",
 * 						"edit_federation",
 * 						"delete_federation",
 * 						"delete_model",
 * 						"manage_model_permission"
 * 					],
 * 					"model": "00000000-0000-0000-0000-000000000000",
 * 					"name": "ufo",
 * 					"status": "ok",
 * 					"timestamp": "2016-07-26T15:52:11.000Z"
 * 				}
 * 			],
 * 			"fedModels": [],
 * 			"isAdmin": true,
 * 			"permissions": [
 * 				"teamspace_admin"
 * 			],
 * 			"quota": {
 * 				"spaceLimit": 10485760,
 * 				"collaboratorLimit": 5,
 * 				"spaceUsed": 12478764
 * 			},
 * 			"projects": []
 * 		},
 * 		{
 * 			"account": "breakingbad",
 * 			"models": [
 * 				{
 * 					"permissions": [
 * 						"view_issue",
 * 						"view_model",
 * 						"upload_files",
 * 						"create_issue"
 * 					],
 * 					"model": "00000000-0000-0000-0000-000000000001",
 * 					"name": "homelab",
 * 					"status": "ok",
 * 					"timestamp": null
 * 				}
 * 			],
 * 			"fedModels": [
 * 				{
 * 					"federate": true,
 * 					"permissions": [
 * 						"change_model_settings",
 * 						"upload_files",
 * 						"create_issue",
 * 						"comment_issue",
 * 						"view_issue",
 * 						"view_model",
 * 						"download_model",
 * 						"edit_federation",
 * 						"delete_federation",
 * 						"delete_model",
 * 						"manage_model_permission"
 * 					],
 * 					"model": "00000000-0000-0000-0000-000000000003",
 * 					"name": "fed1",
 * 					"status": "ok",
 * 					"timestamp": "2017-05-11T12:49:59.000Z",
 * 					"subModels": [
 * 						{
 * 							"database": "breakingbad",
 * 							"model": "00000000-0000-0000-0000-000000000001",
 * 							"name": "homelab"
 * 						},
 * 						{
 * 							"database": "breakingbad",
 * 							"model": "00000000-0000-0000-0000-000000000002",
 * 							"name": "laundrylab"
 * 						}
 * 					]
 * 				}
 * 			],
 * 			"projects": [
 * 				{
 * 					"_id": "58f78c8ededbb13a982114ee",
 * 					"name": "folder1",
 * 					"permission": [],
 * 					"models": [
 * 						{
 * 							"permissions": [
 * 								"view_issue",
 * 								"view_model",
 * 								"upload_files",
 * 								"create_issue"
 * 							],
 * 							"model": "00000000-0000-0000-0000-000000000004",
 * 							"name": "laundrylab",
 * 							"status": "ok",
 * 							"timestamp": null
 * 						}
 * 					]
 * 				}
 * 			]
 * 		}
 * 	],
 * 	"billingInfo": {
 * 		"countryCode": "US",
 * 		"postalCode": "0",
 * 		"line2": "123",
 * 		"city": "123",
 * 		"line1": "123",
 * 		"vat": "000",
 * 		"company": "Universal Pictures",
 * 		"_id": "59145aedf4f613668fba0f98"
 * 	},
 * 	"email":"alice@acme.co.uk",
 * 	"firstName":"Alice",
 * 	"lastName":"Allen",
 * 	"hasAvatar": true,
 * 	"jobs": [
 * 		{
 * 			"_id": "Director"
 * 		},
 * 		{
 * 			"_id": "Actor"
 * 		},
 * 		{
 * 			"_id": "Producer
 * 		}
 * 	]
 * }
 */
router.get("/:account.json", middlewares.loggedIn, listInfo);
// TODO: divide into different endpoints that makes sense.

/**
 * @api {get} /:user/avatar Get avatar
 * @apiName getAvatar
 * @apiGroup Account
 * @apiDescription Get user avatar.
 *
 * @apiParam {String} user User
 * @apiSuccess (200) {Object} avatar User Avatar Image
 * @apiError (404) USER_DOES_NOT_HAVE_AVATAR User does not have an avatar
 *
 * @apiExample {put} Example usage:
 * GET /alice/avatar HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 *
 * @apiErrorExample {json} Error-Response
 * HTTP/1.1 404 Not Found
 * {
 * 	"message": "User does not have an avatar",
 * 	"status": 404,
 * 	"code": "USER_DOES_NOT_HAVE_AVATAR",
 * 	"place": "GET /alice/avatar"
 * }
 */
router.get("/:account/avatar", middlewares.loggedIn, getAvatar);

/**
 * @api {post} /:user/avatar Upload avatar
 * @apiName uploadAvatar
 * @apiGroup Account
 * @apiDescription Upload a new avatar image.
 * Only multipart form data content type will be accepted.
 *
 * @apiParam {String} user User
 * @apiParam (Request body) {File} file Image to upload
 *
 * @apiExample {put} Example usage:
 * POST /alice/avatar HTTP/1.1
 * Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf
 *
 * ------WebKitFormBoundaryN8dwXAkcO1frCHLf
 * Content-Disposition: form-data; name="file"; filename="avatar.png"
 * Content-Type: image/png
 *
 * <binary content>
 * ------WebKitFormBoundaryN8dwXAkcO1frCHLf--
 *
 * @apiSuccess (200) {Object} status Status of Avatar upload.
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	"status":"success"
 * }
 */
router.post("/:account/avatar", middlewares.isAccountAdmin, uploadAvatar);

/**
 * @api {post} /:user Sign up
 * @apiName signUp
 * @apiGroup Account
 * @apiDescription Sign up for a new user account.
 *
 * @apiParam {String} user New account username to register
 * @apiParam (Request body) {String} password Password
 * @apiParam (Request body) {String} email Valid e-mail address
 * @apiParam (Request body) {String} firstName First name
 * @apiParam (Request body) {String} lastName Surname
 * @apiParam (Request body) {String} company Company
 * @apiParam (Request body) {String} jobTitle Job title
 * @apiParam (Request body) {String} countryCode ISO 3166-1 alpha-2
 * @apiParam (Request body) {String} captcha Google reCAPTCHA response token
 * @apiSuccess (200) account New Account username
 * @apiError SIGN_UP_PASSWORD_MISSING Password is missing
 *
 * @apiExample {post} Example usage:
 * POST /alice HTTP/1.1
 * {
 * 	"email":"alice@acme.co.uk",
 * 	"password":"AW96B6",
 * 	"firstName":"Alice",
 * 	"lastName":"Allen",
 * 	"company":"Acme Corporation",
 * 	"countryCode":"GB",
 * 	"jobTitle":"CEO",
 * 	"captcha":"1234567890qwertyuiop"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	"account":"alice"
 * }
 *
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 400 Bad Request
 * {
 * 	"message": "Password is missing",
 * 	"status": 400,
 * 	"code": "SIGN_UP_PASSWORD_MISSING",
 * 	"value": 57,
 * 	"place": "POST /nabile"
 * }
 */
router.post("/:account", signUp);

/**
 * @api {post} /:user/verify Verify
 * @apiName verify
 * @apiGroup Account
 * @apiDescription Verify an account after signing up.
 *
 * @apiParam {String} user Account username
 * @apiParam (Request body) {String} token Account verification token
 * @apiSuccess (200) account Account username
 * @apiError ALREADY_VERIFIED User already verified
 *
 * @apiExample {post} Example usage:
 * POST /alice/verify HTTP/1.1
 * {
 * 	"token":"1234567890"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	"account":"alice"
 * }
 *
 * @apiErrorExample {json} Error-Response
 * HTTP/1.1 400 Bad Request
 * {
 * 	"message": "Already verified",
 * 	"status": 400,
 * 	"code": "ALREADY_VERIFIED",
 * 	"value": 60,
 * 	"place": "POST /alice/verify"
 * }
 */
router.post("/:account/verify", verify);

/**
 * @api {put} /:user Update user account
 * @apiName updateUser
 * @apiGroup Account
 * @apiDescription Update account information.
 *
 * @apiParam {String} user Account username
 * @apiParam (Request body) {String} email Valid e-mail address
 * @apiParam (Request body) {String} firstName First name
 * @apiParam (Request body) {String} lastName Surname
 * @apiSuccess (200) account Account username
 *
 * @apiExample {post} Example usage:
 * PUT /alice HTTP/1.1
 * {
 * 	"email":"alice@3drepo.org",
 * 	"firstName":"Alice",
 * 	"lastName":"Anderson"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"account":"alice"
 * }
 */
router.put("/:account", middlewares.isAccountAdmin, updateUser);

/**
 * @api {put} /:user/password Reset password
 * @apiName resetPassword
 * @apiGroup Account
 * @apiDescription Reset user account password.
 * New password must be different.
 *
 * @apiParam {String} user User account
 * @apiParam (Request body) {String} oldPassword Old password
 * @apiParam (Request body) {String} newPassword New password
 * @apiParam (Request body) {String} token Password reset token
 * @apiSuccess (200) account Account username
 * @apiError TOKEN_INVALID Token is invalid or has expired
 *
 * @apiExample {post} Example usage (with old password):
 * PUT /alice/password HTTP/1.1
 * {
 * 	"oldPassword":"AW96B6",
 * 	"newPassword":"TrustNo1"
 * }
 *
 * @apiExample {post} Example usage (with token):
 * PUT /alice/password HTTP/1.1
 * {
 * 	"token":"1234567890",
 * 	"newPassword":"TrustNo1"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"account":"alice"
 * }
 *
 * @apiErrorExample {json} Error-Response
 * HTTP/1.1 400 Bad Request
 * {
 * 	"message":"Token is invalid or expired",
 * 	"status":400,
 * 	"code":"TOKEN_INVALID",
 * 	"value":59,
 * 	"place": "PUT /alice/password"
 * }
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

			req.body.username = user.user;

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
				firstName: utils.ucFirst(req.body.firstName),
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
					username: data.username,
					firstName:data.firstName
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
