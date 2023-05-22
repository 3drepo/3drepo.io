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

const { getTeamspaceActiveLicenses } = require(`${v5Path}/models/teamspaceSettings`);

const { aggregate, listDatabases } = require(`${v5Path}/handler/db`);

const Path = require('path');
const FS = require('fs');

const DEFAULT_OUT_FILE = 'fsReport.csv';

const determineDBList = async (toInclude, toExclude) => {
	if (toInclude?.length && toExclude?.length) {
		throw new Error('Cannot specify both databases to include and exclude.');
	}

	if (toInclude) {
		return toInclude.split(',');
	}

	const dbsToExclude = toExclude ? toExclude.split(',') : [];

	const dbList = await listDatabases();

	return dbList.flatMap(({ name }) => (dbsToExclude.includes(name) ? [] : name));
};

const run = async (includeDB, excludeDB, outFile) => {
	const dbList = await determineDBList(includeDB, excludeDB);

	logger.logInfo(`Calculate the number of files and file sizes in the db (out: ${outFile})`);

	const writeStream = FS.createWriteStream(parsePath(outFile));

	for (const dbName of dbList) {
		// eslint-disable-next-line no-await-in-loop
		const collections = await getCollectionsEndsWith(dbName, '.ref');
		let nFiles = 0;
		let size = 0;

		for (const { name: colName } of collections) {
			const pipeline = [
				{ $match: { link: { $not: /^toy/ }, type: 'fs' } },
				{ $group: { _id: null, sizeTotal: { $sum: '$size' }, filesTotal: { $count: {} } } },
			];

			// eslint-disable-next-line no-await-in-loop
			const [{ sizeTotal = 0, filesTotal = 0 } = {}] = await aggregate(dbName, colName, pipeline);
			nFiles += filesTotal;
			size += sizeTotal;
		}
		const sizeMB = size / (1024 * 1024);
		logger.logInfo(`-${dbName} ( ${nFiles} files, ${sizeMB.toFixed(2)}MiB)`);
		// eslint-disable-next-line no-await-in-loop
		const license = await getTeamspaceActiveLicenses(dbName);
		writeStream.write(`${dbName},${nFiles},${sizeMB},${license ? 'Yes' : 'No'}\n`);
	}
	writeStream.end();
};

const genYargs =/* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('includeDB', {
		describe: 'list of databases extensions to include (comma separated)',
		type: 'string',
	}).option('excludeDB', {
		describe: 'list of databases extensions to exclude (comma separated)',
		type: 'string',
	})
		.option('outFile', {
			describe: 'Name of output file',
			type: 'string',
			default: DEFAULT_OUT_FILE,
		});
	return yargs.command(
		commandName,
		'Calculate the number of files and file sizes on the fileshare',
		argsSpec,
		({ includeDB, excludeDB, outFile }) => run(
			includeDB, excludeDB, outFile),
	);
};

module.exports = {
	run,
	genYargs,
};
