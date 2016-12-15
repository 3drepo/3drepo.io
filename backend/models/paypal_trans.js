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

	const C = require("../constants");
	const config = require("../config");
	const moment = require('moment');
	const paypalPaymentTypes = {};
	
	paypalPaymentTypes[C.PRO_RATA_PAYMENT] = { "name" : "First month pro-rata price",
		"type" : "TRIAL",
		"cycles" : 1 };

	paypalPaymentTypes[C.REGULAR_PAYMENT] = { "name" : "Regular monthly price",
		"type": "REGULAR",
		"cycles": 0
	};

	let getPaypalAddress = function (billingAddress) {
		return {
			"line1": billingAddress.line1,
			"line2": billingAddress.line2,
			"city": billingAddress.city,
			"postal_code": billingAddress.postalCode,
			"country_code": billingAddress.countryCode,
			"state": billingAddress.state
		};
	};

	let getPaypalPayment = function (payment) {
		let paymentType = paypalPaymentTypes[payment.type];

		return {
			"amount": {
				"currency": payment.currency,
				"value": payment.gross
			},
			"cycles": paymentType.cycles,
			"frequency": payment.length.unit,
			"frequency_interval": payment.length.value,
			"name": paymentType.name,
			"type": paymentType.type,
			"charge_models": [{
				"type": "TAX",
				"amount": {
					"value": payment.tax,
					"currency": payment.currency
				}
			}]
		};
	};

	let getBillingPlanAttributes = function (billingUser, paymentDefs) {
		//this is for generating and api url, but we only need a frontend url.
		//let cancelUrl = config.apiAlgorithm.apiUrl(C.GET_API, `${billingUser}?page=billing&cancel=1`);
		//let returnUrl = config.apiAlgorithm.apiUrl(C.GET_API, `${billingUser}?page=billing`);

		let cancelUrl = config.getBaseURL() + `/${billingUser}?page=billing&cancel=1`;
		let returnUrl =config.getBaseURL() + `/${billingUser}?page=billing`;

		return {
			"description": "3D Repo Licence",
			"merchant_preferences": {
				"auto_bill_amount": "yes",
				"cancel_url": cancelUrl,
				"initial_fail_amount_action": "continue",
				"max_fail_attempts": "0",
				"return_url": returnUrl
			},
			"name": "3D Repo Licences",
			"payment_definitions": paymentDefs,
			"type": "INFINITE"
		};
	};

	let getBillingAgreementAttributes = function(id, startDate, billingAddress, desc)
	{
		return {
			"name": "3D Repo Licences",
			"description": desc,
			"start_date": moment(startDate)
				.utc()
				.format(),
			"plan": {
				"id": id
			},
			"payer": {
				"payment_method": "paypal"
			},
			"shipping_address": billingAddress
		};							
	};

	module.exports = {
		getPaypalAddress: getPaypalAddress,
		getPaypalPayment: getPaypalPayment,
		getBillingPlanAttributes: getBillingPlanAttributes,
		getBillingAgreementAttributes: getBillingAgreementAttributes
	};
})();