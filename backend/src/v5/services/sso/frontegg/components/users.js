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

const { delete: deleteReq, get, post } = require('../../../../utils/webRequests');
const { getBearerHeader, getConfig } = require('./connections');
const { HEADER_USER_ID } = require('../frontegg.constants');

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
	await post(url, { email }, { headers: await getBearerHeader() });
};

module.exports = Users;
