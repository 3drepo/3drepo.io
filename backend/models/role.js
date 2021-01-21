/**
 *	Copyright (C) 2017 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const C = require("../constants");
const DB = require("../handler/db");

const Role = {};

Role.createTeamSpaceRole = async function (account) {
	const roleId = `${account}.${C.DEFAULT_MEMBER_ROLE}`;

	const roleFound = await Role.findByRoleID(roleId);

	if(roleFound) {
		return { role: roleFound.role, db: roleFound.db};
	}

	const roleName = C.DEFAULT_MEMBER_ROLE;
	const createRoleCmd = {
		"createRole": roleName,
		"privileges":[{
			"resource":{
				"db": account,
				"collection": "settings"
			},
			"actions": ["find"]}
		],
		"roles": []
	};

	await DB.runCommand(account, createRoleCmd);
	return {role: roleName, db: account};
};

Role.dropTeamSpaceRole = async function (account) {
	const dropRoleCmd = {
		"dropRole" : C.DEFAULT_MEMBER_ROLE
	};

	const role = await this.findByRoleID(`${account}.${C.DEFAULT_MEMBER_ROLE}`);

	if(!role) {
		return;
	}

	return await DB.runCommand(account, dropRoleCmd);
};

Role.grantTeamSpaceRoleToUser = async function (username, account) {
	const grantRoleCmd = {
		grantRolesToUser: username,
		roles: [{role: C.DEFAULT_MEMBER_ROLE, db: account}]
	};

	return await DB.runCommand("admin", grantRoleCmd);
};

Role.findByRoleID = async function(id) {
	return await DB.findOne("admin", "system.roles", { _id: id});
};

Role.revokeTeamSpaceRoleFromUser = async function(username, account) {
	const cmd = {
		revokeRolesFromUser: username,
		roles: [{role: C.DEFAULT_MEMBER_ROLE, db: account}]
	};

	return await DB.runCommand("admin", cmd);
};

module.exports = Role;
