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

const { determineTestGroup } = require('../../../../../../../../helper/utils');
const { times } = require('lodash');
const { src } = require('../../../../../../../../helper/path');

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const {
	generateRandomString,
	generateUUID,
	generateRandomNumber,
} = require('../../../../../../../../helper/dataGen');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../../../../../../../src/v5/models/tickets.comments');
const TicketComments = require(`${src}/models/tickets.comments`);

jest.mock('../../../../../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);

jest.mock('../../../../../../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/tickets.comments');
const CommentSchema = require(`${src}/schemas/tickets/tickets.comments`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Comments = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments`);
const { templates } = require(`${src}/utils/responseCodes`);

const testValidateNewComment = () => {
	const user = generateRandomString();
	const userJob = generateRandomString();

	describe.each([
		['message is validated', true, false, { templateData: { config: { comments: true } } }, undefined, generateRandomString()],
		['message is not validated', false, true, { templateData: { config: { comments: true } } }, templates.invalidArguments, generateRandomString()],
		['template does not support comments', false, false, { templateData: { config: { } } }, templates.invalidArguments, 'This ticket does not support comments.'],
		['comment permissions include user', true, false, { templateData: { config: { comments: true, permissions: { comment: [user] } } } }, undefined, generateRandomString()],
		['comment permissions include job', true, false, { templateData: { config: { comments: true, permissions: { comment: [userJob] } } } }, undefined, generateRandomString()],
		['comment permissions do not include user or job', false, false, { templateData: { config: { comments: true, permissions: { comment: [generateRandomString()] } } } }, templates.notAuthorized, 'You do not have template permission to create or edit comments on this ticket'],
	])('Validate new comment', (desc, shouldPass, validationFail, extraArgs, error, message) => {
		test(`${shouldPass ? 'should call next()' : `should respond with ${error.code}`} if ${desc}`, async () => {
			const data = {
				params: {},
				body: { message: generateRandomString() },
				session: generateRandomString(),
				...extraArgs,
			};
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };

			if (extraArgs.templateData.config.permissions?.comment) {
				Sessions.getUserFromSession.mockReturnValueOnce(user);
				JobsModel.getJobsByUsers.mockResolvedValueOnce([userJob]);
			}

			if (shouldPass) {
				CommentSchema.validateComment.mockResolvedValueOnce(message);
			} else if (validationFail) {
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
					expect.objectContaining({ code: error.code, message }));
			}

			if (extraArgs.templateData.config.permissions?.comment) {
				expect(Sessions.getUserFromSession).toHaveBeenCalledTimes(1);
				expect(Sessions.getUserFromSession).toHaveBeenCalledWith(req.session);
				expect(JobsModel.getJobsByUsers).toHaveBeenCalledTimes(1);
				expect(JobsModel.getJobsByUsers).toHaveBeenCalledWith(req.params.teamspace, [user]);
			}
		});
	});
};

const testValidateUpdateComment = () => {
	describe('Validate update comment', () => {
		const username = generateRandomString();
		const userJob = generateRandomString();
		const req = {
			params: {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: generateRandomString(),
				comment: generateRandomString(),
			},
			templateData: { config: { comments: true } },
		};

		const existingRef = generateUUID();
		const existingRef2 = generateUUID();
		const existingComment = {
			message: generateRandomString(),
			author: username,
			images: [existingRef],
			history: [{ images: [existingRef2] }, { message: generateRandomString() }],
		};
		const viewComment = {
			camera: {
				position: times(3, () => generateRandomNumber()),
				up: times(3, () => generateRandomNumber()),
				forward: times(3, () => generateRandomNumber()),
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
			[{ ...req, body: { views: viewComment } }, true, true, 'with a view'],
			[{ ...req, body: { images: [UUIDToString(existingRef)], message: existingComment.message } }, false, true, 'with no actual changes', { ...existingComment, history: undefined }],
			[{ ...req, body: { message: generateRandomString() }, templateData: { config: { comments: true, permissions: { comment: [username] } } } }, true, true, 'with permissions that include username'],
			[{ ...req, body: { message: generateRandomString() }, templateData: { config: { comments: true, permissions: { comment: [userJob] } } } }, true, true, 'with permissions that user job'],
			[{ ...req, body: { message: generateRandomString() }, templateData: { config: { comments: true, permissions: { comment: times(5, () => generateRandomString()) } } } }, false, true, 'with permissions do not include username or job', existingComment, templates.notAuthorized],
		])('Check if req arguments for updating a comment are valid', (request, shouldPass, passValidation, desc, comment = existingComment, error = templates.invalidArguments) => {
			afterEach(() => { jest.resetAllMocks(); });
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();

				Sessions.getUserFromSession.mockReturnValue(username);
				JobsModel.getJobsByUsers.mockResolvedValueOnce([userJob]);
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

describe(determineTestGroup(__filename), () => {
	testValidateNewComment();
	testValidateUpdateComment();
});
