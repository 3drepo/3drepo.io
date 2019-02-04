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

"use strict";

const middlewares = require("../middlewares/middlewares");
const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user");
const responseCodes = require("../response_codes.js");
const config = require("../config");
const utils = require("../utils");

/**
 * @api {get} /subscriptions List all subscriptions
 * @apiName listSubscriptions
 * @apiGroup Subscription
 *
 * @apiDescription List all subscriptions for current user if applicable.
 *
 * @apiError (401) NOT_AUTHORIZED Not Authorized
 * @apiErrorExample {json} Error-Response
 * HTTP/1.1 401 Not Authorized
 * {
 * 	"message":"Not Authorized",
 * 	"status":401,"code":
 * 	"NOT_AUTHORIZED",
 * 	"value":9,
 * 	"place":"GET /nabile/subscriptions"
 * }
 */
router.get("/subscriptions", middlewares.isAccountAdmin, listSubscriptions);

/**
 * @api {get} /subscriptions Update a subscription
 * @apiName updateSubscription
 * @apiGroup Subscription
 */
router.post("/subscriptions", middlewares.isAccountAdmin, updateSubscription);

function updateSubscription(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	User.findByUserName(req.params.account)
		.then(dbUser => {
			const billingUser = req.session.user.username;
			return dbUser.updateSubscriptions(req.body.plans, billingUser, req.body.billingAddress || {});
		})
		.then(agreement => {

			const resData = {
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

	const responsePlace = utils.APIInfo(req);
	User.findByUserName(req.params.account)
		.then(user => {
			const subscriptions = user.customData.billing.getActiveSubscriptions();

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscriptions);
		})
		.catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

module.exports = router;
