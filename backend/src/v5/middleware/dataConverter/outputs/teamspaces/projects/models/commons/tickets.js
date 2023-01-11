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

const { getTemplateById, getTemplatesByQuery } = require('../../../../../../../models/tickets.templates');
const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const { generateFullSchema } = require('../../../../../../../schemas/tickets/templates');
const { respond } = require('../../../../../../../utils/responder');
const { serialiseTicket } = require('../../../../../../../schemas/tickets');
const { serialiseTicketTemplate } = require('../../../../common/tickets.templates');
const { templates } = require('../../../../../../../utils/responseCodes');

const Tickets = {};

Tickets.serialiseFullTicketTemplate = (req, res) => {
	try {
		const { templateData, query } = req;
		const showDeprecated = query?.showDeprecated === 'true';
		const fullTemplate = generateFullSchema(templateData);

		respond(req, res, templates.ok, serialiseTicketTemplate(fullTemplate, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

Tickets.serialiseTicket = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const { ticket, showDeprecated } = req;
		const template = generateFullSchema(await getTemplateById(teamspace, ticket.type));
		respond(req, res, templates.ok, serialiseTicket(ticket, template, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

const getTemplatesDictionary = async (teamspace, templateIds) => {
	const res = {};

	const data = await getTemplatesByQuery(teamspace, { _id: { $in: templateIds } });

	data.forEach((tem) => {
		res[UUIDToString(tem._id)] = generateFullSchema(tem);
	});

	return res;
};

Tickets.serialiseTicketList = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const { tickets } = req;

		const templateIdArr = tickets.map(({ type }) => type);
		const templateIds = new Set(templateIdArr);

		const templateLUT = await getTemplatesDictionary(teamspace, Array.from(templateIds));
		const outputProms = tickets.map((ticket) => serialiseTicket(
			ticket, templateLUT[UUIDToString(ticket.type)], true,
		));
		respond(req, res, templates.ok, { tickets: await Promise.all(outputProms) });
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

module.exports = Tickets;
