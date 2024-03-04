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
const { isArray } = require('../../../../../../../utils/helper/typeCheck');
const { isEqual } = require('../../../../../../../utils/helper/objects');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { validateMany } = require('../../../../../../common');

const TicketsMiddleware = {};

const processTicket = async (teamspace, project, model, template, author, newTicket, existingData, isImport) => {
	const validatedTicket = await validateTicketSchema(teamspace, project, model,
		template, newTicket, existingData, isImport);

	if (existingData && isEqual(validatedTicket, { modules: {}, properties: {} })) {
		throw createResponseCode(templates.invalidArguments, 'No valid properties to update.');
	}

	const deserialised = deserialiseUUIDsInTicket(validatedTicket, template);
	return processReadOnlyValues(existingData, deserialised, author);
};

const validateTicket = (isNewTicket) => async (req, res, next) => {
	try {
		const template = req.templateData;
		const user = getUserFromSession(req.session);
		const { teamspace, project, model } = req.params;

		if (isNewTicket && template.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		res.body = await processTicket(teamspace, project, model, template, user, req.body, req.ticketData);

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err.message);
		respond(req, res, response);
	}
};

const validateTicketImportData = (isNew) => async (req, res, next) => {
	const { teamspace, project, model } = req.params;
	try {
		if (!req?.body?.tickets || !isArray(req.body.tickets)) {
			throw createResponseCode(
				templates.invalidArguments, 'Expected body to contain an array of tickets');
		}

		if (!req.body.tickets.length) {
			throw createResponseCode(
				templates.invalidArguments, 'Must contain at least 1 ticket');
		}

		const template = req.templateData;
		const user = getUserFromSession(req.session);

		if (isNew && template.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		req.body.tickets = await Promise.all(req.body.tickets.map((ticket, i) => processTicket(teamspace,
			project, model, template, user, ticket, isNew ? undefined : req.ticketData[i], true)));

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err.message);
		respond(req, res, response);
	}
};

const templateIDToParams = (inQueryString) => async (req, res, next) => {
	const dataLocation = (inQueryString ? req.query : req.body) || {};
	const dataKey = inQueryString ? 'template' : 'type';

	const templateIdStr = dataLocation[dataKey];
	const templateId = stringToUUID(templateIdStr);
	if (templateId) {
		dataLocation[dataKey] = templateId;
		req.params.template = templateId;
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

TicketsMiddleware.validateImportTickets = validateMany([templateIDToParams(true), checkTicketTemplateExists,
	validateTicketImportData(true)]);

TicketsMiddleware.validateNewTicket = validateMany([templateIDToParams(false), checkTicketTemplateExists,
	validateTicket(true)]);
TicketsMiddleware.validateUpdateTicket = validateMany([TicketsMiddleware.checkTicketExists, validateTicket(false)]);

TicketsMiddleware.templateExists = checkTicketTemplateExists;

module.exports = TicketsMiddleware;
