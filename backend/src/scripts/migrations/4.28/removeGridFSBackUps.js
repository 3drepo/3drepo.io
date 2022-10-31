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

const { access } = require('fs/promises');
const { constants } = require('fs');
const Path = require('path');

const { v5Path } = require('../../../interop');
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { count, dropCollection, find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { fs } = require(`${v5Path}/utils/config`);
const GridFS = require(`${v5Path}/handler/gridfs`);

const refExt = '.ref';

const removeGridFSBackup = async (teamspace, col, filename, link) => {
	const filesCol = `${col}.files`;
	const legacyFileName = { $regex: `^/\\w+/\\w+.*/${filename}$` };
	const rec = await find(teamspace, filesCol,
		{ $or: [{ filename }, { filename: legacyFileName }] }, { filename: 1 });
	if (rec.length) {
		// ensure the file exists in fileshare
		await access(Path.join(fs.path, link), constants.R_OK);
		await GridFS.removeFiles(teamspace, col, rec.map(({ filename: file }) => file));
	}
};

const filesInGridFS = (teamspace, collection) => count(teamspace, `${collection}.files`, { filename: { $not: { $regex: '.*unityAssets.json$' } } });

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

const processCollection = async (teamspace, collection, maxParallelSizeMB, maxParallelFiles) => {
	const ownerCol = collection.slice(0, -(refExt.length));
	const gridfsCount = await filesInGridFS(teamspace, ownerCol);
	if (gridfsCount) {
		const refEntries = await find(teamspace, collection, { type: 'fs' }, { link: 1, size: 1 });
		const groups = organiseRefsToProcess(refEntries, maxParallelSizeMB, maxParallelFiles);
		for (let i = 0; i < groups.length; ++i) {
			const group = groups[i];
			const totalSize = group.reduce((partialSum, { size }) => partialSum + size, 0) / (1024 * 1024);
			logger.logInfo(`\t\t\t\t[${i}/${groups.length}] Checking ${group.length} references (${parseFloat(totalSize).toFixed(2)}MiB)...`);
			const proms = group.map(async ({ _id, link }) => {
				try {
					await removeGridFSBackup(teamspace, ownerCol, _id, link);
				} catch (err) {
					logger.logError(`Failed to process file ${_id}: ${err.message}`);
				}
			});
			// eslint-disable-next-line no-await-in-loop
			await Promise.all(proms);
		}
	} else {
		logger.logInfo('\t\t\t\tNo gridfs reference. Skipping...');
	}

	const filesCol = `${ownerCol}.files`;
	const chunksCol = `${ownerCol}.chunks`;
	const fileCount = await filesInGridFS(teamspace, ownerCol);
	if (!fileCount) {
		await Promise.all([
			dropCollection(teamspace, filesCol),
			dropCollection(teamspace, chunksCol),
		]).catch(() => {
			// Don't actually care if this errored - not a big issue.
		});
	}
};

const processTeamspace = async (teamspace, maxParallelSizeMB, maxParallelFiles) => {
	const refCols = await getCollectionsEndsWith(teamspace, refExt);
	for (let i = 0; i < refCols.length; ++i) {
		const collection = refCols[i].name;
		logger.logInfo(`\t\t\t${collection}`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, collection, maxParallelSizeMB, maxParallelFiles);
	}
};

const run = async ({ maxParallelSizeMB, maxParallelFiles }) => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i], maxParallelSizeMB, maxParallelFiles);
	}
};

module.exports = run;
