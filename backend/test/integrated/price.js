"use strict";

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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp(
	{ session: require("express-session")({ secret: "testing"}) }
);
const log_iface = require("../../logger.js");
const systemLogger = log_iface.systemLogger;
const UserBilling = require("../../models/userBilling");
const getNextPaymentDate = UserBilling.statics.getNextPaymentDate;
const helpers = require("./helpers");
const moment = require("moment-timezone");
const User = require("../../models/user");
const url = require("url");

const Paypal = require("../../models/paypal");
// const Subscriptions = require("../../models/subscriptions");

const sinon = require("sinon");

describe("Billing agreement price from PayPal", function () {

	let server;
	let agent;
	let username = "price_testing";
	let password = "price_testing";
	let email = "price_testing@mailinator.com";

	// console.log(Paypal);
	// Paypal.processPayments = function() { return Promise.resolve(); };
	const timeout = 30000;

	before(function(done){

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

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
			console.log("API test server is closed");
			done();
		});
	});

	function makeTest(options, stubs, done){
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

		const restores = [];
		
		stubs.forEach(function(stubDetails){

			const objToStub = stubDetails[0];
			const funcName = stubDetails[1];
			const stubObj = stubDetails[2];

			const stub = sinon.stub(objToStub, funcName).callsFake(function(){
				return Promise.resolve(stubObj);
			});

			restores.push(stub);

		});

		agent.post(`/${username}/subscriptions`)
		.send(plans)
		.expect(200, function(err, res){

			restores.forEach(function(restoreStub){
				restoreStub.restore();
			});
			
			expect(res.body).to.have.property("url");
			let parsed = url.parse(res.body.url, true);
			expect(parsed.query).to.have.property("token");
			
			let paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === "REGULAR");
			expect(paymentDef).to.be.not.null;
			expect(paymentDef.amount.value).to.equal(options.amount);
			expect(paymentDef.amount.currency).to.equal("GBP");


			expect(paymentDef.charge_models[0].type).to.equal("TAX");
			expect(paymentDef.charge_models[0].amount.value).to.equal(options.taxAmount);
			expect(paymentDef.charge_models[0].amount.currency).to.equal("GBP");

			if(options.firstAmount){
				
				paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === "TRIAL");

				expect(paymentDef).to.be.not.null;
				expect(paymentDef.amount.value).to.equal(options.firstAmount);
				expect(paymentDef.amount.currency).to.equal("GBP");
				expect(paymentDef.charge_models[0].type).to.equal("TAX");
				expect(paymentDef.charge_models[0].amount.value).to.equal(options.firstTaxAmount);
				expect(paymentDef.charge_models[0].amount.currency).to.equal("GBP");
			}

			done(err);
		});

	}

	it("GB Business", function(done) {
		this.timeout(timeout);
		const stub = [
			[Paypal, "processPayments", 
			{
				"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-53W81821MT2829201",
				"paypalPaymentToken": "EC-53W81821MT2829201",
				"agreement": {
					"name": "3D Repo Licences",
					"description": "Regular monthly recurring payment £360. This agreement starts on 13th Sep 2017",
					"plan": {
						"id": "P-35R25115F9941233GPKYRU5Q",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": [
							{
								"id": "PD-6RL2715138822751APKYRU5Q",
								"name": "Regular monthly price",
								"type": "REGULAR",
								"frequency": "Month",
								"amount": {
									"currency": "GBP",
									"value": "300"
								},
								"cycles": "0",
								"charge_models": [
									{
										"id": "CHM-1BY98212LK880653HPKYRU5Q",
										"type": "TAX",
										"amount": {
											"currency": "GBP",
											"value": "60"
										}
									}
								],
								"frequency_interval": "1"
							}
						],
						"merchant_preferences": {
							"setup_fee": {
								"currency": "GBP",
								"value": "0"
							},
							"max_fail_attempts": "0",
							"return_url": "http://127.0.0.1:8080//price_testing?page=billing",
							"cancel_url": "http://127.0.0.1:8080//price_testing?page=billing&cancel=1",
							"auto_bill_amount": "YES",
							"initial_fail_amount_action": "CONTINUE"
						}
					},
					"links": [
						{
							"href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-53W81821MT2829201",
							"rel": "approval_url",
							"method": "REDIRECT"
						},
						{
							"href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-53W81821MT2829201/agreement-execute",
							"rel": "execute",
							"method": "POST"
						}
					],
					"start_date": "2017-09-13T10:03:53Z",
					"httpStatusCode": 201
				}
			}]
		];
	
		makeTest({ 
			noOfLicence: 3, 
			vat: "206909015", 
			country: "GB", 
			amount: "300", 
			taxAmount: "60", 
		}, stub, done);
	});

	it("GB Personal", function(done){
		this.timeout(timeout);
		const stub = [
			[Paypal, "processPayments", 
			{
				"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-20896650H4046874W",
				"paypalPaymentToken": "EC-20896650H4046874W",
				"agreement": {
					"name": "3D Repo Licences",
					"description": "Regular monthly recurring payment £240. This agreement starts on 13th Sep 2017",
					"plan": {
						"id": "P-4NK93752GA207012UPKYTCRY",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": [
							{
								"id": "PD-5DB61909LV769472KPKYTCRY",
								"name": "Regular monthly price",
								"type": "REGULAR",
								"frequency": "Month",
								"amount": {
									"currency": "GBP",
									"value": "200"
								},
								"cycles": "0",
								"charge_models": [
									{
										"id": "CHM-6HR30982D3293461TPKYTCRY",
										"type": "TAX",
										"amount": {
											"currency": "GBP",
											"value": "40"
										}
									}
								],
								"frequency_interval": "1"
							}
						],
						"merchant_preferences": {
							"setup_fee": {
								"currency": "GBP",
								"value": "0"
							},
							"max_fail_attempts": "0",
							"return_url": "http://127.0.0.1:8080//price_testing?page=billing",
							"cancel_url": "http://127.0.0.1:8080//price_testing?page=billing&cancel=1",
							"auto_bill_amount": "YES",
							"initial_fail_amount_action": "CONTINUE"
						}
					},
					"links": [
						{
							"href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-20896650H4046874W",
							"rel": "approval_url",
							"method": "REDIRECT"
						},
						{
							"href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-20896650H4046874W/agreement-execute",
							"rel": "execute",
							"method": "POST"
						}
					],
					"start_date": "2017-09-13T10:04:05Z",
					"httpStatusCode": 201
				}
			}]
		];		

		makeTest({ 
			noOfLicence: 2, 
			country: "GB", 
			amount: "200", 
			taxAmount: "40", 
		}, stub, done);

	});

	it("DE Business", function(done){
		this.timeout(timeout);
		const stub = [
			[Paypal, "processPayments", 
			{
				"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-8MM22444YE692384N",
				"paypalPaymentToken": "EC-8MM22444YE692384N",
				"agreement": {
					"name": "3D Repo Licences",
					"description": "Regular monthly recurring payment £300. This agreement starts on 13th Sep 2017",
					"plan": {
						"id": "P-88584007R1739600CPKYV5JI",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": [
							{
								"id": "PD-0NB29022KE5928340PKYV5JI",
								"name": "Regular monthly price",
								"type": "REGULAR",
								"frequency": "Month",
								"amount": {
									"currency": "GBP",
									"value": "300"
								},
								"cycles": "0",
								"charge_models": [
									{
										"id": "CHM-6GN06805CH6123530PKYV5JI",
										"type": "TAX",
										"amount": {
											"currency": "GBP",
											"value": "0"
										}
									}
								],
								"frequency_interval": "1"
							}
						],
						"merchant_preferences": {
							"setup_fee": {
								"currency": "GBP",
								"value": "0"
							},
							"max_fail_attempts": "0",
							"return_url": "http://127.0.0.1:8080//price_testing?page=billing",
							"cancel_url": "http://127.0.0.1:8080//price_testing?page=billing&cancel=1",
							"auto_bill_amount": "YES",
							"initial_fail_amount_action": "CONTINUE"
						}
					},
					"links": [
						{
							"href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-8MM22444YE692384N",
							"rel": "approval_url",
							"method": "REDIRECT"
						},
						{
							"href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-8MM22444YE692384N/agreement-execute",
							"rel": "execute",
							"method": "POST"
						}
					],
					"start_date": "2017-09-13T10:04:10Z",
					"httpStatusCode": 201
				}
			}]
		];
		

		makeTest({ 
			noOfLicence: 3, 
			vat: "DE129273398", // BMW
			country: "DE", 
			amount: "300",
			taxAmount: "0"
		}, stub, done);
	});

	it("DE Personal", function(done){
		this.timeout(timeout);
		const stub = [
			[Paypal, "processPayments", 
			{  
				"url":"https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-0PS51725E1940781W",
				"paypalPaymentToken":"EC-0PS51725E1940781W",
				"agreement":{  
					"name":"3D Repo Licences",
					"description":"Regular monthly recurring payment £238. This agreement starts on 15th Sep 2017",
					"plan":{  
						"id":"P-1LV62557KX855630CQVCHT5Y",
						"state":"ACTIVE",
						"name":"3D Repo Licences",
						"description":"3D Repo Licence",
						"type":"INFINITE",
						"payment_definitions":[  
							{  
								"id":"PD-11J63997F8299793SQVCHT5Y",
								"name":"Regular monthly price",
								"type":"REGULAR",
								"frequency":"Month",
								"amount":{  
									"currency":"GBP",
									"value":"200"
								},
								"cycles":"0",
								"charge_models":[  
									{  
										"id":"CHM-09932724JT6424848QVCHT5Y",
										"type":"TAX",
										"amount":{  
											"currency":"GBP",
											"value":"38"
										}
									}
								],
								"frequency_interval":"1"
							}
						],
						"merchant_preferences":{  
							"setup_fee":{  
								"currency":"GBP",
								"value":"0"
							},
							"max_fail_attempts":"0",
							"return_url":"http://127.0.0.1:8080//price_testing?page=billing",
							"cancel_url":"http://127.0.0.1:8080//price_testing?page=billing&cancel=1",
							"auto_bill_amount":"YES",
							"initial_fail_amount_action":"CONTINUE"
						}
					},
					"links":[  
						{  
							"href":"https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-0PS51725E1940781W",
							"rel":"approval_url",
							"method":"REDIRECT"
						},
						{  
							"href":"https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-0PS51725E1940781W/agreement-execute",
							"rel":"execute",
							"method":"POST"
						}
					],
					"start_date":"2017-09-15T11:21:06Z",
					"httpStatusCode":201
				}
			}]
		];

		makeTest({ 
			noOfLicence: 2, 
			country: "DE", 
			amount: "200", 
			taxAmount: "38",
			vat: "",
		}, stub, done);

	});

	describe("increase 1 licence", function(){

		before(function(){
		
			let twoDaysAgo = moment.utc().subtract(2, "Day").startOf("date");
			let nextPaymentDate = getNextPaymentDate(twoDaysAgo);

			return User.findByUserName(username).then(user => {
				user.customData.billing.subscriptions = [{
					"plan" : "THE-100-QUID-PLAN",
					"createdAt" : twoDaysAgo.toDate(),
					"updatedAt" : twoDaysAgo.toDate(),
					"active" : true,
					"assignedUser" : username,
					"expiredAt" :  moment.utc().add(2, "Day").endOf("date").toDate(),
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


		it("for a GB Business", function(done){
			this.timeout(timeout);
			//console.log(Subscriptions);

			const stub = [
				[Paypal, "processPayments", 
				{
					"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-6YW47478M33522711",
					"paypalPaymentToken": "EC-6YW47478M33522711",
					"agreement": {
						"name": "3D Repo Licences",
						"description": "This month's pro-rata: £112. Regular monthly recurring payment £240. This agreement starts on 13th Sep 2017",
						"plan": {
							"id": "P-10T58675JS639823KPKXN5HI",
							"state": "ACTIVE",
							"name": "3D Repo Licences",
							"description": "3D Repo Licence",
							"type": "INFINITE",
							"payment_definitions": [
								{
									"id": "PD-99Y81256A4313542TPKXN5HI",
									"name": "First month pro-rata price",
									"type": "TRIAL",
									"frequency": "Day",
									"amount": {
										"currency": "GBP",
										"value": "93.33"
									},
									"cycles": "1",
									"charge_models": [
										{
											"id": "CHM-56A55438DD999280GPKXN5HI",
											"type": "TAX",
											"amount": {
												"currency": "GBP",
												"value": "18.67"
											}
										}
									],
									"frequency_interval": "28"
								},
								{
									"id": "PD-6UG75616PJ8337823PKXN5HI",
									"name": "Regular monthly price",
									"type": "REGULAR",
									"frequency": "Month",
									"amount": {
										"currency": "GBP",
										"value": "200"
									},
									"cycles": "0",
									"charge_models": [
										{
											"id": "CHM-22F924941N1721837PKXN5HI",
											"type": "TAX",
											"amount": {
												"currency": "GBP",
												"value": "40"
											}
										}
									],
									"frequency_interval": "1"
								}
							],
							"merchant_preferences": {
								"setup_fee": {
									"currency": "GBP",
									"value": "0"
								},
								"max_fail_attempts": "0",
								"return_url": "http://127.0.0.1:8080//price_testing?page=billing",
								"cancel_url": "http://127.0.0.1:8080//price_testing?page=billing&cancel=1",
								"auto_bill_amount": "YES",
								"initial_fail_amount_action": "CONTINUE"
							}
						},
						"links": [
							{
								"href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-6YW47478M33522711",
								"rel": "approval_url",
								"method": "REDIRECT"
							},
							{
								"href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-6YW47478M33522711/agreement-execute",
								"rel": "execute",
								"method": "POST"
							}
						],
						"start_date": "2017-09-13T10:01:08Z",
						"httpStatusCode": 201
					}
				}
				]
			];

			makeTest({ 
				noOfLicence: 2, 
				vat: "206909015", 
				country: "GB", 
				amount: "200", 
				taxAmount: "40"
			}, stub, done);
		});
	});
});