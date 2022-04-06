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

const { TEAM_MEMBER } = require('./roles.constants');
const db = require('../handler/db');

const Roles = {};

Roles.createTeamspaceRole = async (teamspace) => {
	const createRoleCmd = {
		createRole: TEAM_MEMBER,
		privileges: [],
		roles: [],
	};

	await db.runCommand(teamspace, createRoleCmd);
};

Roles.grantTeamspaceRoleToUser = (teamspace, username) => {
	const grantRoleCmd = {
		grantRolesToUser: username,
		roles: [{ role: TEAM_MEMBER, db: teamspace }],
	};

	return db.runCommand('admin', grantRoleCmd);
};

module.exports = Roles;
