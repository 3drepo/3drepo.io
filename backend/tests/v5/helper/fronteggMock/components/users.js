/**
 *  Copyright (C) 2025 3D Repo Ltd
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
const { src } = require('../../path');

const { generateUUIDString } = require(`${src}/utils/helper/uuids`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

const usersById = {};
const usersByEmail = {};
const Users = {};
Users.getUserById = (userId) => Promise.resolve(usersById[userId]);

Users.doesUserExist = (email) => {
	const user = usersByEmail[email];

	return Promise.resolve(user.id ?? false);
};

Users.createUser = (accountId, email, name) => {
	const data = deleteIfUndefined({
		id: generateUUIDString(),
		email,
		name,
		tenantId: accountId,
	});

	usersById[data.id] = data;
	usersById[data.email] = data;
	return Promise.resolve(data.id);
};
module.exports = Users;
