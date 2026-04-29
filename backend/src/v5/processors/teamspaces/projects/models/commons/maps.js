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

Maps.getHereDefaultTile = HereService.getTile;

Maps.getHereAerialTile = HereService.getAerialTile;

Maps.getHereTrafficTile = HereService.getTrafficTile;

Maps.getHereTrafficFlowTile = HereService.getTrafficFlowTile;

Maps.getHereTerrainTile = HereService.getTerrainTile;

Maps.getHereHybridTile = HereService.getHybridTile;

Maps.getHereGreyTile = HereService.getGreyTile;

Maps.getHereTruckRestrictionsTile = HereService.getTruckRestrictionsTile;

Maps.getHereTruckRestrictionsOverlayTile = HereService.getTruckRestrictionsOverlayTile;

Maps.getHereLabelOverlayTile = HereService.getLabelOverlayTile;

Maps.getHereTollZoneTile = HereService.getTollZoneTile;

Maps.getHerePOITile = HereService.getPOITile;

module.exports = Maps;
