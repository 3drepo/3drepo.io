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
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var addressMeta = require('./addressMeta');
var moment = require('moment');
var fs = require('fs');
var jade = require('jade');
var phantom = require('phantom');
var config = require('../config');
var Subscriptions = require('./subscription');
var systemLogger = require("../logger.js").systemLogger;
var Counter = require('./counter');
var Mailer = require('../mailer/mailer');
var vat = require('./vat');

var schema = mongoose.Schema({
	invoiceNo: String,
	billingAgreementId: String,
	gateway: String,
	raw: {},
	createdAt: Date,
	currency: String,
	amount: String,
	type: { type: String, default: 'invoice', enum: ['invoice', 'refund']},
	items: [{
		name: String,
		description:  String, 
		currency: String,
		amount: Number,
		taxAmount: Number
	}],
	periodStart: Date,
	periodEnd: Date,
	nextPaymentDate: Date,
	nextPaymentAmount: String,
	transactionId: String,
	taxAmount: String,
	info: {
		"vat": String,
		"line1": String,
		"line2": String,
		"line3": String,
		"state": String,
		"firstName": String,
		"lastName": String,
		"company": String,
		"city": String,
		"postalCode": String,
		"countryCode": String
	},
	pending: Boolean,
	pdf: Object
});

schema.statics.findByAccount = function(account){
	return this.find({account}, {}, {raw: 0, pdf: 0}, {sort: {createdAt: -1}});
};

schema.statics.findLastestByAgreementId = function(account, billingAgreementId){
	return this.findOne({account}, { billingAgreementId }, {raw: 0, pdf: 0}, {sort: {createdAt: -1}});
};


schema.statics.findByInvoiceNo = function(account, invoiceNo){
	return this.findOne({account}, { invoiceNo});
};

schema.statics.findByTransactionId = function(account, transactionId){
	return this.findOne({account}, { transactionId }, {raw: 0, pdf: 0});
};

schema.statics.hasPendingBill = function(account, billingAgreementId){
	return this.count({account}, {billingAgreementId: billingAgreementId, pending: true}).then( count => {
		return Promise.resolve(count > 0);
	});
};

schema.statics.findAndRemovePendingBill = function(account, billingAgreementId){
	return this.findOne({account}, {billingAgreementId: billingAgreementId, pending: true}).then(billing => {
		if(billing){
			return billing.remove().then(() => {
				return billing;
			});
		}
	}); 
};

schema.statics.createRefund = function(user, data){
	'use strict';

	let lastBill;
	let billing;

	return this.findLastestByAgreementId(user.user, data.billingAgreementId).then(bill => {
		
		lastBill = bill;
		return Counter.findAndIncRefundNumber();

	}).then(counter => {

		return Promise.resolve('CN-' + counter.count);

	}).then(invoiceNo => {

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
			).toFixed(2);

		billing.billingAgreementId = data.billingAgreementId;
		billing.invoiceNo = invoiceNo;
		billing.type = 'refund';
		billing.transactionId = data.transactionId;

		let amount = data.amount.substr(1);
		if(data.currency === 'GBP'){
			amount = '£' + amount;
		} else {
			amount = data.currency + ' ' + amount;
		}

		return billing.generatePDF().then(pdf => {

			billing.pdf = pdf;
			// also save the pdf to database for ref.
			return billing.save();

		}).then(() => {

			let attachments = [{
				filename: `${moment(billing.createdAt).utc().format('YYYY-MM-DD')}_invoice-${billing.invoiceNo}.pdf`,
				content: billing.pdf
			}];

			Mailer.sendPaymentRefundedEmail(user.customData.email, { 
				amount: amount
			}, attachments);

			//make a copy to sales
			Mailer.sendPaymentReceivedEmailToSales({
				account: user.account,
				amount: data.currency  + amount,
				email: user.customData.email,
				invoiceNo: billing.invoiceNo,
				type: billing.type
			}, attachments);

			return billing;
		});




	});
};

