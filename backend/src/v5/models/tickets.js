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

	Object.keys(data).forEach((key) => {
		const value = data[key];
		if (value) {
			if (key === 'modules') {
				Object.keys(value).forEach((moduleName) => {
					const module = value[moduleName];
					Object.keys(module).forEach((moduleProp) => {
						const modulePropValue = module[moduleProp];
						if (modulePropValue) {
							toUpdate[`modules.${moduleName}.${moduleProp}`] = modulePropValue;
						} else {
							toUnset[`modules.${moduleName}.${moduleProp}`] = 1;
						}
					});
				});
			} else if (key === 'properties') {
				Object.keys(value).forEach((propKey) => {
					const propValue = value[propKey];
					if (propValue) {
						toUpdate[`properties.${propKey}`] = propValue;
					} else {
						toUnset[`properties.${propKey}`] = 1;
					}
				});
			} else {
				toUpdate[key] = value;
			}
		} else {
			toUnset[key] = 1;
		}
	});

	const updateJson = {};
	if (Object.keys(toUpdate).length) {
		updateJson.$set = toUpdate;
	}
	if (Object.keys(toUnset).length) {
		updateJson.$unset = toUnset;
	}

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
