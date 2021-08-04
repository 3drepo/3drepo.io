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

const { template, createResponseCode } = ('../utils/responseCodes');

const User = {};

const userQuery = (query, projection, sort) => db.findOne('admin', 'system.users', query, projection, sort);

const getUser = async (user, projection) => {
	const userDoc = await userQuery({ user }, projection);
	if (!userDoc) {
		throw createResponseCode(template.userNotFound);
	}
	return userDoc;
};

User.getAccessibleTeamspaces = async (username) => {
	const userDoc = await getUser(username, { roles: 1 });
	return userDoc.roles.map((role) => role.db);
};

module.exports = User;
