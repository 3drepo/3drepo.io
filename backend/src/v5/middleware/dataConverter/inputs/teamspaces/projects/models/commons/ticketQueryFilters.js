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
const { defaultQueryOperators, defaultQueryProps, queryOperators } = require('../../../../../../../models/tickets.constants');
const Yup = require('yup');
const { isEmpty } = require('../../../../../../../utils/helper/objects');
const { respond } = require('../../../../../../../utils/responder');
const { types } = require('../../../../../../../utils/helper/yup');

const TicketQueryFilters = {};

const querySchema = Yup.string()
	.test('wrapped-in-single-quote', 'Query string must start and end with a single quote', (val) => val.startsWith("'") && val.endsWith("'"))
	.test('not-empty-string', 'Query string cannot be empty', (val) => !isEmpty(val.slice(1, -1)));

const queryParamSchema = Yup.object().shape({
	propertyName: types.strings.title
		.transform((value) => {
			if (isEmpty(value)) return value;

			const propertyNameParts = value.split(':');
			if (propertyNameParts.length === 2) {
				return `modules.${propertyNameParts[0]}.${propertyNameParts[1]}`;
			}

			const propName = propertyNameParts[0];
			return propName.startsWith('$') ? propName.substring(1) : `properties.${propName}`;
		}).required(),
	operator: Yup.string().required()
		.when('propertyName', (propertyName, schema) => {
			const validOperators = Object.values(defaultQueryProps).includes(propertyName)
				? defaultQueryOperators
				: Object.values(queryOperators);

			return schema.oneOf(validOperators);
		}),
	value: Yup.mixed()
		.when('operator', (operator, schema) => {
			if (operator === queryOperators.EXISTS || operator === queryOperators.NOT_EXISTS) {
				return schema.strip();
			}

			if (operator === queryOperators.RANGE || operator === queryOperators.NOT_IN_RANGE) {
				return types.range.required();
			}

			if (operator === queryOperators.GREATER_OR_EQUAL_TO
				|| operator === queryOperators.LESSER_OR_EQUAL_TO) {
				return Yup.number().required();
			}

			return Yup.array().of(types.strings.title).required()
				.transform((v, value) => (value ? value.match(/([^",]+|"(.*?)")/g)
					.map((val) => val.replace(/^"|"$/g, '').trim()) : value));
		}),
});

TicketQueryFilters.validateQueryString = async (req, res, next) => {
	if (req.query.query) {
		try {
			const queryString = await querySchema.validate(decodeURIComponent(req.query.query));
			const queryParams = queryString.slice(1, -1).split('&');
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
