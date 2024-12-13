/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { getArrayDifference, getCommonElements } = require('../../utils/helper/arrays');
const { insertTicketAssignedNotifications, insertTicketUpdatedNotifications } = require('../../models/notifications');
const { basePropertyLabels } = require('../../schemas/tickets/templates.constants');
const { events } = require('../eventsManager/eventsManager.constants');
const { getJobsToUsers } = require('../../models/jobs');
const { getTicketById } = require('../../models/tickets');
const { getUsersWithPermissions } = require('../../processors/teamspaces/projects/models/commons/settings');
const { subscribe } = require('../eventsManager/eventsManager');

const TicketNotifications = {};

const getUserList = (jobToUsers, toNotify) => toNotify.flatMap(
	(entry) => (jobToUsers[entry] ? jobToUsers[entry] : entry));

/*
 * notificationData is an array of { info, notifyFn }
 * where info is the message info (who to notify, the data etc)
 * and notifyFn is a function to call to add the notification (assigned, updateTicket etc)
 */
const generateTicketNotifications = async (teamspace, project, model, actionedBy, notificationData) => {
	const [jobToUsers, usersWithAccess] = await Promise.all([
		getJobsToUsers(teamspace),
		getUsersWithPermissions(teamspace, project, model, false),
	]);

	await Promise.all(notificationData.map(async ({ info, notifyFn }) => {
		const notifications = info.flatMap(({ toNotify, ...data }) => {
			const users = getCommonElements(getUserList(jobToUsers, toNotify), usersWithAccess)
				.filter((user) => user !== actionedBy);
			return users.length ? { ...data, users } : [];
		});

		if (notifications.length) {
			await notifyFn(teamspace, project, model, notifications);
		}
	}));
};

const onNewTickets = async (teamspace, project, model, tickets) => {
	let assignedBy;
	const info = tickets.flatMap((ticket) => {
		const assignees = ticket?.properties?.[basePropertyLabels.ASSIGNEES];
		if (assignees?.length > 0) {
			assignedBy = ticket?.properties?.[basePropertyLabels.OWNER];
			return { toNotify: assignees, ticket: ticket._id, assignedBy };
		}
		return [];
	});

	if (info.length > 0) {
		await generateTicketNotifications(teamspace, project, model, assignedBy,
			[{ info, notifyFn: insertTicketAssignedNotifications }]);
	}
};

const onTicketUpdated = async (teamspace, project, model, ticket, author, changes) => {
	const { properties } = await getTicketById(teamspace, project, model, ticket, {
		[`properties.${basePropertyLabels.ASSIGNEES}`]: 1,
		[`properties.${basePropertyLabels.OWNER}`]: 1,
	});

	const notifications = [];

	const notifyUpdate = [properties[basePropertyLabels.OWNER]];

	if (changes?.properties?.[basePropertyLabels.ASSIGNEES]) {
		// If assignees were changed, we want to notify old assignees of the ticket update,
		// and new assignees that they're assigned to a ticket

		const { from, to } = changes?.properties?.[basePropertyLabels.ASSIGNEES];

		if (from?.length) {
			notifyUpdate.push(...from);
		}

		if (to?.length) {
			const toNotify = getArrayDifference(from ?? [], to);
			if (toNotify?.length) {
				notifications.push({
					info: [{ toNotify, ticket, assignedBy: author }],
					notifyFn: insertTicketAssignedNotifications,
				});
			}
		}
	} else if (properties[basePropertyLabels.ASSIGNEES]?.length) {
		notifyUpdate.push(...properties[basePropertyLabels.ASSIGNEES]);
	}

	if (changes?.properties?.[basePropertyLabels.STATUS]) {
		// If the ticket is closed, we want to send ticket
		// closed notification instead of update

	}

	const info = [{ toNotify: notifyUpdate, ticket, changes, author }];

	notifications.push({ info, notifyFn: insertTicketUpdatedNotifications });

	await generateTicketNotifications(teamspace, project, model, author, notifications);

	// closures
};

TicketNotifications.subscribe = () => {
	subscribe(events.NEW_TICKET, ({ teamspace, project, model, ticket }) => onNewTickets(
		teamspace, project, model, [ticket]));
	subscribe(events.TICKETS_IMPORTED, ({ teamspace, project, model, tickets }) => onNewTickets(
		teamspace, project, model, tickets));
	subscribe(events.UPDATE_TICKET, ({ teamspace, project, model, ticket, author,
		changes }) => onTicketUpdated(teamspace, project, model, ticket, author, changes));
	// subscribe(events.NEW_COMMENT, ticketCommentAdded);
};

module.exports = TicketNotifications;
