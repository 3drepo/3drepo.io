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

const { UUIDToString } = require('../../utils/helper/uuids');
const Yup = require('yup');

const Groups = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

Groups.serialiseGroup = (group) => {
	const caster = Yup.object({
		_id: uuidString,
		objects: Yup.array().of(Yup.object({
			_ids: Yup.array().of(uuidString),
		})),
	});
	return caster.cast(group);
};

module.exports = Groups;
