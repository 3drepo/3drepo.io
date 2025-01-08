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

const { UUIDToString, stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { codeExists, createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { deserialiseUUIDsInTicket, processReadOnlyValues, validateTicket: validateTicketSchema } = require('../../../../../../../schemas/tickets');
const { getTicketById, getTicketsByQuery } = require('../../../../../../../models/tickets');
const { checkTicketTemplateExists } = require('../../../settings');
const { getArrayDifference } = require('../../../../../../../utils/helper/arrays');
const { getTemplateById } = require('../../../../../../../models/tickets.templates');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { isArray } = require('../../../../../../../utils/helper/typeCheck');
const { isEqual } = require('../../../../../../../utils/helper/objects');
const { respond } = require('../../../../../../../utils/responder');
const { validateMany } = require('../../../../../../common');

const TicketsMiddleware = {};

const processTicket = async (teamspace, project, model, template, author, newTicket, existingData, isImport) => {
	const validatedTicket = await validateTicketSchema(teamspace, project, model,
		template, newTicket, existingData, isImport);

	if (existingData && isEqual(validatedTicket, { modules: {}, properties: {} })) {
		throw createResponseCode(templates.invalidArguments, 'No valid properties to update.');
	}

	const deserialised = deserialiseUUIDsInTicket(validatedTicket, template);
	processReadOnlyValues(existingData, deserialised, author);
	return deserialised;
};

const validateTicket = (isNewTicket) => async (req, res, next) => {
	try {
		const template = req.templateData;
		const user = getUserFromSession(req.session);
		const { teamspace, project, model } = req.params;

		if (isNewTicket && template.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		req.body = await processTicket(teamspace, project, model, template, user, req.body, req.ticketData);

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err.message);
		respond(req, res, response);
	}
};

const bodyContainsTicketsArray = async (req, res, next) => {
	try {
		const tickets = req?.body?.tickets;

		if (!tickets || !isArray(tickets) || !tickets.length) {
			throw createResponseCode(
				templates.invalidArguments, 'Expected body to contain an array of tickets');
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

const validateTicketImportData = (isNew) => async (req, res, next) => {
	const { teamspace, project, model } = req.params;
	try {
		const template = req.templateData;
		const user = getUserFromSession(req.session);

		template.properties.forEach((property) => {
			if (property.unique) {
				const uniqueProps = {};
				req.body.tickets.forEach((ticket) => {
					if (uniqueProps[ticket[property.name]]) {
						throw createResponseCode(templates.invalidArguments, `Value '${property.name}' must be unique.`);
					}
					uniqueProps[ticket[property.name]] = true;
				});
			}
		});

		if (isNew && template.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		req.body.tickets = await Promise.all(req.body.tickets.map((ticket, i) => {
			const existingData = isNew ? undefined : req.ticketsData[i];
			return processTicket(teamspace,
				project, model, template, user, ticket, existingData, true);
		}));

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

const checkAllTicketsExist = async (req, res, next) => {
	const { teamspace, project, model, template } = req.params;
	const { tickets } = req.body;

	try {
		req.templateData = await getTemplateById(teamspace, template);

		const ticketIdStrs = [];

		const ticketIds = tickets.map(({ _id }) => {
			ticketIdStrs.push(_id);
			if (_id) return stringToUUID(_id);
			throw createResponseCode(templates.invalidArguments, '_id field must be provided for all tickets');
		});

		const ticketsData = await getTicketsByQuery(teamspace, project, model,
			{ _id: { $in: ticketIds }, type: template });

		const idToData = {};

		ticketsData.forEach((ticketData) => {
			const idStr = UUIDToString(ticketData._id);
			idToData[idStr] = ticketData;
		});

		const idsNotFound = getArrayDifference(Object.keys(idToData), ticketIdStrs);

		if (idsNotFound.length) {
			throw createResponseCode(templates.invalidArguments, `The following IDs were not found: ${idsNotFound.join(',')}`);
		}

		req.ticketsData = ticketIdStrs.map((id) => idToData[id]);

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

TicketsMiddleware.validateImportTickets = validateMany([templateIDToParams(true), checkTicketTemplateExists,
	bodyContainsTicketsArray, validateTicketImportData(true)]);

TicketsMiddleware.validateNewTicket = validateMany([templateIDToParams(false), checkTicketTemplateExists,
	validateTicket(true)]);
TicketsMiddleware.validateUpdateTicket = validateMany([TicketsMiddleware.checkTicketExists, validateTicket(false)]);
TicketsMiddleware.validateUpdateMultipleTickets = validateMany([
	templateIDToParams(true), checkTicketTemplateExists, bodyContainsTicketsArray,
	checkAllTicketsExist, validateTicketImportData(false)]);

TicketsMiddleware.templateExists = checkTicketTemplateExists;

module.exports = TicketsMiddleware;
