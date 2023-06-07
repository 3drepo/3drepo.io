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

export type ViewpointGroup = {
	_id?: string,
	name: string,
	description: string,
	objects?: { container: string, _ids: [] }[]
	rules?: object[]
};

export enum ViewpointGroupHierarchyType {
	COLORED,
	HIDDEN,
	TRANSFORMED,
}

export type ViewpointGroupHierarchy = {
	prefix?: string[],
	group: string | ViewpointGroup,
	color?: [number, number, number],
	opacity?: number,
};

export type ViewpointState = {
	showDefaultHidden: boolean;
	hidden?: ViewpointGroupHierarchy[],
	colored?: ViewpointGroupHierarchy[],
	transformed?: ViewpointGroupHierarchy[],
};

export type Viewpoint = {
	screenshot?: any;
	camera?: Camera;
	clippingPlanes?: ClippingPlane[];
	state?: ViewpointState;
};
