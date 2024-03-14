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
const { generateRandomDate, generateUUID, generateRandomString } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const CommentOutputMiddleware = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.comments`);

const testSerialiseComment = () => {
	describe('Serialise Comment', () => {
		test(`Should respond with ${templates.unknown.code} if an error has been thrown`, () => {
			const req = { commentData: { createdAt: generateRandomString() } };

			expect(CommentOutputMiddleware.serialiseComment(req, {})).toBeUndefined();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});

		test('Should cast dates correctly', () => {
			const commentData = {
				createdAt: generateRandomDate(),
				updatedAt: generateRandomDate(),
				history: [{ timestamp: generateRandomDate() }],
			};

			const req = { commentData };

			expect(CommentOutputMiddleware.serialiseComment(req, {})).toBeUndefined();

			const output = {
				createdAt: commentData.createdAt.getTime(),
				updatedAt: commentData.updatedAt.getTime(),
				history: [{ timestamp: commentData.history[0].timestamp.getTime() }],
			};

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, { ...output });
		});

		test('Should cast dates correctly (imported comment', () => {
			const commentData = {
				createdAt: generateRandomDate(),
				updatedAt: generateRandomDate(),
				importedAt: generateRandomDate(),
				author: generateRandomString(),
				originalAuthor: generateRandomString(),
				history: [{ timestamp: generateRandomDate() }],
			};

			const req = { commentData };

			expect(CommentOutputMiddleware.serialiseComment(req, {})).toBeUndefined();

			const output = {
				...commentData,
				createdAt: commentData.createdAt.getTime(),
				updatedAt: commentData.updatedAt.getTime(),
				importedAt: commentData.importedAt.getTime(),
				history: [{ timestamp: commentData.history[0].timestamp.getTime() }],
			};

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, { ...output });
		});

		test('Should cast uuids correctly', () => {
			const commentData = { _id: generateUUID(), images: [generateUUID(), generateUUID()] };
			const req = { commentData };

			expect(CommentOutputMiddleware.serialiseComment(req, {})).toBeUndefined();

			const output = { _id: UUIDToString(commentData._id), images: commentData.images.map(UUIDToString) };

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, { ...output });
		});
	});
};

const testSerialiseCommentList = () => {
	describe('Serialise Comment List', () => {
		test(`Should respond with ${templates.unknown.code} if an error has been thrown`, () => {
			const comments = times(5, () => ({
				createdAt: generateRandomString(),
				updatedAt: generateRandomDate(),
				history: [{ timestamp: generateRandomDate() }],
			}));

			const req = { comments };

			expect(CommentOutputMiddleware.serialiseCommentList(req, {})).toBeUndefined();

			// the serialiser is already tested by testSerialiseComment.
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});

		test('Should cast dates correctly', () => {
			const comments = times(5, () => ({
				createdAt: generateRandomDate(),
				updatedAt: generateRandomDate(),
				history: [{ timestamp: generateRandomDate() }],
			}));

			const req = { comments };

			expect(CommentOutputMiddleware.serialiseCommentList(req, {})).toBeUndefined();

			expect(Responder.respond).toHaveBeenCalledTimes(1);

			// the serialiser is already tested by testSerialiseComment.
			const output = Responder.respond.mock.calls[0][3];
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, output);
		});

		test('Should cast uuids correctly', () => {
			const comments = times(5, () => ({
				_id: generateUUID(),
			}));

			const req = { comments };

			expect(CommentOutputMiddleware.serialiseCommentList(req, {})).toBeUndefined();

			expect(Responder.respond).toHaveBeenCalledTimes(1);

			// the serialiser is already tested by testSerialiseComment.
			const output = Responder.respond.mock.calls[0][3];
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, output);
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.comments', () => {
	testSerialiseComment();
	testSerialiseCommentList();
});
