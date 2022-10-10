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

const { createIndex, find, findOne, updateOne, getFileFromGridFS } = require(`${v5Path}/handler/db`);
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

const moveFile = async (teamspace, collection, filename) => {
	const legacyFileName = convertLegacyFileName(filename);
	const query = legacyFileName === filename ? { link: filename }
		: { link: { $in: [filename, legacyFileName] } };
	const existingRef = await findOne(teamspace, `${collection}.ref`, query, { type: 1 });

	if (existingRef && existingRef.type !== 'gridfs') {
		// Already have an entry for this file, just update the name in gridfs so it will get removed
	} else {
		const file = await getFileFromGridFS(teamspace, collection, filename).catch((err) => { throw new Error(`Failed to fetch file from gridfs (${teamspace}.${collection}): ${filename}: ${err?.message ?? err}`); });
		const newRef = await FsService.storeFile(file);
		newRef._id = existingRef?._id || convertLegacyFileName(filename);
		await updateOne(teamspace, `${collection}.ref`, { _id: newRef._id }, { $set: newRef }, true);
	}

	return filename;
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
	const filesToRemove = await Promise.all(
		group.map(({ filename }) => moveFile(teamspace, collection, filename)),
	);
	await GridFS.removeFiles(teamspace, collection, filesToRemove);
};

const formatNumber = (n) => parseFloat(n).toFixed(2);

const processCollection = async (teamspace, collection, maxParallelSizeMB, maxParallelFiles) => {
	const ownerCol = collection.slice(0, -(filesExt.length));
	const gridFSEntries = await find(teamspace, collection, { }, { filename: 1, length: 1 });
	const fileGroups = organiseFilesToProcess(gridFSEntries, maxParallelSizeMB, maxParallelFiles);

	await createIndex(teamspace, `${ownerCol}.ref`, { link: 1, type: 1 });

	for (let i = 0; i < fileGroups.length; ++i) {
		const group = fileGroups[i];
		const totalSize = group.reduce((partialSum, { length }) => partialSum + length, 0) / (1024 * 1024);
		logger.logInfo(`\t\t\t\t[${i}/${fileGroups.length}] Copying ${group.length} file(s) (${formatNumber(totalSize)}MiB)`);
		// eslint-disable-next-line no-await-in-loop
		await processFileGroup(teamspace, ownerCol, group);
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
