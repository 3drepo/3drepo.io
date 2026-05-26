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

const { src } = require('../../../../../../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

const UtilsMiddleware = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/utils`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateListSortAndFilter = () => {
	const validQuery = {
		filters: generateRandomString(),
		sortBy: generateRandomString(),
		sortDesc: 'true',
		updatedSince: Date.now().toString(),
		limit: Math.round(generateRandomNumber(1, 100)),
		skip: Math.round(generateRandomNumber(1, 100)),
	};
	const validQueryCasted = {
		filters: [validQuery.filters],
		sortBy: validQuery.sortBy,
		sortDesc: validQuery.sortDesc !== 'false',
		updatedSince: new Date(Number(validQuery.updatedSince)),
		limit: validQuery.limit,
		skip: validQuery.skip,
	};

	describe.each([
		['No query object', undefined, true, {}],
		['query object has unrelated fields', { [generateRandomString()]: generateRandomString() }, true, { skip: 0 }],
		['query object has valid fields', { [generateRandomString()]: generateRandomString(), ...validQuery }, true, validQueryCasted],
		['filters is empty', { filters: '' }, false],
		['filters is full of commas', { filters: ',,,' }, false],
		['sortBy is empty', { sortBy: '' }, false],
		['skip is empty', { skip: undefined }, true, { skip: 0 }],
		['sortBy is empty but sortDesc is provided', { sortDesc: true }, true, { skip: 0 }],
		['sortBy is provided but sortDesc is empty', { sortBy: validQuery.sortBy }, true, { sortBy: validQueryCasted.sortBy, sortDesc: true, skip: 0 }],
		['updatedSince is not a valid timestamp', { updatedSince: generateRandomString() }, false],
	])('Validate list sort and filter options', (desc, query, success, expectedOutput) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const req = { query: cloneDeep(query) };
			const res = {};
			const next = jest.fn();

			await UtilsMiddleware.validateListSortAndFilter(req, res, next);

			if (success) {
				expect(next).toHaveBeenCalledTimes(1);
				expect(req.listOptions).toEqual(expectedOutput);
				expect(req.query).toEqual(query);
				expect(Responder.respond).not.toHaveBeenCalled();
			} else {
				expect(next).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				const { message, ...invalidArgRes } = templates.invalidArguments;
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expect.objectContaining(invalidArgRes));
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateListSortAndFilter();
});
