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

const { src } = require('../../../../../../../../helper/path');

const Maps = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/maps`);
const { templates } = require(`${src}/utils/responseCodes`);
const { determineTestGroup } = require('../../../../../../../../helper/utils');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const testValidateMapsCoordinates = () => {
	describe('validateMapsCoordinates', () => {
		const tests = [
			['valid', { zoomLevel: 3, x: 10, y: 20 }, true],
			['missing required parameter', { zoomLevel: 3, x: 10 }, false, templates.invalidArguments],
			['non-numeric value', { zoomLevel: 'abc', x: 10, y: 20 }, false, templates.invalidArguments],
			['negative value', { zoomLevel: -1, x: 10, y: 20 }, false, templates.invalidArguments],
			['non-integer value', { zoomLevel: 3.5, x: 10, y: 20 }, false, templates.invalidArguments],
		];
		describe.each(tests)('', (desc, query, success, expectedOutput) => {
			test(`should ${success ? 'call next()' : 'respond with invalidArguments'} when query is ${desc}`, async () => {
				const req = { query };
				const res = {};
				const next = jest.fn(async () => { });

				if (!success) {
					Responder.respond.mockResolvedValueOnce();
				}

				await Maps.validateMapsCoordinates(req, res, next);

				if (success) {
					expect(next).toHaveBeenCalledTimes(1);
					expect(Responder.respond).not.toHaveBeenCalled();
				} else {
					expect(next).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(
						req,
						res,
						expect.objectContaining({ code: expectedOutput.code }),
					);
				}
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateMapsCoordinates();
});
