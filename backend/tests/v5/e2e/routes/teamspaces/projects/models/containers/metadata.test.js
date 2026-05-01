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

	const perms = { viewers: [users.viewer.user],
		commenters: [users.commenter.user],
		collaborators: [users.collaborator.user] };

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

const setupData = async (users, teamspace, project, models, con, metadata) => {
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
		ServiceHelper.db.createMetadata(teamspace, con._id, metadata._id, metadata.metadata),
	]);
};

const testUpdateCustomMetadata = () => {
	describe('Update Metadata', () => {
		const { users, teamspace, project, con, fed, conNoRev, metadata } = generateBasicData();
		const nonCustomMetadata = metadata.metadata[0];
		const customMetadata = metadata.metadata[1];
		const metadataToDelete = metadata.metadata[2];

		const createRoute = (projectId = project.id, containerId = con._id, metadataId = metadata._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/metadata/${metadataId}`;

		const routeV4 = `/${teamspace}/${con._id}/meta/${metadata._id}.json`;

		beforeAll(async () => {
			const models = [con, conNoRev, fed];
			await setupData(users, teamspace, project, models, con, metadata);
		});

		test('should fail without a valid session', async () => {
			const res = await agent.patch(createRoute()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`${createRoute(ServiceHelper.generateRandomString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.patch(`${createRoute(project.id, ServiceHelper.generateRandomString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the container is a federation', async () => {
			const res = await agent.patch(`${createRoute(project.id, fed._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the metadata does not exist', async () => {
			const res = await agent.patch(`${createRoute(project.id, con._id, ServiceHelper.generateRandomString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.metadataNotFound.status);
			expect(res.body.status).toEqual(templates.metadataNotFound.status);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.notAuthorized.status);

			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should fail if the user has viewer permission to the container', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.viewer.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should fail if the user has commenter permission to the container', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.commenter.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should add new metadata with collaborator permission', async () => {
			const metadataToAdd = {
				key: ServiceHelper.generateRandomString(),
				value: ServiceHelper.generateRandomString(),
			};
			await agent.patch(`${createRoute()}?key=${users.collaborator.apiKey}`).send({ metadata: [metadataToAdd] })
				.expect(templates.ok.status);

			const res = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const expectedMetadata = metadata.metadata.concat(metadataToAdd)
				.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});

			expect(res.body).toEqual({ meta: [{ _id: metadata._id, metadata: expectedMetadata }] });

			// remove the newly added metadata
			await agent.patch(`${createRoute()}?key=${users.collaborator.apiKey}`).send({ metadata: [{ key: metadataToAdd.key, value: null }] });
		});

		test('should fail if the user is trying to update non custom metadata', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({
					metadata: [
						{ key: nonCustomMetadata.key, value: ServiceHelper.generateRandomString() },
						{ key: customMetadata.key, value: ServiceHelper.generateRandomString() },
					],
				}).expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should fail if the user is trying to add metadata with missing value', async () => {
			const res = await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({
					metadata: [{ key: nonCustomMetadata.key }],
				}).expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should add new metadata', async () => {
			const metadataToAdd = {
				key: ServiceHelper.generateRandomString(),
				value: ServiceHelper.generateRandomString(),
			};
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`).send({ metadata: [metadataToAdd] })
				.expect(templates.ok.status);

			const res = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const expectedMetadata = metadata.metadata.concat(metadataToAdd)
				.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});

			expect(res.body).toEqual({ meta: [{ _id: metadata._id, metadata: expectedMetadata }] });

			// remove the newly added metadata
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`).send({ metadata: [{ key: metadataToAdd.key, value: null }] });
		});

		test('should edit metadata', async () => {
			const metadataToUpdate = { key: customMetadata.key, value: ServiceHelper.generateRandomString() };

			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataToUpdate.key, value: metadataToUpdate.value }] })
				.expect(templates.ok.status);

			const res = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);

			const expectedMetadata = metadata.metadata.reduce((obj, item) => Object.assign(obj,
				{ [item.key]: item.value }), {});
			expectedMetadata[metadataToUpdate.key] = metadataToUpdate.value;

			expect(res.body).toEqual({ meta: [{ _id: metadata._id, metadata: expectedMetadata }] });

			// set the updated metadata back the original value
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: customMetadata.key, value: customMetadata.value }] });
		});

		test('should delete metadata', async () => {
			const metadataBackup = { ...metadataToDelete };
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataToDelete.key, value: null }] })
				.expect(templates.ok.status);

			const res = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const expectedMetadata = metadata.metadata.reduce((obj, item) => Object.assign(obj,
				{ [item.key]: item.value }), {});
			delete expectedMetadata[metadataToDelete.key];

			expect(res.body).toEqual({ meta: [{ _id: metadata._id, metadata: expectedMetadata }] });

			// add the deleted metadata back
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataBackup.key, value: metadataBackup.value }] });
		});

		test('should add, edit and delete metadata', async () => {
			const metadataBackup = { ...metadataToDelete };
			const metadataToAdd = {
				key: ServiceHelper.generateRandomString(),
				value: ServiceHelper.generateRandomString(),
			};
			const metadataToUpdate = { key: customMetadata.key, value: ServiceHelper.generateRandomString() };
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({
					metadata: [
						{ key: metadataToDelete.key, value: null },
						metadataToUpdate,
						metadataToAdd,
					],
				})
				.expect(templates.ok.status);

			const res = await agent.get(`${routeV4}?key=${users.tsAdmin.apiKey}`);
			const expectedMetadata = metadata.metadata.concat(metadataToAdd)
				.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});

			delete expectedMetadata[metadataToDelete.key];
			expectedMetadata[customMetadata.key] = metadataToUpdate.value;

			expect(res.body).toEqual({ meta: [{ _id: metadata._id, metadata: expectedMetadata }] });

			// add the deleted metadata back
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataBackup.key, value: metadataBackup.value }] });

			// set the updated metadata back the original value
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: customMetadata.key, value: customMetadata.value }] });

			// remove the newly added metadata
			await agent.patch(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ metadata: [{ key: metadataToAdd.key, value: null }] });
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
					['the container does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
					['the model is not a container', getRoute({ modelId: wrongTypeModel._id }), false, templates.containerNotFound],
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

describe(ServiceHelper.determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));
	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

		testUpdateCustomMetadata();
		testGetMetadata();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});

		testGetMetadata(true);
	});
});
