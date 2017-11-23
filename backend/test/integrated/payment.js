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
const responseCodes = require("../../response_codes.js");
const helpers = require("./helpers");
const async = require("async");
const moment = require("moment-timezone");

const Paypal = require("../../models/paypal");
const UserBilling = require("../../models/userBilling");
const getNextPaymentDate = UserBilling.statics.getNextPaymentDate;
const url = require("url");

const sinon = require("sinon");

describe("Enrolling to a subscription", function () {
	let User = require("../../models/user");
	let server;
	let agent;
	let username = "payment_testing";
	let password = "payment_testing";

	let username2 = "payment_user2";
	let password2 = "payment_user2";
	let email2 = "test3drepo_payment2@mailinator.com";


	let username3 = "payment_user3";
	let password3 = "payment_user3";
	let email3 = "test3drepo_payment3@mailinator.com";

	let email = "test3drepo_payment@mailinator.com";
	let billingId = "I-000000000000";

	const timeout = 30000;
	
	before(function(done){

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			async.series([

				function(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username2, password: password2, email: email2,
						done
					});
				},

				function(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username: username3, password: password3, email: email3,
						done
					});
				},

				function(done){
					helpers.signUpAndLogin({
						server, request, agent, expect, User, systemLogger,
						username, password, email,
						done: function(err, _agent){
							agent = _agent;
							if (err) {
								return done(err);
							}

							agent = request.agent(server);
							agent.post("/login")
							.send({ username, password })
							.expect(200, function(err, res){
								expect(res.body.username).to.equal(username);
								done(err);
							});
						}
					});
				},

			], done);


		});

	});

	after(function(done){
		
		server.close(function(){
			console.log("API test server is closed");
			done();
		});
		
	});

	let plans = {
		"plans": [
			{
			"plan": "THE-100-QUID-PLAN",
			"quantity": 3
			}
		],
		"billingAddress":{
			"line1": "line1",
			"line2": "line2",
			"line3": "line3",
			"firstName": "henry",
			"lastName": "liu",
			"company": "3D Repo",
			"city": "London",
			"postalCode": "A00 2ss020",
			"countryCode": "GB",
			"vat": "123456"
		}
	};


	// it("should fail if VAT is invalid", function(done){
	// 	this.timeout(timeout);

	// 	agent.post(`/${username}/subscriptions`)
	// 	.send(plans)
	// 	.expect(400, function(err, res){
	// 		expect(res.body.value).to.equal(responseCodes.INVALID_VAT.value);
	// 		done(err);
	// 	});
	// });


	it("should succeed no VAT is supplied", function(done){
		this.timeout(timeout);

		delete plans.billingAddress.vat;

		const stub = sinon.stub(Paypal, "processPayments").callsFake(function(){
			return Promise.resolve({
				"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-09X091704Y2940153",
				"paypalPaymentToken": "EC-09X091704Y2940153",
				"agreement": {
					"name": "3D Repo Licences",
					"description": "Regular monthly recurring payment £360. This agreement starts on 12th Sep 2017",
					"plan": {
						"id": "P-1T962325AA766784AO27Y6EY",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": {},
						"merchant_preferences": {}
					},
					"links": [
						{},
						{}
					],
					"start_date": "2017-09-12T15:40:36Z",
					"httpStatusCode": 201
				}
			});
		});

		agent.post(`/${username}/subscriptions`)
		.send(plans)
		.expect(200, function(err, res){
			stub.restore();
			done(err);
		});
	});


	it("should succeed if VAT is supplied and country is non EU", function(done){
		this.timeout(timeout);

		let _plans = {
			"plans": [
				{
				"plan": "THE-100-QUID-PLAN",
				"quantity": 3
				}
			],
			"billingAddress":{
				"line1": "line1",
				"line2": "line2",
				"line3": "line3",
				"firstName": "henry",
				"lastName": "liu",
				"company": "3D Repo",
				"city": "London",
				"postalCode": "A00 2ss020",
				"countryCode": "HK",
				"vat": "123456"
			}
		};

		const stub = sinon.stub(Paypal, "processPayments").callsFake(function() {
			return Promise.resolve({
				"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-44W21718DX6163938",
				"paypalPaymentToken": "EC-44W21718DX6163938",
				"agreement": {
					"name": "3D Repo Licences",
					"description": "Regular monthly recurring payment £300. This agreement starts on 12th Sep 2017",
					"plan": {
						"id": "P-9HD80406DS1522445O273VKQ",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": {},
						"merchant_preferences": {}
					},
					"links": [
						{},
						{}
					],
					"start_date": "2017-09-12T15:40:49Z",
					"httpStatusCode": 201
				}
			});
		});

		agent.post(`/${username}/subscriptions`)
		.send(_plans)
		.expect(200, function(err, res){
			stub.restore();
			done(err);
		});
	});


	it("should succeed VAT is not supplied and country is non EU", function(done){
		this.timeout(timeout);

		let _plans = {
			"plans": [
				{
				"plan": "THE-100-QUID-PLAN",
				"quantity": 3
				}
			],
			"billingAddress":{
				"line1": "line1",
				"line2": "line2",
				"line3": "line3",
				"firstName": "henry",
				"lastName": "liu",
				"company": "3D Repo",
				"city": "London",
				"postalCode": "A00 2ss020",
				"countryCode": "HK"
			}
		};
		
		const stub = sinon.stub(Paypal, "processPayments").callsFake(function() {
			return Promise.resolve({
				"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-3M948685LE836592J",
				"paypalPaymentToken": "EC-3M948685LE836592J",
				"agreement": {
					"name": "3D Repo Licences",
					"description": "Regular monthly recurring payment £360. This agreement starts on 12th Sep 2017",
					"plan": {
						"id": "P-53N01047XH972090NO275C5A",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": {},
						"merchant_preferences": {}
					},
					"links": [
						{},
						{}
					],
					"start_date": "2017-09-12T15:40:55Z",
					"httpStatusCode": 201
				}
			});
		});

		agent.post(`/${username}/subscriptions`)
		.send(_plans)
		.expect(200, function(err, res){
			stub.restore();
			done(err);
		});
	});

	it("should succeed (GB business)", function(done){

		plans.billingAddress.vat = "206909015";

		this.timeout(timeout);

		const stub = sinon.stub(Paypal, "processPayments").callsFake(function(){
			return Promise.resolve({  
				"url":"https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-2AX25360HG2794932",
				"paypalPaymentToken":"EC-2AX25360HG2794932",
				"agreement":{  
					"name":"3D Repo Licences",
					"description":"Regular monthly recurring payment £360. This agreement starts on 15th Sep 2017",
					"plan":{  
						"id":"P-07M85527XP798190YQWWKIPQ",
						"state":"ACTIVE",
						"name":"3D Repo Licences",
						"description":"3D Repo Licence",
						"type":"INFINITE",
						"payment_definitions":[  
							{  
								"id":"PD-83H636509P8266139QWWKIPQ",
								"name":"Regular monthly price",
								"type":"REGULAR",
								"frequency":"Month",
								"amount":{  
									"currency":"GBP",
									"value":"300"
								},
								"cycles":"0",
								"charge_models":[  
									{  
										"id":"CHM-22S96885W5688111LQWWKIPQ",
										"type":"TAX",
										"amount":{  
											"currency":"GBP",
											"value":"60"
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
							"return_url":"http://127.0.0.1:8080//payment_testing?page=billing",
							"cancel_url":"http://127.0.0.1:8080//payment_testing?page=billing&cancel=1",
							"auto_bill_amount":"YES",
							"initial_fail_amount_action":"CONTINUE"
						}
					},
					"links":[  
						{  
							"href":"https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-2AX25360HG2794932",
							"rel":"approval_url",
							"method":"REDIRECT"
						},
						{  
							"href":"https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-2AX25360HG2794932/agreement-execute",
							"rel":"execute",
							"method":"POST"
						}
					],
					"start_date":"2017-09-15T13:14:54Z",
					"httpStatusCode":201
				}
			});
		});

		agent.post(`/${username}/subscriptions`)
		.send(plans)
		.expect(200, function(err, res){

			expect(res.body).to.have.property("url");
			let parsed = url.parse(res.body.url, true);
			expect(parsed.query).to.have.property("token");

			let paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === "REGULAR");
			expect(paymentDef).to.be.not.null;
			stub.restore();

			done(err);
		});
	});


	describe("and then pay", function(){
		let stub;
		before(function(done){

			//fake payment
			this.timeout(timeout);
			let start_date = (new Date()).toISOString();
			
			// set fake billing id
			stub = sinon.stub(Paypal, "executeAgreement").callsFake(function(){

				return Promise.resolve({
					"id":billingId,
					"name":"3D Repo Licenses",
					"description":"Regualr monthly recurring payment £360, starts on 1st Aug 2016",
					"plan":{  
						"id":"P-0E4438980T7694020I2RECCQ",
						"state":"ACTIVE",
						"name":"3D Repo Licences",
						"description":"3D Repo Licence",
						"type":"INFINITE",
						"payment_definitions":[  
							{  
								"id":"PD-4N463346D9639034UI2RECCQ",
								"name":"Regular monthly price",
								"type":"REGULAR",
								"frequency":"Month",
								"amount":{  
									"currency":"GBP",
									"value":"300"
								},
								"cycles":"0",
								"charge_models":[  
									{  
										"id":"CHM-3R965001UL5436050I2RECCQ",
										"type":"TAX",
										"amount":{  
											"currency":"GBP",
											"value":"60"
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
							"return_url":"http://127.0.0.1:8080//payment_testing?page=billing",
							"cancel_url":"http://127.0.0.1:8080//payment_testing?page=billing&cancel=1",
							"auto_bill_amount":"YES",
							"initial_fail_amount_action":"CONTINUE"
						}
					},
					"links":[  
						{  
							"href":"https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-5EL17555M32938829",
							"rel":"approval_url",
							"method":"REDIRECT"
						},
						{  
							"href":"https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-5EL17555M32938829/agreement-execute",
							"rel":"execute",
							"method":"POST"
						}
					],
					"start_date":start_date,
					"httpStatusCode":201
				});

			});

			User.findByUserName(username).then(user => {

				return user.executeBillingAgreement();

			}).then(() => {


				// it should have a pending billing with SO-1 as invoice number.
				return new Promise((resolve, reject) => {
					agent.get(`/${username}/invoices`)
					.expect(200, function(err, res){
						
						expect(res.body).to.be.an("array").and.to.have.length(1);
						expect(res.body[0].invoiceNo).to.equal("SO-1");
						expect(res.body[0].pending).to.equal(true);
				
						if(err){
							reject(err);
						} else {
							resolve();
						}
					});
				});

			}).then(() => {		
				done();

			}).catch(err => {
				done(err);
			});


		});

		after(function(done){
			stub.restore();		
			agent.post("/logout")
			.send({})
			.expect(200, function(err, res){
				done(err);
			});
		});

		it("before 1st IPN the subscriptions should be activated temporary for 48 hours", function(done){
			
			let twoDayLater = moment().utc().add(48, "hour").toDate();
			User.findByUserName(username).then(user => {
				let subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true, excludeNotInAgreement: true });
				expect(subscriptions.length).to.equal(plans.plans[0].quantity);
				subscriptions.forEach(sub => {
					//the different between two datetime should be within a reasonable limit, i.e. 60 seconds
					expect(Math.abs(sub.expiredAt - twoDayLater) / 1000).to.below(60);
				});

				done();
			}).catch(err => {
				done(err);
			});
		});

		it("before 1st IPN the last anniversary date and next payment date are set already", function(done){

			User.findByUserName(username).then(user => {

				let startDate = moment().utc();
				expect(user.customData.billing.lastAnniversaryDate.valueOf()).to.equal(
					startDate.clone().startOf("day").toDate().valueOf()
				);
				expect(user.customData.billing.nextPaymentDate.valueOf()).to.equal(
					getNextPaymentDate(startDate).valueOf()
				);

				done();
			}).catch(err => {
				done(err);
			});

		});

		let nextPayDateString = moment(getNextPaymentDate(new Date())).tz("America/Los_Angeles").format("HH:mm:ss MMM DD, YYYY z");

		it("and then 1st IPN arrive", function(done){

			this.timeout(timeout);

			let paymentDate = moment().tz("America/Los_Angeles").format("HH:mm:ss MMM DD, YYYY z");
			let fakePaymentMsg =
				"mc_gross=360.00&outstanding_balance=0.00&period_type= Regular&next_payment_date=" + nextPayDateString
				+ "&protection_eligibility=Eligible&payment_cycle=Monthly&address_status=unconfirmed&tax=60.00&payer_id=2PXA53TAV2ZVA"
				+ "&address_street=na&payment_date=" + paymentDate + "&payment_status=Completed"
				+ "&product_name=abc&charset=UTF-8"
				+ "&recurring_payment_id=" + billingId + "&address_zip=A00 2ss020&first_name=repo&mc_fee=0.00&address_country_code=GB"
				+ "&address_name=3drepo&notify_version=3.8&amount_per_cycle=360.00&payer_status=verified&currency_code=GBP"
				+ "&business=test3drepo@example.org&address_country=UK&address_city=London"
				+ "&verify_sign=AiPC9BjkCyDFQXbSkoZcgqH3hpacASD7TZ5vh-uuZ2-Goi9dUDXNh4Wy&payer_email=test3drepo_hungary@example.org"
				+ "&initial_payment_amount=0.00&profile_status=Active&amount=360.00&txn_id=7VE78102JM363223J&payment_type=instant"
				+ "&last_name=3d&address_state=&receiver_email=test3drepo@example.org&payment_fee=&receiver_id=XNMSZ2D4UNB6G"
				+ "&txn_type=recurring_payment&mc_currency=GBP&residence_country=HU&test_ipn=1"
				+ "&transaction_subject=abc"
				+ "&payment_gross=&shipping=0.00&product_type=1&time_created=" + paymentDate + "&ipn_track_id=78a335fad3b16";

			const verifyStub = sinon.stub(Paypal, "verifyGenuine").callsFake(function(){
				return Promise.resolve();
			});

			new Promise((resolve, reject) => {
				agent.post("/payment/paypal/ipn")
				.send(fakePaymentMsg)
				.expect(200, function(err, res){
					setTimeout(function(){
						
						if(err){
							reject(err);
						} else {
							resolve(res);
						}
					}, 3000);
				});
			}).then(() => {
				verifyStub.restore();
				done();

			}).catch(err => {
				verifyStub.restore();
				done(err);
			});

		});

		it("after 1st IPN it should have a confirmed invoice SO-1 generated", function(done){
			// it should have a confirmed billing with SO-1 as invoice number.

			agent.get(`/${username}/invoices`)
			.expect(200, function(err, res){
				//console.log("billings", res.body);
				expect(res.body).to.be.an("array").and.to.have.length(1);
				expect(res.body[0].invoiceNo).to.equal("SO-1");
				expect(res.body[0].pending).to.be.false;
				done(err);
			});

		});

		it("after 1st IPN the subscriptions should be activated until 3 days after next payment date", function(done){

			//let twoDayLater = moment().utc().add(48, "hour").toDate();

			User.findByUserName(username).then(user => {
				let subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true, excludeNotInAgreement: true })
				expect(subscriptions.length).to.equal(plans.plans[0].quantity);
				subscriptions.forEach(sub => {
					//the different between two datetime should be within a reasonable limit, i.e. 60 seconds

					let expiredAt = moment(new Date(nextPayDateString)).utc()
						.add(3, "day")
						.hours(0).minutes(0).seconds(0).milliseconds(0)
						.toDate();

					expect(sub.expiredAt.valueOf()).to.equal(expiredAt.valueOf());
				});

				done();
			}).catch(err => {
				done(err);
			});
		});

		it("after 1st IPN the next payment date are set", function(done){
			
			User.findByUserName(username).then(user => {

				//let startDate = moment().utc();

				expect(user.customData.billing.nextPaymentDate.valueOf()).to.equal(moment(new Date(nextPayDateString)).utc().startOf("date").toDate().valueOf());

				done();

			}).catch(err => {
				done(err);
			});

		});

		let subscriptions;
		it("and the subscription should be active and filled with quota", function(done){

			agent.get(`/${username}/subscriptions`)
			.expect(200, function(err, res){

				expect(res.body).to.be.an("array").and.to.have.length(3);

				subscriptions = res.body;

				subscriptions.forEach(sub => {

					expect(sub).to.have.property("limits");
					expect(sub.limits).to.have.property("spaceLimit");
					expect(sub.limits.spaceLimit).to.be.above(0);

					expect(sub.limits).to.have.property("collaboratorLimit");
					expect(sub.limits.collaboratorLimit).to.be.above(0);

					expect(sub).to.have.property("active");
					expect(sub.active).to.equal(true);
					expect(sub).to.have.property("plan");
					expect(sub.plan).to.equal(plans.plans[0].plan);

				});

				done(err);
			});
		});

		it("and the first subscription should assigned to user itself", function(){
			expect(subscriptions[0].assignedUser).to.equal(username);
		});

		describe("and then assigning it", function(){

			it("should fail if subscription id does not exist", function(done){
				agent.post(`/${username}/subscriptions/000000000000000000000000/assign`)
				.send({ user: username2})
				.expect(404, function(err, res){
					expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_NOT_FOUND.value);
					done(err);
				});
			});

			it("to a non existing user should fail", function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
				.send({ user: "payment_non_existing"})
				.expect(404, function(err, res){
					expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
					done(err);
				});
			});

			it("to a existing user should succeed", function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
				.send({ user: username2 })
				.expect(200, function(err, res){
					done(err);
				});
			});

			it("to a user assgined to another license should fail", function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[2]._id}/assign`)
				.send({ user: username2 })
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.USER_ALREADY_ASSIGNED.value);
					done(err);
				});
			});

			it("to an other existing user again should fail", function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
				.send({ user: username3 })
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_ALREADY_ASSIGNED.value);
					done(err);
				});
			});

			describe("and then deleting it", function(){


				it("should fail if subscription ID does not exist", function(done){
					agent.delete(`/${username}/subscriptions/000000000000000000000000/assign`)
					.send({})
					.expect(404, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_NOT_FOUND.value);
						done(err);
					});
				});

				it("should succeed", function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
					.send({})
					.expect(200, function(err, res){
						done(err);
					});
				});

				it("should fail if try to remove itself", function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[0]._id}/assign`)
					.send({})
					.expect(400, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF.value);
						done(err);
					});
				});


				it("should fail if license havent been assigned to anyone", function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[2]._id}/assign`)
					.send({})
					.expect(400, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_NOT_ASSIGNED.value);
						done(err);
					});
				});

				it("should fail if the user is a collaborator of a model", function(){
					//to-do
				});

			});

		});


	});


	describe("and then refund", function(){
		this.timeout(6000);

		before(function(done){

			let paymentDate = moment().tz("America/Los_Angeles").format("HH:mm:ss MMM DD, YYYY z");
			let nextPayDateString = moment(getNextPaymentDate(new Date())).tz("America/Los_Angeles").format("HH:mm:ss MMM DD, YYYY z");

			let fakePaymentMsg = "mc_gross=-120.00&outstanding_balance=0.00&period_type= Regular&next_payment_date=" + nextPayDateString
			+ "&protection_eligibility=Eligible&payment_cycle=Monthly&payer_id=6TCR69539GDR8&address_street=123 123&payment_date=" + paymentDate
			+ "&payment_status=Refunded&product_name=This month\"s pro-rata: £120. Regualr monthly recurring payment £360, starts on 4th Aug 2016&"
			+ "charset=UTF-8&recurring_payment_id=" + billingId + "&address_zip=123&first_name=PAy&mc_fee=-8.67&address_country_code=GB&address_name="
			+ "PAy Me&notify_version=3.8&amount_per_cycle=360.00&reason_code=refund&currency_code=GBP&business=test3drepo@example.org&address_country"
			+ "=United Kingdom&address_city=123&verify_sign=AcE2uah9fzGQIYibH799J4hdOjH.AHrml.KEiNJ1j85nY5ztJqJh5hDw&payer_email=test3drepopayer@example.org"
			+ "&parent_txn_id=21K54591EX9972912&initial_payment_amount=0.00&profile_status=Active&amount=360.00&txn_id=4G401246NU073361P&payment_type=instant"
			+ "&last_name=Me&address_state=&receiver_email=test3drepo@example.org&payment_fee=&receiver_id=XNMSZ2D4UNB6G&mc_currency=GBP&residence_country=GB"
			+ "&test_ipn=1&transaction_subject=This month\"s pro-rata: £120. Regualr monthly recurring payment £360, starts on 4th Aug 2016&payment_gross="
			+ "&shipping=0.00&product_type=1&time_created=" + paymentDate + "&ipn_track_id=5d3ce7c954739";


			async.series([

				function(done){
					agent.post("/payment/paypal/ipn")
					.send(fakePaymentMsg)
					.expect(200, function(err, res){
						setTimeout(function(){
							if(err){
								done(err);
							} else {
								done();
							}
						}, 3000);
					});
				},

				function(done){

					agent.post("/login")
					.send({ username, password})
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username);
						done(err);
					});

				}
			], done);

		});

		after(function(done){

			agent.post("/logout")
			.send({})
			.expect(200, function(err, res){
				done(err);
			});

		});

		it("should have credit note created with number CN-1", function(done){
			agent.get(`/${username}/invoices`)
			.expect(200, function(err, res){

				expect(res.body).to.be.an("array");
				let cn = res.body.find( bill => bill.invoiceNo === "CN-1");
				expect(cn).to.exist;

				done(err);
			});
		});

	});

	describe("and then simulate recurring payment message from the 2nd month", function(){

		this.timeout(6000);

		let paymentDate = moment(getNextPaymentDate(new Date())).tz("America/Los_Angeles").format("HH:mm:ss MMM DD, YYYY z");
		let paymentDateAfterNext = getNextPaymentDate(getNextPaymentDate(new Date()));
		let nextPayDateString = moment(paymentDateAfterNext).tz("America/Los_Angeles").format("HH:mm:ss MMM DD, YYYY z")
		let lastPaymentDate;

		before(function(done){

			let transactionId = "99999999AA000000A";

			let fakePaymentMsg =
				"mc_gross=360.00&outstanding_balance=0.00&period_type= Regular&next_payment_date=" + nextPayDateString
				+ "&protection_eligibility=Eligible&payment_cycle=Monthly&address_status=unconfirmed&tax=60.00&payer_id=2PXA53TAV2ZVA"
				+ "&address_street=na&payment_date=" + paymentDate + "&payment_status=Completed"
				+ "&product_name=abc&charset=UTF-8"
				+ "&recurring_payment_id=" + billingId + "&address_zip=A00 2ss020&first_name=repo&mc_fee=0.00&address_country_code=GB"
				+ "&address_name=3drepo&notify_version=3.8&amount_per_cycle=360.00&payer_status=verified&currency_code=GBP"
				+ "&business=test3drepo@example.org&address_country=UK&address_city=London"
				+ "&verify_sign=AiPC9BjkCyDFQXbSkoZcgqH3hpacASD7TZ5vh-uuZ2-Goi9dUDXNh4Wy&payer_email=test3drepo_hungary@example.org"
				+ "&initial_payment_amount=0.00&profile_status=Active&amount=360.00&txn_id=" + transactionId + "&payment_type=instant"
				+ "&last_name=3d&address_state=&receiver_email=test3drepo@example.org&payment_fee=&receiver_id=XNMSZ2D4UNB6G"
				+ "&txn_type=recurring_payment&mc_currency=GBP&residence_country=HU&test_ipn=1"
				+ "&transaction_subject=abc"
				+ "&payment_gross=&shipping=0.00&product_type=1&time_created=" + paymentDate + "&ipn_track_id=78a335fad3b16";


			async.series([

				function(done){
					return User.findByUserName(username).then(user => {
						lastPaymentDate = user.customData.billing.nextPaymentDate;
						done();
					});
				},
				function(done){
					agent.post("/payment/paypal/ipn")
					.send(fakePaymentMsg)
					.expect(200, function(err, res){
						setTimeout(function(){
							if(err){
								done(err);
							} else {
								done();
							}
						}, 3000);
					});
				},

				function(done){

					agent.post("/login")
					.send({ username, password})
					.expect(200, function(err, res){
						expect(res.body.username).to.equal(username);
						done(err);
					});

				}
			], done);

		});

		after(function(done){

			agent.post("/logout")
			.send({})
			.expect(200, function(err, res){
				done(err);
			});

		});

		it("should have invoice created with number SO-2", function(done){
			agent.get(`/${username}/invoices`)
			.expect(200, function(err, res){

				expect(res.body).to.be.an("array");
				let cn = res.body.find( bill => bill.invoiceNo === "SO-2");
				expect(cn).to.exist;

				done(err);
			});
		});

		it("after 2nd IPN the subscriptions should be activated until 3 days after next payment date", function(done){

			//let twoDayLater = moment().utc().add(48, "hour").toDate();

			User.findByUserName(username).then(user => {
				let subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true, excludeNotInAgreement: true })
				expect(subscriptions.length).to.equal(plans.plans[0].quantity);
				subscriptions.forEach(sub => {
					//the different between two datetime should be within a reasonable limit, i.e. 60 seconds

					let expiredAt = moment(new Date(nextPayDateString)).utc()
						.add(3, "day")
						.hours(0).minutes(0).seconds(0).milliseconds(0)
						.toDate();

					expect(sub.expiredAt.valueOf()).to.equal(expiredAt.valueOf());
				});

				done();
			}).catch(err => {
				done(err);
			});

		});

		it("after 2nd IPN the last anniversary date and next payment date are set", function(done){

			User.findByUserName(username).then(user => {

				expect(user.customData.billing.lastAnniversaryDate.valueOf()).to.equal(lastPaymentDate.valueOf());
				expect(user.customData.billing.nextPaymentDate.valueOf()).to.equal(moment(new Date(nextPayDateString)).utc().startOf("date").toDate().valueOf());

				done();

			}).catch(err => {
				done(err);
			});
			
		});

	});

	describe("second user pays", function(){


		before(function(done){

			agent.post("/login")
			.send({ username: username3, password: password3 })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username3);
				done(err);
			});

		});

		after(function(done){

			agent.post("/logout")
			.send({})
			.expect(200, function(err, res){
				done(err);
			});

		});

		it("should succeed (GB business)", function(done){

			plans.billingAddress.vat = "206909015";
			plans.billingAddress.line1 = "2nduser line1";
			plans.billingAddress.line2 = "2nduser line2";
			plans.billingAddress.line3 = "2nduser line3";

			const stub = sinon.stub(Paypal, "processPayments").callsFake( function() {
				return Promise.resolve({
					"url": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-7CF55778SV0933845",
					"paypalPaymentToken": "EC-7CF55778SV0933845",
					"agreement": {
						"name": "3D Repo Licences",
						"description": "Regular monthly recurring payment £360. This agreement starts on 12th Sep 2017",
						"plan": {
							"id": "P-8YB827324E463163LO3V6DHY",
							"state": "ACTIVE",
							"name": "3D Repo Licences",
							"description": "3D Repo Licence",
							"type": "INFINITE",
							"payment_definitions": [
								{
									"id": "PD-8K35050465519924KO3V6DHY",
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
											"id": "CHM-2KM86124TH936482XO3V6DHY",
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
								"return_url": "http://127.0.0.1:8080//payment_user3?page=billing",
								"cancel_url": "http://127.0.0.1:8080//payment_user3?page=billing&cancel=1",
								"auto_bill_amount": "YES",
								"initial_fail_amount_action": "CONTINUE"
							}
						},
						"links": [
							{
								"href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-7CF55778SV0933845",
								"rel": "approval_url",
								"method": "REDIRECT"
							},
							{
								"href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-7CF55778SV0933845/agreement-execute",
								"rel": "execute",
								"method": "POST"
							}
						],
						"start_date": "2017-09-12T16:29:03Z",
						"httpStatusCode": 201
					}
				});

			});

			this.timeout(timeout);

			agent.post(`/${username3}/subscriptions`)
			.send(plans)
			.expect(200, function(err, res){
				//console.log(res.body);
				expect(res.body).to.have.property("url");
				let parsed = url.parse(res.body.url, true);
				expect(parsed.query).to.have.property("token");

				let paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === "REGULAR");
				expect(paymentDef).to.be.not.null;
				stub.restore();

				done(err);
			});
		});

		it("should have an invoice with invoice number SO-3", function(){

			const start_date = (new Date()).toISOString();
			const stub = sinon.stub(Paypal, "executeAgreement").callsFake(function() {
				return Promise.resolve({
					"id": billingId,
					"name": "3D Repo Licenses",
					"description": "Regualr monthly recurring payment £360, starts on 1st Aug 2016",
					"plan": {
						"id": "P-0E4438980T7694020I2RECCQ",
						"state": "ACTIVE",
						"name": "3D Repo Licences",
						"description": "3D Repo Licence",
						"type": "INFINITE",
						"payment_definitions": [
							{
								"id": "PD-4N463346D9639034UI2RECCQ",
								"name": "Regular monthly price",
								"type": "REGULAR",
								"frequency": "Month",
								"amount": {
								"currency": "GBP",
								"value": "300"
								},
								"cycles": "0",
								"charge_models": [{
									"id": "CHM-3R965001UL5436050I2RECCQ",
									"type": "TAX",
									"amount": {
										"currency": "GBP",
										"value": "60"
									}
								}],
								"frequency_interval": "1"
							}
						],
						"merchant_preferences": {
							"setup_fee": {
							"currency": "GBP",
							"value": "0"
							},
							"max_fail_attempts": "0",
							"return_url": "http://127.0.0.1:8080//payment_testing?page=billing",
							"cancel_url": "http://127.0.0.1:8080//payment_testing?page=billing&cancel=1",
							"auto_bill_amount": "YES",
							"initial_fail_amount_action": "CONTINUE"
						}
					},
					"links": [
						{
							"href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-5EL17555M32938829",
							"rel": "approval_url",
							"method": "REDIRECT"
						},
						{
							"href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-5EL17555M32938829/agreement-execute",
							"rel": "execute",
							"method": "POST"
						}
					],
					"start_date": start_date,
					"httpStatusCode": 201
				});
			});

			return User.findByUserName(username3).then(user => {

				return user.executeBillingAgreement();

			}).then(() => {


				// it should have a pending billing with SO-3 as invoice number.
				return new Promise((resolve, reject) => {
					agent.get(`/${username3}/invoices`)
					.expect(200, function(err, res){
						//console.log("billings", res.body);
						expect(res.body).to.be.an("array").and.to.have.length(1);
						expect(res.body[0].invoiceNo).to.equal("SO-3");
						expect(res.body[0].pending).to.equal(true);
						
						stub.restore();
						if(err){
							reject(err);
						} else {
							resolve();
						}
					});
				});


			});
		});
	});

});
