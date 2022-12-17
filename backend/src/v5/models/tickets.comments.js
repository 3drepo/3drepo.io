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

const findComments = (ts, query, projection, sort) => db.find(ts, TICKET_COMMENTS_COL, query, projection, sort);
const findOneComment = (ts, query, projection) => db.findOne(ts, TICKET_COMMENTS_COL, query, projection);
const updateOneComment = (ts, query, data) => db.updateOne(ts, TICKET_COMMENTS_COL, query, data);
const insertOneComment = (ts, data) => db.insertOne(ts, TICKET_COMMENTS_COL, data);

TicketComments.getCommentByQuery = async (teamspace, query, projection) => {
	const comment = await findOneComment(teamspace, query, projection);

	if(!comment){
		throw templates.commentNotFound;
	}

	return comment;
}

TicketComments.addComment = async (teamspace, project, model, ticket, commentData, author) => {
    const _id = generateUUID();
    const createdAt = new Date();
    const comment = { _id, ticket, teamspace, project, model, author, createdAt, updatedAt: createdAt, ...commentData };
    await insertOneComment(teamspace, comment);
};

TicketComments.updateComment = async (teamspace, oldComment, updateData) => {
	const updatedAt = new Date();
    const formattedUpdateData = { updatedAt, ...updateData };
    
	const historyEntry = { 
		timestamp: updatedAt,
		...(oldComment.comment ? { comment: oldComment.comment } : {}),
		...(oldComment.images ? { images: oldComment.images } : {}),
	};

	formattedUpdateData.history = concat(oldComment.history ?? [], [historyEntry]);

    await updateOneComment(teamspace, { _id: oldComment._id }, { $set: { ...formattedUpdateData } });	
};

module.exports = TicketComments;
