/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { insertRef, getRefEntry } = require(`${v5Path}/models/fileRefs`);
const { createConstantsObject } = require(`${v5Path}/utils/helper/objects`);
const { removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const insertMissingRef = async (teamspace, collection, id, correctedId) => {
	try {
		const refInfo = await getRefEntry(teamspace, collection, id);
		await insertRef(teamspace, collection, { ...refInfo, _id: correctedId });
	} catch (err) {
		logger.logError(`Failed to insert ref entry for ${teamspace}.${collection} with _id: ${correctedId}`);
	}
};

const removeInvalidRef = async (teamspace, collection, id) => {
	try {
		await removeFilesWithMeta(teamspace, collection, { _id: id });
	} catch (err) {
		logger.logError(`Failed to remove files from ${teamspace}.${collection} with _id: ${id}`);
	}
};

const processCollection = async (teamspace, collection) => {
	const [badEntries, goodEntries] = await Promise.all([
		find(teamspace, collection, { _id: { $regex: '^/revision/.+/supermeshes\\.json$' } }, { _id: 1 }),
		find(teamspace, collection, { _id: { $regex: '^[0-9a-fA-F-]+\\/supermeshes\\.json$' } }, { _id: 1 }),
	]);
	const goodEntryIds = createConstantsObject(goodEntries.map(({ _id }) => _id));

	const missingEntries = [];

	for (const { _id } of badEntries) {
		const correctedId = _id.replace('/revision/', '');
		if (!goodEntryIds[correctedId]) {
			missingEntries.push({ _id, correctedId });
		}
	}

	await Promise.all([
		...missingEntries.map(({ _id, correctedId }) => insertMissingRef(teamspace, collection, _id, correctedId)),
		...badEntries.map(({ _id }) => removeInvalidRef(teamspace, collection, _id)),
	]);
};

const processTeamspace = async (teamspace) => {
	const collections = await getCollectionsEndsWith(teamspace, '.stash.json_mpc.ref');

	for (let i = 0; i < collections.length; ++i) {
		const { name: colName } = collections[i];
		logger.logInfo(`\t-[${teamspace}]${colName} (${i + 1}/${collections.length})`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, colName);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts);
	}
};

module.exports = run;
