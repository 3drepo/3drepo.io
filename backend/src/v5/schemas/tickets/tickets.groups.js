/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { UUIDToString, stringToUUID } = require('../../utils/helper/uuids');
const Yup = require('yup');
const { idTypes } = require('../../models/metadata.constants');
const { isUUIDString } = require('../../utils/helper/typeCheck');
const { schema: rulesSchema } = require('../rules');
const { types } = require('../../utils/helper/yup');

const Groups = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

const objectEntryValidator = Yup.object().shape({
	container: Yup.string().test('Container id', 'Container ID must be an UUID string', isUUIDString).required(),
	_ids: Yup.array().of(types.id).min(1),
	[idTypes.IFC]: Yup.array().of(Yup.string().length(22)).min(1),
	[idTypes.REVIT]: Yup.array().of(Yup.number()).min(1),
}).test(
	'Object item check',
	`Can only contain either _ids or ${[idTypes.IFC]} or ${[idTypes.REVIT]}`,
	/* eslint-disable no-underscore-dangle */
	(value) => (value._ids && !(value[idTypes.IFC] || value[idTypes.REVIT]))
	|| (value[idTypes.IFC] && !(value._ids || value[idTypes.REVIT]))
	|| (value[idTypes.REVIT] && !(value._ids || value[idTypes.IFC])));
	/* eslint-enable no-underscore-dangle */

Groups.schema = (allowIds, fieldsOptional) => {
	let group = Yup.object({
		name: types.strings.title,
		description: types.strings.longDescription,
		rules: Yup.lazy((val) => (val ? rulesSchema : Yup.mixed())),
		objects: Yup.array().of(objectEntryValidator).min(1),
	}).test(
		'Rules and objects', 'Groups cannot contain both objects and rules.',
		({ rules, objects }) => !(rules && objects),
	).test(
		'No duplicate containers', 'Objects cannot contain duplicate container Ids.',
		({ objects }) => {
			if (!objects) {
				return true;
			}

			const idSet = new Set();
			return !objects.some((obj) => idSet.size === idSet.add(obj.container).size);
		},
	);

	if (!fieldsOptional) {
		group = group.test(
			'Rules and objects', 'Groups must contain either rules or objects',
			({ rules, objects }) => (rules || objects));
	}

	if (allowIds) return Yup.lazy((val) => (val?.name ? group.required() : types.id.required()));

	return group.required();
};

const uuidObj = Yup.mixed().transform(stringToUUID);

Groups.deserialiseGroupSchema = Yup.object({
	objects: Yup.array().of(Yup.object({
		_ids: Yup.array().of(uuidObj),
	})) });

Groups.deserialiseGroup = (group) => Groups.deserialiseGroupSchema.cast(group);

Groups.serialiseGroup = (group) => {
	const caster = Yup.object({
		_id: uuidString,
		ticket: uuidString,
		objects: Yup.array().of(Yup.object({
			_ids: Yup.array().of(uuidString),
		})),
	});
	return caster.cast(group);
};

module.exports = Groups;
