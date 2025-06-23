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

const { HEADER_APP_ID, HEADER_TENANT_ID, META_LABEL_TEAMSPACE, membershipStatus, mfaPolicy } = require('../frontegg.constants');
const { deleteIfUndefined, isEmpty } = require('../../../../utils/helper/objects');
const { get, delete: httpDelete, patch, post, put } = require('../../../../utils/webRequests');
const { getBearerHeader, getConfig } = require('./connections');
const { errCodes } = require('../frontegg.constants');
const { generateUUIDString } = require('../../../../utils/helper/uuids');
const { logger } = require('../../../../utils/logger');

const Accounts = {};

Accounts.getTeamspaceByAccount = async (accountId) => {
	try {
		const { vendorDomain } = await getConfig();
		const { data: { metadata } } = await get(`${vendorDomain}/tenants/resources/tenants/v2/${accountId}`, await getBearerHeader());
		const metaJson = JSON.parse(metadata);
		return metaJson[META_LABEL_TEAMSPACE];
	} catch (err) {
		// I've seen frontegg to be in a state where it's giving me account ID that no longer exist, we also
		// could possibly run into a race condition where the account has been deleted since we've got this ID
		// So just return undefined instead of causing trouble elsewhere.
		logger.logError(`Failed to get account(${accountId}) from Accounts: ${err.message}`);
		return undefined;
	}
};

Accounts.setMFAPolicy = async (accountId, policySetting) => {
	try {
		if (!Object.values(mfaPolicy).includes(policySetting)) throw new Error(`Unrecognised policy setting: ${policySetting}`);

		const config = await getConfig();
		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		const payload = {
			enforceMFAType: policySetting,
			allowRememberMyDevice: false,
		};

		await put(`${config.vendorDomain}/identity/resources/configurations/v1/mfa-policy`, payload, { headers });
	} catch (err) {
		logger.logError(`Failed to create account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to create account on Accounts: ${err.message}`);
	}
};

Accounts.createAccount = async (name) => {
	try {
		const config = await getConfig();
		const tenantId = generateUUIDString();

		const headers = await getBearerHeader();
		await post(`${config.vendorDomain}/tenants/resources/tenants/v1`, { tenantId, name }, { headers });

		// add teamspace name as a metadata
		const metadataPayload = {
			metadata: {
				[META_LABEL_TEAMSPACE]: name,
			},
		};

		await Promise.all([
			post(`${config.vendorDomain}/tenants/resources/tenants/v1/${tenantId}/metadata`, metadataPayload, { headers }),
			post(`${config.vendorDomain}/applications/resources/applications/tenant-assignments/v1/${config.appId}`, { tenantId }, { headers }),
			Accounts.setMFAPolicy(tenantId, mfaPolicy.ENABLED),
		]);

		return tenantId;
	} catch (err) {
		logger.logError(`Failed to create account: ${err?.response?.data} `);
		throw new Error(`Failed to create account on Accounts: ${err.message}`);
	}
};

Accounts.addUsersToGroup = async (accountId, groupId, userIds) => {
	if (!userIds?.length) return;
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		const payload = {
			userIds,
		};

		await post(`${config.vendorDomain}/identity/resources/groups/v1/${groupId}/users`, payload, { headers });
	} catch (err) {
		logger.logError(`Failed to add user to group in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to add user to  group in account: ${err.message}`);
	}
};

Accounts.removeUsersFromGroup = async (accountId, groupId, userIds) => {
	if (!userIds?.length) return;
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		const payload = {
			userIds,
		};

		await httpDelete(`${config.vendorDomain}/identity/resources/groups/v1/${groupId}/users`, headers, payload);
	} catch (err) {
		logger.logError(`Failed to remove users from group(${groupId}) in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove users from group in account: ${err.message}`);
	}
};

Accounts.getGroups = async (accountId, getUsers = true) => {
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};
		const { data: { groups } } = await get(`${config.vendorDomain}/identity/resources/groups/v1/${getUsers ? '?_groupsRelations=users' : ''}`, headers);
		return groups;
	} catch (err) {
		logger.logError(`Failed to get groups in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to get groups in account: ${err.message}`);
	}
};

Accounts.getGroupById = async (accountId, groupId, fetchUsers) => {
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};
		const { data } = await get(`${config.vendorDomain}/identity/resources/groups/v1/${groupId}${getUsers ? '?_groupsRelations=users' : ''}`, headers);
		return data;
	} catch (err) {
		logger.logError(`Failed to get group by Id(${groupId}) in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to get group by Id account: ${err.message}`);
	}
};

Accounts.createGroup = async (accountId, name, color, users) => {
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		// add teamspace name as a metadata
		const payload = {
			name,
			color,
		};

		const { data: { id } } = await post(`${config.vendorDomain}/identity/resources/groups/v1`, payload, { headers });

		if (users?.length) {
			await Accounts.addUsersToGroup(accountId, id, users);
		}

		return id;
	} catch (err) {
		logger.logError(`Failed to create group in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to create group in account: ${err.message}`);
	}
};

