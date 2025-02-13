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

const { times } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const { DEFAULT_ROLES } = require(`${src}/models/roles.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

let server;
let agent;

const generateBasicData = () => {
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		normalUser: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	const teamspace = ServiceHelper.generateRandomString();

	const roles = times(10, () => ServiceHelper.generateRole());

	return {
		users,
		teamspace,
		roles,
	};
};

const setupData = async ({ users, teamspace, roles }) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(users.tsAdmin, [teamspace]),
		ServiceHelper.db.createUser(users.normalUser, [teamspace]),
		ServiceHelper.db.createUser(users.nobody, []),
		ServiceHelper.db.createRoles(teamspace, roles),
	]);
};

const testGetRoleList = () => {
	const basicData = generateBasicData();
	const { users, teamspace, roles } = basicData;
	beforeAll(async () => {
		await setupData(basicData);
	});

	const route = (key, ts = teamspace) => `/v5/teamspaces/${ts}/roles${key ? `?key=${key}` : ''}`;

	describe('Get role list', () => {
		describe.each([
			['user does not have a valid session', undefined, undefined, false, templates.notLoggedIn],
			['teamspace does not exist', users.tsAdmin.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', users.nobody.apiKey, undefined, false, templates.teamspaceNotFound],
			['user is a ts admin', users.tsAdmin.apiKey, undefined, true],
			['user is a member', users.normalUser.apiKey, undefined, true],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(route(key, ts)).expect(expectedStatus);
				if (success) {
					const resultData = res.body.roles
						.map((r) => (deleteIfUndefined({ ...r, _id: undefined, users: [] })));
					const expectedData = [...DEFAULT_ROLES, ...roles]
						.map((r) => (deleteIfUndefined({ ...r, _id: undefined, users: [] })));

					ServiceHelper.outOfOrderArrayEqual(resultData, expectedData);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testAddRole = () => {
	const basicData = generateBasicData();
	const { users, teamspace, roles } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const roleData = {
		name: ServiceHelper.generateRandomString(),
		color: DEFAULT_ROLES[0].color,
		users: [users.tsAdmin.user],
	};

	const getRolesRoute = (key, ts = teamspace) => `/v5/teamspaces/${ts}/roles${key ? `?key=${key}` : ''}`;
	const addRoleRoute = (key, ts = teamspace) => `/v5/teamspaces/${ts}/roles${key ? `?key=${key}` : ''}`;

	describe.each([
		['user does not have a valid session', undefined, undefined, roleData, false, templates.notLoggedIn],
		['teamspace does not exist', users.tsAdmin.apiKey, generateRandomString(), roleData, false, templates.teamspaceNotFound],
		['user is not a member of the teamspace', users.nobody.apiKey, undefined, roleData, false, templates.teamspaceNotFound],
		['user is not a teamspace admin', users.normalUser.apiKey, undefined, roleData, false, templates.notAuthorized],
		['user is a ts admin and data is valid', users.tsAdmin.apiKey, undefined, roleData, true],
		['name is missing', users.tsAdmin.apiKey, undefined, { ...roleData, name: undefined }, false, templates.invalidArguments],
		['name is taken', users.tsAdmin.apiKey, undefined, { ...roleData, name: roles[0].name }, false, templates.invalidArguments],
		['users include a non ts member', users.tsAdmin.apiKey, undefined, { ...roleData, users: [users.nobody.user] }, false, templates.invalidArguments],
	])('Create role', (desc, key, ts, data, success, expectedRes) => {
		test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.post(addRoleRoute(key, ts)).send(data).expect(expectedStatus);

			if (success) {
				expect(res.body?._id).not.toBeUndefined();
				const { _id } = res.body;
				const rolesRes = await agent.get(getRolesRoute(key, ts)).expect(templates.ok.status);
				const role = rolesRes.body.roles.find((r) => r._id === _id);
				expect(role).toEqual({ _id, ...data });
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	});

	test('should not allow two roles with the same name to be added', async () => {
		const name = generateRandomString();

		const [res1, res2] = await Promise.all([
			agent.post(addRoleRoute(users.tsAdmin.apiKey)).send({ name }),
			agent.post(addRoleRoute(users.tsAdmin.apiKey)).send({ name }),
		]);

		const res1Failed = (res1.status === templates.unknown.status && res2.status === templates.ok.status);
		const res2Failed = (res1.status === templates.ok.status && res2.status === templates.unknown.status);

		expect(res1Failed || res2Failed).toBe(true);
	});
};

const testUpdateRole = () => {
	const basicData = generateBasicData();
	const { users, teamspace, roles } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const roleData = { name: ServiceHelper.generateRandomString() };
	const updateRoleRoute = (key, roleId, ts = teamspace) => `/v5/teamspaces/${ts}/roles/${roleId}${key ? `?key=${key}` : ''}`;

	describe.each([
		['user does not have a valid session', undefined, undefined, roles[0]._id, roleData, false, templates.notLoggedIn],
		['teamspace does not exist', users.tsAdmin.apiKey, generateRandomString(), roles[0]._id, roleData, false, templates.teamspaceNotFound],
		['user is not a member of the teamspace', users.nobody.apiKey, undefined, roles[0]._id, roleData, false, templates.teamspaceNotFound],
		['user is not a teamspace admin', users.normalUser.apiKey, undefined, roles[0]._id, roleData, false, templates.notAuthorized],
		['user is a ts admin and data is valid', users.tsAdmin.apiKey, undefined, roles[0]._id, roleData, true],
		['role does not exist', users.tsAdmin.apiKey, undefined, generateRandomString(), roleData, false, templates.roleNotFound],
		['body is empty', users.tsAdmin.apiKey, undefined, roles[0]._id, { }, false, templates.invalidArguments],
		['name is taken', users.tsAdmin.apiKey, undefined, roles[0]._id, { name: roles[1].name }, false, templates.invalidArguments],
		['name is the same', users.tsAdmin.apiKey, undefined, roles[0]._id, { name: roles[0].name }, true],
		['users include a non ts member', users.tsAdmin.apiKey, undefined, roles[0]._id, { ...roleData, users: [users.nobody.user] }, false, templates.invalidArguments],
	])('Update role', (desc, key, ts, roleId, data, success, expectedRes) => {
		test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.patch(updateRoleRoute(key, roleId, ts)).send(data).expect(expectedStatus);

			if (!success) {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	});
};

const testDeleteRole = () => {
	const basicData = generateBasicData();
	const { users, teamspace, roles } = basicData;

	beforeAll(async () => {
		await setupData(basicData);
	});

	const roleData = { name: ServiceHelper.generateRandomString() };

	const deleteRoleRoute = (key, roleId, ts = teamspace) => `/v5/teamspaces/${ts}/roles/${roleId}${key ? `?key=${key}` : ''}`;
	const getRolesRoute = (key, ts = teamspace) => `/v5/teamspaces/${ts}/roles${key ? `?key=${key}` : ''}`;

	describe.each([
		['user does not have a valid session', undefined, undefined, roles[0]._id, roleData, false, templates.notLoggedIn],
		['teamspace does not exist', users.tsAdmin.apiKey, generateRandomString(), roles[0]._id, roleData, false, templates.teamspaceNotFound],
		['user is not a member of the teamspace', users.nobody.apiKey, undefined, roles[0]._id, roleData, false, templates.teamspaceNotFound],
		['user is not a teamspace admin', users.normalUser.apiKey, undefined, roles[0]._id, roleData, false, templates.notAuthorized],
		['user is a ts admin', users.tsAdmin.apiKey, undefined, roles[0]._id, roleData, true],
		['role does not exist', users.tsAdmin.apiKey, undefined, generateRandomString(), roleData, false, templates.roleNotFound],
	])('Delete role', (desc, key, ts, roleId, data, success, expectedRes) => {
		test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.delete(deleteRoleRoute(key, roleId, ts)).send(data).expect(expectedStatus);

			if (success) {
				const rolesRes = await agent.get(getRolesRoute(key, ts)).expect(templates.ok.status);
				const role = rolesRes.body.roles.find((r) => r._id === roleId);
				expect(role).toBeUndefined();
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetRoleList();
	testAddRole();
	testUpdateRole();
	testDeleteRole();
});
