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

const { find } = require(`${v5Path}/handler/db`);

const { some } = require('lodash');

const Path = require('path');
const FS = require('fs');

const DEFAULT_OUT_FILE = 'links.csv';

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	results.forEach((record) => {
		writeStream.write(`${record}\n`);
	});

	writeStream.end(resolve);
});

const run = async (dbNames, outFile = DEFAULT_OUT_FILE) => {
	if (!dbNames?.length) {
		throw new Error('Database name must be provided to execute this script');
	}

	const results = [];
	const dbList = dbNames.split(',');

	const excludeCols = ['.stash.json_mpc.ref', '.stash.unity3d.ref'];

	for (const dbName of dbList) {
		// eslint-disable-next-line no-await-in-loop
		const collections = await getCollectionsEndsWith(dbName, '.ref');

		for (let i = 0; i < collections.length; ++i) {
			if (!some(excludeCols, (colExt) => collections[i].name.endsWith(colExt))) {
				// eslint-disable-next-line no-await-in-loop
				const coll = await find(dbName, collections[i].name, { type: 'fs' }, { link: 1, size: 1 });
				for (let j = 0; j < coll.length; ++j) {
					results.push(`${coll[j].link},${coll[j].size}`);
				}
			}
		}
	}

	await writeResultsToFile(results, parsePath(outFile));
};

const genYargs =/* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('database', {
		describe: 'Database name (comma separated)',
		type: 'string',
		demandOption: true,
	}).option('outFile', {
		describe: 'Name of output file',
		type: 'string',
		default: DEFAULT_OUT_FILE,
	});
	return yargs.command(
		commandName,
		'Get all ref links from database and output to console',
		argsSpec,
		(argv) => run(argv.database, argv.outFile),
	);
};

module.exports = {
	run,
	genYargs,
};
