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
	let token = '0de82081d2a72303d781cc778a9b33bfede8dd5b972ffb3a9bed3ca3d877ebc5ddc638c66992adb1b359bbd4e29ed46f0da5017e3d43da36cabc7f40fec7b7ca';
	let paymentInfo = { test : true };
	
	User.activateSubscription(token, paymentInfo).catch(err => {
		console.log(err.stack);
		console.log(err);
	});

	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, 'OK');
}

module.exports = router;