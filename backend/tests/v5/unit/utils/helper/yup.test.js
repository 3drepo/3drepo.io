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

const Yup = require('yup');

const { src } = require('../../../helper/path');

const YupHelper = require(`${src}/utils/helper/yup`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { isString } = require(`${src}/utils/helper/typeCheck`);

const testUUIDValidator = () => {
	describe.each([
		['1', false],
		['5c6ea70f-a55f-4cf2-9055-93db43503944', true],
		[0, false],
		[true, false],
	])('UUID validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.validators.uuid.isValid(data)).resolves.toBe(res);
		});
	});
};

describe('utils/helper/yup', () => {
	testUUIDValidator();
});
