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

const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateUUIDString, generateRandomBuffer } = require('../../../../../../helper/services');

const Comments = require(`${src}/processors/teamspaces/projects/models/commons/tickets.comments`);

jest.mock('../../../../../../../../src/v5/models/tickets.comments');
const CommentsModel = require(`${src}/models/tickets.comments`);

const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const testAddComment = () => {
	describe('Add comment', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		const author = generateRandomString();
		const expectedOutput = generateRandomString();

		test('should call addComment in model and return whatever it returns', async () => {
			const commentData = generateRandomString();
			CommentsModel.addComment.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.addComment(teamspace, project, model, ticket, commentData, author))
				.resolves.toEqual(expectedOutput);

			expect(CommentsModel.addComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.addComment).toHaveBeenCalledWith(teamspace, project, model,
				ticket, commentData, author);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
		});

		test('should process image and store a ref', async () => {
			const imageBuffer = generateRandomBuffer();
			const commentData = {
				[generateRandomString()]: generateRandomString(),
				images: [imageBuffer],
			};
			CommentsModel.addComment.mockResolvedValueOnce(expectedOutput);

			await expect(Comments.addComment(teamspace, project, model, ticket, commentData, author))
				.resolves.toEqual(expectedOutput);

			const imgRef = CommentsModel.addComment.mock.calls[0][4].images[0];
			expect(CommentsModel.addComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.addComment).toHaveBeenCalledWith(teamspace, project, model, ticket,
				{ ...commentData, images: [imgRef] }, author);

			const meta = { teamspace, project, model, ticket };
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				imgRef, imageBuffer, meta);
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

			expect(CommentsModel.updateComment).toHaveBeenCalledTimes(1);
			expect(CommentsModel.updateComment).toHaveBeenCalledWith(teamspace, project, model, ticket,
				oldComment, updateData);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
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

			const meta = { teamspace, project, model, ticket };
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				imgRef, imageBuffer, meta);
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

describe('processors/teamspaces/projects/models/commons/tickets.comments', () => {
	testAddComment();
	testUpdateComment();
	testDeleteComment();
	testGetCommentsByTicket();
	testGetCommentById();
});
