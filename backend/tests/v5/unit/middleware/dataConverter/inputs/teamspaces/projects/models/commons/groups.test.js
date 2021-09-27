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
const { generateGroup, generateUUIDString } = require('../../../../../../../../helper/services');

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

	return output;
};

const testValidateGroupsImportData = () => {
	const ruleGroup = generateGroup('ab', generateUUIDString(), true);
	const ifcGroup = generateGroup('ab', generateUUIDString(), false, true);
	const normalGroup = generateGroup('ab', generateUUIDString(), false, false);

	describe.each([
		[{ body: { groups: [ruleGroup, ifcGroup, normalGroup] } }, true, 'valid mixed schema'],
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
