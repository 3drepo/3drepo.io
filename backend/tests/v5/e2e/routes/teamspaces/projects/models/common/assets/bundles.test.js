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

const { determineTestGroup } = require('../../../../../../../helper/utils');
const { times } = require('lodash');
const SuperTest = require('supertest');
const {
	generateUUIDString,
	generateUUID,
	generateRandomString,
	generateRandomNumber,
	generateUserCredentials,
	generateRandomProject,
	generateRandomModel,
	generateRandomObject,
} = require('../../../../../../../helper/dataGen');
const ServiceHelper = require('../../../../../../../helper/services');
const { src } = require('../../../../../../../helper/path');

const { insertOne, insertMany } = require(`${src}/handler/db`);
const { stringToUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);
const { storeFile } = require(`${src}/services/filesManager`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const REPO_BUNDLE_COLLECTION = '.stash.repobundles';
const UNITY_BUNDLE_COLLECTION = '.stash.unity3d';
const UNITY3D_NAME_EXT = '.unity3d';

let server;
let agent;

const generateBasicData = () => {
	const viewer = generateUserCredentials();
	const commenter = generateUserCredentials();
	const collaborator = generateUserCredentials();
	const perms = { viewers: [viewer.user],
		commenters: [commenter.user],
		collaborators: [collaborator.user] };
	const data = {
		users: {
			tsAdmin: generateUserCredentials(),
			noProjectAccess: generateUserCredentials(),
			nobody: generateUserCredentials(),
			projectAdmin: generateUserCredentials(),
			viewer,
			commenter,
			collaborator,
		},
		teamspace: generateRandomString(),
		project: generateRandomProject(),
		con: generateRandomModel(perms),
		conNoRev: generateRandomModel(perms),
		fedNoRev: generateRandomModel({
			...perms,
			modelType: modelTypes.FEDERATION }),

		revisions: times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER)),
	};

	data.fed = generateRandomModel({
		...perms,
		modelType: modelTypes.FEDERATION,
		properties: { subModels: [{ _id: data.con._id }, { _id: data.conNoRev._id }] },
	});

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
		const { users, teamspace, project, con, fed, revisions, conNoRev, fedNoRev } = generateBasicData();

		const rev1Content = generateRandomObject();
		const rev2Content = generateRandomObject();

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

			await insertOne(teamspace, `${con._id}${REPO_BUNDLE_COLLECTION}`, { _id: stringToUUID(revisions[0]._id), ...rev1Content });
			await insertOne(teamspace, `${con._id}${UNITY_BUNDLE_COLLECTION}`, { _id: stringToUUID(revisions[1]._id), ...rev2Content });
		});

		const generateTestData = (modelType) => {
			const model = modelType === modelTypes.CONTAINER ? con : fed;
			const wrongTypeModel = modelType === modelTypes.CONTAINER ? fed : con;
			const modelNoRev = modelType === modelTypes.CONTAINER ? conNoRev : fedNoRev;
			const modelRevs = modelType === modelTypes.CONTAINER ? revisions : fedRevisions;

			const modelNotFoundErr = templates.modelNotFound;
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
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, modelNotFoundErr],
				['the model is of the wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFoundErr],
				['the model does not have a revision', getRoute({ modelId: modelNoRev._id }), false, templates.revisionNotFound],
				['an invalid revision is provided by the user', getRoute({ revId: generateUUIDString() }), false, templates.revisionNotFound],
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
		const { users, teamspace, project, con, fed, revisions, conNoRev, fedNoRev } = generateBasicData();

		const rev1Content = generateRandomObject();
		const rev2Content = generateRandomObject();

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

			const modelNotFoundErr = templates.modelNotFound;
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
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, modelNotFoundErr],
				['the model is of the wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFoundErr],
				['the model does not have a revision', getRoute({ modelId: modelNoRev._id }), false, templates.revisionNotFound],
				['an invalid revision is provided by the user', getRoute({ revId: generateUUIDString() }), false, templates.revisionNotFound],
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

const testGetUnityMeta = (internalService) => {
	const generateSuperMeshData = (nMeshes) => {
		const output = { superMeshes: [] };

		const input = times(nMeshes, () => {
			const baseData = {
				primitive: generateRandomNumber(),
			};

			const nFaces = generateRandomNumber();
			const nVertices = generateRandomNumber();
			const nUVChannels = generateRandomNumber();
			const max = [
				generateRandomNumber(),
				generateRandomNumber(),
				generateRandomNumber()];
			const min = [
				generateRandomNumber(),
				generateRandomNumber(),
				generateRandomNumber()];

			const superMesh = { ...baseData,
				faces_count: nFaces,
				vertices_count: nVertices,
				uv_channels_count: nUVChannels,
				bounding_box: [min, max],
			};
			const superMeshOut = { ...baseData, nFaces, nVertices, nUVChannels, min, max };

			superMesh._id = generateUUID();
			superMeshOut._id = UUIDToString(superMesh._id);
			output.superMeshes.push(superMeshOut);
			return superMesh;
		});

		return { input, output };
	};
	describe('Get unity asset meta', () => {
		const { users, teamspace, project, con, fed, revisions, conNoRev, fedNoRev } = generateBasicData();
		const nMeshes = 10;

		const rev1Content = generateSuperMeshData(nMeshes);
		const rev2Content = generateSuperMeshData(nMeshes);

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

			await insertMany(teamspace, `${con._id}.stash.3drepo`, rev1Content.input.map((data) => ({ ...data, type: 'mesh', rev_id: stringToUUID(revisions[0]._id) })));
			await insertMany(teamspace, `${con._id}.stash.3drepo`, rev2Content.input.map((data) => ({ ...data, type: 'mesh', rev_id: stringToUUID(revisions[1]._id) })));
		});

		const generateTestData = (modelType) => {
			const model = modelType === modelTypes.CONTAINER ? con : fed;
			const wrongTypeModel = modelType === modelTypes.CONTAINER ? fed : con;
			const modelNoRev = modelType === modelTypes.CONTAINER ? conNoRev : fedNoRev;
			const modelRevs = modelType === modelTypes.CONTAINER ? revisions : fedRevisions;

			const modelNotFoundErr = templates.modelNotFound;
			let rev1FullContent;
			let rev2FullContent;

			if (modelType === modelTypes.CONTAINER) {
				rev1FullContent = rev1Content.output;
				rev2FullContent = rev2Content.output;
			} else {
				// feds don't cater for revisions
				const output = [{ superMeshes: rev2Content.output, teamspace, model: con._id }];
				rev1FullContent = { subModels: output };
				rev2FullContent = { subModels: output };
			}
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/bundles/unity/meta${ServiceHelper.createQueryString({ revId, key: internalService ? undefined : key })}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, modelNotFoundErr],
				['the model is not of the wrong type', getRoute({ modelId: wrongTypeModel._id }), false, modelNotFoundErr],
				['the model does not have a revision', getRoute({ modelId: modelNoRev._id }), false, templates.revisionNotFound],
				['an invalid revision is provided by the user', getRoute({ revId: generateUUIDString() }), false, templates.revisionNotFound],
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

const testGetRepoBundle = (internalService) => {
	describe('Get Repo bundle', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();

		const bundle1Content = Buffer.from(generateRandomString());
		const bundle2Content = Buffer.from(generateRandomString());
		const bundle1Id = generateUUIDString();
		const bundle2Id = generateUUIDString();

		beforeAll(async () => {
			const models = [con, fed];
			await setupBasicData(users, teamspace, project, models);
			await storeFile(teamspace, `${con._id}${REPO_BUNDLE_COLLECTION}`, bundle1Id, bundle1Content);
			await storeFile(teamspace, `${con._id}${REPO_BUNDLE_COLLECTION}`, bundle2Id, bundle2Content);
		});

		const generateTestData = () => {
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = con._id,
				bundleId = bundle1Id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/assets/bundles/repo/${bundleId}${ServiceHelper.createQueryString({ key: internalService ? undefined : key })}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, templates.modelNotFound],
				['the model is of the wrong type', getRoute({ modelId: fed._id }), false, templates.modelNotFound],
				['an invalid bundleId is provided by the user', getRoute({ bundleId: generateUUIDString() }), false, templates.fileNotFound],
				['a bundleId is provided by the user', getRoute({ bundleId: bundle1Id }), true, bundle1Content],
				['another bundleId is provided by the user', getRoute({ bundleId: bundle2Id }), true, bundle2Content],
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
	});
};

const testGetUnityBundle = (internalService) => {
	describe('Get Unity bundle', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();

		const bundle1Content = Buffer.from(generateRandomString());
		const bundle2Content = Buffer.from(generateRandomString());
		const bundle1Id = generateUUIDString();
		const bundle2Id = generateUUIDString();

		beforeAll(async () => {
			const models = [con, fed];
			await setupBasicData(users, teamspace, project, models);
			await storeFile(teamspace, `${con._id}${UNITY_BUNDLE_COLLECTION}`, `${bundle1Id}${UNITY3D_NAME_EXT}`, bundle1Content);
			await storeFile(teamspace, `${con._id}${UNITY_BUNDLE_COLLECTION}`, `${bundle2Id}${UNITY3D_NAME_EXT}`, bundle2Content);
		});

		const generateTestData = () => {
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = con._id,
				bundleId = bundle1Id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/assets/bundles/unity/${bundleId}${ServiceHelper.createQueryString({ key: internalService ? undefined : key })}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, templates.modelNotFound],
				['the model is of the wrong type', getRoute({ modelId: fed._id }), false, templates.modelNotFound],
				['an invalid bundleId is provided by the user', getRoute({ bundleId: generateUUIDString() }), false, templates.fileNotFound],
				['a bundleId is provided by the user', getRoute({ bundleId: bundle1Id }), true, bundle1Content],
				['another bundleId is provided by the user', getRoute({ bundleId: bundle2Id }), true, bundle2Content],
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
	});
};

describe(determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));
	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

		testGetAssetList();
		testGetAssetMeta();
		testGetUnityMeta();
		testGetRepoBundle();
		testGetUnityBundle();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});
		testGetAssetList(true);
		testGetAssetMeta(true);
		testGetUnityMeta(true);
		testGetRepoBundle(true);
		testGetUnityBundle(true);
	});
});
