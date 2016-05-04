(function() {
	"use strict";
	var express = require("express");
	var router = express.Router({mergeParams: true});
	// var dbInterface = require("../db/db_interface.js");
	var responseCodes = require("../response_codes.js");
	var C = require("../constants");
	var middlewares = require("./middlewares");
	var config = require('../config');
	var systemLogger    = require("../logger.js").systemLogger;
	var utils = require("../utils");
	var User = require("../models/user");

	router.post("/login", login);
	router.get("/login", checkLogin);
	router.post("/logout", logout);
	router.get("/:account.jpg", middlewares.loggedIn, getAvatar);
	router.post('/:account', signUp);
	router.post('/:account/verify', verify);
	router.put("/:account", middlewares.loggedIn, updateUser);

	function expireSession(req) {
		req.session.cookie.expires = new Date(0);
		req.session.cookie.maxAge = 0;
	}

	function createSession(place, req, res, next, user){

		req.session.regenerate(function(err) {
			if(err) {
				responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {username: user.username});
			} else {
				systemLogger.logDebug("Authenticated user and signed token.", req);

				req.session[C.REPO_SESSION_USER] = user;
				req.session.cookie.domain = req.host;

				if (config.cookie.maxAge)
				{
					req.session.cookie.maxAge = config.cookie.maxAge;
				}
				responseCodes.respond(place, req, res, next, responseCodes.OK, {username: user.username, roles: user.roles});
			}
		});
	}

	function login(req, res, next){
		let responsePlace = utils.APIInfo(req);

		req[C.REQ_REPO].logger.logInfo("Authenticating user", req.body.username);


		User.authenticate(req[C.REQ_REPO].logger, req.body.username, req.body.password).then(user => {

			req[C.REQ_REPO].logger.logInfo("User is logged in", req.body.username);

			expireSession(req);
			createSession(responsePlace, req, res, next, {username: user.user, roles: user.roles});
		}).catch(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.NOT_AUTHORIZED, {username: req.body.username});
		});

	}

	function checkLogin(req, res, next){
		if (!req.session.user) {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, {});
		} else {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {username: req.session.user.username});
		}
	}

	function logout(req, res, next){
		if(!req.session.user){
			return responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, {});
		}

		var username = req.session.user.username;

		req.session.destroy(function() {
			req[C.REQ_REPO].logger.logDebug("User has logged out.", req);
			res.clearCookie("connect.sid", { path: "/" + config.api_server.host_dir });

			responseCodes.respond("Logout POST", req, res, next, responseCodes.OK, {username: username});
		});
	}

	function updateUser(req, res, next){
		let responsePlace = utils.APIInfo(req);

		if(req.body.oldPassword){

			// Update password
			User.updatePassword(req[C.REQ_REPO].logger, req.params[C.REPO_REST_API_ACCOUNT], req.body.oldPassword, req.body.newPassword).then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
			}).catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});

		} else {

			// Update user info
			User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {
				user.updateInfo(req.body);
			}).then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
			}).catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
		}


	}

	function signUp(req, res, next){

		let responsePlace = utils.APIInfo(req);

		if(!req.body.password){
			let err = responseCodes.SIGN_UP_PASSWORD_MISSING;
			return responseCodes.respond(responsePlace, req, res, next, err, err);
		}

		User.createUser(req[C.REQ_REPO].logger, req.params.account, req.body.password, {
			email: req.body.email,
			firstName: req.body.firstName,
			lastName: req.body.lastName
		}, config.tokenExpiry.emailVerify).then( data => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, data);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode, err.resCode ? {} : err);
		});
	}

	function verify(req, res, next){
		
		let responsePlace = utils.APIInfo(req);

		User.verify(req.params[C.REPO_REST_API_ACCOUNT], req.body.token).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err , err.resCode ? err.resCode : err);
		});

	}

	function getAvatar(req, res, next){
		let responsePlace = utils.APIInfo(req);

		// Update user info
		User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {


			if(!user.getAvatar()){
				return Promise.reject({resCode: responseCodes.USER_DOES_NOT_HAVE_AVATAR });
			}

			return Promise.resolve(user.getAvatar());

		}).then(avatar => {

			res.write(avatar.data.buffer);
			res.end();

		}).catch(() => {

			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	module.exports = router;
}());
