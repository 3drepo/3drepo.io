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

const {
	basePropertyLabels,
	getApplicableDefaultProperties,
	presetEnumValues,
	presetModules,
	presetModulesProperties,
	propTypes,
	statusTypes,
	statuses } = require('./templates.constants');

const { isArray, isString } = require('../../utils/helper/typeCheck');
const { types, utils: { stripWhen } } = require('../../utils/helper/yup');
const Yup = require('yup');
const { cloneDeep } = require('../../utils/helper/objects');
const { propTypesToValidator } = require('./validators');
const { uniqueElements } = require('../../utils/helper/arrays');

const TemplateSchema = {};

const defaultFalse = stripWhen(Yup.boolean().default(false), (v) => !v);
const nameSchema = types.strings.title.min(1);
const pinIconSchema = Yup.string().oneOf(['DEFAULT', 'RISK', 'ISSUE', 'MARKER']).default('DEFAULT');

const pinColSchema = Yup.lazy((val) => {
	if (val === undefined) return Yup.mixed().strip();
	if (isArray(val)) return types.color3Arr;

	return Yup.object({
		property: Yup.object({
			name: nameSchema.required(),
			module: nameSchema,
		}),

		mapping: Yup.array().of(Yup.object({
			default: types.color3Arr,
			value: Yup.mixed().when('default', (def, schema) => (def ? schema.strip() : schema.required())),
			color: types.color3Arr.when('default', (def, schema) => (def ? schema.strip() : schema.required())),
		})).test('Color mapping', 'Must contain one default entry', (arr) => arr.filter((obj) => !!obj.default).length === 1),

	});
});

