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

export const ColumnWidths = {
	Timestamp: 154,
	Author: 176,
	ActionType: 90,
	ChangePropertyName: 250,
	ChangeDetails: 400,
};


// Consists of only one value.
export const isSimpleChange = (type: string) => ['date', 'pastDate', 'sequencing', 'text', 'longText', 'number', 'boolean', 'coords', 'image', 'oneOf'].includes(type);
// Value is an array so can consist of removals and additions
export const isArrayChange = (type: string) => ['manyOf', 'tags', 'imageList'].includes(type);
// Value is an object so can consist of nested changes
export const isObjectChange = (type: string) => ['view'].includes(type);
