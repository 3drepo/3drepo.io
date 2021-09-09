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

const createRandomModelProperties = () => ({
	properties: {
		code: ServiceHelper.generateUUIDString(),
		unit: 'm',
	},
	type: ServiceHelper.generateUUIDString(),
	timestamp: Date.now(),
	status: 'ok',
});

const models = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		isFavourite: true,
		properties: createRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: createRandomModelProperties(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...createRandomModelProperties(), federate: true },
	},
];

const modelWithRev = models[0];
const modelWithoutRev = models[1];
const federation = models[2];

const revisions = [
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(),
	ServiceHelper.generateRevisionEntry(true),
];

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
		ServiceHelper.db.createRevisions(teamspace, modelWithRev._id, revisions),
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

		test('should fail if the container doesn\'t exist', async () => {
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

const formatRevisions = (revs, includeVoids = false) => {
	let formattedRevisions = revs;

	if (!includeVoids) {
		formattedRevisions = formattedRevisions.filter((rev) => !rev.void);
	}

	formattedRevisions = formattedRevisions.map((rev) => ({ ...rev, timestamp: rev.timestamp.toISOString() }))
		.sort((a, b) => b.timestamp - a.timestamp);

	return formattedRevisions;
};

const testGetRevisions = () => {
	const route = (containerId, showVoid = false) => `/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerId}/revisions?showVoid=${showVoid}`;
	describe('Get container revisions', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(route(modelWithRev._id, false)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}&key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects/dflkdsjfs/containers/${modelWithRev._id}/revisions?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the user does not have access to the container', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}&key=${users.noProjectAccess.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the model is a federation', async () => {
			const res = await agent.get(`${route(federation._id)}&key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should fail if the container doesn\'t exist', async () => {
			const res = await agent.get(`${route('jibberish')}&key=${users.tsAdmin.apiKey}`).expect(templates.containerNotFound.status);
			expect(res.body.code).toEqual(templates.containerNotFound.code);
		});

		test('should return non void container revisions correctly if the user has access', async () => {
			const res = await agent.get(`${route(modelWithRev._id)}&key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatRevisions(revisions));
		});

		test('should return all container revisions correctly if the user has access', async () => {
			const res = await agent.get(`${route(modelWithRev._id, true)}&key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(formatRevisions(revisions, true));
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
	testGetRevisions();
});
