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
	const userApiKey = "d3900e3d5f81b13af626579ec1ead4a9";

	const viewerApiKey = "ba7a87507986da2619fc448cae0d93e4";

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
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446656400000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446710400000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee"
			},
			{
				"dateTime":1446742800000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee"
			},
			{
				"dateTime":1446796800000,
				"state":"c58adf37-7694-4b5d-8a46-0be123014460"
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
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446656400000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446710400000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee",
			}
		]
	};

	const sequenceId = oldGoldenData._id;
	const stateId = oldGoldenData.frames[0].state;

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");
			agent = request.agent(server);
			done();
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
			agent.get(`/${username}/${model}/revision/master/head/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(1);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);

			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(1);
				expect(res.body[0]).to.deep.equal(oldGoldenData);

				return done(err);

			});
		});

		it("from federation should succeed", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(1);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);

			});
		});
	});

	describe("Get sequence state", function() {
		it("from latest revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from federation should fail", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("with invalid state ID should fail", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/state/invalidId?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});
	});

	describe("Update Sequence", function() {
		it("name with a new string should succeed", function(done) {
			const update = { name: "New name for the sequence"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/${oldRevision}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(1);
						expect(res.body[0]).to.deep.equal({...oldGoldenData, ...update});
						done(err);
					});
				}
			], done);
		});

		it("name and frame should only update the name", function(done) {
			const update = { frames: [], name: "another name"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},

				(done) => {
					agent.get(`/${username}/${model}/revision/${oldRevision}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(1);
						expect(res.body[0]).to.deep.equal({...oldGoldenData, name: update.name});
						done(err);
					});
				}

			], done);
		});

		it("anything but the name should fail", function(done) {
			const update = { frames: []};
			agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("that does not exist should fail", function(done) {
			const update = { name: "abc"};
			agent.patch(`/${username}/${model}/revision/master/head/sequences/invalidSequence?key=${userApiKey}`)
				.send(update)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("name as viewer should fail", function(done) {
			const update = { name: "Viewer's attempt"};
			agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${viewerApiKey}`)
				.send(update)
				.expect(401, done);
		});

	});

	const goldenLegendData = {
        "Chairs" : "#ffffaa",
        "Apples" : "#aaaaaa11"
	};

	describe("Getting a legend", function() {
		it("from a sequence that does not exist should fail", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/invalidSequence/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("from a sequence that already has a legend should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that already has a legend as a viewer should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/legend?key=${viewerApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that does not have a legend should succeed", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal({});
					done(err);
				});
		});

	});

	describe("Setting a legend as default", function() {
		it("updating the default legend as a viewer should fail", function(done) {
			agent.put(`/${username}/${model}/settings?key=${viewerApiKey}`)
				.send({defaultLegend : sequenceId })
				.expect(401, done);
		});

		it("updating the default legend should succeed", function(done) {
			async.series([
				(done) => {
					agent.put(`/${username}/${model}/settings?key=${userApiKey}`)
						.send({defaultLegend : sequenceId })
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}.json?key=${userApiKey}`)
						.expect(200, (err, res) => {
							expect(res.body.defaultLegend).to.equal(sequenceId);
							done(err);
						});
				}
			], done);
		});

		it("sequences with no legend should get be getting the default legend instead of empty legend", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});
	});

	describe("Updating a legend", function() {
		it("of a valid sequence should succeed", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			async.series([
				(done) => {
					agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.send(newLegend)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(newLegend);
						done(err);
					});
				}
			], done);

		});

		it("of an invalid sequence should fail", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			agent.put(`/${username}/${model}/revision/master/head/sequences/invalidSequenceID/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("with the wrong data type should fail", function(done) {
			const newLegend = { a: "#123456", b: false };
			agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with the string that isn't in hex colour format should fail", function(done) {
			const newLegend = { a: "#123456", b: "hello" };
			agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("as a viewer should fail", function(done) {
			const newLegend = { a: "#123456" };
			agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.send(newLegend)
				.expect(401, done);
		});
	});


	describe("Deleting a legend", function() {
		it("as a viewer should fail", function(done) {
			agent.delete(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.expect(401, done);
		});

		it("of an invalid sequence ID should fail", function(done) {
			agent.delete(`/${username}/${model}/revision/master/head/sequences/aaa/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("should succeed", function(done) {
			async.series([
				(done) => {
					agent.delete(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(goldenLegendData);
						done(err);
					});
				}
			], done);

		});
	});


});
