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

const { FIELD_NAME_OPERATORS, FIELD_VALUE_OPERATORS, OPERATORS } = require('../models/groups.constants');
const { isNumber, isString } = require('../utils/helper/typeCheck');
const Yup = require('yup');

const ruleParametersTypeCheck = (operator, values) => {
	switch (operator) {
	case FIELD_VALUE_OPERATORS.IS.name:
	case FIELD_VALUE_OPERATORS.IS_NOT.name:
	case FIELD_VALUE_OPERATORS.CONTAINS.name:
	case FIELD_VALUE_OPERATORS.NOT_CONTAINS.name:
	case FIELD_VALUE_OPERATORS.REGEX.name:
	case FIELD_NAME_OPERATORS.STARTS_WITH.name:
	case FIELD_NAME_OPERATORS.ENDS_WITH.name:
		return values.every(isString);
	case FIELD_VALUE_OPERATORS.EQUALS.name:
	case FIELD_VALUE_OPERATORS.NOT_EQUALS.name:
	case FIELD_VALUE_OPERATORS.GT.name:
	case FIELD_VALUE_OPERATORS.GTE.name:
	case FIELD_VALUE_OPERATORS.LT.name:
	case FIELD_VALUE_OPERATORS.LTE.name:
		return values.every(isNumber);
	default:
		// range checks
		return values.length % 2 === 0 && values.every(isNumber);
	}
};

const Rules = {};

const validateValuesArray = (operators, operator, values) => {
	const nParams = operators[operator].valuesNumber;
	const arrLength = (values || []).length;

	if (nParams === 0 && arrLength === 0) {
		return true;
	}

	return (nParams <= arrLength) && ruleParametersTypeCheck(operator, values);
};

Rules.convertFieldToObject = (rule) => ({
	...rule,
	field: isString(rule.field) ? { operator: OPERATORS.IS.name, values: [rule.field] } : rule.field,
});

const ruleSchema = Yup.object().shape({
	name: Yup.string().min(1).required(),
	field: Yup.object().shape({
		operator: Yup.string().uppercase().oneOf(Object.keys(FIELD_NAME_OPERATORS)).required(),
		values: Yup.array().of(Yup.string().min(1)).required(),
	}).required(),
	operator: Yup.string().uppercase().oneOf(Object.keys(FIELD_VALUE_OPERATORS)).required(),
	values: Yup.array().when('operator', {
		is: (operator) => FIELD_VALUE_OPERATORS[operator].isNumber,
		then: Yup.array().of(Yup.number()).min(1).required(),
		otherwise: Yup.array().of(Yup.string().min(1)).optional(),
	}),
})
	.noUnknown()
	.transform((value) => {
		const nParams = FIELD_VALUE_OPERATORS[value.operator].valuesNumber;
		const res = { ...value };
		if (nParams === 0) {
			delete res.values;
		}
		return res;
	})
	.transform(Rules.convertFieldToObject)
	.test('Rules validation', 'values field is not valid with the operator selected',
		(value) => validateValuesArray(FIELD_VALUE_OPERATORS, value.operator, value.values))
	.test('Field rules validation', 'field values field is not valid with the field operator selected',
		(value) => validateValuesArray(FIELD_NAME_OPERATORS, value.field.operator, value.field.values));

Rules.schema = Yup.array().of(ruleSchema).min(1);

module.exports = Rules;
