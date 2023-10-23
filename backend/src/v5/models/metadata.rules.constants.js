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

RulesConstants.opTypes = {
	FIELD: 0,
	TEXT: 1,
	REGEX: 2,
	// entries below this point are assumed to be numbers
	NUMBER: 3,
	NUMBER_COMP: 4,
	NUMBER_RANGE: 5,

};

const opBuilder = (name, minValues, maxValues, type, symbol) => ({
	name,
	minValues,
	maxValues,
	type,
	isNumber: type >= RulesConstants.opTypes.NUMBER,
	symbol,

});

const commonOperators = {
	IS: opBuilder('IS', 1, undefined, RulesConstants.opTypes.TEXT, ':'),
	CONTAINS: opBuilder('CONTAINS', 1, undefined, RulesConstants.opTypes.TEXT, ': *'),
	REGEX: opBuilder('REGEX', 1, 1, RulesConstants.opTypes.REGEX, ':'),
};

RulesConstants.fieldOperators = {
	...commonOperators,
	STARTS_WITH: opBuilder('STARTS_WITH', 1, undefined, RulesConstants.opTypes.TEXT),
	ENDS_WITH: opBuilder('ENDS_WITH', 1, undefined, RulesConstants.opTypes.TEXT),
};

RulesConstants.valueOperators = {
	...commonOperators,
	IS_NOT: opBuilder('IS_NOT', 1, undefined, RulesConstants.opTypes.TEXT, ': !'),
	NOT_CONTAINS: opBuilder('NOT_CONTAINS', 1, undefined, RulesConstants.opTypes.TEXT, ': ! *'),
	IS_EMPTY: opBuilder('IS_EMPTY', 0, 0, RulesConstants.opTypes.FIELD),
	IS_NOT_EMPTY: opBuilder('IS_NOT_EMPTY', 0, 0, RulesConstants.opTypes.FIELD),
	EQUALS: opBuilder('EQUALS', 1, undefined, RulesConstants.opTypes.NUMBER, '='),
	NOT_EQUALS: opBuilder('NOT_EQUALS', 1, undefined, RulesConstants.opTypes.NUMBER, '='),
	GT: opBuilder('GT', 1, undefined, RulesConstants.opTypes.NUMBER_COMP, '>'),
	GTE: opBuilder('GTE', 1, undefined, RulesConstants.opTypes.NUMBER_COMP, '>='),
	LT: opBuilder('LT', 1, undefined, RulesConstants.opTypes.NUMBER_COMP, '<'),
	LTE: opBuilder('LTE', 1, undefined, RulesConstants.opTypes.NUMBER_COMP, '<='),
	IN_RANGE: opBuilder('IN_RANGE', 2, undefined, RulesConstants.opTypes.NUMBER_RANGE, ''),
	NOT_IN_RANGE: opBuilder('NOT_IN_RANGE', 2, undefined, RulesConstants.opTypes.NUMBER_RANGE, '!'),
};

module.exports = RulesConstants;
