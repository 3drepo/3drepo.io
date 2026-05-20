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

const { ADD_ONS } = require('../../models/teamspaces.constants');
const config = require('../../utils/config');
const { isAddOnEnabled } = require('../../models/teamspaceSettings');
const { logger } = require('../../utils/logger');
const { mapProviders } = require('../../services/maps/maps.constants');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');

const Maps = {};

Maps.hasMapProviderAccessToModel = async (req, res, next) => {
	const { teamspace, mapProvider } = req.params;

	if (!Object.values(mapProviders).includes(mapProvider)) {
		return respond(req, res, templates.invalidArguments);
	}
	if (mapProvider === mapProviders.HERE && config[mapProvider]) {
		if (await isAddOnEnabled(teamspace, ADD_ONS.HERE)) return next();
		return respond(req, res, templates.addOnUnavailable);
	}
	if (mapProvider === mapProviders.OSM && config[mapProvider]) {
		return next();
	}

	logger.logError('Missing configuration for map provider:', mapProvider);
	return respond(req, res, templates.mapsRequestFailed);
};

module.exports = Maps;
