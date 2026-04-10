/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { groupTickets, TicketsGroup } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTableGroupBy.helper';
import { createSelector } from 'reselect';
import { NONE_OPTION } from '../ticketsGroups.helpers';
import { selectFilteredTickets, selectGroupBy, selectCurrentTemplates } from './ticketsCard.selectors';
import { createHooksSelectors } from '@/v5/helpers/selectorsHooks.helper';

// This selector is in isolation because it uses groupTickets which depends on selectors
// if this were to be in  ticketsCard.selectors it would create a circular dependency between the two files

const selectGroupedFilteredTickets = createSelector(
	selectFilteredTickets,
	selectGroupBy,
	selectCurrentTemplates,
	(tickets, groupBy, templates): TicketsGroup[] => {
		if (groupBy === NONE_OPTION) return [{ groupName: NONE_OPTION, value: NONE_OPTION, tickets }];
		return groupTickets(groupBy, templates, tickets);
	},
);

export const TicketsCardsGroupedHooksSelectors = createHooksSelectors({ selectGroupedFilteredTickets });
