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

const request = require('supertest');
const SessionTracker = require('../../v4/helpers/sessionTracker');
const { expect } = require('chai');
const app = require('../../../src/v4/services/api.js').createApp();
const logger = require('../../../src/v4/logger.js');
const responseCodes = require('../../../src/v4/response_codes.js');
const async = require('async');
const C = require('../../../src/v4/constants');

const { queue: { purgeQueues } } = require('../../v5/helper/services');

describe('Sharing/Unsharing a model', () => {
	const User = require('../../../src/v4/models/user');
	let server;
	let agent; let viewerAgent; let collaboratorAgent; let
		commenterAgent;
	const username = 'projectowner';
	const password = 'password';
	const model = 'testproject';
	const email = (suf) => `test3drepo_collaboration_${suf}@mailinator.com`;

	const username_viewer = 'collaborator_viewer';
	const password_viewer = 'collaborator_viewer';

	const username_editor = 'collaborator_editor';
	const password_editor = 'collaborator_editor';

	const username_commenter = 'collaborator_comm';
	const password_commenter = 'collaborator_comm';

	before(async () => {
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log('API test server is listening on port 8080!');
				resolve();
			});
		});

		const serverAgent = request(server);
		try {
			agent = SessionTracker(serverAgent);
			await agent.login(username, password);

			viewerAgent = SessionTracker(serverAgent);
			await viewerAgent.login(username_viewer, password_viewer);

			commenterAgent = SessionTracker(serverAgent);
			await commenterAgent.login(username_commenter, password_commenter);

			collaboratorAgent = SessionTracker(serverAgent);
			await collaboratorAgent.login(username_editor, password_editor);
		} catch (err) {
			throw err;
		}
	});

	after((done) => {
		console.log("!!! on after...");
		purgeQueues().then(() => {
			console.log("!!!Queues are purged...");
			server.close(() => {
				console.log("!!!Server is closed");
				console.log('API test server is closed');
				done();
			});
		});
	});

	describe('for view only', () => {
		it('should succeed and the viewer is able to see the model (with invalid permission present on the model)', (done) => {
			const permissions = [
				{ user: username_viewer, permission: 'viewer' },
			];

			async.series([
				function share(done) {
					agent.patch(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, done);
				},
				function checkSharedModelInList(done) {
					viewerAgent.get(`/${username_viewer}.json`)
						.expect(200, (err, res) => {
							expect(res.body).to.have.property('accounts').that.is.an('array');
							const account = res.body.accounts.find((a) => a.account === username);
							const modelObj = account.projects[0].models.find((_model) => _model.model === model);
							expect(modelObj).to.have.property('model', model);
							expect(modelObj.permissions).to.deep.equal(C.VIEWER_TEMPLATE_PERMISSIONS);

							done(err);
						});
				},
				function ableToViewModel(done) {
					viewerAgent.get(`/${username}/${model}/revision/master/head/unityAssets.json`)
						.expect(200, done);
				},
			], done);
		});

		it('model info api shows correct permissions', (done) => {
			viewerAgent.get(`/${username}/${model}.json`)
				.expect(200, (err, res) => {
					expect(res.body.permissions).to.deep.equal(C.VIEWER_TEMPLATE_PERMISSIONS);
					done(err);
				});
		});

		it('and the viewer should be able to see list of issues', (done) => {
			viewerAgent.get(`/${username}/${model}/issues`)
				.expect(200, done);
		});

		it('and the viewer should not be able to download the model', (done) => {
			viewerAgent.get(`/${username}/${model}/download/latest`).expect(401, done);
		});

		it("and the viewer should not be able to upload model on the V4 endpoint - endpoint decommissioned", function(done) {
			viewerAgent.post(`/${username}/${model}/upload`)
				.expect(410, done);
		});

		it('and the viewer should NOT be able to see raise issue', (done) => {
			viewerAgent.post(`/${username}/${model}/issues`)
				.send({})
				.expect(401, done);
		});

		it('and the viewer should NOT be able to delete the model', (done) => {
			viewerAgent.delete(`/${username}/${model}`)
				.send({})
				.expect(401, done);
		});

		it('and the viewer should NOT be able to update model settings', (done) => {
			const body = {
				unit: 'cm',

			};

			viewerAgent.put(`/${username}/${model}/settings`)
				.send(body).expect(401, done);
		});

		describe('and then revoking the permission', () => {
			it('should succeed and the viewer is NOT able to see the model', (done) => {
				const permissions = [
					{
						user: username_viewer,
						permission: '',
					},
				];

				async.waterfall([
					function remove(done) {
						agent.patch(`/${username}/${model}/permissions`)
							.send(permissions)
							.expect(200, (err, res) => {
								done(err);
							});
					},
					function checkSharedModelInList(done) {
						viewerAgent.get(`/${username_viewer}.json`)
							.expect(200, (err, res) => {
								expect(res.body).to.have.property('accounts').that.is.an('array');
								const account = res.body.accounts.find((a) => a.account === username);
								expect(account).to.be.undefined;

								done(err);
							});
					},
					function notAbleToViewModel(done) {
						viewerAgent.get(`/${username}/${model}/revision/master/head/unityAssets.json`)
							.expect(401, (err, res) => {
								done(err);
							});
					},
				], done);
			});

			it('and the viewer should NOT be able to see raise issue', (done) => {
				viewerAgent.post(`/${username}/${model}/issues`)
					.send({})
					.expect(401, done);
			});
		});
	});

	describe('for comment only', () => {
		it('should succeed and the commenter is able to see the model', (done) => {
			const permissions = [
				{ user: username_commenter, permission: 'commenter' },
			];

			async.series([
				function share(done) {
					agent.patch(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, done);
				},
				function checkSharedModelInList(done) {
					commenterAgent.get(`/${username_commenter}.json`)
						.expect(200, (err, res) => {
							expect(res.body).to.have.property('accounts').that.is.an('array');
							const account = res.body.accounts.find((a) => a.account === username);
							const modelObj = account.projects[0].models.find((_model) => _model.model === model);
							expect(modelObj).to.have.property('model', model);
							expect(modelObj.permissions).to.deep.equal(C.COMMENTER_TEMPLATE_PERMISSIONS);

							done(err);
						});
				},
				function ableToViewModel(done) {
					commenterAgent.get(`/${username}/${model}/revision/master/head/unityAssets.json`)
						.expect(200, done);
				},
			], done);
		});

		it('model info api shows correct permissions', (done) => {
			commenterAgent.get(`/${username}/${model}.json`)
				.expect(200, (err, res) => {
					expect(res.body.permissions).to.deep.equal(C.COMMENTER_TEMPLATE_PERMISSIONS);
					done(err);
				});
		});

		it('and the commenter should be able to see list of issues', (done) => {
			commenterAgent.get(`/${username}/${model}/issues`)
				.expect(200, done);
		});

		it('and the commenter should not be able to download the model', (done) => {
			commenterAgent.get(`/${username}/${model}/download/latest`).expect(401, done);
		});

		it('and the commenter should be able to see raise issue', (done) => {
			const issue = {
				name: 'issue',
				status: 'open',
				priority: 'medium',
				viewpoint: {
					up: [0, 1, 0],
					position: [38, 38, 125.08011914810137],
					look_at: [0, 0, -163.08011914810137],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					'unityHeight ': 3.537606904422707,
					fov: 2.1124830653010416,
					aspect_ratio: 0.8750189337327384,
					far: 276.75612077194506,
					near: 76.42411012233212,
					clippingPlanes: [],
				},
				scale: 1,
				creator_role: 'testproject.collaborator',
				assigned_roles: ['testproject.collaborator'],
			};

			commenterAgent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200, done);
		});

		it("and the commenter should not be able to upload model on the V4 endpoint - endpoint decommissioned", function(done) {
			commenterAgent.post(`/${username}/${model}/upload`)
				.expect(410, done);
		});

		it('and the commenter should NOT be able to delete the model', (done) => {
			commenterAgent.delete(`/${username}/${model}`)
				.send({})
				.expect(401, done);
		});

		it('and the commenter should NOT be able to update model settings', (done) => {
			const body = {

				unit: 'cm',

			};

			commenterAgent.put(`/${username}/${model}/settings`)
				.send(body).expect(401, done);
		});

		describe('and then revoking the permissions', (done) => {
			it('should succeed and the commenter is NOT able to see the model', (done) => {
				const permissions = [
					{
						user: username_commenter,
						permission: '',
					},
				];

				async.waterfall([
					function remove(done) {
						agent.patch(`/${username}/${model}/permissions`)
							.send(permissions)
							.expect(200, (err, res) => {
								done(err);
							});
					},
					function checkSharedModelInList(done) {
						commenterAgent.get(`/${username_commenter}.json`)
							.expect(200, (err, res) => {
								expect(res.body).to.have.property('accounts').that.is.an('array');
								const account = res.body.accounts.find((a) => a.account === username);
								expect(account).to.be.undefined;

								done(err);
							});
					},
					function notAbleToViewModel(done) {
						commenterAgent.get(`/${username}/${model}/revision/master/head/unityAssets.json`)
							.expect(401, (err, res) => {
								done(err);
							});
					},
				], done);
			});

			it('and the commenter should NOT be able to see raise issue', (done) => {
				commenterAgent.post(`/${username}/${model}/issues`)
					.send({ })
					.expect(401, done);
			});
		});
	});

	describe('for collaborator', () => {
		it('should succeed and the editor is able to see the model', (done) => {
			const permissions = [
				{ user: username_editor, permission: 'collaborator' },
			];

			async.series([
				function share(done) {
					agent.patch(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, done);
				},
				function checkSharedModelInList(done) {
					collaboratorAgent.get(`/${username_editor}.json`)
						.expect(200, (err, res) => {
							expect(res.body).to.have.property('accounts').that.is.an('array');
							const account = res.body.accounts.find((a) => a.account === username);
							const modelObj = account.projects[0].models.find((_model) => _model.model === model);
							expect(modelObj).to.have.property('model', model);
							expect(modelObj.permissions).to.deep.equal(C.COLLABORATOR_TEMPLATE_PERMISSIONS);

							done(err);
						});
				},
				function ableToViewModel(done) {
					collaboratorAgent.get(`/${username}/${model}/revision/master/head/unityAssets.json`)
						.expect(200, done);
				},
			], done);
		});

		it('model info api shows correct permissions', (done) => {
			collaboratorAgent.get(`/${username}/${model}.json`)
				.expect(200, (err, res) => {
					expect(res.body.permissions).to.deep.equal(C.COLLABORATOR_TEMPLATE_PERMISSIONS);
					done(err);
				});
		});

		it('and the editor should be able to see list of issues', (done) => {
			collaboratorAgent.get(`/${username}/${model}/issues`)
				.expect(200, done);
		});

		it('and the editor should be able to raise issue', (done) => {
			const issue = {
				name: 'issue',
				status: 'open',
				priority: 'medium',
				viewpoint: {
					up: [0, 1, 0],
					position: [38, 38, 125.08011914810137],
					look_at: [0, 0, -163.08011914810137],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					'unityHeight ': 3.537606904422707,
					fov: 2.1124830653010416,
					aspect_ratio: 0.8750189337327384,
					far: 276.75612077194506,
					near: 76.42411012233212,
					clippingPlanes: [],
				},
				scale: 1,
				creator_role: 'testproject.collaborator',
				assigned_roles: ['testproject.collaborator'],
			};

			collaboratorAgent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200 , done);
		});

		it("and the collaborator should not be able to upload model on the V4 endpoint - endpoint decommissioned", function(done) {
			collaboratorAgent.post(`/${username}/${model}/upload`)
				.field("tag", "collab_upload")
				.expect(410, done);
		});

		it('and the collaborator should be able to download the model', (done) => {
			collaboratorAgent.get(`/${username}/${model}/download/latest`).expect(200, done);
		});

		it('and the collaborator should NOT be able to delete the model', (done) => {
			collaboratorAgent.delete(`/${username}/${model}`)
				.send({})
				.expect(401, done);
		});

		it('and the collaborator should NOT be able to update model settings', (done) => {
			const body = {

				unit: 'cm',

			};

			collaboratorAgent.put(`/${username}/${model}/settings`)
				.send(body).expect(401, done);
		});

		describe('and then revoking the permissions', (done) => {
			it('should succeed and the editor is NOT able to see the model', (done) => {
				const permissions = [
					{
						user: username_editor,
						permission: '',
					},
				];

				async.waterfall([
					function remove(done) {
						agent.patch(`/${username}/${model}/permissions`)
							.send(permissions)
							.expect(200, (err, res) => {
								done(err);
							});
					},
					function checkSharedModelInList(done) {
						collaboratorAgent.get(`/${username_editor}.json`)
							.expect(200, (err, res) => {
								expect(res.body).to.have.property('accounts').that.is.an('array');
								const account = res.body.accounts.find((a) => a.account === username);
								expect(account).to.be.undefined;

								done(err);
							});
					},
					function notAbleToViewModel(done) {
						collaboratorAgent.get(`/${username}/${model}/revision/master/head/unityAssets.json`)
							.expect(401, (err, res) => {
								done(err);
							});
					},
				], done);
			});

			it('and the editor should NOT be able to raise issue', (done) => {
				collaboratorAgent.post(`/${username}/${model}/issues`)
					.send({})
					.expect(401, done);
			});
		});
	});

	describe('for non-existing user', () => {
		it('should fail', (done) => {
			const permissions = [{ user: `${username_viewer}99`, permission: 'collaborator' }];

			agent.patch(`/${username}/${model}/permissions`)
				.send(permissions)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.USER_NOT_FOUND.value);
					done(err);
				});
		});
	});

	describe('to the same user twice', () => {
		const permissions = [
			{ user: username_viewer, permission: 'viewer' },
			{ user: username_viewer, permission: 'viewer' },
		];

		it('should be ok and reduced to one by the backend and response body should show all subscription users', (done) => {
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/permissions`)
						.send(permissions)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/permissions`)
						.expect(200, (err, res) => {
							expect(res.body.find((p) => p.user === username_viewer)).to.deep.equal({ user: username_viewer, permission: 'viewer' });
							expect(res.body.find((p) => p.user === username_editor)).to.deep.equal({ user: username_editor });
							expect(res.body.find((p) => p.user === username_commenter)).to.deep.equal({ user: username_commenter });
							done(err);
						});
				},
			], done);
		});
	});
});
