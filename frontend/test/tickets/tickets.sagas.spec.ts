/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import * as TicketsSaga from '@/v5/store/tickets/tickets.sagas';
import { TicketsActions } from '@/v5/store/tickets/tickets.redux';
import MockDate from 'mockdate'
import { mockServer } from '../../internals/testing/mockServer';
import { commentHistoryMockFactory, commentMockFactory, mockRiskCategories, templateMockFactory, ticketMockFactory } from './tickets.fixture';
import { alertAction } from '../test.helpers';

describe('Tickets: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'project';
	const modelId = 'modelId';
	const tickets = [ticketMockFactory()];
	const comment = commentMockFactory();
	let onSuccess;

	beforeEach(() => {
		onSuccess = jest.fn();
	})

	describe('tickets', () => {
		// Containers
		it('should call fetchContainerTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(200, { tickets });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, false))
				.put(TicketsActions.fetchTicketsSuccess(modelId, tickets))
				.silentRun();
		})

		it('should call fetchContainerTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, false))
				.put.like(alertAction('trying to fetch container tickets'))
				.silentRun();
		})

		it('should call fetch containers Ticket endpoint', async () => {
			const ticket = tickets[0];
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, false))
				.put(TicketsActions.upsertTicketSuccess(modelId, ticket))
				.silentRun();
		})
		
		it('should call container`s update ticket endpoint', async () => {
			const ticket = tickets[0];
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(200);

			const updateProp = {title:'updatedContainerTicketName'};

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, false))
				.put(TicketsActions.upsertTicketSuccess(modelId, {_id: ticket._id, ...updateProp}))
				.silentRun();
		})

		it('should call container`s create ticket endpoint', async () => {
			const newticket = ticketMockFactory();
			delete newticket._id;
			const _id = 'containerTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(200, { _id });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newticket, false, onSuccess))
				.put(TicketsActions.upsertTicketSuccess(modelId, {_id, ...newticket}))
				.silentRun();

			expect(onSuccess).toHaveBeenCalledWith(_id);
		})

		// Federations
		it('should call fetchFederationsTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(200, { tickets });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, true))
				.put(TicketsActions.fetchTicketsSuccess(modelId, tickets))
				.silentRun();
		})

		it('should call fetchFederationsTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, true))
				.put.like(alertAction('trying to fetch federation tickets'))
				.silentRun();
		})

		it('should call fetchFederationsTicket endpoint', async () => {
			const ticket = tickets[0];
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, true))
				.put(TicketsActions.upsertTicketSuccess(modelId, ticket))
				.silentRun();
		})

		it('should call federation update ticket endpoint', async () => {
			const ticket = tickets[0];
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			const updateProp = {_id: ticket._id,title:'updatedFederationTicketName'};

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, true))
				.put(TicketsActions.upsertTicketSuccess(modelId, updateProp))
				.silentRun();
		})

		it('should call federations`s create ticket endpoint', async () => {
			const newticket = ticketMockFactory();
			delete newticket._id;
			const _id = 'federationTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(200, { _id });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newticket, true, onSuccess))
				.put(TicketsActions.upsertTicketSuccess(modelId, {_id, ...newticket}))
				.silentRun();

			expect(onSuccess).toHaveBeenCalledWith(_id);
		})
	})

	describe('comments', () => {
		const ticketId = 'ticketId';

		// Containers
		it('should call fetch containers ticket\'s comments endpoint', async () => {
			const { history, ...commentNoHistory } = comment;
			const response = { comments: [commentNoHistory] };
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`)
				.reply(200, response);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTicketComments(teamspace, projectId, modelId, ticketId, false))
				.put(TicketsActions.fetchTicketCommentsSuccess(modelId, ticketId, response.comments))
				.silentRun();
		});

		it('should call fetch containers ticket\'s comments endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTicketComments(teamspace, projectId, modelId, ticketId, false))
				.put.like(alertAction('trying to fetch the comments for container ticket'))
				.silentRun();
		});

		it('should call create container ticket\'s comment endpoint', async () => {
			MockDate.set(new Date());
			const commentToBeCreated = commentMockFactory({
				createdAt: new Date(),
				updatedAt: new Date(),
				deleted: false,
			});
			const inputComment = {
				message: commentToBeCreated.message,
				author: commentToBeCreated.author,
				images: commentToBeCreated.images,
			};
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(200, { _id: commentToBeCreated._id });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.createTicketComment(teamspace, projectId, modelId, ticketId, false, inputComment, onSuccess))
				// date time fucks it up here
				.put(TicketsActions.upsertTicketCommentSuccess(modelId, ticketId, { _id: commentToBeCreated._id, ...commentToBeCreated }))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			MockDate.reset();
		});

		it('should call create container ticket\'s comment endpoint with 404', async () => {
			const { _id, ...newComment } = comment;
	
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.createTicketComment(teamspace, projectId, modelId, ticketId, false, newComment, onSuccess))
				.put.like(alertAction('trying to create the comment for container ticket'))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
		});
		
		it('should call container`s update ticket comment endpoint', async () => {
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(200);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()] };

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.updateTicketComment(teamspace, projectId, modelId, ticketId, false, comment._id, commentUpdate))
				.put(TicketsActions.upsertTicketCommentSuccess(modelId, ticketId, { _id: comment._id, ...commentUpdate }))
				.silentRun();
		});
		
		it('should call container`s update ticket comment endpoint with 404', async () => {
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(404);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()] };

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.updateTicketComment(teamspace, projectId, modelId, ticketId, false, comment._id, commentUpdate))
				.put.like(alertAction('trying to update the comment for container ticket'))
				.silentRun();
		});
		
		it('should call container`s delete ticket comment endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(200);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.deleteTicketComment(teamspace, projectId, modelId, ticketId, false, comment._id))
				.put(TicketsActions.upsertTicketCommentSuccess(modelId, ticketId, { _id: comment._id, deleted: true }))
				.silentRun();
		});
		
		it('should call container`s delete ticket comment endpoint with 404', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.deleteTicketComment(teamspace, projectId, modelId, ticketId, false, comment._id))
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

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTicketComments(teamspace, projectId, modelId, ticketId, true))
				.put(TicketsActions.fetchTicketCommentsSuccess(modelId, ticketId, response.comments))
				.silentRun();
		});

		it('should call fetch federation ticket\'s comments endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTicketComments(teamspace, projectId, modelId, ticketId, true))
				.put.like(alertAction('trying to fetch the comments for federation ticket'))
				.silentRun();
		});

		it('should call create federation ticket\'s comment endpoint', async () => {
			MockDate.set(new Date());
			const commentToBeCreated = commentMockFactory({
				createdAt: new Date(),
				updatedAt: new Date(),
				deleted: false,
			});
			const inputComment = {
				message: commentToBeCreated.message,
				author: commentToBeCreated.author,
				images: commentToBeCreated.images,
			};
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(200, { _id: commentToBeCreated._id });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.createTicketComment(teamspace, projectId, modelId, ticketId, true, inputComment, onSuccess))
				// date time fucks it up here
				.put(TicketsActions.upsertTicketCommentSuccess(modelId, ticketId, { _id: commentToBeCreated._id, ...commentToBeCreated }))
				.silentRun();

			expect(onSuccess).toHaveBeenCalled();
			MockDate.reset();
		});

		it('should call create federation ticket\'s comment endpoint with 404', async () => {
			const { _id, ...newComment } = comment;
	
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments`, () => true)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.createTicketComment(teamspace, projectId, modelId, ticketId, true, newComment, onSuccess))
				.put.like(alertAction('trying to create the comment for federation ticket'))
				.silentRun();

			expect(onSuccess).not.toHaveBeenCalled();
		});
		
		it('should call federation`s update ticket comment endpoint', async () => {
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(200);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()] };

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.updateTicketComment(teamspace, projectId, modelId, ticketId, true, comment._id, commentUpdate))
				.put(TicketsActions.upsertTicketCommentSuccess(modelId, ticketId, { _id: comment._id, ...commentUpdate }))
				.silentRun();
		});
		
		it('should call federation`s update ticket comment endpoint with 404', async () => {
			mockServer
				.put(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`, () => true)
				.reply(404);

			const commentUpdate = { message: 'updatedMessage', history: [commentHistoryMockFactory()] };

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.updateTicketComment(teamspace, projectId, modelId, ticketId, true, comment._id, commentUpdate))
				.put.like(alertAction('trying to update the comment for federation ticket'))
				.silentRun();
		});
		
		it('should call federation`s delete ticket comment endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(200);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.deleteTicketComment(teamspace, projectId, modelId, ticketId, true, comment._id))
				.put(TicketsActions.upsertTicketCommentSuccess(modelId, ticketId, { _id: comment._id, deleted: true }))
				.silentRun();
		});
		
		it('should call federation`s delete ticket comment endpoint with 404', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}/comments/${comment._id}`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.deleteTicketComment(teamspace, projectId, modelId, ticketId, true, comment._id))
				.put.like(alertAction('trying to delete the comment for federation ticket'))
				.silentRun();
		});
	})

	describe('templates', () => {
		const templates = [templateMockFactory()];

		// Basic Container templates
		it('should call fetchContainerTemplates endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates`)
				.reply(200, { templates });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, false))
				.put(TicketsActions.fetchTemplatesSuccess(modelId, templates))
				.silentRun();
		});

		it('should call fetchTemplates endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, false))
				.put.like(alertAction('trying to fetch templates'))
				.silentRun();
		})

		it('should call fetchContainerTemplate detail endpoint', async () => {
			const template = templateMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates/${template._id}`)
				.reply(200, template);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, false))
				.put(TicketsActions.replaceTemplateSuccess(modelId, template))
				.silentRun();
		})

		// Basic Federation templates
		it('should call fetchFederationTemplates endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates`)
				.reply(200, { templates });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, true))
				.put(TicketsActions.fetchTemplatesSuccess(modelId, templates))
				.silentRun();
		})

		it('should call fetchFederationTemplates endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates`)
				.reply(404);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, true))
				.put.like(alertAction('trying to fetch templates'))
				.silentRun();
		})

		it('should call fetchContainerTemplate  detail endpoint', async () => {
			const template = templateMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates/${template._id}`)
				.reply(200, template);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, true))
				.put(TicketsActions.replaceTemplateSuccess(modelId, template))
				.silentRun();
		});
	});

	describe('settings', () => {
		const riskCategories = mockRiskCategories();
		it('should call fetchRiskCategories endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/settings/tickets/riskCategories`)
				.reply(200, { riskCategories });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchRiskCategories(teamspace))
				.put(TicketsActions.fetchRiskCategoriesSuccess(riskCategories))
				.silentRun();
		});
	});
})
