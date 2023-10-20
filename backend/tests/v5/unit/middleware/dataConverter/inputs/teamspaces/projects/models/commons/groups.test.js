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

const _ = require('lodash');
const { src } = require('../../../../../../../../helper/path');
const { generateLegacyGroup, generateUUIDString, generateRandomString } = require('../../../../../../../../helper/services');
const { convertLegacyRules } = require('../../../../../../../../../../src/v5/schemas/rules');

const { FIELD_NAME_OPERATORS, FIELD_VALUE_OPERATORS } = require(`${src}/models/metadata.rules.constants`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const { UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);
const Responder = require(`${src}/utils/responder`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { isString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);

const GroupsInputMiddlewares = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/groups`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateGroupsExportData = () => {
	describe.each([
		[{ body: { groups: [] } }, false],
		[{ body: { groups: null } }, false],
		[{ body: { } }, false],
		[{ body: 1 }, false],
		[{ }, false],
		[{ body: { group: [generateUUIDString()] } }, false],
		[{ body: { groups: [generateUUIDString()] } }, true],
		[{ body: { groups: [generateUUIDString(), generateUUIDString()] } }, true],
	])('Validate Groups export data', (data, shouldPass) => {
		test(`${shouldPass ? 'should call next()' : 'should respond with invalidArguments'} with ${JSON.stringify(data)}`,
			async () => {
				const mockCB = jest.fn(() => {});
				const req = cloneDeep(data);
				await GroupsInputMiddlewares.validateGroupsExportData(
					req,
					{},
					mockCB,
				);
				if (shouldPass) {
					expect(mockCB.mock.calls.length).toBe(1);
					for (let i = 0; i < req.body.groups.length; ++i) {
						const groupId = req.body.groups[i];
						// string ids should be converted to uuids
						expect(isString(groupId)).toBe(false);
						expect(UUIDToString(groupId)).toEqual(data.body.groups[i]);
					}
				} else {
					expect(mockCB.mock.calls.length).toBe(0);
					expect(Responder.respond.mock.calls.length).toBe(1);
					expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
				}
			});
	});
};

const deserialiseGroup = (group) => {
	const output = cloneDeep(group);
	output._id = stringToUUID(output._id);
	if (output.objects) {
		for (let i = 0; i < output.objects.length; ++i) {
			if (output.objects[i].shared_ids) {
				output.objects[i].shared_ids = output.objects[i].shared_ids.map(stringToUUID);
			}
		}
	}
	if (output.rules) {
		output.rules = convertLegacyRules(output.rules);
	}

	return output;
};

const testValidateGroupsImportData = () => {
	const ruleGroup = generateLegacyGroup('ab', generateUUIDString(), true);
	const ifcGroup = generateLegacyGroup('ab', generateUUIDString(), false, true);
	const normalGroup = generateLegacyGroup('ab', generateUUIDString(), false, false);

	const standardRule = {
		name: generateRandomString(),
		field: { operator: FIELD_NAME_OPERATORS.IS.name, values: [generateRandomString()] },
		operator: FIELD_VALUE_OPERATORS.IS.name,
		values: [generateRandomString()],
	};

	const badRule = {
		name: generateRandomString(),
		field: { operator: FIELD_NAME_OPERATORS.IS.name, values: [generateRandomString()] },
		operator: FIELD_VALUE_OPERATORS.EQUALS.name,
		values: ['a', 'b'],
	};

	describe.each([
		[{ body: { groups: [] } }, false, 'empty group'],
		[{ body: { groups: [ruleGroup, ifcGroup, normalGroup] } }, true, 'valid mixed schema'],
		[{ body: { groups: [_.omit(ruleGroup, ['_id'])] } }, false, 'missing _id'],
		[{ body: { groups: [_.omit(ruleGroup, ['rules'])] } }, false, 'no objects or rules'],
		[{ body: { groups: [_.omit(ruleGroup, ['color'])] } }, false, 'no color'],
		[{ body: { groups: [_.omit(ruleGroup, ['author'])] } }, false, 'no author'],
		[{ body: { groups: [_.omit(ruleGroup, ['createdAt'])] } }, false, 'no createdAt'],
		[{ body: { groups: [{ ...ruleGroup, rules: [] }] } }, false, 'with empty rules'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, name: undefined, field: generateRandomString() }] }] } }, true, 'rule with old schema'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: FIELD_VALUE_OPERATORS.REGEX.name, name: undefined, field: generateRandomString() }] }] } }, true, 'rule with old schema and regex operator'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ operator: FIELD_VALUE_OPERATORS.IN_RANGE.name, values: [1, 2], name: undefined, field: generateRandomString() }] }] } }, true, 'rule with old schema and range operator'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ operator: FIELD_VALUE_OPERATORS.IS_EMPTY.name, values: undefined, name: undefined, field: generateRandomString() }] }] } }, true, 'rule with old schema and is empty operator'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ operator: FIELD_VALUE_OPERATORS.IS_NOT_EMPTY.name, values: undefined, name: undefined, field: generateRandomString() }] }] } }, true, 'rule with old schema and is not empty operator'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: FIELD_VALUE_OPERATORS.IS_EMPTY.name, values: undefined }] }] } }, true, 'exists rule'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, name: undefined }] }] } }, false, 'rule with no name'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: FIELD_VALUE_OPERATORS.EQUALS.name, values: [2, 4] }] }] } }, true, 'rule with number parameter'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: FIELD_VALUE_OPERATORS.IN_RANGE.name, values: [2, 4, 5, 7] }] }] } }, true, 'rule with range parameters'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: FIELD_VALUE_OPERATORS.IN_RANGE.name, values: [2, 4, 3] }] }] } }, false, 'rule with in correct amount of range parameters'],
		[{ body: { groups: [{ ...ruleGroup, rules: [...ruleGroup.rules, standardRule] }] } }, true, 'multiple rules'],
		[{ body: { groups: [{ ...ruleGroup, rules: [...ruleGroup.rules, badRule] }] } }, false, 'multiple rules where one is bad'],
		[{ body: { groups: [{ ...ruleGroup, rules: [badRule] }] } }, false, 'rule with invalidParameters'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: FIELD_VALUE_OPERATORS.REGEX.name, values: [generateRandomString(), generateRandomString()] }] }] } }, false, 'regex with more than 1 values'],
		[{ body: { groups: [{ ...ruleGroup, rules: [{ ...standardRule, operator: generateRandomString() }] }] } }, false, 'rule with unknown operator'],
		[{ body: { groups: [{ ...ifcGroup, objects: [] }] } }, false, 'with empty objects'],
		[{ body: { groups: [{ ...ruleGroup, description: '123' }] } }, true, 'with description'],
		[{ body: { groups: [_.omit(ruleGroup, ['updatedBy, updatedAt'])] } }, true, 'without updatedAt and updatedBy'],
	])('Validate Groups import data', (data, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = cloneDeep(data);
			await GroupsInputMiddlewares.validateGroupsImportData(
				req,
				{},
				mockCB,
			);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
				expect(req.body.groups).toEqual(data.body.groups.map(deserialiseGroup));
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/groups', () => {
	testValidateGroupsExportData();
	testValidateGroupsImportData();
});
