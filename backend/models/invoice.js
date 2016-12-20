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
(() => {
	"use strict";

	const mongoose = require("mongoose");
	require("mongoose-double")(mongoose);
	const ModelFactory = require("./factory/modelFactory");
	const addressMeta = require("./addressMeta");
	const moment = require("moment");
	const fs = require("fs");
	const jade = require("jade");
	const phantom = require("phantom");
	const config = require("../config");
	const Subscription = require("./subscription");
	const systemLogger = require("../logger.js").systemLogger;
	const Counter = require("./counter");
	const Mailer = require("../mailer/mailer");
	const vat = require("./vat");
	const billingAddressInfo = require("./billingAddress");
	const utils = require("../utils");
	const C = require("../constants");

	const SchemaTypes = mongoose.Schema.Types;

	// Various getter/setter helper functions
	let roundTo2DP = function(x) { return utils.roundToNDP(x, 2.0); }
	let dateToString = function(date) { return date; }
	//let dateTimeToString = function(date) { return  moment(date).utc().format(C.DATE_TIME_FORMAT); }

	let schema = mongoose.Schema({
		invoiceNo: String,
		billingAgreementId: String,
		gateway: String,
		raw: {},
		createdAt: { type: Date } ,
		currency: String,
		amount: Number, //gross+tax
		type: { type: String, default: "invoice", enum: ["invoice", "refund"] },
		items: [{
			name: String,
			description: String,
			currency: String,
			amount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },  //gross+tax
			taxAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP }
		}],
		periodStart: { type: Date, get: dateToString },
		periodEnd: { type: Date, get: dateToString },
		nextPaymentDate:  { type: Date, get: dateToString },
		nextPaymentAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },  //gross+tax
		transactionId: String,
		taxAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },
		info: billingAddressInfo,
		state: {type: String, default: C.INV_INIT, enum: [C.INV_INIT, C.INV_PENDING, C.INV_COMPLETE]},
		pdf: Object
	});

	schema.virtual("taxPercentage").get(function() {
		return this.taxAmount / this.netAmount;
	});

	schema.methods.initInvoice = function(data){

		this.createdAt = new Date();
		this.nextPaymentDate = data.nextPaymentDate;
		this.info = data.billingInfo;

		let proRataPayments = data.payments.filter(p => p.type === C.PRO_RATA_PAYMENT);

		if(proRataPayments.length > 0){
			this.currency = proRataPayments[0].currency;
			this.amount = proRataPayments.reduce((sum, payment) => sum + payment.net, 0);
			this.taxAmount = proRataPayments.reduce((sum, payment) => sum + payment.tax, 0);
		}

		let regularPayments = data.payments.filter(p => p.type === C.REGULAR_PAYMENT);
		this.nextPaymentAmount = regularPayments.reduce((sum, payment) => sum + payment.net, 0);
	
		this.periodStart = data.startDate
		this.periodEnd = moment(this.nextPaymentDate)
			.utc()
			.subtract(1, 'day')
			.endOf('date')
			.toDate();

		let plans = [];

		// if there is any pro rata priced plans then there will be no regular priced plans in this invoice and vice versa.
		if(data.changes.proRataPeriodPlans){
			plans = data.changes.proRataPeriodPlans;	
		} else if (data.changes.regularPeriodPlans){
			plans = data.changes.regularPeriodPlans;
		}

		// add items bought in the invoice
		plans.forEach(plan => {
			for(let i=0 ; i< plan.quantity; i++){
				this.items.push({
					name: Subscription.getSubscription(plan.plan).plan,
					description: Subscription.getSubscription(plan.plan).desc,
					currency: Subscription.getSubscription(plan.plan).currency,
					amount: plan.amount,  //gross+tax
					taxAmount: plan.taxAmount
				});
			}
		});
		
	}
	
	schema.statics.findByAccount = function (account) {
		return this.find({ account }, {}, { raw: 0, pdf: 0 }, { sort: { createdAt: -1 } });
	};
	

	schema.statics.findByAgreementId = function(account, billingAgreementId) {
		return this.find({ account }, { billingAgreementId }, { raw: 0, pdf: 0});
	}

	schema.statics.findLatestByAgreementId = function (account, billingAgreementId) {
		return this.findOne({ account }, { billingAgreementId }, { raw: 0, pdf: 0 }, { sort: { createdAt: -1 } });
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
		let lastBill;
		let billing;

		return this.findLatestByAgreementId(user.user, data.billingAgreementId)
			.then(bill => {

				lastBill = bill;
				return Counter.findAndIncRefundNumber();

			})
			.then(counter => {

				return Promise.resolve("CN-" + counter.count);

			})
			.then(invoiceNo => {
				billing = Billing.createInstance({ account: user.user });

				billing.info = (lastBill && lastBill.info) || user.customData.billingInfo;
				billing.raw = data.raw;
				billing.gateway = data.gateway;
				billing.createdAt = new Date();
				billing.currency = data.currency;
				billing.amount = data.amount;
				billing.taxAmount =
					(
						parseFloat(data.amount) -
						Math.round(
							(parseFloat(data.amount) / (1 + vat.getByCountryCode(billing.info.countryCode, billing.info.vat))) * 100
						) / 100
					)
					.toFixed(2);

				billing.billingAgreementId = data.billingAgreementId;
				billing.invoiceNo = invoiceNo;
				billing.type = "refund";
				billing.transactionId = data.transactionId;

				let amount = data.amount.substr(1);
				if (data.currency === "GBP") {
					amount = "£" + amount;
				} else {
					amount = data.currency + " " + amount;
				}

				return billing.generatePDF()
					.then(pdf => {

						billing.pdf = pdf;
						// also save the pdf to database for ref.
						return billing.save();

					})
					.then(() => {

						let attachments = [{
							filename: `${moment(billing.createdAt).utc().format(C.DATE_FORMAT)}_invoice-${billing.invoiceNo}.pdf`,
							content: billing.pdf
						}];

						Mailer.sendPaymentRefundedEmail(user.customData.email, {
							amount: amount
						}, attachments);

						//make a copy to sales
						Mailer.sendPaymentReceivedEmailToSales({
							account: user.account,
							amount: data.currency + amount,
							email: user.customData.email,
							invoiceNo: billing.invoiceNo,
							type: billing.type
						}, attachments);

						return billing;
					});
			});
	};

	schema.methods.generatePDF = function () {
		let cleaned = this.clean();

		let ph;
		let page;
		let htmlPath = `${config.invoice_dir}/${this.id}.html`;
		let pdfPath = `${config.invoice_dir}/${this.id}.pdf`;

		if (!config.invoice_dir) {
			return Promise.reject({ message: "invoice dir is not set in config file" });
		}

		return new Promise((resolve, reject) => {

				let useNonPublicPort = true;

				let template = "./jade/invoice.jade";
				if (this.type === "refund") {
					template = "./jade/refund.jade";
				}

				jade.renderFile(template, { billing: cleaned, baseURL: config.getBaseURL(useNonPublicPort) }, function (err, html) {
					if (err) {
						reject(err);
					} else {
						resolve(html);
					}
				});

			})
			.then(html => {

				return new Promise((resolve, reject) => {
					fs.writeFile(htmlPath, html, { flag: "a+" }, err => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				});

			})
			.then(() => {
				return phantom.create();
			})
			.then(_ph => {
				ph = _ph;
				return ph.createPage();
			})
			.then(_page => {
				page = _page;
				page.property("viewportSize", { width: 1200, height: 1553 });
				return page.open(`file://${htmlPath}`);
			})
			.then(() => {
				return page.render(pdfPath);
			})
			.then(() => {
				ph && ph.exit();

				let pdfRS = fs.createReadStream(pdfPath);
				let bufs = [];

				return new Promise((resolve, reject) => {

					pdfRS.on("data", function (d) { bufs.push(d); });
					pdfRS.on("end", function () {
						resolve(Buffer.concat(bufs));
					});
					pdfRS.on("err", err => {
						reject(err);
					});
				});
			})
			.then(pdf => {

				fs.unlink(htmlPath, function (err) {
					if (err) {
						systemLogger.logError("error while deleting tmp invoice html file", {
							message: err.message,
							err: err,
							file: htmlPath
						});
					} else {
						systemLogger.logInfo("tmp html invoice deleted", {
							file: htmlPath
						});
					}
				});

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

				return Promise.resolve(pdf);

			})
			.catch(err => {

				ph && ph.exit();
				return Promise.reject(err);
			});

	};

	schema.methods.getPDF = function (options) {
		options = options || {};

		if (options.regenerate || !this.pdf) {

			return this.generatePDF();

		} else {
			//console.log('from cache')
			return Promise.resolve(this.pdf.buffer);
		}
	};

	var Invoice = ModelFactory.createClass(
		"Invoice",
		schema,
		() => {
			return "invoices";
		}
	);

	module.exports = Invoice;

})();