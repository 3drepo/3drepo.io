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

const { FIELD_NAME_OPERATORS, FIELD_VALUE_OPERATORS } = require('../models/metadata.rules.constants');
const Yup = require('yup');
const { isString } = require('../utils/helper/typeCheck');

const Rules = {};

const formulateValueSchema = (operator) => {
	if (!operator || operator.maxValues === 0) {
		return Yup.mixed().strip();
	}

	const { minValues, maxValues, isNumber } = operator;

	let schema = Yup.array()
		.of(isNumber ? Yup.number() : Yup.string())
		.required()
		.min(minValues);

	if (maxValues) {
		schema = schema.max(maxValues);
	}

	if (minValues === 2) {
		schema = schema.test('is-even-number', 'values array must have an even number of items', (values) => values.length % 2 === 0);
	}

	return schema;
};

const ruleSchema = Yup.object().shape({
	name: Yup.string().min(1).required(),
	field: Yup.object().shape({
		operator: Yup.string().uppercase().oneOf(Object.keys(FIELD_NAME_OPERATORS)).required(),
		values: Yup.mixed()
			.when('operator', (operator) => formulateValueSchema(FIELD_NAME_OPERATORS[operator])),
	}).transform((val, oldVal) => (isString(oldVal)
		? { operator: FIELD_NAME_OPERATORS.IS.name, values: [oldVal] } : val)).required(),
	operator: Yup.string().uppercase().oneOf(Object.keys(FIELD_VALUE_OPERATORS)).required(),
	values: Yup.mixed()
		.when('operator', (operator) => formulateValueSchema(FIELD_VALUE_OPERATORS[operator])),
})
	.noUnknown();

Rules.castSchema = (rule) => ruleSchema.cast(rule);

Rules.schema = Yup.array().of(ruleSchema).min(1);

module.exports = Rules;
