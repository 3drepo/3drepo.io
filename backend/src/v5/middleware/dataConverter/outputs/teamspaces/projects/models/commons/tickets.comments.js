const { serialiseComment } = require('../../../../../../../schemas/tickets/comments');
const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');

const Comments = {};

Comments.serialiseComment = (req, res) => {
	try {
		respond(req, res, templates.ok, serialiseComment(req.commentData));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

Comments.serialiseCommentList = (req, res) => {
	try {
		const comments = req.comments.map(serialiseComment);
		respond(req, res, templates.ok, { comments });
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

module.exports = Comments;
