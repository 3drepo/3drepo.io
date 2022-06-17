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
		const createRoleCmd = { createRole: DEFAULT, privileges: [], roles: [] };
		await db.runCommand(USERS_DB_NAME, createRoleCmd);
	}
};

const addAndAssignDefaultRole = async () => {
	const users = await db.find(USERS_DB_NAME, 'system.users',
		{ 'roles.role': { $ne: DEFAULT } }, { user: 1 });

	const role = { role: DEFAULT, db: USERS_DB_NAME };
	await Promise.all(users.map(async ({ user }) => {
		logger.logInfo(`\t\t-${user}`);
		const grantRoleCmd = { grantRolesToUser: user, roles: [role] };
		await db.runCommand(USERS_DB_NAME, grantRoleCmd);
	}));
};

const run = async () => {
	await createDefaultRole();
	await addAndAssignDefaultRole();
};

module.exports = run;
