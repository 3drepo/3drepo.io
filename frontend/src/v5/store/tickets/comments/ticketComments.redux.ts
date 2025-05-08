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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { merge } from 'lodash';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../../helpers/actions.helper';
import { OnError, OnSuccess, TeamspaceAndProjectId } from '../../store.types';
import { ITicketComment } from './ticketComments.types';

const getCommentById = (state, ticketId, commentId) => (
	state.commentsByTicketId[ticketId]?.find(({ _id }) => _id === commentId)
);

export const { Types: TicketCommentsTypes, Creators: TicketCommentsActions } = createActions({
	fetchComments: ['teamspace', 'projectId', 'modelId', 'ticketId', 'isFederation'],
	fetchCommentsSuccess: ['ticketId', 'comments'],
	createComment: ['teamspace', 'projectId', 'modelId', 'ticketId', 'isFederation', 'comment', 'onSuccess', 'onError'],
	updateComment: ['teamspace', 'projectId', 'modelId', 'ticketId', 'isFederation', 'commentId', 'comment'],
	deleteComment: ['teamspace', 'projectId', 'modelId', 'ticketId', 'isFederation', 'commentId'],
	upsertCommentSuccess: ['ticketId', 'comment'],
}, { prefix: 'TICKET_COMMENTS/' }) as { Types: Constants<ITicketCommentsActionCreators>; Creators: ITicketCommentsActionCreators };

export const INITIAL_STATE: ITicketCommentsState = {
	commentsByTicketId: {},
};

export const fetchCommentsSuccess = (state: ITicketCommentsState, {
	ticketId,
	comments,
}: FetchCommentsSuccessAction) => {
	state.commentsByTicketId[ticketId] = comments;
};

export const upsertCommentSuccess = (state: ITicketCommentsState, {
	ticketId,
	comment,
}: UpsertCommentSuccessAction) => {
	if (!state.commentsByTicketId[ticketId]) state.commentsByTicketId[ticketId] = [];

	const commentToUpdate = getCommentById(state, ticketId, comment._id);
	if (commentToUpdate) {
		merge(commentToUpdate, comment);
		commentToUpdate.images = comment.images;
		if (!comment.view) {
			delete commentToUpdate.view;
		}
	} else {
		state.commentsByTicketId[ticketId].push({ ...comment, message: comment.message || '' } as ITicketComment);
	}
};

export const ticketCommentsReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketCommentsTypes.FETCH_COMMENTS_SUCCESS]: fetchCommentsSuccess,
	[TicketCommentsTypes.UPSERT_COMMENT_SUCCESS]: upsertCommentSuccess,
}));

export interface ITicketCommentsState {
	commentsByTicketId: Record<string, ITicketComment[]>,
}

export type FetchCommentsAction = Action<'FETCH_COMMENTS'> & TeamspaceAndProjectId & { modelId: string, ticketId: string, isFederation: boolean };
export type FetchCommentsSuccessAction = Action<'FETCH_COMMENTS_SUCCESS'> & { ticketId: string, comments: ITicketComment[] };
export type CreateCommentAction = Action<'CREATE_COMMENT'> & TeamspaceAndProjectId & OnSuccess & OnError & { modelId: string, ticketId: string, isFederation: boolean, comment: Partial<ITicketComment> };
export type UpdateCommentAction = Action<'UPDATE_COMMENT'> & TeamspaceAndProjectId & { modelId: string, ticketId: string, isFederation: boolean, commentId: string, comment: Partial<ITicketComment> };
export type DeleteCommentAction = Action<'DELETE_COMMENT'> & TeamspaceAndProjectId & { modelId: string, ticketId: string, isFederation: boolean, commentId: string };
export type UpsertCommentSuccessAction = Action<'UPSERT_COMMENT_SUCCESS'> & { ticketId: string, comment: Partial<ITicketComment> };

export interface ITicketCommentsActionCreators {
	fetchComments: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		isFederation: boolean,
	) => FetchCommentsAction;
	fetchCommentsSuccess: (
		ticketId: string,
		comments: ITicketComment[],
	) => FetchCommentsSuccessAction;
	createComment: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		isFederation: boolean,
		comment: Partial<ITicketComment>,
		onSuccess: () => void,
		onError: () => void,
	) => CreateCommentAction;
	updateComment: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		isFederation: boolean,
		commentId: string,
		comment: Partial<ITicketComment>,
	) => UpdateCommentAction;
	deleteComment: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		isFederation: boolean,
		commentId: string,
	) => DeleteCommentAction;
	upsertCommentSuccess: (
		ticketId: string,
		comment: Partial<ITicketComment>,
	) => UpsertCommentSuccessAction;
}
