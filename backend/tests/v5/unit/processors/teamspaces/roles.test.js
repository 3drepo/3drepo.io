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

const { generateRandomString, determineTestGroup, outOfOrderArrayEqual } = require('../../../helper/services');
const { templates } = require('../../../../../src/v5/utils/responseCodes');

const { DEFAULT_ROLES, DEFAULT_OWNER_ROLE } = require('../../../../../src/v5/models/roles.constants');
const { deleteIfUndefined } = require('../../../../../src/v5/utils/helper/objects');

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

const testCreateDefaultRoles = () => {
	describe('Create default roles', () => {
		test('Should create default roles', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.createGroup.mockResolvedValue();

			await Roles.createDefaultRoles(teamspace);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.createGroup).toHaveBeenCalledTimes(DEFAULT_ROLES.length);
			DEFAULT_ROLES.forEach(({ name, color }) => {
				expect(Frontegg.createGroup).toHaveBeenCalledWith(teamspaceId, name, color, undefined);
			});
			expect(UserModel.getUserId).not.toHaveBeenCalled();
		});

		test('Should create default roles and assign admin role to the user provided', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();
			const firstAdmin = generateRandomString();
			const userId = generateRandomString();

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.createGroup.mockResolvedValue();
			UserModel.getUserId.mockResolvedValueOnce(userId);

			await Roles.createDefaultRoles(teamspace, firstAdmin);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.createGroup).toHaveBeenCalledTimes(DEFAULT_ROLES.length);
			DEFAULT_ROLES.forEach(({ name, color }) => {
				expect(Frontegg.createGroup).toHaveBeenCalledWith(teamspaceId, name, color,
					name === DEFAULT_OWNER_ROLE ? [userId] : undefined);
			});

			expect(UserModel.getUserId).toHaveBeenCalledTimes(1);
			expect(UserModel.getUserId).toHaveBeenCalledWith(firstAdmin);
		});
	});
};

const testCreateRoles = () => {
	describe('Create multiple roles', () => {
		test('Should convert all users to userIds and create roles', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();

			const [user1, user2] = times(2, () => ({
				username: generateRandomString(),
				id: generateRandomString(),
				email: generateRandomString(),
			}));

			const expectedData = [];

			const roleData = times(2, (i) => {
				const name = generateRandomString();
				return deleteIfUndefined({
					name,
					color: generateRandomString(),
					users: i === 0 ? [user1.username, user2.username, generateRandomString()] : undefined,
				});
			});

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);
			Frontegg.createGroup.mockImplementation((ts, name) => {
				const id = generateRandomString();
				expectedData.push({ id, name });
				return id;
			});

			Frontegg.getAllUsersInAccount.mockResolvedValueOnce([user1, user2]);
			UserModel.getUsersByQuery.mockResolvedValueOnce([user1, user2].map(
				({ username, email }) => ({ user: username, customData: { email } })));

			const returnedData = await Roles.createRoles(teamspace, roleData);
			outOfOrderArrayEqual(expectedData, returnedData);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.createGroup).toHaveBeenCalledTimes(roleData.length);
			roleData.forEach(({ name, color, users }) => {
				expect(Frontegg.createGroup).toHaveBeenCalledWith(
					teamspaceId, name, color, users?.length ? [user1.id, user2.id] : undefined);
			});
			expect(Frontegg.getAllUsersInAccount).toHaveBeenCalledTimes(1);
			expect(Frontegg.getAllUsersInAccount).toHaveBeenCalledWith(teamspaceId);
			expect(UserModel.getUsersByQuery).toHaveBeenCalledTimes(1);
			expect(UserModel.getUsersByQuery).toHaveBeenCalledWith(
				{ 'customData.email': { $in: [user1.email, user2.email] } }, { user: 1, 'customData.email': 1 });
		});
	});
};

