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

	const mongoose = require("mongoose");
	const Subscriptions = require("./subscriptions");
	const billingAddressInfo = require("./billingAddress");
	const moment = require("moment");
	const Subscription = require("./subscription");
	const vat = require("./vat");
	const utils = require("../utils");
	const C = require("../constants");
	const Paypal = require("./paypal.js");
	const Invoice = require("./invoice.js");
	const responseCodes = require("../response_codes.js");
	const Counter = require("./counter");

	let getSubscription = Subscription.getSubscription;

	let subscriptionSchema = new mongoose.Schema({
		active: Boolean,
		updatedAt: Date,
		createdAt: Date,
		billingUser: String,
		assignedUser: String,
		expiredAt: Date,
		
		limits: {
			collaboratorLimit : {type: Number, default: 0},
			spaceLimit : {type: Number, default: 0}
		},

		token: String,
		plan: String,
		inCurrentAgreement: Boolean,
		pendingDelete: Boolean,
		//newPurchased: Boolean,
		database: String
	});

	let billingSchema = new mongoose.Schema({
		subscriptions: { 
			type: [subscriptionSchema], 
			get: function (subs) { 
				return new Subscriptions(this.billingUser, this.billingInfo, subs); 
			} 
		},
		billingInfo: { type: billingAddressInfo, default: {} },
		//global billing info
		billingAgreementId: String,
		paypalPaymentToken: String,
		billingUser: String,
		lastAnniversaryDate: Date,
		nextPaymentDate: Date
	});

	let bills = [];

	// billingSchema.virtual("bills").get(function () {
	// 	if (!bills.length) {
	// 		let billPromises = Billing.findByAgreementId(this.billingUser, this.billingAgreementId).then(bill => {
	// 			return new Promise(function (resolve) {
	// 				bills.push(bill);
	// 				resolve();
	// 			});
	// 		});

	// 		Promise.all(billPromises).then(function() {
	// 			return bills;
	// 		});
	// 	} else {
	// 		return bills;
	// 	}
	// });

	// Wrapper for VAT calculation and payment information
	let calTax = function(gross, countryCode, isBusiness){
		return gross * vat.getByCountryCode(countryCode, isBusiness);
	};

	let Payment = function (type, grossAmount, countryCode, isBusiness, length) {
		this.type = type;
		this.gross = grossAmount;
		this.tax = calTax(this.gross, countryCode, isBusiness);
		this.net = this.gross + this.tax;
		this.length = length;
		this.currency = "GBP";

		this.gross = utils.roundToNDP(this.gross, 2.0);
		this.net = utils.roundToNDP(this.net, 2.0);
		this.tax = utils.roundToNDP(this.tax, 2.0);
	};

	billingSchema.methods.calculateAmounts = function(paymentDate, changes) {

		let country = this.billingInfo.countryCode;
		let isBusiness = this.billingInfo.vat;

		let proRataLength = { value: -1, unit: "DAY" };
		let regularCycleLength = { value: 1, unit: "MONTH" };

		let payments = [];

		// For all licences that we need to purchase add up amount * quantity
		let regularAmount = changes.regularPeriodPlans.reduce((sum, licence) => {
			return sum + getSubscription(licence.plan).amount * licence.quantity;
		}, 0);

		let proRataAmount = changes.proRataPeriodPlans.reduce((sum, licence) => {
			return sum + getSubscription(licence.plan).amount * licence.quantity;
		}, 0);


		console.log(changes);
		let nextPaymentDate = moment(this.nextPaymentDate);

		if (proRataAmount) {
			console.log('pro-rata');
			// The length of the pro-rata period is difference between now and next payment date
			proRataLength.value = Math.round(moment.duration(nextPaymentDate.diff(moment(paymentDate).utc().startOf("date"))).asDays());

			// Calculate percentage of payment period * cost of the period.
			let proRataFactor = proRataLength.value / Math.round(moment.duration(nextPaymentDate.diff(this.lastAnniversaryDate)).asDays());
			proRataAmount = proRataFactor * proRataAmount;

			// add the pro-rata price info in the changes obj, useful for generating invoice without recaluating £ of each item in the invoice class
			changes.proRataPeriodPlans.forEach(plan => {
				plan.amount = proRataFactor * getSubscription(plan.plan).amount;
				plan.taxAmount = calTax(plan.amount, country, isBusiness);
			});

			payments.push(new Payment(C.PRO_RATA_PAYMENT, proRataAmount, country, isBusiness, proRataLength));
		
		} else if (!proRataAmount && this.subscriptions.hasBoughtLicence()) {
			// it means a decrease in no. of licences
			// new agreement will start on next payment date
			console.log('decrease');

			paymentDate = moment(nextPaymentDate).utc().toDate();

		}

		//useful for generating invoice
		changes.regularPeriodPlans.forEach(plan => {
			plan.amount = getSubscription(plan.plan).amount
			plan.taxAmount = calTax(plan.amount, country, isBusiness);
		});

		payments.push(new Payment(C.REGULAR_PAYMENT, regularAmount, country, isBusiness, regularCycleLength));

		return { payments, paymentDate, changesWithPriceAdded: changes};
	};

	// used to predict next payment date when ipn from paypal is delayed, where ipn contains the actual next payment date info.
	billingSchema.statics.getNextPaymentDate = function (date) {
		let start = moment(date).utc().startOf("date");
		let next = moment(date).utc().startOf("date").add(1, "month");

		if (next.date() !== start.date()) {
			next.add(1, "day");
		}

		return next.toDate();
	};

	billingSchema.methods.cancelAgreement = function(){

		return Paypal.cancelOldAgreement(this.billingAgreementId).then(() => {
			this.subscriptions.removePendingDeleteSubscription();
			this.billingAgreementId = undefined;
		});

	};

	billingSchema.methods.isNewPayment = function(changes){
		return changes.proRataPeriodPlans.length === 0 && !this.subscriptions.hasBoughtLicence();
	}

	let getImmediatePaymentStartDate = function(){
		return moment().utc().add(10, "second");
	}

	billingSchema.methods.buySubscriptions = function (plans, user, billingUser, billingAddress) {
		// User want to buy new subscriptions.
		

		// Update subscriptions with new plans
		//this.billingInfo = this.billingInfo || {};
		this.billingUser = billingUser;

		return this.billingInfo.changeBillingAddress(billingAddress).then(() => {

			return this.subscriptions.changeSubscriptions(plans);

		}).then(changes => {

			console.log('**changes', changes);

			if (!changes) {
				// If there are no changes in plans but only changes in billingInfo, then update billingInfo only
				if (this.billingAgreementId && this.billingInfo.isModified())
				{	
					return Paypal.updateBillingAddress(this.billingAgreementId, this.billingInfo);
				}

			} else if (changes.canceledAllPlans){
				// User cancelled everything, no need to calualte/create new bills,
				// just cancel the previous agreement
				return this.cancelAgreement();

			} else if (changes) {

				//changes in plans
				
				let startDate = getImmediatePaymentStartDate();

				let data = this.calculateAmounts(startDate, changes);
	
				changes = data.changesWithPriceAdded;

				//init date for 1st/'new' payments
				if (this.isNewPayment(changes)){
					console.log('new payments');
					this.nextPaymentDate = billingSchema.statics.getNextPaymentDate(startDate);
					this.lastAnniversaryDate = startDate.clone().startOf("day").toDate();
				}

				// Once we have calculated a set of payments send them
				return Paypal.processPayments(this, data.payments, data.paymentDate).then(paypalData => {
					//save the payment token to user billing info
					this.paypalPaymentToken = paypalData.paypalPaymentToken;

					// create invoice with init state for payment happens right after executing agreement
					if(data.paymentDate <= startDate.toDate()){
						let invoice = Invoice.createInstance({ account: user });

						invoice.initInvoice({ 
							changes, 
							payments: data.payments,
							nextPaymentDate: this.nextPaymentDate,
							billingInfo: this.billingInfo,
							paypalPaymentToken: paypalData.paypalPaymentToken,
							startDate
						});

						return invoice.save().then(() => paypalData);
					} else {
						return paypalData;
					}
				});
			}
		});
	};

	billingSchema.methods.executeBillingAgreement = function(user){

		let billingAgreement;

		
		return Invoice.findByPaypalPaymentToken(user, this.paypalPaymentToken).then(invoice => {


			if(invoice && invoice.state === C.INV_PENDING && invoice.billingAgreementId){

				//stop exeing the agreement if already done before
				console.log('execed before');
				return Promise.resolve();

			} else {

				//exec the agreement
				return Paypal.executeAgreement(this.paypalPaymentToken).then(_billingAgreement => {

					billingAgreement = _billingAgreement;
					//cancel old subscription, if any
					if(this.billingAgreementId && this.billingAgreementId !== billingAgreement.id){
						return Paypal.cancelOldAgreement(this.billingAgreementId);
					}

					return Promise.resolve();

				}).then(() => {

					this.billingAgreementId = billingAgreement.id;
					
					// remove pending delete subscriptions
					this.subscriptions.removePendingDeleteSubscription();

					// assign first licence to billing user if there is none
					this.subscriptions.assignFirstLicenceToBillingUser();

					if(new Date(billingAgreement.start_date) > getImmediatePaymentStartDate().toDate()){
						// we are done here if the billing agreement start later
						return Promise.resolve();
					}

					if(!invoice){
						return Promise.reject(responseCodes.MISSING_INIT_INVOICE);
					}

					// pre activate
					// don't wait for IPN message to confirm but to activate the subscription right away, for 48 hours.
					// IPN message should come quickly after executing an agreement, usually less then a minute
					let twoDayLater = moment().utc().add(48, 'hour').toDate();
					this.subscriptions.renewSubscriptions(twoDayLater, { assignLimits: true });

					//generate an unique invoice id
					return Counter.findAndIncInvoiceNumber().then(invoiceNo => {
						// change invoice state
						invoice.changeState(C.INV_PENDING, {
							billingAgreementId: this.billingAgreementId,
							invoiceNo,
							gateway: 'PAYPAL'
						})

						return invoice.save();
					});
					
				});
			}
		});


	};

	billingSchema.methods.activateSubscriptions = function(user, paymentInfo, raw){

		let pendingInvoice;

		if(this.nextPaymentDate > paymentInfo.nextPaymentDate){
			return Promise.reject({ message: 'Received ipn message older than the one in database. Activation halt.' });
		}

		return Invoice.findByTransactionId(user, paymentInfo.transactionId).then(invoice => {
			if(invoice){
				return Promise.reject({ message: 'Duplicated ipn message. Activation halt.'});
			}

			return Role.createRole(user, null, C.ADMIN_TEMPLATE);

		}).then(role => {

			return Role.grantRolesToUser(this.billingUser, [role]);

		}).then(() => {
			this.nextPaymentDate = moment(paymentInfo.nextPaymentDate).utc().startOf('date').toDate();

			// set to to next 3rd of next month, give 3 days cushion
			let expiredAt = moment(paymentInfo.nextPaymentDate).utc()
				.add(3, 'day')
				.hours(0).minutes(0).seconds(0).milliseconds(0)
				.toDate();

			this.subscriptions.renewSubscriptions(expiredAt);

			Invoice.findPendingInvoice(user, this.billingAgreementId);
		
		}).then(invoice => {
			
			pendingInvoice = invoice;
			
			if(!pendingInvoice){
				return Counter.findAndIncInvoiceNumber()
			}

		}).then(invoiceNo => {

			if(pendingInvoice){

			} else {

				billing.periodStart = this.lastAnniversaryDate;
				billing.periodEnd = moment(this.nextPaymentDate)
					.utc()
					.subtract(1, 'day')
					.endOf('date')
					.toDate();
				billing.createdAt = new Date();
				billing.info = this.billingInfo;
			}

			billing.raw = raw;
			billing.gateway = paymentInfo.gateway;
			billing.currency = paymentInfo.currency;
			billing.amount = paymentInfo.amount;
			billing.billingAgreementId = billingAgreementId;
			billing.items = items;
			billing.nextPaymentDate = paymentInfo.nextPaymentDate;
			billing.taxAmount = paymentInfo.taxAmount;
			billing.nextPaymentAmount = paymentInfo.nextAmount;
			billing.invoiceNo = invoiceNo;
			billing.transactionId = paymentInfo.transactionId;

			return billing.save();

		});

	module.exports = billingSchema;

})();