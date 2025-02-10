/**
 *  Copyright (C) 2017 3D Repo Ltd
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

"use strict";

const C = require("../constants");
const db = require("../handler/db");
const { v5Path } = require("../../interop");
const responseCodes = require("../response_codes.js");
const { UUIDToString, stringToUUID } = require(`${v5Path}/utils/helper/uuids.js`);

const findByRoleID = async function(id) {
	return await db.findOne("admin", "system.roles", { _id: id});
};

const Role = {};

const ROLES_COLLECTION_NAME = "roles";

Role.addUserToRole = async function(teamspace, roleId, user) {
	// Check if user is member of teamspace
	const User = require("./user");
	await User.teamspaceMemberCheck(user, teamspace);

	const role = await Role.findByRole(teamspace, roleId);

	if (!role) {
		return Promise.reject(responseCodes.ROLE_NOT_FOUND);
	}

	if(!role.users.includes(user)) {
		role.users.push(user);

		await db.updateOne(teamspace, ROLES_COLLECTION_NAME, {_id: role._id}, {$set: {users: role.users}});
	}
};

Role.findByRole = async function(teamspace, roleId) {
	const foundRole = await db.findOne(teamspace, ROLES_COLLECTION_NAME,  { _id: stringToUUID(roleId) });

	if (foundRole && !foundRole.users) {
		foundRole.users = [];
	}

	return foundRole;
};

Role.findRoleByUser = async function(teamspace, user) {
	const foundRole = await db.findOne(teamspace, ROLES_COLLECTION_NAME, {users: user});

	if (foundRole && !foundRole.users) {
		foundRole.users = [];
	}

	return foundRole;
};

Role.findUsersWithRoles = async function(teamspace, roleIds) {
	const foundRoles = await db.find(teamspace, ROLES_COLLECTION_NAME, { _id: { $in: roleIds.map(stringToUUID) } });

	return foundRoles.reduce((users, roleItem) => users.concat(roleItem.users), []);
};

Role.removeUserFromAnyRole = (teamspace, userToRemove) => db.updateMany(teamspace, ROLES_COLLECTION_NAME, { users: userToRemove }, { $pull: { users: userToRemove } });

Role.usersWithRole = async function(teamspace) {
	const foundRoles = await db.find(teamspace, ROLES_COLLECTION_NAME, {}, {_id: 1, users : 1});
	const userToRole = {};

	foundRoles.forEach(role => {
		if (role.users) {
			role.users.forEach(user => {
				userToRole[user] = UUIDToString(role._id);
			});
		}
	});

	return userToRole;
};

module.exports = Role;
