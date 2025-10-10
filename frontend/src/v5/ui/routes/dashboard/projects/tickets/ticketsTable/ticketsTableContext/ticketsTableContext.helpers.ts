/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { ITemplate, PropertyDefinition, PropertyTypeDefinition } from '@/v5/store/tickets/tickets.types';
import { compact } from 'lodash';
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { TableColumn } from '@controls/resizableTableContext/resizableTableContext';

const TABLE_COLUMNS_INVALID_PROPERTIES = ['view', 'image', 'imageList', 'coords'];
const TABLE_COLUMNS_DEFAULT_PROPERTIES = ['id', 'modelName', BaseProperties.TITLE];
const minWidth =  70;

const TABLE_COLUMNS_DEFAULT_WIDTHS = {
	'id': { width: 80, minWidth },
	'modelName': { width: 170, minWidth },
	[BaseProperties.TITLE]: { width: 380, minWidth },
	[IssueProperties.PRIORITY]: { width: 90, minWidth },
	[IssueProperties.ASSIGNEES]: { width: 96, minWidth },
	[`properties.${BaseProperties.STATUS}`]: { width: 150, minWidth },
};
const TABLE_COLUMNS_TYPE_TO_WIDTHS: Partial<Record<PropertyTypeDefinition, { width: number, minWidth: number }>> = {
	'text': { width: 140, minWidth },
	'longText': { width: 200, minWidth },
	'boolean': { width: 140, minWidth },
	'number': { width: 100, minWidth },
	// @ts-ignore
	'pastDate': { width: 147, minWidth },
	'date': { width: 147, minWidth },
	'manyOf': { width: 140, minWidth },
	'oneOf': { width: 140, minWidth },
};

const getTableColumnData = ({ name, type }): TableColumn => {
	if (TABLE_COLUMNS_INVALID_PROPERTIES.includes(type)) return;
	const widths = TABLE_COLUMNS_DEFAULT_WIDTHS[name] ?? TABLE_COLUMNS_TYPE_TO_WIDTHS[type];
	return { name, ...widths, stretch: name === BaseProperties.TITLE };
};

export const getTemplatePropertiesDefinitions = (template: ITemplate): PropertyDefinition[] => {
	if (!template.properties) return [];
	return [
		...template.properties?.map((property) => ({ ...property, name: `properties.${property.name}` })),
		...template.modules?.flatMap((module) => module.properties.map((property) => ({ ...property, name: `modules.${module.type || module.name}.${property.name}` }))),
	];
};

export const getAvailableColumnsForTemplate = (template: ITemplate): TableColumn[] => {
	const propertiesDefinition = getTemplatePropertiesDefinitions(template);
	const columns = [
		...TABLE_COLUMNS_DEFAULT_PROPERTIES.map((name) => ({ name })),
		...propertiesDefinition,
	];

	return compact(columns.map(getTableColumnData));
};
