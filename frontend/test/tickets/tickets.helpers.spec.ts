/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import {
	canBulkEditProperty,
	getEditableProperties,
	getTemplatePropertiesDefinitions,
	getVisibleProperties,
	getTemplateWithoutHiddenProperties,
} from '@/v5/store/tickets/tickets.helpers';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { getAvailableColumnsForTemplate } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/tabularViewContext/tabularViewContext.helpers';
import { hasRequiredViewerProperties } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/ticketsTable.helper';

describe('Tickets: helpers', () => {
	const template: ITemplate = {
		_id: 'templateId',
		name: 'Template',
		code: 'TMP',
		properties: [
			{ name: 'Visible property', type: 'text' },
			{ name: 'Read only property', type: 'text', readOnly: true },
			{ name: 'Hidden property', type: 'text', hiddenOnUI: true },
			{ name: 'Hidden required view', type: 'view', hiddenOnUI: true, required: true },
		],
		modules: [
			{
				name: 'Visible module',
				properties: [
					{ name: 'Visible module property', type: 'number' },
					{ name: 'Hidden module property', type: 'text', hiddenOnUI: true },
				],
			},
			{
				name: 'Hidden module',
				properties: [
					{ name: 'Only hidden property', type: 'text', hiddenOnUI: true },
				],
			},
		],
	};

	it('filters hidden properties from UI property lists', () => {
		expect(getVisibleProperties(template.properties).map(({ name }) => name)).toEqual([
			'Visible property',
			'Read only property',
		]);
	});

	it('filters hidden properties and empty modules from UI templates', () => {
		const visibleTemplate = getTemplateWithoutHiddenProperties(template);

		expect(visibleTemplate.properties?.map(({ name }) => name)).toEqual([
			'Visible property',
			'Read only property',
		]);
		expect(visibleTemplate.modules).toEqual([
			{
				name: 'Visible module',
				properties: [
					{ name: 'Visible module property', type: 'number' },
				],
			},
		]);
	});

	it('keeps hidden properties out of editable form definitions', () => {
		const editableTemplate = getEditableProperties(template);

		expect(editableTemplate.properties.map(({ name }) => name)).toEqual(['Visible property']);
		expect(editableTemplate.modules[0].properties.map(({ name }) => name)).toEqual(['Visible module property']);
	});

	it('keeps hidden properties out of group-by and tabular definitions', () => {
		const propertyDefinitions = getTemplatePropertiesDefinitions(template);
		const columns = getAvailableColumnsForTemplate(template);

		expect(propertyDefinitions.map(({ name }) => name)).toEqual([
			'properties.Visible property',
			'properties.Read only property',
			'modules.Visible module.Visible module property',
		]);
		expect(columns.map(({ name }) => name)).toContain('properties.Visible property');
		expect(columns.map(({ name }) => name)).not.toContain('properties.Hidden property');
		expect(columns.map(({ name }) => name)).not.toContain('modules.Visible module.Hidden module property');
	});

	it('does not allow hidden properties to be bulk edited', () => {
		expect(canBulkEditProperty(template, 'properties.Visible property')).toEqual(true);
		expect(canBulkEditProperty(template, 'properties.Hidden property')).toEqual(false);
		expect(canBulkEditProperty(template, 'modules.Visible module.Hidden module property')).toEqual(false);
	});

	it('ignores hidden required viewer properties when checking tabular ticket creation', () => {
		expect(hasRequiredViewerProperties(template)).toEqual(false);
		expect(hasRequiredViewerProperties({
			...template,
			properties: [
				...(template.properties || []),
				{ name: 'Visible required view', type: 'view', required: true },
			],
		})).toEqual(true);
	});
});
