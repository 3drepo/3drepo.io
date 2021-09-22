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

const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');

const Groups = {};

const serialiseGroup = (group) => {
	const output = {
		...group,
		_id: UUIDToString(group._id),
	};

	if (output.objects.length) {
		output.objects.forEach((objEntry) => {
			if (objEntry.shared_ids) {
				// eslint-disable-next-line no-param-reassign
				objEntry.shared_ids = objEntry.shared_ids.map(UUIDToString);
			}
		});
	}
	return output;
};

Groups.serialiseGroupArray = (req, res) => {
	const groups = req.outputData.map(serialiseGroup);

	respond(req, res, templates.ok, { groups });
};

module.exports = Groups;
