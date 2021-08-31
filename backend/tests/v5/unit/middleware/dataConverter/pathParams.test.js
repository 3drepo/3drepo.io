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

const { src } = require('../../../helper/path');

const PathParams = require(`${src}/middleware/dataConverter/pathParams`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const testConvertAllUUIDs = () => {
	describe('Convert UUIDs in params', () => {
		test('next() should be called with no changes to the params if there are no params', () => {
			const mockCB = jest.fn(() => {});
			PathParams.convertAllUUIDs({}, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called with relevant params changed', () => {
			const mockCB = jest.fn(() => {});
			const params = {
				a: 1,
				b: '',
				c: null,
				d: 'abc',
				e: '7591fbdb-52b9-490a-8a77-fdb57c57dbc8',
				f: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
			};
			const expectedResult = {
				...params,
				e: stringToUUID(params.e),
				f: stringToUUID(params.f),
			};
			PathParams.convertAllUUIDs({ params }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(params).toEqual(expectedResult);
		});
	});
};

describe('middleware/dataConverter/pathParams', () => {
	testConvertAllUUIDs();
});
