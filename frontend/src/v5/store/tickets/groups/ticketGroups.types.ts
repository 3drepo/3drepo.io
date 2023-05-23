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

export interface IGroupRule {
	field: string,
	operator: string,
	values: string[],
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
