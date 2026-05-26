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

import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { TicketsActions, TicketsTypes } from '@/v5/store/tickets/tickets.redux';
import { selectTickets, selectTemplates, selectTicketById, selectTemplateById, selectRiskCategories } from '@/v5/store/tickets/tickets.selectors';
import { cloneDeep } from 'lodash';
import { createTestStore } from '../test.helpers';
import { mockRiskCategories, templateMockFactory, ticketMockFactory } from './tickets.fixture';
import { mockServer } from '../../internals/testing/mockServer';

describe('Tickets: store', () => {
	let dispatch, getState, waitForActions;
	const teamspace = 'teamspace';
	const modelId = 'modelId';
	const projectId = 'projectId';

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
	});

	describe('tickets', () => {
		it('should fetch and set model tickets', () => {
			const ticket = ticketMockFactory({ modelId });
			dispatch(TicketsActions.fetchTicketsSuccess(modelId, [ticket]));
			const modelTicketsFromState = selectTickets(getState(), modelId);
	
			expect(modelTicketsFromState[0]).toEqual(ticket);
		});
	
		it('should update the model tickets', () => {
			const ticket = ticketMockFactory({ modelId });
			dispatch(TicketsActions.fetchTicketsSuccess(modelId, [ticket]));
	
			const oldTicket = cloneDeep(ticket)
			const modifications = { _id: ticket._id, title:'modified ticket', properties:{priority:'Top'}}
				
			dispatch(TicketsActions.upsertTicketSuccess(modelId, modifications));
			
			const modified = {...oldTicket,  ...modifications, properties:{...oldTicket.properties, priority:'Top' } };
			const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
	
			expect(ticketFromStore).toEqual(modified);
		});
	
		it('should update many tickets', async () => {
			const tickets =  [];
			const ticketsCount = 100;
			const templateId = 'templateId'
			const ticketsHalf = Math.round(ticketsCount/2);
	
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets?template=${templateId}`)
				.reply(200);
	


			for (let i=0 ; i < ticketsCount; i++) {
				const ticket = ticketMockFactory({modelId, type: templateId});
				ticket.properties.priority = 'Low';
				tickets.push(ticket);
			}

			dispatch(TicketsActions.fetchTicketsSuccess(modelId, tickets));
	
			const ids = tickets.slice(0, ticketsHalf).map(t=> t._id);

			const modifications = { title:'modified ticket', properties:{priority:'Top'}}

			await waitForActions(() => {
				dispatch(TicketsActions.updateManyTickets(teamspace, projectId, ids, modifications));
			}, [
				TicketsTypes.UPSERT_TICKETS_SUCCESS,
			]);
			
			for (let i = 0; i < ticketsHalf ;i ++) {
				const ticket = tickets[i];
				const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
				delete ticketFromStore.properties['Updated at'];
				const modified = {...ticket,  ...modifications, properties:{...ticket.properties, priority:'Top' } };
				// All the tickets from the first half should have been modified			
				expect(ticketFromStore).toEqual(modified);
			}

			for (let i = ticketsHalf; i < ticketsCount ;i ++) {
				const ticket = tickets[i];
				const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
				// All the tickets from the second half should have stayed the same			
				expect(ticketFromStore).toEqual(ticket);
			}
		});

		it('should insert a ticket', () => {
			const ticket = ticketMockFactory({ modelId });
			dispatch(TicketsActions.upsertTicketSuccess(modelId, ticket));
			const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
			expect(ticketFromStore).toEqual(ticket);
		});
	});

	describe('templates', () => {
		beforeEach(() => {
			dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
		});

		it('should fetch and set model templates', () => {
			const template = templateMockFactory();
			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [template]));
			const templatesFromState = selectTemplates(getState(), modelId);
	
			expect(templatesFromState[0]).toEqual(template);
		});


		it('should replace the template', () => {
			const template = templateMockFactory();
			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [template]));
	
			const newTemplate = templateMockFactory();
			newTemplate._id = template._id;

			dispatch(TicketsActions.replaceTemplateSuccess(modelId, newTemplate));
			
			const ticketFromStore = selectTemplateById(getState(), modelId, template._id);

			expect(ticketFromStore).toEqual(newTemplate);
		});

		it('deprecated fields shouldnt be there', () => {
			const templateWithDeprecated = templateMockFactory({ 
				properties: [
					{
						name:'Prop1',
						type:'text',
					},
					{
						name:'Deprecated prop',
						type:'boolean',
						deprecated: true,
					}
				],
				modules: [
					{ 
						name: 'a module',
						properties: [
							{
								name:'A deprecated module prop',
								type:'text',
								deprecated: true,
							},
							{
								name:'Modules Prop',
								type:'text',
							},
							{
								name:'Another deprecated prop',
								type:'boolean',
								deprecated: true,
							}
						],
					},
					{ 
						name: 'a deprecated module',
						deprecated: true,
						properties: [
							{
								name:'A deprecated Modules Prop',
								type:'text',
							}
						],
					},

				]
			});
			

			const templateWithoutDeprecated = {
				...templateWithDeprecated,
				properties: [
					{
						name:'Prop1',
						type:'text',
					}
				],
				modules: [
					{ 
						name: 'a module',
						properties: [
							{
								name:'Modules Prop',
								type:'text',
							}
						],
					},
				]
			};

			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [templateWithDeprecated]));
			const templatesFromState = selectTemplates(getState(), modelId);
	
			expect(templatesFromState[0]).toEqual(templateWithoutDeprecated);	
		});
	});



	describe('settings', () => {
		const riskCategories = mockRiskCategories();
		it('should set and fetch the risk categories', () => {
			dispatch(TicketsActions.fetchRiskCategoriesSuccess(riskCategories));
			const riskCategoriesFromStore = selectRiskCategories(getState());
			expect(riskCategoriesFromStore).toEqual(riskCategories);
		});
	});
});
