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

const removeUserFromAllTeamspaces = async (user) => {
	const teamspaces = await getTeamspaceListByUser(user);
	await Promise.all(teamspaces.map(
		({ name: teamspace }) => removeTeamspaceMember(teamspace, user),
	));
};

const removeUser = async (user) => {
	const userRecord = await getUserByUsernameOrEmail(user).catch(() => false);

	if (userRecord) {
		await removeUserFromAllTeamspaces(userRecord.user);
		await deleteUser(userRecord.user);
		return true;
	}
	return false;
};

const run = async (users) => {
	if (!users?.length) throw new Error('A list of users must be provided');
	const userArr = users.split(',');
	let removedUsers = 0;
	for (const user of userArr) {
		// eslint-disable-next-line no-await-in-loop
		const userRemoved = await removeUser(user);
		if (userRemoved) {
			removedUsers += 1;
		}
	}

	logger.logInfo(`Removed ${removedUsers}/${users.length} users successfully.`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('users', {
		describe: 'users to remove (comma separated)',
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
