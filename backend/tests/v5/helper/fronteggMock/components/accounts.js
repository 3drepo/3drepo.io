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

const Accounts = {};

const teamspaceByAccount = {};
const usersInAccount = {};
const emailToUser = {};

Accounts.getTeamspaceByAccount = (accountId) => teamspaceByAccount[accountId];

Accounts.setMFAPolicy = () => Promise.resolve();

Accounts.getClaimedDomains = () => Promise.resolve([]);

Accounts.createAccount = (name) => {
	const accountId = generateUUIDString();
	teamspaceByAccount[accountId] = name;

	return Promise.resolve(accountId);
};

Accounts.getAllUsersInAccount = (accountId) => Promise.resolve(usersInAccount[accountId] ?? []);

Accounts.addUserToAccount = (accountId, email) => {
	const id = emailToUser[email] ?? generateUUIDString();
	emailToUser[email] = id;
	usersInAccount[accountId] = usersInAccount[accountId] ?? [];
	usersInAccount[accountId].push({ id, email });
	return id;
};

Accounts.getUserStatusInAccount = () => Promise.resolve(membershipStatus.ACTIVE);

Accounts.removeUserFromAccount = (accountId, userId) => {
	usersInAccount[accountId] = usersInAccount[accountId] ?? [];
	usersInAccount[accountId] = usersInAccount[accountId].filter((u) => u.id !== userId);
};

Accounts.removeAccount = (accountId) => {
	delete usersInAccount[accountId];
	delete teamspaceByAccount[accountId];
};
module.exports = Accounts;
