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

import { BaseProperties, IssueProperties, SafetibaseProperties, SequencingProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { formatMessage } from '@/v5/services/intl';
import _ from 'lodash';
import { PriorityLevels, RiskLevels, TreatmentStatuses } from '@controls/chip/chip.types';
import { IStatusConfig, ITicket } from '@/v5/store/tickets/tickets.types';
import { selectStatusConfigByTemplateId } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectCurrentProjectTemplateById } from '@/v5/store/projects/projects.selectors';
import { isBaseProperty } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';

export const NONE_OPTION = 'None';

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

export type SetTicketValue =  (modelId: string, ticketId?: string, groupValue?: string) => void;

export const NEW_TICKET_ID = 'new';

export const SAFETIBASE_PROPERTIES_GROUPS = {
	[SafetibaseProperties.LEVEL_OF_RISK]: RiskLevels,
	[SafetibaseProperties.TREATMENT_STATUS]: TreatmentStatuses,
};

const GROUP_NAMES_BY_TYPE = {
	[IssueProperties.PRIORITY]: PriorityLevels,
	...SAFETIBASE_PROPERTIES_GROUPS,
};

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

const groupHasDefaultValue = (groupBy, templateId) => {
	const template = selectCurrentProjectTemplateById(getState(), templateId);
	const property = [
		...template.properties,
		...(template.modules.find(({ type }) => type === 'safetibase')?.properties || []),
	].find(({ name }) => name === groupBy);
	return _.has(property, 'default');
};

const groupByList = (tickets: ITicket[], groupBy: string, groupValues: string[]) => {
	const groups = {};
	let remainingTickets = tickets;
	let currentTickets = [];

	groupValues.forEach((groupValue) => {
		[currentTickets, remainingTickets] = _.partition(
			remainingTickets,
			({ properties, modules }) => ({ ...modules?.safetibase, ...properties })?.[groupBy] === groupValue,
		);
		groups[groupValue] = currentTickets;
	});
	if (!groupHasDefaultValue(groupBy, tickets[0].type)) {
		groups[UNSET] = remainingTickets;
	}
	return groups;
};

const ASSIGNEES_PATH = `properties.${IssueProperties.ASSIGNEES}`;
export const getAssignees = (t) => _.get(t, ASSIGNEES_PATH);

export const sortAssignees = (ticket: ITicket) => {
	const sortedAssignees = _.orderBy(getAssignees(ticket), (assignee) => assignee.trim().toLowerCase());
	return _.set(_.cloneDeep(ticket), ASSIGNEES_PATH, sortedAssignees);
};
const groupByAssignees = (tickets: ITicket[]) => {
	const [ticketsWithAssignees, unsetAssignees] = _.partition(tickets, (ticket) => getAssignees(ticket)?.length > 0);

	const ticketsWithSortedAssignees = ticketsWithAssignees.map(sortAssignees);

	const ticketsSortedByAssignees = _.orderBy(
		ticketsWithSortedAssignees,
		(ticket) => {
			const assignees = getAssignees(ticket).map((assignee) => assignee.trim().toLowerCase());
			return _.orderBy(assignees).join();
		},
	);

	const groups = _.groupBy(ticketsSortedByAssignees, (ticket) => {
		const assignees = getAssignees(ticket);
		return assignees.join(', ');
	});
	if (unsetAssignees.length) {
		groups[UNSET] = unsetAssignees;
	}
	return groups;
};

export const groupTickets = (groupBy: string, tickets: ITicket[]): Record<string, ITicket[]> => {
	switch (groupBy) {
		case BaseProperties.OWNER:
			return _.groupBy(tickets, `properties.${BaseProperties.OWNER}`);
		case IssueProperties.ASSIGNEES:
			return groupByAssignees(tickets);
		case IssueProperties.DUE_DATE:
			return groupByDate(tickets);
		case BaseProperties.STATUS:
			const { type } = tickets[0];
			const config: IStatusConfig = selectStatusConfigByTemplateId(getState(), type);
			const labels = config.values.map(({ name, label }) => label || name);
			return groupByList(tickets, groupBy, labels);
		default:
			return groupByList(tickets, groupBy, _.values(GROUP_NAMES_BY_TYPE[groupBy]));
	}
};

