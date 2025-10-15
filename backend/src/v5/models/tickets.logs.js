/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const DB = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');

const TicketLogs = {};
const TICKET_LOGS_COL = 'tickets.logs';

TicketLogs.addImportedLogs = async (teamspace, project, model, tickets) => {
	const logs = tickets.map(({ _id: ticket, author, ...imported }) => ({
		_id: generateUUID(),
		teamspace,
		project,
		model,
		ticket,
		author,
		timestamp: new Date(),
		imported,
	}));
	await DB.insertMany(teamspace,
		TICKET_LOGS_COL, logs);
};

TicketLogs.addGroupUpdateLog = async (teamspace, project, model, ticket, groupId, { author, changes, timestamp }) => {
	const ticketLog = {
		_id: generateUUID(),
		teamspace,
		project,
		model,
		ticket,
		author,
		timestamp,
		changes: {
			group: {
				_id: groupId,
				to: changes,
			},
		},
	};
	await DB.insertOne(teamspace,
		TICKET_LOGS_COL, ticketLog);
};

TicketLogs.addTicketLog = (teamspace, project, model, ticket, ticketLog) => DB.insertOne(teamspace,
	TICKET_LOGS_COL, { ...ticketLog, _id: generateUUID(), teamspace, project, model, ticket });

TicketLogs.getTicketLogsById = (
	teamspace,
	project,
	model,
	ticket,
	projection = { _id: 0, teamspace: 0, project: 0, model: 0, ticket: 0 },
	sort = { timestamp: 1 },
) => DB.find(teamspace, TICKET_LOGS_COL, { teamspace, project, model, ticket }, projection, sort);

module.exports = TicketLogs;
