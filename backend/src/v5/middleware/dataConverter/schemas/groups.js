/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const Rules = require('./components/rules');

const Yup = require('yup');
const { types } = require('../../../utils/helper/yup');

const Group = {};

const objectEntryValidator = Yup.object().shape({
	account: types.strings.username.required(),
	model: types.id.required(),
	shared_ids: Yup.array().of(types.id).min(1).optional(),
	ifc_guids: Yup.array().of(Yup.string().length(22)).min(1).optional(),
}).test(
	'Object item check',
	'Can only contain either ifc_guids or shared_ids',
	(value) => (value.shared_ids && !value.ifc_guids) || (!value.shared_ids && value.ifc_guids),
);

const schema = (group, strict = false) => {
	const rulesOrObjects = group.rules
		? { rules: Rules.schema.required() }
		: { objects: Yup.array().of(objectEntryValidator).min(1).required() };

	const output = Yup.object().shape({
		_id: types.id.required(),
		color: types.colorArr.required(),
		name: types.strings.title,
		author: types.strings.username.required(),
		createdAt: types.timestamp.required(),
		description: types.strings.blob.optional(),
		updatedAt: types.timestamp.optional().default(group.createdAt),
		updatedBy: types.strings.username.optional().default(group.author),
		...rulesOrObjects,

	}).strict(strict).noUnknown()
		.required()
		.test(
			'Group validation',
			'Should contains either rules or objects',
			(value) => (value.rules && !value.objects) || (!value.rules && value.objects),
		);

	return output;
};

Group.validateSchema = (group) => schema(group, true).validate(group);
Group.castSchema = (group) => schema(group).cast(group);

module.exports = Group;
