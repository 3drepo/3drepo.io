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

const _ = require('lodash');

const { src } = require('../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);
const { AVATARS_COL_NAME, USERS_DB_NAME } = require(`${src}/models/users.constants`);
const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../../helper/services');

const { DEFAULT_OWNER_JOB } = require(`${src}/models/jobs.constants`);

const Teamspaces = require(`${src}/processors/teamspaces`);

jest.mock('../../../../../src/v5/processors/users');
const Users = require(`${src}/processors/users`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/models/notifications');
const NotificationsModel = require(`${src}/models/notifications`);

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const TeamspacesModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../src/v5/models/tickets.templates');
const TemplatesModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/models/roles');
const RolesModel = require(`${src}/models/roles`);

jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/utils/permissions');
const Permissions = require(`${src}/utils/permissions`);

jest.mock('../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../src/v5/services/sso/frontegg');
const FronteggService = require(`${src}/services/sso/frontegg`);

jest.mock('../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);

jest.mock('../../../../../src/v5/handler/db');
const DB = require(`${src}/handler/db`);

const testGetTeamspaceListByUser = () => {
	describe('Get Teamspace list by user', () => {
		test('should give the expected list of teamspaces', async () => {
			const goldenData = [
				{ name: 'ts1', isAdmin: false },
				{ name: 'ts2', isAdmin: false },
				{ name: 'ts3', isAdmin: true },
				{ name: 'ts4', isAdmin: true },
				{ name: 'ts5', isAdmin: false },
			];

			UsersModel.getAccessibleTeamspaces.mockImplementation(() => goldenData.map(({ name }) => name));
			Permissions.isTeamspaceAdmin.mockImplementation((ts) => goldenData.find(({ name }) => name === ts).isAdmin);
			const res = await Teamspaces.getTeamspaceListByUser('abc');
			expect(res).toEqual(goldenData);
		});
	});
};

const testGetTeamspaceMembersInfo = () => {
	describe('Get Teamspace members info', () => {
		const tsWithUsers = 'withUsers';
		const tsWithoutUsers = 'withoutUsers';
		const tsWithoutJobs = 'noJobs';
		const tsWithExtraUser = 'extraUser';
		const tsTenantId = generateRandomString();
		const tsTenantWithoutUsers = generateRandomString();
		const tsTennatnWithExtraUser = generateRandomString();
		const goldenData = [
			{ user: 'abc', firstName: 'ab', lastName: 'c', company: 'yy', job: 'jobA', userId: generateRandomString() },
			{ user: 'abcd', firstName: 'ab', lastName: 'cd', job: 'jobB', userId: generateRandomString() },
			{ user: 'abcd2', firstName: 'ab', lastName: 'cd2', job: 'jobB', company: 'dxfd', userId: generateRandomString() },
			{ user: 'abcde', firstName: 'ab', lastName: 'cde', company: 'dsfs', userId: generateRandomString() },
		];
		const jobList = [
			{ _id: 'jobA', users: ['abc'] },
			{ _id: 'jobB', users: ['abcd', 'abcd2'] },
		];
		const extraFrontEggUser = { email: generateRandomString(), id: generateRandomString() };
		const frontEggData = goldenData.map((data) => ({ email: `${data.user}@email.com`, id: data.userId }));

		test('should give the list of members within the given teamspace with their details', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTennatnWithExtraUser });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromId.mockImplementation((user) => {
				const userInfo = { ...goldenData.find((element) => element.userId === user) };

				delete userInfo.job;
				delete userInfo.userId;

				return Promise.resolve(userInfo);
			});
			JobsModel.getJobsToUsers.mockResolvedValueOnce(jobList);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithUsers);

			expect(res).toEqual(goldenData.map((data) => _.omit(data, 'userId')));
		});

		test('should return empty array if the teamspace had no memebrs', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTenantWithoutUsers });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce([]);
			UsersModel.getUserInfoFromId.mockImplementation((user) => {
				const userInfo = { ...goldenData.find((element) => element.userId === user) };

				delete userInfo.job;
				delete userInfo.userId;

				return Promise.resolve(userInfo);
			});
			JobsModel.getJobsToUsers.mockResolvedValueOnce([]);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutUsers);

			expect(res).toEqual([]);
		});

		test('should return the list of members with details if the teamspace had no jobs', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTenantId });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromId.mockImplementation((user) => {
				const userInfo = { ...goldenData.find((element) => element.userId === user) };

				delete userInfo.job;
				delete userInfo.userId;

				return Promise.resolve(userInfo);
			});
			JobsModel.getJobsToUsers.mockResolvedValueOnce([]);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutJobs);

			expect(res).toEqual(goldenData.map((data) => _.omit(data, ['job', 'userId'])));
		});

		test('should create a user record if the user does not exist in Mongo', async () => {
			const newGoldenData = goldenData;
			let thrownError = false;
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTenantId });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce([...frontEggData, extraFrontEggUser]);
			UsersModel.getUserInfoFromId
				.mockImplementation((user) => {
					if (user === extraFrontEggUser.id && !thrownError) {
						thrownError = true;
						throw templates.userNotFound;
					}

					const userInfo = { ...newGoldenData.find((element) => element.userId === user) };

					delete userInfo.job;
					delete userInfo.userId;

					return Promise.resolve(userInfo);
				});
			FronteggService.getUserById.mockResolvedValueOnce(true);
			Users.createNewUserRecord.mockImplementationOnce(() => {
				newGoldenData.push({
					user: extraFrontEggUser.id,
					firstName: 'ab',
					lastName: 'cd3',
					company: 'ccc',
					userId: extraFrontEggUser.id,
				});
				return extraFrontEggUser.id;
			});
			JobsModel.getJobsToUsers.mockResolvedValueOnce(jobList);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithExtraUser);

			expect(res).toEqual(newGoldenData.map((data) => _.omit(data, 'userId')));
		});

		test('should throw error', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTenantId });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce([...frontEggData, extraFrontEggUser]);
			UsersModel.getUserInfoFromId
				.mockImplementation(() => { throw templates.unknown; });

			await expect(Teamspaces.getTeamspaceMembersInfo(tsWithExtraUser)).rejects.toEqual(templates.unknown);
		});
	});
};

