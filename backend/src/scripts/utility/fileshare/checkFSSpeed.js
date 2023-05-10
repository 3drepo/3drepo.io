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

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { times } = require('lodash');

const { fs: fsConfig } = require(`${v5Path}/utils/config`);
const { path: fsPath } = fsConfig;
const { writeFileSync, readFileSync, rmSync } = require('fs');
const { randomBytes } = require('crypto');
const Path = require('path');

const N_FILES = 1000;

const run = (dir, nFiles, fileSizeMB) => {
	logger.logInfo('Generating test data...');

	const data = times(10, () => randomBytes(fileSizeMB * 1024 * 1024));
	const timers = { write: {}, read: {}, delete: {} };
	const files = times(nFiles, (i) => ({ name: Path.join(dir, `${i}.tmp`), buffer: data[i % 10] }));

	logger.logInfo(`Writing ${nFiles} files with ${fileSizeMB}MB each (dir: ${dir})...`);
	timers.write.start = Date.now();
	files.forEach(({ name, buffer }) => {
		writeFileSync(name, buffer);
	});
	timers.write.end = Date.now();

	logger.logInfo('Reading files...');
	timers.read.start = Date.now();
	files.forEach(({ name }) => {
		readFileSync(name);
	});
	timers.read.end = Date.now();

	logger.logInfo('Deleting files...');
	timers.delete.start = Date.now();
	files.forEach(({ name }) => {
		rmSync(name);
	});
	timers.delete.end = Date.now();

	const calculateTimerStr = ({ start, end }) => ((end - start) / 1000).toFixed(2);

	logger.logInfo(`Writes: ${calculateTimerStr(timers.write)}s, Reads: ${calculateTimerStr(timers.read)}s, Deletes: ${calculateTimerStr(timers.delete)}s`);

	logger.logInfo('done');
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.options('dir',
		{
			describe: 'Specify the location of the fs',
			type: 'string',
			default: fsPath,
		}).options('nFiles',
		{
			describe: 'Number of files to use to perform this test',
			type: 'number',
			default: N_FILES,
		}).options('fileSizeMB',
		{
			describe: 'Size of files to fabricate for the test in MB',
			type: 'number',
			default: 10,
		});
	return yargs.command(
		commandName,
		'Generate a timing report on fileshare\'s i/o speed ',
		argsSpec,
		({ dir, nFiles, fileSizeMB }) => run(dir, nFiles, fileSizeMB),
	);
};

module.exports = {
	run,
	genYargs,
};
