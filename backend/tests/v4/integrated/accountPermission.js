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

const SessionTracker = require("../../v4/helpers/sessionTracker");
const app = require("../../../src/v4/services/api.js").createApp();
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");
const { findModelSettingById } = require("../../../src/v4/models/modelSetting.js");
const { findProjectPermsByUser } = require("../../../src/v4/models/project.js");

describe("Account permission::", function () {

	let server;
	let agent;
	const username = "accountPerm";
	const password = "accountPerm";
	const project = 'Sample_Project';
	const model = '76a1ddb0-b048-45d5-9477-973cfd61b9e2';
	let testSession;

	before(function(done) {
		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request(server);
			testSession = SessionTracker(agent);
			testSession.login(username, password).then(()=> {done()});
		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("should fail to assign permissions to a user that doesnt exist", function(done) {
		testSession.post(`/${username}/permissions`)
			.send({ user: "nonsense", permissions: ["create_project"]})
			.expect(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.status, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
	});

	it("should fail to assign non team space permissions to a user", function(done) {
		testSession.post(`/${username}/permissions`)
			.send({ user: "issue_username", permissions: ["create_project"]})
			.expect(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.status, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
	});

	it("should fail to assign invalid permissions to a user", async function() {
		const { body } = await testSession.post(`/${username}/permissions`)
			.send({ user: "user1", permissions: ["view_issue"]});

		expect(body.value).to.equal(responseCodes.INVALID_PERM.value);
	});

	it("should be able to assign permissions to a user", async function() {

		const permission = { user: "testing", permissions: ["create_project"]};

		await testSession.post(`/${username}/permissions`)
					.send(permission)
					.expect(200);

		const {body} = await testSession.get(`/${username}/permissions`)
					.expect(200);

		expect(body.find(perm => perm.user === permission.user)).to.deep.equal(permission);
	});

	it("should remove model and project permissions if a user becomes teamspace admin", async function() {
		const permission = { user: "testing", permissions: ["teamspace_admin"]};

		await testSession.post(`/${username}/permissions`)
					.send(permission)
					.expect(200);

		const {body} = await testSession.get(`/${username}/permissions`)
					.expect(200);

		expect(body.find(perm => perm.user === permission.user)).to.deep.equal(permission);

		const newProjectPermissions = await findProjectPermsByUser(username, project, "testing");
		expect(newProjectPermissions).to.deep.equal(undefined);

		const newModelPermissions = await findModelSettingById(username, model, { 'permissions': 1 });
		expect(newModelPermissions.permissions.find(p => p.user === "testing")).to.deep.equal(undefined);
	});

	it("should not be able to assign permissions of owner", function(done) {

		const permission = { permissions: ["create_project"]};

		testSession.put(`/${username}/permissions/${username}`)
			.send(permission)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.OWNER_MUST_BE_ADMIN.value);
				done(err);
		});
	});

	it("should not be able to create permissions of owner", function(done) {

		const permission = { user: username, permissions: ["create_project"]};

		testSession.post(`/${username}/permissions`)
			.send(permission)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.OWNER_MUST_BE_ADMIN.value);
				done(err);
		});
	});

	it("should not be able to assign permissions without providing a user name", function(done) {

		const permission = { permissions: ["create_project"]};

		async.series([
			callback => {
				testSession.post(`/${username}/permissions`)
					.send(permission)
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						callback(err);
					});
			}

		], (err, res) => done(err));

	});

	it("should not be able to assign permissions without permissions", function(done) {
		const permission = { user: "testing2"};

		async.series([
			callback => {
				testSession.post(`/${username}/permissions`)
					.send(permission)
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						callback(err);
					});
			}
		], (err, res) => done(err));

	});

	it("should NOT able to update users permissions without providing a set of new permissions", function(done) {

		async.series([
			callback => {
				testSession.put(`/${username}/permissions/user2`)
					.send({ })
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						callback(err);
					});
			}

		], (err, res) => done(err));

	});

	it("should be able to update users permissions", function(done) {
		async.series([
			callback => {
				testSession.put(`/${username}/permissions/user2`)
					.send({ "permissions": []})
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				testSession.get(`/${username}/permissions`)
					.expect(200, function(err, res) {
						expect(res.body.find(perm => perm.user === "user2")).to.deep.equal({user: "user2", permissions:[]});
						callback(err);
					});
			}

		], (err, res) => done(err));

	});

	it("should not be able to update user's permissions after it has been removed", async function() {
		await testSession.put(`/${username}/permissions/user2`)
					.send({ permissions: ["create_project"]})
					.expect(404);

		const {body} = await testSession.get(`/${username}/permissions`)
					.expect(200);

		expect(body.find(perm => perm.user === "user2")).to.deep.equal({user: "user2", permissions:[]});
	});

	it("should be able to add user's permissions after it has been removed", function(done) {

		const permission = { user: "user2", permissions: ["create_project"]};

		async.series([
			callback => {
				testSession.post(`/${username}/permissions`)
					.send(permission)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				testSession.get(`/${username}/permissions`)
					.expect(200, function(err, res) {

						expect(res.body.find(perm => perm.user === permission.user)).to.deep.equal(permission);
						callback(err);
					});
			}
		], (err, res) => done(err));

	});

	it("should fail to update non team space permissions", function(done) {
		testSession.put(`/${username}/permissions/user2`)
			.send({ permissions: ["view_issue"]})
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
				done(err);
			});
	});

	it("should able to assign permissions to a user twice and the second time will just update the permissions", function(done) {

		async.series([
			function(done) {
				testSession.post(`/${username}/permissions`)
					.send({ user: "user3", permissions: ["teamspace_admin", "create_project"]})
					.expect(200, function(err, res) {
						done(err);
					});
			},
			function(done) {
				testSession.get(`/${username}/permissions`)
					.expect(200, function(err, res) {
						const permissions = res.body.filter(p => p.user === "user3");
						expect(permissions.length).to.equal(1);
						expect(permissions[0].permissions).to.deep.equal(["teamspace_admin", "create_project"]);
						done(err);
					});
			}
		], done);

	});

	it("should fail to update permission for an non existing record", function(done) {
		testSession.put(`/${username}/permissions/user4`)
			.send({ permissions: ["create_project"]})
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.ACCOUNT_PERM_NOT_FOUND.value);
				done(err);
			});
	});

	it("should fail to remove permission for an non existing record", function(done) {
		testSession.delete(`/${username}/permissions/user4`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.ACCOUNT_PERM_NOT_FOUND.value);
				done(err);
			});
	});

	it("should able to remove user permission", function(done) {

		async.series([
			callback => {
				testSession.delete(`/${username}/permissions/user3`)
					.expect(200, function(err, res) {
						callback(err);
					});
			},

			callback => {
				testSession.get(`/${username}/permissions`)
					.expect(200, function(err, res) {
						expect(res.body.find(perm => perm.user === "user3").permissions.length).to.equal(0);
						callback(err);
					});
			}

		], (err, res) => done(err));
	});

	const projectName = "project567";

	it("should able to create_project on other teamspace if given create_project on the target teamspace", function(done) {

		const teamspace = "testing";

		testSession.post(`/${teamspace}/projects`)
			.send({ name: projectName })
			.expect(200, done);
	});

	it("should able to access the project created by the users themselves", function(done) {

		const teamspace = "testing";

		testSession.get(`/${teamspace}/projects/${projectName}`)
			.expect(200, done);
	});

	it("non teamspace admin users will have permissions revoked on any projects including the one created by themselves if parent teamspace level permissions has been revoked", async function() {
		const teamspace = "testing";

		const adminSession = SessionTracker(agent);
		await adminSession.login("testing","testing");

		await adminSession.delete(`/${teamspace}/permissions/${username}`)
			.expect(200);

		await testSession.get(`/${teamspace}/projects/${projectName}`)
			.expect(401);
	});

});