const testInitTeamspace = () => {
	describe('Initialize teamspace', () => {
		test('should initialize a teamspace', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const email = generateRandomString();
			const teamspaceId = generateRandomString();

			FronteggService.createAccount.mockResolvedValueOnce(teamspaceId);
			FronteggService.getUserById.mockResolvedValueOnce(true);
			TeamspacesModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { email } });

			await Teamspaces.initTeamspace(teamspace, username);

			expect(FronteggService.createAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.createAccount).toHaveBeenCalledWith(teamspace);

			expect(TeamspacesModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username, expect.any(Object));

			expect(RolesModel.createTeamspaceRole).toHaveBeenCalledTimes(1);
			expect(RolesModel.createTeamspaceRole).toHaveBeenCalledWith(teamspace);
			expect(JobsModel.addDefaultJobs).toHaveBeenCalledTimes(1);
			expect(JobsModel.addDefaultJobs).toHaveBeenCalledWith(teamspace);

			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledWith(teamspace, teamspaceId);
			expect(JobsModel.assignUserToJob).toHaveBeenCalledTimes(1);
			expect(JobsModel.assignUserToJob).toHaveBeenCalledWith(teamspace, DEFAULT_OWNER_JOB, username);
			expect(TemplatesModel.addDefaultTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.addDefaultTemplates).toHaveBeenCalledWith(teamspace);

			expect(RolesModel.grantTeamspaceRoleToUser).toHaveBeenCalledTimes(1);
			expect(RolesModel.grantTeamspaceRoleToUser).toHaveBeenCalledWith(teamspace, username);
			expect(FronteggService.addUserToAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.addUserToAccount).toHaveBeenCalledWith(teamspaceId, email, ' ', undefined);
			expect(TeamspacesModel.grantAdminToUser).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.grantAdminToUser).toHaveBeenCalledWith(teamspace, username);
		});

		test('should initialize a teamspace even if an error is thrown ', async () => {
			RolesModel.createTeamspaceRole.mockRejectedValueOnce(templates.unknown);
			await expect(Teamspaces.initTeamspace(generateRandomString(), generateRandomString()))
				.rejects.toEqual(templates.unknown);
		});
	});
};

