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
const session = require('supertest-session');
const { generateRandomString } = require('../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

let testSession;
let server;
let agent;

// This is the user being used for tests
const testUser = ServiceHelper.generateUserCredentials();
const testUserWithToken = ServiceHelper.generateUserCredentials();
const testUserWithExpiredToken = ServiceHelper.generateUserCredentials();
const testUserWithNoAvatar = ServiceHelper.generateUserCredentials();
const lockedUser = ServiceHelper.generateUserCredentials();
const lockedUserWithExpiredLock = ServiceHelper.generateUserCredentials();
const userWithFailedAttempts = ServiceHelper.generateUserCredentials();
const userEmail = 'example@email.com';
const userWithNoAvatarEmail = 'example2@email.com';
const userAvatar = { data: { buffer: 'image buffer data' } };
const validPasswordToken = { token: 'abcdefghijklmnop', expiredAt: new Date(2030, 12, 12) };
const expiredPasswordToken = { token: 'abcdefghijklmnop', expiredAt: new Date(2020, 12, 12) };
const setupData = async () => {
	await Promise.all([
		ServiceHelper.db.createUser(testUser, [], { email: userEmail, avatar: userAvatar }),
		ServiceHelper.db.createUser(testUserWithToken, [], { resetPasswordToken: { token: validPasswordToken.token,
			expiredAt: validPasswordToken.expiredAt } }),
		ServiceHelper.db.createUser(testUserWithExpiredToken, [], { resetPasswordToken: {
			token: expiredPasswordToken.token, expiredAt: expiredPasswordToken.expiredAt } }),
		ServiceHelper.db.createUser(testUserWithNoAvatar, [], { email: userWithNoAvatarEmail }),
		ServiceHelper.db.createUser(lockedUser, [], {
			loginInfo: {
				failedLoginCount: 10,
				lastFailedLoginAt: new Date(),
			},
		}),
		ServiceHelper.db.createUser(lockedUserWithExpiredLock, [], {
			loginInfo: {
				failedLoginCount: 10,
				lastFailedLoginAt: new Date('1/1/18'),
			},
		}),
		ServiceHelper.db.createUser(userWithFailedAttempts, [], {
			loginInfo: {
				failedLoginCount: 6,
				lastFailedLoginAt: new Date(),
			},
		}),
	]);
};

const testLogin = () => {
	describe('Login user', () => {
		test('should log in a user using username', async () => {
			await agent.post('/v5/login/')
				.send({ user: testUser.user, password: testUser.password })
				.expect(templates.ok.status);
		});

		test('should log in a user using email', async () => {
			await agent.post('/v5/login/')
				.send({ user: userEmail, password: testUser.password })
				.expect(templates.ok.status);
		});

		test('should fail with an incorrect username', async () => {
			const res = await agent.post('/v5/login/')
				.send({ user: 'randomUsername', password: testUser.password })
				.expect(templates.incorrectUsernameOrPassword.status);
			expect(res.body.code).toEqual(templates.incorrectUsernameOrPassword.code);
		});

		test('should fail with an invalid username', async () => {
			const res = await agent.post('/v5/login/')
				.send({ user: 12345, password: testUser.password })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail with a user that has already logged in', async () => {
			await testSession.post('/v5/login/')
				.send({ user: testUser.user, password: testUser.password })
				.expect(templates.ok.status);
			const res = await testSession.post('/v5/login/')
				.send({ user: testUser.user, password: testUser.password })
				.expect(templates.alreadyLoggedIn.status);
			expect(res.body.code).toEqual(templates.alreadyLoggedIn.code);
		});

		test('should fail with an incorrect password', async () => {
			const res = await agent.post('/v5/login/')
				.send({ user: testUser.user, password: 'wrongPassword' })
				.expect(templates.incorrectUsernameOrPassword.status);
			expect(res.body.code).toEqual(templates.incorrectUsernameOrPassword.code);
		});

		test('should fail with a locked account', async () => {
			const res = await agent.post('/v5/login/')
				.send({ user: lockedUser.user, password: lockedUser.password })
				.expect(templates.tooManyLoginAttempts.status);
			expect(res.body.code).toEqual(templates.tooManyLoginAttempts.code);
		});

		test('should log in with a locked account with the lockout duration expired', async () => {
			await agent.post('/v5/login/')
				.send({ user: lockedUserWithExpiredLock.user, password: lockedUserWithExpiredLock.password })
				.expect(templates.ok.status);
		});

		test('should fail with wrong password and many failed login attempts', async () => {
			const res = await agent.post('/v5/login/')
				.send({ user: userWithFailedAttempts.user, password: 'wrongPassword' })
				.expect(templates.incorrectUsernameOrPassword.status);
			expect(res.body.code).toEqual(templates.incorrectUsernameOrPassword.code);
			expect(res.body.message).toEqual('Incorrect username or password (Remaining attempts: 3)');
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
			await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
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
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should return the username if the user is logged in', async () => {
				const res = await testSession.get('/v5/login/').expect(200);
				expect(res.body).toEqual({ username: testUser.user });
			});
		});
	});
};

