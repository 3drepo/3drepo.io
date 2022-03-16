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
const { addGroups, getGroups, getGroupsByIds, updateGroup } = require('../../../../../models/groups');
const { UUIDLookUpTable } = require('../../../../../utils/helper/uuids');

const Groups = {};

Groups.getGroups = (teamspace, model, groupsIds = [], includeHidden = false) =>
	(groupsIds.length
		? getGroupsByIds(teamspace, model, groupsIds) : getGroups(teamspace, model, includeHidden));

Groups.importGroups = async (teamspace, model, groups) => {
	const ids = groups.map(({ _id }) =>
		_id);

	const groupsToUpdate = await getGroupsByIds(teamspace, model, ids, { _id: 1 });

	if (groupsToUpdate.length === 0) {
		await addGroups(teamspace, model, groups);
	} else {
	// Some requires update
		const actionPromises = [];

		const updatesLookup = new UUIDLookUpTable(groupsToUpdate.map(({ _id }) =>
			_id));
		const groupsToInsert = [];

		groups.forEach((group) => {
			if (updatesLookup.has(group._id)) {
				actionPromises.push(updateGroup(teamspace, model, group._id, group));
			} else {
				groupsToInsert.push(group);
			}
		});

		if (groupsToInsert.length) actionPromises.push(addGroups(teamspace, model, groupsToInsert));
		await Promise.all(actionPromises);
	}
};

module.exports = Groups;
