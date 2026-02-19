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

const { createConstantsObject } = require(`${v5Path}/utils/helper/objects`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { getFile, storeFile, removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processCollection = async (teamspace, collection) => {
	const badEntries = await find(teamspace, collection,
		{ _id: { $regex: '^/revision/.+/supermeshes\\.json$' } }, { _id: 1 });
	const goodEntries = await find(teamspace, collection,
		{ _id: { $regex: '^[0-9a-fA-F-]+\\/supermeshes\\.json$' } }, { _id: 1 });

	const goodEntryIds = createConstantsObject(goodEntries.map(({ _id }) => _id));

	/* eslint-disable no-await-in-loop */
	for (const { _id } of badEntries) {
		try {
			if (!goodEntryIds[_id]) {
				const file = await getFile(teamspace, collection, _id);
				await storeFile(teamspace, collection, _id.replace('revision/', ''), file);
			}

			await removeFilesWithMeta(teamspace, collection, { _id });
		} catch (err) {
			logger.logError(`Failed to remove files from ${teamspace}.${collection} with query: ${JSON.stringify({ _id })}`);
			throw err;
		}
	}
	/* eslint-enable no-await-in-loop */
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
