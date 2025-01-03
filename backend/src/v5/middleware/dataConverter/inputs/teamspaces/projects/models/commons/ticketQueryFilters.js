/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const { queryParamSchema, querySchema } = require('../../../../../../../schemas/tickets/tickets.filters');
const { respond } = require('../../../../../../../utils/responder');

const TicketQueryFilters = {};

TicketQueryFilters.validateQueryString = async (req, res, next) => {
	if (req.query.query) {
		try {
			const queryString = await querySchema.validate(decodeURIComponent(req.query.query));
			const queryParams = queryString.slice(1, -1).split('&');
			const queryFilters = [];

			await Promise.all(queryParams.map(async (param) => {
				const [propertyName, operator, value] = param.split('::');
				try {
					const validatedQuery = await queryParamSchema.validate({ propertyName, operator, value });
					queryFilters.push(validatedQuery);
				} catch (err) {
					throw createResponseCode(templates.invalidArguments, `Error at '${propertyName}' query filter: ${err.message}`);
				}
			}));

			req.listOptions.queryFilters = queryFilters;
		} catch (err) {
			respond(req, res, createResponseCode(templates.invalidArguments, err.message));
			return;
		}
	}

	await next();
};

module.exports = TicketQueryFilters;
