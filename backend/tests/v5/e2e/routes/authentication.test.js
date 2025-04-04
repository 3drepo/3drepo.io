/**
 *  Copyright (C) 2025 3D Repo Ltd
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
const ServiceHelper = require('../../helper/services');
const { src } = require('../../helper/path');
const SessionTracker = require('../../helper/sessionTracker');

const { templates, createResponseCode } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const testAuthenticate = () => {
	describe('Get authenticate link', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const redirectURI = ServiceHelper.generateRandomString();
		let sessionedAgent;

		beforeAll(async () => {
			await ServiceHelper.db.createUser(testUser);
			sessionedAgent = SessionTracker(agent);
			await sessionedAgent.login(testUser);
		});

		const generateURL = (redirect = redirectURI) => `/v5/authentication/authenticate?${redirect ? `redirectUri=${redirectURI}` : ''}`;

		describe.each([
			['the user is not logged in', false, generateURL(), true],
			['redirectURL is not provided', false, generateURL(false), false, createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required')],
			['the user already logged in', true, generateURL(), false, templates.alreadyLoggedIn],
		])('', (desc, useSessionedAgent, url, success, err = templates.ok) => {
			test(`Should ${success ? 'respond with the link' : `fail with ${err.code}`} if ${desc}`, async () => {
				const testAgent = useSessionedAgent ? sessionedAgent : agent;
				const res = await testAgent.get(url).expect(err.status);
				if (success) {
					expect(res.body).toEqual({ link: expect.any(String) });
				} else {
					expect(res.body).toEqual(expect.objectContaining(err));
				}
			});
		});
	});
};

const testAuthenticateAgainstTeamspace = () => {
	describe('Get authenticate by teamspace link', () => {
		const tsUser = ServiceHelper.generateUserCredentials();
		const noAccessUser = ServiceHelper.generateUserCredentials();
		const teamspace = ServiceHelper.generateRandomString();
		const redirectURI = ServiceHelper.generateRandomString();

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(tsUser),
				ServiceHelper.db.createUser(noAccessUser),
			]);

			await ServiceHelper.db.createTeamspace(teamspace, [tsUser.user], undefined, false);
		});

		const generateURL = (authTeamspace = teamspace, redirect = redirectURI) => `/v5/authentication/authenticate/${authTeamspace}?${redirect ? `redirectUri=${redirectURI}` : ''}`;

		describe.each([
			['the user is not logged in', undefined, generateURL(), false, templates.notLoggedIn],
			['redirectURL is not provided', tsUser, generateURL(teamspace, false), false, createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required')],
			['teamspace is not found', tsUser, generateURL(ServiceHelper.generateRandomString()), false, templates.teamspaceNotFound],
			['the user is not a member of the teamspace', noAccessUser, generateURL(), false, templates.teamspaceNotFound],
			['the user is a member of the teamspace', tsUser, generateURL(), true],
		])('', (desc, user, url, success, err = templates.ok) => {
			test(`Should ${success ? 'respond with the link' : `fail with ${err.code}`} if ${desc}`, async () => {
				const testAgent = user ? SessionTracker(agent) : agent;
				if (user) {
					await testAgent.login(user);
				}
				const res = await testAgent.get(url).expect(err.status);
				if (success) {
					expect(res.body).toEqual({ link: expect.any(String) });
				} else {
					expect(res.body).toEqual(expect.objectContaining(err));
				}
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	testAuthenticate();
	testAuthenticateAgainstTeamspace();

	afterAll(() => ServiceHelper.closeApp(server));
});
