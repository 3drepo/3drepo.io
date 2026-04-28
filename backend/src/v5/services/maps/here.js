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

const { BASE_URL, FEATURES, HERE_TRAFFIC_DOMAIN, RESOURCES, STYLES } = require('./here.constants');
const { get, getArrayBuffer } = require('../../utils/webRequests');
const config = require('../../utils/config');

const HereService = {};

const generateTileURI = (domain, resource, zoomLevel, gridx, gridy, { features, style } = {}) => {
	const uriPath = [
		domain,
		'v3',
		resource,
		'mc',
		zoomLevel,
		gridx,
		gridy,
		'png8',
	].join('/');
	const uriQuery = [
		features ? `features=${features}` : null,
		style ? `style=${style}` : null,
		`apiKey=${config.here.apiKey}`,
	].filter(Boolean).join('&');

	return `https://${uriPath}?${uriQuery}`;
};

HereService.getBaseInfo = () => {
	const uri = `${BASE_URL}/v3/info?apiKey=${config.here.apiKey}`;
	return get(uri, { apiKey: config.here.apiKey });
};

HereService.getTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy),
);

HereService.getAerialTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.AERIAL }),
);

HereService.getTrafficTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.TRAFFIC }),
);

HereService.getTrafficFlowTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(HERE_TRAFFIC_DOMAIN, RESOURCES.FLOW, zoomLevel, gridx, gridy, {}),
);

HereService.getTerrainTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.TERRAIN }),
);

HereService.getHybridTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.HYBRID }),
);

HereService.getGreyTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.GREY }),
);

HereService.getTruckRestrictionsTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy,
		{ style: STYLES.TRUCK_RESTRICTIONS, features: FEATURES.VEHICLE_RESTRICTIONS },
	),
);

HereService.getTruckRestrictionsOverlayTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BLANK, zoomLevel, gridx, gridy, { features: FEATURES.VEHICLE_RESTRICTIONS }),
);

HereService.getLabelOverlayTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.LABEL, zoomLevel, gridx, gridy, {}),
);

HereService.getTollZoneTile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { features: FEATURES.CONGESTION_ZONES }),
);

HereService.getPOITile = (zoomLevel, gridx, gridy) => getArrayBuffer(
	generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { features: FEATURES.POI }),
);

module.exports = HereService;
