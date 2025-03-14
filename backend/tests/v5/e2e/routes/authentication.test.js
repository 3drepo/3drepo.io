/**
 *  Copyright (C) 2025 3D Repo Ltd
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

/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *
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
/*
// This is the user being used for tests
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
}; */

const testAuthenticate = () => {
	describe('Get authenticate link', () => {
		const testUser = ServiceHelper.generateUserCredentials();

		beforeAll(async () => {
			await ServiceHelper.db.createUser(testUser);
		});

		test('Should respond with the link to the authenticator if the user is not logged in', async () => {
			const redirectURI = ServiceHelper.generateRandomString();
			const res = await agent.get(`/v5/authentication/authenticate?redirectUri=${redirectURI}`)
				.expect(templates.ok.status);
			expect(res.body).toEqual({ link: expect.any(String) });
		});

		test(`Should respond with ${templates.invalidArguments.code} if redirectUri is not provided`, async () => {
			const res = await agent.get('/v5/authentication/authenticate')
				.expect(templates.invalidArguments.status);
			expect(res.body).toEqual(expect.objectContaining({ ...templates.invalidArguments,
				message: 'redirectUri(query string) is required' }));
		});

		test(`Should respond with ${templates.alreadyLoggedIn.code} if the user is logged in`, async () => {
			const sessionedAgent = SessionTracker(agent);
			await sessionedAgent.login(testUser);
			const res = await sessionedAgent.get('/v5/authentication/authenticate')
				.expect(templates.alreadyLoggedIn.status);

			expect(res.body).toEqual(expect.objectContaining(templates.alreadyLoggedIn));
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	testAuthenticate();

	afterAll(() => ServiceHelper.closeApp(server));
});
