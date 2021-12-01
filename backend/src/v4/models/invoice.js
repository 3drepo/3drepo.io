/**
 *  Copyright (C) 2016 3D Repo Ltd
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

const addressMeta = require("./addressMeta");
const moment = require("moment");
const pug = require("pug");
const config = require("../config");

const utils = require("../utils");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");
const { set } = require("lodash");

// Various getter/setter helper functions
const roundTo2DP = function(x) {
	return Math.abs(utils.roundToNDP(x, 2.0));
};

const roundTo3DP = function(x) {
	return utils.roundToNDP(x, 3.0);
};

const dateToString = function(date) {
	return date ? moment(date).utc().format(C.DATE_FORMAT) : null;
};

const dateToDateTimeString = function(date) {
	return  date ? moment(date).utc().format(C.DATE_TIME_FORMAT) : null;
};

const addProp = (propName, funct) => (obj) => set(obj, propName, funct.apply(obj));

const addDescription = addProp("description", function() {
	return config.subscriptions.plans[this.name] ?  config.subscriptions.plans[this.name].label : "Unknown license";
});

const addNetAmount = addProp("netAmount", function() {
	return roundTo2DP(this.amount - this.taxAmount);
});

const addCreatedAtDate = addProp("createdAtDate", function() {
	return moment(this.createdAt).utc().format(C.DATE_FORMAT);
});

const addCountryName = addProp("info.countryName",function() {
	const country = addressMeta.countries.find(c => c.code === this.info.countryCode);
	return country && country.name;
});

const addB2BEU = addProp("B2B_EU", function() {
	return (addressMeta.euCountriesCode.indexOf(this.info.countryCode) !== -1) && this.info.vat ? true : false;
});

const addTaxPercentage = addProp("taxPercentage", function() {
	return roundTo2DP(this.taxAmount / this.netAmount) * 100;
});

const addUnitPrice = addProp("unitPrice", function() {

	let unitPrice = roundTo3DP(this.netAmount / this.items.length).toFixed(3);

	if(unitPrice.substr(-1) === "0") {
		unitPrice = unitPrice.slice(0, -1);
	}

	return unitPrice;
});

const addPending =  addProp("pending", function() {
	return this.state === C.INV_PENDING;
});

const addProRata  = addProp("proRata", function() {
	const planInfo = config.subscriptions.plans[this.items[0]];
	return !planInfo ||
		!(this.items.length > 0 &&
			(this.items[0].amount - this.items[0].taxAmount).toFixed(2) === planInfo.price.toFixed(2));
});

const Invoice = {};

const COLL_NAME = "invoices";

Invoice.cleanItem = function(item) {
	addDescription(item);
	item.amount = roundTo2DP(item.amount);
	item.taxAmount = roundTo2DP(item.taxAmount);
	item.id = item._id;
	return item;
};

Invoice.clean = (invoice) => {
	invoice.amount = roundTo2DP(invoice.amount);
	invoice.nextPaymentAmount = roundTo2DP(invoice.nextPaymentAmount);
	invoice.taxAmount = roundTo2DP(invoice.taxAmount);

	addNetAmount(invoice);
	addCreatedAtDate(invoice);
	addCountryName(invoice);
	addB2BEU(invoice);
	addTaxPercentage(invoice);
	addUnitPrice(invoice);
	addPending(invoice);
	addProRata(invoice);
	invoice.id = invoice._id;
	invoice.items = invoice.items.map(Invoice.cleanItem);

	invoice.createdAt = dateToDateTimeString(invoice.createdAt);
	invoice.periodStart = dateToString(invoice.periodStart);
	invoice.periodEnd = dateToString(invoice.periodEnd);
	invoice.nextPaymentDate = dateToString(invoice.nextPaymentDate);
	return invoice;
};

Invoice.find = async function(account, query, projection, sort) {
	const invoices =  await db.find(account, COLL_NAME, query, projection, sort);
	return invoices.map(this.clean);
};

Invoice.findOne = async function(account, query, projection, sort) {
	const invoice = await db.findOne(account, COLL_NAME, query, projection, sort);
	return this.clean(invoice);
};

Invoice.findByAccount = async function (account) {
	const projection = {
		raw: 0,
		pdf: 0
	};
	return await this.find(account, {state: {"$in": [C.INV_PENDING, C.INV_COMPLETE] }}, projection,  { createdAt: -1 });
};

Invoice.findByPaypalPaymentToken = async function(account, paypalPaymentToken) {
	return await this.findOne(account, { paypalPaymentToken }, { raw: 0, pdf: 0});
};

Invoice.findLatestCompleteByAgreementId = async function (account, billingAgreementId) {
	return await this.findOne(account, { billingAgreementId, state: C.INV_COMPLETE}, { raw: 0, pdf: 0 });
};

Invoice.findByInvoiceNo = async function (account, invoiceNo) {
	return await this.findOne(account, { invoiceNo });
};

Invoice.findByTransactionId = async function (account, transactionId) {
	return await this.findOne(account, { transactionId }, { raw: 0, pdf: 0 });
};

Invoice.hasPendingBill = async function (account, billingAgreementId) {
	const count = await db.count(account, { billingAgreementId: billingAgreementId, pending: true });
	return count > 0;
};

Invoice.findPendingInvoice = async function(account, billingAgreementId) {
	return await this.findOne(account, { billingAgreementId, state: C.INV_PENDING });
};

function printPDF(/* html*/) {
	return new Promise((resolve, reject) => {
		/* pdfGen.create(html, {width: "210mm", height: "297mm"}).toBuffer((err, buffer) => {
			if(err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});*/
		reject("pdf generation is currently unsupported.");
	});
}

