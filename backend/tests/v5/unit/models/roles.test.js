/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { src } = require('../../helper/path');
const { generateRandomObject, generateRandomString, generateRole } = require('../../helper/services');
const { times } = require('lodash');

const Roles = require(`${src}/models/roles`);
const db = require(`${src}/handler/db`);

const { DEFAULT_ROLES, TEAM_MEMBER } = require(`${src}/models/roles.constants`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);

const ROLE_COL = 'roles';

// --- LICENSING ROLES --- TO BE DELETED

const testCreateTeamspaceRole = () => {
	describe('Create teamspace role', () => {
		test('should create a new teamspace role', async () => {
			const teamspace = generateRandomString();

			const fn = jest.spyOn(db, 'createRole').mockImplementationOnce(() => { });
			await Roles.createTeamspaceRole(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER);
		});
	});
};

const testRemoveTeamspaceRole = () => {
	describe('Remove teamspace role', () => {
		test('should remove the teamspace role', async () => {
			const teamspace = generateRandomString();

			const fn = jest.spyOn(db, 'dropRole').mockImplementationOnce(() => { });
			await Roles.removeTeamspaceRole(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER);
		});
	});
};

const testGrantTeamspaceRoleToUser = () => {
	describe('Grant teamspace role to user', () => {
		test('should assign a teamspace role to the user', async () => {
			const teamspace = generateRandomString();
			const username = generateRandomString();

			const fn = jest.spyOn(db, 'grantRole').mockImplementationOnce(() => { });
			await Roles.grantTeamspaceRoleToUser(teamspace, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER, username);
		});
	});
};

const testRevokeTeamspaceRoleFromUser = () => {
	describe('Revoke teamspace role from user', () => {
		test('should revoke teamspace role from the user', async () => {
			const teamspace = generateRandomString();
			const username = generateRandomString();
			const fn = jest.spyOn(db, 'revokeRole').mockImplementationOnce(() => { });
			await Roles.revokeTeamspaceRoleFromUser(teamspace, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER, username);
		});
	});
};

// --- JOBS RENAMED TO ROLES --- TO BE KEPT

const testCreateIndex = () => {
	describe('Create Index', () => {
		test('should create an index for role collection', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'createIndex').mockImplementationOnce(() => {});
			await Roles.createIndex(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { name: 1 }, { unique: true });
		});
	});
};

const testGetRolesToUsers = () => {
	describe('Get Roles to users', () => {
		test('should get list of roles within the teamspace with the users', async () => {
			const expectedResult = [{ _id: generateRandomString(), users: times(3, () => generateRandomString()) }];
			const teamspace = generateRandomString();

			const fn = jest.spyOn(db, 'find').mockImplementationOnce(() => expectedResult);
			const res = await Roles.getRolesToUsers(teamspace);
			expect(res).toEqual(expectedResult);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { }, { _id: 1, users: 1 }, undefined);
		});
	});
};

const testAddDefaultRoles = () => {
	describe('Add default roles', () => {
		test('should add the default roles', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'insertMany').mockImplementationOnce(() => {});
			await Roles.addDefaultRoles(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(ROLE_COL);

			const defaultRoles = fn.mock.calls[0][2];
			defaultRoles.forEach((role, index) => {
				expect(role).toMatchObject({
					name: DEFAULT_ROLES[index].name,
					_id: expect.anything(),
					users: [],
				});
			});
		});
	});
};

const testAssignUserToRole = () => {
	describe('Assign user to role', () => {
		test('should assign a user to a role', async () => {
			const teamspace = generateRandomString();
			const roleName = generateRandomString();
			const username = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => {});
			await Roles.assignUserToRole(teamspace, roleName, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { name: roleName }, { $push: { users: username } });
		});
	});
};

const testRemoveUserFromRoles = () => {
	describe('Remove user from role', () => {
		test('should remove user from roles', async () => {
			const teamspace = generateRandomString();
			const userToRemove = generateRandomString();
			const fn = jest.spyOn(db, 'updateMany').mockImplementationOnce(() => {});
			await Roles.removeUserFromRoles(teamspace, userToRemove);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL,
				{ users: userToRemove }, { $pull: { users: userToRemove } });
		});
	});
};

const testGetRolesByUsers = () => {
	describe('Get roles by users', () => {
		test('return names of all roles thats users have access', async () => {
			const teamspace = generateRandomString();
			const users = times(5, () => generateRandomString());
			const roles = times(5, () => generateRole());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(roles);
			await expect(Roles.getRolesByUsers(teamspace, users)).resolves.toEqual(roles.map((j) => j._id));
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { users: { $in: users } }, { _id: 1 }, undefined);
		});

		test('return an empty array if there are no roles', async () => {
			const teamspace = generateRandomString();
			const users = times(5, () => generateRandomString());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await expect(Roles.getRolesByUsers(teamspace, users)).resolves.toEqual([]);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { users: { $in: users } }, { _id: 1 }, undefined);
		});
	});
};

