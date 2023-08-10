/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ITicket } from '@/v5/store/tickets/tickets.types';
import { FormattedMessage } from 'react-intl';
import { sortBy } from 'lodash';
import { Header, Headers, Group } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';

export const TicketsTableGroup = ({ tickets, onTicketClick }) => {
	if (!tickets?.length) return (<button type="button"> create new ticket </button>);

	const sortById = (tckts) => sortBy(tckts, ({ type, _id }) => type + _id);

	return (
		<>
			<Headers>
				<Header>
					<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.title" defaultMessage="title" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.assignees" defaultMessage="assignees" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.owner" defaultMessage="owner" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.dueDate" defaultMessage="due date" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.priority" defaultMessage="priority" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.status" defaultMessage="status" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.levelOfRisk" defaultMessage="level of risk" />
				</Header>
				<Header>
					<FormattedMessage id="ticketTable.column.header.treatmentStatus" defaultMessage="treatment status" />
				</Header>
			</Headers>
			<Group>
				{sortById(tickets).map((ticket: ITicket) => (
					<TicketsTableRow
						key={ticket._id}
						ticket={ticket}
						onClick={() => onTicketClick(ticket)}
					/>
				))}
			</Group>
		</>
	);
};
