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
const { getArrayDifference } = require('../../utils/helper/arrays');
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
	'pastDate',
	'number',
	'oneOf',
	'manyOf',
	'image',
	'imageList',
	'view',
	'measurements',
	'coords',
]);

const propOptions = createConstantMapping([
	'values',
	'value',
	'required',
	'default',
	'readOnly',
	'allowWriteOnImport',
	'availableIf',
	'immutable',
	'readOnlyOnUI',
	'unique',
]);

const presetModules = createConstantMapping([
	'sequencing',
	'shapes',
	'safetibase',
	'clash',
]);

const presetEnumValues = createConstantMapping([
	'jobsAndUsers',
	'riskCategories',
]);

const viewGroups = createConstantMapping([
	'colored',
	'hidden',
	'transformed',
	'selected',
	'shown',
]);

const riskLevelsArr = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const riskLevels = createConstantMapping(riskLevelsArr);

const createPropertyEntry = (name, type, config = {}) => {
	const unrecognisedOptions = getArrayDifference(Object.values(propOptions), Object.keys(config));

	/* istanbul ignore next */
	if (unrecognisedOptions.length) {
		// we don't technically need this check - hence no test case, it's here to make sure we know if we've made a typo
		throw new Error(`Unrecognised configuration: ${unrecognisedOptions.join(',')}, provided ${Object.keys(config).join(',')}`);
	}
	return deleteIfUndefined({
		name, type, ...config });
};

const TemplateConstants = { propTypes, presetEnumValues, presetModules, riskLevels, viewGroups };

TemplateConstants.statuses = {
	OPEN: 'Open',
	IN_PROGRESS: 'In Progress',
	FOR_APPROVAL: 'For Approval',
	CLOSED: 'Closed',
	VOID: 'Void',
};

TemplateConstants.statusTypes = createConstantMapping(['open', 'active', 'review', 'done', 'void']);

TemplateConstants.riskLevelsToNum = (value) => riskLevelsArr.indexOf(value);

const riskLevelConfig = { [propOptions.VALUES]: riskLevelsArr, [propOptions.DEFAULT]: riskLevels.VERY_LOW };
const clashElementTypes = ['Revit', 'IFC', 'DWG', 'DGN', 'Unknown'];

