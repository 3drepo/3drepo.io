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
const { determineTestGroup, generateRandomString, generateRandomNumber, outOfOrderArrayEqual } = require('../../../helper/services');

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
		const tsTenantId = generateRandomString();
		const tsTenantWithoutUsers = generateRandomString();
		const tsTennatnWithExtraUser = generateRandomString();
		const goldenData = [
			{ user: 'abc', customData: { firstName: 'ab', lastName: 'c', billing: { billingInfo: { company: 'yy' } }, job: 'jobA', userId: generateRandomString(), email: generateRandomString() } },
			{ user: 'abcd', customData: { firstName: 'ab', lastName: 'cd', job: 'jobB', userId: generateRandomString(), email: generateRandomString() } },
			{ user: 'abcd2', customData: { firstName: 'ab', lastName: 'cd2', job: 'jobB', billing: { billingInfo: { company: 'dxfd' } }, userId: generateRandomString(), email: generateRandomString() } },
			{ user: 'abcde', customData: { firstName: 'ab', lastName: 'cde', billing: { billingInfo: { company: 'dsfs' } }, userId: generateRandomString(), email: generateRandomString() } },
		];
		const jobList = [
			{ _id: 'jobA', users: ['abc'] },
			{ _id: 'jobB', users: ['abcd', 'abcd2'] },
		];
		const frontEggData = goldenData.map(({ customData: { email, userId } }) => ({ email, id: userId }));

		test('should give the list of members within the given teamspace with their details', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTennatnWithExtraUser });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromEmailArray.mockImplementation(() => goldenData.map((user) => {
				const userInfo = { ...user };
				delete userInfo.job;
				return userInfo;
			}));
			JobsModel.getJobsToUsers.mockResolvedValueOnce(jobList);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithUsers);

			expect(res).toEqual(goldenData.map(
				({
					user,
					customData: { firstName, lastName, billing, job },
				}) => {
					const data = { user, firstName, lastName, job };
					if (billing?.billingInfo?.company) {
						data.company = billing.billingInfo.company;
					}

					return data;
				}));
		});

		test('should return empty array if the teamspace had no memebrs', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTenantWithoutUsers });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce([]);
			UsersModel.getUserInfoFromEmailArray.mockResolvedValueOnce([]);
			JobsModel.getJobsToUsers.mockResolvedValueOnce([]);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutUsers);

			expect(res).toEqual([]);
		});

		test('should return the list of members with details if the teamspace had no jobs', async () => {
			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce({ refId: tsTenantId });
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromEmailArray.mockImplementation(() => goldenData.map((user) => {
				const userInfo = { ...user };
				delete userInfo.job;
				return userInfo;
			}));
			JobsModel.getJobsToUsers.mockResolvedValueOnce([]);

			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutJobs);

			expect(res).toEqual(goldenData.map(
				({
					user,
					customData: { firstName, lastName, billing },
				}) => {
					const data = { user, firstName, lastName };
					if (billing?.billingInfo?.company) {
						data.company = billing.billingInfo.company;
					}

					return data;
				}));
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

		test('should initialize a teamspace and use the provided accountId if it exists', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const email = generateRandomString();
			const teamspaceId = generateRandomString();

			FronteggService.getTeamspaceByAccount.mockResolvedValueOnce(generateRandomString());
			FronteggService.getUserById.mockResolvedValueOnce(true);
			TeamspacesModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { email } });

			await Teamspaces.initTeamspace(teamspace, username, teamspaceId);

			expect(FronteggService.getTeamspaceByAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.getTeamspaceByAccount).toHaveBeenCalledWith(teamspaceId);

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

		test(`should throw an error of "${templates.teamspaceNotFound.message}" if accountId provided but not found`, async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();

			FronteggService.getTeamspaceByAccount.mockResolvedValueOnce(undefined);

			await expect(Teamspaces.initTeamspace(teamspace, username, teamspaceId))
				.rejects.toEqual(templates.teamspaceNotFound);

			expect(FronteggService.getTeamspaceByAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.getTeamspaceByAccount).toHaveBeenCalledWith(teamspaceId);

			expect(TeamspacesModel.getTeamspaceRefId).not.toHaveBeenCalled();

			expect(UsersModel.getUserByUsername).not.toHaveBeenCalled();

			expect(RolesModel.createTeamspaceRole).not.toHaveBeenCalled();
			expect(JobsModel.addDefaultJobs).not.toHaveBeenCalled();

			expect(TeamspacesModel.createTeamspaceSettings).not.toHaveBeenCalled();
			expect(JobsModel.assignUserToJob).not.toHaveBeenCalled();
			expect(TemplatesModel.addDefaultTemplates).not.toHaveBeenCalled();

			expect(RolesModel.grantTeamspaceRoleToUser).not.toHaveBeenCalled();
			expect(FronteggService.addUserToAccount).not.toHaveBeenCalled();
			expect(TeamspacesModel.grantAdminToUser).not.toHaveBeenCalled();
		});

		test('should not call any owner functions if an owner is not provided', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();

			FronteggService.getTeamspaceByAccount.mockResolvedValueOnce(generateRandomString());
			FronteggService.getUserById.mockResolvedValueOnce(true);

			await Teamspaces.initTeamspace(teamspace, undefined, teamspaceId);

			expect(FronteggService.getTeamspaceByAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.getTeamspaceByAccount).toHaveBeenCalledWith(teamspaceId);

			expect(RolesModel.createTeamspaceRole).toHaveBeenCalledTimes(1);
			expect(RolesModel.createTeamspaceRole).toHaveBeenCalledWith(teamspace);
			expect(JobsModel.addDefaultJobs).toHaveBeenCalledTimes(1);
			expect(JobsModel.addDefaultJobs).toHaveBeenCalledWith(teamspace);

			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledWith(teamspace, teamspaceId);
			expect(JobsModel.assignUserToJob).not.toHaveBeenCalled();
			expect(TemplatesModel.addDefaultTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.addDefaultTemplates).toHaveBeenCalledWith(teamspace);

			expect(RolesModel.grantTeamspaceRoleToUser).not.toHaveBeenCalled();
			expect(FronteggService.addUserToAccount).not.toHaveBeenCalled();
			expect(TeamspacesModel.grantAdminToUser).not.toHaveBeenCalled();
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

			const usersData = _.times(2, () => ({
				user: generateRandomString(),
				customData: {
					firstName: generateRandomString(),
					lastName: generateRandomString(),
					billing: {
						billingInfo: {
							company: generateRandomString(),
						},
					},
					userId: generateRandomString(),
					email: generateRandomString(),
				},
			}));
			const frontEggUsers = usersData.map(({ customData: { email, userId } }) => ({ email, id: userId }));

			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggUsers);
			UsersModel.getUserInfoFromEmailArray.mockResolvedValueOnce(usersData);

			const teamspace = generateRandomString();

			await Teamspaces.removeTeamspace(teamspace);

			expect(FronteggService.getAllUsersInAccount).toHaveBeenCalledTimes(1);
			expect(FronteggService.getAllUsersInAccount).toHaveBeenCalledWith(teamspaceId);

			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledTimes(frontEggUsers.length);
			expect(UsersModel.deleteFavourites).toHaveBeenCalledTimes(frontEggUsers.length);

			usersData.forEach((user) => {
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

const testGetAllMembersInTeamspace = () => {
	describe('Get all members in teamspace', () => {
		const tsWithUsers = generateRandomString();
		const tsTenantId = generateRandomString();

		const goldenData = [
			{ user: 'abc', customData: { firstName: 'ab', lastName: 'c', billing: { billingInfo: { company: 'yy' } }, userId: generateRandomString(), email: generateRandomString() } },
			{ user: 'abcd', customData: { firstName: 'ab', lastName: 'cd', userId: generateRandomString(), email: generateRandomString() } },
			{ user: 'abcd2', customData: { firstName: 'ab', lastName: 'cd2', billing: { billingInfo: { company: 'dxfd' } }, userId: generateRandomString(), email: generateRandomString() } },
			{ user: 'abcde', customData: { firstName: 'ab', lastName: 'cde', billing: { billingInfo: { company: 'dsfs' } }, userId: generateRandomString(), email: generateRandomString() } },
		];

		test('should return a list of teamspace members members', async () => {
			const frontEggData = goldenData.map(({ customData: { email, userId } }) => ({ email, id: userId }));
			const expectedRes = goldenData.map(({ user, customData: { firstName, lastName, billing } }) => {
				const res = {
					user,
					firstName,
					lastName,
				};
				if (billing?.billingInfo?.company) res.company = billing.billingInfo.company;

				return res;
			});

			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce(tsTenantId);
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromEmailArray.mockResolvedValueOnce(goldenData);

			const res = await Teamspaces.getAllMembersInTeamspace(tsWithUsers);

			expect(res).toEqual(expectedRes);
		});
		test('should update db userId if missmatch', async () => {
			const newId = generateRandomString();
			const frontEggData = goldenData.map(({ customData: { email, userId } }, index) => {
				if (index === 0) return { email, id: newId };
				return { email, id: userId };
			});
			const expectedRes = goldenData.map(({ user, customData: { firstName, lastName, billing } }) => {
				const res = {
					user,
					firstName,
					lastName,
				};
				if (billing?.billingInfo?.company) res.company = billing.billingInfo.company;

				return res;
			});

			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce(tsTenantId);
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromEmailArray.mockResolvedValueOnce(goldenData);

			const res = await Teamspaces.getAllMembersInTeamspace(tsWithUsers);

			outOfOrderArrayEqual(res, expectedRes);
			expect(UsersModel.updateUserId).toHaveBeenCalledTimes(1);
			expect(UsersModel.updateUserId).toHaveBeenCalledWith(goldenData[0].user, newId);
		});
		test('should create new user records for any users in frontEgg but not in mongo', async () => {
			const extraUserData = [{
				user: generateRandomString(),
				customData: {
					firstName: generateRandomString(),
					lastName: generateRandomString(),
					billing: {
						billingInfo: {
							company: generateRandomString(),
						},
					},
					userId: generateRandomString(),
					email: generateRandomString(),
				},
			}, {
				user: generateRandomString(),
				customData: {
					firstName: generateRandomString(),
					lastName: generateRandomString(),
					userId: generateRandomString(),
					email: generateRandomString(),
				},
			}];
			const extraUserFrontEggData = extraUserData.map(({ customData: { email, userId } }) => ({
				email,
				id: userId,
			}));
			const frontEggData = [
				...goldenData.map(({ customData: { email, userId } }) => ({ email, id: userId })),
				...extraUserFrontEggData,
			];
			const newGoldenData = [
				...goldenData,
				...extraUserData,
			];
			const expectedRes = newGoldenData.map(({ user, customData: { firstName, lastName, billing } }) => {
				const res = {
					user,
					firstName,
					lastName,
				};
				if (billing?.billingInfo?.company) res.company = billing.billingInfo.company;

				return res;
			});

			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce(tsTenantId);
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromEmailArray.mockImplementation((emailArray) => {
				if (emailArray.length === 1) {
					return extraUserData.filter((user) => user.customData.email === emailArray[0]);
				}
				return goldenData;
			});
			TeamspacesModel.getTeamspaceInvites.mockResolvedValueOnce([]);
			FronteggService.getUserById.mockResolvedValueOnce({});
			const fn = jest.spyOn(Users, 'createNewUserRecord');

			const res = await Teamspaces.getAllMembersInTeamspace(tsWithUsers);

			expect(res).toEqual(expectedRes);
			expect(fn).toHaveBeenCalledTimes(2);
		});
		test('should not create a new user records for any users waiting invitations', async () => {
			const extraUserFrontEggData = {
				email: generateRandomString(),
				id: generateRandomString(),
			};
			const frontEggData = [
				...goldenData.map(({ customData: { email, userId } }) => ({ email, id: userId })),
				extraUserFrontEggData,
			];
			const expectedRes = goldenData.map(({ user, customData: { firstName, lastName, billing } }) => {
				const res = {
					user,
					firstName,
					lastName,
				};
				if (billing?.billingInfo?.company) res.company = billing.billingInfo.company;

				return res;
			});

			TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce(tsTenantId);
			FronteggService.getAllUsersInAccount.mockResolvedValueOnce(frontEggData);
			UsersModel.getUserInfoFromEmailArray.mockResolvedValueOnce(goldenData);
			TeamspacesModel.getTeamspaceInvites.mockResolvedValueOnce([{ _id: extraUserFrontEggData.email }]);

			const res = await Teamspaces.getAllMembersInTeamspace(tsWithUsers);

			expect(res).toEqual(expectedRes);
			expect(Users.createNewUserRecord).toHaveBeenCalledTimes(0);
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
	testGetAllMembersInTeamspace();
});
