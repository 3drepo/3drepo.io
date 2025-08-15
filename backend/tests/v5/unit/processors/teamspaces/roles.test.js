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
const { src } = require('../../../helper/path');

const { generateRandomString, determineTestGroup, generateRandomDate } = require('../../../helper/services');
const { templates } = require('../../../../../src/v5/utils/responseCodes');
const User = require('../../../../../src/v5/models/users');

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const TeamspaceModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../src/v5/models/users');
const UserModel = require(`${src}/models/users`);

jest.mock('../../../../../src/v5/services/sso/frontegg');
const Frontegg = require(`${src}/services/sso/frontegg`);

const Roles = require(`${src}/processors/teamspaces/roles`);

const testGetRoles = () => {
	describe('Get roles', () => {
		const teamspace = generateRandomString();
		test('Should get the roles from Frontegg (no users)', async () => {
			const teamspaceId = generateRandomString();
			const groups = times(3, () => ({
				id: generateRandomString(),
				name: generateRandomString(),
				color: generateRandomString(),
			}));

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce(groups);

			await expect(Roles.getRoles(teamspace)).resolves.toEqual(groups);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(Frontegg.getGroups).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroups).toHaveBeenCalledWith(teamspaceId);

			expect(UserModel.getUsersByQuery).not.toHaveBeenCalled();
		});

		test('Should get the roles from Frontegg and translate users to usernames', async () => {
			const teamspaceId = generateRandomString();

			const userNamesInGroups = times(3, () => times(5, () => generateRandomString()));

			const groups = times(3, () => ({
				id: generateRandomString(),
				name: generateRandomString(),
				color: generateRandomString(),
				users: times(5, () => ({ email: generateRandomString() })),
			}));

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce(groups);

			userNamesInGroups.forEach((userNames) => {
				UserModel.getUsersByQuery.mockResolvedValueOnce(userNames.map((user) => ({ user })));
			});

			await expect(Roles.getRoles(teamspace)).resolves.toEqual(groups.map((group, i) => ({
				...group,
				users: userNamesInGroups[i],
			})));

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(Frontegg.getGroups).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroups).toHaveBeenCalledWith(teamspaceId);

			expect(UserModel.getUsersByQuery).toHaveBeenCalledTimes(groups.length);
			groups.forEach(({ users }) => {
				expect(UserModel.getUsersByQuery).toHaveBeenCalledWith({ 'customData.email': { $in: users.map(({ email }) => email) } }, { user: 1 });
			});
		});

		test('Should return empty array if no groups were found', async () => {
			const teamspaceId = generateRandomString();
			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce([]);

			await expect(Roles.getRoles(teamspace)).resolves.toEqual([]);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(Frontegg.getGroups).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroups).toHaveBeenCalledWith(teamspaceId);

			expect(UserModel.getUsersByQuery).not.toHaveBeenCalled();
		});
	});
};

const testGetRoleById = () => {
	describe('Get role by ID', () => {
		const teamspace = generateRandomString();
		const roleId = generateRandomString();

		test('Should get the role from Frontegg', async () => {
			const teamspaceId = generateRandomString();
			const group = {
				id: roleId,
				name: generateRandomString(),
				color: generateRandomString(),
			};

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroupById.mockResolvedValueOnce(group);

			await expect(Roles.getRoleById(teamspace, roleId)).resolves.toEqual(group);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(Frontegg.getGroupById).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroupById).toHaveBeenCalledWith(teamspaceId, roleId, false);
			expect(UserModel.getUsersByQuery).not.toHaveBeenCalled();
		});

		test('Should get the role from Frontegg and convert the users if available', async () => {
			const teamspaceId = generateRandomString();
			const userEmails = times(3, () => ({ email: generateRandomString() }));
			const group = {
				id: roleId,
				name: generateRandomString(),
				color: generateRandomString(),
				users: userEmails,
			};

			const usernames = times(group.users.length, () => generateRandomString());

			UserModel.getUsersByQuery.mockResolvedValueOnce(usernames.map((user) => ({ user })));

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroupById.mockResolvedValueOnce(group);

			await expect(Roles.getRoleById(teamspace, roleId, true)).resolves.toEqual(group);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(Frontegg.getGroupById).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroupById).toHaveBeenCalledWith(teamspaceId, roleId, true);

			expect(UserModel.getUsersByQuery).toHaveBeenCalledTimes(1);
			expect(UserModel.getUsersByQuery).toHaveBeenCalledWith({ 'customData.email': { $in: userEmails.map(({ email }) => email) } }, { user: 1 });
		});

		test('Should return not found if role does not exist', async () => {
			const teamspaceId = generateRandomString();

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroupById.mockRejectedValueOnce(undefined);

			await expect(Roles.getRoleById(teamspace, roleId)).rejects.toBe(templates.roleNotFound);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(Frontegg.getGroupById).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroupById).toHaveBeenCalledWith(teamspaceId, roleId, false);
			expect(UserModel.getUsersByQuery).not.toHaveBeenCalled();
		});
	});
};

