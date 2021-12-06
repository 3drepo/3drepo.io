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
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../common/utils');
const FS = require('fs');

const { find } = require(`${v5Path}/handler/db`);

const findMembersInTS = async (teamspace) => {
	const results = await find('admin', 'system.users', { 'roles.db': teamspace }, { user: 1 });
	return results.map(({ user }) => user);
};

const writeResultsToFile = (results) => new Promise((resolve) => {
	const outFile = 'membersInTeamspaces.csv';
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Teamspace,User\n');
	results.forEach(({ teamspace, members }) => {
		members.forEach((member) => {
			writeStream.write(`${teamspace},${member}\n`);
		});
	});

	writeStream.end(resolve);
});

const run = async () => {
	logger.logInfo('Finding all members from all teamspaces...');
	const teamspaces = await getTeamspaceList();
	const res = [];
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		const members = await findMembersInTS(teamspace);
		res.push({ teamspace, members });
	}
	await writeResultsToFile(res);
};

// eslint-disable-next-line no-console
run().catch(console.log).finally(process.exit);
