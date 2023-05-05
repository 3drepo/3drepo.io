/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { deserialiseGroup, schema } = require('../../../../../../../schemas/tickets/tickets.groups');
const { getGroupById } = require('../../../../../../../models/tickets.groups');
const { respond } = require('../../../../../../../utils/responder');
const { validateMany } = require('../../../../../../common');

const GroupsMiddleware = {};

const groupExists = async (req, res, next) => {
	try {
		const { teamspace, project, model, ticket, group } = req.params;
		await getGroupById(teamspace, project, model, ticket, group, { _id: 1 });

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err.message));
	}
};

const validateGroup = async (req, res, next) => {
	try {
		await schema(false, true).validate(req.body);
		req.body = deserialiseGroup(req.body);

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err.message));
	}
};

GroupsMiddleware.validateUpdateGroup = validateMany([groupExists, validateGroup]);

module.exports = GroupsMiddleware;
