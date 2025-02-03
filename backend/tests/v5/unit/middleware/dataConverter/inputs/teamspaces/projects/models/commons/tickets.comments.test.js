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

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { generateRandomString, generateUUID } = require('../../../../../../../../helper/services');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../../../../../../../src/v5/models/tickets.comments');
const TicketComments = require(`${src}/models/tickets.comments`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/tickets.comments');
const CommentSchema = require(`${src}/schemas/tickets/tickets.comments`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Comments = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments`);
const { templates } = require(`${src}/utils/responseCodes`);

const testValidateNewComment = () => {
	describe.each([
		['Message is validated', true, { templateData: { config: { comments: true } } }, generateRandomString()],
		['Message is not validated', false, { templateData: { config: { comments: true } } }, generateRandomString()],
		['Template does not support comments', false, { templateData: { config: { } } }, 'This ticket does not support comments.'],
	])('Validate new comment', (desc, shouldPass, extraArgs, message) => {
		test(`${shouldPass ? 'should call next()' : 'should respond with invalidArguments'} of ${desc}`, async () => {
			const data = { params: {}, body: { message: generateRandomString() }, ...extraArgs };
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };

			if (shouldPass) {
				CommentSchema.validateComment.mockResolvedValueOnce(message);
			} else {
				CommentSchema.validateComment.mockRejectedValueOnce(new Error(message));
			}

			await Comments.validateNewComment(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(req.body).toEqual(message);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, {},
					expect.objectContaining({ code: templates.invalidArguments.code, message }));
			}
		});
	});
};

const testValidateUpdateComment = () => {
	describe('Validate update comment', () => {
		const req = {
			params: {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: generateRandomString(),
				comment: generateRandomString(),
			},
			session: { user: { username: generateRandomString() } },
			templateData: { config: { comments: true } },
		};

		const existingRef = generateUUID();
		const existingRef2 = generateUUID();
		const existingComment = {
			message: generateRandomString(),
			author: req.session.user.username,
			images: [existingRef],
			history: [{ images: [existingRef2] }, { message: generateRandomString() }],
		};
		const viewComment = {
			camera: {
				position: [
					0,
					0,
					0,
				],
				up: [
					0,
					0,
					0,
				],
				forward: [
					0,
					0,
					0,
				],
				type: 'perspective',
			},
			clippingPlanes: [],
		};

		describe.each([
			[{ ...req, body: { message: generateRandomString() } }, false, true, 'with non authorized user', { ...existingComment, author: generateRandomString() }, templates.notAuthorized],
			[{ ...req, body: { message: generateRandomString() } }, false, true, 'with deleted comment', { ...existingComment, deleted: true }],
			[{ ...req, body: { message: generateRandomString() } }, false, true, 'with an imported comment', { ...existingComment, importedAt: new Date() }, templates.notAuthorized],
			[{ ...req, body: { message: '' } }, false, false, 'with invalid message', existingComment, templates.invalidArguments],
			[{ ...req, body: { message: generateRandomString() } }, true, true, 'with a message'],
			[{ ...req, body: { views: viewComment } }, true, true, 'with a message'],
			[{ ...req, body: { images: [UUIDToString(existingRef)], message: existingComment.message } }, false, true, 'with no actual changes', { ...existingComment, history: undefined }],
		])('Check if req arguments for updating a comment are valid', (request, shouldPass, passValidation, desc, comment = existingComment, error = templates.invalidArguments) => {
			afterEach(() => { jest.resetAllMocks(); });
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();

				Tickets.getTicketById.mockResolvedValueOnce({ [generateRandomString()]: generateRandomString() });
				TicketComments.getCommentById.mockResolvedValueOnce(comment);

				if (passValidation) {
					CommentSchema.validateComment.mockImplementationOnce((t) => Promise.resolve(t));
				} else {
					CommentSchema.validateComment.mockRejectedValueOnce(new Error());
				}

				await Comments.validateUpdateComment(request, {}, mockCB);
				if (shouldPass) {
					expect(mockCB).toHaveBeenCalledTimes(1);
				} else {
					expect(mockCB).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(request, {},
						expect.objectContaining({ code: error.code }));
				}
			});
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments', () => {
	testValidateNewComment();
	testValidateUpdateComment();
});
