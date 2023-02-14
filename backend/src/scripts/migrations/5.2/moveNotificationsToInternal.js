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

const { dropCollection, dropDatabase, find, insertMany, listCollections } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { initialise } = require(`${v5Path}/models/notifications`);

const INTERNAL_DB = 'internal';
const NOTIFICATIONS_DB = 'notifications';
const NOTIFICATIONS_COLL = 'notifications';

const processCollection = async (user) => {
	const updatedNotifications = (await find(NOTIFICATIONS_DB, user, {})).map(({ timestamp, ...entry }) => ({
		...entry,
		user,
		timestamp: new Date(timestamp),
	}));

	if (updatedNotifications.length) {
		logger.logInfo(`\t-Migrating ${updatedNotifications.length} records for ${user}`);
		try {
			await insertMany(INTERNAL_DB, NOTIFICATIONS_COLL, updatedNotifications, false);
		} catch (err) {
			if (err?.result?.ok) {
				// insert successful, report # inserted (skipping duplicates)
				logger.logInfo(`\t\t-Records inserted: ${err.result.nInserted}`);
			} else {
				throw err;
			}
		}
	}

	await dropCollection(NOTIFICATIONS_DB, user);
};

const run = async () => {
	const [collections] = await Promise.all([
		listCollections(NOTIFICATIONS_DB),
		initialise(),
	]);

	if (collections.length === 0) {
		logger.logInfo(`\t-No collections found in: ${NOTIFICATIONS_DB}`);
		return;
	}

	for (let i = 0; i < collections.length; ++i) {
		// eslint-disable-next-line no-await-in-loop
		await processCollection(collections[i].name);
	}

	logger.logInfo(`\t-Migration to ${INTERNAL_DB}:${NOTIFICATIONS_COLL} complete. Dropping ${NOTIFICATIONS_DB} DB...`);
	await dropDatabase(NOTIFICATIONS_DB);
};

module.exports = run;
