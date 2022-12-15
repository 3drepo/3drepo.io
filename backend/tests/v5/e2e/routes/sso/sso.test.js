/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { generateRandomString, generateRandomURL } = require('../../../helper/services');

jest.mock('../../../../../src/v5/services/sso/aad', () => ({
	...jest.requireActual('../../../../../src/v5/services/sso/aad'),
	getUserDetails: jest.fn(),
}));
const Aad = require('../../../../../src/v5/services/sso/aad');
const { providers } = require('../../../../../src/v5/services/sso/sso.constants');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const session = require('supertest-session');

let testSession;

const userEmail = `${generateRandomString()}@email.com`;
const testUser = ServiceHelper.generateUserCredentials();
const ssoUserId = generateRandomString();
const userEmailSso = `${generateRandomString()}@email.com`;
const testUserSso = ServiceHelper.generateUserCredentials();

const setupData = async () => {
	await ServiceHelper.db.createUser(testUser, [], { email: userEmail });
	await ServiceHelper.db.createUser(testUserSso, [], { email: userEmailSso,
		sso: { type: providers.AAD, id: ssoUserId } });
};

const testUnlink = () => {
	describe('Unlink', () => {
		const redirectUri = generateRandomURL();

		test('should fail without a valid session or an API key', async () => {
			await agent.post(`/v5/sso/unlink?redirectUri=${redirectUri}`)
				.expect(templates.notAuthorized.status);
		});

		test('should fail without a valid session with an API key', async () => {
			await agent.post(`/v5/sso/unlink?redirectUri=${redirectUri}&key=${testUserSso.apiKey}`)
				.expect(templates.notAuthorized.status);
		});

		test('should fail if user is not SSO', async () => {
			await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			await testSession.post('/v5/sso/unlink')
				.expect(templates.invalidArguments.status);
			await testSession.post('/v5/logout/');
		});

		describe('With valid authentication', () => {
			beforeAll(async () => {
				Aad.getUserDetails.mockResolvedValueOnce({ email: userEmailSso, id: ssoUserId });
				await testSession.get(`/v5/sso/aad/authenticate-post?state=${encodeURIComponent(JSON.stringify({ redirectUri: generateRandomURL() }))}`);
			});

			afterAll(async () => {
				// link user back to SSO
				Aad.getUserDetails.mockResolvedValueOnce({ email: userEmailSso, id: generateRandomString() });
				await testSession.get(`/v5/sso/aad/link-post?state=${encodeURIComponent(JSON.stringify({ redirectUri: generateRandomURL() }))}`)
					.expect(302);
				await testSession.post('/v5/logout/');
			});

			test('should fail if a new password is not provided', async () => {
				const res = await testSession.post('/v5/sso/unlink')
					.expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if a weak new password is provided', async () => {
				const res = await testSession.post('/v5/sso/unlink').send({ password: generateRandomString(1) })
					.expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should unlink the user', async () => {
				await testSession.post('/v5/sso/unlink').send({ password: generateRandomString() })
					.expect(templates.ok.status);
				const newProfileRes = await testSession.get('/v5/user');
				expect(newProfileRes.body).not.toHaveProperty('isSso');
			});
		});
	});
};

const app = ServiceHelper.app();

describe('E2E routes/sso', () => {
	beforeAll(async () => {
		server = app;
		agent = await SuperTest(server);
		testSession = session(app);
		await setupData();
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testUnlink();
});
