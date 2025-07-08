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

const { onlineAvatarPath, newAvatarPath } = require('../../path');

const usersById = {};
const usersByEmail = {};
const Users = {};
Users.getUserById = (userId) => Promise.resolve({
	...usersById[userId],
	profilePictureUrl: onlineAvatarPath,
});

Users.doesUserExist = (email) => {
	const user = usersByEmail[email];

	return Promise.resolve(user.id ?? false);
};

Users.destroyAllSessions = () => Promise.resolve();

Users.triggerPasswordReset = process.env.NODE_ENV === 'testV5' ? jest.fn() : (() => {});

Users.uploadAvatar = (userId, tenantId, formDataPayload) => Promise.resolve({ profilePictureUrl: newAvatarPath });

Users.updateUserDetails = (userId, payload) => {
	console.dir(usersById, { depth: 2 });
	console.dir(userId);
	console.dir(payload);

	usersById[userId] = {
		...usersById[userId],
		...payload,
	};
	return Promise.resolve(userId);
};

module.exports = Users;
