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

const { v5Path } = require('../../../interop');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find, bulkWrite } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { UUIDToString, generateUUIDString } = require(`${v5Path}/utils/helper/uuids`);
const { storeFileStream, getFileAsStream, removeFiles } = require(`${v5Path}/services/filesManager`);
const { PassThrough } = require('stream');

/* eslint-disable no-await-in-loop */

const commitFileStream = async (teamspace, collection, fileData) => {
	if (!fileData) return;
	fileData.stream.end();
	await fileData.writeProm;

	await Promise.all([
		bulkWrite(teamspace, collection, fileData.writeRequests),
		removeFiles(teamspace, collection, fileData.filesToDelete),
	]);
};

const establishNewFileData = (teamspace, collection, revId) => {
	const stream = PassThrough();
	const fileName = generateUUIDString();
	return {
		stream,
		writeProm: storeFileStream(teamspace, collection, fileName, stream, { revId }),
		size: 0,
		writeRequests: [],
		filesToDelete: [],
		fileName,
		revId,
	};
};

const calculateDataSize = async (teamspace, collection, files) => {
	const sizes = await find(teamspace, `${collection}.ref`, { _id: { $in: files } }, { size: 1 });

	return sizes.reduce((accum, { size }) => accum + size, 0);
};

const copyDataToFile = async (teamspace, collection, id, extRefs, fileData) => {
	const refEntry = {
		buffer: {
			name: fileData.fileName,
			start: fileData.size,
		},
		elements: {},
	};
	let meshSizeAccum = 0;
	for (const elementName of Object.keys(extRefs)) {
		try {
			const fileStream = await getFileAsStream(teamspace, collection, extRefs[elementName]);

			let elementSize = 0;

			refEntry.elements[elementName] = {
				start: meshSizeAccum,
			};

			await new Promise((resolve, reject) => {
				fileStream.readStream.on('data', (d) => {
					fileData.stream.write(d);
					elementSize += d.length;
				});

				fileStream.readStream.on('end', () => resolve());
				fileStream.readStream.on('error', reject);
			});

			refEntry.elements[elementName].size = elementSize;
			meshSizeAccum += elementSize;
		} catch (err) {
			if (err?.status === 404) {
				// we can't find the file - nothing we can do here so let's just skip it.
			} else {
				throw err;
			}
		}
	}
	// eslint-disable-next-line no-param-reassign
	fileData.size += meshSizeAccum;

	const updateInstr = { updateOne: {
		filter: { _id: id },
		update: { $set: { _blobRef: refEntry }, $unset: { _extRef: 1 } },
	} };

	fileData.filesToDelete.push(...Object.values(extRefs));

	fileData.writeRequests.push(updateInstr);
};

const processCollection = async (teamspace, collection) => {
	const query = { _extRef: { $exists: true } };
	const projection = { _extRef: 1, rev_id: 1 };
	const sort = { rev_id: 1, _id: 1 };

	const limit = 10000;
	const maxSizePerFile = 100 * 1024 * 1024; // 100MiB

	let fileData;
	let records;
	let pendingIds = [];

	do {
		records = await find(teamspace, collection, { ...query, _id: { $not: { $in: pendingIds } } },
			projection, sort, limit);

		if (records.length) {
			for (const { _extRef: extRef, rev_id: revId, _id } of records) {
				const entryRev = UUIDToString(revId);
				pendingIds.push(_id);

				const files = Object.values(extRef);

				const dataSize = await calculateDataSize(teamspace, collection, files);
				if (
					!fileData
				|| fileData.revId !== entryRev
				|| (dataSize + fileData.size) > maxSizePerFile
				) {
					logger.logInfo(`\t\t\tUpdating ${pendingIds.length} entries...`);
					await commitFileStream(teamspace, collection, fileData);

					fileData = await establishNewFileData(teamspace, collection, entryRev);
					pendingIds = [];
				}

				await copyDataToFile(teamspace, collection, _id, extRef, fileData);
			}
		}
	} while (records.length);

	if (fileData?.size) {
		logger.logInfo(`\t\t\tUpdating ${pendingIds.length} entries...`);
		await commitFileStream(teamspace, collection, fileData);
	}
};

const processTeamspace = async (teamspace) => {
	const collections = [
		...await getCollectionsEndsWith(teamspace, '.scene'),
		...await getCollectionsEndsWith(teamspace, '.stash.3drepo'),
	];

	for (let i = 0; i < collections.length; ++i) {
		const { name: colName } = collections[i];
		logger.logInfo(`\t-[${teamspace}]${colName} (${i + 1}/${collections.length})`);
		await processCollection(teamspace, colName);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		await processTeamspace(teamspace);
	}
};

/* eslint-disable no-await-in-loop */
module.exports = run;
