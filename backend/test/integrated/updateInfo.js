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
const helpers = require("../helpers/signUp");
const async = require("async");

describe("Updating user info", function () {
	const User = require("../../models/user");
	let server;
	let agent;
	const username = "updateinfo_username";
	const password = "Str0ngPassword!";
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

	it("should succeed if provide new info and same email address", async function() {
		const firstName = "abc";
		const lastName = "def";
		await agent.put(`/${username}`)
			.send({ firstName, lastName })
			.expect(200);

		const {body} = await agent.get(`/${username}.json`)
					.expect(200)

		expect(body.firstName).to.equal(firstName);
		expect(body.lastName).to.equal(lastName);
		expect(body.email).to.equal(email);
	});

	it("should succeed if provide new info and new email address", async function() {
		const firstName = "abc";
		const lastName = "def";

		await agent.put(`/${username}`)
			.send({ firstName, lastName, email: newEmail})
			.expect(200);

		const {body} = await agent.get(`/${username}.json`)
					.expect(200)

		expect(body.firstName).to.equal(firstName);
		expect(body.lastName).to.equal(lastName);
		expect(body.email).to.equal(newEmail);
	});

	it("should fail if email provided is taken", async function() {
		const firstName = "abc";
		const lastName = "def";

		const { body } = await agent.put(`/${username}`)
			.send({ firstName, lastName, email: takenEmail })
			.expect(400)

		expect(body.value).to.equal(responseCodes.EMAIL_EXISTS.value);
	});

	it("should fail if firstname is not a string", async function() {
		const lastName = "def";

		const { body } = await agent.put(`/${username}`)
			.send({ firstName : true, lastName, email })
			.expect(400);

		expect(body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
	});

	it("should fail if last name is not a string", async function() {

		const firstName = "abc";
		const lastName = "def";

		const { body } = await agent.put(`/${username}`)
			.send({ firstName, lastName: true, email })
			.expect(400);

		expect(body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
	});

	it("should fail if email is not a string", async function() {
		const firstName = "abc";
		const lastName = "def";

		const { body } = await agent.put(`/${username}`)
			.send({ firstName, lastName, email : true })
			.expect(400);

		expect(body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
	});

	it("update with short password should fail", async function() {
		const passwordData = {
			oldPassword: password,
			newPassword: "Sh0rt!"
		};

		const {body} = await agent.put(`/${username}`)
			.send(passwordData)
			.expect(400);

		expect(body.value).to.equal(responseCodes.PASSWORD_TOO_SHORT.value);
	});

	it("update with weak password should fail", async function() {
		const passwordData = {
			oldPassword: password,
			newPassword: "password"
		};

		const {body} = await agent.put(`/${username}`)
			.send(passwordData)
			.expect(400);

		expect(body.value).to.equal(responseCodes.PASSWORD_TOO_WEAK.value);
	});

	it("update password should succeed", async function() {
		const passwordData = {
			oldPassword: password,
			newPassword: "eVenB3tt3rLongerP@ssword"
		};

		await agent.put(`/${username}`)
			.send(passwordData)
			.expect(200);
	});

	it("should fail to get avatar if the user doesnt have one", async function() {
		const { body } = await agent.get(`/${username}/avatar`)
			.expect(404);

		expect(body.value).to.equal(responseCodes.USER_DOES_NOT_HAVE_AVATAR.value);
	})

	it("should succeed to update the avatar", async function() {
		await agent.post(`/${username}/avatar`)
			.attach("file", __dirname + "/../../statics/images/avatar.png")
			.expect(200);
	})

	it("should succeed to get avatar if a user has one", async function() {
		await agent.get(`/${username}/avatar`)
			.expect(200);

	})

	it ("should fail to update the avatar with the wrong type of file", async function() {
		await agent.post(`/${username}/avatar`)
			.attach("file", __dirname + "/../../statics/images/avatar_fakeimage_zip.png")
			.expect(400);
	});
});

