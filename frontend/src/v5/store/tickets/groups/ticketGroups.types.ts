/**
 *  Copyright (C) 2023 3D Repo Ltd
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

export interface ITicketGroupFromApi {
	groupsByTicketId: Record<string, IGroupFromApi>,
}

export const OPERATIONS_TYPES = {
	EXISTS: 'field',
	NOT_EXISTS: 'field',
	IS: 'text',
	IS_NOT: 'text',
	CONTAINS: 'text',
	NOT_CONTAINS: 'text',
	REGEX: 'regex',
	EQUALS: 'number',
	NOT_EQUALS: 'number',
	GT: 'numberComparison',
	GTE: 'numberComparison',
	LT: 'numberComparison',
	LTE: 'numberComparison',
	IN_RANGE: 'numberRange',
	NOT_IN_RANGE: 'numberRange',
} as const;

export type Operation = keyof typeof OPERATIONS_TYPES;
export type OperationType = typeof OPERATIONS_TYPES[Operation];

export interface IGroupRule {
	field: string,
	operation: Operation,
	values?: (number | string)[],
}

export interface IGroupFromApi {
	_id: string,
	name: string,
	objects: {
		container: string,
	}[],
	description?: string,
	rules?: IGroupRule[],
}

interface BaseGroup {
	prefix?: string[],
	group: IGroupFromApi,
}

interface ColorAndOpacity {
	// at least 1 of the following is required, but not necessarily both
	color?: [number, number, number],
	opacity?: number,
}

export interface IColoredGroup extends BaseGroup, ColorAndOpacity { }

export interface IHiddenGroup extends BaseGroup { }

export type IGroup = IColoredGroup | IHiddenGroup;

export type IGroupSettingsForm = Partial<IGroupFromApi> & ColorAndOpacity & {
	prefix?: string[],
};

export interface IViewState {
	showDefaultHidden: boolean,
	colored: IColoredGroup[],
	hidden: IHiddenGroup[],
}
