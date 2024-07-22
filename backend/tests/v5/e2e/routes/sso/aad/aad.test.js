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
const SessionTracker = require('../../../../helper/sessionTracker');
const { src } = require('../../../../helper/path');
const { generateRandomString, generateRandomURL } = require('../../../../helper/services');
const { authenticateRedirectUri, signupRedirectUri, linkRedirectUri } = require('../../../../../../src/v5/services/sso/aad/aad.constants');

jest.mock('../../../../../../src/v5/services/sso/aad', () => ({
	...jest.requireActual('../../../../../../src/v5/services/sso/aad'),
	getUserDetails: jest.fn(),
}));
const Aad = require('../../../../../../src/v5/services/sso/aad');
const { providers, errorCodes } = require('../../../../../../src/v5/services/sso/sso.constants');
const { getUserByUsername } = require('../../../../../../src/v5/models/users');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const userEmail = `${generateRandomString()}@email.com`;
const testUser = ServiceHelper.generateUserCredentials();
const ssoUserId = generateRandomString();
const userEmailSso = `${generateRandomString()}@email.com`;
const testUserSso = ServiceHelper.generateUserCredentials();
const newUserEmail = `${generateRandomString()}@email.com`;

const setupData = async () => {
	await ServiceHelper.db.createUser(testUser, [], { email: userEmail });
	await ServiceHelper.db.createUser(testUserSso, [], { email: userEmailSso,
		sso: { type: providers.AAD, id: ssoUserId } });
};

const testAuthenticate = () => {
	describe('Authenticate', () => {
		test('should fail if redirectUri is not provided', async () => {
			await agent.get('/v5/sso/aad/authenticate').expect(templates.invalidArguments.status);
		});

		test('respond with a link to Microsoft authentication page', async () => {
			const redirectUri = generateRandomString();
			const res = await agent.get(`/v5/sso/aad/authenticate?redirectUri=${redirectUri}`)
				.expect(templates.ok.status);
			const resUri = new URL(res.body.link);
			expect(resUri.hostname).toEqual('login.microsoftonline.com');
			expect(resUri.pathname).toEqual('/common/oauth2/v2.0/authorize');
			const { searchParams } = resUri;
			expect(searchParams.get('redirect_uri')).toEqual(authenticateRedirectUri);
			expect(searchParams.has('client_id')).toEqual(true);
			expect(searchParams.has('code_challenge')).toEqual(true);
			expect(searchParams.get('code_challenge_method')).toEqual('S256');
			expect(JSON.parse(Aad.decryptCryptoHash(searchParams.get('state')))).toEqual({ redirectUri, csrfToken: expect.any(String) });
		});
	});
};

