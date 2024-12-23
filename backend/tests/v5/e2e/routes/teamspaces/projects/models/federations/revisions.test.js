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

const { templates } = require(`${src}/utils/responseCodes`);

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

const models = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
			permissions: [{ user: users.viewer, permission: 'viewer' }, { user: users.commenter, permission: 'commenter' }],
			federate: true,
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(),
			permissions: [{ user: users.viewer, permission: 'viewer' }, { user: users.commenter, permission: 'commenter' }],
			federate: true,
		},
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
];

const container = models[2];
const anotherFed = models[1];

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);
	const customData = { starredModels: {
		[teamspace]: models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : [])),
	} };
	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], [teamspace], customData));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createUser(nobody),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
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
	const route = (
		teamspace,
		projectId = project.id,
		model = models[0]._id,
		revision = ServiceHelper.generateUUIDString()
	) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${model}/revisions/${revision}/files/original/info`
	describe('Get Federation MD5 Files', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user does not have access to the project', async () => {
			const res = await agent.get(`${route()}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`${route(teamspace, 'nelskfjdlsf')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the federation does not exist', async () => {
			const res = await agent.get(`${route(teamspace, project.id, 'sdlfkds')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.code).toEqual(templates.federationNotFound.code);
		});

		test('should succeed if correct parameters are sent', async () => {
			await agent.get(`${route()}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});
	})
}


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
