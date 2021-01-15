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
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const async = require("async");
const ModelSetting = require("../../models/modelSetting");
const User = require("../../models/user");
describe("Model", function () {
	let server;
	let agent;
	const username = "project_username";
	const password = "project_username";
	const model = "model12345";
	let modelId;
	const project = "projectgroup";
	const desc = "desc";
	const type = "type";
	const unit = "m";
	const code = "00011";

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
		const q = require("../../services/queue");
		q.channel.assertQueue(q.workerQName, { durable: true }).then(() => {
			return q.channel.purgeQueue(q.workerQName);
		}).then(() => {
			q.channel.assertQueue(q.modelQName, { durable: true }).then(() => {
				return q.channel.purgeQueue(q.modelQName);
			}).then(() => {
				server.close(function() {
					console.log("API test server is closed");
					done();
				});
			});
		});
	});

	describe("JSON tests ", function() {
		const existingModel = "58de3562-6755-44cf-90f4-860b20bb73b5";
		const revId = "f0fd8f0c-06e2-479b-b41a-a8873bc74dc9";
		const existingFed = "b667ab4c-7e71-4db9-9f85-cb81437aaf43";

		it("get ID map should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/idMap.json`)
				.expect(404, function(err, res) {
					// FIXME
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		it("get ID map with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/idMap.json`)
				.expect(404, function(err, res) {
					// FIXME
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		it("get ID to meshes should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/idToMeshes.json`)
				.expect(404, function(err, res) {
					// FIXME
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		it("get ID to meshes with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/idToMeshes.json`)
				.expect(404, function(err, res) {
					// FIXME
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		const goldenFullTree = {
			mainTree: {
				nodes: {
					account: 'project_username',
					project: '58de3562-6755-44cf-90f4-860b20bb73b5',
					type: 'transformation',
					name: 'Default',
					path: '79abdcdf-0bc3-4231-877d-0f52940cf313',
					_id: '79abdcdf-0bc3-4231-877d-0f52940cf313',
					shared_id: '6255829e-d2d9-42a2-98ef-5686f96ef098',
					children: [
						{
							account: 'project_username',
							project: '58de3562-6755-44cf-90f4-860b20bb73b5',
							type: 'transformation',
							name: '(IfcBuilding)',
							path: '79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1',
							_id: '9aba7d8c-b74f-43ea-ad4a-9a8568855fb1',
							shared_id: '6d797609-3075-47d7-9bf2-404265334570',
							children: [{
								account: 'project_username',
								project: '58de3562-6755-44cf-90f4-860b20bb73b5',
								type: 'transformation',
								name: 'Datum / Site Model',
								path: '79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163',
								_id: 'f730c223-6a81-450b-ab71-d06a2e355163',
								shared_id: '5e6a3450-b037-4985-8530-da3947a18a02',
								children: [{
									account: 'project_username',
									project: '58de3562-6755-44cf-90f4-860b20bb73b5',
									type: 'mesh',
									name: 'LegoRoundTree:LegoRoundTree:302403',
									path: '79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163__d4c277e7-aa4a-4240-b600-b53cda81ebb1',
									_id: 'd4c277e7-aa4a-4240-b600-b53cda81ebb1',
									shared_id: '03e8eda3-2023-49c3-bfec-bc5b7883f425',
									meta: [ '4f677dbc-08af-4b69-9141-99c63b3fca9c' ],
									toggleState: 'visible'
								}],
								meta: [ 'fb7dcfc7-7ea1-4ddc-9e63-74cbee29a710' ],
								toggleState: 'visible'
							}],
							meta: [ '3cf79748-bb90-4894-83ed-5ea396c106e3' ],
							toggleState: 'visible'
						}
					],
					meta: [ 'b53cae95-49a3-4cc6-b92a-49d530c01bec' ],
					toggleState: 'parentOfInvisible'
				},
				idToName: {
					'd4c277e7-aa4a-4240-b600-b53cda81ebb1': 'LegoRoundTree:LegoRoundTree:302403',
					'9aba7d8c-b74f-43ea-ad4a-9a8568855fb1': '(IfcBuilding)',
					'f730c223-6a81-450b-ab71-d06a2e355163': 'Datum / Site Model',
					'79abdcdf-0bc3-4231-877d-0f52940cf313': 'Default'
				},
				idToPath: {
					'd4c277e7-aa4a-4240-b600-b53cda81ebb1':
					'79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163__d4c277e7-aa4a-4240-b600-b53cda81ebb1',
					'9aba7d8c-b74f-43ea-ad4a-9a8568855fb1':
					'79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1',
					'f730c223-6a81-450b-ab71-d06a2e355163':
					'79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163',
					'79abdcdf-0bc3-4231-877d-0f52940cf313': '79abdcdf-0bc3-4231-877d-0f52940cf313'
				}
			},
			subTrees: []
		};

		it("get tree should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/fulltree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFullTree);
					done(err);
				});
		});

		it("get tree with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/fulltree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFullTree);
					done(err);
				});
		});

		const goldenFedTree = {
			mainTree: {
				nodes: {
					account: 'project_username',
					project: 'b667ab4c-7e71-4db9-9f85-cb81437aaf43',
					type: 'transformation',
					name: '<root>',
					path: 'd1fd4d49-f7f7-44ca-9363-de54862bd829',
					_id: 'd1fd4d49-f7f7-44ca-9363-de54862bd829',
					shared_id: 'f7ebe36c-6b48-42a7-99fd-628d8e8e4a59',
					children: [
						{
							account: 'project_username',
							project: 'b667ab4c-7e71-4db9-9f85-cb81437aaf43',
							type: 'transformation',
							name: 'project_username:58de3562-6755-44cf-90f4-860b20bb73b5',
							path: 'd1fd4d49-f7f7-44ca-9363-de54862bd829__42e0ef3e-4356-4efb-a62f-4dfd0c59b472',
							_id: '42e0ef3e-4356-4efb-a62f-4dfd0c59b472',
							shared_id: '75a1c45a-7a75-4423-a903-383c5c90a627',
							children: [{
								account: 'project_username',
								project: 'b667ab4c-7e71-4db9-9f85-cb81437aaf43',
								type: 'ref',
								name: '58de3562-6755-44cf-90f4-860b20bb73b5',
								path: 'd1fd4d49-f7f7-44ca-9363-de54862bd829__42e0ef3e-4356-4efb-a62f-4dfd0c59b472__f7cdf78d-728f-4eb3-b0ea-e549f4be3f52',
								_id: 'f7cdf78d-728f-4eb3-b0ea-e549f4be3f52',
								shared_id: 'edfa5f05-6dde-43f1-ae50-110d3b200065',
								toggleState: 'visible'
							}],
							toggleState: 'visible'
						},
						{
							account: 'project_username',
							project: 'b667ab4c-7e71-4db9-9f85-cb81437aaf43',
							type: 'transformation',
							name: 'project_username:2d4a6208-6847-4a25-9d9e-097a63f2de93',
							path: 'd1fd4d49-f7f7-44ca-9363-de54862bd829__d55308e2-db8c-4cc5-bfa1-b37a8c6fae08',
							_id: 'd55308e2-db8c-4cc5-bfa1-b37a8c6fae08',
							shared_id: '9e9e6678-c607-40d8-8906-cc86faf00b29',
							children: [{
								account: 'project_username',
								project: 'b667ab4c-7e71-4db9-9f85-cb81437aaf43',
								type: 'ref',
								name: '2d4a6208-6847-4a25-9d9e-097a63f2de93',
								path: 'd1fd4d49-f7f7-44ca-9363-de54862bd829__d55308e2-db8c-4cc5-bfa1-b37a8c6fae08__5e09a8c7-cb73-4f60-9ef2-df069ef393b6',
								_id: '5e09a8c7-cb73-4f60-9ef2-df069ef393b6',
								shared_id: 'dab1cb6c-89b2-4f12-ac81-87d7cd519b43',
								toggleState: 'visible'
							}],
							toggleState: 'visible'
						}
					],
					toggleState: 'parentOfInvisible'
				},
				idToName: {
					'd1fd4d49-f7f7-44ca-9363-de54862bd829': '<root>',
					'd55308e2-db8c-4cc5-bfa1-b37a8c6fae08': 'project_username:2d4a6208-6847-4a25-9d9e-097a63f2de93',
					'f7cdf78d-728f-4eb3-b0ea-e549f4be3f52': '58de3562-6755-44cf-90f4-860b20bb73b5',
					'42e0ef3e-4356-4efb-a62f-4dfd0c59b472': 'project_username:58de3562-6755-44cf-90f4-860b20bb73b5',
					'5e09a8c7-cb73-4f60-9ef2-df069ef393b6': '2d4a6208-6847-4a25-9d9e-097a63f2de93'
				},
				idToPath: {
					'd1fd4d49-f7f7-44ca-9363-de54862bd829': 'd1fd4d49-f7f7-44ca-9363-de54862bd829',
					'd55308e2-db8c-4cc5-bfa1-b37a8c6fae08':
					'd1fd4d49-f7f7-44ca-9363-de54862bd829__d55308e2-db8c-4cc5-bfa1-b37a8c6fae08',
					'f7cdf78d-728f-4eb3-b0ea-e549f4be3f52':
					'd1fd4d49-f7f7-44ca-9363-de54862bd829__42e0ef3e-4356-4efb-a62f-4dfd0c59b472__f7cdf78d-728f-4eb3-b0ea-e549f4be3f52',
					'42e0ef3e-4356-4efb-a62f-4dfd0c59b472':
					'd1fd4d49-f7f7-44ca-9363-de54862bd829__42e0ef3e-4356-4efb-a62f-4dfd0c59b472',
					'5e09a8c7-cb73-4f60-9ef2-df069ef393b6':
					'd1fd4d49-f7f7-44ca-9363-de54862bd829__d55308e2-db8c-4cc5-bfa1-b37a8c6fae08__5e09a8c7-cb73-4f60-9ef2-df069ef393b6'
				}
			},
			subTrees: [
				{
					_id: '5e09a8c7-cb73-4f60-9ef2-df069ef393b6',
					rid: 'cd561c86-de1a-482e-8f5d-89cfc49562e8',
					teamspace: 'project_username',
					model: '2d4a6208-6847-4a25-9d9e-097a63f2de93',
					url: '/project_username/2d4a6208-6847-4a25-9d9e-097a63f2de93/revision/cd561c86-de1a-482e-8f5d-89cfc49562e8/fulltree.json'
				},
				{
					_id: 'f7cdf78d-728f-4eb3-b0ea-e549f4be3f52',
					rid: 'f0fd8f0c-06e2-479b-b41a-a8873bc74dc9',
					teamspace: 'project_username',
					model: '58de3562-6755-44cf-90f4-860b20bb73b5',
					url: '/project_username/58de3562-6755-44cf-90f4-860b20bb73b5/revision/f0fd8f0c-06e2-479b-b41a-a8873bc74dc9/fulltree.json'
				}
			]
		};

		it("get tree from federation should succeed", function(done) {
			agent.get(`/${username}/${existingFed}/revision/master/head/fulltree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFedTree);
					done(err);
				});
		});

		const goldenModelProps = { properties: { hiddenNodes: [] }, subModels: [] };

		it("get model properties should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/modelProperties.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenModelProps);
					done(err);
				});
		});

		it("get model properties with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/modelProperties.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenModelProps);
					done(err);
				});
		});

		const goldenFedProps = {
			properties: { hiddenNodes: [] },
			subModels: [
				{
					account: 'project_username',
					model: '2d4a6208-6847-4a25-9d9e-097a63f2de93',
					hiddenNodes: [
						"a9014353-c563-4c8a-a641-b1b2bbcaa5c0",
						"c52f9bf0-0517-4f7a-979f-d815d0068c7e",
						"8619f67f-93ef-4ada-8cc8-2e72d4e21e3f",
						"a44e3ec3-928a-4d10-820a-0ec01b15e94d",
						"7cd728f3-0a22-45d6-9ca9-20e04c201942",
						"332f4f47-5d7f-420a-8b8b-b88bf36d9f7d",
						"67ae80b5-86fa-4926-adc3-a15c3c40875f",
						"c751a2bd-ff47-46d3-888a-46153e5939ac",
						"d556eae2-bebc-4000-9bed-ce79d823d99d",
						"3ee852e1-9125-49a8-875b-631b6120eb33"
					]
				}
			]
		};

		it("get model properties of federation should succeed", function(done) {
			agent.get(`/${username}/${existingFed}/revision/master/head/modelProperties.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFedProps);
					done(err);
				});
		});

		it("get tree paths should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/tree_path.json`)
				.expect(404, function(err, res) {
					// FIXME
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		it("get tree paths with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/tree_path.json`)
				.expect(404, function(err, res) {
					// FIXME
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		it("get JSON MPC should succeed", function(done) {
			const mpcId = "fafca0a1-be32-4326-b922-9987915f3ca0_unity";

			agent.get(`/${username}/${existingModel}/${mpcId}.json.mpc`)
				.expect(200, function(err, res) {
					expect(res.body.numberOfIDs).to.equal(1);
					expect(res.body.maxGeoCount).to.equal(1);
					expect(res.body.mapping).to.exist;
					done(err);
				});
		});
	});

	it("should be created successfully", function(done) {

		async.series([
			callback => {

				agent.post(`/${username}/model`)
					.send({ modelName: model, desc, type, unit, code, project })
					.expect(200, function(err ,res) {
						expect(res.body.name).to.equal(model);
						modelId = res.body.model;
						callback(err);
					});

			},
			callback => {
				agent.get(`/${username}/${modelId}.json`)
					.expect(200, function(err, res) {
						expect(res.body.desc).to.equal(desc);
						expect(res.body.type).to.equal(type);
						expect(res.body.properties.unit).to.equal(unit);
						expect(res.body.properties.code).to.equal(code);
						callback(err);
					});
			},

			callback => {
				agent.get(`/${username}.json`)
					.expect(200, function(err, res) {

						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find(pg => pg.name === project);
						expect(pg).to.exist;

						const myModel = pg.models.find(_model => _model.model === modelId);
						expect(myModel).to.exist;
						expect(myModel.name).to.equal(model);

						callback(err);
					});
			}
		] , err => done(err));

	});

	describe("Model name tests ", function() {
		const nameTest = function(modelName, expectSuccess, callback) {
			if(expectSuccess) {
				agent.post(`/${username}/model`)
					.send({ modelName, desc, type, unit, code, project })
					.expect(200, function(err ,res) {
						expect(res.body.name).to.equal(modelName);
						callback(err);
				});
			} else {
				agent.post(`/${username}/model`)
					.send({ modelName, desc, type, unit, code, project })
					.expect(responseCodes.INVALID_MODEL_NAME.status, function(err ,res) {
						expect(res.body.value).to.equal(responseCodes.INVALID_MODEL_NAME.value);
						callback(err);
				});
			}
		};
		it("blank test model name format should fail", function(done) {
			nameTest("", false, done);
		});

		it("plain test model name format should succeed", function(done) {
			nameTest("abc", true, done);
		});

		it("hyphens dashes and underscores in test model name format should succeed", function(done) {
			nameTest("123-_[/%4a",true, done);
		});

		it("non-ASCII characters should fail", function(done) {
			nameTest("失败",false, done);
		});

		it("long strings less than 120 characters in test model name format should succeed", function(done) {
			nameTest("aaaaaaaaaaaaaaaaaaaaa",true, done);
		});

		it("long strings more than 120 characters in test model name format should fail", function(done) {
			nameTest(
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaa"
			,false, done);
		});

	});

	describe("Search model tree", function(done) {
		const testModel = "2d4a6208-6847-4a25-9d9e-097a63f2de93";

		it("should succeed", function(done) {
			agent.get(`/${username}/${testModel}/revision/master/head/searchtree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.be.an("array").and.to.have.length(683);
					done(err);
				});
		});

		it("with searchString should succeed", function(done) {
			const goldenTreeItem = [{
				"_id": "64cd352f-60fe-4cd6-9a42-da2d5f3892b0",
				"name": "ComponentName:204",
				"account": "project_username",
				"model": "2d4a6208-6847-4a25-9d9e-097a63f2de93"
			}];

			agent.get(`/${username}/${testModel}/revision/master/head/searchtree.json?searchString=204`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenTreeItem);
					done(err);
				});
		});

		it("with searchString should succeed", function(done) {
			const goldenTreeItem = [{
				"_id": "64cd352f-60fe-4cd6-9a42-da2d5f3892b0",
				"name": "ComponentName:204",
				"account": "project_username",
				"model": "2d4a6208-6847-4a25-9d9e-097a63f2de93"
			}];

			agent.get(`/${username}/${testModel}/revision/master/head/searchtree.json?searchString=ComponentName:20`)
				.expect(200, function(err, res) {
					expect(res.body).to.be.an("array").and.to.have.length(10);
					done(err);
				});
		});

		it("with non-matching searchString should succeed", function(done) {
			agent.get(`/${username}/${testModel}/revision/master/head/searchtree.json?searchString=nomatches`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal([]);
					done(err);
				});
		});

		it("with non-existent model should fail", function(done) {
			agent.get(`/${username}/invalidModel/revision/master/head/searchtree.json`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.RESOURCE_NOT_FOUND.value);
					done(err);
				});
		});
	});

	it("model added to a project should be listed on top level models array", function(done) {

		agent.get(`/${username}.json`)
			.expect(200, function(err, res) {

				const account = res.body.accounts.find(account => account.account === username);
				expect(account).to.exist;

				let myModel = account.models.find(_model => _model.model === model);
				expect(myModel).to.not.exist;

				myModel = account.fedModels.find(_model => _model.model === model);
				expect(myModel).to.not.exist;

				done(err);
			});
	});

	it("should fail if project supplied is not found", function(done) {

		agent.post(`/${username}/model`)
			.send({ modelName: "model2", desc, type, unit, code, project: "noexist" })
			.expect(404, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});

	});

	it("should fail if no unit specified", function(done) {

		agent.post(`/${username}/model`)
			.send({ desc, type, project, modelName: "model3" })
			.expect(400, function(err ,res) {

				expect(res.body.value).to.equal(responseCodes.MODEL_NO_UNIT.value);
				done(err);

			});
	});

	it("update model code with invalid format", function(done) {

		function updateModelCode(code, done) {

			const model = "project4";

			agent.put(`/${username}/${model}/settings`)
				.send({code}).expect(400, function(err ,res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_MODEL_CODE.value);
					done(err);
				});
		}

		async.series([
			function(done) {
				updateModelCode("$", done);
			},
			function(done) {
				updateModelCode("zudmylysljfa31fx0aww1d8l3gkq6r82hplcdfx7zhslrmz6ygppj1fhg4e", done);
			}
		], done);

	});

	it("update settings should be successful", function(done) {

		const body = {

			unit: "cm",
			code: "00222"
		};

		const expectedReturn = {

			unit: "cm",
			code: "00222"

		};

		const mymodel = "project6";
		agent.put(`/${username}/${mymodel}/settings`)
			.send(body).expect(200, function(err ,res) {

				expect(res.body).to.deep.equal(expectedReturn);

				if(err) {
					return done(err);
				}

				agent.get(`/${username}/${mymodel}.json`)
					.expect(200, function(err, res) {
						expect(res.body.properties).to.deep.equal(expectedReturn);
						done(err);
					});

			});
	});

	it("should return error message if model name already exists", function(done) {

		const model = "project7";

		agent.post(`/${username}/model`)
			.send({ desc, type, unit, project, modelName: model })
			.expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.MODEL_EXIST.value);
				done(err);
			});
	});

	it("should succeed if model name contains spaces", function(done) {

		const spacedName = "you are genius";
		agent.post(`/${username}/model`)
			.send({ desc, type, project, unit, modelName: spacedName })
			.expect(200, function(err ,res) {
				expect(res.body.name).to.equal(spacedName);
				done(err);
			});
	});

	it("should return error if creating a model in a database that doesn't exists", function(done) {

		agent.post(`/${username}_someonelese/model`)
			.send({ modelName: "testmodel", desc, type, unit, project })
			.expect(404, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.RESOURCE_NOT_FOUND.value);
				done(err);
			});
	});

	describe("Setting a default viewpoint", function() {
		before(function(done) {
			async.series([
				callback => {
					agent.post("/logout").send({}).expect(200, callback);
				},
				callback => {
					agent.post("/login").send({
						username, password
					}).expect(200, callback);
				}
			], done);
		});

		const testModel = "2d4a6208-6847-4a25-9d9e-097a63f2de93";
		const viewId = "df8fa4a0-c2ba-11ea-8373-eb03ef03362f";
		it("setting a valid view Id as default viewpoint should succeed", function (done) {
			async.series([
				callback => {
					agent.put(`/${username}/${testModel}/settings`)
						.send({defaultView: viewId})
						.expect(200, callback);
				},
				callback => {
					agent.get(`/${username}/${testModel}.json`)
						.expect(200, (err, res) => {
							expect(res.body.defaultView).to.deep.equal({
								id: viewId,
								name: "fdgdfg"
							});
							callback(err);
						});
				}
			], done);
		});

		it("setting an invalid view Id as default viewpoint should fail", function (done) {
			agent.put(`/${username}/${testModel}/settings`)
				.send({defaultView: "df8fa4a0-c2ba-11ea-8373-eb03ef03362a"})
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.VIEW_NOT_FOUND.value);
					done(err);
				});
		});


		it("removing a view when it's currently set as default should fail", function (done) {
			agent.delete(`/${username}/${testModel}/viewpoints/${viewId}`)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.CANNOT_DELETE_DEFAULT_VIEW.value);
					done(err);
				});
		});

		it("setting null as default viewpoint to reset default viewpoint should succeed", function (done) {
			async.series([
				callback => {
					agent.put(`/${username}/${testModel}/settings`)
						.send({defaultView: null})
						.expect(200, callback);
				},
				callback => {
					agent.get(`/${username}/${testModel}.json`)
						.expect(200, (err, res) => {
							expect(res.body.defaultView).to.equal(undefined);
							callback(err);
						});
				}
			], done);
		});

	});

	describe("Download latest file", function() {

		const username = "testing";
		const password = "testing";
		const model = "testproject";

		before(function(done) {
			async.series([
				function logout(done) {
					agent.post("/logout").send({}).expect(200, done);
				},
				function login(done) {
					agent.post("/login").send({
						username, password
					}).expect(200, done);
				}
			], done);
		});

		it("should succeed and get the latest file", function(done) {
			agent.get(`/${username}/${model}/download/latest`).expect(200, function(err, res) {

				expect(res.headers["content-disposition"]).to.equal("attachment;filename=3DrepoBIM.obj");

				done(err);
			});
		});

	});

	describe("Delete a model", function() {

		const username = "projectshared";
		const password = "password";
		const model = "sample_project";

		const collaboratorUsername = "testing";

		before(function(done) {
			async.series([
				function logout(done) {
					agent.post("/logout").send({}).expect(200, done);
				},
				function login(done) {
					agent.post("/login").send({
						username, password
					}).expect(200, done);
				}

			], done);

		});

		it("should succeed", function(done) {
			agent.delete(`/${username}/${model}`).expect(200, done);
		});

		it("should fail if delete again", function(done) {
			agent.delete(`/${username}/${model}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.RESOURCE_NOT_FOUND.value);
				done(err);
			});
		});

		it("should remove setting in settings collection", function() {
			return ModelSetting.findById({account: username, model: model}, model).then(setting => {
				expect(setting).to.be.null;
			});
		});

		it("should be removed from collaborator's model listing", function(done) {

			const agent2 = request.agent(server);

			async.series([
				callback => {
					agent2.post("/login").send({ username: "testing", password: "testing" }).expect(200, callback);
				},
				callback => {
					agent2.get("/testing.json").expect(200, function(err, res) {

						const account = res.body.accounts.find(account => account.account === username);
						const modelExists = account.models.find(m => m.model === model);

						expect(modelExists).to.not.exist;

						// const mm = account.models.find(m => m.model === model);
						// expect(mm).to.not.exist;

						callback(err);
					});
				}
			], done);

		});

		it("should be removed from model group", function(done) {
			agent.get(`/${username}.json`).expect(200, function(err, res) {

				const account = res.body.accounts.find(account => account.account === username);
				expect(account).to.exist;

				const pg = account.projects.find(pg => pg.name === "project1");
				expect(pg).to.exist;

				const myModel = pg.models.find(_model => _model.model === "sample_project");
				expect(myModel).to.not.exist;

				done(err);
			});
		});

	});
});
