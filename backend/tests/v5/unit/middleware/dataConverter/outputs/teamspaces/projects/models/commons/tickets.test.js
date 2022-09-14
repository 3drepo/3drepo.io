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

const { cloneDeep, times } = require('lodash');
const { src } = require('../../../../../../../../helper/path');
const { generateTemplate, generateTicket, generateRandomString, generateRandomDate, generateUUID } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/middleware/dataConverter/outputs/common/tickets.templates');
const TicketTemplateHelper = require(`${src}/middleware/dataConverter/outputs/common/tickets.templates`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/templates');
const TicketTemplateSchema = require(`${src}/schemas/tickets/templates`);
const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../../../../../../src/v5/models/tickets.templates');
const TemplateModel = require(`${src}/models/tickets.templates`);

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const TicketOutputMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets`);

const testSerialiseTicketTemplate = () => {
	describe('Serialise full ticket template', () => {
		test('should not show all fields if show deprecated is set to false', () => {
			const templateData = generateTemplate();
			const fullTemplateData = generateTemplate();
			const serialisedTemplateData = generateTemplate();

			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(fullTemplateData);
			TicketTemplateHelper.serialiseTicketTemplate.mockReturnValueOnce(serialisedTemplateData);

			const req = { templateData };
			TicketOutputMiddleware.serialiseFullTicketTemplate(req, {});

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(templateData);

			expect(TicketTemplateHelper.serialiseTicketTemplate).toHaveBeenCalledTimes(1);
			expect(TicketTemplateHelper.serialiseTicketTemplate).toHaveBeenCalledWith(fullTemplateData, true);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, serialisedTemplateData);
		});

		test('should show all fields if show deprecated is set to true', () => {
			const templateData = generateTemplate();
			const fullTemplateData = generateTemplate();
			const serialisedTemplateData = generateTemplate();

			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(fullTemplateData);
			TicketTemplateHelper.serialiseTicketTemplate.mockReturnValueOnce(serialisedTemplateData);

			const req = { templateData, query: { showDeprecated: 'true' } };
			TicketOutputMiddleware.serialiseFullTicketTemplate(req, {});

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(templateData);

			expect(TicketTemplateHelper.serialiseTicketTemplate).toHaveBeenCalledTimes(1);
			expect(TicketTemplateHelper.serialiseTicketTemplate).toHaveBeenCalledWith(fullTemplateData, false);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, serialisedTemplateData);
		});

		test('should catch the error and respond gracefully on error', () => {
			TicketOutputMiddleware.serialiseFullTicketTemplate(undefined, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(undefined, {}, templates.unknown);
		});
	});
};

const testSerialiseTicket = () => {
	describe('Serialise Ticket', () => {
		const teamspace = generateRandomString();
		test(`Should respond with ${templates.unknown.code} if an error has been thrown`, async () => {
			TemplateModel.getTemplateById.mockRejectedValueOnce(new Error(generateRandomString()));

			const ticket = { type: generateRandomString() };

			const req = { params: { teamspace }, ticket };

			await expect(TicketOutputMiddleware.serialiseTicket(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplateById).toHaveBeenCalledWith(teamspace, ticket.type);

			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});

		test('Should remove deprecated values if showDeprecated is set to false', async () => {
			const propName = generateRandomString();
			const modName = generateRandomString();
			const modName2 = generateRandomString();
			const template = {
				properties: [
					{
						name: propName,
						deprecated: true,
						type: propTypes.TEXT,
					},
				],
				modules: [
					{
						name: modName,
						properties: [{
							name: propName,
							deprecated: true,
							type: propTypes.TEXT,
						},
						],
					},
					{
						name: modName2,
						deprecated: true,
						properties: [],
					},
				],
			};

			TemplateModel.getTemplateById.mockResolvedValueOnce(template);
			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(template);

			const ticket = {
				_id: generateUUID(),
				type: generateRandomString(),
				properties: { [propName]: generateRandomString() },
				modules: {
					[modName]: {
						[propName]: generateRandomString(),
					},
					[modName2]: {
						[generateRandomString()]: generateRandomString(),
					},
				},
			};

			const req = { params: { teamspace }, ticket };

			await expect(TicketOutputMiddleware.serialiseTicket(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplateById).toHaveBeenCalledWith(teamspace, ticket.type);

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(template);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok,
				{ ...ticket, _id: UUIDToString(ticket._id), properties: {}, modules: { [modName]: {} } });
		});
		test('Should cast dates correctly', async () => {
			const propName = generateRandomString();
			const propName2 = generateRandomString();
			const modName = generateRandomString();
			const template = {
				properties: [
					{
						name: propName,
						type: propTypes.DATE,
					},
					{
						name: propName2,
						type: propTypes.DATE,
					},
					{
						name: generateRandomString(),
						type: propTypes.TEXT,
					},
				],
				modules: [
					{
						type: modName,
						properties: [{
							name: propName,
							type: propTypes.DATE,
						},
						],
					},
				],
			};

			TemplateModel.getTemplateById.mockResolvedValueOnce(template);
			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(template);

			const ticket = {
				_id: generateUUID(),
				type: generateRandomString(),
				properties: {
					[propName]: generateRandomDate(),
					[propName2]: undefined,
					[generateRandomString()]: generateRandomString(),
				},
				modules: {
					[modName]: {
						[propName]: generateRandomDate(),
						[generateRandomString()]: generateRandomString(),
					},
				},
			};

			const req = { params: { teamspace }, ticket };

			await expect(TicketOutputMiddleware.serialiseTicket(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplateById).toHaveBeenCalledWith(teamspace, ticket.type);

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(template);

			const res = cloneDeep(ticket);

			res._id = UUIDToString(res._id);
			res.properties[propName] = res.properties[propName].getTime();
			res.modules[modName][propName] = res.modules[modName][propName].getTime();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, res);
		});

		test('Should cast uuids correctly', async () => {
			const propName = generateRandomString();
			const propName2 = generateRandomString();
			const imageProp = generateRandomString();
			const modName = generateRandomString();
			const template = {
				properties: [
					{
						name: propName,
						type: propTypes.VIEW,
					},
					{
						name: propName2,
						type: propTypes.VIEW,
					},
					{
						name: imageProp,
						type: propTypes.IMAGE,
					},
				],
				modules: [
					{
						name: modName,
						properties: [{
							name: propName,
							type: propTypes.VIEW,
						},
						{
							name: propName2,
							type: propTypes.VIEW,
						},
						{
							name: imageProp,
							type: propTypes.IMAGE,
						},
						],
					},
				],
			};

			TemplateModel.getTemplateById.mockResolvedValueOnce(template);
			TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(template);

			const ticket = {
				_id: generateUUID(),
				type: generateRandomString(),
				properties: {
					[imageProp]: generateUUID(),
					[propName2]: {
						state: {},
					},
					[generateRandomString()]: generateRandomString(),
				},
				modules: {
					[modName]: {
						[propName]: {
							state: {
								highlightedGroups: times(5, () => generateUUID()),
								colorOverrideGroups: times(2, () => generateUUID()),
								hiddenGroups: [],
								shownGroups: times(1, () => generateUUID()),
								transformGroups: times(10, () => generateUUID()),
							},
						},
						[imageProp]: generateUUID(),
						[generateRandomString()]: generateRandomString(),
					},
				},
			};

			const req = { params: { teamspace }, ticket };

			await expect(TicketOutputMiddleware.serialiseTicket(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplateById).toHaveBeenCalledWith(teamspace, ticket.type);

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledWith(template);

			const res = cloneDeep(ticket);

			res._id = UUIDToString(res._id);
			Object.keys(res.modules[modName][propName].state).forEach((fieldName) => {
				res.modules[modName][propName].state[fieldName] = res.modules[modName][propName].state[fieldName]
					.map(UUIDToString);
			});

			res.properties[imageProp] = UUIDToString(res.properties[imageProp]);
			res.modules[modName][imageProp] = UUIDToString(res.modules[modName][imageProp]);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, res);
		});
	});
};

const testSerialiseTicketList = () => {
	describe('Serialise ticket list', () => {
		const teamspace = generateRandomString();
		test(`Should respond with ${templates.unknown.code} if an error has been thrown`, async () => {
			TemplateModel.getTemplatesByQuery.mockRejectedValueOnce(new Error(generateRandomString()));

			const tickets = times(5, () => ({ type: generateRandomString() }));

			const req = { params: { teamspace }, tickets };

			await expect(TicketOutputMiddleware.serialiseTicketList(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplatesByQuery).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplatesByQuery).toHaveBeenCalledWith(
				teamspace, { _id: { $in: tickets.map(({ type }) => type) } },
			);

			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});

		test('Should serialise tickets correctly', async () => {
			const templateData = times(3, () => ({ ...generateTemplate(), _id: generateRandomString() }));

			TemplateModel.getTemplatesByQuery.mockResolvedValueOnce(templateData);

			TicketTemplateSchema.generateFullSchema.mockImplementation((t) => t);

			const tickets = times(10, (i) => generateTicket(templateData[i % templateData.length], true));

			const req = { params: { teamspace }, tickets };

			await expect(TicketOutputMiddleware.serialiseTicketList(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplatesByQuery).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplatesByQuery).toHaveBeenCalledWith(
				teamspace, { _id: { $in: templateData.map(({ _id }) => _id) } },
			);

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(templateData.length);

			expect(Responder.respond).toHaveBeenCalledTimes(1);

			// Cheating here - the serialiser is already tested by testSerialiseTicket.
			const output = Responder.respond.mock.calls[0][3];

			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, output);
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets', () => {
	testSerialiseTicketTemplate();
	testSerialiseTicket();
	testSerialiseTicketList();
});
