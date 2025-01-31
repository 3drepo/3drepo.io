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

const { src } = require('../../../../../../../../helper/path');

const { queryOperators, specialQueryFields } = require(`${src}/schemas/tickets/tickets.filters`);

const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { templates } = require(`${src}/utils/responseCodes`);

const QueryFiltersMiddleware = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/ticketQueryFilters`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateQueryString = () => {
	const getQueryProp = (propertyName, operator, value) => `'${propertyName}::${operator}::${value}'`;

	const moduleName = generateRandomString();
	const propName = generateRandomString();
	const propName2 = generateRandomString();
	const stringPropValue = generateRandomString();
	const stringPropValue2 = generateRandomString();
	const numberPropValue = generateRandomNumber();
	const rangePropValue1 = [generateRandomNumber(0, 10), generateRandomNumber(11, 20)];
	const rangePropValue2 = [generateRandomNumber(30, 40), generateRandomNumber(50, 60)];

	const stringValueTests = [queryOperators.IS, queryOperators.NOT_IS, queryOperators.CONTAINS,
		queryOperators.NOT_CONTAINS]
		.flatMap((operator) => ([
			[`operator is ${operator} and a single value is provided`, getQueryProp(propName, operator, stringPropValue), true, [{ operator, propertyName: `properties.${propName}`, value: [stringPropValue] }]],
			[`operator is ${operator} and a multiple values are provided`, getQueryProp(propName, operator, `${stringPropValue},${stringPropValue2}`), true, [{ operator, propertyName: `properties.${propName}`, value: [stringPropValue, stringPropValue2] }]],
			[`operator is ${operator} and a value contains a comma`, getQueryProp(propName, operator, `${stringPropValue},"one, two"`), true, [{ operator, propertyName: `properties.${propName}`, value: [stringPropValue, 'one, two'] }]],
			[`operator is ${operator} and a single value is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, stringPropValue), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: [stringPropValue] }]],
			[`operator is ${operator} and a multiple values are provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, `${stringPropValue},${stringPropValue2}`), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: [stringPropValue, stringPropValue2] }]],
			[`operator is ${operator} and a value contains a comma (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, `${stringPropValue},"one, two"`), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: [stringPropValue, 'one, two'] }]],
		]));

	const numberValueTests = [queryOperators.GREATER_OR_EQUAL_TO, queryOperators.LESSER_OR_EQUAL_TO]
		.flatMap((operator) => ([
			[`operator is ${operator} and a non number value is provided`, getQueryProp(propName, operator, generateRandomString()), false],
			[`operator is ${operator} and a number value is provided`, getQueryProp(propName, operator, numberPropValue), true, [{ operator, propertyName: `properties.${propName}`, value: numberPropValue }]],
			[`operator is ${operator} and a non number value is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, generateRandomString()), false],
			[`operator is ${operator} and a number value is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, numberPropValue), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: numberPropValue }]],
		]));

	const rangeValueTests = [queryOperators.RANGE, queryOperators.NOT_IN_RANGE]
		.flatMap((operator) => ([
			[`operator is ${operator} and value is empty`, getQueryProp(propName, operator), false],
			[`operator is ${operator} and a non range value is provided`, getQueryProp(propName, operator, generateRandomString()), false],
			[`operator is ${operator} and range values are provided`, getQueryProp(propName, operator, `[${rangePropValue1[0]},${rangePropValue1[1]}],[${rangePropValue2[0]},${rangePropValue2[1]}]`), true, [{ operator, propertyName: `properties.${propName}`, value: [rangePropValue1, rangePropValue2] }]],
			[`operator is ${operator} and an invalid range value is provided`, getQueryProp(propName, operator, '[10,5]'), false],
			[`operator is ${operator} and a non range value is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, generateRandomString()), false],
			[`operator is ${operator} and range values are provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, `[${rangePropValue1[0]},${rangePropValue1[1]}],[${rangePropValue2[0]},${rangePropValue2[1]}]`), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: [rangePropValue1, rangePropValue2] }]],
			[`operator is ${operator} and an invalid range value is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, '[[10,5]'), false],
		]));

	const equalityValueTests = [queryOperators.EQUALS, queryOperators.NOT_EQUALS]
		.flatMap((operator) => ([
			[`operator is ${operator} and an invalid value is provided`, getQueryProp(propName, operator, `${generateRandomString()},${numberPropValue}`), false],
			[`operator is ${operator} and number values are provided`, getQueryProp(propName, operator, `${numberPropValue},${numberPropValue}`), true, [{ operator, propertyName: `properties.${propName}`, value: [`${numberPropValue}`, `${numberPropValue}`] }]],
			[`operator is ${operator} and boolean values are provided`, getQueryProp(propName, operator, 'true,false'), true, [{ operator, propertyName: `properties.${propName}`, value: ['true', 'false'] }]],
			[`operator is ${operator} and capital case boolean values are provided`, getQueryProp(propName, operator, 'True,False'), true, [{ operator, propertyName: `properties.${propName}`, value: ['True', 'False'] }]],
			[`operator is ${operator} and an invalid value is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, `${generateRandomString()},${numberPropValue}`), false],
			[`operator is ${operator} and number values are provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, `${numberPropValue},${numberPropValue}`), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: [`${numberPropValue}`, `${numberPropValue}`] }]],
			[`operator is ${operator} and boolean values are provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, 'true,false'), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: ['true', 'false'] }]],
			[`operator is ${operator} and capital case boolean values is provided (module prop)`, getQueryProp(`${moduleName}:${propName}`, operator, 'True,False'), true, [{ operator, propertyName: `modules.${moduleName}.${propName}`, value: ['True', 'False'] }]],
		]));

	describe.each([
		['query is undefined', undefined, true],
		['query string does not start with single quotes', generateRandomString(), false],
		['query string is empty', "''", false],
		['property name is empty', getQueryProp('', queryOperators.CONTAINS, stringPropValue), false],
		['property name has two colons', getQueryProp(`${generateRandomString()}:${generateRandomString()}:${generateRandomString()}`, queryOperators.EXISTS), false],
		['operator is empty', getQueryProp(generateRandomString(), '', generateRandomString()), false],
		['value is empty', getQueryProp(generateRandomString(), queryOperators.CONTAINS, ''), false],
		['title is queried and operator is invalid', getQueryProp(`$${specialQueryFields.TITLE}`, queryOperators.GREATER_OR_EQUAL_TO, generateRandomString()), false],
		['title is queried and operator is valid', getQueryProp(`$${specialQueryFields.TITLE}`, queryOperators.CONTAINS, stringPropValue), true, [{ operator: queryOperators.CONTAINS, propertyName: specialQueryFields.TITLE, value: [stringPropValue] }]],
		['ticket code is queried and operator is invalid', getQueryProp(`$${specialQueryFields.TICKET_CODE}`, queryOperators.GREATER_OR_EQUAL_TO, generateRandomString()), false],
		['ticket code is queried and operator is valid', getQueryProp(`$${specialQueryFields.TICKET_CODE}`, queryOperators.CONTAINS, stringPropValue), true, [{ operator: queryOperators.CONTAINS, propertyName: specialQueryFields.TICKET_CODE, value: [stringPropValue] }]],
		['template is queried and operator is invalid', getQueryProp(`$${specialQueryFields.TEMPLATE}`, queryOperators.GREATER_OR_EQUAL_TO, generateRandomString()), false],
		['template is queried and operator is valid', getQueryProp(`$${specialQueryFields.TEMPLATE}`, queryOperators.CONTAINS, stringPropValue), true, [{ operator: queryOperators.CONTAINS, propertyName: specialQueryFields.TEMPLATE, value: [stringPropValue] }]],
		[`operator is ${queryOperators.EXISTS}`, getQueryProp(propName, queryOperators.EXISTS, ''), true, [{ operator: queryOperators.EXISTS, propertyName: `properties.${propName}` }]],
		[`operator is ${queryOperators.NOT_EXISTS}`, getQueryProp(propName, queryOperators.NOT_EXISTS, ''), true, [{ operator: queryOperators.NOT_EXISTS, propertyName: `properties.${propName}` }]],
		['multiple properties with different operators are provided', `'${propName}::${queryOperators.IS}::${stringPropValue}&&${moduleName}:${propName2}::${queryOperators.GREATER_OR_EQUAL_TO}::${numberPropValue}'`, true, [{ operator: queryOperators.GREATER_OR_EQUAL_TO, propertyName: `modules.${moduleName}.${propName2}`, value: numberPropValue }, { operator: queryOperators.IS, propertyName: `properties.${propName}`, value: [stringPropValue] }]],
		...stringValueTests,
		...numberValueTests,
		...rangeValueTests,
		...equalityValueTests,
	])('Validate query string', (desc, query, success, expectedOutput) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const req = { query: { query }, listOptions: {} };
			const res = {};
			const next = jest.fn();

			await QueryFiltersMiddleware.validateQueryString(req, res, next);

			if (success) {
				expect(next).toHaveBeenCalledTimes(1);
				expect(req.listOptions.queryFilters).toEqual(expectedOutput);
				expect(Responder.respond).not.toHaveBeenCalled();
			} else {
				expect(next).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				const { message, ...invalidArgRes } = templates.invalidArguments;
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expect.objectContaining(invalidArgRes));
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateQueryString();
});
