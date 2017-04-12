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

(() => {
	"use strict";

	const middlewares = require("./middlewares");
	const express = require("express");
	const router = express.Router({ mergeParams: true });
	const User = require("../models/user");
	const responseCodes = require("../response_codes.js");
	const config = require("../config");
	const utils = require("../utils");

	router.get("/subscriptions", middlewares.isAccountAdmin, listSubscriptions);
	router.post("/subscriptions", middlewares.isAccountAdmin, createSubscription);
	router.post("/subscriptions/:sid/assign", middlewares.isAccountAdmin, assignSubscription);
	router.put("/subscriptions/:sid/assign", middlewares.isAccountAdmin, updateAssignDetail);
	router.delete("/subscriptions/:sid/assign", middlewares.isAccountAdmin, removeAssignedSubscription);

	function createSubscription(req, res, next) {

		let responsePlace = utils.APIInfo(req);
		let dbUser;

		User.findByUserName(req.params.account)
			.then(_dbUser => {

				dbUser = _dbUser;
				let billingUser = req.session.user.username;
				return dbUser.buySubscriptions(req.body.plans, billingUser, req.body.billingAddress || {});
			})
			.then(agreement => {

				let resData = {
					url: agreement.url
				};

				if (config.paypal.debug && config.paypal.debug.showFullAgreement) {
					resData.agreement = agreement.agreement;
				}

				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, resData);

			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	function listSubscriptions(req, res, next) {

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account)
			.then(user => {
				let subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true});

				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscriptions);
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	function assignSubscription(req, res, next) {

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account)
			.then(dbUser => {

				let userData = {};

				if (req.body.email) {
					userData.email = req.body.email;
				} else if (req.body.user) {
					userData.user = req.body.user;
				}

				if (req.body.job) {
					userData.job = req.body.job;
				}

				return dbUser.assignSubscriptionToUser(req.params.sid, userData);
			})
			.then(subscription => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscription);
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	function updateAssignDetail(req, res, next){
		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account)
			.then(dbUser => {

				return dbUser.updateAssignDetail(req.params.sid, req.body);
			})
			.then(subscription => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscription);
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	function removeAssignedSubscription(req, res, next) {

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account)
			.then(dbUser => {

				return dbUser.removeAssignedSubscriptionFromUser(req.params.sid, req.query.cascadeRemove);

			})
			.then(subscription => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscription);
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? err.info : err);
			});
	}

	module.exports = router;
})();