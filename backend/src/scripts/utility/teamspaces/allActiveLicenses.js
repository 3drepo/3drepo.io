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

const DayJS = require('dayjs');
const Path = require('path');
const FS = require('fs');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { getAllTeamspacesWithActiveLicenses } = require(`${v5Path}/utils/quota`);

const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Teamspace,Type, Data(MB),Seats,ExpiryDate\n');
	results.forEach(({ _id, subscriptions }) => {
		Object.keys(subscriptions).forEach((subType) => {
			const { collaborators, expiryDate, data } = subscriptions[subType];
			writeStream.write(`${_id},${subType},${data},${collaborators},${formatDate(expiryDate)}\n`);
		});
	});

	writeStream.end(resolve);
});

const run = async (outFile) => {
	const teamspaces = await getAllTeamspacesWithActiveLicenses({ _id: 1, subscriptions: 1 });
	await writeResultsToFile(teamspaces, outFile);
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('outFile',
		{
			describe: 'name of output CSV',
			type: 'string',
			default: 'licensedTeamspaces.csv',
		});
	return yargs.command(commandName,
		'Get a list of all teamspaces with active license',
		argsSpec,
		(argv) => run(argv.outFile));
};

module.exports = {
	run,
	genYargs,
};
