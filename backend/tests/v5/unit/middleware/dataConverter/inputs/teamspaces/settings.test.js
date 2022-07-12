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

const { generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/schemas/tickets/templates');
const TicketTemplateSchema = require(`${src}/schemas/tickets/templates`);

const TeamspaceSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/settings`);
const { templates, createResponseCode } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateNewTicketSchema = () => {
	describe('Test new ticket schema', () => {
		test('Should cast the request body and call next if it is valid', async () => {
			const expectedOutput = { [generateRandomString]: generateRandomString() };
			TicketTemplateSchema.validate.mockReturnValueOnce(expectedOutput);
			const req = { body: {} };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateNewTicketSchema(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.body).toEqual(expectedOutput);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if validation failed`, async () => {
			const errMsg = generateRandomString();
			TicketTemplateSchema.validate.mockImplementationOnce(() => { throw new Error(errMsg); });
			const req = { body: {} };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateNewTicketSchema(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, createResponseCode(templates.invalidArguments, errMsg));
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces', () => {
	testValidateNewTicketSchema();
});
