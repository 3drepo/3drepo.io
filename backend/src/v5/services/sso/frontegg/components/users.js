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
const { delete: deleteReq, get, getArrayBuffer, post, put } = require('../../../../utils/webRequests');
const { generateKey, getCached } = require('./cacheService');
const { getBearerHeader, getConfig } = require('./connections');
const { getURLDomain, splitName } = require('../../../../utils/helper/strings');
const FormData = require('form-data');
const { Readable } = require('stream');

const { purgeCacheWithKeyContaining } = require('../../../../models/frontegg.cache');

const Users = {};

const contextLabels = {
	userById: 'userById',
	accountsByUser: 'accountsByUser',
	userAvatarBuffer: 'userAvatarBuffer',
};

Users.getUserById = (userId) => getCached(generateKey({ userId, context: contextLabels.userById }), async () => {
	try {
		const config = await getConfig();
		const { data: { metadata, ...others } } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, await getBearerHeader());
		const details = JSON.parse(metadata || '{}');
		// keep a copy of the metadata at the top level for easier access
		return { ...details, ...others, metadata: details };
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from Users: ${err.message}`);
	}
});

Users.getAccountsByUser = (userId) => getCached(generateKey(
	{ userId, context: contextLabels.accountsByUser }), async () => {
	const { tenantIds, tenantId } = await Users.getUserById(userId);
	return tenantIds ?? [tenantId];
});

Users.getUserAvatarBuffer = (userId) => getCached(
	generateKey({ userId, context: contextLabels.userAvatarBuffer }), async () => {
		try {
			const { profilePictureUrl } = await Users.getUserById(userId);
			if (!getURLDomain(profilePictureUrl).includes('frontegg')) {
			// this is not an generated avatar, so we should not try to fetch it
				return null;
			}

			const { data } = await getArrayBuffer(profilePictureUrl);
			return Buffer.from(data);
		} catch (err) {
			throw new Error(`Failed to get avatar for (${userId}) from Users: ${err.message}`);
		}
	});

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

		const existingDetails = await Users.getUserById(userId);
		const [existingFirstName, existingLastName] = splitName(existingDetails.name);

		const newMetadata = { ...existingDetails.metadata, ...metadata };

		const payload = {
			name: `${firstName || existingFirstName} ${lastName || existingLastName}`.trim(),
			metadata: JSON.stringify(newMetadata),
			profilePictureUrl: profilePictureUrl || existingDetails.profilePictureUrl,
		};

		await put(url, payload, { headers });
		await purgeCacheWithKeyContaining(generateKey({ userId }));
	} catch (err) {
		throw new Error(`Failed to update user(${userId}) from Users: ${err.message}`);
	}
};

Users.uploadAvatar = async (userId, fileObj) => {
	try {
		const config = await getConfig();
		const { tenantId } = await Users.getUserById(userId);

		const formData = new FormData();
		formData.append('image', Readable.from(fileObj.buffer),
			{ filename: fileObj.originalname, contentType: fileObj.mimetype });

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
