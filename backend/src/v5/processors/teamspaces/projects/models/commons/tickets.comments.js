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

const { addComment, deleteComment, getCommentById, getCommentsByTicket, importComments, updateComment } = require('../../../../../models/tickets.comments');
const { commitGroupChanges, processGroupsUpdate } = require('./tickets.groups');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { events } = require('../../../../../services/eventsManager/eventsManager.constants');
const { generateUUID } = require('../../../../../utils/helper/uuids');
const { isBuffer } = require('../../../../../utils/helper/typeCheck');
const { publish } = require('../../../../../services/eventsManager/eventsManager');
const { storeFiles } = require('../../../../../services/filesManager');
const { viewGroups } = require('../../../../../schemas/tickets/templates.constants');

const Comments = {};

const processCommentImages = (teamspace, project, model, ticket, images = []) => {
	const refsAndBinaries = [];
	const meta = { teamspace, project, model, ticket };

	for (let i = 0; i < images.length; i++) {
		const data = images[i];

		if (isBuffer(data)) {
			const id = generateUUID();
			refsAndBinaries.push({ data, id, meta });
			// eslint-disable-next-line no-param-reassign
			images[i] = id;
		}
	}

	return refsAndBinaries;
};

// This function expects [{comment, oldComment}] (old comment can be undefined)
const processCommentsGroups = (comments) => {
	const groupChanges = {
		toAdd: [],
		old: new Set(),
		stillUsed: new Set(),
	};

	comments.forEach(({ comment, oldComment }) => {
		processGroupsUpdate(
			oldComment?.view,
			comment.view,
			Object.values(viewGroups).map((groupName) => `state.${groupName}`),
			groupChanges,
		);
	});

	return groupChanges;
};

Comments.addComment = async (teamspace, project, model, ticket, commentData, author) => {
	const refsAndBinaries = processCommentImages(teamspace, project, model, ticket, commentData.images);
	const groupsDelta = processCommentsGroups([{ comment: commentData }]);

	const res = await addComment(teamspace, project, model, ticket, commentData, author);

	if (refsAndBinaries.length) await storeFiles(teamspace, TICKETS_RESOURCES_COL, refsAndBinaries);
	await commitGroupChanges(teamspace, project, model, ticket, groupsDelta);

	publish(events.NEW_COMMENT, {
		teamspace,
		project,
		model,
		data: res,
	});

	return res._id;
};

Comments.updateComment = async (teamspace, project, model, ticket, oldComment, updateData) => {
	const refsAndBinaries = processCommentImages(teamspace, project, model, ticket, updateData.images);
	const groupsDelta = processCommentsGroups([{ comment: updateData, oldComment }]);

	await updateComment(teamspace, project, model, ticket, oldComment, updateData);
	if (refsAndBinaries.length) await storeFiles(teamspace, TICKETS_RESOURCES_COL, refsAndBinaries);
	await commitGroupChanges(teamspace, project, model, ticket, groupsDelta);
};

Comments.importComments = async (teamspace, project, model, commentsByTickets, author) => {
	const refsAndBinaries = commentsByTickets.flatMap(({ ticket, comments }) => comments.flatMap(
		({ images }) => processCommentImages(teamspace, project, model, ticket, images)));

	const groupsDelta = commentsByTickets.map(({ ticket, comments }) => {
		const groupChanges = processCommentsGroups(comments.map((comment) => ({ comment })));

		return { groupChanges, ticket };
	});

	const res = await importComments(teamspace, project, model, commentsByTickets, author);
	if (refsAndBinaries.length) await storeFiles(teamspace, TICKETS_RESOURCES_COL, refsAndBinaries);
	await Promise.all(groupsDelta.map(({ ticket, groupChanges }) => commitGroupChanges(
		teamspace,
		project,
		model,
		ticket,
		groupChanges)));

	return res.map((data) => {
		publish(events.NEW_COMMENT, {
			teamspace,
			project,
			model,
			data,
		});

		return data._id;
	});
};

Comments.deleteComment = deleteComment;

Comments.getCommentsByTicket = (teamspace, project, model, ticket, { updatedSince, sortBy, sortDesc } = {}) => {
	const sort = sortBy ? { [sortBy]: sortDesc ? -1 : 1 } : undefined;

	return getCommentsByTicket(teamspace, project, model, ticket, { updatedSince, sort });
};

Comments.getCommentById = getCommentById;

module.exports = Comments;
