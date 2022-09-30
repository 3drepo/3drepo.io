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
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find, findOne, updateOne, getFileFromGridFS } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const FsService = require(`${v5Path}/handler/fs`);
const GridFS = require(`${v5Path}/handler/gridfs`);

const filesExt = '.files';

const convertLegacyFileName = (filename) => {
	const res = filename.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^/]*$/g);
	if (res?.length) {
		const match = res[0];
		const superMeshRegex = match.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[^/]*$/g);
		return superMeshRegex?.length ? superMeshRegex[0] : match;
	}
	return filename;
};

const moveFile = async (teamspace, collection, filename, timers) => {
	const legacyFileName = convertLegacyFileName(filename);
	const query = legacyFileName === filename ? { link: filename }
		: { link: { $in: [filename, legacyFileName] } };
	const existingRef = await findOne(teamspace, `${collection}.ref`, query, { type: 1 });

	if (existingRef && existingRef.type !== 'gridfs') {
		// Already have an entry for this file, just update the name in gridfs so it will get removed
	} else {
		const startTimer = Date.now();
		const file = await getFileFromGridFS(teamspace, collection, filename).catch((err) => { throw new Error(`Failed to fetch file from gridfs (${teamspace}.${collection}): ${filename}: ${err?.message ?? err}`); });
		const getFileFromGridFSTimer = Date.now();
		const newRef = await FsService.storeFile(file);
		const copiedTimer = Date.now();
		newRef._id = existingRef?._id || convertLegacyFileName(filename);
		await updateOne(teamspace, `${collection}.ref`, { _id: newRef._id }, { $set: newRef }, true);
		const dbUpdateTimer = Date.now();
		timers.copy.push(copiedTimer - startTimer);
		timers.copyDetails.gridfs.push(getFileFromGridFSTimer - startTimer);
		timers.copyDetails.fs.push(copiedTimer - getFileFromGridFSTimer);
		timers.update.push(dbUpdateTimer - copiedTimer);
	}

	return filename;
};

const organiseFilesToProcess = (entries, maxParallelSizeMB, maxParallelFiles) => {
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

const sumArray = (arr) => arr.reduce((partialSum, value) => partialSum + value, 0);
const formatNumber = (n) => parseFloat(n).toFixed(2);

const processCollection = async (teamspace, collection, maxParallelSizeMB, maxParallelFiles) => {
	const ownerCol = collection.slice(0, -(filesExt.length));
	const gridFSEntries = await find(teamspace, collection, { }, { filename: 1, length: 1 });
	const fileGroups = organiseFilesToProcess(gridFSEntries, maxParallelSizeMB, maxParallelFiles);

	for (let i = 0; i < fileGroups.length; ++i) {
		const group = fileGroups[i];
		const totalSize = group.reduce((partialSum, { length }) => partialSum + length, 0) / (1024 * 1024);
		logger.logInfo(`\t\t\t\t[${i}/${fileGroups.length}] Copying ${group.length} file(s) (${formatNumber(totalSize)}MiB)`);
		const processFilesStart = Date.now();
		const stats = { copy: [], update: [], copyDetails: { gridfs: [], fs: [] } };
		// eslint-disable-next-line no-await-in-loop
		const filesToRemove = await Promise.all(
			group.map(({ filename }) => moveFile(teamspace, ownerCol, filename, stats)),
		);
		const processFilesEnd = Date.now();
		// eslint-disable-next-line no-await-in-loop
		await GridFS.removeFiles(teamspace, ownerCol, filesToRemove);
		const removeFilesEnd = Date.now();
		const processFilesTime = processFilesEnd - processFilesStart;
		const removeFilesTime = removeFilesEnd - processFilesEnd;
		logger.logInfo(`\t\t\t\t\tTime taken to: copy files[${formatNumber(processFilesTime / 1000)}s] remove GridFS[${formatNumber(removeFilesTime / 1000)}s]`);
		const fileIOTime = sumArray(stats.copy);
		const dbOpTime = sumArray(stats.update);
		const totalTime = fileIOTime + dbOpTime;
		const gridfsIOTime = sumArray(stats.copyDetails.gridfs);
		const fsIOTime = sumArray(stats.copyDetails.fs);
		logger.logInfo(`\t\t\t\t\t\tCopy Files breakdown: file IO [${formatNumber((fileIOTime / totalTime) * 100)}%], db Ops [${formatNumber((dbOpTime / totalTime) * 100)}%]`);
		logger.logInfo(`\t\t\t\t\t\tFile IO breakdown: gridfs read [${formatNumber((gridfsIOTime / fileIOTime) * 100)}%], fs write [${formatNumber((fsIOTime / fileIOTime) * 100)}%]`);
	}
};

const processTeamspace = async (teamspace, maxParallelSizeMB, maxParallelFiles) => {
	const filesCols = await getCollectionsEndsWith(teamspace, filesExt);
	for (let i = 0; i < filesCols.length; ++i) {
		const collection = filesCols[i].name;
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
