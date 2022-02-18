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

const { SYSTEM_ADMIN, SYSTEM_ROLES } = require('../utils/permissions/permissions.constants');
const { createResponseCode, templates } = require('../utils/responseCodes');
const { getUsersWithRole,
	grantAdministrativeRole,
	hasAdministrativeRole,
	revokeAdministrativeRole,
} = require('../models/users');
const { getArrayDifference } = require('../utils/helper/arrays');
const { logger } = require('../utils/logger');

const grantRolesToUser = async (currentUser, user, roles) => {
	const results = roles.map(async (role) => {
		const userHasRole = await hasAdministrativeRole(user, role);
		if (!userHasRole) {
			const grantedRole = await grantAdministrativeRole(user, role);
			if (grantedRole) {
				logger.logInfo(`${currentUser} granted ${role} to ${user}`);
			} else {
				logger.logError(`${currentUser} failed to grant ${role} to ${user}: ${grantedRole}`);
			}
		}
	});
	return Promise.all(results);
};

const revokeRolesFromUser = async (currentUser, user, roles) => {
	const results = roles.map(async (role) => {
		const userHasRole = await hasAdministrativeRole(user, role);
		const safeToContinue = !(user === currentUser && role === SYSTEM_ADMIN && userHasRole);
		if (!safeToContinue) {
			logger.logError(`${currentUser} failed to revoked role ${role} from ${user} : cannot revoke own system permissions`);
			return false;
		}
		if (userHasRole) {
			const revokedRole = await revokeAdministrativeRole(user, role);
			if (revokedRole) {
				logger.logInfo(`${currentUser} revoked role ${role} from ${user}`);
			} else {
				logger.logError(`${currentUser} failed to revoke ${role} from ${user}: ${revokedRole}`);
				return false;
			}
		}
		return true;
	});
	return Promise.all(results);
};

const Admin = {};

Admin.getUsersWithRole = async (users, roles) => {
	const returnUsers = await getUsersWithRole(users, roles);
	if (!returnUsers) throw createResponseCode(templates.userNotFound, 'No users found that match the query.');
	return returnUsers;
};

Admin.putUsersRoles = async (currentUser, users) => {
	const putUsers = [];
	const results = users.map(async (user) => {
		putUsers.push(user.user);
		await grantRolesToUser(currentUser, user.user, user.roles);
	});
	await Promise.all(results);
	return getUsersWithRole(putUsers);
};

Admin.patchUsersRoles = async (currentUser, users) => {
	const patchUsers = [];
	const results = users.map(async (user) => {
		patchUsers.push(user.user);
		const missingRoles = await getArrayDifference(user.roles, SYSTEM_ROLES);
		await revokeRolesFromUser(currentUser, user.user, missingRoles);
		await grantRolesToUser(currentUser, user.user, user.roles);
	});
	await Promise.all(results);
	return getUsersWithRole(patchUsers);
};

Admin.revokeUsersRoles = async (currentUser, users) => {
	const revokeUsers = [];
	const results = users.map(async (user) => {
		revokeUsers.push(user.user);
		await revokeRolesFromUser(currentUser, user.user, user.roles);
	});
	await Promise.all(results);
	return getUsersWithRole(revokeUsers);
};

module.exports = Admin;
