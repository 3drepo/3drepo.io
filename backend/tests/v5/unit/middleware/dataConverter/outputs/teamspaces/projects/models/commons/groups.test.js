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
		field: { operator: 'IS', values: ['Element ID'] },
		operator: 'IS_NOT_EMPTY',
		values: [
			'',
		],
	}];

	const stringFieldSchema = generateLegacyGroup('a', 'b', true, false, false);
	stringFieldSchema.rules = [{
		field: 'Element ID',
		operator: 'IS_NOT_EMPTY',
		values: [
			generateRandomString(),
		],
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
							if (entry.operator === 'IS_NOT_EMPTY') {
								delete output.values;
							}
							if (typeof entry.field === 'string') {
								output.field = { operator: 'IS', values: [entry.field] };
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
	describe.each([
		[generateLegacyGroup(generateRandomString(), generateRandomString(), false), 'group with no rules'],
		[generateLegacyGroup(generateRandomString(), generateRandomString(), true), 'group with rules'],
	])('Convert rules to new schema', (group, desc) => {
		test(`should convert rules to new schema correctly with ${desc}`,
			() => {
				const nextIdx = respondFn.mock.calls.length;
				GroupsOutputMiddlewares.convertGroupRules({ outputData: cloneDeep(group) }, {}, () => { });
				expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
				expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

				const res = { ...group };
				if (group.rules) {
					res.rules = group.rules.map((entry) => {
						const output = { ...entry };

						if (typeof entry.field === 'string') {
							output.field = { operator: 'IS', values: [entry.field] };
						}

						return output;
					});
				}

				expect(respondFn.mock.calls[nextIdx][3]).toEqual(res);
			});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups', () => {
	testSerialiseGroupArray();
	testConvertGroupRules();
});
