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

var paypal = require('paypal-rest-sdk');
var url = require('url');
var config = require('../config');
var vat = require('./vat');
var moment = require('moment');

paypal.configure({
	'mode': config.paypal.mode, //sandbox or live
	'client_id': config.paypal.client_id,
	'client_secret': config.paypal.client_secret,
});


var Subscription = require('./subscription');
var getSubscription = Subscription.getSubscription;

function roundTo2DP(value){
	return Math.round(value * 100) / 100;
}

function getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, lastAnniversaryDate, nextPaymentDate, country, isBusiness){
	'use strict';

	let firstCycleAmount = 0;
	let firstCycleBeforeTaxAmount = 0;
	let firstCycleTaxAmount = 0;
	let firstCycleLength = { value: -1, unit : 'DAY' };

	let regularAmount = 0;
	let regularBeforeTaxAmount = 0;
	let regularTaxAmount = 0;
	let regularCycleLength = { value: 1, unit: 'MONTH' };

	let startDate;

	// new licences
	newLicences.forEach(licence => {

		if(licence.quantity > 0){
			regularAmount += getSubscription(licence.plan).amount * licence.quantity;
		}
		
	});

	// do pro-rata if not first time to buy
	if(oldPayableLicences.length > 0 && regularAmount > 0){

		paymentDate = moment(paymentDate).utc();
		startDate = paymentDate.toDate();

		lastAnniversaryDate = moment(lastAnniversaryDate).utc();
		nextPaymentDate = moment(nextPaymentDate).utc();
		console.log(moment(paymentDate).utc().startOf('date').toISOString());
		console.log(moment.duration(nextPaymentDate.diff(moment(paymentDate).utc().startOf('date'))).asDays());
		firstCycleLength.value = Math.round(moment.duration(nextPaymentDate.diff(moment(paymentDate).utc().startOf('date'))).asDays());
		firstCycleAmount =  firstCycleLength.value / Math.round(moment.duration(nextPaymentDate.diff(lastAnniversaryDate)).asDays()) * regularAmount;
		firstCycleAmount = Math.round(firstCycleAmount * 100) / 100;

	} else if (regularAmount > 0) {
		startDate =  moment(paymentDate).utc().toDate();
	} else {
		// decrease no. of licences
		startDate = moment(nextPaymentDate).utc().toDate();
	}


	oldPayableLicences.forEach(licence => {

		let quantity = licence.quantity;
		let plan = getSubscription(licence.plan);
		regularAmount += plan.amount * quantity;
	});


	firstCycleBeforeTaxAmount = firstCycleAmount / (1 + vat.getByCountryCode(country, isBusiness));
	firstCycleTaxAmount = firstCycleAmount - firstCycleBeforeTaxAmount;

	regularBeforeTaxAmount = regularAmount / ( 1 + vat.getByCountryCode(country, isBusiness));
	regularTaxAmount = regularAmount - regularBeforeTaxAmount;


	firstCycleAmount = roundTo2DP(firstCycleAmount);
	firstCycleBeforeTaxAmount = roundTo2DP(firstCycleBeforeTaxAmount);
	firstCycleTaxAmount = roundTo2DP(firstCycleTaxAmount);

	regularAmount  = roundTo2DP(regularAmount);
	regularBeforeTaxAmount = roundTo2DP(regularBeforeTaxAmount);
	regularTaxAmount = roundTo2DP(regularTaxAmount);

	return {
		firstCycleAmount,
		firstCycleBeforeTaxAmount,
		firstCycleTaxAmount,
		firstCycleLength,
		regularAmount,
		regularBeforeTaxAmount,
		regularTaxAmount,
		regularCycleLength,
		startDate
	};
}

