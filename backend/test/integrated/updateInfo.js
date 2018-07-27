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
	{ session: require("express-session")({ secret: "testing",  resave: false,   saveUninitialized: false }) }
);
const logger = require("../../logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../response_codes.js");
const helpers = require("./helpers");
const async = require("async");

describe("Updating user info", function () {
	const User = require("../../models/user");
	let server;
	let agent;
	const username = "updateinfo_username";
	const password = "password";
	const email = "test3drepo_updateinfo@mailinator.com";
	const newEmail = "test3drepo_updateinfo_1@mailinator.com";
	const takenEmail = "test3drepo@mailinator.com";

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			helpers.signUpAndLogin({
				server, request, agent, expect, User, systemLogger,
				username, password, email,
				done: function(err, _agent) {
					agent = _agent;
					done(err);
				}
			});

		});

	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("should succeed if provide new info and same email address", function(done) {

		const firstName = "abc";
		const lastName = "def";
		async.series([
			function update(done) {
				agent.put(`/${username}`)
					.send({ firstName, lastName, email })
					.expect(200, done);
			},

			function check(done) {
				agent.get(`/${username}.json`)
					.expect(200, function(err, res) {
						expect(res.body.firstName).to.equal(firstName);
						expect(res.body.lastName).to.equal(lastName);
						done(err);
					});
			}
		], done);

	});

	it("should succeed if provide new info and new email address", function(done) {

		const firstName = "abc";
		const lastName = "def";
		async.series([
			function update(done) {
				agent.put(`/${username}`)
					.send({ firstName, lastName, email: newEmail})
					.expect(200, done);
			},

			function check(done) {
				agent.get(`/${username}.json`)
					.expect(200, function(err, res) {
						expect(res.body.firstName).to.equal(firstName);
						expect(res.body.lastName).to.equal(lastName);
						expect(res.body.email).to.equal(newEmail);
						done(err);
					});
			}
		], done);

	});

	it("should fail if email provided is taken", function(done) {

		const firstName = "abc";
		const lastName = "def";

		agent.put(`/${username}`)
			.send({ firstName, lastName, email: takenEmail })
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.EMAIL_EXISTS.value);
				done(err);
			});

	});

	it("should fail if firstname is not a string", function(done) {

		const firstName = "abc";
		const lastName = "def";

		agent.put(`/${username}`)
			.send({ firstName : true, lastName, email })
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});

	});

	it("should fail if last name is not a string", function(done) {

		const firstName = "abc";
		const lastName = "def";

		agent.put(`/${username}`)
			.send({ firstName, lastName: true, email })
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});

	});

	it("should fail if emailed is not a string", function(done) {

		const firstName = "abc";
		const lastName = "def";

		agent.put(`/${username}`)
			.send({ firstName, lastName, email : true })
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});

	});
});

