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
"use strict";

const request = require("supertest");
const {should, assert, expect, Assertion } = require("chai");
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes.js");
const {templates: responseCodesV5} = require("../../../src/v5/utils/responseCodes");
const async = require("async");
const { login } = require("../helpers/users.js");


describe("ModelAssets", function () {
	const username = 'teamSpace1';
	const viewerUser = 'viewerTeamspace1Model1JobB';
	const noAccessUser = "sub_noSub";
	const password = "password";

	const model = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';
	let server;
	let agent;
	let agent2;

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

	describe("Get SRC list", function() {
		const goldenData = {
			"models":[
				{"database":"teamSpace1","model":"5bfc11fa-50ac-b7e7-4328-83aa11fa50ac",
				"assets":["c4e6d66f-33ab-4dc5-97b6-e3d9a644cde4","e06a12a6-87eb-4f69-a83f-2a1caa8e6ba6"],
					"offset":[516898996.60824203,127375.00000000003,-193839500.8370128]}]
		};
		it("from a specific revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/srcAssets.json`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});

		});

		it("from the latest revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/srcAssets.json`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});

		});

		it("from invalid teamspace should fail", function(done) {
			agent.get(`/invalidTeamspaceNameHere/${model}/revision/master/head/srcAssets.json`)
				.expect(404, (err, res) => {
					expect(res.body.value).eq(responseCodes.RESOURCE_NOT_FOUND.value);
					done(err);
				});

		});

		it("from invalid model should fail", function(done) {
			agent.get(`/${username}/dfsfdsg/revision/master/head/srcAssets.json`)
				.expect(404, (err, res) => {
					expect(res.body.code).eq(responseCodesV5.modelNotFound.code);
					done(err);
				});

		});

		it("from an invalid revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/blafldskf/srcAssets.json`)
				.expect(400, (err, res) => {
					expect(res.body.value).to.deep.eq(responseCodes.INVALID_TAG_NAME.value);
					done(err);
			});
		});
	});

	describe("Get SRC list (Viewer)", function() {
		before(function(done) {
			async.series([
				function(_done) {
					agent.post("/logout")
						.send({})
						.expect(200, _done);
				},
				function(_done) {
					agent.post("/login")
						.send({username: viewerUser, password})
						.expect(200, _done);
				}
			], done);
		});

		it("from the latest revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/srcAssets.json`)
				.expect(200, done);
		});

	});

	describe("Get SRC list (No Access)", function() {
		before(function(done) {
			async.series([
				function(_done) {
					agent.post("/logout")
						.send({})
						.expect(200, _done);
				},
				function(_done) {
					agent.post("/login")
						.send({username: noAccessUser, password})
						.expect(200, _done);
				}
			], done);
		});

		it("from the latest revision should fail", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/srcAssets.json`)
				.expect(401, (err, res) => {
					expect(res.body.value).eq(responseCodes.NOT_AUTHORIZED.value);
					done(err);
				});
		});

	});


	describe("Get SRC file", function() {
		before(function(done) {
			async.series([
				function(_done) {
					agent.post("/logout")
						.send({})
						.expect(200, _done);
				},
				function(_done) {
					agent.post("/login")
						.send({username: username, password})
						.expect(200, _done);
				}
			], done);
		});

		it("of a valid ID should succeed", function(done) {
			agent.get(`/${username}/${model}/c4e6d66f-33ab-4dc5-97b6-e3d9a644cde4.src.mpc`)
				.expect(200, done);

		});

		it("of an invalid ID should fail", function(done) {
			agent.get(`/${username}/${model}/invalidID.src.mpc`)
				.expect(404, (err,res) => {
					expect(res.body.code).eq(responseCodesV5.fileNotFound.code);
					done(err);
				});

		});


		it("from invalid teamspace should fail", function(done) {
			agent.get(`/invalidTeamspaceNameHere/${model}/c4e6d66f-33ab-4dc5-97b6-e3d9a644cde4.src.mpc`)
				.expect(404, (err, res) => {
					expect(res.body.value).eq(responseCodes.RESOURCE_NOT_FOUND.value);
					done(err);
				});

		});

		it("from invalid model should fail", function(done) {
			agent.get(`/${username}/dfsfdsg/c4e6d66f-33ab-4dc5-97b6-e3d9a644cde4.src.mpc`)
				.expect(404, (err, res) => {
					expect(res.body.code).eq(responseCodesV5.modelNotFound.code);
					done(err);
				});

		});

	});

	describe("Get SRC file (Viewer)", function() {
		before(function(done) {
			async.series([
				function(_done) {
					agent.post("/logout")
						.send({})
						.expect(200, _done);
				},
				function(_done) {
					agent.post("/login")
						.send({username: viewerUser, password})
						.expect(200, _done);
				}
			], done);
		});

		it("of a valid ID should succeed", function(done) {
			agent.get(`/${username}/${model}/c4e6d66f-33ab-4dc5-97b6-e3d9a644cde4.src.mpc`)
				.expect(200, done);
		});

	});

	describe("Get SRC file (No Access)", function() {
		before(function(done) {
			async.series([
				function(_done) {
					agent.post("/logout")
						.send({})
						.expect(200, _done);
				},
				function(_done) {
					agent.post("/login")
						.send({username: noAccessUser, password})
						.expect(200, _done);
				}
			], done);
		});

		it("of a valid ID should fail", function(done) {
			agent.get(`/${username}/${model}/c4e6d66f-33ab-4dc5-97b6-e3d9a644cde4.src.mpc`)
				.expect(401, (err,res) => {
					expect(res.body.value).eq(responseCodes.NOT_AUTHORIZED.value);
					done(err);
				});
		});

	});

});
