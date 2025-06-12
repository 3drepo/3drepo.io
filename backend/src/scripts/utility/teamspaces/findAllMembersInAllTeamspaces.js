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
const { getLastLoginDate } = require(`${v5Path}/models/loginRecords`);
const { getTeamspaceMembersInfo } = require(`${v5Path}/processors/teamspaces`);
const { getTeamspaceList, parsePath } = require('../../utils');
const FS = require('fs');
const Path = require('path');

const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Teamspace,User,lastLogin\n');
	results.forEach(({ teamspace, members }) => {
		members.forEach(({ user, lastLogin }) => {
			writeStream.write(`${teamspace},${user},${formatDate(lastLogin)}\n`);
		});
	});

	writeStream.end(resolve);
});

const findMembersLastLogin = async (members) => {
	await Promise.all(members.map(async (user) => {
		const date = await getLastLoginDate(user.user);
		// eslint-disable-next-line no-param-reassign
		user.lastLogin = date;
	}));
};

const run = async (outFile) => {
	logger.logInfo('Finding all members from all teamspaces...');
	const teamspaces = await getTeamspaceList();
	const res = [];
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		const membersList = await getTeamspaceMembersInfo(teamspace);
		const members = membersList.map((member) => ({ user: member.user }));
		// eslint-disable-next-line no-await-in-loop
		await findMembersLastLogin(members);
		res.push({ teamspace, members });
	}
	await writeResultsToFile(res, parsePath(outFile));
};

const genYargs = /* istanbul ignore next */(yargs) => {
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
