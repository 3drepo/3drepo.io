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
const FS = require('fs');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { calculateSpaceUsed } = require(`${v5Path}/utils/quota`);
const { getDatabaseStats } = require(`${v5Path}/handler/db`);
const { getTotalSize } = require(`${v5Path}/models/fileRefs`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../common/utils');

const toGB = (bytes) => bytes / (1024 * 1024 * 1024);
const writeResultsToFile = (res, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Teamspace,Quota Used(GiB),Actual Storage Used(GiB)\n');
	res.forEach(({ teamspace, quotaUsed, dataUsed }) => {
		writeStream.write(`${teamspace},${toGB(quotaUsed)},${toGB(dataUsed)}\n`);
	});

	writeStream.end(resolve);
});

const getFileStorageSize = async (teamspace) => {
	const refCols = await getCollectionsEndsWith(teamspace, '.ref');
	const sizePerCol = await Promise.all(refCols.map(({ name }) => getTotalSize(teamspace, name)));

	return sizePerCol.reduce((accum, val) => accum + val, 0);
};

const calculateStorageUsed = async (teamspace) => {
	const [dbStats, totalFilesSize] = await Promise.all([
		getDatabaseStats(teamspace),
		getFileStorageSize(teamspace),
	]);

	const totalDBSize = dbStats.indexFreeStorageSize
		? dbStats.totalSize - (dbStats.indexFreeStorageSize + dbStats.freeStorageSize)
		: dbStats.storageSize; // pre-v5 compatibility
	return totalDBSize + totalFilesSize;
};

const calculateUsage = async (teamspace) => ({
	teamspace,
	quotaUsed: await calculateSpaceUsed(teamspace),
	dataUsed: await calculateStorageUsed(teamspace),
});

const run = async (output) => {
	const teamspaces = await getTeamspaceList();
	const res = [];
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		res.push(await calculateUsage(teamspace));
	}
	await writeResultsToFile(res, output);
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('out', {
		describe: 'file path to dump the csv report',
		type: 'string',
		default: 'teamspacesDataUsage.csv',
	});
	return yargs.command(commandName,
		'Print a report of quota/full data usage by all teamspaces',
		argsSpec,
		(argv) => run(argv.out));
};

module.exports = {
	run,
	genYargs,
};
