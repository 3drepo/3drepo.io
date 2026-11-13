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

import { PropertyTypeDefinition } from '@/v5/store/tickets/tickets.types';
import { has } from 'lodash';

export const ColumnWidths = {
	Timestamp: 154,
	Author: 176,
	ActionType: 90,
	ChangePropertyName: 250,
	ChangeDetails: 400,
};


// Values can easily be described in a human-readable format. (e.g. not coords)
export const isDescribableChange = (type: PropertyTypeDefinition) => ['text', 'longText', 'date', 'pastDate', 'sequencing', 'number', 'tags', 'oneOf', 'manyOf', 'boolean'].includes(type);
// Value is an array so can consist of removals and additions
export const isArrayChange = (type: PropertyTypeDefinition) => ['manyOf', 'tags', 'imageList'].includes(type);
export const isDateChange = (type: PropertyTypeDefinition) => ['date', 'pastDate', 'sequencing'].includes(type);

export const getPathsOfChanges = (changes: any, prefix = ''): string[] =>
	Object.entries(changes).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;

		if (typeof value !== 'object' || value === null) return [];

		if (has(value, 'from') && has(value, 'to')) {
			return [path];
		}

		return getPathsOfChanges(value, path);
	});