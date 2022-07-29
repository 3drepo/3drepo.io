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

const { toConstantCase } = require('../../utils/helper/strings');

const TemplateConstants = {};

TemplateConstants.fieldTypes = {};

[
	'text',
	'longText',
	'boolean',
	'date',
	'number',
	'oneOf',
	'manyOf',
	'image',
	'view',
	'measurements',
	'attachments',
	'safetibase',
].forEach((type) => {
	TemplateConstants.fieldTypes[toConstantCase(type)] = type;
});

TemplateConstants.presetModules = {};

[
	'sequencing',
	'shapes',
	'attachments',
	'safetibase',
].forEach((mod) => {
	TemplateConstants.presetModules[toConstantCase(mod)] = mod;
});

TemplateConstants.presetEnumValues = {};

[
	'jobsAndUsers',
].forEach((val) => {
	TemplateConstants.presetEnumValues[toConstantCase(val)] = val;
});

TemplateConstants.presetModulesProperties = {
	[TemplateConstants.presetModules.SEQUENCING]: [
		{ name: 'Start Time', type: TemplateConstants.fieldTypes.DATE },
		{ name: 'End Time', type: TemplateConstants.fieldTypes.DATE },
	],
	[TemplateConstants.presetModules.SHAPES]: [
		{ name: 'Shapes', type: TemplateConstants.fieldTypes.MEASUREMENTS },
	],
	[TemplateConstants.presetModules.ATTACHMENTS]: [
		{ name: 'Resources', type: TemplateConstants.fieldTypes.ATTACHMENTS },
	],
	[TemplateConstants.presetModules.SAFETIBASE]: [
		{ name: 'Safetibase', type: TemplateConstants.fieldTypes.SAFETIBASE },
	],

};

TemplateConstants.defaultProperties = [
	{ name: 'Description', type: TemplateConstants.fieldTypes.LONG_TEXT },
	{ name: 'Owner', type: TemplateConstants.fieldTypes.TEXT, readOnly: true },
	{ name: 'Created at', type: TemplateConstants.fieldTypes.DATE, readOnly: true },
	{ name: 'Updated at', type: TemplateConstants.fieldTypes.DATE, readOnly: true },
	{ name: 'Default Image', type: TemplateConstants.fieldTypes.IMAGE },
	{ name: 'Default View', type: TemplateConstants.fieldTypes.VIEW },
	{ name: 'Priority', type: TemplateConstants.fieldTypes.ONE_OF, values: ['None', 'Low', 'Medium', 'High'], default: 'None' },
	{ name: 'Status', type: TemplateConstants.fieldTypes.ONE_OF, values: ['Open', 'In Progress', 'For Approval', 'Closed', 'Void'], default: 'Open' },
	{ name: 'Assignees', type: TemplateConstants.fieldTypes.MANY_OF, values: TemplateConstants.presetEnumValues.JOBS_AND_USERS },
	{ name: 'Due Date', type: TemplateConstants.fieldTypes.DATE },
];

module.exports = TemplateConstants;
