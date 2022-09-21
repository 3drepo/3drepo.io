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
const { getTeamspaceList, getCollectionsEndsWith } = require('../../common/utils');

const { find, findOne, updateOne, getFileFromGridFS } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const FsService = require(`${v5Path}/handler/fs`);

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
	const existingRef = await findOne(teamspace, `${collection}.ref`, { $or: [
		{ link: filename },
		{ link: convertLegacyFileName(filename) },
	] }, { type: 1 });

	if (existingRef && existingRef.type !== 'gridfs') {
		// Already have an entry for this file, just update the name in gridfs so it will get removed
		await updateOne(teamspace, `${collection}${filesExt}`, { filename }, { $set: { filename: existingRef._id } });
	} else {
		const file = await getFileFromGridFS(teamspace, collection, filename);
		const newRef = await FsService.storeFile(file);
		newRef._id = existingRef?._id || convertLegacyFileName(filename);
		await Promise.all([
			updateOne(teamspace, `${collection}.ref`, { _id: newRef._id }, { $set: newRef }, true),
			updateOne(teamspace, `${collection}${filesExt}`, { filename }, { $set: { filename: newRef._id } }),
		]);
	}
};

const processCollection = async (teamspace, collection) => {
	const ownerCol = collection.slice(0, -(filesExt.length));
	const gridFSEntry = await find(teamspace, collection, { }, { filename: 1 });
	for (const entry of gridFSEntry) {
		logger.logInfo(`\t\t\t\t${entry}`);
		// eslint-disable-next-line no-await-in-loop
		await moveFile(teamspace, ownerCol, entry.filename);
	}
};

const processTeamspace = async (teamspace) => {
	const filesCols = await getCollectionsEndsWith(teamspace, filesExt);
	for (let i = 0; i < filesCols.length; ++i) {
		const collection = filesCols[i].name;
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
