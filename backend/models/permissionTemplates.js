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

const PermissionTemplates = {};
const C = require("../constants");
const _ = require("lodash");
const responseCodes = require("../response_codes.js");

PermissionTemplates.get = function(user) {
	return user.customData.permissionTemplates;
};

PermissionTemplates.findById = function(user, id) {
	return this.get(user).find(({_id}) => _id === id);
};

const updatePermissions = async (teamspace, updatedPermissions) => {
	const User = require("./user");
	await User.updatePermissionTemplates(teamspace.user, updatedPermissions);
	return updatedPermissions;
};

PermissionTemplates.add = async function (teamspace, permission) {
	const isPermissionInvalid = !Array.isArray(permission.permissions) ||
	_.intersection(permission.permissions, C.MODEL_PERM_LIST).length !== permission.permissions.length;

	if (this.findById(teamspace, permission._id)) {
		throw (responseCodes.DUP_PERM_TEMPLATE);
	}

	if (isPermissionInvalid) {
		throw (responseCodes.INVALID_PERM);
	}

	return await updatePermissions(teamspace, this.get(teamspace).concat(permission));
};

PermissionTemplates.remove = async function(teamspace, id) {

	if(id === C.ADMIN_TEMPLATE) {
		throw (responseCodes.ADMIN_TEMPLATE_CANNOT_CHANGE);
	}

	const permission = this.findById(teamspace, id);

	if (!permission) {
		throw (responseCodes.PERM_NOT_FOUND);
	}

	return await updatePermissions(teamspace, this.get(teamspace).filter(({_id}) => _id !== id));
};

module.exports = PermissionTemplates;

