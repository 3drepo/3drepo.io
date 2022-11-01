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

const { createIndex, count, find, findOne, bulkWrite, getFileStreamFromGridFS } = require(`${v5Path}/handler/db`);
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

const copyFromGridFSToFs = async (teamspace, collection, filename, fileSize) => {
	const { stream: gridfsStream } = await getFileStreamFromGridFS(teamspace, collection, filename);
	try {
		return FsService.storeFileStream(gridfsStream, fileSize);
	} catch (err) {
		throw new Error(`Failed to move file ${teamspace}.${collection}.${filename} to FS: ${err?.message}`);
	}
};

const copyFile = async (teamspace, collection, filename, fileSize) => {
	const legacyFileName = convertLegacyFileName(filename);
	const query = legacyFileName === filename ? { link: filename }
		: { link: { $in: [filename, legacyFileName] } };
	const existingRef = await findOne(teamspace, `${collection}.ref`, query, { type: 1 });

	if (existingRef && existingRef.type !== 'gridfs') {
		// Already have an entry for this file, just update the name in gridfs so it will get removed
		return [];
	}
	const newRef = await copyFromGridFSToFs(teamspace, collection, filename, fileSize);
	newRef._id = existingRef?._id || convertLegacyFileName(filename);
	return {
		updateOne: {
			filter: { _id: newRef._id },
			update: { $set: newRef },
			upsert: true,
		},
	};
};

const organiseFilesToProcess = (entries, maxParallelSizeMB, maxParallelFiles) => {
	const groups = [];

	const maxMem = maxParallelSizeMB * 1024 * 1024;

	let currentGroup = [];
	let currentGroupSize = 0;
	for (const entry of entries) {
		if ((entry.length + currentGroupSize) > maxMem || currentGroup.length >= maxParallelFiles) {
			groups.push(currentGroup);
			currentGroupSize = 0;
			currentGroup = [];
		}

		currentGroup.push(entry);
		currentGroupSize += entry.length;
	}

	if (currentGroup.length) {
		groups.push(currentGroup);
	}

	return groups;
};

const processFileGroup = async (teamspace, collection, group) => {
	const filesToRemove = [];
	const refUpdates = await Promise.all(
		group.flatMap(({ filename, length }) => {
			filesToRemove.push(filename);
			return copyFile(teamspace, collection, filename, length);
		}),
	);
	await bulkWrite(teamspace, `${collection}.ref`, refUpdates);
	try {
		await GridFS.removeFiles(teamspace, collection, filesToRemove);
	} catch (err) {
		throw new Error(`Failed to remove ${filesToRemove.length} files from ${teamspace}.${collection}: ${err?.message}`);
	}
};

const formatNumber = (n) => parseFloat(n).toFixed(2);

const processBatch = async (teamspace, collection, entries, maxParallelSizeMB, maxParallelFiles) => {
	const fileGroups = organiseFilesToProcess(entries, maxParallelSizeMB, maxParallelFiles);

	for (let i = 0; i < fileGroups.length; ++i) {
		const group = fileGroups[i];
		const totalSize = group.reduce((partialSum, { length }) => partialSum + length, 0) / (1024 * 1024);
		logger.logInfo(`\t\t\t\t\t[${i}/${fileGroups.length}] Copying ${group.length} file(s) (${formatNumber(totalSize)}MiB)`);
		// eslint-disable-next-line no-await-in-loop
		await processFileGroup(teamspace, collection, group);
	}
};

const processCollection = async (teamspace, collection, maxParallelSizeMB, maxParallelFiles) => {
	const ownerCol = collection.slice(0, -(filesExt.length));

	const nEntries = await count(teamspace, collection, { });

	const batchSize = Math.min(maxParallelFiles, nEntries);
	const nIterations = Math.ceil(nEntries / batchSize);

	await createIndex(teamspace, `${ownerCol}.ref`, { link: 1, type: 1 });

	for (let i = 0; i < nIterations; ++i) {
		// eslint-disable-next-line no-await-in-loop
		const gridFSEntries = await find(teamspace, collection, { }, { filename: 1, length: 1 }, undefined, batchSize);
		logger.logInfo(`\t\t\t\t[${i}/${nIterations}] Fetching ${gridFSEntries.length} files...`);
		// eslint-disable-next-line no-await-in-loop
		await processBatch(teamspace, ownerCol, gridFSEntries, maxParallelSizeMB, maxParallelFiles);
	}

	const recount = await count(teamspace, collection, { });
	if (recount > 0) {
		throw new Error(`Unexpected error: Gridfs still have ${recount} files after the moving process`);
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