const testGetRolesByUsers = () => {
	describe('Get roles by users', () => {
		const teamspace = generateRandomString();
		const teamspaceId = generateRandomString();

		const users = times(3, () => generateRandomString());
		const userNamesInGroups = times(3, (i) => [...times(4, () => generateRandomString()), users[i]]);

		const groups = times(3, () => ({
			id: generateRandomString(),
			name: generateRandomString(),
			color: generateRandomString(),
			users: times(5, () => ({ email: generateRandomString() })),
		}));

		test('Should get the roles for the user from Frontegg', async () => {
			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce(groups);

			userNamesInGroups.forEach((userNames) => {
				UserModel.getUsersByQuery.mockResolvedValueOnce(userNames.map((user) => ({ user })));
			});

			await expect(Roles.getRolesByUsers(teamspace, [users[0], users[1]]))
				.resolves.toEqual(groups.flatMap(({ id }, i) => (i === 2 ? [] : id)));
		});

		test('Should get no roles if the users do not belong to any groups', async () => {
			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce(groups);

			userNamesInGroups.forEach((userNames) => {
				UserModel.getUsersByQuery.mockResolvedValueOnce(userNames.map((user) => ({ user })));
			});

			await expect(Roles.getRolesByUsers(teamspace, [generateRandomString()]))
				.resolves.toEqual([]);
		});
	});
};

const testIsRoleNameUsed = () => {
	describe('Is role name used', () => {
		const teamspace = generateRandomString();
		const teamspaceId = generateRandomString();
		const roleName = generateRandomString();
		test('Should return true if the role name is already used', async () => {
			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce([{ name: roleName }]);

			await expect(Roles.isRoleNameUsed(teamspace, roleName)).resolves.toBe(true);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.getGroups).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroups).toHaveBeenCalledWith(teamspaceId, false);
		});

		test('Should return true if the role name is already used but with different capitialisation', async () => {
			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce([{ name: roleName.toUpperCase() }]);

			await expect(Roles.isRoleNameUsed(teamspace, roleName)).resolves.toBe(true);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.getGroups).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroups).toHaveBeenCalledWith(teamspaceId, false);
		});

		test('Should return false if the role name is not used', async () => {
			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.getGroups.mockResolvedValueOnce([{ name: generateRandomString() }]);

			await expect(Roles.isRoleNameUsed(teamspace, roleName)).resolves.toBe(false);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.getGroups).toHaveBeenCalledTimes(1);
			expect(Frontegg.getGroups).toHaveBeenCalledWith(teamspaceId, false);
		});
	});
};

const testCreateRole = () => {
	describe('Create role', () => {
		test('Should create a role', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();
			const roleData = { name: generateRandomString(), color: generateRandomString() };
			const expectedData = generateRandomString();

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.createGroup.mockResolvedValueOnce(expectedData);

			await expect(Roles.createRole(teamspace, roleData)).resolves.toEqual(expectedData);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.createGroup).toHaveBeenCalledTimes(1);
			expect(Frontegg.createGroup).toHaveBeenCalledWith(teamspaceId, roleData.name, roleData.color, undefined);
		});

		test('Should convert all users to userIds and create a role', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();
			const [user1, user2] = times(2, () => ({
				username: generateRandomString(),
				id: generateRandomString(),
				email: generateRandomString(),
			}));
			const roleData = {
				name: generateRandomString(),
				color: generateRandomString(),
				users: [user1.username, user2.username],
			};

			const expectedData = generateRandomString();

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.createGroup.mockResolvedValueOnce(expectedData);
			Frontegg.getAllUsersInAccount.mockResolvedValueOnce([user1, user2]);
			UserModel.getUsersByQuery.mockResolvedValueOnce([user1, user2].map(
				({ username, email }) => ({ user: username, customData: { email } })));

			await expect(Roles.createRole(teamspace, roleData)).resolves.toEqual(expectedData);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.createGroup).toHaveBeenCalledTimes(1);
			expect(Frontegg.createGroup).toHaveBeenCalledWith(
				teamspaceId, roleData.name, roleData.color, [user1.id, user2.id]);
			expect(Frontegg.getAllUsersInAccount).toHaveBeenCalledTimes(1);
			expect(Frontegg.getAllUsersInAccount).toHaveBeenCalledWith(teamspaceId);
			expect(UserModel.getUsersByQuery).toHaveBeenCalledTimes(1);
			expect(UserModel.getUsersByQuery).toHaveBeenCalledWith(
				{ 'customData.email': { $in: [user1.email, user2.email] } }, { user: 1, 'customData.email': 1 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetRoles();
	testGetRoleById();
	testGetRolesByUsers();
	testIsRoleNameUsed();
	testCreateRole();
});
