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
const SessionTracker = require('../../../helper/sessionTracker');
const { src } = require('../../../helper/path');
const { generateRandomString, generateRandomURL } = require('../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const testUnlink = () => {
	const testUser = ServiceHelper.generateUserCredentials();
	const testUserSso = ServiceHelper.generateUserCredentials();

	describe('Unlink', () => {
		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser, []),
				ServiceHelper.db.createUser(testUserSso, []),
			]);
		});

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
			const testSession = SessionTracker(agent);
			await testSession.login(testUser.user, testUser.password);
			await testSession.post('/v5/sso/unlink')
				.expect(templates.invalidArguments.status);
		});

		describe('With valid authentication', () => {
			let testSession;
			beforeAll(async () => {
				testSession = SessionTracker(agent);
				await testSession.login(testUserSso.user, testUserSso.password);
				await ServiceHelper.db.addSSO(testUserSso.user);
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

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testUnlink();
});
