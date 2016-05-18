var express = require("express");
var router = express.Router({mergeParams: true});
var responseCodes = require("../response_codes.js");
var utils = require("../utils");
var User = require('../models/user');
// endpoints for paypal IPN message
router.post("/paypal/food", activateSubscription);

function activateSubscription(req, res, next){
	'use strict';
	// some logic to check the ipn message here then activate the subscription
	// respond HTTP 200 with OK string
	let responsePlace = utils.APIInfo(req);
	let token = '04606524a4d0600a80d06b173b3eb4c1e6e199f035133876abffaf2e49f7f830a085933dd28057344016ccbfccceda8357c2767043aa6635866a457352de457a';
	let paymentInfo = { test : true };
	
	User.activateSubscription(token, paymentInfo).catch(err => {
		console.log(err);
	});

	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, 'OK');
}

module.exports = router;