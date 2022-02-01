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
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');
const session = require('supertest-session');
const AdminProcessor = require('../../../../../src/v5/processors/admin')

const { templates } = require(`${src}/utils/responseCodes`);

let testSession;
let server;
let agent;

// This is the user being used for tests
const testAdminUser = ServiceHelper.generateUserCredentials();
const testLicenseUser = ServiceHelper.generateUserCredentials();
const testSupportUser = ServiceHelper.generateUserCredentials();

const testAdminUserEmail = 'system_admin@email.com';
const testSupportUserEmail = 'support_admin@email.com';
const testLicenseUserEmail = 'license_admin@email.com';

const setupData = async () => {
	await Promise.all([
		ServiceHelper.db.createUser(testAdminUser, [], { email: testAdminUserEmail }),
		AdminProcessor.grantRolesToUser("testing",[testAdminUser.user],[AdminProcessor.SYSTEM_ADMIN]),
		ServiceHelper.db.createUser(testLicenseUser, [], { email: testLicenseUserEmail }),
		ServiceHelper.db.createUser(testSupportUser, [], { email: testSupportUserEmail }),
	]);
};

// const testLogin = () => {
// 	describe('Login user', () => {
// 		test('should log in a user using username', async () => {
// 			await agent.post('/v5/login/')
// 				.send({ user: testAdminUser.user, password: testAdminUser.password })
// 				.expect(templates.ok.status);
// 		});

// 		test('should log in a user using email', async () => {
// 			await agent.post('/v5/login/')
// 				.send({ user: userEmail, password: testAdminUser.password })
// 				.expect(templates.ok.status);
// 		});

// 		test('should fail with an incorrect username', async () => {
// 			const res = await agent.post('/v5/login/')
// 				.send({ user: 'randomUsername', password: testAdminUser.password })
// 				.expect(templates.incorrectUsernameOrPassword.status);
// 			expect(res.body.code).toEqual(templates.incorrectUsernameOrPassword.code);
// 		});

// 		test('should fail with an invalid username', async () => {
// 			const res = await agent.post('/v5/login/')
// 				.send({ user: 12345, password: testAdminUser.password })
// 				.expect(templates.invalidArguments.status);
// 			expect(res.body.code).toEqual(templates.invalidArguments.code);
// 		});

// 		test('should fail with a user that has already logged in', async () => {
// 			await testSession.post('/v5/login/')
// 				.send({ user: testAdminUser.user, password: testAdminUser.password })
// 				.expect(templates.ok.status);
// 			const res = await testSession.post('/v5/login/')
// 				.send({ user: testAdminUser.user, password: testAdminUser.password })
// 				.expect(templates.alreadyLoggedIn.status);
// 			expect(res.body.code).toEqual(templates.alreadyLoggedIn.code);
// 		});

// 		test('should fail with an incorrect password', async () => {
// 			const res = await agent.post('/v5/login/')
// 				.send({ user: testAdminUser.user, password: 'wrongPassword' })
// 				.expect(templates.incorrectUsernameOrPassword.status);
// 			expect(res.body.code).toEqual(templates.incorrectUsernameOrPassword.code);
// 		});

// 		test('should fail with a locked account', async () => {
// 			const res = await agent.post('/v5/login/')
// 				.send({ user: lockedUser.user, password: lockedUser.password })
// 				.expect(templates.tooManyLoginAttempts.status);
// 			expect(res.body.code).toEqual(templates.tooManyLoginAttempts.code);
// 		});

// 		test('should log in with a locked account with the lockout duration expired', async () => {
// 			await agent.post('/v5/login/')
// 				.send({ user: lockedUserWithExpiredLock.user, password: lockedUserWithExpiredLock.password })
// 				.expect(templates.ok.status);
// 		});

// 		test('should fail with wrong password and many failed login attempts', async () => {
// 			const res = await agent.post('/v5/login/')
// 				.send({ user: userWithFailedAttempts.user, password: 'wrongPassword' })
// 				.expect(templates.incorrectUsernameOrPassword.status);
// 			expect(res.body.code).toEqual(templates.incorrectUsernameOrPassword.code);
// 			expect(res.body.message).toEqual('Incorrect username or password (Remaining attempts: 3)');
// 		});
// 	});
// };

// const testLogout = () => {
// 	describe('Logout user', () => {
// 		test('should fail if the user is not logged in', async () => {
// 			const res = await agent.post('/v5/logout/').expect(templates.notLoggedIn.status);
// 			expect(res.body.code).toEqual(templates.notLoggedIn.code);
// 		});

// 		test('should fail if the user has a session via an API key', async () => {
// 			const res = await agent.post(`/v5/logout?${testAdminUser.apiKey}`).expect(templates.notLoggedIn.status);
// 			expect(res.body.code).toEqual(templates.notLoggedIn.code);
// 		});

// 		test('should log the user out if they are logged in', async () => {
// 			await testSession.post('/v5/login/').send({ user: testAdminUser.user, password: testAdminUser.password });
// 			await testSession.post('/v5/logout/').expect(200);
// 		});
// 	});
// };

const testHasSystemRole = () => {
	describe('This tests getting the existing users and roles assigned', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/admin/roles/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/admin/roles/?${testAdminUser.apiKey}`).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should return the username if the user is logged in', async () => {
			await testSession.post('/v5/login/').send({ user: testAdminUser.user, password: testAdminUser.password });
			const res = await testSession.get('/v5/admin/roles/').expect(200);
			expect(res.body).toEqual({ users: [{ user: testAdminUser.user, roles: [AdminProcessor.SYSTEM_ADMIN] } ] });
		});
	});
};

const testDoesNotHaveSystemRole = () => {
	describe('This tests a user not having system_admin roles', () => {
		test('should fail if the user is not logged in', async () => {
			const res = await agent.get('/v5/admin/roles/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user has a session via an API key', async () => {
			const res = await agent.get(`/v5/admin/roles/?${testLicenseUser.apiKey}`).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have permission to read roles', async () => {
			await testSession.post('/v5/login/').send({ user: testLicenseUser.user, password: testLicenseUser.password });
			const res = await testSession.get('/v5/admin/roles/').expect(200);
			expect(res.body.code).toEqual(templates.notAuthorizedForbidden.code);
		});

	});
};

describe('E2E routes/admin', () => {
	beforeAll(async () => {
		const app = await ServiceHelper.app();
		server = app;
		testSession = session(app);
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testHasSystemRole();
	testDoesNotHaveSystemRole();
	testSearchUsers();
	testSearchRoles();
	testPutRoute();
	testPatchRoute();
});
