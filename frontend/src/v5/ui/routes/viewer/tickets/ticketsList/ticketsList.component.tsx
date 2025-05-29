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
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import { TicketItem } from './ticketItem/ticketItem.component';
import { List, ListContainer, Loader } from './ticketsList.styles';
import { TableVirtuoso } from 'react-virtuoso';
import { useEffect, useRef } from 'react';

export const TicketsList = () => {
	const filteredTickets = TicketsCardHooksSelectors.selectCurrentModelFilteredTickets();
	const selectedTicketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const selectedIndex = filteredTickets.findIndex((ticket) => ticket._id === selectedTicketId);
	const shouldShowLoader = filteredTickets.length >= 10;
	const virtuosoRef = useRef<any>();
	const isFiltering = TicketsCardHooksSelectors.selectIsFiltering();
	
	useEffect(() => {
		virtuosoRef.current?.scrollToIndex?.({
			behavior: 'instant',
			block: 'nearest',
			align: 'start',
			index: selectedIndex === -1 ? 0 : selectedIndex,
		});
	}, [selectedIndex, filteredTickets, isFiltering]);

	if (isFiltering) {
		return (
			<EmptyListMessage>
				<FormattedMessage id="viewer.cards.tickets.searching" defaultMessage="Searching..." />
			</EmptyListMessage>
		);
	}


	if (!filteredTickets.length) {
		return (
			<EmptyListMessage>
				<FormattedMessage id="viewer.cards.tickets.noResults" defaultMessage="No tickets found. Please try another search." />
			</EmptyListMessage>
		);
	}

	return (
		<ListContainer >
			{shouldShowLoader && <Loader />}
			<TableVirtuoso
				ref={virtuosoRef}
				data={filteredTickets}
				followOutput={() => true}
				components={{
					Table: List,
				}}
				increaseViewportBy={400}
				style={{ position: 'relative', top: (shouldShowLoader ? '-100%' : 0) }}
				itemContent={(index, ticket) => (
					<TicketItem ticket={ticket} key={ticket._id} />
				)}
			/>
		</ListContainer>
	);
};
