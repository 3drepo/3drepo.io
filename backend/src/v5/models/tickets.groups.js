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

const GROUPS_COL = 'tickets.groups';

const { deleteMany, find, findOne, insertMany, updateOne } = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../utils/responseCodes');

const Groups = {};

Groups.addGroups = async (teamspace, project, model, ticket, groups) => {
	const data = groups.map((groupData) => ({ ...groupData, teamspace, project, model, ticket }));
	await insertMany(teamspace, GROUPS_COL, data);
};

Groups.deleteGroups = async (teamspace, project, model, ticket, groupIds) => {
	await deleteMany(teamspace, GROUPS_COL, { teamspace, project, model, ticket, _id: { $in: groupIds } });
};

Groups.getGroupsByIds = (teamspace, project, model, ticket, groupIds, projection) => find(
	teamspace, GROUPS_COL, { teamspace, project, model, ticket, _id: { $in: groupIds } }, projection);

Groups.updateGroup = async (teamspace, project, model, ticket, groupId, data, author) => {
	const updates = { $set: data };

	if (data.rules) {
		updates.$unset = { objects: 1 };
	} else if (data.objects) {
		updates.$unset = { rules: 1 };
	}
	await updateOne(
		teamspace, GROUPS_COL, { teamspace, project, model, ticket, _id: groupId }, updates);

	publish(events.UPDATE_TICKET_GROUP, { _id: groupId, teamspace, project, model, ticket, changes: data, author });
};

Groups.getGroupById = async (teamspace, project, model, ticket, groupId,
	projection = { teamspace: 0, project: 0, model: 0, ticket: 0 }) => {
	const group = await findOne(
		teamspace, GROUPS_COL, { teamspace, project, model, ticket, _id: groupId }, projection);

	if (!group) {
		throw templates.groupNotFound;
	}

	return group;
};
module.exports = Groups;
