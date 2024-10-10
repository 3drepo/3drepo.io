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

const { src } = require('../../../../../helper/path');

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { generateRandomString } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Activities = require(`${src}/middleware/dataConverter/inputs/teamspaces/activities`);
const { templates } = require(`${src}/utils/responseCodes`);

const testValidateGetActivitiesParams = () => {
	const validQuery = { from: Date.now().toString(), to: Date.now().toString() };
	const validQueryCasted = {
		from: new Date(Number(validQuery.from)),
		to: new Date(Number(validQuery.to)),
	};

	describe.each([
		['No query object', undefined, true, {}],
		['query object has unrelated fields', { [generateRandomString()]: generateRandomString() }, true, {}],
		['query object has valid fields', { [generateRandomString()]: generateRandomString(), ...validQuery }, true, validQueryCasted],
		['from is not a valid timestamp', { ...validQuery, from: generateRandomString() }, false],
		['to is not a valid timestamp', { ...validQuery, to: generateRandomString() }, false],
		['both from and to are valid', validQuery, true, validQueryCasted],
		['from is missing', { ...validQuery, from: undefined }, true, { ...validQueryCasted, from: undefined }],
		['to is missing', { ...validQuery, to: undefined }, true, { ...validQueryCasted, to: undefined }],
	])('Validate get activities params', (desc, query, success, expectedOutput) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const req = { query: cloneDeep(query) };
			const res = {};
			const next = jest.fn();

			await Activities.validateGetActivitiesParams(req, res, next);

			if (success) {
				expect(next).toHaveBeenCalledTimes(1);
				expect(req.query).toEqual(expectedOutput);
				expect(Responder.respond).not.toHaveBeenCalled();
			} else {
				expect(next).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, {},
					expect.objectContaining({ code: templates.invalidArguments.code }));
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/activities', () => {
	testValidateGetActivitiesParams();
});
