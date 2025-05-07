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
import { TableVirtuoso } from 'react-virtuoso';
import { Loader } from '@/v4/routes/components/loader/loader.component';

export const TicketsList = () => {
	const filteredTickets = TicketsCardHooksSelectors.selectFilteredTickets();


	return (
		<ListContainer>
			<Loader />
			<TableVirtuoso
				data={filteredTickets}
				followOutput={() => true}
				components={{
					Table: List,
				}}
				overscan={1000}
				increaseViewportBy={1000}
				style={{ position: 'relative', top: '-100%' }}
				itemContent={(index, ticket) => (
					<TicketItem ticket={ticket} key={ticket._id} />
	 		)}
	 	/>
		</ListContainer>);
	// return (
	// 	<TableVirtuoso
	// 		data={filteredTickets}
	// 		followOutput={() => true}
	// 		overscan={100}
	// 		itemContent={(index, ticket) => (
	// 			<TicketItem ticket={ticket} key={ticket._id} />
	// 		)}
	// 	/>
	// );


	// return (
	// 	<>
	// 		{filteredTickets.length ? (
	// 			<List>
	// 				{filteredTickets.map((ticket) => <TicketItem ticket={ticket} key={ticket._id} />)}
	// 			</List>
	// 		) : (
	// 			<EmptyListMessage>
	// 				<FormattedMessage id="viewer.cards.tickets.noResults" defaultMessage="No tickets found. Please try another search." />
	// 			</EmptyListMessage>
	// 		)}
	// 	</>
	// );
};
