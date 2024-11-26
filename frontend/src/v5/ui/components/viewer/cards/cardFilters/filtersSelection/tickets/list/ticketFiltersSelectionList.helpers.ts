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
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import BooleanIcon from '@assets/icons/filters/boolean.svg';
import ListIcon from '@assets/icons/filters/list.svg';
import NumberIcon from '@assets/icons/filters/number.svg';
import TemplateIcon from '@assets/icons/filters/template.svg';
import TextIcon from '@assets/icons/filters/text.svg';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import { sortBy, uniqBy } from 'lodash';
import { CardFilterType, TicketFilterListItemType } from '../../../cardFilters.types';
import { TicketBaseKeys } from '@/v5/ui/routes/viewer/tickets/tickets.constants';

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

export const DEFAULT_FILTERS: TicketFilterListItemType[] = [
	{ module: '', type: 'ticketTitle', property: formatMessage({ defaultMessage: 'Ticket title', id: 'viewer.card.filters.element.ticketTitle' }) },
	{ module: '', type: 'ticketId', property: formatMessage({ defaultMessage: 'Ticket ID', id: 'viewer.card.filters.element.ticketId' }) },
	{ module: '', type: 'template', property: formatMessage({ defaultMessage: 'Ticket template', id: 'viewer.card.filters.element.ticketTemplate' }) },
];

const propertiesToValidFilters = (properties: { name: string, type: string }[], module: string = ''): TicketFilterListItemType[] => properties
	.filter(({ type }) => VALID_FILTERING_PROPERTY_TYPES.includes(type))
	.map(({ name, type }) => ({
		module,
		property: name,
		type,
	}) as TicketFilterListItemType);

const templateToFilters = (template: ITemplate): TicketFilterListItemType[] => [
	...propertiesToValidFilters(template.properties, TicketBaseKeys.PROPERTIES),
	...template.modules.flatMap(({ properties, name, type }) => propertiesToValidFilters(properties, name || type)),
];

export const templatesToFilters = (templates: ITemplate[]): TicketFilterListItemType[] => {
	let filters: TicketFilterListItemType[] = [...templates.flatMap(templateToFilters)];
	filters = uniqBy(filters, (f) => f.module + f.property + f.type);
	filters = sortBy(filters, 'module');
	return [
		...DEFAULT_FILTERS,
		...filters,
	];
};