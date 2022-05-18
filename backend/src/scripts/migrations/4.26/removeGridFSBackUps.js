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
const { getTeamspaceList, getCollectionsEndsWith } = require('../utils');

const { count, dropCollection, find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { fs } = require(`${v5Path}/utils/config`);
const GridFS = require(`${v5Path}/handler/gridfs`);

const refExt = '.ref';

const removeGridFSBackup = async (teamspace, col, filename) => {
	const filesCol = `${col}.files`;
	const legacyFileName = { $regex: `^/\\w+/\\w+.*/${filename}$` };
	const rec = await find(teamspace, filesCol,
		{ $or: [{ filename }, { filename: legacyFileName }] }, { filename: 1 });
	if (rec.length) {
		await GridFS.removeFiles(teamspace, col, rec.map(({ filename: file }) => file));
	}
};

const processCollection = async (teamspace, collection) => {
	const ownerCol = collection.slice(0, -(refExt.length));
	const refEntries = await find(teamspace, collection, { type: 'fs' }, {link : 1});
	await Promise.all(refEntries.map(async ({ _id, link }) => {
		try {
			await access(Path.join(fs.path, link), constants.R_OK);
			await removeGridFSBackup(teamspace, ownerCol, _id);
		} catch (err) {
			logger.logError(`Failed to process file ${_id}: ${err.message}`);
		}
	}));

	const filesCol = `${ownerCol}.files`;
	const chunksCol = `${ownerCol}.chunks`;
	const fileCount = await count(teamspace, filesCol, { filename: { $not: { $regex: '.*unityAssets.json$' } } });
	if (!fileCount) {
		await Promise.all([
			dropCollection(teamspace, filesCol),
			dropCollection(teamspace, chunksCol),
		]).catch(() => {
			// Don't actually care if this errored - not a big issue.
		});
	}
};

const processTeamspace = async (teamspace) => {
	const refCols = await getCollectionsEndsWith(teamspace, refExt);
	for (let i = 0; i < refCols.length; ++i) {
		const collection = refCols[i].name;
		logger.logInfo(`\t\t\t${collection}`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, collection);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i]);
	}
};

module.exports = run;
