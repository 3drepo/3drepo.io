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
import { List, ListContainer } from './ticketsList.styles';
import { useEffect, useRef } from 'react';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { groupTickets, TicketsGroup } from '../../../dashboard/projects/tickets/ticketsTable/ticketsTableGroupBy.helper';
import { TicketsGroupedList } from './ticketsGroupedList.component';


const TicketsListsContainer = ({ children }) => {
	return (
		<ListContainer >
			<div style={{
				overflowY: 'auto',
    			position: 'relative',
    			height: '100%',
			}}>
				<div
					style={{ position:'absolute' }}
				>
					{children}
				</div>
			</div>
		</ListContainer>
	);
};

export const TicketsList = ({ groupBy, templates }) => {
	const filteredTickets = TicketsCardHooksSelectors.selectFilteredTickets();
	const selectedTicketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const selectedIndex = filteredTickets.findIndex((ticket) => ticket._id === selectedTicketId);
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

	if (groupBy !== 'none') {
		const groups = groupTickets(groupBy, templates, filteredTickets);
		const idsToNumber = {};
		let c = 0;

		groups.forEach((g)=> {
			g.tickets.forEach((t) => {
				idsToNumber[t._id] = c++;
			});
		});

		return (
			<TicketsListsContainer>
				<VirtualList
					vKey='groups-list'
					items={groups}
					itemHeight={30}
					ItemComponent={(group: TicketsGroup) => 
						<TicketsGroupedList key={group.groupName} {...group} />
					}
				/>
			</TicketsListsContainer>
		);
	}

	return (
		<TicketsListsContainer>
			<List>
				<VirtualList 
					vKey='groups-list'
					items={filteredTickets}
					itemHeight={30}
					ItemComponent={(ticket) => <TicketItem ticket={ticket} key={ticket._id} />}
				/>
			</List>
		</TicketsListsContainer>
	);
};
