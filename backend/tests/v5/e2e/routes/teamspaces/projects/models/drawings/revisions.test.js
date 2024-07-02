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
const { src, objModelDwg, objModelUppercaseExtDwg, objModel } = require('../../../../../../helper/path');

const { statusCodes } = require(`${src}/models/modelSettings.constants`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		commenter: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	const teamspace = ServiceHelper.generateRandomString();
	const project = ServiceHelper.generateRandomProject();

	const models = {
		modelWithRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: {
				...ServiceHelper.generateRandomModelProperties(modelTypes.DRAWING),
				permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			},
		},
		modelWithNoRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: ServiceHelper.generateRandomModelProperties(),
		},
		federation: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: { ...ServiceHelper.generateRandomModelProperties(modelTypes.FEDERATION) },
		},
		container: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: { ...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER) },
		},
	};

	const revisions = {
		nonVoidRevision: ServiceHelper.generateRevisionEntry(false, true, modelTypes.DRAWING),
		voidRevision: ServiceHelper.generateRevisionEntry(true, true, modelTypes.DRAWING),
		noFileRevision: ServiceHelper.generateRevisionEntry(false, false, modelTypes.DRAWING),
	};

	return {
		users,
		teamspace,
		project,
		models,
		revisions,
	};
};

const setupData = async ({ users, teamspace, project, models, revisions }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

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
			models.modelWithRev._id, revisions[key], modelTypes.DRAWING)),
	]);
};

const testGetRevisions = () => {
	const basicData = generateBasicData();
	const { users, teamspace, project, models, revisions } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		ts: teamspace,
		projectId: project.id,
		drawingId: models.modelWithRev._id,
	};

	const formatRevisions = (revs, includeVoid = false) => {
		const formattedRevisions = revs
			.sort((a, b) => b.timestamp - a.timestamp)
			.flatMap((rev) => (includeVoid || !rev.void ? {
				_id: rev._id,
				revCode: rev.revCode,
				statusCode: rev.statusCode,
				author: rev.author,
				void: rev.void,
				timestamp: rev.timestamp.getTime(),
				format: rev.format,
				desc: rev.desc,
			} : []));

		return { revisions: formattedRevisions };
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the drawing', { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the drawing does not exist', { ...baseRouteParams, drawingId: ServiceHelper.generateRandomString() }, false, templates.drawingNotFound],
		['the model is a container', { ...baseRouteParams, drawingId: models.container._id }, false, templates.drawingNotFound],
		['the model is a federation', { ...baseRouteParams, drawingId: models.federation._id }, false, templates.drawingNotFound],
		['the user has adequate permissions (non void revisions)', baseRouteParams, true],
		['the user has adequate permissions (all revisions)', { ...baseRouteParams, showVoid: true }, true],
	];

	const runTest = (desc, routeParams, success, error) => {
		const route = ({ ts, projectId, drawingId, showVoid = false, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawingId}/revisions?showVoid=${showVoid}&key=${key}`;

		test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : error.status;
			const res = await agent.get(route(routeParams)).expect(expectedStatus);

			if (success) {
				expect(res.body).toEqual(
					formatRevisions(Object.keys(revisions).map((key) => revisions[key]), routeParams.showVoid));
			} else {
				expect(res.body.code).toEqual(error.code);
			}
		});
	};

	describe.each(testCases)('Get revisions', runTest);
};

const testCreateNewRevision = () => {
	const basicData = generateBasicData();
	const { users, teamspace, project, models } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		ts: teamspace,
		projectId: project.id,
		drawingId: models.modelWithRev._id,
		statusCode: statusCodes[0].code,
		revCode: ServiceHelper.generateRandomString(10),
		file: objModelDwg,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the drawing', { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
		['the user is viewer', { ...baseRouteParams, key: users.viewer.apiKey }, false, templates.notAuthorized],
		['the user is commenter', { ...baseRouteParams, key: users.commenter.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the drawing does not exist', { ...baseRouteParams, drawingId: ServiceHelper.generateRandomString() }, false, templates.drawingNotFound],
		['the model is a container', { ...baseRouteParams, drawingId: models.container._id }, false, templates.drawingNotFound],
		['the model is a federation', { ...baseRouteParams, drawingId: models.federation._id }, false, templates.drawingNotFound],
		['the statusCode is invalid', { ...baseRouteParams, statusCode: ServiceHelper.generateRandomString() }, false, templates.invalidArguments],
		['the revCode is invalid', { ...baseRouteParams, revCode: ServiceHelper.generateRandomString(11) }, false, templates.invalidArguments],
		['the file has incorrect format', { ...baseRouteParams, file: objModel }, false, templates.unsupportedFileFormat],
		['the file is missing', { ...baseRouteParams, file: undefined }, false, templates.invalidArguments],
		['the file is valid', baseRouteParams, true],
		['the file is valid with uppercase extension', { ...baseRouteParams, file: objModelUppercaseExtDwg, revCode: ServiceHelper.generateRandomString(10) }, true],
	];

	const runTest = (desc, { ts, projectId, drawingId, key, statusCode, revCode, file }, success, error) => {
		const route = () => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawingId}/revisions?key=${key}`;

		test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
			const expectedResult = success ? templates.ok : error;

			const res = await agent.post(`${route()}`)
				.set('Content-Type', 'multipart/form-data')
				.field('statusCode', statusCode)
				.field('revCode', revCode)
				.attach('file', file)
				.expect(expectedResult.status);

			expect(res.body.code).toEqual(success ? undefined : expectedResult.code);
		});
	};

	describe.each(testCases)('Create new revision', runTest);
};

