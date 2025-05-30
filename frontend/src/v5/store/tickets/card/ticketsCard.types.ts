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

import { ValuesOf } from '@/v5/helpers/types.helpers';
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';

export const TicketSortingProperty = {
	TICKET_CODE: 'ticketCode',
	UPDATED_AT: `properties.${BaseProperties.UPDATED_AT}`,
	CREATED_AT: `properties.${BaseProperties.CREATED_AT}`,
} as const;
export type TicketsSortingProperty = ValuesOf<typeof TicketSortingProperty>;
export type TicketsSortingOrder = 'asc' | 'desc';
export type TicketsSorting = {
	property: TicketsSortingProperty,
	order: TicketsSortingOrder,
};

export const DEFAULT_TICKETS_SORTING: TicketsSorting = {
	property: `properties.${BaseProperties.CREATED_AT}`,
	order: 'desc',
};
