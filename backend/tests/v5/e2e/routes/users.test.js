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
const ServiceHelper = require('../../helper/services');
const { src, image } = require('../../helper/path');
const SessionTracker = require('../../helper/sessionTracker');
const fs = require('fs');
const { providers } = require('../../../../src/v5/services/sso/sso.constants');

const { templates } = require(`${src}/utils/responseCodes`);

const { loginPolicy } = require(`${src}/utils/config`);

let server;
let agent;

// This is the user being used for tests
const testUser = ServiceHelper.generateUserCredentials();
const ssoTestUser = ServiceHelper.generateUserCredentials();
const userWithFsAvatar = ServiceHelper.generateUserCredentials();
const userWithGridFsAvatar = ServiceHelper.generateUserCredentials();
const nonVerifiedUser = ServiceHelper.generateUserCredentials();
const nonVerifiedUserWithExpiredToken = ServiceHelper.generateUserCredentials();
const testUserWithToken = ServiceHelper.generateUserCredentials();
const testUserWithExpiredToken = ServiceHelper.generateUserCredentials();
const lockedUser = ServiceHelper.generateUserCredentials();
const lockedUserWithExpiredLock = ServiceHelper.generateUserCredentials();
const nonVerifiedUserEmail = 'nonverifieduser@email.com';
const teamspace = { name: ServiceHelper.generateRandomString() };

