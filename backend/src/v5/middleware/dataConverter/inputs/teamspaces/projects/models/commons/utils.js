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
const { propTypes } = require('../../../../../../../schemas/tickets/templates.constants');
const { respond } = require('../../../../../../../utils/responder');
const { types } = require('../../../../../../../utils/helper/yup');

const Utils = {};

const queryOperators = {
	EXISTS: { symbol: 'ex' },
	NOT_EXISTS: { symbol: 'nex' },
	EQUALS: { symbol: 'eq', allowMultipleValues: true },
	NOT_EQUALS: { symbol: 'neq', allowMultipleValues: true },
	CONTAINS: { symbol: 'ss', allowMultipleValues: true, supportedTypes: [propTypes.TEXT, propTypes.LONG_TEXT] },
	NOT_CONTAINS: { symbol: 'nss', allowMultipleValues: true, supportedTypes: [propTypes.TEXT, propTypes.LONG_TEXT] },
	RANGE: { symbol: 'rng', allowMultipleValues: true, supportedTypes: [propTypes.NUMBER, propTypes.DATE] },
	NOT_IN_RANGE: { symbol: 'nrng', allowMultipleValues: true, supportedTypes: [propTypes.NUMBER, propTypes.DATE] },
	GREATER_OR_EQUAL: { symbol: 'gte', allowMultipleValues: false, supportedTypes: [propTypes.NUMBER, propTypes.DATE] },
	LESSER_OR_EQUAL: { symbol: 'lte', allowMultipleValues: false, supportedTypes: [propTypes.NUMBER, propTypes.DATE] },
};

const operatorToValidator = (operator) => {
	switch (operator) {
	case 'ex':
	case 'nex':
		return types.strings.title;
	case 'eq':
	case 'neq':
	case 'ss':
	case 'nss':
		return Yup.lazy((val) => (Array.isArray(val) ? Yup.array().of(Yup.string()) : Yup.string()));
	case 'rng':
	case 'nrng':
		return types.range;
	default:
		return undefined;
	}
};

const parseQueryString = async (query) => {
	const params = query.replace(/^['"]|['"]$/g, '').split('&');
	const parsedParams = [];

	await Promise.all(params.map(async (param) => {
		const parts = param.split('::');

		if (parts.length !== 3) {
			throw createResponseCode(templates.invalidArguments, `Invalid query format: ${param}`);
		}

		const propertyName = parts[0];
		const operator = parts[1];
		const value = parts[2];

		const validator = operatorToValidator(operator);

		if (!validator) {
			throw createResponseCode(templates.invalidArguments, `Invalid query format: ${param}`);
		}

		const formattedValue = await validator.validate(value);
		parsedParams.push({ propertyName, value: formattedValue, operator });
	}));

	return parsedParams;
};

Utils.validateListSortAndFilter = async (req, res, next) => {
	req.listOptions = {};
	if (req.query) {
		const schema = Yup.object({
			filters: Yup.array().of(Yup.string().min(1)).min(1).transform((v, val) => (val?.length ? val.split(',') : v))
				.default(undefined),
			sortBy: Yup.string().min(1),
			sortDesc: Yup.boolean().when('sortBy', {
				is: (val) => val === undefined,
				then: (s) => s.strip(),
				otherwise: (s) => s.default(true),
			}),
			updatedSince: types.date,
			limit: Yup.number().min(1),
			skip: Yup.number().min(0).default(0),
		});
		try {
			req.listOptions = await schema.validate(req.query, { stripUnknown: true });
			req.listOptions.queryFilters = await parseQueryString(req.query.query);
		} catch (err) {
			respond(req, res, createResponseCode(templates.invalidArguments, err.message));
			return;
		}
	}

	await next();
};

module.exports = Utils;
