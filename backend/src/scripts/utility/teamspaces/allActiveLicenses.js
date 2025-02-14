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

const { extractTeamspaceActiveLicenses } = require(`${v5Path}/models/teamspaceSettings`);
const { getTeamspaceList, parsePath, writeLicensesToFile } = require('../../utils');

const { getTeamspaceAggregatesAndLicenses } = require(`${v5Path}/processors/teamspaces/teamspaces`);

const run = async (outFile) => {
	const teamspaceNames = await getTeamspaceList();
	const results = await getTeamspaceAggregatesAndLicenses(teamspaceNames, extractTeamspaceActiveLicenses);
	await writeLicensesToFile(results, parsePath(outFile));
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('outFile',
		{
			describe: 'name of output CSV',
			type: 'string',
			default: 'activeLicenses.csv',
		});
	return yargs.command(commandName,
		'Get a list of all active licenses',
		argsSpec,
		(argv) => run(argv.outFile));
};

module.exports = {
	run,
	genYargs,
};
