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

const { toConstantCase } = require('../../utils/helper/strings');

const HereConstants = {};

const resources = [
	'base',
	'flow',
	'label',
	'blank',
];

HereConstants.BASE_URL = 'maps.hereapi.com';

HereConstants.HERE_TRAFFIC_DOMAIN = 'traffic.maps.hereapi.com';

HereConstants.FEATURES = {
	POI: 'pois:all',
	CONGESTION_ZONES: 'congestion_zones:all',
	VEHICLE_RESTRICTIONS: 'vehicle_restrictions:active_and_inactive',
};

HereConstants.STYLES = {
	TRUCK_RESTRICTIONS: 'explore.day',
	AERIAL: 'satellite.day',
	TRAFFIC: 'logistics.day',
	TERRAIN: 'topo.day',
	HYBRID: 'explore.satellite.day',
	GREY: 'lite.day',
};

HereConstants.RESOURCES = {};
resources.forEach((resource) => {
	HereConstants.RESOURCES[toConstantCase(resource)] = resource;
});

module.exports = HereConstants;
