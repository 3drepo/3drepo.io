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
const { propTypes, viewGroups } = require('./templates.constants');
const Yup = require('yup');
const { schema: groupSchema } = require('./tickets.groups');

const Validators = {};

const CameraType = {
	ORTHOGRAPHIC: 'orthographic',
	PERSPECTIVE: 'perspective',
};

Validators.generateViewValidator = (isUpdate, required, isComment) => {
	const imposeNullableRule = (val, optional) => {
		const canBeNull = optional ? isUpdate : isUpdate && !required;
		return canBeNull ? val.nullable() : val;
	};

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
		[viewGroups.COLORED]: generateGroupArraySchema({
			color: types.color3Arr,
			opacity: Yup.number().max(1).test('opacity value', 'Opacity value must be bigger than 0', (val) => val === undefined || val > 0),
		}, (sch) => sch.test('color and opacity', 'Must define a colour or opacity override', ({ color, opacity }) => color || opacity)),
		[viewGroups.HIDDEN]: generateGroupArraySchema(),
		[viewGroups.TRANSFORMED]: generateGroupArraySchema({
			transformation: Yup.array().of(Yup.number()).length(16).required(),
		}),
	}).default(undefined), true);

	const camera = imposeNullableRule(Yup.object({
		type: Yup.string().oneOf([CameraType.PERSPECTIVE, CameraType.ORTHOGRAPHIC])
			.default(CameraType.PERSPECTIVE),
		position: types.position.required(),
		forward: types.position.required(),
		up: types.position.required(),
		size: Yup.number().when('type', (type, schema) => (type === CameraType.ORTHOGRAPHIC ? schema.required() : schema.strip())),
	}).default(undefined), false);

	const clippingPlanes = imposeNullableRule(Yup.array().of(
		Yup.object().shape({
			normal: types.position.required(),
			distance: Yup.number().required(),
			clipDirection: Yup.number().oneOf([-1, 1]).required(),
		}),
	).default(undefined), true);

	let validator = Yup.object({
		state,
		camera: !isUpdate && required ? camera.required() : camera,
		clippingPlanes,
	}).default(undefined);

	if (!isComment) {
		validator = validator.concat(Yup.object({
			screenshot: types.embeddedImage(isUpdate),
		}));
	}

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
		return isUpdate ? Yup.boolean() : Yup.boolean().default(false);
	case propTypes.DATE:
		return imposeNullableRule(types.date);
	case propTypes.PAST_DATE:
		return imposeNullableRule(types.dateInThePast);
	case propTypes.NUMBER:
		return imposeNullableRule(Yup.number());
	case propTypes.ONE_OF:
		return imposeNullableRule(types.strings.title);
	case propTypes.MANY_OF:
		return imposeNullableRule(Yup.array().of(types.strings.title));
	case propTypes.IMAGE:
		return types.embeddedImage(isNullable);
	case propTypes.IMAGE_LIST:
		return imposeNullableRule(Yup.array().of(isUpdate ? types.embeddedImageOrRef() : types.embeddedImage()).min(1));
	case propTypes.VIEW:
		return Validators.generateViewValidator(isUpdate, required);
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
