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

const { ADD_ONS } = require('../../../../../models/teamspaces.constants');
const HereService = require('../../../../../services/maps/here');
const OSMService = require('../../../../../services/maps/osm');
const config = require('../../../../../utils/config');
const { isAddOnEnabled } = require('../../../../../models/teamspaceSettings');

const Maps = {};

Maps.getListOfMaps = async (teamspace) => {
	const hereEnabled = await isAddOnEnabled(teamspace, ADD_ONS.HERE);
	const maps = [
		{ name: 'Open Street Map', layers: [{ name: 'Map Tiles', source: 'OSM' }] },

	];
	if (hereEnabled && config.here && config.here.apiKey) {
		maps.push(...[
			{ name: 'Here',
				layers: [
					{ name: 'Map Tiles', source: 'HERE' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
			{ name: 'Here (Terrain)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_TERRAIN' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
			{ name: 'Here (Satellite)',
				layers: [
					{ name: 'Aerial Imagery', source: 'HERE_AERIAL' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
			{ name: 'Here (Hybrid)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_HYBRID' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
			{ name: 'Here (Street)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_STREET' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
			{ name: 'Here (Toll Zone)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_TOLL_ZONE' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
			{ name: 'Here (POI)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_POI' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
		]);
	}

	return maps;
};

Maps.getHereBaseInfo = HereService.getBaseInfo;

Maps.getOSMTile = OSMService.getTile;

Maps.getHereDefaultTile = (zoomLevel, gridx, gridy) => HereService.getTile(zoomLevel, gridx, gridy);

Maps.getHereAerialTile = (zoomLevel, gridx, gridy) => HereService.getAerialTile(zoomLevel, gridx, gridy);

Maps.getHereTrafficTile = (zoomLevel, gridx, gridy) => HereService.getTrafficTile(zoomLevel, gridx, gridy);

Maps.getHereTrafficFlowTile = (zoomLevel, gridx, gridy) => HereService.getTrafficFlowTile(zoomLevel, gridx, gridy);

Maps.getHereTerrainTile = (zoomLevel, gridx, gridy) => HereService.getTerrainTile(zoomLevel, gridx, gridy);

Maps.getHereHybridTile = (zoomLevel, gridx, gridy) => HereService.getHybridTile(zoomLevel, gridx, gridy);

Maps.getHereGreyTile = (zoomLevel, gridx, gridy) => HereService.getGreyTile(zoomLevel, gridx, gridy);

Maps.getHereTruckRestrictionsTile = (
	zoomLevel, gridx, gridy) => HereService.getTruckRestrictionsTile(zoomLevel, gridx, gridy);

Maps.getHereTruckRestrictionsOverlayTile = (
	zoomLevel, gridx, gridy) => HereService.getTruckRestrictionsOverlayTile(zoomLevel, gridx, gridy);

Maps.getHereLabelOverlayTile = (zoomLevel, gridx, gridy) => HereService.getLabelOverlayTile(zoomLevel, gridx, gridy);

Maps.getHereTollZoneTile = (zoomLevel, gridx, gridy) => HereService.getTollZoneTile(zoomLevel, gridx, gridy);

Maps.getHerePOITile = (zoomLevel, gridx, gridy) => HereService.getPOITile(zoomLevel, gridx, gridy);

module.exports = Maps;
