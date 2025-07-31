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

const { cloneDeep, times } = require('lodash');

const { src } = require('../../../../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomObject, generateUUID, generateUUIDString, generateRandomBuffer } = require('../../../../../../helper/services');

const Comments = require(`${src}/processors/teamspaces/projects/models/commons/tickets.comments`);

jest.mock('../../../../../../../../src/v5/models/tickets.comments');
const CommentsModel = require(`${src}/models/tickets.comments`);

const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.groups');
const GroupsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const testAddComment = () => {
	describe('Add comment', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		const author = generateRandomString();
		const expectedOutput = {
			_id: generateRandomString(),
			...generateRandomObject(),
		};

		test('should call addComment in model and return whatever it returns', async () => {
			const commentData = generateRandomString();
			CommentsModel.addComment.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.addComment(teamspace, project, model, ticket, commentData, author))
				.resolves.toEqual(expectedOutput._id);

			expect(CommentsModel.addComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.addComment).toHaveBeenCalledWith(teamspace, project, model,
				ticket, commentData, author);

			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(1);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(1);

			expect(FilesManager.storeFiles).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(
				events.NEW_COMMENT, { teamspace,
					project,
					model,
					data: expectedOutput });
		});

		test('should process image and store a ref', async () => {
			const imageBuffer = generateRandomBuffer();
			const commentData = {
				[generateRandomString()]: generateRandomString(),
				images: [imageBuffer],
			};
			CommentsModel.addComment.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.addComment(teamspace, project, model, ticket, commentData, author))
				.resolves.toEqual(expectedOutput._id);

			const imgRef = CommentsModel.addComment.mock.calls[0][4].images[0];
			expect(CommentsModel.addComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.addComment).toHaveBeenCalledWith(teamspace, project, model, ticket,
				{ ...commentData, images: [imgRef] }, author);
			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(1);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(1);

			const meta = { teamspace, project, model, ticket };
			expect(FilesManager.storeFiles).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFiles).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				[{ id: imgRef, data: imageBuffer, meta }]);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(
				events.NEW_COMMENT, { teamspace,
					project,
					model,
					data: expectedOutput });
		});
	});
};

const testImportComments = () => {
	describe('Import comments', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const author = generateRandomString();
		const nIterations = 10;

		test('should call addComment in model and return whatever it returns', async () => {
			const commentData = times(nIterations, () => ({
				ticket: generateRandomString(),
				comments: times(nIterations, () => ({
					message: generateRandomString(),
				})),
			}));

			const expectedOutput = commentData.flatMap(({ comments }) => comments
				.map((comment) => ({ ...comment, _id: generateUUID() })));

			CommentsModel.importComments.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.importComments(teamspace, project, model, commentData, author))
				.resolves.toEqual(expectedOutput.map(({ _id }) => _id));

			expect(CommentsModel.importComments).toHaveBeenCalledTimes(1);
			expect(CommentsModel.importComments).toHaveBeenCalledWith(teamspace, project, model,
				commentData, author);
			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(nIterations * nIterations);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(nIterations);

			expect(FilesManager.storeFiles).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(expectedOutput.length);
			expectedOutput.forEach((data) => {
				expect(EventsManager.publish).toHaveBeenCalledWith(
					events.NEW_COMMENT, { teamspace,
						project,
						model,
						data });
			});
		});

		test('should process image and store a ref', async () => {
			const commentData = times(nIterations, () => ({
				ticket: generateRandomString(),
				comments: times(nIterations, () => ({
					[generateRandomString()]: generateRandomString(),
					images: [generateRandomBuffer()],
				})),
			}));
			const expectedOutput = commentData.flatMap(({ comments }) => comments
				.map((comment) => ({ ...comment, _id: generateUUID() })));

			CommentsModel.importComments.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.importComments(teamspace, project, model, cloneDeep(commentData), author))
				.resolves.toEqual(expectedOutput.map(({ _id }) => _id));

			const commentsWithRefs = CommentsModel.importComments.mock.calls[0][3];

			expect(CommentsModel.importComments).toHaveBeenCalledTimes(1);
			expect(CommentsModel.importComments).toHaveBeenCalledWith(teamspace, project, model,
				expect.any(Array), author);

			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(nIterations * nIterations);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(nIterations);

			expect(FilesManager.storeFiles).toHaveBeenCalledTimes(1);
			const storeFilesParams = commentsWithRefs.flatMap(({ ticket, comments }, i) => comments.map(
				({ images: [imgRef], ...others }, j) => {
					const { images, ...orgComment } = commentData[i].comments[j];
					expect(others).toEqual(orgComment);

					const meta = { teamspace, project, model, ticket };
					return { id: imgRef, data: images[0], meta };
				}));

			expect(FilesManager.storeFiles).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL, storeFilesParams);

			expect(EventsManager.publish).toHaveBeenCalledTimes(expectedOutput.length);
			expectedOutput.forEach((data) => {
				expect(EventsManager.publish).toHaveBeenCalledWith(
					events.NEW_COMMENT, { teamspace,
						project,
						model,
						data });
			});
		});
	});
};

