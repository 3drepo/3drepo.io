/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const uuidHelper = require(`${src}/utils/helper/uuids`);

let server;
let agent;

const createContainerObject = (teamspace, permissions) => {
	const _id = ServiceHelper.generateUUIDString();

	return {
		_id,
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
			permissions,
		},
	};
};

const createTexData = () => {
	// Mock _blobRef
	const texData = ServiceHelper.generateRandomString();
	const texRefId = ServiceHelper.generateUUIDString();
	const texDataSize = Buffer.byteLength(texData, 'utf-8'); // This might cause problems depending on how the size is measured

	// eslint-disable-next-line no-underscore-dangle
	const _blobRef = {
		elements: {
			data: {
				start: 0,
				size: texDataSize,
			},
		},
		buffer: {
			start: 0,
			size: texDataSize,
			name: texRefId,
		},
	};

	const additionalData = {
		_blobRef,
		extension: 'jpg',
	};

	// Create Nodes
	const rev = ServiceHelper.generateRevisionEntry(false, false);
	const revId = rev._id;
	const rootNode = ServiceHelper.generateBasicNode('transformation', revId);
	const meshNode = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id]);
	const textureNode = ServiceHelper.generateBasicNode('texture', revId, [rootNode.shared_id], additionalData);

	const nodes = [
		rootNode,
		textureNode,
	];

	// Create Mesh Map for the scene mock
	const meshIdStr = uuidHelper.UUIDToString(meshNode._id);
	const meshMap = {
		[`${uuidHelper.UUIDToString(rootNode._id)}`]: [meshIdStr],
		[meshIdStr]: meshIdStr,
	};

	return {
		nodes,
		meshMap,
		rev,
		texId: uuidHelper.UUIDToString(textureNode._id),
		texData,
		texRefId,
	};
};

const generateTestEnvData = () => {
	// Create users
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		commenter: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	// Create permissions
	const permissions = [
		{ user: users.viewer.user, permission: 'viewer' },
		{ user: users.commenter.user, permission: 'commenter' },
	];

	// Create teamspace and projects
	const teamspace = ServiceHelper.generateRandomString();
	const project = ServiceHelper.generateRandomProject();

	// Create Container object
	const container = createContainerObject(
		teamspace,
		permissions,
	);

	// Create texture data
	const texData = createTexData();

	return {
		users,
		teamspace,
		project,
		container,
		texData,
	};
};

const setupTestData = async ({ users, teamspace, project, container, texData }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const contPromise = ServiceHelper.db.createModel(
		teamspace,
		container._id,
		container.name,
		container.properties,
	);

	// Create texture file
	const texPromise = ServiceHelper.db.createFile(
		teamspace,
		container._id,
		texData.texRefId,
		texData.texData,
	);

	// Create Scene
	const scenePromise = ServiceHelper.db.createScene(
		teamspace,
		project,
		container._id,
		texData.rev,
		texData.nodes,
		texData.meshMap,
	);

	const projPromise = ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id]);

	return Promise.all([
		...userProms,
		contPromise,
		texPromise,
		scenePromise,
		projPromise,
	]);
};

const testTextures = () => {
	describe('Get texture', () => {
		const testEnvData = generateTestEnvData();
		const { users, teamspace, project, container, texData } = testEnvData;

		beforeAll(async () => {
			await setupTestData(testEnvData);
		});

		const generateTestData = () => {
			const getRoute = ({
				ts = teamspace,
				projectId = project.id,
				contId = container._id,
				textureId = texData.texId,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${ts}/projects/${projectId}/containers/${contId}/textures/${textureId}.texture?key=${key}`;

			// Basic tests
			const randomString = ServiceHelper.generateRandomString();
			const nobodyKey = users.nobody.apiKey;
			const noProjAccKey = users.noProjectAccess.apiKey;
			const viewerKey = users.viewer.apiKey;
			const commenterKey = users.commenter.apiKey;
			const invalidTexId = ServiceHelper.generateUUIDString();

			const basicFailCases = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the teamspace does not exist', getRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: randomString }), false, templates.projectNotFound],
				['the Container does not exist', getRoute({ contId: randomString }), false, templates.containerNotFound],
				['the Texture does not exist', getRoute({ textureId: invalidTexId }), false, templates.textureNotFound],
				['the user is not a member of the teamspace', getRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: noProjAccKey }), false, templates.notAuthorized],
			];

			// Valid Texture tests
			const texFile = texData.texData;
			const validTextureCases = [
				['the texture is accessed (admin)', getRoute(), true, texFile],
				['the texture is accessed (viewer)', getRoute({ key: viewerKey }), true, texFile],
				['the texture is accessed (commenter)', getRoute({ key: commenterKey }), true, texFile],
			];

			return [
				...basicFailCases,
				...validTextureCases,
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body.toString()).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData())('Get texture', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testTextures();
});
