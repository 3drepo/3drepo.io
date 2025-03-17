"use strict";

/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const { queue: {purgeQueues}} = require("../../v5/helper/services");
const SessionTracker = require("../../v4/helpers/sessionTracker")
const request = require("supertest");
const expect = require("chai").expect;
const responseCodes = require("../../../src/v4/response_codes.js");
const app = require("../../../src/v4/services/api.js").createApp();

describe("Meshes", function () {
	let server;
	let agent;
	let modelId;

	const username = "teamSpace1";
	const password = "password";
	const existingModel = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";

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
		purgeQueues().then(() => {
			server.close(function() {
				console.log("API test server is closed");
				done();
			});
		});
	});

	const meshId = "0040e78a-41db-4d49-8288-e6c141a10e3c";
	const goldenMesh = {
		matrix: [ [ 1, 0, 0, 0 ], [ 0, 0, 1, 0 ], [ 0, -1, 0, 0 ], [ 0, 0, 0, 1 ] ],
		vertices: [
			[ 77469.6875, 52002.45703125, 9275 ],
			[ 77469.6875, 52002.45703125, 8350 ],
			[ 77557.1796875, 52124.30078125, 8350 ],
			[ 77557.1796875, 52124.30078125, 9275 ],
			[ 77557.1796875, 52124.30078125, 9275 ],
			[ 77557.1796875, 52124.30078125, 8350 ],
			[ 77516.5625, 52153.46484375, 8350 ],
			[ 77516.5625, 52153.46484375, 9275 ],
			[ 77516.5625, 52153.46484375, 9275 ],
			[ 77516.5625, 52153.46484375, 8350 ],
			[ 77429.0703125, 52031.62109375, 8350 ],
			[ 77429.0703125, 52031.62109375, 9275 ],
			[ 77429.0703125, 52031.62109375, 9275 ],
			[ 77429.0703125, 52031.62109375, 8350 ],
			[ 77469.6875, 52002.45703125, 8350 ],
			[ 77469.6875, 52002.45703125, 9275 ],
			[ 77557.1796875, 52124.30078125, 8350 ],
			[ 77469.6875, 52002.45703125, 8350 ],
			[ 77516.5625, 52153.46484375, 8350 ],
			[ 77429.0703125, 52031.62109375, 8350 ],
			[ 77516.5625, 52153.46484375, 9275 ],
			[ 77469.6875, 52002.45703125, 9275 ],
			[ 77557.1796875, 52124.30078125, 9275 ],
			[ 77429.0703125, 52031.62109375, 9275 ]
		],
		primitive: 3,
		faces: [ 0,1,2,3,0,2,4,5,6,7,4,6,8,9,10,11,8,10,12,13,14,15,12,14,16,17,18,17,19,18,20,21,22,20,23,21 ]
	};

	it("get mesh should succeed", function(done) {
		agent.get(`/${username}/${existingModel}/meshes/${meshId}`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenMesh);
				done(err);
			});
	});

	it("get mesh with invalid ID should fail", function(done) {
		agent.get(`/${username}/${existingModel}/meshes/invalidId`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.RESOURCE_NOT_FOUND.value);
				done(err);
			});
	});
});
