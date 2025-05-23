/**
 *  Copyright (C) 2017 3D Repo Ltd
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

"use strict";

const {v5Path} = require("../../interop");
const {addTeamspaceMember, removeTeamspaceMember} = require(`${v5Path}/processors/teamspaces`);

const Role = {};

Role.grantTeamSpaceRoleToUser = async function (username, account, invitedBy) {
	return addTeamspaceMember(account, username, invitedBy);
};

Role.revokeTeamSpaceRoleFromUser = async function(username, account) {
	return removeTeamspaceMember(account, username);
};

module.exports = Role;
