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

const RulesConstants = {};

const COMMON_OPERATORS = {
	IS: { name: 'IS', minValues: 1 },
	CONTAINS: { name: 'CONTAINS', minValues: 1 },
	REGEX: { name: 'REGEX', minValues: 1, maxValues: 1 },
};

RulesConstants.FIELD_NAME_OPERATORS = {
	...COMMON_OPERATORS,
	STARTS_WITH: { name: 'STARTS_WITH', minValues: 1 },
	ENDS_WITH: { name: 'ENDS_WITH', minValues: 1 },
};

RulesConstants.FIELD_VALUE_OPERATORS = {
	...COMMON_OPERATORS,
	IS_NOT: { name: 'IS_NOT', minValues: 1 },
	NOT_CONTAINS: { name: 'NOT_CONTAINS', minValues: 1 },
	IS_EMPTY: { name: 'IS_EMPTY', minValues: 0, maxValues: 0 },
	IS_NOT_EMPTY: { name: 'IS_NOT_EMPTY', minValues: 0, maxValues: 0 },
	EQUALS: { name: 'EQUALS', minValues: 1, isNumber: true },
	NOT_EQUALS: { name: 'NOT_EQUALS', minValues: 1, isNumber: true },
	GT: { name: 'GT', minValues: 1, isNumber: true },
	GTE: { name: 'GTE', minValues: 1, isNumber: true },
	LT: { name: 'LT', minValues: 1, isNumber: true },
	LTE: { name: 'LTE', minValues: 1, isNumber: true },
	IN_RANGE: { name: 'IN_RANGE', minValues: 2, isNumber: true },
	NOT_IN_RANGE: { name: 'NOT_IN_RANGE', minValues: 2, isNumber: true },
};

RulesConstants.OPERATOR_SYMBOL = {
	[RulesConstants.FIELD_VALUE_OPERATORS.IS.name]: ':',
	[RulesConstants.FIELD_VALUE_OPERATORS.IS_NOT.name]: ': !',
	[RulesConstants.FIELD_VALUE_OPERATORS.CONTAINS.name]: ': *',
	[RulesConstants.FIELD_VALUE_OPERATORS.NOT_CONTAINS.name]: ': ! *',
	[RulesConstants.FIELD_VALUE_OPERATORS.REGEX.name]: ':',
	[RulesConstants.FIELD_VALUE_OPERATORS.EQUALS.name]: '=',
	[RulesConstants.FIELD_VALUE_OPERATORS.NOT_EQUALS.name]: '= !',
	[RulesConstants.FIELD_VALUE_OPERATORS.GT.name]: '>',
	[RulesConstants.FIELD_VALUE_OPERATORS.GTE.name]: '>=',
	[RulesConstants.FIELD_VALUE_OPERATORS.LT.name]: '<',
	[RulesConstants.FIELD_VALUE_OPERATORS.LTE.name]: '<=',
	[RulesConstants.FIELD_VALUE_OPERATORS.IN_RANGE.name]: '',
	[RulesConstants.FIELD_VALUE_OPERATORS.NOT_IN_RANGE.name]: '!',
};

RulesConstants.OPERATIONS_TYPES = {
	[RulesConstants.FIELD_VALUE_OPERATORS.IS_NOT_EMPTY.name]: 'field',
	[RulesConstants.FIELD_VALUE_OPERATORS.IS_EMPTY.name]: 'field',
	[RulesConstants.FIELD_VALUE_OPERATORS.IS.name]: 'text',
	[RulesConstants.FIELD_VALUE_OPERATORS.IS_NOT.name]: 'text',
	[RulesConstants.FIELD_VALUE_OPERATORS.CONTAINS.name]: 'text',
	[RulesConstants.FIELD_VALUE_OPERATORS.NOT_CONTAINS.name]: 'text',
	[RulesConstants.FIELD_VALUE_OPERATORS.REGEX.name]: 'regex',
	[RulesConstants.FIELD_VALUE_OPERATORS.EQUALS.name]: 'number',
	[RulesConstants.FIELD_VALUE_OPERATORS.NOT_EQUALS.name]: 'number',
	[RulesConstants.FIELD_VALUE_OPERATORS.GT.name]: 'numberComparison',
	[RulesConstants.FIELD_VALUE_OPERATORS.GTE.name]: 'numberComparison',
	[RulesConstants.FIELD_VALUE_OPERATORS.LT.name]: 'numberComparison',
	[RulesConstants.FIELD_VALUE_OPERATORS.LTE.name]: 'numberComparison',
	[RulesConstants.FIELD_VALUE_OPERATORS.IN_RANGE.name]: 'numberRange',
	[RulesConstants.FIELD_VALUE_OPERATORS.NOT_IN_RANGE.name]: 'numberRange',
};

module.exports = RulesConstants;
