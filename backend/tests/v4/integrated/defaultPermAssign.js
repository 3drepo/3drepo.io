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
const app = require("../../../src/v4/services/api.js").createApp();
const logger = require("../../../src/v4/logger.js");
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");
const _ = require("lodash");
const C = require("../../../src/v4/constants");

describe("Default permission assignment", function () {

	const User = require("../../../src/v4/models/user");
	let server;
	let agent;
	const username = "defaultperm";
	const password = "defaultperm";
	const email = "test-defaultperm@3drepo.org";
	const helpers = require("../helpers/signUp");

	before(function(done) {
		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");
			helpers.signUpAndLogin({
				server, request, agent, expect, User,
				username, password, email,
				done: function(err, _agent) {
					agent = _agent;
					done(err);
				}
			});
		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("user should be an admin of your own teamspace", function(done) {
		agent.get(`/${username}.json`)
			.expect(200, function(err, res) {

				const account = res.body.accounts.find(account => account.account === username);
				expect(account).to.exist;
				expect(account.permissions).include("teamspace_admin");
				done(err);
			});
	});

	it("user should be able to create project", function(done) {

		agent.post(`/${username}/projects`)
			.send({name: "project1"})
			.expect(200, function(err, res) {
				done(err);
			});
	});

	let modelId;

	it("user should be able to create model - should fail as endpoint is decommissioned", function(done) {

		agent.post(`/${username}/model`)
			.send({
				modelName: "model1",
				unit: "m",
				project: "project1"
			})
			.expect(410, function(err ,res) {
				expect(res.body.code).to.equal("ENDPOINT_DECOMMISSIONED");
				callback(err);
			})
	});

	it("user should have default permission templates created", function(done) {
		agent.get(`/${username}/permission-templates`)
			.expect(200, function(err, res) {

				const admin = res.body.find(t => t._id === C.ADMIN_TEMPLATE);
				expect(admin).to.exist;
				expect(admin.permissions).to.deep.equal(C.ADMIN_TEMPLATE_PERMISSIONS);

				const viewer = res.body.find(t => t._id === C.VIEWER_TEMPLATE);
				expect(viewer).to.exist;
				expect(viewer.permissions).to.deep.equal(C.VIEWER_TEMPLATE_PERMISSIONS);

				const commenter = res.body.find(t => t._id === C.COMMENTER_TEMPLATE);
				expect(commenter).to.exist;
				expect(commenter.permissions).to.deep.equal(C.COMMENTER_TEMPLATE_PERMISSIONS);

				const collaborator = res.body.find(t => t._id === C.COLLABORATOR_TEMPLATE);
				expect(collaborator).to.exist;
				expect(collaborator.permissions).to.deep.equal(C.COLLABORATOR_TEMPLATE_PERMISSIONS);

				done(err);
			});
	});
});
