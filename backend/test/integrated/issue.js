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
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Issues", function () {

	let server;
	let agent;

	const username = "issue_username";
	const username2 = "issue_username2";
	const password = "password";

	const projectAdminUser = "imProjectAdmin";

	const model = "project1";

	const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC";
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
			"clippingPlanes":[]
		},
		"scale":1,
		"creator_role":"jobA",
		"assigned_roles":["jobB"]
	};

	const bcf = {
		path: "/../../statics/bcf/example1.bcfzip",
		issue1: "75959a60-8ef1-11e6-8d05-9717c0574272",
		issue2: "8d46d1b0-8ef1-11e6-8d05-9717c0574272"
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

	describe("Creating an issue", function() {

		it("should succeed", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {

							issueId = res.body._id;
							expect(res.body.name).to.equal(issue.name);
							expect(res.body.scale).to.equal(issue.scale);
							expect(res.body.status).to.equal(issue.status);
							expect(res.body.topic_type).to.equal(issue.topic_type);
							expect(res.body.priority).to.equal(issue.priority);
							expect(res.body.creator_role).to.equal(issue.creator_role);
							expect(res.body.assigned_roles).to.deep.equal(issue.assigned_roles);
							expect(res.body.viewpoint.up).to.deep.equal(issue.viewpoint.up);
							expect(res.body.viewpoint.position).to.deep.equal(issue.viewpoint.position);
							expect(res.body.viewpoint.look_at).to.deep.equal(issue.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).to.deep.equal(issue.viewpoint.view_dir);
							expect(res.body.viewpoint.right).to.deep.equal(issue.viewpoint.right);
							expect(res.body.viewpoint.unityHeight).to.equal(issue.viewpoint.unityHeight);
							expect(res.body.viewpoint.fov).to.equal(issue.viewpoint.fov);
							expect(res.body.viewpoint.aspect_ratio).to.equal(issue.viewpoint.aspect_ratio);
							expect(res.body.viewpoint.far).to.equal(issue.viewpoint.far);
							expect(res.body.viewpoint.near).to.equal(issue.viewpoint.near);
							expect(res.body.viewpoint.clippingPlanes).to.deep.equal(issue.viewpoint.clippingPlanes);

							return done(err);
						});
				},

				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`).expect(200, function(err , res) {

						expect(res.body.name).to.equal(issue.name);
						expect(res.body.scale).to.equal(issue.scale);
						expect(res.body.status).to.equal(issue.status);
						expect(res.body.topic_type).to.equal(issue.topic_type);
						expect(res.body.priority).to.equal(issue.priority);
						expect(res.body.creator_role).to.equal(issue.creator_role);
						expect(res.body.assigned_roles).to.deep.equal(issue.assigned_roles);
						expect(res.body.viewpoint.up).to.deep.equal(issue.viewpoint.up);
						expect(res.body.viewpoint.position).to.deep.equal(issue.viewpoint.position);
						expect(res.body.viewpoint.look_at).to.deep.equal(issue.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).to.deep.equal(issue.viewpoint.view_dir);
						expect(res.body.viewpoint.right).to.deep.equal(issue.viewpoint.right);
						expect(res.body.viewpoint.unityHeight).to.equal(issue.viewpoint.unityHeight);
						expect(res.body.viewpoint.fov).to.equal(issue.viewpoint.fov);
						expect(res.body.viewpoint.aspect_ratio).to.equal(issue.viewpoint.aspect_ratio);
						expect(res.body.viewpoint.far).to.equal(issue.viewpoint.far);
						expect(res.body.viewpoint.near).to.equal(issue.viewpoint.near);
						expect(res.body.viewpoint.clippingPlanes).to.deep.equal(issue.viewpoint.clippingPlanes);

						return done(err);

					});
				}
			], done);

		});

		it("with screenshot should succeed", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			issue.viewpoint.screenshot = pngBase64;

			let issueId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {

							issueId = res.body._id;
							return done(err);
						});
				},

				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`).expect(200, function(err , res) {

						expect(res.body.viewpoint.screenshot).to.equal(`${username}/${model}/issues/${issueId}/viewpoints/${res.body.viewpoint.guid}/screenshot.png`);
						return done(err);

					});
				}
			], done);

		});
		it("without name should fail", function(done) {

			const issue = baseIssue;

			agent.post(`/${username}/${model}/issues.json`)
				.send(issue)
				.expect(400 , function(err, res) {
					expect(res.body.value).to.equal(responseCodes.ISSUE_NO_NAME.value);
					done(err);
				});
		});

		it("with invalid priority value", function(done) {

			const issue = Object.assign({}, baseIssue, {"name":"Issue test", "priority":"abc"});

			agent.post(`/${username}/${model}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res) {
				// Invalid priority is now allowed to accommodate for BCF import
				// expect(res.body.value).to.equal(responseCodes.ISSUE_INVALID_PRIORITY.value);
					done(err);
				});
		});

		it("with invalid status value", function(done) {

			const issue = Object.assign({}, baseIssue, {"name":"Issue test", "status":"abc"});

			agent.post(`/${username}/${model}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res) {
				// Invalid status is now allowed to accommodate for BCF import
				// expect(res.body.value).to.equal(responseCodes.ISSUE_INVALID_STATUS.value);
					done(err);
				});
		});

		it("with pin should succeed and pin info is saved", function(done) {

			const issue = Object.assign({
				"name":"Issue test",
				"norm": [0.9999999319099296, 0.00006146719401852714, -0.000363870746590937],
				"position": [33.167440465643935, 12.46054749529149, -46.997271893235435]
			}, baseIssue);

			let issueId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							expect(res.body.norm).to.deep.equal(issue.norm);
							expect(res.body.position).to.deep.equal(issue.position);
							return done(err);

						});
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`).expect(200, function(err , res) {

						expect(res.body.norm).to.deep.equal(issue.norm);
						expect(res.body.position).to.deep.equal(issue.position);
						done(err);

					});
				}
			], done);
		});

		it("change status should succeed", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;
			const status = { status: "in progress"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(status)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.status === status.status);
							done(err);
						});
				}
			], done);
		});

		it("change status should not fail if value is invalid", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;
			const status = { status: "999"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(status)
						.expect(200, function(err, res) {
						// Invalid status is now allowed to accommodate for BCF import
						// expect(res.body.value === responseCodes.ISSUE_INVALID_STATUS.value);
							done(err);
						});
				}
			], done);

		});

		it("change priority should succeed", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;
			const priority = { priority: "high"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(priority)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.priority === priority.priority);
							done(err);
						});
				}
			], done);
		});

		it("change priority should not fail if value is invalid", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;
			const priority = { priority: "xxx"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(priority)
						.expect(200, function(err, res) {
						// Invalid priority is now allowed to accommodate for BCF import
						// expect(res.body.value === responseCodes.ISSUE_INVALID_PRIORITY.value);
							done(err);
						});
				}
			], done);
		});

		it("change topic_type should succeed", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;
			const topic_type = { topic_type: "for abcdef"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(topic_type)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.topic_type === topic_type.topic_type);
							done(err);
						});
				}
			], done);
		});

		it("change pin position  should succeed", function(done) {
			const issue = {...baseIssue,"name":"Issue test", position:[0,1,2]};
			let issueId;
			const position = { position: [1,-1,9] };
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(position)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.position).to.deep.equal(position.position);
							done(err);
						});
				}
			], done);
		});


		it("change status should succeed and create system comment", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue, { status: "open"});
			let issueId;
			const status = { status: "in progress"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(status)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.status === status.status);
							expect(res.body.comments[0].action).to.deep.equal({
								property: "status",
								from: "open",
								to: "in progress"
							});
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change topic type should succeed and create system comment", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue, { topic_type: "ru123"});
			let issueId;
			const data = { topic_type: "abc123"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(data)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.topic_type === data.topic_type);
							expect(res.body.comments[0].action).to.deep.equal({
								property: "topic_type",
								from: "ru123",
								to: "abc123"
							});
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("change assigned_roles should succeed and create system comment", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue, { assigned_roles:["jobA"]});
			let issueId;
			const data = { assigned_roles: ["jobB"]};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(data)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.assigned_roles).to.deep.equal(data.assigned_roles);
							expect(res.body.comments[0].action).to.deep.equal({
								property: "assigned_roles",
								from: "jobA",
								to: "jobB"
							});
							expect(res.body.comments[0].owner).to.equal(username);
							done(err);
						});
				}
			], done);
		});

		it("seal last non system comment when adding system comment", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue, { topic_type: "ru123"});
			let issueId;
			const data = { topic_type: "abc123"};
			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send({ comment : "hello world"})
						.expect(200 , done);
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(data)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.comments[0].sealed).to.equal(true);
							done(err);
						});
				}
			], done);
		});

		it("change topic_type, desc, priority, status and assigned_roles in one go should succeed", function(done) {

			const issue = Object.assign({}, baseIssue, {"name":"Issue test"});
			let issueId;

			const updateData = {
				"topic_type": "for abcdef",
				"status": "in progress",
				"priority": "high",
				"assigned_roles":["jobB"]
			};

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(updateData)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.topic_type).to.equal(updateData.topic_type);
							expect(res.body.status).to.equal(updateData.status);
							expect(res.body.priority).to.equal(updateData.priority);
							expect(res.body.assigned_roles).to.deep.equal(updateData.assigned_roles);
							done(err);
						});
				}
			], done);
		});

		it("change status to for approval will change to roles back to creator role", function(done) {

			const issue = Object.assign({}, baseIssue, {
				"name":"Issue test",
				"assigned_roles":["jobB"],
				"creator_role": "jobA"
			});

			let issueId;
			const updateData = {
				"status": "for approval",
				"assigned_roles":["jobB"]
			};

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							expect(res.body.assigned_roles).to.deep.equal(issue.assigned_roles);
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(updateData)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.status).to.equal(updateData.status);
							expect(res.body.assigned_roles).to.deep.equal([issue.creator_role]);
							done(err);
						});
				}
			], done);
		});

		it("change assigned_roles during status=for approval will change the status back to in progress", function(done) {

			const issue = Object.assign({}, baseIssue, {
				"name":"Issue test",
				"status": "for approval",
				"assigned_roles":["jobB"]
			});

			// console.log(issue)

			let issueId;
			const updateData = {
				"status": "open",
				"assigned_roles":["jobA"]
			};

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
						// console.log(res.body);
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(updateData)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.status).to.equal("in progress");
							expect(res.body.assigned_roles).to.deep.equal(updateData.assigned_roles);
							done(err);
						});
				}
			], done);
		});

		it("change desc should succeed", function(done) {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;

			const desc = { desc: "for abcdef"};

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/issues.json`)
						.send(issue)
						.expect(200 , function(err, res) {
							issueId = res.body._id;
							return done(err);

						});
				},
				function(done) {
					agent.patch(`/${username}/${model}/issues/${issueId}.json`)
						.send(desc)
						.expect(200, done);
				},
				function(done) {
					agent.get(`/${username}/${model}/issues/${issueId}.json`)
						.expect(200, function(err, res) {
							expect(res.body.desc === desc.desc);
							done(err);
						});
				}
			], done);
		});

		describe("user who is collaborator/commentor and assigned to the issue job can", function() {

			const issue = Object.assign({"name":"Issue test"}, baseIssue);
			let issueId;

			before(function(done) {
				async.series([
					function(_done) {
						agent.post("/logout")
							.send({})
							.expect(200, _done);
					},
					function(_done) {
						agent.post("/login")
							.send({username: username, password})
							.expect(200, _done);
					},
					function(_done) {
						agent.post(`/${username}/${model}/issues.json`)
							.send(issue)
							.expect(200 , function(err, res) {
								issueId = res.body._id;
								return _done(err);

							});
					},
					function(_done) {
						agent.post("/logout")
							.send({})
							.expect(200, _done);
					},
					function(_done) {
						agent.post("/login")
							.send({username: username2, password})
							.expect(200, _done);
					}
				], done);
			});

			it("not change priority", function(done) {

				const updateData = {
					"priority": "high"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(400, function(err, res) {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});

			});

			it("can change status to anything but closed", function(done) {

				const updateData = {
					"status": "in progress"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(200, function(err, res) {
						expect(res.body.value);
						done(err);
					});

			});

			it("not change status to closed", function(done) {

				const updateData = {
					"status": "closed"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(400, function(err, res) {
						done(err);
					});

			});

			it("change type should succeed", function(done) {

				const updateData = {
					"topic_type": "For VR"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(200, function(err, res) {
						done(err);
					});

			});

			it("change assigned should succeed", function(done) {

				const updateData = {
					"assigned_roles": ["jobA"]
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(200, function(err, res) {
						done(err);
					});

			});

		});

		describe("user who is collaborator/commentor but not assigned to issue job can", function() {

			let issueId;

			before(function(done) {

				const issue = Object.assign(baseIssue, {"name":"Issue test", "assigned_roles": ["jobC"]});

				async.series([
					function(_done) {
						agent.post("/logout")
							.send({})
							.expect(200, _done);
					},
					function(_done) {
						agent.post("/login")
							.send({username: username, password})
							.expect(200, _done);
					},
					function(_done) {
						agent.post(`/${username}/${model}/issues.json`)
							.send(issue)
							.expect(200 , function(err, res) {
								issueId = res.body._id;
								return _done(err);
							});
					},
					function(_done) {
						agent.post("/logout")
							.send({})
							.expect(200, _done);
					},
					function(_done) {
						agent.post("/login")
							.send({username: username2, password})
							.expect(200, _done);
					}
				], done);
			});

			it("not change priority", function(done) {

				const updateData = {
					"priority": "high"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(400, function(err, res) {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});

			});

			it("not changed the status to in progress", function(done) {

				const updateDataProgress = {
					"status": "in progress"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateDataProgress)
					.expect(400, function(err, res) {
						expect(res.body.value);
						done(err);
					});

			});

			it("not changed the status to closed", function(done) {

				const updateDataClosed = {
					"status": "closed"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateDataClosed)
					.expect(400, function(err, res) {
						done(err);
					});

			});

			it("can change type", function(done) {

				const updateData = {
					"topic_type": "For VR"
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(200, function(err, res) {
						done(err);
					});

			});

			it("can change assigned", function(done) {

				const updateData = {
					"assigned_roles": ["jobA"]
				};
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(updateData)
					.expect(200, function(err, res) {
						done(err);
					});

			});

		});

		describe("user with different role but is an admin", function() {

			const issue = Object.assign({}, baseIssue, {"name":"Issue test", creator_role: "jobC"});
			let issueId;
			const close = { status: "closed"};

			before(function(done) {
				async.series([
					function(done) {
						agent.post("/logout")
							.send({})
							.expect(200, done);
					},
					function(done) {
						agent.post("/login")
							.send({username: username2, password})
							.expect(200, done);
					},
					function(done) {
						agent.post(`/${username}/${model}/issues.json`)
							.send(issue)
							.expect(200 , function(err, res) {
								issueId = res.body._id;
								return done(err);

							});
					},
					function(done) {
						agent.post("/logout")
							.send({})
							.expect(200, done);
					},
					function(done) {
						agent.post("/login")
							.send({username, password})
							.expect(200, done);
					}
				],done);
			});

			it("try to close an issue should succeed", function(done) {

				async.series([
					function(done) {
						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(close)
							.expect(200, done);
					}

				], done);
			});

		});

		describe("user with different role but is a project admin", function() {

			const issue = Object.assign({}, baseIssue, {"name":"Issue test", creator_role: "jobC"});
			let issueId;
			const close = { status: "closed"};

			before(function(done) {
				async.series([
					function(done) {
						agent.post("/logout")
							.send({})
							.expect(200, done);
					},
					function(done) {
						agent.post("/login")
							.send({username: projectAdminUser, password: projectAdminUser})
							.expect(200, done);
					},
					function(done) {
						agent.post(`/${username}/${model}/issues.json`)
							.send(issue)
							.expect(200 , function(err, res) {
								issueId = res.body._id;
								return done(err);

							});
					},
					function(done) {
						agent.post("/logout")
							.send({})
							.expect(200, done);
					},
					function(done) {
						agent.post("/login")
							.send({username, password})
							.expect(200, done);
					}
				],done);
			});

			it("try to close an issue should succeed", function(done) {

				async.series([
					function(done) {
						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(close)
							.expect(200, done);
					}

				], done);
			});

		});

		describe("user with different role and is not an admin ", function() {

			const issue = Object.assign({}, baseIssue, {"name":"Issue test", creator_role: "jobC"});
			let issueId;
			const close = { status: "closed"};

			before(function(done) {
				async.series([
					function(done) {
						agent.post(`/${username}/${model}/issues.json`)
							.send(issue)
							.expect(200 , function(err, res) {
								issueId = res.body._id;
								return done(err);

							});
					},
					function(done) {
						agent.post("/logout")
							.send({})
							.expect(200, done);
					},
					function(done) {
						agent.post("/login")
							.send({username: username2, password})
							.expect(200, done);
					}
				],done);
			});

			after(function(done) {
				async.series([
					function(done) {
						agent.post("/logout")
							.send({})
							.expect(200, done);
					},
					function(done) {
						agent.post("/login")
							.send({username, password})
							.expect(200, done);
					}
				],done);
			});

			it("try to close an issue should fail", function(done) {

				async.series([
					function(done) {
						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(close)
							.expect(400, function(err, res) {

								expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
								done(err);
							});
					}
				], done);
			});
		});

		describe("and then sealing a comment", function() {

			let issueId;

			before(function(done) {

				const issue = Object.assign({"name":"Issue test"}, baseIssue);

				async.series([
					function(done) {
						agent.post(`/${username}/${model}/issues.json`)
							.send(issue)
							.expect(200 , function(err, res) {
								issueId = res.body._id;
								done(err);
							});
					},
					function(done) {

						const comment = {
							comment: "hello world",
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
								"clippingPlanes":[]
							}
						};

						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(comment)
							.expect(200 , done);

					}
				], done);

			});

			it("should succeed", function(done) {
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send({sealed: true, commentIndex: 0})
					.expect(200, function(err, res) {
						done(err);
					});
			});

			it("should fail if editing a sealed comment", function(done) {
				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send({comment: "abcd", commentIndex: 0, edit: true})
					.expect(400, function(err, res) {
						expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
						done(err);
					});
			});

		});

		describe("and then commenting", function() {

			let issueId;

			before(function(done) {

				const issue = Object.assign({"name":"Issue test"}, baseIssue);

				agent.post(`/${username}/${model}/issues.json`)
					.send(issue)
					.expect(200 , function(err, res) {
						issueId = res.body._id;
						done(err);
					});

			});

			it("should succeed", function(done) {

				const comment = {
					comment: "hello world",
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
						"clippingPlanes":[]
					}
				};

				async.series([
					function(done) {
						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(comment)
							.expect(200 , done);
					},

					function(done) {
						agent.get(`/${username}/${model}/issues/${issueId}.json`).expect(200, function(err , res) {

							expect(res.body.comments.length).to.equal(1);
							expect(res.body.comments[0].comment).to.equal(comment.comment);
							expect(res.body.comments[0].owner).to.equal(username);
							expect(res.body.comments[0].viewpoint.up).to.deep.equal(comment.viewpoint.up);
							expect(res.body.comments[0].viewpoint.position).to.deep.equal(comment.viewpoint.position);
							expect(res.body.comments[0].viewpoint.look_at).to.deep.equal(comment.viewpoint.look_at);
							expect(res.body.comments[0].viewpoint.view_dir).to.deep.equal(comment.viewpoint.view_dir);
							expect(res.body.comments[0].viewpoint.right).to.deep.equal(comment.viewpoint.right);
							expect(res.body.comments[0].viewpoint.unityHeight).to.equal(comment.viewpoint.unityHeight);
							expect(res.body.comments[0].viewpoint.fov).to.equal(comment.viewpoint.fov);
							expect(res.body.comments[0].viewpoint.aspect_ratio).to.equal(comment.viewpoint.aspect_ratio);
							expect(res.body.comments[0].viewpoint.far).to.equal(comment.viewpoint.far);
							expect(res.body.comments[0].viewpoint.near).to.equal(comment.viewpoint.near);
							expect(res.body.comments[0].viewpoint.clippingPlanes).to.deep.equal(comment.viewpoint.clippingPlanes);

							done(err);
						});
					}
				], done);

			});

			it("should succeed if editing an existing comment", function(done) {

				const comment = { comment: "hello world 2", commentIndex: 0, edit: true };

				async.series([
					function(done) {
						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(comment)
							.expect(200 , done);
					},

					function(done) {
						agent.get(`/${username}/${model}/issues/${issueId}.json`).expect(200, function(err , res) {

							expect(res.body.comments.length).to.equal(1);
							expect(res.body.comments[0].comment).to.equal(comment.comment);
							expect(res.body.comments[0].owner).to.equal(username);

							done(err);
						});
					}
				], done);

			});

			it("should fail if comment is empty", function(done) {

				const comment = { comment: "" };

				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(comment)
					.expect(400 , function(err, res) {
						expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_NO_TEXT.value);
						done(err);
					});
			});

			it("should succeed if removing an existing comment", function(done) {

				const comment = { commentIndex: 0, delete: true };

				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(comment)
					.expect(200 , function(err, res) {
						done(err);
					});
			});

			it("should fail if invalid issue ID is given", function(done) {

				const invalidId = "00000000-0000-0000-0000-000000000000";
				const comment = { comment: "hello world" };

				agent.patch(`/${username}/${model}/issues/${invalidId}.json`)
					.send(comment)
					.expect(404 , function(err, res) {
						done(err);
					});
			});

		});

		describe("and then closing it", function() {

			let issueId;

			before(function(done) {

				const issue = Object.assign({"name":"Issue test"}, baseIssue);

				agent.post(`/${username}/${model}/issues.json`)
					.send(issue)
					.expect(200 , function(err, res) {

						if(err) {
							return done(err);
						}

						issueId = res.body._id;

						// add an comment
						const comment = { comment: "hello world" };

						agent.patch(`/${username}/${model}/issues/${issueId}.json`)
							.send(comment)
							.expect(200 , function(err, res) {
								done(err);
							});
					});

			});

			it("should succeed", function(done) {

				const close = { status: "closed" };

				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(close)
					.expect(200 , function(err, res) {

						done(err);

					});
			});

			// it('should fail if adding a comment', function(done){
			// 	let comment = { comment: 'hello world' };

			// 	agent.patch(`/${username}/${model}/issues/${issueId}.json`)
			// 	.send(comment)
			// 	.expect(400 , function(err, res){

			// 		expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
			// 		return done(err);

			// 	});
			// });

			// it('should fail if removing a comment', function(done){
			// 	let comment = { commentIndex: 0, delete: true };

			// 	agent.patch(`/${username}/${model}/issues/${issueId}.json`)
			// 	.send(comment)
			// 	.expect(400 , function(err, res){

			// 		expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
			// 		return done(err);

			// 	});
			// });

			// it('should fail if editing a comment', function(done){
			// 	let comment = { comment: 'hello world 2', commentIndex: 0, edit: true };

			// 	agent.patch(`/${username}/${model}/issues/${issueId}.json`)
			// 	.send(comment)
			// 	.expect(400 , function(err, res){

			// 		expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
			// 		return done(err);

			// 	});
			// });

			it("should succeed if reopening", function(done) {

				const open = {  status: "open" };

				agent.patch(`/${username}/${model}/issues/${issueId}.json`)
					.send(open)
					.expect(200 , function(err, res) {
						done(err);

					});
			});

			it("should fail if invalid issue ID is given", function(done) {

				const invalidId = "00000000-0000-0000-0000-000000000000";
				const close = { status: "closed" };

				agent.patch(`/${username}/${model}/issues/${invalidId}.json`)
					.send(close)
					.expect(404 , function(err, res) {
						done(err);
					});
			});

		});

	});

	describe("BCF", function() {

		const bcfusername = "testing";
		const bcfpassword = "testing";
		const bcfmodel = "testproject";

		before(function(done) {
			async.series([
				function(done) {
					agent.post("/logout")
						.send({})
						.expect(200, done);
				},
				function(done) {
					agent.post("/login")
						.send({ username: bcfusername, password: bcfpassword})
						.expect(200, done);
				}
			], done);
		});

		describe("Importing a bcf file", function() {

			it("should succeed", function(done) {

				async.series([
					function(done) {
						agent.post(`/${bcfusername}/${bcfmodel}/issues.bcfzip`)
							.attach("file", __dirname + bcf.path)
							.expect(200, function(err, res) {
								done(err);
							});
					},

					function(done) {
						agent.get(`/${bcfusername}/${bcfmodel}/issues.json`)
							.expect(200, function(err, res) {

							// issues in bcf file should be imported
								const issue1 = res.body.find(issue => issue._id === bcf.issue1);
								const issue2 = res.body.find(issue => issue._id === bcf.issue2);

								expect(issue1).to.exist;
								expect(issue2).to.exist;
								done(err);
							});
					},

					function(done) {
						agent.get(`/${bcfusername}/${bcfmodel}/issues/${bcf.issue1}.json`)
							.expect(200, function(err, res) {

								const issue1 = res.body;

								expect(issue1._id).to.equal(bcf.issue1);
								expect(issue1.desc).to.equal("cc");
								expect(issue1.created).to.equal(1476107839000);
								expect(issue1.priority).to.equal("medium");
								expect(issue1.name).to.equal("monkey");
								expect(issue1.status).to.equal("in progress");
								expect(issue1.topic_type).to.equal("for_approval");
								expect(issue1.thumbnail).to.exist;
								expect(issue1.viewpoint).to.exist;
								expect(issue1.viewpoint.screenshot).to.exist;

								expect(issue1.comments.length).to.equal(2);
								expect(issue1.comments[0].comment).to.equal("cccc");
								expect(issue1.comments[0].viewpoint).to.exist;
								expect(issue1.comments[0].viewpoint.screenshot).to.exist;

								done(err);

							});
					}
				], done);

			});
		});

		describe("Exporting a bcf file", function() {
			it("should succeed", function(done) {
				agent.get(`/${bcfusername}/${bcfmodel}/issues.bcfzip`)
					.expect(200, function(err, res) {
						done(err);
					});
			});
		});
	});

});

