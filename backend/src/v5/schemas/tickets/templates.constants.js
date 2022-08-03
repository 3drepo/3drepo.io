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

const fieldTypes = {};
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
	'safetibase',
	'coords',
].forEach((type) => {
	fieldTypes[toConstantCase(type)] = type;
});

const presetModules = {};

[
	'sequencing',
	'shapes',
	'attachments',
	'safetibase',
].forEach((mod) => {
	presetModules[toConstantCase(mod)] = mod;
});

const presetEnumValues = {};

[
	'jobsAndUsers',
	'riskCategories',
].forEach((val) => {
	presetEnumValues[toConstantCase(val)] = val;
});

const TemplateConstants = { fieldTypes, presetEnumValues, presetModules };

const riskLevels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

TemplateConstants.presetModulesProperties = {
	[presetModules.SEQUENCING]: [
		{ name: 'Start Time', type: fieldTypes.DATE },
		{ name: 'End Time', type: fieldTypes.DATE },
	],
	[presetModules.SHAPES]: [
		{ name: 'Shapes', type: fieldTypes.MEASUREMENTS },
	],
	[presetModules.ATTACHMENTS]: [
		{ name: 'Resources', type: fieldTypes.ATTACHMENTS },
	],
	[presetModules.SAFETIBASE]: [
		{ name: 'Risk Likelyhood', type: fieldTypes.ONE_OF, values: riskLevels, default: 'Very Low' },
		{ name: 'Risk Consequence', type: fieldTypes.ONE_OF, values: riskLevels, default: 'Very Low' },
		{ name: 'Level of Risk', type: TemplateConstants.TEXT, readOnly: true },
		{ name: 'Risk owner', type: fieldTypes.ONE_OF, values: presetEnumValues.JOBS_AND_USERS }, // TODO check if still needed
		{ name: 'Category', type: fieldTypes.ONE_OF, values: presetEnumValues.RISK_CATEGORIES },
		{ name: 'Associated Activity', type: TemplateConstants.TEXT },
		{ name: 'Element Type', type: TemplateConstants.TEXT },
		{ name: 'Risk Factor', type: TemplateConstants.TEXT },
		{ name: 'Construction Scope', type: TemplateConstants.TEXT },
		{ name: 'Location', type: TemplateConstants.TEXT },
		{ name: 'Treatment', type: TemplateConstants.TEXT },
		{ name: 'Treatment Details', type: TemplateConstants.LONG_TEXT },
		{ name: 'Stage', type: TemplateConstants.TEXT },
		{ name: 'Type', type: TemplateConstants.TEXT },
		{ name: 'Treatment Status', type: fieldTypes.ONE_OF, values: ['Unmitigated', 'Proposed', 'Agreed (Partial)', 'Agreed (Fully)', 'Rejected', 'Void'], default: 'Unmitigated' },
		{ name: 'Treated Risk Likelyhood', type: fieldTypes.ONE_OF, values: riskLevels, default: 'Very Low' },
		{ name: 'Treated Risk Consequence', type: fieldTypes.ONE_OF, values: riskLevels, default: 'Very Low' },
		{ name: 'Residual Risk', type: TemplateConstants.TEXT },

	],

};

TemplateConstants.defaultProperties = [
	{ name: 'Description', type: fieldTypes.LONG_TEXT },
	{ name: 'Owner', type: fieldTypes.TEXT, readOnly: true },
	{ name: 'Created at', type: fieldTypes.DATE, readOnly: true },
	{ name: 'Updated at', type: fieldTypes.DATE, readOnly: true },
	{ name: 'Default Image', type: fieldTypes.IMAGE, availableIf: ({ defaultImage }) => defaultImage },
	{ name: 'Default View', type: fieldTypes.VIEW, availableIf: ({ defaultView }) => defaultView },
	{ name: 'Priority', type: fieldTypes.ONE_OF, values: ['None', 'Low', 'Medium', 'High'], default: 'None', availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Status', type: fieldTypes.ONE_OF, values: ['Open', 'In Progress', 'For Approval', 'Closed', 'Void'], default: 'Open', availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Assignees', type: fieldTypes.MANY_OF, values: presetEnumValues.JOBS_AND_USERS, availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Due Date', type: fieldTypes.DATE, availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Pin', type: fieldTypes.COORDS, availableIf: ({ pin }) => pin },
];

TemplateConstants.getApplicableDefaultProperties = (config) => TemplateConstants.defaultProperties.flatMap(
	({ availableIf, ...prop }) => (!availableIf || availableIf(config) ? prop : []),
);

module.exports = TemplateConstants;
