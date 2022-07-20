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
const { generateRandomNumber, generateRandomString } = require('../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;
const tsAdmin = ServiceHelper.generateUserCredentials();
const normalUser = ServiceHelper.generateUserCredentials();

const teamspace = { name: ServiceHelper.generateRandomString() };
const noTemplatesTS = { name: ServiceHelper.generateRandomString() };

const teamspaces = [teamspace, noTemplatesTS];

const setupData = async () => {
	await Promise.all(teamspaces.map(
		({ name }) => ServiceHelper.db.createTeamspace(name, [tsAdmin.user], false),
	));

	await Promise.all([
		ServiceHelper.db.createUser(
			tsAdmin,
			[...teamspaces.map(({ name }) => name)],
		),
		ServiceHelper.db.createUser(
			normalUser,
			[teamspace.name],
		),
	]);
};

const testAddTemplate = () => {
	const route = (key, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates${key ? `?key=${key}` : ''}`;
	describe.each([
		['user does not have a valid session', undefined, undefined, false, templates.notLoggedIn],
		['user is not a teamspace admin', normalUser.apiKey, undefined, false, templates.notAuthorized],
		['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
		['user is not a member of the teamspace', normalUser.apiKey, noTemplateTS.name, false, templates.teamspaceNotFound],
		['user is a ts admin and there is a valid template', tsAdmin.apiKey, undefined, true, generateTemplate()],
	])('Add template', (desc, key, ts, success, expectedRes) => {
		test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const res = await agent.post(route(key, ts)).expect(expectedRes.status);
			if (success) {
				expect(res.body?._id).not.toBeUndefined();
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	});
};

describe('E2E routes/teamspaces/settings', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testAddTemplate();
});
