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
const { deleteIfUndefined } = require('../../../../../../../utils/helper/objects');
const { isArray } = require('../../../../../../../utils/helper/typeCheck');
const { queryOperators } = require('../../../../../../../models/tickets.constants');
const { types } = require('../../../../../../../utils/helper/yup');

const TicketQueryFilters = {};

const operatorToSchema = (operator) => {
	switch (operator) {
	case queryOperators.EQUALS:
	case queryOperators.NOT_EQUALS:
	case queryOperators.CONTAINS:
	case queryOperators.NOT_CONTAINS:
		return Yup.array().of(types.strings.title)
			.transform((v, value) => (value ? value.match(/[^,"]+|"([^"]*)"/g).map((val) => val.replace(/"/g, '').trim()) : value))
			.test('non-array-value', 'Value must be an array', isArray);
	case queryOperators.RANGE:
	case queryOperators.NOT_IN_RANGE:
		return types.range;
	case queryOperators.GREATER_OR_EQUAL_TO:
	case queryOperators.LESSER_OR_EQUAL_TO:
		return Yup.number();
	default:
		return undefined;
	}
};

TicketQueryFilters.parseQueryString = async (query) => {
	const params = query.replace(/^['"]|['"]$/g, '').split('&');
	const parsedParams = [];

	await Promise.all(params.map(async (param) => {
		const parts = param.split('::');

		const propertyNameString = parts[0];
		if (!propertyNameString) {
			throw createResponseCode(templates.invalidArguments, `Invalid property name in query param: ${param}`);
		}

		const operator = parts[1];
		if (!Object.values(queryOperators).includes(operator)) {
			throw createResponseCode(templates.invalidArguments, `Invalid operator in query param: ${param}`);
		}

		const propertyNameParts = propertyNameString.split(':');
		let propertyName;
		if (propertyNameParts.length === 2) {
			propertyName = `modules.${propertyNameParts[0]}.${propertyNameParts[1]}`;
		} else {
			const propName = propertyNameParts[0];
			propertyName = propName.startsWith('$') ? propName.substring(1) : `properties.${propName}`;
		}

		const value = parts[2];

		try {
			const schema = operatorToSchema(operator);
			const validatedValue = await schema.validate(value);
			parsedParams.push(deleteIfUndefined({ propertyName, value: validatedValue, operator }));
		} catch {
			throw createResponseCode(templates.invalidArguments, `Invalid value in query param: ${param}`);
		}
	}));

	return parsedParams;
};

module.exports = TicketQueryFilters;
