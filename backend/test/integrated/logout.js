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
	{ session: require('express-session')({ secret: 'testing',  resave: false,   saveUninitialized: false }) }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");

describe('Logout', function () {
	let User = require('../../models/user');
	let server;
	let username = 'logout_username';
	let username_not_verified = 'logout_username_not_verified';
	let password = 'password';
	let email = 'test3drepo_logout@mailinator.com';

	before(function(done){


		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			//hack: by starting the server earlier all the mongoose models like User will be connected to db without any configuration
			request(server).get('/info').end(() => {


				// create a user
				return User.createUser(systemLogger, username, password, {
					email: email
				}, 200000).then(emailVerifyToken => {
					return User.verify(username, emailVerifyToken.token, true);
				}).then(user => {
					done();
				}).catch(err => {
					done(err);
				});

			});
			
		});

	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});


	it('should be successful if logged in', function(done){
		let agent = request.agent(server);

		agent.post('/login')
		.send({ username, password })
		.expect(200, function(err, res){
			if(err){
				done(err)
			} else {
				agent.post('/logout')
				.send({})
				.expect(200, function(err, res){
					expect(res.body.username).to.equal(username);
					done(err);
				})
			}
		});
	});

	it('and view user profile should fail', function(done){
		let agent = request.agent(server);

		agent.post('/login')
		.send({ username, password })
		.expect(200, function(err, res){
			if(err){
				done(err)
			} else {
				agent.post('/logout')
				.send({})
				.expect(200, function(err, res){
					expect(res.body.username).to.equal(username);
					if(err){
						done(err);
					} else {
						agent.get(`/${username}.json`)
						.expect(401, function(err, res){
							done(err);
						})
					}
				})
			}
		});
	});

	it('should fail if not logged in', function(done){
		let agent = request.agent(server);
		agent.post('/logout')
		.send({})
		.expect(401, function(err, res){
			expect(res.body.value).to.equal(responseCodes.NOT_LOGGED_IN.value);
			done(err);
		});
	});

});
