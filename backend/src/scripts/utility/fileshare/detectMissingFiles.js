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
 * This script identifies all references within the database and checks they have an associated file
 * in the fs
 */
const { v5Path } = require('../../../interop');

const { getCollectionsEndsWith } = require('../../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../utils');

const { fs: fsConfig } = require(`${v5Path}/utils/config`);
const { path: fsPath } = fsConfig;
const { find } = require(`${v5Path}/handler/db`);
const { statSync } = require('fs');
const Path = require('path');

const joinPath = (a, b) => (a && b ? Path.posix.join(a, b) : a || b);

const getFileSize = (link) => {
	const filePath = joinPath(fsPath, link);
	const { size } = statSync(filePath);
	return size;
};

const checkFile = (db, col, { _id, link, size }) => {
	try {
		const fileSize = getFileSize(link);
		if (fileSize !== size) {
			logger.logError(`[${db}.${col}][${_id}][${link}] File size mismatched (expected ${size}, got ${fileSize})`);
		}
	} catch (err) {
		logger.logError(`[${db}.${col}[${_id}][${link}] Failed to verify file: ${err.message ?? err}`);
	}
};

const checkFilesInCol = async (database, col) => {
	const refs = await find(database, col, { type: 'fs' }, { link: 1, size: 1 });
	const maxSize = 20000;
	logger.logDebug(`\t\t${col}`);

	for (let i = 0; i < refs.length; i += maxSize) {
		logger.logDebug(`\t\t\t[${i}/${refs.length}]`);
		const endIndx = i + maxSize > refs.length ? refs.length : i + maxSize;
		const refsToProcess = refs.slice(i, i + endIndx);
		// eslint-disable-next-line no-await-in-loop
		await Promise.all(refsToProcess.map((ref) => checkFile(database, col, ref)));
	}
};

const processTeamspace = async (database) => {
	const cols = await getCollectionsEndsWith(database, '.ref');
	for (const { name } of cols) {
		// eslint-disable-next-line no-await-in-loop
		await checkFilesInCol(database, name);
	}
};

const run = async () => {
	logger.logInfo('Checking all FS references are pointing to a file');

	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		logger.logInfo(`\t-${ts}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs;
	return yargs.command(
		commandName,
		'Identify any missing file(s) in fileshare',
		argsSpec,
		run,
	);
};

module.exports = {
	run,
	genYargs,
};
