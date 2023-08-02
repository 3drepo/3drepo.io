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

import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { EmptyTicketsList } from './ticketsList.styles';
import { FormattedMessage } from 'react-intl';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';

const TicketRow = ({ ticket, onClick }: { ticket: ITicket, onClick: () => void }) => {
	const { _id, title, properties } = ticket;

	if (!properties) return (<span>Loading</span>);

	const {
		owner,
		assignees,
		priority,
		status
	} = getPropertiesInCamelCase(properties);

	return (
		<>
			<div key={_id} onClick={onClick}>
				<span>{title} ~ </span>
				<span>{assignees} ~ </span>
				<span>{owner} ~ </span>
				<span>{priority} ~ </span>
				<span>{status} ~ </span>
			</div>
		</>
	)
}

export const TicketsList = ({ onSelectTicket }) => {
	const { filteredItems } = useContext(SearchContext);
	const { groupBy } = useParams<DashboardTicketsParams>();

	if (!filteredItems.length) {
		return (
			<EmptyTicketsList>
				<FormattedMessage
					id="ticketTable"
					defaultMessage="We couldn't find any tickets to show. Please refine your selection."
				/>
			</EmptyTicketsList>
		);
	}
	return (
		<>
			{filteredItems.map((ticket: ITicket) => (
				<TicketRow
					key={ticket._id}
					ticket={ticket}
					onClick={() => onSelectTicket(ticket)}
				/>
			))}
		</>
	);
};
