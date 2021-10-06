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

const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
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
		isFavourite: true,
		permissions: [{ user: users.viewer, permission: 'viewer' }, { user: users.commenter, permission: 'commenter' }],
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

const revisions = [
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(true),
];

const modelWithRev = models[0];
const modelWithoutRev = models[1];
const federation = models[2];

const latestRevision = revisions.filter((rev) => !rev.void)
	.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));

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
		...revisions.map((revision) => ServiceHelper.db.createRevision(teamspace, modelWithRev._id, revision)),
	]);
};

const testGetContainerList = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers`;
	describe('Get container list', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should return empty array if the user has no access to any of the containers', async () => {
			const res = await agent.get(`${route}?key=${users.noProjectAccess.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ containers: [] });
		});

		test('should return the list of containers if the user has access', async () => {
			const res = await agent.get(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({
				containers: models.flatMap(({ _id, name, properties, isFavourite }) => (properties?.federate ? []
					: { _id, name, role: 'admin', isFavourite: !!isFavourite })),
			});
		});
	});
};

const formatToStats = (settings, revCount, latestRev) => ({
	type: settings.type,
	code: settings.properties.code,
	status: settings.status,
	units: settings.properties.unit,
	revisions: {
		total: revCount,
		lastUpdated: latestRev.timestamp ? latestRev.timestamp.getTime() : undefined,
		latestRevision: latestRev.tag || latestRev._id,
	},
});

const testGetContainerStats = () => {
	const route = (containerId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerId}/stats`;
	describe('Get container stats', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(modelWithRev._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${modelWithRev._id}/stats?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}?key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the model is a federation', async () => {
			const res = await agent.get(`${route(federation._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the container does not exist', async () => {
			const res = await agent.get(`${route('jibberish')}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});
		test('should return the container stats correctly if the user has access', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			const nonVoidRevisionCount = revisions.filter((rev) => !rev.void).length;
			expect(res.body).toEqual(formatToStats(modelWithRev.properties, nonVoidRevisionCount, latestRevision));
		});

		test('should return the container stats correctly if the user has access (no revisions)', async () => {
			const res = await agent.get(`${route(modelWithoutRev._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatToStats(modelWithoutRev.properties, 0, {}));
		});
	});
};

const testAddContainer = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers`;
	describe('Add container', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.post(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.post(`${route}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if container name already exists', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.duplicateModelName.status).send({ name: models[0].name, unit: 'mm', type: 'a' });
			expect(res.body.code).toEqual(templates.duplicateModelName.code);
		});

		test('should fail if name is not a string', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: 123, unit: 'mm', type: 'a' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if name invalid', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: '!"£$%^', unit: 'mm', type: 'a' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if name missing', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ unit: 'mm', type: 'a' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if unit invalid', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: ServiceHelper.generateRandomString(), unit: 123, type: 'a' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if unit missing', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: ServiceHelper.generateRandomString(), type: 'a' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if type invalid', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: ServiceHelper.generateRandomString(), unit: 'mm', type: 123 });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if type missing', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.invalidArguments.status).send({ name: ServiceHelper.generateRandomString(), unit: 'mm' });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should return new container ID if the user has permissions', async () => {
			const res = await agent.post(`${route}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status).send({ name: 'container name', unit: 'mm', type: 'a' });
			expect(isUUIDString(res.body._id)).toEqual(true);
		});
	});
};

const testDeleteContainer = () => {
	const route = (containerId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerId}`;
	describe('Delete container', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.delete(route(models[0]._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.delete(`${route(models[0]._id)}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if container does not exist', async () => {
			const res = await agent.delete(`${route('badId')}?key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should return ok on success', async () => {
			const res = await agent.delete(`${route(models[0]._id)}?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({});
		});
	});
};

const testAppendFavourites = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/favourites`;
	describe('Append Favourite Containers', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.patch(route)
				.expect(templates.notLoggedIn.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.patch(`${route}?key=${nobody.apiKey}`)
				.expect(templates.teamspaceNotFound.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.patch(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/favourites?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user has no access to one or more containers', async () => {
			const res = await agent.patch(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the list contains a federation', async () => {
			const res = await agent.patch(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [federation._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided is empty', async () => {
			const res = await agent.patch(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should append a new container to the user favourites', async () => {
			await agent.patch(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status).send({ containers: [models[1]._id] });
		});
	});
};

const testDeleteFavourites = () => {
	const route = `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/favourites`;
	describe('Remove Favourite Containers', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.delete(route)
				.expect(templates.notLoggedIn.status).send({ containers: [models[0]._id] });
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.delete(`${route}?key=${nobody.apiKey}`)
				.expect(templates.teamspaceNotFound.status).send({ containers: [models[0]._id] });
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.delete(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/favourites?key=${users.tsAdmin.apiKey}`)
				.expect(templates.projectNotFound.status).send({ containers: [models[0]._id] });
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user has no access to one or more containers', async () => {
			const res = await agent.delete(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [models[1]._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the list contains a federation', async () => {
			const res = await agent.delete(`${route}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [federation._id] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the favourites list provided is empty', async () => {
			const res = await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.invalidArguments.status).send({ containers: [] });
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should remove a container from the user favourites', async () => {
			await agent.delete(`${route}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status).send({ containers: [models[0]._id] });
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
	testGetContainerList();
	testGetContainerStats();
	testAppendFavourites();
	testDeleteFavourites();
	testAddContainer();
	testDeleteContainer();
});
