/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { values } from 'lodash';
import { TicketsSortingOrder, TicketsSortingProperty, TicketsSortingPropertyDictionary } from '../store/tickets/card/ticketsCard.types';

export const serializeSorting = (property: string, order: string) => `${property}${order === 'asc' ? '!' : ''}`;

export const deserializeSorting = (sortingParam: string): [ property: TicketsSortingProperty, order: TicketsSortingOrder ] | [] => {
	const [propertyName, ascendingFlag] = sortingParam.split('!');
   
	if (!values(TicketsSortingPropertyDictionary).includes(propertyName as TicketsSortingProperty))
		return [];

	return [propertyName as TicketsSortingProperty, ascendingFlag  === '' ? 'asc' : 'desc'];
};