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
import { useEffect } from 'react';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { TicketItem } from './ticketItem/ticketItem.component';
import { List } from './ticketsList.styles';
import { CardFilters } from '@components/viewer/cards/cardFilters/cardFilters.component';

export const TicketsList = () => {
	const selectedTicket = TicketsCardHooksSelectors.selectSelectedTicket();

	const filteredItems = TicketsCardHooksSelectors.selectTicketsWithAllFiltersApplied();

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicketPin(selectedTicket?._id);

		const unselectTicket = () => TicketsCardActionsDispatchers.setSelectedTicket(null);
		ViewerService.on(VIEWER_EVENTS.BACKGROUND_SELECTED, unselectTicket);
		return () => ViewerService.off(VIEWER_EVENTS.BACKGROUND_SELECTED, unselectTicket);
	}, []);

	return (
		<>
			<CardFilters />
			{filteredItems.length ? (
				<List>
					{filteredItems.map((ticket) => <TicketItem ticket={ticket} key={ticket._id} />)}
				</List>
			) : (
				<EmptyListMessage>
					<FormattedMessage id="viewer.cards.tickets.noResults" defaultMessage="No tickets found. Please try another search." />
				</EmptyListMessage>
			)}
		</>
	);
};
