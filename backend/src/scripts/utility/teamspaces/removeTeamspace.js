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

const { getTeamspaceList } = require('../../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { removeTeamspace } = require(`${v5Path}/processors/teamspaces`);

const run = async (teamspaces, removeAssociatedAccount) => {
	if (!teamspaces?.length) throw new Error('A list of teamspaces must be provided');
	const teamspaceArr = teamspaces.split(',');
	const tsList = await getTeamspaceList();
	for (const teamspace of teamspaceArr) {
		logger.logInfo(`-${teamspace}`);
		if (tsList.includes(teamspace)) {
			// eslint-disable-next-line no-await-in-loop
			await removeTeamspace(teamspace, removeAssociatedAccount);
		}
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('accounts',
		{
			describe: 'teamspaces to remove (comma separated)',
			type: 'string',
			demandOption: true,
		}).option('removeAssociatedAccount',
		{
			describe: 'also remove associated account',
			type: 'boolean',
			demandOption: false,
			default: true,
		});
	return yargs.command(commandName,
		'Remove a teamspace and the associated account',
		argsSpec,
		(argv) => run(argv.accounts, argv.removeAssociatedAccount));
};

module.exports = {
	run,
	genYargs,
};
