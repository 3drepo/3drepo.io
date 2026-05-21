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

const mapTypes = {
	DEFAULT: 'default',
	AERIAL: 'aerial',
	TRAFFIC_FLOW: 'trafficflow',
	TERRAIN: 'terrain',
	HYBRID: 'hybrid',
	GREY: 'grey',
	TRUCK_OVERLAY: 'truckoverlay',
	TOLL_ZONE: 'tollzone',
	POI: 'poi',
};

HereConstants.mapTypes = mapTypes;

HereConstants.opaqueTiles = [
	{ name: 'Here', mapType: mapTypes.DEFAULT, source: 'HERE' },
	{ name: 'Here (Terrain)', mapType: mapTypes.TERRAIN, source: 'HERE_TERRAIN' },
	{ name: 'Here (Satellite)', mapType: mapTypes.AERIAL, source: 'HERE_AERIAL' },
	{ name: 'Here (Hybrid)', mapType: mapTypes.HYBRID, source: 'HERE_HYBRID' },
	{ name: 'Here (Grey)', mapType: mapTypes.GREY, source: 'HERE_GREY' },
	{ name: 'Here (Traffic Flow)', mapType: mapTypes.TRAFFIC_FLOW, source: 'HERE_TRAFFIC_FLOW' },
	{ name: 'Here (Truck Restrictions)', mapType: mapTypes.TRUCK_OVERLAY, source: 'HERE_TRUCK_OVERLAY' },
	{ name: 'Here (Toll Zones)', mapType: mapTypes.TOLL_ZONE, source: 'HERE_TOLL_ZONE' },
	{ name: 'Here (POI)', mapType: mapTypes.POI, source: 'HERE_POI' },
];
HereConstants.overlayTiles = [
	{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
	{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
];

HereConstants.tileConfig = {
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

module.exports = HereConstants;
