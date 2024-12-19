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
	const records = notifications.flatMap(({ users, ticket, assignedBy }) => {
		if (users?.length && ticket && assignedBy) {
			return users.map((user) => ({
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
	const records = notifications.flatMap(({ users, ticket, author, changes }) => {
		if (users?.length && ticket) {
			return users.map((user) => ({
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

Notifications.insertTicketClosedNotifications = async (teamspace, project, model, notifications) => {
	const timestamp = new Date();
	const records = notifications.flatMap(({ users, ticket, author, status }) => {
		if (users?.length && ticket) {
			return users.map((user) => ({
				_id: generateUUID(),
				user,
				type: notificationTypes.TICKET_CLOSED,
				timestamp,
				data: {
					teamspace, project, model, ticket, author, status,
				},
			}));
		}
		return [];
	});

	if (records?.length) {
		await db.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, records);
	}
};

const getGroupedNotificationsByQuery = (query) => {
	const pipelines = [
		query,
		{
			// group by user/teamspace/project/model/type, count up the tickets
			$group: {
				_id: {
					user: '$user',
					teamspace: '$data.teamspace',
					project: '$data.project',
					model: '$data.model',
					type: '$type',
				},
				tickets: { $push: '$data.ticket' },
				count: { $sum: 1 },
			},
		},
		{
			// group the data by user/temaspace/project/model
			$group: {
				_id: {
					user: '$_id.user',
					teamspace: '$_id.teamspace',
					project: '$_id.project',
					model: '$_id.model',
				},
				notification: {
					$push: {
						type: '$_id.type',
						ticket: '$tickets',
						count: '$count',
					},
				},
			},
		},
		{
			$sort: {
				'_id.project': 1,
				'_id.model': 1,
			},
		},
		{
			$group: {
				_id: {
					user: '$_id.user',
					teamspace: '$_id.teamspace',

				},
				data: {
					$push: { project: '$_id.project', model: '$_id.model', data: '$notification' },
				},
			},
		},

	];

	return db.aggregate(INTERNAL_DB, NOTIFICATIONS_COL, pipelines);
};

const getAllAssociatedTicketsInQuery = (query) => {
	const pipelines = [
		query,
		{
			$group: {
				_id: {
					teamspace: '$data.teamspace',
					project: '$data.project',
					model: '$data.model',
				},
				tickets: { $addToSet: '$data.ticket' },
			},
		}, {
			$group: {
				_id: {
					teamspace: '$data.teamspace',
					project: '$data.project',
					model: '$data.model',
				},
				tickets: { $addToSet: '$data.ticket' },
			} },
		{
			$group: {
				_id: '$_id.teamspace',
				data: { $push: {
					project: '$_id.project',
					model: '$_id.model',
					tickets: '$tickets',
				} } } },
	];
	return db.aggregate(INTERNAL_DB, NOTIFICATIONS_COL, pipelines);
};

Notifications.composeDailyDigests = async (teamspaces) => {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 1);

	const query = {
		$match: {
			'data.teamspace': { $in: teamspaces },
			timestamp: { $gte: startDate },
		},
	};

	const [contextData, digestData] = await Promise.all([
		getAllAssociatedTicketsInQuery(query),
		getGroupedNotificationsByQuery(query),
	]);

	return { contextData, digestData };
};

module.exports = Notifications;
