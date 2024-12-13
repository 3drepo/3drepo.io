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
const { generateUUID } = require('../utils/helper/uuids');
const { notificationTypes } = require('./notifications.constants');

const Notifications = {};
const NOTIFICATIONS_COL = 'notifications';

Notifications.initialise = () => db.createIndex(INTERNAL_DB, NOTIFICATIONS_COL,
	{ user: 1, timestamp: -1 }, { runInBackground: true });

Notifications.removeAllUserNotifications = async (user) => {
	await db.deleteMany(INTERNAL_DB, NOTIFICATIONS_COL, { user });
};

Notifications.insertTicketAssignedNotifications = async (teamspace, project, model, notifications) => {
	const timestamp = new Date();
	const records = notifications.flatMap(({ toNotify, ticket, assignedBy }) => {
		if (toNotify?.length && ticket && assignedBy) {
			return toNotify.map((user) => ({
				_id: generateUUID(),
				user,
				type: notificationTypes.TICKET_ASSIGNED,
				timestamp,
				data: {
					teamspace, project, model, ticket, assignedBy,
				},
			}));
		}
		return [];
	});

	if (records?.length) {
		await db.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, records);
	}
};

Notifications.insertTicketUpdatedNotifications = async (teamspace, project, model, notifications) => {
	const timestamp = new Date();
	const records = notifications.flatMap(({ toNotify, ticket, author, changes }) => {
		if (toNotify?.length && ticket) {
			return toNotify.map((user) => ({
				_id: generateUUID(),
				user,
				type: notificationTypes.TICKET_UPDATED,
				timestamp,
				data: {
					teamspace, project, model, ticket, author, changes,
				},
			}));
		}
		return [];
	});

	if (records?.length) {
		await db.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, records);
	}
};

module.exports = Notifications;
