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
const Yup = require('yup');
const { sso: { frontegg } } = require('../../../utils/config');
const queryString = require('querystring');
const { toBase64 } = require('../../../utils/helper/strings');

const Frontegg = {};

let identityClient;
let config;

const getIdentityClient = async () => {
	if (identityClient) return identityClient;

	await Frontegg.init();
	return identityClient;
};

const configSchema = Yup.object({
	appUrl: Yup.string().required(), // https://{appId}.frontegg.com
	appId: Yup.string().required(), // appId from the application created
	clientId: Yup.string().required(), // clientId is the the vendor clientId
	key: Yup.string().required(), // vendor API key
	vendorDomain: Yup.string().required(), // the API server to connect to for vendor API
}).required();

const generateVendorToken = async () => {
	const payload = {
		clientId: config.clientId,
		secret: config.key,
	};
	try {
		const { data } = await post(`${config.vendorDomain}/auth/vendor`, payload);
		return data.token;
	} catch (err) {
		throw new Error(`Failed to generate vendor token from Frontegg: ${err.message}`);
	}
};

const standardHeaders = async () => {
	const token = await generateVendorToken();
	return {
		Authorization: `Bearer ${token}`,
	};
};

Frontegg.init = async () => {
	try {
		config = configSchema.validateSync(frontegg, { stripUnknown: true });
	} catch (err) {
		throw new Error(`Failed to validate Frontegg config: ${err.message}`);
	}

	try {
		identityClient = new IdentityClient({ FRONTEGG_CLIENT_ID: config.clientId, FRONTEGG_API_KEY: config.key });

		// verify the vendor credentials are valid by generating a vendor jwt
		await standardHeaders();
	} catch (err) {
		throw new Error(`Failed to initialise Frontegg client: ${err.message}`);
	}
};

Frontegg.getUserInfoFromToken = async (token) => {
	try {
		const client = await getIdentityClient();
		const { sub: userId, email } = await client.validateIdentityOnToken(token);
		return { userId, email };
	} catch (err) {
		throw new Error(`Failed to validate user token: ${err.message}`);
	}
};

Frontegg.validateAndRefreshToken = async ({ token/* , refreshToken */ }) => {
	try {
		const client = await getIdentityClient();
		const user = await client.validateToken(token);
		/*
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
		*/
		return user;
	} catch (err) {
		throw new Error(`Failed to validate user token: ${err.message}`);
	}
};

Frontegg.getUserById = async (userId) => {
	try {
		const { data } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, await standardHeaders());
		return data;
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from Frontegg: ${err.message}`);
	}
};

Frontegg.generateToken = async (urlUsed, code, challenge) => {
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

	return { token: data.access_token, refreshToken: data.refresh_token, expiry };
};

Frontegg.generateAuthenticationCodeUrl = ({ state, redirectURL, codeChallenge }) => {
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

module.exports = Frontegg;
