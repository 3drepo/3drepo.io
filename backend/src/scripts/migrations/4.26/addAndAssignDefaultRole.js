/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { USERS_DB_NAME } = require('../../../v5/models/users.constants');

const db = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { DEFAULT } = require(`${v5Path}/models/roles.constants`);

const createDefaultRole = async () => {
	const roleFound = await db.findOne(USERS_DB_NAME, 'system.roles', { _id: `admin.${DEFAULT}` });

	if (!roleFound) {
		await db.createRole(USERS_DB_NAME, DEFAULT);
	}
};

const addAndAssignDefaultRole = async () => {
	const users = await db.find(USERS_DB_NAME, 'system.users',
		{ 'roles.role': { $ne: DEFAULT } }, { user: 1 });

	await Promise.all(users.map(async ({ user }) => {
		logger.logInfo(`\t\t-${user}`);
		await db.grantRole(USERS_DB_NAME, DEFAULT, user);
	}));
};

const run = async () => {
	await createDefaultRole();
	await addAndAssignDefaultRole();
};

module.exports = run;