const testUpdateRole = () => {
	describe('Update role', () => {
		test('should do nothing if the roleData is empty', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const teamspaceId = generateRandomString();
			const updatedData = {};

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);

			await Roles.updateRole(teamspace, roleId, updatedData);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.updateGroup).not.toHaveBeenCalled();

			expect(Frontegg.addUsersToGroup).not.toHaveBeenCalled();
			expect(Frontegg.removeUsersFromGroup).not.toHaveBeenCalled();
		});

		test('Update role information (not users)', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const teamspaceId = generateRandomString();
			const updatedData = {
				name: generateRandomString(),
				color: generateRandomString(),
			};

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);

			await Roles.updateRole(teamspace, roleId, updatedData);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.updateGroup).toHaveBeenCalledTimes(1);
			expect(Frontegg.updateGroup).toHaveBeenCalledWith(teamspaceId, roleId, updatedData);

			expect(Frontegg.addUsersToGroup).not.toHaveBeenCalled();
			expect(Frontegg.removeUsersFromGroup).not.toHaveBeenCalled();
		});

		const [user1, user2] = times(2, () => ({
			username: generateRandomString(),
			id: generateRandomString(),
			email: generateRandomString(),
		}));

		describe.each([
			['Add role users', [user1.username, user2.username], undefined, [user1.id, user2.id]],
			['Users trying to add are already in the role', [user1.username, user2.username], [{ id: user1.id }, { id: user2.id }]],
			['Could not map user to an ID', [generateRandomString()]],
			['Remove role users', [], [{ id: user1.id }, { id: user2.id }], undefined, [user1.id, user2.id]],
			['Both add/remove', [user1.username], [{ id: user2.id }], [user1.id], [user2.id]],
			['Add role users and update role data', [user1.username, user2.username], [], [user1.id, user2.id], undefined, true],
		])('Edit role users', (desc, updatedData, usersInGroup, toAdd, toRemove, updateOtherData) => {
			test(desc, async () => {
				const teamspace = generateRandomString();
				const roleId = generateRandomString();
				const teamspaceId = generateRandomString();
				const roleData = {
					users: updatedData,
					...(updateOtherData ? {
						name: generateRandomString(),
						color: generateRandomString(),
					} : {}),
				};

				TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);

				Frontegg.getAllUsersInAccount.mockResolvedValueOnce([user1, user2]);
				Frontegg.getGroupById.mockResolvedValueOnce({ users: usersInGroup });
				UserModel.getUsersByQuery.mockResolvedValueOnce([user1, user2].map(
					({ username, email }) => ({ user: username, customData: { email } })));

				await Roles.updateRole(teamspace, roleId, roleData);

				expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
				expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
				if (updateOtherData) {
					expect(Frontegg.updateGroup).toHaveBeenCalledTimes(1);
					const { users, ...otherData } = roleData;
					expect(Frontegg.updateGroup).toHaveBeenCalledWith(teamspaceId, roleId, otherData);
				} else {
					expect(Frontegg.updateGroup).not.toHaveBeenCalled();
				}
				if (toAdd?.length) {
					expect(Frontegg.addUsersToGroup).toHaveBeenCalledTimes(1);
					expect(Frontegg.addUsersToGroup).toHaveBeenCalledWith(teamspaceId, roleId, toAdd);
				} else {
					expect(Frontegg.addUsersToGroup).not.toHaveBeenCalled();
				}

				if (toRemove?.length) {
					expect(Frontegg.removeUsersFromGroup).toHaveBeenCalledTimes(1);
					expect(Frontegg.removeUsersFromGroup).toHaveBeenCalledWith(teamspaceId, roleId, toRemove);
				} else {
					expect(Frontegg.removeUsersFromGroup).not.toHaveBeenCalled();
				}

				expect(Frontegg.getGroupById).toHaveBeenCalledTimes(1);
				expect(Frontegg.getGroupById).toHaveBeenCalledWith(teamspaceId, roleId, true);

				expect(Frontegg.getAllUsersInAccount).toHaveBeenCalledTimes(1);
				expect(Frontegg.getAllUsersInAccount).toHaveBeenCalledWith(teamspaceId);
				expect(UserModel.getUsersByQuery).toHaveBeenCalledTimes(1);
				expect(UserModel.getUsersByQuery).toHaveBeenCalledWith(
					{ 'customData.email': { $in: [user1.email, user2.email] } }, { user: 1, 'customData.email': 1 });
			});
		});
	});
};

const testDeleteRole = () => {
	describe('Delete role', () => {
		test('should delete role', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const teamspaceId = generateRandomString();

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(teamspaceId);

			await Roles.deleteRole(teamspace, roleId);

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);
			expect(Frontegg.removeGroup).toHaveBeenCalledTimes(1);
			expect(Frontegg.removeGroup).toHaveBeenCalledWith(teamspaceId, roleId);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetRoles();
	testGetRoleById();
	testGetRolesByUsers();
	testIsRoleNameUsed();
	testCreateRole();
	testCreateRoles();
	testCreateDefaultRoles();
	testUpdateRole();
	testDeleteRole();
});
