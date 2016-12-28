/**
 *  Copyright (C) 2014 3D Repo Ltd
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

(() => {
	"use strict";

	const paypal = require("paypal-rest-sdk");
	const paypalTrans = require("./paypal_trans.js");
	const responseCodes = require("../response_codes.js");
	const moment = require("moment");
	const url = require("url");
	const C = require("../constants");
	const systemLogger = require("../logger.js").systemLogger;
	const config = require('../config');
	const httpsPost = require('../libs/httpsReq').post;
	const querystring = require('../libs/httpsReq').querystring;
	const Mailer = require('../mailer/mailer');
	const IPN = require('./ipn');
	const Invoice = require('./invoice');

	paypal.configure({
		'mode': config.paypal.mode, //sandbox or live
		'client_id': config.paypal.client_id,
		'client_secret': config.paypal.client_secret,
	});

	let updateBillingAddress = function (billingAgreementId, billingAddress) {


		const paypalAddress = paypalTrans.getPaypalAddress(billingAddress);

		let updateOps = [{
			"op": "replace",
			"path": "/",
			"value": {
				"shipping_address": paypalAddress
			}
		}];

		return new Promise((resolve, reject) => {
			paypal.billingAgreement.update(billingAgreementId, updateOps, function (err/*, billingAgreement*/) {
				if (err) {
					//console.log(JSON.stringify(err, null , 2));
					let paypalError = JSON.parse(JSON.stringify(responseCodes.PAYPAL_ERROR));
					paypalError.message = err.response.message;
					reject(paypalError);
				} else {
					resolve(paypalAddress);
				}
			});
		});
	};

	let cancelOldAgreement = function(billingAgreementId) { 

		let cancel_note = {
			"note": "You have updated the licence subscriptions."
		};

		return new Promise((resolve, reject) => {
			paypal.billingAgreement.cancel(billingAgreementId, cancel_note, (err) => {
				if (err) {
					systemLogger.logError(JSON.stringify(err),{ 
						billingAgreementId: billingAgreementId
					});

					reject(err);
				} else {
					systemLogger.logInfo("Billing agreement cancelled successfully", { 
						billingAgreementId: billingAgreementId
					});
					resolve();
				}
			});
		});
	};

	let createBillingAgreement = function(billing, payments, paymentDate) { 
		let paymentDefs = [];
		let hasProRata = false;
		let proRataAmount = 0.0;
		let regularAmount = 0.0;
		let startDate = paymentDate;

		// Translate payments to paypal specific
		payments.forEach(function(payment) {
			//console.log(payment);

			if (payment.type === C.PRO_RATA_PAYMENT) { 
				hasProRata = true;
				proRataAmount += payment.gross;
			 } else if (payment.type === C.REGULAR_PAYMENT) {
				regularAmount += payment.gross;
			 }

			paymentDefs.push(paypalTrans.getPaypalPayment(payment));
		});

		let billingPlanAttributes = paypalTrans.getBillingPlanAttributes(billing.billingUser, paymentDefs);
		//console.log(JSON.stringify(billingPlanAttributes, null , 2));

		return new Promise((resolve, reject) => {

			// create plan
			//console.log('create plan');
			paypal.billingPlan.create(billingPlanAttributes, function (err, billingPlan) {

				if (err) {
					//console.log(JSON.stringify(err, null , 2));
					let paypalError = JSON.parse(JSON.stringify(responseCodes.PAYPAL_ERROR));
					paypalError.message = err.response && err.response.message || err.message;
					reject(paypalError);
				} else {
					resolve(billingPlan);
				}
			});

		})
		.then(billingPlan => {

			//activate plan
			//console.log('activate plan');
			return new Promise((resolve, reject) => {
				let billingPlanUpdateAttributes = [{
					"op": "replace",
					"path": "/",
					"value": {
						"state": "ACTIVE"
					}
				}];

				paypal.billingPlan.update(billingPlan.id, billingPlanUpdateAttributes, function (err) {
					if (err) {
						//console.log(JSON.stringify(err, null , 2));
						let paypalError = JSON.parse(JSON.stringify(responseCodes.PAYPAL_ERROR));

						paypalError.message = err.response.message;
						reject(paypalError);
					} else {
						resolve(billingPlan);
					}
				});

			});
		})
		.then(billingPlan => {

			//create agreement
			//console.log('create agreement');
			return new Promise((resolve, reject) => {

				let desc = "";
				if (hasProRata) {
					desc += `This month's pro-rata: £${proRataAmount}. `;
				}
				desc += `Regular monthly recurring payment £${regularAmount}. This agreement starts on ${moment(startDate).utc().format('Do MMM YYYY')}`;

				let billingAgreementAttributes = paypalTrans.getBillingAgreementAttributes(
					billingPlan.id, 
					startDate, 
					paypalTrans.getPaypalAddress(billing.billingInfo),
					desc
				);
				
				//console.log(JSON.stringify(billingAgreementAttributes, null , 2));

				paypal.billingAgreement.create(billingAgreementAttributes, function (err, billingAgreement) {
					if (err) {
						//console.log(JSON.stringify(err, null , 2));
						let paypalError = JSON.parse(JSON.stringify(responseCodes.PAYPAL_ERROR));
						paypalError.message = err.response.message;
						reject(paypalError);
					} else {

						let link = billingAgreement.links.find(link => link.rel === "approval_url");
						let token = url.parse(link.href, true)
							.query.token;

						resolve({
							url: link.href,
							paypalPaymentToken: token,
							agreement: billingAgreement
						});
					}
				});

			});

		});

	};

	let processPayments = function(billing, payments, paymentDate) {
		// Cancel old agreements and then create new ones 

		// don't cancel agreement here. only cancel after executing billing agreement
		// otherwise if user decide not to complete the payment in paypal page it will
		// leave users with no agreements at all in their account
		//cancelOldAgreement(this).then(function() {
			return createBillingAgreement(billing, payments, paymentDate);
		//});
	};

	let executeAgreement = function(token){

		return new Promise((resolve, reject) => {
			paypal.billingAgreement.execute(token, {}, (err, billingAgreement) => {

				//console.log(billingAgreement);
				if (err) {
					reject(err);
				} else if(
					(config.paypal.debug && config.paypal.debug.forceExecuteAgreementError) || 
					['Expired', 'Suspended', 'Cancelled'].indexOf(billingAgreement.state) !== -1
				){
					reject(responseCodes.EXECUTE_AGREEMENT_ERROR);

				} else {
					//console.log('billingAgreement', billingAgreement);
					resolve(billingAgreement);
				}
			});
		});
	};

	let validateIPN = function(data){

		// skip ipn validation 
		if(!config.paypal.validateIPN){
			return Promise.resolve();
		}


		let url = config.paypal.ipnValidateUrl;
		let qs = querystring(data);
		qs = 'cmd=_notify-validate&' + qs;


		//first verify this message is genuinely coming from paypal
		return httpsPost(url, qs).then(resData => {
			if(resData === 'VERIFIED') {
				return Promise.resolve();
			} else {
				return Promise.reject({ message: 'ipn message validation failed'});
			}

		});
	};

	let determineIPNType = function(paymentInfo){

		let type = paymentInfo.txn_type;

		if(type === 'recurring_payment_profile_created'){
			return C.IPN_PAYMENT_INIT;
		} else if (type === 'recurring_payment' && paymentInfo.payment_status === 'Completed'){
			return C.IPN_PAYMENT_SUCCESS;
		} else if (type === 'recurring_payment_profile_cancel'){
			return C.IPN_PAYMENT_CANCEL;
		} else if (type === 'recurring_payment_suspended' || type === 'recurring_payment_suspended_due_to_max_failed_payment'){
			return C.IPN_PAYMENT_SUSPENDED;
		} else if (type === 'recurring_payment_failed' || type === 'recurring_payment_skipped'){
			return C.IPN_PAYMENT_FAILED;
		} else if (paymentInfo.payment_status === 'Refunded'){
			return C.IPN_PAYMENT_REFUNDED;
		}

		return C.IPN_UNKONWN;
	};

	let handleIPN = function(paymentInfo){
		const User = require('./user');

		let billingAgreementId = paymentInfo.recurring_payment_id;
		let ipnType = determineIPNType(paymentInfo);
		//console.log('ipnType', ipnType);
		//save IPN
		IPN.save(paymentInfo).catch(err => {
			systemLogger.logError('Failed to save IPN', {err: err, billingAgreementId: billingAgreementId} );
		});

		validateIPN(paymentInfo).then(() => {

			if(ipnType === C.IPN_PAYMENT_INIT){
				//ignore
				systemLogger.logInfo('Payment init IPN', {billingAgreementId: billingAgreementId} );

			} else if(ipnType === C.IPN_PAYMENT_SUCCESS){

				return User.activateSubscription(billingAgreementId, {

					gateway: 'PAYPAL',
					currency: paymentInfo.currency_code,
					amount: paymentInfo.mc_gross,
					createBilling: true,
					ipnDate: new Date(paymentInfo.payment_date || paymentInfo.time_created),
					nextPaymentDate:  new Date(paymentInfo.next_payment_date),
					taxAmount: paymentInfo.tax,
					nextAmount: paymentInfo.amount_per_cycle,
					transactionId: paymentInfo.txn_id

				}, paymentInfo).then(() => {
					systemLogger.logInfo('payment confirmed and licenses activated', { billingAgreementId });
				});

			} else if (ipnType === C.IPN_PAYMENT_CANCEL) {
				// ignore
				systemLogger.logInfo('IPN said subscription canceled', { billingAgreementId });

		    } else if (ipnType === C.IPN_PAYMENT_FAILED){


				return User.findUserByBillingId(billingAgreementId).then(user => {

					if(!user){
						return Promise.reject({ message: `User with billingId ${billingAgreementId} not found`});
					}

					systemLogger.logInfo('Payment failed', { billingAgreementId, user: user.user });

					User.findByUserName(user.customData.billing.billingUser).then(billingUser => {
						Mailer.sendPaymentFailedEmail(billingUser.customData.email, {
							amount: paymentInfo.currency_code +  ' ' + (paymentInfo.mc_gross || paymentInfo.initial_payment_amount)
						});
					});

				});
				
			} else if (ipnType === C.IPN_PAYMENT_SUSPENDED) {

				return User.findUserByBillingId(billingAgreementId).then(user => {

					if(!user){
						return Promise.reject({ message: `User with billingId ${billingAgreementId} not found`, ipn: paymentInfo});
					}

					systemLogger.logInfo('Billing agreement suspended', { billingAgreementId, user: user.user });

					User.findByUserName(user.customData.billing.billingUser).then(billingUser => {
						Mailer.sendSubscriptionSuspendedEmail(billingUser.customData.email, { billingUser: billingUser.user });
					});

				});

			} else if (ipnType === C.IPN_PAYMENT_REFUNDED){

				return User.findUserByBillingId(billingAgreementId).then(user => {

					if(!user){
						return Promise.reject({ message: `User with billingId ${billingAgreementId} not found`, ipn: paymentInfo});
					}

					Invoice.createRefund(user, {
						billingAgreementId: billingAgreementId,
						raw: paymentInfo,
						gateway: 'PAYPAL',
						currency: paymentInfo.currency_code,
						amount: paymentInfo.mc_gross,
						transactionId: paymentInfo.txn_id,
						paymentDate: new Date(paymentInfo.payment_date)

					}).then(() => {
						systemLogger.logInfo('Created and sent refund invoice to user', { billingAgreementId, user: user.user });
					}).catch(err => {
						//console.log(err.stack);
						systemLogger.logError('Error while creating refund notice', {err: err, user: user.user, ipn: paymentInfo} );
					});

				});

			} else if(ipnType === C.IPN_UNKONWN) {

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


				User.findUserByBillingId(billingAgreementId).then(user => {

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
	};

	module.exports = {
		updateBillingAddress: updateBillingAddress,
		processPayments: processPayments,
		cancelOldAgreement: cancelOldAgreement,
		executeAgreement: executeAgreement,
		validateIPN: validateIPN,
		handleIPN: handleIPN
	};

})();