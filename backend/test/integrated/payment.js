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

// let request = require('supertest');
// let expect = require('chai').expect;
// let app = require("../../services/api.js").createApp(
// 	{ session: require('express-session')({ secret: 'testing'}) }
// );
// let log_iface = require("../../logger.js");
// let systemLogger = log_iface.systemLogger;
// let responseCodes = require("../../response_codes.js");
// let helpers = require("./helpers");

// describe('Enrolling to a subscription', function () {
// 	let User = require('../../models/user');
// 	let server;
// 	let agent;
// 	let username = 'payment_testing';
// 	let password = 'payment_testing';
// 	let project = 'testproject';
// 	let email = 'test3drepo_payment@mailinator.com'



// 	before(function(done){

// 		server = app.listen(8080, function () {
// 			console.log('API test server is listening on port 8080!');


// 			helpers.signUpAndLogin({
// 				server, request, agent, expect, User, systemLogger,
// 				username, password, email,
// 				done: function(err, _agent){
// 					agent = _agent;
// 					if (err) return done(err);

// 					agent = request.agent(server);
// 					agent.post('/login')
// 					.send({ username, password })
// 					.expect(200, function(err, res){
// 						expect(res.body.username).to.equal(username);
// 						done(err);
// 					});
// 				}
// 			});

// 		});

// 	});

// 	after(function(done){
// 		server.close(function(){
// 			console.log('API test server is closed');
// 			done();
// 		});
// 	});


// 	let subToken;
// 	let plan = {
// 		"plan": "THE-100-QUID-PLAN"
// 	};

// 	it('should succee', function(done){
// 		agent.post(`/${username}/subscriptions`)
// 		.send(plan)
// 		.expect(200, function(err, res){
// 			expect(res.body).to.have.property('token');
// 			subToken = res.body.token;
// 			done(err);
// 		});
// 	});


// 	it('and then get the subscription information should succee', function(done){
// 		agent.get(`/${username}/subscriptions/${subToken}`)
// 		.expect(200, function(err, res){
// 			expect(res.body).to.have.deep.property('token', subToken);
// 			expect(res.body).to.have.deep.property('billingUser', username);
// 			expect(res.body).to.have.deep.property('active', false);
// 			expect(res.body).to.have.deep.property('plan', plan.plan);
// 			done(err);
// 		});
// 	});

// 	describe('and then pay', function(){

// 		before(function(done){
// 			//fake payment
// 			this.timeout(5000);

// 			let fakePaymentMsg = 
// 			'transaction_subject=The 30 quids plan&payment_date=10:00:16 May 19, 2016 PDT&txn_type=subscr_payment'
// 			+ '&subscr_id=I-SLDTKPWF92PA&last_name=Me&residence_country=GB&item_name=The 30 quids plan&payment_gross='
// 			+ '&mc_currency=GBP&business=test3drepo@example.org&payment_type=instant&protection_eligibility=Ineligible'
// 			+ '&verify_sign=Aimo5phqEXAM2-I2V1YuRE4xEaUJAfttQCcdgQDNQkmYOlD3wzo0CRB8&payer_status=verified&test_ipn=1'
// 			+ '&payer_email=test3drepopayer@example.org&txn_id=1DG79577K4955150L&receiver_email=test3drepo@example.org'
// 			+ '&first_name=PAy&payer_id=6TCR69539GDR8&receiver_id=XNMSZ2D4UNB6G&payment_status=Completed&payment_fee='
// 			+ '&mc_fee=1.22&mc_gross=30.00'
// 			+ '&custom=' + subToken + '&charset=windows-1252&notify_version=3.8&ipn_track_id=cacc00e7108a3';

// 			agent.post(`/payment/paypal/food`)
// 			.send(fakePaymentMsg)
// 			.expect(200, function(err, res){
// 				setTimeout(function(){
// 					done(err);
// 				}, 2000);
// 			});
// 		});

// 		it('and the subscription should be active and filled with quota', function(done){

// 			agent.get(`/${username}/subscriptions/${subToken}`)
// 			.expect(200, function(err, res){

// 				expect(res.body).to.have.deep.property('token', subToken);
// 				expect(res.body).to.have.deep.property('limits.spaceLimit');
// 				expect(res.body.limits.spaceLimit).to.be.above(0);
// 				expect(res.body).to.have.deep.property('active', true);
// 				expect(res.body).to.have.deep.property('plan', plan.plan);
// 				expect(res.body).to.have.deep.property('limits.collaboratorLimit');
// 				expect(res.body.limits.collaboratorLimit).to.be.above(0);
// 				expect(res.body).to.have.deep.property('payments').that.is.an('array');
// 				expect(res.body.payments[0].amount).to.be.above(0);
// 				expect(res.body.payments[0].currency).to.equal('GBP');
// 				done(err);
// 			});
// 		});

// 		it('and the subscription should be active and filled with quota (list all subscriptions)', function(done){


// 			agent.get(`/${username}/subscriptions`)
// 			.expect(200, function(err, res){

// 				expect(res.body).to.be.an('array').and.to.have.length(1);
				
// 				let subscription = res.body[0];

// 				expect(subscription).to.have.deep.property('token', subToken);
// 				expect(subscription).to.have.deep.property('limits.spaceLimit');
// 				expect(subscription.limits.spaceLimit).to.be.above(0);
// 				expect(subscription).to.have.deep.property('active', true);
// 				expect(subscription).to.have.deep.property('plan', plan.plan);
// 				expect(subscription).to.have.deep.property('limits.collaboratorLimit');
// 				expect(subscription.limits.collaboratorLimit).to.be.above(0);
// 				expect(subscription).to.have.deep.property('payments').that.is.an('array');
// 				expect(subscription.payments[0].amount).to.be.above(0);
// 				expect(subscription.payments[0].currency).to.equal('GBP');
				
// 				done(err);
// 			});

// 		});
// 	});

// });