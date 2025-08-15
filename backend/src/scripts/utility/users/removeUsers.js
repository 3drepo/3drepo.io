/**
 *  Copyright (C) 2025 3D Repo Ltd
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
const { getUserByUsernameOrEmail } = require(`${v5Path}/models/users`);
const { getTeamspaceListByUser, removeTeamspaceMember } = require(`${v5Path}/processors/teamspaces`);
const { remove: deleteUser } = require(`${v5Path}/processors/users`);

const run = async (users) => {
	if (!users?.length) throw new Error('A list of users must be provided');
	const userArr = users.split(',');
	await Promise.all(userArr.map(async (user) => {
		// eslint-disable-next-line no-await-in-loop
		const userRecord = await getUserByUsernameOrEmail(user.trim()).catch(() => false);
		if (userRecord) {
			// eslint-disable-next-line no-await-in-loop
			const teamspaces = await getTeamspaceListByUser(userRecord.user);
			if (teamspaces.length) {
				await Promise.all(teamspaces.map(
					({ name: teamspace }) => removeTeamspaceMember(teamspace, userRecord.user),
				));
			}
			// eslint-disable-next-line no-await-in-loop
			await deleteUser(userRecord.user);

			return true;
		}

		logger.logInfo(`User ${user.trim()} not found, skipping...`);
		return false;
	}));
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('users', {
		describe: 'usersnames or emails to remove (comma separated)',
		type: 'string',
		demandOption: true,
	});
	return yargs.command(commandName,
		'Remove specified users from the system',
		argsSpec,
		(argv) => run(argv.users));
};

module.exports = {
	run,
	genYargs,
};
