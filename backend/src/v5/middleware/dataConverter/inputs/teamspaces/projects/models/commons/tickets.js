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
const { processReadOnlyValues, validateTicket } = require('../../../../../../../schemas/tickets');
const { checkTicketTemplateExists } = require('../../../settings');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { validateMany } = require('../../../../../../common');

const TicketsMiddleware = {};

const validateNewTicket = async (req, res, next) => {
	try {
		const ticket = req.body;
		const template = req.templateData;
		const user = getUserFromSession(req.session);

		if (template.deprecated) throw createResponseCode(templates.invalidArguments, 'Template type has been deprecated');

		const { teamspace } = req.params;

		req.body = await validateTicket(teamspace, template, ticket);
		await processReadOnlyValues(req.body, user);
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
		respond(req, res, createResponseCode(templates.invalidArguments, 'template type must be provided'));
	}
};

TicketsMiddleware.validateNewTicket = validateMany([templateIDToParams, checkTicketTemplateExists, validateNewTicket]);
TicketsMiddleware.templateExists = checkTicketTemplateExists;

module.exports = TicketsMiddleware;
