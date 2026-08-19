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

'use strict';

const request = require('supertest');
const SessionTracker = require('../helpers/sessionTracker');
const { createAppAsync } = require("../../../src/v4/services/api.js");
const responseCodes = require('../../../src/v4/response_codes.js');
const { templates: responseCodesV5 } = require('../../../src/v5/utils/responseCodes');
const async = require('async');
const { createIssue } = require('../helpers/issues.js');
const { deleteNotifications, fetchNotification } = require('../helpers/notifications.js');
const { createModel } = require('../helpers/models.js');
const { cloneDeep } = require('lodash');

describe('Issues', () => {
	let server;
	let agent;
	let teamspace1Agent;
	let collabAgent;
	let commenterAgent;
	let projectAdminAgent;

	const timeout = 30000;
	const username = 'issue_username';
	const username2 = 'issue_username2';
	const password = 'password';

	const commenterUser = 'commenterTeamspace1Model1JobA';

	const projectAdminUser = 'imProjectAdmin';

	const model = 'project1';

	const pngBase64 = require('../statics/images/avatar.base64');
	const altBase64 = require('../statics/images/dog.base64');
	const pdfBase64 = require('../statics/documents/tocatta_pdf');

	const baseIssue = {
		status: 'open',
		priority: 'low',
		topic_type: 'for info',
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
		},
		scale: 1,
		creator_role: 'jobA',
		assigned_roles: ['jobB'],
	};

	const bcf = {
		path: '/../statics/bcf/example1.bcf',
		withEmptyComment: '/../statics/bcf/emptyComment.bcfzip',
		withGroupsPath: '/../statics/bcf/withGroups.bcf',
		invalidFile: '/../statics/bcf/notBCF.txt',
		solibri: '/../statics/bcf/solibri.bcf',
		sizeZero: '/../statics/bcf/sizeZero.bcf',
		issue1: '75959a60-8ef1-11e6-8d05-9717c0574272',
		issue2: '8d46d1b0-8ef1-11e6-8d05-9717c0574272',
	};

	beforeAll(async () => {
		const app = await createAppAsync();
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log('API test server is listening on port 8080!');
				resolve();
			});
		});

		agent = SessionTracker(request(server));
		await agent.login(username, password);

		teamspace1Agent = SessionTracker(request(server));
		await teamspace1Agent.login('teamSpace1', password);

		collabAgent = SessionTracker(request(server));
		await collabAgent.login(username2, password);

		projectAdminAgent = SessionTracker(request(server));
		await projectAdminAgent.login(projectAdminUser, projectAdminUser);

		commenterAgent = SessionTracker(request(server));
		await commenterAgent.login(commenterUser, password);
	});

	afterAll((done) => {
		server.close(() => {
			console.log('API test server is closed');
			done();
		});
	});

	describe('Creating an issue', () => {
		it('should succeed', async () => {
			const issue = { name: 'Issue test', ...cloneDeep(baseIssue) };
			let res = (await agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200));

			const issueId = res.body._id;

			expect(res.body.name).toBe(issue.name);
			expect(res.body.scale).toBe(issue.scale);
			expect(res.body.status).toBe(issue.status);
			expect(res.body.topic_type).toBe(issue.topic_type);
			expect(res.body.priority).toBe(issue.priority);
			expect(res.body.creator_role).toBe(issue.creator_role);
			expect(res.body.assigned_roles).toEqual(issue.assigned_roles);
			expect(res.body.viewpoint.up).toEqual(issue.viewpoint.up);
			expect(res.body.viewpoint.position).toEqual(issue.viewpoint.position);
			expect(res.body.viewpoint.look_at).toEqual(issue.viewpoint.look_at);
			expect(res.body.viewpoint.view_dir).toEqual(issue.viewpoint.view_dir);
			expect(res.body.viewpoint.right).toEqual(issue.viewpoint.right);
			expect(res.body.viewpoint.unityHeight).toBe(issue.viewpoint.unityHeight);
			expect(res.body.viewpoint.fov).toBe(issue.viewpoint.fov);
			expect(res.body.viewpoint.aspect_ratio).toBe(issue.viewpoint.aspect_ratio);
			expect(res.body.viewpoint.far).toBe(issue.viewpoint.far);
			expect(res.body.viewpoint.near).toBe(issue.viewpoint.near);

			res = await agent.get(`/${username}/${model}/issues/${issueId}`).expect(200);

			expect(res.body.name).toBe(issue.name);
			expect(res.body.scale).toBe(issue.scale);
			expect(res.body.status).toBe(issue.status);
			expect(res.body.topic_type).toBe(issue.topic_type);
			expect(res.body.priority).toBe(issue.priority);
			expect(res.body.creator_role).toBe(issue.creator_role);
			expect(res.body.assigned_roles).toEqual(issue.assigned_roles);
			expect(res.body.viewpoint.up).toEqual(issue.viewpoint.up);
			expect(res.body.viewpoint.position).toEqual(issue.viewpoint.position);
			expect(res.body.viewpoint.look_at).toEqual(issue.viewpoint.look_at);
			expect(res.body.viewpoint.view_dir).toEqual(issue.viewpoint.view_dir);
			expect(res.body.viewpoint.right).toEqual(issue.viewpoint.right);
			expect(res.body.viewpoint.unityHeight).toBe(issue.viewpoint.unityHeight);
			expect(res.body.viewpoint.fov).toBe(issue.viewpoint.fov);
			expect(res.body.viewpoint.aspect_ratio).toBe(issue.viewpoint.aspect_ratio);
			expect(res.body.viewpoint.far).toBe(issue.viewpoint.far);
			expect(res.body.viewpoint.near).toBe(issue.viewpoint.near);
		});

		it(' with data produced by plugins should succeed', async () => {
			const issue = {
				_id: '',
				name: 'Untitled Issue',
				owner: '',
				creator_role: null,
				created: 0,
				assigned_roles: [
					'',
				],
				account: '',
				model: '',
				desc: 'abc',
				thumbnail: null,
				resources: [],
				comments: [],
				viewpoint: {
					IsPerspective: false,
					up: [
						0.408248290463863,
						0.816496580927726,
						-0.408248290463863,
					],
					view_dir: [
						0.577350269189626,
						-0.577350269189626,
						-0.577350269189626,
					],
					position: [
						-13505.0975047777,
						24897.311391774,
						24750.5938246696,
					],
					right: [
						0.707106781186548,
						-1.66533453693773e-16,
						0.707106781186547,
					],
					clippingPlanes: null,
					type: 'orthographic',
					orthographicSize: 25243.2023026735,
				},
				status: 'open',
				due_date: 0,
				number: -1,
				topic_type: 'For information',
				priority: 'none',
			};
			let res = (await agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200));

			const issueId = res.body._id;

			expect(res.body.name).toBe(issue.name);
			expect(res.body.scale).toBe(issue.scale);
			expect(res.body.status).toBe(issue.status);
			expect(res.body.topic_type).toBe(issue.topic_type);
			expect(res.body.priority).toBe(issue.priority);
			expect(res.body.assigned_roles).toEqual(issue.assigned_roles);
			expect(res.body.viewpoint.up).toEqual(issue.viewpoint.up);
			expect(res.body.viewpoint.position).toEqual(issue.viewpoint.position);
			expect(res.body.viewpoint.look_at).toEqual(issue.viewpoint.look_at);
			expect(res.body.viewpoint.view_dir).toEqual(issue.viewpoint.view_dir);
			expect(res.body.viewpoint.right).toEqual(issue.viewpoint.right);
			expect(res.body.viewpoint.unityHeight).toBe(issue.viewpoint.unityHeight);
			expect(res.body.viewpoint.fov).toBe(issue.viewpoint.fov);
			expect(res.body.viewpoint.aspect_ratio).toBe(issue.viewpoint.aspect_ratio);
			expect(res.body.viewpoint.far).toBe(issue.viewpoint.far);
			expect(res.body.viewpoint.near).toBe(issue.viewpoint.near);

			res = await agent.get(`/${username}/${model}/issues/${issueId}`).expect(200);

			expect(res.body.name).toBe(issue.name);
			expect(res.body.scale).toBe(issue.scale);
			expect(res.body.status).toBe(issue.status);
			expect(res.body.topic_type).toBe(issue.topic_type);
			expect(res.body.priority).toBe(issue.priority);
			expect(res.body.assigned_roles).toEqual(issue.assigned_roles);
			expect(res.body.viewpoint.up).toEqual(issue.viewpoint.up);
			expect(res.body.viewpoint.position).toEqual(issue.viewpoint.position);
			expect(res.body.viewpoint.look_at).toEqual(issue.viewpoint.look_at);
			expect(res.body.viewpoint.view_dir).toEqual(issue.viewpoint.view_dir);
			expect(res.body.viewpoint.right).toEqual(issue.viewpoint.right);
			expect(res.body.viewpoint.unityHeight).toBe(issue.viewpoint.unityHeight);
			expect(res.body.viewpoint.fov).toBe(issue.viewpoint.fov);
			expect(res.body.viewpoint.aspect_ratio).toBe(issue.viewpoint.aspect_ratio);
			expect(res.body.viewpoint.far).toBe(issue.viewpoint.far);
			expect(res.body.viewpoint.near).toBe(issue.viewpoint.near);
		});

		const generateRandomString = (length = 20) => require('crypto').randomBytes(Math.ceil(length / 2.0)).toString('hex');

		it('with long desc should fail', (done) => {
			const issue = {
				name: 'Issue test',
				...baseIssue,
				desc: generateRandomString(1201)
			};

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('with screenshot should succeed', async function () {
			const issue = { name: 'Issue test', ...cloneDeep(baseIssue) };
			issue.viewpoint.screenshot = pngBase64;

			let res = await agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200);


			const issueId = res.body._id;

			res = await agent.get(`/${username}/${model}/issues/${issueId}`).expect(200);

			expect(res.body.viewpoint.screenshot).toBe(`${username}/${model}/issues/${issueId}/viewpoints/${res.body.viewpoint.guid}/screenshot.png`);
		});

		it('with screenshot using the wrong file format should fail', async () => {
			const issue = { name: 'Wrong file issue', ...cloneDeep(baseIssue) };
			issue.viewpoint.screenshot = pdfBase64;

			const res = await agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(responseCodes.FILE_FORMAT_NOT_SUPPORTED.status);

			expect(res.body.value).toBe(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
		});

		it('with an existing group associated should succeed', async () => {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';

			const groupData = {
				color: [98, 126, 184],
				objects: [
					{
						account: 'teamSpace1',
						model: model2,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
			};

			const issue = { ...baseIssue, name: 'Issue group test' };

			const groupId = (await teamspace1Agent.post(`/${username3}/${model2}/revision/master/head/groups/`)
				.send(groupData)
				.expect(200)).body._id;
			issue.viewpoint = { ...issue.viewpoint, highlighted_group_id: groupId };

			const issueId = (await teamspace1Agent.post(`/${username3}/${model2}/issues`)
				.send(issue)
				.expect(200)).body._id;

			const res = await teamspace1Agent.get(`/${username3}/${model2}/issues/${issueId}`).expect(200);
			expect(res.body.viewpoint.highlighted_group_id).toBe(groupId);
		});

		it('with a embeded group should succeed', (done) => {
			const username3 = 'teamSpace1';
			const model2 = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';

			const highlighted_group = {
				objects: [{
					account: 'teamSpace1',
					model: model2,
					shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
				}],
				color: [2555, 255, 0],
			};

			const hidden_group = {
				objects: [{
					account: 'teamSpace1',
					model: model2,
					shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
				}],
			};

			const viewpoint = { ...baseIssue.viewpoint, color: [2555, 255, 0], highlighted_group, hidden_group };

			const issue = { ...baseIssue, name: 'Issue embeded group  test', viewpoint };

			let issueId = '';
			let highlighted_group_id = '';
			let hidden_group_id = '';

			async.series([
				function (done) {
					teamspace1Agent.post(`/${username3}/${model2}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							highlighted_group_id = res.body.viewpoint.highlighted_group_id;
							hidden_group_id = res.body.viewpoint.hidden_group_id;
							return done(err);
						});
				},
				function (done) {
					teamspace1Agent.get(`/${username3}/${model2}/revision/master/head/groups/${highlighted_group_id}`)
						.expect(200, (err, res) => {
							expect(res.body.objects).toEqual(highlighted_group.objects);
							expect(res.body.color).toEqual(highlighted_group.color);
							done(err);
						});
				},
				function (done) {
					teamspace1Agent.get(`/${username3}/${model2}/revision/master/head/groups/${hidden_group_id}`)
						.expect(200, (err, res) => {
							expect(res.body.objects).toEqual(hidden_group.objects);
							done(err);
						});
				},
			], done);
		});

		it('with sequence start/end date should succeed', (done) => {
			const startDate = 1476107839000;
			const endDate = 1476107839800;
			const issue = {
				name: 'Issue test',
				sequence_start: startDate,
				sequence_end: endDate,
				...baseIssue
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							expect(res.body.sequence_start).toBe(startDate);
							expect(res.body.sequence_end).toBe(endDate);

							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`).expect(200, (err, res) => {
						expect(res.body.sequence_start).toBe(startDate);
						expect(res.body.sequence_end).toBe(endDate);

						return done(err);
					});
				},
			], done);
		});

		it('with sequence end date before start should fail', (done) => {
			const startDate = 1476107839800;
			const endDate = 1476107839000;
			const issue = {
				name: 'Issue test',
				sequence_start: startDate,
				sequence_end: endDate,
				...baseIssue
			};
			let issueId;

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_DATE_ORDER.value);
					done(err);
				});
		});

		it('with invalid sequence start/end date should fail', (done) => {
			const issue = {
				name: 'Issue test',
				sequence_start: 'invalid data',
				sequence_end: false,
				...baseIssue
			};
			let issueId;

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('with transformation should succeed', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = { transformation_group_ids: ['8d46d1b0-8ef1-11e6-8d05-000000000000'], ...issue.viewpoint };
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							expect(res.body.viewpoint.transformation_group_ids).toEqual(issue.viewpoint.transformation_group_ids);

							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`).expect(200, (err, res) => {
						expect(res.body.viewpoint.transformation_group_ids).toEqual(issue.viewpoint.transformation_group_ids);

						return done(err);
					});
				},
			], done);
		});

		it('with embedded transformation should succeed', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = { transformation_groups, ...issue.viewpoint };

			let issueId;
			let transformation_group_ids;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							transformation_group_ids = res.body.viewpoint.transformation_group_ids;

							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`).expect(200, (err, res) => {
						expect(res.body.viewpoint.transformation_group_ids).toEqual(transformation_group_ids);

						return done(err);
					});
				},
			], done);
		});

		it('with invalid (short) embedded transformation matrix should fail', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = { transformation_groups, ...issue.viewpoint };

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('with invalid (long) embedded transformation matrix should fail', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = { transformation_groups, ...issue.viewpoint };

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('with transformation group but without matrix should fail', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = { transformation_groups, ...issue.viewpoint };

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('with transformation matrix but without objects should fail', (done) => {
			const transformation_groups = [
				{
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = { transformation_groups, ...issue.viewpoint };

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('without name should fail', (done) => {
			const issue = baseIssue;

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(400, (err, res) => {
					expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it('with invalid priority value', (done) => {
			const issue = { ...baseIssue, name: 'Issue test', priority: 'abc' };

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200, (err, res) => {
					// Invalid priority is now allowed to accommodate for BCF import
					// expect(res.body.value).toBe(responseCodes.ISSUE_INVALID_PRIORITY.value);
					done(err);
				});
		});

		it('with invalid status value', (done) => {
			const issue = { ...baseIssue, name: 'Issue test', status: 'abc' };

			agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200, (err, res) => {
					// Invalid status is now allowed to accommodate for BCF import
					// expect(res.body.value).toBe(responseCodes.ISSUE_INVALID_STATUS.value);
					done(err);
				});
		});

		it('with pin should succeed and pin info is saved', (done) => {
			const issue = {
				name: 'Issue test',
				norm: [0.9999999319099296, 0.00006146719401852714, -0.000363870746590937],
				position: [33.167440465643935, 12.46054749529149, -46.997271893235435],
				...baseIssue
			};

			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							expect(res.body.position).toEqual(issue.position);
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`).expect(200, (err, res) => {
						expect(res.body.position).toEqual(issue.position);
						done(err);
					});
				},
			], done);
		});

		it('change status should succeed', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;
			const status = { status: 'in progress' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(status)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.status === status.status);
							done(err);
						});
				},
			], done);
		});

		it('change status should not fail if value is invalid', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;
			const status = { status: '999' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(status)
						.expect(200, (err, res) => {
							// Invalid status is now allowed to accommodate for BCF import
							// expect(res.body.value === responseCodes.ISSUE_INVALID_STATUS.value);
							done(err);
						});
				},
			], done);
		});

		it('change priority should succeed', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;
			const priority = { priority: 'high' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(priority)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.priority === priority.priority);
							done(err);
						});
				},
			], done);
		});

		it('change priority should not fail if value is invalid', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;
			const priority = { priority: 'xxx' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(priority)
						.expect(200, (err, res) => {
							// Invalid priority is now allowed to accommodate for BCF import
							// expect(res.body.value === responseCodes.ISSUE_INVALID_PRIORITY.value);
							done(err);
						});
				},
			], done);
		});

		it('change topic_type should succeed', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;
			const topic_type = { topic_type: 'for abcdef' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(topic_type)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.topic_type === topic_type.topic_type);
							done(err);
						});
				},
			], done);
		});

		it('change pin position should succeed', (done) => {
			const issue = { ...baseIssue, name: 'Issue test', position: [0, 1, 2] };
			let issueId;
			const position = { position: [1, -1, 9] };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(position)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.position).toEqual(position.position);
							done(err);
						});
				},
			], done);
		});

		it('add sequence start/end date should succeed', (done) => {
			const startDate = 1476107839000;
			const endDate = 1476107839800;
			const issue = { ...baseIssue, name: 'Issue test' };
			const sequenceData = {
				sequence_start: startDate,
				sequence_end: endDate,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.sequence_start).toBe(startDate);
							expect(res.body.sequence_end).toBe(endDate);
							done(err);
						});
				},
			], done);
		});

		it('add sequence end date before start should fail', (done) => {
			const startDate = 1476107839800;
			const endDate = 1476107839000;
			const issue = { ...baseIssue, name: 'Issue test' };
			const sequenceData = {
				sequence_start: startDate,
				sequence_end: endDate,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_DATE_ORDER.value);
							done(err);
						});
				},
			], done);
		});

		it('change sequence start/end date should succeed', (done) => {
			const startDate = 1476107839000;
			const endDate = 1476107839800;
			const issue = { ...baseIssue, name: 'Issue test', sequence_start: 1476107839555, sequence_end: 1476107839855 };
			const sequenceData = {
				sequence_start: startDate,
				sequence_end: endDate,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.sequence_start).toBe(startDate);
							expect(res.body.sequence_end).toBe(endDate);
							done(err);
						});
				},
			], done);
		});

		it('change sequence end date to precede start should fail', (done) => {
			const endDate = 1476107839000;
			const issue = { ...baseIssue, name: 'Issue test', sequence_start: 1476107839555, sequence_end: 1476107839855 };
			const sequenceData = {
				sequence_end: endDate,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_DATE_ORDER.value);
							done(err);
						});
				},
			], done);
		});

		it('remove sequence start/end date should succeed', (done) => {
			const issue = { ...baseIssue, name: 'Issue test', sequence_start: 1476107839555, sequence_end: 1476107839855 };
			const sequenceData = {
				sequence_start: null,
				sequence_end: null,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.sequence_start).toBeFalsy();
							expect(res.body.sequence_end).toBeFalsy();
							done(err);
						});
				},
			], done);
		});

		it('add sequence start/end date with invalid data should fail', (done) => {
			const issue = { ...baseIssue, name: 'Issue test' };
			const sequenceData = {
				sequence_start: 'invalid data',
				sequence_end: false,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
			], done);
		});

		it('change sequence start/end date with invalid data should fail', (done) => {
			const issue = { ...baseIssue, name: 'Issue test', sequence_start: 1476107839555, sequence_end: 1476107839855 };
			const sequenceData = {
				sequence_start: 'invalid data',
				sequence_end: false,
			};
			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(sequenceData)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
			], done);
		});

		it('change status should succeed and create system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, status: 'open' };
			let issueId;
			const status = { status: 'in progress' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(status)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.status === status.status);
							expect(res.body.comments[0].action).toEqual({
								property: 'status',
								from: 'open',
								to: 'in progress',
							});
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change topic type should succeed and create system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, topic_type: 'ru123' };
			let issueId;
			const data = { topic_type: 'abc123' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.topic_type === data.topic_type);
							expect(res.body.comments[0].action).toEqual({
								property: 'topic_type',
								from: 'ru123',
								to: 'abc123',
							});
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change assigned_roles should succeed and create system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			let issueId;
			const data = { assigned_roles: ['jobB'] };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.assigned_roles).toEqual(data.assigned_roles);
							expect(res.body.comments[0].action).toEqual({
								property: 'assigned_roles',
								from: 'jobA',
								to: 'jobB',
							});
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change screenshot should succeed and create system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			let issueId;
			let oldViewpoint;
			let screenshotRef;
			const data = {
				viewpoint: {
					screenshot: altBase64,
				},
			};
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.comments[0].action.property).toBe('screenshot');
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change viewpoint should succeed and create system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			let issueId;
			let oldViewpoint;
			const data = {
				viewpoint: {
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
				},
			};
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;

							expect(res.body.viewpoint.up).toEqual(data.viewpoint.up);
							expect(res.body.viewpoint.position).toEqual(data.viewpoint.position);
							expect(res.body.viewpoint.look_at).toEqual(data.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).toEqual(data.viewpoint.view_dir);
							expect(res.body.viewpoint.right).toEqual(data.viewpoint.right);
							expect(res.body.viewpoint.fov).toBe(data.viewpoint.fov);
							expect(res.body.viewpoint.aspect_ratio).toBe(data.viewpoint.aspect_ratio);
							expect(res.body.viewpoint.far).toBe(data.viewpoint.far);
							expect(res.body.viewpoint.near).toBe(data.viewpoint.near);
							expect(res.body.comments[0].action.property).toBe('viewpoint');
							expect(res.body.comments[0].action.from).toBe(JSON.stringify(oldViewpoint));
							expect(res.body.comments[0].action.to).toBe(JSON.stringify(newViewpoint));
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change screenshot and viewpoint should succeed and create two system comments', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			let issueId;
			let oldViewpoint;
			let screenshotRef;
			const data = {
				viewpoint: {
					screenshot: altBase64,
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
				},
			};

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							delete newViewpoint.screenshot;

							expect(res.body.comments[0].action.property).toBe('screenshot');
							expect(res.body.comments[0].owner).toBe(username);

							expect(res.body.viewpoint.up).toEqual(data.viewpoint.up);
							expect(res.body.viewpoint.position).toEqual(data.viewpoint.position);
							expect(res.body.viewpoint.look_at).toEqual(data.viewpoint.look_at);
							expect(res.body.viewpoint.view_dir).toEqual(data.viewpoint.view_dir);
							expect(res.body.viewpoint.right).toEqual(data.viewpoint.right);
							expect(res.body.viewpoint.fov).toBe(data.viewpoint.fov);
							expect(res.body.viewpoint.aspect_ratio).toBe(data.viewpoint.aspect_ratio);
							expect(res.body.viewpoint.far).toBe(data.viewpoint.far);
							expect(res.body.viewpoint.near).toBe(data.viewpoint.near);
							expect(res.body.comments[1].action.property).toBe('viewpoint');
							expect(res.body.comments[1].action.from).toBe(JSON.stringify(oldViewpoint));
							const vp = JSON.parse(res.body.comments[1].action.to);
							delete vp.screenshot_ref;
							expect(vp).toEqual(newViewpoint);
							expect(res.body.comments[1].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change viewpoint transformation should succeed and create system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			let issueId;
			let oldViewpoint;
			const data = {
				viewpoint: {
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
					transformation_group_ids: ['8d46d1b0-8ef1-11e6-8d05-000000000000'],
				},
			};
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							data.viewpoint.guid = res.body.viewpoint.guid;
							data.viewpoint.thumbnail = res.body.viewpoint.thumbnail;
							const { screenshotSmall, screenshot, ...viewpoint } = res.body.viewpoint;
							expect(viewpoint).toEqual(data.viewpoint);

							delete oldViewpoint.screenshotSmall;
							delete oldViewpoint.screenshot;
							delete newViewpoint.screenshotSmall;
							delete newViewpoint.screenshot;
							expect(res.body.comments[0].action.property).toBe('viewpoint');
							expect(JSON.parse(res.body.comments[0].action.from)).toEqual(oldViewpoint);
							expect(JSON.parse(res.body.comments[0].action.to)).toEqual(newViewpoint);
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change viewpoint embedded transformation should succeed and create system comment', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			const data = {
				viewpoint: {
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
					transformation_groups,
				},
			};

			let issueId;
			let oldViewpoint;
			let transformation_group_ids;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							delete oldViewpoint.screenshot;
							delete oldViewpoint.screenshotSmall;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, (err, res) => {
							transformation_group_ids = res.body.viewpoint.transformation_group_ids;
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							const newViewpoint = { ...oldViewpoint, ...data.viewpoint };
							newViewpoint.guid = res.body.viewpoint.guid;
							delete newViewpoint.transformation_groups;
							newViewpoint.transformation_group_ids = transformation_group_ids;

							data.viewpoint.guid = res.body.viewpoint.guid;
							data.viewpoint.thumbnail = res.body.viewpoint.thumbnail;
							delete data.viewpoint.transformation_groups;
							data.viewpoint.transformation_group_ids = transformation_group_ids;

							const { screenshotSmall, screenshot, ...viewpoint } = res.body.viewpoint;
							expect(viewpoint).toEqual(data.viewpoint);

							delete oldViewpoint.screenshotSmall;
							delete oldViewpoint.screenshot;
							delete newViewpoint.screenshotSmall;
							delete newViewpoint.screenshot;
							expect(res.body.comments[0].action.property).toBe('viewpoint');
							expect(JSON.parse(res.body.comments[0].action.from)).toEqual(oldViewpoint);
							expect(JSON.parse(res.body.comments[0].action.to)).toEqual(newViewpoint);
							expect(res.body.comments[0].owner).toBe(username);
							done(err);
						});
				},
			], done);
		});

		it('change viewpoint embedded transformation with bad matrix should fail', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			const data = {
				viewpoint: {
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
					transformation_groups,
				},
			};

			let issueId;
			let oldViewpoint;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.viewpoint).toEqual(oldViewpoint);
							done(err);
						});
				},
			], done);
		});

		it('with orthographic viewpoint should succeed', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			issue.viewpoint = {
				up: [0, 1, 0],
				position: [38, 38, 125.08011914810137],
				look_at: [0, 0, -163.08011914810137],
				view_dir: [0, 0, -1],
				right: [1, 0, 0],
				orthographicSize: 3.537606904422707,
				aspect_ratio: 0.8750189337327384,
				far: 276.75612077194506,
				near: 76.42411012233212,
				type: 'orthographic',
				clippingPlanes: [],
			};

			let issueId;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`).expect(200, (err, res) => {
						expect(res.body.viewpoint.type).toBe(issue.viewpoint.type);
						expect(res.body.viewpoint.orthographicSize).toBe(issue.viewpoint.orthographicSize);
						return done(err);
					});
				},
			], done);
		});

		it('change viewpoint embedded transformation without matrix should fail', (done) => {
			const transformation_groups = [
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['8b9259d2-316d-4295-9591-ae020bfcce48'],
					}],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			const data = {
				viewpoint: {
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
					transformation_groups,
				},
			};

			let issueId;
			let oldViewpoint;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.viewpoint).toEqual(oldViewpoint);
							done(err);
						});
				},
			], done);
		});

		it('change viewpoint embedded transformation without objects should fail', (done) => {
			const transformation_groups = [
				{
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
				{
					objects: [{
						account: username,
						model,
						shared_ids: ['69b60e77-e049-492f-b8a3-5f5b2730129c'],
					}],
					transformation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				},
			];

			const issue = { name: 'Issue test', ...baseIssue, assigned_roles: ['jobA'] };
			const data = {
				viewpoint: {
					up: [0, 1, 0],
					position: [20, 20, 100],
					look_at: [0, 0, -100],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					fov: 2,
					aspect_ratio: 1,
					far: 300,
					near: 50,
					transformation_groups,
				},
			};

			let issueId;
			let oldViewpoint;

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							oldViewpoint = res.body.viewpoint;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.viewpoint).toEqual(oldViewpoint);
							done(err);
						});
				},
			], done);
		});

		it('screenshot within comments should work', async () => {
			const issue = { name: 'Issue test', ...baseIssue, topic_type: 'ru123' };

			const data = { topic_type: 'abc123' };
			let commentData = {
				comment: '',
				viewpoint: {
					up: [0, 1, 0],
					position: [38, 38, 125.08011914810137],
					look_at: [0, 0, -163.08011914810137],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					unityHeight: 3.537606904422707,
					fov: 2.1124830653010416,
					aspect_ratio: 0.8750189337327384,
					far: 276.75612077194506,
					near: 76.42411012233212,
					screenshot: pngBase64,
				},
			};

			// Creating an issue
			const issueId = (await agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200)).body._id;

			// Commenting the issue
			commentData = (await agent.post(`/${username}/${model}/issues/${issueId}/comments`).send(commentData).expect(200)).body;

			expect(commentData.viewpoint.screenshot).toBeTruthy();
			expect(commentData.viewpoint.screenshot).not.toBe(pngBase64);
			expect(commentData.viewpoint.screenshotSmall).toBeTruthy();
			const commentId = commentData.guid;

			// patch stuff
			const res = await agent.patch(`/${username}/${model}/issues/${issueId}`)
				.send(data)
				.expect(200);

			const comment = res.body.comments.filter((c) => c.guid == commentId)[0];
			expect(commentData.viewpoint.screenshot).toBeTruthy();
			expect(commentData.viewpoint.screenshot).not.toBe(pngBase64);
			expect(commentData.viewpoint.screenshotSmall).toBeTruthy();
		});

		it('bad screenshot format within comments should fail', async () => {
			const issue = { name: 'Bad screenshot Issue test', ...baseIssue, topic_type: 'ru123' };

			const commentData = {
				comment: '',
				viewpoint: {
					up: [0, 1, 0],
					position: [38, 38, 125.08011914810137],
					look_at: [0, 0, -163.08011914810137],
					view_dir: [0, 0, -1],
					right: [1, 0, 0],
					unityHeight: 3.537606904422707,
					fov: 2.1124830653010416,
					aspect_ratio: 0.8750189337327384,
					far: 276.75612077194506,
					near: 76.42411012233212,
					screenshot: pdfBase64,
				},
			};

			// Creating an issue
			const issueId = (await agent.post(`/${username}/${model}/issues`)
				.send(issue)
				.expect(200)).body._id;

			// Commenting the issue
			const res = await agent.post(`/${username}/${model}/issues/${issueId}/comments`)
				.send(commentData)
				.expect(responseCodes.FILE_FORMAT_NOT_SUPPORTED.status);

			expect(res.body.value).toBe(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
		});

		it('seal last non system comment when adding system comment', (done) => {
			const issue = { name: 'Issue test', ...baseIssue, topic_type: 'ru123' };
			let issueId;
			const data = { topic_type: 'abc123' };
			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.post(`/${username}/${model}/issues/${issueId}/comments`)
						.send({ comment: 'hello world' })
						.expect(200, done);
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(data)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.comments[0].sealed).toBe(true);
							done(err);
						});
				},
			], done);
		});

		it('change topic_type, desc, priority, status and assigned_roles in one go should succeed', (done) => {
			const issue = { ...baseIssue, name: 'Issue test' };
			let issueId;

			const updateData = {
				topic_type: 'for abcdef',
				status: 'in progress',
				priority: 'high',
				assigned_roles: ['jobB'],
			};

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(updateData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.topic_type).toBe(updateData.topic_type);
							expect(res.body.status).toBe(updateData.status);
							expect(res.body.priority).toBe(updateData.priority);
							expect(res.body.assigned_roles).toEqual(updateData.assigned_roles);
							done(err);
						});
				},
			], done);
		});

		it('change status to for approval will change to roles back to creator role', (done) => {
			const issue = {
				...baseIssue,
				name: 'Issue test',
				assigned_roles: ['jobB'],
				creator_role: 'jobA'
			};

			let issueId;
			const updateData = {
				status: 'for approval',
				assigned_roles: ['jobB'],
			};

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							expect(res.body.assigned_roles).toEqual(issue.assigned_roles);
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(updateData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.status).toBe(updateData.status);
							expect(res.body.assigned_roles).toEqual([issue.creator_role]);
							done(err);
						});
				},
			], done);
		});

		it('change assigned_roles during status=for approval will change the status back to in progress', (done) => {
			const issue = {
				...baseIssue,
				name: 'Issue test',
				status: 'for approval',
				assigned_roles: ['jobB']
			};

			let issueId;
			const updateData = {
				status: 'open',
				assigned_roles: ['jobA'],
			};

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(updateData)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.status).toBe('in progress');
							expect(res.body.assigned_roles).toEqual(updateData.assigned_roles);
							done(err);
						});
				},
			], done);
		});

		it('change desc should succeed', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;

			const desc = { desc: 'for abcdef' };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(desc)
						.expect(200, done);
				},
				function (done) {
					agent.get(`/${username}/${model}/issues/${issueId}`)
						.expect(200, (err, res) => {
							expect(res.body.desc === desc.desc);
							done(err);
						});
				},
			], done);
		});

		it('too long desc should fail', (done) => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;

			const desc = { desc: generateRandomString(1201) };

			async.series([
				function (done) {
					agent.post(`/${username}/${model}/issues`)
						.send(issue)
						.expect(200, (err, res) => {
							issueId = res.body._id;
							return done(err);
						});
				},
				function (done) {
					agent.patch(`/${username}/${model}/issues/${issueId}`)
						.send(desc)
						.expect(400, (err, res) => {
							expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
							done(err);
						});
				},
			], done);
		});

		describe('user who is collaborator/commentor and assigned to the issue job can', () => {
			const issue = { name: 'Issue test', ...baseIssue };
			let issueId;

			beforeAll((done) => {
				agent.post(`/${username}/${model}/issues`)
					.send(issue)
					.expect(200, (err, res) => {
						issueId = res.body._id;
						done();
					});
			});

			it('not change priority', (done) => {
				const updateData = {
					priority: 'high',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(400, (err, res) => {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});
			});

			it('change screenshot', (done) => {
				const updateData = {
					viewpoint: {
						screenshot: altBase64,
					},
				};

				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, done);
			});

			it('change viewpoint', (done) => {
				const updateData = {
					viewpoint: {
						up: [0, 1, 0],
						position: [20, 20, 100],
						look_at: [0, 0, -100],
						view_dir: [0, 0, -1],
						right: [1, 0, 0],
						fov: 2,
						aspect_ratio: 1,
						far: 300,
						near: 50,
					},
				};

				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, (err, res) => {
						expect(res.body.viewpoint.up).toEqual(updateData.viewpoint.up);
						expect(res.body.viewpoint.position).toEqual(updateData.viewpoint.position);
						expect(res.body.viewpoint.look_at).toEqual(updateData.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).toEqual(updateData.viewpoint.view_dir);
						expect(res.body.viewpoint.right).toEqual(updateData.viewpoint.right);
						expect(res.body.viewpoint.fov).toBe(updateData.viewpoint.fov);
						expect(res.body.viewpoint.aspect_ratio).toBe(updateData.viewpoint.aspect_ratio);
						expect(res.body.viewpoint.far).toBe(updateData.viewpoint.far);
						expect(res.body.viewpoint.near).toBe(updateData.viewpoint.near);
						done(err);
					});
			});

			it('change pin', (done) => {
				const updateData = { position: [20, 20, 100] };
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, (err, res) => {
						expect(res.body.position).toEqual(updateData.position);
						done(err);
					});
			});

			it('can change status to anything but closed', (done) => {
				const updateData = {
					status: 'in progress',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, (err, res) => {
						expect(res.body.value);
						done(err);
					});
			});

			it('not change status to void', (done) => {
				const updateData = {
					status: 'void',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(400, (err, res) => {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});
			});

			it('not change status to closed', (done) => {
				const updateData = {
					status: 'closed',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(400, (err, res) => {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});
			});

			it('change type should succeed', (done) => {
				const updateData = {
					topic_type: 'For VR',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, done);
			});

			it('change assigned should succeed', (done) => {
				const updateData = {
					assigned_roles: ['jobA'],
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, done);
			});
		});

		describe('user who is collaborator/commentor but not assigned to issue job can', () => {
			let issueId;

			beforeAll((done) => {
				const issue = Object.assign(baseIssue, { name: 'Issue test', assigned_roles: ['jobC'] });

				agent.post(`/${username}/${model}/issues`)
					.send(issue)
					.expect(200, (err, res) => {
						issueId = res.body._id;
						return done(err);
					});
			});

			it('not change priority', (done) => {
				const updateData = {
					priority: 'high',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(400, (err, res) => {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});
			});

			it('not change the status to in progress', (done) => {
				const updateDataProgress = {
					status: 'in progress',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateDataProgress)
					.expect(400, (err, res) => {
						expect(res.body.value);
						done(err);
					});
			});

			it('not change the status to void', (done) => {
				const updateDataVoid = {
					status: 'void',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateDataVoid)
					.expect(400, (err, res) => {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});
			});

			it('not change the status to closed', (done) => {
				const updateDataClosed = {
					status: 'closed',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateDataClosed)
					.expect(400, (err, res) => {
						expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
						done(err);
					});
			});

			it('change screenshot', (done) => {
				const updateData = {
					viewpoint: {
						screenshot: altBase64,
					},
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, done);
			});

			it('change viewpoint', (done) => {
				const updateData = {
					viewpoint: {
						up: [0, 1, 0],
						position: [20, 20, 100],
						look_at: [0, 0, -100],
						view_dir: [0, 0, -1],
						right: [1, 0, 0],
						fov: 2,
						aspect_ratio: 1,
						far: 300,
						near: 50,
					},
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, (err, res) => {
						expect(res.body.viewpoint.up).toEqual(updateData.viewpoint.up);
						expect(res.body.viewpoint.position).toEqual(updateData.viewpoint.position);
						expect(res.body.viewpoint.look_at).toEqual(updateData.viewpoint.look_at);
						expect(res.body.viewpoint.view_dir).toEqual(updateData.viewpoint.view_dir);
						expect(res.body.viewpoint.right).toEqual(updateData.viewpoint.right);
						expect(res.body.viewpoint.fov).toBe(updateData.viewpoint.fov);
						expect(res.body.viewpoint.aspect_ratio).toBe(updateData.viewpoint.aspect_ratio);
						expect(res.body.viewpoint.far).toBe(updateData.viewpoint.far);
						expect(res.body.viewpoint.near).toBe(updateData.viewpoint.near);
						done(err);
					});
			});

			it('change pin', (done) => {
				const updateData = { position: [20, 20, 100] };
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, (err, res) => {
						expect(res.body.position).toEqual(updateData.position);
						done(err);
					});
			});

			it('can change type', (done) => {
				const updateData = {
					topic_type: 'For VR',
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, done);
			});

			it('can change assigned', (done) => {
				const updateData = {
					assigned_roles: ['jobA'],
				};
				collabAgent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(updateData)
					.expect(200, done);
			});
		});

		describe('user with different role but is an admin', () => {
			const issue = { ...baseIssue, name: 'Issue test', creator_role: 'jobC' };
			let issueId1;
			let issueId2;
			const voidStatus = { status: 'void' };
			const close = { status: 'closed' };

			beforeAll((done) => {
				collabAgent.post(`/${username}/${model}/issues`)
					.send(issue)
					.expect(200, (err, res) => {
						issueId1 = res.body._id;
						return done(err);
					});
			});

			it('try to void an issue should succeed', (done) => {
				async.series([
					function (done) {
						agent.patch(`/${username}/${model}/issues/${issueId1}`)
							.send(voidStatus)
							.expect(200, done);
					},
				], done);
			});

			it('try to close an issue should succeed', (done) => {
				async.series([
					function (done) {
						agent.patch(`/${username}/${model}/issues/${issueId1}`)
							.send(close)
							.expect(200, done);
					},
				], done);
			});
		});

		describe('user with different role but is a project admin', () => {
			const issue = { ...baseIssue, name: 'Issue test', creator_role: 'jobC' };
			let issueId1;
			let issueId2;
			const voidStatus = { status: 'void' };
			const close = { status: 'closed' };

			beforeAll((done) => {
				async.series([

					function (done) {
						projectAdminAgent.post(`/${username}/${model}/issues`)
							.send(issue)
							.expect(200, (err, res) => {
								issueId1 = res.body._id;
								return done(err);
							});
					},
					function (done) {
						projectAdminAgent.post(`/${username}/${model}/issues`)
							.send(issue)
							.expect(200, (err, res) => {
								issueId2 = res.body._id;
								return done(err);
							});
					},
				], done);
			});

			it('try to void an issue should succeed', (done) => {
				async.series([
					function (done) {
						agent.patch(`/${username}/${model}/issues/${issueId2}`)
							.send(voidStatus)
							.expect(200, done);
					},
				], done);
			});

			it('try to close an issue should succeed', (done) => {
				async.series([
					function (done) {
						agent.patch(`/${username}/${model}/issues/${issueId1}`)
							.send(close)
							.expect(200, done);
					},
				], done);
			});
		});

		describe('user with different role and is not an admin ', () => {
			const issue = { ...baseIssue, name: 'Issue test', creator_role: 'jobC' };
			let issueId1;
			let issueId2;
			const voidStatus = { status: 'void' };
			const close = { status: 'closed' };

			beforeAll((done) => {
				async.series([
					function (done) {
						agent.post(`/${username}/${model}/issues`)
							.send(issue)
							.expect(200, (err, res) => {
								issueId1 = res.body._id;
								return done(err);
							});
					},
					function (done) {
						agent.post(`/${username}/${model}/issues`)
							.send(issue)
							.expect(200, (err, res) => {
								issueId2 = res.body._id;
								return done(err);
							});
					},
				], done);
			});

			it('try to void an issue should fail', (done) => {
				async.series([
					function (done) {
						collabAgent.patch(`/${username}/${model}/issues/${issueId2}`)
							.send(voidStatus)
							.expect(400, (err, res) => {
								expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
								done(err);
							});
					},
				], done);
			});

			it('try to close an issue should fail', (done) => {
				async.series([
					function (done) {
						collabAgent.patch(`/${username}/${model}/issues/${issueId1}`)
							.send(close)
							.expect(400, (err, res) => {
								expect(res.body.value === responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED.value);
								done(err);
							});
					},
				], done);
			});
		});

		describe('and then commenting', () => {
			let issueId;
			let commentId = null;

			beforeAll((done) => {
				const issue = { name: 'Issue test', ...baseIssue };

				agent.post(`/${username}/${model}/issues`)
					.send(issue)
					.expect(200, (err, res) => {
						issueId = res.body._id;
						done(err);
					});
			});

			it('should succeed', (done) => {
				const comment = {
					comment: 'hello world',
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
					},
				};

				async.series([
					function (done) {
						agent.post(`/${username}/${model}/issues/${issueId}/comments`)
							.send(comment)
							.expect(200, (err, res) => {
								const commentRes = res.body;
								expect(commentRes.comment).toBe(comment.comment);
								done(err);
							});
					},
					function (done) {
						agent.get(`/${username}/${model}/issues/${issueId}`).expect(200, (err, res) => {
							expect(res.body.comments.length).toBe(1);
							expect(res.body.comments[0].comment).toBe(comment.comment);
							expect(res.body.comments[0].owner).toBe(username);
							expect(res.body.comments[0].viewpoint.up).toEqual(comment.viewpoint.up);
							expect(res.body.comments[0].viewpoint.position).toEqual(comment.viewpoint.position);
							expect(res.body.comments[0].viewpoint.look_at).toEqual(comment.viewpoint.look_at);
							expect(res.body.comments[0].viewpoint.view_dir).toEqual(comment.viewpoint.view_dir);
							expect(res.body.comments[0].viewpoint.right).toEqual(comment.viewpoint.right);
							expect(res.body.comments[0].viewpoint.unityHeight).toBe(comment.viewpoint.unityHeight);
							expect(res.body.comments[0].viewpoint.fov).toBe(comment.viewpoint.fov);
							expect(res.body.comments[0].viewpoint.aspect_ratio).toBe(comment.viewpoint.aspect_ratio);
							expect(res.body.comments[0].viewpoint.far).toBe(comment.viewpoint.far);
							expect(res.body.comments[0].viewpoint.near).toBe(comment.viewpoint.near);
							commentId = res.body.comments[0].guid;

							done(err);
						});
					},
				], done);
			});

			it('should fail if comment is empty', (done) => {
				const comment = { comment: '' };

				agent.post(`/${username}/${model}/issues/${issueId}/comments`)
					.send(comment)
					.expect(400, (err, res) => {
						expect(res.body.value).toBe(responseCodes.ISSUE_COMMENT_NO_TEXT.value);
						done(err);
					});
			});

			it('should succeed if removing an existing comment', (done) => {
				agent.delete(`/${username}/${model}/issues/${issueId}/comments`)
					.send({ guid: commentId })
					.expect(200, (err, res) => {
						done(err);
					});
			});

			it('should fail if invalid issue ID is given', (done) => {
				const invalidId = '00000000-0000-0000-0000-000000000000';
				const comment = { comment: 'hello world' };

				agent.patch(`/${username}/${model}/issues/${invalidId}`)
					.send(comment)
					.expect(404, done);
			});
		});

		describe('and then voidng it', () => {
			let issueId;

			beforeAll((done) => {
				const issue = { name: 'Issue test', ...baseIssue };

				agent.post(`/${username}/${model}/issues`)
					.send(issue)
					.expect(200, (err, res) => {
						if (err) {
							return done(err);
						}

						issueId = res.body._id;

						// add an comment
						const comment = { comment: 'hello world' };

						agent.post(`/${username}/${model}/issues/${issueId}/comments`)
							.send(comment)
							.expect(200, done);
					});
			});

			it('should succeed', (done) => {
				const voidStatus = { status: 'void' };

				agent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(voidStatus)
					.expect(200, done);
			});

			it('should succeed if reopening', (done) => {
				const open = { status: 'open' };

				agent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(open)
					.expect(200, done);
			});

			it('should fail if invalid issue ID is given', (done) => {
				const invalidId = '00000000-0000-0000-0000-000000000000';
				const voidStatus = { status: 'void' };

				agent.patch(`/${username}/${model}/issues/${invalidId}`)
					.send(voidStatus)
					.expect(404, done);
			});
		});

		describe('and then closing it', () => {
			let issueId;

			beforeAll((done) => {
				const issue = { name: 'Issue test', ...baseIssue };

				agent.post(`/${username}/${model}/issues`)
					.send(issue)
					.expect(200, (err, res) => {
						if (err) {
							return done(err);
						}

						issueId = res.body._id;

						// add an comment
						const comment = { comment: 'hello world' };

						agent.post(`/${username}/${model}/issues/${issueId}/comments`)
							.send(comment)
							.expect(200, done);
					});
			});

			it('should succeed', (done) => {
				const close = { status: 'closed' };

				agent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(close)
					.expect(200, done);
			});

			it('should succeed if reopening', (done) => {
				const open = { status: 'open' };

				agent.patch(`/${username}/${model}/issues/${issueId}`)
					.send(open)
					.expect(200, done);
			});

			it('should fail if invalid issue ID is given', (done) => {
				const invalidId = '00000000-0000-0000-0000-000000000000';
				const close = { status: 'closed' };

				agent.patch(`/${username}/${model}/issues/${invalidId}`)
					.send(close)
					.expect(404, done);
			});
		});
	});

	describe('Tagging a user in a comment', () => {
		const teamspace = 'teamSpace1';
		const password = 'password';
		const model = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';
		const issueId = '2eb8f760-7ac5-11e8-9567-6b401a084a90';

		it("should create a notification on the tagged user's messages", (done) => {
			const comment = { comment: `@${commenterUser}` };
			async.series([
				function (done) {
					teamspace1Agent.post(`/${teamspace}/${model}/issues/${issueId}/comments`)
						.send(comment)
						.expect(200, done);
				},
				function (done) {
					commenterAgent.get('/notifications')
						.expect(200, (err, res) => {
							const notification = res.body.find((item) => item.type === 'USER_REFERENCED' && item.issueId === issueId);
							expect(notification).toBeTruthy();
							expect(notification.modelId).toBe(model);
							expect(notification.teamSpace).toBe(teamspace);
							expect(notification.referrer).toBe(teamspace);
							done(err);
						});
				}],
				done);
		});

		it("should create comment successful if the user tagged a user that doesn't not exist", (done) => {
			const comment = { comment: '@doesntExist1234' };
			commenterAgent.post(`/${teamspace}/${model}/issues/${issueId}/comments`)
				.send(comment)
				.expect(200, done);
		});

		it('should NOT create a notification if the user does not belong in the teamspace', (done) => {
			const comment = { comment: `@${username}` };
			async.series([
				function (done) {
					commenterAgent.post(`/${teamspace}/${model}/issues/${issueId}/comments`)
						.send(comment)
						.expect(200, done);
				},
				function (done) {
					agent.get('/notifications')
						.expect(200, (err, res) => {
							const notification = res.body.find((item) => item.type === 'USER_REFERENCED' && item.issueId === issueId);
							expect(notification).toBe(undefined);
							done(err);
						});
				}],
				done);
		});

		it('should NOT create a notification if the user is tagged in a quote', (done) => {
			const comment = {
				comment: `>
			@${commenterUser}`,
			};
			async.waterfall([
				deleteNotifications(commenterAgent),
				function (next) {
					teamspace1Agent.post(`/${teamspace}/${model}/issues/${issueId}/comments`)
						.send(comment)
						.expect(200, next);
				},
				fetchNotification(commenterAgent),
				(notifications, next) => {
					expect(Array.isArray(notifications)).toBe(true);
					expect(notifications).toHaveLength(0);
					next();
				},
			],
				done);
		});
	});

	describe('referencing an issue in another issue ', () => {
		const teamspace = 'teamSpace1';
		const password = 'password';
		const model = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';

		const createIssueTeamspace1 = createIssue(teamspace, model);

		const issues = [];

		const createAndPushIssue = (done) => {
			async.waterfall([
				createIssueTeamspace1(teamspace1Agent),
				(issue, next) => {
					issues.push(issue);
					next();
				}], done);
		};

		beforeAll((done) => {
			async.series([
				createAndPushIssue,
				createAndPushIssue,
				createAndPushIssue,
				createAndPushIssue,
				createAndPushIssue,
				createAndPushIssue,
				createAndPushIssue,
				createAndPushIssue,
			], done);
		});

		const testForNoComment = (id, done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues/${id}`).expect(200, (err, res) => {
				const { comments } = res.body;
				expect(Array.isArray(comments)).toBe(true);
				expect(comments).toHaveLength(0);
				return done(err);
			});
		};

		const testForReference = (referencedIssueId, otherIssueNumber, done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues/${referencedIssueId}`).expect(200, (err, res) => {
				const { comments } = res.body;

				expect(Array.isArray(comments)).toBe(true);
				expect(comments).toHaveLength(1);

				const commentAction = comments[0].action;

				expect(commentAction.property).toBe('issue_referenced');
				expect(commentAction.to).toBe(otherIssueNumber.toString());
				return done(err);
			});
		};

		it('should create a system message when the issue has been referenced', (done) => {
			const comment = { comment: `look at issue  #${issues[0].number} and #${issues[1].number} ` };

			async.series([
				function (done) {
					teamspace1Agent.post(`/${teamspace}/${model}/issues/${issues[2]._id}/comments`)
						.send(comment)
						.expect(200, done);
				},
				function (done) {
					testForReference(issues[0]._id, issues[2].number, done);
				},
				function (done) {
					testForReference(issues[1]._id, issues[2].number, done);
				},
				function (done) {
					testForNoComment(issues[3]._id, done);
				},

				function (done) {
					testForNoComment(issues[3]._id, done);
				},
			], done);
		});

		it('should have multiple system messages when the issue has been referenced several times', (done) => {
			const comment = { comment: `#${issues[0].number} is interesting` };

			async.series([
				function (done) {
					teamspace1Agent.post(`/${teamspace}/${model}/issues/${issues[1]._id}/comments`)
						.send(comment)
						.expect(200, done);
				},

				function (done) {
					teamspace1Agent.get(`/${teamspace}/${model}/issues/${issues[0]._id}`).expect(200, (err, res) => {
						let { comments } = res.body;
						const [otherIssueNumber1, otherIssueNumber2] = [issues[2].number.toString(), issues[1].number.toString()]
							.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

						expect(Array.isArray(comments)).toBe(true);
						expect(comments).toHaveLength(2);

						comments = comments
							.sort((commentA, commentB) => parseInt(commentA.action.to, 10) - parseInt(commentB.action.to, 10));

						const commentAction1 = comments[0].action;
						expect(commentAction1.property).toBe('issue_referenced');
						expect(commentAction1.to).toBe(otherIssueNumber1);

						const commentAction2 = comments[1].action;
						expect(commentAction2.property).toBe('issue_referenced');
						expect(commentAction2.to).toBe(otherIssueNumber2);

						return done(err);
					});
				},
			], done);
		});

		it('should not create a system message when the issue that has been referenced is part of a quote', (done) => {
			const comment = {
				comment: `> look at issue  #${issues[4].number}
			and #${issues[5].number}

			and #${issues[6].number}
			` };

			async.series([
				function (done) {
					teamspace1Agent.post(`/${teamspace}/${model}/issues/${issues[7]._id}/comments`)
						.send(comment)
						.expect(200, done);
				},
				function (done) {
					testForNoComment(issues[4]._id, done);
				},
				function (done) {
					testForNoComment(issues[5]._id, done);
				},
				function (done) {
					testForReference(issues[6]._id, issues[7].number, done);
				},

			], done);
		});
	});

	describe('BCF', () => {
		const bcfusername = 'testing';
		const bcfpassword = 'testing';
		const bcfmodel = 'testproject';

		const altTeamspace = 'projectshared';
		const fakeTeamspace = 'fakeTeamspace';
		const collaboratorModel = 'test_collaborator';
		const commenterModel = 'test_commenter';
		const viewerModel = 'test_viewer';
		const fakeModel = 'fakeModel';

		const goldenBCF1 = {
			_id: bcf.issue1,
			desc: 'cc',
			created: 1476107839000,
			priority: 'medium',
			name: 'monkey',
			owner: 'fed',
			status: 'in progress',
			topic_type: 'for_approval',
			viewpoint: {
				guid: '8c7dd6b7-1259-4881-b0da-f37380894bd2',
				up: [
					0.13319581086474475,
					-0.10770430451778479,
					-0.9852201067560606,
				],
				view_dir: [
					0.7660971583345693,
					-0.6194786539890793,
					0.17129314418147787,
				],
				position: [
					-6.020707046479461,
					2.9113493754923834,
					-0.05611432211203965,
				],
				fov: 1.726742513539546,
				type: 'perspective',
			},
			comments: [
				{
					comment: 'cccc',
					owner: 'fed',
					viewpoint: {
						guid: 'b34ece85-6f11-4a2f-ae88-0c159b6d7d1b',
						up: [
							-0.254925235676232,
							-0.839895797253119,
							-0.479153601647702,
						],
						view_dir: [
							-0.139163747773675,
							-0.458499318731828,
							0.877731067029096,
						],
						position: [
							-0.521862880637192,
							1.93350942622735,
							-4.34724412167489,
						],
						fov: 1.72674251353955,
						type: 'perspective',
					},
				},
				{
					action: {
						property: 'bcf_import',
					},
				},
			],
		};

		const keys = [
			'_id',
			'desc',
			'created',
			'priority',
			'name',
			'owner',
			'status',
			'topic_type',
		];
		const commentKeys = [
			'comment',
			'owner',
		];
		const viewpointKeys = [
			'up',
			'view_dir',
			'position',
			'fov',
			'type',
		];

		let bcfAgent;

		beforeAll(async () => {
			bcfAgent = SessionTracker(request(server));
			await bcfAgent.login(bcfusername, bcfpassword);
		});

		describe('Importing a bcf file', () => {
			it('should succeed', (done) => {
				async.series([
					function (done) {
						bcfAgent.post(`/${bcfusername}/${bcfmodel}/issues.bcfzip`)
							.attach('file', __dirname + bcf.path)
							.expect(200, done);
					},
					function (done) {
						bcfAgent.get(`/${bcfusername}/${bcfmodel}/issues`)
							.expect(200, (err, res) => {
								const issue1 = res.body.find((issue) => issue._id === bcf.issue1);
								const issue2 = res.body.find((issue) => issue._id === bcf.issue2);

								expect(issue1).toBeTruthy();
								expect(issue2).toBeTruthy();
								done(err);
							});
					},
					function (done) {
						bcfAgent.get(`/${bcfusername}/${bcfmodel}/issues/${bcf.issue1}`)
							.expect(200, (err, res) => {
								const issue1 = res.body;

								expect(issue1.thumbnail).toBeTruthy();
								expect(issue1.comments.length).toBe(goldenBCF1.comments.length);
								expect(issue1.viewpoint).toBeTruthy();
								expect(issue1.viewpoint.screenshot).toBeTruthy();

								keys.forEach((key) => {
									expect(issue1[key]).toBe(goldenBCF1[key]);
								});

								commentKeys.forEach((key) => {
									expect(issue1.comments[0][key]).toBe(goldenBCF1.comments[0][key]);
								});

								viewpointKeys.forEach((key) => {
									if (Array.isArray(goldenBCF1.viewpoint[key])) {
										expect(issue1.viewpoint[key]).toEqual(goldenBCF1.viewpoint[key]);
									} else {
										expect(issue1.viewpoint[key]).toBe(goldenBCF1.viewpoint[key]);
									}
									if (Array.isArray(goldenBCF1.comments[0][key])) {
										expect(issue1.comments[0][key]).toEqual(goldenBCF1.comments[0][key]);
									} else {
										expect(issue1.comments[0][key]).toBe(goldenBCF1.comments[0][key]);
									}
								});

								done(err);
							});
					},
				], done);
			});

			it('with groups should succeed', (done) => {
				async.series([
					function (done) {
						bcfAgent.post(`/${bcfusername}/${bcfmodel}/issues.bcfzip`)
							.attach('file', __dirname + bcf.withGroupsPath)
							.expect(200, done);
					},
					function (done) {
						bcfAgent.get(`/${bcfusername}/${bcfmodel}/issues`)
							.expect(200, (err, res) => {
								expect(res.body).toHaveLength(9);
								done(err);
							});
					},
				], done);
			});

			it('with empty comments should succeed', (done) => {
				bcfAgent.post(`/${bcfusername}/${bcfmodel}/issues.bcfzip`)
					.attach('file', __dirname + bcf.withEmptyComment)
					.expect(200, done);
			});

			it('if user is collaborator should succeed', (done) => {
				async.series([
					function (done) {
						bcfAgent.post(`/${altTeamspace}/${collaboratorModel}/issues.bcfzip`)
							.attach('file', __dirname + bcf.path)
							.expect(200, done);
					},
					function (done) {
						bcfAgent.get(`/${altTeamspace}/${collaboratorModel}/issues`)
							.expect(200, (err, res) => {
								const issue1 = res.body.find((issue) => issue._id === bcf.issue1);
								const issue2 = res.body.find((issue) => issue._id === bcf.issue2);

								expect(issue1).toBeTruthy();
								expect(issue2).toBeTruthy();
								done(err);
							});
					},
					function (done) {
						bcfAgent.get(`/${altTeamspace}/${collaboratorModel}/issues/${bcf.issue1}`)
							.expect(200, (err, res) => {
								const issue1 = res.body;

								expect(issue1.thumbnail).toBeTruthy();
								expect(issue1.comments.length).toBe(goldenBCF1.comments.length);
								expect(issue1.viewpoint).toBeTruthy();
								expect(issue1.viewpoint.screenshot).toBeTruthy();

								keys.forEach((key) => {
									expect(issue1[key]).toBe(goldenBCF1[key]);
								});

								commentKeys.forEach((key) => {
									expect(issue1.comments[0][key]).toBe(goldenBCF1.comments[0][key]);
								});

								viewpointKeys.forEach((key) => {
									if (Array.isArray(goldenBCF1.viewpoint[key])) {
										expect(issue1.viewpoint[key]).toEqual(goldenBCF1.viewpoint[key]);
									} else {
										expect(issue1.viewpoint[key]).toBe(goldenBCF1.viewpoint[key]);
									}
									if (Array.isArray(goldenBCF1.comments[0][key])) {
										expect(issue1.comments[0][key]).toEqual(goldenBCF1.comments[0][key]);
									} else {
										expect(issue1.comments[0][key]).toBe(goldenBCF1.comments[0][key]);
									}
								});

								done(err);
							});
					},
				], done);
			});

			it('if user is commenter should succeed', (done) => {
				async.series([
					function (done) {
						bcfAgent.post(`/${altTeamspace}/${commenterModel}/issues.bcfzip`)
							.attach('file', __dirname + bcf.path)
							.expect(200, done);
					},
					function (done) {
						bcfAgent.get(`/${altTeamspace}/${commenterModel}/issues`)
							.expect(200, (err, res) => {
								const issue1 = res.body.find((issue) => issue._id === bcf.issue1);
								const issue2 = res.body.find((issue) => issue._id === bcf.issue2);

								expect(issue1).toBeTruthy();
								expect(issue2).toBeTruthy();
								done(err);
							});
					},
					function (done) {
						bcfAgent.get(`/${altTeamspace}/${commenterModel}/issues/${bcf.issue1}`)
							.expect(200, (err, res) => {
								const issue1 = res.body;

								expect(issue1.thumbnail).toBeTruthy();
								expect(issue1.comments.length).toBe(goldenBCF1.comments.length);
								expect(issue1.viewpoint).toBeTruthy();
								expect(issue1.viewpoint.screenshot).toBeTruthy();

								keys.forEach((key) => {
									expect(issue1[key]).toBe(goldenBCF1[key]);
								});

								commentKeys.forEach((key) => {
									expect(issue1.comments[0][key]).toBe(goldenBCF1.comments[0][key]);
								});

								viewpointKeys.forEach((key) => {
									if (Array.isArray(goldenBCF1.viewpoint[key])) {
										expect(issue1.viewpoint[key]).toEqual(goldenBCF1.viewpoint[key]);
									} else {
										expect(issue1.viewpoint[key]).toBe(goldenBCF1.viewpoint[key]);
									}
									if (Array.isArray(goldenBCF1.comments[0][key])) {
										expect(issue1.comments[0][key]).toEqual(goldenBCF1.comments[0][key]);
									} else {
										expect(issue1.comments[0][key]).toBe(goldenBCF1.comments[0][key]);
									}
								});

								done(err);
							});
					},
				], done);
			});

			it('if user is viewer should fail', (done) => {
				bcfAgent.post(`/${altTeamspace}/${viewerModel}/issues.bcfzip`)
					.attach('file', __dirname + bcf.path)
					.expect(401, (err, res) => {
						expect(res.body.value).toBe(responseCodes.NOT_AUTHORIZED.value);
						done(err);
					});
			});

			it('if model does not exist should fail', async () => {
				try {
					const res = await bcfAgent.post(`/${altTeamspace}/${fakeModel}/issues.bcfzip`)
						.attach('file', __dirname + bcf.path)
						.expect(404);

					expect(res.body.value).toBe(responseCodes.MODEL_NOT_FOUND.code);
				} catch (err) {
					// throw if error is not EPIPE
					if (err.code !== 'EPIPE') {
						throw err;
					}
				}
			});

			it('if teamspace does not exist should fail', async () => {
				const res = await bcfAgent.post(`/${fakeTeamspace}/${viewerModel}/issues.bcfzip`)
					.expect(404);

				expect(res.body.code).toBe(responseCodesV5.teamspaceNotFound.code);
			});

			it('if file is not BCF file should fail', (done) => {
				bcfAgent.post(`/${altTeamspace}/${viewerModel}/issues.bcfzip`)
					.attach('file', __dirname + bcf.invalidFile)
					.expect(401, (err, res) => {
						expect(res.body.value).toBe(responseCodes.NOT_AUTHORIZED.value);
						done(err);
					});
			});

			it('if file is from Solibri should succeed', (done) => {
				bcfAgent.post(`/${altTeamspace}/${commenterModel}/issues.bcfzip`)
					.attach('file', __dirname + bcf.solibri)
					.expect(200, done);
			});

			it('if file is bad with zero size contents should fail', (done) => {
				bcfAgent.post(`/${altTeamspace}/${commenterModel}/issues.bcfzip`)
					.attach('file', __dirname + bcf.sizeZero)
					.expect(400, (err, res) => {
						expect(res.body.value).toBe(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});
		});

		describe('Exporting a bcf file', () => {
			it('should succeed', (done) => {
				bcfAgent.get(`/${bcfusername}/${bcfmodel}/issues.bcfzip`)
					.expect(200, (err, res) => {
						expect(res.text.length).toBeGreaterThan(7000);
						done(err);
					});
			});

			it('for specific issue numbers should succeed', (done) => {
				bcfAgent.get(`/${bcfusername}/${bcfmodel}/issues.bcfzip?numbers=8,9`)
					.expect(200, (err, res) => {
						expect(res.text.length).toBeGreaterThan(4000);
						done(err);
					});
			});

			it('if user is collaborator should succeed', (done) => {
				bcfAgent.get(`/${altTeamspace}/${collaboratorModel}/issues.bcfzip`)
					.expect(200, (err, res) => {
						expect(res.text.length).toBeGreaterThan(7000);
						done(err);
					});
			});

			it('if user is commenter should succeed', (done) => {
				bcfAgent.get(`/${altTeamspace}/${commenterModel}/issues.bcfzip`)
					.expect(200, (err, res) => {
						expect(res.text.length).toBeGreaterThan(9000);
						done(err);
					});
			});

			it('if user is viewer should succeed', (done) => {
				bcfAgent.get(`/${altTeamspace}/${viewerModel}/issues.bcfzip`)
					.expect(200, (err, res) => {
						expect(res.text.length).toBeGreaterThan(3000);
						done(err);
					});
			});

			it('if model does not exist should fail', (done) => {
				bcfAgent.get(`/${altTeamspace}/${fakeModel}/issues.bcfzip`)
					.expect(404, (err, res) => {
						expect(res.body.value).toBe(responseCodes.MODEL_NOT_FOUND.code);
						done(err);
					});
			});

			it('if teamspace does not exist should fail', (done) => {
				bcfAgent.get(`/${fakeTeamspace}/${viewerModel}/issues.bcfzip`)
					.expect(404, (err, res) => {
						expect(res.body.code).toBe(responseCodesV5.teamspaceNotFound.code);
						done(err);
					});
			});
		});
	});

	describe('Search', () => {
		const teamspace = 'teamSpace1';
		const password = 'password';
		const project = '5BF7DF65-F3A8-4337-8016-A63F00000000';
		let model = '';

		let adminAgent;

		beforeAll((done) => {
			adminAgent = SessionTracker(request(server));
			adminAgent.login('adminTeamspace1JobA', password).then(() => {
				async.series([
					(next) => {
						// create a project
						createModel(teamspace1Agent, teamspace, project, 'Query issues').then((res) => {
							model = res;

							const createIssueTeamspace1 = createIssue(teamspace, model);

							async.series([
								createIssueTeamspace1(teamspace1Agent, { topic_type: 'information', number: 0, status: 'closed', priority: 'none', assigned_roles: [] }),
								createIssueTeamspace1(teamspace1Agent, { topic_type: 'other', number: 1, status: 'open', priority: 'medium', assigned_roles: ['Client'] }),
								createIssueTeamspace1(teamspace1Agent, { topic_type: 'information', number: 2, status: 'in progress', priority: 'high', assigned_roles: [] }),
								createIssueTeamspace1(adminAgent, { topic_type: 'structure', number: 3, status: 'open', priority: 'none', assigned_roles: [] }),
								createIssueTeamspace1(adminAgent, { topic_type: 'architecture', number: 4, status: 'open', priority: 'none', assigned_roles: ['Client'] }),
							], next);
						});
					},
				], done);
			});
		});

		it(' by id', (done) => {
			let ids = [];

			teamspace1Agent.get(`/${teamspace}/${model}/issues`)
				.expect(200, (err, res) => {
					ids = res.body.map((issue) => issue._id);
					ids = [ids[0], ids[2], ids[4]].sort();

					teamspace1Agent.get(`/${teamspace}/${model}/issues?ids=${ids.join(',')}`)
						.expect(200, (err, res) => {
							expect(res.body.map(((issue) => issue._id)).sort()).toEqual(ids);
							done(err);
						});
				});
		});

		it(' by topic', (done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues?topicTypes=information,structure`)
				.expect(200, (err, res) => {
					expect(res.body.map(((issue) => issue.topic_type)).sort()).toEqual(['information', 'structure', 'information'].sort());
					done(err);
				});
		});

		it(' by status', (done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues?status=closed,in%20progress`)
				.expect(200, (err, res) => {
					expect(res.body.map(((issue) => issue.status)).sort()).toEqual(['closed', 'in progress'].sort());
					done(err);
				});
		});

		it(' by priority', (done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues?priorities=medium,high`)
				.expect(200, (err, res) => {
					expect(res.body.map(((issue) => issue.priority)).sort()).toEqual(['medium', 'high'].sort());
					done(err);
				});
		});

		it(' by number', (done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues?numbers=1,3,4,39`)
				.expect(200, (err, res) => {
					expect(res.body.map(((issue) => issue.number)).sort()).toEqual([1, 3, 4].sort());
					done(err);
				});
		});

		it(' by assigned role', (done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues/?assignedRoles=Client`)
				.expect(200, (err, res) => {
					expect(res.body.map(((issue) => issue.assigned_roles[0])).sort()).toEqual(['Client', 'Client'].sort());
					done(err);
				});
		});

		it(' by unassigned role', (done) => {
			teamspace1Agent.get(`/${teamspace}/${model}/issues/?assignedRoles=Unassigned`)
				.expect(200, (err, res) => {
					expect(res.body.map(((issue) => issue.assigned_roles.length)).sort()).toEqual([0, 0, 0].sort());
					done(err);
				});
		});
	});
});
