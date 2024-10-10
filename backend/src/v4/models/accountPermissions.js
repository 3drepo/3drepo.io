/**
 *  Copyright (C) 2019 3D Repo Ltd
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
const { v5Path } = require("../../interop");

const responseCodes = require("../response_codes.js");
const C = require("../constants");
const { intersection } = require("lodash");
const { removeUserFromProjects, removePermissionsFromAllProjects } = require("./project");

const { publish } = require(`${v5Path}/services/eventsManager/eventsManager`);
const { events } = require(`${v5Path}/services/eventsManager/eventsManager.constants`);

const updatePermissions = async function(teamspaceSettings, updatedPermissions, executor) {
	const User = require("./user");
	await User.updatePermissions(teamspaceSettings._id, updatedPermissions);

	publish(events.PERMISSIONS_UPDATED, { teamspace: teamspaceSettings._id, executor, isTsUpdate: true,
		initialPermissions: teamspaceSettings.permissions, updatedPermissions });

	return updatedPermissions;
};

const checkValidUpdate = async (teamspaceSettings, teamMember, permissions) => {
	const User = require("./user");
	await User.teamspaceMemberCheck(teamMember, teamspaceSettings._id);

	const isPermissionInvalid = permissions &&
		intersection(permissions, C.ACCOUNT_PERM_LIST).length !== permissions.length;

	if (isPermissionInvalid) {
		throw(responseCodes.INVALID_PERM);
	}
};

const AccountPermissions = {};

AccountPermissions.findByUser = function(user, username) {
	return this.get(user).find(perm => perm.user === username);
};

AccountPermissions.get = function(teamspaceSettings) {
	return  (teamspaceSettings || {}).permissions || [];
};

AccountPermissions.updateOrCreate = async function(teamspaceSettings, username, permissions, executor) {
	await checkValidUpdate(teamspaceSettings, username, permissions);

	if(permissions && permissions.length === 0) {
		// this is actually a remove
		return await this.remove(teamspaceSettings, username,executor);
	}

	const updatedPermissions = this.get(teamspaceSettings).filter(perm => perm.user !== username)
		.concat({user: username, permissions});

	const permissionsToReturn = await updatePermissions(teamspaceSettings, updatedPermissions, executor);
	if(permissions.includes(C.PERM_TEAMSPACE_ADMIN)) {
		await removePermissionsFromAllProjects(teamspaceSettings._id, username);
	}

	return permissionsToReturn;
};

AccountPermissions.update = async function(teamspaceSettings, username, permissions, executor) {
	const currPermission = this.findByUser(teamspaceSettings, username);

	if(!currPermission) {
		throw (responseCodes.ACCOUNT_PERM_NOT_FOUND);
	}

	return await this.updateOrCreate(teamspaceSettings, username, permissions, executor);
};

AccountPermissions.remove = async function(teamspaceSettings, userToRemove, executor) {
	const updatedPermissions = this.get(teamspaceSettings).filter(perm => perm.user !== userToRemove);

	if (updatedPermissions.length >=  this.get(teamspaceSettings).length) {
		throw responseCodes.ACCOUNT_PERM_NOT_FOUND;
	}

	await removeUserFromProjects(teamspaceSettings._id, userToRemove);

	return updatePermissions(teamspaceSettings, updatedPermissions, executor);
};

module.exports = AccountPermissions;
