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

const { SYSTEM_ADMIN, LICENSE_ADMIN, SUPPORT_ADMIN } = require('../../../../../src/v5/utils/permissions/permissions.constants');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');
const session = require('supertest-session');
const AdminProcessor = require('../../../../../src/v5/processors/admin');

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

const goldenAdminUser = { users: [{ user: testAdminUser.user, roles: [SYSTEM_ADMIN] }] };
// const goldenLicenseUser = { users: [{ user: testLicenseUser.user, roles: [LICENSE_ADMIN] }] };
// const goldenSupportUser = { users: [{ user: testSupportUser.user, roles: [SUPPORT_ADMIN] }] };
// const goldenAllUsers = { users: [...goldenAdminUser.users, ...goldenLicenseUser.users, ...goldenSupportUser.users] };

const setupData = async () => {
	await Promise.all([
		ServiceHelper.db.createUser(testAdminUser, [], { email: testAdminUserEmail }),
		AdminProcessor.grantRolesToUser('testing', [testAdminUser.user], [SYSTEM_ADMIN]),
		ServiceHelper.db.createUser(testLicenseUser, [], { email: testLicenseUserEmail }),
		ServiceHelper.db.createUser(testSupportUser, [], { email: testSupportUserEmail }),
	]);
};
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

		test('should return the usernames if the user is logged in', async () => {
			await testSession.post('/v5/login/').send({ user: testAdminUser.user, password: testAdminUser.password });
			const res = await testSession.get('/v5/admin/roles/').expect(200);
			expect(res.body).toEqual(goldenAdminUser);
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
			const res = await testSession.get('/v5/admin/roles/').expect(templates.notAuthorizedForbidden.code);
			expect(res.body.code).toEqual(templates.notAuthorizedForbidden.code);
		});
	});
};

const testSearchUsersAndRoles = () => {
	describe('This tests a searching for a specific user', () => {
		test('should succeed', async () => {
			await testSession.post('/v5/login/').send({ user: testAdminUser.user, password: testAdminUser.password });
			const res = await testSession.get('/v5/admin/roles/').expect(200);
			expect(res.body.code).toEqual(templates.ok.status);
		});

		test('should succeed searching system user', async () => {
			await testSession.post('/v5/login/').send({ user: testAdminUser.user, password: testAdminUser.password });
			const res = await testSession.get(`/v5/admin/roles/?user=${testAdminUser.user}`).expect(200);
			expect(res.body).toEqual(goldenAdminUser);
		});

		test('should succeed searching system role', async () => {
			await testSession.post('/v5/login/').send({ user: testAdminUser.user, password: testAdminUser.password });
			const res = await testSession.get(`/v5/admin/roles/?role=${SYSTEM_ADMIN}`).expect(200);
			expect(res.body).toEqual(goldenAdminUser);
		});
	});
};

const testPutRoute = () => {
	describe('This tests putting a set of roles up with Patch', () => {

	});
};

const testPatchRoute = () => {
	describe('This tests putting a set of roles up with Patch', () => {
 
	});
};


const testDeleteRoute = () => {
	describe('This tests putting a set of roles up with Delete', () => {

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
	testHasSystemRole();
	testDoesNotHaveSystemRole();
	testSearchUsersAndRoles();
	testPutRoute();
	testPatchRoute();
	testDeleteRoute();
	afterAll(() => ServiceHelper.closeApp(server));
});
