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
	const viewerUser = "issue_username2";
	const noAccessUser = "issue_username";
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
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(4);
					done(err);
				});
		});

		it("using revision ID should succeed", function(done){
			agent.get(`/${username}/${model}/groups/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(4);
					done(err);
				});
		});
	});


	describe("List all groups (no Issue groups) ", function() {
		it("using master head revision should succeed", function(done){
			agent.get(`/${username}/${model}/groups/revision/master/head/?noIssues=true`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(2);
					done(err);
				});
		});

		it("using revision ID should succeed", function(done){
			agent.get(`/${username}/${model}/groups/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/?noIssues=true`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(2);
					done(err);
				});
		});
	});

	describe("Finding a group by ID ", function() {
		const groupID = "0e2f7fa0-7ac5-11e8-9567-6b401a084a90";
		const goldenData = {
			"_id":"0e2f7fa0-7ac5-11e8-9567-6b401a084a90",
			"color":[98,126,184],
			"objects":[
				{
					"account":"groupUser",
					"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}
			]
		};
		it("using master head revision should succeed", function(done){
			agent.get(`/${username}/${model}/groups/revision/master/head/${groupID}`)
				.expect(200 , function(err, res) {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});
		});

		it("with invalid ID should fail", function(done){
			agent.get(`/${username}/${model}/groups/revision/master/head/invalidSomething`)
				.expect(404 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.GROUP_NOT_FOUND.value);
					done(err);
				});
		});

		it("with invalid revision ID should fail", function(done){
			agent.get(`/${username}/${model}/groups/revision/f640aa3dec2/${groupID}`)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
					done(err);
				});
		});

		it("with some other teamspace should fail", function(done){
			agent.get(`/${noAccessUser}/${model}/groups/revision/f640aa3dec2/${groupID}`)
				.expect(401 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NOT_AUTHORIZED.value);
					done(err);
				});
		});

		it("using revision ID should succeed", function(done){
			agent.get(`/${username}/${model}/groups/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/${groupID}`)
				.expect(200 , function(err, res) {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});
		});
	});

	describe("Creating a group ", function() {
		const data = {
			"color":[98,126,184],
			"objects":[
				{
					"account":"groupUser",
					"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}]
		};
		it("with valid parameters should succeed", function(done) {

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/groups/`)
						.send(data)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/groups/revision/master/head/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(3);
							done(err);
						});
				}

			], done);

		});

		it("without color should succeed", function(done) {
			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.color;
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/groups/revision/master/head/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(4);
							done(err);
						});
				}

			], done);

		});

		it("without objects field should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});


	});



});

