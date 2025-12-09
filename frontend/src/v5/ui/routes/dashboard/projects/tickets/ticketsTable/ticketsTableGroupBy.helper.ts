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
import { ITemplate, ITicket } from '@/v5/store/tickets/tickets.types';
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import _, { Dictionary } from 'lodash';
import { DEFAULT_STATUS_CONFIG } from '@controls/chip/chip.types';
import { selectTicketPropertyByName } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectCurrentTeamspaceUsersByIds } from '@/v5/store/users/users.selectors';
import { getFullnameFromUser, JOB_OR_USER_NOT_FOUND_NAME } from '@/v5/store/users/users.helpers';
import { selectJobById } from '@/v4/modules/jobs/jobs.selectors';
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';



export const UNSET = formatMessage({ id: 'tickets.selectOption.property.unset', defaultMessage: 'Unset' });

const arrayAndStringCompare = (a, b) => {
	const arrA = a.split(',');
	const arrB = b.split(',');

	if (arrA.length == arrB.length) {
		return a.localeCompare(b);
	}
	return arrA.length - arrB.length;
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

export type TicketsGroup = {
	groupName: string,
	value: any, 
	tickets: ITicket[]
};

type GroupDictionary = Dictionary<{ tickets: ITicket[], value: any }>;

const sortByStatus = (groups: TicketsGroup[], templates: ITemplate[]) => {
	const indexByName: Record<string, number> = {};

	const defaultStatusTypes = DEFAULT_STATUS_CONFIG.values.map((a) => a.type);

	templates.forEach((template) => {

		const values = (template.config?.status || DEFAULT_STATUS_CONFIG).values;

		values.forEach((v) => {
			const statusIndex = defaultStatusTypes.indexOf(v.type);
			indexByName[v.name] = indexByName[v.name] ? Math.min(indexByName[v.name], statusIndex) : statusIndex;
		});
	});
	
	return groups.sort((a, b) =>  {
		const indexA = indexByName[a.value];
		const indexB = indexByName[b.value];

		if (indexA !== indexB ) return indexA - indexB;
		return a.groupName.localeCompare(b.groupName);
	});
};

const sortToTicketsGroups = (groups: GroupDictionary, groupBy, templates: ITemplate[]): TicketsGroup[] => {
	const { [UNSET]: groupsWithUnsetValue, ...grouspWithSetValue } = groups;
	const sortedGroups:TicketsGroup[] = Object.keys(grouspWithSetValue)
		.sort(arrayAndStringCompare)     
		.map((key) => ({ groupName: key, ...groups[key] }));
	
	if (groupsWithUnsetValue) {
		sortedGroups.push({ groupName: UNSET, ...groupsWithUnsetValue });
	}
	
	if (groupBy === `properties.${BaseProperties.STATUS}`) {
		return sortByStatus(sortedGroups, templates);
	}

	return sortedGroups;
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

const getKeyByDueDate  = (ticket) => {
	const dueDatePropName = 'properties.' + IssueProperties.DUE_DATE;
	const startOfTheWeek = (new Date()).getTime();
	const endOfWeeks = [];
	for (let i = 1 ; i < 6 ; i++ ) {
		endOfWeeks.push(startOfTheWeek + (i * 604800000)); // i * a week in milliseconds;
	}

	const dateValue = selectTicketPropertyByName(getState(), ticket._id, dueDatePropName);
	let name = NO_DUE_DATE;
	let value = dateValue;

	if (dateValue && dateValue > startOfTheWeek) {
		// If there is no end of the week < than the date, it means that is due pass 6 weeks;
		name = DUE_DATE_LABELS[DUE_DATE_LABELS.length - 1]; 
		for (let i = 0 ; i < 5 ; i++ ) {
			if (dateValue < endOfWeeks[i]) {
				name = DUE_DATE_LABELS[i + 2];
				value = endOfWeeks[i];
				break;
			}
		}
	}

	if (dateValue && dateValue <= startOfTheWeek) {
		name = OVERDUE;
	}

	return { name, value };
};

const getKeyByStatus = (ticket, groupBy, template: ITemplate) => {
	const value = selectTicketPropertyByName(getState(), ticket._id, groupBy);
	const statusConfigValues =  (template?.config?.status || DEFAULT_STATUS_CONFIG).values;
	const statusConfig = statusConfigValues.find((s) => s.name === value) ;
	const name = statusConfig.label || statusConfig.name;
	return { name, value };
};

const getKeyManyValues = (ticket, groupBy) => {
	const value = selectTicketPropertyByName(getState(), ticket._id, groupBy);
	if (!value) return { name: UNSET, value: '' };
	const valueAsString = [...value].sort().join(',');
	return { name: valueAsString, value };
};

const getKeyBySingleValue = (ticket: ITicket, groupBy: string) =>
	(selectTicketPropertyByName(getState(), ticket._id, groupBy) ?? UNSET);

const getkeyByJobsAndUsers = (ticket: ITicket, groupBy: string) => {
	const value = selectTicketPropertyByName(getState(), ticket._id, groupBy);
	const values = Array.isArray(value) ? value : [value];
	const name = values && value ? values.map(getjobOrUserDisplayName).sort().join(',') : UNSET;
	return { name, value };
};

const getKey = (ticket: ITicket, groupBy: string, templatesDict: Record<string, ITemplate>) => {
	const template = templatesDict[ticket.type];
	const propertyDefinition = findPropertyDefinition(template, groupBy);

	if (!propertyDefinition) {
		return  { name: UNSET, value: '' };
	}
	const propertyType = propertyDefinition.type;
	
	if (propertyDefinition.values === 'jobsAndUsers' || groupBy === `properties.${BaseProperties.OWNER}`) return getkeyByJobsAndUsers(ticket, groupBy);
	if (groupBy === `properties.${IssueProperties.DUE_DATE}`) return getKeyByDueDate(ticket);
	if (groupBy === `properties.${BaseProperties.STATUS}`) return getKeyByStatus(ticket, groupBy, template);
	if (['text', 'oneOf'].includes(propertyType)) return getKeyBySingleValue(ticket, groupBy);
	if (propertyType === 'manyOf') return getKeyManyValues(ticket, groupBy);
};


export const groupTickets = (groupBy: string, templates: ITemplate[], tickets: ITicket[]): TicketsGroup[] => {
	const groups: GroupDictionary = {};
	const templateDict:Record<string, ITemplate> = {};
	templates.forEach((template) => templateDict[template._id] = template);

	tickets.forEach((ticket) => {
		const key = getKey(ticket, groupBy, templateDict);
		let name: string, value: any = undefined;

		if (key.name) {
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
	});

	return sortToTicketsGroups(groups, groupBy, templates);
};
