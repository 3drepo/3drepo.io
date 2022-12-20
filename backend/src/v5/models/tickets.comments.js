const { deleteIfUndefined, isEqual } = require('../utils/helper/objects');
const { getNestedProperty, setNestedProperty } = require('../utils/helper/objects');
const { isDate, isObject, isUUID } = require('../utils/helper/typeCheck');
const db = require('../handler/db');
const { basePropertyLabels } = require('../schemas/tickets/templates.constants');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUID } = require('../utils/helper/uuids');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../utils/responseCodes');
const { concat } = require('lodash');

const TicketComments = {};
const TICKET_COMMENTS_COL = 'tickets.comments';

const findMany = (ts, query, projection, sort) => db.find(ts, TICKET_COMMENTS_COL, query, projection, sort);
const findOne = (ts, query, projection) => db.findOne(ts, TICKET_COMMENTS_COL, query, projection);
const updateOne = (ts, query, data) => db.updateOne(ts, TICKET_COMMENTS_COL, query, data);
const insertOne = (ts, data) => db.insertOne(ts, TICKET_COMMENTS_COL, data);

TicketComments.getCommentById = async (teamspace, project, model, ticket, _id, projection) => {
	const comment = await findOne(teamspace, { teamspace, project, model, ticket, _id }, projection);

	if(!comment){
		throw templates.commentNotFound;
	}

	return comment;
};

TicketComments.getComentsByTicket = async (teamspace, ticket, projection, sort) =>
	findMany(teamspace, { ticket }, projection, sort);

TicketComments.addComment = async (teamspace, project, model, ticket, commentData, author) => {
    const _id = generateUUID();
    const createdAt = new Date();
    const comment = { _id, ticket, teamspace, project, model, author, createdAt, updatedAt: createdAt, ...commentData };
    await insertOne(teamspace, comment);
};

const getUpdatedComment = (oldComment, updateData) => {
	const updatedAt = new Date();
    const formattedComment = { updatedAt, ...updateData };
    
	const historyEntry = { 
		timestamp: updatedAt,
		...(oldComment.comment ? { comment: oldComment.comment } : {}),
		...(oldComment.images ? { images: oldComment.images } : {}),
	};

	formattedComment.history = concat(oldComment.history ?? [], [historyEntry]);

	return formattedComment;
};

TicketComments.updateComment = async (teamspace, oldComment, updateData) => {
	const formattedComment = getUpdatedComment(oldComment, updateData);
    await updateOne(teamspace, { _id: oldComment._id }, { $set: { ...formattedComment } });	
};

TicketComments.deleteComment = async (teamspace, oldComment) => {	
	const formattedComment = getUpdatedComment(oldComment, { deleted: true });
    await updateOne(teamspace, { _id: oldComment._id }, { $set: { ...formattedComment }, $unset: { comment: 1, images: 1 } });	
};


module.exports = TicketComments;
