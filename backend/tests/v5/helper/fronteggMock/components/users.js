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

const newAvatar = 'newAvatarUrl';

const { src } = require('../../path');

const { splitName } = require(`${src}/utils/helper/strings`);

const UsersCache = require('./cache');

const Users = {};
Users.getUserById = (userId) => Promise.resolve(UsersCache.getUserById(userId));

Users.getAccountsByUser = async (userId) => {
	const userData = await Users.getUserById(userId);
	if (userData === null) {
		throw new Error(`Failed to get user(${userId}) from Users: User not found`);
	}

	return userData.tenantIds;
};

Users.getUserAvatarBuffer = (userId) => {
	const { profilePictureUrl } = UsersCache.getUserById(userId);
	return Promise.resolve(Buffer.from(profilePictureUrl || newAvatar));
};

Users.doesUserExist = (email) => Promise.resolve(UsersCache.doesUserExist(email));

Users.destroyAllSessions = () => Promise.resolve();

Users.triggerPasswordReset = process.env.NODE_ENV === 'testV5' ? jest.fn() : (() => {});

Users.uploadAvatar = (userId) => Promise.resolve(UsersCache.updateUserById(userId, { profilePictureUrl: newAvatar }));

Users.updateUserDetails = async (userId, { firstName, lastName, profilePictureUrl, ...metadata }) => {
	const user = await Users.getUserById(userId);

	const [existingFirstName, existingLastName] = await splitName(user.name);

	const newMetadata = { ...JSON.parse(user.metadata || '{}'), ...metadata };

	const newPayload = {
		name: `${firstName || existingFirstName} ${lastName || existingLastName}`.trim(),
		metadata: newMetadata,
		profilePictureUrl: profilePictureUrl || user.profilePictureUrl,
	};

	return Promise.resolve(UsersCache.updateUserById(userId, newPayload));
};

module.exports = Users;
