var express = require("express");
var router = express.Router({mergeParams: true});
var responseCodes = require("../response_codes.js");
var utils = require("../utils");
var User = require('../models/user');
var Paypal = require("../models/paypal.js");

// var moment = require('moment');
// var getSubscription = require('../models/subscription').getSubscription;

// endpoints for paypal IPN message
router.post("/paypal/ipn", handleIPN);

//capture a pre-approve payment
router.post("/paypal/execute", executeAgreement);

function executeAgreement(req, res, next){
	'use strict';
	let responsePlace = utils.APIInfo(req);

	// execute payment, update billingAgreementId
	let token = req.body.token;

	User.findByPaypalPaymentToken(token).then(dbUser => {
		// important to check there is a user/ghost with this token before executing the agreement
		if(!dbUser){
			return Promise.reject(responseCodes.PAYMENT_TOKEN_ERROR);
		} else {
			return dbUser.executeBillingAgreement();
		}
		
	}).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}


function handleIPN(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	Paypal.handleIPN(req.body);

	//always respond 200 with OK to paypal 
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, 'OK');
}



module.exports = router;
