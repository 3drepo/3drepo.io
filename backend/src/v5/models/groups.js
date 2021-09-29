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

const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const Groups = {};

const findGroup = (teamspace, model, query, projection, sort) => db.find(teamspace, `${model}.groups`, query, projection, sort);

Groups.getGroupsByIds = (teamspace, model, ids, projection) => {
	const query = { _id: { $in: ids } };
	return findGroup(teamspace, model, query, projection);
};

Groups.getGroups = (teamspace, model, includeHidden, projection) => {
	const query = includeHidden
		? {}
		: {
			issue_id: { $exists: false },
			risk_id: { $exists: false },
			sequence_id: { $exists: false },
			view_id: { $exists: false },
		};

	return findGroup(teamspace, model, query, projection);
};

Groups.addGroups = (teamspace, model, groups) => db.insertMany(teamspace, `${model}.groups`, groups);

Groups.updateGroup = async (teamspace, model, _id, action) => {
	const res = await db.updateOne(teamspace, `${model}.groups`, { _id }, { $set: { ...action } });

	if (!res || res.matchedCount === 0) {
		throw templates.groupNotFound;
	}
};

module.exports = Groups;
