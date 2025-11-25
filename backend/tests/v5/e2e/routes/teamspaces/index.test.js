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
const { generateRandomModel, generateRandomProject, generateRandomString } = require('../../../helper/services');

const { DEFAULT_OWNER_JOB } = require(`${src}/models/jobs.constants`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);
const { ADD_ONS, ADD_ONS_MODULES } = require(`${src}/models/teamspaces.constants`);
const { updateAddOns } = require(`${src}/models/teamspaceSettings`);
const DB = require(`${src}/handler/db`);

let server;
let agent;

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
				const { firstName, lastName } = basicData;
				const data = {
					firstName,
					lastName,
					user,
				};

				if (userToJob[user]) {
					data.job = userToJob[user];
				}

				return data;
			});

			// when the default user for the teamspace is created the details are randomly generated
			const resWithoutAdmin = res.body.members.filter(
				(element) => element.job !== DEFAULT_OWNER_JOB && element.user !== teamspace,
			);
			const resAdminJob = res.body.members.filter(
				(element) => element.job === DEFAULT_OWNER_JOB && element.user === teamspace,
			);

			// check that the rest of the data matches
			ServiceHelper.outOfOrderArrayEqual(resWithoutAdmin, expectedData);
			// ensure the default owner exists
			expect(resAdminJob[0].job).toEqual(DEFAULT_OWNER_JOB);
			expect(resAdminJob[0].user).toEqual(teamspace);
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
			seats: { used: 3, available: config.subscriptions.basic.collaborators },
		};

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await Promise.all([
				ServiceHelper.db.createTeamspace(teamspaceWithLicense, [testUser.user], activeLicense),
				ServiceHelper.db.createTeamspace(teamspaceWithoutLicense, [testUser.user]),
				ServiceHelper.db.createTeamspace(teamspaceWithExpiredLicense, [testUser.user], { discretionary: {
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
				ServiceHelper.db.createProjectImage(teamspaceWithLicense,
					projectWithImage.id, 'fs', fs.readFileSync(image)),
				ServiceHelper.db.createModel(teamspaceWithLicense, modelWithRev._id, modelWithRev.name,
					modelWithRev.properties)]);
			await ServiceHelper.db.createRevision(teamspaceWithLicense, projectWithImage.id, modelWithRev._id,
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
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();
		const userNotAdmin = ServiceHelper.generateUserCredentials();
		const userToRemove = ServiceHelper.generateUserCredentials();
		const testUser2 = ServiceHelper.generateUserCredentials();

		const teamspace = ServiceHelper.generateRandomString();
		const userProvisionedTeamspace = ServiceHelper.generateRandomString();

		const route = (key, ts = teamspace, username = userToRemove.user) => `/v5/teamspaces/${ts}/members/${username}${key ? `?key=${key}` : ''}`;

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await ServiceHelper.db.createTeamspace(teamspace, [testUser.user]);
			await ServiceHelper.db.createTeamspace(
				userProvisionedTeamspace, [testUser.user], {}, true, { [ADD_ONS.USERS_PROVISIONED]: true },
			);
			await Promise.all([
				ServiceHelper.db.createUser(userToRemove, [teamspace, userProvisionedTeamspace]),
				ServiceHelper.db.createUser(userNotAdmin, [teamspace]),
				ServiceHelper.db.createUser(testUser2, [teamspace]),
			]);
		});

		describe.each([
			['the user does not have a valid session', route(), false, templates.notLoggedIn],
			['the teamspace has userProvisioned true', route(testUser.apiKey, userProvisionedTeamspace), false, templates.userProvisioned],
			['the teamspace does not exist', route(userNoAccess.apiKey, ServiceHelper.generateRandomString()), false, templates.teamspaceNotFound],
			['the user does not have access to the teamspace', route(userNoAccess.apiKey), false, templates.teamspaceNotFound],
			['the user does not have admin permissions to the teamspace', route(userNotAdmin.apiKey), false, templates.notAuthorized],
			['the user is admin', route(testUser.apiKey), true, userToRemove.user],
			['the user is admin but the user to remove does not exist', route(testUser.apiKey, teamspace, ServiceHelper.generateRandomString()), false, templates.notAuthorized],
			['the user is admin but the user is not a member', route(testUser.apiKey, teamspace, userNoAccess.user), false, templates.notAuthorized],
			['the user tries to remove themselves even if they are not admin', route(testUser2.apiKey, teamspace, testUser2.user), true, testUser2.user],

		])('', (desc, url, success, expectedData) => {
			test(`Should ${success ? 'succeed' : `fail with ${expectedData?.code}`} if ${desc}`, async () => {
				const expectedStatus = expectedData?.status ?? templates.ok.status;
				const res = await agent.delete(url).expect(expectedStatus);
				if (success) {
					const tsMembersRes = await agent.get(`/v5/teamspaces/${teamspace}/members?key=${testUser.apiKey}`);
					const removedUser = tsMembersRes.body.members.find((m) => m.user === expectedData);
					expect(removedUser).toEqual(undefined);
				} else {
					expect(res.body.code).toEqual(expectedData.code);
				}
			});
		});
	});
};

