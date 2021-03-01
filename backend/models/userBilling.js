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

"use strict";

const BillingAddress = require("./billingAddress");
const config = require("../config");

/*
// Wrapper for VAT calculation and payment information
const calTax = function(gross, countryCode, isBusiness) {
	return gross * vat.getByCountryCode(countryCode, isBusiness);
};

const Payment = function (type, netAmount, countryCode, isBusiness, length) {
	this.type = type;
	this.net = netAmount;
	this.tax = calTax(this.net, countryCode, isBusiness);
	this.gross =  this.net + this.tax;
	this.length = length;
	this.currency = "GBP";

	this.gross = utils.roundToNDP(this.gross, 2.0);
	this.net = utils.roundToNDP(this.net, 2.0);
	this.tax = utils.roundToNDP(this.tax, 2.0);
};

billingSchema.methods.calculateAmounts = function(paymentDate) {

	const country = this.billingInfo.countryCode;
	const isBusiness = this.billingInfo.vat;

	const proRataLength = { value: -1, unit: "DAY" };
	const regularCycleLength = { value: 1, unit: "MONTH" };

	const payments = [];

	let regularAmount = 0;
	let proRataAmount = 0;

	const regularItems = [];
	const proRataItems = [];

	let licensesDecreased = false;

	this.subscriptions.paypal.forEach(licence => {
		// I'm not sure how well this will work when/if we have multi licenses
		// Currently next payment is determined by whether we have proRata licenses
		// And there can be situations where one has proRata and the other has decreased
		licensesDecreased = licence.pendingQuantity < licence.quantity;
		if(licence.pendingQuantity > licence.quantity && licence.quantity !== 0) {
			// Calculate proRata if we are adding additional licenses
			const additionalLicences = licence.pendingQuantity - licence.quantity;
			proRataAmount += config.subscriptions.plans[licence.plan].price * additionalLicences;
			proRataItems.push({plan: licence.plan, quantity: additionalLicences});
		}

		regularAmount += config.subscriptions.plans[licence.plan].price * licence.pendingQuantity;
		regularItems.push({plan: licence.plan, quantity: licence.pendingQuantity});
	});

	const nextPaymentDate = moment(this.nextPaymentDate);
	if (proRataAmount) {
		// The length of the pro-rata period is difference between now and next payment date
		proRataLength.value = Math.round(moment.duration(nextPaymentDate.diff(moment(paymentDate).utc().startOf("date"))).asDays());

		// Calculate percentage of payment period * cost of the period.
		const proRataFactor = proRataLength.value / Math.round(moment.duration(nextPaymentDate.diff(this.lastAnniversaryDate)).asDays());

		proRataAmount = proRataFactor * proRataAmount;

		// add the pro-rata price info in the changes obj, useful for generating invoice without recaluating £ of each item in the invoice class
		proRataItems.forEach(plan => {
			plan.amount = proRataFactor * config.subscriptions.plans[plan.plan].price;
			plan.taxAmount = calTax(plan.amount, country, isBusiness);
			plan.amount += plan.taxAmount;
		});

		payments.push(new Payment(C.PRO_RATA_PAYMENT, proRataAmount, country, isBusiness, proRataLength));

	} else if(licensesDecreased) {
		// new agreement will start on next payment date
		paymentDate = moment(nextPaymentDate).utc().toDate();
	}

	// useful for generating invoice
	regularItems.forEach(plan => {
		plan.amount = config.subscriptions.plans[plan.plan].price;
		plan.taxAmount = calTax(plan.amount, country, isBusiness);
		plan.amount += plan.taxAmount;
	});

	payments.push(new Payment(C.REGULAR_PAYMENT, regularAmount, country, isBusiness, regularCycleLength));

	return { payments, paymentDate, listItems: {regularPeriodPlans: regularItems, proRataPeriodPlans: proRataItems}};
};

// used to predict next payment date when ipn from paypal is delayed, where ipn contains the actual next payment date info.
billingSchema.statics.getNextPaymentDate = function (date) {
	const start = moment(date).utc().startOf("date");
	const next = moment(date).utc().startOf("date").add(1, "month");

	if (next.date() !== start.date()) {
		next.add(1, "day");
	}

	return next.toDate();
};

billingSchema.methods.cancelAgreement = function() {
	return Paypal.cancelOldAgreement(this.billingAgreementId).then(() => {
		this.billingAgreementId = undefined;
	});

};

const getImmediatePaymentStartDate = function() {
	return moment().utc().add(60, "second");
};

billingSchema.methods.activateSubscriptions = function(user, paymentInfo, raw) {
	const User = require("./user");

	if(this.nextPaymentDate > paymentInfo.nextPaymentDate) {
		return Promise.reject({ message: "Received ipn message older than the one in database. Activation halt." });
	}

	const promise = Invoice.findByTransactionId(user, paymentInfo.transactionId).then(invoice => {
		if(invoice) {
			return Promise.reject({ message: "Duplicated ipn message. Activation halt."});
		}

	}).then(() => {
		if(this.nextPaymentDate &&
			moment(paymentInfo.nextPaymentDate).utc().startOf("date").toISOString() !== moment(this.nextPaymentDate).utc().startOf("date").toISOString()) {
			this.lastAnniversaryDate = new Date(this.nextPaymentDate);
		}

		this.nextPaymentDate = moment(paymentInfo.nextPaymentDate).utc().startOf("date").toDate();

		// set to to next 3rd of next month, give 3 days cushion
		const expiredAt = moment(paymentInfo.nextPaymentDate).utc()
			.add(3, "day")
			.hours(0).minutes(0).seconds(0).milliseconds(0)
			.toDate();

		this.subscriptions.paypal = renewAndCleanSubscriptions(this.subscriptions.paypal, expiredAt);
	});

	let _invoice;
	promise.then(() => {
		return Invoice.findPendingInvoice(user, this.billingAgreementId).then(pendingInvoice => {
			_invoice = pendingInvoice;

			if(!_invoice) {

				_invoice = Invoice.createInstance({ account: user });
				return _invoice.initInvoice({
					nextPaymentDate: this.nextPaymentDate,
					billingAgreementId: this.billingAgreementId,
					billingInfo: this.billingInfo,
					startDate: this.lastAnniversaryDate,
					account: user
				});
			}

		}).then(() => {

			_invoice.changeState(C.INV_COMPLETE, {
				raw: raw,
				gateway: paymentInfo.gateway,
				currency: paymentInfo.currency,
				amount: paymentInfo.amount,
				billingAgreementId: this.billingAgreementId,
				nextPaymentDate: this.nextPaymentDate,
				taxAmount: paymentInfo.taxAmount,
				nextPaymentAmount: paymentInfo.nextAmount,
				transactionId: paymentInfo.transactionId
			});

			return _invoice.save();

		}).then(invoice => {

			return invoice.generatePDF().then(pdf => {

				invoice.pdf = pdf;
				// also save the pdf to database for ref.
				return invoice.save();
			});

		}).then(invoice => {

			// email
			const attachments = [{
				filename: `${invoice.createdAtDate}_invoice-${invoice.invoiceNo}.pdf`,
				content: invoice.pdf
			}];

			// send invoice
			const amount = invoice.amount;
			const currency = invoice.currency;

			return User.findByUserName(this.billingUser).then(billingUser => {

				return Promise.all([
					// make a copy to sales
					Mailer.sendPaymentReceivedEmailToSales({
						account: user,
						amount: `${currency}${amount}`,
						email: billingUser.customData.email,
						invoiceNo: invoice.invoiceNo,
						type: invoice.type
					}, attachments),

					Mailer.sendPaymentReceivedEmail(billingUser.customData.email, {
						account: user,
						amount: `${currency}${amount}`
					}, attachments)
				]);

			}).catch(err => {
				systemLogger.logError(`Email error - ${err.message}`);
			});
		});
	});
	return promise;

};

function getCleanedUpPayPalSubscriptions(currentSubs) {
	const subs = [];
	if(currentSubs) {
		currentSubs.forEach(payPalEntry => {
			if(payPalEntry.quantity > 0) {
				delete payPalEntry.pendingQuantity;
				subs.push(payPalEntry);
			}
		});
	}

	return subs;
}

billingSchema.methods.writeSubscriptionChanges = function(newPlans) {
	if(!this.subscriptions) {
		this.subscriptions = {};
	}

	const currentSubs = this.billingAgreementId ? getCleanedUpPayPalSubscriptions(this.subscriptions.paypal) : [];
	let hasChanges = false;
	const updatedSubs = [];
	let totalSubCount = 0;

	for(let i = 0; i < newPlans.length; ++i) {

		const newSubs = newPlans[i];
		if(!config.subscriptions.plans[newSubs.plan]) {
			return Promise.reject(responseCodes.PLAN_NOT_FOUND);
		}

		const entryInCurrent = currentSubs.findIndex(element => newSubs.plan === element.plan);
		hasChanges = hasChanges || (entryInCurrent < 0 || currentSubs[entryInCurrent].quantity !== newSubs.quantity);

		let planEntry = null;

		if(entryInCurrent < 0) {
			planEntry = {plan: newSubs.plan, quantity: 0};
			planEntry.pendingQuantity = newSubs.quantity;
		} else {
			planEntry = currentSubs[entryInCurrent];
			planEntry.pendingQuantity = newSubs.quantity;
			currentSubs.splice(entryInCurrent, 1);
		}

		updatedSubs.push(planEntry);
		totalSubCount += newSubs.quantity;
	}

	hasChanges = hasChanges || currentSubs.length;

	if(hasChanges) {
		this.subscriptions.paypal = updatedSubs;
		const result = {
			cancelledAllPlans : totalSubCount === 0
		};
		return Promise.resolve(result);
	} else {
		return Promise.resolve(false);
	}

};

billingSchema.methods.updateSubscriptions = function (plans, user, billingUser, billingAddress) {
	// User want to buy new subscriptions.
	// Update subscriptions with new plans
	this.billingUser = billingUser;

	return this.changeBillingAddress(this, billingAddress).then(() => {
		this.markModified("billingInfo");
		return this.writeSubscriptionChanges(plans);

	}).then(changes => {
		if (!changes) {
			// If there are no changes in plans but only changes in billingInfo, then update billingInfo only
			if (this.billingAgreementId && this.billingInfo.isModified()) {
				const paypalUpdate = Paypal.updateBillingAddress(this.billingAgreementId, this.billingInfo);
				return paypalUpdate;
			}

		} else if (changes.cancelledAllPlans) {
			// User cancelled everything, no need to calculate/create new bills,
			// just cancel the previous agreement
			return this.cancelAgreement();

		} else {

			const isNewPayment = !this.subscriptions.paypal ||
				this.subscriptions.paypal.filter((entry) => {
					return entry.quantity > 0;
				}).length === 0;

			// changes in plans
			const startDate = getImmediatePaymentStartDate();

			const data = this.calculateAmounts(startDate);

			const invoiceLineItems = data.listItems;

			// init date for 1st/'new' payments
			if (isNewPayment) {
				this.nextPaymentDate = billingSchema.statics.getNextPaymentDate(startDate);
				this.lastAnniversaryDate = startDate.clone().startOf("day").toDate();
			}
			// Once we have calculated a set of payments send them
			return Paypal.processPayments(this, data.payments, data.paymentDate).then(paypalData => {

				// save the payment token to user billing info
				this.paypalPaymentToken = paypalData.paypalPaymentToken;

				// create invoice with init state for payment happens right after executing agreement
				if(data.paymentDate <= startDate.toDate()) {

					const invoice = Invoice.createInstance({ account: user });
					invoice.initInvoice({
						changes: invoiceLineItems,
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

function renewAndCleanSubscriptions(subs, newExpiryDate) {
	const updatedSubs = [];
	if(subs) {
		subs.forEach(sub => {
			if(sub.pendingQuantity) {
				sub.quantity = sub.pendingQuantity;
				delete sub.pendingQuantity;
			}
			sub.expiryDate = newExpiryDate;
			updatedSubs.push(sub);
		});
	}
	return updatedSubs;
}

billingSchema.methods.executeBillingAgreement = function(user) {

	let billingAgreement;

	return Invoice.findByPaypalPaymentToken(user, this.paypalPaymentToken).then(invoice => {
		if(invoice && invoice.state === C.INV_PENDING && invoice.billingAgreementId) {

			// stop exeing the agreement if already done before
			return Promise.resolve();

		} else {
			// exec the agreement
			return Paypal.executeAgreement(this.paypalPaymentToken).then(_billingAgreement => {

				billingAgreement = _billingAgreement;
				// cancel old subscription, if any
				if(this.billingAgreementId && this.billingAgreementId !== billingAgreement.id) {
					return Paypal.cancelOldAgreement(this.billingAgreementId);
				}

				return Promise.resolve();

			}).then(() => {

				this.billingAgreementId = billingAgreement.id;

				if(new Date(billingAgreement.start_date) > getImmediatePaymentStartDate().toDate()) {
					// we are done here if the billing agreement start later
					return Promise.resolve();
				}

				if(!invoice) {
					return Promise.reject(responseCodes.MISSING_INIT_INVOICE);
				}

				// pre activate
				// don't wait for IPN message to confirm but to activate the subscription right away, for 48 hours.
				// IPN message should come quickly after executing an agreement, usually less then a minute
				const twoDayLater = moment().utc().add(48, "hour").toDate();
				this.subscriptions.paypal = renewAndCleanSubscriptions(
					this.subscriptions.paypal,
					twoDayLater);

				// change invoice state
				invoice.changeState(C.INV_PENDING, {
					billingAgreementId: this.billingAgreementId,
					gateway: "PAYPAL"
				});

				return invoice.save();
			});
		}
	});
};
*/

