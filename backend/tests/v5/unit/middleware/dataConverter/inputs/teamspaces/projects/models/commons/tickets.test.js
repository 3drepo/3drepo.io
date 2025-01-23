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

const { times } = require('lodash');

const { src } = require('../../../../../../../../helper/path');

const { generateRandomString, generateTemplate, generateTicket } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/middleware/dataConverter/inputs/teamspaces/settings');
const SettingsMW = require(`${src}/middleware/dataConverter/inputs/teamspaces/settings`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets');
const TicketSchema = require(`${src}/schemas/tickets`);

jest.mock('../../../../../../../../../../src/v5/models/tickets.templates');
const TemplateModelSchema = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const TicketModelSchema = require(`${src}/models/tickets`);

const Tickets = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets`);
const { createResponseCode, templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString, stringToUUID, generateUUIDString } = require(`${src}/utils/helper/uuids`);

const ticketArrTestErrorMsg = 'Expected body to contain an array of tickets';

const testValidateNewTicket = () => {
	describe('Validate new ticket', () => {
		test(`Should respond with ${templates.invalidArguments.code} if template is not provided`, async () => {
			const fn = jest.fn();
			const req = { body: {} };
			const res = {};
			await Tickets.validateNewTicket(req, res, fn);
			expect(fn).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, 'Template must be provided'));
		});

		test('Should not call next if template doesn\'t exist', async () => {
			const fn = jest.fn();
			const templateId = generateUUIDString();
			const req = { params: {}, body: { type: templateId } };
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementationOnce(() => {});

			await Tickets.validateNewTicket(req, res, fn);

			expect(fn).not.toHaveBeenCalled();
			expect(req.params.template).toEqual(stringToUUID(templateId));
		});

		test(`Should respond with ${templates.invalidArguments.code} if the template is deprecated`, async () => {
			const fn = jest.fn();
			const templateId = generateUUIDString();
			const req = { params: {}, body: { type: templateId } };
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementationOnce(async (_req, _res, next) => {
				// eslint-disable-next-line no-param-reassign
				_req.templateData = { deprecated: true };
				await next();
			});

			await Tickets.validateNewTicket(req, res, fn);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, 'Template has been deprecated'));

			expect(fn).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if the validation failed`, async () => {
			const fn = jest.fn();
			const templateId = generateUUIDString();
			const req = { params: {}, body: { type: templateId } };
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementationOnce(async (_req, _res, next) => {
				// eslint-disable-next-line no-param-reassign
				_req.templateData = { };
				await next();
			});

			const errMsg = generateRandomString();
			TicketSchema.validateTicket.mockRejectedValueOnce(new Error(errMsg));

			await Tickets.validateNewTicket(req, res, fn);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, errMsg));

			expect(fn).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if the processing read only values failed`, async () => {
			const fn = jest.fn();
			const templateId = generateUUIDString();
			const req = { params: {}, body: { type: templateId } };
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementationOnce(async (_req, _res, next) => {
				// eslint-disable-next-line no-param-reassign
				_req.templateData = { };
				await next();
			});

			const errMsg = generateRandomString();
			TicketSchema.validateTicket.mockResolvedValueOnce(req.body);
			TicketSchema.processReadOnlyValues.mockImplementationOnce(() => { throw new Error(errMsg); });

			await Tickets.validateNewTicket(req, res, fn);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, errMsg));

			expect(fn).not.toHaveBeenCalled();
		});

		test('Should call next if validation succeeded', async () => {
			const fn = jest.fn();
			const templateId = generateUUIDString();
			const req = { params: {}, body: { type: templateId } };
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementationOnce(async (_req, _res, next) => {
				// eslint-disable-next-line no-param-reassign
				_req.templateData = { };
				await next();
			});

			TicketSchema.validateTicket.mockResolvedValueOnce(req.body);

			await Tickets.validateNewTicket(req, res, fn);

			expect(fn).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const testValidateImportTickets = () => {
	const template = generateTemplate();
	const uniquePropName = generateRandomString();
	const uniqueModuleName = generateRandomString();
	template.properties.push({ name: uniquePropName, type: 'text', unique: true });
	template.modules.push({
		name: uniqueModuleName,
		properties: [{ name: uniqueModuleName, type: 'text', unique: true }],
	});

	const knownTemplateID = generateUUIDString();
	const deprecatedTemplateID = generateUUIDString();

	const duplicateUniqueValue = generateRandomString();
	const duplicateUniqueProp = [];
	const duplicateModuleUniqueProp = [];

	const goodTickets = times(5, () => generateTicket(template));

	times(3, () => {
		const duplicatePropTicket = generateTicket(template);
		duplicatePropTicket.properties[uniquePropName] = duplicateUniqueValue;
		const duplicateModulePropTicket = generateTicket(template);
		duplicateModulePropTicket.modules[uniqueModuleName][uniqueModuleName] = duplicateUniqueValue;

		duplicateUniqueProp.push(duplicatePropTicket);
		duplicateModuleUniqueProp.push(duplicateModulePropTicket);
	});

	const badTicket = generateTicket(template);
	const throwTicket = generateTicket(template);

	const templateCheck = async (req, res, next) => {
		const { template: tem } = req.params;

		const temIdStr = UUIDToString(tem);
		if (temIdStr === knownTemplateID) {
			req.templateData = { ...template, _id: stringToUUID(knownTemplateID) };
			await next();
			return;
		}

		if (temIdStr === deprecatedTemplateID) {
			req.templateData = { ...template, deprecated: true, _id: stringToUUID(deprecatedTemplateID) };
			await next();
		}
	};

	const validation = (t, p, m, tem, ticket) => {
		if (ticket === badTicket) return Promise.reject(templates.invalidArguments);
		if (ticket === throwTicket) return Promise.reject(new Error('abc'));
		return Promise.resolve({ ...ticket, type: tem._id });
	};
	const processReadOnly = (e, ticket) => {
		// eslint-disable-next-line no-param-reassign
		ticket.processed = true;
		return Promise.resolve();
	};

	describe.each([
		['template is not provided', { query: {} }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template is not provided (query set to null)', { query: null }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template does not exist', { query: { template: generateUUIDString() } }, false],
		['template is provided within the ticket', { query: {}, body: { tickets: [{ type: knownTemplateID }] } }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['a deprecated template is provided', { query: { template: deprecatedTemplateID } }, false, createResponseCode(templates.invalidArguments, 'Template has been deprecated')],
		['the request has invalid body', { body: 1 }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['validation caused an unrecognised error', { body: { tickets: [throwTicket] } }, false, createResponseCode(templates.invalidArguments, 'abc')],
		['tickets array doesn\'t exist', { body: { } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['tickets is not an array', { body: { tickets: 1 } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array is empty', { body: { tickets: [] } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array contains a bad ticket', { body: { tickets: [...goodTickets, badTicket] } }, false, templates.invalidArguments],
		['ticket array contains duplicate unique properties', { body: { tickets: duplicateUniqueProp } }, false, createResponseCode(templates.invalidArguments, 'The unique property can not have the same value multiple times.')],
		['ticket array contains duplicate unique module properties', { body: { tickets: duplicateModuleUniqueProp } }, false, createResponseCode(templates.invalidArguments, 'The unique property can not have the same value multiple times.')],
		['all tickets are valid', {}, true],
	])('Validate import tickets', (desc, additionalReq, success, expectedRes) => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		test(`Should ${success ? 'succeed and call next()' : `fail and ${expectedRes ? `respond with ${expectedRes.code}` : 'not respond'}`} if ${desc}`, async () => {
			const req = {
				params: {},
				query: { template: knownTemplateID },
				body: { tickets: goodTickets },
				...additionalReq,
			};
			const fn = jest.fn();
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementation(templateCheck);
			TicketSchema.validateTicket.mockImplementation(validation);
			TicketSchema.deserialiseUUIDsInTicket.mockImplementation((t) => t);
			TicketSchema.processReadOnlyValues.mockImplementation(processReadOnly);

			await Tickets.validateImportTickets(req, res, fn);

			if (success) {
				expect(fn).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
				req.body.tickets.forEach(({ processed, type }) => {
					expect(processed).toBeTruthy();
					expect(type).toEqual(stringToUUID(knownTemplateID));
				});

				expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledTimes(1);
				expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledWith(req, res, expect.anything());
				const nTickets = req.body.tickets.length;
				expect(TicketSchema.validateTicket).toHaveBeenCalledTimes(nTickets);
				expect(TicketSchema.deserialiseUUIDsInTicket).toHaveBeenCalledTimes(nTickets);
				expect(TicketSchema.processReadOnlyValues).toHaveBeenCalledTimes(nTickets);
			} else if (expectedRes) {
				expect(fn).not.toHaveBeenCalled();
				// We don't always expect a response - the response might've been done on a mocked function.
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedRes);
			} else {
				expect(Responder.respond).not.toHaveBeenCalled();
			}
		});
	});
};

const testValidateUpdateTicket = () => {
	describe('Validate update ticket', () => {
		test(`Should respond with ${templates.ticketNotFound.code} if ticket doesn't exist`, async () => {
			const fn = jest.fn();
			const req = { params: {}, body: { } };
			const res = {};

			TicketModelSchema.getTicketById.mockRejectedValueOnce(templates.ticketNotFound);

			await Tickets.validateUpdateTicket(req, res, fn);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ticketNotFound);
			expect(fn).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if the validation failed`, async () => {
			const fn = jest.fn();
			const req = { params: {}, body: { } };
			const res = {};
			const ticket = { [generateRandomString()]: generateRandomString() };
			const template = { [generateRandomString()]: generateRandomString() };

			TicketModelSchema.getTicketById.mockResolvedValueOnce(ticket);
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(template);
			const errMsg = generateRandomString();
			TicketSchema.validateTicket.mockRejectedValueOnce(new Error(errMsg));

			await Tickets.validateUpdateTicket(req, res, fn);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, errMsg));
			expect(fn).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if there is nothing to update`, async () => {
			const fn = jest.fn();
			const req = { params: {}, body: { } };
			const res = {};
			const ticket = { [generateRandomString()]: generateRandomString() };
			const template = { [generateRandomString()]: generateRandomString() };

			TicketModelSchema.getTicketById.mockResolvedValueOnce(ticket);
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(template);
			TicketSchema.validateTicket.mockResolvedValueOnce({ properties: {}, modules: {} });

			await Tickets.validateUpdateTicket(req, res, fn);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				expect.objectContaining({ code: templates.invalidArguments.code }));
			expect(fn).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if the processing read only values failed`, async () => {
			const fn = jest.fn();
			const req = { params: {}, body: { } };
			const res = {};
			const ticket = { [generateRandomString()]: generateRandomString() };
			const template = { [generateRandomString()]: generateRandomString() };

			TicketModelSchema.getTicketById.mockResolvedValueOnce(ticket);
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(template);
			const errMsg = generateRandomString();
			TicketSchema.validateTicket.mockResolvedValueOnce(req.body);
			TicketSchema.processReadOnlyValues.mockImplementationOnce(() => { throw new Error(errMsg); });

			await Tickets.validateUpdateTicket(req, res, fn);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, errMsg));

			expect(fn).not.toHaveBeenCalled();
		});

		test('Should call next if validation succeeded', async () => {
			const fn = jest.fn();
			const req = { params: {}, body: { modules: { mod1: generateRandomString(), mod2: {} } } };
			const res = {};
			const ticket = { [generateRandomString()]: generateRandomString() };
			const template = { [generateRandomString()]: generateRandomString() };

			TicketModelSchema.getTicketById.mockResolvedValueOnce(ticket);
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(template);
			TicketSchema.validateTicket.mockResolvedValueOnce(req.body);

			await Tickets.validateUpdateTicket(req, res, fn);

			expect(fn).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('Should call next if validation succeeded and the template is deprecated', async () => {
			const fn = jest.fn();
			const req = {
				params: {},
				body: { [generateRandomString()]: generateRandomString() },
				session: { user: { username: generateRandomString() } },
			};
			const res = {};
			const ticket = { [generateRandomString()]: generateRandomString() };
			const template = {
				deprecated: true,
				[generateRandomString()]: generateRandomString(),
			};

			TicketSchema.validateTicket.mockResolvedValueOnce(req.body);
			TicketModelSchema.getTicketById.mockResolvedValueOnce(ticket);
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(template);
			await Tickets.validateUpdateTicket(req, res, fn);

			expect(fn).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(TicketSchema.processReadOnlyValues).toHaveBeenCalled();
			expect(TicketSchema.processReadOnlyValues).toHaveBeenCalledWith(ticket, req.body,
				req.session.user.username);
		});
	});
};

const testValidateUpdateMultipleTickets = () => {
	const template = generateTemplate();
	const uniquePropName = generateRandomString();
	const uniqueModuleName = generateRandomString();
	template.properties.push({ name: uniquePropName, type: 'text', unique: true });
	template.modules.push({
		name: uniqueModuleName,
		properties: [{ name: uniqueModuleName, type: 'text', unique: true }],
	});

	const knownTemplateID = generateUUIDString();
	const deprecatedTemplateID = generateUUIDString();
	const duplicateUniqueValue = generateRandomString();
	const existingTickets = [];
	const duplicateUniqueProp = [];
	const duplicateModuleUniqueProp = [];

	const goodTickets = times(5, () => {
		const ticket = generateTicket(template);

		const duplicatePropTicket = generateTicket(template);
		duplicatePropTicket.properties[uniquePropName] = duplicateUniqueValue;

		const duplicateModulePropTicket = generateTicket(template);
		duplicateModulePropTicket.modules[uniqueModuleName][uniqueModuleName] = duplicateUniqueValue;

		existingTickets.push(
			{ ...generateTicket(template), _id: stringToUUID(ticket._id) },
			{ ...generateTicket(template), _id: stringToUUID(duplicateModulePropTicket._id) },
			{ ...generateTicket(template), _id: stringToUUID(duplicatePropTicket._id) });
		duplicateUniqueProp.push(duplicatePropTicket);
		duplicateModuleUniqueProp.push(duplicateModulePropTicket);

		return ticket;
	});

	const badTicket = generateTicket(template);
	existingTickets.push({ ...badTicket });

	const templateCheck = async (req, res, next) => {
		const { template: tem } = req.params;

		const temIdStr = UUIDToString(tem);
		if (temIdStr === knownTemplateID) {
			req.templateData = { ...template, _id: stringToUUID(knownTemplateID) };
			await next();
			return;
		}

		if (temIdStr === deprecatedTemplateID) {
			req.templateData = { ...template, deprecated: true, _id: stringToUUID(deprecatedTemplateID) };
			await next();
		}
	};

	const validation = (t, p, m, tem, ticket) => (ticket._id === badTicket._id
		? Promise.reject(templates.invalidArguments) : Promise.resolve(ticket));
	const processReadOnly = (e, ticket) => {
		// eslint-disable-next-line no-param-reassign
		ticket.processed = true;
		return Promise.resolve();
	};

	const idNotFound = generateUUIDString();

	describe.each([
		['template is not provided', { query: {} }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template is not provided (query set to null)', { query: null }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template does not exist', { query: { template: generateUUIDString() } }, false],
		['template is provided within the ticket', { query: {}, body: { tickets: [{ type: knownTemplateID }] } }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['the request has invalid body', { body: 1 }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['tickets array doesn\'t exist', { body: { } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['tickets is not an array', { body: { tickets: 1 } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array is empty', { body: { tickets: [] } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array contains a ticket with no _id', { body: { tickets: [{ ...goodTickets[0], _id: undefined }] } }, false, createResponseCode(templates.invalidArguments, '_id field must be provided for all tickets')],
		['ticket array contains a ticket with invalid _id', { body: { tickets: [{ ...goodTickets[0], _id: idNotFound }] } }, false, createResponseCode(templates.invalidArguments, `The following IDs were not found: ${idNotFound}`)],
		['ticket array contains a bad ticket', { body: { tickets: [badTicket] } }, false, createResponseCode(templates.invalidArguments)],
		['ticket array contains duplicate unique properties', { body: { tickets: duplicateUniqueProp } }, false, createResponseCode(templates.invalidArguments, 'The unique property can not have the same value multiple times.')],
		['ticket array contains duplicate unique module properties', { body: { tickets: duplicateModuleUniqueProp } }, false, createResponseCode(templates.invalidArguments, 'The unique property can not have the same value multiple times.')],
		['all tickets are valid', {}, true],
		['a deprecated template is provided', { query: { template: deprecatedTemplateID } }, true],
	])('Validate update multiple tickets', (desc, additionalReq, success, expectedRes) => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		test(`Should ${success ? 'succeed and call next()' : `fail and ${expectedRes ? `respond with ${expectedRes.code}` : 'not respond'}`} if ${desc}`, async () => {
			const req = {
				params: {},
				query: { template: knownTemplateID },
				body: { tickets: goodTickets },
				...additionalReq,
			};
			const fn = jest.fn();
			const res = {};

			SettingsMW.checkTicketTemplateExists.mockImplementation(templateCheck);
			TicketSchema.validateTicket.mockImplementation(validation);
			TicketSchema.deserialiseUUIDsInTicket.mockImplementation((t) => t);
			TicketSchema.processReadOnlyValues.mockImplementation(processReadOnly);
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(template);
			TicketModelSchema.getTicketsByQuery.mockResolvedValueOnce(existingTickets);

			await Tickets.validateUpdateMultipleTickets(req, res, fn);

			if (success) {
				expect(fn).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
				req.body.tickets.forEach(({ processed }) => {
					expect(processed).toBeTruthy();
				});

				expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledTimes(1);
				expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledWith(req, res, expect.anything());
				const nTickets = req.body.tickets.length;
				expect(TicketSchema.validateTicket).toHaveBeenCalledTimes(nTickets);
				expect(TicketSchema.deserialiseUUIDsInTicket).toHaveBeenCalledTimes(nTickets);
				expect(TicketSchema.processReadOnlyValues).toHaveBeenCalledTimes(nTickets);
			} else if (expectedRes) {
				expect(fn).not.toHaveBeenCalled();
				// We don't always expect a response - the response might've been done on a mocked function.
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedRes);
			} else {
				expect(Responder.respond).not.toHaveBeenCalled();
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets', () => {
	testValidateNewTicket();
	testValidateImportTickets();
	testValidateUpdateTicket();
	testValidateUpdateMultipleTickets();
});
