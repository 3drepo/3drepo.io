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

const { cloneDeep, times, uniq } = require('lodash');
const { src } = require('../../../../../../../../helper/path');
const { generateTemplate, generateTicket, generateRandomString, generateRandomDate, generateUUID } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/middleware/dataConverter/outputs/common/tickets.templates');
const TicketTemplateHelper = require(`${src}/middleware/dataConverter/outputs/common/tickets.templates`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/templates');
const TicketTemplateSchema = require(`${src}/schemas/tickets/templates`);
const { propTypes, viewGroups } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../../../../../../src/v5/models/tickets.templates');
const TemplateModel = require(`${src}/models/tickets.templates`);

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const TicketOutputMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets`);

const testSerialiseTemplatesList = () => {
	describe('Serialise templates list', () => {
		test('should not show all fields if getDetails is not set to true', () => {
			const req = { templates: times(10, () => generateTemplate()), query: {} };

			TicketOutputMiddleware.serialiseTemplatesList(req, {});

			expect(TicketTemplateSchema.generateFullSchema).not.toHaveBeenCalled();
			expect(TicketTemplateHelper.serialiseTicketTemplate).not.toHaveBeenCalled();

			const formattedTemplates = req.templates.map((t) => ({ ...t, _id: UUIDToString(t._id) }));

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, { templates: formattedTemplates });
		});

		test('should show all fields if getDetails is set to true', () => {
			const req = {
				templates: times(10, () => generateTemplate()),
				query: { getDetails: 'true' },
			};

			const serialisedTemplateData = generateTemplate();

			times(10, () => {
				TicketTemplateSchema.generateFullSchema.mockReturnValueOnce(generateTemplate());
				TicketTemplateHelper.serialiseTicketTemplate.mockReturnValueOnce(serialisedTemplateData);
			});

			TicketOutputMiddleware.serialiseTemplatesList(req, {});

			expect(TicketTemplateSchema.generateFullSchema).toHaveBeenCalledTimes(req.templates.length);
			expect(TicketTemplateHelper.serialiseTicketTemplate).toHaveBeenCalledTimes(req.templates.length);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok,
				{ templates: times(10, () => serialisedTemplateData) });
		});

		test('should catch the error and respond gracefully on error', () => {
			TicketOutputMiddleware.serialiseTemplatesList(undefined, {});

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(undefined, {}, templates.unknown);
		});
	});
};

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
			const imageListProp = generateRandomString();
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
					{
						name: imageListProp,
						type: propTypes.IMAGE_LIST,
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
						{
							name: imageListProp,
							type: propTypes.IMAGE_LIST,
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
					[imageListProp]: times(3, () => generateUUID()),
					[propName2]: {
						state: {},
					},
					[generateRandomString()]: generateRandomString(),
				},
				modules: {
					[modName]: {
						[propName]: {
							state: {
								[viewGroups.COLORED]: times(2, () => ({ group: generateUUID() })),
								[viewGroups.HIDDEN]: [],
								[viewGroups.TRANSFORMED]: times(10, () => ({ group: generateUUID() })),
							},
						},
						[imageProp]: generateUUID(),
						[imageListProp]: times(3, () => generateUUID()),
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
					.map((entry) => ({ ...entry, group: UUIDToString(entry.group) }));
			});

			res.properties[imageProp] = UUIDToString(res.properties[imageProp]);
			res.properties[imageListProp] = res.properties[imageListProp].map(UUIDToString);
			res.modules[modName][imageProp] = UUIDToString(res.modules[modName][imageProp]);
			res.modules[modName][imageListProp] = res.modules[modName][imageListProp].map(UUIDToString);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, res);
		});
	});
};

const testSerialiseTicketList = () => {
	describe('Serialise ticket list', () => {
		const teamspace = generateRandomString();
		const templateData = times(3, () => ({ ...generateTemplate(), _id: generateRandomString() }));
		const tickets = times(10, (i) => generateTicket(templateData[i % templateData.length], true));

		test(`Should respond with ${templates.unknown.code} if an error has been thrown`, async () => {
			TemplateModel.getTemplatesByQuery.mockRejectedValueOnce(new Error(generateRandomString()));

			const req = { params: { teamspace }, tickets };

			await expect(TicketOutputMiddleware.serialiseTicketList(req, {})).resolves.toBeUndefined();

			expect(TemplateModel.getTemplatesByQuery).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getTemplatesByQuery).toHaveBeenCalledWith(
				teamspace, { _id: { $in: uniq(tickets.map(({ type }) => type)) } },
			);

			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});

		test('Should serialise tickets correctly', async () => {
			TemplateModel.getTemplatesByQuery.mockResolvedValueOnce(templateData);

			TicketTemplateSchema.generateFullSchema.mockImplementation((t) => t);

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

const testSerialiseTicketHistory = () => {
	const date = generateRandomDate();
	const uuid = generateUUID();
	const text = generateRandomString();

	describe.each([
		['there is no history property', undefined, false, {}],
		['history is empty', [], true, []],
		['history entry has a date type', [{ date }], true, [{ date: date.getTime() }]],
		['history entry has a uuid type', [{ uuid }], true, [{ uuid: UUIDToString(uuid) }]],
		['history entry has an object', [{ changes: { uuidProp: uuid, dateProp: date, txtProp: text } }], true, [{ changes: { uuidProp: UUIDToString(uuid), dateProp: date.getTime(), txtProp: text } }]],
	])('Validate serialize ticket history query', (description, history, succeed, expectedOutcome) => {
		test(`Should ${succeed ? 'succeed' : 'fail'} if ${description}`, async () => {
			const req = { history };
			const res = {};

			await TicketOutputMiddleware.serialiseTicketHistory(req, res);

			if (succeed) {
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, { history: expectedOutcome });
			} else {
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.unknown);
			}
		});
	},
	);
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets', () => {
	testSerialiseTicketTemplate();
	testSerialiseTicket();
	testSerialiseTicketList();
	testSerialiseTemplatesList();
	testSerialiseTicketHistory();
});
