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

const { src } = require('../../../../../../../../../../helper/path');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../../../../../src/v5/utils/permissions/permissions');
const ModelSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateSettingsData = () => {
	describe.each([
		[{ body: { name: 1 } }, false, 'with invalid name'],
		[{ body: { name: null } }, false, 'with null name'],
		[{ body: { name: 'valid' } }, true, 'with valid name'],
		[{ body: { desc: 1 } }, false, 'with invalid desc'],
		[{ body: { desc: null } }, false, 'with null desc'],
		[{ body: { desc: 'valid' } }, true, 'with valid desc'],
		[{ body: { surveyPoints: 'invalid' } }, false, 'with invalid surveyPoints'],
		[{ body: { surveyPoints: null } }, false, 'with null surveyPoints'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3] }] } }, false, 'with surveyPoints with no latLong'],
		[{ body: { surveyPoints: [{ latLong: [1, 2] }] } }, false, 'with surveyPoints with no position'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3, 4], latLong: [1, 2] }] } }, false, 'with surveyPoints with invalid position'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2, 3] }] } }, false, 'with surveyPoints with invalid latLong'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2] }] } }, true, 'with valid surveyPoints'],
		[{ body: { angleFromNorth: 'invalid' } }, false, 'with invalid angleFromNorth'],
		[{ body: { angleFromNorth: null } }, false, 'with null angleFromNorth'],
		[{ body: { angleFromNorth: 123 } }, true, 'with valid angleFromNorth'],
		[{ body: { type: 123 } }, false, 'with invalid type'],
		[{ body: { type: null } }, false, 'with null type'],
		[{ body: { type: 'valid' } }, true, 'with valid type'],
		[{ body: { unit: 'invalid' } }, false, 'with invalid unit'],
		[{ body: { unit: null } }, false, 'with null unit'],
		[{ body: { unit: 'mm' } }, true, 'with valid unit'],
		[{ body: { code: 1 } }, false, 'with invalid code'],
		[{ body: { code: 'CODE1!' } }, false, 'with code that has symbols'],
		[{ body: { code: null } }, false, 'with null code'],
		[{ body: { code: 'CODE1' } }, true, 'with valid code'],
		[{ body: { defaultView: 123 } }, false, 'with invalid defaultView'],
		[{ body: { defaultView: null } }, false, 'with null defaultView'],
		[{ body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, true, 'with valid defaultView'],
		[{ body: { defaultLegend: 123 } }, false, 'with invalid defaultLegend'],
		[{ body: { defaultLegend: null } }, false, 'with null defaultLegend'],
		[{ body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, true, 'with valid defaultLegend'],
	])('Check if req arguments for settings update are valid', (data, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn();
			const req = cloneDeep(data);
			await ModelSettings.validateUpdateSettingsData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings', () => {
	testValidateUpdateSettingsData();
});
