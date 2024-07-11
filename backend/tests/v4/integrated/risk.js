/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const SessionTracker = require("../../v5/helper/sessionTracker")
const { should, assert, expect, Assertion } = require("chai");
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");
const { login } = require("../helpers/users.js");
const { createRisk } = require("../helpers/risks.js");
const { createModel } = require("../helpers/models.js");

const { deleteNotifications, fetchNotification } = require("../helpers/notifications.js");

describe("Risks", function () {
	let server;
	let agent;
	let agent2;
	let altUserAgent;
	let teamspace = "teamSpace1";

	const username = "issue_username";
	const username2 = "issue_username2";
	const password = "password";
	const altUser = "commenterTeamspace1Model1JobA";

	const projectAdminUser = "imProjectAdmin";

	const model = "project1";

	const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC";
	const altBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
	const baseRisk = {
		"safetibase_id": "12456-abcdef",
		"associated_activity": "replacement",
		"desc": "Sample description",
		"viewpoint": {
			"up": [0, 1, 0],
			"position": [38, 38, 125.08011914810137],
			"look_at": [0, 0, -163.08011914810137],
			"view_dir": [0, 0, -1],
			"right": [1, 0, 0],
			"fov": 2.1124830653010416,
			"aspect_ratio": 0.8750189337327384,
			"far": 276.75612077194506,
			"near": 76.42411012233212,
		},
		"assigned_roles": ["jobB"],
		"category": "other issue",
		"likelihood": 0,
		"consequence": 0,
		"mitigation_status": "proposed",
		"mitigation_desc": "Task123",
		"mitigation_detail": "Task123 - a more detailed description",
		"mitigation_stage": "Stage 1",
		"mitigation_type": "Type B",
		"element": "Doors",
		"risk_factor": "Factor 9",
		"scope": "Scope 3",
		"location_desc": "Rooftop"
	};

	const formatReference = (riskId) => {
		return `${username}::${model}::${riskId}`;
	}

	before(async function() {
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log("API test server is listening on port 8080!");
				resolve();
			});

		});

		agent = SessionTracker(request(server));
		await agent.login(username, password);

		agent2 = SessionTracker(request(server));
		await agent2.login("teamSpace1", password);

		altUserAgent = SessionTracker(request(server));
		await altUserAgent.login(altUser, password);

	});

	after(function (done) {
		server.close(function () {
			console.log("API test server is closed");
			done();
		});
	});

	describe("Creating a risk", function () {

		it("should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			const levelOfRisk = (0 === risk.likelihood && 0 === risk.consequence) ? 0 : -1;
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;

							expect(res.body.name).to.equal(risk.name);
							expect(res.body.safetibase_id).to.equal(risk.safetibase_id);
							expect(res.body.associated_activity).to.equal(risk.associated_activity);
							expect(res.body.desc).to.equal(risk.desc);
							expect(res.body.viewpoint.up).to.deep.equal(risk.viewpoint.up);
							expect(res.body.viewpoint.position).to.deep.equal(risk.viewpoint.position);
							expect(res.body.viewpoint.look_at).to.deep.equal(risk.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).to.deep.equal(risk.viewpoint.view_dir);
							expect(res.body.assigned_roles).to.deep.equal(risk.assigned_roles);
							expect(res.body.category).to.equal(risk.category);
							expect(res.body.likelihood).to.equal(risk.likelihood);
							expect(res.body.consequence).to.equal(risk.consequence);
							expect(res.body.level_of_risk).to.equal(levelOfRisk);
							expect(res.body.mitigation_status).to.equal(risk.mitigation_status);
							expect(res.body.mitigation_desc).to.equal(risk.mitigation_desc);
							expect(res.body.mitigation_detail).to.equal(risk.mitigation_detail);
							expect(res.body.mitigation_stage).to.equal(risk.mitigation_stage);
							expect(res.body.mitigation_type).to.equal(risk.mitigation_type);
							expect(res.body.element).to.equal(risk.element);
							expect(res.body.risk_factor).to.equal(risk.risk_factor);
							expect(res.body.scope).to.equal(risk.scope);
							expect(res.body.location_desc).to.equal(risk.location_desc);

							return done(err);
						});
				},

				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.name).to.equal(risk.name);
						expect(res.body.safetibase_id).to.equal(risk.safetibase_id);
						expect(res.body.associated_activity).to.equal(risk.associated_activity);
						expect(res.body.desc).to.equal(risk.desc);
						expect(res.body.viewpoint.up).to.deep.equal(risk.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(risk.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(risk.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(risk.viewpoint.view_dir);
						expect(res.body.assigned_roles).to.deep.equal(risk.assigned_roles);
						expect(res.body.category).to.equal(risk.category);
						expect(res.body.likelihood).to.equal(risk.likelihood);
						expect(res.body.consequence).to.equal(risk.consequence);
						expect(res.body.level_of_risk).to.equal(levelOfRisk);
						expect(res.body.mitigation_status).to.equal(risk.mitigation_status);
						expect(res.body.mitigation_desc).to.equal(risk.mitigation_desc);
						expect(res.body.mitigation_detail).to.equal(risk.mitigation_detail);
						expect(res.body.mitigation_stage).to.equal(risk.mitigation_stage);
						expect(res.body.mitigation_type).to.equal(risk.mitigation_type);
						expect(res.body.element).to.equal(risk.element);
						expect(res.body.risk_factor).to.equal(risk.risk_factor);
						expect(res.body.scope).to.equal(risk.scope);
						expect(res.body.location_desc).to.equal(risk.location_desc);

						return done(err);
					});
				}
			], done);
		});

		it(" with what the plugin passes in should succeed", function (done) {
			const risk = { "_id": null, "owner": null, "created": 0, "account": null, "model": null, "thumbnail": null, "name": "Untitled Risk", "creator_role": null, "assigned_roles": [""], "desc": "abc", "resources": [], "comments": [], "viewpoint": { "IsPerspective": false, "up": [0.408248290463863, 0.816496580927726, -0.408248290463863], "view_dir": [0.577350269189626, -0.577350269189626, -0.577350269189626], "position": [-9945.70490074043, 17665.5806569035, 21191.2012206323], "right": [0.707106781186548, -8.32667268468868e-17, 0.707106781186547], "clippingPlanes": null, "type": "orthographic", "orthographicSize": 20695.689274863 }, "rev_id": null, "likelihood": 0, "location_desc": "", "mitigation_desc": "", "mitigation_detail": "", "mitigation_stage": "", "mitigation_status": "", "mitigation_type": "", "overall_level_of_risk": -1, "safetibase_id": "", "position": null, "norm": null, "category": null, "associated_activity": "", "element": "", "consequence": 0, "residual_consequence": -1, "residual_likelihood": -1, "residual_risk": "", "risk_factor": "", "scope": "" };
			const levelOfRisk = (0 === risk.likelihood && 0 === risk.consequence) ? 0 : -1;
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;

							expect(res.body.name).to.equal(risk.name);
							expect(res.body.safetibase_id).to.equal(risk.safetibase_id);
							expect(res.body.associated_activity).to.equal(risk.associated_activity);
							expect(res.body.desc).to.equal(risk.desc);
							expect(res.body.viewpoint.up).to.deep.equal(risk.viewpoint.up);
							expect(res.body.viewpoint.position).to.deep.equal(risk.viewpoint.position);
							expect(res.body.viewpoint.look_at).to.deep.equal(risk.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).to.deep.equal(risk.viewpoint.view_dir);
							expect(res.body.assigned_roles).to.deep.equal(risk.assigned_roles);
							expect(res.body.likelihood).to.equal(risk.likelihood);
							expect(res.body.consequence).to.equal(risk.consequence);
							expect(res.body.level_of_risk).to.equal(levelOfRisk);
							expect(res.body.mitigation_status).to.equal(risk.mitigation_status);
							expect(res.body.mitigation_desc).to.equal(risk.mitigation_desc);
							expect(res.body.mitigation_detail).to.equal(risk.mitigation_detail);
							expect(res.body.mitigation_stage).to.equal(risk.mitigation_stage);
							expect(res.body.mitigation_type).to.equal(risk.mitigation_type);
							expect(res.body.element).to.equal(risk.element);
							expect(res.body.risk_factor).to.equal(risk.risk_factor);
							expect(res.body.scope).to.equal(risk.scope);
							expect(res.body.location_desc).to.equal(risk.location_desc);

							return done(err);
						});
				},

				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.name).to.equal(risk.name);
						expect(res.body.safetibase_id).to.equal(risk.safetibase_id);
						expect(res.body.associated_activity).to.equal(risk.associated_activity);
						expect(res.body.desc).to.equal(risk.desc);
						expect(res.body.viewpoint.up).to.deep.equal(risk.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(risk.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(risk.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(risk.viewpoint.view_dir);
						expect(res.body.assigned_roles).to.deep.equal(risk.assigned_roles);
						expect(res.body.likelihood).to.equal(risk.likelihood);
						expect(res.body.consequence).to.equal(risk.consequence);
						expect(res.body.level_of_risk).to.equal(levelOfRisk);
						expect(res.body.mitigation_status).to.equal(risk.mitigation_status);
						expect(res.body.mitigation_desc).to.equal(risk.mitigation_desc);
						expect(res.body.mitigation_detail).to.equal(risk.mitigation_detail);
						expect(res.body.mitigation_stage).to.equal(risk.mitigation_stage);
						expect(res.body.mitigation_type).to.equal(risk.mitigation_type);
						expect(res.body.element).to.equal(risk.element);
						expect(res.body.risk_factor).to.equal(risk.risk_factor);
						expect(res.body.scope).to.equal(risk.scope);
						expect(res.body.location_desc).to.equal(risk.location_desc);

						return done(err);
					});
				}
			], done);
		});

		const generateRandomString = (length = 20) => require("crypto").randomBytes(Math.ceil(length / 2.0)).toString('hex');

		it("with long desc should fail", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, {
				...baseRisk,
				"desc": generateRandomString(1201)
			});

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with long mitigation_desc should fail", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, {
				...baseRisk,
				"mitigation_desc": generateRandomString(1201)
			});

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with long residual_risk should fail", function (done) {
			const risk = Object.assign({
				"name": "Risk test",
				"residual_risk": generateRandomString(1201)
			}, baseRisk);

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with screenshot should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint.screenshot = pngBase64;

			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.viewpoint.screenshot).to.equal(`${username}/${model}/risks/${riskId}/viewpoints/${res.body.viewpoint.guid}/screenshot.png`);
						return done(err);
					});
				}
			], done);
		});

		it("with an existing group associated should succeed", function (done) {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';

			const groupData = {
				"color": [98, 126, 184],
				"objects": [
					{
						"account": 'teamSpace1',
						model: model2,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}]
			};


			const risk = { ...baseRisk, "name": "Risk group test" };

			let riskId;
			let groupId;

			async.series([
				function (done) {
					agent2.post(`/${username3}/${model2}/revision/master/head/groups/`)
						.send(groupData)
						.expect(200, function (err, res) {
							groupId = res.body._id;
							done(err);
						});
				},
				function (done) {
					risk.viewpoint = { ...risk.viewpoint, highlighted_group_id: groupId };

					agent2.post(`/${username3}/${model2}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent2.get(`/${username3}/${model2}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.viewpoint.highlighted_group_id).to.equal(groupId);
						return done(err);
					});
				}
			], done);
		});

		it("with a embeded group should succeed", function (done) {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';

			const highlighted_group = {
				objects: [{
					"account": 'teamSpace1',
					model: model2,
					"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}],
				color: [2555, 255, 0]
			};

			const hidden_group = {
				objects: [{
					"account": 'teamSpace1',
					model: model2,
					"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
				}]
			};

			const viewpoint = { ...baseRisk.viewpoint, highlighted_group, hidden_group };

			const risk = { ...baseRisk, "name": "risk embeded group  test", viewpoint };

			let riskId = '';
			let highlighted_group_id = "";
			let hidden_group_id = "";


			async.series([
				function (done) {
					agent2.post(`/${username3}/${model2}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							highlighted_group_id = res.body.viewpoint.highlighted_group_id;
							hidden_group_id = res.body.viewpoint.hidden_group_id;
							return done(err);
						});
				},
				function (done) {
					agent2.get(`/${username3}/${model2}/revision/master/head/groups/${highlighted_group_id}`)
						.expect(200, function (err, res) {
							expect(res.body.objects).to.deep.equal(highlighted_group.objects);
							expect(res.body.color).to.deep.equal(highlighted_group.color);
							done(err);
						});
				},
				function (done) {
					agent2.get(`/${username3}/${model2}/revision/master/head/groups/${hidden_group_id}`)
						.expect(200, function (err, res) {
							expect(res.body.objects).to.deep.equal(hidden_group.objects);
							done(err);
						});
				}
			], done);

		});

		it("with sequence start/end date should succeed", function (done) {
			const startDate = 1476107839000;
			const endDate = 1476107839800;
			const risk = Object.assign({
				"name": "Risk test",
				"sequence_start": startDate,
				"sequence_end": endDate
			}, baseRisk);
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							expect(res.body.sequence_start).to.equal(startDate);
							expect(res.body.sequence_end).to.equal(endDate);

							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.sequence_start).to.equal(startDate);
						expect(res.body.sequence_end).to.equal(endDate);

						return done(err);
					});
				}
			], done);
		});

		it("with sequence end date before start should fail", function (done) {
			const startDate = 1476107839800;
			const endDate = 1476107839000;
			const risk = Object.assign({
				"name": "Risk test",
				"sequence_start": startDate,
				"sequence_end": endDate
			}, baseRisk);
			let riskId;

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_DATE_ORDER.value);
					done(err);
				});
		});

		it("with invalid sequence start/end date should fail", function (done) {
			const risk = Object.assign({
				"name": "Risk test",
				"sequence_start": "invalid data",
				"sequence_end": false
			}, baseRisk);
			let riskId;

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with transformation should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = Object.assign({
				transformation_group_ids: ["8d46d1b0-8ef1-11e6-8d05-000000000000"]
			}, risk.viewpoint);
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							expect(res.body.viewpoint.transformation_group_ids).to.deep.equal(risk.viewpoint.transformation_group_ids);

							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.viewpoint.transformation_group_ids).to.deep.equal(risk.viewpoint.transformation_group_ids);

						return done(err);
					});
				}
			], done);
		});

		it("with embedded transformation should succeed", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = Object.assign({ transformation_groups }, risk.viewpoint);

			let riskId;
			let transformation_group_ids;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							transformation_group_ids = res.body.viewpoint.transformation_group_ids;
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.viewpoint.transformation_group_ids).to.deep.equal(transformation_group_ids);

						return done(err);
					});
				}
			], done);
		});

		it("with orthographic viewpoint should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = {
				"up": [0, 1, 0],
				"position": [38, 38, 125.08011914810137],
				"look_at": [0, 0, -163.08011914810137],
				"view_dir": [0, 0, -1],
				"right": [1, 0, 0],
				"orthographicSize": 3.537606904422707,
				"aspect_ratio": 0.8750189337327384,
				"far": 276.75612077194506,
				"near": 76.42411012233212,
				"type": "orthographic",
				"clippingPlanes": []
			};

			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.viewpoint.type).to.equal(risk.viewpoint.type);
						expect(res.body.viewpoint.orthographicSize).to.equal(risk.viewpoint.orthographicSize);
						return done(err);
					});
				}
			], done);
		});

		it("with invalid (short) embedded transformation matrix should fail", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = Object.assign({ transformation_groups }, risk.viewpoint);

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid (long) embedded transformation matrix should fail", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = Object.assign({ transformation_groups }, risk.viewpoint);

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with embedded transformation group but without matrix should fail", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = Object.assign({ transformation_groups }, risk.viewpoint);

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with embedded transformation matrix but without objects should fail", function (done) {
			const transformation_groups = [
				{
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			risk.viewpoint = Object.assign({ transformation_groups }, risk.viewpoint);

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("without name should fail", function (done) {
			const risk = baseRisk;

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid risk likelihood should fail", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test", "likelihood": "abc" });

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid risk consequence should fail", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test", "consequence": "abc" });

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function (err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid mitigation status should pass", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test", "mitigation_status": "abc" });

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(200, done);
		});

		it("with pin should succeed and pin info is saved", function (done) {
			const risk = Object.assign({
				"name": "Risk test",
				"position": [33.167440465643935, 12.46054749529149, -46.997271893235435]
			}, baseRisk);

			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							expect(res.body.norm).to.deep.equal(risk.norm);
							expect(res.body.position).to.deep.equal(risk.position);
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
						expect(res.body.norm).to.deep.equal(risk.norm);
						expect(res.body.position).to.deep.equal(risk.position);
						done(err);
					});
				}
			], done);
		});

		it("change safetibase_id should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const safetibaseId = { safetibase_id: "another_id" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(safetibaseId)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.safetbase_id = safetibaseId.safetibase_id);
							done(err);
						});
				}
			], done);
		});

		it("change associated_activity should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const associatedActivity = { associated_activity: "cleaning and maintenance" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(associatedActivity)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.associated_activity = associatedActivity.associated_activity);
							done(err);
						});
				}
			], done);
		});

		it("change description should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const description = { desc: "new description" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(description)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.desc = description.desc);
							done(err);
						});
				}
			], done);
		});

		it("long description should fail", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const description = { desc: generateRandomString(1201) };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(description)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.desc).to.equal(risk.desc);
							done(err);
						});
				}
			], done);
		});

		it("change assigned_roles should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const assignedRoles = { assigned_roles: ["jobC"] };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(assignedRoles)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.assigned_roles).to.deep.equal(assignedRoles.assigned_roles);
							done(err);
						});
				}
			], done);
		});

		it("add sequence start/end date should succeed", function (done) {
			const startDate = 1476107839000;
			const endDate = 1476107839800;
			const risk = { ...baseRisk, "name": "Risk test" };
			const sequenceData = {
				sequence_start: startDate,
				sequence_end: endDate
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.sequence_start).to.equal(startDate);
							expect(res.body.sequence_end).to.equal(endDate);
							done(err);
						});
				}
			], done);
		});

		it("add sequence end date before start should fail", function (done) {
			const startDate = 1476107839800;
			const endDate = 1476107839000;
			const risk = { ...baseRisk, "name": "Risk test" };
			const sequenceData = {
				sequence_start: startDate,
				sequence_end: endDate
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_DATE_ORDER.value);
							done(err);
						});
				}
			], done);
		});

		it("change sequence start/end date should succeed", function (done) {
			const startDate = 1476107839000;
			const endDate = 1476107839800;
			const risk = { ...baseRisk, "name": "Risk test", "sequence_start": 1476107839555, "sequence_end": 1476107839855 };
			const sequenceData = {
				sequence_start: startDate,
				sequence_end: endDate
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.sequence_start).to.equal(startDate);
							expect(res.body.sequence_end).to.equal(endDate);
							done(err);
						});
				}
			], done);
		});

		it("change sequence end date to precede start should fail", function (done) {
			const endDate = 1476107839000;
			const risk = { ...baseRisk, "name": "Risk test", "sequence_start": 1476107839555, "sequence_end": 1476107839855 };
			const sequenceData = {
				sequence_end: endDate
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_DATE_ORDER.value);
							done(err);
						});
				}
			], done);
		});

		it("remove sequence start/end date should succeed", function (done) {
			const risk = { ...baseRisk, "name": "Risk test", "sequence_start": 1476107839555, "sequence_end": 1476107839855 };
			const sequenceData = {
				sequence_start: null,
				sequence_end: null
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.sequence_start).to.not.exist;
							expect(res.body.sequence_end).to.not.exist;
							done(err);
						});
				}
			], done);
		});

		it("add sequence start/end date with invalid data should fail", function (done) {
			const risk = { ...baseRisk, "name": "Risk test" };
			const sequenceData = {
				sequence_start: "invalid data",
				sequence_end: false
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				}
			], done);
		});

		it("change sequence start/end date with invalid data should fail", function (done) {
			const risk = { ...baseRisk, "name": "Risk test", "sequence_start": 1476107839555, "sequence_end": 1476107839855 };
			const sequenceData = {
				sequence_start: "invalid data",
				sequence_end: false
			};
			let riskId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(sequenceData)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				}
			], done);
		});

		it("change category should succeed and create system comment", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const category = { category: "environmental issue" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(category)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.category = category.category);
							expect(res.body.comments[0].action).to.deep.equal({
								property: "category",
								from: baseRisk.category,
								to: category.category
							});
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("seal last non system comment when adding system comment", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk, { associated_activity: "ru123" });
			let riskId;
			const data = { associated_activity: "abc123" };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ comment: "hello world" })
						.expect(200, done);
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.comments[0].sealed).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("change likelihood should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const likelihood = { likelihood: 0 };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(likelihood)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.likelihood).to.equal(likelihood.likelihood);
							done(err);
						});
				}
			], done);
		});

		it("change consequence should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const consequence = { consequence: 0 };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(consequence)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.consequence).to.equal(consequence.consequence);
							done(err);
						});
				}
			], done);
		});

		it("change pin should succeed", function (done) {
			const risk = { ...baseRisk, "name": "Risk test", position: [3, 2, 1] };
			let riskId;

			const pin = { position: [1, 3, 0] };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(pin)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.position).to.deep.equal(pin.position);
							done(err);
						});
				}
			], done);
		});

		it("change mitigation status should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const mitigationStatus = { mitigation_status: "approved" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigationStatus)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.mitigation_status).to.equal(mitigationStatus.mitigation_status);
							done(err);
						});
				}
			], done);
		});

		it("change mitigation status to void should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const mitigationStatus = { mitigation_status: "void" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigationStatus)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.mitigation_status).to.equal(mitigationStatus.mitigation_status);
							done(err);
						});
				}
			], done);
		});

		it("change mitigation should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const mitigation = { mitigation_desc: "Done ABC" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigation)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.mitigation_desc).to.equal(mitigation.mitigation_desc);
							done(err);
						});
				}
			], done);
		});

		it("long mitigation_desc should fail", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const mitigation = { mitigation_desc: generateRandomString(1201) };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigation)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.mitigation_desc).to.equal(risk.mitigation_desc);
							done(err);
						});
				}
			], done);
		});

		it("change residual_risk should succeed", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const residualRisk = { residual_risk: "Done ABC" };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(residualRisk)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.residual_risk).to.equal(residualRisk.residual_risk);
							done(err);
						});
				}
			], done);
		});

		it("long mitigation_desc should fail", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;

			const residualRisk = { residual_risk: generateRandomString(1201) };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(residualRisk)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.residual_risk).to.equal(risk.residual_risk);
							done(err);
						});
				}
			], done);
		});

		it("change screenshot should succeed and create system comment", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;
			let oldViewpoint;
			let screenshotRef;
			const data = {
				"viewpoint": {
					"screenshot": altBase64
				}
			};
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							const newViewpoint = { ...oldViewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;

							expect(res.body.comments[0].action.property).to.equal("screenshot");
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint should succeed and create system comment", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;
			let oldViewpoint;
			const data = {
				"viewpoint": {
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
				}
			};
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);

						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;

							expect(res.body.viewpoint.up).to.deep.equal(data.viewpoint.up);
							expect(res.body.viewpoint.position).to.deep.equal(data.viewpoint.position);
							expect(res.body.viewpoint.look_at).to.deep.equal(data.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).to.deep.equal(data.viewpoint.view_dir);
							expect(res.body.viewpoint.right).to.deep.equal(data.viewpoint.right);
							expect(res.body.viewpoint.fov).to.equal(data.viewpoint.fov);
							expect(res.body.viewpoint.aspect_ratio).to.equal(data.viewpoint.aspect_ratio);
							expect(res.body.viewpoint.far).to.equal(data.viewpoint.far);
							expect(res.body.viewpoint.near).to.equal(data.viewpoint.near);
							expect(res.body.comments[0].action.property).to.equal("viewpoint");
							expect(res.body.comments[0].action.from).to.equal(JSON.stringify(oldViewpoint));
							expect(res.body.comments[0].action.to).to.equal(JSON.stringify(newViewpoint));
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change screenshot and viewpoint should succeed and create two system comments", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk);
			let riskId;
			let oldViewpoint;
			let screenshotRef;
			const data = {
				"viewpoint": {
					"screenshot": altBase64,
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
				}
			};

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							delete newViewpoint.screenshot;

							expect(res.body.comments[0].action.property).to.equal("screenshot");
							expect(res.body.comments[0].owner).to.equal(username);

							expect(res.body.viewpoint.up).to.deep.equal(data.viewpoint.up);
							expect(res.body.viewpoint.position).to.deep.equal(data.viewpoint.position);
							expect(res.body.viewpoint.look_at).to.deep.equal(data.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).to.deep.equal(data.viewpoint.view_dir);
							expect(res.body.viewpoint.right).to.deep.equal(data.viewpoint.right);
							expect(res.body.viewpoint.fov).to.equal(data.viewpoint.fov);
							expect(res.body.viewpoint.aspect_ratio).to.equal(data.viewpoint.aspect_ratio);
							expect(res.body.viewpoint.far).to.equal(data.viewpoint.far);
							expect(res.body.viewpoint.near).to.equal(data.viewpoint.near);
							expect(res.body.comments[1].action.property).to.equal("viewpoint");
							expect(res.body.comments[1].action.from).to.equal(JSON.stringify(oldViewpoint));
							const vp = JSON.parse(res.body.comments[1].action.to);
							delete vp.screenshot_ref;
							expect(vp).to.deep.equal(newViewpoint);
							expect(res.body.comments[1].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint transformation should succeed and create system comment", function (done) {
			const risk = Object.assign({ "name": "Risk test" }, baseRisk, { assigned_roles: ["jobA"] });
			let riskId;
			let oldViewpoint;
			const data = {
				"viewpoint": {
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
					"transformation_group_ids": ["8d46d1b0-8ef1-11e6-8d05-000000000000"]
				}
			};
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							data.viewpoint.guid = res.body.viewpoint.guid;
							data.viewpoint.thumbnail = res.body.viewpoint.thumbnail;

							const { screenshotSmall, screenshot, ...viewpoint } = res.body.viewpoint;
							expect(viewpoint).to.deep.equal(data.viewpoint);

							delete oldViewpoint.screenshotSmall;
							delete oldViewpoint.screenshot;
							delete newViewpoint.screenshotSmall;
							delete newViewpoint.screenshot;
							expect(res.body.comments[0].action.property).to.equal("viewpoint");
							expect(JSON.parse(res.body.comments[0].action.from)).to.deep.equal(oldViewpoint);
							expect(JSON.parse(res.body.comments[0].action.to)).to.deep.equal(newViewpoint);
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint embedded transformation should succeed and create system comment", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk, { assigned_roles: ["jobA"] });
			const data = {
				"viewpoint": {
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
					transformation_groups
				}
			};

			let riskId;
			let oldViewpoint;
			let transformation_group_ids;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, function (err, res) {
							transformation_group_ids = res.body.viewpoint.transformation_group_ids;
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							delete newViewpoint.transformation_groups;
							newViewpoint.transformation_group_ids = transformation_group_ids;

							data.viewpoint.guid = res.body.viewpoint.guid;
							data.viewpoint.thumbnail = res.body.viewpoint.thumbnail;
							delete data.viewpoint.transformation_groups;
							data.viewpoint.transformation_group_ids = transformation_group_ids;

							const { screenshotSmall, screenshot, ...viewpoint } = res.body.viewpoint;
							expect(viewpoint).to.deep.equal(data.viewpoint);

							delete oldViewpoint.screenshotSmall;
							delete oldViewpoint.screenshot;
							delete newViewpoint.screenshotSmall;
							delete newViewpoint.screenshot;
							expect(res.body.comments[0].action.property).to.equal("viewpoint");
							expect(JSON.parse(res.body.comments[0].action.from)).to.deep.equal(oldViewpoint);
							expect(JSON.parse(res.body.comments[0].action.to)).to.deep.equal(newViewpoint);
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint embedded transformation with bad matrix should fail", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk, { assigned_roles: ["jobA"] });
			const data = {
				"viewpoint": {
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
					transformation_groups
				}
			};

			let riskId;
			let oldViewpoint;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.viewpoint).to.deep.equal(oldViewpoint);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint embedded transformation without matrix should fail", function (done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk, { assigned_roles: ["jobA"] });
			const data = {
				"viewpoint": {
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
					transformation_groups
				}
			};

			let riskId;
			let oldViewpoint;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.viewpoint).to.deep.equal(oldViewpoint);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint embedded transformation without objects should fail", function (done) {
			const transformation_groups = [
				{
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				},
			];

			const risk = Object.assign({ "name": "Risk test" }, baseRisk, { assigned_roles: ["jobA"] });
			const data = {
				"viewpoint": {
					"up": [0, 1, 0],
					"position": [20, 20, 100],
					"look_at": [0, 0, -100],
					"view_dir": [0, 0, -1],
					"right": [1, 0, 0],
					"fov": 2,
					"aspect_ratio": 1,
					"far": 300,
					"near": 50,
					transformation_groups
				}
			};

			let riskId;
			let oldViewpoint;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(400, function (err, res) {
							expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function (err, res) {
							expect(res.body.viewpoint).to.deep.equal(oldViewpoint);
							done(err);
						});
				}
			], done);
		});

		it("with resolving risk on creation should create new mitigation", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test", "mitigation_desc": "1", "mitigation_status": "agreed_partial" });
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
					.send(risk)
					.expect(200, function (err, res) {
						done(err);
					});
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
					.expect(200, function (err, res) {
						const mitigation = res.body.find((m) => m.mitigation_desc === "1");
						expect(!!mitigation).to.equal(true);
						done(err);
					});
				}
			], done);
		});

		it("with resolving risk on creation should add ref to a mitigation", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test2", "mitigation_desc": "1", "mitigation_status": "agreed_partial" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "1");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("with resolving risk on update should create new mitigation", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test3", "mitigation_desc": "2" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ "mitigation_status": "agreed_partial" })
						.expect(200, function (err, res) {
							done(err);
						});
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "2");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("with resolving risk on update should add risk ref to mitigation", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test4", "mitigation_desc": "2" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ "mitigation_status": "agreed_partial" })
						.expect(200, done);
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "2");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("with editing a resolved risk should remove ref from existing mitigation and create new", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test5", "mitigation_desc": "2", "mitigation_status": "agreed_partial" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ "mitigation_desc": "3" })
						.expect(200, done);
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "2");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(false);
							done(err);
						});
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "3");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("with editing a resolved risk should remove ref from existing mitigation and add ref to another", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test6", "mitigation_desc": "2", "mitigation_status": "agreed_partial" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ "mitigation_desc": "3" })
						.expect(200, done);
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "2");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(false);
							done(err);
						});
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "3");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("with unresolving a risk should remove ref from existing mitigation", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test7", "mitigation_desc": "2", "mitigation_status": "agreed_partial" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ "mitigation_status": "proposed" })
						.expect(200, done);
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "2");
							const reference = mitigation.referencedRisks.find((r) => r === formatReference(riskId));
							expect(!!reference).to.equal(false);
							done(err);
						});
				}
			], done);
		});

		it("with unresolving a risk should remove mitigation", function (done) {
			const risk = Object.assign({}, baseRisk, { "name": "Risk test8", "mitigation_desc": "4", "mitigation_status": "agreed_partial" });
			let riskId = null;
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function (err, res) {
							riskId = res.body._id;
							done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ "mitigation_status": "proposed" })
						.expect(200, done);
				},
				function (done) {
					agent.post(`/${username}/mitigations`)
						.expect(200, function (err, res) {
							const mitigation = res.body.find((m) => m.mitigation_desc === "4");
							expect(!!mitigation).to.equal(false);
							done(err);
						});
				}
			], done);
		});

		describe("and then commenting", function () {
			let riskId;
			let commentId = null

			before(function (done) {
				const risk = Object.assign({ "name": "Risk test" }, baseRisk);

				agent.post(`/${username}/${model}/risks`)
					.send(risk)
					.expect(200, function (err, res) {
						riskId = res.body._id;
						done(err);
					});

			});

			it("should succeed", function (done) {
				const comment = {
					comment: "hello world",
					"viewpoint": {
						"up": [0, 1, 0],
						"position": [38, 38, 125.08011914810137],
						"look_at": [0, 0, -163.08011914810137],
						"view_dir": [0, 0, -1],
						"right": [1, 0, 0],
						"fov": 2.1124830653010416,
						"aspect_ratio": 0.8750189337327384,
						"far": 276.75612077194506,
						"near": 76.42411012233212,
					}
				};

				async.series([
					function (done) {
						agent.post(`/${username}/${model}/risks/${riskId}/comments`)
							.send(comment)
							.expect(200, function (err, res) {
								const commentRes = res.body;
								expect(commentRes.comment).to.equal(comment.comment);
								done(err);
							});
					},
					function (done) {
						agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function (err, res) {
							comment.viewpoint.guid = res.body.comments[0].viewpoint.guid;

							expect(res.body.comments.length).to.equal(1);
							expect(res.body.comments[0].comment).to.equal(comment.comment);
							expect(res.body.comments[0].owner).to.equal(username);
							expect(res.body.comments[0].viewpoint).to.deep.equal(comment.viewpoint);
							commentId = res.body.comments[0].guid;

							done(err);
						});
					}
				], done);
			});

			it("should fail if comment is empty", function (done) {
				const comment = { comment: "" };

				agent.post(`/${username}/${model}/risks/${riskId}/comments`)
					.send(comment)
					.expect(400, function (err, res) {
						expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_NO_TEXT.value);
						done(err);
					});
			});

			it("should succeed if removing an existing comment", function (done) {
				agent.delete(`/${username}/${model}/risks/${riskId}/comments`)
					.send({ guid: commentId })
					.expect(200, function (err, res) {
						done(err);
					});
			});

			it("should fail if invalid risk ID is given", function (done) {
				const invalidId = "00000000-0000-0000-0000-000000000000";
				const comment = { comment: "hello world" };

				agent.patch(`/${username}/${model}/risks/${invalidId}`)
					.send(comment)
					.expect(404, done);
			});
		});

		describe("Tagging a user in a comment", function () {
			const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";
			const riskId = "06f25e30-d011-11ea-82b5-01d0c3871ca6";

			it("should create a notification on the tagged user's messages", function (done) {
				const comment = { comment: `@${altUser}` };
				async.series([
					function (done) {
						agent2.post(`/${teamspace}/${model}/risks/${riskId}/comments`)
							.send(comment)
							.expect(200, done);
					},
					function (done) {
						altUserAgent.get("/notifications")
							.expect(200, function (err, res) {
								const notification = res.body.find(item => item.type === "USER_REFERENCED" && item.riskId === riskId);
								assert(notification);
								expect(notification.modelId).to.equal(model);
								expect(notification.teamSpace).to.equal(teamspace);
								expect(notification.referrer).to.equal(teamspace);
								done(err);
							});
					}],
					done);

			});

			it("should create comment successful if the user tagged a user that doesn't not exist", function (done) {
				const comment = { comment: `@doesntExist1234` };
				altUserAgent.post(`/${teamspace}/${model}/risks/${riskId}/comments`)
					.send(comment)
					.expect(200, done);
			});

			it("should NOT create a notification if the user does not belong in the teamspace", function (done) {
				const comment = { comment: `@${username}` };
				async.series([
					function (done) {
						altUserAgent.post(`/${teamspace}/${model}/risks/${riskId}/comments`)
							.send(comment)
							.expect(200, done);
					},
					function (done) {
						agent.get("/notifications")
							.expect(200, function (err, res) {
								const notification = res.body.find(item => item.type === "USER_REFERENCED" && item.riskId === riskId);
								expect(notification).to.equal(undefined);
								done(err);
							});
					}],
					done);
			});

			it("should NOT create a notification if the user is tagged in a quote", function (done) {
				const comment = {
					comment: `>
			@${altUser}`
				};
				async.waterfall([
					deleteNotifications(altUserAgent),
					function (next) {
						agent2.post(`/${teamspace}/${model}/risks/${riskId}/comments`)
							.send(comment)
							.expect(200, next);
					},
					fetchNotification(altUserAgent),
					(notifications, next) => {
						expect(notifications, 'There should not be any notifications').to.be.an("array").and.to.have.length(0);
						next();
					},
				],
					done);
			});

		});

		describe("Search", function () {
			const teamspace = "teamSpace1";
			const password = "password";
			let model = "";

			before(function (done) {
				async.series([
					(next) => {
						createModel(agent2, teamspace, 'Query risks').then((res) => {
							model = res.body.model;
							let createRiskTeamspace1 = createRisk(teamspace, model);

							async.series([
								createRiskTeamspace1(agent2, { likelihood: 1, consequence: 1, residual_likelihood: 1, residual_consequence: 2, category: "Environmental Issue", number: 0, mitigation_status: "agreed_partial" }),
								createRiskTeamspace1(agent2, { likelihood: 0, consequence: 2, residual_likelihood: 2, residual_consequence: 1, category: "Commercial Issue", number: 1, mitigation_status: "rejected" }),
								createRiskTeamspace1(agent2, { likelihood: 1, consequence: 2, residual_likelihood: 2, residual_consequence: 3, category: "Social Issue", number: 2, mitigation_status: "proposed" }),
								createRiskTeamspace1(agent2, { likelihood: 2, consequence: -1, residual_likelihood: 3, residual_consequence: 4, number: 3, mitigation_status: "" })
							], next);
						})
					},
				], done);
			});

			it(" by id", function (done) {
				let ids = [];

				agent2.get(`/${teamspace}/${model}/risks`)
					.expect(200, function (err, res) {
						ids = res.body.map(risk => risk._id);
						ids = [ids[0], ids[2]].sort();

						agent2.get(`/${teamspace}/${model}/risks?ids=${ids.join(',')}`)
							.expect(200, function (err, res) {
								expect(res.body.map((risk => risk._id)).sort()).to.eql(ids)
								done(err);
							});

					});
			});


			it(" by likelihood", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?likelihoods=0,2`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.likelihood)).sort()).to.eql([0, 2].sort())
						done(err);
					});
			});

			it(" by consequence", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?consequences=3,2`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.consequence)).sort()).to.eql([2, 2].sort())
						done(err);
					});
			});

			it(" by level of risk", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?levelOfRisks=1,-1`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.level_of_risk)).sort()).to.eql([1, 1, -1].sort())
						done(err);
					});
			});

			it(" by residual likelihood", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?residualLikelihoods=1,2`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.residual_likelihood)).sort()).to.eql([1, 2, 2].sort())
						done(err);
					});
			});

			it(" by residual consequence", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?residualConsequences=3`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.residual_consequence)).sort()).to.eql([3].sort())
						done(err);
					});
			});

			it(" by residual level of risk", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?residualLevelOfRisks=2,4`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.residual_level_of_risk)).sort()).to.eql([2, 2, 2, 4].sort())
						done(err);
					});
			});

			it(" by category", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?categories=Environmental%20Issue,Social%20Issue`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.category)).sort()).to.eql(["Environmental Issue", "Social Issue"].sort())
						done(err);
					});
			});

			it(" by number", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?numbers=1,2`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.number)).sort()).to.eql([1, 2].sort())
						done(err);
					});
			});

			it(" by mitigation status", function (done) {
				agent2.get(`/${teamspace}/${model}/risks?mitigationStatus=rejected,proposed`)
					.expect(200, function (err, res) {
						expect(res.body.map((risk => risk.mitigation_status)).sort()).to.eql(["rejected", "proposed"].sort())
						done(err);
					});
			});

		});

	});
});
