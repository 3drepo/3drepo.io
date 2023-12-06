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

const { codeExists, createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { deserialiseUUIDsInTicket, processReadOnlyValues, validateTicket: validateTicketSchema } = require('../../../../../../../schemas/tickets');
const { checkTicketTemplateExists } = require('../../../settings');
const { getTemplateById } = require('../../../../../../../models/tickets.templates');
const { getTicketById } = require('../../../../../../../models/tickets');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { isEqual } = require('../../../../../../../utils/helper/objects');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { validateMany } = require('../../../../../../common');

const TicketsMiddleware = {};

const validateTicket = (isNewTicket) => async (req, res, next) => {
	try {
		const oldTicket = req.ticketData;
		const newTicket = req.body;
		const template = req.templateData;
		const user = getUserFromSession(req.session);
		const { teamspace } = req.params;

		if (isNewTicket && template.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		req.body = await validateTicketSchema(teamspace, template, newTicket, oldTicket);

		if (!isNewTicket && isEqual(req.body, { modules: {}, properties: {} })) {
			throw createResponseCode(templates.invalidArguments, 'No valid properties to update.');
		}

		req.body = deserialiseUUIDsInTicket(req.body, template);
		processReadOnlyValues(req.ticketData, req.body, user);

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err.message);
		respond(req, res, response);
	}
};

const templateIDToParams = async (req, res, next) => {
	if (req.body?.type) {
		req.body.type = stringToUUID(req.body.type);
		req.params.template = req.body.type;
		await next();
	} else {
		respond(req, res, createResponseCode(templates.invalidArguments, 'Template must be provided'));
	}
};

TicketsMiddleware.checkTicketExists = async (req, res, next) => {
	const { teamspace, project, model, ticket } = req.params;

	try {
		req.ticketData = await getTicketById(teamspace, project, model, ticket);
		req.templateData = await getTemplateById(teamspace, req.ticketData.type);

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

TicketsMiddleware.validateNewTicket = validateMany([templateIDToParams, checkTicketTemplateExists,
	validateTicket(true)]);
TicketsMiddleware.validateUpdateTicket = validateMany([TicketsMiddleware.checkTicketExists, validateTicket(false)]);

TicketsMiddleware.templateExists = checkTicketTemplateExists;

module.exports = TicketsMiddleware;
