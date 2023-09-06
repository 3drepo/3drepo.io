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
	if (operator.isRange) {
		return values.length % 2 === 0 && values.every(isNumber);
	} else if (operator.isNumber) {
		return values.every(isNumber);
	} else {
		return values.every(isString);
	}
};

const Rules = {};

const validateValuesArray = (operatorName, values) => {
	const operator = OPERATORS[operatorName];
	if(operator){
		const minValues= operator.minValues;
		const maxValues = operator.maxValues;
	
		const arrLength = (values || []).length;
	
		if (maxValues === 0 && arrLength === 0) {
			return true;
		}
	
		return arrLength >= minValues && (!maxValues || arrLength <= maxValues) && 
				ruleParametersTypeCheck(operator, values);
	}	

	return true;
};

const ruleSchema = Yup.object().shape({
	name: Yup.string().min(1).required(),
	field: Yup.object().shape({
		operator: Yup.string().uppercase().oneOf(Object.keys(FIELD_NAME_OPERATORS)).required(),
		values: Yup.array().of(Yup.string().min(1)).required(),
	}).transform((val, oldVal) => {		
		return isString(oldVal) ? { operator: OPERATORS.IS.name, values: [oldVal] } : val;
	}).required(),
	operator: Yup.string().uppercase().oneOf(Object.keys(FIELD_VALUE_OPERATORS)).required(),
	values: Yup.array().when('operator', {
		is: (operator) => FIELD_VALUE_OPERATORS[operator]?.isNumber,
		then: Yup.array().of(Yup.number()).min(1).required(),
		otherwise: Yup.array().of(Yup.string().min(1)).optional(),
	}),
})
	.noUnknown()
	.transform((value) => {
		const res = { ...value };
		const operator = OPERATORS[value.operator];
		if (operator?.maxValues === 0) {
			delete res.values;
		}
		return res;
	})
	.test('Rules validation', 'values field is not valid with the operator selected',
		(value) => validateValuesArray(value.operator, value.values))
	.test('Field rules validation', 'field values field is not valid with the field operator selected',
		(value) => validateValuesArray(value.field?.operator, value.field?.values));


Rules.castSchema = (rule) => ruleSchema.cast(rule);

Rules.schema = Yup.array().of(ruleSchema).min(1);

module.exports = Rules;