schema.methods.clean = function(options) {
	'use strict';

	let euCountryCodes = addressMeta.euCountriesCode;

	options = options || {};

	let billing = this.toObject();

	let k = 1;
	if(billing.type === 'refund'){
		k = -1;
	}

	billing.info.country = addressMeta.countries.find(c => c.code === billing.info.countryCode).name;
	billing.amount  = (parseFloat(billing.amount) * k).toFixed(2);
	billing.taxAmount = (parseFloat(billing.taxAmount) * k).toFixed(2);
	billing.netAmount  = (Math.round((parseFloat(billing.amount) - parseFloat(billing.taxAmount)) * 100) / 100).toFixed(2);
	billing.taxPercentage = (Math.round(parseFloat(billing.taxAmount) / parseFloat(billing.netAmount) * 100) / 100 * 100);

	if(billing.type === 'invoice'){

		billing.nextPaymentAmount = parseFloat(billing.nextPaymentAmount).toFixed(2);
		billing.unitPrice = (Math.round(parseFloat(billing.netAmount) / billing.items.length * 1000) / 1000).toFixed(3);
		
		if(billing.unitPrice.substr(-1) === '0'){
			billing.unitPrice = billing.unitPrice.slice(0, -1);
		}

		if(billing.unitPrice !== Subscriptions.getSubscription(billing.items[0].name).amount.toFixed(2)){
			billing.proRata = true;
		}

		billing.nextPaymentDate = moment(billing.nextPaymentDate).utc().format('YYYY-MM-DD');
		
		if(!options.skipDate) {
			billing.periodStart = moment(billing.periodStart).utc().format('YYYY-MM-DD');
			billing.periodEnd = moment(billing.periodEnd).utc().format('YYYY-MM-DD');
		}

		billing.B2B_EU = (euCountryCodes.indexOf(billing.info.countryCode) !== -1) && (billing.info.hasOwnProperty("vat"));

	}

	if(!options.skipDate) {
		billing.createdAt = moment(billing.createdAt).utc().format('DD-MM-YYYY HH:mm');
	}

	return billing;
};

schema.methods.generatePDF = function(){
	'use strict';

	let cleaned = this.clean();

	let ph;
	let page;
	let htmlPath = `${config.invoice_dir}/${this.id}.html`;
	let pdfPath = `${config.invoice_dir}/${this.id}.pdf`;

	if(!config.invoice_dir){
		return Promise.reject({ message: 'invoice dir is not set in config file'});
	}

	return new Promise((resolve, reject) => {
		
		let useNonPublicPort = true;

		let template = './jade/invoice.jade';
		if(this.type === 'refund'){
			template = './jade/refund.jade';
		}

		jade.renderFile(template, {billing : cleaned, baseURL: config.getBaseURL(useNonPublicPort)}, function(err, html){
			if(err){
				reject(err);
			} else {
				resolve(html);
			}
		});

	}).then(html => {

		return new Promise((resolve, reject) => {
			fs.writeFile(htmlPath, html, { flag: 'a+'}, err => {
				if(err){
					reject(err);
				} else {
					resolve();
				}
			});
		});

	}).then(() => {
		return phantom.create();

	}).then(_ph => {

		ph = _ph;
		return ph.createPage();
		
	}).then(_page => {

		page = _page;
		page.property('viewportSize', { width: 1200 , height: 1553 });
		return page.open(`file://${htmlPath}`);

	}).then(() => {

		return page.render(pdfPath);
		
	}).then(() => {

		ph && ph.exit();

		let pdfRS = fs.createReadStream(pdfPath);
		let bufs = [];

		return new Promise((resolve, reject) => {

			pdfRS.on('data', function(d){ bufs.push(d); });
			pdfRS.on('end', function(){
				resolve(Buffer.concat(bufs));
			});
			pdfRS.on('err', err => {
				reject(err);
			});
		});

	}).then(pdf => {

		fs.unlink(htmlPath, function(err){
			if(err){
				systemLogger.logError('error while deleting tmp invoice html file',{
					message: err.message,
					err: err,
					file: htmlPath
				});
			} else {
				systemLogger.logInfo('tmp html invoice deleted',{
					file: htmlPath
				});
			}
		});

		fs.unlink(pdfPath, function(err){
			if(err){
				systemLogger.logError('error while deleting tmp invoice pdf file',{
					message: err.message,
					err: err,
					file: pdfPath
				});
			} else {
				systemLogger.logInfo('tmp pdf invoice deleted',{
					file: pdfPath
				});
			}
		});

		return Promise.resolve(pdf);

	}).catch( err => {

		ph && ph.exit();
		return Promise.reject(err);
	});

};

schema.methods.getPDF = function(options){
	'use strict';

	options = options || {};

	if(options.regenerate || !this.pdf){

		return this.generatePDF();

	} else {
		//console.log('from cache')
		return Promise.resolve(this.pdf.buffer);
	}
};

var Billing = ModelFactory.createClass(
	'Billing',
	schema,
	() => {
		return 'billings';
	}
);


module.exports = Billing;