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

const { deleteIfUndefined } = require('../../utils/helper/objects');
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
	'coords',
]);

const presetModules = createConstantMapping([
	'sequencing',
	'shapes',
	'safetibase',
]);

const presetEnumValues = createConstantMapping([
	'jobsAndUsers',
	'riskCategories',
]);

const viewGroups = createConstantMapping([
	'colored',
	'hidden',
	'transformed',
]);

const riskLevelsArr = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const riskLevels = createConstantMapping(riskLevelsArr);

const createPropertyEntry = (name, type, values, defaultVal, readOnly, availableIf) => deleteIfUndefined({
	name, type, values, default: defaultVal, readOnly, availableIf });

const TemplateConstants = { propTypes, presetEnumValues, presetModules, riskLevels, viewGroups };

TemplateConstants.riskLevelsToNum = (value) => riskLevelsArr.indexOf(value);

TemplateConstants.statusTypes = ['open', 'active', 'review', 'done', 'void'];

TemplateConstants.presetModulesProperties = {
	[presetModules.SEQUENCING]: [
		createPropertyEntry('Start Time', propTypes.DATE),
		createPropertyEntry('End Time', propTypes.DATE),
	],
	[presetModules.SHAPES]: [
		createPropertyEntry('Shapes', propTypes.MEASUREMENTS),
	],
	[presetModules.SAFETIBASE]: [
		createPropertyEntry('Risk Likelihood', propTypes.ONE_OF, riskLevelsArr, riskLevels.VERY_LOW),
		createPropertyEntry('Risk Consequence', propTypes.ONE_OF, riskLevelsArr, riskLevels.VERY_LOW),
		createPropertyEntry('Level of Risk', propTypes.TEXT, undefined, undefined, true),
		createPropertyEntry('Category', propTypes.ONE_OF, presetEnumValues.RISK_CATEGORIES),
		createPropertyEntry('Associated Activity', propTypes.TEXT),
		createPropertyEntry('Element Type', propTypes.TEXT),
		createPropertyEntry('Risk Factor', propTypes.TEXT),
		createPropertyEntry('Construction Scope', propTypes.TEXT),
		createPropertyEntry('Location', propTypes.TEXT),
		createPropertyEntry('Treatment', propTypes.TEXT),
		createPropertyEntry('Treatment Details', propTypes.LONG_TEXT),
		createPropertyEntry('Stage', propTypes.TEXT),
		createPropertyEntry('Type', propTypes.TEXT),
		createPropertyEntry('Treatment Status', propTypes.ONE_OF, ['Untreated', 'Proposed', 'Agreed (Partial)', 'Agreed (Fully)', 'Rejected', 'Void'], 'Untreated'),
		createPropertyEntry('Treated Risk Likelihood', propTypes.ONE_OF, riskLevelsArr, riskLevels.VERY_LOW),
		createPropertyEntry('Treated Risk Consequence', propTypes.ONE_OF, riskLevelsArr, riskLevels.VERY_LOW),
		createPropertyEntry('Treated Level of Risk', propTypes.TEXT, undefined, undefined, true),
		createPropertyEntry('Residual Risk', propTypes.TEXT),
	],

};

TemplateConstants.defaultProperties = (config) => [
	createPropertyEntry('Description', propTypes.LONG_TEXT),
	createPropertyEntry('Owner', propTypes.TEXT, undefined, undefined, true),
	createPropertyEntry('Created at', propTypes.DATE, undefined, undefined, true),
	createPropertyEntry('Updated at', propTypes.DATE, undefined, undefined, true),
	createPropertyEntry('Status', propTypes.ONE_OF,
		config?.status ? config?.status.values.map((v) => v.name) : ['Open', 'In Progress', 'For Approval', 'Closed', 'Void'],
		config?.status ? config?.status.default : 'Open'),
	createPropertyEntry('Default Image', propTypes.IMAGE, undefined, undefined, undefined, ({ defaultImage }) => defaultImage),
	createPropertyEntry('Default View', propTypes.VIEW, undefined, undefined, undefined, ({ defaultView }) => defaultView),
	createPropertyEntry('Priority', propTypes.ONE_OF, ['None', 'Low', 'Medium', 'High'], 'None', undefined, ({ issueProperties }) => issueProperties),
	createPropertyEntry('Assignees', propTypes.MANY_OF, presetEnumValues.JOBS_AND_USERS, undefined, undefined, ({ issueProperties }) => issueProperties),
	createPropertyEntry('Due Date', propTypes.DATE, undefined, undefined, undefined, ({ issueProperties }) => issueProperties),
	createPropertyEntry('Pin', propTypes.COORDS, undefined, undefined, undefined, ({ pin }) => pin),
];

TemplateConstants.basePropertyLabels = createConstantMapping(TemplateConstants.defaultProperties().map(
	({ name }) => name,
));

TemplateConstants.modulePropertyLabels = {};

Object.keys(TemplateConstants.presetModulesProperties).forEach((module) => {
	const modProps = TemplateConstants.presetModulesProperties[module];
	TemplateConstants.modulePropertyLabels[module] = createConstantMapping(
		modProps.map(({ name }) => name),
	);
});

TemplateConstants.getApplicableDefaultProperties = (config) => TemplateConstants.defaultProperties().flatMap(
	({ availableIf, ...prop }) => (!availableIf || availableIf(config) ? prop : []),
);

module.exports = TemplateConstants;
