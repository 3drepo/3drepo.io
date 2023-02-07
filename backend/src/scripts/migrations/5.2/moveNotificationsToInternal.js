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

const { bulkWrite, dropDatabase, find, listCollections } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { initialise } = require(`${v5Path}/models/notifications`);

const INTERNAL_DB = 'internal';
const NOTIFICATIONS_DB = 'notifications';
const NOTIFICATIONS_COLL = 'notifications';

const processCollection = async (user) => {
	const updatedNotifications = (await find(NOTIFICATIONS_DB, user, {})).map((entry) => ({
		...entry,
		user,
		timestamp: new Date(entry.timestamp),
	}));

	if (updatedNotifications.length) {
		console.log(updatedNotifications);
		logger.logInfo(`\t-Migrating ${updatedNotifications.length} records for ${user}`);
		// await bulkWrite(INTERNAL_DB, NOTIFICATIONS_COLL, updatedNotifications);
	}

	// await dropCollection(NOTIFICATIONS_DB, user);
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

	collections.forEach(async ({ name }) => {
		// eslint-disable-next-line no-await-in-loop
		await processCollection(name);
	});

	/*
	if (moveToInternalOperations.length) {
		logger.logInfo(`\t-Migrating ${moveToInternalOperations.length} collections from ${NOTIFICATIONS_DB}`);
		await bulkWrite(INTERNAL_DB, NOTIFICATIONS_COLL, moveToInternalOperations.flatMap((collOps) => collOps));
	} else {
		logger.logInfo('\t-Nothing to migrate');
	}
	*/

	logger.logInfo(`\t-Migration to ${INTERNAL_DB}:${NOTIFICATIONS_COLL} complete. Dropping ${NOTIFICATIONS_DB} DB...`);
	// await dropDatabase(NOTIFICATIONS_DB);
};

module.exports = run;
