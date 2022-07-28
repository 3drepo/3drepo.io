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

const { generateFullSchema } = require('../../../../../../../schemas/tickets/templates');
const { respond } = require('../../../../../../../utils/responder');
const { serialiseTicketSchema } = require('../../../../common/tickets.templates');
const { templates } = require('../../../../../../../utils/responseCodes');

const Tickets = {};

Tickets.serialiseFullTicketTemplate = (req, res) => {
	try {
		const { templateData, query } = req;
		const showDeprecated = query?.showDeprecated === 'true';
		const fullTemplate = generateFullSchema(templateData);

		respond(req, res, templates.ok, serialiseTicketSchema(fullTemplate, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

module.exports = Tickets;
