/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const express = require("express");
const router = express.Router({mergeParams: true});
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const User = require("../models/user");
const Paypal = require("../models/paypal.js");

router.post("/paypal/ipn", handleIPN);
router.post("/paypal/execute", executeAgreement);

function executeAgreement(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	// execute payment, update billingAgreementId
	const token = req.body.token;

	User.findByPaypalPaymentToken(token).then(dbUser => {
		// important to check there is a user/ghost with this token before executing the agreement
		if(!dbUser) {
			return Promise.reject(responseCodes.PAYMENT_TOKEN_ERROR);
		} else {
			return dbUser.executeBillingAgreement();
		}

	}).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
	});
}

function handleIPN(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	Paypal.handleIPN(req.body);

	// always respond 200 with OK to paypal
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, "OK");
}

module.exports = router;
