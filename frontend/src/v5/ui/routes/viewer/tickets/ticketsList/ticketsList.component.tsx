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
import { untilXFramesPassed, VirtualList, VListHandle } from '@controls/virtualList/virtualList.component';
import { groupTickets, TicketsGroup } from '../../../dashboard/projects/tickets/ticketsTable/ticketsTableGroupBy.helper';
import { TicketsGroupedList } from './ticketGroupedList/ticketsGroupedList.component';


const TicketsListsContainer = ({ children, scrollerRef }) => {
	return (
		<ListContainer >
			<div 
				ref={scrollerRef }
				style={{
					overflowY: 'auto',
					position: 'relative',
					height: '100%',
				}}
			>
				<div style={{ position:'absolute' }}>
					{children}
				</div>
			</div>
		</ListContainer>
	);
};

export const TicketsList = ({ groupBy, templates, loading }) => {
	const filteredTickets = TicketsCardHooksSelectors.selectFilteredTickets();
	const selectedTicketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isFiltering = TicketsCardHooksSelectors.selectIsFiltering();
	let groups:TicketsGroup[];
	const tableHandle = useRef<VListHandle>();
	const subTableHandle = useRef<VListHandle>();
	const scrollerRef = useRef<Element>();


	if (groupBy !== 'none') {
		groups = groupTickets(groupBy, templates, filteredTickets);
		const idsToNumber = {};
		let c = 0;

		groups.forEach((g)=> {
			g.tickets.forEach((t) => {
				idsToNumber[t._id] = c++;
			});
		});
	}

	let selectedIndex = -1;
	let selectedSubIndex = -1;
	if (groupBy === 'none') {
		selectedIndex = filteredTickets.findIndex((ticket) => ticket._id === selectedTicketId) ;
	} else {
		selectedIndex = groups.findIndex((g) => {
			const index = g.tickets.findIndex((ticket) => ticket._id === selectedTicketId);
			if (index !== -1) {
				selectedSubIndex = index;
				return true;
			}
			return false;
		});
	}

	useEffect(() => {
		if (selectedIndex == -1) return;
		if (groupBy === 'none') {
			tableHandle.current?.gotoIndex(selectedIndex, scrollerRef.current);
		 } else {
			if (!tableHandle.current) {
				return;
			}
			const groupCollapseHeight = 50;

			const scrollingElement = scrollerRef.current;

			// For going to an index on a sublist there's no built in mechanism for now
			// so it's done manually
			const offset = tableHandle.current.getOffsetToIndex(selectedIndex) + 
						(subTableHandle.current?.getOffsetToIndex(selectedSubIndex) || 0) + 
						groupCollapseHeight;

			scrollingElement.scrollTop = offset;

			(async () => {
				let done = false;
				for (let i = 0 ; i < 10 && !done ; i++) {
					await untilXFramesPassed(10);
					const currentScroll = Math.round(scrollingElement.scrollTop);
					const otherScroll = Math.round(
						tableHandle.current.getOffsetToIndex(selectedIndex) + 
						(subTableHandle.current?.getOffsetToIndex(selectedSubIndex) || 0) + 
						groupCollapseHeight,
					);
						
					if (currentScroll != otherScroll) {
						scrollingElement.scrollTop = otherScroll;
					} else {
						done = true;
					}
				}
			})();

		}
	}, [selectedTicketId, groupBy, tableHandle.current, subTableHandle.current]);

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

	if (groups) {
		return (
			<TicketsListsContainer scrollerRef={scrollerRef}>
				<VirtualList
					handle={tableHandle}
					vKey='groups-list'
					items={groups}
					itemHeight={30}
					ItemComponent={(group: TicketsGroup, index) => 
						<TicketsGroupedList expanded={index === selectedIndex } loading={loading} key={group.groupName} {...group} handle={index === selectedIndex ? subTableHandle : undefined }/>
					}
				/>
			</TicketsListsContainer>
		);
	}

	return (
		<TicketsListsContainer scrollerRef={scrollerRef}>
			<List>
				<VirtualList 
					handle={tableHandle}
					vKey='groups-list'
					items={filteredTickets}
					itemHeight={30}
					ItemComponent={(ticket) => <TicketItem ticket={ticket} key={ticket._id} />}
				/>
			</List>
		</TicketsListsContainer>
	);
};