const testGetRoles = () => {
	describe('Get roles', () => {
		test('return all available roles', async () => {
			const teamspace = generateRandomString();
			const projection = generateRandomObject();
			const roles = [generateRandomString(), generateRandomString(), generateRandomString()];
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(roles);
			await expect(Roles.getRoles(teamspace, projection)).resolves.toEqual(roles);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, ROLE_COL, {}, projection, undefined);
		});

		test('return an empty array if there are no roles', async () => {
			const teamspace = generateRandomString();
			const projection = generateRandomObject();
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await expect(Roles.getRoles(teamspace, projection)).resolves.toEqual([]);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, ROLE_COL, {}, projection, undefined);
		});
	});
};

const testGetRoleById = () => {
	describe('Get role by Id', () => {
		test('return a role', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const projection = generateRandomObject();
			const role = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(role);
			await expect(Roles.getRoleById(teamspace, roleId, projection)).resolves.toEqual(role);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, ROLE_COL, { _id: roleId }, projection);
		});

		test('return roleNotFound if a role is not found', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const projection = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Roles.getRoleById(teamspace, roleId, projection)).rejects.toEqual(templates.roleNotFound);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, ROLE_COL, { _id: roleId }, projection);
		});
	});
};

const testGetRoleByName = () => {
	describe('Get role by name', () => {
		test('return a role', async () => {
			const teamspace = generateRandomString();
			const roleName = generateRandomString();
			const projection = generateRandomObject();
			const role = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(role);
			await expect(Roles.getRoleByName(teamspace, roleName, projection)).resolves.toEqual(role);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, ROLE_COL, { name: roleName }, projection);
		});

		test('return roleNotFound if a role is not found', async () => {
			const teamspace = generateRandomString();
			const roleName = generateRandomString();
			const projection = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Roles.getRoleByName(teamspace, roleName, projection)).rejects.toEqual(templates.roleNotFound);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, ROLE_COL, { name: roleName }, projection);
		});
	});
};

const testCreateRole = () => {
	describe('Create role', () => {
		test('should create a new role', async () => {
			const teamspace = generateRandomString();
			const role = generateRandomObject();
			const fn = jest.spyOn(db, 'insertOne').mockImplementationOnce(() => {});
			const res = await Roles.createRole(teamspace, role);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, expect.any(Object));
			const newId = fn.mock.calls[0][2]._id;
			expect(isUUIDString(newId));
			expect(res).toEqual(newId);
		});
	});
};

const testUpdateRole = () => {
	describe('Update role', () => {
		test('should update a role', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const updatedRole = generateRandomObject();
			const fn = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => {});
			await Roles.updateRole(teamspace, roleId, updatedRole);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { _id: roleId }, { $set: updatedRole });
		});
	});
};

const testGetUsersByRoles = () => {
	describe('Get users by roles', () => {
		test('should get users by roles', async () => {
			const teamspace = generateRandomString();
			const user1 = generateRandomString();
			const user2 = generateRandomString();
			const roleIds = times(5, () => generateRandomString());
			const roles = [
				{ _id: generateRandomString(), users: [user1, user2] },
				{ _id: generateRandomString(), users: [user1] },
				{ _id: generateRandomString(), users: [] },
			];
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(roles);
			const res = await Roles.getUsersByRoles(teamspace, roleIds);
			expect(res).toEqual([user1, user2]);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { _id: { $in: roleIds } }, { users: 1 }, undefined);
		});
	});
};

const testDeleteRole = () => {
	describe('Delete role', () => {
		test('should delete a role', async () => {
			const teamspace = generateRandomString();
			const roleId = generateRandomString();
			const fn = jest.spyOn(db, 'deleteOne').mockImplementationOnce(() => {});
			await Roles.deleteRole(teamspace, roleId);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ROLE_COL, { _id: roleId });
		});
	});
};

describe('models/roles', () => {
	testCreateTeamspaceRole();
	testRemoveTeamspaceRole();
	testGrantTeamspaceRoleToUser();
	testRevokeTeamspaceRoleFromUser();
	testCreateIndex();
	testGetRolesToUsers();
	testAddDefaultRoles();
	testAssignUserToRole();
	testRemoveUserFromRoles();
	testGetRolesByUsers();
	testGetRoles();
	testGetRoleById();
	testGetRoleByName();
	testCreateRole();
	testGetUsersByRoles();
	testUpdateRole();
	testDeleteRole();
});
