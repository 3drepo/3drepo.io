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
	checkModelExists,
	hasAdminAccessToContainer,
	hasAdminAccessToDrawing,
	hasAdminAccessToFederation,
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToDrawing,
	hasReadAccessToFederation,
	hasWriteAccessToContainer,
	hasWriteAccessToDrawing,
	hasWriteAccessToFederation,
} = require('../../../utils/permissions');
const { BYPASS_AUTH } = require('../../../utils/config.constants');
const { getUserFromSession } = require('../../../utils/sessions');
const { modelTypes } = require('../../../models/modelSettings.constants');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const ModelPerms = {};

const permissionsCheckTemplate = (type, callback) => async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace, project, model } = params;

	try {
		const modelInProject = await checkModelExists(teamspace, project, model, type);
		if (!modelInProject) {
			throw templates.modelNotFound;
		}
		if (req.app.get(BYPASS_AUTH) || await callback(teamspace, project, model, user, true)) {
			next();
		} else {
			respond(req, res, templates.notAuthorized);
		}
	} catch (err) {
		respond(req, res, err);
	}
};

ModelPerms.hasReadAccessToContainer = permissionsCheckTemplate(modelTypes.CONTAINER, hasReadAccessToContainer);
ModelPerms.hasWriteAccessToContainer = permissionsCheckTemplate(modelTypes.CONTAINER, hasWriteAccessToContainer);
ModelPerms.hasCommenterAccessToContainer = permissionsCheckTemplate(
	modelTypes.CONTAINER, hasCommenterAccessToContainer);
ModelPerms.hasAdminAccessToContainer = permissionsCheckTemplate(modelTypes.CONTAINER, hasAdminAccessToContainer);

ModelPerms.hasReadAccessToDrawing = permissionsCheckTemplate(modelTypes.DRAWING, hasReadAccessToDrawing);
ModelPerms.hasWriteAccessToDrawing = permissionsCheckTemplate(modelTypes.DRAWING, hasWriteAccessToDrawing);
ModelPerms.hasAdminAccessToDrawing = permissionsCheckTemplate(modelTypes.DRAWING, hasAdminAccessToDrawing);

ModelPerms.hasReadAccessToFederation = permissionsCheckTemplate(modelTypes.FEDERATION, hasReadAccessToFederation);
ModelPerms.hasWriteAccessToFederation = permissionsCheckTemplate(modelTypes.FEDERATION, hasWriteAccessToFederation);
ModelPerms.hasCommenterAccessToFederation = permissionsCheckTemplate(
	modelTypes.FEDERATION, hasCommenterAccessToFederation);
ModelPerms.hasAdminAccessToFederation = permissionsCheckTemplate(modelTypes.FEDERATION, hasAdminAccessToFederation);

module.exports = ModelPerms;
