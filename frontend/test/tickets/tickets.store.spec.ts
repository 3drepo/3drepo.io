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
import { TicketsActions } from '@/v5/store/tickets/tickets.redux';
import { selectTickets, selectTemplates, selectTicketById, selectTemplateById, selectRiskCategories, selectFilterableTemplatesIds } from '@/v5/store/tickets/tickets.selectors';
import { cloneDeep, times } from 'lodash';
import { createTestStore } from '../test.helpers';
import { mockRiskCategories, templateMockFactory, ticketMockFactory } from './tickets.fixture';

describe('Tickets: store', () => {
	let dispatch, getState;
	const teamspace = 'teamspace';
	const modelId = 'modelId';

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
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
		
		it('should set and fetch filterable template ids', () => {
			const filterableTemplateIds = times(3, () => templateMockFactory()._id)
			dispatch(TicketsActions.setFilterableTemplatesIds(filterableTemplateIds));
			const filterableTemplatesFromStore = selectFilterableTemplatesIds(getState());
			expect(filterableTemplatesFromStore).toEqual(filterableTemplateIds);
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
