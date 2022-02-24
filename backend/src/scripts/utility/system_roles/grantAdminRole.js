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

/**
 * This script is used to add admin role permissions to a named account to bootstrap the admin API.
 */

const { v5Path } = require('../../../interop');

const { getUserByUsername, grantAdministrativeRole } = require(`${v5Path}/models/users`);
const { hideBin } = require('yargs/helpers')
const { logger } = require(`${v5Path}/utils/logger`);
const { SYSTEM_ROLES } = require(`${v5Path}/utils/permissions/permissions.constants`);
const yargs = require('yargs/yargs')

const run = async () => {
	const username = argv.username
	let isUser
	try {
		isUser = getUserByUsername(username)
	} catch (error) {
		logger.logError(`${username} not found, please check and try again.`);
	}
	if (!SYSTEM_ROLES.includes(argv.role)) {
		logger.logError(`${argv.role} not found, can't grant ${argv.role}.`);
		return false
	}
	if (isUser){
		logger.logInfo(`Adding ${argv.role} to ${username}`);
		try {
			await grantAdministrativeRole(username,argv.role)
		} catch (error) {
			logger.logError(`We encountered an unexpected error.`,error);
		}
	} else {
		logger.logError(`${username} not found, can't grant ${argv.role}.`);
	}
};

const argv = yargs(hideBin(process.argv)).argv

if (!argv.username || !argv.role) {
	logger.logError(`Not enough arguments. call grantAdminRole --username <adminUsername> --role [${SYSTEM_ROLES}]`);
} else {
	// eslint-disable-next-line no-console
	run().catch(console.log).finally(process.exit);
}
