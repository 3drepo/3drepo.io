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

const { get, post } = require('../../../utils/webRequests');
const { IdentityClient } = require('@frontegg/client');
const { sso: { frontegg: config } } = require('../../../utils/config');
const queryString = require('querystring');
const { toBase64 } = require('../../../utils/helper/strings');

const FrontEgg = {};

const identityClient = new IdentityClient({ FRONTEGG_CLIENT_ID: config.clientId, FRONTEGG_API_KEY: config.key });

const generateVendorToken = async () => {
	const payload = {
		clientId: config.clientId,
		secret: config.key,
	};
	try {
		const { data } = await post(`${config.vendorDomain}/auth/vendor`, payload);
		return data.token;
	} catch (err) {
		throw new Error(`Failed to generate vendor token from FrontEgg: ${err.message}`);
	}
};

FrontEgg.getUserInfoFromToken = async (token) => {
	const { sub: userId, email } = await identityClient.validateIdentityOnToken(token);
	return { userId, email };
};

FrontEgg.getUserById = async (userId) => {
	const token = await generateVendorToken();
	const headers = {
		Authorization: `Bearer ${token}`,
	};

	try {
		const { data } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, headers);
		console.log(data);
		return data;
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from FrontEgg: ${err.message}`);
	}
};

FrontEgg.generateToken = async (urlUsed, code, challenge) => {
	const headers = {
		Authorization: `Basic ${toBase64(`${config.clientId}:${config.key}`)}`,
	};

	const payload = {
		grant_type: 'authorization_code',
		code,
		redirect_uri: urlUsed,
		code_challenge: challenge,
	};

	const { data } = await post(`${config.appUrl}/oauth/token`, payload, { headers });

	return data.access_token;
};

FrontEgg.generateAuthenticationCodeUrl = ({ state, redirectURL, codeChallenge }) => {
	const qsObj = {
		response_type: 'code',
		scope: 'openId',
		client_id: config.appId,
		state,
		redirect_uri: redirectURL,
		code_challenge: codeChallenge,
	};

	return `${config.appUrl}/oauth/authorize?${queryString.encode(qsObj)}`;
};

module.exports = FrontEgg;