const testUpdateComment = () => {
	describe('Update comment', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		const oldComment = { [generateRandomString()]: generateRandomString() };

		test('should call updateComment in model', async () => {
			const updateData = generateRandomString();

			await expect(Comments.updateComment(teamspace, project, model, ticket, oldComment, updateData))
				.resolves.toEqual(undefined);

			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(1);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(1);
			expect(CommentsModel.updateComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.updateComment).toHaveBeenCalledWith(teamspace, project, model, ticket,
				oldComment, updateData);

			expect(FilesManager.storeFiles).not.toHaveBeenCalled();
		});

		test('should process image and store a ref', async () => {
			const imageBuffer = generateRandomBuffer();
			const updateData = {
				[generateRandomString()]: generateRandomString(),
				images: [imageBuffer, generateUUIDString()],
			};

			await expect(Comments.updateComment(teamspace, project, model, ticket, oldComment, updateData))
				.resolves.toEqual(undefined);

			const imgRef = CommentsModel.updateComment.mock.calls[0][5].images[0];
			expect(CommentsModel.updateComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.updateComment).toHaveBeenCalledWith(teamspace, project, model, ticket,
				oldComment, updateData);

			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(1);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(1);

			const meta = { teamspace, project, model, ticket };
			expect(FilesManager.storeFiles).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFiles).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				[{ id: imgRef, data: imageBuffer, meta }]);
		});
	});
};

const testDeleteComment = () => {
	describe('Delete comment', () => {
		test('should call deleteComment in model with the expected parameters', async () => {
			const teamspace = generateRandomString();
			const oldComment = generateRandomString();

			CommentsModel.deleteComment.mockResolvedValueOnce(undefined);

			await expect(Comments.deleteComment(teamspace, oldComment));

			expect(CommentsModel.deleteComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.deleteComment).toHaveBeenCalledWith(teamspace, oldComment);
		});
	});
};

const testGetCommentsByTicket = () => {
	describe('Get comments by ticket', () => {
		test('should call getCommentsByTicket in model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();

			const expectedOutput = generateRandomString();

			CommentsModel.getCommentsByTicket.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket))
				.resolves.toEqual(expectedOutput);

			expect(CommentsModel.getCommentsByTicket).toHaveBeenCalledTimes(1);
			expect(CommentsModel.getCommentsByTicket).toHaveBeenCalledWith(teamspace, project, model,
				ticket, { });
		});
		test('should call getCommentsByTicket in model with the expected projection and sort (ascending)', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();

			const expectedOutput = generateRandomString();
			const sortBy = generateRandomString();
			const sort = { [sortBy]: 1 };

			CommentsModel.getCommentsByTicket.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket, { sortBy, sortDesc: false }))
				.resolves.toEqual(expectedOutput);

			expect(CommentsModel.getCommentsByTicket).toHaveBeenCalledTimes(1);
			expect(CommentsModel.getCommentsByTicket).toHaveBeenCalledWith(teamspace, project, model,
				ticket, { sort });
		});

		test('should call getCommentsByTicket in model with the expected projection and sort (descending)', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();

			const expectedOutput = generateRandomString();
			const sortBy = generateRandomString();
			const sort = { [sortBy]: -1 };

			CommentsModel.getCommentsByTicket.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket, { sortBy, sortDesc: true }))
				.resolves.toEqual(expectedOutput);

			expect(CommentsModel.getCommentsByTicket).toHaveBeenCalledTimes(1);
			expect(CommentsModel.getCommentsByTicket).toHaveBeenCalledWith(teamspace, project, model,
				ticket, { sort });
		});
	});
};

const testGetCommentById = () => {
	describe('Get comment by Id', () => {
		test('should call getCommentById in model with the expected projection', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const comment = generateRandomString();
			const projection = { [generateRandomString()]: generateRandomString() };

			const expectedOutput = generateRandomString();
			CommentsModel.getCommentById.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentById(teamspace, project, model, ticket, comment, projection))
				.resolves.toEqual(expectedOutput);

			expect(CommentsModel.getCommentById).toHaveBeenCalledTimes(1);
			expect(CommentsModel.getCommentById).toHaveBeenCalledWith(teamspace, project, model,
				ticket, comment, projection);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAddComment();
	testImportComments();
	testUpdateComment();
	testDeleteComment();
	testGetCommentsByTicket();
	testGetCommentById();
});
