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
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const { authenticateRedirectUri, signupRedirectUri } = require('../../../../../../src/v5/services/sso/aad/aad.constants');
jest.mock('../../../../../../src/v5/services/sso/aad', () => ({
	...jest.requireActual('../../../../../../src/v5/services/sso/aad'),
	getUserDetails: jest.fn(),
}));
const Aad = require('../../../../../../src/v5/services/sso/aad');
const { aad } = require('../../../../../../src/v5/services/sso/sso.constants');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const userEmail = 'example@email.com';
const testUser = ServiceHelper.generateUserCredentials();
const userEmailSso = 'example2@email.com';
const testUserSso = ServiceHelper.generateUserCredentials();
const newUserEmail = 'newUserEmail@email.com';

const setupData = async () => {
	await ServiceHelper.db.createUser(testUser, [], { email: userEmail });
	await ServiceHelper.db.createUser(testUserSso, [], { email: userEmailSso,
		sso: { type: aad, id: generateRandomString() } });
};

const testAuthenticate = () => {
	describe('Sign Up Authenticate', () => {
		test('should redirect the user to Microsoft authentication page', async () => {
			const signupUri = generateRandomString();
			const res = await agent.get(`/v5/sso/aad/authenticate?signupUri=${signupUri}`)
				.expect(templates.found.status);

			const redirectUri = res.headers.location;
			expect(redirectUri).toEqual(
				expect.stringContaining('https://login.microsoftonline.com/common/oauth2/v2.0/authorize'),
			);
			expect(redirectUri).toEqual(
				expect.stringContaining(`redirect_uri=${encodeURIComponent(authenticateRedirectUri)}`),
			);
			expect(redirectUri).toEqual(
				expect.stringContaining(`state=${encodeURIComponent(JSON.stringify({ redirectUri: signupUri }))}`),
			);
		});
	});
};

const testAuthenticatePost = () => {
	describe('Sign Up Authenticate Post', () => {
		test('should redirect the user to ', async () => {
			const state = { redirectUri: generateRandomString() };
			const res = await agent.get(`/v5/sso/aad/authenticate-post?state=${encodeURIComponent(JSON.stringify(state))}`)
				.expect(templates.found.status);
			expect(res.headers.location).toEqual(expect.stringMatching(state.redirectUri));
		});
	});
};

const signup = () => {
	describe('Sign Up', () => {
		const newUserData = {
			username: generateRandomString(),
			countryCode: 'GB',
			company: generateRandomString(),
			mailListAgreed: true,
		};

		test('should fail if the username already exists', async () => {
			const res = await agent.post('/v5/sso/aad/signup').send({ ...newUserData, username: testUser.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if there are missing body params', async () => {
			const res = await agent.post('/v5/sso/aad/signup').send({ ...newUserData, username: undefined })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should validate signup data and redirect the user to Microsoft authentication page', async () => {
			const res = await agent.post('/v5/sso/aad/signup').send(newUserData)
				.expect(templates.found.status);

			const redirectUri = res.headers.location;
			expect(redirectUri).toEqual(
				expect.stringContaining('https://login.microsoftonline.com/common/oauth2/v2.0/authorize'),
			);
			expect(redirectUri).toEqual(
				expect.stringContaining(`redirect_uri=${encodeURIComponent(signupRedirectUri)}`),
			);
			expect(redirectUri).toEqual(
				expect.stringContaining(`state=${encodeURIComponent(JSON.stringify({
					username: newUserData.username,
					countryCode: newUserData.countryCode,
					company: newUserData.company,
					mailListAgreed: newUserData.mailListAgreed,
				}))}`),
			);
		});
	});
};

const signupPost = () => {
	describe('Sign Up', () => {
		const newUserData = {
			username: generateRandomString(),
			countryCode: 'GB',
			company: generateRandomString(),
			mailListAgreed: true,
		};

		const newUserDataFromAad = {
			mail: newUserEmail,
			givenName: generateRandomString(),
			surname: generateRandomString(),
			id: generateRandomString(),
		};

		test('should fail if the email already exists', async () => {
			const state = { ...newUserData };
			Aad.getUserDetails.mockResolvedValueOnce({ data: { ...newUserDataFromAad, mail: userEmail } });
			const res = await agent.get(`/v5/sso/aad/signup-post?state=${encodeURIComponent(JSON.stringify(state))}`)
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the email already exists (SSO user)', async () => {
			const state = { ...newUserData };
			Aad.getUserDetails.mockResolvedValueOnce({ data: { ...newUserDataFromAad, mail: userEmailSso } });
			const res = await agent.get(`/v5/sso/aad/signup-post?state=${encodeURIComponent(JSON.stringify(state))}`)
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should sign a new user up', async () => {
			const state = { ...newUserData };
			Aad.getUserDetails.mockResolvedValueOnce({ data: newUserDataFromAad });
			await agent.get(`/v5/sso/aad/signup-post?state=${encodeURIComponent(JSON.stringify(state))}`)
				.expect(templates.ok.status);
		});
	});
};

const app = ServiceHelper.app();

describe('E2E routes/sso/aad', () => {
	beforeAll(async () => {
		server = app;
		agent = await SuperTest(server);
		await setupData();
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testAuthenticate();
	testAuthenticatePost();
	signup();
	signupPost();
});
