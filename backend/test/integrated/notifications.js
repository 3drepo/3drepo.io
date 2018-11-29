/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const app = require("../../services/api.js").createApp(
	{ session: require("express-session")({ secret: "testing",  resave: false,   saveUninitialized: false }) }
);
const async = require("async");

describe('Notifications', function() {
	let server;
	const agents = {};
	const NOTIFICATIONS_URL = "/me/notifications";

	const usernames = ["unassignedTeamspace1UserJobA",
		"viewerTeamspace1Model1JobA",
		"viewerTeamspace1Model1JobB",
		"commenterTeamspace1Model1JobA",
		"commenterTeamspace1Model1JobB",
		"collaboratorTeamspace1Model1JobA",
		"collaboratorTeamspace1Model1JobB",
		"adminTeamspace1JobA",
		"adminTeamspace1JobB",
		"teamSpace1"];

	const password = "password";
	const account = "teamSpace1";
	const model = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";

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

	before(function(done) {
		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");

			async.parallel(
				usernames.map(username => done =>
				{
					const agent = request.agent(server);
					agent.post("/login")
						.send({ username, password})
						.expect(200, function(err, res) {
							done(err);
						});

					agents[username] = agent;
				}),
				() =>
				async.parallel(
					usernames.map(username => done =>
					{
						const agent = agents[username];
						agent.delete(NOTIFICATIONS_URL)
							.expect(200, function(err, res) {
								done(err);
							});
					})
				, done)
			);
		});
	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	describe(" of type assign issue", function() {
		let issuesId = [];

		before(function(done){
			const issue = Object.assign({"name":"Assign notification test"}, baseIssue);
			const issueAssignJobA = Object.assign({}, issue, {"assigned_roles":["jobA"]});

			async.series([next =>
				agents.teamSpace1.post(`/${account}/${model}/issues.json`)
					.send(issue)
					.expect(200 , function(err, res) {
							issuesId.push(res.body._id);
							next(err);
						}),
				next =>
				 agents.teamSpace1.put(`/${account}/${model}/issues/${issuesId[0]}.json`)
				 	.send(issueAssignJobA)
				 	.expect(200 , function(err, res) {
				 			next(err);
						 })
				], done);
		});

		it("should not be created for viewers and jobB type users", function(done) {
			const users = ["unassignedTeamspace1UserJobA",
			"viewerTeamspace1Model1JobA",
			"viewerTeamspace1Model1JobB",
			"commenterTeamspace1Model1JobB",
			"collaboratorTeamspace1Model1JobB",
			"adminTeamspace1JobB",
			"teamSpace1"];


			async.parallel(users.map( username => next => {
					agents[username].get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {
						expect(res.body.length).to.equal(0);
						next();
					})

				}), done);
		});

		it("should be created for commenters/collaboratos of jobA type users (just one notification) ", function(done) {
			const users = ["commenterTeamspace1Model1JobA",
							"collaboratorTeamspace1Model1JobA",
							"adminTeamspace1JobA"];

			async.parallel(users.map( username => next => {
					agents[username].get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {
						expect(res.body.length).to.equal(1);
						const notification = res.body[0];
						expect(notification.type).to.equal("ISSUE_ASSIGNED");
						expect(notification.issuesId.length).to.equal(1);
						expect(notification.issuesId[0]).to.equal(issuesId[0]);
						expect(notification.teamSpace).to.equal(account);
						expect(notification.modelId).to.equal(model);
						expect(notification.read).to.equal(false);

						next(err);
					})

				}), done);
		});


		it("should be able to mark notifications as read", done => {
			const users = ["commenterTeamspace1Model1JobA",
							"collaboratorTeamspace1Model1JobA",
							"adminTeamspace1JobA"];
			const notifications = {};

			const notificationsRequests = users.map( username => next => {
				agents[username].get(NOTIFICATIONS_URL)
				.expect(200, function(err, res) {
					notifications[username] = res.body[0];
					next(err);
				})
			})

			const markAsRead = users.map(username => next => {
				let notification = notifications[username];

				agents[username].patch(`${NOTIFICATIONS_URL}/${notification._id}`)
				.send({read:true})
				.expect(200, function(err, res) {
					next(err);
				})
			})

			const readNotifications = users.map( username => next => {
				agents[username].get(NOTIFICATIONS_URL)
				.expect(200, function(err, res) {
					expect(res.body.length).to.equal(1);
					const notification = res.body[0];
					expect(notification.type).to.equal("ISSUE_ASSIGNED");
					expect(notification.issuesId.length).to.equal(1);
					expect(notification.issuesId[0]).to.equal(issuesId[0]);
					expect(notification.teamSpace).to.equal(account);
					expect(notification.modelId).to.equal(model);
					expect(notification.read).to.equal(true);
					next(err);
				})
			})



			async.series( [ next => async.parallel(notificationsRequests, next),
							next => async.parallel(markAsRead, next),
							next => async.parallel(notificationsRequests, next),
							next => async.parallel(readNotifications, next),
			], done);


		});

		it("should not be able to be deleted by other people which are not the user that were adressed originaly", done => {
			let notificationId = "";

			const fetchNotification = next => {
				agents.collaboratorTeamspace1Model1JobA
					.get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {
						expect(res.body.length).to.equal(1);
						const notification = res.body[0];
						notificationId =  notification._id;
						next(err);
					})
			};

			async.series([
				fetchNotification,
				next => agents.commenterTeamspace1Model1JobA
						.delete(`${NOTIFICATIONS_URL}/${notificationId}`)
						.expect(200, next),
				fetchNotification
			], done)
		})

		it("should be able to be deleted by the user that were adressed originally", done => {
			let notificationId = "";

			async.series([
				next => agents.collaboratorTeamspace1Model1JobA
					.get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {
						notificationId =  res.body[0]._id;
						next(err);
					})
				,
				next => agents.commenterTeamspace1Model1JobA
						.delete(`${NOTIFICATIONS_URL}/${notificationId}`)
						.expect(200, next),
			], done)
		})


		// - before
		// I assume:
		// cleared notifications
		// unassigned issue1Model1Teamspace1
		// unassigned issue2Model1Teamspace1
		// unassigned issue1Model2Teamspace2
		// unassigned issue2Model2Teamspace2


		// - assign issue1_teamspace1 to jobA in model 1 teamspace1
		//   -> collaboratorTeamspace1JobA, commenterTeamspace1JobA , adminTeamspace1JobA , should have one notification with the issue id of issue1model1
		//   -> rest of the users shouldnt have notifications
	});

});