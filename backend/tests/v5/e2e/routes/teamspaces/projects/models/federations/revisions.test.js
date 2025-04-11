/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const CryptoJs = require('crypto-js');
const { outOfOrderArrayEqual } = require('../../../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
	viewer: ServiceHelper.generateUserCredentials(),
	commenter: ServiceHelper.generateUserCredentials(),
};

const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();

const project = {
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const containers = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
			permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
		},
	},
];

const containersNoRev = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
			permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
		},
	},
];

const models = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
			permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			federate: true,
			subModels: containers.map((model) => ({ _id: model._id })),
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelTypes.FEDERATION),
			permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			federate: true,
			subModels: containersNoRev.map((model) => ({ _id: model._id })),
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
			federate: true,
			subModels: [],
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
		},
	},
];

const container = models[3];
const anotherFed = models[1];
const conRevisions = ServiceHelper.generateRevisionEntry();

const setupData = async () => {
	const customData = { starredModels: {
		[teamspace]: models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : [])),
	} };
	const { tsAdmin, ...otherUsers } = users;
	await ServiceHelper.db.createUser(tsAdmin, [], customData);
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(otherUsers).map(
		(key) => ServiceHelper.db.createUser(users[key], [teamspace], customData));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	const containerProms = containers.map((subModel) => ServiceHelper.db.createModel(
		teamspace,
		subModel._id,
		subModel.name,
		subModel.properties,
	));
	const containerNoRevProms = containersNoRev.map((subModel) => ServiceHelper.db.createModel(
		teamspace,
		subModel._id,
		subModel.name,
		subModel.properties,
	));
	const revisionsProms = containers.map((subModel) => ServiceHelper.db.createRevision(
		teamspace,
		project.id,
		subModel._id,
		conRevisions,
		modelTypes.CONTAINER,
	));

	const projectModels = [
		...models.map(({ _id }) => _id),
		...containers.map(({ _id }) => _id),
		...containerNoRevProms.map(({ _id }) => _id),
	];

	return Promise.all([
		...userProms,
		...modelProms,
		...containerProms,
		...containerNoRevProms,
		...revisionsProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, projectModels),
		ServiceHelper.db.createUser(nobody),
	]);
};

const testNewRevision = () => {
	const route = (
		ts = teamspace,
		projectId = project.id,
		model = models[0]._id,
	) => `/v5/teamspaces/${ts}/projects/${projectId}/federations/${model}/revisions`;
	describe('New federation upload', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.post(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.post(`${route()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});
		test('should fail if the user does not have access to the project', async () => {
			const res = await agent.post(`${route()}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user is a viewer', async () => {
			const res = await agent.post(`${route()}?key=${users.viewer.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user is a commenter', async () => {
			const res = await agent.post(`${route()}?key=${users.commenter.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.post(`${route(teamspace, 'nelskfjdlsf')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the federation does not exist', async () => {
			const res = await agent.post(`${route(teamspace, project.id, 'sdlfkds')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.code).toEqual(templates.federationNotFound.code);
		});

		test('should fail if the federation is actually a container', async () => {
			const res = await agent.post(`${route(teamspace, project.id, container._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.code).toEqual(templates.federationNotFound.code);
		});
		test('should succeed if correct parameters are sent', async () => {
			await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.send({ containers: [container._id] })
				.expect(templates.ok.status);
		});

		test('should fail if containers array is empty', async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.send({ containers: [] })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if containers is not the right type', async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.send({ containers: true })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if container ids does not exist in the project', async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.send({ containers: [ServiceHelper.generateUUIDString()] })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if container id provided is a federation', async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.send({ containers: [container._id, anotherFed._id] })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if containers field is missing', async () => {
			const res = await agent.post(`${route()}?key=${users.tsAdmin.apiKey}`)
				.send({ tag: 'abc' })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});
	});
};

const testGetFederationMD5Hash = () => {
	const generateTestData = () => {
		const parameters = {
			ts: teamspace,
			projectId: project.id,
			modelId: models[0]._id,
			key: users.tsAdmin.apiKey,
			response: { revisions: [] },
		};
		const viewerResponse = { revisions: [{
			container: containers[0]._id,
			tag: conRevisions.tag,
			timestamp: new Date(conRevisions.timestamp).getTime(),
			hash: CryptoJs.MD5(Buffer.from(conRevisions.rFile[0])).toString(),
			filename: conRevisions.rFile[0],
			size: 20,
		}] };
		const adminResponse = { revisions: containers.map((model) => ({
			container: model._id,
			tag: conRevisions.tag,
			timestamp: new Date(conRevisions.timestamp).getTime(),
			hash: CryptoJs.MD5(Buffer.from(conRevisions.rFile[0])).toString(),
			filename: conRevisions.rFile[0],
			size: 20,
		})) };

		return [
			['there is no valid session key.', { ...parameters, key: null }, false, templates.notLoggedIn],
			['the user is not a member of the teamspace.', { ...parameters, key: nobody.apiKey }, false, templates.teamspaceNotFound],
			['the user does not have access to the project.', { ...parameters, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
			['the teamspace does not exist.', { ...parameters, ts: ServiceHelper.generateUUIDString() }, false, templates.teamspaceNotFound],
			['the federation does not exist.', { ...parameters, modelId: ServiceHelper.generateUUIDString() }, false, templates.federationNotFound],
			['the viewer access it and return just that information.', { ...parameters, key: users.viewer.apiKey, response: viewerResponse }, true],
			['the admin access it and return all the information.', { ...parameters, response: adminResponse }, true],
			['the admin access it but the federation is empty.', { ...parameters, modelId: models[2]._id }, true],
			['the admin access it but the containers in federation have no revisions.', { ...parameters, modelId: models[1]._id }, true],
		];
	};

	const runTest = (description, parameters, success, error) => {
		const route = ({ ts, projectId, modelId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/federations/${modelId}/revisions/files/original/info${key ? `?key=${key}` : ''}`;

		test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${description}`, async () => {
			const expectedStatus = success ? templates.ok.status : error.status;
			const res = await agent.get(`${route(parameters)}`).expect(expectedStatus);

			if (success) {
				const result = JSON.parse(res.text);
				outOfOrderArrayEqual(result.revisions, parameters.response.revisions);
			} else {
				expect(res.body.code).toEqual(error.code);
			}
		});
	};

	describe.each(generateTestData())('Get Federation MD5 Files', runTest);
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => Promise.all([
		ServiceHelper.queue.purgeQueues(),
		ServiceHelper.closeApp(server),
	]));

	testNewRevision();
	testGetFederationMD5Hash();
});
