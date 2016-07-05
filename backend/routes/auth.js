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

(function() {
	"use strict";
	var express = require("express");
	var router = express.Router({mergeParams: true});
	var responseCodes = require("../response_codes.js");
	var C = require("../constants");
	var middlewares = require("./middlewares");
	var config = require('../config');
	//var systemLogger    = require("../logger.js").systemLogger;
	var utils = require("../utils");
	var User = require("../models/user");
	var Mailer = require("../mailer/mailer");
	var httpsPost = require("../libs/httpsReq").post;
	//var Role = require('../models/role');
	//var crypto = require('crypto');
	var ProjectHelper = require('../models/helper/project');
	var Billing = require('../models/billing');
	var Subscription = require('../models/subscription');

	router.post("/login", login);
	router.get("/login", checkLogin);
	router.post("/logout", logout);
	router.post('/contact', contact);
	router.get("/:account.json", middlewares.loggedIn, listInfo);
	router.get("/:account.jpg", middlewares.hasReadAccessToAccount, getAvatar);
	router.get("/:account/subscriptions", middlewares.hasReadAccessToAccount, listSubscriptions);
	router.get("/:account/billings", middlewares.hasReadAccessToAccount, listBillings);
	router.post('/:account', signUp);
	//router.post('/:account/database', middlewares.canCreateDatabase, createDatabase);
	router.post('/:account/subscriptions', middlewares.canCreateDatabase, createSubscription);
	router.post("/:account/subscriptions/:sid/assign", middlewares.hasWriteAccessToAccount, assignSubscription);
	router.delete("/:account/subscriptions/:sid/assign", middlewares.hasWriteAccessToAccount, removeAssignedSubscription)
	router.post('/:account/verify', middlewares.connectQueue, verify);
	router.post('/:account/forgot-password', forgotPassword);
	router.put("/:account", middlewares.hasWriteAccessToAccount, updateUser);
	router.put("/:account/password", middlewares.hasWriteAccessToAccount, resetPassword);


	function expireSession(req) {
		req.session.cookie.expires = new Date(0);
		req.session.cookie.maxAge = 0;
	}

	function createSession(place, req, res, next, user){

		req.session.regenerate(function(err) {
			if(err) {
				responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {username: user.username});
			} else {
				req[C.REQ_REPO].logger.logDebug("Authenticated user and signed token.");

				req.session[C.REPO_SESSION_USER] = user;
				req.session.cookie.domain        = config.cookie_domain;

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

		req[C.REQ_REPO].logger.logInfo("Authenticating user", { username: req.body.username});

		if(req.session.user){
			return responseCodes.respond(responsePlace, req, res, next, responseCodes.ALREADY_LOGGED_IN, responseCodes.ALREADY_LOGGED_IN);
		}

		User.authenticate(req[C.REQ_REPO].logger, req.body.username, req.body.password).then(user => {

			req[C.REQ_REPO].logger.logInfo("User is logged in", { username: req.body.username});

			expireSession(req);
			createSession(responsePlace, req, res, next, {username: user.user, roles: user.roles});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
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
			req[C.REQ_REPO].logger.logDebug("User has logged out.");
			res.clearCookie("connect.sid", { path: "/" + config.api_server.host_dir });
			responseCodes.respond("Logout POST", req, res, next, responseCodes.OK, {username: username});
		});
	}

	function updateUser(req, res, next){
		let responsePlace = utils.APIInfo(req);

		if(req.body.oldPassword){

			// Update password
			User.updatePassword(req[C.REQ_REPO].logger, req.params[C.REPO_REST_API_ACCOUNT], req.body.oldPassword, null, req.body.newPassword).then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
			}).catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
			});

		} else {

			// Update user info
			User.findByUserName(req.params[C.REPO_REST_API_ACCOUNT]).then(user => {
				return user.updateInfo(req.body);
			}).then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
			}).catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
		}


	}

	function signUp(req, res, next){

		let responsePlace = utils.APIInfo(req);

		if(!config.auth.register){
			responseCodes.respond(responsePlace, req, res, next, responseCodes.REGISTER_DISABLE, responseCodes.REGISTER_DISABLE);
		}

		if(!req.body.password){
			let err = responseCodes.SIGN_UP_PASSWORD_MISSING;
			return responseCodes.respond(responsePlace, req, res, next, err, err);
		}

		//check if captcha is enabled
		let checkCaptcha = config.auth.captcha ? httpsPost(config.captcha.validateUrl, {
			secret: config.captcha.secretKey,
			response: req.body.captcha

		}) : Promise.resolve({
			success: true
		});

		checkCaptcha.then(resBody => {

			if(resBody.success){
				return User.createUser(req[C.REQ_REPO].logger, req.params.account, req.body.password, {
					email: req.body.email,
					firstName: req.body.firstName,
					lastName: req.body.lastName
				}, config.tokenExpiry.emailVerify);
			} else {
				//console.log(resBody);
				return Promise.reject({ resCode: responseCodes.INVALID_CAPTCHA_RES});
			}


		}).then( data => {
			//send verification email
			return Mailer.sendVerifyUserEmail(req.body.email, {
				token : data.token,
				email: req.body.email,
				username: req.params.account,
				pay: req.body.pay
				
			}).catch( err => {
				// catch email error instead of returning to client
				req[C.REQ_REPO].logger.logError(`Email error - ${err.message}`);
				return Promise.resolve(err);
			});

		}).then(emailRes => {

			req[C.REQ_REPO].logger.logInfo('Email info - ' + JSON.stringify(emailRes));
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
		});
	}

	function verify(req, res, next){
		
		let responsePlace = utils.APIInfo(req);

		User.verify(req.params[C.REPO_REST_API_ACCOUNT], req.body.token).then(user => {

			//import toy project
			ProjectHelper.importToyProject(req.params[C.REPO_REST_API_ACCOUNT]).catch(err => {
				req[C.REQ_REPO].logger.logError(JSON.stringify(err));
			});

			//basic quota
			return user.createSubscription('BASIC', user.user, true, null);

		}).then(() => {

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {});

		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err , err.resCode ? err.resCode : err);
		});

	}

	function forgotPassword(req, res, next){
		let responsePlace = utils.APIInfo(req);

		User.getForgotPasswordToken(req.params[C.REPO_REST_API_ACCOUNT], req.body.email, config.tokenExpiry.forgotPassword).then(data => {

			//send forgot password email
			return Mailer.sendResetPasswordEmail(req.body.email, {
				token : data.token,
				email: req.body.email,
				username: req.params[C.REPO_REST_API_ACCOUNT]
			}).catch( err => {
				// catch email error instead of returning to client
				req[C.REQ_REPO].logger.logDebug(`Email error - ${err.message}`);
				return Promise.reject(responseCodes.PROCESS_ERROR('Internal Email Error'));
			});
		
		}).then(emailRes => {
			
			req[C.REQ_REPO].logger.logInfo('Email info - ' + JSON.stringify(emailRes));
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

	function resetPassword(req, res, next){
		let responsePlace = utils.APIInfo(req);

		User.updatePassword(req[C.REQ_REPO].logger, req.params[C.REPO_REST_API_ACCOUNT], null, req.body.token, req.body.newPassword).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account: req.params[C.REPO_REST_API_ACCOUNT] });
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
		});
	}

	function listUserBid(req, res, next){

		let responsePlace = utils.APIInfo(req);
		//let user;

		User.findByUserName(req.params.account).then(user => {

			if(!user){
				return Promise.reject({resCode: responseCodes.USER_NOT_FOUND});
			}

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, user.customData.bids);
		
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});

	}

	function listUserInfo(req, res, next){

		let responsePlace = utils.APIInfo(req);
		let user;

		User.findByUserName(req.params.account).then(_user => {

			if(!_user){
				return Promise.reject({resCode: responseCodes.USER_NOT_FOUND});
			}

			user = _user;
			return user.listAccounts();

		}).then(databases => {

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {
				accounts: databases,
				firstName: user.customData.firstName,
				lastName: user.customData.lastName,
				email: user.customData.email
			});

		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
		});
	}

	function listInfo(req, res, next){

		let responsePlace = utils.APIInfo(req);

		if(req.session.user.username !== req.params.account){

			let getType;

			if(C.REPO_BLACKLIST_USERNAME.indexOf(req.params.account) !== -1){
				getType = Promise.resolve('blacklisted');
			} else {
				getType = User.findByUserName(req.params.account).then(_user => {
					if(!_user){
						return '';
					} else if(!_user.customData.email){
						return 'database';
					} else {
						return 'user';
					}
				});
			}


			getType.then(type => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {type});
			});

		} else if(req.query.hasOwnProperty('bids')){
			listUserBid(req, res, next);
		} else {
			listUserInfo(req, res, next);
		}
	}

	// function createDatabase(req, res, next){


	// 	let responsePlace = utils.APIInfo(req);
	// 	let password = crypto.randomBytes(64).toString('hex');

	// 	//first create the ghost user
	// 	let checkPlan = User.getSubscription(req.body.plan) ? 
	// 		Promise.resolve() : Promise.reject({ resCode: responseCodes.INVALID_SUBSCRIPTION_PLAN });

	// 	return checkPlan.then(() => {
	// 		return User.createUser(req[C.REQ_REPO].logger, req.body.database, password, null, 0);

	// 	}).then(() => {

	// 		return User.findByUserName(req.body.database);


	// 	}).catch(err => {
	// 		//change user exists error message to database exists
	// 		if(err.resCode && err.resCode.value === 55){
	// 			return Promise.reject({ resCode: responseCodes.DATABASE_EXIST });
	// 		} else {
	// 			return Promise.reject(err);
	// 		}

	// 	}).then(dbUser => {
			
	// 		//create a subscription token in this ghost user
	// 		let billingUser = req.params.account;
	// 		return dbUser.createSubscriptionToken(req.body.plan, billingUser);

	// 	}).then(token => {


	// 		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {
	// 			database: req.body.database,
	// 			token: token.token
	// 		});

	// 	}).catch(err => {
	// 		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	// 	});
	// }

	function createSubscription(req, res, next){

		let responsePlace = utils.APIInfo(req);


		User.findByUserName(req.params.account).then(dbUser => {
			let billingUser = req.params.account;
			//return dbUser.createSubscriptionToken(req.body.plan, billingUser);
			return dbUser.buySubscriptions(req.body.plans, billingUser);
		}).then(agreement => {

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {
				url: agreement.url
			});

		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function listSubscriptions(req, res, next){

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account).then(user => {

			let subscriptions = user.getActiveSubscriptions().filter(sub => sub.plan !== Subscription.getBasicPlan().plan);

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscriptions);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function listBillings(req, res, next){

		let responsePlace = utils.APIInfo(req);
		Billing.findByAccount(req.params.account).then(billings => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, billings);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function assignSubscription(req, res, next){

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account).then(dbUser => {
			
			let userData = {};
			
			if(req.body.email){
				userData.email = req.body.email;
			} else if(req.body.user) {
				userData.user = req.body.user;
			}

			return dbUser.assignSubscriptionToUser(req.params.sid, userData);
		}).then(subscription => {
			console.log(subscription);
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscription);
		}).catch( err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function removeAssignedSubscription(req, res, next){

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account).then(dbUser => {
			
			return dbUser.removeAssignedSubscriptionFromUser(req.params.sid);

		}).then(subscription => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscription);
		}).catch( err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function contact(req, res, next){

		let responsePlace = utils.APIInfo(req);

		Mailer.sendContactEmail({
			email: req.body.email,
			name: req.body.name,
			information: req.body.information
		}).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: 'success'});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
		});

	}

	module.exports = router;

}());
