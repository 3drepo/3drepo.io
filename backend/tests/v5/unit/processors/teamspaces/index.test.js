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
const { AVATARS_COL_NAME, USERS_DB_NAME } = require('../../../../../src/v5/models/users.constants');
const { generateRandomString, generateRandomNumber, generateUUID } = require('../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const Teamspaces = require(`${src}/processors/teamspaces/teamspaces`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

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

jest.mock('../../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);

jest.mock('../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);

jest.mock('../../../../../src/v5/handler/db');
const DB = require(`${src}/handler/db`);

const invalidUsername = 'invalid';
const createTeamspaceRoleMock = RolesModel.createTeamspaceRole.mockImplementation((username) => {
	if (username === invalidUsername) {
		throw templates.unknown;
	}
});

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
		const tsWithoutRoles = 'noRoles';
		const roleA = generateUUID();
		const roleB = generateUUID();

		const goldenData = [
			{ user: 'abc', firstName: 'ab', lastName: 'c', company: 'yy', roles: [UUIDToString(roleA), UUIDToString(roleB)] },
			{ user: 'abcd', firstName: 'ab', lastName: 'cd', roles: [UUIDToString(roleB)] },
			{ user: 'abcd2', firstName: 'ab', lastName: 'cd2', roles: [UUIDToString(roleB)], company: 'dxfd' },
			{ user: 'abcde', firstName: 'ab', lastName: 'cde', company: 'dsfs' },
		];
		const roleList = [
			{ _id: roleA, users: ['abc'] },
			{ _id: roleB, users: ['abc', 'abcd', 'abcd2'] },
		];

		TeamspacesModel.getMembersInfo.mockImplementation((ts) => {
			if (tsWithoutUsers === ts) return Promise.resolve([]);
			return Promise.resolve(goldenData.map((data) => _.omit(data, 'role')));
		});

		RolesModel.getRolesToUsers.mockImplementation((ts) => {
			if (tsWithoutRoles === ts) return Promise.resolve([]);
			return Promise.resolve(roleList);
		});

		test('should give the list of members within the given teamspace with their details', async () => {
			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithUsers);
			expect(res).toEqual(goldenData);
		});

		test('should return empty array if the teamspace had no memebrs', async () => {
			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutUsers);
			expect(res).toEqual([]);
		});

		test('should return the list of members with details if the teamspace had no role', async () => {
			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutRoles);
			expect(res).toEqual(goldenData.map((data) => _.omit(data, 'role')));
		});
	});
};

const testInitTeamspace = () => {
	describe('Initialize teamspace', () => {
		test('should initialize a teamspace', async () => {
			const username = generateRandomString();
			await Teamspaces.initTeamspace(username);
			expect(createTeamspaceRoleMock).toHaveBeenCalledTimes(1);
			expect(createTeamspaceRoleMock).toHaveBeenCalledWith(username);
			expect(RolesModel.grantTeamspaceRoleToUser).toHaveBeenCalledTimes(1);
			expect(RolesModel.grantTeamspaceRoleToUser).toHaveBeenCalledWith(username, username);
			expect(RolesModel.addDefaultRoles).toHaveBeenCalledTimes(1);
			expect(RolesModel.addDefaultRoles).toHaveBeenCalledWith(username);
			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledWith(username);
			expect(TemplatesModel.addDefaultTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.addDefaultTemplates).toHaveBeenCalledWith(username);
		});

		test('should initialize a teamspace even if an error is thrown ', async () => {
			await Teamspaces.initTeamspace(invalidUsername);
			expect(createTeamspaceRoleMock).toHaveBeenCalledTimes(1);
			expect(createTeamspaceRoleMock).toHaveBeenCalledWith(invalidUsername);
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

const testRemoveTeamspaceMember = () => {
	describe('Remove user from teamspace', () => {
		test('should all possible permissions then remove the user from the teamspace', async () => {
			const user = generateRandomString();
			const teamspace = generateRandomString();

			await expect(Teamspaces.removeTeamspaceMember(teamspace, user)).resolves.toBeUndefined();

			expect(ModelSettings.removeUserFromAllModels).toHaveBeenCalledTimes(1);
			expect(ModelSettings.removeUserFromAllModels).toHaveBeenCalledWith(teamspace, user);

			expect(ProjectSettings.removeUserFromAllProjects).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.removeUserFromAllProjects).toHaveBeenCalledWith(teamspace, user);

			expect(TeamspacesModel.removeUserFromAdminPrivilege).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.removeUserFromAdminPrivilege).toHaveBeenCalledWith(teamspace, user);

			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledTimes(1);
			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledWith(teamspace, user);
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
			const users = [
				{ user: generateRandomString() },
				{ user: generateRandomString() },
			];
			TeamspacesModel.getMembersInfo.mockResolvedValueOnce(users);

			const teamspace = generateRandomString();

			await Teamspaces.removeTeamspace(teamspace);

			expect(TeamspacesModel.getMembersInfo).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.getMembersInfo).toHaveBeenCalledWith(teamspace);

			expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledTimes(users.length);
			expect(UsersModel.deleteFavourites).toHaveBeenCalledTimes(users.length);

			users.forEach(({ user }) => {
				expect(RolesModel.revokeTeamspaceRoleFromUser).toHaveBeenCalledWith(teamspace, user);
				expect(UsersModel.deleteFavourites).toHaveBeenCalledWith(user, teamspace);
			});

			expect(FilesManager.removeAllFilesFromTeamspace).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromTeamspace).toHaveBeenCalledWith(teamspace);

			expect(RolesModel.removeTeamspaceRole).toHaveBeenCalledTimes(1);
			expect(RolesModel.removeTeamspaceRole).toHaveBeenCalledWith(teamspace);

			expect(NotificationsModel.removeAllTeamspaceNotifications).toHaveBeenCalledTimes(1);
			expect(NotificationsModel.removeAllTeamspaceNotifications).toHaveBeenCalledWith(teamspace);

			expect(DB.dropDatabase).toHaveBeenCalledTimes(1);
			expect(DB.dropDatabase).toHaveBeenCalledWith(teamspace);
		});
	});
};

describe('processors/teamspaces', () => {
	testGetTeamspaceListByUser();
	testGetTeamspaceMembersInfo();
	testInitTeamspace();
	testRemoveTeamspaceMember();
	testGetAvatarStream();
	testGetQuotaInfo();
	testRemoveTeamspace();
});
