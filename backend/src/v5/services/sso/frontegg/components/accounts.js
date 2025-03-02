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

const { HEADER_TENANT_ID, META_LABEL_TEAMSPACE } = require('./accounts.constants');
const { get, delete: httpDelete, post } = require('../../../../utils/webRequests');
const { getBearerHeader, getConfig } = require('./connections');
const { generateUUIDString } = require('../../../../utils/helper/uuids');
const { logger } = require('../../../../utils/logger');

const Accounts = {};

Accounts.getTeamspaceByAccount = async (accountId) => {
	try {
		const config = await getConfig();
		const { data: { metadata } } = await get(`${config.vendorDomain}/tenants/resources/tenants/v2/${accountId}`, await getBearerHeader());
		const metaJson = JSON.parse(metadata);
		return metaJson[META_LABEL_TEAMSPACE];
	} catch (err) {
		throw new Error(`Failed to get account(${accountId}) from Accounts: ${err.message}`);
	}
};

Accounts.createAccount = async (name) => {
	try {
		const config = await getConfig();
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

		const applicationPayload = {
			tenantId: payload.tenantId,
		};

		await Promise.all([
			post(`${config.vendorDomain}/tenants/resources/tenants/v1/${payload.tenantId}/metadata`, metadataPayload, { headers }),
			post(`${config.vendorDomain}/applications/resources/applications/tenant-assignments/v1/${config.appId}`, applicationPayload, { headers }),
		]);

		return payload.tenantId;
	} catch (err) {
		logger.logError(`Failed to create account: ${err?.response?.data} `);
		throw new Error(`Failed to create account on Accounts: ${err.message}`);
	}
};

Accounts.getAllUsersInAccount = async (accountId) => {
	try {
		const config = await getConfig();
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
		throw new Error(`Failed to get users from account(${accountId}) from Accounts: ${err.message}`);
	}
};

Accounts.addUserToAccount = async (accountId, userId, sendInvite = true) => {
	try {
		const config = await getConfig();
		const payload = {
			tenantId: accountId,
			validateTenantExist: true,
			skipInviteEmail: !sendInvite,
		};
		await post(`${config.vendorDomain}/identity/resources/users/v1/${userId}/tenant`, payload, { headers: await getBearerHeader() });
	} catch (err) {
		logger.logError(`Failed to add user to account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to add ${userId} to ${accountId} on Accounts: ${err.message}`);
	}
};

Accounts.removeUserFromAccount = async (accountId, userId) => {
	try {
		const config = await getConfig();
		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		await httpDelete(`${config.vendorDomain}/identity/resources/users/v1/${userId}`, headers);
	} catch (err) {
		logger.logError(`Failed to remove user from account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove ${userId} from ${accountId} on Accounts: ${err.message}`);
	}
};

Accounts.removeAccount = async (accountId) => {
	try {
		const config = await getConfig();
		await httpDelete(`${config.vendorDomain}/tenants/resources/tenants/v1/${accountId}`, await getBearerHeader());
	} catch (err) {
		logger.logError(`Failed to remove account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove ${accountId} on Accounts: ${err.message}`);
	}
};

module.exports = Accounts;
