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
const chai = require("chai")
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const session =  require("express-session")({ secret: "testing"});
const config = require("../../config");
const app = require("../../services/api.js").createApp(
	{ session: config.api_server.session }
);
const async = require("async");
const http = require("http");
// let newXhr = require('socket.io-client-cookie');
const io = require("socket.io-client");
const bouncerHelper = require("./bouncerHelper");

describe("Chat service", function () {

	let server;
	let agent;
	let agent2;
	let issueId;


	const username = "collaboratorTeamspace1Model1JobA"
	const password = "password";

	const account = "teamSpace1";
	const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";

	let cookies;
	let socket;
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
		"assigned_roles":[]
	};

	let connectSid;

	before(function(done) {
		server = app.listen(8080, function () {

			const chatServer = http.createServer();

			const chat = require("../../services/chat.js").createApp(
				chatServer, config.chat_server
			);

			chatServer.listen(config.chat_server.port, function() {
				async.series([
					function(done) {
						agent = request.agent(server);
						agent.post("/login")
							.send({ username, password })
							.expect(200, function(err, res) {
								cookies = res.header["set-cookie"][0];

								cookies.split(";").forEach(keyval => {
									if(keyval) {
										keyval = keyval.split("=");
										if(keyval[0] === "connect.sid") {
											connectSid = keyval[1];
										}
									}
								});
								done(err);
							});
					},
					function(done) {
						agent2 = request.agent(server);
						agent2.post("/login")
							.send({ username: account, password })
							.expect(200, done);
					},
					done => agent.delete("/notifications").expect(200, done)
				], done);

			});
		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	it("connect to chat server and join room should succeed", function(done) {
		this.timeout(2000);

		// https://gist.github.com/jfromaniello/4087861
		// socket-io.client send the cookies!

		// newXhr.setCookies(`connect.sid=${connectSid}; `);
		socket = io(config.chat_server.chat_host, {path: "/" + config.chat_server.subdirectory, extraHeaders:{
			Cookie: `connect.sid=${connectSid}; `
		}});
		socket.on("connect", function(data) {

			socket.emit("join", {account, model});

			socket.emit("join", {account: username});

			socket.on("joined", function(data) {
				if(data.account === account && data.model === model) {
					socket.off("joined");
					done();
				}
			});

			socket.on("credentialError", function(err) {
				done(err);
			});
		});

	});

	it("join a room that user has no access to should fail", function(done) {

		// newXhr.setCookies(`connect.sid=${connectSid}; `);

		// https://github.com/socketio/socket.io-client/issues/318 force new connection
		const mySocket = io(config.chat_server.chat_host, {path: "/" + config.chat_server.subdirectory, "force new connection": true, extraHeaders:{
			Cookie: `connect.sid=${connectSid}; `
		}});

		mySocket.on("connect", function(data) {
			console.log("on connect");
			mySocket.emit("join", {account: "someaccount", model: "someproject"});

			mySocket.on("credentialError", function(err) {
				expect(err).to.exist;
				done();
			});
		});
	});

	it("subscribe new issue chat event should succeed", function(done) {

		// other users post an issue
		const issue = Object.assign({"name":"Issue test"}, baseIssue);

		socket.on(`${account}::${model}::issueCreated`, function(issues) {
			socket.off(`${account}::${model}::issueCreated`);

			expect(issues[0]).to.exist;
			expect(issues[0].name).to.equal(issue.name);
			expect(issues[0].scale).to.equal(issue.scale);
			expect(issues[0].status).to.equal(issue.status);
			expect(issues[0].topic_type).to.equal(issue.topic_type);
			expect(issues[0].priority).to.equal(issue.priority);
			expect(issues[0].creator_role).to.equal(issue.creator_role);
			expect(issues[0].assigned_roles).to.deep.equal(issue.assigned_roles);
			expect(issues[0].viewpoint.up).to.deep.equal(issue.viewpoint.up);
			expect(issues[0].viewpoint.position).to.deep.equal(issue.viewpoint.position);
			expect(issues[0].viewpoint.look_at).to.deep.equal(issue.viewpoint.look_at);
			expect(issues[0].viewpoint.view_dir).to.deep.equal(issue.viewpoint.view_dir);
			expect(issues[0].viewpoint.right).to.deep.equal(issue.viewpoint.right);
			expect(issues[0].viewpoint.unityHeight).to.equal(issue.viewpoint.unityHeight);
			expect(issues[0].viewpoint.fov).to.equal(issue.viewpoint.fov);
			expect(issues[0].viewpoint.aspect_ratio).to.equal(issue.viewpoint.aspect_ratio);
			expect(issues[0].viewpoint.far).to.equal(issue.viewpoint.far);
			expect(issues[0].viewpoint.near).to.equal(issue.viewpoint.near);
			expect(issues[0].viewpoint.clippingPlanes).to.deep.equal(issue.viewpoint.clippingPlanes);
			issueId = issues[0]._id;


			done();
		});

		agent2.post(`/${account}/${model}/issues.json`)
			.send(issue)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});

		socket.on("credentialError", function(err) {
			done(err);
		});
	});

	it("subscribe new comment chat event should succeed", function(done) {
		const comment = {"comment":"abc123","viewpoint":{"up":[0,1,0],"position":[38,38,125.08011914810137],"look_at":[0,0,-1],"view_dir":[0,0,-1],"right":[1,0,0],"unityHeight":3.598903890627168,"fov":2.127137068283407,"aspect_ratio":0.8810888191084674,"far":244.15656512260063,"near":60.08161739445468,"clippingPlanes":[]}};

		socket.on(`${account}::${model}::${issueId}::commentCreated`, function(resComment) {
			expect(resComment).to.exist;
			expect(resComment.comment).to.equal(comment.comment);
			expect(resComment.viewpoint.up).to.deep.equal(comment.viewpoint.up);
			expect(resComment.viewpoint.position).to.deep.equal(comment.viewpoint.position);
			expect(resComment.viewpoint.look_at).to.deep.equal(comment.viewpoint.look_at);
			expect(resComment.viewpoint.view_dir).to.deep.equal(comment.viewpoint.view_dir);
			expect(resComment.viewpoint.right).to.deep.equal(comment.viewpoint.right);
			expect(resComment.viewpoint.unityHeight).to.equal(comment.viewpoint.unityHeight);
			expect(resComment.viewpoint.fov).to.equal(comment.viewpoint.fov);
			expect(resComment.viewpoint.aspect_ratio).to.equal(comment.viewpoint.aspect_ratio);
			expect(resComment.viewpoint.far).to.equal(comment.viewpoint.far);
			expect(resComment.viewpoint.near).to.equal(comment.viewpoint.near);
			expect(resComment.viewpoint.clippingPlanes).to.deep.equal(comment.viewpoint.clippingPlanes);

			done();
		});

		// console.log('issueId2', issueId);
		agent2.put(`/${account}/${model}/issues/${issueId}.json`)
			.send(comment)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});

	it("subscribe comment changed chat event should succeed", function(done) {
		const comment = {"comment":"abc123456","edit":true,"commentIndex":0};

		socket.on(`${account}::${model}::${issueId}::commentUpdated`, function(resComment) {
			expect(resComment).to.exist;
			expect(resComment.comment).to.equal(comment.comment);
			done();
		});

		agent2.put(`/${account}/${model}/issues/${issueId}.json`)
			.send(comment)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});

	it("subscribe comment deleted chat event should succeed", function(done) {
		const comment = {"comment":"","delete":true,"commentIndex":0};

		socket.on(`${account}::${model}::${issueId}::commentDeleted`, function(resComment) {
			expect(resComment).to.exist;
			done();
		});

		agent2.put(`/${account}/${model}/issues/${issueId}.json`)
			.send(comment)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});

	it("subscribe issue change should succeed", function(done) {

		const status = {"priority":"high"}

		socket.off(`${account}::${model}::${issueId}::commentCreated`);

		async.parallel([
			function(done) {
				socket.on(`${account}::${model}::${issueId}::commentCreated`, function(resComment) {
					expect(resComment).to.exist;
					expect(resComment.action).to.deep.equal({"property":"priority","from":"low","to":"high"});

					socket.off(`${account}::${model}::${issueId}::commentCreated`);
					done();
				});
			},
			function(done) {
				socket.on(`${account}::${model}::issueUpdated`, function(issue) {
					expect(issue).to.exist;
					expect(issue.priority).to.equal("high");

					socket.off(`${account}::${model}::issueUpdated`);
					done();
				});
			}
		], done);

		agent2.put(`/${account}/${model}/issues/${issueId}.json`)
			.send({"priority":"high"})
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});

	describe("with notifications", function() {
		let notificationId = "";
		let issueId2 = null;

		it("should receive a new notification event when a notification has been created", done => {
			socket.on(`${username}::notificationUpserted`, function(notification) {
				socket.off(`${username}::notificationUpserted`);

				expect(notification).to.exist;

				expect(notification).to.shallowDeepEqual({type:"ISSUE_ASSIGNED",teamSpace: account, modelId: model, read: false});
				expect(notification.issuesId).to.be.an('array').that.includes(issueId);

				notificationId =  notification._id;

				done();
			});

			agent2.put(`/${account}/${model}/issues/${issueId}.json`)
			.send({"assigned_roles":["jobA"]})
			.expect(200 , function(err, res) {
				if (err) {done(err);}
			});

		});

		it("should receive an upsert event when another issue of the same model has been assigned to the user", done => {
			// TODO: finish me
			const issue = Object.assign({"name":"Issue test"}, baseIssue);

			socket.on(`${username}::notificationUpserted`, function(notification) {
				socket.off(`${username}::notificationUpserted`);

				expect(notification).to.exist;

				expect(notification).to.shallowDeepEqual({type:"ISSUE_ASSIGNED",
															teamSpace: account,
															modelId: model,
															read: false,
															_id: notificationId});

				expect(notification.issuesId).to.be.an('array').to.deep.equal([issueId, issueId2]);
				done();
			});

			const createIssue =  issue => next => agent2.post(`/${account}/${model}/issues.json`)
														.send(issue)
														.expect(200 , next);

			const assignJoBA = (res, next) => {
				agent2.put(`/${account}/${model}/issues/${res._id}.json`)
					.send({assigned_roles : ["jobA"]})
					.expect(200 , function(err, res) {
						next(err);
					});
			};

			async.waterfall([
				createIssue(issue),
				(res, next) => {
					issueId2 = res.body._id;
					next(null, res.body);
				},
				assignJoBA,
			]);
		});

		it("should receive an upsert notification when an issue associated with a notification(which has multiple issues) has been closed", done => {

			socket.on(`${username}::notificationUpserted`, function(notification) {
				socket.off(`${username}::notificationUpserted`);

				expect(notification).to.exist;
				expect(notification).to.shallowDeepEqual({_id: notificationId});
				expect(notification.issuesId).to.be.an('array').to.deep.equal([issueId]);

				done();
			});

			agent2.put(`/${account}/${model}/issues/${issueId2}.json`)
					.send({status : "closed"})
					.expect(200 , function(err, res) {
						if (err) done(err);
					});
		});

		it("should receive a delete notification event when the last issue with the notification has been closed", done => {
			socket.on(`${username}::notificationDeleted`, function(notification) {
				socket.off(`${username}::notificationDeleted`);
				expect(notification).to.shallowDeepEqual({_id: notificationId});

				done();
			});

			agent2.put(`/${account}/${model}/issues/${issueId}.json`)
					.send({status : "closed"})
					.expect(200 , function(err, res) {
						if (err) done(err);
					});
		});


		it("should receive an upsert event when a new issue has being created ", done => {
			const eventName = `${username}::notificationUpserted`;

			// TODO: finish me
			const issue = Object.assign({}, baseIssue, {"name":"Issue test", assigned_roles : ["jobA"]});

			socket.on(eventName, function(notification) {
				socket.off(eventName);

				expect(notification).to.shallowDeepEqual({type:"ISSUE_ASSIGNED",
															teamSpace: account,
															modelId: model,
															read: false});
				done();
			});

			const createIssue =  issue => next => agent2.post(`/${account}/${model}/issues.json`)
														.send(issue)
														.expect(200 , next);

			const deleteAllNotifications  = next => agent2.delete("/notifications")
				.expect(200, err => next(err));

			async.waterfall([
				deleteAllNotifications,
				createIssue(issue)
			]);
		});

		it("should receive a model uploaded notification if a model has been uploaded", done => {
			const eventName = `${username}::notificationUpserted`;
			socket.on(eventName, function(notification) {
				socket.off(eventName);
				expect(notification).to.exist;

				expect(notification.type).to.equals("MODEL_UPDATED");

				bouncerHelper.stopBouncerWorker();
				done();
			});

			async.series([bouncerHelper.startBouncerWorker,
				next => agent2.post(`/${account}/${model}/upload`)
					.field("tag", "onetag")
					.attach("file", __dirname + "/../../statics/3dmodels/8000cubes.obj")
					.expect(200, function(err, res) {
						next(err);
					})
				])
		}).timeout('60s');

		it("should receive a model FAILED uploaded notification if a model uploaded had failed", done => {
			const eventName = `${username}::notificationUpserted`;

			socket.on(eventName, function(notification) {
				socket.off(eventName);
				expect(notification).to.exist;

				expect(notification.type).to.equals("MODEL_UPDATED_FAILED");

				bouncerHelper.stopBouncerWorker();
				done();
			});

			async.series([next => bouncerHelper.startBouncerWorker(next, 1),
				next => agent.post(`/${account}/${model}/upload`)
					.field("tag", "onetag")
					.attach("file", __dirname + "/../../statics/3dmodels/8000cubes.obj")
					.expect(200, function(err, res) {
						next(err);
					})
				])
		}).timeout('60s');

		it("should receive a model FAILED uploaded notification and a model updated notification if a model uploaded had been uploaded with a warning type of error", done => {
			const eventName = `${username}::notificationUpserted`;
			const receivedNotifications = [];

			socket.on(eventName, function(notification) {
				receivedNotifications.push(notification);

				if (receivedNotifications.length == 2){
					socket.off(eventName);
					const types = receivedNotifications.map(n => n.type).sort();
					expect(types).to.deep.equal([ "MODEL_UPDATED","MODEL_UPDATED_FAILED"]);
					bouncerHelper.stopBouncerWorker();
					done();
				}
			});

			async.series([next => bouncerHelper.startBouncerWorker(next, 7),
				next => agent.post(`/${account}/${model}/upload`)
					.field("tag", "onetag")
					.attach("file", __dirname + "/../../statics/3dmodels/8000cubes.obj")
					.expect(200, function(err, res) {
						next(err);
					})
				])
		}).timeout('30s');


	});

});