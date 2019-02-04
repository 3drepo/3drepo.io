"use strict";
const express = require("express");
const router = express.Router({mergeParams: true});
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const User = require("../models/user");
const Paypal = require("../models/paypal.js");

// endpoints for paypal IPN message

/**
 * @api {post} /paypal/ipn Create Paypal IPN message
 * @apiName handleIPN
 * @apiGroup Payment
 * @apiParam id Unique Notification ID
 */
router.post("/paypal/ipn", handleIPN);

/**
 * @api {post} /paypal/ipn Capture a pre-approve payment
 * @apiName executeAgreement
 * @apiGroup Payment
 */
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
