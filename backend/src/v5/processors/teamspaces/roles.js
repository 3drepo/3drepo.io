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

const { DEFAULT_OWNER_ROLE, DEFAULT_ROLES } = require('../../models/roles.constants');

const { createGroup } = require('../../services/sso/frontegg');
const { getTeamspaceRefId } = require('../../models/teamspaceSettings');
const { getUserId } = require('../../models/users');

const Roles = {};

Roles.getRoles = (teamspace, projection) => {};

Roles.createRole = (teamspace, role) => {};

Roles.createDefaultRoles = async (teamspace, firstAdmin) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	const userId = await getUserId(firstAdmin);
	await Promise.all(DEFAULT_ROLES.map(({ name, color }) => createGroup(teamspaceId, name, color,
		name === DEFAULT_OWNER_ROLE ? [userId] : undefined)));
};

Roles.createRoles = (teamspace, roles) => {};

Roles.updateRole = (teamspace, role, updatedRole) => {};

Roles.deleteRole = (teamspace, roleId) => {};

module.exports = Roles;
