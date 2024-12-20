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

const createBinary3DVectorData = (size, isLittleEndian = false) => {
	const vectorArray = [];
	for (let i = 0; i < size; i++) {
		const vec = [];
		vec.push(ServiceHelper.generateRandomNumber());
		vec.push(ServiceHelper.generateRandomNumber());
		vec.push(ServiceHelper.generateRandomNumber());
		vectorArray.push(vec);
	}

	const FLOAT_BYTE_SIZE = 4;
	const VEC_SIZE = 3 * FLOAT_BYTE_SIZE;
	const bufferLength = vectorArray.length * VEC_SIZE;

	const buffer = Buffer.alloc(bufferLength);
	const writeFloat32 = (!isLittleEndian ? buffer.writeFloatBE : buffer.writeFloatLE).bind(buffer);

	for (let i = 0; i < vectorArray.length; i++) {
		const faceOffset = i * VEC_SIZE;
		const vec = vectorArray[i];
		writeFloat32(vec[0], faceOffset);
		writeFloat32(vec[1], faceOffset + (1 * FLOAT_BYTE_SIZE));
		writeFloat32(vec[2], faceOffset + (2 * FLOAT_BYTE_SIZE));
	}

	return { vectorArray, buffer, bufferLength };
};

const createBinaryFaceData = (size, isLittleEndian = false) => {
	const faceArray = [];
	for (let i = 0; i < size; i++) {
		const face = [];
		face.push(ServiceHelper.generateRandomNumber(0, 4294967295));
		face.push(ServiceHelper.generateRandomNumber(0, 4294967295));
		face.push(ServiceHelper.generateRandomNumber(0, 4294967295));
		faceArray.push(face);
	}

	const INT_BYTE_SIZE = 4;
	const FACE_SIZE = 4 * INT_BYTE_SIZE;
	const bufferLength = faceArray.length * FACE_SIZE;

	const buffer = Buffer.alloc(bufferLength);
	const writeUint32 = (!isLittleEndian ? buffer.writeUInt32BE : buffer.writeUInt32LE).bind(buffer);

	for (let i = 0; i < faceArray.length; i++) {
		const faceOffset = i * FACE_SIZE;
		const face = faceArray[i];
		writeUint32(3, faceOffset); // First of the face is the number of indices in the face
		writeUint32(face[0], faceOffset + (1 * INT_BYTE_SIZE));
		writeUint32(face[1], faceOffset + (2 * INT_BYTE_SIZE));
		writeUint32(face[2], faceOffset + (3 * INT_BYTE_SIZE));
	}

	return { faceArray, buffer, bufferLength };
};

const createMeshData = () => {
	// Mock _blobRef
	const vectorData = createBinary3DVectorData(3, true);
	const faceData = createBinaryFaceData(3, true);

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
	const rootNode = ServiceHelper.generateBasicNode('transformation', revId, { matrix });
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

	// Create texture data
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

			const getMeshResult = () => {
				let result = '';

				result += `{{"matrix":${JSON.stringify(meshData.matrix)}`;
				result += ',"primitive":"3"';
				result += ',"vertices":[';

				for (let i = 0; i < meshData.vertData.length; i++) {
					const vert = meshData.vertData[i];

					if (i !== 0) {
						result += ',';
					}

					result += `${vert[0]},${vert[1]},${vert[2]}`;
				}

				result += '],"faces":[';

				for (let i = 0; i < meshData.faceData.length; i++) {
					const face = meshData.faceData[i];

					if (i !== 0) {
						result += ',';
					}

					result += `${face[0]},${face[1]},${face[2]}`;
				}

				result += ']}';

				return result;
			};

			// Basic tests
			const randomString = ServiceHelper.generateRandomString();
			const nobodyKey = users.nobody.apiKey;
			const noProjAccKey = users.noProjectAccess.apiKey;
			const viewerKey = users.viewer.apiKey;
			const commenterKey = users.commenter.apiKey;
			const invalidTexId = ServiceHelper.generateUUIDString();
			console.log(getRoute());
			const basicFailCases = [
				// ['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				// ['the teamspace does not exist', getRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				// ['the project does not exist', getRoute({ projectId: randomString }), false, templates.projectNotFound],
				// ['the Container does not exist', getRoute({ contId: randomString }), false, templates.containerNotFound],
				// ['the Mesh does not exist', getRoute({ meshId: invalidTexId }), false, templates.meshNotFound],
				// ['the user is not a member of the teamspace', getRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				// ['the user does not have access to the model', getRoute({ key: noProjAccKey }), false, templates.notAuthorized],
			];

			// Valid Texture tests
			const meshResult = getMeshResult();
			const validTextureCases = [
				['the texture is accessed (admin)', getRoute(), true, meshResult],
				// ['the texture is accessed (viewer)', getRoute({ key: viewerKey }), true, meshResult],
				// ['the texture is accessed (commenter)', getRoute({ key: commenterKey }), true, meshResult],
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
		describe.each(generateTestData())('Get mesh', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testMesh();
});
