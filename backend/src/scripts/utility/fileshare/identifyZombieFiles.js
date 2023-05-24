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
 * This script identifies zombie files and removes them if instructed
 */
const { v5Path } = require('../../../interop');

const { getCollectionsEndsWith } = require('../../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { fs: fsConfig } = require(`${v5Path}/utils/config`);
const { path: fsPath } = fsConfig;
const { find, listDatabases } = require(`${v5Path}/handler/db`);
const { unlink, utimes, stat } = require('fs/promises');
const { readdirSync, writeFileSync } = require('fs');
const Path = require('path');

const joinPath = (a, b) => (a && b ? Path.posix.join(a, b) : a || b);
const failedToCheck = {};

const PARALLEL_BATCHES = 10000;

const updateLastModified = async (link) => {
	try {
		const date = new Date();
		await utimes(joinPath(fsPath, link), date, date);
	} catch (err) {
		logger.logError(`Failed to update file: ${err.message}`);
		failedToCheck[link] = 1;
	}
};

const processDatabase = async (database, fn, nParallel) => {
	const cols = await getCollectionsEndsWith(database, '.ref');

	for (const { name } of cols) {
		let lastId;
		logger.logInfo(`\t\t${name}`);
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const baseQuery = { type: 'fs', link: { $not: /^toy/ } };
			const query = lastId ? { ...baseQuery, _id: { $gt: lastId } } : baseQuery;
			// eslint-disable-next-line no-await-in-loop
			const refs = await find(database, name, query, { link: 1 }, { _id: 1 }, nParallel);

			if (!refs.length) break;
			// eslint-disable-next-line no-await-in-loop
			await fn(refs);
			lastId = refs[refs.length - 1]._id;
		}
	}
};

const checkRefs = async (fn, nParallel) => {
	const databases = await listDatabases();
	for (const { name: db } of databases) {
		logger.logInfo(`\t${db}`);
		// eslint-disable-next-line no-await-in-loop
		await processDatabase(db, fn, nParallel);
	}
};

const isUpdatedLater = async (path, time) => {
	// A file that we couldn't update, so leave it alone.
	if (failedToCheck[path]) return true;
	const fullPath = joinPath(fsPath, path);
	try {
		const { mtime } = await stat(fullPath);
		return new Date(mtime) > time;
	} catch (err) {
		logger.logError(`Failed to get modified time for ${path}: ${err.message}`);
		return true;
	}
};

const splitArrayIntoChunks = (array, maxLength) => {
	const res = [];
	for (let i = 0; i < array.length; i += maxLength) {
		res.push(array.slice(i, i + maxLength));
	}
	return res;
};

const findFilesOlderThanTime = async (currTime, parallelFiles) => {
	const list = [undefined];
	const res = [];

	while (list.length) {
		const subDir = list.pop();
		logger.logInfo(`\tChecking ${subDir}`);
		const dir = joinPath(fsPath, subDir);
		const data = readdirSync(dir, { withFileTypes: true });
		const chunks = splitArrayIntoChunks(data, parallelFiles);

		for (const group of chunks) {
			// eslint-disable-next-line no-await-in-loop
			await Promise.all(group.map(async (entry) => {
				const link = joinPath(subDir, entry.name);
				if (entry.isDirectory()) {
					if (!entry.name.startsWith('toy_')) {
						list.push(link);
					}
				} else if (!(await isUpdatedLater(link, currTime))) {
					res.push(link);
				}
			}));
		}
	}

	return res;
};

const verifyZombies = async (filesToCheck, nParallel) => {
	const lookUp = {};

	filesToCheck.forEach((file) => { lookUp[file] = 1; });

	await checkRefs((refs) => {
		refs.forEach(({ link }) => {
			if (lookUp[link]) {
				delete lookUp[link];
			}
		});

		return Promise.resolve();
	}, nParallel);

	return Object.keys(lookUp);
};

const run = async (outFile, removeFiles = false, maxParallelRefs = PARALLEL_BATCHES) => {
	const currTime = new Date();
	logger.logInfo(`Identify all files that have a reference in the fileshare... [RemoveFiles: ${removeFiles}, Parallel Refs: ${maxParallelRefs}, outFile: ${outFile}]`);
	await checkRefs(async (refs) => {
		logger.logInfo(`\t\t\tupdating ${refs.length} files...`);
		await Promise.all(refs.map(({ link }) => updateLastModified(link)));
	}, maxParallelRefs);

	logger.logInfo('Identify all files that have not been referenced in the fileshare');
	// Any files that had a reference would've been touched(i.e. updated last modified time) during checkRefs()
	const zombies = await findFilesOlderThanTime(currTime, maxParallelRefs);

	logger.logInfo(`${zombies.length} zombies found`);

	if (zombies.length) {
		logger.logInfo(`Writing all links to ${outFile}...`);
		writeFileSync(outFile, zombies.join('\n'));
		if (removeFiles) {
			logger.logInfo('Running verification to ensure the files found are indeed unreferenced...');
			const finalList = await verifyZombies(zombies, maxParallelRefs);
			logger.logInfo(`Verification complete, ${finalList.length} files are confirmed zombies. Deleting...`);
			await Promise.all(Array.from(finalList).map((name) => unlink(joinPath(fsPath, name))));
		}
	}

	logger.logInfo('done');
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('removeFiles', {
		type: 'boolean',
		default: false,
		description: 'If this is set, it will remove the files instead of outputing the list of links',
	}).option('outFile', {
		type: 'string',
		default: './zombies.csv',
		description: 'path to write the list of zombie files to',
	}).option('maxParallelRefs', {
		type: 'number',
		default: PARALLEL_BATCHES,
		description: 'maximum number of files to process simulataenously',
	});
	return yargs.command(
		commandName,
		'Identify unreferenced files within the fileshare and outputs the list of links to a CSV',
		argsSpec,
		(argv) => run(argv.outFile, argv.removeFiles, argv.maxParallelRefs),
	);
};

module.exports = {
	run,
	genYargs,
};
