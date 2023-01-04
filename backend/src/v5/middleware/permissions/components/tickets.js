const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');
const { getCommentById } = require('../../../models/tickets.comments');
const { getTicketById } = require('../../../models/tickets');

const TicketPerms = {};

TicketPerms.canEditComment = async (req, res, next) => {	
	const user = getUserFromSession(req.session);
	const { teamspace, project, model, ticket, comment } = req.params;
	
	try {        
		//ensure ticket exists
		await getTicketById(teamspace, project, model, ticket);
		
        const commentData = await getCommentById(teamspace, project, model, ticket, comment);

		if (user !== commentData.author) {			
			return respond(req, res, templates.notAuthorized);
		}

		req.commentData = commentData;
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

module.exports = TicketPerms;
