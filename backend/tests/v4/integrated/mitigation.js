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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const async = require("async");
const responseCodes = require("../../../src/v4/response_codes");

describe("Mitigations", function () {

	let server;
	let agent;
	const timeout = 30000;

	const username = "metaTest";
	const password = "123456";

	const fakeTeamspace = "fakeTeamspace";
	const notMemberOfTeamspace = "fed";
	const collaboratorTeamspace = "teamSpace1";

	const goldenCriteria = {
		"mitigation_stage": [
			"0",
			"Detail Design",
			"Pre construction",
			"Preliminary Design",
			"Site work, Temp Works, Change control"
		],
		"mitigation_type": [
			"0",
			"Control by subsequent design",
			"Eliminate",
			"Inform",
			"Reduce"
		],
		"category": [
			"0",
			"Commercial Issue",
			"Environmental Issue",
			"Fall-From open edge",
			"Health - Material effect",
			"Health - Mechanical effect",
			"Material-Asbestos",
			"Material-Dust",
			"Material-Lead",
			"Material-Strength",
			"Other Issue",
			"Physical-Collapse",
			"Physical-Connection",
			"Physical-Edge",
			"Physical-Fragile",
			"Physical-Length",
			"Physical-Opening",
			"Physical-Size",
			"Physical-Spacing",
			"Physical-Weight",
			"Safety Issue - Event",
			"Safety Issue - Fall",
			"Safety Issue - Handling",
			"Safety Issue - Public",
			"Safety Issue - Struck",
			"Safety Issue - Trapped",
			"Social Issue",
			"Task-Change Design",
			"Task-Cleaning machinery",
			"Task-Excavation",
			"Task-Lifting",
			"Task-Manual Handling",
			"Task-Site Management",
			"Task-Temporary structure",
			"Task-Welding",
			"Unknown"
		],
		"location_desc": [
			"0",
			"High Level-Between Joist",
			"High Level-Near Edge",
			"High Level-Near Opening",
			"High Level-Near Opening - Shaft",
			"High Level-Near Opening - Stairwell",
			"High Level-Scaffolds",
			"Site logistics-Confined area",
			"Site logistics-Crane area",
			"Site logistics-Excavation area",
			"Site logistics-Exposed area",
			"Site logistics-Pump area",
			"Site logistics-Traffic route"
		],
		"element": [
			"0",
			"Ceiling",
			"Cladding",
			"Column",
			"External Wall",
			"Flat roof",
			"Frame/beam",
			"Internal Wall",
			"Isolated foundation",
			"Lift",
			"Mechanical equipment",
			"Not Applicable",
			"Pitched roof",
			"Raft foundation",
			"Ramp",
			"Slab",
			"Stair",
			"Temporary structure",
			"Wall foundation",
			"Window"
		],
		"risk_factor": [
			"0",
			"Material-Asbestos",
			"Material-Dust",
			"Material-Lead",
			"Material-Strength",
			"Physical-Collapse",
			"Physical-Connection",
			"Physical-Edge",
			"Physical-Fragile",
			"Physical-Length",
			"Physical-Opening",
			"Physical-Size",
			"Physical-Spacing",
			"Physical-Weight",
			"Task-Change Design",
			"Task-Cleaning machinery",
			"Task-Excavation",
			"Task-Lifting",
			"Task-Manual Handling",
			"Task-Site Management",
			"Task-Temporary structure",
			"Task-Welding"
		],
		"scope": [
			"Access (onto and within site)",
			"Atria",
			"Bridge construction",
			"Bridge maintenance",
			"Cleaning of buildings",
			"Deep basements and shafts",
			"Electrical services",
			"External Cladding",
			"General civil engineering, including small works",
			"General concrete",
			"General excavation",
			"General steelwork",
			"Ground stabilisation",
			"In situ concrete",
			"Lifts, escalators and auto walks",
			"Masonry",
			"Mechanical services",
			"Pilling",
			"Pipes and cables",
			"Precast concrete",
			"Prestressed, post tensioned concrete",
			"Public health services",
			"Railways, working adjacent to, maintenance of",
			"Refurbishment of existing buildings",
			"Retaining walls",
			"Roads, working adjacent to, maintenance of",
			"Roof coverings and finishes",
			"Site Layout",
			"Site clearance and demolition",
			"Site investigation and remediation",
			"Stability and erection of structural steelwork",
			"Surface coating and finishes",
			"Surrounding environment",
			"Timber",
			"Trenches for foundations and services",
			"Under pinning",
			"Windows/glazing including windows cleaning",
			"Work in coastal and maritime waters",
			"Working over/near water"
		],
		"associated_activity": [
			"0",
			"Aging",
			"Commission; site tests",
			"Component manufacture",
			"Demolition, removal",
			"High impact events",
			"Install construction",
			"Life extension",
			"Maintenance",
			"Material disposal or re-use",
			"Material sourcing",
			"Modification",
			"Not Applicable",
			"Operation",
			"Post processing",
			"Preliminary investigation, tests & protypes",
			"Storage, transport, logistics",
			"Use"
		]
	}

	before(function(done) {

		server = app.listen(8080, function () {
			agent = request.agent(server);
			console.log("API test server is listening on port 8080!");
			done();
		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	describe("Get mitigation criteria", function(done) {
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username, password})
				.expect(200, done);

		});

		it("should succeed", function(done) {
			agent.get(`/${username}/mitigations/criteria`)
				.expect(200, function(err, res) {
					const sortedObj = {};
					Object.keys(res.body).forEach((key) => sortedObj[key] = res.body[key].sort());
					expect(sortedObj).to.deep.equal(goldenCriteria);
					done(err);
				});
		});

		it("if user is not teamspace admin should succeed", function(done) {
			agent.get(`/${collaboratorTeamspace}/mitigations/criteria`)
				.expect(200, function(err, res) {
					const sortedObj = {};
					Object.keys(res.body).forEach((key) => sortedObj[key] = res.body[key].sort());
					expect(sortedObj).to.deep.equal(goldenCriteria);
					done(err);
				});
		});

		it("if user is not member of teamspace should fail", function(done) {
			agent.get(`/${notMemberOfTeamspace}/mitigations/criteria`)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
					done(err);
				});
		});

		it("if teamspace doesn't exist should fail", function(done) {
			agent.get(`/${fakeTeamspace}/mitigations/criteria`)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Find mitigation suggestions", function(done) {
		const totalSuggestions = 201;
		const expectedLengths = {
			"category": 18,
			"location_desc": 27,
			"element": 20,
			"risk_factor": 18,
			"scope": 1,
			"associated_activity": 22
		};
		const invalidCriteria = {
			"mitigation_desc": "Avoid trap hazards near openings.",
			"mitigation_detail": "Detailed information",
			"mitigation_stage": goldenCriteria["mitigation_stage"][0],
			"mitigation_type": goldenCriteria["mitigation_type"][0],
			"abcdefghijklmnop": "qrstuvwxyz",
			"invalidFieldName": "randomData"
		};

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username, password})
				.expect(200, done);

		});

		it("without criteria should succeed", function(done) {
			agent.post(`/${username}/mitigations`)
				.send({})
				.expect(200, function(err, res) {
					expect(res.body.length).to.equal(totalSuggestions);
					done(err);
				});
		});

		it("if user is not teamspace admin should succeed", function(done) {
			agent.post(`/${collaboratorTeamspace}/mitigations`)
				.send({})
				.expect(200, function(err, res) {
					expect(res.body.length).to.equal(totalSuggestions);
					done(err);
				});
		});

		it("if user is not member of teamspace should fail", function(done) {
			agent.post(`/${notMemberOfTeamspace}/mitigations`)
				.send({})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
					done(err);
				});
		});

		it("if teamspace doesn't exist should fail", function(done) {
			agent.post(`/${fakeTeamspace}/mitigations`)
				.send({})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
					done(err);
				});
		});

		Object.keys(expectedLengths).forEach((key) => {
			const criterion = {};
			criterion[key] = goldenCriteria[key][0];

			it("by " + key + " should succeed", function(done) {
				agent.post(`/${username}/mitigations`)
					.send(criterion)
					.expect(200, function(err, res) {
						expect(res.body.length).to.equal(expectedLengths[key]);
						done(err);
					});
			});
		});

		Object.keys(invalidCriteria).forEach((key) => {
			const criterion = {};
			criterion[key] = invalidCriteria[key];

			it("by invalid criteria (" + key + ") should succeed", function(done) {
				agent.post(`/${username}/mitigations`)
					.send(criterion)
					.expect(200, function(err, res) {
						expect(res.body.length).to.equal(totalSuggestions);
						done(err);
					});
			});
		});

		it("by multiple criteria should succeed", function(done) {
			const criteria = {};
			Object.keys(goldenCriteria).forEach((key) => {
				criteria[key] = goldenCriteria[key][3];
			});

			agent.post(`/${username}/mitigations`)
				.send(criteria)
				.expect(200, function(err, res) {
					console.log("2021102515")
					console.log(res.body.length)
					expect(res.body.length).to.equal(0);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});
});
