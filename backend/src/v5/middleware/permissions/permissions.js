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

const {
	hasAdminAccessToContainer, hasAdminAccessToDrawing, hasAdminAccessToFederation, hasCommenterAccessToContainer,
	hasCommenterAccessToFederation, hasReadAccessToContainer, hasReadAccessToFederation,
	hasWriteAccessToContainer, hasWriteAccessToFederation, hasReadAccessToDrawing, hasWriteAccessToDrawing
} = require('./components/models');
const { isTeamspaceAdmin, isTeamspaceMember } = require('./components/teamspaces');
const { convertAllUUIDs } = require('../dataConverter/pathParams');
const { isProjectAdmin } = require('./components/projects');
const { validSession } = require('../auth');
const { validateMany } = require('../common');

const Permissions = {};

Permissions.hasAccessToTeamspace = validateMany([convertAllUUIDs, validSession, isTeamspaceMember]);
Permissions.isTeamspaceAdmin = validateMany([Permissions.hasAccessToTeamspace, isTeamspaceAdmin]);
Permissions.isAdminToProject = validateMany([Permissions.hasAccessToTeamspace, isProjectAdmin]);

Permissions.hasReadAccessToContainer = validateMany([Permissions.hasAccessToTeamspace, hasReadAccessToContainer]);
Permissions.hasCommenterAccessToContainer = validateMany([
	Permissions.hasAccessToTeamspace, hasCommenterAccessToContainer]);
Permissions.hasWriteAccessToContainer = validateMany([Permissions.hasAccessToTeamspace, hasWriteAccessToContainer]);
Permissions.hasAdminAccessToContainer = validateMany([Permissions.hasAccessToTeamspace, hasAdminAccessToContainer]);

Permissions.hasReadAccessToDrawing = validateMany([Permissions.hasAccessToTeamspace, hasReadAccessToDrawing]);
Permissions.hasWriteAccessToDrawing = validateMany([Permissions.hasAccessToTeamspace, hasWriteAccessToDrawing]);
Permissions.hasAdminAccessToDrawing = validateMany([Permissions.hasAccessToTeamspace, hasAdminAccessToDrawing]);

Permissions.hasReadAccessToFederation = validateMany([Permissions.hasAccessToTeamspace, hasReadAccessToFederation]);
Permissions.hasCommenterAccessToFederation = validateMany([
	Permissions.hasAccessToTeamspace, hasCommenterAccessToFederation]);
Permissions.hasWriteAccessToFederation = validateMany([Permissions.hasAccessToTeamspace, hasWriteAccessToFederation]);
Permissions.hasAdminAccessToFederation = validateMany([Permissions.hasAccessToTeamspace, hasAdminAccessToFederation]);

module.exports = Permissions;
