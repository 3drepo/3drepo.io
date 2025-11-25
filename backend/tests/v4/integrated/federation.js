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
const { createAppAsync } = require("../../../src/v4/services/api.js");
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
		const app = await createAppAsync();
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

	it("should not be able to create the model - endpoint decommissioned", function(done) {
		this.timeout(5000);

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
			.expect(410, (err, res) => {
				expect(res.body.code).to.equal("ENDPOINT_DECOMMISSIONED")
				done(err)
			})
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
