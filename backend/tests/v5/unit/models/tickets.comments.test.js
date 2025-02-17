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

const { times } = require('lodash');
const { generateRandomString } = require('../../helper/services');
const { src } = require('../../helper/path');

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

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

			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket, { projection, sort }))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ teamspace, project, model, ticket }, projection, sort);
		});

		test('should return whatever the database query returns using default projection and sort', async () => {
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

		test('should impose a filter on updatedAt if updatedSince is specified', async () => {
			const expectedOutput = [
				{ [generateRandomString()]: generateRandomString() },
				{ [generateRandomString()]: generateRandomString() },
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			const date = new Date();
			await expect(Comments.getCommentsByTicket(teamspace, project, model, ticket, { updatedSince: date }))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ teamspace, project, model, ticket, updatedAt: { $gt: date } },
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
			const newComment = {
				message: generateRandomString(),
				images: [generateRandomString()],
			};

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(newComment);

			const comment = await Comments.addComment(teamspace, project, model, ticket, newComment, author);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				{ ...comment, teamspace, project, model });
		});
	});
};

const testImportComments = () => {
	describe('Import comments', () => {
		test('should insert all the comments', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const nIterations = 10;

			const author = generateRandomString();
			const newComments = times(nIterations, (i) => ({
				ticket: generateRandomString(),
				comments: times(nIterations, () => ({
					message: generateRandomString(),
					images: [generateRandomString()],
					originalAuthor: generateRandomString(),
					createdAt: new Date() - i,
				})),
			}));

			const fn = jest.spyOn(db, 'insertMany').mockImplementation(() => undefined);

			const returnedComments = await Comments.importComments(teamspace, project, model, newComments, author);

			expect(returnedComments.length).toBe(nIterations * nIterations);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, commentCol,
				returnedComments.map((comment) => ({ ...comment, teamspace, project, model })));
		});
	});
};

const testUpdateComment = () => {
	describe('Update comment', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();

		test('should update the message property of a comment', async () => {
			const comment = {
				_id: generateRandomString(),
				message: generateRandomString(),
				images: [generateRandomString()],
				author: generateRandomString(),
			};

			const updateData = { message: generateRandomString() };
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);
			const publishFn = EventsManager.publish.mockResolvedValueOnce(undefined);

			await Comments.updateComment(teamspace, project, model, ticket, comment, updateData);

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

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.UPDATE_COMMENT, { teamspace,
				project,
				model,
				data: { ticket, ...comment, ...updateData, images: undefined, updatedAt: updatedComment.updatedAt } });
		});

		test('should update the images of a comment', async () => {
			const comment = {
				_id: generateRandomString(),
				message: generateRandomString(),
				images: [generateRandomString()],
			};

			const updateData = { images: [generateRandomString()] };
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);
			const publishFn = EventsManager.publish.mockResolvedValueOnce(undefined);

			await Comments.updateComment(teamspace, project, model, ticket, comment, updateData);

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

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.UPDATE_COMMENT, { teamspace,
				project,
				model,
				data: { ticket, ...comment, ...updateData, message: undefined, updatedAt: updatedComment.updatedAt } });
		});
	});
};

const testDeleteComment = () => {
	describe('Delete comment', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();

		test('should delete a comment that has message property set', async () => {
			const comment = {
				_id: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
				message: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);
			const publishFn = EventsManager.publish.mockResolvedValueOnce(undefined);

			await Comments.deleteComment(teamspace, project, model, ticket, comment);

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
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.UPDATE_COMMENT, { teamspace,
				project,
				model,
				data: { ticket, _id: comment._id, deleted: true, updatedAt: updatedComment.updatedAt } });
		});

		test('should update a comment that has images property set', async () => {
			const comment = {
				_id: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
				images: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);
			const publishFn = EventsManager.publish.mockResolvedValueOnce(undefined);

			await Comments.deleteComment(teamspace, project, model, ticket, comment);

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

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.UPDATE_COMMENT, { teamspace,
				project,
				model,
				data: { ticket, _id: comment._id, deleted: true, updatedAt: updatedComment.updatedAt } });
		});
	});
};

describe('models/tickets.comments', () => {
	testGetCommentById();
	testGetCommentsByTicket();
	testAddComment();
	testImportComments();
	testUpdateComment();
	testDeleteComment();
});
