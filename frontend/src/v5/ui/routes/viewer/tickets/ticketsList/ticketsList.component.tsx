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
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useState } from 'react';
import { flatMap, groupBy } from 'lodash';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { TicketItem } from './ticketItem/ticketItem.component';
import { List, TemplateName, Filters } from './ticketsList.styles';

type TicketsListProps = {
	tickets: ITicket[];
};

export const TicketsList = ({ tickets }: TicketsListProps) => {
	const [selectedTicket, setSelectedTicket] = useState<ITicket>(null);
	const [templateNamesToUseForFilter, setTemplateNamesToUseForFilter] = useState<string[]>([]);
	const templates = TicketsHooksSelectors.selectCurrentTeamspaceTemplates();
	const templateNamesById = templates.reduce(
		(acc, { _id, name }) => ({ ...acc, [_id]: name }),
		{} as Record<string, string>,
	);
	const ticketsByType = Object.entries(groupBy(tickets, 'type'));
	const ticketsByTemplateName = ticketsByType.reduce(
		(acc, [type, templateTickets]) => ({ ...acc, [templateNamesById[type]]: templateTickets }),
		{} as Record<string, ITicket[]>,
	);

	const ticketIsSelected = ({ _id }: ITicket) => selectedTicket?._id === _id;

	const toggleFilterName = (name: string) => {
		if (templateNamesToUseForFilter.includes(name)) {
			setTemplateNamesToUseForFilter(
				templateNamesToUseForFilter.filter((templateName) => templateName !== name),
			);
		} else {
			setTemplateNamesToUseForFilter(templateNamesToUseForFilter.concat(name));
		}
	};

	const getFilteredTickets = () => {
		if (templateNamesToUseForFilter.length === 0) return tickets;
		return flatMap(templateNamesToUseForFilter, (name) => ticketsByTemplateName[name])
			.sort((a, b) => a.number - b.number);
	};

	const onTicketClick = (ticket: ITicket) => {
		if (ticketIsSelected(ticket)) {
			// navigate to ticket
		} else {
			setSelectedTicket(ticket);
		}
	};

	return (
		<>
			<Filters>
				{Object.entries(ticketsByTemplateName).map(([name, templateTickets]) => (
					<TemplateName
						key={name}
						$selected={templateNamesToUseForFilter.includes(name)}
						onClick={() => toggleFilterName(name)}
					>
						{name} ({templateTickets.length})
					</TemplateName>
				))}
			</Filters>
			<List>
				{getFilteredTickets().map((ticket) => (
					<TicketItem
						ticket={ticket}
						key={ticket._id}
						onClick={() => onTicketClick(ticket)}
						selected={ticketIsSelected(ticket)}
					/>
				))}
			</List>
		</>
	);
};
