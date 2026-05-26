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

const { times } = require('lodash');
const { src } = require('../../../helper/path');
const { determineTestGroup, generateRandomString } = require('../../../helper/services');

const ObjectHelper = require(`${src}/utils/helper/objects`);

const testCreateConstantsObject = () => {
	describe('Create constants object', () => {
		test('Should create a constant object with the array provided', () => {
			const expectedResult = {};
			const constArr = times(10, () => {
				const value = generateRandomString();
				expectedResult[value] = value;
				return value;
			});
			expect(ObjectHelper.createConstantsObject(constArr)).toEqual(expectedResult);
		});

		test('Should return an empty object if the array is empty ', () => {
			expect(ObjectHelper.createConstantsObject([])).toEqual({});
		});

		test('Should return an empty object if the array is undefined ', () => {
			expect(ObjectHelper.createConstantsObject()).toEqual({});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateConstantsObject();
});
