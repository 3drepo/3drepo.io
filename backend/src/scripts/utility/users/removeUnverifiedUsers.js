/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const Path = require('path');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getUsersByQuery, removeUsers } = require(`${v5Path}/models/users`);

const run = async () => {
	const query = { 'customData.inactive': true, 'customData.emailVerifyToken.expiredAt': { $lt: new Date() } };
	const projection = { user: 1 };
	const usersToRemove = await getUsersByQuery(query, projection);
	await removeUsers(usersToRemove.map(({ user }) => user));

	logger.logInfo(`${usersToRemove.length} users removed.`);
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	return yargs.command(commandName,
		'Remove verified users with expired verification token',
		(subYargs) => subYargs,
		run);
};

module.exports = {
	run,
	genYargs,
};
