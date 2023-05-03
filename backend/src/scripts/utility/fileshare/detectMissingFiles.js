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

const organiseRefsToProcess = (entries, maxParallelSizeMB, maxParallelFiles) => {
	const groups = [];

	const maxMem = maxParallelSizeMB * 1024 * 1024;

	let currentGroup = [];
	let currentGroupSize = 0;
	for (const entry of entries) {
		if ((entry.size + currentGroupSize) > maxMem || currentGroup.length >= maxParallelFiles) {
			groups.push(currentGroup);
			currentGroupSize = 0;
			currentGroup = [];
		}

		currentGroup.push(entry);
		currentGroupSize += entry.size;
	}

	if (currentGroup.length) {
		groups.push(currentGroup);
	}

	return groups;
};

const checkFilesInCol = async (database, col, maxFiles, maxParallelSizeMB) => {
	const refs = await find(database, col, { type: 'fs' }, { link: 1, size: 1 });
	logger.logDebug(`\t\t${col}`);

	const groupRefs = organiseRefsToProcess(refs, maxParallelSizeMB, maxFiles);

	for (let i = 0; i < groupRefs.length; ++i) {
		const group = groupRefs[i];
		logger.logDebug(`\t\t\t[${i}/${groupRefs.length}] Checking ${group.length} references...`);
		// eslint-disable-next-line no-await-in-loop
		await Promise.all(group.map((ref) => checkFile(database, col, ref)));
	}
};

const processTeamspace = async (database, maxSize, maxFiles) => {
	const cols = await getCollectionsEndsWith(database, '.ref');
	for (const { name } of cols) {
		if (!name.endsWith('.scene.ref')) {
		// eslint-disable-next-line no-await-in-loop
			await checkFilesInCol(database, name, maxFiles, maxSize);
		}
	}
};

const run = async (maxSize, maxFiles) => {
	logger.logInfo('Checking all FS references are pointing to a file');

	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		logger.logInfo(`\t-${ts}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts, maxSize, maxFiles);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.options('maxParallelSizeMB',
		{
			describe: 'Maximum amount of file size to process in parallel',
			type: 'number',
			default: 2048,
		}).option('maxParallelFiles',
		{
			describe: 'Maximum amount of files to process in parallel',
			type: 'number',
			default: 2000,
		});
	return yargs.command(
		commandName,
		'Identify any missing file(s) in fileshare',
		argsSpec,
		({ maxParallelSizeMB, maxParallelFiles }) => run(maxParallelSizeMB, maxParallelFiles),
	);
};

module.exports = {
	run,
	genYargs,
};
