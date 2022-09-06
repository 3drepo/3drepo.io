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
import { ITicket } from '@/v5/store/store.types';
import { useState } from 'react';
import { List, Ticket, Id, Title } from './ticketsList.styles';

type TicketsListProps = {
	tickets: ITicket[];
};

export const TicketsList = ({ tickets }: TicketsListProps) => {
	const [selectedTicket, setSelectedTicket] = useState<ITicket>(null);

	const ticketIsSelected = ({ _id }: ITicket) => selectedTicket?._id === _id;

	const handleTicketClick = (ticket: ITicket) => {
		if (!ticketIsSelected(ticket)) {
			setSelectedTicket(ticket);
		} else {
			// navigate to expanded ticket
			// eslint-disable-next-line
			console.log('navigating to ticket');
		}
	};

	return (
		<List>
			{tickets.map((ticket) => (
				<Ticket
					onClick={() => handleTicketClick(ticket)}
					key={ticket._id}
					$selected={ticketIsSelected(ticket)}
				>
					<Id>{ticket.type}:{ticket.number}</Id>
					<Title>{ticket.title}</Title>
				</Ticket>
			))}
		</List>
	);
};