const ssoUserId = ServiceHelper.generateRandomString();
const fsAvatarData = ServiceHelper.generateRandomString();
const gridFsAvatarData = ServiceHelper.generateRandomString();
const validPasswordToken = { token: ServiceHelper.generateRandomString(), expiredAt: new Date(2030, 12, 12) };
const validEmailToken = { token: ServiceHelper.generateRandomString(), expiredAt: new Date(2030, 12, 12) };
const expiredEmailToken = { token: ServiceHelper.generateRandomString(), expiredAt: new Date(2020, 12, 12) };
const expiredPasswordToken = { token: ServiceHelper.generateRandomString(), expiredAt: new Date(2020, 12, 12) };
const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace.name, [nonVerifiedUser.user], {
		discretionary: {
			collaborators: 'unlimited',
			data: 10,
			expiryDate: Date.now() + 100000,
		},
	});

	await Promise.all([
		ServiceHelper.db.createUser(testUser),
		ServiceHelper.db.createUser(ssoTestUser, [], {
			sso: { type: providers.AAD, id: ssoUserId },
		}),
		ServiceHelper.db.createUser(userWithFsAvatar, []),
		ServiceHelper.db.createUser(userWithGridFsAvatar, []),
		ServiceHelper.db.createUser(nonVerifiedUser, [teamspace.name], {
			inactive: true,
			emailVerifyToken: {
				token: validEmailToken.token,
				expiredAt: validEmailToken.expiredAt,
			},
			email: nonVerifiedUserEmail,
		}),
		ServiceHelper.db.createUser(nonVerifiedUserWithExpiredToken, [], {
			inactive: true,
			emailVerifyToken: {
				token: expiredEmailToken.token,
				expiredAt: expiredEmailToken.expiredAt,
			},
		}),
		ServiceHelper.db.createUser(testUserWithToken, [], {
			resetPasswordToken: {
				token: validPasswordToken.token,
				expiredAt: validPasswordToken.expiredAt,
			},
		}),
		ServiceHelper.db.createUser(testUserWithExpiredToken, [], {
			resetPasswordToken: {
				token: expiredPasswordToken.token, expiredAt: expiredPasswordToken.expiredAt,
			},
		}),
		ServiceHelper.db.createUser(lockedUser, []),
		ServiceHelper.db.createUser(lockedUserWithExpiredLock, []),

		ServiceHelper.db.createAvatar(userWithFsAvatar.user, 'fs', fsAvatarData),
		ServiceHelper.db.createAvatar(userWithGridFsAvatar.user, 'gridfs', gridFsAvatarData),
		ServiceHelper.db.addLoginRecords(times(loginPolicy.maxUnsuccessfulLoginAttempts, (count) => ({
			user: lockedUser.user,
			loginTime: new Date(Date.now() - count),
			failed: true,
		}))),
		ServiceHelper.db.addLoginRecords(times(loginPolicy.maxUnsuccessfulLoginAttempts, () => ({
			user: lockedUserWithExpiredLock.user,
			loginTime: new Date(1 / 1 / 18),
			failed: true,
		}))),
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
				expect(res.body).toEqual({ username: testUser.user });
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

		test('should return the user profile (SSO user)', async () => {
			const res = await agent.get(`/v5/user?key=${ssoTestUser.apiKey}`).expect(200);
			expect(res.body).toEqual(formatUserProfile(ssoTestUser, false, providers.AAD));
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

			test('should fail if the update data have invalid email', async () => {
				const data = { email: 'invalid' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if the update data have existing email', async () => {
				const data = { email: testUserWithToken.basicData.email };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should update the profile if the update data have existing email but belongs to the user', async () => {
				const data = { email: testUser.basicData.email };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.email).toEqual(testUser.basicData.email);
			});

			test('should fail if the update data have extra properties', async () => {
				const data = { firstName: 'newName', extra: 'extraProp' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if the oldPassword is not correct', async () => {
				const data = { oldPassword: 'invalid', newPassword: 'newPassword123.' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.incorrectPassword.status);
				expect(res.body.code).toEqual(templates.incorrectPassword.code);
			});

			test('should fail if the update data have oldPassword but not newPassword', async () => {
				const data = { oldPassword: testUser.password };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if the update data have newPassword but not oldPassword', async () => {
				const data = { newPassword: 'newPassword123.' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if the update data have weak newPassword', async () => {
				const data = { oldPassword: testUser.password, newPassword: 'abc' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if the update data have a newPassword which is the same as the old one', async () => {
				const data = { oldPassword: testUser.password, newPassword: testUser.password };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should update the profile if the user is logged in', async () => {
				const data = { firstName: 'newName', company: 'newCompany', countryCode: 'GR' };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.firstName).toEqual('newName');
				expect(updatedProfileRes.body.countryCode).toEqual('GR');
				expect(updatedProfileRes.body.company).toEqual('newCompany');
			});

			test('should update the profile and change password if the user is logged in', async () => {
				const data = { firstName: 'newName', oldPassword: testUser.password, newPassword: 'Passport123!' };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.firstName).toEqual('newName');
				// change password back to the original
				await testSession.put('/v5/user/').send({ oldPassword: 'Passport123!', newPassword: testUser.password });
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
			expect(res.body).toEqual(Buffer.from(fsAvatarData));
		});

		test('should get the avatar if the user has an gridfs avatar and has a session via an API key', async () => {
			const res = await agent.get(`/v5/user/avatar?key=${userWithGridFsAvatar.apiKey}`).expect(200);
			expect(res.body).toEqual(Buffer.from(gridFsAvatarData));
		});

		test('should get the avatar if the user has an fs avatar and is logged in', async () => {
			const testSession = SessionTracker(agent);
			await testSession.login(userWithFsAvatar);
			const res = await testSession.get('/v5/user/avatar').expect(200);
			expect(res.body).toEqual(Buffer.from(fsAvatarData));
			await testSession.post('/v5/logout/');
		});

		test('should fail if the user has no avatar', async () => {
			const res = await agent.get(`/v5/user/avatar?key=${testUser.apiKey}`)
				.expect(templates.fileNotFound.status);
			expect(res.body.code).toEqual(templates.fileNotFound.code);
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
				const imageBuffer = fs.readFileSync(image);
				expect(resBuffer).toEqual(imageBuffer);
			});
		});

		describe('With valid authentication', () => {
			test('should upload a new avatar if the user is logged in', async () => {
				const testSession = SessionTracker(agent);
				await testSession.login(testUser);
				await testSession.get('/v5/user/avatar').expect(templates.fileNotFound.status);
				await testSession.put('/v5/user/avatar').set('Content-Type', 'image/png').attach('file', image)
					.expect(templates.ok.status);

				const avatarRes = await testSession.get('/v5/user/avatar').expect(templates.ok.status);
				const resBuffer = avatarRes.body;
				const imageBuffer = fs.readFileSync(image);
				expect(resBuffer).toEqual(imageBuffer);
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
		test('should fail if a token is not provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if a new password is not provided', async () => {
			const res = await agent.put('/v5/user/password').send({ token: 'some random token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user is not provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), token: 'some random token' })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the new password is too weak', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: 'abc', token: 'some random token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user is not found', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), token: 'some random token', user: 'invalid user' })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user has no token', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), token: 'some random token', user: testUser.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user has expired token', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), token: expiredPasswordToken.token, user: testUserWithExpiredToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user token is different than the one provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), token: 'different token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should reset user password', async () => {
			const newPassword = ServiceHelper.generateRandomString();
			await agent.put('/v5/user/password').send({ newPassword, token: validPasswordToken.token, user: testUserWithToken.user })
				.expect(templates.ok.status);

			// trying to log in with the old password should fail
			await agent.post('/v5/login/').send({ user: testUserWithToken.user, password: testUserWithToken.password })
				.expect(templates.incorrectPassword.status);

			// using the same token should fail
			await agent.put('/v5/user/password').send({ newPassword: ServiceHelper.generateRandomString(), token: validPasswordToken.token, user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);

			// trying to log in with the new password should succeed
			await agent.post('/v5/login/').send({ user: testUserWithToken.user, password: newPassword })
				.expect(templates.ok.status);
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
