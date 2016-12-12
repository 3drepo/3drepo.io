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
	const billingAddressInfo = require("./billingAddress")();
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
		subscriptions: { type: [subscriptionSchema], get: function (subs) { return Subscriptions(this, this.billingInfo, subs); } },
		billingInfo: billingAddressInfo,
		//global billing info
		billingAgreementId: String,
		paypalPaymentToken: String,
		billingUser: String,
		lastAnniversaryDate: Date,
		nextPaymentDate: Date,
		firstNextPaymentDate: Date
	});

	let bills = [];

	billingSchema.virtual("bills").get(function () {
		if (!bills.length) {
			let billPromises = Billing.findByAgreementId(this.billingUser, this.billingAgreementId).then(bill => {
				return new Promise(function (resolve) {
					bills.push(bill);
					resolve();
				});
			});

			Promise.all(billPromises).then(function() {
				return bills;
			});
		} else {
			return bills;
		}
	});

	// Wrapper for VAT calculation and payment information
	let Payment = function (type, grossAmount, countryCode, isBusiness, length) {
		this.type = type;
		this.gross = grossAmount;
		this.tax = this.gross * vat.getByCountryCode(countryCode, isBusiness);
		this.net = this.gross + this.net;
		this.length = length;
		this.currency = "GBP";

		this.gross = utils.roundToNDP(this.gross, 2.0);
		this.net = utils.roundToNDP(this.net, 2.0);
		this.tax = utils.roundToNDP(this.tax, 2.0);
	};

	billingSchema.statics.calculateAmounts = function (hasBoughtBefore) {

		let country = this.billingInfo.countryCode;
		let isBusiness = this.billingInfo.vat;

		let proRataLength = { value: -1, unit: "DAY" };
		let regularCycleLength = { value: 1, unit: "MONTH" };

		let startDate;

		let payments = [];

		// For all licences that we need to purchase add up amount * quantity
		let regularAmount = this.subscriptions.plans.reduce((sum, licence) => {
			return sum + getSubscription(licence.plan).amount * licence.quantity;
		});

		// do pro-rata if not first time to buy
		if (hasBoughtBefore) {
			this.paymentDate = moment(this.paymentDate).utc();
			startDate = this.paymentDate.toDate();

			this.lastAnniversaryDate = moment(this.lastAnniversaryDate).utc();
			this.nextPaymentDate = moment(this.nextPaymentDate).utc();

			// The length of the pro-rata period is difference between now and next payment date
			proRataLength.value = Math.round(moment.duration(this.nextPaymentDate.diff(moment(this.paymentDate).utc().startOf("date"))).asDays());

			// Calculate percentage of payment period * cost of the period.
			let proRataBeforeTaxAmount = proRataLength.value / Math.round(moment.duration(this.nextPaymentDate.diff(this.lastAnniversaryDate)).asDays()) * regularAmount;

			payments.push(new Payment(C.PRO_RATA_PAYMENT, proRataBeforeTaxAmount, country, isBusiness, proRataLength));
		}

		payments.push(new Payment(C.REGULAR_PAYMENT, regularAmount, country, isBusiness, regularCycleLength));

		return Promise.resolve(payments);
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

	billingSchema.statics.changeBillingAddress = function (billingAddress) {
		this.billingInfo.line1 = billingAddress.line1;
		this.billingInfo.line2 = billingAddress.line2;
		this.billingInfo.city = billingAddress.city;
		this.billingInfo.postalCode = billingAddress.postalCode;
		this.billingInfo.countryCode = billingAddress.countryCode;
		this.billingInfo.state = billingAddress.state;
	};

	billingSchema.buySubscriptions = function (plans, billingUser, billingAddress) {
		// User want to buy new subscriptions.
		this.changeBillingAddress(billingAddress);

		// Update subscriptions with new plans
		this.subscriptions.changeSubscriptions(plans).then(function (hasChanges) {
			let startDate = moment().utc().add(10, "second");

			this.nextPaymentDate = this.getNextPaymentDate(startDate);
			this.lastAnniversaryDate = startDate.clone().startOf("day").toDate();

			if (!hasChanges) {
				// If there are no changes
				if (this.billingInfo.hasChanged())
				{	
					Paypal.updateBillingAddress(this.billingAgreementId, this.billingAddress)
					{
						return Promise.resolve();
					}
				}
			} else {
				this.calculateAmounts().then(function(payments) {
					// Once we have calculated a set of payments send them
					return Paypal.processPayments(this, payments);
				});
			}
		});
	};

})();