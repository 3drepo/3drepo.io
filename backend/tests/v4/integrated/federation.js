"use strict";

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const { queue: {purgeQueues}} = require("../../v5/helper/services");
const SessionTracker = require("../../v4/helpers/sessionTracker")
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const { templates: responseCodesV5 } = require("../../../src/v5/utils/responseCodes");
const C = require("../../../src/v4/constants");
const async = require("async");
const User = require("../../../src/v4/models/user");
const config = require("../../../src/v4/config");
const fs = require("fs");
const unit = "m";

describe("Federated Model", function () {

	let server;
	let agent;
	const username = "fed";
	const password = "123456";
	const subModels = ["proj1", "f4ec3efb-3de8-4eeb-81a1-1c62cb2fed40"];
	const desc = "desc";
	const type = "type";
	const fedModelName = "fedproj";
	const project = "project1";
	let fedModelId;

	before(async() => {
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
		this.timeout(5000);

		let corId, appId;

		agent.post(`/${username}/model`)
			.send({
				modelName : `${fedModelName}`,
				desc,
				type,
				unit,
				project,
				subModels:[{
					"database": username,
					"model": subModels[0]
				}]
			})
			.expect(200, function(err ,res) {

				if(err) {
					return done(err);
				}

				expect(res.body.name).to.equal(fedModelName);
				fedModelId = res.body.model;

				async.series([
					done => {
						agent.get(`/${username}/${fedModelId}.json`)
							.expect(200, function(err, res) {
								expect(res.body.desc).to.equal(desc);
								expect(res.body.type).to.equal(type);
								done(err);
							});
					},
					done => {
						agent.get(`/${username}.json`)
							.expect(200, function(err, res) {
								const account = res.body.accounts.find(a => a.account === username);
								const proj = account.projects.find(p => p.name === project);
								const fed = proj.models.find(m => m.model === fedModelId);
								expect(fed.federate).to.equal(true);
								done(err);
							});
					}
				], err => {
					done(err);
				});

			});

	});

	it("should be created successfully even if no sub models are specified", function(done) {
		const emptyFed = "emptyFed";
		let emptyFedId;

		agent.post(`/${username}/model`)
			.send({
				modelName: emptyFed,
				desc,
				type,
				unit,
				project,
				subModels:[]
			})
			.expect(200, function(err ,res) {

				if(err) {
					return done(err);
				}

				expect(res.body.name).to.equal(emptyFed);
				emptyFedId = res.body.model;

				async.series([
					done => {
						agent.get(`/${username}/${emptyFedId}.json`)
							.expect(200, function(err, res) {
								expect(res.body.desc).to.equal(desc);
								expect(res.body.type).to.equal(type);
								done(err);
							});
					},
					done => {
						agent.get(`/${username}.json`)
							.expect(200, function(err, res) {
								const account = res.body.accounts.find(a => a.account === username);
								const proj = account.projects.find(p => p.name === project);
								const fed = proj.models.find(m => m.model === fedModelId);
								expect(fed.federate).to.equal(true);
								done(err);
							});
					}
				], err => {
					done(err);
				});

			});
	});

	it("should fail if create federation using existing model name (fed or model)", function(done) {

		agent.post(`/${username}/model`)
			.send({
				modelName: subModels[0],
				desc,
				type,
				unit,
				project,
				subModels:[{
					"database": username,
					"model": subModels[0]
				}]
			})
			.expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.MODEL_EXIST.value);
				done(err);

			});
	});

	it("should fail if create federation using invalid model name", function(done) {

		agent.post(`/${username}/model`)
			.send({
				modelName: "错误",
				desc,
				type,
				project,
				subModels:[{
					"database": "testing",
					"model": "testproject"
				}]
			})
			.expect(400, function(err ,res) {

				expect(res.body.value).to.equal(responseCodes.INVALID_MODEL_NAME.value);
				done(err);

			});
	});

	it("should fail if create federation from models in a different database", function(done) {

		agent.post(`/${username}/model`)
			.send({
				modelName: "badfed",
				desc,
				type,
				unit,
				project,
				subModels:[{
					"database": "testing",
					"model": "testproject"
				}]
			})
			.expect(400, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.FED_MODEL_IN_OTHER_DB.value);
				done(err);

			});
	});

	it("should accept only one model if models are duplicated", function(done) {

		this.timeout(5000);

		let corId, appId;

		purgeQueues().then(() => {
			agent.post(`/${username}/model`)
				.send({
					modelName: "dupfed",
					desc,
					type,
					unit,
					project,
					subModels:[{
						"database": username,
						"model": subModels[0]
					}, {
						"database": username,
						"model": subModels[0]
					}]
				})
				.expect(200, function(err ,res) {
					done(err);
				});
		});

	});

	it("should fail if create fed of fed", function(done) {
		agent.post(`/${username}/model`)
			.send({
				modelName: "fedfed",
				desc,
				type,
				unit,
				project,
				subModels:[{
					"database": username,
					"model": fedModelId
				}]
			})
			.expect(400, function(err ,res) {

				expect(res.body.value).to.equal(responseCodes.FED_MODEL_IS_A_FED.value);
				done(err);

			});
	});

	it("update should fail if model is not a fed", function(done) {

		agent.put(`/${username}/${subModels[0]}`)
			.send({
				desc,
				type,
				unit,
				subModels:[{
					"database": username,
					"model": subModels[0]
				}]
			})
			.expect(responseCodesV5.invalidArguments.status, function(err ,res) {
				expect(res.body.code).to.equal(responseCodesV5.invalidArguments.code);
				done(err);

			});
	});

	it("update should fail if model does not exist", function(done) {
		agent.put(`/${username}/nonexistmodel`)
			.send({
				desc,
				type,
				unit,
				subModels:[{
					"database": username,
					"model": subModels[0]
				}]
			})
			.expect(404, function(err ,res) {
				expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.code);
				done(err);

			});
	});

	it("update should succeed if model is a federation", function(done) {
		this.timeout(5000);

		let corId, appId;

		agent.put(`/${username}/${fedModelId}`)
			.send({
				desc,
				type,
				unit,
				subModels:[{
					"database": username,
					"model": subModels[1]
				}]
			})
			.expect(200, function(err ,res) {
				return done(err);
			});
	});

	it("should fail to delete a model that is a sub model of another federation", function(done) {
		const model = "f4ec3efb-3de8-4eeb-81a1-1c62cb2fed40";
		agent.delete(`/${username}/${model}`)
			.send({})
			.expect(400, function(err, res) {

				expect(err).to.be.null;
				expect(res.body.value).to.equal(responseCodes.MODEL_IS_A_SUBMODEL.value);
				done();
			});
	});
});
