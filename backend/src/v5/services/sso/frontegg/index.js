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

const { HEADER_TENANT_ID, META_LABEL_TEAMSPACE } = require('./frontegg.constants');
const { get, delete: httpDelete, post } = require('../../../utils/webRequests');
const { IdentityClient } = require('@frontegg/client');
const Yup = require('yup');
const { deleteIfUndefined } = require('../../../utils/helper/objects');
const { generateUUIDString } = require('../../../utils/helper/uuids');
const { logger } = require('../../../utils/logger');
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

const getBearerHeader = async () => {
	await Frontegg.init();
	const token = await generateVendorToken();
	return {
		Authorization: `Bearer ${token}`,
	};
};

const basicHeader = async () => {
	await Frontegg.init();
	return {
		Authorization: `Basic ${toBase64(`${config.clientId}:${config.key}`)}`,
	};
};

Frontegg.init = async () => {
	if (identityClient) return;
	try {
		config = configSchema.validateSync(frontegg, { stripUnknown: true });
	} catch (err) {
		throw new Error(`Failed to validate Frontegg config: ${err.message}`);
	}

	try {
		identityClient = new IdentityClient({ FRONTEGG_CLIENT_ID: config.clientId, FRONTEGG_API_KEY: config.key });

		// verify the vendor credentials are valid by generating a vendor jwt
		// This needs to be called after identityClient is assigned to avoid circular dependency
		await getBearerHeader();
	} catch (err) {
		throw new Error(`Failed to initialise Frontegg client: ${err.message}`);
	}
};

Frontegg.getUserInfoFromToken = async (token) => {
	try {
		const client = await getIdentityClient();
		const { sub: userId, email, tenantId, tenantIds } = await client.validateIdentityOnToken(token);
		return { userId, email, authAccount: tenantId, accounts: tenantIds };
	} catch (err) {
		throw new Error(`Failed to validate user token: ${err.message}`);
	}
};

Frontegg.validateToken = async ({ token }, userId) => {
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

Frontegg.getUserById = async (userId) => {
	try {
		const { data } = await get(`${config.vendorDomain}/identity/resources/vendor-only/users/v1/${userId}`, await getBearerHeader());
		return data;
	} catch (err) {
		throw new Error(`Failed to get user(${userId}) from Frontegg: ${err.message}`);
	}
};

Frontegg.createUser = async (accountId, email, name, userData, privateUserData, bypassVerification = false) => {
	try {
		const payload = deleteIfUndefined({
			email,
			name,
			tenantId: accountId,
			metadata: userData,
			vendorMetadata: privateUserData,
			roleIds: ['APP_USER'],

		});

		// using the migration endpoint will automatically activate the user
		const url = bypassVerification ? `${config.vendorDomain}/identity/resources/migrations/v1/local` : `${config.vendorDomain}/identity/resources/vendor-only/users/v1`;
		const { data } = await post(url, payload, { headers: await getBearerHeader() });
		return data.id;
	} catch (err) {
		throw new Error(`Failed to create user(${email}) on Frontegg: ${err.message}`);
	}
};

Frontegg.getTeamspaceByAccount = async (accountId) => {
	try {
		const { data: { metadata } } = await get(`${config.vendorDomain}/tenants/resources/tenants/v2/${accountId}`, await getBearerHeader());
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

		const headers = await getBearerHeader();
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

Frontegg.getAllUsersInAccount = async (accountId) => {
	try {
		const header = {
			...await getBearerHeader(),
			'frontegg-tenant-id': accountId,

		};

		const initialQuery = {
			_limit: 200,
			_offset: 0,
			_sortBy: 'email',
			_order: 'ASC',
		};

		let query = new URLSearchParams(initialQuery).toString();
		const entries = [];

		while (query?.length) {
			// eslint-disable-next-line no-await-in-loop
			const { data: { items, _links } } = await get(`${config.vendorDomain}/identity/resources/users/v3?${query}`,
				header);

			items.forEach(({ id, email }) => {
				entries.push({ id, email });
			});

			query = _links.next;
		}

		return entries;
	} catch (err) {
		throw new Error(`Failed to get users from account(${accountId}) from Frontegg: ${err.message}`);
	}
};

Frontegg.addUserToAccount = async (accountId, userId, sendInvite = true) => {
	try {
		const payload = {
			tenantId: accountId,
			validateTenantExist: true,
			skipInviteEmail: !sendInvite,
		};
		await post(`${config.vendorDomain}/identity/resources/users/v1/${userId}/tenant`, payload, { headers: await getBearerHeader() });
	} catch (err) {
		logger.logError(`Failed to add user to account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to add ${userId} to ${accountId} on Frontegg: ${err.message}`);
	}
};

Frontegg.removeUserFromAccount = async (accountId, userId) => {
	try {
		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		await httpDelete(`${config.vendorDomain}/identity/resources/users/v1/${userId}`, headers);
	} catch (err) {
		logger.logError(`Failed to remove user from account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove ${userId} from ${accountId} on Frontegg: ${err.message}`);
	}
};

Frontegg.removeAccount = async (accountId) => {
	try {
		await httpDelete(`${config.vendorDomain}/tenants/resources/tenants/v1/${accountId}`, await getBearerHeader());
	} catch (err) {
		logger.logError(`Failed to remove account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove ${accountId} on Frontegg: ${err.message}`);
	}
};

Frontegg.generateToken = async (urlUsed, code, challenge) => {
	const payload = {
		grant_type: 'authorization_code',
		code,
		redirect_uri: urlUsed,
		code_challenge: challenge,
	};

	const { data } = await post(`${config.appUrl}/oauth/token`, payload, { headers: await basicHeader() });
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
