"use strict";

/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const config = require("../../../src/v4/config");
const responseCodes = require("../../../src/v4/response_codes.js");
const { templates: responseCodesV5}  = require("../../../src/v5/utils/responseCodes");
const app = require("../../../src/v4/services/api.js").createApp();
const async = require("async");

describe("Cross-site requests", function () {
	let server;
	let agent;

	const username = "teamSpace1";
	const password = "password";

	before(function(done) {
		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
				.send({ username, password })
				.set({"Referer":`${config.public_protocol}://${config.cookie_domain}`})
				.expect(200, function(err, res) {
					expect(res.body.username).to.equal(username);
					done(err);
				});

		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("get account info with valid same-site referer should succeed", function(done) {
		agent.get(`/${username}.json`)
			.set({"Referer":`${config.public_protocol}://${config.cookie_domain}`})
			.expect(200, function(err, res) {
				expect(res.body).to.exist
				done(err);
			});
	});

	it("get account info with valid full referer should succeed", function(done) {
		agent.get(`/${username}.json`)
			.set({"Referer":`${config.public_protocol}://${config.cookie_domain}/${username}.json`})
			.expect(200, function(err, res) {
				expect(res.body).to.exist
				done(err);
			});
	});

	it("get account info with invalid referer should fail", function(done) {
		agent.get(`/${username}.json`)
			.set({"Referer":"invalid"})
			.expect(401, function(err, res) {
				expect(res.body.code).to.equal(responseCodesV5.notLoggedIn.code);
				done(err);
			});
	});

	it("get account info with invalid referer protocol should fail", function(done) {
		agent.get(`/${username}.json`)
			.set({"Referer":`ftp://${config.cookie_domain}`})
			.expect(401, function(err, res) {
				expect(res.body.code).to.equal(responseCodesV5.notLoggedIn.code);
				done(err);
			});
	});

	it("get account info with invalid referer domain should fail", function(done) {
		agent.get(`/${username}.json`)
			.set({"Referer":`${config.public_protocol}://invalid`})
			.expect(401, function(err, res) {
				expect(res.body.code).to.equal(responseCodesV5.notLoggedIn.code);
				done(err);
			});
	});

	it("get account info without referer should succeed", function(done) {
		agent.get(`/${username}.json`)
			.expect(200, function(err, res) {
				expect(res.body).to.exist
				done(err);
			});
	});

	it("get account if cookie and request referer consistent should succeed", function(done) {
		async.series([
			function(done) {
				agent.post("/logout")
					.send({})
					.expect(200, function(err, res) {
						expect(res.body.username).to.equal(username);
						done(err);
					});
			},
			function(done) {
				agent.post("/login")
					.send({ username, password })
					.set({"Referer":`${config.public_protocol}://3rdparty.net`})
					.expect(200, function(err, res) {
						expect(res.body.username).to.equal(username);
						done(err);
					});
			},
			function(done) {
				agent.get(`/${username}.json`)
					.set({"Referer":`${config.public_protocol}://3rdparty.net/${username}.json`})
					.expect(200, function(err, res) {
						expect(res.body).to.exist
						done(err);
					});
			}
		], done);
	});

	it("get account if cookie and request referer domain consistent should succeed", function(done) {
		async.series([
			function(done) {
				agent.post("/logout")
					.send({})
					.expect(200, function(err, res) {
						expect(res.body.username).to.equal(username);
						done(err);
					});
			},
			function(done) {
				agent.post("/login")
					.send({ username, password })
					.set({"Referer":`${config.public_protocol}://3rdparty.net/login`})
					.expect(200, function(err, res) {
						expect(res.body.username).to.equal(username);
						done(err);
					});
			},
			function(done) {
				agent.get(`/${username}.json`)
					.set({"Referer":`${config.public_protocol}://3rdparty.net/${username}.json`})
					.expect(200, function(err, res) {
						expect(res.body).to.exist
						done(err);
					});
			}
		], done);
	});
});