const testGetQuotaInfo = () => {
	describe('Get quota info', () => {
		test('should return quota info', async () => {
			const quotaInfo = {
				freeTier: false,
				expiryDate: generateRandomNumber(0),
				data: generateRandomNumber(),
				collaborators: generateRandomNumber(0),
			};
			const spaceUsed = generateRandomNumber(0);
			const collabsUsed = generateRandomNumber(0);
			Quota.getQuotaInfo.mockResolvedValueOnce(quotaInfo);
			Quota.getSpaceUsed.mockResolvedValueOnce(spaceUsed);
			Quota.getCollaboratorsAssigned.mockResolvedValueOnce(collabsUsed);
			const teamspace = generateRandomString();
			const res = await Teamspaces.getQuotaInfo(teamspace);
			expect(res).toEqual(
				{
					freeTier: quotaInfo.freeTier,
					expiryDate: quotaInfo.expiryDate,
					data: {
						available: quotaInfo.data,
						used: spaceUsed,
					},
					seats: {
						available: quotaInfo.collaborators,
						used: collabsUsed,
					},
				},
			);
			expect(Quota.getQuotaInfo).toHaveBeenCalledTimes(1);
			expect(Quota.getQuotaInfo).toHaveBeenCalledWith(teamspace, true);
			expect(Quota.getSpaceUsed).toHaveBeenCalledTimes(1);
			expect(Quota.getSpaceUsed).toHaveBeenCalledWith(teamspace, true);
			expect(Quota.getCollaboratorsAssigned).toHaveBeenCalledTimes(1);
			expect(Quota.getCollaboratorsAssigned).toHaveBeenCalledWith(teamspace);
		});

		test('should return error if a method called throws an exception', async () => {
			const getQuotaInfoMock = Quota.getQuotaInfo.mockImplementationOnce(() => {
				throw templates.licenceExpired;
			});
			const teamspace = generateRandomString();
			await expect(Teamspaces.getQuotaInfo(teamspace)).rejects.toEqual(templates.licenceExpired);
			expect(getQuotaInfoMock).toHaveBeenCalledTimes(1);
			expect(getQuotaInfoMock).toHaveBeenCalledWith(teamspace, true);
		});
	});
};

const testAddTeamspaceMember = () => {
	describe('Add teamspace member', () => {
		test('Should add user to the system (no inviter)', async () => {
			const username = generateRandomString();
			const userId = generateRandomString();
			const teamspace = generateRandomString();
			const email = generateRandomString();
			const firstName = generateRandomString();
			const lastName = generateRandomString();
			const accountId = generateRandomString();

			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { email, firstName, lastName, userId } });
			TeamspacesModel.getTeamspaceRefId.mockResolvedValueOnce(accountId);
			FronteggService.addUserToAccount.mockResolvedValueOnce(userId);

			await Teamspaces.addTeamspaceMember(teamspace, username);

			expect(FronteggService.addUserToAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.addUserToAccount).toHaveBeenCalledWith(accountId, email,
				[firstName, lastName].join(' '), undefined);

			expect(TeamspacesModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(UsersModel.updateUserId).not.toHaveBeenCalled();
		});

		test('Should add user to the system (with inviter)', async () => {
			const username = generateRandomString();
			const inviter = generateRandomString();
			const teamspace = generateRandomString();
			const email = generateRandomString();
			const firstName = generateRandomString();
			const lastName = generateRandomString();
			const accountId = generateRandomString();
			const userId = generateRandomString();

			const inviterEmail = generateRandomString();
			const inviterFirstName = generateRandomString();
			const inviterLastName = generateRandomString();

			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { email, firstName, lastName } });
			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: {
				email: inviterEmail, firstName: inviterFirstName, lastName: inviterLastName } });
			TeamspacesModel.getTeamspaceRefId.mockResolvedValueOnce(accountId);
			FronteggService.addUserToAccount.mockResolvedValueOnce(userId);

			const emailData = {
				sender: [inviterFirstName, inviterLastName].join(' '),
				teamspace,
			};
			await Teamspaces.addTeamspaceMember(teamspace, username, inviter);

			expect(FronteggService.addUserToAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.addUserToAccount).toHaveBeenCalledWith(accountId, email, [firstName, lastName].join(' '),
				emailData);

			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(2);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username, expect.any(Object));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(inviter, expect.any(Object));

			expect(TeamspacesModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(UsersModel.updateUserId).toHaveBeenCalledTimes(1);
			expect(UsersModel.updateUserId).toHaveBeenCalledWith(username, userId);
		});
	});
};

