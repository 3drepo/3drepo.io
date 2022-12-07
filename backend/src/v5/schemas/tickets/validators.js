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

const { propTypes } = require('./templates.constants');
const { types } = require('../../utils/helper/yup');

const Validators = {};

const CameraType = {
	ORTHOGRAPHIC: 'orthographic',
	PERSPECTIVE: 'perspective',
};

const groupIdOrData = types.id; // FIXME
Validators.propTypesToValidator = (propType, isNullable = false) => {
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
	{ const validator = Yup.object().shape({
		screenshot: types.embeddedImage(isNullable),
		state: imposeNullableRule(Yup.object({
			showHiddenObjects: Yup.boolean().default(false),
			highlightedGroups: Yup.array().of(groupIdOrData),
			colorOverrideGroups: Yup.array().of(groupIdOrData),
			hiddenGroups: Yup.array().of(groupIdOrData),
			shownGroups: Yup.array().of(groupIdOrData),
			transformGroups: Yup.array().of(groupIdOrData),
		}).default(undefined)),
		camera: imposeNullableRule(Yup.object({
			type: Yup.string().oneOf([CameraType.PERSPECTIVE, CameraType.ORTHOGRAPHIC])
				.default(CameraType.PERSPECTIVE),
			position: types.position.required(),
			forward: types.position.required(),
			up: types.position.required(),
			size: Yup.number().when('type', (type, schema) => (type === CameraType.ORTHOGRAPHIC ? schema.required() : schema.strip())),
		}).default(undefined)),
		clippingPlanes: imposeNullableRule(Yup.array().of(
			Yup.object().shape({
				normal: types.position.required(),
				distance: Yup.number().required(),
				clipDirection: Yup.number().oneOf([-1, 1]).required(),
			}),
		)).default(undefined),
	}).default(undefined);
	return imposeNullableRule(validator);
	}
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
