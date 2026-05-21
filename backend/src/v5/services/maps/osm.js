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

const WebRequests = require('../../utils/webRequests');

const config = require('../../utils/config');
const { logger } = require('../../utils/logger');
const { createResponseCode, templates } = require('../../utils/responseCodes');

const OSMService = {};

const mapTypes = {
	DEFAULT: 'default',
};

const getDefaultTile = async (zoomLevel, x, y) => {
	try {
		const { domain, prefix, key } = config.osm;
		const query = new URLSearchParams({
			key,
		});
		const uri = `https://${domain}${prefix}/${zoomLevel}/${x}/${y}.png?${query.toString()}`;

		const { data } = await WebRequests.getArrayBuffer(uri);

		return data;
	} catch (error) {
		logger.logError(`Failed to get OSM tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

OSMService.getAvailableMaps = () => [
	{
		name: 'Open Street Map',
		layers: [
			{ name: 'Map Tiles', source: 'OSM' },
		],
	},
];

OSMService.isValidMapType = (mapType) => mapTypes.DEFAULT === mapType;

OSMService.getTile = (mapType, zoomLevel, x, y) => {
	if (mapTypes.DEFAULT === mapType) return getDefaultTile(zoomLevel, x, y);
	throw createResponseCode(templates.invalidArguments, `Unknown map type: ${mapType}`);
};

module.exports = OSMService;
