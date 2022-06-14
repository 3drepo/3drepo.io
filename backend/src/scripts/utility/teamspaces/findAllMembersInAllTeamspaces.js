/**
 *  Copyright (C) 2021 3D Repo Ltd
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

/**
 * This script is used to list out every active member in all teamspaces
 */

const DayJS = require('dayjs');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../common/utils');
const FS = require('fs');
const Path = require('path');

const { find } = require(`${v5Path}/handler/db`);

const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

const findMembersInTS = async (teamspace) => {
	const results = await find('admin', 'system.users', { 'roles.db': teamspace }, { user: 1, 'customData.lastLoginAt': 1 });
	return results.map(({ user, customData: { lastLoginAt } }) => ({ user, lastLoginAt }));
};

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Teamspace,User,lastLogin\n');
	results.forEach(({ teamspace, members }) => {
		members.forEach(({ user, lastLoginAt }) => {
			writeStream.write(`${teamspace},${user},${formatDate(lastLoginAt)}\n`);
		});
	});

	writeStream.end(resolve);
});

const run = async (outFile) => {
	logger.logInfo('Finding all members from all teamspaces...');
	const teamspaces = await getTeamspaceList();
	const res = [];
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		const members = await findMembersInTS(teamspace);
		res.push({ teamspace, members });
	}
	await writeResultsToFile(res, outFile);
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('out', {
		describe: 'file path for the output CSV',
		type: 'string',
		default: './membersInTeamspaces.csv',
	});
	return yargs.command(commandName,
		'Create a CSV dump of all members from all teamspaces',
		argsSpec,
		(argv) => run(argv.out));
};

module.exports = {
	run,
	genYargs,
};
