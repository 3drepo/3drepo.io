"use strict";


/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const app = require("../../../src/v4/services/api.js").createApp();
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const { templates } = require("../../../src/v5/utils/responseCodes");
const C = require("../../../src/v4/constants");
const async = require("async");
const User = require("../../../src/v4/models/user");
const config = require("../../../src/v4/config");
const fs = require("fs");

describe("Revision", function () {

	let server;
	let agent;
	const username = "rev";
	const password = "123456";
	const model = "monkeys";
	const queuedModel = "queuedModel";
	const processingModel = "processingModel";
	const testTag = "logo";
	const testRevId = "7349c6eb-4009-4a4a-af66-701a496dbe2e";


	const getRevision = async (rev, querystring = '') => {
		if (querystring) {
			querystring = `?${querystring}`;
		}

		var { body: allRevisions } = await agent.get(`/${username}/${model}/revisions.json${querystring}`)
		return allRevisions.find(({_id}) => _id === rev);
	}

	before(async function() {
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

	it("list revisions should succeed", function(done) {
		agent.get(`/${username}/${model}/revisions.json`)
			.expect(200, function(err, res) {
				expect(res.body.length).to.equal(3);
				expect(res.body[0]).to.have.property("_id");
				expect(res.body[0]).to.have.property("timestamp");
				expect(res.body[0]).to.have.property("author");
				expect(Date.parse(res.body[0].timestamp)).to.be.above(Date.parse(res.body[2].timestamp));
				done(err);
			});
	});

	it("get asset bundle list by revision id should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/unityAssets.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get asset bundle list by revision tag should succeed", function(done) {

		agent.get(`/${username}/${model}/revision/${testTag}/unityAssets.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get asset bundle list of non existing rev should fail", function(done) {
		agent.get(`/${username}/${model}/revision/invalidtag/unityAssets.json`)
			.expect(400, function(err, res) {
				done(err);
			});
	});

	it("get issues by revision id should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/${testRevId}/issues`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get issues by revision tag should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/${testTag}/issues`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get tree by revision tag should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/original/fulltree.json`)
			.expect(200, function(err, res) {
				expect(JSON.parse(res.text).mainTree.nodes.name).to.equal("suzanne-flat.obj");
				done(err);
			});
	});

	it("get tree by revision id should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/6c558faa-8236-4255-a48a-a4ce99465182/fulltree.json`)
			.expect(200, function(err, res) {
				expect(JSON.parse(res.text).mainTree.nodes.name).to.equal("suzanne-flat.obj");
				done(err);
			});
	});

	it("get tree by non existing revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/000/fulltree.json`)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
				done(err);
			});
	});

	it("get tree of head of master should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/master/head/fulltree.json`)
			.expect(200, function(err, res) {
				expect(JSON.parse(res.text).mainTree.nodes.name).to.equal("3DrepoBIM.obj");
				done(err);
			});
	});

	// IdMap
	it("get idMap by revision id should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/idMap.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get idMap by non existing revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/000/idMap.json`)
			.expect(400, function(err, res) {
				done(err);
			});
	});

	it("get idMap of head of master should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/master/head/idMap.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	// IdToMeshes
	it("get idToMeshes by revision id should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/idToMeshes.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get idToMeshes by non existing revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/000/idToMeshes.json`)
			.expect(400, function(err, res) {
				done(err);
			});
	});

	it("get idToMeshes of head of master should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/master/head/idToMeshes.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	// treePath
	it("get treePath by revision id should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/7349c6eb-4009-4a4a-af66-701a496dbe2e/tree_path.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("get treePath by non existing revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/000/tree_path.json`)
			.expect(400, function(err, res) {
				done(err);
			});
	});

	it("get treePath of head of master should succeed", function(done) {
		agent.get(`/${username}/${model}/revision/master/head/tree_path.json`)
			.expect(200, function(err, res) {
				done(err);
			});
	});

	it("should not be able to reach the endpoint to upload a new revision - endpoint decommissioned", function(done) {
		agent.post(`/${username}/${model}/upload`)
			.field("tag", testTag)
			.attach("file", __dirname + "/../statics/3dmodels/8000cubes.obj")
			.expect(410, (err, res) => done());
	});

	it("update revision", async () => {
		await agent.patch(`/${username}/${model}/revisions/${testRevId}`)
				.send({void: true})
				.expect(200);

		let revision = await getRevision(testRevId);
		expect(revision).to.be.undefined;

		revision = await getRevision(testRevId, 'showVoid=1');
		expect(revision.void).to.be.true;



		await agent.patch(`/${username}/${model}/revisions/${testRevId}`)
				.send({void: false})
				.expect(200);

		revision = await getRevision(testRevId);
		expect(revision).not.to.be.undefined;
	});

});
