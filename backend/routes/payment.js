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
	let token = '8d6c8f1ecae5fba2f4bab3606ce6201aeebdd51250e740c876bf9b5b9b35ff352082e73c0e45e85b468c0bb55e127c58297beaec9f1e360b0128304e79ca8e17';
	let paymentInfo = { test : true };
	
	User.activateSubscription(token, paymentInfo).catch(err => {
		console.log(err);
	});

	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, 'OK');
}

module.exports = router;