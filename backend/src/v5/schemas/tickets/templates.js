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
const { types, utils: { stripWhen } } = require('../../utils/helper/yup');
const Yup = require('yup');

const typeNameToType = {
	[fieldTypes.TEXT]: types.strings.title,
	[fieldTypes.LONG_TEXT]: types.strings.longDescription,
	[fieldTypes.BOOLEAN]: Yup.boolean(),
	[fieldTypes.DATE]: types.date,
	[fieldTypes.NUMBER]: Yup.number(),
	[fieldTypes.ONE_OF]: types.strings.title,
	[fieldTypes.MANY_OF]: Yup.array().of(types.strings.title),
};

const defaultFalse = stripWhen(Yup.boolean().default(false), (v) => !v);

const fieldSchema = Yup.object().shape({
	name: types.strings.title.required(),
	type: Yup.string().oneOf(Object.values(fieldTypes)).required(),
	deprecated: defaultFalse,
	required: defaultFalse,
	values: Yup.mixed().when('type', (val, schema) => {
		if (val === fieldTypes.MANY_OF || val === fieldTypes.ANY_OF) {
			return typeNameToType[val];
		}
		return schema.strip();
	}),

	default: Yup.mixed().when(['type'], (type) => typeNameToType[type]),

});

const moduleSchema = Yup.object().shape({
	name: types.strings.title,
	type: Yup.string().oneOf(Object.values(presetModules)),
	deprecated: defaultFalse,
	properties: Yup.array().of(fieldSchema),
}).test('Name and type', 'Only provide a name or a type for module, not both', ({ name, type }) => {
	console.log(name, type);
	return (name && !type) || (!name && type);
});

const schema = Yup.object().shape({
	name: types.strings.title.required(),
	comments: defaultFalse,
	deprecated: defaultFalse,
	properties: Yup.array().of(fieldSchema),
	modules: Yup.array().of(moduleSchema),

}).noUnknown();

const TemplateSchema = {};

TemplateSchema.validate = (template) => schema.validateSync(template, { stripUnknown: true });

module.exports = TemplateSchema;
