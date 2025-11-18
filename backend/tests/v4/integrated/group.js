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
const request = require("supertest");
const expect = require("chai").expect;
const { createAppSync } = require("../../../src/v4/services/api.js");
const responseCodes = require("../../../src/v4/response_codes.js");
const {templates: responseCodesV5} = require("../../../src/v5/utils/responseCodes");
const async = require("async");

describe("Groups", function () {

	let server;
	let agent;

	const username = "groupUser";
	const viewerUser = "issue_username2";
	const noAccessUser = "issue_username";
	const password = "password";

	const model = "4ec71fdd-0450-4b6f-8478-c46633bb66e3";
	const federation = "80bc4290-0f94-11eb-970b-03c55a1e1b3a";

	const goldenData = {
		"_id":"0e2f7fa0-7ac5-11e8-9567-6b401a084a90",
		"author": "groupUser",
		"color":[98,126,184],
		"createdAt": 1530184737380,
		"name": "Group 2",
		"objects":[
			{
				"account":"groupUser",
				"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
				"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
			}
		],
		"updatedAt": 1530184737380,
		"updatedBy": "groupUser"
	};


	before(async() => {
		const app = await createAppSync();
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
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	describe("List all groups", function() {
		it("using master head revision should succeed", function(done){
			agent.get(`/${username}/${model}/revision/master/head/groups/`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(4);
					done(err);
				});
		});

		it("using revision ID should succeed", function(done){
			agent.get(`/${username}/${model}/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/groups/`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(4);
					done(err);
				});
		});
	});


	describe("List all groups (no Issue groups) ", function() {
		it("using master head revision should succeed", function(done){
			agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(2);
					done(err);
				});
		});

		it("using revision ID should succeed", function(done){
			agent.get(`/${username}/${model}/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/groups/?noIssues=true`)
				.expect(200 , function(err, res) {
					expect(res.body.length).to.equal(2);
					done(err);
				});
		});
	});

	describe("Finding a group by ID ", function() {
		const groupID = "0e2f7fa0-7ac5-11e8-9567-6b401a084a90";

		it("using master head revision should succeed", function(done){
			agent.get(`/${username}/${model}/revision/master/head/groups/${groupID}`)
				.expect(200 , function(err, res) {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});
		});

		it("with invalid ID should fail", function(done){
			agent.get(`/${username}/${model}/revision/master/head/groups/invalidSomething`)
				.expect(404 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.GROUP_NOT_FOUND.value);
					done(err);
				});
		});

		it("with some other teamspace should fail", function(done){
			agent.get(`/${noAccessUser}/${model}/revision/f640aa3dec2/groups/${groupID}`)
				.expect(404 , function(err, res) {
					expect(res.body.value).to.equal(responseCodesV5.teamspaceNotFound.code);
					done(err);
				});
		});

		it("using revision ID should succeed", function(done){
			agent.get(`/${username}/${model}/revision/b74ba13b-71db-4fcc-9ff8-7f640aa3dec2/groups/${groupID}`)
				.expect(200 , function(err, res) {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});
		});
	});

	describe("Creating a group ", function() {
		const data = {
			"color":[98,126,184],
			"objects":[
				{
					"account":"groupUser",
					"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}]
		};
		it("with valid parameters should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(data)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules instead of objects should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField"] },
						operator: "GTE",
						values: [1]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules and field name being string should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: "TestField",
						operator: "GTE",
						values: [1]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules (0 args) should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField"] },
						operator: "IS_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules (2 args) should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField"] },
						operator: "IN_RANGE",
						values: [1, 2]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules (multi args) should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField"] },
						operator: "EQUALS",
						values: [1, 2, 3]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules (multi args in field) should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField", "TestField2", "TestField3"] },
						operator: "EQUALS",
						values: [1, 2, 3]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with rules (multi arg pairs) should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField"] },
						operator: "NOT_IN_RANGE",
						values: [1, 2, 3, 4]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("with multiple rules should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["TestField"] },
						operator: "NOT_IN_RANGE",
						values: [3, 4]
					},{
						name: "rule name",
						field: { operator: "IS", values: ["TestField2"] },
						operator: "IS_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("without color should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.color;
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("color with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			// @ts-ignore
			newGroup.color = true;
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
		});


		it("without rules or objects field should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with rule name should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				field: { operator: "IS", values: ["TestField"] },
				operator: "GTE",
				values: [1]
			}];
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("with rules and objects should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "GTE",
				values: [1]
			}];
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("with insufficient rule args (min. 1) should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "GT",
				values: []
			}];
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("with insufficient rule args in field (min. 1) should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: [] },
				operator: "GT",
				values: ["some value"]
			}];
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("with insufficient rule args (min. 2) should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "NOT_IN_RANGE",
				values: [1]
			}];
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("with incorrect multiple (2) of rule args should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "NOT_IN_RANGE",
				values: [1, 2, 3]
			}];
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("objects with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			// @ts-ignore
			newGroup.objects = true;
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("object with empty array should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					newGroup.objects = [];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							done(err);
						});
				}

			], done);

		});

		it("name with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.name = true;
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("issue_id with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.issue_id = true;
			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("group with both rules and objects should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.objects = [{
				"account":"groupUser",
				"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
				"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
			}];
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "GTE",
				values: [1]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("no values for a rule that requires them should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "REGEX",
				values: []
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("incorrect number of values for rule should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "IN_RANGE",
				values: [2]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("incorrect mulitples of value for rule should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "NOT_IN_RANGE",
				values: [2, 3, 4]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("string value for number rule should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "EQUALS",
				values: ["one"]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with multi value REGEX rule should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["Family"] },
				operator: "REGEX",
				values: ["Concept.*Door.*", ".*mm$"]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with multi value REGEX rule in field should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "REGEX", values: ["Concept.*Door.*", ".*mm$"] },
				operator: "REGEX",
				values: ["Concept.*Door.*"]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("rule with undefined operator should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "IS", values: ["TestField"] },
				operator: "BAD_OP",
				values: ["abc"]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("rule with undefined operator in field should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			newGroup.rules = [{
				name: "rule name",
				field: { operator: "BAD_OP", values: ["TestField"] },
				operator: "IS",
				values: ["abc"]
			}];

			agent.post(`/${username}/${model}/revision/master/head/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with rule that returns no objects should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["ImaginaryField"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects).to.deep.equal([]);
							done(err);
						});
				}
			], done);
		});

		it("with rules in federation should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["IsExternal"] },
						operator: "IS_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${federation}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200, function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${federation}/revision/master/head/groups/${groupId}`)
						.expect(200, function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(74);
							done(err);
						});
				}
			], done);
		});

		it("with IS_EMPTY rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["IsExternal"] },
						operator: "IS_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(74);
							done(err);
						});
				}
			], done);
		});

		it("with IS_NOT_EMPTY rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Moves With Grids"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(66);
							done(err);
						});
				}
			], done);
		});

		it("non string value for a string rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "CONTAINS", values: ["a"] },
						operator: "CONTAINS",
						values: [1]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("non string value for a string rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "CONTAINS", values: [1] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];

					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with IS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["IFC Type"] },
						operator: "IS",
						values: ["IfcStairFlight"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(24);
							done(err);
						});
				}
			], done);
		});

		it("with multi value IS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["IFC Type"] },
						operator: "IS",
						values: ["IfcStairFlight", "IfcSlab"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(117);
							done(err);
						});
				}
			], done);
		});

		it("with IS_NOT rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Name"] },
						operator: "IS_NOT",
						values: ["Level 2"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(957);
							done(err);
						});
				}
			], done);
		});

		it("with multi value IS_NOT rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Name"] },
						operator: "IS_NOT",
						values: ["Level 2", "Level 4"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(828);
							done(err);
						});
				}
			], done);
		});

		it("with CONTAINS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Reference"] },
						operator: "CONTAINS",
						values: ["Flue"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'3b81d73b-984e-4de0-8cb1-e0b5550d4474',
								'e26f9864-172f-43cf-81ab-e4f3b73b2fb6',
								'92f1e3ef-83c0-4e2f-919f-38c492d3b5cb',
								'f91136b8-52da-4bb3-9285-801c40e6a95d',
								'ee0297f8-11b0-4258-b6bf-1f49382606dc',
								'083bc3fd-4459-453c-805e-a1a4a88eff81',
								'6848f76d-dbc9-4f5a-99f7-5c097b72ee02',
								'0eae5b17-ff9b-4834-a919-554ada7e18f4'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with multi value CONTAINS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Reference"] },
						operator: "CONTAINS",
						values: ["Flue", "Panel"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(116);
							done(err);
						});
				}
			], done);
		});

		it("with NOT_CONTAINS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Type"] },
						operator: "NOT_CONTAINS",
						values: ["Generator"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1102);
							done(err);
						});
				}
			], done);
		});

		it("with multi value NOT_CONTAINS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Type"] },
						operator: "NOT_CONTAINS",
						values: ["Mast", "Infill", "Concept"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(454);
							done(err);
						});
				}
			], done);
		});

		it("with REGEX rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Family"] },
						operator: "REGEX",
						values: ["Concept.*Door.*"]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'38b300ae-8cd5-4a1a-b100-51f3864567d5',
								'c40df332-7aec-423a-ba67-fbc5964990f7',
								'29c355e5-9afb-45cd-9305-4e87008f37a2',
								'c4a17a1c-ecc9-4864-977b-e6fba4459285',
								'53de1ad8-f423-4dd4-828b-3c0f2b521254',
								'94f84a02-0ce7-4d51-9ac1-5ffc62f17958',
								'47bf2108-b783-48d2-979e-6966eecf9ae0',
								'bdbd8371-1a42-4c40-a020-e533376d9be2',
								'f841f711-0f2d-4803-a51b-3b51999abd45',
								'fba62ccd-9de6-40b7-90ef-e2b2e60fe3af',
								'e04e0c18-ce90-4dbc-ad7c-aec0407a551f',
								'163bdd8d-2a0a-4aae-9223-93921a21444b',
								'67a1f99f-0a41-4e4a-adc4-82a027635454',
								'a667d2e8-dbe5-42cd-baf9-b570921dcd78'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with EQUALS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Volume"] },
						operator: "EQUALS",
						values: [0.28757]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [ 'a667d2e8-dbe5-42cd-baf9-b570921dcd78' ];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with multi value EQUALS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Volume"] },
						operator: "EQUALS",
						values: [0.28757, 0.194819]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'17bcab65-d5cf-4f8c-9bdf-9349ef30d8fe',
								'41d4cfe3-717b-463b-9f49-f89d7315cc11',
								'a667d2e8-dbe5-42cd-baf9-b570921dcd78'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with NOT_EQUALS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Sill Height"] },
						operator: "NOT_EQUALS",
						values: [0]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(178);
							done(err);
						});
				}
			], done);
		});

		it("with multi value NOT_EQUALS rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Sill Height"] },
						operator: "NOT_EQUALS",
						values: [0, 2700, 900]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(29);
							done(err);
						});
				}
			], done);
		});

		it("with GT rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Area"] },
						operator: "GT",
						values: [500]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'99579903-b5e7-485d-8c44-09ab25cab0dc',
								'9928686a-beb0-4141-99da-21c5e0442834',
								'13d63580-4dd8-4a10-b841-1c588e5faa9f',
								'51b795b7-4790-4376-ad5c-6eaf7fa28fc8',
								'c4271f23-970d-498a-b778-a94dec376a5d',
								'ccd7d618-b0de-4517-8ad0-ed597c7de3df',
								'03d0e634-d37e-4765-a06c-d0636136e1db',
								'120fb04f-b051-4e0d-8252-00833df5cc43',
								'0c541b2b-ffb2-4171-b8a2-cc6a019e5909'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with multi value GT rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Area"] },
						operator: "GT",
						values: [500, 600]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'99579903-b5e7-485d-8c44-09ab25cab0dc',
								'9928686a-beb0-4141-99da-21c5e0442834',
								'13d63580-4dd8-4a10-b841-1c588e5faa9f',
								'51b795b7-4790-4376-ad5c-6eaf7fa28fc8',
								'c4271f23-970d-498a-b778-a94dec376a5d',
								'ccd7d618-b0de-4517-8ad0-ed597c7de3df',
								'03d0e634-d37e-4765-a06c-d0636136e1db',
								'120fb04f-b051-4e0d-8252-00833df5cc43',
								'0c541b2b-ffb2-4171-b8a2-cc6a019e5909'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with GTE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Mark"] },
						operator: "GTE",
						values: [750]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'39f85d38-14b8-4eca-b89d-75ad019caca0',
								'4d9899cc-303a-453c-a2a5-3a4c8f08529f',
								'6c64bc3d-6b6d-464f-b354-659eb5b8275e',
								'35df7c93-29e7-477b-8ecd-239963fbd878',
								'0c919791-8e51-49d0-9302-5f199f730058',
								'a2a18ff2-bf59-4056-85d3-b1f20f2b89df',
								'f06b77de-2fe1-404d-a395-1eeb75d2412a',
								'ca03296a-7195-4c3a-ae94-78ec76e0ba95',
								'c905acbb-231a-4f47-ac5f-f266aa1f87a0',
								'e3b1b0b9-6f27-4e2d-a80f-ce62dcdc67b0',
								'97f6c222-4328-4123-bdfd-7357f88ce6b3',
								'662de408-f2b6-40e6-a515-eaa7c2440492',
								'600ae205-3d28-4246-b958-c59b9738ca20',
								'7609aaaa-7c39-4685-bc13-3e4a7fbcdf3e'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with multi value GTE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Mark"] },
						operator: "GTE",
						values: [750, 800]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'39f85d38-14b8-4eca-b89d-75ad019caca0',
								'4d9899cc-303a-453c-a2a5-3a4c8f08529f',
								'6c64bc3d-6b6d-464f-b354-659eb5b8275e',
								'35df7c93-29e7-477b-8ecd-239963fbd878',
								'0c919791-8e51-49d0-9302-5f199f730058',
								'a2a18ff2-bf59-4056-85d3-b1f20f2b89df',
								'f06b77de-2fe1-404d-a395-1eeb75d2412a',
								'ca03296a-7195-4c3a-ae94-78ec76e0ba95',
								'c905acbb-231a-4f47-ac5f-f266aa1f87a0',
								'e3b1b0b9-6f27-4e2d-a80f-ce62dcdc67b0',
								'97f6c222-4328-4123-bdfd-7357f88ce6b3',
								'662de408-f2b6-40e6-a515-eaa7c2440492',
								'600ae205-3d28-4246-b958-c59b9738ca20',
								'7609aaaa-7c39-4685-bc13-3e4a7fbcdf3e'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with LT rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Light Transmission"] },
						operator: "LT",
						values: [1]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(99);
							done(err);
						});
				}
			], done);
		});

		it("with multi value LT rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Mark"] },
						operator: "LT",
						values: [180, 200]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(31);
							done(err);
						});
				}
			], done);
		});

		it("with LTE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Thermal Performance"] },
						operator: "LTE",
						values: [0.5]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'99579903-b5e7-485d-8c44-09ab25cab0dc',
								'13d63580-4dd8-4a10-b841-1c588e5faa9f',
								'51b795b7-4790-4376-ad5c-6eaf7fa28fc8',
								'c4271f23-970d-498a-b778-a94dec376a5d',
								'ccd7d618-b0de-4517-8ad0-ed597c7de3df',
								'03d0e634-d37e-4765-a06c-d0636136e1db',
								'120fb04f-b051-4e0d-8252-00833df5cc43',
								'0c541b2b-ffb2-4171-b8a2-cc6a019e5909'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(99);
							done(err);
						});
				}
			], done);
		});

		it("with multi value LTE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Thermal Performance"] },
						operator: "LTE",
						values: [0.5, 1]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'99579903-b5e7-485d-8c44-09ab25cab0dc',
								'13d63580-4dd8-4a10-b841-1c588e5faa9f',
								'51b795b7-4790-4376-ad5c-6eaf7fa28fc8',
								'c4271f23-970d-498a-b778-a94dec376a5d',
								'ccd7d618-b0de-4517-8ad0-ed597c7de3df',
								'03d0e634-d37e-4765-a06c-d0636136e1db',
								'120fb04f-b051-4e0d-8252-00833df5cc43',
								'0c541b2b-ffb2-4171-b8a2-cc6a019e5909'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(99);
							done(err);
						});
				}
			], done);
		});

		it("with IN_RANGE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Head Height"] },
						operator: "IN_RANGE",
						values: [4520, 4530]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(33);
							done(err);
						});
				}
			], done);
		});

		it("with multi value IN_RANGE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Head Height"] },
						operator: "IN_RANGE",
						values: [4520, 4530, 200, 3000]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(175);
							done(err);
						});
				}
			], done);
		});

		it("with NOT_IN_RANGE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Area"] },
						operator: "NOT_IN_RANGE",
						values: [0, 1000]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'9928686a-beb0-4141-99da-21c5e0442834',
								'13d63580-4dd8-4a10-b841-1c588e5faa9f',
								'ccd7d618-b0de-4517-8ad0-ed597c7de3df',
								'03d0e634-d37e-4765-a06c-d0636136e1db',
								'120fb04f-b051-4e0d-8252-00833df5cc43'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with multi value NOT_IN_RANGE rule should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Area"] },
						operator: "NOT_IN_RANGE",
						values: [0, 1000, 1000, 1650]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'13d63580-4dd8-4a10-b841-1c588e5faa9f',
								'ccd7d618-b0de-4517-8ad0-ed597c7de3df',
								'120fb04f-b051-4e0d-8252-00833df5cc43'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});

		it("with multi value multi rules should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["Area"] },
						operator: "NOT_IN_RANGE",
						values: [0, 1000, 1000, 1650]
					},{
						name: "rule name",
						field: { operator: "IS", values: ["Perimeter"] },
						operator: "LT",
						values: [238000]
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							const expectedSharedIds = [
								'13d63580-4dd8-4a10-b841-1c588e5faa9f'
							];
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids).to.deep.equal(expectedSharedIds);
							done(err);
						});
				}
			], done);
		});


		it("with mix of IS and NOT_IS should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [
						{
						   "name": "rule name",
						   "field": { "operator": "IS", "values": ["Name"] },
						   "operator":"IS",
						   "values":[
							  "Level 3",
							  "Level 1"
						   ]
						},
						{
						   "name": "rule name",
						   "field": { "operator": "IS", "values": ["Category"] },
						   "operator":"IS_NOT",
						   "values":[
							  "Windows"
						   ]
						}
					 ];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(200);
							done(err);
						});
				}
			], done);
		});

		it("with IS rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["IFC Type"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with multi value IS rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "IS", values: ["IFC Type", "Family"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with STARTS_WITH rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "STARTS_WITH", values: ["IFC"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with multi value STARTS_WITH rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "STARTS_WITH", values: ["IFC", "Family"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with ENDS_WITH rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "ENDS_WITH", values: ["Type"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with multi value ENDS_WITH rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "ENDS_WITH", values: ["Type", "Name"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with CONTAINS rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "CONTAINS", values: ["IFC"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with multi value CONTAINS rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "CONTAINS", values: ["IFC", "Family"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});

		it("with REGEX rule in field should succeed", function(done) {
			let groupId;

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						name: "rule name",
						field: { operator: "REGEX", values: ["^IFC"] },
						operator: "IS_NOT_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/revision/master/head/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							groupId = res.body._id;
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${groupId}`)
						.expect(200 , function(err, res) {
							expect(res.body.author).to.equal(username);
							expect(res.body.objects[0].shared_ids.length).to.equal(1106);
							done(err);
						});
				}
			], done);
		});
});

	describe("Updating a group ", function() {
		it("updating only the objects should succeed", function(done) {
			const newObjects = {objects: []};

			async.series([
				function(done) {
					agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.send(newObjects)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							Object.assign(goldenData, newObjects);
							goldenData.updatedAt = res.body.updatedAt;
							expect(res.body).to.deep.equal(goldenData);
							done(err);
						});
				}

			], done);
		});

		it("updating rules and removing objects should succeed", function(done) {
			const newRules = {
				rules: [{
					name: "rule name",
					field: { operator: "IS", values: ["TestField"] },
					operator: "GTE",
					values: [1]
				}]
			};

			async.series([
				function(done) {
					agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.send(newRules)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							Object.assign(goldenData, newRules);
							goldenData.updatedAt = res.body.updatedAt;
							expect(res.body).to.deep.equal(goldenData);
							done(err);
						});
				}

			], done);
		});

		it("updating rules with string field should succeed", function(done) {
			const newRules = {
				rules: [{
					name: "rule name",
					field: "TestField",
					operator: "GTE",
					values: [1]
				}]
			};

			async.series([
				function(done) {
					agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.send(newRules)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							goldenData.rules = [{
								name: "rule name",
								field: { operator: "IS", values: ["TestField"] },
								operator: "GTE",
								values: [1]
							}];
							goldenData.updatedAt = res.body.updatedAt;
							expect(res.body).to.deep.equal(goldenData);
							done(err);
						});
				}

			], done);
		});

		it("updating only the name should succeed", function(done) {
			const newName = {name: "Updated name"};

			async.series([
				function(done) {
					agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.send(newName)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							Object.assign(goldenData, newName);
							goldenData.rules = [{
								name: "rule name",
								field: { operator: "IS", values: ["TestField"] },
								operator: "GTE",
								values: [1]
							}];
							goldenData.updatedAt = res.body.updatedAt;
							expect(res.body).to.deep.equal(goldenData);
							done(err);
						});
				}

			], done);
		});

		it("updating only the color should succeed", function(done) {
			const newColor = {color: [255,192,203]};

			async.series([
				function(done) {
					agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.send(newColor)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							Object.assign(goldenData, newColor);
							goldenData.rules = [{
								name: "rule name",
								field: { operator: "IS", values: ["TestField"] },
								operator: "GTE",
								values: [1]
							}];
							goldenData.updatedAt = res.body.updatedAt;
							expect(res.body).to.deep.equal(goldenData);
							done(err);
						});
				}

			], done);
		});

		it("updating only the description should succeed", function(done) {
			const newDesc = {description: "new description"};

			async.series([
				function(done) {
					agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.send(newDesc)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							Object.assign(goldenData, newDesc);
							goldenData.rules = [{
								name: "rule name",
								field: { operator: "IS", values: ["TestField"] },
								operator: "GTE",
								values: [1]
							}];
							goldenData.updatedAt = res.body.updatedAt;
							expect(res.body).to.deep.equal(goldenData);
							done(err);
						});
				}

			], done);
		});

		it("updating with both rules and objects should fail", function(done) {
			const badUpdate = {
				"objects":[
					{
						"account":"groupUser",
						"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
						"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}
				],
				"rules":[{
					name: "rule name",
					field: { operator: "IS", values: ["TestField"] },
					operator: "GTE",
					values: [1]
				}]
			};

			agent.put(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
				.send(badUpdate)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("updating invalid group ID should fail", function(done) {
			agent.put(`/${username}/${model}/revision/master/head/groups/invalidID`)
				.send({objects: []})
				.expect(404 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.GROUP_NOT_FOUND.value);
					done(err);
				});
		});
	});

	describe("Delete group ", function() {
		it("delete group with valid group ID should succeed", function(done) {
			async.series([
				function(done) {
					agent.delete(`/${username}/${model}/groups?ids=${goldenData._id}`)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(404 , function(err, res) {
							expect(res.body.value).to.equal(responseCodes.GROUP_NOT_FOUND.value);
							done(err);
						});
				}

			], done);
		});

		it("delete invalid group ID should succeed", function(done) {
			agent.delete(`/${username}/${model}/groups?ids=invalidID`)
				.expect(200 , function(err, res) {
					done(err);
				});
		});

	});

	describe("Delete groups ", function() {
		it("delete group no query string should succeed", function(done) {
				agent.delete(`/${username}/${model}/groups?ids=${goldenData._id}/`)
					.expect(200 , function(err, res) {
						done(err);
					});
		});

		it("delete group invalid group ID should succeed", function(done) {
			agent.delete(`/${username}/${model}/groups?ids=a,b,c,d,e`)
				.send({objects: []})
				.expect(200 , function(err, res) {
					done(err);
				});
		});

		it("delete groups with valid IDs should succeed", function(done){
			this.timeout(5000); 
			let idsString = null;
			async.series([
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							const ids = res.body.map((group) => group._id);
							idsString = ids.join();
							done(err);
						});
				},
				function(done) {
					agent.delete(`/${username}/${model}/groups?ids=${idsString}`)
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(0);
							done(err);
						});
				}
			], done);

		});
	});



});

