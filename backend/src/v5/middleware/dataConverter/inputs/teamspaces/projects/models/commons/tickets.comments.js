const { codeExists, createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const Yup = require('yup');
const { getCommentById } = require('../../../../../../../models/tickets.comments');
const { respond } = require('../../../../../../../utils/responder');
const { types } = require('../../../../../../../utils/helper/yup');
const { validateMany } = require('../../../../../../common');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { isUUIDString } = require('../../../../../../../utils/helper/typeCheck');
const { UUIDToString } = require('../../../../../../../utils/helper/uuids');

const CommentsMiddleware = {};

const validateComment = (isNewComment) => async (req, res, next) => {
	try {
		const schema = Yup.object().shape({
			comment: types.strings.longDescription,
			images: Yup.array().min(1).of(
				isNewComment
					? types.embeddedImage()
					: types.embeddedImageOrRef()
                        .test('Image ref test', 'One or more image refs do not correspond to a current comment image ref', 
                        (value, { originalValue }) => !isUUIDString(originalValue) || req.commentData?.images.map(UUIDToString).includes(originalValue)),
			),
		}).test(
			'at-least-one-property',
			'You must provide at least a comment or a set of images',
			(value) => Object.keys(value).length,
		).required().noUnknown();

		req.body = await schema.validate(req.body);

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err.message));
	}
};

CommentsMiddleware.canUpdateComment = async (req, res, next) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project, model, ticket, comment: _id } = req.params;

	try {
		const comment = await getCommentById(teamspace, project, model, ticket, _id);

		if (user !== comment.author) {
            throw templates.notAuthorized;
		}

        if (comment?.deleted) {
			throw createResponseCode(templates.invalidArguments, 'Cannot update a deleted comment');
		}

		req.commentData = comment;
		return next();
	} catch (err) {
		respond(req, res, err);
	}
};

CommentsMiddleware.validateNewComment = validateComment(true);
CommentsMiddleware.validateUpdateComment = validateMany([CommentsMiddleware.canUpdateComment, validateComment()]);

module.exports = CommentsMiddleware;