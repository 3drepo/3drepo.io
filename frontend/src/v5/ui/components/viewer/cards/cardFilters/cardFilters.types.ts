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

export type TicketFilterOperator = 'ex' | 'nex' | 'is' | 'nis' | 'eq' | 'neq' | 'ss' | 'nss' | 'rng' | 'nrng' | 'gt' | 'gte' | 'lt' | 'lte';

export enum TicketFilterOperatorEnum {
	'ex' = 0,
	'nex' = 1,
	'is' = 2,
	'nis' = 3,
	'eq' = 4,
	'neq' = 5,
	'ss' = 6,
	'nss' = 7,
	'rng' = 8,
	'nrng' = 9,
	'gt' = 10,
	'gte' = 11,
	'lt' = 12,
	'lte' = 13,
}
export type TicketFilterType = 'text' | 'longText' | 'date' | 'sequencing' | 'pastDate' | 'createdAt' | 'updatedAt' | 'oneOf' | 'manyOf' | 'status' | 'boolean' | 'number' | 'title' | 'ticketCode' | 'template' | 'owner';
export type ValueType = string | number | Date;
export type TicketFilterValue = ValueType | ValueType[] | [ValueType, ValueType][]; // last one is for the range operator
export type BaseFilter = { operator: TicketFilterOperator, values: TicketFilterValue[], displayValues?: string };

export type TicketFilter = {
	property: string,
	type: TicketFilterType,
	filter?: BaseFilter,
	module?: string,
};