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
const { logger } = require('../utils/logger');
const { notificationTypes } = require('./notifications.constants');

const Notifications = {};
const NOTIFICATIONS_COL = 'notifications';

Notifications.ensureIndicesExist = async () => {
	try {
		await db.createIndex(INTERNAL_DB, NOTIFICATIONS_COL,
			{ user: 1, timestamp: -1 }, { runInBackground: true });
		await db.createIndex(INTERNAL_DB, NOTIFICATIONS_COL,
			{ 'data.teamspace': 1, timestamp: -1 }, { runInBackground: true });
	} catch (err) {
		logger.logError(`Failed to create index for notification: ${err.message}`);
	}
};

Notifications.removeAllUserNotifications = async (user) => {
	await db.deleteMany(INTERNAL_DB, NOTIFICATIONS_COL, { user });
};

Notifications.removeAllTeamspaceNotifications = async (teamspace) => {
	await db.deleteMany(INTERNAL_DB, NOTIFICATIONS_COL, { 'data.teamspace': teamspace });
};

const generateNotification = (type, user, data) => ({
	_id: generateUUID(),
	user,
	type,
	timestamp: new Date(),
	data,
});

Notifications.insertClashNotifications = async (teamspace, project, notificationData, recipients) => {
	const records = recipients.map((recipient) => generateNotification(notificationTypes.CLASH_RUN_COMPLETED,
		recipient, { ...notificationData, teamspace, project }));

	if (records?.length) {
		await db.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, records);
	}
};

Notifications.insertTicketAssignedNotifications = async (teamspace, project, model, notifications) => {
	const records = notifications.flatMap(({ users, ticket, assignedBy }) => {
		if (users?.length && ticket && assignedBy) {
			return users.map((user) => generateNotification(
				notificationTypes.TICKET_ASSIGNED,
				user,
				{ teamspace, project, model, ticket, assignedBy }));
		}
		return [];
	});

	if (records?.length) {
		await db.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, records);
	}
};

Notifications.insertTicketUpdatedNotifications = async (teamspace, project, model, notifications) => {
	const records = notifications.flatMap(({ users, ticket, author, ...info }) => {
		if (users?.length && ticket) {
			return users.map((user) => generateNotification(
				notificationTypes.TICKET_UPDATED,
				user,
				{ teamspace, project, model, ticket, author, ...info }));
		}
		return [];
	});

	if (records?.length) {
		await db.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, records);
	}
};

Notifications.insertTicketClosedNotifications = async (teamspace, project, model, notifications) => {
	const records = notifications.flatMap(({ users, ticket, author, status }) => {
		if (users?.length && ticket) {
			return users.map((user) => generateNotification(
				notificationTypes.TICKET_CLOSED,
				user,
				{ teamspace, project, model, ticket, author, status }));
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
			$facet: {
				ticketNotifications: [
					// Only process notifications containing ticket and model data.
					{
						$match: {
							'data.ticket': { $exists: true, $ne: null },
							'data.model': { $exists: true, $ne: null },
						},
					},
					// Group tickets by user/teamspace/project/model/type.
					{
						$group: {
							_id: {
								user: '$user',
								teamspace: '$data.teamspace',
								project: '$data.project',
								model: '$data.model',
								type: '$type',
							},
							tickets: {
								$addToSet: '$data.ticket',
							},
						},
					},
					// Group notification types under each model.
					{
						$group: {
							_id: {
								user: '$_id.user',
								teamspace: '$_id.teamspace',
								project: '$_id.project',
								model: '$_id.model',
							},
							data: {
								$push: {
									type: '$_id.type',
									tickets: '$tickets',
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
					// Group models under each project.
					{
						$group: {
							_id: {
								user: '$_id.user',
								teamspace: '$_id.teamspace',
								project: '$_id.project',
							},
							ticketData: {
								$push: {
									model: '$_id.model',
									data: '$data',
								},
							},
						},
					},
					// Normalize the shape before merging both facets.
					{
						$project: {
							_id: 1,
							ticketData: 1,
							clashData: { $literal: [] },
						},
					},
				],
				clashNotifications: [
					// Only process completed clash-run notifications.
					{
						$match: { type: 'CLASH_RUN_COMPLETED' },
					},
					// Group clash runs under each plan.
					{
						$group: {
							_id: {
								user: '$user',
								teamspace: '$data.teamspace',
								project: '$data.project',
								plan: '$data.plan',
							},
							runs: {
								$push: {
									status: '$data.status',
									stats: '$data.results.stats',
									error: '$data.results.error',
									triggeredAt: '$data.triggeredAt',
								},
							},
							planName: {
								$first: '$data.planName',
							},
						},
					},
					// Group plans under each project.
					{
						$group: {
							_id: {
								user: '$_id.user',
								teamspace: '$_id.teamspace',
								project: '$_id.project',
							},
							clashData: {
								$push: {
									planName: '$planName',
									runs: '$runs',
								},
							},
						},
					},
					// Normalize the shape before merging both facets.
					{
						$project: { _id: 1, ticketData: { $literal: [] }, clashData: 1 },
					},
				],
			},
		},
		// Combine project documents produced by both facets.
		{
			$project: {
				notifications: {
					$concatArrays: ['$ticketNotifications', '$clashNotifications'],
				},
			},
		},
		{
			$unwind: '$notifications',
		},
		// Merge ticket and clash data belonging to the same project.
		{
			$group: {
				_id: '$notifications._id',
				ticketDataArrays: {
					$push: '$notifications.ticketData',
				},
				clashDataArrays: {
					$push: '$notifications.clashData',
				},
			},
		},
		{
			$project: {
				_id: 1,
				ticketData: {
					$reduce: {
						input: '$ticketDataArrays',
						initialValue: [],
						in: {
							$concatArrays: ['$$value', '$$this'],
						},
					},
				},
				clashData: {
					$reduce: {
						input: '$clashDataArrays',
						initialValue: [],
						in: {
							$concatArrays: ['$$value', '$$this'],
						},
					},
				},
			},
		},
		{
			$sort: { '_id.project': 1 },
		},
		// Group projects under each user/teamspace.
		{
			$group: {
				_id: {
					user: '$_id.user',
					teamspace: '$_id.teamspace',

				},
				data: {
					$push: {
						project: '$_id.project',
						ticketData: '$ticketData',
						clashData: '$clashData',
					},
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
		},
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

	const [contextData, digestData, recipients] = await Promise.all([
		getAllAssociatedTicketsInQuery(query),
		getGroupedNotificationsByQuery(query),
		db.distinct(INTERNAL_DB, NOTIFICATIONS_COL, 'user', query.$match),
	]);

	return { contextData, digestData, recipients };
};

module.exports = Notifications;
