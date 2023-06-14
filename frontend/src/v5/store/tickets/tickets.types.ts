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

export type PropertyTypeDefinition = 'text' | 'longText' | 'boolean' | 'number' | 'date' | 'view' | 'manyOf' | 'oneOf' | 'image' | 'coords' | 'measurements';

export interface PropertyDefinition {
	name: string;
	type: PropertyTypeDefinition;
	values?: string[] | 'jobsAndUsers' | 'riskCategories';
	default?: string;
	readOnly?: boolean;
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
}

export interface TemplateModule {
	// either one of the following 2
	name?: string;
	type?: 'safetibase' | 'sequencing' | 'shapes';
	deprecated?: boolean;
	properties: PropertyDefinition[];
}

export interface ITemplate {
	_id: string;
	name: string;
	code: string;
	properties: PropertyDefinition[];
	modules?: TemplateModule[];
	config: {
		comments: boolean;
		defaultView: boolean;
		issueProperties: boolean;
		pin: boolean;
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

export type Group = {
	_id?: string,
	name: string,
	description?: string,
	objects?: { container: string, _ids: string[] }[],
	rules?: IGroupRule[],
};

export enum ViewpointGroupOverrideType {
	COLORED,
	HIDDEN,
	TRANSFORMED,
}

type ColorAndOpacity = {
	color?: [number, number, number],
	opacity?: number,
};

export type GroupOverride = ColorAndOpacity & {
	prefix?: string[],
	group: string | Group,
};

export type ViewpointState = {
	showDefaultHidden: boolean;
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
