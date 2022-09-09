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
import { selectModelTickets } from '@/v5/store/tickets/tickets.selectors';
import { createTestStore } from '../test.helpers';
import { ticketMockFactory } from './tickets.fixture';

describe('Federations: store', () => {
	let dispatch, getState;
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
});
