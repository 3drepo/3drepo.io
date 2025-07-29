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
const ServiceHelper = require('../../helper/services');
const { src, image } = require('../../helper/path');
const SessionTracker = require('../../helper/sessionTracker');
const { onlineAvatarPath, newAvatarPath } = require('../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const FronteggService = require(`${src}/services/sso/frontegg`);

// This is the user being used for tests
const testUser = ServiceHelper.generateUserCredentials();
const userWithFsAvatar = ServiceHelper.generateUserCredentials();
const userWithGridFsAvatar = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();
const fsAvatarData = ServiceHelper.generateRandomString();
const gridFsAvatarData = ServiceHelper.generateRandomString();
const setupData = async () => {
	await ServiceHelper.db.createUser(testUser);
	await ServiceHelper.db.createTeamspace(teamspace, [testUser.user]);
	await Promise.all([
		ServiceHelper.db.createUser(userWithFsAvatar, [teamspace]),
		ServiceHelper.db.createUser(userWithGridFsAvatar, [teamspace]),
		ServiceHelper.db.createAvatar(userWithFsAvatar.user, 'fs', fsAvatarData),
		ServiceHelper.db.createAvatar(userWithGridFsAvatar.user, 'gridfs', gridFsAvatarData),
	]);
};

const testEndpointRoutes = () => {
	describe('Endpoint routes', () => {
		test('should fail with an endpoint that does not exist', async () => {
			await agent.post(`/v5/${ServiceHelper.generateRandomString()}/`)
				.send({ user: testUser.user, password: testUser.password })
				.expect(templates.pageNotFound.status);
		});

		test('should fail with an endpoint that does not exist (v4)', async () => {
			await agent.post(`/${ServiceHelper.generateRandomString()}/`)
				.send({ user: testUser.user, password: testUser.password })
				.expect(templates.pageNotFound.status);
		});
	});
};

const testLogin = () => {
	describe('Login user', () => {
		test(`should fail if ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.post('/v5/login').send({})
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

const testLogout = () => {
	describe('Logout user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.post('/v5/logout/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.post(`/v5/logout?key=${testUser.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should log the user out if they are logged in', async () => {
			const testSession = SessionTracker(agent);
			await testSession.login(testUser);
			await testSession.post('/v5/logout/').expect(200);
		});
	});
};

const testGetUsername = () => {
	describe('Get username of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/login/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/login?key=${testUser.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		describe('With valid authentication', () => {
			test('should return the username if the user is logged in', async () => {
				const testSession = SessionTracker(agent);
				await testSession.login(testUser);
				const res = await testSession.get('/v5/login/').expect(200);
				expect(res.body).toEqual({ username: testUser.user, authenticatedTeamspace: null });
			});

			test('should return the username if the user is logged in and the authenticated teamspace', async () => {
				const testSession = SessionTracker(agent);
				await testSession.login(testUser, { teamspace });
				const res = await testSession.get('/v5/login/').expect(200);
				expect(res.body).toEqual({ username: testUser.user, authenticatedTeamspace: teamspace });
			});
		});
	});
};

const formatUserProfile = (user, hasAvatar = false, sso) => ({
	username: user.user,
	firstName: user.basicData.firstName,
	lastName: user.basicData.lastName,
	apiKey: user.apiKey,
	hasAvatar,
	countryCode: user.basicData.billing.billingInfo.countryCode,
	company: user.basicData.billing.billingInfo.company,
	...(sso ? { sso } : {}),
	...(user.basicData.email ? { email: user.basicData.email } : {}),
});

