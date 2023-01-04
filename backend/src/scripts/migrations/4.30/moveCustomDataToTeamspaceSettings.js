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

const { find, updateMany, updateOne } = require(`${v5Path}/handler/db`);
const { ADD_ONS } = require(`${v5Path}/models/teamspaces.constants`);
const { USERS_DB_NAME } = require(`${v5Path}/models/users.constants`);
const { logger } = require(`${v5Path}/utils/logger`);

const flags = Object.values(ADD_ONS);

const run = async () => {
	const oldFields = {
		'customData.permissions': 1,
		'customData.billing.subscriptions': 1,
		'customData.addOns': 1,
	};
	flags.map((f) => {
		oldFields[`customData.${f}`] = 1;
		return f;
	});

	const failedUsers = [];
	const query = { $or: [
		{'customData.permissions': { $exists: true }},
		{'customData.billing.subscriptions': { $exists: true }},
		{'customData.addOns': { $exists: true }},
		...flags.map((f) => ({ [`customData.${f}`]: { $exists: true } })),
	] };

	const users = await find(
		USERS_DB_NAME,
		'system.users',
		query,
		{ _id: 0, user: 1, ...oldFields },
	);

	await Promise.all(users.map(({ user, customData: { addOns, billing: { subscriptions }, permissions, ...flags } }) => {
		logger.logInfo(`\t\t-${user}`);
		const tsSettingsUpdate = {};

		// addOns
		if (addOns) {
			logger.logInfo('\t\t\t-addOns');
			tsSettingsUpdate.addOns = { ...addOns, ...flags };
		}

		// subscriptions
		if (subscriptions) {
			logger.logInfo('\t\t\t-subscriptions');
			tsSettingsUpdate.subscriptions = subscriptions;
		}

		// permissions
		if (permissions) {
			logger.logInfo('\t\t\t-permissions');
			tsSettingsUpdate.permissions = permissions;
		}

		return Object.keys(tsSettingsUpdate).length > 0 && updateOne(user, 'teamspace', {}, { $set: tsSettingsUpdate }).catch((err) => {
			logger.logError(`\t\t\t-Update teamspace settings for ${user} unsuccessful`);
			failedUsers.push(user);
		});
	}));

	await updateMany(USERS_DB_NAME, 'system.users', { user: { $not: { $in: failedUsers } }, ...query }, { $unset: oldFields });
};

module.exports = run;
