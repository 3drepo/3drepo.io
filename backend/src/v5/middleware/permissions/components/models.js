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
	hasAdminAccessToContainer,
	hasAdminAccessToDrawing,
	hasAdminAccessToFederation,
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToDrawing,
	hasReadAccessToFederation,
	hasWriteAccessToContainer,
	hasWriteAccessToFederation,
} = require('../../../utils/permissions/permissions');
const { modelTypes } = require('../../../models/modelSettings.constants');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const ModelPerms = {};

const permissionsCheckTemplate = (callback, modelType) => async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace, project } = params;

	const modelParam = {
		[modelTypes.CONTAINER]: req.params.container,
		[modelTypes.FEDERATION]: req.params.federation,
		[modelTypes.DRAWING]: req.params.drawing,
	};

	try {
		if (await callback(teamspace, project, modelParam[modelType], user)) {
			next();
		} else {
			respond(req, res, templates.notAuthorized);
		}
	} catch (err) {
		respond(req, res, err);
	}
};

ModelPerms.hasReadAccessToContainer = permissionsCheckTemplate(hasReadAccessToContainer, modelTypes.CONTAINER);
ModelPerms.hasWriteAccessToContainer = permissionsCheckTemplate(hasWriteAccessToContainer, modelTypes.CONTAINER);
ModelPerms.hasCommenterAccessToContainer = permissionsCheckTemplate(hasCommenterAccessToContainer,
	modelTypes.CONTAINER);
ModelPerms.hasAdminAccessToContainer = permissionsCheckTemplate(hasAdminAccessToContainer, modelTypes.CONTAINER);

ModelPerms.hasReadAccessToDrawing = permissionsCheckTemplate(hasReadAccessToDrawing, modelTypes.DRAWING);
ModelPerms.hasAdminAccessToDrawing = permissionsCheckTemplate(hasAdminAccessToDrawing, modelTypes.DRAWING);

ModelPerms.hasReadAccessToFederation = permissionsCheckTemplate(hasReadAccessToFederation, modelTypes.FEDERATION);
ModelPerms.hasWriteAccessToFederation = permissionsCheckTemplate(hasWriteAccessToFederation, modelTypes.FEDERATION);
ModelPerms.hasCommenterAccessToFederation = permissionsCheckTemplate(hasCommenterAccessToFederation,
	modelTypes.FEDERATION);
ModelPerms.hasAdminAccessToFederation = permissionsCheckTemplate(hasAdminAccessToFederation, modelTypes.FEDERATION);

module.exports = ModelPerms;
