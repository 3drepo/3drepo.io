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
import { ticketMockFactory } from './tickets.fixture';
import { projectMockFactory } from '../projects/projects.fixtures';
import { alertAction } from '../test.helpers';

describe('Tickets: sagas', () => {
	const teamspace = 'teamspace';
	const project = projectMockFactory();
	const projectId = project._id;
	const container = containerMockFactory();
	const federation = federationMockFactory();
	const tickets = [ticketMockFactory()];

	describe('fetchTickets for container', () => {
		it('should call fetchContainerTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/tickets`)
				.reply(200, { tickets });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, container._id, false))
				.put(TicketsActions.fetchModelTicketsSuccess(container._id, tickets))
				.silentRun();
		})

		it('should call fetchContainerTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${container._id}/tickets`)
				.reply(400);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, container._id, false))
				.put.like(alertAction('trying to fetch container tickets'))
				.silentRun();
		})

		it('should call fetchFederationsTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/tickets`)
				.reply(200, { tickets });

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, federation._id, true))
				.put(TicketsActions.fetchModelTicketsSuccess(federation._id, tickets))
				.silentRun();
		})

		it('should call fetchFederationsTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${federation._id}/tickets`)
				.reply(400);

			await expectSaga(TicketsSaga.default)
				.dispatch(TicketsActions.fetchModelTickets(teamspace, projectId, federation._id, true))
				.put.like(alertAction('trying to fetch federation tickets'))
				.silentRun();
		})
	})
})
