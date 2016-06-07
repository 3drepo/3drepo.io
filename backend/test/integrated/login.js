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

describe('Login', function () {
	let User = require('../../models/user');
	let server;
	let username = 'login_username';
	let username_not_verified = 'login_username_not_verified';
	let password = 'password';
	let email = 'test3drepo@mailinator.com';

	before(function(done){


		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			//hack: by starting the server earlier all the mongoose models like User will be connected to db without any configuration
			request(server).get('/info').end(() => {
				done();
			});
			
		});

	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});




	it('with correct password and username and verified should login successfully', function () {

		// create a user
		return User.createUser(systemLogger, username, password, {
			email: email
		}, 200000).then(emailVerifyToken => {
			return User.verify(username, emailVerifyToken.token, true);
		}).then(user => {

			return new Promise((resolve, reject) => {
				request(server)
				.post('/login')
				.send({ username, password })
				.expect(200, function(err, res){
					expect(res.body.username).to.equal(username);
					err ? reject(err) : resolve();
				});
			})

		});

	});

	it('with correct password and username but not yet verified should fail', function () {

		// create a user
		return User.createUser(systemLogger, username_not_verified, password, {
			email: email
		}, 200000).then(user => {

			return new Promise((resolve, reject) => {
				request(server)
				.post('/login')
				.send({ username: username_not_verified, password })
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.USER_NOT_VERIFIED.value);
					console.log(err);
					err ? reject(err) : resolve();
				});
			});

		})

	});

	it('with incorrect password should fail', function(done){
		request(server)
		.post('/login')
		.send({ username, password: password + '123' })
		.expect(400, function(err, res){

			expect(res.body.value).to.equal(responseCodes.INCORRECT_USERNAME_OR_PASSWORD.value);
			done(err);

		});
	});

	it('with incorrect username and password should fail', function(done){
		request(server)
		.post('/login')
		.send({ username: username  + '123', password: password + '123' })
		.expect(400, function(err, res){

			expect(res.body.value).to.equal(responseCodes.INCORRECT_USERNAME_OR_PASSWORD.value);
			done(err);

		});
	});

	it('when you are logged in should fail', function(done){
		//preserver cookies
		let agent = request.agent(server);
		agent.post('/login')
		.send({ username: username , password: password })
		.end(function(err, res){

			//double login
			agent.post('/login').send({ username: username , password: password })
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.ALREADY_LOGGED_IN.value);
				done(err);
			});

		});
	});
});