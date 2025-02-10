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
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketSortingProperty, TicketsSortingProperty } from '@/v5/store/tickets/card/ticketsCard.types';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { SortingArrow } from '@controls/sortingArrow/sortingArrow.component';
import { ActionMenuItem } from '@controls/actionMenu';
import { MenuList } from '@mui/material';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { ExpandIconContainer } from './sortingMenu.styles';
import { useContext } from 'react';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { PopoverHoveringContent } from '@controls/hoverPopover/popoverHoveringContent.component';

export const SortingProperty = ({ property, title }) => {
	const sorting = TicketsHooksSelectors.selectSorting();
	const {} = useContext(ActionMenuContext);

	const sortBy = (prop: TicketsSortingProperty) => {
		const shouldBeAsc = sorting.property === prop && sorting.order === 'desc';
		TicketsActionsDispatchers.setSorting(prop, shouldBeAsc ? 'asc' : 'desc');
	};

	return (
		<ActionMenuItem>
			<EllipsisMenuItem
				onClick={() => sortBy(property)}
				title={
					<>
						{title}
						{sorting.property === property && <SortingArrow ascendingOrder={sorting.order === 'asc'} />}
					</>
				}
			/>
		</ActionMenuItem>
	);
};

export const SortingMenu = () => (
	<PopoverHoveringContent
		anchor={() => (
			<EllipsisMenuItem
				title={
					<>
						{formatMessage({ id: 'viewer.cards.tickets.sortBy', defaultMessage: 'Sort by' })}
						<ExpandIconContainer>
							<ChevronIcon />
						</ExpandIconContainer>
					</>
				}
			/>
		)}
	>
		<MenuList>
			<SortingProperty
				property={TicketSortingProperty.CREATED_AT}
				title={formatMessage({ id: 'viewer.cards.tickets.sortBy.createdAt', defaultMessage: 'Created at' })}
			/>
			<SortingProperty
				property={TicketSortingProperty.UPDATED_AT}
				title={formatMessage({ id: 'viewer.cards.tickets.sortBy.lastUpdated', defaultMessage: 'Last updated' })}
			/>
			<SortingProperty
				property={TicketSortingProperty.TICKET_CODE}
				title={formatMessage({ id: 'viewer.cards.tickets.sortBy.ticketId', defaultMessage: 'Ticket ID' })}
			/>
		</MenuList>
	</PopoverHoveringContent>
);