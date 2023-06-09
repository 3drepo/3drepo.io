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
const { isUUIDString } = require('../../utils/helper/typeCheck');
const { schema: rulesSchema } = require('../rules');
const { types } = require('../../utils/helper/yup');

const Groups = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

Groups.schema = (allowIds, fieldsOptional) => {
	let group = Yup.object({
		name: types.strings.title,
		description: types.strings.longDescription,
		rules: Yup.lazy((val) => (val ? rulesSchema : Yup.mixed())),
		objects: Yup.array().of(Yup.object({
			container: Yup.string().test('Container id', 'Container ID must be an UUID string', isUUIDString).required(),
			_ids: Yup.array().of(types.id).min(1).required(),

		})).min(1),
	});

	if (fieldsOptional) {
		group = group.test(
			'Rules and objects', 'Groups cannot contain both objects and rules.',
			({ rules, objects }) => !(rules && objects),
		);
	} else {
		group = group.test(
			'Rules and objects', 'Groups must contain either rules or objects, but not both',
			({ rules, objects }) => (rules || objects) && !(rules && objects));
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
