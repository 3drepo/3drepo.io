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

const { createResponseCode, templates } = require('../utils/responseCodes');
const { getUsersWithRole,
	grantAdministrativeRole,
	hasAdministrativeRole,
	revokeAdministrativeRole,
} = require('../models/users');
const { SYSTEM_ADMIN } = require('../utils/permissions/permissions.constants');
const { logger } = require('../utils/logger');

const Admin = {};

Admin.getUsersWithRole = async (users, roles) => {
	const returnUsers = await getUsersWithRole(users, roles);
	if (!returnUsers) throw createResponseCode(templates.userNotFound, 'No users found that match the query.');
	return returnUsers;
};
Admin.grantUsersRoles = async (currentUser, users) => {
	const returnUsers = [];
	const results = users.map(async (user) => {
		const userHasRole = await hasAdministrativeRole(user.user, user.role);
		if (!userHasRole) {
			const grantedRole = await grantAdministrativeRole(user.user, user.role);
			if (grantedRole) {
				returnUsers.push(user);
				logger.logInfo(`${currentUser} granted role ${user.role} to ${user.user}`);
			} else {
				logger.logError(`${currentUser} failed to grant ${user.role} to ${user.user}: ${grantedRole}`);
			}
		} else {
			logger.logInfo(`${currentUser} failed to grant ${user.role} to ${user.user}: User already has role`);
		}
	});
	await Promise.all(results);
	return returnUsers;
};

Admin.revokeUsersRoles = async (currentUser, users) => {
	const returnUsers = [];
	const results = users.map(async (user) => {
		const userHasRole = await hasAdministrativeRole(user.user, user.role);
		const safeToContinue = !(user.user === currentUser && user.role === SYSTEM_ADMIN && userHasRole);
		if (!safeToContinue) {
			logger.logError(`${currentUser} failed to revoked role ${user.role} to ${user.user} : cannot revoke own system permissions`);
			return false;
		}
		if (userHasRole) {
			const revokedRole = await revokeAdministrativeRole(user.user, user.role);
			if (revokedRole) {
				returnUsers.push(user);
				logger.logInfo(`${currentUser} revoked role ${user.role} from ${user.user}`);
			} else {
				logger.logError(`${currentUser} failed to revoke ${user.role} from ${user.user}: ${revokedRole}`);
				return false;
			}
		} else {
			logger.logInfo(`${currentUser} failed to revoke ${user.role} from ${user.user} as user does not have role.`);
			return false;
		}
		return true;
	});
	await Promise.all(results);
	return returnUsers;
};

module.exports = Admin;
