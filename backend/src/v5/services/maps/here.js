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

const { hereMapVariants, tileConfig } = require('./here.constants');
const config = require('../../utils/config');
const { getArrayBuffer } = require('../../utils/webRequests');
const { logger } = require('../../utils/logger');
const { templates } = require('../../utils/responseCodes');

const HereService = {};

const generateTileURI = (domain, resource, zoomLevel, x, y, { features, style }) => {
	const query = new URLSearchParams({
		apiKey: config.here.apiKey,
	});

	if (features) query.append('features', features);
	if (style) query.append('style', style);

	return `https://${domain}/v3/${resource}/mc/${zoomLevel}/${x}/${y}/png8?${query.toString()}`;
};

HereService.getAvailableMaps = () => hereMapVariants.map(({ name, source }) => ({
	name,
	layers: [
		{ name: source === 'HERE_AERIAL' ? 'Aerial Imagery' : 'Map Tiles', source },
		{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
		{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
	],
}));

HereService.getTile = async (mapType, zoomLevel, x, y) => {
	try {
		const mapTileConfig = tileConfig[mapType];
		const { data } = await getArrayBuffer(
			generateTileURI(mapTileConfig.url, mapTileConfig.resource, zoomLevel, x, y, {
				style: mapTileConfig?.style,
				features: mapTileConfig?.features,
			}),
		);

		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE tile for map type ${mapType}: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

module.exports = HereService;
