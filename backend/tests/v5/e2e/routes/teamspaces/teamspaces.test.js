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
const { generateRandomNumber } = require('../../../helper/services');
const config = require('../../../../../src/v5/utils/config');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

// This is the user being used for tests
const testUser = ServiceHelper.generateUserCredentials();
const testUser2 = ServiceHelper.generateUserCredentials();
const userCollabs = generateRandomNumber(0);
const userWithLicense = ServiceHelper.generateUserCredentials();
const userWithLicenseUnlimitedCollabs = ServiceHelper.generateUserCredentials();
const userWithExpiredLicense = ServiceHelper.generateUserCredentials();

const usersInFirstTeamspace = [
	ServiceHelper.generateUserCredentials(),
	ServiceHelper.generateUserCredentials(),
	ServiceHelper.generateUserCredentials(),
];

// This is the list of teamspaces the user has access to
const teamspaces = [
	{ name: ServiceHelper.generateRandomString(), isAdmin: true },
	{ name: ServiceHelper.generateRandomString(), isAdmin: false },
	{ name: ServiceHelper.generateRandomString(), isAdmin: true },
];
const licenseData = generateRandomNumber(0);
const tsWithLicense = { name: ServiceHelper.generateRandomString() };
const tsWithLicenseUnlimitedCollabs = { name: ServiceHelper.generateRandomString() };
const tsWithExpiredLicense = { name: ServiceHelper.generateRandomString() };
const avatar = ServiceHelper.generateRandomString();
const tsWithAvatar = teamspaces[1].name;

const jobToUsers = [
	{ _id: 'jobA', users: [testUser, usersInFirstTeamspace[0]] },
	{ _id: 'jobB', users: [usersInFirstTeamspace[1]] },
	{ _id: 'jobC', users: [] },
];

// This is the list of teamspaces the user has access to
const breakingTSAccess = { name: ServiceHelper.generateRandomString(), isAdmin: true };

const setupData = async () => {
	await Promise.all(teamspaces.map(
		({ name, isAdmin }) => {
			const perms = isAdmin ? [testUser.user] : [];
			const customData = tsWithAvatar === name ? { avatar: { data: { buffer: avatar } } } : {};
			return ServiceHelper.db.createTeamspace(name, perms, false, customData);
		},
	));
	await ServiceHelper.db.createTeamspace(breakingTSAccess.name, [testUser2.user], true);
	await ServiceHelper.db.createTeamspace(tsWithLicense.name, [userWithLicense.user], false, {
		billing: {
			subscriptions: [
				{
					discretionary: {
						collaborators: userCollabs,
						data: licenseData,
						expiryDate: Date.now() + 100000,
					},
				},
			],
		},
	});
	await ServiceHelper.db.createTeamspace(tsWithLicenseUnlimitedCollabs.name, [userWithLicenseUnlimitedCollabs.user], false, {
		billing: {
			subscriptions: [
				{
					discretionary: {
						collaborators: 'unlimited',
						data: licenseData,
						expiryDate: Date.now() + 100000,
					},
				},
			],
		},
	});
	await ServiceHelper.db.createTeamspace(tsWithExpiredLicense.name, [userWithExpiredLicense.user], false, {
		billing: {
			subscriptions: [
				{
					discretionary: {
						collaborators: 'unlimited',
						data: licenseData,
						expiryDate: Date.now() - 100000,
					},
				},
			],
		},
	});

	await Promise.all([
		ServiceHelper.db.createUser(
			testUser,
			teamspaces.map(({ name }) => name),
		),
		ServiceHelper.db.createUser(
			userWithLicense,
			[tsWithLicense.name]
		),
		ServiceHelper.db.createUser(
			userWithLicenseUnlimitedCollabs,
			[tsWithLicenseUnlimitedCollabs.name]
		),
		ServiceHelper.db.createUser(
			userWithExpiredLicense,
			[tsWithExpiredLicense.name]
		),
		ServiceHelper.db.createUser(
			testUser2,
			[breakingTSAccess.name],
		),
		...usersInFirstTeamspace.map((user) => ServiceHelper.db.createUser(
			user,
			[teamspaces[0].name],
		)),
		ServiceHelper.db.createJobs(teamspaces[0].name, jobToUsers),
	]);
};

