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


const SessionTracker = require("../../v4/helpers/sessionTracker")
const { queue: {purgeQueues}} = require("../../v5/helper/services");
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");
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

	it("should fail as enpoint has been decommissioned", () => {
		agent.post(`/${username}/model`)
					.send({ modelName: model, desc, type, unit, code, project })
					.expect(410, function(err ,res) {
						expect(res.body.code).to.equal("ENDPOINT_DECOMMISSIONED");
					})
	});

	describe("Model name tests ", function() {

		it("should fail as enpoint has been decommissioned", () => {
			agent.post(`/${username}/model`)
						.send({ modelName: model, desc, type, unit, code, project })
						.expect(410, function(err ,res) {
							expect(res.body.code).to.equal("ENDPOINT_DECOMMISSIONED");
						})
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
					expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.code);
					done(err);
				});
		});
	});

	it("should fail as enpoint has been decommissioned", () => {
		agent.post(`/${username}/model`)
					.send({ modelName: model, desc, type, unit, code, project })
					.expect(410, function(err ,res) {
						expect(res.body.code).to.equal("ENDPOINT_DECOMMISSIONED");
					})
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


	it("should not be able to access the endpoint- endpoint decommissioned", () => {
		agent.post(`/${username}/model`)
					.send({ modelName: model, desc, type, unit, code, project })
					.expect(410, (err, res) => {
						expect(res.body.code).to.equal("ENDPOINT_DECOMMISSIONED")
					})
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
				expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.code);
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
