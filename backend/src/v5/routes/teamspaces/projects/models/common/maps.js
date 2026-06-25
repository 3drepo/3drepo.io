/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { hasReadAccessToContainer, hasReadAccessToFederation } = require('../../../../../middleware/permissions');
const Maps = require('../../../../../processors/teamspaces/projects/models/commons/maps');
const MimeTypes = require('../../../../../utils/helper/mimeTypes');
const { Router } = require('express');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { validateMapRequest } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/maps');

const getListOfMaps = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const maps = await Maps.getListOfMaps(teamspace);
		respond(req, res, templates.ok, { maps });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getTile = async (req, res) => {
	try {
		const { mapProvider, mapType } = req.params;

		const { zoomLevel, x, y } = req.query;
		const tileData = await Maps.getTile(mapProvider, mapType, zoomLevel, x, y);

		respond(req, res, templates.ok, tileData, { mimeType: MimeTypes.PNG, cache: true });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (modelType) => {
	const router = Router({ mergeParams: true });

	const hasReadAccess = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.FEDERATION]: hasReadAccessToFederation,
	};

	router.get('/', hasReadAccess[modelType], getListOfMaps);

	router.get('/:mapProvider/:mapType/tiles', hasReadAccess[modelType], validateMapRequest, getTile);

	return router;
};

module.exports = establishRoutes;
