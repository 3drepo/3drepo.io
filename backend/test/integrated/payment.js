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
let helpers = require("./helpers");

describe('Enrolling to a subscription', function () {
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'payment_testing';
	let password = 'payment_testing';
	let project = 'testproject';
	let email = 'test3drepo_payment@mailinator.com'
	let billingId = 'I-000000000000';


	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');


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
			"quantity": 2
			}
		]
	};

	it('should succee', function(done){
		this.timeout(10000);
		agent.post(`/${username}/subscriptions`)
		.send(plans)
		.expect(200, function(err, res){
			expect(res.body).to.have.property('url');
			done(err);
		});
	});




	describe('and then pay', function(){

		before(function(done){
			//fake payment
			this.timeout(5000);

			// set fake billing id
			User.findByUserName(username).then(user => {
				user.customData.billingAgreementId = billingId;
				user.customData.billingUser = user.user;
				user.customData.subscriptions.forEach(sub => {
					sub.inCurrentAgreement = true;
				});

				return user.save();
			}).then(() => {

				let fakePaymentMsg = 
					'payment_cycle=Monthly&txn_type=recurring_payment_profile_created&last_name=Me&initial_payment_status=Completed'
					+ '&next_payment_date=03:00:00 Aug 01, 2016 PDT&residence_country=GB&initial_payment_amount=200.00&currency_code=GBP'
					+ '&time_created=04:03:03 Jul 01, 2016 PDT&verify_sign=AczUU94BMMolZ9uHs3gDJVFQWmnrAZ.4Lg5wG0nNi-FWSrwlHVyMqczD&period_type=Regular'
					+ '&payer_status=verified&test_ipn=1&tax=0.00&payer_email=test3drepopayer@example.org&first_name=PAy'
					+ '&receiver_email=test3drepo@example.org&payer_id=6TCR69539GDR8&product_type=1&initial_payment_txn_id=4GD07850L9231692J'
					+ '&shipping=0.00&amount_per_cycle=600.00&profile_status=Active&charset=UTF-8&notify_version=3.8&amount=600.00'
					+ '&outstanding_balance=0.00&recurring_payment_id=' + billingId
					+ '&product_name=3D Repo License subscription. This month\'s pro-rata price: £200, then each month: £600&ipn_track_id=63ded6af9b148';

					agent.post(`/payment/paypal/food`)
					.send(fakePaymentMsg)
					.expect(200, function(err, res){
						setTimeout(function(){
							done(err);
						}, 2000);
					});

			});


		});

		it('and the subscription should be active and filled with quota', function(done){

			agent.get(`/${username}/subscriptions`)
			.expect(200, function(err, res){

				expect(res.body).to.be.an('array').and.to.have.length(2);

				let subscriptions = res.body;

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
	});

});