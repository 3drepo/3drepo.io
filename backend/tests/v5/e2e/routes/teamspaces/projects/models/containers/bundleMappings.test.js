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

	// Mock Bundle Mapping
	const bundleId = ServiceHelper.generateUUIDString();
	const bundleData = { mockData: ServiceHelper.generateRandomString() };
	const bundle = {
		id: bundleId,
		data: bundleData,
	};

	return {
		_id,
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
			permissions,
		},
		bundle,
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

	return {
		users,
		teamspace,
		project,
		container,
	};
};

const setupTestData = async ({ users, teamspace, project, container }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const contProms = [];
	contProms.push(ServiceHelper.db.createModel(
		teamspace,
		container._id,
		container.name,
		container.properties,
	));

	const { bundle } = container;

	contProms.push(ServiceHelper.db.createBundleMapping(
		teamspace,
		container._id,
		bundle.id,
		JSON.stringify(bundle.data),
	));

	const modelIds = [container._id];
	const projPromise = ServiceHelper.db.createProject(teamspace, project.id, project.name, modelIds);

	return Promise.all([
		...userProms,
		...contProms,
		projPromise,
	]);
};

const testBundleMappings = () => {
	describe('Get bundle mapping', () => {
		const testEnvData = generateTestEnvData();
		const { users, teamspace, project, container } = testEnvData;

		beforeAll(async () => {
			await setupTestData(testEnvData);
		});

		const generateTestData = () => {
			const getContRoute = ({
				ts = teamspace,
				projectId = project.id,
				modelId = container._id,
				bundleId = container.bundle.id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${ts}/projects/${projectId}/containers/${modelId}/bundleMappings/${bundleId}?key=${key}`;

			// Basic tests
			const randomString = ServiceHelper.generateRandomString();
			const nobodyKey = users.nobody.apiKey;
			const noProjAccKey = users.noProjectAccess.apiKey;
			const viewerKey = users.viewer.apiKey;
			const commenterKey = users.commenter.apiKey;
			const invalidBundleId = ServiceHelper.generateUUIDString();

			const basicFailCases = [
				['the user does not have a valid session', getContRoute({ key: null }), false, templates.notLoggedIn],
				['the teamspace does not exist', getContRoute({ ts: randomString }), false, templates.teamspaceNotFound],
				['the project does not exist', getContRoute({ projectId: randomString }), false, templates.projectNotFound],
				['the Container does not exist', getContRoute({ modelId: randomString }), false, templates.containerNotFound],
				['the bundle mapping does not exist', getContRoute({ bundleId: invalidBundleId }), false, templates.fileNotFound],
				['the user is not a member of the teamspace', getContRoute({ key: nobodyKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getContRoute({ key: noProjAccKey }), false, templates.notAuthorized],
			];

			// Valid Unitybundle tests
			const mappingFile = container.bundle.data;
			const validCases = [
				['the bundle mapping is accessed (admin)', getContRoute(), true, mappingFile],
				['the bundle mapping is accessed (viewer)', getContRoute({ key: viewerKey }), true, mappingFile],
				['the bundle mapping is accessed (commenter)', getContRoute({ key: commenterKey }), true, mappingFile],
			];

			return [
				...basicFailCases,
				...validCases,
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
		describe.each(generateTestData())('Get bundle mappings', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testBundleMappings();
});
