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
import _, { Dictionary } from 'lodash';
import { stripModuleOrPropertyPrefix } from './ticketsTable.helper';
import { DEFAULT_STATUS_CONFIG } from '@controls/chip/chip.types';
import { selectStatusConfigByTemplateId, selectTicketPropertyByName } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectCurrentTeamspaceUsersByIds } from '@/v5/store/users/users.selectors';
import { getFullnameFromUser, JOB_OR_USER_NOT_FOUND_NAME } from '@/v5/store/users/users.helpers';
import { selectJobById } from '@/v4/modules/jobs/jobs.selectors';

export const UNSET = formatMessage({ id: 'tickets.selectOption.property.unset', defaultMessage: 'Unset' });

const arrayAndStringCompare =(a,b) => {
	const arrA = a.split(',');
	const arrB = b.split(',');

	if(arrA.length == arrB.length) {
		return a.localeCompare(b);
	}
	return arrA.length - arrB.length;
}

type TicketsGroup = {
	groupName: string,
	value: any, 
	tickets: ITicket[]
};

type GroupDictionary = Dictionary<{tickets: ITicket[], value: any}>;

const sortToTicketsGroups = (groups: GroupDictionary): TicketsGroup[] => {
	const { [UNSET]: groupsWithUnsetValue, ...grouspWithSetValue } = groups;
	const sortedGroups:TicketsGroup[] = Object.keys(grouspWithSetValue)
		.sort(arrayAndStringCompare)     
		.map((key) => ({ groupName: key, ...groups[key] }));
	
	if (groupsWithUnsetValue) {
		sortedGroups.push({groupName: UNSET, ...groupsWithUnsetValue});
	}

	return sortedGroups;
};

const createGroups = (tickets: ITicket[], getKey:(ticket:ITicket) => any) => {
	const groups: GroupDictionary = {};

	tickets.forEach((ticket) => {
		const key = getKey(ticket);
		let name: string, value: any = undefined;

		if(key.name) {
			name = key.name;
			value = key.value;
		} else {
			name = key.toString();
			value = key;
		}
		
		if (!groups[name]) {
			groups[name] = { tickets: [], value };
		}

		groups[name].tickets.push(ticket);
	})
	
	return sortToTicketsGroups(groups);
};

const NO_DUE_DATE = formatMessage({ id: 'groupBy.dueDate.unset', defaultMessage: 'No due date' });
const OVERDUE = formatMessage({ id: 'groupBy.dueDate.overdue', defaultMessage: 'Overdue' });
const DUE_DATE_LABELS = [
	NO_DUE_DATE,
	OVERDUE,
	formatMessage({ id: 'groupBy.dueDate.inOneWeek', defaultMessage: 'in 1 week' }),
	formatMessage({ id: 'groupBy.dueDate.inTwoWeeks', defaultMessage: 'in 2 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inThreeWeeks', defaultMessage: 'in 3 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inFourWeeks', defaultMessage: 'in 4 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inFiveWeeks', defaultMessage: 'in 5 weeks' }),
	formatMessage({ id: 'groupBy.dueDate.inSixPlusWeeks', defaultMessage: 'in 6+ weeks' }),
];

const groupByDueDate = (tickets: ITicket[]) => {
	const dueDatePropName = 'properties.' + IssueProperties.DUE_DATE
	const startOfTheWeek = (new Date()).getTime();
	const endOfWeeks = [];
	for (let i = 1 ; i < 6 ; i++ ) {
		endOfWeeks.push(startOfTheWeek + (i * 604800000)) // i * a week in milliseconds;
	}

	const groups = createGroups(tickets, (ticket) => { 
		const dateValue = selectTicketPropertyByName(getState(), ticket._id, dueDatePropName);
		let name = NO_DUE_DATE;
		let value = dateValue;

		if (dateValue && dateValue > startOfTheWeek) {
			// If there is no end of the week < than the date means that is pass 6 weeks;
			name = DUE_DATE_LABELS[DUE_DATE_LABELS.length-1]; 
			for (let i = 0 ; i < 5 ; i++ ) {
				if (dateValue < endOfWeeks[i]) {
					name = DUE_DATE_LABELS[i+2];
					value = endOfWeeks[i];
					break;
				}
			}
		}

		if (dateValue && dateValue <= startOfTheWeek) {
			name = OVERDUE;
		}

		return { name, value };
	});

	return groups.sort((a, b) => 
		DUE_DATE_LABELS.indexOf(a.groupName) - DUE_DATE_LABELS.indexOf(b.groupName)
	);
};

