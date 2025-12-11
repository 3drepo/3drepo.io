/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { useVRef, VirtualList } from '@controls/virtualList/virtualList.component';
import { TicketsGroup } from '../../../../dashboard/projects/tickets/ticketsTable/ticketsTableGroupBy.helper';
import { CollapseControl } from '@controls/collapseControl/collapseControl.component';
import { List } from '../ticketsList.styles';
import { TicketItem } from '../ticketItem/ticketItem.component';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { GroupedListSpacer, GroupedListToggleContainer, GroupedListToggleTitle } from './ticketGroupedList.styles';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { ChevronIconContainer } from '@components/viewer/cards/cardFilters/filtersAccordion/filtersAccordion.styles';

export const TicketsGroupedList = ({ tickets, groupName } : TicketsGroup) => {
	const expanded = useVRef<boolean>(groupName + '.expanded', true);

	return (
		<GroupedListSpacer>
			<List>
				<CollapseControl
					CollapseToggleComponent={(({ expanded: expandedProp }) => (
						<GroupedListToggleContainer>
							<GroupedListToggleTitle>
								{groupName}
								<CircledNumber>{tickets.length}</CircledNumber>
							</GroupedListToggleTitle>
							<ChevronIconContainer $collapsed={!expandedProp}>
								<ChevronIcon />
							</ChevronIconContainer>
						</GroupedListToggleContainer>
					))}
					defaultExpanded={expanded.current}
					onChangeCollapse={(collapsed) => expanded.current = !collapsed }
				>
					<VirtualList 
						vKey={'tickets-list-' + tickets[0].title}
						items={tickets}
						itemHeight={30}
						ItemComponent={(ticket: ITicket) => 
							<TicketItem ticket={ticket} key={ticket._id} />}
					/>
				</CollapseControl>
			</List>
		</GroupedListSpacer>
	);
};
