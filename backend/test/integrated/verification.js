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



describe('Verify', function () {
	let User = require('../../models/user');
	let server;
	let username = 'v_username';
	let username_not_verified = 'v_name_not_verified';
	let username_double_verified = 'v_name_db_verified';
	let username_expired_token = 'v_name_expired';

	let password = 'password';
	let email = suf => `test3drepo_verification_${suf}@mailinator.com`;


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

	it('user should success if username and token is correct', function(done){
		// create a user
		User.createUser(systemLogger, username, password, {
			email: email('success')
		}, 200000).then(emailVerifyToken => {

			request(server)
			.post(`/${username}/verify`)
			.send({ token: emailVerifyToken.token })
			.expect(200, function(err, res){
				done(err);

			});

		}).catch(err => {
			done(err);
		});
	});

	it('user should fail if verify more than once', function(done){
		// create a user
		User.createUser(systemLogger, username_double_verified, password, {
			email: email('double')
		}, 200000).then(emailVerifyToken => {

			request(server)
			.post(`/${username_double_verified}/verify`)
			.send({ token: emailVerifyToken.token })
			.expect(200, function(err, res){

				if(err){
					done(err)
				} else {
					//double verify
					request(server)
					.post(`/${username_double_verified}/verify`)
					.send({ token: emailVerifyToken.token })
					.expect(400, function(err, res){
						expect(res.body.value).to.equal(responseCodes.ALREADY_VERIFIED.value);
						done(err);
					});
				}

			});

		}).catch(err => {
			done(err);
		});
	});


	describe('user should fail', function() {

		let token;

		before(function(){
			return User.createUser(systemLogger, username_not_verified, password, {
				email: email('invalid')
			}, 200000).then(emailVerifyToken => {
				token = emailVerifyToken.token;
			});
		});

		it('if token provided is invalid', function(done){
			request(server)
			.post(`/${username_not_verified}/verify`)
			.send({ token: token + '123'})
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
				done(err);
			});
		});

		it('if no token is provided', function(done){
			request(server)
			.post(`/${username_not_verified}/verify`)
			.send({})
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
				done(err);
			});
		});

		it('if username provided is invalid', function(done){
			request(server)
			.post(`/${username_not_verified}123/verify`)
			.send({ token: token})
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
				done(err);
			});
		});

		it('if token is expired', function(done){

			let expiryTime = -1;

			User.createUser(systemLogger, username_expired_token, password, {
				email: email('expired')
			}, expiryTime).then(emailVerifyToken => {

				request(server)
				.post(`/${username_expired_token}/verify`)
				.send({ token: emailVerifyToken.token })
				.expect(400, function(err, res){
					expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
					done(err);
				});

			}).catch(err => {
				done(err);
			});

		});
	});


});