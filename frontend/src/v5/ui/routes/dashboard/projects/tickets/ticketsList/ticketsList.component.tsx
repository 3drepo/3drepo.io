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
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import _ from 'lodash';
import { Accordion } from '@controls/accordion/accordion.component';
import { PriorityLevels, RiskLevels, TicketStatuses, TreatmentStatuses } from '@controls/chip/chip.types';
import { GROUP_BY_NONE_OPTION } from '../selectMenus/groupBySelect.component';
import { formatMessage } from '@/v5/services/intl';
import { TicketRow } from './ticketRow/ticketRow.component';

const TicketGroup = ({ tickets, onTicketClick }) => (
	<>
		{tickets.map((ticket: ITicket) => (
			<TicketRow
				key={ticket._id}
				ticket={ticket}
				onClick={() => onTicketClick(ticket)}
			/>
		))}
	</>
);

const NO_DUE_DATE = formatMessage({ id: 'groupBy.dueDate.unset', defaultMessage: 'No due date' });
const OVERDUE = formatMessage({ id: 'groupBy.dueDate.overdue', defaultMessage: 'Overdue' });

const getOptionsForGroupsWithDueDate = () => [
	OVERDUE,
	formatMessage({ id: 'groupBy.dueDate.inOneWeek', defaultMessage: 'in 1 week' }),
	formatMessage({ id: 'groupBy.dueDate.inTwoWeeks', defaultMessage: 'in 2 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inThreeWeeks', defaultMessage: 'in 3 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inFourWeeks', defaultMessage: 'in 4 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inFiveWeeks', defaultMessage: 'in 5 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inSixPlusWeeks', defaultMessage: 'in 6+ weeks' }),
];

const groupByDate = (tickets: ITicket[]) => {
	const groups = {};
	let [ticketsWithUnsetDueDate, remainingTickets] = _.partition(tickets, ({ properties }) => !properties[IssueProperties.DUE_DATE]);
	groups[NO_DUE_DATE] = ticketsWithUnsetDueDate;

	const dueDateOptions = getOptionsForGroupsWithDueDate();
	const endOfCurrentWeek = new Date();

	const ticketDueDateIsPassed = (ticket: ITicket) => ticket.properties.dueDate < endOfCurrentWeek.getTime();

	let currentWeekTickets;
	while (dueDateOptions.length) {
		[currentWeekTickets, remainingTickets] = _.partition(remainingTickets, ticketDueDateIsPassed);
		groups[dueDateOptions.shift()] = currentWeekTickets;
		endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() +  7);
	}
	return groups;
};

const UNSET = formatMessage({ id: 'groupBy.property.unset', defaultMessage: 'Unset' });
const groupByList = (tickets: ITicket[], groupType: string, groupNamesWithoutUnset: string[]) => {
	const groupNames = groupNamesWithoutUnset.concat(UNSET);
	const groups = Object.fromEntries(groupNames.map((groupName) => [_.capitalize(groupName), []]));
	tickets.forEach((ticket) => {
		const { properties } = ticket;
		const groupName = (groupType in properties) ? properties[groupType] : UNSET;
		groups[groupName].push(ticket);
	});
	return groups;
};

const GROUP_NAMES_BY_TYPE = {
	[IssueProperties.PRIORITY]: _.keys(PriorityLevels),
	[IssueProperties.STATUS]: _.keys(TicketStatuses),
	[SafetibaseProperties.LEVEL_OF_RISK]: _.keys(RiskLevels),
	[SafetibaseProperties.TREATMENT_STATUS]: _.keys(TreatmentStatuses),
};

export const TicketsList = (props: { onTicketClick: (ticket: ITicket) => void }) => {
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

	if (groupBy === GROUP_BY_NONE_OPTION) {
		return (<TicketGroup tickets={filteredItems} {...props} />);
	}

	let groups;
	switch(groupBy) {
		case BaseProperties.OWNER: 
			groups = _.groupBy(filteredItems, `properties.${BaseProperties.OWNER}`);
			break;
		case IssueProperties.DUE_DATE:
			groups = groupByDate(filteredItems);
			break;
		default:
			groups = groupByList(filteredItems, groupBy, GROUP_NAMES_BY_TYPE[groupBy]);
	}

	return (
		<>
			{_.entries(groups).map(([groupName, tickets]) => (
				<Accordion title={groupName}>
					<TicketGroup tickets={tickets} {...props} />
				</Accordion>
			))}
		</>
	);
};
