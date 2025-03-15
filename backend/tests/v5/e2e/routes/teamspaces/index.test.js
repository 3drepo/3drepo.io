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
const ServiceHelper = require('../../../helper/services');
const { image, src } = require('../../../helper/path');
const fs = require('fs');
const { generateRandomNumber, generateRandomModel, generateRandomProject, generateRandomString } = require('../../../helper/services');

const { DEFAULT_OWNER_JOB } = require(`${src}/models/jobs.constants`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);
const { ADD_ONS, ADD_ONS_MODULES } = require(`${src}/models/teamspaces.constants`);
const { updateAddOns } = require(`${src}/models/teamspaceSettings`);

let server;
let agent;
/*
const testUser = ServiceHelper.generateUserCredentials();
const testUser2 = ServiceHelper.generateUserCredentials();
const userWithLicense = ServiceHelper.generateUserCredentials();
const userWithMultipleLicenses = ServiceHelper.generateUserCredentials();
const userWithLicenseUnlimitedCollabs = ServiceHelper.generateUserCredentials();
const userWithExpiredLicense = ServiceHelper.generateUserCredentials();
const userToRemoveFromTs = ServiceHelper.generateUserCredentials();

const usersInFirstTeamspace = [
	ServiceHelper.generateUserCredentials(),
	ServiceHelper.generateUserCredentials(),
	ServiceHelper.generateUserCredentials(),
];
const userWithFsAvatar = ServiceHelper.generateUserCredentials();
const userWithNoAvatar = ServiceHelper.generateUserCredentials();
const userWithGridFsAvatar = ServiceHelper.generateUserCredentials();

// This is the list of teamspaces the user has access to
const teamspaces = [
	{ name: ServiceHelper.generateRandomString(), isAdmin: true },
	{ name: ServiceHelper.generateRandomString(), isAdmin: false },
	{ name: ServiceHelper.generateRandomString(), isAdmin: true },
];
const teamspaceWithAddOns = teamspaces[0];

const addOns = {
	[ADD_ONS.VR]: true,
	[ADD_ONS.SRC]: true,
	[ADD_ONS.HERE]: true,
	[ADD_ONS.POWERBI]: true,
	[ADD_ONS.MODULES]: Object.values(ADD_ONS_MODULES),
};

const fsAvatarData = ServiceHelper.generateRandomString();
const gridFsAvatarData = ServiceHelper.generateRandomString();
const tsWithFsAvatar = { name: ServiceHelper.generateRandomString() };
const tsWithGridFsAvatar = { name: ServiceHelper.generateRandomString() };

// license related
const licenseData = generateRandomNumber(0);
const tsWithLicense = { name: ServiceHelper.generateRandomString() };
const tsWithMultipleLicenses = { name: ServiceHelper.generateRandomString() };
const tsWithLicenseUnlimitedCollabs = { name: ServiceHelper.generateRandomString() };
const tsWithExpiredLicense = { name: ServiceHelper.generateRandomString() };

// some of its members will be removed after testRemoveTeamspaceMember
const tsWithUsersToRemove = { name: ServiceHelper.generateRandomString(), isAdmin: true };

const userCollabs = 10;

const jobToUsers = [
	{ _id: 'jobA', users: [testUser, usersInFirstTeamspace[0]] },
	{ _id: 'jobB', users: [usersInFirstTeamspace[1]] },
	{ _id: 'jobC', users: [] },
];

const project = generateRandomProject();
const projectWithImage = generateRandomProject();

const model = generateRandomModel({ collaborators: [userToRemoveFromTs.user] });
const modelWithRev = generateRandomModel();
const validExpiryDate = Date.now() + 100000;
*/
/*	await Promise.all(teamspaces.map(
		({ name, isAdmin }) => {
			const perms = isAdmin ? [testUser.user] : [];
			return ServiceHelper.db.createTeamspace(name, perms);
		},
	));

	await updateAddOns(teamspaceWithAddOns.name, addOns);

	await Promise.all([
		ServiceHelper.db.createTeamspace(tsWithFsAvatar.name, [userWithFsAvatar.user]),
		ServiceHelper.db.createTeamspace(tsWithGridFsAvatar.name, [userWithGridFsAvatar.user]),
		ServiceHelper.db.createTeamspace(tsWithLicense.name, [userWithLicense.user], {
			discretionary: {
				collaborators: userCollabs,
				data: licenseData,
				expiryDate: validExpiryDate,
			},
		}),
		ServiceHelper.db.createTeamspace(
			tsWithMultipleLicenses.name,
			[userWithMultipleLicenses.user],
			{
				discretionary: {
					collaborators: userCollabs,
					data: licenseData,
					expiryDate: validExpiryDate,
				},
				enterprise: {
					collaborators: userCollabs,
					data: licenseData,
					expiryDate: validExpiryDate - 10,
				},
			},
		),
		ServiceHelper.db.createTeamspace(tsWithLicenseUnlimitedCollabs.name,
			[userWithLicenseUnlimitedCollabs.user], {
				discretionary: {
					collaborators: 'unlimited',
					data: licenseData,
					expiryDate: validExpiryDate,
				},
			}),
		ServiceHelper.db.createTeamspace(tsWithExpiredLicense.name, [userWithExpiredLicense.user], {
			discretionary: {
				collaborators: 'unlimited',
				data: licenseData,
				expiryDate: Date.now() - 100000,
			},
		}),
		ServiceHelper.db.createTeamspace(tsWithUsersToRemove.name, [
			userToRemoveFromTs.user,
			testUser.user,
		])]);

	await Promise.all([
		ServiceHelper.db.createUser(
			testUser,
			[...teamspaces.map(({ name }) => name), tsWithUsersToRemove.name],
		),
		ServiceHelper.db.createUser(
			userWithLicense,
			[tsWithLicense.name],
		),
		ServiceHelper.db.createUser(
			userWithMultipleLicenses,
			[tsWithMultipleLicenses.name],
		),
		ServiceHelper.db.createUser(
			userWithLicenseUnlimitedCollabs,
			[tsWithLicenseUnlimitedCollabs.name, tsWithLicense.name],
		),
		ServiceHelper.db.createUser(
			userWithExpiredLicense,
			[tsWithExpiredLicense.name],
		),
		ServiceHelper.db.createUser(
			testUser2,
			[tsWithUsersToRemove.name],
		),
		ServiceHelper.db.createUser(
			userToRemoveFromTs,
			[tsWithUsersToRemove.name],
		),
		...usersInFirstTeamspace.map((user) => ServiceHelper.db.createUser(
			user,
			[teamspaces[0].name],
		)),
		ServiceHelper.db.createUser(
			userWithFsAvatar,
			[tsWithFsAvatar.name],
		),
		ServiceHelper.db.createUser(
			userWithNoAvatar,
			[tsWithGridFsAvatar.name],
		),
		ServiceHelper.db.createUser(
			userWithGridFsAvatar,
			[tsWithGridFsAvatar.name],
		),
		ServiceHelper.db.createAvatar(tsWithFsAvatar.name, 'fs', fsAvatarData),
		ServiceHelper.db.createAvatar(tsWithGridFsAvatar.name, 'gridfs', gridFsAvatarData),

		ServiceHelper.db.createJobs(teamspaces[0].name, jobToUsers),
	]);

	await Promise.all([
		ServiceHelper.db.createProject(tsWithUsersToRemove.name, project.id, project.name,
			[], [userToRemoveFromTs.user]),
		ServiceHelper.db.createProject(tsWithLicense.name, projectWithImage.id, projectWithImage.name,
			[], [userWithLicense.user]),
	]);

	await Promise.all([
		ServiceHelper.db.createProjectImage(tsWithLicense.name, projectWithImage.id, 'fs', fs.readFileSync(image)),
		ServiceHelper.db.createModel(tsWithUsersToRemove.name, model._id, model.name, model.properties),
		ServiceHelper.db.createModel(tsWithLicense.name, modelWithRev._id, modelWithRev.name,
			modelWithRev.properties),
	]);

	await ServiceHelper.db.createRevision(tsWithLicense.name, project.id, modelWithRev._id,
		ServiceHelper.generateRevisionEntry(false, true));
}; */

