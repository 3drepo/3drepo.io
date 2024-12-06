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
const { respond, writeCustomStreamRespond } = require('../../../../../utils/responder');
const DbConstants = require('../../../../../handler/db.constants');
const JSONAssets = require('../../../../../models/jsonAssets');
const { Router } = require('express');
const config = require('../../../../../utils/config');
const { modelTypes } = require('../../../../../models/modelSettings.constants');

const getHeaders = (cache = false) => {
	const headers = {};
	if (cache) {
		headers['Cache-Control'] = `private, max-age=${config.cachePolicy.maxAge}`;
	}
	return headers;
};

const getAssetMaps = (modelType) => async (req, res) => {
	const { teamspace, model, revision } = req.params;
	const branch = revision ? undefined : DbConstants.MASTER_BRANCH_NAME;

	try {
		switch (modelType) {
		case modelTypes.CONTAINER: {
			const { readStream } = await JSONAssets.getAllSuperMeshMappingForContainer(
				teamspace, model, branch, revision);
			const headers = getHeaders(revision);
			const mimeType = 'application/json';
			writeCustomStreamRespond(req, res, templates.ok, readStream, undefined, { mimeType }, headers);
			break;
		}
		case modelTypes.FEDERATION: {
			const { readStream } = await JSONAssets.getAllSuperMeshMappingForFederation(
				teamspace, model, branch, revision);
			const mimeType = 'application/json';
			writeCustomStreamRespond(req, res, templates.ok, readStream, undefined, { mimeType });
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

	if (modelType === modelTypes.CONTAINER) {
		router.get('/revision/:revision', hasReadAccessToModel[modelType], getAssetMaps(modelType));
	}

	if (modelType === modelTypes.CONTAINER || modelType === modelTypes.FEDERATION) {
		router.get('/revision/master/head', hasReadAccessToModel[modelType], getAssetMaps(modelType));
	}

	return router;
};

module.exports = establishRoutes;
