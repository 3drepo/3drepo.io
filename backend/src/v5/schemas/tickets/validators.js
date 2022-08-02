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

const { fieldTypes } = require('./templates.constants');
const { types } = require('../../utils/helper/yup');

const Validators = {};

const CameraType = {
	ORTHOGRAPHIC: 'orthographic',
	PERSPECTIVE: 'perspective',
};

const groupIdOrData = types.id; // FIXME
Validators.fieldTypesToValidator = {
	[fieldTypes.TEXT]: types.strings.title,
	[fieldTypes.LONG_TEXT]: types.strings.longDescription,
	[fieldTypes.BOOLEAN]: Yup.boolean(),
	[fieldTypes.DATE]: types.date,
	[fieldTypes.NUMBER]: Yup.number(),
	[fieldTypes.ONE_OF]: types.strings.title,
	[fieldTypes.MANY_OF]: Yup.array().of(types.strings.title),
	[fieldTypes.IMAGE]: types.embeddedImage,
	[fieldTypes.VIEW]: Yup.object().shape({
		screenshot: types.embeddedImage,
		state: {
			showHiddenObjects: Yup.boolean().default(false),
			highlightedGroups: Yup.array().of(groupIdOrData),
			colorOverrideGroups: Yup.array().of(groupIdOrData),
			hiddenGroups: Yup.array().of(groupIdOrData),
			shownGroups: Yup.array().of(groupIdOrData),
			transformGroups: Yup.array().of(groupIdOrData),
		},
		camera: {
			type: Yup.string().oneOf([CameraType.PERSPECTIVE, CameraType.ORTHOGRAPHIC])
				.default(CameraType.ORTHOGRAPHIC),
			position: types.position.required(),
			forward: types.position.required(),
			up: types.position.required(),
			orthographicSize: Yup.number().when('type', (type, schema) => (type === CameraType.ORTHOGRAPHIC ? schema.required() : schema.strip())),

		},
	}),
	[fieldTypes.MEASUREMENTS]: Yup.array().of(
		Yup.object().shape({
			positions: Yup.array().of(types.position).min(2).required(),
			value: Yup.number().required(),
			color: types.colorArr.required(),
			type: Yup.number().min(0).max(1).required(),
			name: types.strings.title.required(),
		}),
	),
	[fieldTypes.SAFETIBASE]: Yup.array().of(types.strings.title), // FIXME
	[fieldTypes.COORDS]: types.position,
};

module.exports = Validators;
