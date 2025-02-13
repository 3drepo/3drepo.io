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
const { image, src } = require('../../../helper/path');
const fs = require('fs');
const { generateRandomNumber, generateRandomModel, generateRandomProject, generateRandomString } = require('../../../helper/services');

const { DEFAULT_OWNER_ROLE } = require(`${src}/models/roles.constants`);
const config = require(`${src}/utils/config`);
const { updateSecurityRestrictions } = require(`${src}/models/teamspaceSettings`);

const { templates } = require(`${src}/utils/responseCodes`);
const { ADD_ONS, ADD_ONS_MODULES } = require(`${src}/models/teamspaces.constants`);
const { updateAddOns } = require(`${src}/models/teamspaceSettings`);

let server;
let agent;

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

const roles = [
	ServiceHelper.generateRole([testUser.user, usersInFirstTeamspace[0].user]),
	ServiceHelper.generateRole([testUser.user, usersInFirstTeamspace[1].user]),
	ServiceHelper.generateRole(),
];

const project = generateRandomProject();
const projectWithImage = generateRandomProject();

const model = generateRandomModel({ collaborators: [userToRemoveFromTs.user] });
const modelWithRev = generateRandomModel();
const validExpiryDate = Date.now() + 100000;

const setupData = async () => {
	await Promise.all(teamspaces.map(
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

		ServiceHelper.db.createRoles(teamspaces[0].name, roles),
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
};

const testGetTeamspaceList = () => {
	describe('Get teamspace list', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get('/v5/teamspaces/').expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});
		test('return a teamspace list if the user has a valid session', async () => {
			const res = await agent.get(`/v5/teamspaces/?key=${testUser.apiKey}`).expect(templates.ok.status);
			expect(res.body.teamspaces.length).toBe(teamspaces.concat([tsWithUsersToRemove]).length);
			expect(res.body.teamspaces).toEqual(expect.arrayContaining(teamspaces));
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

		test('should return list of users with their roles with valid access rights', async () => {
			const res = await agent.get(`${route()}/?key=${testUser.apiKey}`).expect(templates.ok.status);

			const userToRoles = {};

			roles.forEach(({ _id, users }) => users.forEach((user) => {
				if (!userToRoles[user]) {
					userToRoles[user] = [];
				}

				userToRoles[user].push(_id);
			}));

			const expectedData = [...usersInFirstTeamspace, testUser].map(({ user, basicData }) => {
				const { firstName, lastName, billing } = basicData;
				const data = {
					firstName,
					lastName,
					user,
					company: billing?.billingInfo?.company,
				};

				if (userToRoles[user]) {
					data.roles = userToRoles[user];
				}

				return data;
			});

			const allRoles = await agent.get(`/v5/teamspaces/${teamspaces[0].name}/roles?key=${testUser.apiKey}`);
			const adminRoleId = allRoles.body.roles.find((r) => r.name === DEFAULT_OWNER_ROLE)._id;
			expectedData.push({ roles: [adminRoleId], user: teamspaces[0].name });

			expect(res.body.members.length).toBe(expectedData.length);
			expect(res.body.members).toEqual(expect.arrayContaining(expectedData));
		});
	});
};

const testGetAvatar = () => {
	describe('Get teamspace avatar', () => {
		const route = (ts = tsWithFsAvatar.name) => `/v5/teamspaces/${ts}/avatar`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user does not have access to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${testUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route('sldkfjdl')}/?key=${testUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test(`should return ${templates.fileNotFound.code} if the teamspace does not have an avatar`, async () => {
			const res = await agent.get(`${route(teamspaces[0].name)}/?key=${testUser.apiKey}`).expect(templates.fileNotFound.status);
			expect(res.body.code).toEqual(templates.fileNotFound.code);
		});

		test('should return teamspace fs avatar', async () => {
			const res = await agent.get(`${route()}/?key=${userWithFsAvatar.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(Buffer.from(fsAvatarData));
		});

		test('should return teamspace gridfs avatar', async () => {
			const res = await agent.get(`${route(tsWithGridFsAvatar.name)}/?key=${userWithGridFsAvatar.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual(Buffer.from(gridFsAvatarData));
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

		test('should fail if the user does not have admin permissions to the teamspace', async () => {
			const res = await agent.get(`${route()}/?key=${userWithLicenseUnlimitedCollabs.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the teamspace does not exist', async () => {
			const res = await agent.get(`${route('sldkfjdl')}/?key=${userWithLicense.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test(`should return ${templates.licenceExpired.code} if the user has an expired license`, async () => {
			const res = await agent.get(`${route(tsWithExpiredLicense.name)}/?key=${userWithExpiredLicense.apiKey}`);
			expect(res.body.code).toEqual(templates.licenceExpired.code);
		});

		test('should return quota if the user has a valid license and space is used', async () => {
			const res = await agent.get(`${route()}/?key=${userWithLicense.apiKey}`)
				.expect(templates.ok.status);
			const collaboratorLimit = config.subscriptions?.basic?.collaborators === 'unlimited'
				? 'unlimited' : config.subscriptions?.basic?.collaborators + userCollabs;
			const spaceLimitInBytes = (config.subscriptions?.basic?.data + licenseData) * 1024 * 1024;
			expect(res.body).toEqual(
				{
					expiryDate: validExpiryDate,
					freeTier: false,
					data: { used: 642, available: spaceLimitInBytes },
					seats: { used: 3, available: collaboratorLimit },
				},
			);
		});

		test('should return quota if the user has a multiple licenses (with expiryDate being the closest to expire)', async () => {
			const res = await agent.get(`${route(tsWithMultipleLicenses.name)}/?key=${userWithMultipleLicenses.apiKey}`)
				.expect(templates.ok.status);
			const collaboratorLimit = config.subscriptions?.basic?.collaborators === 'unlimited'
				? 'unlimited' : config.subscriptions?.basic?.collaborators + userCollabs * 2;
			const spaceLimitInBytes = (config.subscriptions?.basic?.data + licenseData * 2) * 1024 * 1024;
			expect(res.body).toEqual(
				{
					expiryDate: validExpiryDate - 10,
					freeTier: false,
					data: { used: 0, available: spaceLimitInBytes },
					seats: { used: 2, available: collaboratorLimit },
				},
			);
		});

		test('should return quota if the user has a valid license and unlimited collaborators', async () => {
			const res = await agent.get(`${route(tsWithLicenseUnlimitedCollabs.name)}/?key=${userWithLicenseUnlimitedCollabs.apiKey}`)
				.expect(templates.ok.status);
			const spaceLimitInBytes = (config.subscriptions?.basic?.data + licenseData) * 1024 * 1024;
			expect(res.body).toEqual(
				{
					expiryDate: validExpiryDate,
					freeTier: false,
					data: { used: 0, available: spaceLimitInBytes },
					seats: { used: 2, available: 'unlimited' },
				},
			);
		});

		test('should return quota if the user is using the free plan', async () => {
			const res = await agent.get(`${route(teamspaces[0].name)}/?key=${testUser.apiKey}`)
				.expect(templates.ok.status);
			const spaceLimitInBytes = config.subscriptions?.basic?.data * 1024 * 1024;
			expect(res.body).toEqual(
				{
					expiryDate: null,
					freeTier: true,
					data: { used: 0, available: spaceLimitInBytes },
					seats: { used: 5, available: config.subscriptions.basic.collaborators },
				},
			);
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

const testSSORestriction = () => {
	describe('On security restricted teamspace', () => {
		const route = (ts, key) => `/v5/teamspaces/${ts}/members?key=${key}`;
		const user = ServiceHelper.generateUserCredentials();
		const userSso = ServiceHelper.generateUserCredentials();
		const userSsoWL = ServiceHelper.generateUserCredentials();
		const teamspaceData = {
			ssoRestricted: generateRandomString(),
			whiteListedSso: generateRandomString(),
			whiteListed: generateRandomString(),
		};

		const approvedDomainSSO = userSsoWL.basicData.email.split('@')[1];
		const approvedDomain = user.basicData.email.split('@')[1];

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createTeamspace(teamspaceData.ssoRestricted, [user.user, userSso.user]),
				ServiceHelper.db.createTeamspace(teamspaceData.whiteListedSso,
					[user.user, userSso.user, userSsoWL.user]),
				ServiceHelper.db.createTeamspace(teamspaceData.whiteListed,
					[user.user, userSso.user, userSsoWL.user]),
			]);

			await Promise.all([
				ServiceHelper.db.createUser(user, Object.values(teamspaceData)),
				ServiceHelper.db.createUser(userSso, Object.values(teamspaceData)),
				ServiceHelper.db.createUser(userSsoWL, Object.values(teamspaceData)),
			]);

			await Promise.all([
				ServiceHelper.db.addSSO(userSso.user),
				ServiceHelper.db.addSSO(userSsoWL.user),
				updateSecurityRestrictions(teamspaceData.ssoRestricted, true),
				updateSecurityRestrictions(teamspaceData.whiteListedSso, true, [approvedDomainSSO]),
				updateSecurityRestrictions(teamspaceData.whiteListed, undefined, [approvedDomain, approvedDomainSSO]),
			]);
		});

		const testCases = [
			['a non SSO user tries to access teamspace endpoints', teamspaceData.ssoRestricted, user.apiKey, false, templates.ssoRestricted],
			['a SSO user tries to access teamspace endpoints', teamspaceData.ssoRestricted, userSso.apiKey, true],
			['a non SSO user tries to access teamspace endpoints', teamspaceData.whiteListedSso, user.apiKey, false, templates.ssoRestricted],
			['a SSO user not in the white listed domain tries to access teamspace endpoints', teamspaceData.whiteListedSso, userSso.apiKey, false, templates.domainRestricted],
			['a SSO user in the white listed domain tries to access teamspace endpoints', teamspaceData.whiteListedSso, userSsoWL.apiKey, true],
			['a non SSO user in the white listed domain tries to access teamspace endpoints', teamspaceData.whiteListed, user.apiKey, true],
			['a SSO user not in the white listed domain tries to access teamspace endpoints', teamspaceData.whiteListed, userSso.apiKey, false, templates.domainRestricted],
			['a SSO user in the white listed domain tries to access teamspace endpoints', teamspaceData.whiteListed, userSsoWL.apiKey, true],
		];

		testCases.forEach(([desc, teamspaceName, key, success, retVal]) => {
			test(`Should ${success ? 'succeed' : `fail with ${retVal.code}`} on a ${teamspaceData.whiteListed === teamspaceName ? 'un' : 'SSO '}restricted teamspace ${teamspaceName !== teamspaceData.ssoRestricted ? 'with white list' : ''} if ${desc}`, async () => {
				const res = await agent.get(route(teamspaceName, key)).expect(
					success ? templates.ok.status : retVal.status);

				if (!success) expect(res.body.code).toEqual(retVal.code);
			});
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
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetTeamspaceList();
	testGetTeamspaceMembers();
	testGetAvatar();
	testGetQuotaInfo();
	testRemoveTeamspaceMember();
	testGetMemberAvatar();
	testSSORestriction();
	testGetAddOns();
});
