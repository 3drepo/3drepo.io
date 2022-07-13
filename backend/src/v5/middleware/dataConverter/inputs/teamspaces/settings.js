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

const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { getTemplateByName } = require('../../../../models/tickets.templates');
const { respond } = require('../../../../utils/responder');
const { validate } = require('../../../../schemas/tickets/templates');

const Settings = {};

Settings.validateNewTicketSchema = async (req, res, next) => {
	const { teamspace } = req.params;
	const data = req.body;

	try {
		req.body = validate(data);

		const nameExists = await getTemplateByName(teamspace, data.name, { _id: 1 })
			.then(() => true).catch(() => false);

		if (nameExists) throw new Error('Name already in use');

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Settings;
