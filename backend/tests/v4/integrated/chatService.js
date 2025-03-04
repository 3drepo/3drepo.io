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

const SessionTracker = require("../../v5/helper/sessionTracker");

const request = require("supertest");
const chai = require("chai")
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const config = require("../../../src/v4/config");
const { createApp } = require("../../../src/v4/services/api.js");
const async = require("async");
const http = require("http");
const io = require("socket.io-client");
const { deleteNotifications, filterByIssueAssigned, filterByIssueClosed } = require("../helpers/notifications");
const bouncerHelper = require("../helpers/bouncerHelper");
const debounce = require("lodash").debounce;

describe("Chat service", function () {

	let server;
	let agent;
	let testSession;
	let teamSpace1Agent;
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


	const createIssue = (agent, partialIssue) => next => {
		const issue = Object.assign(baseIssue, partialIssue);
		agent.post(`/${account}/${model}/issues`)
			.send(issue)
			.expect(200 , function(err, res) {
				if (next) next(err, res.body)
			});
	};

	const updateIssue = (agent, id, partialIssue) => next => {
			return agent.patch(`/${account}/${model}/issues/${id}`)
				.send(partialIssue)
				.expect(200 , function(err, res) {
						if (next) next(err);
					});
		};

	let connectSid;

	before(function(done) {
		require("../../../src/v5/services/eventsManager/eventsManager").reset();
		server = createApp().listen(8080, function () {

			const chatServer = http.createServer();

			const chat = require("../../../src/v4/services/chat.js").createApp(
				chatServer, config.chat_server
			);

			chatServer.listen(config.chat_server.port, function() {
				async.series([
					function(done) {
						agent = request(server);
						testSession = SessionTracker(agent)
						testSession.login(username, password).then((resp) => {
							connectSid = testSession.cookies.session;
							done();
						});
					},
					function(done) {
						teamSpace1Agent = SessionTracker(agent);
						teamSpace1Agent.login(account, password).then(()=>{done()});
					},
					done => testSession.delete("/notifications").expect(200, done),
					done => {
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

							socket.on("credentialError", done);
						});

					}

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
			expect(issues[0].viewpoint.clippingPlanes).to.deep.equal(undefined);
			issueId = issues[0]._id;


			done();
		});

		teamSpace1Agent.post(`/${account}/${model}/issues`)
			.send(issue)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});

		socket.on("credentialError", function(err) {
			done(err);
		});
	});


	let commentGuid = null;

	it("subscribe new comment chat event should succeed", function(done) {
		const comment = {"comment":"abc123","viewpoint":{"up":[0,1,0],"position":[38,38,125.08011914810137],"look_at":[0,0,-1],"view_dir":[0,0,-1],"right":[1,0,0],"fov":2.127137068283407,"aspect_ratio":0.8810888191084674,"far":244.15656512260063,"near":60.08161739445468,"clippingPlanes":[]}};

		socket.on(`${account}::${model}::${issueId}::commentCreated`, function(resComment) {
			expect(resComment).to.exist;
			expect(resComment.comment).to.equal(comment.comment);
			expect(resComment.viewpoint.up).to.deep.equal(comment.viewpoint.up);
			expect(resComment.viewpoint.position).to.deep.equal(comment.viewpoint.position);
			expect(resComment.viewpoint.look_at).to.deep.equal(comment.viewpoint.look_at);
			expect(resComment.viewpoint.view_dir).to.deep.equal(comment.viewpoint.view_dir);
			expect(resComment.viewpoint.right).to.deep.equal(comment.viewpoint.right);
			expect(resComment.viewpoint.fov).to.equal(comment.viewpoint.fov);
			expect(resComment.viewpoint.aspect_ratio).to.equal(comment.viewpoint.aspect_ratio);
			expect(resComment.viewpoint.far).to.equal(comment.viewpoint.far);
			expect(resComment.viewpoint.near).to.equal(comment.viewpoint.near);
			expect(resComment.viewpoint.clippingPlanes).to.deep.equal(undefined);

			commentGuid = resComment.guid;

			done();
		});

		teamSpace1Agent.post(`/${account}/${model}/issues/${issueId}/comments`)
			.send(comment)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});
/*
	This cant be done from the ui.
	it("subscribe comment changed chat event should succeed", function(done) {
		const comment = {"comment":"abc123456","edit":true,"commentIndex":0};

		socket.on(`${account}::${model}::${issueId}::commentUpdated`, function(resComment) {
			expect(resComment).to.exist;
			expect(resComment.comment).to.equal(comment.comment);
			done();
		});

		teamSpace1Agent.post(`/${account}/${model}/issues/${issueId}/comments`)
			.send(comment)
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});
*/

	it("subscribe comment deleted chat event should succeed", function(done) {
		const comment = {guid: commentGuid};

		socket.on(`${account}::${model}::${issueId}::commentDeleted`, function(resComment) {
			expect(resComment).to.exist;
			done();
		});

		teamSpace1Agent.delete(`/${account}/${model}/issues/${issueId}/comments`)
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
					expect(resComment.action).to.exist;
					expect(resComment.action.property).to.equal("priority");
					expect(resComment.action.from).to.equal("low");
					expect(resComment.action.to).to.equal("high");

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

		teamSpace1Agent.patch(`/${account}/${model}/issues/${issueId}`)
			.send({"priority":"high"})
			.expect(200 , function(err, res) {
				expect(err).to.not.exist;
			});
	});

	describe("with notifications", function() {
		let notificationId = "";
		let issueId2 = null;
		const notificationUpsertEvent = `${username}::notificationUpserted`;
		const notificationDeleteEvent = `${username}::notificationDeleted`;
		const jobAIssue = {"name": 'notification issue' , "assigned_roles":["jobA"]};

		const testForChatEvent =  (eventTrigger, eventName, onEventReceived) => done => {
			const events = [];

			const eventDone = () => {
				socket.off(eventName);
				done();
			}

			socket.on(eventName, eventData => {
				events.push(eventData);
				onEventReceived(events, eventDone);
			});

			eventTrigger();
		};


		describe("of issue assigned type", () => {

			before(done => { deleteNotifications(testSession)(done); });

			it("should receive a new notification event when a issue has been created",
				testForChatEvent(() => {
					createIssue(teamSpace1Agent, jobAIssue)((err, iss) => issueId = iss._id);
				},
				notificationUpsertEvent,
					(notifications, done) => {
					expect(notifications[0], 'Should have receive a ISSUE_ASSIGNED').to
						.shallowDeepEqual({
							type:"ISSUE_ASSIGNED",
							teamSpace: account,
							modelId: model,
							read: false,
							issuesId:[issueId]
						});
					done();
				}));

			it("should receive an upsert event when another issue of the same model has been assigned to the user",
				testForChatEvent(() => {
					createIssue(teamSpace1Agent, jobAIssue)((err, iss) => issueId2 = iss._id);
				},
				notificationUpsertEvent,
				(notifications, done) => {
					const notification = notifications[0];
					expect(notification, 'Should have receive a ISSUE_ASSIGNED').to
						.shallowDeepEqual({
							type:"ISSUE_ASSIGNED",
							teamSpace: account,
							modelId: model,
							read: false,
						});

					expect(notification.issuesId.sort()).to.eql([issueId, issueId2].sort(), "The notification should have both issues");
					notificationId = notification._id;
					done();
				}));

			it("should receive an upsert notification when an issue associated with a notification(which has multiple issues) has been closed",
			testForChatEvent(() => {
					updateIssue(teamSpace1Agent,issueId2 ,{status:'closed'})();
				},
				notificationUpsertEvent,
				debounce((notifications, done) => {
					const notification =  filterByIssueAssigned(notifications)[0];
					expect(notification.issuesId).to.eql([issueId], "The notification should have the first issue");
					done();
				}, 200)
			));

			it("should receive a delete notification event when the last issue with the notification has been closed",
				testForChatEvent(() => {
					updateIssue(teamSpace1Agent,issueId ,{status:'closed'})();
				},
				notificationDeleteEvent,
				(notifications, done) => {
					expect(notifications).to.have.length(1,"Should have a delete notification for an issue assigned");
					expect(notifications[0]._id).to.equal(notificationId);
					done();
				}
			));
		});

		describe("of closed issue type", () => {
			before(done => async.waterfall([
				deleteNotifications(testSession),
				createIssue(teamSpace1Agent, jobAIssue),
				(iss,next) => { issueId = iss._id; next();},
				createIssue(teamSpace1Agent, jobAIssue),
				(iss,next) => { issueId2 = iss._id; next();},
			], () => done()));

			it("should receive a new notification event when a issue has been closed",
				testForChatEvent(() => {
					updateIssue(teamSpace1Agent,issueId ,{status:'closed'})();
				},
				notificationUpsertEvent,
				debounce((notifications, done) => {
					notifications =  filterByIssueClosed(notifications);
					expect(notifications).to.have.length(1,'Should have receive a ISSUE_CLOSED');
					expect(notifications[0].issuesId).to.eql([issueId]);
					notificationId = notifications[0]._id;
					done();
				},200))
			);

			it("should receive a upsert notification event when a another issue has been closed, with the two issues in the issues_id property set",
				testForChatEvent(
					() => {
						updateIssue(teamSpace1Agent,issueId2 ,{status:'closed'})();
					},
					notificationUpsertEvent,
					debounce((notifications, done) => {
						notifications =  filterByIssueClosed(notifications);
						expect(notifications).to.have.length(1,'Should have receive a ISSUE_CLOSED');
						expect(notifications[0].issuesId.sort()).to.eql([issueId, issueId2].sort());
						done();
					},200)
				)
			);

			it("should receive a upsert notification event when a another issue has been 'unclosed', with the one issues in the issues_id property set",
				testForChatEvent(
					() => {
						updateIssue(teamSpace1Agent,issueId2 ,{status:'open'})();
					},
					notificationUpsertEvent,
					debounce((notifications, done) => {
						notifications =  filterByIssueClosed(notifications);
						expect(notifications).to.have.length(1,'Should have receive a ISSUE_CLOSED');
						expect(notifications[0].issuesId).to.eql([issueId]);
						done();
					},200)
				)
			);

			it("should receive a delete notification event when a both issues has been 'unclosed'",
				testForChatEvent(
					() => {
						updateIssue(teamSpace1Agent,issueId ,{status:'open'})();
					},
					notificationDeleteEvent,
					debounce((notifications, done) => {
						expect(notifications[0]._id).to.eql(notificationId);
						done();
					},200)
				)
			);

		});

		describe("of model type", () => {

			it("should receive a model uploaded notification if a model has been uploaded - endpoint decommissioned", done => {
				const eventName = `${username}::notificationUpserted`;
				socket.on(eventName, function(notification) {
					socket.off(eventName);
					expect(notification).to.exist;

					expect(notification.type).to.equals("MODEL_UPDATED");

					bouncerHelper.stopBouncerWorker();
					done();
				});

				async.series([bouncerHelper.startBouncerWorker,
					next => teamSpace1Agent.post(`/${account}/${model}/upload`)
						.field("tag", "onetag")
						.attach("file", __dirname + "/../../../src/v4/statics/3dmodels/8000cubes.obj")
						.expect(410, function(err, res) {
							next(err);
						})
					])
			}).timeout('60s');

			it("should receive a model FAILED uploaded notification if a model uploaded had failed - endpoint decommissioned", done => {
				const eventName = `${username}::notificationUpserted`;

				socket.on(eventName, function(notification) {
					socket.off(eventName);
					expect(notification).to.exist;

					expect(notification.type).to.equals("MODEL_UPDATED_FAILED");

					bouncerHelper.stopBouncerWorker();
					done();
				});

				async.series([next => bouncerHelper.startBouncerWorker(next, 1),
					next => testSession.post(`/${account}/${model}/upload`)
						.field("tag", "onetag")
						.attach("file", __dirname + "/../../../src/v4/statics/3dmodels/8000cubes.obj")
						.expect(410, function(err, res) {
							next(err);
						})
					])
			}).timeout('60s');

		});

	});
});
