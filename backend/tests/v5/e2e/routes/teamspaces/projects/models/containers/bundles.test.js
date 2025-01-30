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

let server;
let agent;

const createContainerObject = (teamspace, permissions) => {
	const _id = ServiceHelper.generateUUIDString();

	// Mock Unity Bundle
	const unityId = ServiceHelper.generateUUIDString();
	const unityData = ServiceHelper.generateRandomString();
	const unityBundle = {
		id: unityId,
		data: unityData,
	};

	// Mock Repo Bundle
	const repoId = ServiceHelper.generateUUIDString();
	const repoData = ServiceHelper.generateRandomString();
	const repoBundle = {
		id: repoId,
		data: repoData,
	};

	return {
		_id,
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
			permissions,
		},
		unityBundle,
		repoBundle,
	};
};

const generateTestEnvData = () => {
// - Container C1:
	// - Unity Bundle
	// - Repo Bundle

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
	const C1 = createContainerObject(
		teamspace,
		permissions,
	);

	const containers = {
		C1,
	};

	return {
		users,
		teamspace,
		project,
		containers,
	};
};

const setupTestData = async ({ users, teamspace, project, containers }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const contProms = Object.keys(containers).map((key) => {
		const proms = [];
		proms.push(ServiceHelper.db.createModel(
			teamspace,
			containers[key]._id,
			containers[key].name,
			containers[key].properties,
		));

		const { unityBundle } = containers[key];
		const { repoBundle } = containers[key];

		proms.push(ServiceHelper.db.createUnityBundle(
			teamspace,
			containers[key]._id,
			unityBundle.id,
			unityBundle.data,
		));

		proms.push(ServiceHelper.db.createRepoBundle(
			teamspace,
			containers[key]._id,
			repoBundle.id,
			repoBundle.data,
		));

		return proms;
	});

	const contIds = Object.keys(containers).map((key) => containers[key]._id);
	const modelIds = [...contIds];
	const projPromise = ServiceHelper.db.createProject(teamspace, project.id, project.name, modelIds);

	return Promise.all([
		...userProms,
		...contProms,
		projPromise,
	]);
};

const testAssetBundles = () => {
	describe('Get asset bundles', () => {
		const testEnvData = generateTestEnvData();
		const { users, teamspace, project, containers } = testEnvData;

		beforeAll(async () => {
			await setupTestData(testEnvData);
		});

		const unityPath = 'unitybundles';
		const repoPath = 'repobundles';

		const generateTestData = () => {
			const getContRoute = ({
				ts = teamspace,
				projectId = project.id,
				modelId = containers.C1._id,
				bundleId = containers.C1.unityBundle.id,
				path = unityPath,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${ts}/projects/${projectId}/containers/${modelId}/assets/${path}/${bundleId}?key=${key}`;

			// Basic tests
			const randomString = ServiceHelper.generateRandomString();
			const nobodyKey = users.nobody.apiKey;
			const noProjAccKey = users.noProjectAccess.apiKey;
			const viewerKey = users.viewer.apiKey;
			const commenterKey = users.commenter.apiKey;
			const invalidBundleId = ServiceHelper.generateUUIDString();

			const basicFailCasesUnity = [
				['the user does not have a valid session', getContRoute({ key: null }), false, templates.notLoggedIn],
				['the teamspace does not exist', getContRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				['the project does not exist', getContRoute({ projectId: randomString }), false, templates.projectNotFound],
				['the Container does not exist', getContRoute({ modelId: randomString }), false, templates.containerNotFound],
				['the Unity bundle does not exist', getContRoute({ bundleId: invalidBundleId }), false, templates.fileNotFound],
				['the user is not a member of the teamspace', getContRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getContRoute({ key: noProjAccKey }), false, templates.notAuthorized],
				['the bundle is of wrong type', getContRoute({ path: repoPath }), false, templates.fileNotFound],
			];

			const repoBundleId = containers.C1.repoBundle.id;
			const basicFailCasesRepo = [
				['the user does not have a valid session', getContRoute({ bundleId: repoBundleId, path: repoPath, key: null }), false, templates.notLoggedIn],
				['the teamspace does not exist', getContRoute({ ts: randomString, bundleId: repoBundleId, path: repoPath }), false, templates.teamspaceNotFound],
				['the project does not exist', getContRoute({ projectId: randomString, bundleId: repoBundleId, path: repoPath }), false, templates.projectNotFound],
				['the Container does not exist', getContRoute({ modelId: randomString, bundleId: repoBundleId, path: repoPath }), false, templates.containerNotFound],
				['the Unity bundle does not exist', getContRoute({ bundleId: invalidBundleId, path: repoPath }), false, templates.fileNotFound],
				['the user is not a member of the teamspace', getContRoute({ bundleId: repoBundleId, path: repoPath, key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getContRoute({ bundleId: repoBundleId, path: repoPath, key: noProjAccKey }), false, templates.notAuthorized],
				['the bundle is of wrong type', getContRoute({ bundleId: repoBundleId, path: repoPath }), false, templates.fileNotFound],
			];

			// Valid Unitybundle tests
			const unityFile = containers.C1.unityBundle.data;
			const validUnityBundleCases = [
				['the unity bundle is accessed (admin)', getContRoute(), true, unityFile],
				['the unity bundle is accessed (viewer)', getContRoute({ key: viewerKey }), true, unityFile],
				['the unity bundle is accessed (commenter)', getContRoute({ key: commenterKey }), true, unityFile],
			];

			// Valid Repobundle tests
			const repoFile = containers.C1.repoBundle.data;
			const validRepoBundleCases = [
				['the repo bundle is accessed (admin)', getContRoute({ bundleId: repoBundleId, path: repoPath }), true, repoFile],
				['the repo bundle is accessed (viewer)', getContRoute({ bundleId: repoBundleId, path: repoPath, key: viewerKey }), true, repoFile],
				['the repo bundle is accessed (commenter)', getContRoute({ bundleId: repoBundleId, path: repoPath, key: commenterKey }), true, repoFile],
			];

			return [
				...basicFailCasesUnity,
				...basicFailCasesRepo,
				...validUnityBundleCases,
				...validRepoBundleCases,
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
		describe.each(generateTestData())('Get asset bundles', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testAssetBundles();
});
