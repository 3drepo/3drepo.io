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

const { listDatabases, updateOne, find } = require('../../../../src/v5/handler/db');
const Accounts = require('./components/accounts');
const Auth = require('./components/auth');
const Users = require('./components/users');

const Frontegg = { ...Auth, ...Users, ...Accounts };

Frontegg.init = () => Promise.resolve();

// NOTE: this file cannot import any source code from v4/v5 otherwise the original frontegg service will be used.
const v4ImportUsers = async (teamspaceToAccountId) => {
	const users = await find('admin', 'system.users', { 'customData.email': { $exists: true } },
		{ user: 1, 'customData.email': 1, 'customData.firstName': 1, 'customData.lastName': 1, roles: 1 });
	await Promise.all(users.map(async ({ user, customData: { email, firstName, lastName }, roles }) => {
		const fullName = `${firstName || ''} ${lastName || ''}`.trim();
		let firstTime = true;
		await Promise.all(roles.map(async ({ db, role }) => {
			const accountId = teamspaceToAccountId[db];
			if (role !== 'team_member' || accountId === undefined) {
				return;
			}

			const userId = await Accounts.addUserToAccount(accountId, email, fullName);
			if (firstTime) {
				firstTime = false;
				updateOne('admin', 'system.users', { user }, { $set: { 'customData.userId': userId } });
			}
		}));
	}));
};

const v4ImportTeamspaces = async () => {
	const dbs = await listDatabases();
	const teamspaceToAccountId = {};
	await Promise.all(dbs.map(async ({ name: dbName }) => {
		const refId = await Accounts.createAccount(dbName);
		teamspaceToAccountId[dbName] = refId;
		await updateOne(dbName, 'teamspace', { _id: dbName }, { $set: { refId } });
	}));
	return teamspaceToAccountId;
};

Frontegg.v4Setup = async () => {
	// eslint-disable-next-line no-console
	console.log('setting up data based on existing data from database...');
	const teamspaceToAccountId = await v4ImportTeamspaces();
	await v4ImportUsers(teamspaceToAccountId);
};

module.exports = Frontegg;
