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
const SessionTracker = require("../../v5/helper/sessionTracker")
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const async = require("async");
const _ = require("lodash");

describe("Permission templates", function () {

	let server;
	let agent;
	let agent2;
	const username = "permissionTemplate";
	const password = "permissionTemplate";
	const permission = { _id: "customA", permissions: ["view_issue", "view_model"]};
	const permission1 = { _id: "customB", permissions: ["view_issue", "view_model", "comment_issue", "create_issue"]};
	const model = "model1";

	before(async function() {
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log("API test server is listening on port 8080!");
				resolve();
			});


		});


		agent = SessionTracker(request(server));
		await agent.login(username, password);
		agent2 = SessionTracker(request(server));
		await agent2.login("testing", "testing");
	});


	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});


	it("should able to assign permission to user on model level", function(done) {

		const permissions = [
			{ user: "testing", permission: "viewer"},
			{ user: "user1", permission: "collaborator"}
		];




		async.series([
			callback => {

				agent.post(`/${username}/${model}/permissions`)
					.send(permissions)
					.expect(200, function(err, res) {
						callback(err);
					});

			},
			callback => {

				agent.get(`/${username}/${model}/permissions`)
					.expect(200, function(err, res) {

						permissions.forEach(permission => {
							expect(_.find(res.body, permission)).to.exist;
						});

						callback(err);
					});
			},
			callback => {
				agent2.get("/testing.json")
					.expect(200, function(err, res) {
						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.exist;

						const accountModel = account.models.find(m => m.model === model);
						expect(accountModel).to.exist;

						callback(err);
					});
			}
		], done);

	});
	it("should fail to assign a permission to a non existing user", function(done) {

		agent.post(`/${username}/${model}/permissions`)
			.send([{ user: "nonses", permission: "viewer"}])
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
				done(err);
			});

	});

	it("should able to re-assign permission to user on model level", function(done) {

		const permissions = [];

		async.series([
			callback => {

				agent.post(`/${username}/model2/permissions`)
					.send(permissions)
					.expect(200, function(err, res) {
						callback(err);
					});

			},
			callback => {

				agent.get(`/${username}/model2/permissions`)
					.expect(200, function(err, res) {

						res.body.forEach(p => {
							expect(p.permission).to.not.exist;
						});

						callback(err);
					});

			},
			callback => {
				agent2.get("/testing.json")
					.expect(200, function(err, res) {

						const account = res.body.accounts.find(account => account.account === username);
						expect(account).to.exist;

						const accountModel = account.models.find(m => m.model === "model2");
						expect(accountModel).to.not.exist;

						callback(err);
					});
			}
		], done);

	});

});
