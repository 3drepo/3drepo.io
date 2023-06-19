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

const { src } = require('../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../helper/services');

const MetaRules = require(`${src}/models/metadata.rules`);
const { templates } = require(`${src}/utils/responseCodes`);

const generateRule = (field, operator, values) => ({ field, operator, values });

const testToQuery = () => {
	const createQuery = (field, valueQuery) => ({
		metadata: { $elemMatch: { key: field, ...(valueQuery ? { value: valueQuery } : {}) } } });

	const fieldName = generateRandomString;
	const testCases = [
		{
			desc: 'operator IS_NOT_EMPTY with no operands',
			data: generateRule(fieldName, 'IS_NOT_EMPTY'),
			query: createQuery(fieldName),
		},
		{
			desc: 'operator IS_NOT_EMPTY with operands',
			data: generateRule(fieldName, 'IS_NOT_EMPTY', [1, 2, 3, 4]),
			query: createQuery(fieldName),
		},
		{
			desc: 'operator IS with 1 operand',
			data: generateRule(fieldName, 'IS', ['abc']),
			query: createQuery(fieldName, 'abc'),
		},
		{
			desc: 'operator IS with 1+ operand',
			data: generateRule(fieldName, 'IS', ['abc', 'a']),
			query: createQuery(fieldName, { $in: ['abc', 'a'] }),
		},
		{
			desc: 'operator CONTAINS with 1 operand',
			data: generateRule(fieldName, 'CONTAINS', ['abc']),
			query: createQuery(fieldName, { $regex: new RegExp('abc'), $options: 'i' }),
		},
		{
			desc: 'operator CONTAINS with 1+ operand',
			data: generateRule(fieldName, 'CONTAINS', ['abc', 'def']),
			query: createQuery(fieldName, { $regex: new RegExp('abc|def'), $options: 'i' }),
		},
		{
			desc: 'operator REGEX with 1 operand',
			data: generateRule(fieldName, 'REGEX', ['$(\\w)+']),
			query: createQuery(fieldName, { $regex: new RegExp('($(\\w)+)') }),
		},
		{
			desc: 'operator REGEX with 1+ operand',
			data: generateRule(fieldName, 'REGEX', ['(\\w)+$', '(a|b)*']),
			query: createQuery(fieldName, { $regex: new RegExp('((\\w)+$)|((a|b)*)') }),
		},
		{
			desc: 'operator EQUALS with 1 operand',
			data: generateRule(fieldName, 'EQUALS', [1000]),
			query: createQuery(fieldName, 1000),
		},
		{
			desc: 'operator EQUALS with 1+ operand',
			data: generateRule(fieldName, 'EQUALS', [1000, 2000]),
			query: createQuery(fieldName, { $in: [1000, 2000] }),
		},
		{
			desc: 'operator GT with 1 operand',
			data: generateRule(fieldName, 'GT', [1000]),
			query: createQuery(fieldName, { $gt: 1000 }),
		},
		{
			desc: 'operator GT with 1+ operand',
			data: generateRule(fieldName, 'GT', [1000, 2000]),
			query: createQuery(fieldName, { $gt: 1000 }),
		},
		{
			desc: 'operator GTE with 1 operand',
			data: generateRule(fieldName, 'GTE', [1000]),
			query: createQuery(fieldName, { $gte: 1000 }),
		},
		{
			desc: 'operator GTE with 1+ operand',
			data: generateRule(fieldName, 'GTE', [1000, 2000]),
			query: createQuery(fieldName, { $gte: 1000 }),
		},
		{
			desc: 'operator LT with 1 operand',
			data: generateRule(fieldName, 'LT', [1000]),
			query: createQuery(fieldName, { $lt: 1000 }),
		},
		{
			desc: 'operator LT with 1+ operand',
			data: generateRule(fieldName, 'LT', [1000, 2000]),
			query: createQuery(fieldName, { $lt: 2000 }),
		},
		{
			desc: 'operator LTE with 1 operand',
			data: generateRule(fieldName, 'LTE', [1000]),
			query: createQuery(fieldName, { $lte: 1000 }),
		},
		{
			desc: 'operator LTE with 1+ operand',
			data: generateRule(fieldName, 'LTE', [1000, 2000]),
			query: createQuery(fieldName, { $lte: 2000 }),
		},
		{
			desc: 'operator IN_RANGE with 1 set of operands',
			data: generateRule(fieldName, 'IN_RANGE', [1000, 2000]),
			query: createQuery(fieldName, { $gte: 1000, $lte: 2000 }),
		},

		{
			desc: 'operator IN_RANGE with 1+ sets of operands',
			data: generateRule(fieldName, 'IN_RANGE', [1000, 2000, 200, 100]),
			query: { $or: [
				createQuery(fieldName, { $gte: 1000, $lte: 2000 }),
				createQuery(fieldName, { $gte: 100, $lte: 200 }),
			] },
		},
		{
			desc: 'unknown operator',
			data: generateRule(fieldName, 'INDSFDSF', [1000]),
		},
	];

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
		const posRules = [
			generateRule(generateRandomString(), 'IS_NOT_EMPTY'),
			generateRule(generateRandomString(), 'IS', [generateRandomString()]),
			generateRule(generateRandomString(), 'CONTAINS', [generateRandomString()]),
			generateRule(generateRandomString(), 'REGEX', [generateRandomString()]),
			generateRule(generateRandomString(), 'EQUALS', [generateRandomNumber()]),
			generateRule(generateRandomString(), 'GT', [generateRandomNumber()]),
			generateRule(generateRandomString(), 'GTE', [generateRandomNumber()]),
			generateRule(generateRandomString(), 'LT', [generateRandomNumber()]),
			generateRule(generateRandomString(), 'LTE', [generateRandomNumber()]),
			generateRule(generateRandomString(), 'IN_RANGE', [0, 199]),

		];

		const negRules = [
			generateRule(generateRandomString(), 'IS_NOT', [generateRandomString()]),
			generateRule(generateRandomString(), 'NOT_CONTAINS', [generateRandomString()]),
			generateRule(generateRandomString(), 'NOT_EQUALS', [generateRandomNumber()]),
			generateRule(generateRandomString(), 'NOT_IN_RANGE', [2, 255]),
		];

		const emptyRule = generateRule(generateRandomString(), 'IS_EMPTY');

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

describe(determineTestGroup(__filename), () => {
	testToQuery();
	testGenerateQueriesFromRules();
});