const testGetTeamspaceList = () => {
	describe('Get teamspace list', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const teamspaces = times(5, () => ServiceHelper.generateRandomString());
		const teamspacesWithAdmin = times(5, () => ServiceHelper.generateRandomString());

		beforeAll(async () => {
			await Promise.all(teamspaces.map((ts) => ServiceHelper.db.createTeamspace(ts)));
			await ServiceHelper.db.createUser(testUser, teamspaces);
			await Promise.all([
				...teamspacesWithAdmin.map((ts) => ServiceHelper.db.createTeamspace(ts, [testUser.user])),
				...times(5, () => ServiceHelper.db.createTeamspace(ServiceHelper.generateRandomString())),

			]);
		});
		test('should fail without a valid session', async () => {
			const res = await agent.get('/v5/teamspaces/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});
		test('return a teamspace list if the user has a valid session', async () => {
			const res = await agent.get(`/v5/teamspaces/?key=${testUser.apiKey}`).expect(templates.ok.status);
			const expectedList = [
				...teamspaces.map((name) => ({ isAdmin: false, name })),
				...teamspacesWithAdmin.map((name) => ({ isAdmin: true, name })),
			];
			ServiceHelper.outOfOrderArrayEqual(expectedList, res.body.teamspaces);
		});
	});
};

const testGetTeamspaceMembers = () => {
	describe('Get teamspace members info', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();
		const jobToUsers = times(3, () => ({
			_id: ServiceHelper.generateRandomString(),
			users: [],
		}));

		const members = times(10, (i) => {
			const mem = ServiceHelper.generateUserCredentials();
			jobToUsers[i % 2].users.push(mem.user);

			return mem;
		});

		const teamspace = ServiceHelper.generateRandomString();

		const route = (ts = teamspace) => `/v5/teamspaces/${ts}/members`;

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await ServiceHelper.db.createTeamspace(teamspace, [testUser.user]);
			await Promise.all(
				members.map((user) => ServiceHelper.db.createUser(user, [teamspace])),
			);
			await ServiceHelper.db.createJobs(teamspace, jobToUsers);
		});

		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${userNoAccess.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route(ServiceHelper.generateRandomString())}/?key=${userNoAccess.apiKey}`)
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should return list of users with their jobs with valid access rights', async () => {
			const res = await agent.get(`${route()}/?key=${testUser.apiKey}`).expect(templates.ok.status);

			const userToJob = {};

			jobToUsers.forEach(({ _id, users }) => users.forEach((user) => { userToJob[user] = _id; }));

			const expectedData = [testUser, ...members].map(({ user, basicData }) => {
				const { firstName, lastName, billing } = basicData;
				const data = {
					firstName,
					lastName,
					user,
					company: billing?.billingInfo?.company,
				};

				if (userToJob[user]) {
					data.job = userToJob[user];
				}

				return data;
			});
			expectedData.push({ job: DEFAULT_OWNER_JOB, user: teamspace });

			console.log(res.body.members, expectedData);
			ServiceHelper.outOfOrderArrayEqual(res.body.members, expectedData);
		});
	});
};

const testGetAvatar = () => {
	describe('Get teamspace avatar', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();

		const teamspaceWithAvatar = ServiceHelper.generateRandomString();
		const teamspaceWithoutAvatar = ServiceHelper.generateRandomString();
		const fsAvatarData = ServiceHelper.generateRandomString();

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await Promise.all([
				ServiceHelper.db.createTeamspace(teamspaceWithAvatar, [testUser.user]),
				ServiceHelper.db.createTeamspace(teamspaceWithoutAvatar, [testUser.user]),
			]);
			await ServiceHelper.db.createAvatar(teamspaceWithAvatar, 'fs', fsAvatarData);
		});

		const route = (key, ts = teamspaceWithAvatar) => `/v5/teamspaces/${ts}/avatar${key ? `?key=${key}` : ''}`;

		describe.each([
			['the user does not have a valid session', route(), false, templates.notLoggedIn],
			['the user does not have access to the teamspace', route(userNoAccess.apiKey), false, templates.teamspaceNotFound],
			['the teamspace does not exist', route(userNoAccess.apiKey, ServiceHelper.generateRandomString()), false, templates.teamspaceNotFound],
			['the teamspace does not have an avatar', route(testUser.apiKey, teamspaceWithoutAvatar), false, templates.fileNotFound],
			['the teamspace has avatar', route(testUser.apiKey), true, Buffer.from(fsAvatarData)],

		])('', (desc, url, success, expectedData) => {
			test(`Should ${success ? 'succeed' : `fail with ${expectedData?.code}`} if ${desc}`, async () => {
				const expectedStatus = expectedData?.status ?? templates.ok.status;
				const res = await agent.get(url).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(Buffer.from(fsAvatarData));
				} else {
					expect(res.body.code).toEqual(expectedData.code);
				}
			});
		});
	});
};

const testGetQuotaInfo = () => {
	describe('Get quota info', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();
		const userNotAdmin = ServiceHelper.generateUserCredentials();

		const teamspaceWithLicense = ServiceHelper.generateRandomString();
		const teamspaceWithExpiredLicense = ServiceHelper.generateRandomString();
		const teamspaceWithoutLicense = ServiceHelper.generateRandomString();

		const activeLicense = {
			discretionary: {
				collaborators: 10,
				data: 1024,
				expiryDate: Date.now() + 10000,
			} };
		const collaboratorLimit = config.subscriptions?.basic?.collaborators === 'unlimited'
			? 'unlimited' : config.subscriptions?.basic?.collaborators + activeLicense.discretionary.collaborators;
		const spaceLimitInBytes = (config.subscriptions?.basic?.data + activeLicense.discretionary.data) * 1024 * 1024;
		const expectedQuota = {
			expiryDate: activeLicense.discretionary.expiryDate,
			freeTier: false,
			data: { used: 642, available: spaceLimitInBytes },
			seats: { used: 3, available: collaboratorLimit },
		};

		const freeSpaceLimitInBytes = config.subscriptions?.basic?.data * 1024 * 1024;

		const expectedFreeQuota = {
			expiryDate: null,
			freeTier: true,
			data: { used: 0, available: freeSpaceLimitInBytes },
			seats: { used: 1, available: config.subscriptions.basic.collaborators },
		};

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await Promise.all([
				ServiceHelper.db.createTeamspace(teamspaceWithLicense, [testUser.user], activeLicense),
				ServiceHelper.db.createTeamspace(teamspaceWithExpiredLicense, [testUser.user]),
				ServiceHelper.db.createTeamspace(teamspaceWithoutLicense, [testUser.user], { discretionary: {
					collaborators: 'unlimited',
					data: 1024,
					expiryDate: Date.now() - 100000,
				} }),

			]);
			await ServiceHelper.db.createUser(userNotAdmin, [teamspaceWithLicense, teamspaceWithoutLicense]);

			// occupy some space on the teamspaceWithLicense
			const projectWithImage = generateRandomProject();
			const modelWithRev = generateRandomModel();
			await ServiceHelper.db.createProject(teamspaceWithLicense, projectWithImage.id, projectWithImage.name);
			await Promise.all([
				ServiceHelper.db.createProjectImage(teamspaceWithLicense.name,
					projectWithImage.id, 'fs', fs.readFileSync(image)),
				ServiceHelper.db.createModel(teamspaceWithLicense, modelWithRev._id, modelWithRev.name,
					modelWithRev.properties)]);
			await ServiceHelper.db.createRevision(teamspaceWithLicense.name, projectWithImage.id, modelWithRev._id,
				ServiceHelper.generateRevisionEntry(false, true));
		});
		const route = (key, ts = teamspaceWithLicense) => `/v5/teamspaces/${ts}/quota${key ? `?key=${key}` : ''}`;

		describe.each([
			['the user does not have a valid session', route(), false, templates.notLoggedIn],
			['the teamspace does not exist', route(userNoAccess.apiKey, ServiceHelper.generateRandomString()), false, templates.teamspaceNotFound],
			['the user does not have access to the teamspace', route(userNoAccess.apiKey), false, templates.teamspaceNotFound],
			['the user does not have admin permissions to the teamspace', route(userNotAdmin.apiKey), false, templates.notAuthorized],
			['the teamspace license has expired', route(testUser.apiKey, teamspaceWithExpiredLicense), false, templates.licenceExpired],
			['the teamspace has a valid license', route(testUser.apiKey), true, expectedQuota],
			['the teamspace has no license', route(testUser.apiKey, teamspaceWithoutLicense), true, expectedFreeQuota],

		])('', (desc, url, success, expectedData) => {
			test(`Should ${success ? 'succeed' : `fail with ${expectedData?.code}`} if ${desc}`, async () => {
				const expectedStatus = expectedData?.status ?? templates.ok.status;
				const res = await agent.get(url).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedData);
				} else {
					expect(res.body.code).toEqual(expectedData.code);
				}
			});
		});
	});
};

const testRemoveTeamspaceMember = () => {
	describe('Remove teamspace member', () => {
		const route = (ts = tsWithUsersToRemove.name,
			username = userToRemoveFromTs.user) => `/v5/teamspaces/${ts}/members/${username}`;

		test('should fail without a valid session', async () => {
			const res = await agent.delete(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.delete(`${route()}/?key=${userWithLicense.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user does not have admin permissions to the teamspace', async () => {
			const res = await agent.delete(`${route()}/?key=${testUser2.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.delete(`${route('sldkfjdl')}/?key=${testUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user to be removed does not exist', async () => {
			const res = await agent.delete(`${route(tsWithUsersToRemove.name, generateRandomString())}/?key=${testUser.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the user to be removed is not a member of the teamspace', async () => {
			const res = await agent.delete(`${route(tsWithUsersToRemove.name, userWithLicense.user)}/?key=${testUser.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the the user to remove is the owner of the teamspace', async () => {
			const res = await agent.delete(`${route(tsWithUsersToRemove.name, tsWithUsersToRemove.name)}/?key=${testUser.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should remove another user from the teamspace', async () => {
			await agent.delete(`${route()}/?key=${testUser.apiKey}`).expect(templates.ok.status);
			const tsMembersRes = await agent.get(`/v5/teamspaces/${tsWithUsersToRemove.name}/members?key=${testUser.apiKey}`);
			const removedUser = tsMembersRes.body.members.find((m) => m.user === userToRemoveFromTs.user);
			expect(removedUser).toEqual(undefined);
			const projectDataRes = await agent.get(`/${tsWithUsersToRemove.name}/projects?key=${testUser.apiKey}`);
			const projectPermissions = projectDataRes.body.find((p) => p._id === project.id).permissions;
			const removedProjectPermission = projectPermissions.find((p) => p.user === userToRemoveFromTs.user);
			expect(removedProjectPermission).toEqual(undefined);
			const modelPermissionsRes = await agent.get(`/${tsWithUsersToRemove.name}/${model._id}/permissions?key=${testUser.apiKey}`);
			const removedModelPermission = modelPermissionsRes.body.find((p) => p.user === userToRemoveFromTs.user);
			expect(removedModelPermission).toEqual(undefined);
		});

		test('should remove themselves from the teamspace (team member)', async () => {
			await agent.delete(`${route(tsWithUsersToRemove.name, testUser2.user)}/?key=${testUser2.apiKey}`).expect(templates.ok.status);
			const tsMembersRes = await agent.get(`/v5/teamspaces/${tsWithUsersToRemove.name}/members?key=${testUser.apiKey}`);
			const removedUser = tsMembersRes.body.members.find((m) => m.user === testUser2.user);
			expect(removedUser).toEqual(undefined);
			const projectDataRes = await agent.get(`/${tsWithUsersToRemove.name}/projects?key=${testUser.apiKey}`);
			const projectPermissions = projectDataRes.body.find((p) => p._id === project.id).permissions;
			const removedProjectPermission = projectPermissions.find((p) => p.user === testUser2.user);
			expect(removedProjectPermission).toEqual(undefined);
			const modelPermissionsRes = await agent.get(`/${tsWithUsersToRemove.name}/${model._id}/permissions?key=${testUser.apiKey}`);
			const removedModelPermission = modelPermissionsRes.body.find((p) => p.user === testUser2.user);
			expect(removedModelPermission).toEqual(undefined);
		});
	});
};

const testGetMemberAvatar = () => {
	describe('Get teamspace member avatar', () => {
		const route = (ts = tsWithGridFsAvatar.name, member = tsWithGridFsAvatar.name) => `/v5/teamspaces/${ts}/members/${member}/avatar`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${testUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail the requested user is not a member of the teamspace', async () => {
			const res = await agent.get(`${route(tsWithGridFsAvatar.name, testUser.user)}/?key=${userWithGridFsAvatar.apiKey}`).expect(templates.userNotFound.status);
			expect(res.body.code).toEqual(templates.userNotFound.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route('sldkfjdl')}/?key=${userWithGridFsAvatar.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test(`should return ${templates.fileNotFound.code} if the member does not have an avatar`, async () => {
			const res = await agent.get(`${route(tsWithGridFsAvatar.name, userWithNoAvatar.user)}/?key=${userWithGridFsAvatar.apiKey}`).expect(templates.fileNotFound.status);
			expect(res.body.code).toEqual(templates.fileNotFound.code);
		});

		test('should return member avatar', async () => {
			const res = await agent.get(`${route()}/?key=${userWithGridFsAvatar.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(Buffer.from(gridFsAvatarData));
		});
	});
};

const testGetAddOns = () => {
	describe('Get add ons', () => {
		const route = (key, ts) => `/v5/teamspaces/${ts}/addOns${key ? `?key=${key}` : ''}`;

		describe.each([
			['user does not have a valid session', undefined, teamspaceWithAddOns.name, false, templates.notLoggedIn],
			['teamspace does not exist', testUser.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', testUser2.apiKey, teamspaceWithAddOns.name, false, templates.teamspaceNotFound],
			['teamspace has add ons', testUser.apiKey, teamspaceWithAddOns.name, true, addOns],
			['teamspace has no add ons', testUser.apiKey, teamspaces[2].name, true, {}],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(route(key, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedRes);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetTeamspaceList();
	testGetTeamspaceMembers();
	testGetAvatar();
	testGetQuotaInfo();
	/* testRemoveTeamspaceMember();
	testGetMemberAvatar();
	testGetAddOns(); */
});