const testGetMemberAvatar = () => {
	describe('Get teamspace member avatar', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();
		const userNotAdmin = ServiceHelper.generateUserCredentials();
		const userWithAvatar = ServiceHelper.generateUserCredentials();

		const teamspace = ServiceHelper.generateRandomString();
		const avatar = ServiceHelper.generateRandomString();

		const route = (key, member = userWithAvatar, ts = teamspace) => `/v5/teamspaces/${ts}/members/${member}/avatar${key ? `?key=${key}` : ''}`;

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await ServiceHelper.db.createTeamspace(teamspace, [testUser.user]);
			await Promise.all([
				ServiceHelper.db.createUser(userWithAvatar, [teamspace]),
				ServiceHelper.db.createUser(userNotAdmin, [teamspace]),
			]);
			await ServiceHelper.db.createAvatar(userWithAvatar.user, 'fs', avatar);
		});

		describe.each([
			['the user does not have a valid session', route(), false, templates.notLoggedIn],
			['the teamspace does not exist', route(userNoAccess.apiKey, ServiceHelper.generateRandomString()), false, templates.teamspaceNotFound],
			['the user does not have access to the teamspace', route(userNoAccess.apiKey), false, templates.teamspaceNotFound],
			['the user requested does not have access to the teamspace', route(testUser.apiKey, userNoAccess.user), false, templates.userNotFound],
			['the user has an avatar (admin requested)', route(testUser.apiKey, userWithAvatar.user), true, Buffer.from(avatar)],
			['the user has an avatar (team member requested)', route(userNotAdmin.apiKey, userWithAvatar.user), true, Buffer.from(avatar)],
		])('', (desc, url, success, expectedData) => {
			test(`Should ${success ? 'succeed' : `fail with ${expectedData?.code}`} if ${desc}`, async () => {
				const expectedStatus = expectedData?.status ?? templates.ok.status;
				const res = await agent.get(url).expect(expectedStatus);
				if (success) {
					const tsMembersRes = await agent.get(`/v5/teamspaces/${teamspace}/members?key=${testUser.apiKey}`);
					const removedUser = tsMembersRes.body.members.find((m) => m.user === expectedData);
					expect(removedUser).toEqual(undefined);
				} else {
					expect(res.body.code).toEqual(expectedData.code);
				}
			});
		});
	});
};

