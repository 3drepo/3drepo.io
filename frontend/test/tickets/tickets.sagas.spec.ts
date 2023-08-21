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

import { TicketsActions } from '@/v5/store/tickets/tickets.redux';
import { mockServer } from '../../internals/testing/mockServer';
import { mockGroup, mockRiskCategories, templateMockFactory, ticketMockFactory } from './tickets.fixture';
import { createTestStore } from '../test.helpers';
import { selectRiskCategories, selectTemplateById, selectTemplates, selectTicketById, selectTickets, selectTicketsGroups } from '@/v5/store/tickets/tickets.selectors';
import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';

describe('Tickets: sagas', () => {
	let onSuccess;
	let dispatch, getState, waitForActions;
	const group = mockGroup();
	const groups = [group]
	const ticket = ticketMockFactory({ properties: { defaultView: { coloured: [groups[0]._id] }}})
	const tickets = [ticket];
	const teamspace = 'teamspace';
	const projectId = 'project';
	const modelId = 'modelId';
	
	const populateStore = () => {
		dispatch(TicketsActions.fetchTicketsSuccess(modelId, tickets));
	}
	beforeEach(() => {
		onSuccess = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
		dispatch(ProjectsActions.setCurrentProject(projectId));
	})

	describe('tickets', () => {
		// Containers
		it('should call fetchContainerTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(200, { tickets });

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, false))
			}, [
				TicketsActions.fetchTicketsSuccess(modelId, tickets),
			])
		})

		it('should call fetchContainerTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, false))
			}, [DialogsTypes.OPEN])

			const ticketsFromState = selectTickets(getState(), modelId)
			expect(ticketsFromState).toEqual([])
		})

		it('should call fetchContainerTicket endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, false))
			}, [TicketsActions.upsertTicketSuccess(modelId, ticket)])
		})
		it('should call fetchContainerTicket endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, false))
			}, [DialogsTypes.OPEN])

			const ticketFromState = selectTicketById(getState(), ticket._id)
			expect(ticketFromState).toBeNull();
		})
		
		it('should call updateContainerTicket endpoint', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(200);

			const updateProp = { title: 'updatedContainerTicketName' };
			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, false))
			}, [
				TicketsActions.upsertTicketSuccess(modelId, {_id: ticket._id, ...updateProp}),
			])
		})
		it('should call updateContainerTicket with a 404', async () => {
			populateStore();

			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			const updateProp = { title: 'updatedContainerTicketName' };
			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, false))
			}, [DialogsTypes.OPEN])

			const ticketsFromState = selectTickets(getState(), modelId)
			expect(ticketsFromState).toEqual(tickets)
		})

		it('should call createContainerTicket endpoint', async () => {
			const newTicket = ticketMockFactory();
			delete newTicket._id;
			const _id = 'containerTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(200, { _id });

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newTicket, false, onSuccess))
			}, [TicketsActions.upsertTicketSuccess(modelId, {_id, ...newTicket})])

			expect(onSuccess).toHaveBeenCalledWith(_id);
		})

		it('should call createContainerTicket endpoint with a 404', async () => {
			const newTicket = ticketMockFactory();
			delete newTicket._id;
			const _id = 'containerTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(404, { _id });

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newTicket, false, onSuccess))
			}, [DialogsTypes.OPEN])

			const ticketsFromState = selectTickets(getState(), modelId)
			expect(ticketsFromState).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
		})

		// Federations
		it('should call fetchFederationTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(200, { tickets });

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, true))
			}, [TicketsActions.fetchTicketsSuccess(modelId, tickets)])
		})

		it('should call fetchFederationTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, true))
			}, [DialogsTypes.OPEN])

			const ticketsFromState = selectTickets(getState(), modelId)
			expect(ticketsFromState).toEqual([]);
			
		})

		it('should call fetchFederationTicket endpoint', async () => {
			const ticket = tickets[0];
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, true))
			}, [
				TicketsActions.upsertTicketSuccess(modelId, ticket),
				TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id),
			])
		})
		it('should call fetchFederationTicket endpoint with a 404', async () => {
			const ticket = tickets[0];
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, true))
			}, [DialogsTypes.OPEN])
			const ticketFromState = selectTicketById(getState(), ticket._id)
			expect(ticketFromState).toBeNull();
		})

		it('should call updateFederationTicket endpoint', async () => {
			const ticket = tickets[0];
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			const updateProp = {_id: ticket._id,title:'updatedFederationTicketName'};

			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, true))
			}, [TicketsActions.upsertTicketSuccess(modelId, updateProp)])
		})

		it('should call updateFederationTicket endpoint with a 404', async () => {
			populateStore();
			const ticket = tickets[0];
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			const updateProp = {_id: ticket._id,title:'updatedFederationTicketName'};

			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, true))
			}, [DialogsTypes.OPEN])

			const ticketsFromState = selectTickets(getState(), modelId)
			expect(ticketsFromState).toEqual(tickets);
		})

		it('should call createFederationTicket endpoint', async () => {
			const newticket = ticketMockFactory();
			delete newticket._id;
			const _id = 'federationTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(200, { _id });

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newticket, true, onSuccess))
			}, [TicketsActions.upsertTicketSuccess(modelId, {_id, ...newticket})])
			expect(onSuccess).toHaveBeenCalledWith(_id);
		})

		it('should call createFederationTicket endpoint with a 404', async () => {
			const newticket = ticketMockFactory();
			delete newticket._id;

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newticket, true, onSuccess))
			}, [DialogsTypes.OPEN])

			const ticketsFromState = selectTickets(getState(), modelId)
			expect(ticketsFromState).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
		})
	})

	describe('templates', () => {
		const templates = [templateMockFactory()];

		// Basic Container templates
		it('should call fetchContainerTemplates endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates`)
				.reply(200, { templates });

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, false))
			}, [TicketsActions.fetchTemplatesSuccess(modelId, templates)])
		});

		it('should call fetchContainerTemplates endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, false))
			}, [DialogsTypes.OPEN])
			const templatesFromState = selectTemplates(getState(), modelId)
			expect(templatesFromState).toEqual([]);
		})

		it('should call fetchContainerTemplate detail endpoint', async () => {
			const template = templateMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates/${template._id}`)
				.reply(200, template);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, false))
			}, [TicketsActions.replaceTemplateSuccess(modelId, template)])
		})

		it('should call fetchContainerTemplate detail endpoint with a 404', async () => {
			const template = templateMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates/${template._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, false))
			}, [DialogsTypes.OPEN])

			const templateFromState = selectTemplateById(getState(), template._id)
			expect(templateFromState).toBeNull();
		})

		// Basic Federation templates
		it('should call fetchFederationTemplates endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates`)
				.reply(200, { templates });
			
			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, true))
			}, [TicketsActions.fetchTemplatesSuccess(modelId, templates)])
		})

		it('should call fetchFederationTemplates endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, true))
			}, [DialogsTypes.OPEN])

			const templatesFromState = selectTemplates(getState(), modelId)
			expect(templatesFromState).toEqual([]);
		})

		it('should call fetchContainerTemplate detail endpoint', async () => {
			const template = templateMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates/${template._id}`)
				.reply(200, template);
	
			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, true))
			}, [TicketsActions.replaceTemplateSuccess(modelId, template)])
			
		});

		it('should call fetchContainerTemplate detail endpoint with a 404', async () => {
			const template = templateMockFactory();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates/${template._id}`)
				.reply(404);
	
			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, true))
			}, [DialogsTypes.OPEN])

			const templateFromState = selectTemplateById(getState(), template._id)
			expect(templateFromState).toBeNull();
		});
	});

	describe('settings', () => {
		const riskCategories = mockRiskCategories();
		it('should call fetchRiskCategories endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/settings/tickets/riskCategories`)
				.reply(200, { riskCategories });
			
			await waitForActions(() => {
				dispatch(TicketsActions.fetchRiskCategories(teamspace))
			}, [TicketsActions.fetchRiskCategoriesSuccess(riskCategories)])
		});
		it('should call fetchRiskCategories endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/settings/tickets/riskCategories`)
				.reply(404);
			
			await waitForActions(() => {
				dispatch(TicketsActions.fetchRiskCategories(teamspace))
			}, [DialogsTypes.OPEN])

			const riskCategoriesFromState = selectRiskCategories(getState())
			expect(riskCategoriesFromState).toEqual([]);
		});
	});
})
