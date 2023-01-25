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

const { bulkWrite, find, listCollections } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const INTERNAL_DB = 'internal';
const NOTIFICATIONS_DB = 'notifications';
const NOTIFICATIONS_COLL = 'notifications';

const processCollection = async (user) => {
	const migrationOps = (await find(NOTIFICATIONS_DB, user, {})).map((entry) => ({
		updateOne: {
			filter: { _id: entry._id },
			update: { $set: {
				...entry,
				user,
				timestamp: new Date(entry.timestamp),
			} },
			upsert: true,
		},
	}));

	return migrationOps;
};

const run = async () => {
	const collections = await listCollections(NOTIFICATIONS_DB);

	const moveToInternalOperations = await Promise.all(collections.map(({ name }) => {
		if (name === 'charence') {
			return processCollection(name);
		}
		return [];
	}));

	logger.logInfo(`\t-Migrating ${moveToInternalOperations.length} collections from ${NOTIFICATIONS_DB}`);
	await bulkWrite(INTERNAL_DB, NOTIFICATIONS_COLL, moveToInternalOperations.flatMap((collOps) => collOps));

	logger.logInfo(`\t-Migration to ${INTERNAL_DB}:${NOTIFICATIONS_COLL} complete. Dropping ${NOTIFICATIONS_DB} DB...`);
	// await dropDatabase(NOTIFICATIONS_DB);
};

module.exports = run;
