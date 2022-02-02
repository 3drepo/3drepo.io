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

const { src } = require('../../../../../../../helper/path');

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Federations = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/federations`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateSettingsData = () => {
	describe('Update federation settings', () => {
		test(`should respond with ${templates.invalidArguments.code} if the user is trying to update type`, async () => {
			const mockCB = jest.fn();
			await Federations.validateUpdateSettingsData({ params: { teamspace: 'a', project: 'b' } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/federations', () => {
	testValidateUpdateSettingsData();
});
