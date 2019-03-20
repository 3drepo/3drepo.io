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

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Groups", function () {

	let server;
	let agent;

	const username = "groupUser";
	const viewerUser = "issue_username2";
	const noAccessUser = "issue_username";
	const password = "password";

	const model = "4ec71fdd-0450-4b6f-8478-c46633bb66e3";

	const goldenData = {
		"_id":"0e2f7fa0-7ac5-11e8-9567-6b401a084a90",
		"color":[98,126,184],
		"objects":[
			{
				"account":"groupUser",
				"model":"4ec71fdd-0450-4b6f-8478-c46633bb66e3",
				"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
			}
		]
	};


	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
				.send({ username, password })
				.expect(200, function(err, res) {
					expect(res.body.username).to.equal(username);
					done(err);
				});
		});

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

		it("with invalid revision ID should fail", function(done){
			agent.get(`/${username}/${model}/revision/f640aa3dec2/groups/${groupID}`)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
					done(err);
				});
		});

		it("with some other teamspace should fail", function(done){
			agent.get(`/${noAccessUser}/${model}/revision/f640aa3dec2/groups/${groupID}`)
				.expect(401 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.NOT_AUTHORIZED.value);
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

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/groups/`)
						.send(data)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(3);
							done(err);
						});
				}

			], done);

		});

		it("with rules instead of objects should succeed", function(done) {

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						field: "TestField",
						operator: "GTE",
						values: [1]
					}];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(4);
							done(err);
						});
				}

			], done);

		});

		it("with rules (0 args) should succeed", function(done) {

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						field: "TestField",
						operator: "IS_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(5);
							done(err);
						});
				}

			], done);

		});

		it("with rules (2 args) should succeed", function(done) {

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						field: "TestField",
						operator: "IN_RANGE",
						values: [1, 2]
					}];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(6);
							done(err);
						});
				}

			], done);

		});

		it("with rules (multi args) should succeed", function(done) {

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						field: "TestField",
						operator: "EQUALS",
						values: [1, 2, 3]
					}];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(7);
							done(err);
						});
				}

			], done);

		});

		it("with rules (multi arg pairs) should succeed", function(done) {

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						field: "TestField",
						operator: "NOT_IN_RANGE",
						values: [1, 2, 3, 4]
					}];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(8);
							done(err);
						});
				}

			], done);

		});

		it("with multiple rules should succeed", function(done) {

			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.objects;
					newGroup.rules = [{
						field: "TestField",
						operator: "NOT_IN_RANGE",
						values: [3, 4]
					},{
						field: "TestField2",
						operator: "IS_EMPTY",
						values: []
					}];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(9);
							done(err);
						});
				}

			], done);

		});

		it("without color should succeed", function(done) {
			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					delete newGroup.color;
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(10);
							done(err);
						});
				}

			], done);

		});

		it("color with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.color = true;
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					console.log(res.body);
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
		});


		it("without rules or objects field should fail", function(done) {
			const newGroup = Object.assign({}, data);
			delete newGroup.objects;
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with rules and objects should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.rules = [{
				field: "TestField",
				operator: "GTE",
				values: [1]
			}];
			agent.post(`/${username}/${model}/groups/`)
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
				field: "TestField",
				operator: "GT",
				values: []
			}];
			agent.post(`/${username}/${model}/groups/`)
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
				field: "TestField",
				operator: "NOT_IN_RANGE",
				values: [1]
			}];
			agent.post(`/${username}/${model}/groups/`)
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
				field: "TestField",
				operator: "NOT_IN_RANGE",
				values: [1, 2, 3]
			}];
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
			});
		});

		it("objects with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.objects = true;
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("object with empty array should succeed", function(done) {
			async.series([
				function(done) {
					const newGroup = Object.assign({}, data);
					newGroup.object = [];
					agent.post(`/${username}/${model}/groups/`)
						.send(newGroup)
						.expect(200 , function(err, res) {
							done(err);
					});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/?noIssues=true`)
						.expect(200 , function(err, res) {
							expect(res.body.length).to.equal(11);
							done(err);
						});
				}

			], done);

		});

		it("name with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.name = true;
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("issue_id with wrong type should fail", function(done) {
			const newGroup = Object.assign({}, data);
			newGroup.issue_id = true;
			agent.post(`/${username}/${model}/groups/`)
				.send(newGroup)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});
	});

	describe("Updating a group ", function() {
		it("updating only the objects should succeed", function(done) {
			async.series([
				function(done) {
					agent.put(`/${username}/${model}/groups/${goldenData._id}`)
						.send({objects: []})
						.expect(200 , function(err, res) {
							done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${goldenData._id}`)
						.expect(200 , function(err, res) {
							const expectedData = Object.assign({}, goldenData);
							expectedData.objects = [];
							expect(res.body).to.deep.equal(expectedData);
							done(err);
						});
				}

			], done);


		});

		it("updating invalid group ID should fail", function(done) {
			agent.put(`/${username}/${model}/groups/invalidID`)
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
					agent.delete(`/${username}/${model}/groups/${goldenData._id}`)
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
			agent.delete(`/${username}/${model}/groups/invalidID`)
				.expect(200 , function(err, res) {
					done(err);
				});
		});

	});

	describe("Delete groups ", function() {
		it("delete group no query string should succeed", function(done) {
				agent.delete(`/${username}/${model}/groups/${goldenData._id}/`)
					.expect(200 , function(err, res) {
						done(err);
					});
		});

		it("delete group invalid group ID should succeed", function(done) {
			agent.delete(`/${username}/${model}/groups/invalidID?ids=a,b,c,d,e`)
				.send({objects: []})
				.expect(200 , function(err, res) {
					done(err);
				});
		});

		it("delete groups with valid IDs should succeed", function(done){
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
					agent.delete(`/${username}/${model}/groups/?ids=${idsString}`)
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

