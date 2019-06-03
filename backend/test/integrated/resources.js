"use strict";

/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const config = require("../../config");
const request = require("supertest");
const IssueHelper =  require("../helpers/issues.js");
const async = require("async");
const path = require('path');


describe("Resources ", function () {
	const usernames = [ "adminTeamspace1JobA",
		"viewerTeamspace1Model1JobC",
		"collaboratorTeamspace1Model1JobC",
		"collaboratorTeamspace1Model1JobD",
		"teamSpace1"];

	const password = "password";
	const account = "teamSpace1";
	const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";
	const agents = {};



	const createIssue = IssueHelper.createIssue(account, model);
	const attachDocs = IssueHelper.attachDocument(account, model);

	let server;
	before(function(done) {
		server = app.listen(8080, function () {
			async.parallel(
				usernames.map(username => next => {
					const agent = request.agent(server);

					agent.post("/login")
						.send({ username, password})
						.expect(200, function(err, res) {
							next(err);
						});

					agents[username] = agent;
				}),done);
		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("should succeed on attaching documents", function(done) {
		async.waterfall([
			createIssue(agents.adminTeamspace1JobA),
			attachDocs(agents.adminTeamspace1JobA, ['my document', 'a pdf'], ['test_doc.docx', 'dummy.pdf'])
		], done);
	});

});
