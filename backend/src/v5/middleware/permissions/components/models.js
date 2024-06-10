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
const { MODEL_TYPES } = require('../../../models/modelSettings.constants');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const ModelPerms = {};

const permissionsCheckTemplate = (callback, modelType) => async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace, project } = params;

	let model;
	if (modelType === MODEL_TYPES.federation) {
		model = params.federation;
	} else {
		model = modelType === MODEL_TYPES.drawing ? params.drawing : params.container;
	}

	try {
		if (await callback(teamspace, project, model, user)) {
			next();
		} else {
			respond(req, res, templates.notAuthorized);
		}
	} catch (err) {
		respond(req, res, err);
	}
};

ModelPerms.hasReadAccessToContainer = permissionsCheckTemplate(hasReadAccessToContainer, MODEL_TYPES.container);
ModelPerms.hasWriteAccessToContainer = permissionsCheckTemplate(hasWriteAccessToContainer, MODEL_TYPES.container);
ModelPerms.hasCommenterAccessToContainer = permissionsCheckTemplate(hasCommenterAccessToContainer,
	MODEL_TYPES.container);
ModelPerms.hasAdminAccessToContainer = permissionsCheckTemplate(hasAdminAccessToContainer, MODEL_TYPES.container);

ModelPerms.hasReadAccessToDrawing = permissionsCheckTemplate(hasReadAccessToDrawing, MODEL_TYPES.drawing);
ModelPerms.hasAdminAccessToDrawing = permissionsCheckTemplate(hasAdminAccessToDrawing, MODEL_TYPES.drawing);

ModelPerms.hasReadAccessToFederation = permissionsCheckTemplate(hasReadAccessToFederation, MODEL_TYPES.federation);
ModelPerms.hasWriteAccessToFederation = permissionsCheckTemplate(hasWriteAccessToFederation, MODEL_TYPES.federation);
ModelPerms.hasCommenterAccessToFederation = permissionsCheckTemplate(hasCommenterAccessToFederation,
	MODEL_TYPES.federation);
ModelPerms.hasAdminAccessToFederation = permissionsCheckTemplate(hasAdminAccessToFederation, MODEL_TYPES.federation);

module.exports = ModelPerms;
