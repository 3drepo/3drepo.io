/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { SYSTEM_ROLES, SYSTEM_ROLES_INIT, ALL_SYSTEM_ADMIN_ROLES } = require(`${v5Path}/utils/permissions/permissions.constants`);
const { createSystemRole } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const run = async () => {
	const serviceRoles = ALL_SYSTEM_ADMIN_ROLES.map(async (role) => {
		logger.logInfo(`Creating service role ${role}`);
		await createSystemRole(role);
	});
	await Promise.all(serviceRoles); // need these to complete before the assignable roles.
	await SYSTEM_ROLES.reduce(async (promise, currentRole) => {
		await promise;
		logger.logInfo(`Creating system role: ${currentRole}`, SYSTEM_ROLES_INIT[currentRole]);
		await createSystemRole(currentRole, SYSTEM_ROLES_INIT[currentRole]);
	}, Promise.resolve());
};

module.exports = run;