const testGetProfile = () => {
	describe('Get profile of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/user/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if a different userAgent is provided', async () => {
			const testSession = SessionTracker(agent);
			await testSession.login(testUser);

			const res = await testSession.get('/v5/user/')
				.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.67 Safari/537.36')
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should return the user profile if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/user?key=${testUser.apiKey}`).expect(200);
			expect(res.body).toEqual(formatUserProfile(testUser));
		});

		test('should return the user profile if the user has a session via an API key and has avatar', async () => {
			const res = await agent.get(`/v5/user?key=${userWithFsAvatar.apiKey}`).expect(200);
			expect(res.body).toEqual(formatUserProfile(userWithFsAvatar, true));
		});

		describe('With valid authentication', () => {
			test('should return the user profile if the user is logged in', async () => {
				const testSession = SessionTracker(agent);
				await testSession.login(testUser);
				const res = await testSession.get('/v5/user/').expect(200);
				expect(res.body).toEqual(formatUserProfile(testUser));
			});
		});
	});
};

const testUpdateProfile = () => {
	describe('Update profile of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const data = { firstName: 'newName' };
			const res = await agent.put('/v5/user/').send(data).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const data = { firstName: 'newName' };
			const res = await agent.put(`/v5/user?key=${testUser.apiKey}`)
				.send(data).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		describe('With valid authentication', () => {
			let testSession;
			beforeAll(async () => {
				testSession = SessionTracker(agent);
				await testSession.login(testUser);
			});

			test('should fail if the user tries to update their email', async () => {
				const data = { email: 'a@b.com' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should update the first name if the user is logged in', async () => {
				const data = { firstName: 'newName' };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.firstName).toEqual('newName');
				expect(updatedProfileRes.body.lastName).toEqual(testUser.basicData.lastName);
				expect(updatedProfileRes.body.countryCode).toEqual(testUser.basicData.billing.billingInfo.countryCode);
				expect(updatedProfileRes.body.company).toEqual(testUser.basicData.billing.billingInfo.company);
			});

			test('should update the last name if the user is logged in', async () => {
				const data = { lastName: 'newName' };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.lastName).toEqual('newName');
				expect(updatedProfileRes.body.firstName).toEqual('newName');
				expect(updatedProfileRes.body.countryCode).toEqual(testUser.basicData.billing.billingInfo.countryCode);
				expect(updatedProfileRes.body.company).toEqual(testUser.basicData.billing.billingInfo.company);
			});

			test('should update the profile if the user is logged in', async () => {
				const data = { firstName: 'newName1', lastName: 'oldName', company: 'newCompany', countryCode: 'GR' };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.firstName).toEqual('newName1');
				expect(updatedProfileRes.body.lastName).toEqual('oldName');
				expect(updatedProfileRes.body.countryCode).toEqual('GR');
				expect(updatedProfileRes.body.company).toEqual('newCompany');
			});
		});
	});
};

const testGetAvatar = () => {
	describe('Get the avatar of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/user/avatar').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should get the avatar if the user has an fs avatar and has a session via an API key', async () => {
			const res = await agent.get(`/v5/user/avatar?key=${userWithFsAvatar.apiKey}`).expect(200);
			expect(res.body).toEqual(Buffer.from('basicAvatarUrl'));
		});

		test('should get the avatar if the user has an fs avatar and is logged in', async () => {
			const testSession = SessionTracker(agent);
			await testSession.login(userWithFsAvatar);
			const res = await testSession.get('/v5/user/avatar').expect(200);
			expect(res.body).toEqual(Buffer.from('basicAvatarUrl'));
			await testSession.post('/v5/logout/');
		});
	});
};

const testUploadAvatar = () => {
	describe('Upload a new avatar for the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.put('/v5/user/avatar')
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.put(`/v5/user/avatar?key=${userWithGridFsAvatar.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		describe('With valid authentication and existing avatar', () => {
			let testSession;
			beforeAll(async () => {
				testSession = SessionTracker(agent);
				await testSession.login(userWithGridFsAvatar);
			});

			test('should remove old avatar and upload a new one if the user is logged in', async () => {
				await testSession.put('/v5/user/avatar').attach('file', image)
					.expect(templates.ok.status);

				const avatarRes = await testSession.get('/v5/user/avatar').expect(templates.ok.status);
				const resBuffer = avatarRes.body;
				expect(resBuffer).toEqual(Buffer.from('newAvatarUrl'));
			});
		});
	});
};

const testGenerateApiKey = () => {
	describe('Generate and assign Api key to the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.post('/v5/user/key').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.post(`/v5/user/key?key=${testUser.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should create and return a new Api key if the user is logged in', async () => {
			const testSession = SessionTracker(agent);
			await testSession.login(testUser);
			const res = await testSession.post('/v5/user/key').expect(200);
			const userProfileRes = await testSession.get('/v5/user');
			expect(res.body).toEqual({ apiKey: userProfileRes.body.apiKey });
			await testSession.post('/v5/logout/');

			// ensure new API key works and the old one does not
			await agent.get(`/v5/user?key=${testUser.apiKey}`).expect(templates.notLoggedIn.status);
			await agent.get(`/v5/user?key=${res.body.apiKey}`).expect(200);
		});
	});
};

const testDeleteApiKey = () => {
	describe('Delete the Api key of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.delete('/v5/user/key').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.delete(`/v5/user/key?key=${testUser.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		describe('With valid authentication', () => {
			test('should delete the Api key if the user is logged in', async () => {
				const testSession = SessionTracker(agent);
				await testSession.login(testUser);
				const userProfileResBeforeDelete = await testSession.get('/v5/user');
				await testSession.delete('/v5/user/key').expect(200);
				const userProfileRes = await testSession.get('/v5/user');
				expect(userProfileRes.body.apiKey).toEqual(undefined);

				// ensure new API does not key works
				await agent.get(`/v5/user?key=${userProfileResBeforeDelete.body.apiKey}`).expect(templates.notLoggedIn.status);
			});
		});
	});
};

const testTriggerResetPassword = () => {
	describe('Trigger reset password (Known user)', () => {
		const route = '/v5/user/password/reset';
		test('Should fail the user is not logged in', async () => {
			const res = await agent.post(route).send({})
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('Should fail the user is not logged in (api key)', async () => {
			const res = await agent.post(`${route}?key=${testUser.apiKey}`).send({})
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('Should trigger email if the user is logged in', async () => {
			const testSession = SessionTracker(agent);
			await testSession.login(testUser);
			await testSession.post(route).send({})
				.expect(templates.ok.status);
			expect(FronteggService.triggerPasswordReset).toHaveBeenCalledTimes(1);
			expect(FronteggService.triggerPasswordReset).toHaveBeenCalledWith(testUser.basicData.email);
		});
	});
};

const testForgotPassword = () => {
	describe('Send forgot password email', () => {
		test(`should fail if ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.post('/v5/user/password').send({})
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

const testResetPassword = () => {
	describe('Reset user password', () => {
		test(`should fail if ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.put('/v5/user/password').send({})
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

const testSignUp = () => {
	describe('Sign a user up', () => {
		test(`should fail if ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.post('/v5/user').send({})
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

const testVerify = () => {
	describe('Verify a user', () => {
		test(`should fail if ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.post('/v5/user/verify').send({})
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
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

	testEndpointRoutes();
	testLogin();
	testLogout();
	testGetUsername();
	testGetProfile();
	testTriggerResetPassword();
	testUpdateProfile();
	testGetAvatar();
	testUploadAvatar();
	testForgotPassword();
	testResetPassword();
	testSignUp();
	testVerify();
	// should be called last as they update user Api key
	testGenerateApiKey();
	testDeleteApiKey();
});
