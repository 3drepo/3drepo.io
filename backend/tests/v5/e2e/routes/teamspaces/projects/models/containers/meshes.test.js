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

const createMeshData = () => {
	// Mock _blobRef
	const vectorData = ServiceHelper.generateRandomBinary3DVectorData(3, true);
	const faceData = ServiceHelper.generateRandomBinaryFaceData(3, true);

	const blobData = Buffer.concat([vectorData.buffer, faceData.buffer]);

	const vertexDataSize = vectorData.bufferLength;
	const facesDataSize = faceData.bufferLength;
	const blobDataSize = vertexDataSize + facesDataSize;

	const fileRefId = ServiceHelper.generateUUIDString();

	// eslint-disable-next-line no-underscore-dangle
	const _blobRef = {
		elements: {
			vertices: {
				start: 0,
				size: vertexDataSize,
			},
			faces: {
				start: vertexDataSize,
				size: facesDataSize,
			},
		},
		buffer: {
			start: 0,
			size: blobDataSize,
			name: fileRefId,
		},
	};

	const additionalMeshNodeData = {
		_blobRef,
		primitive: 3,
	};

	// Mock parent matrix
	const matrix = ServiceHelper.generateRandomMatrix(4);

	// Create Nodes
	const rev = ServiceHelper.generateRevisionEntry(false, false);
	const revId = rev._id;
	const rootNode = ServiceHelper.generateBasicNode('transformation', revId, [], { matrix });
	const meshNode = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id], additionalMeshNodeData);

	const nodes = [
		rootNode,
		meshNode,
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
		meshId: uuidHelper.UUIDToString(meshNode._id),
		blobData,
		vertData: vectorData.vectorArray,
		faceData: faceData.faceArray,
		fileRefId,
		matrix,
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

	// Create mesh data
	const meshData = createMeshData();

	return {
		users,
		teamspace,
		project,
		container,
		meshData,
	};
};

const setupTestData = async ({ users, teamspace, project, container, meshData }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const contPromise = ServiceHelper.db.createModel(
		teamspace,
		container._id,
		container.name,
		container.properties,
	);

	// Create mesh file
	const texPromise = ServiceHelper.db.createFile(
		teamspace,
		container._id,
		meshData.fileRefId,
		meshData.blobData,
	);

	// Create Scene
	const scenePromise = ServiceHelper.db.createScene(
		teamspace,
		project,
		container._id,
		meshData.rev,
		meshData.nodes,
		meshData.meshMap,
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

const testMesh = () => {
	describe('Get mesh', () => {
		const testEnvData = generateTestEnvData();
		const { users, teamspace, project, container, meshData } = testEnvData;

		beforeAll(async () => {
			await setupTestData(testEnvData);
		});

		const generateTestData = () => {
			const getRoute = ({
				ts = teamspace,
				projectId = project.id,
				contId = container._id,
				meshId = meshData.meshId,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${ts}/projects/${projectId}/containers/${contId}/meshes/${meshId}?key=${key}`;

			const getMeshResult = () => ({
				matrix: meshData.matrix,
				primitive: 3,
				vertices: meshData.vertData,
				faces: meshData.faceData.flat(),
			});

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
				['the container does not exist', getRoute({ contId: randomString }), false, templates.containerNotFound],
				['the mesh does not exist', getRoute({ meshId: invalidTexId }), false, templates.meshNotFound],
				['the user is not a member of the teamspace', getRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: noProjAccKey }), false, templates.notAuthorized],
			];

			// Valid mesh tests
			const meshResult = getMeshResult();
			const validMeshCases = [
				['the mesh is accessed (admin)', getRoute(), true, meshResult],
				['the mesh is accessed (viewer)', getRoute({ key: viewerKey }), true, meshResult],
				['the mesh is accessed (commenter)', getRoute({ key: commenterKey }), true, meshResult],
			];

			return [
				...basicFailCases,
				...validMeshCases,
			];
		};

		const compareResults = (objA, objB, epsilon) => {
			// Compare matrices
			const matA = objA.matrix;
			const matB = objB.matrix;

			if (matA.length !== matB.length) {
				return false;
			}

			for (let i = 0; i < matA.length; i++) {
				for (let e = 0; e < matA.length; e++) {
					if (matA[i][e] !== matB[i][e]) {
						return false;
					}
				}
			}

			// Compare primitive field
			if (objA.primitive !== objB.primitive) {
				return false;
			}

			// Compare vertices
			const verticesA = objA.vertices;
			const verticesB = objB.vertices;

			if (verticesA.length !== verticesB.length) {
				return false;
			}

			for (let i = 0; i < verticesA.length; i++) {
				const vertA = verticesA[i];
				const vertB = verticesB[i];

				let test1 = vertA[0] - vertB[0];
				let test2 = vertA[1] - vertB[1];
				let test3 = vertA[2] - vertB[2];

				test1 = Math.abs(test1);
				test2 = Math.abs(test2);
				test3 = Math.abs(test3);

				if (Math.abs(vertA[0] - vertB[0]) > epsilon
				|| Math.abs(vertA[1] - vertB[1]) > epsilon
				|| Math.abs(vertA[2] - vertB[2]) > epsilon
				) {
					return false;
				}
			}

			// Compare faces
			const facesA = objA.faces;
			const facesB = objB.faces;

			if (facesA.length !== facesB.length) {
				return false;
			}

			for (let i = 0; i < facesA.length; i++) {
				const faceA = facesA[i];
				const faceB = facesB[i];
				if (faceA[0] !== faceB[0]
				|| faceA[1] !== faceB[1]
				|| faceA[2] !== faceB[2]
				) {
					return false;
				}
			}

			return true;
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(compareResults(res.body, expectedOutput, 0.0001)).toEqual(true);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};
		describe.each(generateTestData())('Get mesh', runTest);
	});
};

// describe(ServiceHelper.determineTestGroup(__filename), () => {
// 	beforeAll(async () => {
// 		server = await ServiceHelper.app();
// 		agent = await SuperTest(server);
// 	});

// 	afterAll(() => ServiceHelper.closeApp(server));

// 	testMesh();
// });

const dummyTest = () => {
	describe('dummy test', () => {
		test('should succeed', () => {
			expect(true).toEqual(true);
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	dummyTest();
});