/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { determineTestGroup, generateRandomObject, generateRandomString } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/tickets.groups');
const GroupSchema = require(`${src}/schemas/tickets/tickets.groups`);

const { templates } = require(`${src}/utils/responseCodes`);

const GroupOutputMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.groups`);

const testSerialiseGroup = () => {
	describe('Serialise Group', () => {
		test('should respond with whatever is returned by serialiseGroup()', () => {
			const req = { groupData: generateRandomObject() };
			const res = generateRandomObject();
			const expectedResponse = generateRandomObject();
			GroupSchema.serialiseGroup.mockReturnValueOnce(expectedResponse);

			GroupOutputMiddleware.serialiseGroup(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, expectedResponse);
		});
		test(`should respond with ${templates.unknown} if serialiseGroup() failed`, () => {
			const req = { groupData: generateRandomObject() };
			const res = generateRandomObject();
			GroupSchema.serialiseGroup.mockImplementationOnce(() => { throw generateRandomString(); });

			GroupOutputMiddleware.serialiseGroup(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.unknown);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testSerialiseGroup();
});
