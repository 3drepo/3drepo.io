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

const HereConstants = {};

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
	{ name: 'Here', mapType: mapTypes.DEFAULT },
	{ name: 'Here (Terrain)', mapType: mapTypes.TERRAIN },
	{ name: 'Here (Satellite)', mapType: mapTypes.AERIAL },
	{ name: 'Here (Hybrid)', mapType: mapTypes.HYBRID },
	{ name: 'Here (Street)', mapType: mapTypes.GREY },
	{ name: 'Here (Toll Zones)', mapType: mapTypes.TOLL_ZONE },
	{ name: 'Here (POI)', mapType: mapTypes.POI },
];
HereConstants.overlayTiles = [
	{ name: 'Traffic Flow', mapType: mapTypes.TRAFFIC_FLOW },
	{ name: 'Truck Restrictions', mapType: mapTypes.TRUCK_OVERLAY },
];

module.exports = HereConstants;
