/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const QueryParams = require(`${src}/middleware/dataConverter/queryParams`);

const testGetModelsIdFromQuery = () => {
	describe('Get models IDs from query', () => {
		test('next() should be called with no changes to the query if there are no models in the query', () => {
			const mockCB = jest.fn(() => {});
			const req = { query: {} };
			QueryParams.getModelsIdFromQuery(req, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(req.query).toEqual({});
		});

		test('next() should be called with models query param converted to an array of unique IDs', () => {
			const mockCB = jest.fn(() => {});
			const req = { query: { models: 'id1,id2,id1,id3' } };
			const expectedResult = { models: ['id1', 'id2', 'id3'] };
			QueryParams.getModelsIdFromQuery(req, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(req.query).toEqual(expectedResult);
		});
	});
};

describe('middleware/dataConverter/queryParams', () => {
	testGetModelsIdFromQuery();
});
