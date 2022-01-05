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
const {	SYSTEM_ADMIN, SYSTEM_ROLES } = require('../utils/permissions/permissions.constants');
const { getUserByUsername, getUsersWithRole,
    grantAdministrativeRole,
    hasAdministrativeRole,
    revokeAdministrativeRole,
} = require('../models/users');
const { logger } = require('../utils/logger');

const Admin = {};

Admin.getUsersWithRole = async (users, roles) => await getUsersWithRole(users, roles);

Admin.grantUsersRoles = async (currentUser, users) => {
    if (Array.isArray(users) && users.length > 0) {
        const returnUsers = [];
        const errorUsers = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (SYSTEM_ROLES.includes(user.role)) {
                try {
                    const userExists = await getUserByUsername(user.user);
                    const userHasRole = await hasAdministrativeRole(user.user, user.role);
                    if (userExists && !userHasRole) {
                        const grantedRole = await grantAdministrativeRole(user.user, user.role);
                        grantedRole ? returnUsers.push(user) : errorUsers.push(user);
                        if (grantedRole) {
                            logger.logInfo(`${currentUser} granted role ${user.role} to ${user.user}`);
                            returnUsers.push(user);
                        } else {
                            logger.logError(`${currentUser} failed to grant ${user.role} to ${user.user}: ${revokedRole}`);
                            errorUsers.push(user);
                        }
                    } else {
                        logger.logWarning(`${currentUser} failed to grant ${user.role} to ${user.user}: user already has the role`);
                        errorUsers.push(user);
                    }
                } catch (err) {
                    if (err === templates.userNotFound) logger.logWarning(`${currentUser} failed to grant role ${user.role} to ${user.user} : user not found`);
                    errorUsers.push(user);
                }
            } else {
                logger.logError(`${currentUser} failed to grant role ${user.role} to ${user.user} : role is not valid`);
                errorUsers.push(user);
            }
        }
        return { successUsers: returnUsers, failedUsers: errorUsers };
    } throw templates.invalidArguments;
};


Admin.grantUsersRoles2 = async (currentUser, users) => {
    const returnUsers = [];
    const errorUsers = [];
	if (users.length > 0) {
		users.forEach(async (user) => {
			const hasPermission = await hasAdministrativeRole(user.user, user.role)
			if (!hasPermission) {
				if ( await grantAdministrativeRole(user.user, user.role) ) {
                    logger.logInfo(`${currentUser} granted role ${user.role} from ${user.user}`);
					returnUsers.push(user)

				} else {
                    errorUsers.push(user);
                    logger.logError(`${currentUser} failed to grant role ${user.role} to ${user.user} : role is not valid`);
				};
			}
		});
	}
	return await Promise.all([returnUsers,errorUsers]);
};

Admin.grantUsersRoles3 = async (currentUser, users) => {
    const returnUsers = [];
    const errorUsers = [];
	if (users.length > 0) {
		users.forEach(async (user) => {
            try {
                hasAdministrativeRole(user.user, user.role).then(
                    async (hasPermission) => {
                        if (hasPermission) grantAdministrativeRole(user.user, user.role).then(
                            async (hasGranted) => {
                                if (hasGranted) {
                                    logger.logInfo(`${currentUser} granted role ${user.role} to ${user.user}`);
                                    returnUsers.push(user);
                                } else {
                                    logger.logError(`${currentUser} failed to grant ${user.role} to ${user.user}: ${revokedRole}`);
                                    errorUsers.push(user);
                                }
                            }
                        )
                    }
                )
            } catch (err) {
                if (err === templates.userNotFound) logger.logWarning(`${currentUser} failed to grant role ${user.role} to ${user.user} : user not found`);
                if (err === templates.invalidArguments) logger.logError(`role provided not in SYSTEM_ROLES`);
                errorUsers.push(user);        
            }
        });
    };
    
    return await Promise.all([returnUsers]);
};

Admin.revokeUsersRoles = async (currentUser, users) => {
    if (Array.isArray(users) && users.length > 0 && currentUser.length > 0) {
        const returnUsers = [];
        const errorUsers = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const safeToContinue = !(user.user === currentUser && user.role === SYSTEM_ADMIN);
            if (!safeToContinue) {
                logger.logError(`${currentUser} failed to revoked role ${user.role} to ${user.user} : cannot revoke own system permissions`);
                errorUsers.push(user);
                continue;
            }
            if (SYSTEM_ROLES.includes(user.role)) {
                try {
                    const userExists = await getUserByUsername(user.user);
                    const userHasRole = await hasAdministrativeRole(user.user, user.role);
                    if (!userHasRole) {
                        logger.logWarning(`${currentUser} role ${user.role} not present for ${user.user}`);
                        errorUsers.push(user);
                        continue;
                    }
                    if (userExists && userHasRole) {
                        const revokedRole = await revokeAdministrativeRole(user.user, user.role);
                        if (revokedRole) {
                            logger.logInfo(`${currentUser} revoked role ${user.role} from ${user.user}`);
                            returnUsers.push(user);
                        } else {
                            logger.logError(`${currentUser} failed to revoke ${user.role} from ${user.user}: ${revokedRole}`);
                            errorUsers.push(user);
                        }
                    }
                } catch (err) {
                    if (err === templates.userNotFound) logger.logWarning(`${currentUser} failed to revoke role ${user.role} from ${user.user} : user not found`);
                    errorUsers.push(user);
                }
            } else {
                logger.logError(`${currentUser} failed to revoked role ${user.role} from ${user.user} : role is not valid`);
                errorUsers.push(user);
            }
        }
        return { successUsers: returnUsers, failedUsers: errorUsers };
    }
    throw createResponseCode(templates.invalidArguments, `The format of the input is not correct: ${currentUser} ${users}`);
};

module.exports = Admin;
