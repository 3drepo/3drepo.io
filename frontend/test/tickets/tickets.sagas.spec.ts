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
import { selectRiskCategories, selectTemplateById, selectTemplates, selectTicketById, selectTickets, selectTicketsGroups } from '@/v5/store/tickets/tickets.selectors';
import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { FederationsActions } from '@/v5/store/federations/federations.redux';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { IContainer } from '@/v5/store/containers/containers.types';
import { IFederation } from '@/v5/store/federations/federations.types';
import { containerMockFactory } from '../containers/containers.fixtures';
import { federationMockFactory } from '../federations/federations.fixtures';
import { createTestStore } from '../test.helpers';
import { mockGroup, mockRiskCategories, templateMockFactory, ticketMockFactory, ticketWithGroupMockFactory } from './tickets.fixture';
import { mockServer } from '../../internals/testing/mockServer';
import Mockdate from 'mockdate';

describe('Tickets: sagas', () => {
	let onSuccess;
	let onError;
	let dispatch; let getState; let
		waitForActions;
	const teamspace = 'teamspace';
	const projectId = 'project';
	const modelId = 'modelId';
	const revision = 'revision';
	const group = mockGroup();
	const groups = [group];
	const ticket = ticketWithGroupMockFactory(group, { modelId });
	const tickets = [ticket];

	const populateTicketsStore = () => dispatch(TicketsActions.fetchTicketsSuccess(modelId, tickets));
	const populateGroupsStore = () => dispatch(TicketsActions.fetchTicketGroupsSuccess(groups));

	const populateFederationsStore = () => {
		const containers: IContainer[] = [containerMockFactory()];
		const federations: IFederation[] = [federationMockFactory({ _id: modelId, containers: [{ _id: containers[0]._id }] })];
		dispatch(FederationsActions.fetchFederationsSuccess(projectId, federations));
		dispatch(ContainersActions.fetchContainersSuccess(projectId, containers));
	};
	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
		dispatch(ProjectsActions.setCurrentProject(projectId));
	});

	describe('tickets', () => {
		// Containers
		it('should call fetchContainerTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(200, { tickets });

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, false));
			}, [
				TicketsActions.fetchTicketsSuccess(modelId, tickets),
			]);
		});

		it('should call fetchContainerTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, false));
			}, [DialogsTypes.OPEN]);

			const ticketsFromState = selectTickets(getState(), modelId);
			expect(ticketsFromState).toEqual([]);
		});

		it('should call fetchContainerTicket endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, false, revision));
			}, [
				TicketsActions.upsertTicketSuccess(modelId, ticket),
				TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id, revision),
			]);
		});
		it('should call fetchContainerTicket endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, false));
			}, [DialogsTypes.OPEN]);

			const ticketFromState = selectTicketById(getState(), ticket._id);
			expect(ticketFromState).toBeNull();
		});

		it('should call updateContainerTicket endpoint', async () => {
			populateTicketsStore();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(200);

			const updateProp = { title: 'updatedContainerTicketName' };
			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, false, onError));
			}, [
				TicketsActions.upsertTicketSuccess(modelId, { _id: ticket._id, ...updateProp }),
			]);
			expect(onError).not.toHaveBeenCalled();
		});
		it('should call updateContainerTicket with a 404', async () => {
			populateTicketsStore();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			const updateProp = { title: 'updatedContainerTicketName' };
			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, false, onError));
			}, [DialogsTypes.OPEN]);

			const ticketsFromState = selectTickets(getState(), modelId);
			expect(ticketsFromState).toEqual(tickets);
			expect(onError).toHaveBeenCalled();
		});

		it('should call createContainerTicket endpoint', async () => {
			Mockdate.set(new Date());
			const newTicket = ticketMockFactory();
			delete newTicket._id;
			const _id = 'containerTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(200, { _id });

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newTicket, false, onSuccess, onError));
			}, [TicketsActions.upsertTicketSuccess(modelId, { _id, ...newTicket, properties: { ...newTicket.properties, 'Created at': new Date().getTime() } })]);

			expect(onSuccess).toHaveBeenCalledWith(_id);
			expect(onError).not.toHaveBeenCalled();
			Mockdate.reset();
		});

		it('should call createContainerTicket endpoint with a 404', async () => {
			const newTicket = ticketMockFactory();
			delete newTicket._id;
			const _id = 'containerTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`)
				.reply(404, { _id });

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newTicket, false, onSuccess, onError));
			}, [DialogsTypes.OPEN]);

			const ticketsFromState = selectTickets(getState(), modelId);
			expect(ticketsFromState).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});

		// Federations
		it('should call fetchFederationTickets endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(200, { tickets });

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, true));
			}, [TicketsActions.fetchTicketsSuccess(modelId, tickets)]);
		});

		it('should call fetchFederationTickets endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTickets(teamspace, projectId, modelId, true));
			}, [DialogsTypes.OPEN]);

			const ticketsFromState = selectTickets(getState(), modelId);
			expect(ticketsFromState).toEqual([]);
		});

		it('should call fetchFederationTicket endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, true, revision));
			}, [
				TicketsActions.upsertTicketSuccess(modelId, ticket),
				TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id, revision),
			]);
		});
		it('should call fetchFederationTicket endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTicket(teamspace, projectId, modelId, ticket._id, true));
			}, [DialogsTypes.OPEN]);
			const ticketFromState = selectTicketById(getState(), ticket._id);
			expect(ticketFromState).toBeNull();
		});

		it('should call updateFederationTicket endpoint', async () => {
			populateTicketsStore();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(200, ticket);

			const updateProp = { _id: ticket._id, title: 'updatedFederationTicketName' };

			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, true, onError));
			}, [TicketsActions.upsertTicketSuccess(modelId, updateProp)]);
			expect(onError).not.toHaveBeenCalled();
		});

		it('should call updateFederationTicket endpoint with a 404', async () => {
			populateTicketsStore();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}`)
				.reply(404);

			const updateProp = { _id: ticket._id, title: 'updatedFederationTicketName' };

			await waitForActions(() => {
				dispatch(TicketsActions.updateTicket(teamspace, projectId, modelId, ticket._id, updateProp, true, onError));
			}, [DialogsTypes.OPEN]);

			const ticketsFromState = selectTickets(getState(), modelId);
			expect(ticketsFromState).toEqual(tickets);
			expect(onError).toHaveBeenCalled();
		});

		it('should call createFederationTicket endpoint', async () => {
			Mockdate.set(new Date());
			const newTicket = ticketMockFactory();
			delete newTicket._id;
			const _id = 'federationTicketId';

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(200, { _id });

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newTicket, true, onSuccess, onError));
			}, [TicketsActions.upsertTicketSuccess(modelId, { _id, ...newTicket, properties: { ...newTicket.properties, 'Created at': new Date().getTime() } })]);
			expect(onSuccess).toHaveBeenCalledWith(_id);
			expect(onError).not.toHaveBeenCalled();
			Mockdate.reset();
		});

		it('should call createFederationTicket endpoint with a 404', async () => {
			const newTicket = ticketMockFactory();
			delete newTicket._id;

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.createTicket(teamspace, projectId, modelId, newTicket, true, onSuccess, onError));
			}, [DialogsTypes.OPEN]);

			const ticketsFromState = selectTickets(getState(), modelId);
			expect(ticketsFromState).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		});
		describe('groups', () => {
			beforeEach(populateTicketsStore);
			it('should call upsertTicketAndFetchGroups', async () => {
				populateGroupsStore();

				const updateProp = { _id: ticket._id, title: 'updatedTicketName' };

				await waitForActions(() => {
					dispatch(TicketsActions.upsertTicketAndFetchGroups(teamspace, projectId, modelId, updateProp, revision));
				}, [
					TicketsActions.upsertTicketSuccess(modelId, updateProp),
					TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id, revision),
				]);
			});
			describe('containers', () => {
				it('should call fetchTicketGroups endpoint.', async () => {
					mockServer
						.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(200, group);

					await waitForActions(() => {
						dispatch(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id));
					}, [TicketsActions.fetchTicketGroupsSuccess(groups)]);
					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState[group._id]).toEqual(group);
					expect(Object.keys(groupsFromState).length).toEqual(groups.length);
				});

				it('should call fetchTicketGroups endpoint with a 404', async () => {
					mockServer
						.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(404);

					await waitForActions(() => {
						dispatch(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id));
					}, [DialogsTypes.OPEN]);

					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState).toEqual({});
				});

				it('should call updateContainerTicketGroup', async () => {
					populateGroupsStore();
					const updatedGroup = mockGroup({ _id: group._id });
					mockServer
						.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(200);

					await waitForActions(() => {
						dispatch(TicketsActions.updateTicketGroup(teamspace, projectId, modelId, ticket._id, updatedGroup, false));
					}, [
						TicketsActions.updateTicketGroupSuccess(updatedGroup),
					]);

					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState[group._id]).toEqual(updatedGroup);
				});
				it('should call updateContainerTicketGroup with 404', async () => {
					populateGroupsStore();
					const updatedGroup = mockGroup({ _id: group._id });
					mockServer
						.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(404);

					await waitForActions(() => {
						dispatch(TicketsActions.updateTicketGroup(teamspace, projectId, modelId, ticket._id, updatedGroup, false));
					}, [DialogsTypes.OPEN]);
					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState[group._id]).toEqual(group);
				});
			});
			describe('federations', () => {
				beforeEach(populateFederationsStore);
				it('should call fetchTicketGroups endpoint', async () => {
					mockServer
						.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(200, group);

					await waitForActions(() => {
						dispatch(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id));
					}, [TicketsActions.fetchTicketGroupsSuccess(groups)]);

					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState[group._id]).toEqual(group);
					expect(Object.keys(groupsFromState).length).toEqual(groups.length);
				});

				it('should call fetchTicketGroups endpoint with a 404', async () => {
					mockServer
						.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(404);

					await waitForActions(() => {
						dispatch(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id));
					}, [DialogsTypes.OPEN]);

					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState).toEqual({});
				});
				it('should call updateFederationTicketGroup', async () => {
					populateGroupsStore();
					const updatedGroup = mockGroup({ _id: group._id });
					mockServer
						.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(200);

					await waitForActions(() => {
						dispatch(TicketsActions.updateTicketGroup(teamspace, projectId, modelId, ticket._id, updatedGroup, true));
					}, [
						TicketsActions.updateTicketGroupSuccess(updatedGroup),
					]);

					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState[group._id]).toEqual(updatedGroup);
				});
				it('should call updateFederationTicketGroup with 404', async () => {
					populateGroupsStore();
					const updatedGroup = mockGroup({ _id: group._id });
					mockServer
						.patch(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticket._id}/groups/${group._id}`)
						.reply(404);

					await waitForActions(() => {
						dispatch(TicketsActions.updateTicketGroup(teamspace, projectId, modelId, ticket._id, updatedGroup, true));
					}, [DialogsTypes.OPEN]);
					const groupsFromState = selectTicketsGroups(getState());
					expect(groupsFromState[group._id]).toEqual(group);
				});
			});
		});
	});

	describe('templates', () => {
		const template = templateMockFactory();
		const templates = [template];

		// Basic Container templates
		it('should call fetchContainerTemplates endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates?getDetails=false`)
				.reply(200, { templates })

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, false));
			}, [TicketsActions.fetchTemplatesSuccess(modelId, templates)]);
		});

		it('should call fetchContainerTemplates endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates?getDetails=false`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, false));
			}, [DialogsTypes.OPEN]);
			const templatesFromState = selectTemplates(getState(), modelId);
			expect(templatesFromState).toEqual([]);
		});

		it('should call fetchContainerTemplate detail endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates/${template._id}`)
				.reply(200, template);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, false));
			}, [TicketsActions.replaceTemplateSuccess(modelId, template)]);
		});

		it('should call fetchContainerTemplate detail endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates/${template._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, false));
			}, [DialogsTypes.OPEN]);

			const templateFromState = selectTemplateById(getState(), template._id);
			expect(templateFromState).toBeNull();
		});

		// Basic Federation templates
		it('should call fetchFederationTemplates endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates?getDetails=false`)
				.reply(200, { templates });

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, true));
			}, [TicketsActions.fetchTemplatesSuccess(modelId, templates)]);
		});

		it('should call fetchFederationTemplates endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates?getDetails=false`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplates(teamspace, projectId, modelId, true));
			}, [DialogsTypes.OPEN]);

			const templatesFromState = selectTemplates(getState(), modelId);
			expect(templatesFromState).toEqual([]);
		});

		it('should call fetchFederationTemplate detail endpoint', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates/${template._id}`)
				.reply(200, template);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, true));
			}, [TicketsActions.replaceTemplateSuccess(modelId, template)]);
		});

		it('should call fetchFederationTemplate detail endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/templates/${template._id}`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchTemplate(teamspace, projectId, modelId, template._id, true));
			}, [DialogsTypes.OPEN]);

			const templateFromState = selectTemplateById(getState(), template._id);
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
				dispatch(TicketsActions.fetchRiskCategories(teamspace));
			}, [TicketsActions.fetchRiskCategoriesSuccess(riskCategories)]);
		});
		it('should call fetchRiskCategories endpoint with a 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/settings/tickets/riskCategories`)
				.reply(404);

			await waitForActions(() => {
				dispatch(TicketsActions.fetchRiskCategories(teamspace));
			}, [DialogsTypes.OPEN]);

			const riskCategoriesFromState = selectRiskCategories(getState());
			expect(riskCategoriesFromState).toEqual([]);
		});
	});
});