const formatUserProfile = (user, hasAvatar = true) => ({
	username: user.user,
	firstName: user.basicData.firstName,
	lastName: user.basicData.lastName,
	email: userEmail,
	apiKey: user.apiKey,
	hasAvatar,
	countryCode: user.basicData.billing.billingInfo.countryCode,
	company: user.basicData.billing.billingInfo.company,
});

const testGetProfile = () => {
	describe('Get profile of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/user/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should return the user profile if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/user?key=${testUser.apiKey}`).expect(200);
			expect(res.body).toEqual(formatUserProfile(testUser));
		});

		describe('With valid authentication', () => {
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should return the user profile if the user is logged in', async () => {
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
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should fail if the update data have invalid email', async () => {
				const data = { email: 'invalid' };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should fail if the update data have existing email', async () => {
				const data = { email: userWithNoAvatarEmail };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should update the profile if the update data have existing email but belongs to the user', async () => {
				const data = { email: userEmail };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body.email).toEqual(userEmail);
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

		test('should get the avatar if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/user/avatar?key=${testUser.apiKey}`).expect(200);
			expect(res.text).toEqual(userAvatar.data.buffer);
		});

		test('should get the avatar if the user is logged in', async () => {
			await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			const res = await testSession.get('/v5/user/avatar').expect(200);
			expect(res.text).toEqual(userAvatar.data.buffer);
			await testSession.post('/v5/logout/');
		});

		test('should fail if the user has no avatar', async () => {
			await testSession.post('/v5/login/').send({ user: testUserWithNoAvatar.user, password: testUserWithNoAvatar.password });
			await testSession.get('/v5/user/avatar').expect(templates.userDoesNotHaveAvatar.status);
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
			const res = await agent.put(`/v5/user/avatar?key=${testUser.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		describe('With valid authentication', () => {
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: testUserWithNoAvatar.user, password: testUserWithNoAvatar.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should upload the avatar if the user is logged in', async () => {
				await testSession.put('/v5/user/avatar').set('Content-Type', 'image/png').attach('file', image)
					.expect(templates.ok.status);
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
			await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
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
			const res = await agent.delete(`/v5/user?key=${testUser.apiKey}`)
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		describe('With valid authentication', () => {
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should delete the Api key if the user is logged in', async () => {
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
		test('should fail if a username or email is not provided', async () => {
			const res = await agent.post('/v5/user/password').expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should return ok even if user does not exist', async () => {
			await agent.post('/v5/user/password').send({ user: 'non existing user' })
				.expect(templates.ok.status);
		});

		test('should send forgot password email with valid username', async () => {
			await agent.post('/v5/user/password').send({ user: testUser.user })
				.expect(templates.ok.status);
		});
	});
};

const testResetPassword = () => {
	describe('Reset user password', () => {
		test('should fail if a token is not provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if a new password is not provided', async () => {
			const res = await agent.put('/v5/user/password').send({ token: 'some random token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user is not provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'some random token' })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the new password is too weak', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: 'Abcdef1!', token: 'some random token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user is not found', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'some random token', user: 'invalid user' })
				.expect(templates.invalidToken.status);
			expect(res.body.code).toEqual(templates.invalidToken.code);
		});

		test('should fail if user has no token', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'some random token', user: testUser.user })
				.expect(templates.invalidToken.status);
			expect(res.body.code).toEqual(templates.invalidToken.code);
		});

		test('should fail if user has expired token', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: expiredPasswordToken.token, user: testUserWithExpiredToken.user })
				.expect(templates.invalidToken.status);
			expect(res.body.code).toEqual(templates.invalidToken.code);
		});

		test('should fail if user token is different than the one provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'different token', user: testUserWithToken.user })
				.expect(templates.invalidToken.status);
			expect(res.body.code).toEqual(templates.invalidToken.code);
		});

		test('should reset user password', async () => {
			const newPassword = generateRandomString();
			await agent.put('/v5/user/password').send({ newPassword, token: validPasswordToken.token, user: testUserWithToken.user })
				.expect(templates.ok.status);

			// trying to log in with the old password should fail
			await testSession.post('/v5/login/').send({ user: testUserWithToken.user, password: testUserWithToken.password })
				.expect(templates.incorrectPassword.status);

			// using the same token should fail
			await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: validPasswordToken.token, user: testUserWithToken.user })
				.expect(templates.invalidToken.status);
		});
	});
};

const app = ServiceHelper.app();

describe('E2E routes/users', () => {
	beforeAll(async () => {
		server = app;
		agent = await SuperTest(server);
		testSession = session(app);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));

	testLogin();
	testLogout();
	testGetUsername();
	testGetProfile();
	testUpdateProfile();
	testGetAvatar();
	testUploadAvatar();
	testForgotPassword();
	testResetPassword();
	// should be called last as they update user Api key
	testGenerateApiKey();
	testDeleteApiKey();
});
