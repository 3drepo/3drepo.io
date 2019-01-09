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
(() => {

	const mongoose = require("mongoose");
	require("mongoose-double")(mongoose);
	const ModelFactory = require("./factory/modelFactory");
	const addressMeta = require("./addressMeta");
	const moment = require("moment");
	const fs = require("fs");
	const pug = require("pug");
	const phantom = require("phantom");
	const config = require("../config");
	const systemLogger = require("../logger.js").systemLogger;
	const Counter = require("./counter");
	const Mailer = require("../mailer/mailer");
	const vat = require("./vat");
	const billingAddressInfo = require("./billingAddress");
	const utils = require("../utils");
	const C = require("../constants");
	const responseCodes = require("../response_codes.js");
	const path  = require("path");

	const SchemaTypes = mongoose.Schema.Types;

	// Various getter/setter helper functions
	const roundTo2DP = function(x) {
		return utils.roundToNDP(x, 2.0);
	};
	const roundTo3DP = function(x) {
		return utils.roundToNDP(x, 3.0);
	};
	const signAndRoundTo2DP = function(x) {
		return this.type === C.INV_TYPE_REFUND ? roundTo2DP(-x) : roundTo2DP(x);
	};
	const dateToString = function(date) {
		return moment(date).utc().format(C.DATE_FORMAT);
	};
	const dateToDateTimeString = function(date) {
		return moment(date).utc().format(C.DATE_TIME_FORMAT);
	};

	// let dateTimeToString = function(date) { return  moment(date).utc().format(C.DATE_TIME_FORMAT); }

	const itemSchema = mongoose.Schema({
		name: String,
		currency: String,
		amount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },  // gross+tax
		taxAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP }
	});

	itemSchema.virtual("description").get(function() {
		return config.subscriptions.plans[this.name] ?  config.subscriptions.plans[this.name].label : "Unknown license";
	});

	itemSchema.set("toJSON", { virtuals: true, getters:true });

	const schema = mongoose.Schema({
		invoiceNo: String,
		billingAgreementId: String,
		gateway: String,
		raw: {},
		createdAt: { type: Date, get: dateToDateTimeString } ,
		currency: String,
		amount: { type: SchemaTypes.Double, get: signAndRoundTo2DP, set: roundTo2DP },// gross+tax
		type: { type: String, default: C.INV_TYPE_INVOICE, enum: [C.INV_TYPE_INVOICE, C.INV_TYPE_REFUND] },
		items: [itemSchema],
		periodStart: { type: Date, get: dateToString },
		periodEnd: { type: Date, get: dateToString },
		nextPaymentDate:  { type: Date, get: dateToString },
		nextPaymentAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },  // gross+tax
		transactionId: String,
		taxAmount: { type: SchemaTypes.Double, get: signAndRoundTo2DP, set: roundTo2DP },
		info: billingAddressInfo,
		state: {type: String, default: C.INV_INIT, enum: [C.INV_INIT, C.INV_PENDING, C.INV_COMPLETE]},
		paypalPaymentToken: String
	});

	schema.virtual("netAmount").get(function() {
		return roundTo2DP(this.amount - this.taxAmount);
	});

	schema.virtual("createdAtDate").get(function() {
		return moment(this.toObject().createdAt).utc().format(C.DATE_FORMAT);
	});

	schema.virtual("taxPercentage").get(function() {
		return roundTo2DP(this.taxAmount / this.netAmount) * 100;
	});

	schema.virtual("info.countryName").get(function() {
		const country = addressMeta.countries.find(c => c.code === this.info.countryCode);
		return country && country.name;
	});

	schema.virtual("B2B_EU").get(function() {
		return (addressMeta.euCountriesCode.indexOf(this.info.countryCode) !== -1) && this.info.vat ? true : false;
	});

	// TO-DO: the current design of the invoice (invoice.pug) assume user only buy one type of products which is always true for now but not for the future
	// remove unit price and change the layout of invoice and use price in the items array
	schema.virtual("unitPrice").get(function() {

		let unitPrice = roundTo3DP(this.netAmount / this.items.length).toFixed(3);

		if(unitPrice.substr(-1) === "0") {
			unitPrice = unitPrice.slice(0, -1);
		}

		return unitPrice;
	});

	schema.virtual("pending").get(function() {
		return this.state === C.INV_PENDING;
	});

	schema.virtual("proRata").get(function() {
		const planInfo = config.subscriptions.plans[this.items[0]];
		return !planInfo ||
			!(this.items.length > 0 &&
				(this.items[0].amount - this.items[0].taxAmount).toFixed(2) === planInfo.price.toFixed(2));
	});

	// schema.set('toObject', { virtuals: true, getter:true });
	schema.set("toJSON", { virtuals: true, getters:true });

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

	schema.statics.findByAccount = function (account) {
		const projection = {
			raw: 0,
			pdf: 0
		};
		return this.find({ account }, {state: {"$in": [C.INV_PENDING, C.INV_COMPLETE] }}, projection, { sort: { createdAt: -1 } });
	};

	schema.statics.findByPaypalPaymentToken = function(account, paypalPaymentToken) {
		return this.findOne({ account }, { paypalPaymentToken }, { raw: 0, pdf: 0});
	};

	schema.statics.findByAgreementId = function(account, billingAgreementId) {
		return this.find({ account }, { billingAgreementId }, { raw: 0, pdf: 0});
	};

	schema.statics.findLatestCompleteByAgreementId = function (account, billingAgreementId) {
		return this.findOne({ account }, { billingAgreementId, state: C.INV_COMPLETE}, { raw: 0, pdf: 0 });
	};

	schema.statics.findByInvoiceNo = function (account, invoiceNo) {
		return this.findOne({ account }, { invoiceNo });
	};

	schema.statics.findByTransactionId = function (account, transactionId) {
		return this.findOne({ account }, { transactionId }, { raw: 0, pdf: 0 });
	};

	schema.statics.hasPendingBill = function (account, billingAgreementId) {
		return this.count({ account }, { billingAgreementId: billingAgreementId, pending: true })
			.then(count => {
				return Promise.resolve(count > 0);
			});
	};

	schema.statics.findPendingInvoice = function(account, billingAgreementId) {
		return this.findOne({ account }, { billingAgreementId, state: C.INV_PENDING });
	};

	schema.statics.findAndRemovePendingBill = function (account, billingAgreementId) {
		return this.findOne({ account }, { billingAgreementId: billingAgreementId, pending: true })
			.then(billing => {
				if (billing) {
					return billing.remove()
						.then(() => {
							return billing;
						});
				}
			});
	};

	schema.statics.createRefund = function (user, data) {

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

	async function printPDF(html, pdfPath) {
		const instance = await phantom.create();
		const page = await instance.createPage();
		await page.property("viewportSize", { width: 1200, height: 1553 });
		await page.property("content", html);
		await page.render(pdfPath);
		await instance.exit();
	}

	schema.methods.generatePDF = function () {

		if (!config.invoice_dir) {
			return Promise.reject({ message: "invoice dir is not set in config file" });
		}

		if(this.items.length > 0 && (!config.subscriptions || !config.subscriptions.plans[this.items[0].name])) {
			return Promise.reject(responseCodes.UNKNOWN_PAY_PLAN);
		}

		const pdfPath = `${config.invoice_dir}/${this.id}.pdf`;

		return new Promise((resolve, reject) => {

			const useNonPublicPort = true;

			let template = path.join(__dirname, "../../pug/invoice.pug");
			if (this.type === "refund") {
				template = path.join(__dirname, "../../pug/refund.pug");
			}

			pug.renderFile(template, { billing: this.toJSON(), baseURL: config.getBaseURL(useNonPublicPort) }, function (err, html) {
				if (err) {
					reject(err);
				} else {
					resolve(html);
				}
			});
		}).then((html) => {
			return printPDF(html, pdfPath).then(() => {
				const pdfRS = fs.createReadStream(pdfPath);
				const bufs = [];

				return new Promise((resolve, reject) => {

					pdfRS.on("data", function (d) {
						bufs.push(d);
					});
					pdfRS.on("end", function () {
						resolve(Buffer.concat(bufs));
					});
					pdfRS.on("err", err => {
						reject(err);
					});
				});
			});

		}).then(pdf => {

			fs.unlink(pdfPath, function (err) {
				if (err) {
					systemLogger.logError("error while deleting tmp invoice pdf file", {
						message: err.message,
						err: err,
						file: pdfPath
					});
				} else {
					systemLogger.logInfo("tmp pdf invoice deleted", {
						file: pdfPath
					});
				}
			});
			return pdf;

		}).catch(err => {
			return Promise.reject(err);
		});

	};

	const Invoice = ModelFactory.createClass(
		"Invoice",
		schema,
		() => {
			return "invoices";
		}
	);

	module.exports = Invoice;

})();
