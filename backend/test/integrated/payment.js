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
let getNextPaymentDate = require("../../models/payment").getNextPaymentDate;
let helpers = require("./helpers");
let async = require('async');
let moment = require('moment-timezone');
let Payment = require('../../models/payment');

let url = require('url');
describe('Enrolling to a subscription', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'payment_testing';
	let password = 'payment_testing';
	
	let username2 = 'payment_user2';
	let password2 = 'payment_user2';
	let email2 = 'test3drepo_payment2@mailinator.com';


	let username3 = 'payment_user3';
	let password3 = 'payment_user3';
	let email3 = 'test3drepo_payment3@mailinator.com';

	let project = 'testproject';
	let email = 'test3drepo_payment@mailinator.com'
	let billingId = 'I-000000000000';


	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');


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
							if (err) return done(err);

							agent = request.agent(server);
							agent.post('/login')
							.send({ username, password })
							.expect(200, function(err, res){
								expect(res.body.username).to.equal(username);
								done(err);
							});
						}
					});
				}
			], done);


		});

	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
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
			"vat": "90090-0909"
		}
	};

	it('should succee (GB business)', function(done){
		this.timeout(10000);

		agent.post(`/${username}/subscriptions`)
		.send(plans)
		.expect(200, function(err, res){
			expect(res.body).to.have.property('url');
			let parsed = url.parse(res.body.url, true);
			expect(parsed.query).to.have.property('token');
			
			let paymentDef = res.body.agreement.plan.payment_definitions.find(def => def.type === 'REGULAR');
			expect(paymentDef).to.be.not.null;
			expect(paymentDef.amount.value).to.equal('250');
			expect(paymentDef.amount.currency).to.equal('GBP');
			expect(paymentDef.charge_models[0].type).to.equal('TAX');
			expect(paymentDef.charge_models[0].amount.value).to.equal('50');
			expect(paymentDef.charge_models[0].amount.currency).to.equal('GBP');
			done(err);
		});
	});




	describe('and then pay', function(){

		before(function(done){
			//fake payment
			this.timeout(7000);

			// set fake billing id
			User.findByUserName(username).then(user => {

				user.executeBillingAgreement('EC-000000000', billingId);
				return user.save();

			}).then(() => {

				let paymentDate = moment().tz('America/Los_Angeles').format('HH:mm:ss MMM DD, YYYY z');
				let nextPayDateString = moment(getNextPaymentDate(new Date())).tz('America/Los_Angeles').format('HH:mm:ss MMM DD, YYYY z')

				let fakePaymentMsg = 
					'mc_gross=100.00&outstanding_balance=0.00&period_type= Regular&next_payment_date=' + nextPayDateString
					+ '&protection_eligibility=Eligible&payment_cycle=Monthly&address_status=unconfirmed&tax=0.00&payer_id=2PXA53TAV2ZVA'
					+ '&address_street=na&payment_date=' + paymentDate + '&payment_status=Completed'
					+ '&product_name=3D Repo Licence subscription.This month\'s pro-rata price: 0, then each month: £100&charset=UTF-8'
					+ '&recurring_payment_id=' + billingId + '&address_zip=A00 2ss020&first_name=HUNG HO&mc_fee=4.10&address_country_code=HU'
					+ '&address_name=HUNG HO LIU&notify_version=3.8&amount_per_cycle=100.00&payer_status=verified&currency_code=GBP'
					+ '&business=test3drepo@example.org&address_country=Hungary&address_city=London'
					+ '&verify_sign=AiPC9BjkCyDFQXbSkoZcgqH3hpacASD7TZ5vh-uuZ2-Goi9dUDXNh4Wy&payer_email=test3drepo_hungary@example.org'
					+ '&initial_payment_amount=0.00&profile_status=Active&amount=100.00&txn_id=7VE78102JM363223J&payment_type=instant'
					+ '&last_name=LIU&address_state=&receiver_email=test3drepo@example.org&payment_fee=&receiver_id=XNMSZ2D4UNB6G'
					+ '&txn_type=recurring_payment&mc_currency=GBP&residence_country=HU&test_ipn=1'
					+ '&transaction_subject=3D Repo Licence subscription.This month\'s pro-rata price: 0, then each month: £100'
					+ '&payment_gross=&shipping=0.00&product_type=1&time_created=' + paymentDate + '&ipn_track_id=78a335fad3b16';

					agent.post(`/payment/paypal/food`)
					.send(fakePaymentMsg)
					.expect(200, function(err, res){
						setTimeout(function(){
							done(err);
						}, 2000);
					});

			}).catch(err => {
				done(err);
			});


		});

		let subscriptions;
		it('and the subscription should be active and filled with quota', function(done){

			agent.get(`/${username}/subscriptions`)
			.expect(200, function(err, res){

				expect(res.body).to.be.an('array').and.to.have.length(3);

				subscriptions = res.body;

				console.log(subscriptions);

				subscriptions.forEach(sub => {
					expect(sub).to.have.deep.property('limits.spaceLimit');
					expect(sub.limits.spaceLimit).to.be.above(0);
					expect(sub).to.have.deep.property('active', true);
					expect(sub).to.have.deep.property('plan', plans.plans[0].plan);
					expect(sub).to.have.deep.property('limits.collaboratorLimit');
					expect(sub.limits.collaboratorLimit).to.be.above(0);

				});

				done(err);
			});
		});

		it('and the first subscription should assigned to user itself', function(){
			expect(subscriptions[0].assignedUser).to.equal(username);
		});

		describe('and then assigning it', function(){

			

			it('should fail if subscription id does not exist', function(done){
				agent.post(`/${username}/subscriptions/000000000000000000000000/assign`)
				.send({ user: username2})
				.expect(404, function(err, res){
					expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_NOT_FOUND.value);
					done(err);
				});
			});

			it('to a non existing user should fail', function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
				.send({ user: 'payment_non_existing'})
				.expect(404, function(err, res){
					expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
					done(err);
				});
			});

			it('to a existing user should success', function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
				.send({ user: username2 })
				.expect(200, function(err, res){
					done(err);
				});
			});

			it('to a user assgined to another license should fail', function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[2]._id}/assign`)
				.send({ user: username2 })
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.USER_ALREADY_ASSIGNED.value);
					done(err);
				});
			});

			it('to an other existing user again should fail', function(done){
				agent.post(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
				.send({ user: username3 })
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_ALREADY_ASSIGNED.value);
					done(err);
				});
			});

			describe('and then deleting it', function(){


				it('should fail if subscription id does not exist', function(done){
					agent.delete(`/${username}/subscriptions/000000000000000000000000/assign`)
					.send({})
					.expect(404, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_NOT_FOUND.value);
						done(err);
					});
				});

				it('should success', function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[1]._id}/assign`)
					.send({})
					.expect(200, function(err, res){
						done(err);
					});
				});

				it('should fail if try to remove itself', function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[0]._id}/assign`)
					.send({})
					.expect(400, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF.value);
						done(err);
					});
				});

				it('should fail if try to remove itself', function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[0]._id}/assign`)
					.send({})
					.expect(400, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF.value);
						done(err);
					});
				});

				it('should fail if license havent been assigned to anyone', function(done){
					agent.delete(`/${username}/subscriptions/${subscriptions[2]._id}/assign`)
					.send({})
					.expect(400, function(err, res){
						expect(res.body.value).to.equal(responseCodes.SUBSCRIPTION_NOT_ASSIGNED.value);
						done(err);
					});
				});

				it('should fail if the user is a collaborator of a project', function(){
					//to-do
				});

			});

		});


	});

});