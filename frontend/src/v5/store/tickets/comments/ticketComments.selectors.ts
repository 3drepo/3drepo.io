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

import { createSelector } from 'reselect';
import { ITicketCommentsState } from './ticketComments.redux';
import { selectTicketsGroups } from '../tickets.selectors';
import { commentWithGroups } from './ticketComments.helpers';

const selectCommentsDomain = (state): ITicketCommentsState => state.ticketComments || {};

export const selectComments = createSelector(
	selectCommentsDomain,
	(state, ticketId) => ticketId,
	selectTicketsGroups,
	(state, ticketId, groups) => {
		const commentsWithGroups = (state.commentsByTicketId[ticketId] || []).map(commentWithGroups(groups));
		return commentsWithGroups;
	},
);

export const selectCommentById = createSelector(
	selectComments,
	(_, ticketId, commentId) => commentId,
	(comments, commentId) => comments.find(({ _id }) => _id === commentId) || null,
);
