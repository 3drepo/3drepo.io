var express = require("express");
var router = express.Router({mergeParams: true});
var responseCodes = require("../response_codes.js");
var utils = require("../utils");
var User = require('../models/user');
var Mailer = require('../mailer/mailer');
var httpsPost = require('../libs/httpsReq').post;
var querystring = require('../libs/httpsReq').querystring;
var config = require('../config');
var systemLogger = require("../logger.js").systemLogger;

// endpoints for paypal IPN message
router.post("/paypal/food", activateSubscription);
router.get("/:token", checkSubscription);

function activateSubscription(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	
	let paymentInfo = req.body;
	let token = paymentInfo.custom;
	let isPaymentIPN = paymentInfo.txn_type === 'subscr_payment';
	let isSubscriptionInitIPN = paymentInfo.txn_type === 'subscr_signup';
	let isSubscriptionCancelled = paymentInfo.txn_type === 'subscr_cancel';

	let paymentOrSubscriptionSuccess = isPaymentIPN && paymentInfo.payment_status === 'Completed' || isSubscriptionInitIPN;
	//let paymentPending = isPaymentIPN && paymentInfo.payment_status === 'Pending';
	let paymentFailed = paymentInfo.txn_type === 'subscr_failed';


	let url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';

	let qs = querystring(req.body);
	qs = 'cmd=_notify-validate&' + qs;


	let validateIPN = httpsPost(url, qs);

	// skip ipn validation 
	if(!config.paypal.validateIPN){
		validateIPN = Promise.resolve('VERIFIED');
	}

	//first verify this message is genuinely coming from paypal
	validateIPN.then(resData => {

		if(resData === 'VERIFIED') {
			return Promise.resolve();
		} else {
			return Promise.reject({ message: 'ipn message validation failed'});
		}

	}).then(() => {

		if(paymentOrSubscriptionSuccess){

			return User.activateSubscription(token, {

				gateway: 'PAYPAL',
				currency: paymentInfo.mc_currency,
				amount: isSubscriptionInitIPN ? 0.00 : paymentInfo.mc_gross,
				subscriptionSignup: isSubscriptionInitIPN,
				createBilling: !isSubscriptionInitIPN

			}, paymentInfo).then(resData => {
				systemLogger.logInfo('payment confirmed and subscription activated', resData.subscription.toObject());
			});

		} else if (isSubscriptionCancelled) {
			// to be imple...

	    } else if (paymentFailed){

			User.findBillingUserByToken(token).then(user => {
				Mailer.sendPaymentFailedEmail(user.customData.email, {
					amount: paymentInfo.mc_currency +  ' ' + paymentInfo.payment_gross
				});
			});
			
		} else {

			//other payment status we don't know how to deal with
			return Promise.reject({ message: 'unexpected ipn message type'});
		}

	}).catch( err => {
		
		// log error and send email to support
		if(err){

			systemLogger.logError('Error while activating subscription', {err: err, token: token} );
			if(err.stack){
				systemLogger.logError(err.stack);
			}


			User.findBillingUserByToken(token).then(user => {
				Mailer.sendPaymentErrorEmail({
					ipn: JSON.stringify(paymentInfo),
					billingUser: user.user,
					email: user.customData.email,
					errmsg: JSON.stringify(err),
					subscriptionToken: token
				});
			});
		}

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