const testUpdateRevisionStatus = () => {
	const basicData = generateBasicData();
	const { users, teamspace, project, models, revisions } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		ts: teamspace,
		projectId: project.id,
		drawingId: models.modelWithRev._id,
		revisionId: revisions.nonVoidRevision._id,
		setVoid: true,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the drawing', { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
		['the user is viewer', { ...baseRouteParams, key: users.viewer.apiKey }, false, templates.notAuthorized],
		['the user is commenter', { ...baseRouteParams, key: users.commenter.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the drawing does not exist', { ...baseRouteParams, drawingId: ServiceHelper.generateRandomString() }, false, templates.drawingNotFound],
		['the model is a container', { ...baseRouteParams, drawingId: models.container._id }, false, templates.drawingNotFound],
		['the model is a federation', { ...baseRouteParams, drawingId: models.federation._id }, false, templates.drawingNotFound],
		['the revision does not exist', { ...baseRouteParams, revisionId: ServiceHelper.generateRandomString() }, false, templates.revisionNotFound],
		['the body of the request is no boolean', { ...baseRouteParams, setVoid: ServiceHelper.generateRandomString() }, false, templates.invalidArguments],
		['the body of the request contains extra data', { ...baseRouteParams, extraData: { extraProp: ServiceHelper.generateRandomString() } }, false, templates.invalidArguments],
		['the body of the request is valid and set to true', baseRouteParams, true],
		['the body of the request is valid and set to false', { ...baseRouteParams, setVoid: false, revisionId: revisions.voidRevision._id }, true],
	];

	const runTest = (desc, { ts, projectId, drawingId, revisionId, setVoid, extraData, key }, success, error) => {
		const route = () => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}?key=${key}`;

		test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : error.status;
			const res = await agent.patch(route()).send({ void: setVoid, ...extraData }).expect(expectedStatus);

			if (success) {
				const revs = await agent.get(`/v5/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions?key=${key}&showVoid=true`);
				expect(revs.body.revisions.find((r) => r._id === revisionId).void).toBe(setVoid);
			} else {
				expect(res.body.code).toEqual(error.code);
			}
		});
	};

	describe.each(testCases)('Update revision status', runTest);
};

const testDownloadRevisionFiles = () => {
	const basicData = generateBasicData();
	const { users, teamspace, project, models, revisions } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		ts: teamspace,
		projectId: project.id,
		drawingId: models.modelWithRev._id,
		revisionId: revisions.nonVoidRevision._id,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the drawing', { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
		['the user is viewer', { ...baseRouteParams, key: users.viewer.apiKey }, false, templates.notAuthorized],
		['the user is commenter', { ...baseRouteParams, key: users.commenter.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the drawing does not exist', { ...baseRouteParams, drawingId: ServiceHelper.generateRandomString() }, false, templates.drawingNotFound],
		['the model is a container', { ...baseRouteParams, drawingId: models.container._id }, false, templates.drawingNotFound],
		['the model is a federation', { ...baseRouteParams, drawingId: models.federation._id }, false, templates.drawingNotFound],
		['the revision does not exist', { ...baseRouteParams, revisionId: ServiceHelper.generateRandomString() }, false, templates.revisionNotFound],
		['the revision has no file', { ...baseRouteParams, revisionId: revisions.noFileRevision._id }, false, templates.fileNotFound],
		['the revision has a file', baseRouteParams, true],
	];

	const runTest = (desc, { ts, projectId, drawingId, revisionId, key }, success, error) => {
		const route = () => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}/files/original?key=${key}`;

		test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : error.status;

			const res = await agent.get(`${route()}`).expect(expectedStatus);

			if (success) {
				expect(res.text).toEqual(revisions.nonVoidRevision.refData);
			} else {
				expect(res.body.code).toEqual(error.code);
			}
		});
	};

	describe.each(testCases)('Download revision files', runTest);
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

	testGetRevisions();
	testUpdateRevisionStatus();
	testCreateNewRevision();
	testDownloadRevisionFiles();
});
