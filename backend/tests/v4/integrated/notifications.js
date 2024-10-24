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
"use strict";

const { deleteNotifications, fetchNotification } = require("../helpers/notifications");
const { loginUsers } = require("../helpers/users.js");
const { createModel, createFederation, updateFederation } = require("../helpers/models");
const request = require("supertest");
const bouncerHelper = require("../helpers/bouncerHelper");
const expect = require("chai").expect;
const app = require("../../../src/v4/services/api.js").createApp();
const async = require("async");
const newId = require("uuid").v1;


let agents = {};

describe("Notifications", function() {
	this.timeout(60000);

	let server;
	const NOTIFICATIONS_URL = "/notifications";

	const usernames = ["unassignedTeamspace1UserJobA",
		"viewerTeamspace1Model1JobA",
		"viewerTeamspace1Model1JobB",
		"commenterTeamspace1Model1JobA",
		"commenterTeamspace1Model1JobB",
		"collaboratorTeamspace1Model1JobA",
		"collaboratorTeamspace1Model1JobB",
		"adminTeamspace1JobA",
		"adminTeamspace1JobB",
		"viewerTeamspace1Model1JobC",
		"collaboratorTeamspace1Model1JobC",
		"viewerTeamspace1Model1JobD",
		"collaboratorTeamspace1Model1JobD",
		"teamSpace1"]; // This is causing the MaxListenersExceededWarning;
					   // everything seems to be working as expected so it can be ignore (unless something changes)

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

	const updateIssue = (modelId, issue , id) => next => {
		return agents.teamSpace1.patch(`/${account}/${modelId}/issues/${id}`)
			.send(issue)
			.expect(200 , function(err, res) {
				next(err);
			});
	};

	const filterByIssueAssigned = n => n.filter(n => n.type == "ISSUE_ASSIGNED");
	const filterByIssueClosed = n => n.filter(n => n.type == "ISSUE_CLOSED");

	const deleteAllNotifications = next =>
		async.parallel(
			usernames.map(username => deleteNotifications(agents[username]))
			,next);


	before((done) => {
		loginUsers(usernames, password).then(
			loggedInAgents => {
				agents = loggedInAgents;
				deleteAllNotifications(done);
			});
	});

	after(() => agents.done());

	// ========================================
	// Test suite for assign issue notification
	// ========================================
	describe("of type assign issue", function() {
		const issuesId = [];

		const assignIssue = (modelId, name) => done => {
			const issue = Object.assign({"name":(name || "Assign notification test") }, baseIssue);
			const issueAssignJobA = Object.assign({}, issue, {"assigned_roles":["jobA"]});
			async.series([next =>
				agents.teamSpace1.post(`/${account}/${modelId}/issues`)
					.send(issue)
					.expect(200 , function(err, res) {
						issuesId.push(res.body._id);
						const id = issuesId[issuesId.length - 1];
						next(err);
					}),
			next =>	updateIssue(modelId, issueAssignJobA,issuesId[issuesId.length - 1])(next)
			], done);
		};

		before(assignIssue(model));

		it("should not be created for viewers and jobB type users", function(done) {
			const users = ["unassignedTeamspace1UserJobA",
				"viewerTeamspace1Model1JobA",
				"viewerTeamspace1Model1JobB",
				"commenterTeamspace1Model1JobB",
				"collaboratorTeamspace1Model1JobB",
				"adminTeamspace1JobB",
				"teamSpace1"];

			async.parallel(users.map(username => next => {
				agents[username].get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {
						expect(res.body.length).to.equal(0);
						next();
					});

			}), done);
		});

		it("should be created for commenters/collaboratos of jobA type users (just one notification) ", function(done) {
			const users = ["commenterTeamspace1Model1JobA",
				"collaboratorTeamspace1Model1JobA",
				"adminTeamspace1JobA"];

			async.parallel(users.map(username => next => {
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
						expect(notification.modelName).to.equal("Model 1");
						next(err);
					});

			}), done);
		});

		it("should be able to mark notifications as read", done => {
			const users = ["commenterTeamspace1Model1JobA",
				"collaboratorTeamspace1Model1JobA",
				"adminTeamspace1JobA"];
			const notifications = {};

			const notificationsRequests = users.map(username => next => {
				agents[username].get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {
						notifications[username] = res.body[0];
						next(err);
					});
			});

			const markAsRead = users.map(username => next => {
				const notification = notifications[username];

				agents[username].patch(`${NOTIFICATIONS_URL}/${notification._id}`)
					.send({read:true})
					.expect(200, function(err, res) {
						next(err);
					});
			});

			const readNotifications = users.map(username => next => {
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
					});
			});

			async.series([next => async.parallel(notificationsRequests, next),
				next => async.parallel(markAsRead, next),
				next => async.parallel(notificationsRequests, next),
				next => async.parallel(readNotifications, next)
			], done);
		});

		it("should not be able to be deleted by other people which are not the user that were adressed originaly", done => {
			async.waterfall([
				fetchNotification(agents.collaboratorTeamspace1Model1JobA),

				(notifications,next) => agents.commenterTeamspace1Model1JobA
					.delete(`${NOTIFICATIONS_URL}/${notifications[0]._id}`)
					.expect(404, next),

				fetchNotification(agents.collaboratorTeamspace1Model1JobA),

				(notifications,next) => {
					expect(notifications).to.be.an("array").and.to.have.length(1);
					next();
				}
			], done);
		});

		it("should be able to be deleted by the user which was addressed originally", done => {
			async.waterfall([
				fetchNotification(agents.collaboratorTeamspace1Model1JobA),
				(notifications, next) =>
					agents.collaboratorTeamspace1Model1JobA
						.delete(`${NOTIFICATIONS_URL}/${notifications[0]._id}`)
						.expect(200, next),

				fetchNotification(agents.collaboratorTeamspace1Model1JobA),
				(notifications,next) => {
					expect(notifications).to.be.an("array").and.to.have.length(0);
					next();
				}
			], done);
		});

		it("should be updated if a another issue has been assign in the same model", done => {
			async.waterfall([
				assignIssue(model, "Assign issue notification test / issue 2"),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					expect(notifications).to.be.an("array").and.to.have.length(1);
					expect(notifications[0].issuesId).to.be.an("array").and.to.eql(issuesId);
					next();
				}
			], done);
		});

		// should be removed the
		it("should remove an issue Id if the issue has been assign to a diferent profile", done => {
			const issue =  Object.assign({}, baseIssue, { "assigned_roles":[] });
			const issueJobA = Object.assign({}, issue, {"assigned_roles":["jobA"], "name":"back to jobA"});
			const issueID1 = issuesId[0];
			const issueID2 = issuesId[1];

			async.waterfall([
				updateIssue(model, issue, issueID1),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					expect(notifications).to.be.an("array").and.to.have.length(1);
					expect(notifications[0].issuesId.sort()).to.be.an("array").and.to.eql([issueID2]);
					next();
				},
				updateIssue(model, issueJobA, issueID1),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					expect(notifications).to.be.an("array").and.to.have.length(1);
					expect(notifications[0].issuesId.sort()).to.be.an("array").and.to.eql(issuesId.sort());
					next();
				}
			],done);
		});

		it("should remove an issue id if the issue has been closed", done => {
			const issue = Object.assign({}, baseIssue, {status: "closed"});
			const issueId = issuesId.pop();

			async.waterfall([
				updateIssue(model,issue, issueId),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					notifications = filterByIssueAssigned(notifications);

					expect(notifications).to.be.an("array").and.to.have.length(1);
					expect(notifications[0].issuesId.sort()).to.be.an("array").and.to.eql([issuesId[0]]);
					next();
				}
			], done);
		});

		it("should be deleted after the last issue associated in that model has been closed", done => {
			const issue = Object.assign({}, baseIssue, {status: "closed"});
			const issueId = issuesId.pop();

			async.waterfall([
				updateIssue(model, issue, issueId),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					notifications = filterByIssueAssigned(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(0);
					next();
				}
			], done);
		});

		it("should add a second notification if an issue has been assign in another model", done => {
			const model2 = "00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5";

			async.waterfall([
				assignIssue(model, "Assign issue model1"),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					notifications = filterByIssueAssigned(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(1);
					expect(notifications[0].issuesId).to.be.an("array").and.to.eql([issuesId[0]]);
					next();
				},
				assignIssue(model2, "Assign issue model2"),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					notifications = filterByIssueAssigned(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(2);
					const notIssue1 = notifications.find(notification => notification.issuesId.some(item => item == issuesId[0]));
					const notIssue2 = notifications.find(notification => notification.issuesId.some(item => item == issuesId[1]));

					expect(notIssue1).to.not.be.null;
					expect(notIssue2).to.not.be.null;

					expect(notIssue1.issuesId).to.have.length(1);
					expect(notIssue2.issuesId).to.have.length(1);

					next();
				}

			], done);
		});

		it("should be created when a new issue has being created with a JobA assigned directly", done => {
			const issue = Object.assign({"name": "New notification for jobA " }, baseIssue);
			const issueJobA = Object.assign({}, issue, {"assigned_roles":["jobA"]});

			async.waterfall([
				next => {
					agents.adminTeamspace1JobA.delete(NOTIFICATIONS_URL)
						.expect(200, () => {
							next();
						});
				},
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					notifications = filterByIssueAssigned(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(0);
					next();
				},
				next => agents.teamSpace1.post(`/${account}/${model}/issues`)
					.send(issueJobA)
					.expect(200, next),
				fetchNotification(agents.adminTeamspace1JobA),
				(notifications, next) => {
					notifications = filterByIssueAssigned(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(1);
					next();
				}
			], done);
		});
	});

	// ========================================
	// Test suite for closed issue notification
	// ========================================
	describe("of type closed issue", function() {
		const issuesId = [];
		const issue = Object.assign({}, baseIssue,  {"name": "Closed notification test","assigned_roles":["jobB"]});

		const testForNoClosedNotification = username => done => {
			const agent = agents[username];
			async.waterfall([
				fetchNotification(agent),
				(notifications, next) => {
					notifications = filterByIssueClosed(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(0,"Shouldn't have closed issue notification");
					next();
				}
			], done);
		};

		const createIssue = (modelId, name) => done => {
			agents.teamSpace1.post(`/${account}/${modelId}/issues`)
				.send({...issue, name})
				.expect(200 , function(err, res) {
					issuesId.push(res.body._id);
					done();
				});
		};

		const closeIssue = (model, id) => done =>
			updateIssue(model,  Object.assign(issue, {status:"closed"}), id)(done);

		const uncloseIssue = (model, id) => done =>
			updateIssue(model,  Object.assign(issue, {status:"in progress"}), id)(done);

		before(done => {
			async.series([
				deleteAllNotifications,
				createIssue(model, "Closed issue with two roles assigned"),
				createIssue(model, "Closed issue with one role assigned")
			], done);
		});

		it("shouldn't have a closed issue notification",
			testForNoClosedNotification("adminTeamspace1JobA")
		);

		const testForIssueX = (username, x) => done => {
			const agent = agents[username];
			async.waterfall([
				fetchNotification(agent),
				(notifications, next) => {
					notifications = filterByIssueClosed(notifications);
					expect(notifications).to.be.an("array").and.to.have.length(1,  "Should have one issue closed notification");
					const notification = notifications[0];
					expect(notification.issuesId).to.be.an("array").and.to.have.length(1, "Should have one issue id in closed notification");
					expect(notification.issuesId[0]).to.equals(issuesId[x], "The issue closed notification should be of the id");
					next();
				}
			], done);
		};

		const testForIssue0 = username => testForIssueX(username, 0);
		const testForIssue1 = username => testForIssueX(username, 1);

		describe("when a issue has been closed", () => {
			before(done => {
				async.series([
					updateIssue(model,
						Object.assign({...issue, name:"updated issue"}, {"assigned_roles": ["jobC"]}),
						issuesId[0]),  // assigns roles from jobB -> jobC
					closeIssue(model, issuesId[0])
				], done);
			});

			it("collaborator from first assigned role in issue should have a closed issue notification",
				testForIssue0("collaboratorTeamspace1Model1JobB")
			);

			it("viewer from first assigned role in issue should not have a closed issue notification",
				testForNoClosedNotification("viewerTeamspace1Model1JobB")
			);

			it("collaborator from the second time a role has been assigned to an issue should have a closed issue notification",
				testForIssue0("collaboratorTeamspace1Model1JobC")
			);

			it("viewer from the second time a role has been assing to an issue should not have a closed issue notification",
				testForNoClosedNotification("viewerTeamspace1Model1JobC")
			);

			it("collaborator from a role that has never been assign to an issue should not have a closed issue notification",
				testForNoClosedNotification("collaboratorTeamspace1Model1JobD")
			);

			it("the user that closed the issue should not get a closed issue notification",
				testForNoClosedNotification("teamSpace1")
			);

			it("the collaborator of owner's job should get a closed notification",
				testForIssue0("collaboratorTeamspace1Model1JobA")
			);

			it("the commenter of owner's job should get a closed notification",
				testForIssue0("commenterTeamspace1Model1JobA")
			);

			it("the viewer of owner's job should not get a closed notification",
				testForNoClosedNotification("viewerTeamspace1Model1JobA")
			);
		});

		describe("when two issues has been closed", () => {
			const testForBothIssues = username => done => {
				const agent = agents[username];
				async.waterfall([
					fetchNotification(agent),
					(notifications, next) => {
						notifications = filterByIssueClosed(notifications);
						expect(notifications).to.be.an("array").and.to.have.length(1,  "Should have one issue closed notification");
						const notification = notifications[0];
						expect(notification.issuesId).to.be.an("array").and.to.have.length(2, "Should have two issues ids in closed notification");
						expect(notification.issuesId.sort()).to.eql(issuesId.sort(), "The issues inside the issue closed notification should be the ones that got closed");
						next();
					}
				], done);
			};

			before(done => {
				closeIssue(model, issuesId[1])(done);
			});

			it("collaborator from first assigned role in issue should have a closed issue notification wth two issues ids",
				testForBothIssues("collaboratorTeamspace1Model1JobB")
			);

			it("collaborator from the second time a role has been assign of the first issue should still have only one closed issue notification with one issue",
				testForIssue0("collaboratorTeamspace1Model1JobC")
			);
		});

		describe("when a issue has been 'unclosed'",() => {
			before(done => {
				console.log("unclose issue" + issuesId[0]);

				uncloseIssue(model, issuesId[0])(done);
			});

			it("collaborator from first assigned role in issue should have a closed issue notification wth the second issue id only",
				testForIssue1("collaboratorTeamspace1Model1JobB")
			);

			it("collaborator from the second time a role has been assign of the first issue should not have closed notifications",
				testForNoClosedNotification("collaboratorTeamspace1Model1JobC")
			);
		});
	});

	// ========================================
	// Test suite for model update notification
	// ========================================
	describe("of type model update", ()=> {
		before(bouncerHelper.startBouncerWorker);

		const pollForNotification = (type, testFunction) => username => next => {
			const intervalHandle = setInterval(() => {

				agents[username].get(NOTIFICATIONS_URL)
					.expect(200, function(err, res) {

						const notifications =  res.body.filter(n => n.type === type);

						if (notifications.length > 0) {
							testFunction(notifications, ()=> {
								clearInterval(intervalHandle);
								next();
							});
						}
					});
			}, 500);
		};

		const upload = tag => agents.teamSpace1.post(`/${account}/${model}/upload?tag=${tag}`)
		.field("tag", tag)
		.attach("file", __dirname + "/../../../src/v4/statics/3dmodels/8000cubes.obj")
		.expect(200, function(err, res) {
			if(err) {done(err);}
		});

		const usersWithPermission = ["viewerTeamspace1Model1JobA",
		"viewerTeamspace1Model1JobB",
		"commenterTeamspace1Model1JobA",
		"commenterTeamspace1Model1JobB",
		"collaboratorTeamspace1Model1JobA",
		"collaboratorTeamspace1Model1JobB",
		"adminTeamspace1JobA",
		"adminTeamspace1JobB",
		"teamSpace1"];

		it("should be created for users with access to the model", done => {

			async.parallel(
				usersWithPermission.map(pollForNotification("MODEL_UPDATED", (notifications, next) => {
					expect(notifications.length).to.equal(1);
					expect(notifications[0].revisions.length).to.equal(1);
					next();
				} )),
				() => {
					bouncerHelper.stopBouncerWorker();
					done();
				}
			);

			upload('first');

		}).timeout(60000);

		it("should have one upload notification but with two revisions", done => {
			bouncerHelper.startBouncerWorker(() => {

				async.parallel(
					usersWithPermission.map(pollForNotification("MODEL_UPDATED", (notifications, next) => {
						expect(notifications.length).to.equal(1);
						if(notifications[0].revisions.length===2) {
							next();
						}
					})),
					() => {
						bouncerHelper.stopBouncerWorker();
						done();
					}
				);

				upload('second');
			});

		}).timeout(60000);

		it("should be not be created for users without access to the model", done => {
			agents.unassignedTeamspace1UserJobA.get(NOTIFICATIONS_URL)
				.expect(200, (err, res) => {
					const notifications =  res.body.filter(n => n.type === "MODEL_UPDATED");
					expect(notifications.length).to.equal(0);
					done(err);
				});
			});

		/*
		it("should have a notification when a federation has been updated", done => {
			bouncerHelper.startBouncerWorker(() => {

				pollForNotification("MODEL_UPDATED", (notifications, next) => {
					notifications = notifications.filter(n => (n.modelName || '').includes('myNewFed'));
					if (notifications.length !== 1) return;
					const notification =  notifications[0];
					expect(notification.federation, 'Should be a federation').to.equal(true);
					bouncerHelper.stopBouncerWorker();
					next();
				})('teamSpace1')(done);


				Promise.all([
					createModel(agents.teamSpace1, 'teamSpace1','oneModel.' + newId()),
					createModel(agents.teamSpace1, 'teamSpace1','anotherModel.' + newId())
				])
					.then(resArr => resArr.map(r=> ({database: r.body.account, model: r.body.model})))
					.then(subModels => createFederation(agents.teamSpace1,'teamSpace1', 'myNewFed.' + newId(), subModels)
						.then(resFederation => updateFederation(agents.teamSpace1, 'teamSpace1',resFederation.body.model,[subModels[0]]))
					);
			});
		}) */
	});



});
