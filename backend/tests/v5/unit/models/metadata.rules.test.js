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

const { OPERATORS } = require('../../../../src/v5/models/groups.constants');
const { src } = require('../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../helper/services');

const MetaRules = require(`${src}/models/metadata.rules`);
const { templates } = require(`${src}/utils/responseCodes`);

const generateRule = (field, operator, values) => ({ field, operator, values });

const createQuery = (fieldQuery, valueQuery) => ({
	metadata: { $elemMatch: { key: fieldQuery, ...(valueQuery ? { value: valueQuery } : {}) } } });

const getValueTestCases = () => {
	const fieldValues = [generateRandomString(), generateRandomString()];
	const field = { values: fieldValues, operator: OPERATORS.IS.name };
	const fieldQuery = { $in: fieldValues };
	const valueTestCases = [
		{
			desc: 'value operator IS_NOT_EMPTY with no operands',
			data: generateRule(field, OPERATORS.IS_NOT_EMPTY.name),
			query: createQuery(fieldQuery),
		},
		{
			desc: 'value operator IS_NOT_EMPTY with operands',
			data: generateRule(field, OPERATORS.IS_NOT_EMPTY.name, [1, 2, 3, 4]),
			query: createQuery(fieldQuery),
		},
		{
			desc: 'value operator IS with 1 operand',
			data: generateRule(field, OPERATORS.IS.name, ['abc']),
			query: createQuery(fieldQuery, 'abc'),
		},
		{
			desc: 'value operator IS with 1+ operand',
			data: generateRule(field, OPERATORS.IS.name, ['abc', 'a']),
			query: createQuery(fieldQuery, { $in: ['abc', 'a'] }),
		},
		{
			desc: 'value operator CONTAINS with 1 operand',
			data: generateRule(field, OPERATORS.CONTAINS.name, ['abc']),
			query: createQuery(fieldQuery, { $regex: new RegExp('abc'), $options: 'i' }),
		},
		{
			desc: 'value operator CONTAINS with 1+ operand',
			data: generateRule(field, OPERATORS.CONTAINS.name, ['abc', 'def']),
			query: createQuery(fieldQuery, { $regex: new RegExp('abc|def'), $options: 'i' }),
		},
		{
			desc: 'value operator REGEX with 1 operand',
			data: generateRule(field, OPERATORS.REGEX.name, ['$(\\w)+']),
			query: createQuery(fieldQuery, { $regex: new RegExp('($(\\w)+)') }),
		},
		{
			desc: 'value operator REGEX with 1+ operand',
			data: generateRule(field, OPERATORS.REGEX.name, ['(\\w)+$', '(a|b)*']),
			query: createQuery(fieldQuery, { $regex: new RegExp('((\\w)+$)|((a|b)*)') }),
		},
		{
			desc: 'value operator EQUALS with 1 operand',
			data: generateRule(field, OPERATORS.EQUALS.name, [1000]),
			query: createQuery(fieldQuery, 1000),
		},
		{
			desc: 'value operator EQUALS with 1+ operand',
			data: generateRule(field, OPERATORS.EQUALS.name, [1000, 2000]),
			query: createQuery(fieldQuery, { $in: [1000, 2000] }),
		},
		{
			desc: 'value operator GT with 1 operand',
			data: generateRule(field, OPERATORS.GT.name, [1000]),
			query: createQuery(fieldQuery, { $gt: 1000 }),
		},
		{
			desc: 'value operator GT with 1+ operand',
			data: generateRule(field, OPERATORS.GT.name, [1000, 2000]),
			query: createQuery(fieldQuery, { $gt: 1000 }),
		},
		{
			desc: 'value operator GTE with 1 operand',
			data: generateRule(field, OPERATORS.GTE.name, [1000]),
			query: createQuery(fieldQuery, { $gte: 1000 }),
		},
		{
			desc: 'value operator GTE with 1+ operand',
			data: generateRule(field, OPERATORS.GTE.name, [1000, 2000]),
			query: createQuery(fieldQuery, { $gte: 1000 }),
		},
		{
			desc: 'value operator LT with 1 operand',
			data: generateRule(field, OPERATORS.LT.name, [1000]),
			query: createQuery(fieldQuery, { $lt: 1000 }),
		},
		{
			desc: 'value operator LT with 1+ operand',
			data: generateRule(field, OPERATORS.LT.name, [1000, 2000]),
			query: createQuery(fieldQuery, { $lt: 2000 }),
		},
		{
			desc: 'value operator LTE with 1 operand',
			data: generateRule(field, OPERATORS.LTE.name, [1000]),
			query: createQuery(fieldQuery, { $lte: 1000 }),
		},
		{
			desc: 'value operator LTE with 1+ operand',
			data: generateRule(field, OPERATORS.LTE.name, [1000, 2000]),
			query: createQuery(fieldQuery, { $lte: 2000 }),
		},
		{
			desc: 'value operator IN_RANGE with 1 set of operands',
			data: generateRule(field, OPERATORS.IN_RANGE.name, [1000, 2000]),
			query: createQuery(fieldQuery, { $gte: 1000, $lte: 2000 }),
		},

		{
			desc: 'value operator IN_RANGE with 1+ sets of operands',
			data: generateRule(field, OPERATORS.IN_RANGE.name, [1000, 2000, 200, 100]),
			query: { $or: [
				createQuery(fieldQuery, { $gte: 1000, $lte: 2000 }),
				createQuery(fieldQuery, { $gte: 100, $lte: 200 }),
			] },
		},
		{
			desc: 'unknown value operator',
			data: generateRule(field, 'INDSFDSF', [1000]),
		},
	];

	return valueTestCases;
};

