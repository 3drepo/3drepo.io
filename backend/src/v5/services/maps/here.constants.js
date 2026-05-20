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

const { createConstantsObject } = require('../../utils/helper/objects');

const HereConstants = {};

const resources = createConstantsObject([
	'base',
	'flow',
	'label',
	'blank',
]);

const HERE_TRAFFIC_DOMAIN = 'traffic.maps.hereapi.com';

const features = {
	POI: 'pois:all',
	CONGESTION_ZONES: 'congestion_zones:all',
	VEHICLE_RESTRICTIONS: 'vehicle_restrictions:active_and_inactive',
};

const styles = {
	TRUCK_RESTRICTIONS: 'explore.day',
	AERIAL: 'satellite.day',
	TRAFFIC: 'logistics.day',
	TERRAIN: 'topo.day',
	HYBRID: 'explore.satellite.day',
	GREY: 'lite.day',
};

const BASE_URL = 'maps.hereapi.com';

HereConstants.tileConfig = {
	default: {
		url: BASE_URL,
		resource: resources.base,
	},
	aerial: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.AERIAL,
	},
	traffic: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.TRAFFIC,
	},
	trafficflow: {
		url: HERE_TRAFFIC_DOMAIN,
		resource: resources.flow,
	},
	terrain: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.TERRAIN,
	},
	hybrid: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.HYBRID,
	},
	grey: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.GREY,
	},
	truck: {
		url: BASE_URL,
		resource: resources.base,
		style: styles.TRUCK_RESTRICTIONS,
		features: features.VEHICLE_RESTRICTIONS,
	},
	truckoverlay: {
		url: BASE_URL,
		resource: resources.blank,
		features: features.VEHICLE_RESTRICTIONS,
	},
	labeloverlay: {
		url: BASE_URL,
		resource: resources.label,
	},
	tollzone: {
		url: BASE_URL,
		resource: resources.base,
		features: features.CONGESTION_ZONES,
	},
	poi: {
		url: BASE_URL,
		resource: resources.base,
		features: features.POI,
	},
};

HereConstants.hereMapVariants = [
	{ name: 'Here', source: 'HERE' },
	{ name: 'Here (Terrain)', source: 'HERE_TERRAIN' },
	{ name: 'Here (Satellite)', source: 'HERE_AERIAL' },
	{ name: 'Here (Hybrid)', source: 'HERE_HYBRID' },
	{ name: 'Here (Street)', source: 'HERE_STREET' },
	{ name: 'Here (Toll Zone)', source: 'HERE_TOLL_ZONE' },
	{ name: 'Here (POI)', source: 'HERE_POI' },
];

module.exports = HereConstants;
