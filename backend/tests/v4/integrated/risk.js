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
const SessionTracker = require("../../v4/helpers/sessionTracker")
const { createAppAsync } = require("../../../src/v4/services/api.js");
const { createRisk } = require("../helpers/risks.js");
const { v5Path } = require("../../../src/interop")
const { templates: { endpointDecommissioned } } = require(`${v5Path}/utils/responseCodes.js`);
const { generateRandomNumber } = require("../../v5/helper/dataGen");


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
	const risk = Object.assign({ "name": "Risk test" }, baseRisk);
	const levelOfRisk = (0 === risk.likelihood && 0 === risk.consequence) ? 0 : -1;
	const riskId = generateRandomNumber();
	const viewpointId = generateRandomNumber();
	const revisionId = generateRandomNumber();


	const formatReference = (riskId) => {
		return `${username}::${model}::${riskId}`;
	}

	beforeAll(async function () {
		const app = await createAppAsync();
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

	afterAll(function (done) {
		server.close(function () {
			console.log("API test server is closed");
			done();
		});
	});

	describe("Creating a risk", function () {
		it("should return a routeDecommissioned message", function (done) {
			agent.post(`/${username}/${model}/risks`)
				.send(risk)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
		it("should return a routeDecommissioned message via revision path", function (done) {
			agent.post(`/${username}/${model}/revisions/${revisionId}/risks`)
				.send(risk)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Getting a risk by riskId", function () {
		it("should return a routeDecommissioned message", function (done) {
			agent.get(`/${username}/${model}/risks/${riskId}`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Getting a risk by thumbnail", function () {
		it("should return a routeDecommissioned message", function (done) {
			agent.get(`/${username}/${model}/risks/${riskId}/thumbnail`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Getting a list of risks", function () {
		it("should return a routeDecommissioned message", function (done) {
			agent.get(`/${username}/${model}/risks`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Getting a risk screenshot", function () {
		it("should return a routeDecommissioned message on regular screenshot request", function (done) {
			agent.get(`/${username}/${model}/risks/${riskId}/viewpoints/${viewpointId}/screenshot`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
		it("should return a routeDecommissioned message on low resolution screenshot request", function (done) {
			agent.get(`/${username}/${model}/risks/${riskId}/viewpoints/${viewpointId}/screenshotSmall.png`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Getting revision risks", function () {
		it("should return a routeDecommissioned message", function (done) {
			agent.get(`/${username}/${model}/revisions/${revisionId}/risks`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Getting risks as HTML", function () {
		it("should return a routeDecommissioned message via risk path", function (done) {
			agent.get(`/${username}/${model}/risks.html`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
		it("should return a routeDecommissioned message via revision risks path", function (done) {
			agent.get(`/${username}/${model}/revisions/${revisionId}/risks.html`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Update risk", function () {
		it("should return a routeDecommissioned message", function (done) {
			agent.patch(`/${username}/${model}/risks/${riskId}`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
		it("should return a routeDecommissioned message when doing it via revision path", function (done) {
			agent.patch(`/${username}/${model}/revisions/${revisionId}/risks/${riskId}`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Comment and risks", function () {
		it("should return a routeDecommissioned message when adding a comment to a risk", function (done) {
			agent.post(`/${username}/${model}/risks/${riskId}/comments`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
		it("should return a routeDecommissioned message when deliting a comment to a risk", function (done) {
			agent.delete(`/${username}/${model}/risks/${riskId}/comments`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
	describe("Resources and risks", function () {
		it("should return a routeDecommissioned message when adding a resource to a risk", function (done) {
			agent.post(`/${username}/${model}/risks/${riskId}/resources`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
		it("should return a routeDecommissioned message when deleting a resource from a risk", function (done) {
			agent.delete(`/${username}/${model}/risks/${riskId}/resources`)
				.expect(endpointDecommissioned.status, (err, res) => {
					expect(res.body.message).toBe(endpointDecommissioned.message);
					return done(err);
				});
		});
	});
});
