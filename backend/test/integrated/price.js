'use strict';

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

let request = require('supertest');
let expect = require('chai').expect;
let app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");
let UserBilling = require('../../models/userBilling');
let getNextPaymentDate = UserBilling.statics.getNextPaymentDate;
let helpers = require("./helpers");
let async = require('async');
let moment = require('moment-timezone');
let User = require('../../models/user');
let url = require('url');
describe('Billing agreement price from PayPal', function () {

	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'price_testing';
	let password = 'price_testing';
	let email = 'price_testing@mailinator.com';

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			helpers.signUpAndLogin({
				server, request, agent, expect, User, systemLogger,
				username, password, email,
				done: function(err, _agent){
					agent = _agent;
					done(err);
				}
			});
	

		});

	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});

	function makeTest(options, done){
		let plans = {
			"plans": [
				{    
				"plan": "THE-100-QUID-PLAN",
				"quantity": options.noOfLicence
				}
			],
			"billingAddress":{
				"line1": "line1",
				"line2": "line2",
				"line3": "line3",
				"firstName": "Hello",
				"lastName": "World",
				"city": "city",
				"postalCode": "A00 2ss020",
				"countryCode": options.country,
				"vat": options.vat
			}
		};

		agent.post(`/${username}/subscriptions`)
		.send(plans)
		.expect(200, function(err, res){
			expect(res.body).to.have.property('url');
			let parsed = url.parse(res.body.url, true);
			expect(parsed.query).to.have.property('token');
			
			let paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === 'REGULAR');
			expect(paymentDef).to.be.not.null;
			expect(paymentDef.amount.value).to.equal(options.amount);
			expect(paymentDef.amount.currency).to.equal('GBP');


			expect(paymentDef.charge_models[0].type).to.equal('TAX');
			expect(paymentDef.charge_models[0].amount.value).to.equal(options.taxAmount);
			expect(paymentDef.charge_models[0].amount.currency).to.equal('GBP');

			if(options.firstAmount){
				
				let paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === 'TRIAL');

				expect(paymentDef).to.be.not.null;
				expect(paymentDef.amount.value).to.equal(options.firstAmount);
				expect(paymentDef.amount.currency).to.equal('GBP');
				expect(paymentDef.charge_models[0].type).to.equal('TAX');
				expect(paymentDef.charge_models[0].amount.value).to.equal(options.firstTaxAmount);
				expect(paymentDef.charge_models[0].amount.currency).to.equal('GBP');
			}

			done(err);
		});
	}

	it('GB Business', function(done){
		this.timeout(20000);
		makeTest({ 
			noOfLicence: 3, 
			vat: '206909015', 
			country: 'GB', 
			amount: '300', 
			taxAmount: '60', 
		}, done);
	});

	it('GB Personal', function(done){
		this.timeout(20000);
		makeTest({ 
			noOfLicence: 2, 
			country: 'GB', 
			amount: '200', 
			taxAmount: '40', 
		}, done);

	});

	it('DE Business', function(done){
		this.timeout(20000);
		makeTest({ 
			noOfLicence: 3, 
			vat: '9009009', 
			country: 'DE', 
			amount: '300',
			taxAmount: '0'
		}, done);
	});

	it('DE Personal', function(done){
		this.timeout(20000);
		makeTest({ 
			noOfLicence: 2, 
			country: 'DE', 
			amount: '200', 
			taxAmount: '38',
			vat: "",
		}, done);

	});

	describe('increase 1 licence', function(){


		before(function(){
		
			let twoDaysAgo = moment.utc().subtract(2, 'Day').startOf('date');
			let nextPaymentDate = getNextPaymentDate(twoDaysAgo);

			return User.findByUserName(username).then(user => {
				user.customData.billing.subscriptions = [{
					"plan" : "THE-100-QUID-PLAN",
					"createdAt" : twoDaysAgo.toDate(),
					"updatedAt" : twoDaysAgo.toDate(),
					"active" : true,
					"assignedUser" : username,
					"expiredAt" :  moment.utc().add(2, 'Day').endOf('date').toDate(),
					"inCurrentAgreement" : true,
					"limits" : {
						"collaboratorLimit" : 1,
						"spaceLimit" : 10737418240
					}
				}];

				user.customData.billing.billingUser = username,
				user.customData.billing.lastAnniversaryDate = twoDaysAgo,
				user.customData.billing.paypalPaymentToken = "EC-00000000000000000";
				user.customData.billingAgreementId = "I-000000000000";
				user.customData.billing.nextPaymentDate = nextPaymentDate;
				return user.save();
			});
		});


		it('GB Business', function(done){
			this.timeout(20000);
			makeTest({ 
				noOfLicence: 2, 
				vat: '206909015', 
				country: 'GB', 
				amount: '200', 
				taxAmount: '40'
			}, done);
		});
	});
});