const testRemoveTeamspaceMember = () => {
	describe('Remove user from teamspace', () => {
		test('should remove all possible permissions then remove the user from the teamspace', async () => {
			const user = generateRandomString();
			const teamspace = generateRandomString();

			const userId = generateRandomString();
			const teamspaceId = generateRandomString();

			TeamspacesModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			UsersModel.getUserId.mockResolvedValueOnce(userId);

			await expect(Teamspaces.removeTeamspaceMember(teamspace, user)).resolves.toBeUndefined();

			expect(ModelSettings.removeUserFromAllModels).toHaveBeenCalledTimes(1);
			expect(ModelSettings.removeUserFromAllModels).toHaveBeenCalledWith(teamspace, user);

			expect(ProjectSettings.removeUserFromAllProjects).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.removeUserFromAllProjects).toHaveBeenCalledWith(teamspace, user);

			expect(TeamspacesModel.removeUserFromAdminPrivilege).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.removeUserFromAdminPrivilege).toHaveBeenCalledWith(teamspace, user);

			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledTimes(1);
			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledWith(teamspace, user);

			expect(FronteggService.removeUserFromAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.removeUserFromAccount).toHaveBeenCalledWith(teamspaceId, userId);
		});

		test('should omit permissions removal if removePermissions flag is set to false', async () => {
			const user = generateRandomString();
			const teamspace = generateRandomString();

			const userId = generateRandomString();
			const teamspaceId = generateRandomString();

			TeamspacesModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			UsersModel.getUserId.mockResolvedValueOnce(userId);

			await expect(Teamspaces.removeTeamspaceMember(teamspace, user, false)).resolves.toBeUndefined();

			expect(ModelSettings.removeUserFromAllModels).not.toHaveBeenCalled();

			expect(ProjectSettings.removeUserFromAllProjects).not.toHaveBeenCalled();

			expect(TeamspacesModel.removeUserFromAdminPrivilege).not.toHaveBeenCalled();

			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledTimes(1);
			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledWith(teamspace, user);

			expect(FronteggService.removeUserFromAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.removeUserFromAccount).toHaveBeenCalledWith(teamspaceId, userId);
		});
	});
};

const testGetAvatarStream = () => {
	describe('Get avatar stream', () => {
		test('should get avatar stream', async () => {
			const teamspace = generateRandomString();
			const stream = generateRandomString();
			FilesManager.getFile.mockResolvedValueOnce(stream);
			await expect(Teamspaces.getAvatar(teamspace)).resolves.toEqual(stream);
			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, teamspace);
		});
	});
};

const testRemoveTeamspace = () => {
	describe('Remove teamspace', () => {
		test('Should remove the teamspace and all the relevant data', async () => {
			const teamspaceId = generateRandomString();
			TeamspacesModel.getTeamspaceRefId.mockResolvedValue(teamspaceId);
			TeamspacesModel.getTeamspaceSetting.mockResolvedValue({ refId: teamspaceId });

			const frontEggUsers = _.times(2, { id: generateRandomString(), user: generateRandomString() });

			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggUsers.map((user) => ({ id: user.id })));
			UsersModel.getUserInfoFromId.mockImplementation(
				(id) => ({ user: frontEggUsers.find((item) => item.id === id).user }));

			const teamspace = generateRandomString();

			await Teamspaces.removeTeamspace(teamspace);

			expect(FronteggService.getAllUsersInAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.getAllUsersInAccount).toHaveBeenCalledWith(teamspaceId);

			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledTimes(frontEggUsers.length);
			expect(UsersModel.deleteFavourites).toHaveBeenCalledTimes(frontEggUsers.length);

			frontEggUsers.forEach((user) => {
				expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledWith(teamspace, user.user);
				expect(UsersModel.deleteFavourites).toHaveBeenCalledWith(user.user, teamspace);
			});

			expect(FilesManager.removeAllFilesFromTeamspace).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromTeamspace).toHaveBeenCalledWith(teamspace);

			expect(RolesModel.removeTeamspaceRole).toHaveBeenCalledTimes(1);
			expect(RolesModel.removeTeamspaceRole).toHaveBeenCalledWith(teamspace);

			expect(NotificationsModel.removeAllTeamspaceNotifications).toHaveBeenCalledTimes(1);
			expect(NotificationsModel.removeAllTeamspaceNotifications).toHaveBeenCalledWith(teamspace);

			expect(DB.dropDatabase).toHaveBeenCalledTimes(1);
			expect(DB.dropDatabase).toHaveBeenCalledWith(teamspace);

			expect(FronteggService.removeAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.removeAccount).toHaveBeenCalledWith(teamspaceId);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTeamspaceListByUser();
	testGetTeamspaceMembersInfo();
	testInitTeamspace();
	testAddTeamspaceMember();
	testRemoveTeamspaceMember();
	testGetAvatarStream();
	testGetQuotaInfo();
	testRemoveTeamspace();
});
