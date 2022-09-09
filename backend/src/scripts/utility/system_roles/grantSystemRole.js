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

const Path = require('path');

const { v5Path } = require('../../../interop');

const { getUserByUsernameOrEmail, grantAdministrativeRole } = require(`${v5Path}/models/users`);

const { logger } = require(`${v5Path}/utils/logger`);
const { SYSTEM_ROLES } = require(`${v5Path}/utils/permissions/permissions.constants`);

const run = async (username, role) => {
	let isUser;
	try {
		isUser = await getUserByUsernameOrEmail(username);
	} catch (error) {
		logger.logError(`${username} not found, please check and try again.`);
		return false;
	}
	if (!SYSTEM_ROLES.includes(role)) {
		logger.logError(`System role ${role} not found, can't grant ${role}.`);
		return false;
	}

	if (isUser) {
		logger.logInfo(`Adding ${role} to ${isUser.user}`);
		try {
			await grantAdministrativeRole(isUser.user, role);
		} catch (error) {
			logger.logError('We encountered an unexpected error.', error);
			return false;
		}
	} else {
		logger.logError(`${username} not found, can't grant ${role}.`);
		return false;
	}
	return true;
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('username',
		{
			describe: 'username to grant the system role to',
			type: 'string',
			demandOption: true,

		})
		.option('role',
			{
				describe: `Valid System Role from one of these options [${SYSTEM_ROLES}]`,
				type: 'string',
				demandOption: true,

			});
	return yargs.command(commandName,
		'Grant Administrative role to a specific user',
		argsSpec,
		(argv) => run(argv.username, argv.role));
};

module.exports = {
	run,
	genYargs,
};
