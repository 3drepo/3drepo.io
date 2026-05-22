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

const { mapTypes, opaqueTiles, overlayTiles } = require('./here.constants');
const config = require('../../utils/config');
const { createConstantsObject, deleteIfUndefined } = require('../../utils/helper/objects');
const { getArrayBuffer } = require('../../utils/webRequests');
const { logger } = require('../../utils/logger');
const { templates } = require('../../utils/responseCodes');

const HereService = {};

const resources = createConstantsObject([
	'base',
	'flow',
	'blank',
]);

const HERE_TRAFFIC_DOMAIN = 'traffic.maps.hereapi.com';

const features = {
	POI: 'pois:all',
	CONGESTION_ZONES: 'congestion_zones:all',
	VEHICLE_RESTRICTIONS: 'vehicle_restrictions:active_and_inactive',
};

const styles = {
	AERIAL: 'satellite.day',
	TERRAIN: 'topo.day',
	HYBRID: 'explore.satellite.day',
	GREY: 'lite.day',
};

const BASE_URL = 'maps.hereapi.com';

const tileConfig = {
	[mapTypes.DEFAULT]: {
		url: BASE_URL,
		resource: resources.base,
	},
	[mapTypes.AERIAL]: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.AERIAL,
	},
	[mapTypes.TRAFFIC_FLOW]: {
		url: HERE_TRAFFIC_DOMAIN,
		resource: resources.flow,
	},
	[mapTypes.HYBRID]: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.HYBRID,
	},
	[mapTypes.GREY]: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.GREY,
	},
	[mapTypes.TOLL_ZONE]: {
		url: BASE_URL,
		resource: resources.base,
		features: features.CONGESTION_ZONES,
	},
	[mapTypes.POI]: {
		url: BASE_URL,
		resource: resources.base,
		features: features.POI,
	},
	[mapTypes.TERRAIN]: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.TERRAIN,
	},
	[mapTypes.TRUCK_OVERLAY]: {
		url: BASE_URL,
		resource: resources.blank,
		features: features.VEHICLE_RESTRICTIONS,
	},
};

const generateTileURI = (domain, resource, zoomLevel, x, y, mapConfig) => {
	const query = new URLSearchParams(deleteIfUndefined({
		apiKey: config.here.apiKey,
		features: mapConfig?.features,
		style: mapConfig?.style,
	}));

	return `https://${domain}/v3/${resource}/mc/${zoomLevel}/${x}/${y}/png8?${query.toString()}`;
};

HereService.getAvailableMaps = () => opaqueTiles.map(({ name, source, mapType }) => ({
	name,
	layers: [{ name: 'Map Tiles', source, mapType }, ...overlayTiles].map((layer) => ({ ...layer })),
}));

HereService.isValidMapType = (mapType) => !!tileConfig[mapType];

HereService.getTile = async (mapType, zoomLevel, x, y) => {
	try {
		const mapTileConfig = tileConfig[mapType];
		const { data } = await getArrayBuffer(
			generateTileURI(mapTileConfig.url, mapTileConfig.resource, zoomLevel, x, y, {
				style: mapTileConfig.style,
				features: mapTileConfig.features,
			}),
		);

		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE tile for map type ${mapType}: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

module.exports = HereService;
