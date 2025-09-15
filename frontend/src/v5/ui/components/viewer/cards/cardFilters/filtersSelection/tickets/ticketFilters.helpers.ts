/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { ITemplate, StatusValue } from '@/v5/store/tickets/tickets.types';
import BooleanIcon from '@assets/icons/filters/boolean.svg';
import ListIcon from '@assets/icons/filters/list.svg';
import NumberIcon from '@assets/icons/filters/number.svg';
import TemplateIcon from '@assets/icons/filters/template.svg';
import TextIcon from '@assets/icons/filters/text.svg';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import { isString, sortBy, uniqBy, compact, uniq } from 'lodash';
import { TicketFilterType, TicketFilter, TicketFilterOperator } from '../../cardFilters.types';
import { FILTER_OPERATOR_LABEL, isDateType, isRangeOperator, isSelectType, isTextType } from '../../cardFilters.helpers';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { SelectOption } from '@/v5/helpers/form.helper';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectStatusConfigByTemplateId } from '@/v5/store/tickets/tickets.selectors';
import { TicketStatusTypes, TicketStatusDefaultValues, TreatmentStatuses } from '@controls/chip/chip.types';

export const TYPE_TO_ICON: Record<TicketFilterType, any> = {
	'template': TemplateIcon,
	'title': TextIcon,
	'ticketCode': TextIcon,
	'text': TextIcon,
	'longText': TextIcon,
	'date': CalendarIcon,
	'pastDate': CalendarIcon,
	'createdAt': CalendarIcon,
	'updatedAt': CalendarIcon,
	'sequencing': CalendarIcon,
	'oneOf': ListIcon,
	'manyOf': ListIcon,
	'status': ListIcon,
	'owner': ListIcon,
	'boolean': BooleanIcon,
	'number': NumberIcon,
};

export const DEFAULT_FILTERS: TicketFilter[] = [
	{ module: '', type: 'title', property: formatMessage({ defaultMessage: 'Ticket title', id: 'viewer.card.filters.element.title' }) },
	{ module: '', type: 'ticketCode', property: formatMessage({ defaultMessage: 'Ticket ID', id: 'viewer.card.filters.element.ticketCode' }) },
	{ module: '', type: 'template', property: formatMessage({ defaultMessage: 'Ticket template', id: 'viewer.card.filters.element.template' }) },

	// These are for having a custom filter form for each of these properties 
	{ module: '', type: 'owner', property: formatMessage({ defaultMessage: 'Owner', id: 'viewer.card.filters.element.owner' }) },
	{ module: '', type: 'createdAt', property: formatMessage({ defaultMessage: 'Created at', id: 'viewer.card.filters.element.createdAt' }) },
	{ module: '', type: 'updatedAt', property: formatMessage({ defaultMessage: 'Updated at', id: 'viewer.card.filters.element.updatedAt' }) },
	{ module: '', type: 'status', property: formatMessage({ defaultMessage: 'Status', id: 'viewer.card.filters.element.status' }) },
];
export const isBaseProperty = (propertyType) => DEFAULT_FILTERS.some(({ type }) => type === propertyType);
const isBasePropertyName = (name) => ['Owner', 'Created at', 'Updated at', 'Status'].includes(name);

const propertiesToValidFilters = (properties: { name: string, type: string }[], module: string = ''): TicketFilter[] => properties
	.filter(({ name, type }) => !(!module && isBasePropertyName(name)) && Object.keys(TYPE_TO_ICON).includes(type))
	.map(({ name, type }) => ({
		module,
		property: name,
		type,
	}) as TicketFilter);

const templateToFilters = (template: ITemplate): TicketFilter[] => [
	...propertiesToValidFilters(template.properties || [], ''),
	...(template.modules || []).flatMap(({ properties, name, type }) => propertiesToValidFilters(properties, name || type)),
];

export const templatesToFilters = (templates: ITemplate[]): TicketFilter[] => {
	let filters = templates.flatMap(templateToFilters);
	filters = uniqBy(filters, (f) => f.module + f.property + f.type);
	filters = sortBy(filters, 'module');

	// If theres only one template passed then get rid of the filter for templates
	const defFilters = templates.length > 1 ? DEFAULT_FILTERS : DEFAULT_FILTERS.filter(({ type }) => type !== 'template');

	return [
		...defFilters,
		...filters,
	];
};