const testGetTeamspaceList = () => {
	describe('Get teamspace list', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get('/v5/teamspaces/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});
		test('return a teamspace list if the user has a valid session', async () => {
			const res = await agent.get(`/v5/teamspaces/?key=${testUser.apiKey}`).expect(templates.ok.status);
			expect(res.body.teamspaces.length).toBe(teamspaces.length);
			expect(res.body.teamspaces).toEqual(expect.arrayContaining(teamspaces));
		});

		test('should safely catch error if there is an internal error', async () => {
			const res = await agent.get(`/v5/teamspaces/?key=${testUser2.apiKey}`).expect(templates.unknown.status);
			expect(res.body.code).toEqual(templates.unknown.code);
		});
	});
};

const testGetTeamspaceMembers = () => {
	describe('Get teamspace members info', () => {
		const route = (ts = teamspaces[0].name) => `/v5/teamspaces/${ts}/members`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${testUser2.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route('sldkfjdl')}/?key=${testUser2.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should return list of users with their jobs with valid access rights', async () => {
			const res = await agent.get(`${route()}/?key=${testUser.apiKey}`).expect(templates.ok.status);

			const userToJob = {};

			jobToUsers.forEach(({ _id, users }) => users.forEach((user) => { userToJob[user] = _id; }));

			const expectedData = [...usersInFirstTeamspace, testUser].map(({ user, basicData }) => {				
				const { firstName, lastName, billing } = basicData;
				const data = {
					firstName,
					lastName,
					user,
					company: billing?.billingInfo?.company,
				};

				if (userToJob[user]) {
					data.job = userToJob;
				}

				return data;
			});
			expect(res.body.members.length).toBe(expectedData.length);
			expect(res.body.members).toEqual(expect.arrayContaining(expectedData));
		});
	});
};

const testGetAvatar = () => {
	describe('Get teamspace avatar', () => {
		const route = (ts = teamspaces[0].name) => `/v5/teamspaces/${ts}/avatar`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${testUser2.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route('sldkfjdl')}/?key=${testUser2.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test(`should return ${templates.avatarNotFound.code} if the teamspace does not have an avatar`, async () => {
			const res = await agent.get(`${route()}/?key=${testUser.apiKey}`).expect(templates.avatarNotFound.status);
			expect(res.body.code).toEqual(templates.avatarNotFound.code);
		});

		test('should return avatar if the teamspace has one', async () => {
			const res = await agent.get(`${route(tsWithAvatar)}/?key=${testUser.apiKey}`).expect(templates.ok.status);
			expect(res.text).toEqual(avatar);
		});
	});
};

const testGetQuotaInfo = () => {
	describe('Get quota info', () => {
		const route = (ts = tsWithLicense.name) => `/v5/teamspaces/${ts}/quota`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${testUser2.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route('sldkfjdl')}/?key=${userWithLicense.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test(`should return ${templates.licenceExpired.code} if the user has an expired license`, async () => {			
			const res = await agent.get(`${route(tsWithExpiredLicense.name)}/?key=${userWithExpiredLicense.apiKey}`).expect(templates.licenceExpired.status);
			expect(res.body.code).toEqual(templates.licenceExpired.code);
		});
		
		test(`should return quota if the user has a valid license`, async () => {			
			const res = await agent.get(`${route()}/?key=${userWithLicense.apiKey}`)
				.expect(templates.ok.status);			
			const collaboratorLimit = config.subscriptions?.basic?.collaborators === 'unlimited' ?
				'unlimited' : config.subscriptions?.basic?.collaborators + userCollabs;
			const spaceLimit = config.subscriptions?.basic?.data + licenseData;
			expect(res.body).toEqual( {collaboratorLimit, spaceLimit, spaceUsed: 0});
		});

		test(`should return quota if the user has a valid license and unlimited collaborators`, async () => {			
			const res = await agent.get(`${route(tsWithLicenseUnlimitedCollabs.name)}/?key=${userWithLicenseUnlimitedCollabs.apiKey}`)
				.expect(templates.ok.status);			
			const spaceLimit = config.subscriptions?.basic?.data + licenseData;
			expect(res.body).toEqual( {collaboratorLimit: 'unlimited', spaceLimit, spaceUsed: 0});
		});
	});
};

describe('E2E routes/teamspaces', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetTeamspaceList();
	testGetTeamspaceMembers();
	testGetAvatar();
	testGetQuotaInfo();
});
