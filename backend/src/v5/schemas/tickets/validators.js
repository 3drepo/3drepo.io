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

const { utils: { stripWhen }, types } = require('../../utils/helper/yup');
const Yup = require('yup');
const { isUUIDString } = require('../../utils/helper/typeCheck');
const { propTypes } = require('./templates.constants');
const { schema: rulesSchema } = require('../rules');

const Validators = {};

const CameraType = {
	ORTHOGRAPHIC: 'orthographic',
	PERSPECTIVE: 'perspective',
};

const groupSchema = (allowIds) => {
	const group = Yup.object({
		name: types.strings.title,
		description: types.strings.longDescription,
		rules: Yup.lazy((val) => (val ? rulesSchema : Yup.mixed())),
		objects: Yup.array().of(Yup.object({
			container: Yup.string().test('Container id', 'Container ID must be an UUID string', isUUIDString).required(),
			_ids: Yup.array().of(types.id).min(1).required(),

		})).min(1),
	}).test(('Rules and objects', 'Groups must contain either rules or objects, but not both', ({ rules, objects }) => (rules || objects) && !(rules && objects)));

	if (allowIds) return Yup.lazy((val) => (val?.name ? group.required() : types.id.required()));

	return group.required();
};

const generateViewValidator = (isUpdate, isNullable) => {
	const imposeNullableRule = (val) => (isNullable ? val.nullable() : val);

	const generateGroupArraySchema = (extraFields, testCB = (v) => v) => {
		const arrSchema = Yup.array().of(testCB(Yup.object({
			...extraFields,
			group: groupSchema(isUpdate),
			prefix: stripWhen(Yup.array().of(types.strings.title), (value) => !value?.length),
		})));

		return stripWhen(imposeNullableRule(arrSchema), (value) => value !== null && !value?.length);
	};

	const state = imposeNullableRule(Yup.object({
		showHidden: Yup.boolean().default(false),
		colored: generateGroupArraySchema({
			color: types.color3Arr,
			opacity: Yup.number().max(1).test('opacity value', 'Opacity value must be bigger than 0', (val) => val === undefined || val > 0),
		}, (sch) => sch.test('color and opacity', 'Must define a colour or opacity override', ({ color, opacity }) => color || opacity)),
		hidden: generateGroupArraySchema(),
		transformed: generateGroupArraySchema({
			transformation: Yup.array().of(Yup.number()).length(16).required(),
		}),
	}).default(undefined));

	const camera = imposeNullableRule(Yup.object({
		type: Yup.string().oneOf([CameraType.PERSPECTIVE, CameraType.ORTHOGRAPHIC])
			.default(CameraType.PERSPECTIVE),
		position: types.position.required(),
		forward: types.position.required(),
		up: types.position.required(),
		size: Yup.number().when('type', (type, schema) => (type === CameraType.ORTHOGRAPHIC ? schema.required() : schema.strip())),
	}).default(undefined));

	const clippingPlanes = imposeNullableRule(Yup.array().of(
		Yup.object().shape({
			normal: types.position.required(),
			distance: Yup.number().required(),
			clipDirection: Yup.number().oneOf([-1, 1]).required(),
		}),
	)).default(undefined);

	const validator = Yup.object().shape({
		screenshot: types.embeddedImage(isNullable),
		state,
		camera,
		clippingPlanes,
	}).default(undefined);

	return imposeNullableRule(validator);
};

Validators.propTypesToValidator = (propType, isUpdate, required) => {
	const isNullable = isUpdate && !required;
	const imposeNullableRule = (val) => (isNullable ? val.nullable() : val);
	switch (propType) {
	case propTypes.TEXT:
		return imposeNullableRule(types.strings.title);
	case propTypes.LONG_TEXT:
		return imposeNullableRule(types.strings.longDescription);
	case propTypes.BOOLEAN:
		return Yup.boolean().default(false);
	case propTypes.DATE:
		return imposeNullableRule(types.date);
	case propTypes.NUMBER:
		return imposeNullableRule(Yup.number());
	case propTypes.ONE_OF:
		return imposeNullableRule(types.strings.title);
	case propTypes.MANY_OF:
		return imposeNullableRule(Yup.array().of(types.strings.title));
	case propTypes.IMAGE:
		return types.embeddedImage(isNullable);
	case propTypes.VIEW:
		return generateViewValidator(isUpdate, isNullable);
	case propTypes.MEASUREMENTS:
		return imposeNullableRule(Yup.array().of(
			Yup.object().shape({
				positions: Yup.array().of(types.position).min(2).required(),
				value: Yup.number().required(),
				color: types.colorArr.required(),
				type: Yup.number().min(0).max(1).required(),
				name: types.strings.title.required(),
			}),
		));
	case propTypes.COORDS:
		return imposeNullableRule(types.position);
	default:
		return undefined;
	}
};

module.exports = Validators;