const testAuthenticatePost = () => {
	describe('Authenticate Post', () => {
		test(`should redirect with ${errorCodes.USER_NOT_FOUND} if user does not exist`, async () => {
			const userDataFromAad = {
				email: generateRandomString(),
				id: generateRandomString(),
				firstName: generateRandomString(),
				lastName: generateRandomString(),
			};
			const redirectUri = `${generateRandomURL()}`;
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await agent.post('/v5/sso/aad/authenticate-post').send({ state })
				.expect(302);
			expect(res.headers.location).toEqual(`${redirectUri}?error=${errorCodes.USER_NOT_FOUND}`);
		});

		test(`should redirect with ${errorCodes.NON_SSO_USER} if user is a non SSO user`, async () => {
			const userDataFromAad = {
				email: userEmail,
				id: generateRandomString(),
				firstName: generateRandomString(),
				lastName: generateRandomString(),
			};
			const redirectUri = `${generateRandomURL()}`;
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await agent.post('/v5/sso/aad/authenticate-post').send({ state })
				.expect(302);
			expect(res.headers.location).toEqual(`${redirectUri}?error=${errorCodes.NON_SSO_USER}`);
		});

		test('should retain a query param in the redirectUri if it redirects with error', async () => {
			const userDataFromAad = {
				email: generateRandomString(),
				id: generateRandomString(),
				firstName: generateRandomString(),
				lastName: generateRandomString(),
			};
			const redirectUri = `${generateRandomURL()}?queryParam=someValue`;
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await agent.post('/v5/sso/aad/authenticate-post').send({ state })
				.expect(302);
			expect(res.headers.location).toEqual(`${redirectUri}&error=${errorCodes.USER_NOT_FOUND}`);
		});

		test('should redirect the user to the redirectUri provided', async () => {
			const userDataFromAad = {
				email: userEmailSso,
				id: ssoUserId,
				firstName: generateRandomString(),
				lastName: generateRandomString(),
			};
			const redirectUri = `${generateRandomURL()}?queryParam=someValue`;
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await agent.post('/v5/sso/aad/authenticate-post').send({ state })
				.expect(302);
			expect(res.headers.location).toEqual(redirectUri);
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

		test('should fail if redirectUri is not provided', async () => {
			const res = await agent.post('/v5/sso/aad/signup')
				.send(newUserData)
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the username already exists', async () => {
			const res = await agent.post(`/v5/sso/aad/signup?redirectUri=${generateRandomString()}`)
				.send({ ...newUserData, username: testUser.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if there are missing body params', async () => {
			const res = await agent.post(`/v5/sso/aad/signup?redirectUri=${generateRandomString()}`)
				.send({ ...newUserData, username: undefined })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should validate signup data and redirect the user to Microsoft authentication page', async () => {
			const redirectUri = generateRandomString();

			const res = await agent.post(`/v5/sso/aad/signup?redirectUri=${redirectUri}`)
				.send(newUserData)
				.expect(templates.ok.status);

			const resUri = new URL(res.body.link);
			expect(resUri.hostname).toEqual('login.microsoftonline.com');
			expect(resUri.pathname).toEqual('/common/oauth2/v2.0/authorize');
			expect(resUri.searchParams.get('redirect_uri')).toEqual(signupRedirectUri);
			expect(resUri.searchParams.has('client_id')).toEqual(true);
			expect(resUri.searchParams.has('code_challenge')).toEqual(true);
			expect(resUri.searchParams.get('code_challenge_method')).toEqual('S256');
			const state = JSON.parse(Aad.decryptCryptoHash(resUri.searchParams.get('state')));
			expect(state).toEqual({ redirectUri, ...newUserData, csrfToken: expect.any(String) });
		});
	});
};

const signupPost = () => {
	describe('Sign Up Post', () => {
		const redirectUri = generateRandomURL().slice(0, -1); // remove last / to make checking easier
		const newUserData = {
			redirectUri,
			username: generateRandomString(),
			countryCode: 'GB',
			company: generateRandomString(),
			mailListAgreed: true,
		};

		const newUserDataFromAad = {
			email: newUserEmail,
			firstName: generateRandomString(),
			lastName: generateRandomString(),
			id: generateRandomString(),
		};

		test('should redirect and add error to the query if email already exists', async () => {
			const state = Aad.generateCryptoHash(JSON.stringify(newUserData));
			Aad.getUserDetails.mockResolvedValueOnce({ ...newUserDataFromAad, email: userEmail });
			const res = await agent.post('/v5/sso/aad/signup-post').send({ state })
				.expect(302);
			const resUri = new URL(res.headers.location);
			expect(resUri.origin).toEqual(redirectUri);
			expect(resUri.searchParams.get('error')).toEqual(errorCodes.EMAIL_EXISTS.toString());
		});

		test('should redirect and add error to the query if email already exists (SSO user)', async () => {
			const state = Aad.generateCryptoHash(JSON.stringify(newUserData));
			Aad.getUserDetails.mockResolvedValueOnce({ ...newUserDataFromAad, email: userEmailSso });
			const res = await agent.post('/v5/sso/aad/signup-post').send({ state })
				.expect(302);
			const resUri = new URL(res.headers.location);
			expect(resUri.origin).toEqual(redirectUri);
			expect(resUri.searchParams.get('error')).toEqual(errorCodes.EMAIL_EXISTS_WITH_SSO.toString());
		});

		test('should sign a new user up and set them to active', async () => {
			const state = Aad.generateCryptoHash(JSON.stringify(newUserData));
			Aad.getUserDetails.mockResolvedValueOnce(newUserDataFromAad);
			await agent.post('/v5/sso/aad/signup-post').send({ state })
				.expect(302);

			// ensure user is created and is active
			const user = await getUserByUsername(newUserData.username, { _id: 1, 'customData.inactive': 1 });
			expect(user.customData.inactive).toBeUndefined();
		});
	});
};

const testLink = () => {
	describe('Link', () => {
		const redirectUri = generateRandomURL();

		test('should fail without a valid session or API key', async () => {
			await agent.get(`/v5/sso/aad/link?redirectUri=${redirectUri}`)
				.expect(templates.notAuthorized.status);
		});

		test('should fail without a valid session but with an API key', async () => {
			await agent.get(`/v5/sso/aad/link?redirectUri=${redirectUri}&key=${testUser.apiKey}`)
				.expect(templates.notAuthorized.status);
		});

		describe('With valid authentication', () => {
			let testSession;
			beforeEach(async () => {
				testSession = SessionTracker(agent);
				await testSession.login(testUser.user, testUser.password);
			});

			test('should fail if redirectUri is not provided', async () => {
				await testSession.get('/v5/sso/aad/link')
					.expect(templates.invalidArguments.status);
			});

			test('should respond with a link to Microsoft authentication page', async () => {
				const res = await testSession.get(`/v5/sso/aad/link?redirectUri=${redirectUri}`)
					.expect(templates.ok.status);
				const resUri = new URL(res.body.link);
				expect(resUri.hostname).toEqual('login.microsoftonline.com');
				expect(resUri.pathname).toEqual('/common/oauth2/v2.0/authorize');
				const { searchParams } = resUri;
				expect(searchParams.get('redirect_uri')).toEqual(linkRedirectUri);
				expect(searchParams.has('client_id')).toEqual(true);
				expect(searchParams.has('code_challenge')).toEqual(true);
				expect(searchParams.get('code_challenge_method')).toEqual('S256');
				expect(JSON.parse(Aad.decryptCryptoHash(searchParams.get('state')))).toEqual({ redirectUri, csrfToken: expect.any(String) });
			});
		});
	});
};

const testLinkPost = () => {
	describe('Link Post', () => {
		let testSession;
		const resetTestUser = async () => {
			// set the user to non SSO
			await testSession.post('/v5/sso/aad/unlink').send({ password: testUser.password });
			// reset users email
			await testSession.put('/v5/user').send({ email: userEmail });
		};

		beforeAll(async () => {
			testSession = SessionTracker(agent);
			await testSession.login(testUser.user, testUser.password);
		});

		afterEach(async () => {
			await resetTestUser();
		});

		test('should fail without a valid state', async () => {
			const state = generateRandomString();
			const res = await testSession.post('/v5/sso/aad/link-post').send({ state })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test(`should redirect with ${errorCodes.EMAIL_EXISTS} if email is taken by another user`, async () => {
			const userDataFromAad = { email: userEmailSso, id: generateRandomString() };
			const redirectUri = generateRandomURL();
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await testSession.post('/v5/sso/aad/link-post').send({ state })
				.expect(302);
			expect(res.headers.location).toEqual(`${redirectUri}?error=${errorCodes.EMAIL_EXISTS}`);
		});

		test('should link user if email is taken by the logged in user', async () => {
			const userDataFromAad = { email: userEmail, id: generateRandomString() };
			const redirectUri = generateRandomURL();
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);

			const res = await testSession.post('/v5/sso/aad/link-post').send({ state })
				.expect(302);
			expect(res.headers.location).toEqual(redirectUri);
			const newProfileRes = await testSession.get('/v5/user');
			expect(newProfileRes.body.sso).toEqual('aad');
		});

		test('should link user and change email if email is available', async () => {
			const userDataFromAad = { email: generateRandomString(), id: generateRandomString() };
			const redirectUri = generateRandomURL();
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await testSession.post('/v5/sso/aad/link-post').send({ state })
				.expect(302);

			expect(res.headers.location).toEqual(redirectUri);
			const newProfileRes = await testSession.get('/v5/user');
			expect(newProfileRes.body.email).toEqual(userDataFromAad.email);
		});

		test('should link user and change email if email is available even if user is already SSO', async () => {
			const redirectUri = generateRandomURL();
			const state = Aad.generateCryptoHash(JSON.stringify({ redirectUri }));

			Aad.getUserDetails.mockResolvedValueOnce({ email: generateRandomString(), id: generateRandomString() });
			await testSession.post('/v5/sso/aad/link-post').send({ state });

			const userDataFromAad = { email: generateRandomString(), id: generateRandomString() };
			Aad.getUserDetails.mockResolvedValueOnce(userDataFromAad);
			const res = await testSession.post('/v5/sso/aad/link-post').send({ state })
				.expect(302);

			expect(res.headers.location).toEqual(redirectUri);
			const newProfileRes = await testSession.get('/v5/user');
			expect(newProfileRes.body.email).toEqual(userDataFromAad.email);
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

	testAuthenticate();
	testAuthenticatePost();
	signup();
	signupPost();
	testLink();
	testLinkPost();
});
