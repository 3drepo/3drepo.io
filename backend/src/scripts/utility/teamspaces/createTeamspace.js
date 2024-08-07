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

const { initTeamspace } = require(`${v5Path}/processors/teamspaces/teamspaces`);
const { isAccountActive } = require(`${v5Path}/models/users`);
const { getTeamspaceSetting } = require(`${v5Path}/models/teamspaceSettings`);

const run = async (teamspace) => {
	logger.logInfo(`Checking ${teamspace} is an active user...`);
	if (!(await isAccountActive(teamspace))) {
		throw new Error('There is no matching user account or the user is not verified');
	}

	logger.logInfo(`Checking if teamspace ${teamspace} already exists...`);
	const teamspaceExists = await getTeamspaceSetting(teamspace, { _id: 1 }).catch(() => false);

	if (teamspaceExists) {
		throw new Error('Teamspace already exists');
	}

	await initTeamspace(teamspace);
	logger.logInfo(`Teamspace ${teamspace} created.`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace',
		{
			describe: 'name of the teamspace',
			type: 'string',
			demandOption: true,
		});
	return yargs.command(commandName,
		'Create a teamspace of the name provided and gives the user of the same name admin privileges',
		argsSpec,
		(argv) => run(argv.teamspace));
};

module.exports = {
	run,
	genYargs,
};
