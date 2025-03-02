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

const { IdentityClient } = require('@frontegg/client');
const Yup = require('yup');
const { sso: { frontegg } } = require('../../../../utils/config');
const { post } = require('../../../../utils/webRequests');
const { toBase64 } = require('../../../../utils/helper/strings');

const Connection = {};

let identityClient;
let config;

const configSchema = Yup.object({
	appUrl: Yup.string().required(), // https://{appId}.frontegg.com
	appId: Yup.string().required(), // appId from the application created
	clientId: Yup.string().required(), // clientId is the the vendor clientId
	key: Yup.string().required(), // vendor API key
	userRole: Yup.string().required(), // Default role an application user is assigned to by default
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

const init = async () => {
	if (identityClient) return;
	try {
		config = configSchema.validateSync(frontegg, { stripUnknown: true });
	} catch (err) {
		throw new Error(`Failed to validate Frontegg config: ${err.message}`);
	}

	try {
		if (!process.env.FRONTEGG_API_GATEWAY_URL) {
			throw new Error('Envar FRONTEGG_API_GATEWAY_URL is not set. This is required (Most likely, it should be the UK DC: https://api.uk.frontegg.com)');
		}
		identityClient = new IdentityClient({ FRONTEGG_CLIENT_ID: config.clientId, FRONTEGG_API_KEY: config.key });

		// verify the vendor credentials are valid by generating a vendor jwt
		// This needs to be called after identityClient is assigned to avoid circular dependency
		await Connection.getBearerHeader();
	} catch (err) {
		throw new Error(`Failed to initialise Frontegg client: ${err.message}`);
	}
};

Connection.getConfig = () => {
	if (!config) {
		throw new Error('Cannot get config before initialising');
	}

	return config;
};

Connection.getBearerHeader = async () => {
	await init();
	const token = await generateVendorToken();
	return {
		Authorization: `Bearer ${token}`,
	};
};

Connection.getBasicHeader = async () => {
	await init();
	return {
		Authorization: `Basic ${toBase64(`${config.clientId}:${config.key}`)}`,
	};
};

Connection.getIdentityClient = async () => {
	if (identityClient) return identityClient;

	await init();
	return identityClient;
};

module.exports = Connection;
