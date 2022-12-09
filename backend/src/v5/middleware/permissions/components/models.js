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
	hasAdminAccessToFederation,
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
	hasWriteAccessToContainer,
	hasWriteAccessToFederation,
} = require('../../../utils/permissions/permissions');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const ModelPerms = {};

const permissionsCheckTemplate = (callback, isFed = false, name) => async (req, res, next) => {
	console.log(`_+_+_+_+_+_+_+ permissionsCheckTemplate ${name} _+_+_+_+_+_+_`);
	console.log("callback");
	console.log(callback);
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace, project } = params;
	const model = isFed ? params.federation : params.container;

	console.log("session");
	console.log(session);
	console.log("params");
	console.log(params);
	console.log("user");
	console.log(user);
	console.log("teamspace");
	console.log(teamspace);
	console.log("project");
	console.log(project);
	console.log("model");
	console.log(model);
	try {
		if (await callback(teamspace, project, model, user)) {
			next();
		} else {
			console.log("--------------- WE ARE IN src/v5/middleware/permissions/components/models.js --------------------");
			respond(req, res, templates.notAuthorized);
		}
	} catch (err) {
		respond(req, res, err);
	}
};

ModelPerms.hasReadAccessToContainer = permissionsCheckTemplate(hasReadAccessToContainer, false, "hasReadAccessToContainer");
ModelPerms.hasWriteAccessToContainer = permissionsCheckTemplate(hasWriteAccessToContainer, false, "hasWriteAccessToContainer");
ModelPerms.hasCommenterAccessToContainer = permissionsCheckTemplate(hasCommenterAccessToContainer, false, "hasCommenterAccessToContainer");
ModelPerms.hasAdminAccessToContainer = permissionsCheckTemplate(hasAdminAccessToContainer, false, "hasAdminAccessToContainer");

ModelPerms.hasReadAccessToFederation = permissionsCheckTemplate(hasReadAccessToFederation, true, "hasReadAccessToFederation");
ModelPerms.hasWriteAccessToFederation = permissionsCheckTemplate(hasWriteAccessToFederation, true, "hasWriteAccessToFederation");
ModelPerms.hasCommenterAccessToFederation = permissionsCheckTemplate(hasCommenterAccessToFederation, true, "hasCommenterAccessToFederation");
ModelPerms.hasAdminAccessToFederation = permissionsCheckTemplate(hasAdminAccessToFederation, true, "hasAdminAccessToFederation");

module.exports = ModelPerms;
