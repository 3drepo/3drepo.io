/**
 *  Copyright (C) 2020 3D Repo Ltd
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

const SessionTracker = require("../../v4/helpers/sessionTracker")
const request = require("supertest");
const { createAppAsync } = require("../../../src/v4/services/api.js");
const { templates: responseCodesV5 } = require("../../../src/v5/utils/responseCodes");


describe("Mitigations", function () {

	let server;
	let agent;

	const username = "metaTest";
	const password = "123456";

	beforeAll(async function () {
		const app = await createAppAsync();

		await new Promise((resolve) => {
			server = app.listen(8080, function () {
				agent = request.agent(server);
				console.log("API test server is listening on port 8080!");
				resolve();
			});
		});
	});

	afterAll(function (done) {
		server.close(function () {
			console.log("API test server is closed");
			done();
		});
	});

	describe("Get mitigation criteria", function (done) {
		beforeAll(async function () {
			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});

		it("should return an endpoint decommissioned error", function (done) {
			agent.get(`/${username}/mitigations/criteria`)
				.expect(responseCodesV5.endpointDecommissioned.status, function (err, res) {
					expect(res.body.message).toBe(responseCodesV5.endpointDecommissioned.message);
					done(err);
				});
		});

	});

	describe("Find mitigation suggestions", function (done) {
		beforeAll(async function () {
			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});


		it("should return an endpoint decommissioned error", function (done) {
			agent.post(`/${username}/mitigations`)
				.send({})
				.expect(responseCodesV5.endpointDecommissioned.status, function (err, res) {
					expect(res.body.message).toBe(responseCodesV5.endpointDecommissioned.message);
					done(err);
				});
		});
	});
});
