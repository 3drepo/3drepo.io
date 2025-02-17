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
const { META_LABEL_TEAMSPACE } = require('./frontegg.constants');
const { generateUUIDString } = require('../../../utils/helper/uuids');
const { logger } = require('../../../utils/logger');
const { sso: { frontegg: config } } = require('../../../utils/config');
const queryString = require('querystring');
const { toBase64 } = require('../../../utils/helper/strings');

const Frontegg = {};

const identityClient = config ? new IdentityClient({ FRONTEGG_CLIENT_ID: config.clientId, FRONTEGG_API_KEY: config.key }) : null;

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

Frontegg.getUserInfoFromToken = async (token) => {
	try {
		const { sub: userId, email, tenantId, tenantIds } = await identityClient.validateIdentityOnToken(token);
		return { userId, email, authAccount: tenantId, accounts: tenantIds };
	} catch (err) {
		console.log('!!!', err, token);
	}
};

Frontegg.validateAndRefreshToken = async ({ token, refreshToken }) => {
	try {
		const user = await identityClient.validateToken(token);
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
		 * */
		return user;
	} catch (err) {
		console.log('???', err);
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

Frontegg.getTeamspaceByAccount = async (accountId) => {
	try {
		const { data: { metadata } } = await get(`${config.vendorDomain}/tenants/resources/tenants/v2/${accountId}`, await standardHeaders());
		const metaJson = JSON.parse(metadata);
		return metaJson[META_LABEL_TEAMSPACE];
	} catch (err) {
		throw new Error(`Failed to get account(${accountId}) from Frontegg: ${err.message}`);
	}
};

Frontegg.createAccount = async (name) => {
	try {
		const payload = {
			tenantId: generateUUIDString(),
			name,
		};

		const headers = await standardHeaders();
		await post(`${config.vendorDomain}/tenants/resources/tenants/v1`, payload, { headers });

		// add teamspace name as a metadata
		const metadataPayload = {
			metadata: {
				[META_LABEL_TEAMSPACE]: name,
			},
		};

		await post(`${config.vendorDomain}/tenants/resources/tenants/v1/${payload.tenantId}/metadata`, metadataPayload, { headers });

		return payload.tenantId;
	} catch (err) {
		logger.logError(`Failed to create account: ${err?.response?.data} `);
		throw new Error(`Failed to create account on Frontegg: ${err.message}`);
	}
};

Frontegg.addUserToAccount = async (accountId, userId) => {
	try {
		const payload = {
			tenantId: accountId,
			validateTenantExist: true,
			skipInviteEmail: false,
		};
		await post(`${config.vendorDomain}/identity/resources/users/v1/${userId}/tenant`, payload, { headers: await standardHeaders() });
	} catch (err) {
		logger.logError(`Failed to add user to account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to add ${userId} to ${account} on Frontegg: ${err.message}`);
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
