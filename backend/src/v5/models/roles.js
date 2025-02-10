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

const { DEFAULT_ROLES, TEAM_MEMBER } = require('./roles.constants');

const COL_NAME = 'roles';
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
const { templates } = require('../utils/responseCodes');
const { uniqueElements } = require('../utils/helper/arrays');

const Roles = {};

const findOne = async (teamspace, query, projection) => {
	const template = await db.findOne(teamspace, COL_NAME, query, projection);
	if (!template) {
		throw templates.roleNotFound;
	}

	return template;
};

const findMany = (ts, query, projection, sort) => db.find(ts, COL_NAME, query, projection, sort);
const updateOne = (ts, query, action) => db.updateOne(ts, COL_NAME, query, action);
const updateMany = (ts, query, action) => db.updateMany(ts, COL_NAME, query, action);

// --- LICENSING ROLES --- TO BE DELETED

Roles.createTeamspaceRole = (teamspace) => db.createRole(teamspace, TEAM_MEMBER);

Roles.removeTeamspaceRole = (teamspace) => db.dropRole(teamspace, TEAM_MEMBER);

Roles.grantTeamspaceRoleToUser = (teamspace, username) => db.grantRole(teamspace, TEAM_MEMBER, username);

Roles.revokeTeamspaceRoleFromUser = (teamspace, username) => db.revokeRole(teamspace, TEAM_MEMBER, username);

// --- JOBS RENAMED TO ROLES --- TO BE KEPT

Roles.getRolesToUsers = (teamspace) => findMany(teamspace, {}, { _id: 1, users: 1 });

Roles.getRoles = (teamspace, projection) => findMany(teamspace, {}, projection);

Roles.getRoleById = (teamspace, _id, projection) => findOne(teamspace, { _id }, projection);

Roles.getRoleByName = (teamspace, name, projection) => findOne(teamspace, { name }, projection);

Roles.createRoles = async (teamspace, roles) => {
	await db.insertMany(teamspace, COL_NAME, roles);
};

Roles.createRole = async (teamspace, role) => {
	const addedRole = { _id: generateUUID(), ...role };
	await db.insertOne(teamspace, COL_NAME, addedRole);
	return addedRole._id;
};

Roles.addDefaultRoles = (teamspace) => Roles.createRoles(teamspace,
	DEFAULT_ROLES.map((role) => ({ ...role, _id: generateUUID(), users: [] })));

Roles.assignUserToRole = async (teamspace, roleName, username) => {
	await updateOne(teamspace, { name: roleName }, { $push: { users: username } });
};

Roles.removeUserFromRoles = async (teamspace, userToRemove) => {
	await updateMany(teamspace, { users: userToRemove }, { $pull: { users: userToRemove } });
};

Roles.getRolesByUsers = async (teamspace, users) => {
	const roles = await findMany(teamspace, { users: { $in: users } }, { _id: 1 });
	return roles.map((j) => j._id);
};

Roles.getUsersByRoles = async (teamspace, roleIds) => {
	const roles = await findMany(teamspace, { _id: { $in: roleIds } }, { users: 1 });
	return uniqueElements(roles.reduce((users, roleItem) => users.concat(roleItem.users), []));
};

Roles.updateRole = (teamspace, role, updatedRole) => updateOne(teamspace, { _id: role }, { $set: updatedRole });

Roles.deleteRole = (teamspace, roleId) => db.deleteOne(teamspace, COL_NAME, { _id: roleId });

module.exports = Roles;
