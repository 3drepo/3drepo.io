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
import { EventEmitter } from 'eventemitter3';
import { useRef, useEffect } from 'react';

const TABLE_COLUMNS_INVALID_PROPERTIES = ['view', 'image', 'imageList', 'coords'];
const TABLE_COLUMNS_DEFAULT_PROPERTIES = ['id', 'modelName', BaseProperties.TITLE];
const TABLE_COLUMNS_DEFAULT_WIDTHS = {
	'id': { width: 80, minWidth: 25 },
	'modelName': { width: 170, minWidth: 25 },
	[BaseProperties.TITLE]: { width: 380, minWidth: 25 },
	[IssueProperties.PRIORITY]: { width: 90, minWidth: 25 },
	[IssueProperties.ASSIGNEES]: { width: 96, minWidth: 25 },
	[`properties.${BaseProperties.STATUS}`]: { width: 150, minWidth: 52 },
};
const TABLE_COLUMNS_TYPE_TO_WIDTHS: Partial<Record<PropertyTypeDefinition, { width: number, minWidth: number }>> = {
	'text': { width: 140, minWidth: 25 },
	'longText': { width: 200, minWidth: 25 },
	'boolean': { width: 140, minWidth: 25 },
	'number': { width: 100, minWidth: 25 },
	// @ts-ignore
	'pastDate': { width: 147, minWidth: 25 },
	'date': { width: 147, minWidth: 25 },
	'manyOf': { width: 140, minWidth: 25 },
	'oneOf': { width: 140, minWidth: 25 },
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

export const useSubscribableSearchParams = () => {
	const emitterRef = useRef(new EventEmitter());
	const prevSearchParamsRef = useRef(Object.fromEntries(new URLSearchParams(window.location.search).entries()));

	const getValue = (name) => new URLSearchParams(window.location.search).get(name) || '';

	const updateValue = (name, value, searchParams) => {
		if (value) {
			searchParams.set(name, value);
			prevSearchParamsRef.current[name] = value;
		} else {
			searchParams.delete(name);
			delete prevSearchParamsRef.current[name];
		}
	};

	const setValues = (newValues: Record<string, string>, pushInHistory = false) => {
		const searchParams = new URLSearchParams(window.location.search);
		Object.entries(newValues).forEach(([name, value]) => {
			updateValue(name, value, searchParams);
			emitterRef.current.emit(name, value || '');
		});
		if (pushInHistory) {
			window.history.pushState({}, '', `${location.pathname}?${searchParams}`);
		} else {
			window.history.replaceState({}, '', `${location.pathname}?${searchParams}`);
		}
	};

	const subscribeToValueChange = (name, fn) => {
		emitterRef.current.on(name, fn);
		return () => emitterRef.current.off(name, fn);
	};

	// register to navigate back/forth in browser history
	useEffect(() => {
		const onPopState = () => {
			const searchParams = new URLSearchParams(window.location.search);
			const differentParams = [];

			searchParams.forEach((value, name) => {
				if (!prevSearchParamsRef.current[name]) {
					// new parameter
					differentParams.push(name);
					return;
				}

				if (getValue(name) !== prevSearchParamsRef.current[name]) {
					// changed parameter
					differentParams.push(name);
				}
			});

			Object.keys(prevSearchParamsRef.current).forEach((name) => {
				if (!searchParams.has(name)) {
					// removed parameter
					differentParams.push(name);
				}
			});
			differentParams.forEach((name) => emitterRef.current.emit(name, getValue(name)));
			prevSearchParamsRef.current = Object.fromEntries(searchParams.entries());
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, []);

	return [getValue, setValues, subscribeToValueChange] as const;
};
