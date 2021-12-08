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
const { src } = require('../../helper/path');
const session = require('supertest-session');

const { templates } = require(`${src}/utils/responseCodes`);

let testSession;
let server;
let agent;

// This is the user being used for tests
const testUser = ServiceHelper.generateUserCredentials();
const lockedUser = ServiceHelper.generateUserCredentials();
const lockedUserWithExpiredLock = ServiceHelper.generateUserCredentials();
const userWithFailedAttempts = ServiceHelper.generateUserCredentials();
const userEmail = 'example@email.com';

const setupData = async () => {
	await Promise.all([
		ServiceHelper.db.createUser(testUser, [], { email: userEmail }),
		ServiceHelper.db.createUser(lockedUser, [], { loginInfo: { failedLoginCount: 10,
			lastFailedLoginAt: new Date() } }),
		ServiceHelper.db.createUser(lockedUserWithExpiredLock, [], { loginInfo: { failedLoginCount: 10,
			lastFailedLoginAt: new Date('1/1/18') } }),
		ServiceHelper.db.createUser(userWithFailedAttempts, [], { loginInfo: { failedLoginCount: 6,
			lastFailedLoginAt: new Date() } }),
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

		test('should return the username if the user is logged in', async () => {
			await testSession.post('/v5/login/').send({ user: testUser.user, password: testUser.password });
			const res = await testSession.get('/v5/login/').expect(200);
			expect(res.body).toEqual({ username: testUser.user });
		});
	});
};

describe('E2E routes/users', () => {
	beforeAll(async () => {
		const app = await ServiceHelper.app();
		server = app;
		testSession = session(app);
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testLogin();
	testLogout();
	testGetUsername();
});
