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

import { formatMessage } from '@/v5/services/intl';
import { ITicket, PropertyTypeDefinition } from '@/v5/store/tickets/tickets.types';
import { IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import _ from 'lodash';
import { stripModuleOrPropertyPrefix } from './ticketsTable.helper';

export const UNSET = formatMessage({ id: 'tickets.selectOption.property.unset', defaultMessage: 'Unset' });
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
	// eslint-disable-next-line prefer-const
	let [ticketsWithUnsetDueDate, remainingTickets] = _.partition(tickets, ({ properties }) => !properties[IssueProperties.DUE_DATE]);
	groups[NO_DUE_DATE] = ticketsWithUnsetDueDate;

	const dueDateOptions = getOptionsForGroupsWithDueDate();
	const endOfCurrentWeek = new Date();

	const ticketDueDateIsPassed = (ticket: ITicket) => ticket.properties[IssueProperties.DUE_DATE] < endOfCurrentWeek.getTime();

	let currentWeekTickets;
	while (dueDateOptions.length) {
		[currentWeekTickets, remainingTickets] = _.partition(remainingTickets, ticketDueDateIsPassed);
		const currentDueDateOption = dueDateOptions.shift();
		groups[currentDueDateOption] = dueDateOptions.length ? currentWeekTickets : currentWeekTickets.concat(remainingTickets);
		endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 7);
	}
	return groups;
};
const sortValues = (ticket: ITicket, groupBy: string) => {
	const sortedValues = _.orderBy(
		_.get(ticket, groupBy),
		(value) => value.trim().toLowerCase(),
	);
	return _.set(_.cloneDeep(ticket), groupBy, sortedValues);
};
const groupByManyOfValues = (tickets: ITicket[], groupBy: string) => {
	const [ticketsWithValue, ticketsWithUnsetValue] = _.partition(tickets, (ticket) => _.get(ticket, groupBy)?.length > 0);
	const ticketsWithSortedValues = ticketsWithValue.map((ticket) => sortValues(ticket, groupBy));
	const ticketsSortedByValues = _.orderBy(
		ticketsWithSortedValues,
		(ticket) => {
			const values = _.get(ticket, groupBy).map((assignee) => assignee.trim().toLowerCase());
			return _.orderBy(values).join();
		},
	);

	const groups = _.groupBy(ticketsSortedByValues, (ticket) => {
		const values = _.get(ticket, groupBy);
		return values.join(', ');
	});
	if (ticketsWithUnsetValue.length) {
		groups[UNSET] = ticketsWithUnsetValue;
	}
	return groups;
};
const groupByOneOfValues = (tickets: ITicket[], groupBy: string) => {
	const [ticketsWithValue, ticketsWithUnsetValue] = _.partition(tickets, (ticket) => !!_.get(ticket, groupBy));

	const groups = _.groupBy(ticketsWithValue, groupBy);
	if (ticketsWithUnsetValue.length) {
		groups[UNSET] = ticketsWithUnsetValue;
	}
	return groups;
};

export const groupTickets = (groupBy: string, tickets: ITicket[], propertyType: PropertyTypeDefinition): Record<string, ITicket[]> => {
	if (stripModuleOrPropertyPrefix(groupBy) === IssueProperties.DUE_DATE) return groupByDate(tickets);

	const isOneOf = propertyType === 'oneOf';
	return isOneOf ? groupByOneOfValues(tickets, groupBy) : groupByManyOfValues(tickets, groupBy);
};
