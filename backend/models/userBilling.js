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
	const Billing = require("./new_billing.js");

	let getSubscription = Subscription.getSubscription;

	let subscriptionSchema = new mongoose.Schema({
		active: Boolean,
		updatedAt: Date,
		createdAt: Date,
		billingUser: String,
		assignedUser: String,
		expiredAt: Date,
		limits: {},
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
				return new Subscriptions(this, this.billingInfo, subs); 
			} 
		},
		billingInfo: { type: billingAddressInfo, default: {} },
		//global billing info
		billingAgreementId: String,
		paypalPaymentToken: String,
		billingUser: String,
		lastAnniversaryDate: Date,
		nextPaymentDate: Date,
		firstNextPaymentDate: Date
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
	let Payment = function (type, grossAmount, countryCode, isBusiness, length) {
		this.type = type;
		this.gross = grossAmount;
		this.tax = this.gross * vat.getByCountryCode(countryCode, isBusiness);
		this.net = this.gross + this.vat;
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

		if (proRataAmount) {
			console.log('pro-rata');
			// The length of the pro-rata period is difference between now and next payment date
			proRataLength.value = Math.round(moment.duration(this.nextPaymentDate.diff(moment(paymentDate).utc().startOf("date"))).asDays());

			// Calculate percentage of payment period * cost of the period.
			let proRataBeforeTaxAmount = proRataLength.value / Math.round(moment.duration(this.nextPaymentDate.diff(this.lastAnniversaryDate)).asDays()) * proRataAmount;

			payments.push(new Payment(C.PRO_RATA_PAYMENT, proRataBeforeTaxAmount, country, isBusiness, proRataLength));
		
		} else if (!proRataAmount && this.subscriptions.hasBoughtLicence()) {
			// it means a decrease in no. of licences
			// new agreement will start on next payment date
			console.log('decrease');

			paymentDate = moment(this.nextPaymentDate).utc().toDate();

		} else {

			console.log('1st buy');
			console.log('this.constructor', this.constructor);
			//first time to buy
			this.nextPaymentDate = billingSchema.statics.getNextPaymentDate(paymentDate);
			this.lastAnniversaryDate = paymentDate.clone().startOf("day").toDate();

		}

		payments.push(new Payment(C.REGULAR_PAYMENT, regularAmount, country, isBusiness, regularCycleLength));

		return { payments, paymentDate};
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

	billingSchema.methods.buySubscriptions = function (plans, billingUser, billingAddress) {
		// User want to buy new subscriptions.
		

		// Update subscriptions with new plans
		//this.billingInfo = this.billingInfo || {};

		return this.billingInfo.changeBillingAddress(billingAddress).then(() => {

			return this.subscriptions.changeSubscriptions(plans);

		}).then(changes => {

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

				let startDate = moment().utc().add(10, "second");

				let data = this.calculateAmounts(startDate, changes);
					// Once we have calculated a set of payments send them
				return Paypal.processPayments(this, data.payments, data.paymentDate);
			}
		});
	};

	module.exports = billingSchema;

})();