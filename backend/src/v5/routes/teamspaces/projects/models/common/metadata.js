/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { hasReadAccessToContainer, hasReadAccessToFederation } = require('../../../../../middleware/permissions/permissions');
const DbConstants = require('../../../../../handler/db.constants');
const { Router } = require('express');
const { Scene } = require('../../../../../models/scenes');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');

const getAssetsMeta = (modelType) => async (req, res, next) => {
	const { teamspace, project, model, rev } = req.params;
	const { username } = req.session.user;
	const { branch } = rev ? undefined : DbConstants.MASTER_BRANCH_NAME;

	try {
		switch (modelType) {
		case modelTypes.CONTAINER: {
			const obj = await Scene.getContainerMeshInfo(teamspace, model, branch, rev);
			respond(req, res, next, templates.ok, obj);
			break;
		}
		case modelTypes.FEDERATION: {
			const obj = await Scene.getFederationMeshInfo(teamspace, project, model, branch, rev, username);
			respond(req, res, next, templates.ok, obj);
			break;
		}
		default: {
			respond(req, res, createResponseCode(templates.invalidArguments, 'Model type is not Container or Federation'));
			break;
		}
		}
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = (modelType) => {
	const router = Router({ mergeParams: true });

	const hasReadAccessToModel = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.FEDERATION]: hasReadAccessToFederation,
	};

	if (modelType === modelTypes.CONTAINER || modelType === modelTypes.FEDERATION) {
		router.get('/revision/:rev/assetsMeta', hasReadAccessToModel[modelType], getAssetsMeta(modelType));

		router.get('/revision/master/head/assetsMeta', hasReadAccessToModel[modelType], getAssetsMeta(modelType));
	}

	return router;
};

module.exports = establishRoutes();
