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

"use strict";

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const { cloneDeep } = require("lodash");


describe("Sequences", function () {
	let server;
	let agent;

	const username = "metaTest";
	const password = "123456";

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			agent = request.agent(server);
			agent.post("/login")
				.send({ username, password })
                .expect(200, function (err, res) {
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

	const model = "4d3df6a7-b4d5-4304-a6e1-dc192a761490";
	const sequenceId = "8a64539a-c78f-41f4-8e9e-29034dc6c293";

	const activity = {
		name: "Custom created activity",
		startDate: 1484045259000, // Wed Jan 10 2017 10:47:39 GMT+0000 (Greenwich Mean Time)
		endDate: 1492795390000, // Wed Apr 21 2017 17:23:10 GMT+0000 (Greenwich Mean Time)
		resources: {},
		data: [
		   {
				key: "Type",
				value: "work"
		   }
		]
	}

	let activityId = null;

	describe("create activity", function() {
		it("should fail with made up sequence id", async() => {
			const { body } = await agent.post(`/${username}/${model}/sequences/non_existing_id/activities`)
				.send(activity)
				.expect(responseCodes.SEQUENCE_NOT_FOUND.status);

			expect(body.value).to.be.equal(responseCodes.SEQUENCE_NOT_FOUND.value);

		});

		it("should fail with wrong activity schema", async() => {
			const wrongActivity = {...activity};
			delete wrongActivity.name;

			const { body } = await agent.post(`/${username}/${model}/sequences/${sequenceId}/activities`)
				.send(wrongActivity)
				.expect(responseCodes.INVALID_ARGUMENTS.status);

			expect(body.value).to.be.equal(responseCodes.INVALID_ARGUMENTS.value);
		});

		it("should be created succesfully", async() => {
			const { body } = await agent.post(`/${username}/${model}/sequences/${sequenceId}/activities`)
				.send(activity)
				.expect(200);

			expect(body._id).to.be.string;
			expect(body.sequence_id).to.be.equal(sequenceId);

			activityId = body._id;
		});
	});

	describe("edit activty", function() {

		it("should fail with made up sequence id", async() => {
			const { body } = await agent.put(`/${username}/${model}/sequences/non_existing_id/activities/${activityId}`)
				.send(activity)
				.expect(responseCodes.SEQUENCE_NOT_FOUND.status);

			expect(body.value).to.be.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
		});

		it("should fail with made up activity id", async() => {
			const { body } = await agent.put(`/${username}/${model}/sequences/${sequenceId}/activities/non_existent_actity`)
				.send(activity)
				.expect(responseCodes.ACTIVITY_NOT_FOUND.status);

			expect(body.value).to.be.equal(responseCodes.ACTIVITY_NOT_FOUND.value);
		});

		it("should fail with wrong activity schema", async() => {
			const wrongActivity = { madeUpProp: true };

			const { body } = await agent.put(`/${username}/${model}/sequences/${sequenceId}/activities/${activityId}`)
				.send(wrongActivity)
				.expect(responseCodes.INVALID_ARGUMENTS.status);

			expect(body.value).to.be.equal(responseCodes.INVALID_ARGUMENTS.value);
		});

		it("should succeed", async() => {
			const activity = { name: "updated name" };

			const { body } = await agent.put(`/${username}/${model}/sequences/${sequenceId}/activities/${activityId}`)
				.send(activity)
				.expect(200);

			const updatedActivity =  {...cloneDeep(activity),_id: activityId, sequence_id: sequenceId, ...activity };
			expect(body).to.be.deep.equal(updatedActivity);
		});

	});

	describe("remove activity", function() {

		it("should fail with made up sequence id", async() => {
			const { body } = await agent.delete(`/${username}/${model}/sequences/non_existing_id/activities/${activityId}`)
				.send(activity)
				.expect(responseCodes.SEQUENCE_NOT_FOUND.status);

			expect(body.value).to.be.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
		});

		it("should fail with made up activity id", async() => {
			const { body } = await agent.delete(`/${username}/${model}/sequences/${sequenceId}/activities/non_existent_actity`)
				.expect(responseCodes.ACTIVITY_NOT_FOUND.status);

			expect(body.value).to.be.equal(responseCodes.ACTIVITY_NOT_FOUND.value);
		});

		it("should succeed", async() => {
			await agent.delete(`/${username}/${model}/sequences/${sequenceId}/activities/${activityId}`)
				.expect(200);
		});
	});

	// describe("get activities list", function() {
	// 	it("should work", async() => {
	// 		let { body } = await agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/activities`)
	// 			.expect(200);

	// 		console.log(JSON.stringify(body, null, '\t'));



	// 		const res  = await agent.get(`/${username}/${model}/sequences/${sequenceId}/activities`)
	// 			.expect(200);

	// 		console.log(JSON.stringify(res.body, null, '\t'));
	// 	});
	// })
});
