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
const ServiceHelper = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
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
		isFavourite: true,
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: ServiceHelper.generateRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
	},
];

const modelWithGroups = models[0];
const modelWithoutGroups = models[1];
const modelForImport = models[2];
const fed = models[3];

const groups = [
	ServiceHelper.generateGroup(teamspace, modelWithGroups._id),
	ServiceHelper.generateGroup(teamspace, modelWithGroups._id, false, true),
	ServiceHelper.generateGroup(teamspace, modelWithGroups._id, true, false),
];

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
		ServiceHelper.db.createGroups(teamspace, modelWithGroups._id, groups),
	]);
};

const testExportGroups = () => {
	const createRoute = (projectId = project.id, modelId = modelWithGroups._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/groups/export`;
	describe('Export groups', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.post(createRoute()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.post(`${createRoute()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.post(`${createRoute('dslfkjds')}?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.post(`${createRoute(project._id, 'dslfkjds')}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the container is actually a federation', async () => {
			const res = await agent.post(`${createRoute(project._id, fed._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the user does not have permissions to access the container', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.noProjectAccess.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should fail if the data is not of the right schema', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: 1 })
				.expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should fail if the groups array is empty', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: [] })
				.expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should give every groups the user requested', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.ok.status);
			expect(res.body).toEqual({ groups });
		});

		test('should give every groups the user requested (2)', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: [groups[0]._id] })
				.expect(templates.ok.status);
			expect(res.body).toEqual({ groups: [groups[0]] });
		});

		test('should return an empty array should the ids are not found', async () => {
			const res = await agent.post(`${createRoute(project._id, modelWithoutGroups._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.ok.status);
			expect(res.body).toEqual({ groups: [] });
		});
	});
};

const testImportGroups = () => {
	const createRoute = (projectId = project.id, modelId = modelForImport._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/groups/import`;
	const exportRoute = (projectId = project.id, modelId = modelForImport._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/groups/export`;
	describe('Import groups', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.post(createRoute()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.post(`${createRoute()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.post(`${createRoute('dslfkjds')}?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.post(`${createRoute(project._id, 'dslfkjds')}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the container is actually a federation', async () => {
			const res = await agent.post(`${createRoute(project._id, fed._id)}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.containerNotFound.status);
			expect(res.body.status).toEqual(templates.containerNotFound.status);
		});

		test('should fail if the user does not have permissions to access the container', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.noProjectAccess.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should fail if the data is not of the right schema', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: 1 })
				.expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should fail if the groups array is empty', async () => {
			const res = await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: [] })
				.expect(templates.invalidArguments.status);
			expect(res.body.status).toEqual(templates.invalidArguments.status);
		});

		test('should import every group successfully', async () => {
			await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups })
				.expect(templates.ok.status);
			const res = await agent.post(`${exportRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.ok.status);
			expect(res.body.groups).toEqual(groups);
		});

		test('should import every group successfully again', async () => {
			await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups })
				.expect(templates.ok.status);
			const res = await agent.post(`${exportRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: groups.map(({ _id }) => _id) })
				.expect(templates.ok.status);
			expect(res.body.groups).toEqual(groups);
		});

		test('should import sucessfully and only update groups that were noted', async () => {
			const changedGroup = { ...groups[0], name: ServiceHelper.generateRandomString() };
			const newGroup = ServiceHelper.generateGroup(teamspace, modelWithGroups._id, true, false);
			const importData = [changedGroup, newGroup];
			await agent.post(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: importData })
				.expect(templates.ok.status);
			const res = await agent.post(`${exportRoute()}?key=${users.tsAdmin.apiKey}`)
				.send({ groups: [...groups.map(({ _id }) => _id), newGroup._id] })
				.expect(templates.ok.status);

			expect(res.body.groups).toEqual([changedGroup, ...groups.slice(1), newGroup]);
		});
	});
};

describe('E2E routes/teamspaces/projects/containers', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testExportGroups();
	testImportGroups();
});
