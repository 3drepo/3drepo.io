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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');
const { times } = require('lodash');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		tsAdmin2: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		commenter: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	const teamspace = ServiceHelper.generateRandomString();
	const project = ServiceHelper.generateRandomProject();

	const models = {
		drawWithRevisions: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: {
				...ServiceHelper.generateRandomModelProperties(modelTypes.DRAWING),
				permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			},
		},
		drawWithNoRevisions: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: ServiceHelper.generateRandomModelProperties(modelTypes.DRAWING),
		},
		container: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
		},
	};

	const revisions = {
		rev1: {
			...ServiceHelper.generateRevisionEntry(false, false, modelTypes.DRAWING),
			timestamp: Date.now(),
		},
		rev2: {
			...ServiceHelper.generateRevisionEntry(false, false, modelTypes.DRAWING),
			timestamp: Date.now() + 100000,
		},
		rev3: {
			...ServiceHelper.generateRevisionEntry(false, false, modelTypes.DRAWING),
			timestamp: Date.now() + 500000,
		},
		rev4: {
			...ServiceHelper.generateRevisionEntry(true, false, modelTypes.DRAWING),
			timestamp: Date.now() + 500000,
		},
	};

	const calibrations = times(5, () => ServiceHelper.generateCalibration());

	return {
		users,
		teamspace,
		project,
		models,
		revisions,
		calibrations,
	};
};

const setupData = async ({ users, teamspace, project, models, revisions, calibrations }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user, users.tsAdmin2.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const modelProms = Object.keys(models).map((key) => ServiceHelper.db.createModel(
		teamspace,
		models[key]._id,
		models[key].name,
		models[key].properties,
	));

	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			Object.keys(models).map((key) => models[key]._id)),
		...Object.keys(revisions).map((key) => ServiceHelper.db.createRevision(teamspace,
			project.id, models.drawWithRevisions._id, revisions[key], modelTypes.DRAWING)),
		...calibrations.map((calibration) => ServiceHelper.db.createCalibration(teamspace, project.id,
			models.drawWithRevisions._id, revisions.rev2._id, calibration)),
	]);
};

