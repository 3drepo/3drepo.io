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
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { federate: true },
	},
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

describe('E2E routes/teamspaces/projects/containers', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetContainerList();
});
