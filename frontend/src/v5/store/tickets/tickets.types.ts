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

import { RgbArray } from '@/v5/helpers/colors.helper';
import { TicketStatusTypes } from '@controls/chip/chip.types';

export type PropertyTypeDefinition = 'text' | 'longText' | 'boolean' | 'number' | 'pastDate' | 'date' | 'view' | 'manyOf' | 'oneOf' | 'image' | 'imageList' | 'coords';

export interface PropertyDefinition {
	name: string;
	type: PropertyTypeDefinition;
	values?: string[] | 'jobsAndUsers' | 'riskCategories';
	default?: string;
	unique?: boolean;
	readOnly?: boolean;
	readOnlyOnUI?: boolean;
	immutable?: boolean;
	required?: boolean;
	deprecated?: boolean;
}

export type Properties = Record<string, any>;

export interface ITicket {
	_id: string,
	title: string,
	number: number,
	type: string,
	properties: Properties,
	modules?: Record<string, Properties>,
	modelId?: string,
}

export interface TemplateModule {
	// either one of the following 2
	name?: string;
	type?: 'safetibase' | 'sequencing' | 'shapes';
	deprecated?: boolean;
	properties: PropertyDefinition[];
}

export type IPinColorMapping = {
	property: {
		name: string,
		module?: string,
	}
	mapping: [
		{
			default: RgbArray;
		},
		{
			value: any;
			color: RgbArray;
		}[],
	]
};

export type PinIcon =  'DEFAULT' | 'RISK' | 'ISSUE' | 'MARKER';

export type PinConfig = {
	name?: string;
	color?: RgbArray | IPinColorMapping;
	icon?: PinIcon;
};

export type StatusValue = {
	name: string;
	type: TicketStatusTypes;
	label?: string;
};

export type IStatusConfig = {
	values: StatusValue[],
	default?: string;
};

type ITabularColumn = {
	module?: string;
	property: string;
};

type ITabularConfig = {
	columns: ITabularColumn[];
};
export interface ITemplate {
	_id: string;
	name: string;
	code: string;
	properties?: PropertyDefinition[];
	modules?: TemplateModule[];
	deprecated?: boolean;
	config?: {
		comments?: boolean;
		defaultView?: boolean;
		issueProperties?: boolean;
		pin?: boolean | PinConfig;
		status?: IStatusConfig;
		tabular?: ITabularConfig;
	};
}

export type NewTicket = Omit<ITicket, '_id'>;
export type EditableTicket = Omit<NewTicket, 'number'>;

export type Camera = {
	type: 'perspective' | 'orthographic';
	position: number[];
	forward: number[];
	up: number[];
	size?: number;
};

export type ClippingPlane = {
	normal: number[];
	distance: number[];
	clipDirection: 1 | -1;
};

export const OPERATIONS_TYPES = {
	IS_NOT_EMPTY: 'field',
	IS_EMPTY: 'field',
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

export type Operator = keyof typeof OPERATIONS_TYPES;
export type FieldOperator = 'IS' | 'CONTAINS' | 'REGEX' | 'STARTS_WITH' | 'ENDS_WITH';

export interface IGroupRule {
	name: string,
	field: {
		operator: FieldOperator,
		values: string[],
	},
	operator: Operator,
	values?: (number | string)[],
}

export type Group = {
	_id?: string,
	name: string,
	ticket?: string,
	description?: string,
	objects?: { container: string, _ids: string[] }[],
	rules?: IGroupRule[],
};

export type V4GroupObjects = {
	account:string,
	model: string,
	shared_ids: string[],
};

export enum ViewpointGroupOverrideType {
	COLORED,
	HIDDEN,
	TRANSFORMED,
}

export type TransformMatrix = [number, number, number, number,
	number, number, number, number,
	number, number, number, number,
	number, number, number, number];

type GroupProperties = {
	color?: [number, number, number],
	opacity?: number,
	transformation?: TransformMatrix
};

export type GroupOverride = GroupProperties & {
	prefix?: string[],
	group: string | Group,
	key?: number;
};

export type ViewpointState = {
	showHidden: boolean;
	hidden?: GroupOverride[],
	colored?: GroupOverride[],
	transformed?: GroupOverride[],
};

export type Viewpoint = {
	screenshot?: any;
	camera?: Camera;
	clippingPlanes?: ClippingPlane[];
	state?: ViewpointState;
};

export type IGroupSettingsForm = GroupOverride & { group: Group };

type MeshIdColorDict = Record<string, string>;
type MeshIdTransparencyDict = Record<string, number>;
export type MeshIdTransformDict = Record<string, TransformMatrix>;

export type OverridesDicts = {
	overrides: MeshIdColorDict,
	transparencies: MeshIdTransparencyDict,
};
