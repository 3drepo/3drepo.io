/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { getTeamspaceListByUser, removeTeamspaceMember, removeTeamspace } = require(`${v5Path}/processors/teamspaces/teamspaces`);
const { remove: deleteUser } = require(`${v5Path}/processors/users`);

const removeUserFromAllTeamspaces = async (user) => {
	const teamspaces = await getTeamspaceListByUser(user);
	await Promise.all(teamspaces.map(
		({ name: teamspace }) => (teamspace === user ? Promise.resolve() : removeTeamspaceMember(teamspace, user)),
	));
};

const removeUser = async (user) => {
	await removeUserFromAllTeamspaces(user);
	await deleteUser(user);
};

const run = async (teamspaces, removeOwners) => {
	const teamspaceArr = teamspaces.split(',');
	for (const teamspace of teamspaceArr) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await removeTeamspace(teamspace);
		if (removeOwners) {
			// eslint-disable-next-line no-await-in-loop
			await removeUser(teamspace);
		}
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('accounts',
		{
			describe: 'teamspaces to remove (comma separated)',
			type: 'string',
			demandOption: true,
		}).option('removeOwners',
		{
			describe: 'also remove user account',
			type: 'boolean',
			default: false,
		});
	return yargs.command(commandName,
		'Remove a teamspace and the owner\'s account',
		argsSpec,
		(argv) => run(argv.accounts, argv.removeOwners));
};

module.exports = {
	run,
	genYargs,
};
