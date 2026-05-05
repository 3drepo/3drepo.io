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
const { logger } = require('../../utils/logger');
const { templates } = require('../../utils/responseCodes');

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

HereService.getBaseInfo = async () => {
	try {
		const uri = `https://${BASE_URL}/v3/info?apiKey=${config.here.apiKey}`;
		const { data } = await get(uri);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE base info: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getAerialTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.AERIAL }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE aerial tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTrafficTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.TRAFFIC }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE traffic tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTrafficFlowTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(HERE_TRAFFIC_DOMAIN, RESOURCES.FLOW, zoomLevel, gridx, gridy, {}),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE traffic flow tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTerrainTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.TERRAIN }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE terrain tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getHybridTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.HYBRID }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE hybrid tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getGreyTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { style: STYLES.GREY }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE grey tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTruckRestrictionsTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy,
				{ style: STYLES.TRUCK_RESTRICTIONS, features: FEATURES.VEHICLE_RESTRICTIONS },
			),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE truck restrictions tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTruckRestrictionsOverlayTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(
				BASE_URL, RESOURCES.BLANK, zoomLevel, gridx, gridy, { features: FEATURES.VEHICLE_RESTRICTIONS },
			),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE truck restrictions overlay tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getLabelOverlayTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.LABEL, zoomLevel, gridx, gridy, {}),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE label overlay tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getTollZoneTile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { features: FEATURES.CONGESTION_ZONES }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE toll zone tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

HereService.getPOITile = async (zoomLevel, gridx, gridy) => {
	try {
		const { data } = await getArrayBuffer(
			generateTileURI(BASE_URL, RESOURCES.BASE, zoomLevel, gridx, gridy, { features: FEATURES.POI }),
		);
		return data;
	} catch (error) {
		logger.logError(`Failed to get HERE POI tile: ${error?.response?.data} `);
		throw templates.mapsRequestFailed;
	}
};

module.exports = HereService;
