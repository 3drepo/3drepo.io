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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { ADD_ONS } = require('../../../../../../../models/teamspaces.constants');
const HereService = require('../../../../../../../services/maps/here');
const OSMService = require('../../../../../../../services/maps/osm');
const config = require('../../../../../../../utils/config');
const { isAddOnEnabled } = require('../../../../../../../models/teamspaceSettings');
const { logger } = require('../../../../../../../utils/logger');
const { mapProviders } = require('../../../../../../../services/maps/maps.constants');
const { respond } = require('../../../../../../../utils/responder');
const yup = require('yup');

const Maps = {};

const mapServicesByProvider = {
	[mapProviders.HERE]: HereService,
	[mapProviders.OSM]: OSMService,
};

const mapsCoordinatesSchema = yup.object({
	zoomLevel: yup.number().integer().min(0).required(),
	x: yup.number().integer().min(0).required(),
	y: yup.number().integer().min(0).required(),
}).required();

const validateMapAccess = async (teamspace, mapProvider, mapType) => {
	if (!Object.values(mapProviders).includes(mapProvider)) {
		throw createResponseCode(templates.invalidArguments, `Unknown map provider: ${mapProvider}`);
	}

	if (!config[mapProvider]) {
		throw createResponseCode(templates.mapsRequestFailed, `Map provider ${mapProvider} is not configured for this deployment`);
	}

	if (!mapServicesByProvider[mapProvider].isValidMapType(mapType)) {
		throw createResponseCode(templates.invalidArguments, `Unknown map type: ${mapType}`);
	}

	if (mapProvider === mapProviders.HERE) {
		if (await isAddOnEnabled(teamspace, ADD_ONS.HERE)) return;
		throw templates.addOnUnavailable;
	}
};

Maps.validateMapRequest = async (req, res, next) => {
	try {
		const { teamspace, mapProvider, mapType } = req.params;
		await validateMapAccess(teamspace, mapProvider, mapType);
		req.query = await mapsCoordinatesSchema.validate(req.query);
		await next();
	} catch (err) {
		respond(req, res, err?.code ? err : createResponseCode(templates.invalidArguments, err.message));
	}
};

module.exports = Maps;
