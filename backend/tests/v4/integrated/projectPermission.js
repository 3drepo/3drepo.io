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
const SessionTracker = require("../../v4/helpers/sessionTracker")
const expect = require("chai").expect;
const { createAppAsync } = require("../../../src/v4/services/api.js");
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");

describe("Project Permissions::", function () {

	let server;
	let agentCanCreateModel;
	let agentCanCreateFed;
	let agentNoPermission;
	let agentCanUpdateProject;
	let agentProjectAdmin;
	let agentTeamspaceAdmin;

	const teamspace = "projperm";
	const project = "project1";

	const userCanCreateModel = {
		username: "projectuser",
		password: "projectuser"
	};

	const userCanCreateFed = {
		username: "projectuser2",
		password: "projectuser2"
	};

	const userCanUpdateProject = {
		username: "projectuser4",
		password: "projectuser4"
	};

	const userProjectAdmin = {
		username: "projectuser3",
		password: "projectuser3"
	};

	const userNoPermission = {
		username: "testing",
		password: "testing"
	};

	const modelDetail = {
		desc: "desc",
		type: "type",
		unit: "m",
		code: "00123",
		project: project
	};

	before(async function() {
		const app = await createAppAsync();
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log("API test server is listening on port 8080!");
				resolve();
			});
		});

		agentTeamspaceAdmin = SessionTracker(request(server));
		await agentTeamspaceAdmin.login(teamspace, teamspace);

		agentCanCreateModel = SessionTracker(request(server));
		await agentCanCreateModel.login(userCanCreateModel.username, userCanCreateModel.password);

		agentCanCreateFed = SessionTracker(request(server));
		await agentCanCreateFed.login(userCanCreateFed.username, userCanCreateFed.password);

		agentCanUpdateProject = SessionTracker(request(server));
		await agentCanUpdateProject.login(userCanUpdateProject.username, userCanUpdateProject.password);

		agentProjectAdmin = SessionTracker(request(server));
		await agentProjectAdmin.login(userProjectAdmin.username, userProjectAdmin.password);

		agentNoPermission = SessionTracker(request(server));
		await agentNoPermission.login(userNoPermission.username, userNoPermission.password);

	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("user without create_model permission on a project cannot create model/federation using V4 endpoints - endpoint decommissioned", function(done) {

		const modelName = "model001";

		agentNoPermission
			.post(`/${teamspace}/model`)
			.send(Object.assign({modelName: modelName}, modelDetail))
			.expect(410, done);
	});

	it("user without edit_project permission on a project cannot edit project", function(done) {

		agentNoPermission
			.put(`/${teamspace}/projects/${project}`)
			.send({ name: project})
			.expect(401, function(err, res) {
				done(err);
			});

	});

	let modelId;

	it("user with create_model permission on a project cannot create model/federation using V4 endpoints - endpoint decommissioned", function(done) {

		const modelName = "model001";

		agentCanCreateModel
			.post(`/${teamspace}/model`)
			.send(Object.assign({modelName: modelName}, modelDetail))
			.expect(410, done);
	});

	it("get project permissions will show all subscription users", function(done) {

		agentTeamspaceAdmin
			.get(`/${teamspace}/projects/project3`)
			.expect(200, function(err, res) {

				expect(err).to.be.null;
				expect(res.body.permissions).to.exist;

				const permissions = res.body.permissions;

				expect(permissions.find(p => p.user === userProjectAdmin.username)).to.deep.equal({ user: userProjectAdmin.username, permissions: ["admin_project"]});
				expect(permissions.find(p => p.user === "projectuser")).to.deep.equal({ user: "projectuser", permissions: []});
				expect(permissions.find(p => p.user === "projectuser2")).to.deep.equal({ user: "projectuser2", permissions: []});
				expect(permissions.find(p => p.user === "projectuser4")).to.deep.equal({ user: "projectuser4", permissions: []});
				expect(permissions.find(p => p.user === "projectuser5")).to.deep.equal({ user: "projectuser5", permissions: []});

				done();
			});

	});

	it("non teamspace admin users will have permissions revoked on any models including the one created by themselves if parent project level permissions has been revoked", function(done) {

		let permissions;

		async.series([

			callback => {
				agentTeamspaceAdmin
					.get(`/${teamspace}/projects/project3`)
					.expect(200, function(err, res) {

						expect(err).to.be.null;
						expect(res.body.permissions).to.exist;

						permissions = res.body.permissions;
						modelId = res.body.models;

						const userPerm = permissions.find(p => p.user === userCanCreateModel.username);
						expect(userPerm).to.exist;

						userPerm.permissions = [];
						callback(err);
					});
			},

			callback => {
				agentTeamspaceAdmin
					.put(`/${teamspace}/projects/project3`)
					.send({ permissions })
					.expect(200, callback);
			},

			callback => {

				agentCanCreateModel
					.get(`/${teamspace}/${modelId}/permissions`)
					.expect(401, callback);
			}

		], done);

	});

	it("user with create_federation permission on a project cannot create fed model on v4 endpoints - endpoint decommissioned", function(done) {

		const modelName = "fedmodel002";

		agentCanCreateFed
			.post(`/${teamspace}/model`)
			.send(Object.assign({ subModels: [], modelName: modelName }, modelDetail))
			.expect(410, done);

	});

	it("Users with edit_project permission can edit a project", function(done) {
		agentCanUpdateProject
			.put(`/${teamspace}/projects/project2`)
			.send({ name: "project2"})
			.expect(200, done);
	});

	it("Users without edit_project permission cannot edit project permissions", function(done) {
		agentCanUpdateProject
			.put(`/${teamspace}/projects/project2`)
			.send({ permissions: []})
			.expect(401, done);
	});

	it("Users with admin_project permission can edit a project", function(done) {
		agentProjectAdmin
			.put(`/${teamspace}/projects/${project}`)
			.send({ name: project})
			.expect(200, done);
	});

	it("Users with admin_project permission on a project cannot create models using v4 endpoints - endpoint decommissioned", function(done) {

		const modelName = "model002";

		agentProjectAdmin
			.post(`/${teamspace}/model`)
			.send(Object.assign({modelName: modelName}, modelDetail))
			.expect(410, done);
	});

	it("Users with admin_project permission on a project can access a model in it", function(done) {

		const modelId = "4b130bee-caba-46c1-a64d-32b7d1a41d6f";

		agentProjectAdmin
			.get(`/${teamspace}/${modelId}/permissions`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("Users with admin_project permission on a project can access jobs", function(done) {

		const modelId = "4b130bee-caba-46c1-a64d-32b7d1a41d6f";

		agentProjectAdmin
			.get(`/${teamspace}/jobs`)
			.expect(200, done);
	});

});
