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

import { put, takeEvery, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import { sortBy } from 'lodash';
import { parseMessageAndImages } from './ticketComments.helpers';
import {
	TicketCommentsTypes,
	TicketCommentsActions,
	FetchCommentsAction,
	CreateCommentAction,
	UpdateCommentAction,
	DeleteCommentAction,
} from './ticketComments.redux';
import { DialogsActions } from '../../dialogs/dialogs.redux';
import { RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE } from '../../store.helpers';

export function* fetchComments({
	teamspace,
	projectId,
	modelId,
	ticketId,
	isFederation,
}: FetchCommentsAction) {
	try {
		const fetchModelComments = isFederation
			? API.TicketComments.fetchFederationComments
			: API.TicketComments.fetchContainerComments;
		const { comments } = yield fetchModelComments(teamspace, projectId, modelId, ticketId);
		const richComments = sortBy(comments, 'createdAt').map(({ createdAt, updatedAt, ...comment }) => ({
			...comment,
			createdAt: new Date(createdAt),
			updatedAt: new Date(updatedAt),
		}));

		yield put(TicketCommentsActions.fetchCommentsSuccess(ticketId, richComments));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'comments.fetch.error', defaultMessage: 'trying to fetch the comments for {model} ticket' },
				{ model: isFederation ? 'federation' : 'container' },
			),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export function* createComment({
	teamspace,
	projectId,
	modelId,
	ticketId,
	isFederation,
	comment,
	onSuccess,
	onError,
}: CreateCommentAction) {
	try {
		const createModelComment = isFederation
			? API.TicketComments.createFederationComment
			: API.TicketComments.createContainerComment;
		const newComment = parseMessageAndImages(comment);

		const { _id: newCommentId } = yield createModelComment(teamspace, projectId, modelId, ticketId, newComment);

		const fetchModelComment = isFederation
			? API.TicketComments.fetchFederationComment
			: API.TicketComments.fetchContainerComment;

		let fetchedComment = yield fetchModelComment(teamspace, projectId, modelId, ticketId, newCommentId);
		fetchedComment = {
			...fetchedComment,
			createdAt: new Date(fetchedComment.createdAt),
			updatedAt: new Date(fetchedComment.updatedAt),
		};
		yield put(TicketCommentsActions.upsertCommentSuccess(ticketId, fetchedComment));
		onSuccess();
	} catch (error) {
		onError(error);
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'comments.create.error', defaultMessage: 'trying to create the comment for {model} ticket' },
				{ model: isFederation ? 'federation' : 'container' },
			),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export function* updateComment({
	teamspace,
	projectId,
	modelId,
	ticketId,
	isFederation,
	commentId,
	comment,
}: UpdateCommentAction) {
	try {
		const updateModelComment = isFederation
			? API.TicketComments.updateFederationComment
			: API.TicketComments.updateContainerComment;

		yield updateModelComment(teamspace, projectId, modelId, ticketId, commentId, parseMessageAndImages(comment));
		yield put(TicketCommentsActions.upsertCommentSuccess(
			ticketId,
			{ _id: commentId, ...comment, updatedAt: new Date() },
		));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'comments.update.error', defaultMessage: 'trying to update the comment for {model} ticket' },
				{ model: isFederation ? 'federation' : 'container' },
			),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export function* deleteComment({
	teamspace,
	projectId,
	modelId,
	ticketId,
	isFederation,
	commentId,
}: DeleteCommentAction) {
	try {
		const deleteModelComment = isFederation
			? API.TicketComments.deleteFederationComment
			: API.TicketComments.deleteContainerComment;
		yield deleteModelComment(teamspace, projectId, modelId, ticketId, commentId);
		yield put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: commentId, deleted: true }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'comments.delete.error', defaultMessage: 'trying to delete the comment for {model} ticket' },
				{ model: isFederation ? 'federation' : 'container' },
			),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export default function* ticketsSaga() {
	yield takeLatest(TicketCommentsTypes.FETCH_COMMENTS, fetchComments);
	yield takeEvery(TicketCommentsTypes.CREATE_COMMENT, createComment);
	yield takeEvery(TicketCommentsTypes.UPDATE_COMMENT, updateComment);
	yield takeEvery(TicketCommentsTypes.DELETE_COMMENT, deleteComment);
}
