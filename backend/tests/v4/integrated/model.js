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


const SessionTracker = require("../../v5/helper/sessionTracker")
const { queue: {purgeQueues}} = require("../../v5/helper/services");
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes.js");
const {templates: responseCodesV5} = require("../../../src/v5/utils/responseCodes");
const async = require("async");
const ModelSetting = require("../../../src/v4/models/modelSetting");
const User = require("../../../src/v4/models/user");
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


	before(async function() {
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log("API test server is listening on port 8080!");
				resolve();
			});

		});


		agent = SessionTracker(request(server));
		await agent.login(username, password);
	});


	after(function(done) {
		purgeQueues().then(() => {
			server.close(function() {
				console.log("API test server is closed");
				done();
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
					expect(res.body.code).to.equal(responseCodesV5.modelNotFound.code);
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

	it("get helicopter speed should succeed", function(done) {
		const mymodel = "project6";

		agent.get(`/${username}/${mymodel}/settings/heliSpeed`)
			.expect(200, function(err, res) {
				expect(res.body.heliSpeed).to.equal(1);
				done(err);
			});
	});

	it("update helicopter speed should succeed", function(done) {
		const mymodel = "project6";
		const newSpeed = {
			heliSpeed: 3
		};

		async.series([
			function(done) {
				agent.put(`/${username}/${mymodel}/settings/heliSpeed`)
					.send(newSpeed)
					.expect(200, done);
			},
			function(done) {
				agent.get(`/${username}/${mymodel}/settings/heliSpeed`)
					.expect(200, function(err, res) {
						expect(res.body.heliSpeed).to.equal(newSpeed.heliSpeed);
						done(err);
					});
			}
		], done);
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
		let testAgent;

		before(async function() {
			testAgent = SessionTracker(request(server));
			await testAgent.login(username, password);
		});

		it("should succeed and get the latest file", function(done) {
			testAgent.get(`/${username}/${model}/download/latest`).expect(200, function(err, res) {

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
		let testAgent;

		before(async function() {
			testAgent = SessionTracker(request(server));
			await testAgent.login(username, password);
		});

		it("should succeed", function(done) {
			testAgent.delete(`/${username}/${model}`).expect(200, done);
		});

		it("should fail if delete again", function(done) {
			testAgent.delete(`/${username}/${model}`).expect(404, function(err, res) {
				expect(res.body.code).to.equal(responseCodesV5.modelNotFound.code);
				done(err);
			});
		});

		it("should be removed from collaborator's model listing", async function() {

			const agent2 = SessionTracker(request(server));
			await agent2.login("testing", "testing");

			const {body} =  await agent2.get("/testing.json").expect(200);

			const account = body.accounts.find(account => account.account === username);
			const modelExists = account.models.find(m => m.model === model);

			expect(modelExists).to.not.exist;
		});

		it("should be removed from model group", function(done) {
			testAgent.get(`/${username}.json`).expect(200, function(err, res) {

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