Invoice.generatePDF =  function (invoice, user) {

	if(invoice.items.length > 0 && (!config.subscriptions || !config.subscriptions.plans[invoice.items[0].name])) {
		return Promise.reject(responseCodes.UNKNOWN_PAY_PLAN);
	}

	return new Promise((resolve, reject) => {

		const useNonPublicPort = true;

		let template = utils.getPugPath("invoice.pug");
		if (invoice.type === "refund") {
			template = utils.getPugPath("refund.pug");
		}

		pug.renderFile(template, { billing: invoice, baseURL: config.getBaseURL(useNonPublicPort), user }, function (err, html) {
			if (err) {
				reject(err);
			} else {
				resolve(html);
			}
		});
	}).then((html) => {
		return printPDF(html);
	}).catch(err => {
		return Promise.reject(err);
	});

};

module.exports = Invoice;

/*
Paypal changes commented out

const systemLogger = require("../logger.js").systemLogger;
const Counter = require("./counter");
const Mailer = require("../mailer/mailer");
const vat = require("./vat");

schema.pre("save", function(next) {

	if(!this.invoiceNo && this.state !== C.INV_INIT) {
		// generate invoice number if doesn't have one and passed the init state
		let genNo;

		if(this.type === C.INV_TYPE_INVOICE) {
			genNo = Counter.findAndIncInvoiceNumber;
		} else if (this.type === C.INV_TYPE_REFUND) {
			genNo = Counter.findAndIncRefundNumber;
		}

		genNo().then(invoiceNo => {
			this.invoiceNo = invoiceNo;
			next();
		}).catch(err => {
			next(err);
		});

	} else {
		next();
	}
});

schema.methods.initInvoice = function(data) {

	this.createdAt = new Date();
	this.nextPaymentDate = data.nextPaymentDate;
	this.info = data.billingInfo;
	this.paypalPaymentToken = data.paypalPaymentToken;

	if(data.payments) {

		const proRataPayments = data.payments.filter(p => p.type === C.PRO_RATA_PAYMENT);
		const regularPayments = data.payments.filter(p => p.type === C.REGULAR_PAYMENT);

		if(proRataPayments.length > 0) {
			this.currency = proRataPayments[0].currency;
			this.amount = proRataPayments.reduce((sum, payment) => sum + payment.gross, 0);
			this.taxAmount = proRataPayments.reduce((sum, payment) => sum + payment.tax, 0);
		} else {
			this.currency = regularPayments[0].currency;
			this.amount = regularPayments.reduce((sum, payment) => sum + payment.gross, 0);
			this.taxAmount = regularPayments.reduce((sum, payment) => sum + payment.tax, 0);
		}

		this.nextPaymentAmount = regularPayments.reduce((sum, payment) => sum + payment.gross, 0);
	}

	this.periodStart = data.startDate;
	this.periodEnd = moment(this.nextPaymentDate)
		.utc()
		.subtract(1, "day")
		.endOf("date")
		.toDate();

	let plans = [];

	if(data.changes) {
		// init invoice items using data.changes
		// if there is any pro rata priced plans then there will be no regular priced plans in this invoice and vice versa.

		if(data.changes.proRataPeriodPlans.length > 0) {
			plans = data.changes.proRataPeriodPlans;
		} else if (data.changes.regularPeriodPlans) {
			plans = data.changes.regularPeriodPlans;
		}

		// add items bought in the invoice
		plans.forEach(plan => {
			for(let i = 0 ; i < plan.quantity; i++) {
				this.items.push({
					name: plan.plan,
					currency: "GBP",
					amount: plan.amount,  // gross+tax
					taxAmount: plan.taxAmount
				});
			}
		});

		return this;

	} else if (data.billingAgreementId) {
		// init items using last invoice with same billing id

		this.billingAgreementId = data.billingAgreementId;
		// copy items from last completed invoice with same agreement id
		return Invoice.findLatestCompleteByAgreementId(data.account, data.billingAgreementId).then(lastGoodInvoice => {
			if(!lastGoodInvoice) {
				return Promise.reject(responseCodes.MISSING_LAST_INVOICE);
			}
			this.items = lastGoodInvoice.items;
		}).then(() => this);
	}

};

schema.methods.changeState = function(state, data) {

	this.state = state;
	data.invoiceNo && (this.invoiceNo = data.invoiceNo);
	data.billingAgreementId && (this.billingAgreementId = data.billingAgreementId);
	data.gateway && (this.gateway = data.gateway);
	data.raw && (this.raw = data.raw);
	data.transactionId && (this.transactionId = data.transactionId);
	data.currency && (this.currency = data.currency);
	data.amount && (this.amount = data.amount);
	data.taxAmount && (this.taxAmount = data.taxAmount);
	data.nextPaymentAmount && (this.nextPaymentAmount = data.nextPaymentAmount);
	data.nextPaymentDate && (this.nextPaymentDate = data.nextPaymentDate);

};

Invoice.createRefund = function (user, data) {

	const User = require("./user");

	const newInvoice = Invoice.createInstance({ account: user.user });

	newInvoice.info = user.customData.billing.billingInfo;
	newInvoice.raw = data.raw;
	newInvoice.gateway = data.gateway;
	newInvoice.createdAt = new Date();
	newInvoice.currency = data.currency;
	newInvoice.amount = data.amount;
	// full/parital refund IPNs don't have any tax infomation, need to recalulate the tax for refund case
	// or we hide tax info for refund newInvoice in that case we don't need to bother this
	data.amount = parseFloat(data.amount);
	newInvoice.taxAmount = roundTo2DP(
		data.amount - (data.amount / (1 + vat.getByCountryCode(newInvoice.info.countryCode, newInvoice.info.vat)))
	);

	newInvoice.billingAgreementId = data.billingAgreementId;
	newInvoice.type = C.INV_TYPE_REFUND;
	newInvoice.transactionId = data.transactionId;
	newInvoice.state = C.INV_COMPLETE;

	// save first to generate newInvoice no before generating pdf
	return newInvoice.save().then(savedInvoice => {

		return savedInvoice.generatePDF().then(() => {
			return savedInvoice;
		});

	}).then(invoice => {

		const attachments = [{
			filename: `${moment(invoice.createdAtDate).utc().format(C.DATE_FORMAT)}_invoice-${invoice.invoiceNo}.pdf`,
			content: invoice.pdf
		}];

		User.findByUserName(user.customData.billing.billingUser).then(billingUser => {
			Mailer.sendPaymentRefundedEmail(billingUser.customData.email, {
				amount: `${data.currency}${data.amount}`
			}, attachments)
				.catch(err => {
					systemLogger.logError(`Email error - ${err.message}`);
				});

			// make a copy to sales
			Mailer.sendPaymentReceivedEmailToSales({
				account: user.user,
				amount: `${data.currency}${data.amount}`,
				email: billingUser.customData.email,
				invoiceNo: invoice.invoiceNo,
				type: invoice.type
			}, attachments)
				.catch(err => {
					systemLogger.logError(`Email error - ${err.message}`);
				});
		});

		return invoice;
	});
};

Invoice.findAndRemovePendingBill = async function (account, billingAgreementId) {
	const billing = await this.findOne({ account }, { billingAgreementId: billingAgreementId, pending: true });

	if (billing) {
		return billing.remove();
	}

	return billing;
};

*/
