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
import { Headers } from './ticketsGroup.styles';
import { TicketsGroupsRow } from './ticketsGroupsRow/ticketsGroupsRow.component';

export const TicketsGroup = ({ tickets, onTicketClick }) => {
	if (!tickets?.length) return (<button type="button"> create new ticket </button>);

	return (
		<>
			<Headers>
				<b>id</b>
				<b>title</b>
				<b>assignees</b>
				<b>owner</b>
				<b>due date</b>
				<b>priority</b>
				<b>status</b>
				<b>level of risk</b>
				<b>treatment status</b>
			</Headers>
			<div>
				{tickets.map((ticket: ITicket) => (
					<TicketsGroupsRow
						key={ticket._id}
						ticket={ticket}
						onClick={() => onTicketClick(ticket)}
					/>
				))}
			</div>
		</>
	);
};
