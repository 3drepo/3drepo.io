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
const utils = require("../utils");
const UserBilling = require("../models/userBilling");

/**
 * @api {get} /:teamspace/subscriptions List subscriptions
 * @apiName listSubscriptions
 * @apiGroup Subscription
 *
 * @apiDescription List all subscriptions for current user if applicable.
 *
 * @apiPermission teamSpaceAdmin
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/subscriptions HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *    basic: {
 *       collaborators: 0,
 *       data: 200
 *    },
 *    discretionary: {
 *       collaborators: "unlimited",
 *       data: 10240,
 *       expiryDate: null
 *    }
 * }
 *
 * @apiError (401) NOT_AUTHORIZED Not Authorized
 * @apiErrorExample {json} Error-Response
 * HTTP/1.1 401 Not Authorized
 * {
 *	"message":"Not Authorized",
 *	"status":401,"code":
 *	"NOT_AUTHORIZED",
 *	"value":9,
 *	"place":"GET /teamSpace1/subscriptions"
 * }
 */
router.get("/subscriptions", middlewares.isAccountAdmin, listSubscriptions);

router.post("/subscriptions", middlewares.isAccountAdmin, updateSubscription);

function updateSubscription(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	User.findByUserName(req.params.account)
		.then(dbUser => {
			const billingUser = req.session.user.username;
			return User.updateSubscriptions(dbUser, req.body.plans, billingUser, req.body.billingAddress || {});
		})
		.then(agreement => {

			const resData = {
				url: agreement.url
			};
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, resData);

		})
		.catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

function listSubscriptions(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	User.findByUserName(req.params.account)
		.then(async ({ user }) => {
			const subscriptions = await UserBilling.getSubscriptions(user);

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscriptions);
		})
		.catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

module.exports = router;
