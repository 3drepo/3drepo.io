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
const SessionTracker = require("../../v4/helpers/sessionTracker")
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes.js");
const {templates: responseCodesV5} = require("../../../src/v5/utils/responseCodes");
const async = require("async");

describe("Views", function () {

	let server;
	let agent;
	let agent2;

	const username = "issue_username";
	const password = "password";

	const model = "project1";

	const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC";
	const baseView = {
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0]
		}
	};
	const oldBaseView = {
		"screenshot":{"base64":pngBase64},
		"clippingPlanes":[],
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0]
		}
	};

	const teamSpace1Username = "teamSpace1";
	const teamSpace1Model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";

	const teamSpace1Views = {
		"8edc8100-c507-11ea-997a-6b0bb83fc236": {
			"name": "View 1",
			"viewpoint": {
				"up":[0.112882435321808,0.989541232585907,-0.0898092463612556],
				"position":[-46515.578125,12318.06640625,36445.8203125],
				"look_at":[-456.46484375,3738.03857421875,-198.796875],
				"view_dir":[0.774361252784729,-0.14425028860569,-0.616081595420837],
				"right":[0.62259316444397,1.11758708953857e-08,0.782545685768127],
				"clippingPlanes":[]
			}
		},
		"9f9d70c0-c512-11ea-9912-75a7ea2ef2ca": {
			"name": "View 2",
			"viewpoint": {
				"up":[0.112882435321808,0.989541232585907,-0.0898092463612556],
				"position":[-46515.578125,12318.06640625,36445.8203125],
				"look_at":[-456.46484375,3738.03857421875,-198.796875],
				"view_dir":[0.774361252784729,-0.14425028860569,-0.616081595420837],
				"right":[0.62259316444397,1.11758708953857e-08,0.782545685768127],
				"clippingPlanes":[]
			}
		},
		"45b287c0-c513-11ea-890a-2521b66dfa5c": {
			"name": "View 3",
			"viewpoint": {
				"up":[0.112882435321808,0.989541232585907,-0.0898092463612556],
				"position":[-46515.578125,12318.06640625,36445.8203125],
				"look_at":[-456.46484375,3738.03857421875,-198.796875],
				"view_dir":[0.774361252784729,-0.14425028860569,-0.616081595420837],
				"right":[0.62259316444397,1.11758708953857e-08,0.782545685768127],
				"clippingPlanes":[]
			}
		},
		"161709f0-6ce5-11e9-8189-adb6fe2d2464": {
			"name": "Clipped View",
			"viewpoint": {
				"up":[-0.250748455524445,0.91335266828537,0.320799112319946],
				"position":[16069.677734375,10946.244140625,-13472.9267578125],
				"look_at":[8912.71875,5765.3837890625,-4316.5537109375],
				"view_dir":[-0.562472999095917,-0.407169342041016,0.719609141349792],
				"right":[-0.787876486778259,0,-0.615833342075348],
				"clippingPlanes":[
					{
						"distance" : 9320.0009765625,
						"clipDirection" : -1,
						"normal" : [ 0, -1, 0 ]
					},
					{
						"distance" : -6325.38916015625,
						"clipDirection" : -1,
						"normal" : [ 0, 1, -1.19209275339927e-07 ]
					},
					{
						"distance" : -2511.455078125,
						"clipDirection" : -1,
						"normal" : [ 1, 0, 0 ]
					},
					{
						"distance" : 14149.3828125,
						"clipDirection" : -1,
						"normal" : [ -1, 0, 0 ]
					},
					{
						"distance" : 9225.671875,
						"clipDirection" : -1,
						"normal" : [ 0, 1.19209275339927e-07, 1 ]
					},
					{
						"distance" : -1344.57702636719,
						"clipDirection" : -1,
						"normal" : [ 0, -1.19209275339927e-07, -1 ]
					}
				]
			}
		}
	};

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


	});

	after(function(done) {
		server.close(function() {
			done();
		});
	});

	describe("Retrieving views", function() {
		it("full list should succeed", function(done) {

			agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/`)
				.expect(200, function(err, res) {
					expect(res.body.length).to.equal(Object.keys(teamSpace1Views).length);
					return done(err);
				});

		});

		it("invalid teamspace should fail", function(done) {

			agent2.get(`/invalidTeamspace/${teamSpace1Model}/viewpoints/`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.RESOURCE_NOT_FOUND.value);
					return done(err);
				});
		});

		it("invalid model ID should fail", function(done) {
			agent2.get(`/${teamSpace1Username}/invalidModelID/viewpoints/`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.code);
					return done(err);
			});
		});

		it("by ID should succeed", function(done) {
			const viewId = Object.keys(teamSpace1Views)[0];
			agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}`)
				.expect(200, function(err, res) {
					teamSpace1Views[viewId].viewpoint.near = res.body.viewpoint.near;
					teamSpace1Views[viewId].viewpoint.far = res.body.viewpoint.far;
					teamSpace1Views[viewId].viewpoint.fov = res.body.viewpoint.fov;
					teamSpace1Views[viewId].viewpoint.aspect_ratio = res.body.viewpoint.aspect_ratio;
					teamSpace1Views[viewId].viewpoint.hideIfc = res.body.viewpoint.hideIfc;

					expect(res.body._id).to.equal(viewId);
					expect(res.body.name).to.equal(teamSpace1Views[viewId].name);
					expect(res.body.viewpoint).to.deep.equal(teamSpace1Views[viewId].viewpoint);
					expect(res.body.thumbnail).to.exist;
					return done(err);
				});
		});

		it("with invalid ID should fail", function(done) {
			const viewId = "invalidID";

			agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.VIEW_NOT_FOUND.value);

					return done(err);
				});
		});

		it("legacy fields should succeed [deprecated version]", function(done) {
			const viewId = Object.keys(teamSpace1Views)[0];

			agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}`)
				.expect(200, function(err, res) {
					expect(res.body.clippingPlanes).to.deep.equal(teamSpace1Views[viewId].viewpoint.clippingPlanes);
					expect(res.body.screenshot).to.exist;
					expect(res.body.screenshot.thumbnail).to.equal(`${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/thumbnail.png`);

					return done(err);
				});
		});

		it("view with clipping planes should succeed", function(done) {
			const viewId = Object.keys(teamSpace1Views)[3];

			agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}`)
				.expect(200, function(err, res) {
					expect(res.body.viewpoint.clippingPlanes).to.deep.equal(teamSpace1Views[viewId].viewpoint.clippingPlanes);
					return done(err);
			});
		});

		it("view with legacy clipping planes should succeed [deprecated version]", function(done) {
			const viewId = Object.keys(teamSpace1Views)[3];

			agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}`)
				.expect(200, function(err, res) {
					expect(res.body.clippingPlanes).to.deep.equal(teamSpace1Views[viewId].viewpoint.clippingPlanes);
					return done(err);
			});
		});
	});

	describe("Changing a view", function() {
		it("change name should succeed", function(done) {
			const viewId = Object.keys(teamSpace1Views)[0];
			const newName = { name: "New view name"};

			async.series([
				function(done) {
					agent2.put(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/`)
						.send(newName)
						.expect(200, done);
				},
				function(done) {
					agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/`)
						.expect(200, function(err, res) {
							expect(res.body.name).to.equal(newName.name);
							done(err);
						});
				}
			], done);
		});

		it("change view should fail", function(done) {
			const viewId = Object.keys(teamSpace1Views)[0];
			const newView = {
				"viewpoint":{
					"up":[1,1,1],
					"position":[12,13,35],
					"look_at":[0,0,1],
					"view_dir":[-1,0,1],
					"right":[0,1,0]
				}
			};
			agent2.put(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/`)
				.send(newView)
				.expect(400, done);
		});

		it("add unexpected field should fail", function(done) {
			const viewId = Object.keys(teamSpace1Views)[0];
			const badData = { unexpectedData: 1234 };

			agent2.put(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/`)
				.send(badData)
				.expect(400, done);
		});

		it("delete view should succeed", function(done) {
			const viewId = Object.keys(teamSpace1Views)[0];

			async.series([
				function(done) {
					agent2.delete(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/`)
						.expect(200, done);
				},
				function(done) {
					agent2.get(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}`)
						.expect(404, function(err, res) {
							expect(res.body.value).to.equal(responseCodes.VIEW_NOT_FOUND.value);

							return done(err);
						});
				}
			], done);
		});

		it("delete non-existent view should fail", function(done) {
			const viewId = "wrongID";
			agent2.delete(`/${teamSpace1Username}/${teamSpace1Model}/viewpoints/${viewId}/`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.VIEW_NOT_FOUND.value);

					return done(err);
				});
		});
	});

	describe("Creating a view", function() {
		it("should succeed", function(done) {
			const view = Object.assign({"name":"View test"}, baseView);
			let viewId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}`).expect(200, function(err, res) {
						expect(res.body.name).to.equal(view.name);
						expect(res.body.viewpoint).to.deep.equal(view.viewpoint);

						return done(err);
					});
				}
			], done);
		});

		it("should succeed [deprecated version]", function(done) {
			const view = Object.assign({"name":"View test",
				"clippingPlanes":[
					{
						"distance" : 9320.0009765625,
						"clipDirection" : -1,
						"normal" : [ 0, -1, 0 ]
					}]}, oldBaseView);
			let viewId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}`).expect(200, function(err, res) {
						view.clippingPlanes = res.body.viewpoint.clippingPlanes;

						expect(res.body.name).to.equal(view.name);
						expect(res.body.clippingPlanes).to.deep.equal(view.clippingPlanes);
						expect(res.body.viewpoint).to.deep.equal(view.viewpoint);

						return done(err);
					});
				}
			], done);
		});

		it("with screenshot should succeed", function(done) {
			const view = Object.assign({"name":"View test", "viewpoint": {}}, baseView);
			view.viewpoint.screenshot = pngBase64;

			let viewId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}/`).expect(200, function(err, res) {
						expect(res.body.thumbnail).to.equal(`${username}/${model}/viewpoints/${viewId}/thumbnail.png`);
						return done(err);
					});
				}
			], done);
		});

		it("with screenshot should succeed [deprecated version]", function(done) {
			const view = Object.assign({"name":"View test", "viewpoint": {}}, oldBaseView);
			view.screenshot = {};
			view.screenshot.base64 = pngBase64;

			let viewId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200 , function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}/`).expect(200, function(err, res) {
						expect(res.body.screenshot.thumbnail).to.equal(`${username}/${model}/viewpoints/${viewId}/thumbnail.png`);
						return done(err);
					});
				}
			], done);
		});

		it("with unexpected data should succeed without unexpected fields", function(done) {
			const view = Object.assign({"name":"View test", "unexpected":"asdf"}, baseView);
			let viewId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}`).expect(200, function(err, res) {
						delete view.viewpoint.screenshot;

						expect(res.body.name).to.equal(view.name);
						expect(res.body.unexpected).to.not.exist;
						expect(res.body.viewpoint).to.deep.equal(view.viewpoint);

						return done(err);
					});
				}
			], done);
		});

		it("change name should succeed", function(done) {
			const view = Object.assign({"name":"View test"}, baseView, { status: "open"});
			let viewId;
			const newName = { name: "New view name"};

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.put(`/${username}/${model}/viewpoints/${viewId}/`)
						.send(newName)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}/`)
						.expect(200, function(err, res) {
							expect(res.body.name).to.equal(newName.name);
							done(err);
						});
				}
			], done);
		});

		it("change view should fail", function(done) {
			const view = Object.assign({"name":"View test"}, baseView, { status: "open"});
			let viewId;
			const newView = {
				"viewpoint":{
					"up":[1,1,1],
					"position":[12,13,35],
					"look_at":[0,0,1],
					"view_dir":[-1,0,1],
					"right":[0,1,0]
				}
			};

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.put(`/${username}/${model}/viewpoints/${viewId}/`)
						.send(newView)
						.expect(400, done);
				}
			], done);
		});

		it("with a embeded group should succeed", async function() {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';

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

			const override_groups = [
				{
					objects: [{
						"account": 'teamSpace1',
						model: model2,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					color: [1, 2, 3],
					totalSavedMeshes: 1
				},
				{
					objects: [{
						"account": 'teamSpace1',
						model: model2,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					color: [4, 5, 6],
					totalSavedMeshes: 1
				},
			];

			const viewpoint_groups = { highlighted_group, hidden_group, override_groups };

			const view = { "name":"View embeded group  test", viewpoint : {...baseView.viewpoint, ...viewpoint_groups}};

			const { body:{viewpoint:{highlighted_group_id, hidden_group_id, override_group_ids}} } = await agent2.post(`/${username3}/${model2}/viewpoints/`)
						.send(view)
						.expect(200);

			const getGroup = async (id) => {
				const {body} = await agent2.get(`/${username3}/${model2}/revision/master/head/groups/${id}`).expect(200);
				return body;
			}

			const [highlighted_group2,hidden_group2, ...override_groups_2 ]	= await	Promise.all([
				getGroup(highlighted_group_id),
				getGroup(hidden_group_id),
			].concat(override_group_ids.map(getGroup)));

			expect(highlighted_group2.objects).to.deep.equal(highlighted_group.objects);
			expect(hidden_group2.objects).to.deep.equal(hidden_group.objects);

			const mergeObjects = (groups) => groups.reduce((arr, group) => arr.concat(group.objects), []);

			expect(mergeObjects(override_groups_2)).to.deep.equal(mergeObjects(override_groups));
		});

		it("with transformation should succeed", function(done) {
			const view = Object.assign({"name":"View test"}, baseView);
			view.viewpoint = Object.assign({
				transformation_group_ids: ["8d46d1b0-8ef1-11e6-8d05-000000000000"]
			}, view.viewpoint);
			let viewId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}`).expect(200, function(err, res) {
						expect(res.body.name).to.equal(view.name);
						expect(res.body.viewpoint).to.deep.equal(view.viewpoint);

						return done(err);
					});
				}
			], done);
		});

		it("with embedded transformation should succeed", function(done) {
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

			const view = Object.assign({"name":"View test"}, baseView);
			view.viewpoint = Object.assign({transformation_groups}, view.viewpoint);

			let viewId;
			let transformation_group_ids;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints/`)
						.send(view)
						.expect(200, function(err, res) {
							viewId = res.body._id;
							transformation_group_ids = res.body.viewpoint.transformation_group_ids;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/viewpoints/${viewId}`).expect(200, function(err, res) {
						delete view.viewpoint.transformation_groups;
						view.viewpoint.transformation_group_ids = transformation_group_ids;

						expect(res.body.name).to.equal(view.name);
						expect(res.body.viewpoint).to.deep.equal(view.viewpoint);

						return done(err);
					});
				}
			], done);
		});

		it("with invalid (short) embedded transformation matrix should fail", function(done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12]
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

			const view = Object.assign({"name":"View test"}, baseView);
			view.viewpoint = Object.assign({transformation_groups}, view.viewpoint);

			agent.post(`/${username}/${model}/viewpoints/`)
				.send(view)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with invalid (long) embedded transformation matrix should fail", function(done) {
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
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
				},
			];

			const view = Object.assign({"name":"View test"}, baseView);
			view.viewpoint = Object.assign({transformation_groups}, view.viewpoint);

			agent.post(`/${username}/${model}/viewpoints/`)
				.send(view)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with embedded transformation group but without matrix should fail", function(done) {
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
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
			];

			const view = Object.assign({"name":"View test"}, baseView);
			view.viewpoint = Object.assign({transformation_groups}, view.viewpoint);

			agent.post(`/${username}/${model}/viewpoints/`)
				.send(view)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with embedded transformation matrix but without objects should fail", function(done) {
			const transformation_groups = [
				{
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

			const view = Object.assign({"name":"View test"}, baseView);
			view.viewpoint = Object.assign({transformation_groups}, view.viewpoint);

			agent.post(`/${username}/${model}/viewpoints/`)
				.send(view)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});
	});
});