const getFieldTestCases = () => {
	const fieldValues = [generateRandomString(), generateRandomString()];
	const values = [generateRandomString(), generateRandomString()];
	const fieldTestCases = [
		{
			desc: 'field operator IS with 1 operand',
			data: generateRule({ operator: OPERATORS.IS.name, values: [fieldValues[0]] }, OPERATORS.IS.name, values),
			query: createQuery(fieldValues[0], { $in: values }),
		},
		{
			desc: 'field operator IS with 1+ operands',
			data: generateRule({ operator: OPERATORS.IS.name, values: fieldValues }, OPERATORS.IS.name, values),
			query: createQuery({ $in: fieldValues }, { $in: values }),
		},
		{
			desc: 'field operator CONTAINS with 1 operand',
			data: generateRule({ operator: OPERATORS.CONTAINS.name, values: [fieldValues[0]] },
				OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(fieldValues[0]), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator CONTAINS with 1+ operands',
			data: generateRule({ operator: OPERATORS.CONTAINS.name, values: fieldValues }, OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(fieldValues.join('|')), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator REGEX with 1 operand',
			data: generateRule({ operator: OPERATORS.REGEX.name, values: ['(\\w)+$'] }, OPERATORS.IS.name, values),
			query: createQuery({ $regex: new RegExp('((\\w)+$)') }, { $in: values }),
		},
		{
			desc: 'field operator REGEX with 1+ operands',
			data: generateRule({ operator: OPERATORS.REGEX.name, values: ['(\\w)+$', `(${fieldValues.join('|')})*`] }, OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(`((\\w)+$)|((${fieldValues.join('|')})*)`) }, { $in: values }),
		},
		{
			desc: 'field operator STARTS_WITH with 1 operand',
			data: generateRule({ operator: OPERATORS.STARTS_WITH.name, values: [fieldValues[0]] },
				OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(`^(${fieldValues[0]})`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator STARTS_WITH with 1+ operands',
			data: generateRule({ operator: OPERATORS.STARTS_WITH.name, values: fieldValues },
				OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(`^(${fieldValues.join('|')})`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator ENDS_WITH with 1 operand',
			data: generateRule({ operator: OPERATORS.ENDS_WITH.name, values: [fieldValues[0]] },
				OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(`.*(${fieldValues[0]})$`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator ENDS_WITH with 1+ operands',
			data: generateRule({ operator: OPERATORS.ENDS_WITH.name, values: fieldValues },
				OPERATORS.IS.name, values),
			// eslint-disable-next-line security/detect-non-literal-regexp
			query: createQuery({ $regex: new RegExp(`.*(${fieldValues.join('|')})$`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field unknown operator',
			data: generateRule({ operator: generateRandomString(), values: fieldValues },
				OPERATORS.IS.name, values),
		},
	];

	return fieldTestCases;
};

const testToQuery = () => {
	const testCases = [...getFieldTestCases(), ...getValueTestCases()];

	describe.each(
		testCases.map(({ desc, data, query }) => [desc, data, query]),
	)('Smart rule to query', (desc, data, query) => {
		test(`${desc} ${query ? ' should convert to the expected query' : 'should throw invalid arguments'}`, () => {
			if (query) {
				expect(MetaRules.toQuery(data)).toEqual(query);
			} else {
				try {
					expect(MetaRules.toQuery(data)).toEqual(query);
				} catch (err) {
					expect(err.code).toEqual(templates.invalidArguments.code);
				}
			}
		});
	});
};

const testGenerateQueriesFromRules = () => {
	test('Should identify positive/negative rules correctly and convert them to mongo queries', () => {
		const fieldValues = [generateRandomString(), generateRandomString()];
		const field = { values: fieldValues, operator: OPERATORS.IS.name };

		const posRules = [
			generateRule(field, OPERATORS.IS_NOT_EMPTY.name),
			generateRule(field, OPERATORS.IS.name, [generateRandomString()]),
			generateRule(field, OPERATORS.CONTAINS.name, [generateRandomString()]),
			generateRule(field, OPERATORS.REGEX.name, [generateRandomString()]),
			generateRule(field, OPERATORS.EQUALS.name, [generateRandomNumber()]),
			generateRule(field, OPERATORS.GT.name, [generateRandomNumber()]),
			generateRule(field, OPERATORS.GTE.name, [generateRandomNumber()]),
			generateRule(field, OPERATORS.LT.name, [generateRandomNumber()]),
			generateRule(field, OPERATORS.LTE.name, [generateRandomNumber()]),
			generateRule(field, OPERATORS.IN_RANGE.name, [0, 199]),

		];

		const negRules = [
			generateRule(field, OPERATORS.IS_NOT.name, [generateRandomString()]),
			generateRule(field, OPERATORS.NOT_CONTAINS.name, [generateRandomString()]),
			generateRule(field, OPERATORS.NOT_EQUALS.name, [generateRandomNumber()]),
			generateRule(field, OPERATORS.NOT_IN_RANGE.name, [2, 255]),
		];

		const emptyRule = generateRule(field, OPERATORS.IS_EMPTY.name);

		const expectedData = {
			positives: posRules.map(MetaRules.toQuery),
		};

		expectedData.negatives = negRules.map((rule) => {
			expectedData.positives.push(MetaRules.toQuery({ field: rule.field,
				operator: OPERATORS.IS_NOT_EMPTY.name }));
			return MetaRules.toQuery(rule);
		});

		expectedData.negatives.push(MetaRules.toQuery(emptyRule));

		const rules = [...posRules, ...negRules, emptyRule];
		expect(MetaRules.generateQueriesFromRules(rules)).toEqual(expectedData);
	});
};

describe(determineTestGroup(__filename), () => {
	testToQuery();
	testGenerateQueriesFromRules();
});
