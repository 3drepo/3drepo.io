'use strict';

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

let request = require('supertest');
let expect = require('chai').expect;
let app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;
let responseCodes = require("../../response_codes.js");
let helpers = require("./helpers");
let async = require('async');

describe('Creating an issue', function () {

	let Issue = require('../../models/issue');
	let User = require('../../models/user');
	let server;
	let agent;
	let username = 'issue_username';
	let password = 'password';
	let email = 'test3drepo_issue@mailinator.com';
	let project = 'project1';

	let desc = 'desc';
	let type = 'type';
	let unit = 'meter';

	let pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mPUjrj6n4EIwDiqkL4KAV6SF3F1FmGrAAAAAElFTkSuQmCC';
	let baseIssue = {
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
		"creator_role":"testproject.collaborator",
		"assigned_roles":["testproject.collaborator"],
	};

	before(function(done){

		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			helpers.signUpAndLoginAndCreateProject({
				server, request, agent, expect, User, systemLogger,
				username, password, email, project, desc, type, unit,
				done: function(err, _agent){
					agent = _agent;
					done(err);
				}
			});
			
		});

	});

	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});

	it('should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;

		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					
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

			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`).expect(200, function(err , res){

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

	it('with screenshot should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		issue.viewpoint.screenshot = pngBase64;

		let issueId;

		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					
					issueId = res.body._id;
					return done(err);
				});
			},

			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`).expect(200, function(err , res){

					expect(res.body.viewpoint.screenshot).to.equal(`${username}/${project}/issues/${issueId}/viewpoints/${res.body.viewpoint.guid}/screenshot.png`);
					return done(err);

				});
			}
		], done);

	});
	it('without name should fail', function(done){

		let issue = baseIssue;

		agent.post(`/${username}/${project}/issues.json`)
		.send(issue)
		.expect(400 , function(err, res){
			expect(res.body.value).to.equal(responseCodes.ISSUE_NO_NAME.value);
			done(err);
		});
	});

	it('with invalid priority value', function(done){

		let issue = Object.assign({}, baseIssue, {"name":"Issue test", "priority":"abc"});

		agent.post(`/${username}/${project}/issues.json`)
		.send(issue)
		.expect(400 , function(err, res){
			expect(res.body.value).to.equal(responseCodes.ISSUE_INVALID_PRIORITY.value);
			done(err);
		});
	});

	it('with invalid status value', function(done){

		let issue = Object.assign({}, baseIssue, {"name":"Issue test", "status":"abc"});

		agent.post(`/${username}/${project}/issues.json`)
		.send(issue)
		.expect(400 , function(err, res){
			expect(res.body.value).to.equal(responseCodes.ISSUE_INVALID_STATUS.value);
			done(err);
		});
	});

	it('with pin should succee and pin info is saved', function(done){

		let issue = Object.assign({
			"name":"Issue test",
			"norm": [0.9999999319099296, 0.00006146719401852714, -0.000363870746590937],
			"position": [33.167440465643935, 12.46054749529149, -46.997271893235435]
		}, baseIssue);

		let issueId;

		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					expect(res.body.norm).to.deep.equal(issue.norm);
					expect(res.body.position).to.deep.equal(issue.position);
					return done(err);
					
				});
			},
			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`).expect(200, function(err , res){

					expect(res.body.norm).to.deep.equal(issue.norm);
					expect(res.body.position).to.deep.equal(issue.position);
					done(err);

				});
			}
		], done);
	});


	it('change status should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;
		let status = { status: 'in progress'};
		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					return done(err);
					
				});
			},
			function(done){
				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(status)
				.expect(200, done);
			},
			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`)
				.expect(200, function(err, res){
					expect(res.body.status === status.status);
					done(err);
				});
			},
		], done);
	});


	it('change status should fail if value is invalid', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;
		let status = { status: '999'};
		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					return done(err);
					
				});
			},
			function(done){
				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(status)
				.expect(400, function(err, res){
					expect(res.body.value === responseCodes.ISSUE_INVALID_STATUS.value);
					done(err);
				});
			}
		], done);
	});

	it('change priority should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;
		let priority = { priority: 'high'};
		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					return done(err);
					
				});
			},
			function(done){
				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(priority)
				.expect(200, done);
			},
			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`)
				.expect(200, function(err, res){
					expect(res.body.priority === priority.priority);
					done(err);
				});
			},
		], done);
	});

	it('change priority should fail if value is invalid', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;
		let priority = { priority: 'xxx'};
		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					return done(err);
					
				});
			},
			function(done){
				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(priority)
				.expect(400, function(err, res){
					expect(res.body.value === responseCodes.ISSUE_INVALID_PRIORITY.value);
					done(err);
				});
			}
		], done);
	});


	it('change topic_type should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;
		let topic_type = { topic_type: 'for abcdef'};
		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					return done(err);
					
				});
			},
			function(done){
				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(topic_type)
				.expect(200, done);
			},
			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`)
				.expect(200, function(err, res){
					expect(res.body.topic_type === topic_type.topic_type);
					done(err);
				});
			},
		], done);
	});


	it('change desc should succee', function(done){

		let issue = Object.assign({"name":"Issue test"}, baseIssue);
		let issueId;
		let desc = { desc: 'for abcdef'};
		async.series([
			function(done){
				agent.post(`/${username}/${project}/issues.json`)
				.send(issue)
				.expect(200 , function(err, res){
					issueId = res.body._id;
					return done(err);
					
				});
			},
			function(done){
				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(desc)
				.expect(200, done);
			},
			function(done){
				agent.get(`/${username}/${project}/issues/${issueId}.json`)
				.expect(200, function(err, res){
					expect(res.body.desc === desc.desc);
					done(err);
				});
			},
		], done);
	});


	// it('change or commenting should fail if status is closed', function(done){

	// 	let issue = Object.assign({"name":"Issue test"}, baseIssue, {status: 'closed'});
	// 	let issueId;

	// 	async.series([
	// 		function(done){
	// 			agent.post(`/${username}/${project}/issues.json`)
	// 			.send(issue)
	// 			.expect(200 , function(err, res){
	// 				issueId = res.body._id;
	// 				return done(err);
					
	// 			});
	// 		},
	// 		function(done){
	// 			agent.put(`/${username}/${project}/issues/${issueId}.json`)
	// 			.send({ desc: 'desc'})
	// 			.expect(400, function(err, res){
	// 				expect(res.body.value).to.equal(responseCodes.ISSUE_CLOSED_ALREADY.value);
	// 				done(err);
	// 			});
	// 		},
	// 		function(done){
	// 			agent.put(`/${username}/${project}/issues/${issueId}.json`)
	// 			.send({ topic_type: 'desc'})
	// 			.expect(400, function(err, res){
	// 				expect(res.body.value).to.equal(responseCodes.ISSUE_CLOSED_ALREADY.value);
	// 				done(err);
	// 			});
	// 		},
	// 		function(done){
	// 			agent.put(`/${username}/${project}/issues/${issueId}.json`)
	// 			.send({ priority: 'high'})
	// 			.expect(400, function(err, res){
	// 				expect(res.body.value).to.equal(responseCodes.ISSUE_CLOSED_ALREADY.value);
	// 				done(err);
	// 			});
	// 		},
	// 	], done);
	// });

	describe('and then sealing a comment', function(){

		let issueId;

		before(function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);

			async.series([
				function(done){
					agent.post(`/${username}/${project}/issues.json`)
					.send(issue)
					.expect(200 , function(err, res){
						issueId = res.body._id;
						done(err);
					});
				},
				function(done){

					let comment = { 
						comment: 'hello world',
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
					};

					agent.put(`/${username}/${project}/issues/${issueId}.json`)
					.send(comment)
					.expect(200 , done);

				}
			], done);

		});

		it('should succee', function(done){
			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send({sealed: true, commentIndex: 0})
			.expect(200, function(err, res){
				done(err);
			});
		});


		it('should fail if editing a sealed comment', function(done){
			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send({comment: 'abcd', commentIndex: 0, edit: true})
			.expect(400, function(err, res){
				expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
				done(err);
			});
		});

	});

	describe('and then commenting', function(){

		let issueId;

		before(function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);

			agent.post(`/${username}/${project}/issues.json`)
			.send(issue)
			.expect(200 , function(err, res){
				issueId = res.body._id;
				done(err);
			});

		});

		it('should succee', function(done){

			let comment = { 
				comment: 'hello world',
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
			};

			async.series([
				function(done){
					agent.put(`/${username}/${project}/issues/${issueId}.json`)
					.send(comment)
					.expect(200 , done);
				},

				function(done){
					agent.get(`/${username}/${project}/issues/${issueId}.json`).expect(200, function(err , res){

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


		it('should succee if editing an existing comment', function(done){

			let comment = { comment: 'hello world 2', commentIndex: 0, edit: true };

			async.series([
				function(done){
					agent.put(`/${username}/${project}/issues/${issueId}.json`)
					.send(comment)
					.expect(200 , done);
				},

				function(done){
					agent.get(`/${username}/${project}/issues/${issueId}.json`).expect(200, function(err , res){

						expect(res.body.comments.length).to.equal(1);
						expect(res.body.comments[0].comment).to.equal(comment.comment);
						expect(res.body.comments[0].owner).to.equal(username);

						done(err);
					});
				}
			], done);

		});



		it('should fail if comment is empty', function(done){

			let comment = { comment: '' };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send({comment})
			.expect(400 , function(err, res){
				expect(res.body.value).to.equal(responseCodes.MONGOOSE_VALIDATION_ERROR({}).value);
				done(err);
			});
		});


		it('should succee if removing an existing comment', function(done){

			let comment = { commentIndex: 0, delete: true };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send(comment)
			.expect(200 , function(err, res){
				done(err);
			});
		});

		it('should fail if invalid issue ID is given', function(done){
			
			let invalidId = '00000000-0000-0000-0000-000000000000';
			let comment = { comment: 'hello world' };

			agent.put(`/${username}/${project}/issues/${invalidId}.json`)
			.send(comment)
			.expect(404 , function(err, res){
				done(err);
			});
		});

	});

	describe('and then closing it', function(){

		let issueId;

		before(function(done){

			let issue = Object.assign({"name":"Issue test"}, baseIssue);

			agent.post(`/${username}/${project}/issues.json`)
			.send(issue)
			.expect(200 , function(err, res){

				if(err) {
					return done(err);
				}

				issueId = res.body._id;

				//add an comment
				let comment = { comment: 'hello world' };

				agent.put(`/${username}/${project}/issues/${issueId}.json`)
				.send(comment)
				.expect(200 , function(err, res){
					done(err);
				});
			});

		});

		it('should succee', function(done){

			let close = { status: 'closed' };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send(close)
			.expect(200 , function(err, res){

				done(err);

			});
		});

		it('should fail if adding a comment', function(done){
			let comment = { comment: 'hello world' };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send(comment)
			.expect(400 , function(err, res){

				expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
				return done(err);

			});
		});

		it('should fail if removing a comment', function(done){
			let comment = { commentIndex: 0, delete: true };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send(comment)
			.expect(400 , function(err, res){

				expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
				return done(err);

			});
		});

		it('should fail if editing a comment', function(done){
			let comment = { comment: 'hello world 2', commentIndex: 0, edit: true };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send(comment)
			.expect(400 , function(err, res){

				expect(res.body.value).to.equal(responseCodes.ISSUE_COMMENT_SEALED.value);
				return done(err);

			});
		});


		it('should succee if reopening', function(done){

			let open = {  status: 'open' };

			agent.put(`/${username}/${project}/issues/${issueId}.json`)
			.send(open)
			.expect(200 , function(err, res){
				done(err)

			});
		});

		it('should fail if invalid issue ID is given', function(done){
			
			let invalidId = '00000000-0000-0000-0000-000000000000';
			let close = { status: 'closed' };

			agent.put(`/${username}/${project}/issues/${invalidId}.json`)
			.send(close )
			.expect(404 , function(err, res){
				done(err);
			});
		});

	})


});
