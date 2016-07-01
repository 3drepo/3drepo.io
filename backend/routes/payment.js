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
var paypal = require('../models/payment').paypal;
var C = require("../constants");
var moment = require('moment');
var getSubscription = require('../models/subscription').getSubscription;

// endpoints for paypal IPN message
router.post("/paypal/food", activateSubscription);

//capture a pre-approve payment
router.post("/paypal/execute", executeAgreement);


function executeAgreement(req, res, next){
	'use strict';
	let responsePlace = utils.APIInfo(req);

	// execute payment, update billingAgreementId
	let token = req.body.token;
	let dbUser;


	User.findByPaypalPaymentToken(token).then(_dbUser => {

		dbUser = _dbUser;
		let next;

		// important to check there is a user/ghost with this token before executing the agreement
		if(!dbUser){
			return Promise.reject({message: 'Payment token not found. Someone has updated your subscriptions while you are trying to pay.'});
		} else {
			return new Promise((resolve, reject) => {
				paypal.billingAgreement.execute(token, {}, (err, billingAgreement) => {

					console.log(billingAgreement);

					if (err) {
						reject(err);
					} else {

						if(dbUser.customData.billingAgreementId){
							//cancel the old agreement, if any
							var cancel_note = {
								"note": "You have updated the license subscriptions. This agreement is going to be replaced by the new one."
							};

							paypal.billingAgreement.cancel(dbUser.customData.billingAgreementId, cancel_note, function (err, res) {
								if (err) {
									req[C.REQ_REPO].logger.logError(JSON.stringify(err));
								} else {
									req[C.REQ_REPO].logger.logInfo("Old billing agreement canceled successfully", { billingAgreementId: dbUser.customData.billingAgreementId});
								}
							});
						}

						dbUser.customData.paypalPaymentToken = token;
						dbUser.customData.billingAgreementId = billingAgreement.id;

						let assignedBillingUser = false;

						dbUser.customData.subscriptions.forEach(subscription => {

							if(subscription.assignedUser === dbUser.customData.billingUser){
								assignedBillingUser = true;
							}

							subscription.inCurrentAgreement = true;
		
							// pre activate
							// don't wait for IPN message to confirm but to activate the subscription right away, for 2 hours.
							// IPN message should come quickly after executing an agreement, usually less then a minute
							let twoHoursLater = moment().utc().add(2, 'hour').toDate();
							if(!subscription.expiredAt || subscription.expiredAt < twoHoursLater){
								subscription.active = true;
								subscription.expiredAt = twoHoursLater;
								subscription.limits = getSubscription(subscription.plan).limits;
							}

						});

						if(!assignedBillingUser){

							let subscriptions = dbUser.customData.subscriptions;
							
							for(let i=0; i < subscriptions.length; i++){
								if(!subscriptions[i].assignedUser){
									subscriptions[i].assignedUser = dbUser.customData.billingUser;
									break;
								}
							}
						}

						resolve();
					}
				});
			});
		}
	}).then(() => {
		return dbUser.save();
	}).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { });
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}



//recurring_payment_profile_created
//recurring_payment
//recurring_payment_id
//payment_status
//initial_payment_status

function activateSubscription(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	
	let paymentInfo = req.body;
	let billingAgreementId = paymentInfo.recurring_payment_id;
	let isPaymentIPN = paymentInfo.txn_type === 'recurring_payment';
	let isSubscriptionInitIPN = paymentInfo.txn_type === 'recurring_payment_profile_created';
	let isSubscriptionCancelled = paymentInfo.txn_type === 'recurring_payment_profile_cancel';

	let paymentOrSubscriptionSuccess = isPaymentIPN && paymentInfo.payment_status === 'Completed' || isSubscriptionInitIPN;
	//let paymentPending = isPaymentIPN && paymentInfo.payment_status === 'Pending';
	let paymentFailed = paymentInfo.txn_type === 'recurring_payment_failed';


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

			return User.activateSubscription(billingAgreementId, {

				gateway: 'PAYPAL',
				currency: paymentInfo.currency_code,
				amount: isSubscriptionInitIPN ? paymentInfo.initial_payment_amount : paymentInfo.mc_gross,
				subscriptionSignup: isSubscriptionInitIPN,
				createBilling: true,
				ipnDate: new Date(paymentInfo.time_created)

			}, paymentInfo).then(resData => {
				systemLogger.logInfo('payment confirmed and licenses activated', resData.subscriptions.toObject());
			});

		} else if (isSubscriptionCancelled) {
			// ignore

	    } else if (paymentFailed){

	    	console.log('Payment failed');
			User.findBillingUserByBillingId(billingAgreementId).then(user => {
				Mailer.sendPaymentFailedEmail(user.customData.email, {
					amount: paymentInfo.mc_currency +  ' ' + paymentInfo.mc_gross
				});
			});
			
		} else {

			//other payment status we don't know how to deal with
			return Promise.reject({ message: 'unexpected ipn message type'});
		}

	}).catch( err => {
		
		// log error and send email to support
		if(err){

			systemLogger.logError('Error while activating subscription', {err: err, billingAgreementId: billingAgreementId} );
			if(err.stack){
				systemLogger.logError(err.stack);
			}


			User.findBillingUserByBillingId(billingAgreementId).then(user => {
				Mailer.sendPaymentErrorEmail({
					ipn: JSON.stringify(paymentInfo),
					billingUser: user.user,
					email: user.customData.email,
					errmsg: JSON.stringify(err),
					billingAgreementId: billingAgreementId
				});
			});
		}

	});


	//always respond 200 with OK to paypal 
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, 'OK');
}



module.exports = router;