Accounts.updateGroup = async (accountId, groupId, { name, color }) => {
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		const payload = deleteIfUndefined({ name, color });

		if (!isEmpty(payload)) {
			await patch(`${config.vendorDomain}/identity/resources/groups/v1/${groupId}`, payload, { headers });
		}
	} catch (err) {
		logger.logError(`Failed to update group(${groupId}) in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to update group in account: ${err.message}`);
	}
};

Accounts.removeGroup = async (accountId, groupId) => {
	try {
		const config = await getConfig();

		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		await httpDelete(`${config.vendorDomain}/identity/resources/groups/v1/${groupId}`, headers);
	} catch (err) {
		logger.logError(`Failed to remove group(${groupId}) in account (${accountId}): ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove group in account: ${err.message}`);
	}
};

Accounts.getAllUsersInAccount = async (accountId) => {
	try {
		const config = await getConfig();
		const header = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,

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

			items.forEach(({ id, email, name, createdAt }) => {
				entries.push({ id, email, name, createdAt });
			});
			query = _links.next;
		}

		return entries;
	} catch (err) {
		throw new Error(`Failed to get users from account(${accountId}) from Accounts: ${err.message}`);
	}
};

Accounts.getUserStatusInAccount = async (accountId, userId) => {
	try {
		const config = await getConfig();

		const { data } = await get(`${config.vendorDomain}/identity/resources/tenants/users/v1/statuses?userIds=${userId}`, await getBearerHeader());

		if (!data?.length) return membershipStatus.NOT_MEMBER;

		const tenantStatus = data[0]?.tenantsStatuses?.find(({ tenantId }) => tenantId === accountId);

		if (tenantStatus) {
			switch (tenantStatus.status) {
			case 'PendingInvitation':
				return membershipStatus.PENDING_INVITE;
			case 'PendingLogin':
				return membershipStatus.PENDING_LOGIN;
			case 'Activated':
				return membershipStatus.ACTIVE;
			case 'NotActivated':
				return membershipStatus.INACTIVE;
			default:
				logger.logError(`Unrecognised membership status: ${tenantStatus.status}`);
				return membershipStatus.NOT_MEMBER;
			}
		}

		return membershipStatus.NOT_MEMBER;
	} catch (err) {
		const errCode = err?.response?.data?.errorCode;

		if (errCode === errCodes.USER_NOT_FOUND) {
			return membershipStatus.NOT_MEMBER;
		}
		logger.logError(`Failed to get user status: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to get user status  ${userId}: ${err.message}`);
	}
};

Accounts.addUserToAccount = async (accountId, email, name, emailData) => {
	try {
		const config = await getConfig();
		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
			[HEADER_APP_ID]: config.appId,
		};
		const skipInviteEmail = !emailData;

		let emailMetadata = {};
		if (emailData) {
			const { sender, teamspace } = emailData;
			emailMetadata = { sender, teamspace };
		}

		const payload = {
			email,
			skipInviteEmail,
			name,
			roleIds: [config.userRole],
			emailMetadata,
		};

		const res = await post(`${config.vendorDomain}/identity/resources/users/v2`, payload, { headers });
		return res.data.id;
	} catch (err) {
		const errCode = err?.response?.data?.errorCode;

		if (errCode === errCodes.USER_ALREADY_EXIST) {
			// The user is already in the account it's not really an error
			return undefined;
		}

		logger.logError(`Failed to add user to account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to add user to ${accountId} on Accounts: ${err.message}`);
	}
};

Accounts.getClaimedDomains = async (accountId) => {
	try {
		const config = await getConfig();
		const headers = {
			...await getBearerHeader(),
			[HEADER_TENANT_ID]: accountId,
		};

		const { data } = await get(`${config.vendorDomain}/team/resources/sso/v1/configurations`, headers);
		return data.flatMap(({ enabled, domains }) => {
			if (!enabled) return [];
			return domains.map(({ domain }) => domain);
		});
	} catch (err) {
		logger.logError(`Failed to get claimed domains within an account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to get claimed domains within an account(${accountId}): ${err.message}`);
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
		const errCode = err?.response?.data?.errorCode;

		if (errCode === errCodes.USER_NOT_FOUND) {
			// we're trying to remove a user frontegg doesn't recognise, just treat it as success.
			return;
		}
		logger.logError(`Failed to remove user from account: ${JSON.stringify(err?.response?.data)} `);
		throw new Error(`Failed to remove ${userId} from ${accountId} on Accounts: ${err.message}`);
	}
};

Accounts.removeAccount = async (accountId) => {
	try {
		const config = await getConfig();
		await httpDelete(`${config.vendorDomain}/tenants/resources/tenants/v1/${accountId}`, await getBearerHeader());
	} catch (err) {
		if (err.response.status !== 404) {
			logger.logError(`Failed to remove account: ${JSON.stringify(err?.response?.data)} `);
			throw new Error(`Failed to remove ${accountId} on Accounts: ${err.message}`);
		}
	}
};

module.exports = Accounts;
