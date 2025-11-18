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

const async = require("async");
const SessionTracker = require("../../v4/helpers/sessionTracker")
const request = require("supertest");
const expect = require("chai").expect;
const { createAppSync } = require("../../../src/v4/services/api.js");
const responseCodes = require("../../../src/v4/response_codes");
const { templates: responseCodesV5 } = require("../../../src/v5/utils/responseCodes");

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
		key: "eef3a905644d9cdcea53cf60ebc344d7",
		quota: {spaceLimit: 3073, collaboratorLimit: "unlimited", spaceUsed: 0},
		subscriptions : {
			"basic": {
			  "collaborators": 0,
			  "data": 1
			},
			"paypal": [
			  {
				"expiryDate": "2118-07-29T10:29:39.000Z",
				"quantity": 2,
				"plan": "hundredQuidPlan"
			  }
			],
			"enterprise": {
			  "collaborators": 2,
			  "data": 1024,
			  "expiryDate": "2118-07-29T10:29:39.000Z"
			},
			"discretionary": {
			  "collaborators": "unlimited",
			  "data": 2048,
			  "expiryDate": "2118-08-29T10:29:39.000Z"
			}
		  }
	};

	const mixedUser2 = {
		user: "sub_all2",
		password: "password",
		quota: {spaceLimit: 2049, collaboratorLimit: "unlimited", spaceUsed: 0},
		key: "bfc07b68267ab54bfdeb891fe77187be"
	};

	const mixedUser3 = {
		user: "sub_all3",
		password: "password",
		quota: {spaceLimit: 1025, collaboratorLimit: 2, spaceUsed: 0}
	};

	const mixedUser4 = {
		user: "sub_all4",
		password: "password",
		quota: {spaceLimit: 3073, collaboratorLimit: "unlimited", spaceUsed: 0}
	};

	const imsharedTeamspace = {
		user: "imsharedTeamspace",
		password: "imsharedTeamspace",
		key: "c6e96d6ed8e95745fd9a222a82113a16"
	};

	const metaTestTeamspace = {
		user: "metaTest",
		password: "123456"
	};

	const impliedViewAllModelsTeamspace = {
		user: "impliedViewAllModels",
		password: "impliedViewAllModels"
	};

	const fakeTeamspace = "fakeTeamspace";
	const notMemberOfTeamspace = "fed";
	const collaboratorTeamspace = "teamSpace1";

	const mitigationsFile = "/../statics/mitigations/mitigations1.csv";
	const bigMitigationsFile = "/../statics/mitigations/big.csv";

	before(async function() {
		const app = await createAppSync();
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
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should have basic quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

	});

	describe("user with enterprise subscription", function(done) {
		const user = enterpriseUser;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should have basic & enterprise quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});
	});

	describe("user with discretionary subscription", function(done) {
		const user = discretionaryUser;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should have basic & discretionary quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});
	});

	describe("user with mixed subscription",  function() {
		const user =  mixedUser1;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should have the correct aggregated quota", async function() {
			const {body} = await agent.get(`/${user.user}/quota`)
				.expect(200);

			expect(body).to.deep.equal(user.quota);
		});

		it("should be able to fetch suscriptions", async function() {
			const { body } = await agent.get(`/${user.user}/subscriptions`)
				.expect(200);

			expect(body).to.deep.equal(user.subscriptions);
		});

	});

	describe("user with mixed subscription with expired subscriptions (1)", function(done) {
		const user =  mixedUser2;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});
		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});

	});

	describe("user with mixed subscription with expired subscriptions (2)", function(done) {
		const user =  mixedUser3;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});
	});


	describe("user with mixed subscription with expired subscriptions (3)", function(done) {
		const user =  mixedUser4;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should have the correct aggregated quota", function(done) {
			agent.get(`/${user.user}/quota`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(user.quota);
					done(err);
				});
		});
	});

	describe("Trying to get addOns information of a teamspace", function(done) {
		const expectedAddOns = {
			vrEnabled: true,
			srcEnabled: true,
			hereEnabled: true,
			powerBIEnabled: true,
			modules: [
				"issues",
				"risks"
			]
		}
		it("as the teamspace owner should succeed", function(done) {
			agent.get(`/${mixedUser1.user}/addOns?key=${mixedUser1.key}`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(expectedAddOns);
					done(err);
				});
		});

		it("as a member of the teamspace should succeed", function(done) {
			agent.get(`/${mixedUser1.user}/addOns?key=${mixedUser2.key}`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(expectedAddOns);
					done(err);
				});
		});
		it("as a non-member of the teamspace should fail", function(done) {
			agent.get(`/${mixedUser1.user}/addOns?key=${imsharedTeamspace.key}`)
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});
	});

	describe("Member of a teamspace trying to get other members information", function(done) {
		const user =  mixedUser4;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should pass if the member exists", function(done) {
			const expectedInfo = {
				user: mixedUser3.user,
				firstName: "dflkgjfdgdf",
				lastName: "lkgjri",
				company: "flskjdflksdj"
			};
			agent.get(`/${mixedUser1.user}/members/${mixedUser3.user}`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(expectedInfo);
					done(err);
				});
		});

		it("should pass if the member exists (with job)", function(done) {
			const expectedInfo = {
				user: mixedUser1.user,
				firstName: "dflkgjfdgdf",
				lastName: "lkgjri",
				company: "flskjdflksdj",
				job: {_id: "jobB", color: "#9C9CD5"}
			};
			agent.get(`/${mixedUser1.user}/members/${mixedUser1.user}`)
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
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("should fail if the teamspace does not exist", function(done) {
			agent.get(`/blah30489723985723/members/${mixedUser1.user}`)
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});
	});

	const defaultRiskCategories = [
		"Commercial Issue",
		"Environmental Issue",
		"Health - Material effect",
		"Health - Mechanical effect",
		"Safety Issue - Fall",
		"Safety Issue - Trapped",
		"Safety Issue - Event",
		"Safety Issue - Handling",
		"Safety Issue - Struck",
		"Safety Issue - Public",
		"Social Issue",
		"Other Issue",
		"Unknown"
	];
	const defaultTopicTypes =  [
		"For information",
		"VR"
	];

	describe("Update teamspace settings", function(done) {
		const user =  imsharedTeamspace;
		const newRiskCategories = [
			"New Cat 1",
			"New Cat 2"
		];
		const newTopicTypes = [
			"New Type 1",
			"New Type 2"
		];
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});


		it("set defaults should succeed", function(done) {
			agent.patch(`/${user.user}/settings`)
				.send({ topicTypes: defaultTopicTypes, riskCategories: defaultRiskCategories })
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(defaultTopicTypes);
					done(err);
				});
		});

		it("set defaults if user is not teamspace admin should fail", function(done) {
			agent.patch(`/${collaboratorTeamspace}/settings`)
				.send({ topicTypes: defaultTopicTypes, riskCategories: defaultRiskCategories })
				.expect(401, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NOT_AUTHORIZED.value);
					done(err);
				});
		});

		it("set defaults if user is not member of teamspace should fail", function(done) {
			agent.patch(`/${notMemberOfTeamspace}/settings`)
				.send({ topicTypes: defaultTopicTypes, riskCategories: defaultRiskCategories })
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("set defaults if teamspace doesn't exist should fail", function(done) {
			agent.patch(`/${fakeTeamspace}/settings`)
				.send({ topicTypes: defaultTopicTypes, riskCategories: defaultRiskCategories })
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("with new topic types should succeed", function(done) {
			agent.patch(`/${user.user}/settings`)
				.send({ topicTypes: newTopicTypes })
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(newTopicTypes);
					done(err);
				});
		});

		it("with new risk categories should succeed", function(done) {
			agent.patch(`/${user.user}/settings`)
				.send({ riskCategories: newRiskCategories })
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(user.user);
					expect(res.body.riskCategories).to.deep.equal(newRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(newTopicTypes);
					done(err);
				});
		});

		it("with unexpected field should succeed", function(done) {
			agent.patch(`/${user.user}/settings`)
				.send({
					topicTypes: defaultTopicTypes,
					riskCategories: defaultRiskCategories,
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
			const duplicateRiskCategories = defaultRiskCategories.concat(defaultRiskCategories);
			agent.patch(`/${user.user}/settings`)
				.send({
					riskCategories: duplicateRiskCategories
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.DUPLICATED_ENTRIES.value);
					done(err);
				});
		});

		it("with duplicate topic type should fail", function(done) {
			const duplicateTopicTypes = defaultTopicTypes.concat(defaultTopicTypes);
			agent.patch(`/${user.user}/settings`)
				.send({
					topicTypes: duplicateTopicTypes
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.DUPLICATED_ENTRIES.value);
					done(err);
				});
		});

		it("with duplicate (case insensitive) categories should fail", function(done) {
			const duplicateRiskCategoryLabels = ["dup 1", "DUP 1"];
			agent.patch(`/${user.user}/settings`)
				.send({
					riskCategories: duplicateRiskCategoryLabels
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.DUPLICATED_ENTRIES.value);
					done(err);
				});
		});

		it("with duplicate (case insensitive) topic type should fail", function(done) {
			const duplicateTopicTypeLabels = ["clone 2", "CLONE 2"];
			agent.patch(`/${user.user}/settings`)
				.send({
					topicTypes: duplicateTopicTypeLabels
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.DUPLICATED_ENTRIES.value);
					done(err);
				});
		});

		it("with non-string array categories should fail", function(done) {
			const nonStringRiskCategories = [1, 2, 3, 4, 5];
			agent.patch(`/${user.user}/settings`)
				.send({
					riskCategories: nonStringRiskCategories
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with non-string array topic type should fail", function(done) {
			const nonStringTopicTypes = [{"value":"value 1"}, {"value":"value 2"}];
			agent.patch(`/${user.user}/settings`)
				.send({
					topicTypes: nonStringTopicTypes
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with non-array categories should fail", function(done) {
			const nonArrayRiskCategories = {"key":"value"};
			agent.patch(`/${user.user}/settings`)
				.send({
					riskCategories: nonArrayRiskCategories
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with non-array topic type should fail", function(done) {
			const nonArrayTopicTypes = "invalid entry";
			agent.patch(`/${user.user}/settings`)
				.send({
					topicTypes: nonArrayTopicTypes
				})
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

	});

	describe("Get teamspace settings", function(done) {
		const user =  imsharedTeamspace;
		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

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

		it("if user is not teamspace admin should succeed", function(done) {
			const collaboratorTeamspaceTopicTypes = [
				"GIS",
				"Risk",
				"Clash",
				"H&S",
				"For information",
				"VR",
				"Constructibility",
				"Design",
				"Diff",
				"RFI"
			];
			agent.get(`/${collaboratorTeamspace}/settings`)
				.expect(200, function(err, res) {
					expect(res.body._id).to.equal(collaboratorTeamspace);
					expect(res.body.riskCategories).to.deep.equal(defaultRiskCategories);
					expect(res.body.topicTypes).to.deep.equal(collaboratorTeamspaceTopicTypes);
					done(err);
				});
		});

		it("if user is not member of teamspace should fail", function(done) {
			agent.get(`/${notMemberOfTeamspace}/settings`)
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("if teamspace doesn't exist should fail", function(done) {
			agent.get(`/${fakeTeamspace}/settings`)
				.expect(responseCodesV5.teamspaceNotFound.status, function(err, res) {
					expect(res.body.code).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

	});

	describe("Download mitigations file", function(done) {
		const user =  impliedViewAllModelsTeamspace;

		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("with user that doesn't have mitigations should fail", function(done) {
			agent.get(`/${user.user}/settings/mitigations.csv`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NO_MITIGATIONS_FOUND.value);
					done(err);
				});
		});

	});

	describe("Download mitigations file", function(done) {
		const user =  metaTestTeamspace;

		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should succeed", function(done) {
			agent.get(`/${user.user}/settings/mitigations.csv`)
				.expect(200, done);
		});

		it("if user is not teamspace admin should fail", function(done) {
			agent.get(`/${collaboratorTeamspace}/settings/mitigations.csv`)
				.expect(401, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NOT_AUTHORIZED.value);
					done(err);
				});
		});

		it("if user is not member of teamspace should fail", function(done) {
			agent.get(`/${notMemberOfTeamspace}/settings/mitigations.csv`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("if user doesn't exist should fail", function(done) {
			agent.get(`/${fakeTeamspace}/settings/mitigations.csv`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});
	});

	describe("Upload mitigations file", function(done) {
		const user =  imsharedTeamspace;
		const notMitigationsFile = "/../statics/mitigations/notMitigations.zip";

		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("should succeed", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(200, done);
		});

		it("reupload mitigations should succeed", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(200, done);
		});

		it("number of mitigations should remain the same on reupload", function(done) {
			let totalSuggestions;

			async.series([
				function(done) {
					agent.post(`/${user.user}/mitigations`)
						.send({})
						.expect(200, function(err, res) {
							totalSuggestions = res.body.length;
							return done(err);
						});
				},
				function(done) {
					agent.post(`/${user.user}/settings/mitigations.csv`)
						.attach("file", __dirname + mitigationsFile)
						.expect(200, function(err, res) {
							return done(err);
						});
				},
				function(done) {
					agent.post(`/${user.user}/mitigations`)
						.send({})
						.expect(200, function(err, res) {
							expect(res.body.length).to.equal(totalSuggestions);
							return done(err);
						});
				}
			], done);
		});

		it("if user is not teamspace admin should fail", function(done) {
			agent.post(`/${collaboratorTeamspace}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(401, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NOT_AUTHORIZED.value);
					done(err);
				});
		});

		it("if user is not member of teamspace should fail", function(done) {
			agent.post(`/${notMemberOfTeamspace}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("if teamspace doesn't exist should fail", function(done) {
			agent.post(`/${fakeTeamspace}/settings/mitigations.csv`)
				.attach("file", __dirname + mitigationsFile)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("non-CSV file should fail", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + notMitigationsFile)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
					done(err);
				});
		});

		it("file exceeding file size limit should fail", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
				.attach("file", __dirname + bigMitigationsFile)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT.value);
					done(err);
				});
		});

	});

	describe("Upload mitigations file", function(done) {
		const user = noSubUser;

		before(async function() {
			this.timeout(timeout);
			agent = SessionTracker(request(server));
			await agent.login(user.user, user.password);

		});

		it("that exceeds teamspace quota should fail", function(done) {
			agent.post(`/${user.user}/settings/mitigations.csv`)
                                .attach("file", __dirname + bigMitigationsFile)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT_PAY.value);
					done(err);
				});
		});
	});

});