export const hasRequiredViewerProperties = (template) => {
	const modules = template.modules?.flatMap((module) => module.properties) || [];
	const properties = modules.concat(template.properties || []);
	return properties.some(({ required, type }) => required && ['view', 'coords'].includes(type));
};

const TICKET_PROPERTIES_LABEL = {
	id: formatMessage({ id: 'properties.label.id', defaultMessage: '#Id' }),
	modelName: formatMessage({ id: 'properties.label.federationContainer', defaultMessage: 'Federation / Container' }),
	[BaseProperties.TITLE]: formatMessage({ id: 'properties.label.title', defaultMessage: 'Title' }),
	[`properties.${BaseProperties.UPDATED_AT}`]: formatMessage({ id: 'properties.label.updatedAt', defaultMessage: 'Updated At' }),
	[`properties.${BaseProperties.DESCRIPTION}`]: formatMessage({ id: 'properties.label.description', defaultMessage: 'Description' }),
	[`properties.${BaseProperties.CREATED_AT}`]: formatMessage({ id: 'properties.label.createdAt', defaultMessage: 'Created At' }),
	[`properties.${BaseProperties.OWNER}`]: formatMessage({ id: 'properties.label.owner', defaultMessage: 'Owner' }),
	[`properties.${BaseProperties.STATUS}`]: formatMessage({ id: 'properties.label.status', defaultMessage: 'Status' }),
	[`properties.${IssueProperties.DUE_DATE}`]: formatMessage({ id: 'properties.label.dueDate', defaultMessage: 'Due Date' }),
	[`properties.${IssueProperties.PRIORITY}`]: formatMessage({ id: 'properties.label.priority', defaultMessage: 'Priority' }),
	[`properties.${IssueProperties.ASSIGNEES}`]: formatMessage({ id: 'properties.label.assignees', defaultMessage: 'Assignees' }),
	[`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`]: formatMessage({ id: 'modules.safetibase.label.levelOfRisk', defaultMessage: 'Safetibase : Level of Risk' }),
	[`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`]: formatMessage({ id: 'modules.safetibase.label.treatmentStatus', defaultMessage: 'Safetibase : Treatment Status' }),
	[`modules.safetibase.${SafetibaseProperties.TREATED_LEVEL_OF_RISK}`]: formatMessage({ id: 'modules.safetibase.label.treatedLevelOfRisk', defaultMessage: 'Safetibase : Treated Level of Risk' }),
	[`modules.sequencing.${SequencingProperties.START_TIME}`]: formatMessage({ id: 'modules.sequencing.label.startTime', defaultMessage: 'Sequencing : Start Time' }),
	[`modules.sequencing.${SequencingProperties.END_TIME}`]: formatMessage({ id: 'modules.sequencing.label.endTime', defaultMessage: 'Sequencing : End Time' }),
} as const;

export const getColumnLabel = (name) => {
	const defaultName = TICKET_PROPERTIES_LABEL[name];
	if (defaultName) return defaultName;
	
	return name
		.replace('properties.', '')
		.replace('modules.', '')
		.split('.')
		.map(_.startCase)
		.join(' : ');
};

export const INITIAL_COLUMNS = [
	'id',
	BaseProperties.TITLE,
	'modelName',
	`properties.${BaseProperties.CREATED_AT}`,
	`properties.${IssueProperties.ASSIGNEES}`, 
	`properties.${BaseProperties.OWNER}`,
	`properties.${IssueProperties.DUE_DATE}`,
	`properties.${IssueProperties.PRIORITY}`,
	`properties.${BaseProperties.STATUS}`,
	`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`,
	`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`,
];

export const isValidFilter = (filter, selectedTemplate) => {
	const { module, property, type } = filter;
	if (!module) {
		if (isBaseProperty(type)) return true;
		return selectedTemplate.properties?.some(
			({ name, type: propType }) => name === property && propType === type,
		);
	}
	const moduleDef = selectedTemplate.modules?.find(
		({ type: moduleType, name: moduleName }) => [moduleType, moduleName].includes(module),
	);
	return moduleDef?.properties?.some(
		({ name, type: propType }) => name === property && propType === type,
	);
};