function getBillingAgreement(
	billingUser, billingAddress, currency, 
	firstCycleAmount, firstCycleBeforeTaxAmount, firstCycleTaxAmount, firstCycleLength,
	regularAmount, regularBeforeTaxAmount, regularTaxAmount, regularCycleLength, 
	startDate
){
	'use strict';

	console.log('firstCycleAmount', firstCycleAmount);
	console.log('regularAmount', regularAmount);
	console.log('startDate', startDate);

	let apiServerConfig = config.servers.find(server => server.service === 'api');
	let port = '';
	if(config.using_ssl && apiServerConfig.public_port !== 443 || !config.using_ssl && apiServerConfig.public_port !== 80){
		port = ':' + apiServerConfig.public_port;
	}

	let baseUrl = (config.using_ssl ? 'https://' : 'http://') + config.host + port;


	let paymentDefs = [];
	paymentDefs.push({
		"amount": {
			"currency": currency,
			"value": regularBeforeTaxAmount
		},
		"cycles": "0",
		"frequency": regularCycleLength.unit,
		"frequency_interval": regularCycleLength.value,
		"name": "Regular monthly price",
		"type": "REGULAR",
		"charge_models":[{
			"type": "TAX",
			"amount": {
				"value": regularTaxAmount,
				"currency": currency
			}
		}]
	});

	if(firstCycleAmount){
		

		paymentDefs.push({
			"amount": {
				"currency": currency,
				"value": firstCycleBeforeTaxAmount
			},
			"cycles": "1",
			"frequency": firstCycleLength.unit,
			"frequency_interval": firstCycleLength.value,
			"name": "First month pro-rata price",
			"type": "TRIAL",
			"charge_models":[{
				"type": "TAX",
				"amount": {
					"value": firstCycleTaxAmount,
					"currency": currency
				}
			}]
		});
	}


	let billingPlanAttributes = {
		"description": "3D Repo Licence",
		"merchant_preferences": {
			"auto_bill_amount": "yes",
			"cancel_url": `${baseUrl}/${billingUser}?page=billing`,
			"initial_fail_amount_action": "continue",
			"max_fail_attempts": "0",
			"return_url": `${baseUrl}/${billingUser}?page=billing&cancel=1`
		},
		"name": "3D Repo Licences",
		"payment_definitions": paymentDefs,
	    "type": "INFINITE"
	};


	console.log(JSON.stringify(billingPlanAttributes, null ,2));

	return new Promise((resolve, reject) => {

		// create plan
		paypal.billingPlan.create(billingPlanAttributes, function (err, billingPlan) {
			
			if(err){
				reject(err);
			} else {
				resolve(billingPlan);
			}
		});

	}).then(billingPlan => {

		//activate plan
		return new Promise((resolve, reject) => {
			var billingPlanUpdateAttributes = [
				{
					"op": "replace",
					"path": "/",
					"value": {
						"state": "ACTIVE"
					}
				}
			];

			paypal.billingPlan.update(billingPlan.id, billingPlanUpdateAttributes, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve(billingPlan);
				}
			});

		});
	}).then(billingPlan => {

		//create agreement
		return new Promise((resolve, reject) => {

			let desc = ``;
			if (firstCycleAmount){
				desc += `This month's pro-rata: £${firstCycleAmount}. `;
			}
			desc += `Regualr monthly recurring payment £${regularAmount}, starts on ${moment(startDate).utc().format('Do MMM YYYY')}`;
			
			console.log('desc len', desc.length);

			let billingAgreementAttributes = {
				"name": "3D Repo Licenses",
				"description": desc,
				"start_date": moment(startDate).utc().format(),
				"plan": {
					"id": billingPlan.id
				},
				"payer": {
					"payment_method": "paypal"
				},
				"shipping_address": billingAddress
			};

			console.log(JSON.stringify(billingAgreementAttributes, null , 2));
			console.log('creating agreement...');
			paypal.billingAgreement.create(billingAgreementAttributes, function (err, billingAgreement) {
				if (err) {
					reject(err);
				} else {

					console.log(JSON.stringify(billingAgreement, null ,2));
					let link = billingAgreement.links.find(link => link.rel === 'approval_url');
					let token = url.parse(link.href, true).query.token;

					resolve({ 
						url: link.href, 
						paypalPaymentToken: token
					});
				}
			});

		});


	});

}

function updateBillingAddress(billingAgreementId, billingAddress){
	'use strict';

	let updateOps = [
		{
			"op": "replace",
			"path": "/",
			"value": {
				"shipping_address": billingAddress
			}
		}
	];

	return new Promise((resolve, reject) => {
		paypal.billingAgreement.update(billingAgreementId, updateOps, function (err, billingAgreement) {
			if (err) {
				reject(err);
			} else {
				console.log(JSON.stringify(billingAgreement));
				resolve(billingAgreement);
			}
		});
	});

}

// used to predict next payment date when ipn from paypal is delayed, where ipn contains the actual next payment date info.
function getNextPaymentDate(date){
	'use strict';
	
	let start = moment(date).utc().startOf('date');
	let next = moment(date).utc().startOf('date').add(1, 'month');

	if(next.date() !== start.date()){
		next.add(1, 'day');
	}

	return next.toDate();
}

module.exports = {
	getBillingAgreement,
	updateBillingAddress,
	paypal,
	getNextPaymentDate,
	getPaymentDateAndAmount
};
