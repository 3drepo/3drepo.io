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

import { expectSaga } from 'redux-saga-test-plan';
import * as TicketCommentsSaga from '@/v5/store/tickets/comments/ticketComments.sagas';
import { TicketCommentsActions } from '@/v5/store/tickets/comments/ticketComments.redux';
import Mockdate from 'mockdate';
import { mockServer } from '../../../internals/testing/mockServer';
import { commentHistoryMockFactory, commentMockFactory } from './ticketComments.fixture';
import { alertAction } from '../../test.helpers';

describe('Ticket Comments: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'project';
	const modelId = 'modelId';
	const ticketId = 'ticketId';
	const comment = commentMockFactory();
	let onSuccess, onError;

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
	});

	describe('comments', () => {

		// Containers
		it('should call fetch containers ticket\'s comments endpoint', async () => {
			const { history, ...commentNoHistory } = comment;
			const response = { comments: [commentNoHistory] };
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`)
				.reply(200, response);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, false))
				.put(TicketCommentsActions.fetchCommentsSuccess(ticketId, response.comments))
				.silentRun();
		});

		it('should call fetch containers ticket\'s comments endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`)
				.reply(404);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, false))
				.put.like(alertAction('trying to fetch the comments for container ticket'))
				.silentRun();
		});

		it('should call create container ticket\'s comment endpoint', async () => {
			const commentToBeCreated = commentMockFactory({ deleted: false });
			const inputComment = {
				message: commentToBeCreated.message,
				author: commentToBeCreated.author,
				images: commentToBeCreated.images,
			};
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(200, { _id: commentToBeCreated._id })
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${commentToBeCreated._id}`)
				.reply(200, commentToBeCreated);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, false, inputComment, onSuccess, onError))
				.put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: commentToBeCreated._id, ...commentToBeCreated }))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call create container ticket\'s comment endpoint with 404', async () => {
			const { _id, ...newComment } = comment;
	
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(404);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, false, newComment, onSuccess, onError))
				.put.like(alertAction('trying to create the comment for container ticket'))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
		
		it('should call container\'s update ticket comment endpoint', async () => {
			Mockdate.set(new Date());
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(200);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()], updatedAt: new Date() };

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, false, comment._id, commentUpdate))
				.put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, ...commentUpdate }))
				.silentRun();
			Mockdate.reset();
		});
		
		it('should call container\'s update ticket comment endpoint with 404', async () => {
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(404);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()] };

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, false, comment._id, commentUpdate))
				.put.like(alertAction('trying to update the comment for container ticket'))
				.silentRun();
		});
		
		it('should call container\'s delete ticket comment endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(200);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, false, comment._id))
				.put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, deleted: true }))
				.silentRun();
		});
		
		it('should call container\'s delete ticket comment endpoint with 404', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(404);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, false, comment._id))
				.put.like(alertAction('trying to delete the comment for container ticket'))
				.silentRun();
		});

		// Federations
		it('should call fetch federation ticket\'s comments endpoint', async () => {
			const { history, ...commentNoHistory } = comment;
			const response = { comments: [commentNoHistory] };
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`)
				.reply(200, response);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, true))
				.put(TicketCommentsActions.fetchCommentsSuccess(ticketId, response.comments))
				.silentRun();
		});

		it('should call fetch federation ticket\'s comments endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`)
				.reply(404);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.fetchComments(teamspace, projectId, modelId, ticketId, true))
				.put.like(alertAction('trying to fetch the comments for federation ticket'))
				.silentRun();
		});

		it('should call create federation ticket\'s comment endpoint', async () => {
			const commentToBeCreated = commentMockFactory({ deleted: false });
			const inputComment = {
				message: commentToBeCreated.message,
				author: commentToBeCreated.author,
				images: commentToBeCreated.images,
			};
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(200, { _id: commentToBeCreated._id })
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${commentToBeCreated._id}`)
				.reply(200, commentToBeCreated);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, true, inputComment, onSuccess, onError))
				.put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: commentToBeCreated._id, ...commentToBeCreated }))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call create federation ticket\'s comment endpoint with 404', async () => {
			const { _id, ...newComment } = comment;
	
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(404);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.createComment(teamspace, projectId, modelId, ticketId, true, newComment, onSuccess, onError))
				.put.like(alertAction('trying to create the comment for federation ticket'))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
		
		it('should call federation\'s update ticket comment endpoint', async () => {
			Mockdate.set(new Date());
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(200);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()], updatedAt: new Date() };

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, true, comment._id, commentUpdate))
				.put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, ...commentUpdate }))
				.silentRun();
			Mockdate.reset();
		});
		
		it('should call federation\'s update ticket comment endpoint with 404', async () => {
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(404);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()] };

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.updateComment(teamspace, projectId, modelId, ticketId, true, comment._id, commentUpdate))
				.put.like(alertAction('trying to update the comment for federation ticket'))
				.silentRun();
		});
		
		it('should call federation\'s delete ticket comment endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(200);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, true, comment._id))
				.put(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: comment._id, deleted: true }))
				.silentRun();
		});
		
		it('should call federation\'s delete ticket comment endpoint with 404', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(404);

			await expectSaga(TicketCommentsSaga.default)
				.dispatch(TicketCommentsActions.deleteComment(teamspace, projectId, modelId, ticketId, true, comment._id))
				.put.like(alertAction('trying to delete the comment for federation ticket'))
				.silentRun();
		});
	});
})