const UserBilling = {};

UserBilling.getActiveSubscriptions = function(userBilling) {
	const res = { basic: config.subscriptions.basic};
	Object.keys(userBilling.subscriptions || {}).forEach(key => {
		if(key === "paypal") {
			res.paypal = [];
			userBilling.subscriptions.paypal.forEach(ppPlan => {
				if(!ppPlan.expiryDate || ppPlan.expiryDate > Date.now()) {
					res.paypal.push(ppPlan);
				}
			});
		} else {
			if(!userBilling.subscriptions[key].expiryDate ||
				userBilling.subscriptions[key].expiryDate > Date.now()) {
				res[key] = userBilling.subscriptions[key];
			}

		}
	});

	return res;
};

UserBilling.getSubscriptionLimits = function(userBilling) {
	const sumLimits = {};
	if(config.subscriptions.basic) {
		sumLimits.spaceLimit = config.subscriptions.basic.data;
		sumLimits.collaboratorLimit = config.subscriptions.basic.collaborators;
	}

	if(!sumLimits.spaceLimit) {
		sumLimits.spaceLimit = 0;
	}

	if(!sumLimits.collaboratorLimit) {
		sumLimits.collaboratorLimit = 0;
	}
	if(userBilling.subscriptions)	{
		Object.keys(userBilling.subscriptions).forEach(key => {
			if(key === "paypal") {
				if (userBilling.subscriptions.paypal.length > 0) {
					userBilling.subscriptions.paypal.forEach(ppPlan => {
						const plan = config.subscriptions.plans[ppPlan.plan];
						if(plan &&
							(!ppPlan.expiryDate || ppPlan.expiryDate > Date.now())) {
							sumLimits.spaceLimit += plan.data * ppPlan.quantity;
							if(sumLimits.collaboratorLimit !== "unlimited") {
								sumLimits.collaboratorLimit = plan.collaborators === "unlimited" ?
									"unlimited" : sumLimits.collaboratorLimit + plan.collaborators * ppPlan.quantity;
							}
						}
					});
				}
			} else {
				if(!userBilling.subscriptions[key].expiryDate ||
					userBilling.subscriptions[key].expiryDate > Date.now()) {
					sumLimits.spaceLimit += userBilling.subscriptions[key].data;
					if(sumLimits.collaboratorLimit !== "unlimited") {
						sumLimits.collaboratorLimit = userBilling.subscriptions[key].collaborators === "unlimited" ?
							"unlimited" : sumLimits.collaboratorLimit + userBilling.subscriptions[key].collaborators;
					}
				}

			}
		});
	}
	return sumLimits;
};

UserBilling.changeBillingAddress = async function(billing, billingAddress) {
	billing.billingInfo = await BillingAddress.changeBillingAddress(billing.billingInfo, billingAddress);
	return billing;
};

module.exports = UserBilling;