const blackListedChrsRegex = /^(?!\$)(?!.*&&)[^.,[\]":]*$/;

const uniqueTypeBlackList = [
	propTypes.LONG_TEXT,
	propTypes.BOOLEAN,
	propTypes.IMAGE,
	propTypes.IMAGE_LIST,
	propTypes.VIEW,
	propTypes.MEASUREMENTS,
	propTypes.COORDS,
];

const propSchema = Yup.object().shape({
	name: types.strings.title.required().min(1).matches(blackListedChrsRegex),
	type: Yup.string().oneOf(Object.values(propTypes)).required(),
	deprecated: defaultFalse,
	required: defaultFalse,
	immutable: defaultFalse,
	readOnlyOnUI: defaultFalse,
	unique: Yup.lazy((value) => Yup.boolean().strip(!value)
		.when('type', (typeVal, schema) => schema.test('Unique check', `Unique attribute cannot be applied to properties of type: ${uniqueTypeBlackList.join(', ')}`,
			(uniqueVal) => !(uniqueVal && uniqueTypeBlackList.includes(typeVal))))),
	values: Yup.mixed().when('type', (val, schema) => {
		if (val === propTypes.MANY_OF || val === propTypes.ONE_OF) {
			return schema.test('Values check', 'Property values must of be an array of unique values or the name of a preset', (value) => {
				if (value === undefined) return false;
				let typeToCheck;
				if (isString(value)) {
					typeToCheck = Yup.string().oneOf(Object.values(presetEnumValues)).required();
				} else {
					typeToCheck = Yup.array().of(propTypesToValidator(propTypes.ONE_OF)).min(1).required()
						.test('Values check',
							'values must be unique', (vals) => vals.length === uniqueElements(vals).length)
						.strict(true);
				}

				try {
					typeToCheck.validateSync(value);
					return true;
				} catch (err) {
					return false;
				}
			});
		}
		return schema.strip();
	}),
	color: Yup.mixed().when('type', (val, schema) => (val === propTypes.COORDS ? pinColSchema : schema.strip())),
	icon: Yup.mixed().when('type', (val, schema) => (val === propTypes.COORDS ? pinIconSchema : schema.strip())),

	default: Yup.mixed().when(['type', 'values'], (type, values) => {
		const res = propTypesToValidator(type);
		if (type === propTypes.MANY_OF) {
			return res.test('Default values check', 'provided values cannot be duplicated and must be one of the values provided', (defaultValues) => {
				if (defaultValues?.length) {
					const seenValues = new Set();
					return defaultValues.every((val) => {
						const validVal = values.includes(val) && !seenValues.has(val);
						seenValues.add(val);
						return validVal;
					});
				}
				return true;
			});
		}

		if (type === propTypes.ANY_OF) return res.oneOf(values);

		if (type === propTypes.IMAGE || type === propTypes.IMAGE_LIST) return Yup.mixed().strip();

		return res;
	}),

});

const propertyArray = Yup.array().of(propSchema).default([]).test('Property names', 'Property names must be unique inside the same context', (arr) => {
	const propNames = new Set();
	let res = true;
	arr.forEach(({ name }) => {
		if (propNames.has(name)) {
			res = false;
		} else {
			propNames.add(name);
		}
	});

	return res;
});

const moduleSchema = Yup.object().shape({
	name: types.strings.title.notOneOf(Object.values(presetModules)).matches(blackListedChrsRegex),
	type: Yup.string().oneOf(Object.values(presetModules)),
	deprecated: defaultFalse,
	properties: propertyArray.when('type', (type, schema) => {
		if (type) {
			const propertiesToCheck = presetModulesProperties[type];
			return schema.test((val, context) => {
				for (const { name } of val) {
					if (propertiesToCheck.find(({ name: usedName }) => name === usedName)) {
						return context.createError({ message: `Property "${name}" has the same name as a default property.` });
					}
				}
				return true;
			});
		}

		return schema;
	}),
}).test('Name and type', 'Only provide a name or a type for a module, not both',
	({ name, type }) => (name && !type) || (!name && type));

const customStatus = Yup.object({
	name: Yup.string().min(1).max(15).required(),
	type: Yup.string().oneOf(Object.values(statusTypes)).required(),
});

const configSchema = Yup.object().shape({
	// If new configs are added, please ensure we add it to the e2e test case
	comments: defaultFalse,
	issueProperties: defaultFalse,
	attachments: defaultFalse,
	defaultView: defaultFalse,
	defaultImage: Yup.boolean().when('defaultView', (defaultView, schema) => (defaultView ? schema.strip() : defaultFalse)),
	pin: Yup.lazy((val) => (val?.color || val?.icon
		? Yup.object({ color: pinColSchema, icon: pinIconSchema })
		: defaultFalse)),
	status: Yup.object({
		values: Yup.array().of(customStatus).min(1).required()
			.test('Custom status', 'values must be unique', (vals) => uniqueElements(vals.map(({ name }) => name)).length === vals.length),
		default: Yup.mixed().when('values', (values) => (values ? Yup.string().oneOf(values.map(({ name }) => name)).required() : Yup.mixed())),
	}).default(undefined),
	tabular: Yup.object({
		columns: Yup.array().of(Yup.object({
			property: Yup.string().required(),
			module: Yup.string().notRequired().default(undefined),
		}),
		).min(1).required(),
	}).default(undefined),
}).default({});

const pinMappingTest = (val, context) => {
	const template = TemplateSchema.generateFullSchema(val);
	const activeProperties = new Set();
	const activeCondPins = [];

	const prependPrefix = (prefix, name) => `${prefix ? `${prefix}.` : ''}${name}`;

	const collectProperties = (props, prefix = '') => {
		props.forEach((entry) => {
			if (!entry.deprecated) {
				if (entry.type === propTypes.COORDS && entry?.color?.property) {
					activeCondPins.push({ name: prependPrefix(prefix, entry.name), property: entry.color.property });
				}

				activeProperties.add(prependPrefix(prefix, entry.name));
			}
		});
	};

	collectProperties(template.properties);
	template.modules.forEach(({ name, type, deprecated, properties }) => {
		if (!deprecated) {
			collectProperties(properties, name ?? type);
		}
	});

	const badPins = activeCondPins.flatMap(({ name, property }) => {
		const prop = prependPrefix(property.module, property.name);

		return (activeProperties.has(prop)) ? [] : name;
	});

	if (badPins.length) return context.createError({ message: `The following COORDS properties have conditional mapping referencing a deprecated/invalid property: ${badPins.join(',')}` });

	return true;
};

const validTabularPropsTest = (val, context) => {
	const basePropertiesNotToCheck = ['modules', 'properties', 'config'];

	const template = TemplateSchema.generateFullSchema(val);

	if (!template.config?.tabular?.columns) return true;

	for (const column of template.config.tabular.columns) {
		const propCollection = column.module
			? template.modules.find(
				({ type, name }) => type === column.module || name === column.module)?.properties
			// create the full list of properties to check against
			: [
				Object.keys(template)
					.map((key) => {
						if (!basePropertiesNotToCheck.includes(key)) return { name: key };
						return null;
					})
					.filter((object) => object !== null),
				template.properties,
			].flat();

		const prop = propCollection
			? propCollection.find(({ name }) => name === column.property)
			: undefined;

		const propPath = column.module ? `${column.module}.${column.property}` : column.property;

		if (!prop) {
			return context.createError({ message: `Property "${propPath}" could not be found in the template` });
		} if (prop.deprecated) {
			return context.createError({ message: `Property "${propPath}" has been deprecated` });
		}
	}

	return true;
};

const schema = Yup.object().shape({
	name: nameSchema.required(),
	code: Yup.string().length(3).required(),
	config: configSchema,
	deprecated: defaultFalse,
	properties: propertyArray.test('No name clash', 'Cannot have the same name as a default property',
		(val) => val.every(({ name }) => !Object.values(basePropertyLabels).includes(name))),
	modules: Yup.array().default([]).of(moduleSchema).test((arr, context) => {
		const modNames = new Set();
		for (const { name, type } of arr) {
			const id = (name || type).toUpperCase();
			if (modNames.has(id)) {
				return context.createError({ message: `Module "${id}" has been defined multiple times.` });
			}
			modNames.add(id);
		}

		return true;
	}),
}).test(pinMappingTest)
	.test(validTabularPropsTest)
	.noUnknown();

TemplateSchema.getClosedStatuses = (template) => {
	if (template?.config?.status) {
		return template.config.status.values.flatMap(
			({ type, name }) => (type === statusTypes.DONE || type === statusTypes.VOID
				? name : []));
	}

	return [statuses.CLOSED, statuses.VOID];
};

TemplateSchema.validate = (template) => schema.validateSync(template, { stripUnknown: true });

TemplateSchema.generateFullSchema = (template, isImport = false) => {
	const result = cloneDeep(template);
	result.properties = [...getApplicableDefaultProperties(template.config, isImport), ...result.properties];
	result.modules.forEach((module) => {
		if (module.type && presetModulesProperties[module.type]) {
			// eslint-disable-next-line no-param-reassign
			module.properties = [...presetModulesProperties[module.type], ...module.properties];
		}
	});

	return result;
};

module.exports = TemplateSchema;
