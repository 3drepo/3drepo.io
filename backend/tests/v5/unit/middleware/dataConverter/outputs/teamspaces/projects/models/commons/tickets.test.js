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

const { src } = require('../../../../../../../../helper/path');
const { generateTemplate } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/middleware/dataConverter/outputs/common/tickets.templates');
const TicketTemplateHelper = require(`${src}/middleware/dataConverter/outputs/common/tickets.templates`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/templates');
const TicketTemplateSchema = require(`${src}/schemas/tickets/templates`);

const { templates } = require(`${src}/utils/responseCodes`);

const TicketOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets`);

const testSerialiseTicketTemplate = () => {
	describe('Serialise full ticket template', () => {
		test('should show all fields if show deprecated is set to false', () => {
			const templateData = generateTemplate();
			const fullTemplateData = generateTemplate();
			const serialisedTemplateData = generateTemplate();

			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(fullTemplateData);
			TicketTemplateHelper.serialiseTicketSchema.mockReturnValueOnce(serialisedTemplateData);

			const req = { templateData };
			TicketOutputMiddlewares.serialiseFullTicketTemplate(req, {});

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(templateData);

			expect(TicketTemplateHelper.serialiseTicketSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateHelper.serialiseTicketSchema).toHaveBeenCalledWith(fullTemplateData, true);

			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, serialisedTemplateData);
		});

		test('should show all fields if show deprecated is set to true', () => {
			const templateData = generateTemplate();
			const fullTemplateData = generateTemplate();
			const serialisedTemplateData = generateTemplate();

			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(fullTemplateData);
			TicketTemplateHelper.serialiseTicketSchema.mockReturnValueOnce(serialisedTemplateData);

			const req = { templateData, query: { showDeprecated: 'true' } };
			TicketOutputMiddlewares.serialiseFullTicketTemplate(req, {});

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(templateData);

			expect(TicketTemplateHelper.serialiseTicketSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateHelper.serialiseTicketSchema).toHaveBeenCalledWith(fullTemplateData, false);

			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, serialisedTemplateData);
		});

		test('should catch the error and respond gracefully on error', () => {
			TicketOutputMiddlewares.serialiseFullTicketTemplate(undefined, {});

			expect(Responder.respond).toHaveBeenCalledWith(undefined, {}, templates.unknown);
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets', () => {
	testSerialiseTicketTemplate();
});