const ASSIGNEES_PATH = `properties.${IssueProperties.ASSIGNEES}`;
const getAssigneesRaw = (t: ITicket) => (_.get(t, ASSIGNEES_PATH) ?? []);
export const getjobOrUserDisplayName = (assignee: string) => {
	const job = selectJobById(getState(), assignee);
	if (job) return job._id;
	const user = selectCurrentTeamspaceUsersByIds(getState())[assignee];
	if (user) return getFullnameFromUser(user);
	return JOB_OR_USER_NOT_FOUND_NAME;
};

export const sortAssignees = (ticket: ITicket): ITicket => { // <--- ???
	const sortedAssignees = _.orderBy(getAssigneesRaw(ticket), (assignee) => getjobOrUserDisplayName(assignee).trim().toLowerCase());
	return _.set(_.cloneDeep(ticket), ASSIGNEES_PATH, sortedAssignees);
};

export const getAssigneeDisplayNamesFromTicket = (ticket: ITicket): string[] => getAssigneesRaw(ticket).map(getjobOrUserDisplayName);

const groupByStatus = (tickets: ITicket[]) => {
	const statusPath = `properties.${BaseProperties.STATUS}`;
	const statusConfigValues = (selectStatusConfigByTemplateId(getState(), tickets[0].type) || DEFAULT_STATUS_CONFIG).values;
	const labels: Record<string, string> = {};
	const index: Record<string, number> = {};
	
	statusConfigValues.forEach(({name, label}, i)=>  {
		labels[name] = label;
		index[name] = i;
	});

	const groups = createGroups(tickets, (ticket) => {
		const value = selectTicketPropertyByName(getState(), ticket._id, statusPath);
		return { name:labels[value], value };
	});

	return groups.sort((a,b) => index[a.groupName] - index[b.groupName]);
};

const groupByManyOfValues = (tickets: ITicket[], groupBy: string) => {
	return createGroups(tickets, (ticket) => {
		const value = selectTicketPropertyByName(getState(), ticket._id, groupBy);
		const name = value ? [...value].sort().join(',') : UNSET;
		return { name, value };
	});
};

const groupByOneOfValues = (tickets: ITicket[], groupBy: string) => createGroups(tickets, 
	(ticket) => selectTicketPropertyByName(getState(), ticket._id, groupBy) ?? UNSET);

const groupByJobsAndUsers = (tickets: ITicket[], groupBy: string) => {
	return createGroups(tickets, (ticket) => {
		const value = selectTicketPropertyByName(getState(), ticket._id, groupBy);
		const values = Array.isArray(value) ? value : [value];
		const name = values && value ? values.map(getjobOrUserDisplayName).sort().join(',') : UNSET;
		return { name, value };
	});
};

export const groupTickets = (
	groupBy: string, tickets: ITicket[], propertyType: PropertyTypeDefinition, isJobAndUsersType: boolean): TicketsGroup[] => {

	if (isJobAndUsersType) return groupByJobsAndUsers(tickets, groupBy);

	switch (stripModuleOrPropertyPrefix(groupBy)) {
		case IssueProperties.DUE_DATE:
			return groupByDueDate(tickets);
		case BaseProperties.STATUS:
			return groupByStatus(tickets);
		default:
			const isOneOf = propertyType === 'oneOf';
			const selectGroups = isOneOf ? groupByOneOfValues(tickets, groupBy) : groupByManyOfValues(tickets, groupBy);
			return selectGroups;
	}
};
