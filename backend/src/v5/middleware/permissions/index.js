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

const { convertAllUUIDs, getModelIdFromParam } = require('../dataConverter/pathParams');
const {
	hasAdminAccessToContainer, hasAdminAccessToDrawing, hasAdminAccessToFederation, hasCommenterAccessToContainer,
	hasCommenterAccessToFederation, hasReadAccessToContainer, hasReadAccessToDrawing,
	hasReadAccessToFederation, hasWriteAccessToContainer, hasWriteAccessToDrawing, hasWriteAccessToFederation,
} = require('./components/models');
const { isActiveTeamspaceMember, isTeamspaceAdmin, isTeamspaceMember } = require('./components/teamspaces');
const { BYPASS_AUTH } = require('../../utils/config.constants');
const { isProjectAdmin } = require('./components/projects');
const { modelTypes } = require('../../models/modelSettings.constants');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');
const { validSession } = require('../auth');
const { validateMany } = require('../common');

const Permissions = {};

const isCookieAuthenticatedAgainstTS = async (req, res, next) => {
	try {
		if (req.app.get(BYPASS_AUTH) || req.session.user.isAPIKey) {
			await next();
		} else {
			const authenticatedTeamspace = req.session.user.auth?.authenticatedTeamspace;
			if (authenticatedTeamspace === req.params.teamspace) {
				await next();
			} else {
				throw templates.notAuthenticatedAgainstTeamspace;
			}
		}
	} catch (err) {
		respond(req, res, err);
	}
};

// Use this one when you don't care if the user is authenticated against the teamspace and whether
// their membership is active
Permissions.isMemberOfTeamspace = validateMany([convertAllUUIDs, validSession, isTeamspaceMember]);
// Use this one when you don't care if the user is authenticated against the teamspace but membership has to be active
Permissions.isActiveMemberOfTeamspace = validateMany([convertAllUUIDs, validSession, isActiveTeamspaceMember]);
// Use this one when you want to make sure the user session is authenticated against the teamspace
Permissions.hasAccessToTeamspace = validateMany([
	Permissions.isMemberOfTeamspace, isCookieAuthenticatedAgainstTS]);

Permissions.isTeamspaceAdmin = validateMany([Permissions.hasAccessToTeamspace, isTeamspaceAdmin]);
Permissions.isAdminToProject = validateMany([Permissions.hasAccessToTeamspace, isProjectAdmin]);

Permissions.hasReadAccessToContainer = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.CONTAINER), hasReadAccessToContainer]);
Permissions.hasCommenterAccessToContainer = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.CONTAINER), hasCommenterAccessToContainer]);
Permissions.hasWriteAccessToContainer = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.CONTAINER), hasWriteAccessToContainer]);
Permissions.hasAdminAccessToContainer = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.CONTAINER), hasAdminAccessToContainer]);

Permissions.hasReadAccessToDrawing = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.DRAWING), hasReadAccessToDrawing]);
Permissions.hasWriteAccessToDrawing = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.DRAWING), hasWriteAccessToDrawing]);
Permissions.hasAdminAccessToDrawing = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.DRAWING), hasAdminAccessToDrawing]);

Permissions.hasReadAccessToFederation = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.FEDERATION), hasReadAccessToFederation]);
Permissions.hasCommenterAccessToFederation = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.FEDERATION), hasCommenterAccessToFederation]);
Permissions.hasWriteAccessToFederation = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.FEDERATION), hasWriteAccessToFederation]);
Permissions.hasAdminAccessToFederation = validateMany([Permissions.hasAccessToTeamspace,
	getModelIdFromParam(modelTypes.FEDERATION), hasAdminAccessToFederation]);

module.exports = Permissions;
