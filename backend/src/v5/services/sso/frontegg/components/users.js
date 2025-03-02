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

const { get, post } = require('../../../../utils/webRequests');
const { getBearerHeader, getConfig } = require('./connections');
const { deleteIfUndefined } = require('../../../../utils/helper/objects');

const Users = {};

Users.getUserById = async (userId) => {
	try {
		const config = getConfig();
		const { data } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, await getBearerHeader());
		return data;
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from Users: ${err.message}`);
	}
};

Users.createUser = async (accountId, email, name, userData, privateUserData, bypassVerification = false) => {
	try {
		const config = getConfig();
		const payload = deleteIfUndefined({
			email,
			name,
			tenantId: accountId,
			metadata: userData,
			vendorMetadata: privateUserData,
			roleIds: [config.userRole],

		});

		// using the migration endpoint will automatically activate the user
		const url = bypassVerification
			? `${config.vendorDomain}/identity/resources/migrations/v1/local`
			: `${config.vendorDomain}/identity/resources/vendor-only/users/v1`;
		const { data } = await post(url, payload, { headers: await getBearerHeader() });

		return data.id;
	} catch (err) {
		throw new Error(`Failed to create user(${email}) on Users: ${err.message}`);
	}
};

module.exports = Users;
