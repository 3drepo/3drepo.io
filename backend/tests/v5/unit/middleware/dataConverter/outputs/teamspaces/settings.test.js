/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { cloneDeep } = require('lodash');

const { generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { templates } = require(`${src}/utils/responseCodes`);

const { generateUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);

const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);

const TeamspaceSettings = require(`${src}/middleware/dataConverter/outputs/teamspaces/settings`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testCastTicketSchemaOutput = () => {
	describe('Casting ticket schema output', () => {
		test('should convert all appropriate properties', () => {
			const templateData = {
				_id: generateUUID(),
				properties: [
					{
						name: generateRandomString(),
						type: propTypes.TEXT,
						default: generateRandomString(),
					},
					{
						name: generateRandomString(),
						type: propTypes.DATE,
						default: new Date(),
					},
					{
						name: generateRandomString(),
						type: propTypes.DATE,
					},

				],
				modules: [{
					name: generateRandomString(),
					properties: [
						{
							name: generateRandomString(),
							type: propTypes.TEXT,
							default: generateRandomString(),
						},
						{
							name: generateRandomString(),
							type: propTypes.DATE,
							default: new Date(),
						},
						{
							name: generateRandomString(),
							type: propTypes.DATE,
						},
					] },
				],

			};
			const req = { templateData };

			const expectedOutput = cloneDeep(templateData);
			expectedOutput._id = UUIDToString(templateData._id);
			expectedOutput.properties[1].default = expectedOutput.properties[1].default.getTime();
			expectedOutput.modules[0].properties[1].default = expectedOutput.modules[0].properties[1].default.getTime();

			const next = jest.fn();
			TeamspaceSettings.castTicketSchemaOutput(req, {}, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, expectedOutput);
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/settings', () => {
	testCastTicketSchemaOutput();
});
