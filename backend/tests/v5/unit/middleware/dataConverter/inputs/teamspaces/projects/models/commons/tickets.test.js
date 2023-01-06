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

const { src, image } = require('../../../../../../../../helper/path');

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { generateRandomString, generateUUID } = require('../../../../../../../../helper/services');
const FS = require('fs');
const { UUIDToString } = require('../../../../../../../../../../src/v5/utils/helper/uuids');

jest.mock('../../../../../../../../../../src/v5/models/tickets.comments');
const TicketComments = require(`${src}/models/tickets.comments`);

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
const { stringToUUID, generateUUIDString } = require(`${src}/utils/helper/uuids`);

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

const testValidateNewComment = () => {
	describe('Validate new comment', () => {
		const params = {};
		describe.each([
			[{ params, body: { comment: '' } }, false, 'with invalid comment'],
			[{ params, body: { comment: generateRandomString() } }, true, 'with valid comment'],
			[{ params, body: { images: [] } }, false, 'with invalid images'],
			[{ params, body: { images: [FS.readFileSync(image, { encoding: 'base64' })] } }, true, 'with valid image'],
			[{ params, body: {} }, false, 'with empty body'],
		])('Check if req arguments for new comment are valid', (data, shouldPass, desc) => {
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();
				const req = { ...cloneDeep(data) };
				TicketComments.getCommentById.mockRejectedValueOnce(templates.commentNotFound);

				await Tickets.validateNewComment(req, {}, mockCB);
				if (shouldPass) {
					expect(mockCB).toHaveBeenCalledTimes(1);
				} else {
					expect(mockCB).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(req, {},
						expect.objectContaining({ code: templates.invalidArguments.code }));
				}
			});
		});
	});
};

const testValidateUpdateComment = () => {
	describe('Validate update comment', () => {
		const params = { };
		const existingRef = generateUUID();

		describe.each([
			[{ params, body: { comment: generateRandomString() } }, false, 'with deleted comment', { deleted: true }],
			[{ params, body: { comment: '' } }, false, 'with invalid comment'],
			[{ params, body: { comment: generateRandomString() } }, true, 'with valid comment'],
			[{ params, body: { images: [] } }, false, 'with invalid images'],
			[{ params, body: { images: [FS.readFileSync(image, { encoding: 'base64' })] } }, true, 'with valid base64 image'],
			[{ params, body: { images: [UUIDToString(existingRef)] } }, true, 'with valid image ref', { images: [existingRef] }],
			[{ params, body: {} }, false, 'with empty body'],
		])('Check if req arguments for new comment are valid', (data, shouldPass, desc, comment = {}) => {
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();
				const req = { ...cloneDeep(data) };
				TicketComments.getCommentById.mockResolvedValueOnce(comment);

				await Tickets.validateUpdateComment(req, {}, mockCB);
				if (shouldPass) {
					expect(mockCB).toHaveBeenCalledTimes(1);
				} else {
					expect(mockCB).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(req, {},
						expect.objectContaining({ code: templates.invalidArguments.code }));
				}
			});
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets', () => {
	testValidateNewTicket();
	testValidateUpdateTicket();
	testValidateNewComment();
	testValidateUpdateComment();
});
