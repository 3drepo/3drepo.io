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

const { getBasicHeader, getConfig, getIdentityClient } = require('./connections');
const { deleteIfUndefined } = require('../../../../utils/helper/objects');
const { post } = require('../../../../utils/webRequests');
const queryString = require('querystring');

const Auth = {};

Auth.getUserInfoFromToken = async (token) => {
	try {
		const client = await getIdentityClient();
		const { sub: userId, email, tenantId, tenantIds } = await client.validateIdentityOnToken(token);
		return { userId, email, authAccount: tenantId, accounts: tenantIds };
	} catch (err) {
		throw new Error(`Failed to validate user token: ${err.message}`);
	}
};

Auth.validateToken = async ({ token }, userId) => {
	try {
		const client = await getIdentityClient();
		const { sub } = await client.validateToken(token);
		if (sub !== userId) {
			throw new Error('User ID mismatched');
		}
	} catch (err) {
		throw new Error(`Failed to validate user token: ${err.message}`);
	}
};

Auth.generateAuthenticationCodeUrl = async ({ state, redirectURL, codeChallenge }, accountId) => {
	const config = await getConfig();
	const qsObj = deleteIfUndefined({
		response_type: 'code',
		scope: 'openId',
		client_id: config.appId,
		state,
		redirect_uri: redirectURL,
		code_challenge: codeChallenge,
		tenantId: accountId,
	});

	return `${config.appUrl}/oauth/authorize?${queryString.encode(qsObj)}`;
};

Auth.generateToken = async (urlUsed, code, challenge) => {
	const config = await getConfig();
	const payload = {
		grant_type: 'authorization_code',
		code,
		redirect_uri: urlUsed,
		code_challenge: challenge,
	};

	const { data } = await post(`${config.appUrl}/oauth/token`, payload, { headers: await getBasicHeader() });
	const expiry = new Date(Date.now() + data.expires_in * 1000);

	return { token: data.access_token, refreshToken: data.refresh_token, expiry };
};

module.exports = Auth;
