/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const { db, determineTestGroup, generateUserCredentials, generateRandomString, generateAuditAction, closeApp, app } = require('../../../helper/services');
const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const { templates } = require(`${src}/utils/responseCodes`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

let server;
let agent;

const generateBasicData = () => ({
	users: {
		tsAdmin: generateUserCredentials(),
		nobody: generateUserCredentials(),
		normalUser: generateUserCredentials(),
	},
	teamspace: generateRandomString(),
	actions: times(10, () => generateAuditAction()).sort((a) => a.timestamp),
});

const setupBasicData = async (users, teamspace, actions) => {
	await db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const actionProms = actions.map((action) => db.createAuditAction(teamspace, action));

	await Promise.all([
		...userProms,
		...actionProms,
	]);
};

const testGetAuditLogArchive = () => {
	describe('Get audit log archive', () => {
		const { users, teamspace, actions } = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, actions);
		});

		const route = (key, ts = teamspace, query) => `/v5/teamspaces/${ts}/settings/activities/archive${key ? `?key=${key}${query ? `&from=${query.from}&to=${query.to}` : ''}` : ''}`;

		describe.each([
			['user does not have a valid session', undefined, undefined, undefined, false, templates.notLoggedIn],
			['teamspace does not exist', users.tsAdmin.apiKey, generateRandomString(), undefined, false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', users.nobody.apiKey, undefined, undefined, false, templates.teamspaceNotFound],
			['user is not a teamspace admin', users.normalUser.apiKey, undefined, undefined, false, templates.notAuthorized],
			['user is a teamspace admin', users.tsAdmin.apiKey, undefined, undefined, true],
			['query is invalid', users.tsAdmin.apiKey, undefined, { from: Date.now() + 10000, to: Date.now() - 10000 }, false, templates.invalidArguments],
		])('', (desc, key, ts, query, success, expectedRes) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;

				const res = await agent.get(route(key, ts, query))
					.expect(expectedStatus);

				if (success) {
					expect(res.headers['content-disposition']).toEqual('attachment;filename=audit.zip');
					expect(res.headers['content-type']).toEqual('application/zip');
					expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
					const { password } = Mailer.sendEmail.mock.calls[0][2];
					expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.AUDIT.name,
						users.tsAdmin.basicData.email, { firstName: users.tsAdmin.basicData.firstName, password });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await app();
		agent = await SuperTest(server);
	});
	afterAll(() => closeApp(server));
	testGetAuditLogArchive();
});
