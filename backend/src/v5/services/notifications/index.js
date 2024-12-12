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

const { addTicketAssignedNotifications, updateTicketNotifications } = require('../../models/notifications');
const { basePropertyLabels } = require('../../schemas/tickets/templates.constants');
const { events } = require('../eventsManager/eventsManager.constants');
const { getCommonElements } = require('../../utils/helper/arrays');
const { getJobsToUsers } = require('../../models/jobs');
const { getTicketById } = require('../../models/tickets');
const { getUsersWithPermissions } = require('../../processors/teamspaces/projects/models/commons/settings');
const { subscribe } = require('../eventsManager/eventsManager');

const NotificationService = {};

const getUserList = (jobToUsers, toNotify) => toNotify.flatMap(
	(entry) => (jobToUsers[entry] ? jobToUsers[entry] : entry));

const generateTicketNotifications = async (teamspace, project, model, actionedBy, info, notifyFn) => {
	const [jobToUsers, usersWithAccess] = await Promise.all([
		getJobsToUsers(teamspace),
		getUsersWithPermissions(teamspace, project, model, false),
	]);

	const notifications = info.flatMap(({ toNotify, ...data }) => {
		const users = getCommonElements(getUserList(jobToUsers, toNotify), usersWithAccess)
			.filter((user) => user !== actionedBy);
		console.log(data);
		return users.length ? { ...data, users } : [];
	});

	if (notifications.length) {
		await notifyFn(teamspace, project, model, notifications);
	}
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
			info, addTicketAssignedNotifications);
	}
};

const onTicketUpdated = async (teamspace, project, model, ticket, author, changes) => {
	const { properties } = await getTicketById(teamspace, project, model, ticket, {
		[`properties.${basePropertyLabels.ASSIGNEES}`]: 1,
		[`properties.${basePropertyLabels.OWNER}`]: 1,
	});

	const toNotify = [properties[basePropertyLabels.OWNER],
		...(properties[basePropertyLabels.ASSIGNEES] || [])];

	const notification = { toNotify, ticket, changes, author };

	await generateTicketNotifications(teamspace, project, model, author, [notification], updateTicketNotifications);

	// FIXME: assignments and closures
};

NotificationService.init = () => {
	subscribe(events.NEW_TICKET, ({ teamspace, project, model, ticket }) => onNewTickets(
		teamspace, project, model, [ticket]));
	subscribe(events.TICKETS_IMPORTED, ({ teamspace, project, model, tickets }) => onNewTickets(
		teamspace, project, model, tickets));
	subscribe(events.UPDATE_TICKET, ({ teamspace, project, model, ticket, author,
		changes }) => onTicketUpdated(teamspace, project, model, ticket, author, changes));
	// subscribe(events.NEW_COMMENT, ticketCommentAdded);
};

module.exports = NotificationService;
