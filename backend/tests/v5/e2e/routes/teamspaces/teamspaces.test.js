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

const ServiceHelper = require('../../../helper/services');
const { src, srcV4 } = require('../../../helper/path');

const DbHandler = require(`${src}/handler/db`);
const { createTeamSpaceRole } = require(`${srcV4}/models/role`);

let server;

const testUser = {
	user: 'user1',
	password: 'someComplicatedPassword!234',
};

const testUserTSAccess = [
	{ name: 'ts1', isAdmin: true },
	{ name: 'ts2', isAdmin: false },
	{ name: 'ts3', isAdmin: true },
];

const setupData = async () => {
	const adminDB = await DbHandler.getAuthDB();

	await Promise.all(testUserTSAccess.map(async ({ name, isAdmin }) => {
		await adminDB.addUser(
			name,
			name,
			{
				customData: {
					permissions: isAdmin ? [{ user: testUser.user, permissions: 'teamspace_admin' }] : [],
				},
				roles: [],
			},
		);
		await createTeamSpaceRole(name);
	}));
	await adminDB.addUser(
		testUser.user,
		testUser.password,
		{
			customData: {},
			roles: testUserTSAccess.map(({ name }) => ({ db: name, role: 'team_member' })),
		},
	);
};

const testGetTeamspaceList = () => {
	describe('Get teamspace list', () => {
		test('should fail without a valid session', () => {});
		test('give return a teamspace list if the user has a valid session', () => {});
	});
};

describe('E2E routes/teamspaces', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetTeamspaceList();
});
