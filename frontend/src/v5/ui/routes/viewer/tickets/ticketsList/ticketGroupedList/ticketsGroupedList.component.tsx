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

import { useVRef, VirtualList, VListHandle } from '@controls/virtualList/virtualList.component';
import { TicketsGroup } from '../../../../dashboard/projects/tickets/ticketsTable/ticketsTableGroupBy.helper';
import { CollapseControl } from '@controls/collapseControl/collapseControl.component';
import { List } from '../ticketsList.styles';
import { TicketItem } from '../ticketItem/ticketItem.component';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { GroupedListSpacer, GroupedListToggleContainer, GroupedListToggleTitle, GroupedTextOverflow, Spinner } from './ticketGroupedList.styles';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { ChevronIconContainer } from '@components/viewer/cards/cardFilters/filtersAccordion/filtersAccordion.styles';
import { MutableRefObject, useContext } from 'react';
import { TicketsBulkUpdateContext } from '@components/tickets/bulkUpdate/bulkUpdate.context';
import { TicketCheckbox } from '../ticketItem/ticketItem.styles';

type GroupedListProps = {
	handle?: MutableRefObject<VListHandle>;
	loading: boolean;
	expanded: boolean;
};

export const TicketsGroupedList = ({ items: tickets, groupName, handle, loading, expanded: expandedDefault } : TicketsGroup & GroupedListProps) => {
	const expanded = useVRef<boolean>(groupName + '.expanded', expandedDefault);
	const { selectedItems, bulkModeOn, addOrRemoveSelection } =  useContext(TicketsBulkUpdateContext);

	const ids = tickets.map(({ _id }) => _id);

	const allSelected = ids.every((id) =>  selectedItems.has(id));
	const someSelected = !allSelected && ids.some((id) =>  selectedItems.has(id));

	const clickOnBulkCheckbox = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		event.stopPropagation();
		addOrRemoveSelection(ids, allSelected);
	};
	
	return (
		<GroupedListSpacer>
			<List>
				<CollapseControl
					CollapseToggleComponent={(({ expanded: expandedProp }) => (
						<GroupedListToggleContainer $expanded={expandedProp}>
							<GroupedListToggleTitle>
								{bulkModeOn && (<TicketCheckbox checked={allSelected} indeterminate={someSelected} onClick={clickOnBulkCheckbox}/>)} 
								<GroupedTextOverflow>{groupName}</GroupedTextOverflow>
								{loading && (<Spinner />)}
								{!loading && (<CircledNumber>{tickets.length}</CircledNumber>)}
							</GroupedListToggleTitle>
							<ChevronIconContainer $collapsed={!expandedProp}>
								<ChevronIcon />
							</ChevronIconContainer>
						</GroupedListToggleContainer>
					))}
					defaultExpanded={expanded.current}
					onChangeCollapse={(collapsed) => expanded.current = !collapsed }
					unmountHidden
				>
					<VirtualList 
						handle={handle}
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
