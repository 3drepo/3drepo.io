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

export type TicketFilterListItemType = { module: string, property: string, type: CardFilterType };

export type CardFilterOperator = 'ex' | 'nex' | 'eq' | 'neq' | 'ss' | 'nss' | 'rng' | 'nrng' | 'gt' | 'gte' | 'lt' | 'lte';
export type CardFilterType = 'text' | 'longText' | 'date' | 'pastDate' | 'sequencing' | 'oneOf' | 'manyOf' | 'boolean' | 'number' | 'ticketTitle' | 'ticketId' | 'template';
export type CardFilterValue = string | number | Date;
export type FormFilter = { operator: CardFilterOperator, values: CardFilterValue[] };

export type CardFilter = {
	module: string,
	property: string,
	type: CardFilterType,
	filter: FormFilter,
};

export type CardFiltersByType = Partial<Record<CardFilterType, FormFilter>>;
export type FilterOperatorsByProperty = Record<CardFilterOperator, CardFiltersByType>;