const testGetAddOns = () => {
	describe('Get add ons', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();

		const teamspace = ServiceHelper.generateRandomString();
		const teamspaceNoAddOns = ServiceHelper.generateRandomString();

		const route = (key, ts) => `/v5/teamspaces/${ts}/addOns${key ? `?key=${key}` : ''}`;

		const addOns = {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
			[ADD_ONS.HERE]: true,
			[ADD_ONS.POWERBI]: true,
			[ADD_ONS.MODULES]: Object.values(ADD_ONS_MODULES),
		};

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await ServiceHelper.db.createTeamspace(teamspace, [testUser.user]);
			await ServiceHelper.db.createTeamspace(teamspaceNoAddOns, [testUser.user]);
			await updateAddOns(teamspace, addOns);
		});

		describe.each([
			['user does not have a valid session', undefined, teamspace, false, templates.notLoggedIn],
			['teamspace does not exist', testUser.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', userNoAccess.apiKey, teamspace, false, templates.teamspaceNotFound],
			['teamspace has add ons', testUser.apiKey, teamspace, true, addOns],
			['teamspace has no add ons', testUser.apiKey, teamspaceNoAddOns, true, {}],
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

const testUpdateQuota = () => {
	describe('Update quota', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();

		const teamspace = ServiceHelper.generateRandomString();
		const updatedQuota = {
			expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
			collaborators: parseInt(ServiceHelper.generateRandomNumber(0), 10),
			data: parseInt(ServiceHelper.generateRandomNumber(0), 10),
		};

		const route = (key, ts) => `/v5/teamspaces/${ts}/quota${key ? `?key=${key}` : ''}`;

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await ServiceHelper.db.createTeamspace(teamspace, [testUser.user]);
		});

		describe.each([
			['teamspace does not exist', testUser.apiKey, generateRandomString(), false, updatedQuota, templates.teamspaceNotFound],
			['payload is invalid', testUser.apiKey, teamspace, false, { ...updatedQuota, collaborators: undefined, data: undefined }, templates.invalidArguments],
			['payload is valid', testUser.apiKey, teamspace, true, updatedQuota],
			['payload is valid and user is not a member of the teamspace', userNoAccess.apiKey, teamspace, true, updatedQuota],
		])('', (desc, key, ts, success, payload, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const putRes = await agent.put(route(key, ts)).send(payload).expect(expectedStatus);
				if (success) {
					const { subscriptions: { enterprise } } = await DB.findOne(teamspace, 'teamspace', { _id: teamspace });
					expect(enterprise.collaborators).toEqual(payload.collaborators);
					expect(enterprise.data).toEqual(payload.data);
					expect(enterprise.expiryDate).toEqual(payload.expiryDate);
				} else {
					expect(putRes.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testDeleteQuota = () => {
	describe('Delete quota', () => {
		const testUser = ServiceHelper.generateUserCredentials();
		const userNoAccess = ServiceHelper.generateUserCredentials();

		const teamspace = ServiceHelper.generateRandomString();
		const quota = {
			expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
			collaborators: parseInt(ServiceHelper.generateRandomNumber(0), 10),
			data: parseInt(ServiceHelper.generateRandomNumber(0), 10),
		};

		const route = (key, ts) => `/v5/teamspaces/${ts}/quota${key ? `?key=${key}` : ''}`;

		beforeAll(async () => {
			await Promise.all([
				ServiceHelper.db.createUser(testUser),
				ServiceHelper.db.createUser(userNoAccess),
			]);
			await ServiceHelper.db.createTeamspace(teamspace, [testUser.user], quota);
		});

		describe.each([
			['teamspace does not exist', testUser.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['teamspace is valid', testUser.apiKey, teamspace, true],
			['teamspace is valid and user is not a member of the teamspace', userNoAccess.apiKey, teamspace, true],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const putRes = await agent.delete(route(key, ts)).expect(expectedStatus);
				if (success) {
					const teamspaceSettings = await DB.findOne(teamspace, 'teamspace', { _id: teamspace });
					expect(teamspaceSettings.subscriptions).toBeUndefined();
				} else {
					expect(putRes.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));

	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

		testGetTeamspaceMembers();
		testGetTeamspaceList();
		testGetAvatar();
		testGetQuotaInfo();
		testRemoveTeamspaceMember();
		testGetMemberAvatar();
		testGetAddOns();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});

		testUpdateQuota();
		testDeleteQuota();
	});
});
