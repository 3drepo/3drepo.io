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

const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const Yup = require('yup');
const { logger } = require('../../../../../../../utils/logger');
const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');
const { types } = require('../../../../../../../utils/helper/yup');

const Comments = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

const serialiseComment = (comment) => {
	const caster = Yup.object({
		_id: uuidString,
		createdAt: types.timestamp,
		updatedAt: types.timestamp,
		images: Yup.array().of(uuidString),
		history: Yup.array().of(Yup.object({
			timestamp: types.timestamp,
			images: Yup.array().of(uuidString),
		})),
	});
	return caster.cast(comment);
};

Comments.serialiseComment = (req, res) => {
	try {
		respond(req, res, templates.ok, serialiseComment(req.commentData));
	} catch (err) {
		logger.logError(`Failed to serialise comment: ${err.message || err}`);
		respond(req, res, templates.unknown);
	}
};

Comments.serialiseCommentList = (req, res) => {
	try {
		const comments = req.comments.map(serialiseComment);
		respond(req, res, templates.ok, { comments });
	} catch (err) {
		logger.logError(`Failed to serialise comments: ${err.message || err}`);
		respond(req, res, templates.unknown);
	}
};

module.exports = Comments;
