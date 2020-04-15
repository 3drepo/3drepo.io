"use strict";

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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes");

describe("Teamspace", function() {
	let server;
	let agent;
	const timeout = 30000;
	const noSubUser = {
		user: "sub_noSub",
		password: "password",
		quota: {spaceLimit: 1, collaboratorLimit: 0, spaceUsed: 0}
	};

	const paypalUser = {
		user: "sub_paypal",
		password: "password",
		quota: {spaceLimit: 20481, collaboratorLimit: 2, spaceUsed: 0}
	};

	const enterpriseUser = {
		user: "sub_enterprise",
		password: "password",
		quota: {spaceLimit: 2049, collaboratorLimit: 5, spaceUsed: 0}
	};

	const discretionaryUser = {
		user: "sub_discretionary",
		password: "password",
		quota: {spaceLimit: 1025, collaboratorLimit: 10, spaceUsed: 0}
	};

	const mixedUser1 = {
		user: "sub_all",
		password: "password",
		quota: {spaceLimit: 23553, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	const mixedUser2 = {
		user: "sub_all2",
		password: "password",
		quota: {spaceLimit: 22529, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	const mixedUser3 = {
		user: "sub_all3",
		password: "password",
		quota: {spaceLimit: 21505, collaboratorLimit: 4, spaceUsed: 0}
	};

	const mixedUser4 = {
		user: "sub_all4",
		password: "password",
		quota: {spaceLimit: 3073, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	const imsharedTeamspace = {
		user: "imsharedTeamspace",
		password: "imsharedTeamspace"
	};

	const mitigationsFile = "/../../statics/mitigations/mitigations1.csv";

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

	describe("user with no subscription", function(done) {
		const user = noSubUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with paypal subscription", function(done) {
		const user = paypalUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic & paypal quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});

	});

	describe("user with enterprise subscription", function(done) {
		const user = enterpriseUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic & enterprise quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with discretionary subscription", function(done) {
		const user = discretionaryUser;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have basic & discretionary quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription", function(done) {
		const user =  mixedUser1;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription with expired subscriptions (1)", function(done) {
		const user =  mixedUser2;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription with expired subscriptions (2)", function(done) {
		const user =  mixedUser3;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("user with mixed subscription with expired subscriptions (3)", function(done) {
		const user =  mixedUser4;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					console.log(res.body);
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Member of a teamspace trying to get other members information", function(done) {
		const user =  mixedUser4;
		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		const expectedInfo = {
			user: mixedUser3.user,
			firstName: "dflkgjfdgdf",
			lastName: "lkgjri",
			company: "flskjdflksdj"
		};

		it("should pass if the member exists", function(done) {
			agent.get(`/${mixedUser1.user}/members/${mixedUser3.user}`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(expectedInfo);
					done(err);
				});
		});

		it("should fail if the member doesn't exist", function(done) {
			agent.get(`/${mixedUser1.user}/members/blah13214315246`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
					done(err);
				});
		});

		it("should fail if the target user is not a member of the teamspace", function(done) {
			agent.get(`/${mixedUser4.user}/members/${mixedUser1.user}`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
					done(err);
				});
		});

		it("should fail if the target user is not a member of the teamspace", function(done) {
			agent.get(`/${mixedUser4.user}/members/${mixedUser1.user}`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
					done(err);
				});
		});

		it("should fail if the request user is not a member of the teamspace", function(done) {
			agent.get(`/${mixedUser3.user}/members/${mixedUser1.user}`)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
					done(err);
				});
		});

		it("should fail if the teamspace does not exist", function(done) {
			agent.get(`/blah30489723985723/members/${mixedUser1.user}`)
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

	const defaultRiskCategories = [
		{ "value" : "commercial_issue", "label" : "Commercial Issue" },
		{ "value" : "environmental_issue", "label" : "Environmental Issue" },
		{ "value" : "health_-_material_effect", "label" : "Health - Material effect" },
		{ "value" : "health_-_mechanical_effect", "label" : "Health - Mechanical effect" },
		{ "value" : "safety_issue_-_fall", "label" : "Safety Issue - Fall" },
		{ "value" : "safety_issue_-_trapped", "label" : "Safety Issue - Trapped" },
		{ "value" : "safety_issue_-_event", "label" : "Safety Issue - Event" },
		{ "value" : "safety_issue_-_handling", "label" : "Safety Issue - Handling" },
		{ "value" : "safety_issue_-_struck", "label" : "Safety Issue - Struck" },
		{ "value" : "safety_issue_-_public", "label" : "Safety Issue - Public" },
		{ "value" : "social_issue", "label" : "Social Issue" },
		{ "value" : "other_issue", "label" : "Other Issue" },
		{ "value" : "unknown", "label" : "UNKNOWN" }
	];
	const defaultRiskCategoryLabels = defaultRiskCategories.map(x => x.label);
	const defaultTopicTypes =  [
		{ "value" : "for_information", "label" : "For information" },
		{ "value" : "vr", "label" : "VR" }
	];
	const defaultTopicTypeLabels = defaultTopicTypes.map(x => x.label);

	describe("Update teamspace settings", function(done) {
		const user =  imsharedTeamspace;
		const newRiskCategories = [
			{ "value": "new_cat_1", "label": "New Cat 1" },
			{ "value": "new_cat_2", "label": "New Cat 2" }
		];
		const newRiskCategoryLabels = newRiskCategories.map(x => x.label);
		const newTopicTypes = [
			{ "value": "new_type_1", "label": "New Type 1" },
			{ "value": "new_type_2", "label": "New Type 2" }
		];
		const newTopicTypeLabels = newTopicTypes.map(x => x.label);

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("set defaults should succeed", function(done) {
			agent.put(`/${user.user}/settings`)
				.send({ topicTypes: defaultTopicTypeLabels, riskCategories: defaultRiskCategoryLabels })
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(defaultTopicTypes);
					done(err);
				});
		});

		it("with new topic types should succeed", function(done) {
			agent.put(`/${user.user}/settings`)
				.send({ topicTypes: newTopicTypeLabels })
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(newTopicTypes);
					done(err);
				});
		});

		it("with new risk categories should succeed", function(done) {
			agent.put(`/${user.user}/settings`)
				.send({ riskCategories: newRiskCategoryLabels })
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(newRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(newTopicTypes);
					done(err);
				});
		});

		it("with unexpected field should succeed", function(done) {
			agent.put(`/${user.user}/settings`)
				.send({
					topicTypes: defaultTopicTypeLabels,
					riskCategories: defaultRiskCategoryLabels,
					unexpectedField: "abc"
				})
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(defaultTopicTypes);
					expect(res.body.unexpectedField).to.equal(undefined);
					done(err);
				});
		});

		it("with duplicate risk categories should fail", function(done) {
			const duplicateRiskCategoryLabels = defaultRiskCategoryLabels.concat(defaultRiskCategoryLabels);
			agent.put(`/${user.user}/settings`)
				.send({
					riskCategories: duplicateRiskCategoryLabels
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.RISK_DUPLICATE_CATEGORY.value);
					done(err);
				});
		});

		it("with duplicate topic type should fail", function(done) {
			const duplicateTopicTypeLabels = defaultTopicTypeLabels.concat(defaultTopicTypeLabels);
			agent.put(`/${user.user}/settings`)
				.send({
					topicTypes: duplicateTopicTypeLabels
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE.value);
					done(err);
				});
		});

		it("with duplicate (case insensitive) categories should fail", function(done) {
			const duplicateRiskCategoryLabels = ["dup 1", "DUP 1"];
			agent.put(`/${user.user}/settings`)
				.send({
					riskCategories: duplicateRiskCategoryLabels
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.RISK_DUPLICATE_CATEGORY.value);
					done(err);
				});
		});

		it("with duplicate (case insensitive) topic type should fail", function(done) {
			const duplicateTopicTypeLabels = ["clone 2", "CLONE 2"];
			agent.put(`/${user.user}/settings`)
				.send({
					topicTypes: duplicateTopicTypeLabels
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE.value);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Get teamspace settings", function(done) {
		const user =  imsharedTeamspace;

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should succeed", function(done) {
			agent.get(`/${user.user}/settings`)
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(defaultTopicTypes);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Download mitigations file", function(done) {
		const user =  imsharedTeamspace;

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("that doesn't exist should fail", function(done) {
			agent.get(`/${user.user}/settings/mitigations.csv`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Upload mitigations file", function(done) {
		const user =  imsharedTeamspace;
		const notMitigationsFile = "/../../statics/mitigations/notMitigations.zip";

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should succeed", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(200, done);
		});

		it("non-CSV file should fail", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + notMitigationsFile)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
					done(err);
				});
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Download mitigations file", function(done) {
		const user =  imsharedTeamspace;

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should succeed", function(done) {
			agent.get(`/${user.user}/settings/mitigations.csv`)
				.expect(200, done);
		});

		after(function(done) {
			this.timeout(timeout);
			agent.post("/logout")
				.expect(200, done);
		});
	});

	describe("Check suggestions", function(done) {
		const user =  imsharedTeamspace;
		let totalSuggestions;

		before(function(done) {
			this.timeout(timeout);
			agent.post("/login")
				.send({username: user.user, password: user.password})
				.expect(200, done);

		});

		it("should succeed", function(done) {
			agent.post(`/${user.user}/mitigations`)
				.send({})
				.expect(200, function(err, res) {
					totalSuggestions = res.body.length;
					done(err);
				});
		});

		it("reupload mitigations should succeed", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(200, done);
		});

		it("number of mitigations should remain the same", function(done) {
			agent.post(`/${user.user}/mitigations`)
				.send({})
				.expect(200, function(err, res) {
					expect(res.body.length).to.equal(totalSuggestions);
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
