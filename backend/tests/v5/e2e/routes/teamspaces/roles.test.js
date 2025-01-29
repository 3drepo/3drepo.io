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

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const [tsAdmin, normalUser, nobody] = times(3, ServiceHelper.generateUserCredentials);

const teamspace = { name: ServiceHelper.generateRandomString() };

const roles = times(10, () => ({
	_id: ServiceHelper.generateRandomString(), color: ServiceHelper.generateRandomString(),
}));

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace.name, [tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(
			tsAdmin,
			[teamspace.name],
		),
		ServiceHelper.db.createUser(
			normalUser,
			[teamspace.name],
		),
		ServiceHelper.db.createUser(
			nobody,
			[],
		),
		ServiceHelper.db.createRoles(teamspace.name, roles),
	]);
};

const testGetRoleList = () => {
	const route = (key, ts = teamspace.name) => `/v5/teamspaces/${ts}/roles${key ? `?key=${key}` : ''}`;
	describe('Get role list', () => {
		describe.each([
			['user does not have a valid session', undefined, undefined, false, templates.notLoggedIn],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', nobody.apiKey, undefined, false, templates.teamspaceNotFound],
			['user is a ts admin', tsAdmin.apiKey, undefined, true],
			['user is a member', normalUser.apiKey, undefined, true],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(route(key, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body.roles).toEqual(expect.arrayContaining(roles));
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetRoleList();
});
