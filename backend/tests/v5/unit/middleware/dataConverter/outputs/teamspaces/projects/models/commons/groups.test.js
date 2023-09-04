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

const { OPERATORS } = require('../../../../../../../../../../src/v5/models/groups.constants');
const { isString } = require('../../../../../../../../../../src/v5/utils/helper/typeCheck');
const { src } = require('../../../../../../../../helper/path');
const { generateLegacyGroup, generateRandomString } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

const GroupsOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups`);

// Mock respond function to just return the resCode
const respondFn = Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testSerialiseGroupArray = () => {
	const badRuleCast = generateLegacyGroup('a', 'b', true, false, false);
	badRuleCast.rules = [{
		field: { operator: OPERATORS.IS.name, values: ['Element ID'] },
		operator: OPERATORS.IS_NOT_EMPTY.name,
		values: [
			'',
		],
	}];

	const stringFieldSchema = generateLegacyGroup('a', 'b', true, false, false);
	stringFieldSchema.rules = [{
		field: 'Element ID',
		operator: OPERATORS.IS_NOT_EMPTY.name,
		values: [generateRandomString()],
	}];

	describe.each([
		[[], 'empty array'],
		[
			[
				generateLegacyGroup('a', 'b', false, false, false),
				generateLegacyGroup('a', 'b', true, false, false),
				generateLegacyGroup('a', 'b', false, true, false),
			],
			'3 different group types',
		],
		[[badRuleCast], 'Bad schema'],
		[[stringFieldSchema], 'Old schema (field is string)'],
		[[{ ...generateLegacyGroup('a', 'b', true, false, false), updatedAt: undefined }], 'group with no updatedAt'],
	])('Serialise Group array data', (data, desc) => {
		test(`should serialise correctly with ${desc}`,
			() => {
				const nextIdx = respondFn.mock.calls.length;
				GroupsOutputMiddlewares.serialiseGroupArray({ outputData: cloneDeep(data) }, {}, () => { });
				expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
				expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

				const serialisedGroups = data.map((group) => {
					const res = { ...group };

					res._id = UUIDToString(group._id);
					res.updatedAt = res.updatedAt ?? res.createdAt;

					if ((group.objects || []).length) {
						res.objects = group.objects.map((entry) => {
							if (entry.shared_ids) {
								// eslint-disable-next-line no-param-reassign
								entry.shared_ids = entry.shared_ids.map(UUIDToString);
							}
							return entry;
						});
					}

					if ((group.rules || []).length) {
						res.rules = group.rules.map((entry) => {
							const output = { ...entry };
							if (entry.operator === OPERATORS.IS_NOT_EMPTY.name) {
								delete output.values;
							}
							if (isString(entry.field)) {
								output.field = { operator: OPERATORS.IS.name, values: [entry.field] };
							}
							return output;
						});
					}

					return res;
				});

				expect(respondFn.mock.calls[nextIdx][3]).toEqual({ groups: serialisedGroups });
			});
	});
};

const testConvertGroupRules = () => {
	const oldSchemaGroup = {
		...generateLegacyGroup(generateRandomString(), generateRandomString(), false),
		rules: [{
			name: generateRandomString(),
			field: generateRandomString(),
			operator: OPERATORS.IS.name,
			values: [generateRandomString()],
		}],
	};
	describe.each([
		[generateLegacyGroup(generateRandomString(), generateRandomString(), false), 'group with no rules'],
		[generateLegacyGroup(generateRandomString(), generateRandomString(), true), 'group with new schema rules'],
		[oldSchemaGroup, 'group with old schema rules'],
	])('Convert group rules to new schema', (group, desc) => {
		test(`should convert rules to new schema correctly with ${desc}`,
			() => {
				const nextIdx = respondFn.mock.calls.length;
				GroupsOutputMiddlewares.convertGroupRules({ outputData: cloneDeep(group) }, {}, () => { });
				expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
				expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

				const res = group;
				if (res.rules) {
					res.rules = res.rules.map((entry) => {
						const output = entry;

						if (typeof entry.field === 'string') {
							output.field = { operator: OPERATORS.IS.name, values: [entry.field] };
						}

						return output;
					});
				}

				expect(respondFn.mock.calls[nextIdx][3]).toEqual(res);
			});
	});
};

const testConvertGroupArrayRules = () => {
	const oldSchemaGroups = [
		{
			...generateLegacyGroup(generateRandomString(), generateRandomString(), false),
			rules: [{
				name: generateRandomString(),
				field: generateRandomString(),
				operator: OPERATORS.IS.name,
				values: [generateRandomString()],
			}],
		},
		{
			...generateLegacyGroup(generateRandomString(), generateRandomString(), false),
			rules: [{
				name: generateRandomString(),
				field: generateRandomString(),
				operator: OPERATORS.IS.name,
				values: [generateRandomString()],
			}],
		},
	];

	describe.each([
		[[
			generateLegacyGroup(generateRandomString(), generateRandomString(), false),
			generateLegacyGroup(generateRandomString(), generateRandomString(), false),
		], 'groups with no rules'],
		[[
			generateLegacyGroup(generateRandomString(), generateRandomString(), true),
			generateLegacyGroup(generateRandomString(), generateRandomString(), true),
		], 'groups with new schema rules'],
		[oldSchemaGroups, 'groups with old schema rules'],
	])('Convert group array rules to new schema', (groups, desc) => {
		test(`should convert rules to new schema correctly with ${desc}`,
			() => {
				const nextIdx = respondFn.mock.calls.length;
				GroupsOutputMiddlewares.convertGroupArrayRules({ outputData: cloneDeep(groups) }, {}, () => { });
				expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
				expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

				const res = groups;
				res.map((group) => {
					const outputGroup = group;
					if (outputGroup.rules) {
						outputGroup.rules = outputGroup.rules.map((rule) => {
							const outputRule = { ...rule };

							if (isString(rule.field)) {
								outputRule.field = { operator: OPERATORS.IS.name, values: [rule.field] };
							}

							return outputRule;
						});
					}

					return outputGroup;
				});

				expect(JSON.stringify(respondFn.mock.calls[nextIdx][3])).toEqual(JSON.stringify(res));
			});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups', () => {
	testSerialiseGroupArray();
	testConvertGroupRules();
	testConvertGroupArrayRules();
});
