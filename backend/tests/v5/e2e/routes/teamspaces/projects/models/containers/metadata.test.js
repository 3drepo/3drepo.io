/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { determineTestGroup } = require('../../../../../../helper/utils');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { times } = require('lodash');
const { src } = require('../../../../../../helper/path');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);

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
		collaborator: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
		projectAdmin: ServiceHelper.generateUserCredentials(),
	};

	const metadata = {
		_id: ServiceHelper.generateUUIDString(),
		metadata: [
			{ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString() },
			{ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString(), custom: true },
			{ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString(), custom: true },
		],
	};

	const perms = {
		viewers: [users.viewer.user],
		commenters: [users.commenter.user],
		collaborators: [users.collaborator.user],
	};

	const data = {
		users,
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel(perms),
		fed: ServiceHelper.generateRandomModel({ ...perms, modelType: modelTypes.FEDERATION }),
		conNoRev: ServiceHelper.generateRandomModel(perms),
		revisions: times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER)),
		metadata,
	};

	return data;
};

const setupData = async (users, teamspace, project, models, con, metadata, revId) => {
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
	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map((m) => m._id),
			[users.projectAdmin.user]),
		ServiceHelper.db.createMetadata(teamspace, con._id, metadata._id, metadata.metadata, revId),
	]);
};

