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

const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const viewer = ServiceHelper.generateUserCredentials();
	const commenter = ServiceHelper.generateUserCredentials();
	const collaborator = ServiceHelper.generateUserCredentials();
	const perms = { viewers: [viewer.user],
		commenters: [commenter.user],
		collaborators: [collaborator.user] };
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
		con: ServiceHelper.generateRandomModel(perms),
		conNoRev: ServiceHelper.generateRandomModel(perms),
		fedNoRev: ServiceHelper.generateRandomModel({
			...perms,
			modelType: modelTypes.FEDERATION }),

		revisions: times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER)),
	};

	data.fed = ServiceHelper.generateRandomModel({
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

const testGetTree = (internalService) => {
	describe('Get tree', () => {
		const { users, teamspace, project, con, fed, revisions, conNoRev } = generateBasicData();

		const rev1Content = JSON.stringify(ServiceHelper.generateRandomObject());
		const rev2Content = JSON.stringify(ServiceHelper.generateRandomObject());

		beforeAll(async () => {
			const models = [con, conNoRev, fed];
			await setupBasicData(users, teamspace, project, models);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await ServiceHelper.db.addJSONFile(teamspace, con._id, `${revisions[0]._id}/fulltree.json`, Buffer.from(rev1Content));
			await ServiceHelper.db.addJSONFile(teamspace, con._id, `${revisions[1]._id}/fulltree.json`, Buffer.from(rev2Content));
		});

		const generateTestData = (modelType) => {
			const model = con;
			const wrongTypeModel = fed;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/tree${ServiceHelper.createQueryString({ revId, key: internalService ? undefined : key })}`;

			const externalTests = [
				['session is external', getRoute(), false, templates.pageNotFound],
			];

			const internalTests = modelType === modelTypes.CONTAINER ? [
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the container does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
				['the model is not a container', getRoute({ modelId: wrongTypeModel._id }), false, templates.containerNotFound],
				['the container does not have a revision', getRoute({ modelId: conNoRev._id }), false, templates.revisionNotFound],
				['a revision is provided by the user', getRoute({ revId: revisions[0]._id }), true, rev1Content],
				['an invalid revision is provided by the user', getRoute({ revId: ServiceHelper.generateUUIDString() }), false, templates.revisionNotFound],
				['a revision is not provided by the user', getRoute(), true, rev2Content],
			] : [['the model type used in the route is not container', getRoute(), false, templates.pageNotFound]];

			return internalService ? internalTests : externalTests;
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					const fullOutput = { subTrees: [], mainTree: JSON.parse(expectedOutput) };

					expect(res.body).toEqual(fullOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
	});
};

const testGetModelProperties = (internalService) => {
	describe('Get model properties', () => {
		const { users, teamspace, project, con, fed, revisions, conNoRev, fedNoRev } = generateBasicData();

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

			await ServiceHelper.db.addJSONFile(teamspace, con._id, `${revisions[0]._id}/modelProperties.json`, Buffer.from(JSON.stringify(rev1Content)));
			await ServiceHelper.db.addJSONFile(teamspace, con._id, `${revisions[1]._id}/modelProperties.json`, Buffer.from(JSON.stringify(rev2Content)));
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
				rev1FullContent = { subModels: [], properties: rev1Content };
				rev2FullContent = { subModels: [], properties: rev2Content };
			} else {
				// feds don't cater for revisions
				rev1FullContent = { subModels: [{ account: teamspace, model: con._id, ...rev2Content }],
					properties: { hiddenNodes: [] } };
				rev2FullContent = { subModels: [{ account: teamspace, model: con._id, ...rev2Content }],
					properties: { hiddenNodes: [] } };
			}

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/properties${ServiceHelper.createQueryString({ revId, key: internalService ? undefined : key })}`;

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

const testGetMesh = (isInternal) => {
	describe('Get mesh', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const revEntry = ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER);

		const rootNode = ServiceHelper.generateBasicNode('transformation', revEntry._id);
		const mesh1 = ServiceHelper.generateMeshNode(revEntry._id, [rootNode.shared_id]);

		const nodes = [rootNode, mesh1];

		const meshId = UUIDToString(mesh1._id);

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con]);

			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				revEntry,
				modelTypes.CONTAINER);

			await ServiceHelper.db.createScene(teamspace, project.id, con._id, revEntry,
				nodes);
		});

		const getRoute = ({
			projectId = project.id,
			key = users.tsAdmin.apiKey,
			modelType = modelTypes.CONTAINER,
			modelId = con._id,
			meshIdParam = meshId,
		} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/meshes/${meshIdParam}${ServiceHelper.createQueryString(isInternal ? {} : { key })}`;

		const generateTestData = (modelType) => {
			if (modelType !== modelTypes.CONTAINER) {
				return [['the model type used in the route is not container', getRoute({ modelType }), false, templates.pageNotFound]];
			}

			const wrongTypeModel = fed;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['user is a viewer', getRoute({ key: users.viewer.apiKey }), true],
				['user is a collaborator', getRoute({ key: users.collaborator.apiKey }), true],
				['user is a commenter', getRoute({ key: users.commenter.apiKey }), true],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the container does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
				['the model is not a container', getRoute({ modelId: wrongTypeModel._id }), false, templates.containerNotFound],
				['the mesh does not exist', getRoute({ meshIdParam: ServiceHelper.generateRandomString() }), false, templates.meshNotFound],
				['the mesh exists', getRoute(), true],
			];

			return isInternal ? commonTests : [...externalTests, ...commonTests];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					const expectedData = {
						matrix: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
						primitive: 3,
						vertices: Array.from(
							{ length: mesh1.blobData.vertices.length / 3 },
							(_, i) => mesh1.blobData.vertices.slice(i * 3, i * 3 + 3),
						),
						faces: mesh1.blobData.faces.filter((n, i) => i % 4 !== 0),
					};
					expect(res.body).toEqual(expectedData);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testGetTexture = (isInternal) => {
	describe('Get texture', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const revEntry = ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER);

		const textureNode = ServiceHelper.generateTextureNode(revEntry._id, []);

		const nodes = [textureNode];

		const textureId = UUIDToString(textureNode._id);

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed]);

			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				revEntry,
				modelTypes.CONTAINER);

			await ServiceHelper.db.createScene(teamspace, project.id, con._id, revEntry,
				nodes);
		});

		const getRoute = ({
			projectId = project.id,
			key = users.tsAdmin.apiKey,
			modelType = modelTypes.CONTAINER,
			modelId = con._id,
			textureIdParam = textureId,
		} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/textures/${textureIdParam}${ServiceHelper.createQueryString(isInternal ? {} : { key })}`;
		const generateTestData = (modelType) => {
			if (modelType !== modelTypes.CONTAINER) {
				return [['the model type used in the route is not container', getRoute({ modelType }), false, templates.pageNotFound]];
			}

			const wrongTypeModel = fed;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['user is a viewer', getRoute({ key: users.viewer.apiKey }), true],
				['user is a collaborator', getRoute({ key: users.collaborator.apiKey }), true],
				['user is a commenter', getRoute({ key: users.commenter.apiKey }), true],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the container does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
				['the model is not a container', getRoute({ modelId: wrongTypeModel._id }), false, templates.containerNotFound],
				['the texture does not exist', getRoute({ textureIdParam: ServiceHelper.generateRandomString() }), false, templates.textureNotFound],
				['the texture exists', getRoute(), true],
			];

			return isInternal ? commonTests : [...externalTests, ...commonTests];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(Buffer.isBuffer(res.body)).toBeTruthy();
					// turn the buffer back to string and compare
					const resString = Buffer.from(res.body).toString();
					expect(resString).toEqual(textureNode.blobData.data);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
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

		testGetTree();
		testGetMesh();
		testGetTexture();
		testGetModelProperties();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});
		testGetTree(true);
		testGetMesh(true);
		testGetTexture(true);
		testGetModelProperties(true);
	});
});
