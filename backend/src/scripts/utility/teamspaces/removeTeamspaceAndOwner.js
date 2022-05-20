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
const { getMembersInfo } = require(`${v5Path}/models/teamspaces`);
const { revokeTeamspaceRoleFromUser } = require(`${v5Path}/models/roles`);
const { getTeamspaceListByUser, removeTeamspaceMember } = require(`${v5Path}/processors/teamspaces/teamspaces`);
const { dropDatabase, dropCollection, dropUser } = require(`${v5Path}/handler/db`);

const removeAllUsersFromTS = async (teamspace) => {
	const members = await getMembersInfo(teamspace);
	return Promise.all(
		members.map(({ user }) => ((user !== teamspace)
			? revokeTeamspaceRoleFromUser(teamspace, user) : Promise.resolve())),
	);
};

const removeTeamspace = async (teamspace) => {
	await removeAllUsersFromTS(teamspace);
	await dropDatabase(teamspace);
};

const removeUserFromAllTeamspaces = async (user) => {
	const teamspaces = await getTeamspaceListByUser(user);
	await Promise.all(teamspaces.map(
		({ name: teamspace }) => (teamspace === user ? Promise.resolve() : removeTeamspaceMember(teamspace, user)),
	));
};

const removeUser = async (user) => {
	await removeUserFromAllTeamspaces(user);
	await Promise.all([
		dropCollection('loginRecords', user),
		dropCollection('notifications', user),
		dropUser(user),
	]);
};

const run = async (users) => {
	const userArr = users.split(',');
	for (const user of userArr) {
		logger.logInfo(`-${user}`);
		// eslint-disable-next-line no-await-in-loop
		await Promise.all([
			removeUser(user),
			removeTeamspace(user),
		]);
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('accounts',
		{
			describe: 'accounts to remove (comma separated)',
			type: 'string',
			demandOption: true,
		});
	return yargs.command(commandName,
		'Remove a user account and its teamspace from the database',
		argsSpec,
		(argv) => run(argv.accounts));
};

module.exports = {
	run,
	genYargs,
};
