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

const removeUserFromTeamspaces = async (user) => {
	try {
		const teamspaces = await getTeamspaceListByUser(user);
		await Promise.all(teamspaces.map(
			({ name: teamspace }) => removeTeamspaceMember(teamspace, user),
		));
	} catch (error) {
		logger.logError(`Failed to remove user ${user} from teamspaces: ${error.message}`);
	}
};

const run = async (users) => {
	if (!users?.length) throw new Error('A list of users must be provided');
	const userArr = users.split(',').flatMap((user) => {
		const userTrimmed = user.trim();
		return userTrimmed.length ? userTrimmed : [];
	});
	await Promise.all(userArr.map(async (user) => {
		try {
			const userRecord = await getUserByUsernameOrEmail(user);
			await removeUserFromTeamspaces(userRecord.user);
			await deleteUser(userRecord.user);
		} catch (error) {
			logger.logInfo(`User ${user} not found, skipping...`);
		}
	}));
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('users', {
		describe: 'usernames or emails to remove (comma separated)',
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
