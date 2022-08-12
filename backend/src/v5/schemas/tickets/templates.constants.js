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

const createConstantMapping = (values) => {
	const res = {};
	values.forEach((value) => {
		res[toConstantCase(value)] = value;
	});

	return res;
};

const propTypes = createConstantMapping([
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
]);

const presetModules = createConstantMapping([
	'sequencing',
	'shapes',
	'attachments',
	'safetibase',
]);

const presetEnumValues = createConstantMapping([
	'jobsAndUsers',
	'riskCategories',
]);

const riskLevelsArr = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const riskLevels = createConstantMapping(riskLevelsArr);

const TemplateConstants = { propTypes, presetEnumValues, presetModules, riskLevels };

TemplateConstants.riskLevelsToNum = (value) => riskLevelsArr.indexOf(value);

TemplateConstants.presetModulesProperties = {
	[presetModules.SEQUENCING]: [
		{ name: 'Start Time', type: propTypes.DATE },
		{ name: 'End Time', type: propTypes.DATE },
	],
	[presetModules.SHAPES]: [
		{ name: 'Shapes', type: propTypes.MEASUREMENTS },
	],
	[presetModules.ATTACHMENTS]: [
		{ name: 'Resources', type: propTypes.ATTACHMENTS },
	],
	[presetModules.SAFETIBASE]: [
		{ name: 'Risk Likelihood', type: propTypes.ONE_OF, values: riskLevelsArr, default: riskLevels.VERY_LOW },
		{ name: 'Risk Consequence', type: propTypes.ONE_OF, values: riskLevelsArr, default: riskLevels.VERY_LOW },
		{ name: 'Level of Risk', type: TemplateConstants.TEXT, readOnly: true },
		{ name: 'Category', type: propTypes.ONE_OF, values: presetEnumValues.RISK_CATEGORIES },
		{ name: 'Associated Activity', type: TemplateConstants.TEXT },
		{ name: 'Element Type', type: TemplateConstants.TEXT },
		{ name: 'Risk Factor', type: TemplateConstants.TEXT },
		{ name: 'Construction Scope', type: TemplateConstants.TEXT },
		{ name: 'Location', type: TemplateConstants.TEXT },
		{ name: 'Treatment', type: TemplateConstants.TEXT },
		{ name: 'Treatment Details', type: TemplateConstants.LONG_TEXT },
		{ name: 'Stage', type: TemplateConstants.TEXT },
		{ name: 'Type', type: TemplateConstants.TEXT },
		{ name: 'Treatment Status', type: propTypes.ONE_OF, values: ['Unmitigated', 'Proposed', 'Agreed (Partial)', 'Agreed (Fully)', 'Rejected', 'Void'], default: 'Unmitigated' },
		{ name: 'Treated Risk Likelihood', type: propTypes.ONE_OF, values: riskLevels },
		{ name: 'Treated Risk Consequence', type: propTypes.ONE_OF, values: riskLevels },
		{ name: 'Treated Level of Risk', type: propTypes.TEXT, readOnly: true },
		{ name: 'Residual Risk', type: TemplateConstants.TEXT },
	],

};

TemplateConstants.defaultProperties = [

	{ name: 'Description', type: propTypes.LONG_TEXT },
	{ name: 'Owner', type: propTypes.TEXT, readOnly: true },
	{ name: 'Created at', type: propTypes.DATE, readOnly: true },
	{ name: 'Updated at', type: propTypes.DATE, readOnly: true },
	{ name: 'Default Image', type: propTypes.IMAGE, availableIf: ({ defaultImage }) => defaultImage },
	{ name: 'Default View', type: propTypes.VIEW, availableIf: ({ defaultView }) => defaultView },
	{ name: 'Priority', type: propTypes.ONE_OF, values: ['None', 'Low', 'Medium', 'High'], default: 'None', availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Status', type: propTypes.ONE_OF, values: ['Open', 'In Progress', 'For Approval', 'Closed', 'Void'], default: 'Open', availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Assignees', type: propTypes.MANY_OF, values: presetEnumValues.JOBS_AND_USERS, availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Due Date', type: propTypes.DATE, availableIf: ({ issueProperties }) => issueProperties },
	{ name: 'Pin', type: propTypes.COORDS, availableIf: ({ pin }) => pin },

];

TemplateConstants.basePropertyLabels = createConstantMapping(TemplateConstants.defaultProperties.map(
	({ name }) => name,
));

TemplateConstants.modulePropertyLabels = {};

Object.keys(TemplateConstants.presetModulesProperties).forEach((module) => {
	const modProps = TemplateConstants.presetModulesProperties[module];
	TemplateConstants.modulePropertyLabels[module] = createConstantMapping(
		modProps.map(({ name }) => name),
	);
});

TemplateConstants.getApplicableDefaultProperties = (config) => TemplateConstants.defaultProperties.flatMap(
	({ availableIf, ...prop }) => (!availableIf || availableIf(config) ? prop : []),
);

module.exports = TemplateConstants;
