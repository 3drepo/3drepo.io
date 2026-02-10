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

const { modelTypes } = require(`${v5Path}/models/modelSettings.constants`);
const { getRevisions } = require(`${v5Path}/models/revisions`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const { getFile, storeFile, removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processCollection = async (teamspace, collection) => {
	const modelId = collection.split('.')[0];
	const revisions = await getRevisions(teamspace, undefined, modelId, modelTypes.CONTAINER, false, { _id: 1 });

	/* eslint-disable no-await-in-loop */
	for (const { _id: revId } of revisions) {
		const revIdStr = UUIDToString(revId);
		const correctEntryId = `${revIdStr}/supermeshes.json`;
		const wrongEntryId = `revision/${revIdStr}/supermeshes.json`;

		try {
			const entries = await find(teamspace, collection,
				{ _id: { $in: [wrongEntryId, correctEntryId] } }, { _id: 1 });

			const wrongNameEntry = entries.find(({ _id }) => _id === wrongEntryId);
			const correctNameEntry = entries.find(({ _id }) => _id === correctEntryId);

			if (wrongNameEntry) {
				if (!correctNameEntry) {
					const file = await getFile(teamspace, collection, wrongEntryId);
					await storeFile(teamspace, collection, correctEntryId, file);
				}

				await removeFilesWithMeta(teamspace, collection, { _id: wrongEntryId });
			}
		} catch (err) {
			logger.logError(`Failed to remove files from ${teamspace}.${collection} with query: ${JSON.stringify({ _id: wrongEntryId })}`);
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
