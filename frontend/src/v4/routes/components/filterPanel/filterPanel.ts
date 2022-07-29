/**
 *  Copyright (C) 2022 3D Repo Ltd
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

export const FILTER_TYPES = {
	UNDEFINED: 1,
	DATE: 2,
	QUERY: 3
};

export const DATA_TYPES = {
	MODELS: 1,
	FEDERATIONS: 2,
	PROJECTS: 3
};

export interface IFilter {
	values: any;
	label?: string;
	type?: number;
}

export interface ISelectedFilter {
	value: any;
	label: string;
	relatedField: string;
	type?: number;
}

export interface IDataType {
	label?: string;
	type?: number;
}