const testGetCalibration = () => {
	describe('Get Calibration', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, revisions, calibrations } = basicData;

		const params = {
			key: users.tsAdmin.apiKey,
			ts: teamspace,
			projectId: project.id,
			drawing: models.drawWithRevisions,
			revisionId: revisions.rev2._id,
		};

		beforeAll(async () => {
			await setupData(basicData);
		});

		describe.each([
			['the user does not have a valid session', { ...params, key: null }, false, templates.notLoggedIn],
			['the teamspace does not exist', { ...params, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['the user is not a member of the teamspace', { ...params, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
			['the user does not have access to the drawing', { ...params, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
			['the project does not exist', { ...params, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the drawing does not exist', { ...params, drawing: ServiceHelper.generateRandomString() }, false, templates.drawingNotFound],
			['the revision does not exist', { ...params, revisionId: ServiceHelper.generateRandomString() }, false, templates.revisionNotFound],
			['the model is of wrong type', { ...params, drawing: models.container }, false, templates.drawingNotFound],
			['the drawing has no revisions', { ...params, drawing: models.drawWithNoRevisions }, false, templates.revisionNotFound],
			['the drawing has revisions but revisions have no calibrations', { ...params, revisionId: revisions.rev1._id }, false, templates.calibrationNotFound],
			['the drawing has revisions and revision has calibrations', params, true],
			['the drawing has revisions and previous revision has calibrations', { ...params, revisionId: revisions.rev3._id }, true],
		])('Get Calibration', (desc, parameters, success, error) => {
			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : error.status;
				const route = ({ ts, projectId, drawing, revisionId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawing._id}/revisions/${revisionId}/calibrations?key=${key}`;

				const res = await agent.get(route(parameters)).expect(expectedStatus);

				if (success) {
					const latestCalibration = calibrations.reduce(
						(max, cal) => (max.createdAt > cal.createdAt ? max : cal));

					expect(res.body).toEqual({
						verticalRange: parameters.drawing.properties.calibration.verticalRange,
						units: parameters.drawing.properties.calibration.units,
						horizontal: latestCalibration.horizontal,
						createdAt: res.body.createdAt,
						createdBy: res.body.createdBy });
				} else {
					expect(res.body.code).toEqual(error.code);
				}
			});
		});
	});
};

const testAddCalibration = () => {
	describe('Add Calibration', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, revisions } = basicData;

		const params = {
			key: users.tsAdmin.apiKey,
			ts: teamspace,
			projectId: project.id,
			drawingId: models.drawWithRevisions._id,
			revisionId: revisions.rev2._id,
			usePrevious: false,
		};

		const standardPayload = {
			horizontal: {
				model: times(2, () => times(3, () => ServiceHelper.generateRandomNumber())),
				drawing: times(2, () => times(2, () => ServiceHelper.generateRandomNumber())),
			},
			verticalRange: [ServiceHelper.generateRandomNumber(0, 10), ServiceHelper.generateRandomNumber(11, 20)],
			units: 'm',
		};

		beforeAll(async () => {
			await setupData(basicData);
		});

		describe.each([
			['the user does not have a valid session', { ...params, key: null }, standardPayload, false, templates.notLoggedIn],
			['the teamspace does not exist', { ...params, ts: ServiceHelper.generateRandomString() }, standardPayload, false, templates.teamspaceNotFound],
			['the user is not a member of the teamspace', { ...params, key: users.nobody.apiKey }, standardPayload, false, templates.teamspaceNotFound],
			['the user does not have access to the drawing', { ...params, key: users.noProjectAccess.apiKey }, standardPayload, false, templates.notAuthorized],
			['the user has viewer permissions to the drawing', { ...params, key: users.viewer.apiKey }, standardPayload, false, templates.notAuthorized],
			['the user has commenter permissions to the drawing', { ...params, key: users.commenter.apiKey }, standardPayload, false, templates.notAuthorized],
			['the project does not exist', { ...params, projectId: ServiceHelper.generateRandomString() }, standardPayload, false, templates.projectNotFound],
			['the drawing does not exist', { ...params, drawingId: ServiceHelper.generateRandomString() }, standardPayload, false, templates.drawingNotFound],
			['the model is of wrong type', { ...params, drawingId: models.container._id }, standardPayload, false, templates.drawingNotFound],
			['the revision does not exist', { ...params, revisionId: ServiceHelper.generateRandomString() }, standardPayload, false, templates.revisionNotFound],
			['the revision is void', { ...params, revisionId: revisions.rev4._id }, standardPayload, false, templates.revisionNotFound],
			['the payload is invalid', params, { standardPayload, units: ServiceHelper.generateRandomString() }, false, templates.invalidArguments],
			['the payload is valid', params, standardPayload, true],
			['usePrevious is set to true but revision is uncalibrated', { ...params, revisionId: revisions.rev1._id, usePrevious: true }, {}, false, templates.calibrationNotFound],
			['usePrevious is set to true but revision is calibrated', { ...params, revisionId: revisions.rev2._id, usePrevious: true }, {}, false, templates.calibrationNotFound],
			['usePrevious is set to true and revision is unconfirmed', { ...params, key: users.tsAdmin2.apiKey, revisionId: revisions.rev3._id, usePrevious: true }, {}, true],
		])('Add Calibration', (desc, parameters, payload, success, error) => {
			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : error.status;
				const route = ({ ts, projectId, drawingId, revisionId, usePrevious, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}/calibrations?key=${key}&usePrevious=${usePrevious}`;
				const drawingRoute = ({ ts, projectId, drawingId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawingId}?key=${key}`;

				let lastCalBeforePost;
				if (success && parameters.usePrevious) {
					const { body } = await agent.get(route(parameters));
					lastCalBeforePost = body;
				}

				const res = await agent.post(route(parameters)).send(payload).expect(expectedStatus);

				if (success) {
					const { body: newlyCreatedCal } = await agent.get(route(parameters));
					const { body: updatedDrawing } = await agent.get(drawingRoute(parameters));

					const calibrationData = parameters.usePrevious ? lastCalBeforePost : payload;

					expect(newlyCreatedCal).toEqual({
						...calibrationData,
						createdAt: newlyCreatedCal.createdAt,
						createdBy: newlyCreatedCal.createdBy,
					});

					expect(updatedDrawing.calibration).toEqual({
						verticalRange: calibrationData.verticalRange,
						units: calibrationData.units,
					});
				} else {
					expect(res.body.code).toEqual(error.code);
				}
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => Promise.all([
		ServiceHelper.queue.purgeQueues(),
		ServiceHelper.closeApp(server),
	]));

	testGetCalibration();
	testAddCalibration();
});
