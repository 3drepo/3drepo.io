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

const Yup = require('yup');
const { types } = require('../../utils/helper/yup');

const typeNameToType = {
	text: types.strings.title,
	longText: types.strings.longDescription,
	boolean: Yup.boolean(),
	date: Yup.date(),
	number: Yup.number(),
	oneOf: types.strings.title,
	manyOf: Yup.array().of(types.strings.title),
};

const defaultModules = [
	'4D',
	'Shapes',
	'Attachments',
	'Safetibase',
];

const fieldTypes = Object.keys(typeNameToType);

const fieldSchema = Yup.object().shape({
	name: types.strings.title.required(),
	type: Yup.string().oneOf(fieldTypes).required(),
	deprecated: Yup.boolean().default(false),
	required: Yup.boolean().default(false),
	default: Yup.mixed().when('type', ([val]) => typeNameToType[val]),
	values: Yup.mixed().when('type', ([val], schema) => {
		if (val === 'oneOf' || val === 'manyOf') {
			return typeNameToType[val];
		}
		return schema.strip();
	}),

	range: Yup.mixed().when('type', ([val], schema) => {
		if (val === 'number') {
			return Yup.array().of(Yup.number).length(2)
				.test('value range', 'max number cannot be smaller than min', (rangeVal) => rangeVal[1] > rangeVal[2]);
		}
		return schema.strip();
	}),

});

const moduleSchema = Yup.object().shape({
	name: types.strings.title.when('type', ([name], schema) => {
		if (name === undefined) {
			return schema.required();
		}
		return schema
			.test('Name and type', 'only one should be specified', (val) => val === undefined)
			.strip();
	}),
	type: Yup.string().oneOf(defaultModules).when('name', ([name], schema) => {
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
