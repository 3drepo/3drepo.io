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

const { getCommentById } = require('../../../models/tickets.comments');
const { getTicketById } = require('../../../models/tickets');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const TicketPerms = {};

TicketPerms.canEditComment = async (req, res, next) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project, model, ticket, comment } = req.params;

	try {
		// ensure ticket exists
		await getTicketById(teamspace, project, model, ticket);

		const commentData = await getCommentById(teamspace, project, model, ticket, comment);

		if (user !== commentData.author) {
			return respond(req, res, templates.notAuthorized);
		}

		req.commentData = commentData;
		return next();
	} catch (err) {
		return respond(req, res, err);
	}
};

module.exports = TicketPerms;
