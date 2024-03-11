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

const { src, image } = require('../../../../../../../../helper/path');

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { generateRandomString, generateUUID } = require('../../../../../../../../helper/services');
const FS = require('fs');
const { UUIDToString } = require('../../../../../../../../../../src/v5/utils/helper/uuids');

jest.mock('../../../../../../../../../../src/v5/models/tickets.comments');
const TicketComments = require(`${src}/models/tickets.comments`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Comments = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments`);
const { templates } = require(`${src}/utils/responseCodes`);

const testValidateNewComment = () => {
	describe('Validate new comment', () => {
		const params = {};
		describe.each([
			[{ params, body: { message: '' } }, false, 'with empty message'],
			[{ params, body: { message: generateRandomString(1201) } }, false, 'with too long message'],
			[{ params, body: { message: generateRandomString() } }, true, 'with valid message'],
			[{ params, body: { images: [] } }, false, 'with invalid images'],
			[{ params, body: { images: [FS.readFileSync(image, { encoding: 'base64' })] } }, true, 'with valid image'],
			[{ params, body: {} }, false, 'with empty body'],
		])('Check if req arguments for new comment are valid', (data, shouldPass, desc) => {
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();
				const req = { ...cloneDeep(data) };

				await Comments.validateNewComment(req, {}, mockCB);
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
		const req = {
			params: {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: generateRandomString(),
				comment: generateRandomString(),
			},
			session: { user: { username: generateRandomString() } },
		};

		const existingRef = generateUUID();
		const existingRef2 = generateUUID();
		const existingComment = {
			message: generateRandomString(),
			author: req.session.user.username,
			images: [existingRef],
			history: [{ images: [existingRef2] }, { message: generateRandomString() }],
		};

		describe.each([
			[{ ...req, body: { message: generateRandomString() } }, false, 'with non authorized user', { ...existingComment, author: generateRandomString() }, templates.notAuthorized],
			[{ ...req, body: { message: generateRandomString() } }, false, 'with deleted comment', { ...existingComment, deleted: true }],
			[{ ...req, body: { message: '' } }, false, 'with invalid message'],
			[{ ...req, body: { message: generateRandomString() } }, true, 'with valid message'],
			[{ ...req, body: { images: [] } }, false, 'with invalid images'],
			[{ ...req, body: { images: [FS.readFileSync(image, { encoding: 'base64' })] } }, true, 'with valid base64 image'],
			[{ ...req, body: { images: [UUIDToString(existingRef), UUIDToString(existingRef2)] } }, true, 'with valid image refs'],
			[{ ...req, body: { images: [UUIDToString(existingRef2)] } }, true, 'with valid image ref from history'],
			[{ ...req, body: { images: [UUIDToString(generateUUID())] } }, false, 'with invalid image ref'],
			[{ ...req, body: { images: [UUIDToString(existingRef2)], message: generateRandomString() } }, true, 'with both an image ref and a new message'],
			[{ ...req, body: { images: [UUIDToString(existingRef)], message: existingComment.message } }, false, 'with no actual changes', { ...existingComment, history: undefined }],
			[{ ...req, body: {} }, false, 'with empty body'],
		])('Check if req arguments for updating a comment are valid', (request, shouldPass, desc, comment = existingComment, error = templates.invalidArguments) => {
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();

				Tickets.getTicketById.mockResolvedValueOnce({ [generateRandomString()]: generateRandomString() });
				TicketComments.getCommentById.mockResolvedValueOnce(comment);

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
