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

const { src } = require('../../path');

const { generateUUIDString } = require(`${src}/utils/helper/uuids`);
const { membershipStatus } = require(`${src}/services/sso/frontegg/frontegg.constants`);
const { findOne } = require(`${src}/handler/db`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const Cache = require('./cache');

const Accounts = {};
Accounts.getTeamspaceByAccount = (accountId) => Cache.getTeamspaceByAccount(accountId);

Accounts.setMFAPolicy = () => Promise.resolve();

Accounts.getClaimedDomains = () => Promise.resolve([]);

Accounts.createAccount = (name) => {
	const accountId = generateUUIDString();

	return Promise.resolve(Cache.addAccount(accountId, name));
};

Accounts.getAllUsersInAccount = (accountId) => Promise.resolve(Cache.getAllUsersInAccount(accountId));

Accounts.addUserToAccount = async (accountId, email) => {
	const { customData: { userId } } = await findOne('admin', 'system.users', { 'customData.email': email });
	const id = Cache.doesUserExist(email) ? Cache.doesUserExist(email) : userId;

	Cache.addUserToAccount(accountId, { id, email });
	Cache.updateUserByEmail(email, { id, tenantId: accountId });
	Cache.updateUserById(id, { email, tenantId: accountId });

	return id;
};

Accounts.getUserStatusInAccount = () => Promise.resolve(membershipStatus.ACTIVE);

Accounts.removeUserFromAccount = (accountId, userId) => Cache.removeUserFromAccount(accountId, userId);

Accounts.removeAccount = (accountId) => {
	Cache.removeAccount(accountId);
	Cache.removeAllUsersFromAccount(accountId);
};
module.exports = Accounts;
