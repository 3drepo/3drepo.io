"use strict";

/**
 *  Copyright (C) 2017 3D Repo Ltd
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
const logger = require("../../logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Projects", function () {

	let server;
	let agent;
	const username = "projectuser";
	const password = "projectuser";

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

	it("should able to create project", function(done) {

		const project = {
			name: "project1"
		};

		async.series([

			callback => {
				agent.post(`/${username}/projects`)
					.send(project)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				agent.get(`/${username}.json`)
					.expect(200, function(err, res) {
						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find(pg => pg.name === project.name);
						expect(pg).to.exist;

						callback(err);
					});
			}

		], (err, res) => done(err));
	});

	it("should fail to create project with name default", function(done) {
		agent.post(`/${username}/projects`)
			.send({name: "default"})
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it("should fail to create project with dup name", function(done) {

		const project = {
			name: "project_exists"
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.PROJECT_EXIST.value);
				done(err);
			});
	});

	it("should fail to create project with invalid name(1)", function(done) {

		const project = {
			name: " "
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it("should fail to create project with invalid name(2)", function(done) {

		const project = {
			name: "!?/#&"
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it("should fail to create project with no name", function(done) {

		const project = {
			name: ""
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it("should fail to create project with name longer than 120 characters", function(done) {

		const project = {
			name: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it("should be able to update project", function(done) {

		const project = {
			name: "project2",
			permissions: [{
				user: "testing",
				permissions: ["create_model", "edit_project"]
			}]
		};

		async.series([

			callback => {
				agent.put(`/${username}/projects/${project.name}`)
					.send(project)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				agent.get(`/${username}/projects/${project.name}`)
					.expect(200, function(err, res) {
						const entriesFiltered = res.body.permissions.filter((entry => {
							return entry.permissions.length > 0;
						}));
						expect(entriesFiltered).to.deep.equal(project.permissions);
						callback(err);
					});
			}

		], (err, res) => done(err));
	});

	it("should be able to update project name", function(done) {

		const project = {
			name: "project2_new"
		};

		async.series([

			callback => {
				agent.put(`/${username}/projects/project2`)
					.send(project)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				agent.get(`/${username}.json`)
					.expect(200, function(err, res) {

						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find(pg => pg.name === project.name);
						expect(pg).to.exist;

						callback(err);
					});
			}

		], (err, res) => done(err));
	});

	it("should fail to update project for invalid permissions", function(done) {

		const project = {
			name: "project3",
			permissions: [{
				user: "testing",
				permissions: ["create_issue"]
			}]
		};

		agent.put(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
				done(err);
			});
	});

	it("should fail to assign permission to unlicensed user", function(done) {
		const project = {
			name: "project3",
			permissions: [{
				user: "metaTest",
				permissions: ["edit_project"]
			}]
		};

		agent.put(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
	});

	it("should able to delete project", function(done) {

		const project = {
			name: "project4"
		};

		async.series([

			callback => {
				agent.delete(`/${username}/projects/${project.name}`)
					.expect(200, function(err, res) {
						callback(err);
					});

			},

			callback => {
				agent.get(`/${username}.json`)
					.expect(200, function(err, res) {

						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find(pg => pg.name === project.name);
						expect(pg).to.not.exist;

						callback(err);
					});
			}

		], (err, res) => done(err));

	});

	it("should fail to update a project that doesnt exist", function(done) {
		agent.put(`/${username}/projects/notexist`)
			.send({})
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
	});

	it("should fail to delete a project that doesnt exist", function(done) {
		agent.delete(`/${username}/projects/notexist`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
	});

});
