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

const DbHandler = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
const { templates } = require('../utils/responseCodes');

const Tickets = {};
const TICKETS_COL = 'tickets';

const determineTicketNumber = async (teamspace, project, model, type) => {
	const lastTicket = await DbHandler.findOne(teamspace, TICKETS_COL,
		{ teamspace, project, model, type }, { number: 1 }, { number: -1 });
	return (lastTicket?.number ?? 0) + 1;
};

Tickets.addTicket = async (teamspace, project, model, ticket) => {
	const _id = generateUUID();
	const number = await determineTicketNumber(teamspace, project, model, ticket.type);
	await DbHandler.insertOne(teamspace, TICKETS_COL, { ...ticket, teamspace, project, model, _id, number });
	return _id;
};

Tickets.updateTicket = async (teamspace, ticketId, data) => {
	const toUpdate = {};
	const toUnset = {};

	const { modules, properties, ...rootProps } = data;

	const determineUpdate = (obj, prefix) => {
		Object.keys(obj).forEach((key) => {
			const value = obj[key];
			if (value) toUpdate[`${prefix ?? ''}${key}`] = value;
			else { toUnset[`${prefix ?? ''}${key}`] = 1; }
		});
	};

	determineUpdate(rootProps);

	if (properties) { determineUpdate(properties, 'properties.'); }

	if (modules) {
		Object.keys(modules).forEach((mod) => {
			determineUpdate(modules[mod], `modules.${[mod]}.`);
		});
	}

	const updateJson = {};
	if (Object.keys(toUpdate).length) { updateJson.$set = toUpdate; }

	if (Object.keys(toUnset).length) { updateJson.$unset = toUnset; }

	if (Object.keys(updateJson).length) {
		await DbHandler.updateOne(teamspace, TICKETS_COL, { _id: ticketId }, updateJson);
	}
};

Tickets.removeAllTicketsInModel = async (teamspace, project, model) => {
	await DbHandler.deleteMany(teamspace, TICKETS_COL, { teamspace, project, model });
};

Tickets.getTicketById = async (
	teamspace,
	project,
	model,
	_id,
	projection = { teamspace: 0, project: 0, model: 0 },
) => {
	const ticket = await DbHandler.findOne(teamspace, TICKETS_COL, { teamspace, project, model, _id }, projection);

	if (!ticket) {
		throw templates.ticketNotFound;
	}

	return ticket;
};

module.exports = Tickets;
