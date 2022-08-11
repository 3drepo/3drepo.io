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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { processReadOnlyValues, validateTicket } = require('../../../../../../../schemas/tickets');
const { checkTicketTemplateExists } = require('../../../settings');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { validateMany } = require('../../../../../../common');

const TicketsMiddleware = {};

// This will be more complex in the future
TicketsMiddleware.templateAllowedInProject = checkTicketTemplateExists;

const validateNewTicket = async (req, res, next) => {
	try {
		const ticket = req.body;
		const template = req.templateData;
		const user = getUserFromSession(req.session);

		if (template.deprecated) throw createResponseCode(templates.invalidateArguments, 'Template type has been deprecated');

		const { teamspace } = req.params;

		req.body = await validateTicket(teamspace, template, ticket);
		await processReadOnlyValues(req.body, user);
		next();
	} catch (err) {
		respond(req, res, err);
	}
};

const templateIDToParams = (req, res, next) => {
	if (req.body.type) {
		req.params.template = stringToUUID(req.body?.type);
		next();
	} else {
		respond(req, res, createResponseCode(templates.invalidArguments, 'template type must be provided'));
	}
};

TicketsMiddleware.validateNewTicket = validateMany([templateIDToParams, checkTicketTemplateExists, validateNewTicket]);

module.exports = TicketsMiddleware;
