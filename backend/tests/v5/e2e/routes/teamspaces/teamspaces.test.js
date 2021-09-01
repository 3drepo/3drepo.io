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
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

// This is the user being used for tests
const testUser = ServiceHelper.generateUserCredentials();
const testUser2 = ServiceHelper.generateUserCredentials();

// This is the list of teamspaces the user has access to
const testUserTSAccess = [
	{ name: ServiceHelper.generateRandomString(), isAdmin: true },
	{ name: ServiceHelper.generateRandomString(), isAdmin: false },
	{ name: ServiceHelper.generateRandomString(), isAdmin: true },
];

// This is the list of teamspaces the user has access to
const breakingTSAccess = { name: ServiceHelper.generateRandomString(), isAdmin: true };

const setupData = async () => {
	await Promise.all(testUserTSAccess.map(
		({ name, isAdmin }) => ServiceHelper.db.createTeamspace(name, isAdmin ? [testUser.user] : []),
	));

	await ServiceHelper.db.createTeamspace(breakingTSAccess.name, [testUser2.user], true);
	await ServiceHelper.db.createUser(
		testUser,
		testUserTSAccess.map(({ name }) => name),
	);
	await ServiceHelper.db.createUser(
		testUser2,
		[breakingTSAccess.name],
	);
};

const testGetTeamspaceList = () => {
	describe('Get teamspace list', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get('/v5/teamspaces/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});
		test('give return a teamspace list if the user has a valid session', async () => {
			const res = await agent.get(`/v5/teamspaces/?key=${testUser.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ teamspaces: testUserTSAccess });
		});

		test('should safely catch error if there is an internal error', async () => {
			const res = await agent.get(`/v5/teamspaces/?key=${testUser2.apiKey}`).expect(templates.unknown.status);
			expect(res.body.code).toEqual(templates.unknown.code);
		});
	});
};

describe('E2E routes/teamspaces', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetTeamspaceList();
});
