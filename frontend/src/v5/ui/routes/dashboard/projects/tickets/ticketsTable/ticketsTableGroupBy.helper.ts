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
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import _ from 'lodash';
import { stripModuleOrPropertyPrefix } from './ticketsTable.helper';
import { DEFAULT_STATUS_CONFIG } from '@controls/chip/chip.types';
import { selectStatusConfigByTemplateId, selectTicketPropertyByName } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

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
	const groups = [];
	// eslint-disable-next-line prefer-const
	let [ticketsWithUnsetDueDate, remainingTickets] = _.partition(tickets, ({ properties }) => !properties[IssueProperties.DUE_DATE]);

	if (ticketsWithUnsetDueDate.length) {
		groups.push([NO_DUE_DATE, ticketsWithUnsetDueDate]);
	}

	const dueDateOptions = getOptionsForGroupsWithDueDate();
	const endOfCurrentWeek = new Date();

	const ticketDueDateIsPassed = (ticket: ITicket) => ticket.properties[IssueProperties.DUE_DATE] < endOfCurrentWeek.getTime();

	let currentWeekTickets;
	while (dueDateOptions.length) {
		[currentWeekTickets, remainingTickets] = _.partition(remainingTickets, ticketDueDateIsPassed);
		const currentDueDateOption = dueDateOptions.shift();
		const ticketsWithCurrentDueDate = dueDateOptions.length ? currentWeekTickets : currentWeekTickets.concat(remainingTickets);
		groups.push([currentDueDateOption, ticketsWithCurrentDueDate]);
		endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 7);
	}
	return groups;
};

const groupByStatus = (tickets: ITicket[]) => {
	const statusPath = `properties.${BaseProperties.STATUS}`;
	const statusConfigValues = (selectStatusConfigByTemplateId(getState(), tickets[0].type) || DEFAULT_STATUS_CONFIG).values;
	
	const ticketsByStatus = _.groupBy(tickets, statusPath);
	// handling formatting
	const ticketsByStatusDisplayValue = _.mapKeys(ticketsByStatus, (tkts, status) => {
		const value = statusConfigValues.find(({ name }) => name === status);
		return value.label || value.name;
	});
	const statusOrder = Object.fromEntries(DEFAULT_STATUS_CONFIG.values.map(({ type }, index) => [type, index]));
	const statusToOrder = Object.fromEntries(statusConfigValues.map(({ name, type }) => [name, statusOrder[type]]));

	const toStatusTypeOrder = ([, [ticket]]) => statusToOrder[_.get(ticket, statusPath)];
	const toStatusDisplayValue = ([statusDisplayValue]) => statusDisplayValue;

	return _.orderBy(Object.entries(ticketsByStatusDisplayValue), [toStatusTypeOrder, toStatusDisplayValue]) as Array<[string, ITicket[]]>;
};

const sortManyOfValues = (ticket: ITicket, groupBy: string) => {
	const sortedValues = _.orderBy(
		_.get(ticket, groupBy),
		(value) => value.trim().toLowerCase(),
	);
	return _.set(_.cloneDeep(ticket), groupBy, sortedValues);
};
const groupByManyOfValues = (tickets: ITicket[], groupBy: string) => {
	const [ticketsWithValue, ticketsWithUnsetValue] = _.partition(tickets, (ticket) => _.get(ticket, groupBy)?.length > 0);
	const ticketsWithSortedValues = ticketsWithValue.map((ticket) => sortManyOfValues(ticket, groupBy));
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
	return { ...groups, [UNSET]: ticketsWithUnsetValue };
};

const groupByOneOfValues = (tickets: ITicket[], groupBy: string) => _.groupBy(tickets, 
	(ticket) => selectTicketPropertyByName(getState(), ticket._id, groupBy) ?? UNSET);

const sortSelectGroups = (groups: Record<string, ITicket[]>) => {
	const { [UNSET]: groupsWithUnsetValue, ...grouspWithSetValue } = groups;
	const sortedGroups = _.orderBy(_.entries(grouspWithSetValue), ([groupName]) => groupName);
	if (groupsWithUnsetValue?.length) {
		sortedGroups.push([UNSET, groupsWithUnsetValue]);
	}
	return sortedGroups;
};

export const groupTickets = (groupBy: string, tickets: ITicket[], propertyType: PropertyTypeDefinition): Array<[string, ITicket[]]> => {
	switch (stripModuleOrPropertyPrefix(groupBy)) {
		case IssueProperties.DUE_DATE:
			return groupByDate(tickets);
		case BaseProperties.STATUS:
			return groupByStatus(tickets);
		default:
			const isOneOf = propertyType === 'oneOf';
			const selectGroups = isOneOf ? groupByOneOfValues(tickets, groupBy) : groupByManyOfValues(tickets, groupBy);
			return sortSelectGroups(selectGroups);
	}
};
