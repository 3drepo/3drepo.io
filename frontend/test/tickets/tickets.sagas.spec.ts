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
import { mockServer } from '../../internals/testing/mockServer';
import { federationMockFactory } from '../federations/federations.fixtures';
import { containerMockFactory } from '../containers/containers.fixtures';
import { templateDetailsMockFactory, templateMockFactory, ticketMockFactory } from './tickets.fixture';
import { projectMockFactory } from '../projects/projects.fixtures';
import { alertAction } from '../test.helpers';

describe('Tickets: sagas', () => {
	const teamspace = 'teamspace';
	const project = projectMockFactory();
	const projectId = project._id;
	const container = containerMockFactory();
	const federation = federationMockFactory();
	const tickets = [ticketMockFactory()];

	it('needed for test file not to fail', () => expect(true).toBe(true))

	// describe('fetchTickets', () => {
	// 	// TODO - uncomment when fetch tickets endpoints are ready
		
	// 	describe('tickets', () => {
	// 		// Containers
	// 		it('should call fetchContainerTickets endpoint', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/tickets`)
	// 				.reply(200, { tickets });

	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, container._id, false))
	// 				.put(TicketsActions.fetchModelTicketsSuccess(container._id, tickets))
	// 				.silentRun();
	// 		})

	// 		it('should call fetchContainerTickets endpoint with a 404', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/tickets`)
	// 				.reply(400);

	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, container._id, false))
	// 				.put.like(alertAction('trying to fetch container tickets'))
	// 				.silentRun();
	// 		})

	// 		// Federations
	// 		it('should call fetchFederationsTickets endpoint', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/tickets`)
	// 				.reply(200, { tickets });

	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, federation._id, true))
	// 				.put(TicketsActions.fetchModelTicketsSuccess(federation._id, tickets))
	// 				.silentRun();
	// 		})

	// 		it('should call fetchFederationsTickets endpoint with a 404', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/tickets`)
	// 				.reply(400);

	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, federation._id, true))
	// 				.put.like(alertAction('trying to fetch federation tickets'))
	// 				.silentRun();
	// 		})
	// 	})

	// 	describe('templates', () => {
	// 		const template = templateMockFactory();
	// 		const templates = [template];
	// 		const details = templateDetailsMockFactory();

	// 		// Basic templates
	// 		it('should call fetchTemplates endpoint', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/settings/tickets/templates`)
	// 				.reply(200, { templates });
	
	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchTemplates(teamspace))
	// 				.put(TicketsActions.fetchTemplatesSuccess(teamspace, templates))
	// 				.silentRun();
	// 		})
	
	// 		it('should call fetchTemplates endpoint with a 404', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/settings/tickets/templates`)
	// 				.reply(400);
	
	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchTemplates(teamspace))
	// 				.put.like(alertAction('trying to fetch templates'))
	// 				.silentRun();
	// 		})
	
	// 		// Template details
	// 		it('should call fetchTemplateDetails endpoint', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/settings/tickets/templates/${template._id}`)
	// 				.reply(200, details);
	
	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchTemplateDetails(teamspace, template._id))
	// 				.put(TicketsActions.fetchTemplateDetailsSuccess(teamspace, template._id, details))
	// 				.silentRun();
	// 		})
	
	// 		it('should call fetchTemplateDetails endpoint with a 404', async () => {
	// 			mockServer
	// 				.get(`/teamspaces/${teamspace}/settings/tickets/templates/${template._id}`)
	// 				.reply(400);
	
	// 			await expectSaga(TicketsSaga.default)
	// 				.dispatch(TicketsActions.fetchTemplateDetails(teamspace, template._id))
	// 				.put.like(alertAction('trying to fetch template details'))
	// 				.silentRun();
	// 		})
	// 	})
	// })
})
