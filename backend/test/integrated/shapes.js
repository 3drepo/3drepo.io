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
"use strict";

const request = require("supertest");
const {should, assert, expect, Assertion } = require("chai");
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const { login } = require("../helpers/users.js");
const { createIssue } = require("../helpers/issues.js");
const { deleteNotifications, fetchNotification } = require("../helpers/notifications.js");
const { createModel } = require("../helpers/models.js");
const { cloneDeep, omit } = require("lodash");

describe("Shapes", () => {
	let server;
	let agent;
	let agent2;

	const username = "issue_username";
	const password = "password";

	const model = "project1";

	const pointToPointShape =  {
		"positions": [
			[
				-60.000022888183594,
				-5.104172706604004,
				25.35483169555664
			],
			[
				-59.99989318847656,
				-8.379132270812988,
				8.848260879516602
			]
		],
		"normals": [],
		"value": 16.828317642211914,
		"color": [
			0.04704999923706055,
			0.18431000411510468,
			0.32940998673439026,
			1
		],
		"type": 0
	};

	const polygonShape = {"positions":[[-60.000038146972656,-9.8860445022583,5.308515548706055],[-60.000160217285156,-9.988062858581543,0.5673561096191406],[-59.99986267089844,-3.359354019165039,0.1131591796875],[-50.14781951904297,-8.279975891113281,1.2230510711669922],[-50.822227478027344,-7.942905426025391,11.220046997070312],[-59.99982452392578,-3.374828338623047,5.719915390014648],[-59.99979782104492,-9.81118392944336,8.075897216796875]],"normals":[[-1,0,0],[-1,0,0],[-1,0,0],[0.44721364974975586,0.8944271802902222,0],[0.44721364974975586,0.8944271802902222, 0],[-1,0,0],[-1,0,0]],"value":155.05921936035156,"color":[0.7760000228881836,0.32499998807907104,0.5490000247955322,1],"type":1};

	const anotherPointToPointShape =  {
		"positions": [
			[
				0.0,
				1.104172706604004,
				0.0
			],
			[
				0.0,
				0.0,
				0.0
			]
		],
		"normals": [],
		"value": 1.104172706604004,
		"color": [
			0.04704999923706055,
			0.18431000411510468,
			0.32940998673439026,
			1
		],
		"type": 0
	};



	const baseIssue = {
		"status": "open",
		"priority": "low",
		"topic_type": "for info",
		"viewpoint":{
			"up":[0,1,0],
			"position":[38,38 ,125.08011914810137],
			"look_at":[0,0,-163.08011914810137],
			"view_dir":[0,0,-1],
			"right":[1,0,0],
			"unityHeight ":3.537606904422707,
			"fov":2.1124830653010416,
			"aspect_ratio":0.8750189337327384,
			"far":276.75612077194506 ,
			"near":76.42411012233212,
		},
		"scale":1,
		"creator_role":"jobA",
		"assigned_roles":["jobB"]
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

	let issueId = null;


	const wrongShape =  {...pointToPointShape, "type": 4}
	const shapeIssue =  { "name":"shapes issue", ...cloneDeep(baseIssue), shapes : [ pointToPointShape, polygonShape]};
	const wrongShapeIssue =  { "name":"wrong shapes issue", ...cloneDeep(baseIssue), shapes : [ wrongShape ]};


	const chopIds = (objs) => objs.map(obj=> omit(obj, '_id'));


	describe("in issue", function() {
		it("should fail with a wrong shape schema", async () => {
			const res = await agent.post(`/${username}/${model}/issues`)
				.send(wrongShapeIssue)
				.expect(responseCodes.INVALID_ARGUMENTS.status);

			expect(res.body.value, responseCodes.INVALID_ARGUMENTS.value);
		});


		it("when created should succeed", async () => {
			let res = await agent.post(`/${username}/${model}/issues`)
				.send(shapeIssue)
				.expect(200);

			issueId = res.body._id;
		});

		it ("should be reflected when fetching the issue", async()=> {
			const res = await agent.get(`/${username}/${model}/issues/${issueId}`).expect(200);
			const shapes_ids = res.body.shapes.map((shape) => shape._id);

			expect(shapes_ids).to.be.an('array').and.to.have.lengthOf(shapeIssue.shapes.length);
			shapes_ids.forEach((id) => {
				expect(id).to.be.an('string');
			})

			expect(chopIds(res.body.shapes)).to.be.deep.equal(shapeIssue.shapes);
		});

		it ("when updated should succeed", async()=> {
			const otherShapes = [anotherPointToPointShape];

			await agent.patch(`/${username}/${model}/issues/${issueId}`)
				.send({shapes: otherShapes})
				.expect(200);

			const res = await agent.get(`/${username}/${model}/issues/${issueId}`).expect(200);

			expect(chopIds(res.body.shapes)).to.be.deep.equal(otherShapes);
		});
	})

});
