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

const { determineTestGroup } = require('../../../../../../../../helper/utils');
const { times } = require('lodash');

const { src } = require('../../../../../../../../helper/path');

const {
	generateRandomString,
	generateTemplate,
	generateRandomObject,
} = require('../../../../../../../../helper/dataGen');
const { generateTicket } = require('../../../../../../../../helper/dataGen.tickets');
const { isEqual } = require('../../../../../../../../../../src/v5/utils/helper/objects');
const { basePropertyLabels } = require('../../../../../../../../../../src/v5/schemas/tickets/templates.constants');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);

jest.mock('../../../../../../../../../../src/v5/middleware/dataConverter/inputs/teamspaces/settings');
const SettingsMW = require(`${src}/middleware/dataConverter/inputs/teamspaces/settings`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets');
const TicketSchema = require(`${src}/schemas/tickets`);

jest.mock('../../../../../../../../../../src/v5/models/tickets.templates');
const TemplateModelSchema = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const TicketModelSchema = require(`${src}/models/tickets`);

const Tickets = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets`);
const { createResponseCode, templates } = require(`${src}/utils/responseCodes`);
const { presetModules, propTypes } = require(`${src}/schemas/tickets/templates.constants`);
const { UUIDToString, stringToUUID, generateUUIDString } = require(`${src}/utils/helper/uuids`);

const ticketArrTestErrorMsg = 'Expected body to contain an array of tickets';

const testValidateNewTicket = () => {
	const knownTemplateID = generateUUIDString();
	const deprecatedTemplateID = generateUUIDString();
	const unknownTemplateID = generateUUIDString();
	const user = generateRandomString();
	const userJob = generateRandomString();
	const teamspace = generateRandomString();
	const errMsg = generateRandomString();
	const permissionError = createResponseCode(templates.notAuthorized, 'You do not have template permission to create this ticket');

	describe.each([
		['template is not provided', { body: {} }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template does not exist', { body: { type: unknownTemplateID } }, false],
		['the template is deprecated', { body: { type: deprecatedTemplateID } }, false, createResponseCode(templates.invalidArguments, 'Template has been deprecated')],
		['validation failed', {}, false, createResponseCode(templates.invalidArguments, errMsg), true],
		['validation succeeded', {}, true],
		['create permissions are not configured', {}, true, undefined, false, { }],
		['the user has create permission', {}, true, undefined, false, { create: [user] }],
		['one of the user jobs has create permission', {}, true, undefined, false, { create: [userJob, generateRandomString()] }],
		['neither the user nor their jobs has create permission', {}, false, permissionError, false, { create: [generateRandomString()] }],
		['the create permission list is empty', {}, false, permissionError, false, { create: [] }],
	])('Validate new ticket', (desc, additionalReq = {}, success = false, expectedRes, validationFails = false, permissions) => {
		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test(`Should ${success ? 'succeed and call next()' : `fail and ${expectedRes ? `respond with ${expectedRes.code}` : 'not respond'}`} if ${desc}`,
			async () => {
				const req = { params: { teamspace }, body: { type: knownTemplateID }, session: {}, ...additionalReq };
				const fn = jest.fn();
				const res = {};
				const templateId = req.body.type;

				SettingsMW.checkTicketTemplateExists.mockImplementation(
					async (_req, _res, next) => {
						const id = UUIDToString(_req.params.template);

						if ([knownTemplateID, deprecatedTemplateID].includes(id)) {
							// eslint-disable-next-line no-param-reassign
							_req.templateData = {
								_id: stringToUUID(id),
								config: { permissions },
								deprecated: id === deprecatedTemplateID,
							};

							await next();
						}
					},
				);

				Sessions.getUserFromSession.mockReturnValue(user);
				JobsModel.getJobsByUsers.mockResolvedValue([userJob]);
				TicketSchema.validateTickets.mockImplementation(() => {
					if (validationFails) {
						return Promise.reject(new Error(errMsg));
					}

					return Promise.resolve([{ newTicket: req.body }]);
				});

				await Tickets.validateNewTicket(req, res, fn);

				if (templateId) {
					expect(req.params.template).toEqual(stringToUUID(templateId));
				}

				if (success) {
					expect(fn).toHaveBeenCalledTimes(1);
					expect(Responder.respond).not.toHaveBeenCalled();
					expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledTimes(1);
					expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledWith(req, res, expect.anything());
					expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
				} else {
					expect(fn).not.toHaveBeenCalled();
					if (expectedRes) {
						expect(Responder.respond).toHaveBeenCalledTimes(1);
						expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedRes);
					} else {
						expect(Responder.respond).not.toHaveBeenCalled();
					}
				}

				if (permissions?.create) {
					expect(Sessions.getUserFromSession).toHaveBeenCalledWith(req.session);
					expect(JobsModel.getJobsByUsers).toHaveBeenCalledTimes(1);
					expect(JobsModel.getJobsByUsers).toHaveBeenCalledWith(teamspace, [user]);
				} else {
					expect(JobsModel.getJobsByUsers).not.toHaveBeenCalled();
				}
			},
		);
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
	const user = generateRandomString();
	const userJob = generateRandomString();
	const permissionError = createResponseCode(templates.notAuthorized, 'You do not have template permission to create this ticket');

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

	const validation = (t, p, m, tem, tickets) => {
		if (tickets.includes(badTicket)) return Promise.reject(templates.invalidArguments);
		if (tickets.includes(throwTicket)) return Promise.reject(new Error('abc'));
		if (tickets === duplicateUniqueProp) {
			return Promise.reject(new Error(`The unique property ${uniquePropName} can not have the same value multiple times.`));
		}
		if (tickets === duplicateModuleUniqueProp) {
			return Promise.reject(new Error(`The unique property ${uniqueModuleName}.${uniqueModuleName} can not have the same value multiple times.`));
		}
		return Promise.resolve(tickets.map((ticket) => ({
			newTicket: { ...ticket, type: tem._id, processed: true },
		})));
	};

	describe.each([
		['template is not provided', { query: {} }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template is not provided (query set to null)', { query: null }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template does not exist', { query: { template: generateUUIDString() } }, false],
		['template is provided within the ticket', { query: {}, body: { tickets: [{ type: knownTemplateID }] } }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['a deprecated template is provided', { query: { template: deprecatedTemplateID } }, false, createResponseCode(templates.invalidArguments, 'Template has been deprecated')],
		['the request has invalid body', { body: 1 }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['validation caused an unrecognised error', { body: { tickets: [throwTicket] } }, false, createResponseCode(templates.invalidArguments, 'abc')],
		['tickets array doesn\'t exist', { body: {} }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['tickets is not an array', { body: { tickets: 1 } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array is empty', { body: { tickets: [] } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array contains a bad ticket', { body: { tickets: [...goodTickets, badTicket] } }, false, templates.invalidArguments],
		['ticket array contains duplicate unique properties', { body: { tickets: duplicateUniqueProp } }, false, createResponseCode(templates.invalidArguments, `The unique property ${uniquePropName} can not have the same value multiple times.`)],
		['ticket array contains duplicate unique module properties', { body: { tickets: duplicateModuleUniqueProp } }, false, createResponseCode(templates.invalidArguments, `The unique property ${uniqueModuleName}.${uniqueModuleName} can not have the same value multiple times.`)],
		['all tickets are valid', {}, true],
		['the user has create permission', {}, true, undefined, { create: [user] }],
		['one of the user jobs has create permission', {}, true, undefined, { create: [userJob, generateRandomString()] }],
		['neither the user nor their jobs has create permission', {}, false, permissionError, { create: [generateRandomString()] }],
		['the create permission list is empty', {}, false, permissionError, { create: [] }],
	])('Validate import tickets', (desc, additionalReq, success, expectedRes, permissions) => {
		afterEach(() => {
			jest.restoreAllMocks();
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

			SettingsMW.checkTicketTemplateExists.mockImplementation(async (_req, _res, next) => {
				const { template: tem } = _req.params;

				const temIdStr = UUIDToString(tem);
				if (temIdStr === knownTemplateID) {
					// eslint-disable-next-line no-param-reassign
					_req.templateData = {
						...template,
						config: { permissions },
						_id: stringToUUID(knownTemplateID) };
					await next();
					return;
				}

				if (temIdStr === deprecatedTemplateID) {
					// eslint-disable-next-line no-param-reassign
					_req.templateData = {
						...template,
						config: { permissions },
						deprecated: true,
						_id:
						stringToUUID(deprecatedTemplateID) };
					await next();
				}
			});

			Sessions.getUserFromSession.mockReturnValue(user);
			JobsModel.getJobsByUsers.mockResolvedValue([userJob]);
			TicketSchema.validateTickets.mockImplementation(validation);

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
				expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
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

const testHasTemplateViewPermission = () => {
	const user = generateRandomString();
	const userJob = generateRandomString();
	const teamspace = generateRandomString();
	const permissionError = createResponseCode(templates.notAuthorized, 'You do not have template permission to view this ticket');

	describe.each([
		['permissions are not configured', undefined, true],
		['view permissions are not configured', { create: [generateRandomString()] }, true],
		['the user has view permission', { view: [user] }, true],
		['one of the user jobs has view permission', { view: [userJob] }, true],
		['neither the user nor their jobs has view permission', { view: [generateRandomString()] }, false, permissionError],
		['the view permission list is empty', { view: [] }, false, permissionError],
		['the user only has create permission', { create: [user], view: [generateRandomString()] }, false, permissionError],
	])('Has template view permission', (desc, permissions, success, expectedRes) => {
		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test(`Should ${success ? 'succeed and call next()' : `fail and respond with ${expectedRes.code}`} if ${desc}`,
			async () => {
				const req = {
					params: { teamspace },
					session: {},
					templateData: { config: { permissions } },
				};
				const res = {};
				const fn = jest.fn();

				Sessions.getUserFromSession.mockReturnValue(user);
				JobsModel.getJobsByUsers.mockResolvedValue([userJob]);

				await Tickets.hasTemplateViewPermission(req, res, fn);

				if (success) {
					expect(fn).toHaveBeenCalledTimes(1);
					expect(Responder.respond).not.toHaveBeenCalled();
				} else {
					expect(fn).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedRes);
				}

				if (permissions?.view) {
					expect(Sessions.getUserFromSession).toHaveBeenCalledWith(req.session);
					expect(JobsModel.getJobsByUsers).toHaveBeenCalledTimes(1);
					expect(JobsModel.getJobsByUsers).toHaveBeenCalledWith(teamspace, [user]);
				} else {
					expect(Sessions.getUserFromSession).not.toHaveBeenCalled();
					expect(JobsModel.getJobsByUsers).not.toHaveBeenCalled();
				}
			},
		);
	});
};

const testValidateUpdateTicket = () => {
	const template = { _id: generateUUIDString(), ...generateRandomObject() };
	const ticket = { type: template._id, ...generateRandomObject() };
	const knownTicketID = generateUUIDString();
	const user = generateRandomString();
	const userJob = generateRandomString();
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const errMsg = generateRandomString();
	const permissionError = createResponseCode(templates.notAuthorized, 'You do not have template permission to edit this ticket');
	const standardUpdate = generateRandomObject();
	const statusUpdate = {
		type: generateRandomString(),
		properties: { [basePropertyLabels.STATUS]: generateRandomString() },
	};
	const assignUpdate = { properties: { [basePropertyLabels.ASSIGNEES]: [generateRandomString()] } };
	const allUpdate = {
		title: generateRandomString(),
		properties: {
			[basePropertyLabels.STATUS]: generateRandomString(),
			[basePropertyLabels.ASSIGNEES]: [generateRandomString()],
		},
	};

	describe.each([
		['ticket does not exist', generateRandomString(), false, templates.ticketNotFound],
		['validation failed', undefined, false, createResponseCode(templates.invalidArguments, errMsg), true],
		['validation succeeded', undefined, true],
		['there is nothing to update', undefined, false, templates.ok, false, undefined, ticket],
		['edit permissions are not configured', undefined, true, undefined, false, { }],
		['edit default permissions are not configured', undefined, true, undefined, false, { assign: [generateRandomString()], status: [generateRandomString()] }],
		['the user has default permission', undefined, true, undefined, false, { edit: { default: [user] } }],
		['the job of the user has default permission', undefined, true, undefined, false, { edit: { default: [userJob] } }],
		['the user has default permission (status update)', undefined, true, undefined, false, { edit: { default: [user] } }, statusUpdate],
		['the job of the user has default permission (status update)', undefined, true, undefined, false, { edit: { default: [userJob] } }, statusUpdate],
		['the user has default permission (assignees update)', undefined, true, undefined, false, { edit: { default: [user] } }, assignUpdate],
		['the job of the user has default permission (assignees update)', undefined, true, undefined, false, { edit: { default: [userJob] } }, assignUpdate],
		['the user has edit permission for status update', undefined, true, undefined, false, { edit: { status: [user] } }, statusUpdate],
		['the job of the user has edit permission for status update', undefined, true, undefined, false, { edit: { status: [userJob] } }, statusUpdate],
		['the user has edit permission for assignes update', undefined, true, undefined, false, { edit: { assign: [user] } }, assignUpdate],
		['the job of the user has edit permission for assignees update', undefined, true, undefined, false, { edit: { assign: [userJob] } }, assignUpdate],
		['the user has all permissions (all updates)', undefined, true, undefined, false, { edit: { assign: [user], default: [user], status: [user] } }, allUpdate],
		['neither the user nor their jobs has edit permission', undefined, false, permissionError, false, { edit: { default: [generateRandomString()] } }],
		['neither the user nor their jobs has edit permission for status update', undefined, false, permissionError, false, { edit: { status: [generateRandomString()] } }, statusUpdate],
		['neither the user nor their jobs has edit permission for assignees update', undefined, false, permissionError, false, { edit: { assign: [generateRandomString()] } }, assignUpdate],
	])('Validate update ticket', (desc, ticketID = knownTicketID, success = false, expectedRes, validationFails = false, permissions, update = standardUpdate) => {
		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test(`Should ${success ? 'succeed and call next()' : `fail and ${expectedRes ? `respond with ${expectedRes.code}` : 'not respond'}`} if ${desc}`,
			async () => {
				const req = {
					params: { teamspace, project, model, ticket: ticketID },
					body: update,
					session: {},
				};
				const fn = jest.fn();
				const res = {};

				TicketModelSchema.getTicketById.mockImplementation(() => (
					ticketID === knownTicketID ? Promise.resolve(ticket) : Promise.reject(expectedRes)));
				TemplateModelSchema.getTemplateById.mockImplementation(() => Promise.resolve({
					...template,
					config: { permissions },
				}));

				Sessions.getUserFromSession.mockReturnValue(user);
				JobsModel.getJobsByUsers.mockResolvedValue([userJob]);
				TicketSchema.validateTickets.mockImplementation(() => (validationFails
					? Promise.reject(new Error(errMsg))
					: Promise.resolve([{ newTicket: update === ticket ? undefined : update }])));

				await Tickets.validateUpdateTicket(req, res, fn);

				if (success) {
					expect(fn).toHaveBeenCalledTimes(1);
					expect(Responder.respond).not.toHaveBeenCalled();
					expect(TicketModelSchema.getTicketById).toHaveBeenCalledTimes(1);
					expect(TicketModelSchema.getTicketById).toHaveBeenCalledWith(teamspace, project, model,
						req.params.ticket);
					expect(TemplateModelSchema.getTemplateById).toHaveBeenCalledTimes(1);
					expect(TemplateModelSchema.getTemplateById).toHaveBeenCalledWith(teamspace, template._id);
					expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
				} else {
					expect(fn).not.toHaveBeenCalled();
					if (expectedRes) {
						expect(Responder.respond).toHaveBeenCalledTimes(1);
						expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedRes);
					} else {
						expect(Responder.respond).not.toHaveBeenCalled();
					}
				}

				if (permissions?.edit) {
					expect(Sessions.getUserFromSession).toHaveBeenCalledWith(req.session);
					expect(JobsModel.getJobsByUsers).toHaveBeenCalledTimes(1);
					expect(JobsModel.getJobsByUsers).toHaveBeenCalledWith(teamspace, [user]);
				} else {
					expect(JobsModel.getJobsByUsers).not.toHaveBeenCalled();
				}
			},
		);
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
	const user = generateRandomString();
	const userJob = generateRandomString();
	const knownTemplateID = generateUUIDString();
	const deprecatedTemplateID = generateUUIDString();
	const duplicateUniqueValue = generateRandomString();
	const existingTickets = [];
	const duplicateUniqueProp = [];
	const duplicateModuleUniqueProp = [];
	const permissionError = createResponseCode(templates.notAuthorized, 'You do not have template permission to edit this ticket');

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

	const validation = (t, p, m, tem, tickets, { existingData } = {}) => {
		if (tickets.some(({ _id }) => _id === badTicket._id)) {
			return Promise.reject(templates.invalidArguments);
		}

		if (tickets === duplicateUniqueProp) {
			return Promise.reject(new Error(`The unique property ${uniquePropName} can not have the same value multiple times.`));
		}
		if (tickets === duplicateModuleUniqueProp) {
			return Promise.reject(new Error(`The unique property ${uniqueModuleName}.${uniqueModuleName} can not have the same value multiple times.`));
		}

		return Promise.resolve(tickets.map((ticket, i) => {
			const oldTicket = existingData?.[i];
			if (isEqual(ticket, { ...oldTicket, _id: UUIDToString(oldTicket?._id) })) {
				return undefined;
			}

			return { newTicket: { ...ticket, processed: true }, existingData: oldTicket };
		}).filter(Boolean));
	};

	const idNotFound = generateUUIDString();

	describe.each([
		['template is not provided', { query: {} }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template is not provided (query set to null)', { query: null }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['template does not exist', { query: { template: generateUUIDString() } }, false],
		['template is provided within the ticket', { query: {}, body: { tickets: [{ type: knownTemplateID }] } }, false, createResponseCode(templates.invalidArguments, 'Template must be provided')],
		['the request has invalid body', { body: 1 }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['tickets array doesn\'t exist', { body: {} }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['tickets is not an array', { body: { tickets: 1 } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array is empty', { body: { tickets: [] } }, false, createResponseCode(templates.invalidArguments, ticketArrTestErrorMsg)],
		['ticket array contains a ticket with no _id', { body: { tickets: [{ ...goodTickets[0], _id: undefined }] } }, false, createResponseCode(templates.invalidArguments, '_id field must be provided for all tickets')],
		['ticket array contains a ticket with invalid _id', { body: { tickets: [{ ...goodTickets[0], _id: idNotFound }] } }, false, createResponseCode(templates.invalidArguments, `The following IDs were not found: ${idNotFound}`)],
		['ticket array contains a bad ticket', { body: { tickets: [badTicket] } }, false, createResponseCode(templates.invalidArguments)],
		['ticket array contains duplicate unique properties', { body: { tickets: duplicateUniqueProp } }, false, createResponseCode(templates.invalidArguments, `The unique property ${uniquePropName} can not have the same value multiple times.`)],
		['ticket array contains duplicate unique module properties', { body: { tickets: duplicateModuleUniqueProp } }, false, createResponseCode(templates.invalidArguments, `The unique property ${uniqueModuleName}.${uniqueModuleName} can not have the same value multiple times.`)],
		['all tickets are valid', {}, true],
		['the user has default permission', { body: { tickets: [{ ...goodTickets[0], title: generateRandomString() }] } }, true, undefined, { edit: { default: [user] } }],
		['the job of the user has default permission', { body: { tickets: [{ ...goodTickets[0], title: generateRandomString() }] } }, true, undefined, { edit: { default: [userJob] } }],
		['the user has default permission (status update)', undefined, true, undefined, { edit: { default: [user] } }],
		['the job of the user has default permission (status update)', undefined, true, undefined, { edit: { default: [userJob] } }],
		['the user has default permission (assignees update)', { body: { tickets: [{ ...goodTickets[0], properties: { [basePropertyLabels.ASSIGNEES]: [user] } }] } }, true, undefined, { edit: { default: [user] } }],
		['the job of the user has default permission (assignees update)', { body: { tickets: [{ ...goodTickets[0], properties: { [basePropertyLabels.ASSIGNEES]: [userJob] } }] } }, true, undefined, { edit: { default: [userJob] } }],
		['the user has edit permission for status update', undefined, true, undefined, { edit: { status: [user] } }],
		['the job of the user has edit permission for status update', undefined, true, undefined, { edit: { status: [userJob] } }],
		['the user has edit permission for assignees update', { body: { tickets: [{ ...goodTickets[0], properties: { [basePropertyLabels.ASSIGNEES]: [user] } }] } }, true, undefined, { edit: { assign: [user] } }],
		['the job of the user has edit permission for assignees update', { body: { tickets: [{ ...goodTickets[0], properties: { [basePropertyLabels.ASSIGNEES]: [userJob] } }] } }, true, undefined, { edit: { assign: [userJob] } }],
		['neither the user nor their jobs has edit permission', undefined, false, permissionError, { edit: { default: [generateRandomString()] } }],
		['neither the user nor their jobs has edit permission for status update', undefined, false, permissionError, { edit: { status: [generateRandomString()] } }],
		['neither the user nor their jobs has edit permission for assignees update', { body: { tickets: [{ ...goodTickets[0], properties: { [basePropertyLabels.ASSIGNEES]: [user] } }] } }, false, permissionError, { edit: { assign: [generateRandomString()] } }],
		['tickets have no changes', { body: { tickets: existingTickets.slice(0, 2).map((ticket) => ({ ...ticket, _id: UUIDToString(ticket._id) })) } }, false, templates.ok],
		['a deprecated template is provided', { query: { template: deprecatedTemplateID } }, true],
	])('Validate update multiple tickets', (desc, additionalReq, success, expectedRes, permissions) => {
		afterEach(() => {
			jest.restoreAllMocks();
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

			Sessions.getUserFromSession.mockReturnValue(user);
			JobsModel.getJobsByUsers.mockResolvedValue([userJob]);
			SettingsMW.checkTicketTemplateExists.mockImplementation(templateCheck);
			TicketSchema.validateTickets.mockImplementation(validation);
			TemplateModelSchema.getTemplateById.mockResolvedValue({ ...template, config: { permissions } });
			TicketModelSchema.getTicketsByQuery.mockResolvedValue(existingTickets);

			await Tickets.validateUpdateMultipleTickets(req, res, fn);

			if (success) {
				expect(fn).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
				req.body.tickets.forEach(({ processed }) => {
					expect(processed).toBeTruthy();
				});

				expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledTimes(1);
				expect(SettingsMW.checkTicketTemplateExists).toHaveBeenCalledWith(req, res, expect.anything());
				expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(1);
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

const testValidateTagProperty = () => {
	const rootProp = generateRandomString();
	const moduleName = generateRandomString();
	const moduleProp = generateRandomString();
	const presetModuleProp = generateRandomString();
	const textProp = generateRandomString();
	const template = {
		properties: [
			{ name: rootProp, type: propTypes.TAGS },
			{ name: textProp, type: propTypes.TEXT },
		],
		modules: [{
			name: moduleName,
			properties: [{ name: moduleProp, type: propTypes.TAGS }],
		}, {
			type: presetModules.SEQUENCING,
			properties: [{ name: presetModuleProp, type: propTypes.TAGS }],
		}],
	};
	describe.each([
		['the property is a root tags property', rootProp, true, `properties.${rootProp}`],
		['the property is a module tags property', encodeURIComponent(`${moduleName}::${moduleProp}`), true, `modules.${moduleName}.${moduleProp}`],
		['the property is a preset module tags property', encodeURIComponent(`${presetModules.SEQUENCING}::${presetModuleProp}`), true, `modules.${presetModules.SEQUENCING}.${presetModuleProp}`],
		['the property does not exist', generateRandomString(), false, templates.invalidArguments],
		['the property is not a tags property', textProp, false, templates.invalidArguments],
		['the property path has too many module delimiters', `${moduleName}::${moduleProp}::${rootProp}`, false, templates.invalidArguments],
	])('Validate tag property', (desc, property, success, expectedOutput) => {
		test(`Should ${success ? 'call next()' : `respond with ${expectedOutput.code}`} if ${desc}`, async () => {
			const req = { params: { property }, templateData: template };
			const res = {};
			const next = jest.fn();

			await Tickets.validateTagProperty(req, res, next);

			if (success) {
				expect(next).toHaveBeenCalledTimes(1);
				expect(req.tagProperty).toEqual(expectedOutput);
				expect(Responder.respond).not.toHaveBeenCalled();
			} else {
				expect(next).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledWith(
					req, res, expect.objectContaining({ code: expectedOutput.code }));
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	testValidateNewTicket();
	testHasTemplateViewPermission();
	testValidateImportTickets();
	testValidateUpdateTicket();
	testValidateUpdateMultipleTickets();
	testValidateTagProperty();
});
