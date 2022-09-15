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
import { selectModelTickets, selectCurrentTeamspaceTemplates } from '@/v5/store/tickets/tickets.selectors';
import { createTestStore } from '../test.helpers';
import { templateDetailsMockFactory, templateMockFactory, ticketMockFactory } from './tickets.fixture';

describe('Tickets: store', () => {
	let dispatch, getState;
	const teamspace = 'teamspace';
	const modelId = 'modelId';

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
	});

	it('should update a model tickets', () => {
		const ticket = ticketMockFactory();
		dispatch(TicketsActions.fetchModelTicketsSuccess(modelId, [ticket]));
		const modelTicketsFromState = selectModelTickets(getState(), modelId);

		expect(modelTicketsFromState[0]).toEqual(ticket);
	});

	describe('templates', () => {
		beforeEach(() => {
			dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
		});

		it('should update teamspace templates', () => {
			const template = templateMockFactory();
			dispatch(TicketsActions.fetchTemplatesSuccess(teamspace, [template]));
			const templatesFromState = selectCurrentTeamspaceTemplates(getState());
	
			expect(templatesFromState[0]).toEqual(template);
		});
	
		it('should update template details', () => {
			const template = templateMockFactory();
			const details = templateDetailsMockFactory();
			dispatch(TicketsActions.fetchTemplatesSuccess(teamspace, [template]));
			dispatch(TicketsActions.fetchTemplateDetailsSuccess(teamspace, template._id, details));
			const templatesFromState = selectCurrentTeamspaceTemplates(getState());
	
			expect(templatesFromState[0]).toEqual({ ...template, ...details });
		});
	})
});
