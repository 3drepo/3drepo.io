/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { times } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../../helper/services');
const { src } = require('../../../../../../../helper/path');
const { insertOne } = require('../../../../../../../../../src/v5/handler/db');
const { stringToUUID } = require('../../../../../../../../../src/v5/utils/helper/uuids');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const viewer = ServiceHelper.generateUserCredentials();
	const commenter = ServiceHelper.generateUserCredentials();
	const collaborator = ServiceHelper.generateUserCredentials();
	const data = {
		users: {
			tsAdmin: ServiceHelper.generateUserCredentials(),
			noProjectAccess: ServiceHelper.generateUserCredentials(),
			nobody: ServiceHelper.generateUserCredentials(),
			projectAdmin: ServiceHelper.generateUserCredentials(),
			viewer,
			commenter,
			collaborator,
		},
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user] }),
		fed: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user],
			modelType: modelTypes.FEDERATION }),
		draw: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user],
			modelType: modelTypes.DRAWING }),
		calibration: ServiceHelper.generateCalibration(),
		revisions: times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER)),
	};

	data.jobs = [
		{ _id: ServiceHelper.generateRandomString(), users: [viewer.user] },
		{ _id: ServiceHelper.generateRandomString(), users: [collaborator.user] },
		{ _id: ServiceHelper.generateRandomString(), users: Object.values(data.users).map(({ user }) => user) },
	];

	return data;
};

const setupBasicData = async (users, teamspace, project, models) => {
	const { tsAdmin, ...otherUsers } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	const userProms = Object.keys(otherUsers).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	await Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id),
			[users.projectAdmin.user]),
	]);
};

const testGetAssetList = (internalService) => {
	describe('Get Asset list', () => {
		const { users, teamspace, project, con, fed, revisions } = generateBasicData();
		const conNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.CONTAINER });
		const fedNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });

		const rev1Content = ServiceHelper.generateRandomObject();
		const rev2Content = ServiceHelper.generateRandomObject();

		const fedRevisions = times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.FEDERATION));
		fed.properties.subModels = [{ _id: con._id }];

		beforeAll(async () => {
			const models = [con, conNoRev, fed, fedNoRev];
			await setupBasicData(users, teamspace, project, models);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await ServiceHelper.db.createRevision(teamspace, project.id, fed._id,
				{ ...fedRevisions[0], timestamp: new Date() }, modelTypes.FEDERATION);

			await insertOne(teamspace, `${con._id}.stash.repobundles`, { _id: stringToUUID(revisions[0]._id), ...rev1Content });
			await insertOne(teamspace, `${con._id}.stash.unity3d`, { _id: stringToUUID(revisions[1]._id), ...rev2Content });
		});

		const generateTestData = (modelType) => {
			const model = modelType === modelTypes.CONTAINER ? con : fed;
			const wrongTypeModel = modelType === modelTypes.CONTAINER ? fed : con;
			const modelNoRev = modelType === modelTypes.CONTAINER ? conNoRev : fedNoRev;
			const modelRevs = modelType === modelTypes.CONTAINER ? revisions : fedRevisions;

			const modelNotFoundErr = modelType === modelTypes.CONTAINER
				? templates.containerNotFound : templates.federationNotFound;
			let rev1FullContent;
			let rev2FullContent;

			if (modelType === modelTypes.CONTAINER) {
				rev1FullContent = { models: [rev1Content] };
				rev2FullContent = { models: [rev2Content] };
			} else {
				// feds don't cater for revisions
				rev1FullContent = { models: [rev2Content] };
				rev2FullContent = { models: [rev2Content] };
			}
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/bundles${ServiceHelper.createQueryString({ revId, key: internalService ? undefined : key })}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFoundErr],
				['the model is not of the wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFoundErr],
				['the model does not have a revision', getRoute({ modelId: modelNoRev._id }), false, templates.revisionNotFound],
				['an invalid revision is provided by the user', getRoute({ revId: ServiceHelper.generateUUIDString() }), false, templates.revisionNotFound],
				['a revision is provided by the user', getRoute({ revId: modelRevs[0]._id }), true, rev1FullContent],
				['a revision is not provided by the user', getRoute(), true, rev2FullContent],
			];

			return [
				...commonTests,
				...(internalService ? [] : externalTests),
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
	});
};

const testGetAssetMeta = (internalService) => {
	describe('Get Asset meta', () => {
		const { users, teamspace, project, con, fed, revisions } = generateBasicData();
		const conNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.CONTAINER });
		const fedNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });

		const rev1Content = ServiceHelper.generateRandomObject();
		const rev2Content = ServiceHelper.generateRandomObject();

		const fedRevisions = times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.FEDERATION));
		fed.properties.subModels = [{ _id: con._id }];

		beforeAll(async () => {
			const models = [con, conNoRev, fed, fedNoRev];
			await setupBasicData(users, teamspace, project, models);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await ServiceHelper.db.createRevision(teamspace, project.id, fed._id,
				{ ...fedRevisions[0], timestamp: new Date() }, modelTypes.FEDERATION);

			await ServiceHelper.db.addJSONFile(teamspace, con._id, `${revisions[0]._id}/supermeshes.json`, Buffer.from(JSON.stringify(rev1Content)));
			await ServiceHelper.db.addJSONFile(teamspace, con._id, `${revisions[1]._id}/supermeshes.json`, Buffer.from(JSON.stringify(rev2Content)));
		});

		const generateTestData = (modelType) => {
			const model = modelType === modelTypes.CONTAINER ? con : fed;
			const wrongTypeModel = modelType === modelTypes.CONTAINER ? fed : con;
			const modelNoRev = modelType === modelTypes.CONTAINER ? conNoRev : fedNoRev;
			const modelRevs = modelType === modelTypes.CONTAINER ? revisions : fedRevisions;

			const modelNotFoundErr = modelType === modelTypes.CONTAINER
				? templates.containerNotFound : templates.federationNotFound;
			let rev1FullContent;
			let rev2FullContent;

			if (modelType === modelTypes.CONTAINER) {
				rev1FullContent = rev1Content;
				rev2FullContent = rev2Content;
			} else {
				// feds don't cater for revisions
				rev1FullContent = { submodels: [rev2Content] };
				rev2FullContent = { submodels: [rev2Content] };
			}
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/bundles/meta${ServiceHelper.createQueryString({ revId, key: internalService ? undefined : key })}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFoundErr],
				['the model is not of the wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFoundErr],
				['the model does not have a revision', getRoute({ modelId: modelNoRev._id }), false, templates.revisionNotFound],
				['an invalid revision is provided by the user', getRoute({ revId: ServiceHelper.generateUUIDString() }), false, templates.revisionNotFound],
				['a revision is provided by the user', getRoute({ revId: modelRevs[0]._id }), true, rev1FullContent],
				['a revision is not provided by the user', getRoute(), true, rev2FullContent],
			];

			return [
				...commonTests,
				...(internalService ? [] : externalTests),
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));
	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

		testGetAssetList();
		testGetAssetMeta();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});
		testGetAssetList(true);
		testGetAssetMeta(true);
	});
});
