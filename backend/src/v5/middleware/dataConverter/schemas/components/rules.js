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

const { isNumber, isString } = require('../../../../utils/helper/typeCheck');
const Yup = require('yup');

const operators = {
	IS_EMPTY: 0,
	IS_NOT_EMPTY: 0,
	IS: 1,
	IS_NOT: 1,
	CONTAINS: 1,
	NOT_CONTAINS: 1,
	REGEX: 1,
	EQUALS: 1,
	NOT_EQUALS: 1,
	GT: 1,
	GTE: 1,
	LT: 1,
	LTE: 1,
	IN_RANGE: 2,
	NOT_IN_RANGE: 2,
};

const ruleParametersTypeCheck = (operator, values) => {
	switch (operator) {
	case 'IS':
	case 'IS_NOT':
	case 'CONTAINS':
	case 'NOT_CONTAINS':
	case 'REGEX':
		return values.every(isString);
	case 'EQUALS':
	case 'NOT_EQUALS':
	case 'GT':
	case 'GTE':
	case 'LT':
	case 'LTE':
		return values.every(isNumber);
	default:
		// range checks
		return values.length % 2 === 0 && values.every(isNumber);
	}
};

const numberOperator = (operator) => {
	switch (operator) {
	case 'EQUALS':
	case 'NOT_EQUALS':
	case 'GT':
	case 'GTE':
	case 'LT':
	case 'LTE':
	case 'IN_RANGE':
	case 'NOT_IN_RANGE':
		return true;
	default:
		return false;
	}
};

const Rules = {};

const ruleSchema = Yup.object().shape({
	field: Yup.string().required().min(1),
	operator: Yup.string().uppercase().oneOf(Object.keys(operators)).required(),
	values: Yup.array().when('operator', {
		is: numberOperator,
		then: Yup.array().of(Yup.number()).min(1).required(),
		otherwise: Yup.array().of(Yup.string().min(1)).optional(),
	}),
})
	.noUnknown()
	.transform((value) => {
		const nParams = operators[value.operator];
		const res = { ...value };
		if (nParams === 0) {
			delete res.values;
		}
		return res;
	})
	.test(
		'Rules validation', 'values field is not valid with the operator selected',
		(value) => {
			const nParams = operators[value.operator];
			const arrLength = (value.values || []).length;
			return (nParams === 0 && arrLength === 0)
				|| (nParams <= arrLength && ruleParametersTypeCheck(value.operator, value.values));
		},
	);

Rules.schema = Yup.array().of(ruleSchema).min(1).test(
	'Rules validation', 'the same field cannot be used in more than one rule',
	(rules) => {
		const keys = new Set(rules.map(({ field }) =>
			field));
		return rules.length === keys.size;
	},
);
module.exports = Rules;
