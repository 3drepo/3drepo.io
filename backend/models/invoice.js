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
	const responseCodes = require("../response_codes.js");


	const SchemaTypes = mongoose.Schema.Types;

	// Various getter/setter helper functions
	let roundTo2DP = function(x) { return utils.roundToNDP(x, 2.0); };
	let roundTo3DP = function(x) { return utils.roundToNDP(x, 3.0); };
	let signAndRoundTo2DP = function(x) { return this.type === C.INV_TYPE_REFUND ? roundTo2DP(-x) : roundTo2DP(x); };
	let dateToString = function(date) { return moment(date).utc().format(C.DATE_FORMAT); };
	let dateToDateTimeString = function(date) { return moment(date).utc().format(C.DATE_TIME_FORMAT); };

	//let dateTimeToString = function(date) { return  moment(date).utc().format(C.DATE_TIME_FORMAT); }

	let itemSchema = mongoose.Schema({
		name: String,
		currency: String,
		amount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },  //gross+tax
		taxAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP }
	});

	itemSchema.virtual('description').get(function(){
//		console.log('this desc', this);
		return Subscription.getSubscription(this.name).description;
	});

	itemSchema.set('toJSON', { virtuals: true, getters:true });
	
	let schema = mongoose.Schema({
		invoiceNo: String,
		billingAgreementId: String,
		gateway: String,
		raw: {},
		createdAt: { type: Date, get: dateToDateTimeString } ,
		currency: String,
		amount: { type: SchemaTypes.Double, get: signAndRoundTo2DP, set: roundTo2DP },//gross+tax
		type: { type: String, default: C.INV_TYPE_INVOICE, enum: [C.INV_TYPE_INVOICE, C.INV_TYPE_REFUND] },
		items: [itemSchema],
		periodStart: { type: Date, get: dateToString },
		periodEnd: { type: Date, get: dateToString },
		nextPaymentDate:  { type: Date, get: dateToString },
		nextPaymentAmount: { type: SchemaTypes.Double, get: roundTo2DP, set: roundTo2DP },  //gross+tax
		transactionId: String,
		taxAmount: { type: SchemaTypes.Double, get: signAndRoundTo2DP, set: roundTo2DP },
		info: billingAddressInfo,
		state: {type: String, default: C.INV_INIT, enum: [C.INV_INIT, C.INV_PENDING, C.INV_COMPLETE]},
		pdf: Object,
		paypalPaymentToken: String
	});

	schema.virtual("netAmount").get(function() {
		return this.amount - this.taxAmount;
	});

	schema.virtual("createdAtDate").get(function() {
		return moment(this.toObject().createdAt).utc().format(C.DATE_FORMAT);
	});

	schema.virtual("taxPercentage").get(function() {
		return roundTo2DP(this.taxAmount / this.netAmount);
	});

	schema.virtual('info.countryName').get(function(){
		let country = addressMeta.countries.find(c => c.code === this.info.countryCode);
		return country && country.name;
	});

	schema.virtual('B2B_EU').get(function(){
		return (addressMeta.euCountriesCode.indexOf(this.info.countryCode) !== -1) && this.info.vat ? true : false;
	});

	//TO-DO: the current design of the invoice (invoice.jade) assume user only buy one type of products which is always true for now but not for the future
	// remove unit price and change the layout of invoice and use price in the items array
	schema.virtual('unitPrice').get(function(){

		let unitPrice = roundTo3DP(this.netAmount / this.items.length).toFixed(3);
		
		if(unitPrice.substr(-1) === '0'){
			unitPrice = unitPrice.slice(0, -1);
		}

		return unitPrice;
	});

	schema.virtual('pending').get(function(){
		return this.state === C.INV_PENDING;
	});

	schema.virtual('proRata').get(function(){
		if(this.items.length > 0 && this.items[0].amount.toFixed(2) === Subscription.getSubscription(this.items[0].name).amount.toFixed(2)){
			return true;
		}

		return false;
	});

	//schema.set('toObject', { virtuals: true, getter:true });
	schema.set('toJSON', { virtuals: true, getters:true });

	schema.pre('save', function(next){
		
		if(!this.invoiceNo && this.state !== C.INV_INIT){
			//generate invoice number if doesn't have one and passed the init state
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

	schema.methods.initInvoice = function(data){

		this.createdAt = new Date();
		this.nextPaymentDate = data.nextPaymentDate;
//		console.log('init inv', data.billingInfo);
		this.info = data.billingInfo;
		this.paypalPaymentToken = data.paypalPaymentToken;

		if(data.payments){

			let proRataPayments = data.payments.filter(p => p.type === C.PRO_RATA_PAYMENT);
			let regularPayments = data.payments.filter(p => p.type === C.REGULAR_PAYMENT);

			if(proRataPayments.length > 0){
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
			.subtract(1, 'day')
			.endOf('date')
			.toDate();

		let plans = [];

		if(data.changes){
			//init invoice items using data.changes
			// if there is any pro rata priced plans then there will be no regular priced plans in this invoice and vice versa.

			if(data.changes.proRataPeriodPlans.length > 0){
				plans = data.changes.proRataPeriodPlans;	
			} else if (data.changes.regularPeriodPlans){
				plans = data.changes.regularPeriodPlans;
			}

			// add items bought in the invoice
			plans.forEach(plan => {
				for(let i=0 ; i< plan.quantity; i++){
					//console.log('init invoice add items', plan, Subscription.getSubscription(plan.plan).plan);
					this.items.push({
						name: Subscription.getSubscription(plan.plan).plan,
						currency: Subscription.getSubscription(plan.plan).currency,
						amount: plan.amount,  //gross+tax
						taxAmount: plan.taxAmount
					});
				}
			});

			//console.log(this.items);
			return this;

		} else if (data.billingAgreementId) {
			//init items using last invoice with same billing id

			this.billingAgreementId = data.billingAgreementId;
			//copy items from last completed invoice with same agreement id
			return Invoice.findLatestCompleteByAgreementId(data.account, data.billingAgreementId).then(lastGoodInvoice => {
				if(!lastGoodInvoice){
					return Promise.reject(responseCodes.MISSING_LAST_INVOICE);
				}
				this.items = lastGoodInvoice.items;
			}).then(() => this);
		}

		
	};

	schema.methods.changeState = function(state, data){

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
		return this.find({ account }, {state: {'$in': [C.INV_PENDING, C.INV_COMPLETE] }}, { raw: 0, pdf: 0 }, { sort: { createdAt: -1 } });
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

	schema.statics.findPendingInvoice = function(account, billingAgreementId){
		//console.log(account, { billingAgreementId, state: C.INV_PENDING });
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

		const User = require('./user');

		let invoice;

		invoice = Invoice.createInstance({ account: user.user });

		invoice.info = user.customData.billing.billingInfo;
		invoice.raw = data.raw;
		invoice.gateway = data.gateway;
		invoice.createdAt = new Date();
		invoice.currency = data.currency;
		invoice.amount = data.amount;
		// full/parital refund IPNs don't have any tax infomation, need to recalulate the tax for refund case
		// or we hide tax info for refund invoice in that case we don't need to bother this
		data.amount = parseFloat(data.amount);
		invoice.taxAmount =roundTo2DP(
				data.amount -(data.amount / (1 + vat.getByCountryCode(invoice.info.countryCode, invoice.info.vat)))
		);

		invoice.billingAgreementId = data.billingAgreementId;
		invoice.type = C.INV_TYPE_REFUND;
		invoice.transactionId = data.transactionId;
		invoice.state = C.INV_COMPLETE;

		//save first to generate invoice no before generating pdf
		return invoice.save().then(invoice => {

			// also save the pdf to database for ref.
			return invoice.generatePDF().then(pdf => {
				invoice.pdf = pdf;
				return invoice;
			});

		}).then(invoice => {

			let attachments = [{
				filename: `${moment(invoice.createdAtDate).utc().format(C.DATE_FORMAT)}_invoice-${invoice.invoiceNo}.pdf`,
				content: invoice.pdf
			}];

			User.findByUserName(user.customData.billing.billingUser).then(billingUser => {
				Mailer.sendPaymentRefundedEmail(billingUser.customData.email, {
					amount: `${data.currency}${data.amount}`
				}, attachments);

				//make a copy to sales
				Mailer.sendPaymentReceivedEmailToSales({
					account: user.user,
					amount: `${data.currency}${data.amount}`,
					email: billingUser.customData.email,
					invoiceNo: invoice.invoiceNo,
					type: invoice.type
				}, attachments);
			});

			return invoice;
		});
	};

	schema.methods.generatePDF = function () {
		//let cleaned = this.clean();

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

				jade.renderFile(template, { billing: this.toJSON(), baseURL: config.getBaseURL(useNonPublicPort) }, function (err, html) {
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