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
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { ExpandingMenu } from '@controls/ellipsisMenu/expandingMenu/expandingMenu.component';
import { ExpandingMenuItem } from '@controls/ellipsisMenu/expandingMenu/expandingMenuItem/expandingMenuItem.component';

const Item = ({ property, title }: { property: TicketsSortingProperty, title: string }) => {
	const sorting = TicketsHooksSelectors.selectSorting();
	const handleClick = () => TicketsActionsDispatchers.setSorting(property, sorting.order);

	return (
		<ExpandingMenuItem
			onClick={handleClick}
			title={
				<>
					{title}
					{sorting.property === property && <TickIcon />}
				</>
			}
		/>
	);
};

export const SortingPropertyMenu = () => (
	<ExpandingMenu title={formatMessage({ id: 'viewer.cards.tickets.sortBy', defaultMessage: 'Sort by' })}>
		<Item
			property={TicketSortingProperty.CREATED_AT}
			title={formatMessage({ id: 'viewer.cards.tickets.sortBy.createdAt', defaultMessage: 'Created at' })}
		/>
		<Item
			property={TicketSortingProperty.UPDATED_AT}
			title={formatMessage({ id: 'viewer.cards.tickets.sortBy.lastUpdated', defaultMessage: 'Last updated' })}
		/>
		<Item
			property={TicketSortingProperty.TICKET_CODE}
			title={formatMessage({ id: 'viewer.cards.tickets.sortBy.ticketCode', defaultMessage: 'Ticket code' })}
		/>
	</ExpandingMenu>
);
