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

const { HEADER_APP_ID, HEADER_ENVIRONMENT_ID, HEADER_TENANT_ID, HEADER_USER_ID } = require('../frontegg.constants');
const { delete: deleteReq, get, post, put } = require('../../../../utils/webRequests');
const { getBearerHeader, getConfig } = require('./connections');
const FormData = require('form-data');
const Path = require('path');
const { createReadStream } = require('fs');

const Users = {};

Users.getUserById = async (userId) => {
	try {
		const config = await getConfig();
		const { data } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, await getBearerHeader());
		return data;
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from Users: ${err.message}`);
	}
};

Users.getUserAvatarBuffer = async (userId) => {
	try {
		const { profilePictureUrl } = await Users.getUserById(userId);

		const avatarStream = await fetch(profilePictureUrl);

		const arrayBuffer = await avatarStream.arrayBuffer();

		const avatarBuffer = Buffer.from(arrayBuffer);

		return avatarBuffer;
	} catch (err) {
		throw new Error(`Failed to get avatar for (${userId}) from Users: ${err.message}`);
	}
};

Users.doesUserExist = async (email) => {
	try {
		const config = await getConfig();
		const { data } = await get(`${config.vendorDomain}/identity/resources/users/v1/email?email=${email}`,
			await getBearerHeader());
		return data.id;
	} catch (err) {
		return false;
	}
};

Users.destroyAllSessions = async (userId) => {
	try {
		const config = await getConfig();
		const header = {
			...await getBearerHeader(),
			[HEADER_USER_ID]: userId,

		};
		await deleteReq(`${config.vendorDomain}/identity/resources/users/sessions/v1/me/all`, header);
	} catch (err) {
		throw new Error(`Failed to destroy sessions for user(${userId}): ${err.message}`);
	}
};

Users.triggerPasswordReset = async (email) => {
	const config = await getConfig();
	const url = `${config.vendorDomain}/identity/resources/users/v1/passwords/reset`;
	const headers = {
		...await getBearerHeader(),
		[HEADER_APP_ID]: config.appId,
	};
	await post(url, { email }, { headers });
};

Users.updateUserDetails = async (userId, { firstName, lastName, profilePictureUrl, ...metadata }) => {
	try {
		const config = await getConfig();
		const headers = await getBearerHeader();
		const url = `${config.vendorDomain}/identity/resources/users/v1/${userId}`;

		const regexSplitForName = /\s(.*)/;

		const user = await Users.getUserById(userId);
		const [existingFirstName, existingLastName] = user.name?.split(regexSplitForName) ?? ['Anonymous', 'User'];

		const payload = {
			name: `${firstName || existingFirstName} ${lastName || existingLastName}`.trim(),
			metadata: JSON.stringify(metadata),
			profilePictureUrl: profilePictureUrl || user.profilePictureUrl,
		};

		await put(url, payload, { headers });
	} catch (err) {
		throw new Error(`Failed to update user(${userId}) from Users: ${err.message}`);
	}
};

Users.uploadAvatar = async (userId, path) => {
	try {
		const config = await getConfig();
		const { tenantId } = await Users.getUserById(userId);
		const pathToFile = Path.resolve(path);

		const formData = new FormData();
		formData.append('image', createReadStream(pathToFile));

		const headers = {
			...await getBearerHeader(),
			...formData.getHeaders(),
			[HEADER_ENVIRONMENT_ID]: config.clientId,
			[HEADER_TENANT_ID]: tenantId,
			[HEADER_USER_ID]: userId,
		};
		const url = `${config.vendorDomain}/team/resources/profile/me/image/v1`;

		const { data } = await put(url, formData, { headers });

		await Users.updateUserDetails(userId, { profilePictureUrl: data });
	} catch (err) {
		throw new Error(`Failed to upload avatar for user(${userId}) from Users: ${err.message}`);
	}
};

module.exports = Users;