export const getOptionFromValue = (value, options: SelectOption[]) => options.find(({ value: optionValue }) => value === optionValue);
export const getFilterFromEvent = (event) => compact(event.target.value).map((value) => ({ value }));

export const getFiltersFromJobsAndUsers = (jobsAndUsers) => jobsAndUsers.map((ju) => {
	const isUser = !!ju.firstName;
	return ({
		value: isUser ? ju.user : ju._id,
		displayValue: isUser ? getFullnameFromUser(ju) : null,
	});
});

const wrapWith = (text, wrappingChar) => wrappingChar + text + wrappingChar;
// This code, copied from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986 
// is due to `encodeURIComponent` not encoding all the chars
const encodeRFC3986URIComponent = (str) => encodeURIComponent(str).replace(
	/[!'()*]/g,
	(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
);

const getFilterPropertyAsQuery = ({ module, property, type }: TicketFilter) => {
	if (['template', 'ticketCode', 'title'].includes(type)) return `$${type}`;
	if (module) return `${module}:${property}`;
	return property;
};

const valueToQueryValueFormat = (value, operator: TicketFilterOperator) => {
	if (isString(value)) return wrapWith(value, '"');
	if (isRangeOperator(operator)) return `[${value[0]},${value[1]}]`;
	return value;
};

const filterToQueryElement = ({ filter: { operator, values }, ...moduelPropertyAndType }: TicketFilter) => {
	const query = [getFilterPropertyAsQuery(moduelPropertyAndType), operator];
	if (values?.length) {
		query.push(values?.map((v) => valueToQueryValueFormat(v, operator)).join(','));
	}
	return query.join('::');
};
export const filtersToQuery = (filters: TicketFilter[]) => {
	if (!filters?.length) return '';
	const query = filters.map(filterToQueryElement).join('&&');
	return encodeRFC3986URIComponent(wrapWith(query, "'"));
};

export const getValidOperators = (type: TicketFilterType): TicketFilterOperator[] => {
	if (isTextType(type)) {
		if (isBaseProperty(type)) return ['is', 'nis', 'ss', 'nss'];
		return ['ex', 'nex', 'is', 'nis', 'ss', 'nss'];
	}
	if (type === 'number') return ['ex', 'nex', 'eq', 'neq', 'gte', 'lte', 'rng', 'nrng'];
	if (isDateType(type)) {
		if (isBaseProperty(type)) return ['gte', 'lte', 'rng', 'nrng'];
		return ['ex', 'nex', 'gte', 'lte', 'rng', 'nrng'];
	}
	if (type === 'boolean') return ['eq', 'ex', 'nex'];
	if (isSelectType(type)) {
		if (isBaseProperty(type)) return ['is', 'nis'];
		return ['ex', 'nex', 'is', 'nis'];
	}
	return Object.keys(FILTER_OPERATOR_LABEL) as TicketFilterOperator[];
};


const getNonCompletedTicketFiltersByStatus = (templates: ITemplate[], containerOrFederation: string): TicketFilter => {
	const isCompletedValue = ({ type }: StatusValue) => [TicketStatusTypes.DONE, TicketStatusTypes.VOID].includes(type);
	const getValuesByTemplate = ({ _id }) => selectStatusConfigByTemplateId(getState(), containerOrFederation, _id).values;

	const completedValueNames = templates
		.flatMap(getValuesByTemplate)
		.filter(isCompletedValue)
		.map((v) => v.name);

	const values = uniq([
		TicketStatusDefaultValues.CLOSED,
		TicketStatusDefaultValues.VOID,
		...completedValueNames,
	]);

	return {
		module: '',
		property: 'Status',
		type: 'status',
		filter: {
			operator: 'nis',
			values,
		},
	};
};
const getNonCompletedTicketFiltersBySafetibase = (): TicketFilter => ({
	module: 'safetibase',
	property: 'Treatment Status',
	type: 'oneOf',
	filter: {
		operator: 'nis',
		values: [
			TreatmentStatuses.REJECTED,
			TreatmentStatuses.VOID,
		],
	},
});

export const getNonCompletedTicketFilters = (templates:ITemplate[], containerOrFederation:string): TicketFilter[] => {
	let filters = [getNonCompletedTicketFiltersByStatus(templates, containerOrFederation)];
	const hasSafetibase = templates.some((t) => t?.modules?.some((module) => module.type === 'safetibase'));
	
	if (hasSafetibase) {
		filters.push(getNonCompletedTicketFiltersBySafetibase());
	}

	return filters;
};