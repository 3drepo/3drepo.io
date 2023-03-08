/**
 *  Copyright (C) 2023 3D Repo Ltd
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
 * This script is used to remove any model data lying around in the shared directory
 * for longer than the threshold number of days. Data from models requests that have been processed,
 * whether it was processed successfully or not, will be removed.
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { cn_queue: { shared_storage: sharedDir } } = require(`${v5Path}/utils/config`);
const Path = require('path');
const { readdir, stat, rm } = require('fs/promises');

const DEFAULT_THRESHOLD = 14;

const run = async (threshold = DEFAULT_THRESHOLD) => {
	if (threshold <= 0 || Number.isNaN(Number(threshold))) {
		throw new Error('Threshold must be at least 1');
	}

	logger.logInfo(`Removing files/directories in shared directory that are older than ${threshold} days`);

	const files = await readdir(sharedDir, { withFileTypes: true });

	logger.logInfo(`${files.length} files/directories found.`);
	const currTime = new Date();
	const filesToRemove = (await Promise.all(files.map(async (fileObj) => {
		try {
			const fullPath = Path.join(sharedDir, fileObj.name);
			const { mtime } = await stat(fullPath);
			const lastMod = new Date(mtime);
			const diffInDays = (currTime - lastMod) / (1000 * 60 * 60 * 24);

			const shouldDelete = (diffInDays >= threshold);

			if (shouldDelete) {
				await rm(fullPath, { recursive: true });
				return fullPath;
			}
			return [];
		} catch (err) {
			// if we failed to read the stats of the file, just skip it
			return [];
		}
	}))).flat();

	logger.logInfo(`${filesToRemove.length} files/directories deleted.`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('threshold', {
		describe: 'Files that were created before the threshold (in days) will be removed',
		type: 'number',
		default: DEFAULT_THRESHOLD,
	});
	return yargs.command(commandName,
		'Remove any file processing data from file share that are x days old',
		argsSpec,
		(argv) => run(argv.threshold));
};

module.exports = {
	run,
	genYargs,
};
