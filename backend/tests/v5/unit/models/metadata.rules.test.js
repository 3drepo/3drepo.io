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

/* eslint-disable security/detect-non-literal-regexp */

const { src } = require('../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../helper/services');

const MetaRules = require(`${src}/models/metadata.rules`);
const { templates } = require(`${src}/utils/responseCodes`);

const generateRule = (field, operator, values) => ({ field, operator, values });

const createQuery = (fieldQuery, valueQuery) => ({
	metadata: { $elemMatch: { key: fieldQuery, ...(valueQuery ? { value: valueQuery } : {}) } } });

const getValueTestCases = () => {
	const fieldValues = [generateRandomString(), generateRandomString()];
	const field = { values: fieldValues, operator: 'IS' };
	const fieldQuery = { $in: fieldValues };
	const valueTestCases = [
		{
			desc: 'value operator IS_NOT_EMPTY with no operands',
			data: generateRule(field, 'IS_NOT_EMPTY'),
			query: createQuery(fieldQuery),
		},
		{
			desc: 'value operator IS_NOT_EMPTY with operands',
			data: generateRule(field, 'IS_NOT_EMPTY', [1, 2, 3, 4]),
			query: createQuery(fieldQuery),
		},
		{
			desc: 'value operator IS with 1 operand',
			data: generateRule(field, 'IS', ['abc']),
			query: createQuery(fieldQuery, 'abc'),
		},
		{
			desc: 'value operator IS with 1+ operand',
			data: generateRule(field, 'IS', ['abc', 'a']),
			query: createQuery(fieldQuery, { $in: ['abc', 'a'] }),
		},
		{
			desc: 'value operator CONTAINS with 1 operand',
			data: generateRule(field, 'CONTAINS', ['abc']),
			query: createQuery(fieldQuery, { $regex: new RegExp('abc'), $options: 'i' }),
		},
		{
			desc: 'value operator CONTAINS with 1+ operand',
			data: generateRule(field, 'CONTAINS', ['abc', 'def']),
			query: createQuery(fieldQuery, { $regex: new RegExp('abc|def'), $options: 'i' }),
		},
		{
			desc: 'value operator REGEX with 1 operand',
			data: generateRule(field, 'REGEX', ['$(\\w)+']),
			query: createQuery(fieldQuery, { $regex: new RegExp('($(\\w)+)') }),
		},
		{
			desc: 'value operator REGEX with 1+ operand',
			data: generateRule(field, 'REGEX', ['(\\w)+$', '(a|b)*']),
			query: createQuery(fieldQuery, { $regex: new RegExp('((\\w)+$)|((a|b)*)') }),
		},
		{
			desc: 'value operator EQUALS with 1 operand',
			data: generateRule(field, 'EQUALS', [1000]),
			query: createQuery(fieldQuery, 1000),
		},
		{
			desc: 'value operator EQUALS with 1+ operand',
			data: generateRule(field, 'EQUALS', [1000, 2000]),
			query: createQuery(fieldQuery, { $in: [1000, 2000] }),
		},
		{
			desc: 'value operator GT with 1 operand',
			data: generateRule(field, 'GT', [1000]),
			query: createQuery(fieldQuery, { $gt: 1000 }),
		},
		{
			desc: 'value operator GT with 1+ operand',
			data: generateRule(field, 'GT', [1000, 2000]),
			query: createQuery(fieldQuery, { $gt: 1000 }),
		},
		{
			desc: 'value operator GTE with 1 operand',
			data: generateRule(field, 'GTE', [1000]),
			query: createQuery(fieldQuery, { $gte: 1000 }),
		},
		{
			desc: 'value operator GTE with 1+ operand',
			data: generateRule(field, 'GTE', [1000, 2000]),
			query: createQuery(fieldQuery, { $gte: 1000 }),
		},
		{
			desc: 'value operator LT with 1 operand',
			data: generateRule(field, 'LT', [1000]),
			query: createQuery(fieldQuery, { $lt: 1000 }),
		},
		{
			desc: 'value operator LT with 1+ operand',
			data: generateRule(field, 'LT', [1000, 2000]),
			query: createQuery(fieldQuery, { $lt: 2000 }),
		},
		{
			desc: 'value operator LTE with 1 operand',
			data: generateRule(field, 'LTE', [1000]),
			query: createQuery(fieldQuery, { $lte: 1000 }),
		},
		{
			desc: 'value operator LTE with 1+ operand',
			data: generateRule(field, 'LTE', [1000, 2000]),
			query: createQuery(fieldQuery, { $lte: 2000 }),
		},
		{
			desc: 'value operator IN_RANGE with 1 set of operands',
			data: generateRule(field, 'IN_RANGE', [1000, 2000]),
			query: createQuery(fieldQuery, { $gte: 1000, $lte: 2000 }),
		},

		{
			desc: 'value operator IN_RANGE with 1+ sets of operands',
			data: generateRule(field, 'IN_RANGE', [1000, 2000, 200, 100]),
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
			data: generateRule({ operator: 'IS', values: [fieldValues[0]] }, 'IS', values),
			query: createQuery(fieldValues[0], { $in: values }),
		},
		{
			desc: 'field operator IS with 1+ operands',
			data: generateRule({ operator: 'IS', values: fieldValues }, 'IS', values),
			query: createQuery({ $in: fieldValues }, { $in: values }),
		},
		{
			desc: 'field operator CONTAINS with 1 operand',
			data: generateRule({ operator: 'CONTAINS', values: [fieldValues[0]] }, 'IS', values),
			query: createQuery({ $regex: new RegExp(fieldValues[0]), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator CONTAINS with 1+ operands',
			data: generateRule({ operator: 'CONTAINS', values: fieldValues }, 'IS', values),
			query: createQuery({ $regex: new RegExp(fieldValues.join('|')), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator REGEX with 1 operand',
			data: generateRule({ operator: 'REGEX', values: ['(\\w)+$'] }, 'IS', values),
			query: createQuery({ $regex: new RegExp('((\\w)+$)') }, { $in: values }),
		},
		{
			desc: 'field operator REGEX with 1+ operands',
			data: generateRule({ operator: 'REGEX', values: ['(\\w)+$', `(${fieldValues.join('|')})*`] }, 'IS', values),
			query: createQuery({ $regex: new RegExp(`((\\w)+$)|((${fieldValues.join('|')})*)`) }, { $in: values }),
		},
		{
			desc: 'field operator STARTS_WITH with 1 operand',
			data: generateRule({ operator: 'STARTS_WITH', values: [fieldValues[0]] }, 'IS', values),
			query: createQuery({ $regex: new RegExp(`^(${fieldValues[0]})`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator STARTS_WITH with 1+ operands',
			data: generateRule({ operator: 'STARTS_WITH', values: fieldValues }, 'IS', values),
			query: createQuery({ $regex: new RegExp(`^(${fieldValues.join('|')})`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator ENDS_WITH with 1 operand',
			data: generateRule({ operator: 'ENDS_WITH', values: [fieldValues[0]] }, 'IS', values),
			query: createQuery({ $regex: new RegExp(`.*(${fieldValues[0]})$`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field operator ENDS_WITH with 1+ operands',
			data: generateRule({ operator: 'ENDS_WITH', values: fieldValues }, 'IS', values),
			query: createQuery({ $regex: new RegExp(`.*(${fieldValues.join('|')})$`), $options: 'i' }, { $in: values }),
		},
		{
			desc: 'field unknown operator',
			data: generateRule({ operator: generateRandomString(), values: fieldValues }, 'IS', values),
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
		const field = { values: fieldValues, operator: 'IS' };

		const posRules = [
			generateRule(field, 'IS_NOT_EMPTY'),
			generateRule(field, 'IS', [generateRandomString()]),
			generateRule(field, 'CONTAINS', [generateRandomString()]),
			generateRule(field, 'REGEX', [generateRandomString()]),
			generateRule(field, 'EQUALS', [generateRandomNumber()]),
			generateRule(field, 'GT', [generateRandomNumber()]),
			generateRule(field, 'GTE', [generateRandomNumber()]),
			generateRule(field, 'LT', [generateRandomNumber()]),
			generateRule(field, 'LTE', [generateRandomNumber()]),
			generateRule(field, 'IN_RANGE', [0, 199]),

		];

		const negRules = [
			generateRule(field, 'IS_NOT', [generateRandomString()]),
			generateRule(field, 'NOT_CONTAINS', [generateRandomString()]),
			generateRule(field, 'NOT_EQUALS', [generateRandomNumber()]),
			generateRule(field, 'NOT_IN_RANGE', [2, 255]),
		];

		const emptyRule = generateRule(field, 'IS_EMPTY');

		const expectedData = {
			positives: posRules.map(MetaRules.toQuery),
		};

		expectedData.negatives = negRules.map((rule) => {
			expectedData.positives.push(MetaRules.toQuery({ field: rule.field, operator: 'IS_NOT_EMPTY' }));
			return MetaRules.toQuery(rule);
		});

		expectedData.negatives.push(MetaRules.toQuery(emptyRule));

		const rules = [...posRules, ...negRules, emptyRule];
		expect(MetaRules.generateQueriesFromRules(rules)).toEqual(expectedData);
	});
};

/* eslint-disable security/detect-non-literal-regexp */

describe(determineTestGroup(__filename), () => {
	testToQuery();
	testGenerateQueriesFromRules();
});
