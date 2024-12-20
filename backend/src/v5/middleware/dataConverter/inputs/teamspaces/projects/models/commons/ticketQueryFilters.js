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
const Yup = require('yup');
const { isEmpty } = require('../../../../../../../utils/helper/objects');
const { queryOperators } = require('../../../../../../../models/tickets.constants');
const { respond } = require('../../../../../../../utils/responder');
const { types } = require('../../../../../../../utils/helper/yup');

const TicketQueryFilters = {};

const querySchema = Yup.string()
	.test('wrapped-in-single-quote', 'Query string must start and end with a single quote', (val) => val.startsWith("'") && val.endsWith("'"))
	.test('not-empty-string', 'Query string cannot be empty', (val) => !isEmpty(val.slice(1, -1)));

const queryParamSchema = Yup.object().shape({
	propertyName: types.strings.title.transform((value) => {
		const propertyNameParts = value.split(':');
		if (propertyNameParts.length === 2) {
			return `modules.${propertyNameParts[0]}.${propertyNameParts[1]}`;
		}
		const propName = propertyNameParts[0];
		return propName.startsWith('$') ? propName.substring(1) : `properties.${propName}`;
	}).required(),
	operator: Yup.string().oneOf(Object.values(queryOperators)).required(),
	value: Yup.mixed()
		.when('operator', {
			is: (operator) => operator === queryOperators.EQUALS || operator === queryOperators.NOT_EQUALS
                || operator === queryOperators.CONTAINS || operator === queryOperators.NOT_CONTAINS,
			then: Yup.array().of(types.strings.title).required()
				.transform((v, value) => (value ? value.match(/([^",]+|"(.*?)")/g).map((val) => val.replace(/^"|"$/g, '').trim()) : value)),
		})
		.when('operator', {
			is: (operator) => operator === queryOperators.RANGE || operator === queryOperators.NOT_IN_RANGE,
			then: types.range.required(),
		})
		.when('operator', {
			is: (operator) => operator === queryOperators.GREATER_OR_EQUAL_TO
                || operator === queryOperators.LESSER_OR_EQUAL_TO,
			then: Yup.number().required(),
		}),
});

TicketQueryFilters.validateQueryString = async (req, res, next) => {
	if (req.query.query) {
		try {
			const queryString = await querySchema.validate(decodeURIComponent(req.query.query));
			const queryParams = queryString.replace(/^'(.*)'$/, '$1').split('&');
			const queryFilters = [];

			await Promise.all(queryParams.map(async (param) => {
				const queryParts = param.split('::');
				const query = { propertyName: queryParts[0], operator: queryParts[1], value: queryParts[2] };
				try {
					const validatedQuery = await queryParamSchema.validate(query);
					queryFilters.push(validatedQuery);
				} catch (err) {
					throw createResponseCode(templates.invalidArguments, `Error at '${query.propertyName}' query filter: ${err.message}`);
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
