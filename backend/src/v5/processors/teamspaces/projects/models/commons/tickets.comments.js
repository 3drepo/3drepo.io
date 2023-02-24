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

const { addComment, deleteComment, getCommentById, getCommentsByTicket, updateComment } = require('../../../../../models/tickets.comments');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { generateUUID } = require('../../../../../utils/helper/uuids');
const { isBuffer } = require('../../../../../utils/helper/typeCheck');
const { storeFile } = require('../../../../../services/filesManager');

const Comments = {};

const storeFiles = (teamspace, project, model, ticket, binaryData) => Promise.all(
	binaryData.map(({ ref, data }) => storeFile(
		teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model, ticket },
	)),
);

const processCommentImages = (images = []) => {
	const refsAndBinary = [];

	for (let i = 0; i < images.length; i++) {
		const data = images[i];

		if (isBuffer(data)) {
			const ref = generateUUID();
			refsAndBinary.push({ data, ref });
			// eslint-disable-next-line no-param-reassign
			images[i] = ref;
		}
	}

	return refsAndBinary;
};

Comments.addComment = async (teamspace, project, model, ticket, commentData, author) => {
	const refsAndBinary = processCommentImages(commentData.images);
	const res = await addComment(teamspace, project, model, ticket, commentData, author);
	await storeFiles(teamspace, project, model, ticket, refsAndBinary);
	return res;
};

Comments.updateComment = async (teamspace, project, model, ticket, oldComment, updateData) => {
	const refsAndBinary = processCommentImages(updateData.images);
	await updateComment(teamspace, project, model, ticket, oldComment, updateData);
	await storeFiles(teamspace, project, model, ticket, refsAndBinary);
};

Comments.deleteComment = deleteComment;

Comments.getCommentsByTicket = getCommentsByTicket;

Comments.getCommentById = getCommentById;

module.exports = Comments;
