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
const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const { getCommentById } = require('../../../../../../../models/tickets.comments');
const { getCommonElements } = require('../../../../../../../utils/helper/arrays');
const { getJobsByUsers } = require('../../../../../../../models/jobs');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { isEqual } = require('../../../../../../../utils/helper/objects');
const { respond } = require('../../../../../../../utils/responder');
const { validateComment: validateCommentSchema } = require('../../../../../../../schemas/tickets/tickets.comments');
const { validateMany } = require('../../../../../../common');

const CommentsMiddleware = {};

const validateComment = async (req, res, next) => {
	try {
		if (req.templateData?.config.comments) {
			req.body = await validateCommentSchema(req.body, req.commentData);
			if (req.commentData) {
				const { message, images, view } = req.body;
				const existingImgRefs = req.commentData.images?.map(UUIDToString).sort();
				const newImgRefs = images?.map(UUIDToString).sort();

				if (isEqual(req.commentData.message, message)
					&& isEqual(existingImgRefs, newImgRefs)
					&& isEqual(req.commentData.view, view)
				) {
					throw createResponseCode(templates.invalidArguments, 'No valid properties to update');
				}
			}
			await next();
		} else {
			throw createResponseCode(templates.invalidArguments, 'This ticket does not support comments.');
		}
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err.message));
	}
};

const canUpdateComment = async (req, res, next) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project, model, ticket, comment: _id } = req.params;

	try {
		const comment = await getCommentById(teamspace, project, model, ticket, _id);

		if (comment.importedAt) {
			throw createResponseCode(templates.notAuthorized, 'Imported comments cannot be modified');
		}

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

const hasTemplatePermission = async (req, res, next) => {
	try {
		const { permissions } = req.templateData.config;

		if (permissions?.comment) {
			const user = getUserFromSession(req.session);
			const userJobs = await getJobsByUsers(req.params.teamspace, [user]);
			const userAndJobs = [user, ...userJobs];

			const hasPermission = getCommonElements(permissions.comment, userAndJobs).length > 0;

			if (!hasPermission) {
				throw createResponseCode(templates.notAuthorized, 'You do not have template permission to create or edit comments on this ticket');
			}
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

CommentsMiddleware.validateNewComment = validateMany([hasTemplatePermission, validateComment]);
CommentsMiddleware.canUpdateComment = validateMany([hasTemplatePermission, canUpdateComment]);
CommentsMiddleware.validateUpdateComment = validateMany([hasTemplatePermission, canUpdateComment, validateComment]);

module.exports = CommentsMiddleware;
