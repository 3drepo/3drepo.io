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
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Groups", function () {

	let server;
	let agent;

	const username = "groupUser";
	const username2 = "issue_username2";
	const password = "password";

	const model = "4ec71fdd-0450-4b6f-8478-c46633bb66e3";

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
				.send({ username, password })
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

	describe("List all groups", function() {
		it("using master head revision should succeed", function(done){
			agent.get(`/${username}/${model}/groups/revision/master/head/`)
				.send(groups)
				.expect(200 , function(err, res) {
					expect(groups.length).to.equal(4);
					done(err);
				});
		});

		it("using revision ID should succeed", function(){
			agent.get(`/${username}/${model}/groups/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/`)
				.send(groups)
				.expect(200 , function(err, res) {
					expect(groups.length).to.equal(4);
					done(err);
				});
		});
	});

});

