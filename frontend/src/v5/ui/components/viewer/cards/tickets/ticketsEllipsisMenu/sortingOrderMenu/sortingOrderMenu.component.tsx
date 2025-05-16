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
import { TicketsSortingOrder } from '@/v5/store/tickets/card/ticketsCard.types';
import { ExpandingMenu } from '@controls/ellipsisMenu/expandingMenu/expandingMenu.component';
import { ExpandingMenuItem } from '@controls/ellipsisMenu/expandingMenu/expandingMenuItem/expandingMenuItem.component';

const Item = ({ order, title }: { order: TicketsSortingOrder, title: string }) => {
	const sorting = TicketsHooksSelectors.selectSorting();
	const handleClick = () => TicketsActionsDispatchers.setSorting(sorting.property, order);

	return (
		<ExpandingMenuItem
			onClick={handleClick}
			title={title}
			selected={sorting.order === order}
		/>
	);
};

export const SortingOrderMenu = () => (
	<ExpandingMenu title={formatMessage({ id: 'viewer.cards.tickets.sortingOrder', defaultMessage: 'Sorting order' })}>
		<Item
			order="asc"
			title={formatMessage({ id: 'viewer.cards.tickets.sortingOrder.ascending', defaultMessage: 'Ascending' })}
		/>
		<Item
			order="desc"
			title={formatMessage({ id: 'viewer.cards.tickets.sortingOrder.descending', defaultMessage: 'Descending' })}
		/>
	</ExpandingMenu>
);