const testUpdateCustomMetadata = (internalService) => {
	describe('Update Metadata', () => {
		const { users, teamspace, project, con, fed, conNoRev, metadata } = generateBasicData();
		const nonCustomMetadata = metadata.metadata[0];
		const customMetadata = metadata.metadata[1];
		const metadataToDelete = metadata.metadata[2];

		beforeAll(async () => {
			const models = [con, conNoRev, fed];
			await setupData(users, teamspace, project, models, con, metadata);
		});

		// this is also the v5 get metadata by id route, used here to validate the outcome of the patch
		const createRoute = ({
			projectId = project.id,
			containerId = con._id,
			metadataId = metadata._id,
			key = users.tsAdmin.apiKey,
		} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/metadata/${metadataId}${ServiceHelper.createQueryString({ key: internalService ? undefined : key })}`;

		// the original values, used to determine what an edit should be reverted back to
		const originalValues = metadata.metadata.reduce((obj, item) => Object.assign(obj,
			{ [item.key]: item.value }), {});

		const metadataToAdd = {
			key: ServiceHelper.generateRandomString(),
			value: ServiceHelper.generateRandomString(),
		};
		const metadataToUpdate = { key: customMetadata.key, value: ServiceHelper.generateRandomString() };

		const externalTests = [
			['the user does not have a valid session', createRoute({ key: null }), undefined, false, templates.notLoggedIn],
			['the user is not a member of the teamspace', createRoute({ key: users.nobody.apiKey }), undefined, false, templates.teamspaceNotFound],
			['the user does not have access to the container', createRoute({ key: users.noProjectAccess.apiKey }), undefined, false, templates.notAuthorized],
			['the user has viewer permission to the container', createRoute({ key: users.viewer.apiKey }), undefined, false, templates.notAuthorized],
			['the user has commenter permission to the container', createRoute({ key: users.commenter.apiKey }), undefined, false, templates.notAuthorized],
			['adding new metadata with collaborator permission', createRoute({ key: users.collaborator.apiKey }), { metadata: [metadataToAdd] }, true],
		];

		const generalTests = [
			['the project does not exist', createRoute({ projectId: ServiceHelper.generateRandomString() }), undefined, false, templates.projectNotFound],
			['the container does not exist', createRoute({ containerId: ServiceHelper.generateRandomString() }), undefined, false, templates.modelNotFound],
			['the container is a federation', createRoute({ containerId: fed._id }), undefined, false, templates.modelNotFound],
			['the metadata does not exist', createRoute({ metadataId: ServiceHelper.generateRandomString() }), undefined, false, templates.metadataNotFound],
			[
				'the user is trying to update non custom metadata',
				createRoute(),
				{
					metadata: [
						{ key: nonCustomMetadata.key, value: ServiceHelper.generateRandomString() },
						{ key: customMetadata.key, value: ServiceHelper.generateRandomString() },
					],
				},
				false,
				templates.invalidArguments,
			],
			[
				'the user is trying to add metadata with missing value',
				createRoute(),
				{ metadata: [{ key: nonCustomMetadata.key }] },
				false,
				templates.invalidArguments,
			],
			['adding new metadata', createRoute(), { metadata: [metadataToAdd] }, true],
			['editing metadata', createRoute(), { metadata: [metadataToUpdate] }, true],
			['deleting metadata', createRoute(), { metadata: [{ key: metadataToDelete.key, value: null }] }, true],
			[
				'adding, editing and deleting metadata',
				createRoute(),
				{ metadata: [{ key: metadataToDelete.key, value: null }, metadataToUpdate, metadataToAdd] },
				true,
			],
		];

		const testData = [
			...generalTests,
			...(internalService ? [] : externalTests),
		];

		describe.each(testData)('Containers', (desc, route, body, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const req = agent.patch(route);
				const res = body ? await req.send(body).expect(expectedStatus) : await req.expect(expectedStatus);

				if (success) {
					// check the edits are reflected in the metadata (null value means the key should be gone)
					const res2 = await agent.get(createRoute()).expect(templates.ok.status);
					body.metadata.forEach(({ key, value }) => {
						if (value === null) {
							expect(res2.body.metadata).not.toHaveProperty(key);
						} else {
							expect(res2.body.metadata[key]).toEqual(value);
						}
					});

					// revert the change so subsequent tests see the original data
					const revertedEdits = body.metadata.map(({ key }) => (
						{ key, value: key in originalValues ? originalValues[key] : null }));
					await agent.patch(createRoute()).send({ metadata: revertedEdits });
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		});
	});
};

const getNodesForRev = (revId) => {
	const rootNode = ServiceHelper.generateBasicNode('transformation', revId);
	const metaNodes = times(5, () => ServiceHelper.generateBasicNode('meta', revId, [rootNode.shared_id], { metadata: times(5, () => ({ key: ServiceHelper.generateRandomString(), value: ServiceHelper.generateRandomString() })) }));
	const meshNode = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id]);
	const meshIdStr = UUIDToString(meshNode._id);

	const meshMap = {
		[`${UUIDToString(rootNode._id)}`]: [meshIdStr],
		[meshIdStr]: meshIdStr,
	};

	return { nodes: [rootNode, ...metaNodes, meshNode], metaNodes, meshMap };
};

const testGetMetadata = (internalService) => {
	describe('Get metadata', () => {
		const { users, teamspace, project, con, fed, revisions, metadata } = generateBasicData();
		const conNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.CONTAINER });

		const rev1Nodes = getNodesForRev(revisions[0]._id);
		const rev2Nodes = getNodesForRev(revisions[1]._id);

		beforeAll(async () => {
			const models = [con, conNoRev, fed];
			await setupData(users, teamspace, project, models, con, metadata);
			await ServiceHelper.db.createRevision(teamspace, project, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await ServiceHelper.db.createScene(teamspace, project.id, con._id,
				revisions[0], rev1Nodes.nodes, rev1Nodes.meshMap);
			await ServiceHelper.db.createScene(teamspace, project.id, con._id,
				revisions[1], rev2Nodes.nodes, rev2Nodes.meshMap);
		});

		const generateTestData = (modelType) => {
			const model = con;
			const wrongTypeModel = fed;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/metadata${internalService ? `${revId ? `?revId=${revId}` : ''}` : `?key=${key}`}`;

			const externalTests = [
				['session is external', getRoute(), false, templates.pageNotFound],
			];

			const castNode = (node) => {
				const metaObj = {};

				node.metadata.forEach(({ key, value }) => {
					metaObj[key] = value;
				});

				return {
					_id: UUIDToString(node._id),
					metadata: metaObj,
					parents: node.parents.map(UUIDToString),
				};
			};

			if (internalService) {
				return modelType === modelTypes.CONTAINER ? [
					['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
					['the container does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.modelNotFound],
					['the model is not a container', getRoute({ modelId: wrongTypeModel._id }), false, templates.modelNotFound],
					['the container does not have a revision', getRoute({ modelId: conNoRev._id }), false, templates.revisionNotFound],
					['a revision is provided by the user', getRoute({ revId: revisions[0]._id }), true, rev1Nodes.metaNodes.map(castNode)],
					['a revision is not provided by the user', getRoute(), true, rev2Nodes.metaNodes.map(castNode)],
				] : [['the model type used in the route is not container', getRoute(), false, templates.pageNotFound]];
			}

			return externalTests;
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
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testGetMetadataById = (internalService) => {
	describe('Get metadata by id', () => {
		const { users, teamspace, project, con, fed, conNoRev, revisions, metadata } = generateBasicData();

		beforeAll(async () => {
			const models = [con, conNoRev, fed];
			await setupData(users, teamspace, project, models, con, metadata, revisions[0]._id);
			await ServiceHelper.db.createRevision(teamspace, project, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
		});

		const createRoute = ({
			teamspaceId = teamspace,
			projectId = project.id,
			containerId = con._id,
			metadataId = metadata._id,
			key = users.tsAdmin.apiKey,
		} = {}) => `/v5/teamspaces/${teamspaceId}/projects/${projectId}/containers/${containerId}/metadata/${metadataId}${ServiceHelper.createQueryString({ key: internalService ? undefined : key })}`;

		const expectedMetadata = metadata.metadata.reduce((obj, item) => Object.assign(obj,
			{ [item.key]: item.value }), {});

		const externalTests = [
			['the user does not have a valid session', createRoute({ key: null }), false, templates.notLoggedIn],
			['the user is not a member of the teamspace', createRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
			['the user does not have access to the container', createRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
		];

		const generalTests = [
			['the teamspace does not exist', createRoute({ teamspaceId: ServiceHelper.generateRandomString() }), false, templates.teamspaceNotFound],
			['the project does not exist', createRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
			['the container does not exist', createRoute({ containerId: ServiceHelper.generateRandomString() }), false, templates.modelNotFound],
			['the model is not a container', createRoute({ containerId: fed._id }), false, templates.modelNotFound],
			['the metadata does not exist', createRoute({ metadataId: ServiceHelper.generateUUIDString() }), false, templates.metadataNotFound],
			['metadata exists', createRoute(), true, { _id: metadata._id, metadata: expectedMetadata }],
		];

		const testData = [
			...generalTests,
			...(internalService ? [] : externalTests),
		];

		describe.each(testData)('Containers', (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);

				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		});
	});
};

const testGetMetadataFields = (internalService) => {
	describe('Get metadata fields', () => {
		const { users, teamspace, project, con, fed, metadata } = generateBasicData();
		const conNoMetadata = ServiceHelper.generateRandomModel({ modelType: modelTypes.CONTAINER });

		// add an additional metadata with key duplication to ensure the returned field list is unique
		const extraMetadata = {
			_id: ServiceHelper.generateUUIDString(),
			metadata: [
				{
					key: metadata.metadata[0].key,
					value: ServiceHelper.generateRandomString(),
					custom: true,
				},
				{
					key: ServiceHelper.generateRandomString(),
					value: ServiceHelper.generateRandomString(),
					custom: true,
				},
			],
		};

		beforeAll(async () => {
			const models = [con, conNoMetadata, fed];
			await setupData(users, teamspace, project, models, con, metadata);
			await ServiceHelper.db.createMetadata(teamspace, con._id, extraMetadata._id, extraMetadata.metadata);
		});

		const createRoute = ({
			projectId = project.id,
			containerId = con._id,
			key = users.tsAdmin.apiKey,
		} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/metadata/fields${ServiceHelper.createQueryString({ key: internalService ? undefined : key })}`;

		const expectedFields = Array.from(
			new Set([...metadata.metadata, ...extraMetadata.metadata].map(({ key }) => key)));

		const externalTests = [
			['the user does not have a valid session', createRoute({ key: null }), false, templates.notLoggedIn],
			['the user is not a member of the teamspace', createRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
			['the user does not have access to the container', createRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
		];

		const generalTests = [
			['the project does not exist', createRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
			['the container does not exist', createRoute({ containerId: ServiceHelper.generateRandomString() }), false, templates.modelNotFound],
			['the model is not a container', createRoute({ containerId: fed._id }), false, templates.modelNotFound],
			['the container does not have metadata', createRoute({ containerId: conNoMetadata._id }), true, { fields: [] }],
			['metadata exists in one or more entries', createRoute(), true, { fields: expectedFields }],
		];

		const testData = [
			...generalTests,
			...(internalService ? [] : externalTests),
		];

		describe.each(testData)('Containers', (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);

				if (success) {
					expect(res.body.fields).toEqual(expect.arrayContaining(expectedOutput.fields));
					expect(res.body.fields).toHaveLength(expectedOutput.fields.length);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		});
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

		testUpdateCustomMetadata();
		testGetMetadata();
		testGetMetadataById();
		testGetMetadataFields();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});

		testUpdateCustomMetadata(true);
		testGetMetadata(true);
		testGetMetadataById(true);
		testGetMetadataFields(true);
	});
});
