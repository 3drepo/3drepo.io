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
const { templates } = require('../../utils/responseCodes');

const OSMService = {};

OSMService.getTile = async (zoomLevel, gridx, gridy) => {
	try {
		let domain = 'a.tile.openstreetmap.org';
		let uri = `/${zoomLevel}/${gridx}/${gridy}.png`;

		if (config.osm && config.osm.domain) {
			domain = config.osm.domain;
			uri = `/${config.osm.prefix}/${zoomLevel}/${gridx}/${gridy}.png?key=${config.osm.key}`;
		}

		const { data } = await WebRequests.getArrayBuffer(`https://${domain}${uri}`);

		return data;
	} catch (error) {
		logger.logError(`Failed to get OSM tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

module.exports = OSMService;
