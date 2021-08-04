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
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const { intersection } = require("lodash");
const { removeUserFromProjects } = require("./project");

const updatePermissions = async function(teamspace, updatedPermissions) {
	const User = require("./user");
	await User.updatePermissions(teamspace.user, updatedPermissions);
	return updatedPermissions;
};

const checkValidUpdate = async (teamspace, teamMember, permissions) => {
	const User = require("./user");
	await User.teamspaceMemberCheck(teamMember, teamspace.user);

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

AccountPermissions.get = function(teamspace) {
	return  ((teamspace && teamspace.customData) || {}).permissions || [];
};

AccountPermissions.updateOrCreate = async function(teamspace, username, permissions) {
	await checkValidUpdate(teamspace, username, permissions);

	if(permissions && permissions.length === 0) {
		// this is actually a remove
		return await this.remove(teamspace, username);
	}

	const updatedPermissions = this.get(teamspace).filter(perm => perm.user !== username)
		.concat({user: username, permissions});

	return await updatePermissions(teamspace, updatedPermissions);
};

AccountPermissions.update = async function(teamspace, username, permissions) {
	const currPermission = this.findByUser(teamspace, username);

	if(!currPermission) {
		throw (responseCodes.ACCOUNT_PERM_NOT_FOUND);
	}

	return await this.updateOrCreate(teamspace, username, permissions);
};

AccountPermissions.remove = async function(teamspace, userToRemove) {
	const updatedPermissions = this.get(teamspace).filter(perm => perm.user !== userToRemove);

	if (updatedPermissions.length >=  this.get(teamspace).length) {
		throw responseCodes.ACCOUNT_PERM_NOT_FOUND;
	}

	await removeUserFromProjects(teamspace.user, userToRemove);

	return await updatePermissions(teamspace, updatedPermissions);
};

module.exports = AccountPermissions;
