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

const { generateRandomString } = require('../../helper/services');
const { src } = require('../../helper/path');

const Comments = require(`${src}/models/tickets.comments`);

const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const commentCol = 'tickets.comments';

const testGetCommentById = () => {
	describe('Get comment by ID', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		const comment = generateRandomString();

		test('should return whatever the database query returns', async () => {
			const projection = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentById(teamspace, project, model, ticket, comment, projection))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ teamspace, project, model, ticket, _id: comment }, projection);
		});

		test('should impose default projection if projection is not provided', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentById(teamspace, project, model, ticket, comment))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ teamspace, project, model, ticket, _id: comment }, { teamspace: 0, project: 0, model: 0, ticket: 0 });
		});

		test(`should reject with ${templates.commentNotFound.code} if comment is not found`, async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			await expect(Comments.getCommentById(teamspace, project, model, ticket, comment))
				.rejects.toEqual(templates.commentNotFound);
		});
	});
};

const testGetCommentsByTicket = () => {
	describe('Get comments by ticket', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();

		test('should return whatever the database query returns', async () => {
			const projection = { [generateRandomString()]: generateRandomString() };
			const sort = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = [
				{ [generateRandomString()]: generateRandomString() },
				{ [generateRandomString()]: generateRandomString() },
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket, projection, sort))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ teamspace, project, model, ticket }, projection, sort);
		});

		test('should return whatever the database query returns usign default projection and sort', async () => {
			const expectedOutput = [
				{ [generateRandomString()]: generateRandomString() },
				{ [generateRandomString()]: generateRandomString() },
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ teamspace, project, model, ticket },
				{ teamspace: 0, project: 0, model: 0, ticket: 0 },
				{ createdAt: -1 });
		});
	});
};

const testAddComment = () => {
	describe('Add comment', () => {
		test('should add the comment', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const author = generateRandomString();

			const newComment = { [generateRandomString()]: generateRandomString() };
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(newComment);

			const _id = await Comments.addComment(teamspace, project, model, ticket, newComment, author);

			expect(fn).toHaveBeenCalledTimes(1);
			const { updatedAt } = fn.mock.calls[0][2];
			const { createdAt } = fn.mock.calls[0][2];
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ _id, teamspace, project, model, ticket, author, ...newComment, updatedAt, createdAt });
		});
	});
};

const testUpdateComment = () => {
	describe('Update comment', () => {
		test('should update the message property of a comment', async () => {
			const teamspace = generateRandomString();
			const comment = {
				_id: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
				message: generateRandomString(),
				images: [generateRandomString()],
			};

			const updateData = { message: generateRandomString() };
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Comments.updateComment(teamspace, comment, updateData);

			const updatedComment = {
				message: updateData.message,
				history: [{
					message: comment.message,
					images: comment.images,
					timestamp: fn.mock.calls[0][3].$set.history[0].timestamp,
				}],
				updatedAt: fn.mock.calls[0][3].$set.updatedAt,
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol, { _id: comment._id },
				{ $set: { ...updatedComment }, $unset: { images: 1 } });
		});

		test('should update a comment that has images property set', async () => {
			const teamspace = generateRandomString();
			const comment = {
				_id: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
				message: generateRandomString(),
				images: [generateRandomString()],
			};

			const updateData = { images: [generateRandomString()] };
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Comments.updateComment(teamspace, comment, updateData);

			const updatedComment = {
				images: updateData.images,
				history: [{
					images: comment.images,
					message: comment.message,
					timestamp: fn.mock.calls[0][3].$set.history[0].timestamp,
				}],
				updatedAt: fn.mock.calls[0][3].$set.updatedAt,
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol, { _id: comment._id },
				{ $set: { ...updatedComment }, $unset: { message: 1 } });
		});
	});
};

const testDeleteComment = () => {
	describe('Delete comment', () => {
		test('should delete a comment that has message property set', async () => {
			const teamspace = generateRandomString();
			const comment = {
				_id: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
				message: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Comments.deleteComment(teamspace, comment);

			const updatedComment = {
				deleted: true,
				history: [{
					message: comment.message,
					timestamp: fn.mock.calls[0][3].$set.history[0].timestamp,
				}],
				updatedAt: fn.mock.calls[0][3].$set.updatedAt,
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol, { _id: comment._id },
				{ $set: { ...updatedComment }, $unset: { message: 1, images: 1 } });
		});

		test('should update a comment that has images property set', async () => {
			const teamspace = generateRandomString();
			const comment = {
				_id: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
				images: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Comments.deleteComment(teamspace, comment);

			const updatedComment = {
				deleted: true,
				history: [{
					images: comment.images,
					timestamp: fn.mock.calls[0][3].$set.history[0].timestamp,
				}],
				updatedAt: fn.mock.calls[0][3].$set.updatedAt,
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol, { _id: comment._id },
				{ $set: { ...updatedComment }, $unset: { message: 1, images: 1 } });
		});
	});
};

describe('models/tickets.comments', () => {
	testGetCommentById();
	testGetCommentsByTicket();
	testAddComment();
	testUpdateComment();
	testDeleteComment();
});
