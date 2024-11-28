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
import { ITemplate, TicketsCardFilters } from '@/v5/store/tickets/tickets.types';
import BooleanIcon from '@assets/icons/filters/boolean.svg';
import ListIcon from '@assets/icons/filters/list.svg';
import NumberIcon from '@assets/icons/filters/number.svg';
import TemplateIcon from '@assets/icons/filters/template.svg';
import TextIcon from '@assets/icons/filters/text.svg';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import { sortBy, uniqBy } from 'lodash';
import { CardFilter, CardFilterType, FilterTypesByProperty, BaseFilter, TicketFilterDescription } from '../../cardFilters.types';

export const TYPE_TO_ICON: Record<CardFilterType, any> = {
	'template': TemplateIcon,
	'ticketTitle': TextIcon,
	'ticketId': TextIcon,
	'text': TextIcon,
	'longText': TextIcon,
	'date': CalendarIcon,
	'pastDate': CalendarIcon, // used by `Created at`
	'sequencing': CalendarIcon,
	'oneOf': ListIcon,
	'manyOf': ListIcon,
	'boolean': BooleanIcon,
	'number': NumberIcon,
};

const VALID_FILTERING_PROPERTY_TYPES = Object.keys(TYPE_TO_ICON);

const DEFAULT_FILTERS: TicketFilterDescription[] = [
	{ module: '', type: 'ticketTitle', property: formatMessage({ defaultMessage: 'Ticket title', id: 'viewer.card.filters.element.ticketTitle' }) },
	{ module: '', type: 'ticketId', property: formatMessage({ defaultMessage: 'Ticket ID', id: 'viewer.card.filters.element.ticketId' }) },
	{ module: '', type: 'template', property: formatMessage({ defaultMessage: 'Ticket template', id: 'viewer.card.filters.element.ticketTemplate' }) },
];

const propertiesToValidFilters = (properties: { name: string, type: string }[], module: string = ''): TicketFilterDescription[] => properties
	.filter(({ type }) => VALID_FILTERING_PROPERTY_TYPES.includes(type))
	.map(({ name, type }) => ({
		module,
		property: name,
		type,
	}) as TicketFilterDescription);

const templateToFilters = (template: ITemplate): TicketFilterDescription[] => [
	...propertiesToValidFilters(template.properties, ''),
	...template.modules.flatMap(({ properties, name, type }) => propertiesToValidFilters(properties, name || type)),
];

export const templatesToFilters = (templates: ITemplate[]): TicketFilterDescription[] => {
	let filters: TicketFilterDescription[] = [...templates.flatMap(templateToFilters)];
	filters = uniqBy(filters, (f) => f.module + f.property + f.type);
	filters = sortBy(filters, 'module');
	return [
		...DEFAULT_FILTERS,
		...filters,
	];
};

export const toCardFilter = (typesByProperty: FilterTypesByProperty): CardFilter[] => (
	Object.entries(typesByProperty).flatMap(([property, filterByType]) => (
		Object.entries(filterByType).map(([type, filter]: [CardFilterType, BaseFilter]) => ({ property, type, filter }))),
	)
);

export const getFiltersByModule = (filters: TicketsCardFilters) => {
	const sortedFiltersByModule = Object.entries(filters).sort((a, b) => a[0].localeCompare(b[0]));
	return sortedFiltersByModule.map(([module, properties]) => [module, toCardFilter(properties)] as [string, CardFilter[]]);
};