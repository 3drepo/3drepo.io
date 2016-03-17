var express = require('express');
var router = express.Router({mergeParams: true});
// var dbInterface = require("../db/db_interface.js");
var responseCodes = require('../response_codes.js');
var C = require("../constants");
var middlewares = require('./middlewares');
var config = require("app-config").config;
var systemLogger    = require("../logger.js").systemLogger;
var utils = require('../utils');
var User = require('../models/user');

router.post('/login', login);
router.get('/login', checkLogin);
router.post('/logout', logout);
router.get('/:account.jpg', middlewares.loggedIn, getAvatar);
router.post('/:account', middlewares.loggedIn, updateUser);

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

			if (config.cookie.maxAge)
			{
				req.session.cookie.maxAge = config.cookie.maxAge;
			}
			responseCodes.respond(place, req, res, next, responseCodes.OK, {username: user.username, roles: user.roles});
		}
	});
}

function login(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);

	req[C.REQ_REPO].logger.logInfo('Authenticating user', req.body.username);
	User.authenticate(req.body.username, req.body.password).then(user => {

		req[C.REQ_REPO].logger.logInfo("User is logged in", req.body.username);

		expireSession(req);
		createSession(responsePlace, req, res, next, {username: user.user, roles: user.roles});

	}).catch(err => {
		console.log(err);
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
	'use strict';

	let responsePlace = utils.APIInfo(req);

	if(req.body.oldPassword){
		
		// Update password
		User.updatePassword(req.params[C.REPO_REST_API_ACCOUNT], req.body.oldPassword, req.body.newPassword).then(() => {
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


function getAvatar(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);

	// Update user info
	User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {
		

		if(!user.getAvatar()){
			return Promise.reject({resCode: responseCodes.USER_DOES_NOT_HAVE_AVATAR });
		}

		return Promise.resolve(user.getAvatar());

	}).then(avatar => {

		res.write(avatar.buffer);
		res.end();

	}).catch(err => {

		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;