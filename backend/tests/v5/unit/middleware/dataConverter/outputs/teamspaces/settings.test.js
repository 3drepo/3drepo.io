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

const { generateTemplate } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/middleware/dataConverter/outputs/common/tickets.templates');
const TicketTemplateUtils = require(`${src}/middleware/dataConverter/outputs/common/tickets.templates`);

const { templates } = require(`${src}/utils/responseCodes`);

const TeamspaceSettings = require(`${src}/middleware/dataConverter/outputs/teamspaces/settings`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testCastTicketSchemaOutput = () => {
	describe('Casting ticket schema output', () => {
		test('should convert all appropriate properties', () => {
			const templateData = generateTemplate();
			const castedTemplate = generateTemplate();

			const req = { templateData };

			TicketTemplateUtils.serialiseTicketTemplate.mockReturnValueOnce(castedTemplate);

			const next = jest.fn();
			TeamspaceSettings.castTicketSchemaOutput(req, {}, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, castedTemplate);
		});

		test('should catch errors gracefully', () => {
			const templateData = generateTemplate();
			const req = { templateData };

			TicketTemplateUtils.serialiseTicketTemplate.mockImplementationOnce(() => { throw new Error(); });

			const next = jest.fn();
			TeamspaceSettings.castTicketSchemaOutput(req, {}, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/settings', () => {
	testCastTicketSchemaOutput();
});
