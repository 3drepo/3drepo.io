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
const { generateRandomString, generateRandomURL } = require('../../helper/services');
const session = require('supertest-session');
const fs = require('fs');
const User = require('../../../../src/v5/models/users');
const { providers } = require('../../../../src/v5/services/sso/sso.constants');
const { insertOne } = require('../../../../src/v5/handler/db');
const { updateProfile } = require('../../../../src/v5/models/users');

const { templates } = require(`${src}/utils/responseCodes`);

const { loginPolicy } = require(`${src}/utils/config`);

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

jest.mock('../../../../src/v5/services/sso/aad');
const Aad = require(`${src}/services/sso/aad`);

let testSession;
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
const userEmail = 'example@email.com';
const userEmailSso = 'examplesso@email.com';
const nonVerifiedUserEmail = 'nonverifieduser@email.com';
const ssoUserId = generateRandomString();
const userEmail2 = 'example2@email.com';
const fsAvatarData = generateRandomString();
const gridFsAvatarData = generateRandomString();
const validPasswordToken = { token: generateRandomString(), expiredAt: new Date(2030, 12, 12) };
const validEmailToken = { token: generateRandomString(), expiredAt: new Date(2030, 12, 12) };
const expiredEmailToken = { token: generateRandomString(), expiredAt: new Date(2020, 12, 12) };
const expiredPasswordToken = { token: generateRandomString(), expiredAt: new Date(2020, 12, 12) };
const teamspace = { name: ServiceHelper.generateRandomString() };

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace.name, [nonVerifiedUser.user], {
		discretionary: {
			collaborators: 'unlimited',
			data: 10,
			expiryDate: Date.now() + 100000,
		},
	});

	await Promise.all([
		ServiceHelper.db.createUser(testUser, [], { email: userEmail }),
		ServiceHelper.db.createUser(ssoTestUser, [], {
			email: userEmailSso, sso: { type: providers.AAD, id: ssoUserId },
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
			email: userEmail2,
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

		test('should log in a user using email (all upper case)', async () => {
			await agent.post('/v5/login/')
				.send({ user: userEmail.toUpperCase(), password: testUser.password })
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

		test('should fail when an account is locked', async () => {
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

const formatUserProfile = (user, email, hasAvatar = false, sso) => ({
	username: user.user,
	firstName: user.basicData.firstName,
	lastName: user.basicData.lastName,
	apiKey: user.apiKey,
	hasAvatar,
	countryCode: user.basicData.billing.billingInfo.countryCode,
	company: user.basicData.billing.billingInfo.company,
	...(sso ? { sso } : {}),
	...(email ? { email } : {}),
});

const testGetProfile = () => {
	describe('Get profile of the logged in user', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/user/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should return the user profile if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/user?key=${testUser.apiKey}`).expect(200);
			expect(res.body).toEqual(formatUserProfile(testUser, userEmail));
		});

		test('should return the user profile if the user has a session via an API key and has avatar', async () => {
			const res = await agent.get(`/v5/user?key=${userWithFsAvatar.apiKey}`).expect(200);
			expect(res.body).toEqual(formatUserProfile(userWithFsAvatar, undefined, true));
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
				expect(res.body).toEqual(formatUserProfile(testUser, userEmail));
			});
		});

		describe('With valid authentication (SSO user)', () => {
			beforeAll(async () => {
				Aad.getUserDetails.mockResolvedValueOnce({ email: userEmailSso, id: ssoUserId });
				await testSession.get(`/v5/sso/aad/authenticate-post?state=${encodeURIComponent(JSON.stringify({ redirectUri: generateRandomURL() }))}`);
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should return the user profile if the user is logged in', async () => {
				const res = await testSession.get('/v5/user/').expect(200);
				expect(res.body).toEqual(formatUserProfile(ssoTestUser, userEmailSso, false, providers.AAD));
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
				const data = { email: userEmail2 };
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

		describe('With valid authentication (SSO user)', () => {
			beforeAll(async () => {
				Aad.getUserDetails.mockResolvedValueOnce({ email: userEmailSso, id: ssoUserId });
				await testSession.get(`/v5/sso/aad/authenticate-post?state=${encodeURIComponent(JSON.stringify({ redirectUri: generateRandomURL() }))}`);
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should fail if the user tries to update sso fields', async () => {
				const data = { firstName: generateRandomString(), lastName: generateRandomString() };
				const res = await testSession.put('/v5/user/').send(data).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});

			test('should succeed if the user tries to update non sso fields', async () => {
				const data = { company: generateRandomString(), countryCode: 'GB' };
				await testSession.put('/v5/user/').send(data).expect(200);
				const updatedProfileRes = await testSession.get('/v5/user/');
				expect(updatedProfileRes.body).toEqual(expect.objectContaining(data));
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
			await testSession.post('/v5/login/').send({ user: userWithFsAvatar.user, password: userWithFsAvatar.password });
			const res = await testSession.get('/v5/user/avatar').expect(200);
			expect(res.body).toEqual(Buffer.from(fsAvatarData));
			await testSession.post('/v5/logout/');
		});

		test('should fail if the user has no avatar', async () => {
			const res = await testSession.get(`/v5/user/avatar?key=${testUser.apiKey}`)
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
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: userWithGridFsAvatar.user, password: userWithGridFsAvatar.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
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
			beforeAll(async () => {
				await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			});
			afterAll(async () => {
				await testSession.post('/v5/logout/');
			});

			test('should upload a new avatar if the user is logged in', async () => {
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

		test('should not send email but return ok if user is an SSO user', async () => {
			await User.linkToSso(ssoTestUser.user, ssoTestUser.basicData.firstName, ssoTestUser.basicData.lastName,
				userEmailSso, { type: generateRandomString(), id: generateRandomString() });
			await agent.post('/v5/user/password').send({ user: ssoTestUser.user })
				.expect(templates.ok.status);
			await User.unlinkFromSso(ssoTestUser.user, ssoTestUser.password);
			expect(Mailer.sendEmail).not.toHaveBeenCalled();
		});

		test('should return ok even if user does not exist', async () => {
			await agent.post('/v5/user/password').send({ user: 'non existing user' })
				.expect(templates.ok.status);
			expect(Mailer.sendEmail).not.toHaveBeenCalled();
		});

		test('should send forgot password email with valid username', async () => {
			await agent.post('/v5/user/password').send({ user: testUser.user })
				.expect(templates.ok.status);
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
		});

		test('should send forgot password email with valid email', async () => {
			await agent.post('/v5/user/password').send({ user: userEmail })
				.expect(templates.ok.status);
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
		});

		test('should send forgot password email with valid email in upper case', async () => {
			await agent.post('/v5/user/password').send({ user: userEmail.toUpperCase() })
				.expect(templates.ok.status);
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
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
			const res = await agent.put('/v5/user/password').send({ newPassword: 'abc', token: 'some random token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user is not found', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'some random token', user: 'invalid user' })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user has no token', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'some random token', user: testUser.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user has expired token', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: expiredPasswordToken.token, user: testUserWithExpiredToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if user token is different than the one provided', async () => {
			const res = await agent.put('/v5/user/password').send({ newPassword: generateRandomString(), token: 'different token', user: testUserWithToken.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
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
				.expect(templates.invalidArguments.status);

			// trying to log in with the new password should succeed
			await testSession.post('/v5/login/').send({ user: testUserWithToken.user, password: newPassword })
				.expect(templates.ok.status);
			await testSession.post('/v5/logout/');
		});
	});
};

const testSignUp = () => {
	describe('Sign a user up', () => {
		const newUserData = {
			username: generateRandomString(),
			email: 'newEmail@email.com',
			password: generateRandomString(),
			firstName: generateRandomString(),
			lastName: generateRandomString(),
			countryCode: 'GB',
			company: generateRandomString(),
			mailListAgreed: true,
		};

		test('should fail if the username already exists', async () => {
			const res = await agent.post('/v5/user').send({ ...newUserData, username: testUser.user })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the email already exists', async () => {
			const res = await agent.post('/v5/user').send({ ...newUserData, email: userEmail })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if there are missing body params', async () => {
			const res = await agent.post('/v5/user').send({ ...newUserData, firstName: undefined })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should sign a user up', async () => {
			await agent.post('/v5/user').send(newUserData)
				.expect(templates.ok.status);
		});
	});
};

const testVerify = () => {
	describe('Verify a user', () => {
		afterEach(async () => {
			// set the user back to inactive
			await updateProfile(nonVerifiedUser.user, {
				inactive: true,
				'emailVerifyToken.token': validEmailToken.token,
				'emailVerifyToken.expiredAt': validEmailToken.expiredAt,
			});
		});

		test('should fail if the user does not exists', async () => {
			const res = await agent.post('/v5/user/verify').send({ username: 'nonExistingUser', token: validEmailToken })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if no token is provided', async () => {
			const res = await agent.post('/v5/user/verify').send({ username: nonVerifiedUser })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if token is expired', async () => {
			const res = await agent.post('/v5/user/verify').send({ username: nonVerifiedUserWithExpiredToken, token: expiredEmailToken })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if token does not belong to the user', async () => {
			const res = await agent.post('/v5/user/verify').send({ username: nonVerifiedUser, token: 'someRandomToken' })
				.expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should verify the user', async () => {
			// trying to log in before verification should fail
			await testSession.post('/v5/login/').send({ user: nonVerifiedUser.user, password: nonVerifiedUser.password })
				.expect(templates.userNotVerified.status);

			await agent.post('/v5/user/verify').send({ username: nonVerifiedUser.user, token: validEmailToken.token })
				.expect(templates.ok.status);

			// trying to log in after verification should succeed
			await testSession.post('/v5/login/').send({ user: nonVerifiedUser.user, password: nonVerifiedUser.password })
				.expect(templates.ok.status);
			await testSession.post('/v5/logout/');

			// check that a teamspace has been created
			const userTeamspaces = await agent.get(`/v5/teamspaces?key=${nonVerifiedUser.apiKey}`)
				.expect(templates.ok.status);
			expect(userTeamspaces.body.teamspaces.length).toEqual(2);

			// trying to verify the user again should fail
			await agent.post('/v5/user/verify').send({ username: nonVerifiedUser.user, token: validEmailToken.token })
				.expect(templates.invalidArguments.status);
		});

		test('should verify the user and have access to inviter\'s teamspace if there is an invitation pending', async () => {
			const invitation = {
				_id: nonVerifiedUserEmail,
				teamSpaces: [
					{
						teamspace,
						job: 'Main Contractor',
						permissions: {
							teamspace_admin: true,
						},
					},
				],
			};

			// adding the invitation
			insertOne('admin', 'invitations', invitation);

			// verifying the user
			await agent.post('/v5/user/verify').send({ username: nonVerifiedUser.user, token: validEmailToken.token })
				.expect(templates.ok.status);

			// the invitation should be deleted after verification
			await testSession.post('/v5/login/').send({ user: nonVerifiedUser.user, password: nonVerifiedUser.password })
				.expect(templates.ok.status);
			const invitationsRes = await testSession.get('/invitations');
			expect(invitationsRes.body).toEqual({});

			const teamspacesRes = await testSession.get('/v5/teamspaces');
			const expectedList = [
				{ name: nonVerifiedUser.user, isAdmin: true },
				{ name: teamspace.name, isAdmin: true },
			];
			expect(teamspacesRes.body.teamspaces.length).toEqual(expectedList.length);
			expect(teamspacesRes.body.teamspaces).toEqual(expect.arrayContaining(expectedList));
			await testSession.post('/v5/logout/');
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
	testSignUp();
	testVerify();
	// should be called last as they update user Api key
	testGenerateApiKey();
	testDeleteApiKey();
});
