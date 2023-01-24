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

const { getSubscriptions } = require(`${v5Path}/models/teamspaceSettings`);

const run = async (teamspace) => {
	const subs = await getSubscriptions(teamspace);
	logger.logInfo(`${teamspace} currently has the following subscription(s): ${JSON.stringify(subs)}`);
	return subs;
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace',
		{
			describe: 'teamspace to view',
			type: 'string',
			demandOption: true,
		});
	return yargs.command(commandName,
		'View the license on a teamspace',
		argsSpec,
		(argv) => run(argv.teamspace));
};

module.exports = {
	run,
	genYargs,
};
