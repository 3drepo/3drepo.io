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

import { TicketCommentsActions } from '@/v5/store/tickets/comments/ticketComments.redux';
import Mockdate from 'mockdate';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { selectCommentById, selectComments } from '@/v5/store/tickets/comments/ticketComments.selectors';
import { mockServer } from '../../../internals/testing/mockServer';
import { commentMockFactory } from './ticketComments.fixture';
import { createTestStore } from '../../test.helpers';
import { pick } from 'lodash';

describe('Ticket Comments: sagas', () => {
	let dispatch; let getState; let
		waitForActions;
	let onSuccess; let
		onError;
	const teamspace = 'teamspace';
	const projectId = 'project';
	const modelId = 'modelId';
	const ticketId = 'ticketId';
	const comment = commentMockFactory();

	const populateStore = () => {
		dispatch(TicketCommentsActions.fetchCommentsSuccess(ticketId, [comment]));
	};

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
	});

	const getNewHistory = () => {
		const oldComment = selectCommentById(getState(), ticketId, comment._id)
		return (oldComment.history || []).concat({
			message: oldComment.message,
			images: oldComment.images,
			view: oldComment.view,
			timestamp: new Date(),
		});
	}

	describe('comments', () => {
		// Containers
		it('should call fetch containers ticket\'s comments endpoint', async () => {
			const { history, ...commentNoHistory } = comment;
			const response = { comments: [commentNoHistory] };
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`)
				.reply(200, response);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, false));
			}, [TicketCommentsActions.fetchCommentsSuccess(ticketId, response.comments)]);
		});

		it('should call fetch containers ticket\'s comments endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, false));
			}, [DialogsTypes.OPEN]);

			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([]);
		});

		it('should call create container ticket\'s comment endpoint', async () => {
			const commentToBeCreated = commentMockFactory({ history: [], deleted: false });
			const inputComment = pick(commentToBeCreated, ['message', 'author', 'images', 'view'])
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(200, { _id: commentToBeCreated._id })
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${commentToBeCreated._id}`)
				.reply(200, commentToBeCreated);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, false, inputComment, onSuccess, onError));
			}, [TicketCommentsActions.upsertCommentSuccess(ticketId, commentToBeCreated)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call create container ticket\'s comment endpoint with 404', async () => {
			const { _id, ...newComment } = comment;

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, false, newComment, onSuccess, onError));
			}, [DialogsTypes.OPEN]);

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([]);
		});

		it('should call container\'s update ticket comment endpoint', async () => {
			Mockdate.set(new Date());
			populateStore();
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(200);

			const commentUpdate = { message: 'updatedMessage', updatedAt: new Date() };
			const history = getNewHistory();
			await waitForActions(() => {
				dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, false, comment._id, commentUpdate));
			}, [
				TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, history, ...commentUpdate })
			]);
			Mockdate.reset();
		});

		it('should call container\'s update ticket comment endpoint with 404', async () => {
			populateStore();
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(404);

			const commentUpdate = { message: 'updatedMessage' };

			await waitForActions(() => {
				dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, false, comment._id, commentUpdate));
			}, [DialogsTypes.OPEN]);

			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([comment]);
		});

		it('should call container\'s delete ticket comment endpoint', async () => {
			populateStore();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, false, comment._id));
			}, [TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, deleted: true })]);
		});

		it('should call container\'s delete ticket comment endpoint with 404', async () => {
			populateStore();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, false, comment._id));
			}, [DialogsTypes.OPEN]);
			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([comment]);
		});

		// Federations
		it('should call fetch federation ticket\'s comments endpoint', async () => {
			const { history, ...commentNoHistory } = comment;
			const response = { comments: [commentNoHistory] };
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`)
				.reply(200, response);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, true));
			}, [TicketCommentsActions.fetchCommentsSuccess(ticketId, response.comments)]);
		});

		it('should call fetch federation ticket\'s comments endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, true));
			}, [DialogsTypes.OPEN]);

			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([]);
		});

		it('should call create federation ticket\'s comment endpoint', async () => {
			const commentToBeCreated = commentMockFactory({ history: [], deleted: false });
			const inputComment = pick(commentToBeCreated, ['message', 'author', 'images', 'view'])
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(200, { _id: commentToBeCreated._id })
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${commentToBeCreated._id}`)
				.reply(200, commentToBeCreated);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, true, inputComment, onSuccess, onError));
			}, [TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: commentToBeCreated._id, ...commentToBeCreated })]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call create federation ticket\'s comment endpoint with 404', async () => {
			const { _id, ...newComment } = comment;

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, true, newComment, onSuccess, onError));
			}, [DialogsTypes.OPEN]);

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([]);
		});

		it('should call federation\'s update ticket comment endpoint', async () => {
			Mockdate.set(new Date());
			populateStore();
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(200);

			const commentUpdate = { message: 'updatedMessage', updatedAt: new Date() };
			const history = getNewHistory();

			await waitForActions(() => {
				dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, true, comment._id, commentUpdate));
			}, [TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, history, ...commentUpdate })]);

			Mockdate.reset();
		});

		it('should call federation\'s update ticket comment endpoint with 404', async () => {
			populateStore();
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(404);

			const commentUpdate = { message: 'updatedMessage' };

			await waitForActions(() => {
				dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, true, comment._id, commentUpdate));
			}, [DialogsTypes.OPEN]);

			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([comment]);
		});

		it('should call federation\'s delete ticket comment endpoint', async () => {
			populateStore();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, true, comment._id));
			}, [TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, deleted: true })]);
		});

		it('should call federation\'s delete ticket comment endpoint with 404', async () => {
			populateStore();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, true, comment._id));
			}, [DialogsTypes.OPEN]);

			const commentsFromState = selectComments(getState(), ticketId);
			expect(commentsFromState).toEqual([comment]);
		});
	});
});
