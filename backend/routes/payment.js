var express = require("express");
var router = express.Router({mergeParams: true});
var responseCodes = require("../response_codes.js");
var utils = require("../utils");
var User = require('../models/user');
var httpsPost = require('../libs/httpsReq').post;
var querystring = require('../libs/httpsReq').querystring;

// endpoints for paypal IPN message
router.post("/paypal/food", activateSubscription);
router.get("/:token", checkSubscription);

function activateSubscription(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	
	let paymentInfo = req.body;
	let token = paymentInfo.custom;
	let isPaymentIPN = paymentInfo.txn_type === 'subscr_payment';


	let url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';

	let qs = querystring(req.body);
	qs = 'cmd=_notify-validate&' + qs;

	//first verify this message is genuinely coming from paypal
	httpsPost(url, qs).then(resData => {

		if(resData === 'VERIFIED') {
			return Promise.resolve();
		} else {
			return Promise.reject({ message: 'ipn message validation failed'});
		}

	}).then(() => {

		if(isPaymentIPN && paymentInfo.payment_status === 'Completed'){

			return User.activateSubscription(token, paymentInfo);

		} else {

			return Promise.reject({ 
				message: 'handlers for payment status other than "Completed" are not yet implemented',
				body: req.body
			});
		}

	}).then(resData => {
		console.log(resData.subscription, 'payment confirmed and subscription activated');


	}).catch( err => {
		console.log('error:');
		console.log(err);
	});


	//always respond 200 with OK to paypal 
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, 'OK');
}

function checkSubscription(req, res, next){
	'use strict';
	//check subscription by token with having to login, only valid for a 1 hour after the subscription is created

	let responsePlace = utils.APIInfo(req);

	User.findSubscriptionByToken(null, req.params.token).then(subscription => {

		let validDate = new Date(subscription.createdAt.valueOf());
		validDate.setHours(validDate.getHours() + 1);

		let now = new Date();

		if(validDate > now){
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, subscription);
		} else {
			return Promise.reject({ message: 'Expired'});
		}
		
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;