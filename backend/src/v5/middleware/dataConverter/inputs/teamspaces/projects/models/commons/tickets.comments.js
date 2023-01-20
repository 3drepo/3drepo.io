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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { types, utils: { stripWhen } } = require('../../../../../../../utils/helper/yup');
const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const Yup = require('yup');
const { getCommentById } = require('../../../../../../../models/tickets.comments');
const { getTicketById } = require('../../../../../../../models/tickets');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { isEqual } = require('../../../../../../../utils/helper/objects');
const { isUUIDString } = require('../../../../../../../utils/helper/typeCheck');
const { respond } = require('../../../../../../../utils/responder');
const { validateMany } = require('../../../../../../common');

const CommentsMiddleware = {};

const validateComment = (isNewComment) => async (req, res, next) => {
	try {
		const schema = Yup.object().shape({
			comment: isNewComment
				? types.strings.longDescription
				: stripWhen(types.strings.longDescription, (t) => isEqual(t, req.commentData.comment)),
			images: Yup.array().min(1).of(
				isNewComment
					? types.embeddedImage()
					: types.embeddedImageOrRef()
						.test('Image ref test', 'One or more image refs do not correspond to a current comment image ref',
							(value, { originalValue }) => {
								if (!isUUIDString(originalValue)) return true;

								const historyImages = req.commentData.history?.flatMap((h) => h.images)
									.filter((i) => i) ?? [];
								const acceptableRefs = [...new Set([...req.commentData.images, ...historyImages])]
									.map(UUIDToString);
								return acceptableRefs.includes(originalValue);
							}),
			),
		}).test(
			'at-least-one-property',
			'You must provide at least a comment or a set of images',
			(value) => Object.keys(value).length,
		).required()
			.noUnknown();

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
		// to ensure ticket exists
		await getTicketById(teamspace, project, model, ticket, { _id: 1 });

		const comment = await getCommentById(teamspace, project, model, ticket, _id);

		if (user !== comment.author) {
			throw templates.notAuthorized;
		}

		if (comment?.deleted) {
			throw createResponseCode(templates.invalidArguments, 'Cannot update a deleted comment');
		}

		req.commentData = comment;
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

CommentsMiddleware.validateNewComment = validateComment(true);
CommentsMiddleware.validateUpdateComment = validateMany([CommentsMiddleware.canUpdateComment, validateComment()]);

module.exports = CommentsMiddleware;
