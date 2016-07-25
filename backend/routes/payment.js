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
// var moment = require('moment');
// var getSubscription = require('../models/subscription').getSubscription;

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

		// important to check there is a user/ghost with this token before executing the agreement
		if(!dbUser){
			return Promise.reject({resCode: responseCodes.PAYMENT_TOKEN_ERROR});
		} else {
			return new Promise((resolve, reject) => {
				paypal.billingAgreement.execute(token, {}, (err, billingAgreement) => {

					console.log(billingAgreement);

					if (err) {
						reject(err);
					} else if(
						(config.paypal.debug && config.paypal.debug.forceExecuteAgreementError) || 
						['Expired', 'Suspended', 'Cancelled'].indexOf(billingAgreement.state) !== -1
					){
						reject({ resCode: responseCodes.EXECUTE_AGREEMENT_ERROR });

					} else {

						if(dbUser.customData.billingAgreementId && dbUser.customData.billingAgreementId !== billingAgreement.id){
							//cancel the old agreement, if any
							var cancel_note = {
								"note": "You have updated the license subscriptions. This agreement is going to be replaced by the new one."
							};

							paypal.billingAgreement.cancel(dbUser.customData.billingAgreementId, cancel_note, function (err) {
								if (err) {
									req[C.REQ_REPO].logger.logError(JSON.stringify(err));
								} else {
									req[C.REQ_REPO].logger.logInfo("Old billing agreement canceled successfully", { billingAgreementId: dbUser.customData.billingAgreementId});
								}
							});
						}

						dbUser.executeBillingAgreement(token, billingAgreement.id);
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
	let isSubscriptionSuspended = paymentInfo.txn_type === 'recurring_payment_suspended' || paymentInfo.txn_type === 'recurring_payment_suspended_due_to_max_failed_payment';

	let paymentOrSubscriptionSuccess = isPaymentIPN && paymentInfo.payment_status === 'Completed';
	//let paymentPending = isPaymentIPN && paymentInfo.payment_status === 'Pending';
	let paymentFailed = paymentInfo.txn_type === 'recurring_payment_failed' || paymentInfo.txn_type === 'recurring_payment_skipped';


	let url = config.paypal.ipnValidateUrl;

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


		if(isSubscriptionInitIPN){
			//ignore
		} else if(paymentOrSubscriptionSuccess){

			return User.activateSubscription(billingAgreementId, {

				gateway: 'PAYPAL',
				currency: paymentInfo.currency_code,
				amount: isSubscriptionInitIPN ? paymentInfo.initial_payment_amount : paymentInfo.mc_gross,
				createBilling: true,
				ipnDate: new Date(paymentInfo.time_created),
				nextPaymentDate:  new Date(paymentInfo.next_payment_date),
				taxAmount: paymentInfo.tax

			}, paymentInfo).then(resData => {
				systemLogger.logInfo('payment confirmed and licenses activated', resData.subscriptions.toObject());
			});

		} else if (isSubscriptionCancelled) {
			// ignore
			systemLogger.logInfo('IPN said subscription canceled', { billingAgreementId });

	    } else if (paymentFailed){


			return User.findBillingUserByBillingId(billingAgreementId).then(user => {

				if(!user){
					return Promise.reject({ message: `User with billingId ${billingAgreementId} not found`});
				}

				systemLogger.logInfo('Payment failed', { billingAgreementId, user: user.user });

				Mailer.sendPaymentFailedEmail(user.customData.email, {
					amount: paymentInfo.currency_code +  ' ' + (paymentInfo.mc_gross || paymentInfo.initial_payment_amount)
				});
			});
			
		} else if (isSubscriptionSuspended) {

			return User.findBillingUserByBillingId(billingAgreementId).then(user => {

				if(!user){
					return Promise.reject({ message: `User with billingId ${billingAgreementId} not found`});
				}

				systemLogger.logInfo('Billing agreement suspended', { billingAgreementId, user: user.user });

				Mailer.sendSubscriptionSuspendedEmail(user.customData.email, { billingUser: user.customData.billingUser });

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
					billingUser: user && user.user,
					email: user && user.customData.email,
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