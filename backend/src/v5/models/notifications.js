/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { INTERNAL_DB } = require('../handler/db.constants');
const db = require('../handler/db');
const { logger } = require('../utils/logger');

const Notifications = {};
const NOTIFICATIONS_COLL = 'notifications';

Notifications.initialise = async () => {
	try {
		await db.createIndex(INTERNAL_DB, NOTIFICATIONS_COLL,
			{ user: 1, timestamp: -1 }, { runInBackground: true });
	} catch (err) {
		logger.logError(`Failed to create index for notification: ${err.message}`);
	}
};

Notifications.removeAllUserNotifications = async (user) => {
	await db.deleteMany(INTERNAL_DB, NOTIFICATIONS_COLL, { user });
};

module.exports = Notifications;
