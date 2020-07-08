"use strict";

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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Risks", function () {
	let server;
	let agent;

	const username = "issue_username";
	const username2 = "issue_username2";
	const password = "password";

	const projectAdminUser = "imProjectAdmin";

	const model = "project1";

	const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC";
	const altBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
	const baseRisk = {
		"safetibase_id":"12456-abcdef",
		"associated_activity":"replacement",
		"desc":"Sample description",
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0],
			"unityHeight":3.537606904422707,
			"fov":2.1124830653010416,
			"aspect_ratio":0.8750189337327384,
			"far":276.75612077194506 ,
			"near":76.42411012233212,
			"clippingPlanes":[]
		},
		"assigned_roles":["jobB"],
		"category":"other issue",
		"likelihood":0,
		"consequence":0,
		"mitigation_status":"proposed",
		"mitigation_desc":"Task123",
		"mitigation_detail":"Task123 - a more detailed description",
		"mitigation_stage":"Stage 1",
		"mitigation_type":"Type B",
		"element":"Doors",
		"risk_factor":"Factor 9",
		"scope":"Scope 3",
		"location_desc":"Rooftop"
	};

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

	describe("Creating a risk", function() {

		it("should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			const levelOfRisk = (0 === risk.likelihood && 0 === risk.consequence) ? 0 : -1;
			let riskId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;

							expect(res.body.name).to.equal(risk.name);
							expect(res.body.safetibase_id).to.equal(risk.safetibase_id);
							expect(res.body.associated_activity).to.equal(risk.associated_activity);
							expect(res.body.desc).to.equal(risk.desc);
							expect(res.body.viewpoint.up).to.deep.equal(risk.viewpoint.up);
							expect(res.body.viewpoint.position).to.deep.equal(risk.viewpoint.position);
							expect(res.body.viewpoint.look_at).to.deep.equal(risk.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).to.deep.equal(risk.viewpoint.view_dir);
							expect(res.body.viewpoint.clippingPlanes).to.deep.equal(risk.viewpoint.clippingPlanes);
							expect(res.body.assigned_roles).to.deep.equal(risk.assigned_roles);
							expect(res.body.category).to.equal(risk.category);
							expect(res.body.likelihood).to.equal(risk.likelihood);
							expect(res.body.consequence).to.equal(risk.consequence);
							expect(res.body.level_of_risk).to.equal(levelOfRisk);
							expect(res.body.mitigation_status).to.equal(risk.mitigation_status);
							expect(res.body.mitigation_desc).to.equal(risk.mitigation_desc);
							expect(res.body.mitigation_detail).to.equal(risk.mitigation_detail);
							expect(res.body.viewpoint.clippingPlanes).to.deep.equal(risk.viewpoint.clippingPlanes);
							expect(res.body.mitigation_stage).to.equal(risk.mitigation_stage);
							expect(res.body.mitigation_type).to.equal(risk.mitigation_type);
							expect(res.body.element).to.equal(risk.element);
							expect(res.body.risk_factor).to.equal(risk.risk_factor);
							expect(res.body.scope).to.equal(risk.scope);
							expect(res.body.location_desc).to.equal(risk.location_desc);

							return done(err);
						});
				},

				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function(err, res) {
						expect(res.body.name).to.equal(risk.name);
						expect(res.body.safetibase_id).to.equal(risk.safetibase_id);
						expect(res.body.associated_activity).to.equal(risk.associated_activity);
						expect(res.body.desc).to.equal(risk.desc);
						expect(res.body.viewpoint.up).to.deep.equal(risk.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(risk.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(risk.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(risk.viewpoint.view_dir);
						expect(res.body.viewpoint.clippingPlanes).to.deep.equal(risk.viewpoint.clippingPlanes);
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

		it("with screenshot should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			risk.viewpoint.screenshot = pngBase64;

			let riskId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function(err, res) {
						expect(res.body.viewpoint.screenshot).to.equal(`${username}/${model}/risks/${riskId}/viewpoints/${res.body.viewpoint.guid}/screenshot.png`);
						return done(err);
					});
				}
			], done);
		});

		it("with an existing group associated should succeed", function(done) {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';
			let agent2 =  null;

			const groupData = {
				"color":[98,126,184],
				"objects":[
					{
						"account": 'teamSpace1',
						model: model2,
						"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}]
			};


			const risk = {...baseRisk, "name":"Risk group test"};

			let riskId;
			let groupId;

			async.series([
				function(done) {
					agent2 = request.agent(server);
					agent2.post("/login")
						.send({ username: 'teamSpace1', password })
						.expect(200, done);
				},
				function(done) {
					agent2.post(`/${username3}/${model2}/revision/master/head/groups/`)
						.send(groupData)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					risk.viewpoint = { ...risk.viewpoint, highlighted_group_id:groupId};

					agent2.post(`/${username3}/${model2}/risks`)
						.send(risk)
						.expect(200 , function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent2.get(`/${username3}/${model2}/risks/${riskId}`).expect(200, function(err , res) {
						expect(res.body.viewpoint.highlighted_group_id).to.equal(groupId);
						return done(err);
					});
				}
			], done);
		});

		it("with a embeded group should succeed", function(done) {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';
			let agent2 =  null;

			const highlighted_group = {
				objects: [{
					"account": 'teamSpace1',
					model: model2,
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}],
				color: [2555, 255, 0]
			};

			const hidden_group = {
				objects: [{
					"account": 'teamSpace1',
					model: model2,
					"shared_ids":["69b60e77-e049-492f-b8a3-5f5b2730129c"]
				}]
			};

			const viewpoint = {...baseRisk.viewpoint, highlighted_group, hidden_group};

			const risk = {...baseRisk, "name":"risk embeded group  test", viewpoint};

			let riskId = '';
			let highlighted_group_id = "";
			let hidden_group_id = "";


			async.series([
				function(done) {
					agent2 = request.agent(server);
					agent2.post("/login")
						.send({ username: 'teamSpace1', password })
						.expect(200, done);
				},
				function(done) {
					agent2.post(`/${username3}/${model2}/risks`)
						.send(risk)
						.expect(200 , function(err, res) {
							riskId = res.body._id;
							highlighted_group_id = res.body.viewpoint.highlighted_group_id;
							hidden_group_id = res.body.viewpoint.hidden_group_id;
							return done(err);
						});
				},
				function(done) {
					agent2.get(`/${username3}/${model2}/revision/master/head/groups/${highlighted_group_id}`)
						.expect(200 , function(err, res) {
							expect(res.body.objects).to.deep.equal(highlighted_group.objects);
							expect(res.body.color).to.deep.equal(highlighted_group.color);
							done(err);
						});
				},
				function(done) {
					agent2.get(`/${username3}/${model2}/revision/master/head/groups/${hidden_group_id}`)
						.expect(200 , function(err, res) {
							expect(res.body.objects).to.deep.equal(hidden_group.objects);
							done(err);
						});
				}
			], done);

		});

		it("without name should fail", function(done) {
			const risk = baseRisk;

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid risk likelihood should fail", function(done) {
			const risk = Object.assign({}, baseRisk, {"name":"Risk test", "likelihood":"abc"});

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid risk consequence should fail", function(done) {
			const risk = Object.assign({}, baseRisk, {"name":"Risk test", "consequence":"abc"});

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid mitigation status should pass", function(done) {
			const risk = Object.assign({}, baseRisk, {"name":"Risk test", "mitigation_status":"abc"});

			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(200, done);
		});

		it("with pin should succeed and pin info is saved", function(done) {
			const risk = Object.assign({
				"name": "Risk test",
				"position": [33.167440465643935, 12.46054749529149, -46.997271893235435]
			}, baseRisk);

			let riskId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200 , function(err, res) {
							riskId = res.body._id;
							expect(res.body.norm).to.deep.equal(risk.norm);
							expect(res.body.position).to.deep.equal(risk.position);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function(err, res) {
						expect(res.body.norm).to.deep.equal(risk.norm);
						expect(res.body.position).to.deep.equal(risk.position);
						done(err);
					});
				}
			], done);
		});

		it("change safetibase_id should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const safetibaseId = { safetibase_id: "another_id" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(safetibaseId)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.safetbase_id = safetibaseId.safetibase_id);
							done(err);
						});
				}
			], done);
		});

		it("change associated_activity should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const associatedActivity = { associated_activity: "cleaning and maintenance" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(associatedActivity)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.associated_activity = associatedActivity.associated_activity);
							done(err);
						});
				}
			], done);
		});

		it("change description should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const description = { desc: "new description" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(description)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.desc = description.desc);
							done(err);
						});
				}
			], done);
		});

		it("change assigned_roles should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const assignedRoles = { assigned_roles: ["jobC"] };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(assignedRoles)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.assigned_roles).to.deep.equal(assignedRoles.assigned_roles);
							done(err);
						});
				}
			], done);
		});

		it("change category should succeed and create system comment", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const category = { category: "environmental issue" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(category)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
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

		it("seal last non system comment when adding system comment", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk, { associated_activity: "ru123"});
			let riskId;
			const data = { associated_activity: "abc123"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200 , function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send({ comment : "hello world"})
						.expect(200 , done);
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.comments[0].sealed).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("change likelihood should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const likelihood = { likelihood: 0 };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(likelihood)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.likelihood).to.equal(likelihood.likelihood);
							done(err);
						});
				}
			], done);
		});

		it("change consequence should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const consequence = { consequence: 0 };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(consequence)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.consequence).to.equal(consequence.consequence);
							done(err);
						});
				}
			], done);
		});

		it("change pin should succeed", function(done) {
			const risk = {...baseRisk, "name":"Risk test", position:[3,2,1]};
			let riskId;

			const pin = { position: [1,3,0] };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(pin)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.position).to.deep.equal(pin.position);
							done(err);
						});
				}
			], done);
		});

		it("change mitigation status should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const mitigationStatus = { mitigation_status: "approved" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigationStatus)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.mitigation_status).to.equal(mitigationStatus.mitigation_status);
							done(err);
						});
				}
			], done);
		});

		it("change mitigation status to void should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const mitigationStatus = { mitigation_status: "void" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigationStatus)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.mitigation_status).to.equal(mitigationStatus.mitigation_status);
							done(err);
						});
				}
			], done);
		});

		it("change mitigation should succeed", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;

			const mitigation = { mitigation_desc: "Done ABC" };

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200, function(err, res) {
							riskId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(mitigation)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							expect(res.body.mitigation_desc).to.equal(mitigation.mitigation_desc);
							done(err);
						});
				}
			], done);
		});

		it("change screenshot should succeed and create system comment", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;
			let oldViewpoint;
			let screenshotRef;
			const data = {
				"viewpoint": {
					"screenshot": altBase64
				}
			};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200 , function(err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							screenshotRef = res.body.viewpoint.screenshot_ref;
							return done(err);
						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
							const newViewpoint = { ...oldViewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							newViewpoint.screenshot_ref = res.body.viewpoint.screenshot_ref;

							expect(res.body.viewpoint.screenshot_ref).to.not.equal(screenshotRef);
							expect(res.body.comments[0].action.property).to.equal("screenshot");
							expect(res.body.comments[0].action.from).to.equal(screenshotRef);
							expect(res.body.comments[0].action.to).to.equal(res.body.viewpoint.screenshot_ref);
							expect(res.body.comments[0].owner).to.equal(username);
							expect(res.body.comments[1].action.property).to.equal("viewpoint");
							expect(res.body.comments[1].action.from).to.equal(JSON.stringify(oldViewpoint));
							expect(res.body.comments[1].action.to).to.equal(JSON.stringify(newViewpoint));
							expect(res.body.comments[1].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change viewpoint should succeed and create system comment", function(done) {
			const risk = Object.assign({"name":"Risk test"}, baseRisk);
			let riskId;
			let oldViewpoint;
			const data = {
				"viewpoint": {
						"up":[0,1,0],
						"position":[20,20,100],
						"look_at":[0,0,-100],
						"view_dir":[0,0,-1],
						"right":[1,0,0],
						"fov":2,
						"aspect_ratio":1,
						"far":300,
						"near":50,
						"clippingPlanes":[]
				}
			};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/risks`)
						.send(risk)
						.expect(200 , function(err, res) {
							riskId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/risks/${riskId}`)
						.send(data)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/risks/${riskId}`)
						.expect(200, function(err, res) {
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
							expect(res.body.viewpoint.clippingPlanes).to.deep.equal(data.viewpoint.clippingPlanes);
							expect(res.body.comments[0].action.property).to.equal("viewpoint");
							expect(res.body.comments[0].action.from).to.equal(JSON.stringify(oldViewpoint));
							expect(res.body.comments[0].action.to).to.equal(JSON.stringify(newViewpoint));
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		describe("and then commenting", function() {
			let riskId;
			let commentId = null

			before(function(done) {
				const risk = Object.assign({"name":"Risk test"}, baseRisk);

				agent.post(`/${username}/${model}/risks`)
					.send(risk)
					.expect(200 , function(err, res) {
						riskId = res.body._id;
						done(err);
					});

			});

			it("should succeed", function(done) {
				const comment = {
					comment: "hello world",
					"viewpoint":{
						"up":[0,1,0],
						"position":[38,38 ,125.08011914810137],
						"look_at":[0,0,-163.08011914810137],
						"view_dir":[0,0,-1],
						"right":[1,0,0],
						"unityHeight ":3.537606904422707,
						"fov":2.1124830653010416,
						"aspect_ratio":0.8750189337327384,
						"far":276.75612077194506 ,
						"near":76.42411012233212,
						"clippingPlanes":[]
					}
				};

				async.series([
					function(done) {
						agent.post(`/${username}/${model}/risks/${riskId}/comments`)
							.send(comment)
							.expect(200 , function(err , res) {
								const commentRes = res.body;
								expect(commentRes.comment).to.equal(comment.comment);
								done(err);
							});
					},
					function(done) {
						agent.get(`/${username}/${model}/risks/${riskId}`).expect(200, function(err , res) {
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

			it("should fail if comment is empty", function(done) {
				const comment = { comment: "" };

				agent.post(`/${username}/${model}/risks/${riskId}/comments`)
					.send(comment)
					.expect(400 , function(err, res) {
						expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_NO_TEXT.value);
						done(err);
					});
			});

			it("should succeed if removing an existing comment", function(done) {
				agent.delete(`/${username}/${model}/risks/${riskId}/comments`)
					.send({guid:commentId})
					.expect(200 , function(err, res) {
						done(err);
					});
			});

			it("should fail if invalid risk ID is given", function(done) {
				const invalidId = "00000000-0000-0000-0000-000000000000";
				const comment = { comment: "hello world" };

				agent.patch(`/${username}/${model}/risks/${invalidId}`)
					.send(comment)
					.expect(404 , done);
			});

		});
	});
});

