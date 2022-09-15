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
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { Ticket, Id, Title } from './ticketItem.styles';

type TicketItemProps = {
	ticket: ITicket;
	onClick: () => void;
	selected?: boolean;
};

export const TicketItem = ({ ticket, onClick, selected }: TicketItemProps) => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const template = TicketsHooksSelectors.selectModelTemplateById(containerOrFederation, ticket.type);

	return (
		<Ticket
			onClick={onClick}
			key={ticket._id}
			$selected={selected}
		>
			<Id>{template?.code}:{ticket.number}</Id>
			<Title>{ticket.title}</Title>
		</Ticket>
	);
};
