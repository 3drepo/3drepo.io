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

"use strict";

const request = require("supertest");
const expect = require("chai").expect;
const { createAppSync } = require("../../../src/v4/services/api.js");
const responseCodes = require("../../../src/v4/response_codes.js");
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

	const customGoldenData = {
		"_id":"4ddbe3e0-826b-11eb-8137-17014c88d41b",
		"teamspace":username,
		"model":model,
		"customSequence":true,
		"name":"Custom Sequence",
		"frames":[
			{
				"dateTime":1446624000000,
				"viewpoint":{
					"up":[0,1,0],
					"position":[38,38 ,125.080119148101],
					"look_at":[0,0,-163.080119148101],
					"view_dir":[0,0,-1],
					"right":[1,0,0],
					"fov":2.11248306530104,
					"aspect_ratio":0.875018933732738,
					"far":276.756120771945,
					"near":76.4241101223321
				}
			},
			{
				"dateTime":1446710400000,
				"viewpoint":{
					"up":[0,1,0],
					"position":[30,35,100],
					"look_at":[0,0,-150],
					"view_dir":[0,0,-1],
					"right":[1,0,0],
					"fov":2.11248306530104,
					"aspect_ratio":0.875018933732738,
					"far":276.756120771945,
					"near":76.4241101223321
				}
			}
		]
	};

	const sequenceId = oldGoldenData._id;
	const stateId = oldGoldenData.frames[0].state;
	const customSequenceId = customGoldenData._id;

	before(async function() {
		const app = await createAppSync();

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
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
				expect(res.body.length).to.equal(3);
				expect(res.body[1]._id).to.equal(latestGoldenData._id);
				expect(res.body[1].teamspace).to.equal(latestGoldenData.teamspace);
				expect(res.body[1].model).to.equal(latestGoldenData.model);
				expect(res.body[1].rev_id).to.equal(latestGoldenData.rev_id);
				expect(res.body[1].name).to.equal(latestGoldenData.name);
				expect(res.body[1].startDate).to.equal(latestGoldenData.frames[0].dateTime);
				expect(res.body[1].endDate).to.equal(latestGoldenData.frames[latestGoldenData.frames.length - 1].dateTime);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences?rev_id=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {
				expect(res.body.length).to.equal(2);
				expect(res.body[0]._id).to.equal(oldGoldenData._id);
				expect(res.body[0].teamspace).to.equal(oldGoldenData.teamspace);
				expect(res.body[0].model).to.equal(oldGoldenData.model);
				expect(res.body[0].rev_id).to.equal(oldGoldenData.rev_id);
				expect(res.body[0].name).to.equal(oldGoldenData.name);
				expect(res.body[0].startDate).to.equal(oldGoldenData.frames[0].dateTime);
				expect(res.body[0].endDate).to.equal(oldGoldenData.frames[oldGoldenData.frames.length - 1].dateTime);

				return done(err);
			});
		});

		it("from federation should succeed", function(done) {
			agent.get(`/${username}/${federation}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
				expect(res.body.length).to.equal(3);
				expect(res.body[1]._id).to.equal(latestGoldenData._id);
				expect(res.body[1].teamspace).to.equal(latestGoldenData.teamspace);
				expect(res.body[1].model).to.equal(latestGoldenData.model);
				expect(res.body[1].rev_id).to.equal(latestGoldenData.rev_id);
				expect(res.body[1].name).to.equal(latestGoldenData.name);
				expect(res.body[1].startDate).to.equal(latestGoldenData.frames[0].dateTime);
				expect(res.body[1].endDate).to.equal(latestGoldenData.frames[latestGoldenData.frames.length - 1].dateTime);

				return done(err);
			});
		});
	});

	describe("Get sequence", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.expect(200, function(err, res) {
					expect(res.body.name).to.equal(oldGoldenData.name);
					expect(res.body.frames).to.deep.equal(oldGoldenData.frames);

					return done(err);
				});
		});

		it("custom sequence should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.expect(200, function(err, res) {
					expect(res.body.customSequence).to.equal(true);
					expect(res.body.name).to.equal(customGoldenData.name);
					expect(res.body.frames).to.deep.equal(customGoldenData.frames);

					return done(err);
				});
		});

		it("with invalid ID should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/invalidId?key=${userApiKey}`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);

					return done(err);
				});
		});
	});

	describe("Get sequence state", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/state/${stateId}?rev_id=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from federation should fail", function(done) {
			agent.get(`/${username}/${federation}/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("with invalid state ID should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/state/invalidId?key=${userApiKey}`).expect(404, function(err , res) {
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
					agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences?rev_id=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(2);
						const updatedData = {...oldGoldenData, ...update};

						expect(res.body[0]._id).to.equal(updatedData._id);
						expect(res.body[0].teamspace).to.equal(updatedData.teamspace);
						expect(res.body[0].model).to.equal(updatedData.model);
						expect(res.body[0].rev_id).to.equal(updatedData.rev_id);
						expect(res.body[0].name).to.equal(updatedData.name);
						expect(res.body[0].startDate).to.equal(updatedData.frames[0].dateTime);
						expect(res.body[0].endDate).to.equal(updatedData.frames[updatedData.frames.length - 1].dateTime);

						done(err);
					});
				}
			], done);
		});

		it("name and frame on read only sequence should fail", function(done) {
			const update = { frames: [customGoldenData.frames[0]], name: "another name"};
			agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_READ_ONLY.value);
					done(err);
				});
		});

		it("anything but the name on read only sequence should fail", function(done) {
			const update = { frames: [customGoldenData.frames[0]]};
			agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_READ_ONLY.value);
					done(err);
				});
		});

		it("name on custom sequence should succeed", function(done) {
			const update = {name: "only name"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						expect(res.body.name).to.equal(update.name);
						done(err);
					});
				}
			], done);
		});

		it("name and frame on custom sequence should succeed", function(done) {
			const update = { frames: [customGoldenData.frames[0]], name: "another name"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						expect(res.body.name).to.equal(update.name);
						expect(res.body.frames).to.deep.equal(update.frames);
						done(err);
					});
				}
			], done);
		});

		it("frame on custom sequence should succeed", function(done) {
			const update = { frames: customGoldenData.frames };
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						expect(res.body.frames).to.deep.equal(update.frames);
						done(err);
					});
				}
			], done);
		});

		it("frame with groups on custom sequence should succeed", function(done) {
			const highlighted_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}],
				color: [2555, 255, 0]
			};

			const hidden_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["69b60e77-e049-492f-b8a3-5f5b2730129c"]
				}]
			};

			const override_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					color: [1, 2, 3],
					totalSavedMeshes: 1
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					color: [4, 5, 6],
					totalSavedMeshes: 1
				},
			];

			const update = { frames: [ Object.assign({}, customGoldenData.frames[0]) ] };
			update.frames[0].viewpoint = Object.assign(
				{highlighted_group, hidden_group, override_groups},
				update.frames[0].viewpoint
			);

			let highlightedGroupId;
			let hiddenGroupId;
			let overrideGroupIds;

			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						highlightedGroupId = res.body.frames[0].viewpoint.highlighted_group_id;
						delete res.body.frames[0].viewpoint.highlighted_group_id;
						delete update.frames[0].viewpoint.highlighted_group;

						hiddenGroupId = res.body.frames[0].viewpoint.hidden_group_id;
						delete res.body.frames[0].viewpoint.hidden_group_id;
						delete update.frames[0].viewpoint.hidden_group;

						overrideGroupIds = res.body.frames[0].viewpoint.override_group_ids;
						delete res.body.frames[0].viewpoint.override_group_ids;
						delete update.frames[0].viewpoint.override_groups;

						expect(res.body.frames).to.deep.equal(update.frames);

						done(err);
					});
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/groups/${highlightedGroupId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(highlighted_group.objects);
							expect(res.body.color).to.deep.equal(highlighted_group.color);
							done(err);
						});
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/groups/${hiddenGroupId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(hidden_group.objects);
							expect(res.body.color).to.deep.equal(hidden_group.color);
							done(err);
						});
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/groups/${overrideGroupIds[0]}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(override_groups[0].objects);
							expect(res.body.color).to.deep.equal(override_groups[0].color);
							done(err);
						});
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/groups/${overrideGroupIds[1]}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(override_groups[1].objects);
							expect(res.body.color).to.deep.equal(override_groups[1].color);
							done(err);
						});
				}
			], done);
		});

		it("frame with viewId on custom sequence should succeed", function(done) {
			const view = {
				"name":"View test",
				"viewpoint": customGoldenData.frames[0].viewpoint
			};
			const update = {};
			async.series([
				(done) => {
					agent.post(`/${username}/${model}/viewpoints?key=${userApiKey}`)
						.send(view)
						.expect(200, function(err, res) {
							update.frames = [
								Object.assign({viewId: res.body._id}, customGoldenData.frames[0])
							];
							delete update.frames[0].viewpoint;
							done(err);
						});
				},
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						delete res.body.frames[0].viewpoint.screenshot_ref;
						expect(res.body.frames[0]).to.deep.equal(customGoldenData.frames[0]);
						done(err);
					});
				}
			], done);
		});

		it("frame with viewId and groups on custom sequence should succeed", function(done) {
			const view = {
				"name":"View test",
				"viewpoint": customGoldenData.frames[0].viewpoint
			};
			const update = {};
			const highlighted_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}],
				color: [2555, 255, 0]
			};

			const hidden_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["69b60e77-e049-492f-b8a3-5f5b2730129c"]
				}]
			};

			const override_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					color: [1, 2, 3],
					totalSavedMeshes: 1
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					color: [4, 5, 6],
					totalSavedMeshes: 1
				},
			];

			view.viewpoint = Object.assign(
				{highlighted_group, hidden_group, override_groups},
				view.viewpoint
			);

			let highlightedGroupId;
			let hiddenGroupId;
			let overrideGroupIds;

			async.series([
				(done) => {
					agent.post(`/${username}/${model}/viewpoints?key=${userApiKey}`)
						.send(view)
						.expect(200, function(err, res) {
							update.frames = [
								Object.assign({viewId: res.body._id}, customGoldenData.frames[0])
							];
							highlightedGroupId = res.body.viewpoint.highlighted_group_id;
							hiddenGroupId = res.body.viewpoint.hidden_group_id;
							overrideGroupIds = res.body.viewpoint.override_group_ids;
							delete update.frames[0].viewpoint;
							done(err);
						});
				},
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						delete res.body.frames[0].viewpoint.screenshot_ref;
						expect(res.body.frames[0]).to.deep.equal({
							...customGoldenData.frames[0],
							viewpoint: {
								...customGoldenData.frames[0].viewpoint,
								highlighted_group_id: highlightedGroupId,
								hidden_group_id: hiddenGroupId,
								override_group_ids: overrideGroupIds
							}
						});
						done(err);
					});
				}
			], done);
		});

		it("empty frames on custom sequence should fail", function(done) {
			const update = { frames: [] };

			agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					return done(err);
				});
		});

		it("frame with transformation on custom sequence should fail", function(done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
			];

			const update = { frames: [ Object.assign({}, customGoldenData.frames[0]) ] };
			update.frames[0].viewpoint = Object.assign({transformation_groups}, update.frames[0].viewpoint);

			agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					return done(err);
				});
		});

		it("revision on custom sequence should succeed", function(done) {
			const update = {"rev_id": oldRevision};

			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						expect(res.body.rev_id).to.deep.equal(update.rev_id);
						done(err);
					});
				}
			], done);
		});

		it("with an unknown field should fail", async () => {
			const update = {"revId": oldRevision};

			await agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400);
		});

		it("remove revision on custom sequence should succeed", function(done) {
			const update = {"rev_id": null};

			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`).expect(200, function(err, res) {
						expect(res.body.rev_id).to.not.exist;
						done(err);
					});
				}
			], done);
		});

		it("invalid revision on custom sequence should fail", function(done) {
			const update = {"rev_id": "badRevision"};

			agent.patch(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
					return done(err);
				});
		});

		it("that does not exist should fail", function(done) {
			const update = { name: "abc"};
			agent.patch(`/${username}/${model}/sequences/invalidSequence?key=${userApiKey}`)
				.send(update)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("name as viewer should fail", function(done) {
			const update = { name: "Viewer's attempt"};
			agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${viewerApiKey}`)
				.send(update)
				.expect(401, done);
		});
	});

	describe("Delete sequence", function() {
		it("custom sequence should succeed", function(done) {
			agent.delete(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.expect(200, done);
		});

		it("read only sequence should fail", function(done) {
			agent.delete(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_READ_ONLY.value);
					return done(err);
				});
		});

		it("non-existent sequence should fail", function(done) {
			agent.delete(`/${username}/${model}/sequences/invalidId?key=${userApiKey}`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					return done(err);
				});
		});
	});

	const goldenLegendData = {
        "Chairs" : "#ffffaa",
        "Apples" : "#aaaaaa11"
	};

	describe("Getting a legend", function() {
		it("from a sequence that does not exist should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/invalidSequence/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("from a sequence that already has a legend should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that already has a legend as a viewer should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/legend?key=${viewerApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that does not have a legend should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
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
			agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
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
					agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.send(newLegend)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(newLegend);
						done(err);
					});
				}
			], done);

		});

		it("of an invalid sequence should fail", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			agent.put(`/${username}/${model}/sequences/invalidSequenceID/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("with the wrong data type should fail", function(done) {
			const newLegend = { a: "#123456", b: false };
			agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with the string that isn't in hex colour format should fail", function(done) {
			const newLegend = { a: "#123456", b: "hello" };
			agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("as a viewer should fail", function(done) {
			const newLegend = { a: "#123456" };
			agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.send(newLegend)
				.expect(401, done);
		});
	});

	describe("Deleting a legend", function() {
		it("as a viewer should fail", function(done) {
			agent.delete(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.expect(401, done);
		});

		it("of an invalid sequence ID should fail", function(done) {
			agent.delete(`/${username}/${model}/sequences/aaa/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("should succeed", function(done) {
			async.series([
				(done) => {
					agent.delete(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(goldenLegendData);
						done(err);
					});
				}
			], done);
		});
	});

	describe("Creating a custom sequence", function() {
		const baseCustomSequence = {
			frames: [
				{
					"dateTime":1446624000000,
					"viewpoint": {
						"up":[0,1,0],
						"position":[38,38 ,125.08011914810137],
						"look_at":[0,0,-163.08011914810137],
						"view_dir":[0,0,-1],
						"right":[1,0,0],
						"fov":2.1124830653010416,
						"aspect_ratio":0.8750189337327384,
						"far":276.75612077194506 ,
						"near":76.42411012233212
					}
				},
				{
					"dateTime":1446710400000,
					"viewpoint": {
						"up":[0,1,0],
						"position":[30,35 ,100],
						"look_at":[0,0,-150],
						"view_dir":[0,0,-1],
						"right":[1,0,0],
						"fov":2.1124830653010416,
						"aspect_ratio":0.8750189337327384,
						"far":276.75612077194506 ,
						"near":76.42411012233212
					}
				}
			]
		};

		it("should succeed", function(done) {
			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			let sequenceId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);
							expect(res.body.frames).to.deep.equal(sequence.frames);

							return done(err);
						});
				}
			], done);
		});

		it("with groups should succeed", function(done) {
			const highlighted_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}],
				color: [2555, 255, 0]
			};

			const hidden_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["69b60e77-e049-492f-b8a3-5f5b2730129c"]
				}]
			};

			const override_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					color: [1, 2, 3],
					totalSavedMeshes: 1
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					color: [4, 5, 6],
					totalSavedMeshes: 1
				},
			];

			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			sequence.frames = [
				Object.assign({}, baseCustomSequence.frames[0]),
				baseCustomSequence.frames[1]
			];
			sequence.frames[0].viewpoint = Object.assign(
				{highlighted_group, hidden_group, override_groups},
				baseCustomSequence.frames[0].viewpoint
			);
			let sequenceId;
			let highlightedGroupId;
			let hiddenGroupId;
			let overrideGroupIds;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);

							highlightedGroupId = res.body.frames[0].viewpoint.highlighted_group_id;
							delete res.body.frames[0].viewpoint.highlighted_group_id;
							delete sequence.frames[0].viewpoint.highlighted_group;

							hiddenGroupId = res.body.frames[0].viewpoint.hidden_group_id;
							delete res.body.frames[0].viewpoint.hidden_group_id;
							delete sequence.frames[0].viewpoint.hidden_group;

							overrideGroupIds = res.body.frames[0].viewpoint.override_group_ids;
							delete res.body.frames[0].viewpoint.override_group_ids;
							delete sequence.frames[0].viewpoint.override_groups;

							expect(res.body.frames).to.deep.equal(sequence.frames);

							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${highlightedGroupId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(highlighted_group.objects);
							expect(res.body.color).to.deep.equal(highlighted_group.color);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${hiddenGroupId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(hidden_group.objects);
							expect(res.body.color).to.deep.equal(hidden_group.color);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${overrideGroupIds[0]}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(override_groups[0].objects);
							expect(res.body.color).to.deep.equal(override_groups[0].color);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${overrideGroupIds[1]}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(override_groups[1].objects);
							expect(res.body.color).to.deep.equal(override_groups[1].color);
							return done(err);
						});
				}
			], done);
		});

		it("with viewId should succeed", function(done) {
			const view = {
				"name":"View test",
				"viewpoint": baseCustomSequence.frames[0].viewpoint
			};
			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			let sequenceId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints?key=${userApiKey}`)
						.send(view)
						.expect(200, function(err, res) {
							sequence.frames = [
								Object.assign({viewId: res.body._id}, baseCustomSequence.frames[0]),
								baseCustomSequence.frames[1]
							];
							delete sequence.frames[0].viewpoint;
							return done(err);
						});
				},
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							delete res.body.frames[0].viewpoint.screenshot_ref;
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);
							expect(res.body.frames).to.deep.equal(baseCustomSequence.frames);

							return done(err);
						});
				}
			], done);
		});

		it("with transformation in viewpoint should fail", function(done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
			];

			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			sequence.frames = [
				Object.assign({}, baseCustomSequence.frames[0]),
				baseCustomSequence.frames[1]
			];
			sequence.frames[0].viewpoint = Object.assign({transformation_groups}, baseCustomSequence.frames[0].viewpoint);
			let sequenceId;

			agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
				.send(sequence)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					return done(err);
				});
		});

		it("with revision should succeed", function(done) {
			const sequence = Object.assign({"name":"Sequence test", "rev_id": oldRevision}, baseCustomSequence);
			let sequenceId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);
							expect(res.body.frames).to.deep.equal(sequence.frames);

							return done(err);
						});
				}
			], done);
		});

		it("with invalid revision should fail", function(done) {
			const sequence = Object.assign({"name":"Sequence test", "rev_id": "badRevision"}, baseCustomSequence);

			agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
				.send(sequence)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
					return done(err);
				});
		});
	});
});
