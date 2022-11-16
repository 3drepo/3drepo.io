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

type Property = Record<string, any> | {Pin: number[] };

export interface ITicket {
	_id: string,
	title: string,
	number: number,
	type: string,
	properties: Property,
	modules?: Record<string, Property>,
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
	config: any;
}

export type NewTicket = Omit<ITicket, '_id'>;
export type EditableTicket = Omit<NewTicket, 'number'>;
