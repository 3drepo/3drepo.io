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
// const { HEADER_TENANT_ID, META_LABEL_TEAMSPACE } = require('./accounts.constants');
const { generateUUIDString } = require('../../../../../utils/helper/uuids');

const Accounts = {};

// const accountByTeamspace = {};
const teamspaceByAccount = {};

Accounts.getTeamspaceByAccount = (accountId) => teamspaceByAccount[accountId];

Accounts.createAccount = (name) => {
	const accountId = generateUUIDString();
	teamspaceByAccount[accountId] = name;
	//	accountsByTeamspace[name] = accountId;

	return Promise.resolve(accountId);
};
/*
Accounts.getAllUsersInAccount = async (accountId) => [];

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
}; */
module.exports = Accounts;
