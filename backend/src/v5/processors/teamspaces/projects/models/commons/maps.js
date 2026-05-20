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

const { ADD_ONS } = require('../../../../../models/teamspaces.constants');
const HereService = require('../../../../../services/maps/here');
const OSMService = require('../../../../../services/maps/osm');
const { isAddOnEnabled } = require('../../../../../models/teamspaceSettings');
const { mapProviders } = require('../../../../../services/maps/maps.constants');
const { templates } = require('../../../../../utils/responseCodes');

const Maps = {};

Maps.getListOfMaps = async (teamspace) => {
	const hereEnabled = await isAddOnEnabled(teamspace, ADD_ONS.HERE);
	const maps = hereEnabled
		? [...await OSMService.getAvailableMaps(), ...await HereService.getAvailableMaps()]
		: [...await OSMService.getAvailableMaps()];

	return maps;
};

Maps.getTile = (mapProvider, mapType, zoomLevel, x, y) => {
	switch (mapProvider) {
	case mapProviders.HERE:
		return HereService.getTile(mapType, zoomLevel, x, y);
	case mapProviders.OSM:
		return OSMService.getTile(mapType, zoomLevel, x, y);
	default:
		throw templates.invalidArguments;
	}
};

module.exports = Maps;
