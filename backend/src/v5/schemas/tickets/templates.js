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

const { fieldTypes, presetModules } = require('./templates.constants');
const Yup = require('yup');
const { types } = require('../../utils/helper/yup');

const typeNameToType = {
	[fieldTypes.TEXT]: types.strings.title,
	[fieldTypes.LONG_TEXT]: types.strings.longDescription,
	[fieldTypes.BOOLEAN]: Yup.boolean(),
	[fieldTypes.DATE]: Yup.date(),
	[fieldTypes.NUMBER]: Yup.number(),
	[fieldTypes.ONE_OF]: types.strings.title,
	[fieldTypes.MANY_OF]: Yup.array().of(types.strings.title),
};

const fieldSchema = Yup.object().shape({
	name: types.strings.title.required(),
	type: Yup.string().oneOf(Object.values(fieldTypes)).required(),
	deprecated: Yup.boolean().default(false),
	required: Yup.boolean().default(false),
	values: Yup.mixed().when('type', (val, schema) => {
		if (val === fieldTypes.MANY_OF || val === fieldTypes.ANY_OF) {
			return typeNameToType[val];
		}
		return schema.strip();
	}),

	range: Yup.mixed().when('type', (val, schema) => {
		if (val === fieldTypes.NUMBER) {
			return Yup.array().of(typeNameToType[val]).length(2)
				.test('value range', 'max number cannot be smaller than min', (rangeVal) => rangeVal === undefined || rangeVal[0] < rangeVal[1]);
		}
		return schema.test('value range', 'is not supported for types other than number', (value) => value === undefined);
	}),
	default: Yup.mixed().when(['type', 'range'], (type, range) => {
		const sch = typeNameToType[type];
		if (range?.length === 2) {
			return sch.min(range[0]).max(range[1]);
		}
		return sch;
	}),

});

const moduleSchema = Yup.object().shape({
	name: types.strings.title.when('type', (name, schema) => {
		if (name === undefined) {
			return schema.required();
		}
		return schema
			.test('Name and type', 'only one should be specified', (val) => val === undefined)
			.strip();
	}),
	type: Yup.string().oneOf(Object.values(presetModules)).when('name', ([name], schema) => {
		if (name === undefined) {
			return schema.required();
		}
		return schema
			.test('Name and type', 'only one should be specified', (val) => val === undefined)
			.strip();
	}),
	deprecated: Yup.boolean().default(false),
	properties: Yup.array().of(fieldSchema),
}, ['name', 'type']);

const schema = Yup.object().shape({
	name: types.strings.title.required(),
	comments: Yup.boolean().required().default(true),
	deprecated: Yup.boolean().default(false),
	properties: Yup.array().of(fieldSchema),
	modules: Yup.array().of(moduleSchema),

}).noUnknown();

const TemplateSchema = {};

TemplateSchema.validate = (template) => schema.validateSync(template, { stripUnknown: true });

module.exports = TemplateSchema;
