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

export interface ITicket {
	_id: string,
	title: string,
	number: number,
	type: string,
	properties: any,
	modules: any,
}

export interface ITemplate {
	_id: string,
	name: string,
	code: string,
	deprecated: boolean,
}

export interface ITemplateDetails {
	config: TemplateConfig,
	properties: TemplateProperties[],
	modules: TemplateModule[],
}

type TemplateConfig = {
	comments: boolean,
	issueProperties: boolean,
	defaultView: boolean,
	defaultImage: boolean,
	pin: boolean,
};
type TemplateModule = {
	name: string,
	type: string,
	deprecated: boolean,
	properties: TemplateProperties[],
};
type TemplateProperties = {
	name: string,
	type: 'text' | 'longText' | 'boolean' | 'date' | 'number'
	| 'oneOf' | 'manyOf' | 'image' | 'view' | 'measurements' | 'coords',
	deprecated: boolean
	required: boolean,
	values: string[],
};
