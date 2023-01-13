/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { v5Path } = require('../../../interop');

const { find, listDatabases, updateMany, updateOne } = require(`${v5Path}/handler/db`);
const { ADD_ONS } = require(`${v5Path}/models/teamspaces.constants`);
const { USERS_DB_NAME } = require(`${v5Path}/models/users.constants`);
const { deleteIfUndefined } = require(`${v5Path}/utils/helper/objects`);
const { logger } = require(`${v5Path}/utils/logger`);

const addOnFields = Object.values(ADD_ONS);

const migrateTeamspaceData = async (user, customData) => {
	const { addOns, billing: { subscriptions }, permissions, ...flags } = customData;
	const tsSettingsUpdate = deleteIfUndefined({
		subscriptions,
		permissions,
	});

	// addOns
	if (addOns) {
		tsSettingsUpdate.addOns = { ...addOns, ...flags };
	}

	if (Object.keys(tsSettingsUpdate).length > 0) {
		try {
			await updateOne(user, 'teamspace', {}, { $set: tsSettingsUpdate });
			return user;
		} catch (err) {
			logger.logError(`\t-Update teamspace settings for ${user} unsuccessful: ${err}`);
		}
	}

	return undefined;
};

const run = async () => {
	const oldFields = {
		'customData.permissions': 1,
		'customData.billing.subscriptions': 1,
		'customData.addOns': 1,
	};
	addOnFields.forEach((addOn) => {
		oldFields[`customData.${addOn}`] = 1;
	});

	const query = { $or: Object.keys(oldFields).map((key) => ({ [key]: { $exists: true } })) };

	const dbs = (await listDatabases()).map(({ name }) => name);

	const users = await find(
		USERS_DB_NAME,
		'system.users',
		query,
		{ _id: 0, user: 1, ...oldFields },
	);

	// Sort users into those with/without a database
	const [usersWithDb, usersWithoutDb] = users.reduce(([hasDb, noDb], user) => (dbs.includes(user.user)
		? [[...hasDb, user], noDb] : [hasDb, [...noDb, user]]), [[], []]);

	logger.logError(`-Preparing to migrate the following users: ${usersWithDb.map((user) => user.user)}`);
	const updatedUsers = await Promise.all(usersWithDb.map(({ user, customData }) => migrateTeamspaceData(user,
		customData)));

	const usersToCleanUp = [...usersWithoutDb.map(({ user }) => user), ...updatedUsers.filter((user) => user)];
	logger.logError(`-Cleaning up the following users: ${usersToCleanUp}`);

	await updateMany(USERS_DB_NAME, 'system.users', { user: { $in: usersToCleanUp }, ...query }, { $unset: oldFields });
};

module.exports = run;
