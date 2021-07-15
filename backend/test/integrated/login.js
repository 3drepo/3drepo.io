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
const responseCodes = require("../../response_codes.js");

describe("Login", function () {
	const User = require("../../models/user");
	let server;
	const username = "login_username";
	const username_not_verified = "login_nonverified";
	const password = "Str0ngPassword!";
	const newPassword = "someCrazyNewPassword2999";
	const email = suf => `test3drepo_login_${suf}@mailinator.com`;

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

	it("with correct password and username and verified should login successfully", function () {

		// create a user
		return User.createUser(username, password, {
			email: email("success")
		}, 200000).then(emailVerifyToken => {
			return User.verify(username, emailVerifyToken.token, true);
		}).then(user => {

			return new Promise((resolve, reject) => {
				request(server)
					.post("/login")
					.send({ username, password })
					.expect(200, function(err, res) {
						expect(res.body.username).to.equal(username);
						err ? reject(err) : resolve();
					});
			});

		});

	});

	it("with correct password and email and verified should login successfully", function () {
		const username = "email_user"

		// create a user
		return User.createUser(username, password, {
			email: email("mail_success")
		}, 200000).then(emailVerifyToken => {
			return User.verify(username, emailVerifyToken.token, true);
		}).then(user => {
			return new Promise((resolve, reject) => {
				request(server)
					.post("/login")
					.send({ username: email("mail_success").toUpperCase() , password }) // toUpperCase is to test case insentive mail
					.expect(200, function(err, res) {
						expect(res.body.username).to.equal(username);
						err ? reject(err) : resolve();
					});
			});

		});

	});


	it("with correct password and username but not yet verified should fail", function () {

		// create a user
		return User.createUser(username_not_verified, password, {
			email: email("notyetverf")
		}, 200000).then(user => {

			return new Promise((resolve, reject) => {
				request(server)
					.post("/login")
					.send({ username: username_not_verified, password })
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.USER_NOT_VERIFIED.value);
						err ? reject(err) : resolve();
					});
			});

		});

	});

	it("with incorrect email should fail", function(done) {
		request(server)
			.post("/login")
			.send({ username: email("nonexistent"), password })
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INCORRECT_USERNAME_OR_PASSWORD.value);
				done(err);

			});
	});

	it("with incorrect password should fail", function(done) {
		request(server)
			.post("/login")
			.send({ username, password: password + "123" })
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INCORRECT_USERNAME_OR_PASSWORD.value);
				done(err);
			});
	});

	it("with incorrect username and password should fail", function(done) {
		request(server)
			.post("/login")
			.send({ username: username  + "123", password: password + "123" })
			.expect(400, function(err, res) {

				expect(res.body.value).to.equal(responseCodes.INCORRECT_USERNAME_OR_PASSWORD.value);
				done(err);

			});
	});

	it("when you are logged in should fail", function(done) {
		// preserver cookies
		const agent = request.agent(server);
		agent.post("/login")
			.send({ username: username , password: password })
			.end(function(err, res) {

			// double login
				agent.post("/login").send({ username: username , password: password })
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.ALREADY_LOGGED_IN.value);
						done(err);
					});

			});
	});

	it("missing username should fail", function(done) {
		request(server)
			.post("/login")
			.send({ password: password + "123" })
			.expect(400, function(err, res) {

				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);

			});
	});

	it("missing password should fail", function(done) {
		request(server)
			.post("/login")
			.send({ username: username })
			.expect(400, function(err, res) {

				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);

			});
	});

	it("non string type username should fail", function(done) {
		request(server)
			.post("/login")
			.send({ username: true , password})
			.expect(400, function(err, res) {

				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);

			});
	});

	it("non string type password should fail", function(done) {
		request(server)
			.post("/login")
			.send({ username, password: true})
			.expect(400, function(err, res) {

				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);

			});
	});

	describe("Forgot password ", function() {
		let token = null

		it("with username should succeed", async function() {
			const data = await User.getForgotPasswordToken(username);

			expect(data.email).to.equal( email("success"));
			expect(data.username).to.equal(username);
			expect(data.token).to.not.be.undefined;
		});

		it("with email should succeed", async function() {
			const data = await User.getForgotPasswordToken(email("success"));

			expect(data.email).to.equal(email("success"));
			expect(data.username).to.equal(username);
			expect(data.token).to.not.be.undefined;

			token = data.token;
		});

		it("reset with short password using token should fail", async function() {
			const {body} = await request(server)
				.put(`/${username}/password`)
				.send({token, newPassword: "Sh0rt!"})
				.expect(400);

			expect(body.value).to.equal(responseCodes.PASSWORD_TOO_SHORT.value);
		});

		it("reset with weak password using token should fail", async function() {
			const {body} = await request(server)
				.put(`/${username}/password`)
				.send({token, newPassword: "password"})
				.expect(400);

			expect(body.value).to.equal(responseCodes.PASSWORD_TOO_WEAK.value);
		});

		it("reset password with token should succeed", async function() {
			await request(server)
				.put(`/${username}/password`)
				.send({token, newPassword})
				.expect(200);
		});

		it("login with new password should succeed", async function() {
			const {body} = await request(server)
				.post("/login")
				.send({ username, password: newPassword})
				.expect(200);

			expect(body.username).to.equal(username);
		});

		it("reset password with expired token should fail", async function() {
			const {body} = await request(server)
				.put(`/${username}/password`)
				.send({token, newPassword: "anotherPassword98"})
				.expect(400);

			expect(body.value).to.equal(responseCodes.TOKEN_INVALID.value);
		});
	});

	describe("Lockout password ", function() {
		it("few incorrect login attempts should not lock account", async function() {
			const attempts = 3;

			console.log(attempts);
			await request(server)
				.post("/login")
				.send({ username, password: "wrongPassword" })
				.expect(400, function(err, res) {
					console.log(err);
					console.log(res.body);
				});
			/*
			for (let i = 0; i < attempts; i++) {
				await request(server)
					.post("/login")
					.send({ username, password: "wrongPassword" })
					.expect(400, function(err, res) {
						console.log(err);
						console.log(res.body);
					});
			}
			*/

			/*
			const {body} = await request(server)
				.post("/login")
				.send({ username, password: newPassword })
				.expect(200);
				*/
		});

		it("remaining attempts warning should warn user of imminent account locking", async function() {
			const attempts = 8;

			/*
			for (let i = 0; i < attempts; i++) {
				const remaining = 9 - i;
				const {body} = await request(server)
					.post("/login")
					.send({ username, password: "wrongPassword" })
					.expect(400, function(err, res) {
						console.log(err);
						console.log(res.body);
					});

				expect(body.value).to.equal(responseCodes.INCORRECT_USERNAME_OR_PASSWORD.value);

				if (remaining <= 5) {
					expect(body.message).to.equal("Incorrect username or password (Remaining attempts: " + remaining + ")");
				}
			}
			*/

			const {body} = await request(server)
				.post("/login")
				.send({ username, password: newPassword })
				.expect(200);
		});

		it("too many bad login attempts should lock account", async function() {
			const attempts = 10;

			/*
			for (let i = 0; i < attempts; i++) {
				await request(server)
					.post("/login")
					.send({ username, password: "wrongPassword" })
					.expect(400, function(err, res) {
						console.log(err);
						console.log(res.body);
					});
			}
			*/

			const {body} = await request(server)
				.post("/login")
				.send({ username, password: newPassword })
				.expect(400);

			expect(body.value).to.equal(responseCodes.TOO_MANY_LOGIN_ATTEMPTS.value);
		});

		it("correct credentials for expired lockout should succeed", async function() {
			await request(server)
				.post("/login")
				.send({ username: "login_lockout_expired_user", password })
				.expect(200);
		});
	});
});
