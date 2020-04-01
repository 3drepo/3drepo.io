/**
 *  Copyright (C) 2019 3D Repo Ltd
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
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Sequences", function () {

	let server;
	let agent;

	const username = "metaTest";
	const password = "123456";

	const model = "4d3df6a7-b4d5-4304-a6e1-dc192a761490";
	const oldRevision = "c01daebe-9fe1-452e-a77e-d201280d1fb9";

	const federation = "fd7c1390-33d1-11ea-b3c9-d5b471b15ad0";

	const latestGoldenData = {
		"_id":"fe5f4826-817a-42f9-9a94-799e8246e4aa",
		"teamspace":username,
		"model":model,
		"rev_id":"33f63801-37a8-4ea9-abbc-6b6cec07b568",
		"name":"Sequence 2",
		"frames":[
			{
				"dateTime":1446624000000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			},
			{
				"dateTime":1446656400000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			},
			{
				"dateTime":1446710400000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			},
			{
				"dateTime":1446742800000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			},
			{
				"dateTime":1446796800000,
				"state":"c58adf37-7694-4b5d-8a46-0be123014460",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000,
						"tasks":[
							{
								"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
								"name":"Site Set-up/ Establishment",
								"startDate":1446624000000,
								"endDate":1455292800000
							}
						]
					}
				]
			}
		]
	};

	const oldGoldenData = {
		"_id":"8a64539a-c78f-41f4-8e9e-29034dc6c293",
		"teamspace":username,
		"model":model,
		"rev_id":oldRevision,
		"name":"Sequence 1",
		"frames":[
			{
				"dateTime":1446624000000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			},
			{
				"dateTime":1446656400000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			},
			{
				"dateTime":1446710400000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee",
				"tasks":[
					{
						"_id":"8aca7c39-b0f2-48b8-b42f-a8be47989a8f",
						"name":"Site Set-up/ Establishment",
						"startDate":1446624000000,
						"endDate":1455292800000
					}
				]
			}
		]
	};

	const sequenceId = oldGoldenData._id;
	const stateId = oldGoldenData.frames[0].state;

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
				.send({ username, password })
                .expect(200, function (err, res) {
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

	describe("List all sequences", function() {
		it("from latest revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(1);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);

			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(1);
				expect(res.body[0]).to.deep.equal(oldGoldenData);

				return done(err);

			});
		});

		it("from federation should succeed", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(1);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);

			});
		});

	});

	describe("Get sequence state", function() {
		it("from latest revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/state/${stateId}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences/${sequenceId}/state/${stateId}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from federation should fail", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences/${sequenceId}/state/${stateId}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("with invalid state ID should fail", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/state/invalidId`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

	});
});
