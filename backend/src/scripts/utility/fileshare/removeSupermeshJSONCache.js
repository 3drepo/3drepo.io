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

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getCollectionsEndsWith, parsePath } = require('../../utils');

const { removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);

const Path = require('path');
const FS = require('fs');

const run = async (teamspaces) => {
	logger.logInfo(`Removing supermesh caches from ${teamspaces.split(',').length} teamspaces`);
	if (!teamspaces?.length) {
		throw new Error('A list of teamspaces must be provided to execute this script');
	}
	for (const teamspace of teamspaces.split(',')) {
		// eslint-disable-next-line no-await-in-loop
		const collections = await getCollectionsEndsWith(teamspace, '.stash.json_mpc.ref');

		// eslint-disable-next-line no-await-in-loop
		await Promise.all(
			collections.map(({ name }) => removeFilesWithMeta(teamspace, name, { _id: /supermeshes\.json$/ })),
		);
	}

	logger.logInfo('done.');
};

const genYargs =/* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspaces', {
		describe: 'Teamspace name (comma separated)',
		type: 'string',
		demandOption: true,
	});
	return yargs.command(
		commandName,
		'Remove supermesh cache files from specified teamspaces',
		argsSpec,
		(argv) => run(argv.teamspaces),
	);
};

module.exports = {
	run,
	genYargs,
};
