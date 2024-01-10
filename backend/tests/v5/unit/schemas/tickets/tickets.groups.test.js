/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { times, cloneDeep } = require('lodash');

const { src } = require('../../../helper/path');
const {
	determineTestGroup,
	generateRandomObject,
	generateRandomString,
	generateUUID,
	generateUUIDString,
	generateRandomNumber,
} = require('../../../helper/services');
const { idTypes } = require('../../../../../src/v5/models/metadata.constants');

const { stringToUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);

const GroupsSchema = require(`${src}/schemas/tickets/tickets.groups`);

const testDeserialiseGroup = () => {
	describe('Deserialise', () => {
		test('Should convert all uuid strings into uuids within _ids array', () => {
			const obj = generateRandomObject();
			obj.objects = times(3, () => ({
				_ids: times(3, generateUUIDString),
			}));

			const expectedData = cloneDeep(obj);
			expectedData.objects = expectedData.objects.map(({ _ids }) => ({ _ids: _ids.map(stringToUUID) }));

			expect(GroupsSchema.deserialiseGroup(obj)).toEqual(expectedData);
		});
	});
};

const testSerialiseGroup = () => {
	describe('Serialise', () => {
		test('Should convert all uuid into uuids strings', () => {
			const obj = generateRandomObject();
			obj.objects = times(3, () => ({
				_ids: times(3, generateUUID),
			}));

			obj._id = generateUUID();

			const expectedData = cloneDeep(obj);
			expectedData.objects = expectedData.objects.map(({ _ids }) => ({ _ids: _ids.map(UUIDToString) }));
			expectedData._id = UUIDToString(obj._id);

			expect(GroupsSchema.serialiseGroup(obj)).toEqual(expectedData);
		});
	});
};

const testSchema = () => {
	describe.each([
		['data is a UUID and allowIds is set to true', true, false, generateUUID(), true],
		['data is a UUID and allowIds is set to false', false, false, generateUUID(), false],
		['data only has some of the values and fieldsOptional is set to true', false, true, { name: generateRandomString() }, true],
		['data only has some of the values and fieldsOptional is set to false', false, false, { name: generateRandomString() }, false],
		['data has both rules and objects and fieldsOptional is set to true', false, true, {
			name: generateRandomString(),
			rules: [{ field: generateRandomString(), operation: 'EXISTS' }],
			objects: [{ _ids: [generateUUID()], container: generateUUIDString() }],
		}, false],
		[`data has objects with ${[idTypes.REVIT]}`, false, false, {
			name: generateRandomString(),
			objects: [{ [idTypes.REVIT]: [generateRandomNumber()], container: generateUUIDString() }],
		}, true],
		[`data has objects with wrong type of ${[idTypes.REVIT]}`, false, false, {
			name: generateRandomString(),
			objects: [{ [idTypes.REVIT]: [generateRandomString()], container: generateUUIDString() }],
		}, false],
		[`data has objects with ${[idTypes.IFC]}`, false, false, {
			name: generateRandomString(),
			objects: [{ [idTypes.IFC]: [generateRandomString(22)], container: generateUUIDString() }],
		}, true],
		[`data has objects with wrong type of ${[idTypes.IFC]}`, false, false, {
			name: generateRandomString(),
			objects: [{ [idTypes.IFC]: [generateRandomNumber()], container: generateUUIDString() }],
		}, false],
		[`data has objects with both ${[idTypes.IFC]} and ${[idTypes.REVIT]}`, false, false, {
			name: generateRandomString(),
			objects: [{
				[idTypes.IFC]: [generateRandomString(22)],
				[idTypes.REVIT]: [],
				container: generateUUIDString() }],
		}, false],
		[`data has objects with both _ids and ${[idTypes.REVIT]}`, false, false, {
			name: generateRandomString(),
			objects: [{ _ids: [generateUUID()], [idTypes.REVIT]: [], container: generateUUIDString() }],
		}, false],
		['data has objects with only container and no ids', false, false, {
			name: generateRandomString(),
			objects: [{ container: generateUUIDString() }],
		}, false],
	])('Schema validation', (desc, allowIds, fieldsOptional, data, shouldPass) => {
		test(`Should ${shouldPass ? 'pass' : 'fail'} if ${desc}`, async () => {
			const schemaToTest = GroupsSchema.schema(allowIds, fieldsOptional);
			const fnTest = expect(schemaToTest.validate(data));

			if (shouldPass) {
				await fnTest.resolves.not.toBeUndefined();
			} else {
				await fnTest.rejects.not.toBeUndefined();
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testDeserialiseGroup();
	testSerialiseGroup();
	testSchema();
});