TemplateConstants.presetModulesProperties = {
	[presetModules.SEQUENCING]: [
		createPropertyEntry('Start Time', propTypes.DATE),
		createPropertyEntry('End Time', propTypes.DATE),
	],
	[presetModules.SHAPES]: [
		createPropertyEntry('Shapes', propTypes.MEASUREMENTS),
	],
	[presetModules.SAFETIBASE]: [
		createPropertyEntry('Risk Likelihood', propTypes.ONE_OF, riskLevelConfig),
		createPropertyEntry('Risk Consequence', propTypes.ONE_OF, riskLevelConfig),
		createPropertyEntry('Level of Risk', propTypes.TEXT, { [propOptions.READ_ONLY]: true }),
		createPropertyEntry('Category', propTypes.ONE_OF, { [propOptions.VALUES]: presetEnumValues.RISK_CATEGORIES }),
		createPropertyEntry('Associated Activity', propTypes.TEXT),
		createPropertyEntry('Element Type', propTypes.TEXT),
		createPropertyEntry('Risk Factor', propTypes.TEXT),
		createPropertyEntry('Construction Scope', propTypes.TEXT),
		createPropertyEntry('Location', propTypes.TEXT),
		createPropertyEntry('Treatment', propTypes.TEXT),
		createPropertyEntry('Treatment Details', propTypes.LONG_TEXT),
		createPropertyEntry('Stage', propTypes.TEXT),
		createPropertyEntry('Type', propTypes.TEXT),
		createPropertyEntry('Treatment Status', propTypes.ONE_OF, { [propOptions.VALUES]: ['Untreated', 'Proposed', 'Agreed (Partial)', 'Agreed (Fully)', 'Rejected', 'Void'], [propOptions.DEFAULT]: 'Untreated' }),
		createPropertyEntry('Treated Risk Likelihood', propTypes.ONE_OF, riskLevelConfig),
		createPropertyEntry('Treated Risk Consequence', propTypes.ONE_OF, riskLevelConfig),
		createPropertyEntry('Treated Level of Risk', propTypes.TEXT, { [propOptions.READ_ONLY]: true }),
		createPropertyEntry('Residual Risk', propTypes.TEXT),
	],
	[presetModules.CLASH]: [
		createPropertyEntry('GUID', propTypes.TEXT, { [propOptions.IMMUTABLE]: true, [propOptions.REQUIRED]: true, [propOptions.UNIQUE]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Group', propTypes.TEXT),
		createPropertyEntry('Clash Point', propTypes.COORDS, { [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Distance (m)', propTypes.NUMBER, { [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Clash View', propTypes.VIEW, { [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Item 1 ID Type', propTypes.ONE_OF, { [propOptions.VALUES]: clashElementTypes, [propOptions.IMMUTABLE]: true, [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Item 1 ID', propTypes.TEXT, { [propOptions.IMMUTABLE]: true, [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Item 2 ID Type', propTypes.ONE_OF, { [propOptions.VALUES]: clashElementTypes, [propOptions.IMMUTABLE]: true, [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Item 2 ID', propTypes.TEXT, { [propOptions.IMMUTABLE]: true, [propOptions.REQUIRED]: true, [propOptions.READ_ONLY_ON_UI]: true }),
		createPropertyEntry('Status', propTypes.ONE_OF, { [propOptions.VALUES]: ['Active', 'Reviewed', 'Approved', 'Resolved'], default: 'Active', [propOptions.REQUIRED]: true }),
		createPropertyEntry('Assigned to', propTypes.TEXT),
		createPropertyEntry('Approved by', propTypes.TEXT),
		createPropertyEntry('Approved at', propTypes.DATE),
	],

};

const defaultProperties = [
	createPropertyEntry('Description', propTypes.LONG_TEXT),
	createPropertyEntry('Owner', propTypes.TEXT, { [propOptions.READ_ONLY]: true }),
	createPropertyEntry('Created at', propTypes.PAST_DATE, { [propOptions.READ_ONLY]: true, [propOptions.ALLOW_WRITE_ON_IMPORT]: true }),
	createPropertyEntry('Updated at', propTypes.DATE, { [propOptions.READ_ONLY]: true }),
	createPropertyEntry('Default Image', propTypes.IMAGE, { [propOptions.AVAILABLE_IF]: ({ defaultImage }) => defaultImage }),
	createPropertyEntry('Default View', propTypes.VIEW, { [propOptions.AVAILABLE_IF]: ({ defaultView }) => defaultView }),
	createPropertyEntry('Priority', propTypes.ONE_OF, { [propOptions.VALUES]: ['None', 'Low', 'Medium', 'High'], [propOptions.DEFAULT]: 'None', [propOptions.AVAILABLE_IF]: ({ issueProperties }) => issueProperties }),
	createPropertyEntry('Assignees', propTypes.MANY_OF, { [propOptions.VALUES]: presetEnumValues.JOBS_AND_USERS, [propOptions.AVAILABLE_IF]: ({ issueProperties }) => issueProperties }),
	createPropertyEntry('Due Date', propTypes.DATE, { [propOptions.AVAILABLE_IF]: ({ issueProperties }) => issueProperties }),
];

const createCustomPropertyFn = (propertyObj, customiseFn) => (config) => customiseFn(propertyObj, config);

const statusCustomiseFn = (prop, config) => {
	if (config?.status) {
		const { values: valuesMap, default: defaultVal } = config.status;

		const values = valuesMap.map(({ name }) => name);

		return { ...prop, values, default: defaultVal };
	}
	return prop;
};

const pinCustomiseFn = (prop, config) => (config?.pin?.color ? { ...prop, color: config.pin.color } : prop);

const customisableProperties = [
	createCustomPropertyFn(createPropertyEntry('Status', propTypes.ONE_OF, { values: Object.values(TemplateConstants.statuses), default: TemplateConstants.statuses.OPEN }), statusCustomiseFn),
	createCustomPropertyFn(createPropertyEntry('Pin', propTypes.COORDS, { availableIf: ({ pin }) => pin }), pinCustomiseFn),
];

TemplateConstants.basePropertyLabels = createConstantMapping([
	...defaultProperties.map(({ name }) => name),
	...customisableProperties.map((fn) => { const { name } = fn({}); return name; }),
]);

TemplateConstants.modulePropertyLabels = {};

Object.keys(TemplateConstants.presetModulesProperties).forEach((module) => {
	const modProps = TemplateConstants.presetModulesProperties[module];
	TemplateConstants.modulePropertyLabels[module] = createConstantMapping(
		modProps.map(({ name }) => name),
	);
});

const processProperty = (prop, config, isImport) => {
	const isAvailable = !prop[propOptions.AVAILABLE_IF] || prop[propOptions.AVAILABLE_IF](config);
	if (isAvailable) {
		const result = { ...prop };
		if (isImport && result[propOptions.ALLOW_WRITE_ON_IMPORT]) {
			delete result[propOptions.READ_ONLY];
		}
		delete result[propOptions.AVAILABLE_IF];
		delete result[propOptions.ALLOW_WRITE_ON_IMPORT];
		return result;
	}
	return [];
};

TemplateConstants.getApplicableDefaultProperties = (config, isImport) => [
	...defaultProperties.flatMap(
		(prop) => processProperty(prop, config, isImport),
	),
	...customisableProperties.flatMap((createFn) => processProperty(createFn(config), config, isImport),
	),
];
TemplateConstants.supportedPatterns = [
	'model-name',
	'template-code',
	'ticket-number',
];

module.exports = TemplateConstants;
