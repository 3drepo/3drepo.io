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
						expect(res.body.name).to.equal(model);
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
			nameTest("a", true, done);
			nameTest("ab", true, done);
			nameTest("abc", true, done);
		});

		it("hyphens dashes and underscores in test model name format should succeed", function(done) {
			nameTest("123-4a",true, done);
			nameTest("123_4a",true, done);
			nameTest("123-_4A",true, done);
			nameTest("aasa[",true, done);
			nameTest("aasa/",true, done);
			nameTest("aasa%",true, done);
		});

		it("non-ASCII characters should fail", function(done) {
			nameTest("失败",false, done);
			nameTest("😕",false, done);
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
				updateModelCode("123456", done);
			}
		], done);

	});

	it("update issues type with duplicate values", function(done) {

		const model = "project5";

		agent.put(`/${username}/${model}/settings`)
			.send({
				topicTypes: ["For Info", "for info"]
			}).expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE.value);
				done(err);
			});
	});

	it("update settings should be successful", function(done) {

		const body = {

			unit: "cm",
			code: "00222",
			topicTypes: ["For Info", "3D Repo", "Vr"]

		};

		const expectedReturn = {

			unit: "cm",
			code: "00222",
			topicTypes: [{
				label: "For Info",
				value: "for_info"
			}, {
				label: "3D Repo",
				value: "3d_repo"
			}, {
				label: "Vr",
				value: "vr"
			}]

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

	it("should return error if creating a model in a database that doesn't exists or not authorized for", function(done) {

		agent.post(`/${username}_someonelese/model`)
			.send({ modelName: "testmodel", desc, type, unit, project })
			.expect(401, function(err ,res) {
				done(err);
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
				expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.value);
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
						expect(account).to.not.exist;

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
