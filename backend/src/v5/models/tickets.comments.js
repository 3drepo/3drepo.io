const { deleteIfUndefined, isEqual } = require('../utils/helper/objects');
const { getNestedProperty, setNestedProperty } = require('../utils/helper/objects');
const { isDate, isObject, isUUID } = require('../utils/helper/typeCheck');
const DbHandler = require('../handler/db');
const { basePropertyLabels } = require('../schemas/tickets/templates.constants');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUID } = require('../utils/helper/uuids');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../utils/responseCodes');
const { concat } = require('lodash');

const TicketComments = {};
const TICKET_COMMENTS_COL = 'tickets.comments';

const findComments = (ts, query, projection, sort) => DbHandler.find(ts, TICKET_COMMENTS_COL, query, projection, sort);
const findOneComment = (ts, query, projection) => DbHandler.findOne(ts, TICKET_COMMENTS_COL, query, projection);
const updateOneComment = (ts, query, data) => DbHandler.updateOne(ts, TICKET_COMMENTS_COL, query, data);
const insertOneComment = (ts, data) => DbHandler.updateOne(ts, TICKET_COMMENTS_COL, data);

TicketComments.getCommentByQuery = async (teamspace, query, projection) => DbHandler.findOne(teamspace,
	TICKET_COMMENTS_COL, query, projection);

TicketComments.addComment = async (teamspace, project, model, ticket, commentData, author) => {
    const _id = generateUUID();
    const createdAt = new Date();
    const comment = { _id, ticket, teamspace, project, model, author, createdAt, ...commentData };
    await insertOneComment(teamspace, comment);
};

TicketComments.updateComment = async (teamspace, oldComment, updateData) => {
	const currentDate = new Date();
    const formattedUpdateData = { updatedAt: currentDate, ...updateData };
    
	const historyEntry = { 
		timestamp: currentDate,
		...(oldComment.comment ? {} : { comment: oldComment.comment }),
		...(oldComment.images ? {} : { images: oldComment.images }),
	};

	formattedUpdateData.history = concat(oldComment.history ?? [], [historyEntry]);

    await updateOneComment(teamspace, TICKET_COMMENTS_COL, formattedUpdateData);
};

module.exports = TicketComments;
