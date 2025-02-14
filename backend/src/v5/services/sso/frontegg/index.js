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
const { generateUUIDString } = require('../../../utils/helper/uuids');
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

const standardHeaders = async () => {
	const token = await generateVendorToken();
	return {
		Authorization: `Bearer ${token}`,
	};
};

FrontEgg.getUserInfoFromToken = async (token) => {
	try {
		const { sub: userId, email } = await identityClient.validateIdentityOnToken(token);
		return { userId, email };
	} catch (err) {
		console.log('!!!', err, token);
	}
};

FrontEgg.validateAndRefreshToken = async ({ token, refreshToken }) => {
	try {
		const user = await identityClient.validateToken(token);

		const payload = {
		};
		const headers = {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'frontegg-vendor-host': 'https://www.3drepo.local',
			Cookie: `fe_refresh_${config.clientId.replace('-', '')}=${refreshToken};`,

		};

		try {
			const { data } = await post(`${config.vendorDomain}/identity/resources/auth/v1/user/token/refresh`, payload, { headers });
		} catch (err) {
			console.log('Failed: ', err);
		}

		return user;
	} catch (err) {
		console.log('???', err);
	}
};

FrontEgg.getUserById = async (userId) => {
	try {
		const { data } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, await standardHeaders());
		return data;
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from FrontEgg: ${err.message}`);
	}
};

FrontEgg.createAccount = async (name) => {
	try {
		const payload = {
			tenantId: generateUUIDString(),
			name,
		};
		await post(`${config.vendorDomain}/tenants/resources/tenants/v1`, payload, { headers: await standardHeaders() });
		return payload.tenantId;
	} catch (err) {
		console.log(err.response.data);
		throw new Error(`Failed to create account on FrontEgg: ${err.message}`);
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
	const expiry = new Date(Date.now() + data.expires_in * 1000);

	console.log(data);
	return { token: data.access_token, refreshToken: data.refresh_token, expiry };
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
