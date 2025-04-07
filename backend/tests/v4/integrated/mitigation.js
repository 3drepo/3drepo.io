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
const chai = require("chai");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(deepEqualInAnyOrder);
const { expect } = chai;
const app = require("../../../src/v4/services/api.js").createApp();
const async = require("async");
const responseCodes = require("../../../src/v4/response_codes");
const { templates : responseCodesV5 } = require("../../../src/v5/utils/responseCodes");

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
		mitigation_stage: [
			'Preliminary Design',
			'Detail Design',
			'Pre construction',
			'Site work, Temp Works, Change control',
			'0'
		],
		mitigation_type: [
			'Eliminate',
			'Reduce',
			'Control by subsequent design',
			'Inform',
			'0'
		],
		category: [
			'Fall-From open edge',
			'Physical-Size',
			'Physical-Connection',
			'Physical-Weight',
			'Physical-Length',
			'Physical-Opening',
			'Physical-Fragile',
			'Physical-Collapse',
			'Physical-Spacing',
			'Physical-Edge',
			'Material-Asbestos',
			'Material-Lead',
			'Material-Dust',
			'Material-Strength',
			'Task-Excavation',
			'Task-Manual Handling',
			'Task-Welding',
			'Task-Lifting',
			'Task-Cleaning machinery',
			'Task-Temporary structure',
			'Task-Site Management',
			'Task-Change Design',
			'0',
			'Commercial Issue',
			'Environmental Issue',
			'Health - Material effect',
			'Health - Mechanical effect',
			'Safety Issue - Fall',
			'Safety Issue - Trapped',
			'Safety Issue - Event',
			'Safety Issue - Handling',
			'Safety Issue - Struck',
			'Safety Issue - Public',
			'Social Issue',
			'Other Issue',
			'Unknown'
		],
		location_desc: [
			'High Level-Near Opening',
			'High Level-Near Edge',
			'High Level-Between Joist',
			'High Level-Near Opening - Stairwell',
			'High Level-Near Opening - Shaft',
			'High Level-Scaffolds',
			'Site logistics-Traffic route',
			'Site logistics-Crane area',
			'Site logistics-Pump area',
			'Site logistics-Confined area',
			'Site logistics-Exposed area',
			'Site logistics-Excavation area',
			'0'
		],
		element: [
			'Slab',
			'Flat roof',
			'Frame/beam',
			'Stair',
			'Cladding',
			'Pitched roof',
			'Temporary structure',
			'Column',
			'External Wall',
			'Internal Wall',
			'Ramp',
			'Lift',
			'Isolated foundation',
			'Raft foundation',
			'Wall foundation',
			'Ceiling',
			'Mechanical equipment',
			'Window',
			'Not Applicable',
			'0'
		],
		risk_factor: [
			'Physical-Opening',
			'Physical-Spacing',
			'Task-Lifting',
			'Physical-Edge',
			'Task-Temporary structure',
			'Physical-Size',
			'Physical-Connection',
			'Physical-Weight',
			'Physical-Length',
			'Physical-Fragile',
			'Physical-Collapse',
			'Material-Asbestos',
			'Material-Lead',
			'Material-Dust',
			'Material-Strength',
			'Task-Excavation',
			'Task-Manual Handling',
			'Task-Welding',
			'Task-Cleaning machinery',
			'Task-Site Management',
			'Task-Change Design',
			'0'
		],
		scope: [
			'In situ concrete',
			'Site investigation and remediation',
			'Surrounding environment',
			'Site clearance and demolition',
			'Access (onto and within site)',
			'Site Layout',
			'General excavation',
			'Deep basements and shafts',
			'Trenches for foundations and services',
			'Retaining walls',
			'Ground stabilisation',
			'Pilling',
			'Under pinning',
			'General concrete',
			'Precast concrete',
			'Prestressed, post tensioned concrete',
			'General steelwork',
			'Stability and erection of structural steelwork',
			'Masonry',
			'Timber',
			'Refurbishment of existing buildings',
			'External Cladding',
			'Roof coverings and finishes',
			'Atria',
			'Windows/glazing including windows cleaning',
			'Surface coating and finishes',
			'Cleaning of buildings',
			'Mechanical services',
			'Electrical services',
			'Public health services',
			'Lifts, escalators and auto walks',
			'General civil engineering, including small works',
			'Roads, working adjacent to, maintenance of',
			'Railways, working adjacent to, maintenance of',
			'Bridge construction',
			'Bridge maintenance',
			'Working over/near water',
			'Pipes and cables',
			'Work in coastal and maritime waters'
		],
		associated_activity: [
			'Install construction',
			'Preliminary investigation, tests & protypes',
			'Material sourcing',
			'Component manufacture',
			'Storage, transport, logistics',
			'Commission; site tests',
			'Use',
			'Operation',
			'Maintenance',
			'High impact events',
			'Modification',
			'Aging',
			'Life extension',
			'Demolition, removal',
			'Post processing',
			'Material disposal or re-use',
			'Not Applicable',
			'0'
		]
	};

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
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});

		it("should succeed", function(done) {
			agent.get(`/${username}/mitigations/criteria`)
				.expect(200, function(err, res) {
					const results = res.body;
					expect(Object.keys(results).length).to.equal(Object.keys(goldenCriteria).length);
					Object.keys(results).forEach((key) => expect(results[key]).to.deep.equalInAnyOrder(goldenCriteria[key]));
					done(err);
				});
		});

		it("if user is not teamspace admin should succeed", function(done) {
			agent.get(`/${collaboratorTeamspace}/mitigations/criteria`)
				.expect(200, function(err, res) {
					const results = res.body;
					Object.keys(results).forEach((key) => expect(results[key]).to.deep.equalInAnyOrder(goldenCriteria[key]));
					done(err);
				});
		});

		it("if user is not member of teamspace should fail", function(done) {
			agent.get(`/${notMemberOfTeamspace}/mitigations/criteria`)
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("if teamspace doesn't exist should fail", function(done) {
			agent.get(`/${fakeTeamspace}/mitigations/criteria`)
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

	});

	describe("Find mitigation suggestions", function(done) {
		const totalSuggestions = 201;
		const expectedLengths = {
			"category": 162,
			"location_desc": 46,
			"element": 84,
			"risk_factor": 115,
			"scope": 163,
			"associated_activity": 163
		};
		const invalidCriteria = {
			"mitigation_desc": "Avoid trap hazards near openings.",
			"mitigation_detail": "Detailed information",
			"mitigation_stage": goldenCriteria["mitigation_stage"][0],
			"mitigation_type": goldenCriteria["mitigation_type"][0],
			"abcdefghijklmnop": "qrstuvwxyz",
			"invalidFieldName": "randomData"
		};

		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(username, password);

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
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("if teamspace doesn't exist should fail", function(done) {
			agent.post(`/${fakeTeamspace}/mitigations`)
				.send({})
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
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
				criteria[key] = goldenCriteria[key][0];
			});

			agent.post(`/${username}/mitigations`)
				.send(criteria)
				.expect(200, function(err, res) {
					expect(res.body.length).to.equal(45);
					done(err);
				});
		});

	});
});
