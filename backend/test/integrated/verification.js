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
const app = require("../../services/api.js").createApp();
const logger = require("../../logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../response_codes.js");

describe("Verify", function () {
	const User = require("../../models/user");
	let server;
	const username = "v_username";
	const username_not_verified = "v_name_not_verified";
	const username_double_verified = "v_name_db_verified";
	const username_expired_token = "v_name_expired";

	const password = "password";
	const email = suf => `test3drepo_verification_${suf}@mailinator.com`;
	const async = require("async");

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			// hack: by starting the server earlier all the mongoose models like User will be connected to db without any configuration
			request(server).get("/info").end(() => {
				done();
			});

		});

	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("user should success if username and token is correct", function(done) {
		// create a user
		this.timeout(15000);

		User.createUser(systemLogger, username, password, {
			email: email("success")
		}, 200000).then(emailVerifyToken => {

			request(server)
				.post(`/${username}/verify`)
				.send({ token: emailVerifyToken.token })
				.expect(200, function(err, res) {

					done(err);
				// // give the system some time to import the toy model after users verified
				// setTimeout(function(){
				// 	done(err);
				// }, 10000);

				});

		}).catch(err => {
			done(err);
		});
	});

	// Can't test any more but logic moved to bouncer
	// it('verified user should have toy model imported', function(done){

	// 	let agent = request.agent(server);

	// 	async.series([
	// 		function(done){
	// 			agent.post('/login')
	// 			.send({ username, password })
	// 			.expect(200, function(err, res){
	// 				expect(res.body.username).to.equal(username);
	// 				done(err);
	// 			});
	// 		},
	// 		function(done){
	// 			agent.get(`/${username}/sample_project.json`)
	// 			.expect(200, function(err, res){
	// 				expect(res.body.status).to.equal('ok');
	// 				done(err);
	// 			});
	// 		}
	// 	], done);

	// });

	it("user should fail if verify more than once", function(done) {
		// create a user
		User.createUser(systemLogger, username_double_verified, password, {
			email: email("double")
		}, 200000).then(emailVerifyToken => {

			request(server)
				.post(`/${username_double_verified}/verify`)
				.send({ token: emailVerifyToken.token })
				.expect(200, function(err, res) {

					if(err) {
						done(err);
					} else {
					// double verify
						request(server)
							.post(`/${username_double_verified}/verify`)
							.send({ token: emailVerifyToken.token })
							.expect(400, function(err, res) {
								expect(res.body.value).to.equal(responseCodes.ALREADY_VERIFIED.value);
								done(err);
							});
					}

				});

		}).catch(err => {
			done(err);
		});
	});

	describe("user should fail", function() {

		let token;

		before(function() {
			return User.createUser(systemLogger, username_not_verified, password, {
				email: email("invalid")
			}, 200000).then(emailVerifyToken => {
				token = emailVerifyToken.token;
			});
		});

		it("if token provided is invalid", function(done) {
			request(server)
				.post(`/${username_not_verified}/verify`)
				.send({ token: token + "123"})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
					done(err);
				});
		});

		it("if no token is provided", function(done) {
			request(server)
				.post(`/${username_not_verified}/verify`)
				.send({})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
					done(err);
				});
		});

		it("if username provided is invalid", function(done) {
			request(server)
				.post(`/${username_not_verified}123/verify`)
				.send({ token: token})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
					done(err);
				});
		});

		it("if token is expired", function(done) {

			const expiryTime = -1;

			User.createUser(systemLogger, username_expired_token, password, {
				email: email("expired")
			}, expiryTime).then(emailVerifyToken => {

				request(server)
					.post(`/${username_expired_token}/verify`)
					.send({ token: emailVerifyToken.token })
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.TOKEN_INVALID.value);
						done(err);
					});

			}).catch(err => {
				done(err);
			});

		});
	});

});